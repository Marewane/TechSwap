// src/hooks/useWebRTC.js - FIXED SCREEN SHARE VERSION
import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebRTC = (sessionId, socketFunctions) => {
  // --- State ---
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isInitiator, setIsInitiator] = useState(false);

  // --- Refs ---
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);
  const hasRemoteDescriptionRef = useRef(false);
  const isNegotiatingRef = useRef(false); // Prevent duplicate renegotiations

  // --- Configuration ---
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ]
  };

  // --- Helper: Find Video Sender ---
  const findVideoSender = useCallback((pc) => {
    if (!pc) return null;
    const senders = pc.getSenders();
    return senders.find(sender => sender.track && sender.track.kind === 'video');
  }, []);

  // --- Helper: Find Audio Sender ---
  const findAudioSender = useCallback((pc) => {
    if (!pc) return null;
    const senders = pc.getSenders();
    return senders.find(sender => sender.track && sender.track.kind === 'audio');
  }, []);

  // --- Renegotiation Helper (CRITICAL FOR SCREEN SHARE) ---
  // FIXED: Both initiator and responder can now trigger renegotiation
  const renegotiate = useCallback(async () => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) {
        console.log('❌ No peer connection for renegotiation');
        return;
      }

      // Prevent duplicate renegotiations
      if (isNegotiatingRef.current) {
        console.log('⏳ Already negotiating, skipping...');
        return;
      }

      // Check if we're already negotiating
      if (pc.signalingState !== 'stable') {
        console.log('⏳ Signaling state not stable, waiting...', pc.signalingState);
        return;
      }

      isNegotiatingRef.current = true;

      console.log(`🔄 Starting renegotiation (${isInitiator ? 'INITIATOR' : 'RESPONDER'})...`);
      
      // Both peers can create offers during renegotiation
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      if (socketFunctions?.sendOffer) {
        socketFunctions.sendOffer({
          offer: pc.localDescription,
          sessionId
        });
        console.log('✅ Renegotiation offer sent');
      }
    } catch (error) {
      console.error('❌ Renegotiation failed:', error);
    } finally {
      // Reset negotiation lock after a short delay
      setTimeout(() => {
        isNegotiatingRef.current = false;
      }, 1000);
    }
  }, [sessionId, socketFunctions, isInitiator]);

  // --- Initialize Peer Connection ---
  const initializePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      console.log('Peer connection already exists');
      return peerConnectionRef.current;
    }

    console.log('Creating new peer connection...');
    const pc = new RTCPeerConnection(configuration);

    // ICE Candidate Handler
    pc.onicecandidate = (event) => {
      if (event.candidate && socketFunctions?.sendIceCandidate) {
        console.log('Sending ICE candidate');
        socketFunctions.sendIceCandidate({
          candidate: event.candidate,
          sessionId
        });
      } else if (!event.candidate) {
        console.log('ICE gathering complete');
      }
    };

    // Remote Track Handler
    // CRITICAL FIX: Properly merge tracks when remote stream updates (e.g., when audio is added)
    pc.ontrack = (event) => {
      const incomingTrack = event.track;
      console.log('🎥 Remote track received:', incomingTrack.kind, incomingTrack.id);

      const existingStream = remoteStreamRef.current;
      const combinedStream = new MediaStream();
      const addTrackIfNeeded = (track) => {
        if (!track || track.readyState === 'ended') return;
        const alreadyPresent = combinedStream.getTracks().some(t => t.id === track.id);
        if (!alreadyPresent) {
          combinedStream.addTrack(track);
        }
      };

      if (existingStream) {
        existingStream.getTracks().forEach(track => {
          if (track.kind === incomingTrack.kind && track.id !== incomingTrack.id) {
            return; // Replace old track of same kind with the incoming one
          }
          addTrackIfNeeded(track);
        });
      }

      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach(addTrackIfNeeded);
      }

      addTrackIfNeeded(incomingTrack);

      if (combinedStream.getTracks().length === 0) {
        console.warn('No active tracks found for remote stream');
        return;
      }

      remoteStreamRef.current = combinedStream;
      setRemoteStream(combinedStream);

      console.log('✅ Updated remote stream:', combinedStream.id, 'tracks:', combinedStream.getTracks().map(t => `${t.kind}:${t.id}`));
    };

    // Connection State Handler
    pc.onconnectionstatechange = () => {
      console.log('Connection state changed:', pc.connectionState);
      setConnectionStatus(pc.connectionState);

      if (pc.connectionState === 'failed') {
        console.error('Connection failed, attempting ICE restart');
        pc.restartIce();
      }
    };

    // ICE Connection State Handler
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };

    // ICE Gathering State Handler
    pc.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', pc.iceGatheringState);
    };

    // Negotiation Needed Handler
    // NOTE: We manually trigger renegotiation when needed, so we don't need this handler
    // to prevent race conditions and duplicate offers
    pc.onnegotiationneeded = async () => {
      console.log(`⚠️ Negotiation needed event fired (${isInitiator ? 'INITIATOR' : 'RESPONDER'}) - ignoring, using manual renegotiation`);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [sessionId, socketFunctions, isInitiator, renegotiate]);

  // --- Get Camera Media ---
  const getCameraMedia = useCallback(async (video = false, audio = false) => {
    try {
      console.log('Requesting camera media...', { video, audio });
      
      if (localStreamRef.current) {
        console.log('Camera stream already exists');
        return localStreamRef.current;
      }

      const constraints = {
        video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
        audio: audio
      };

      if (!constraints.video && !constraints.audio) {
        console.log('Creating empty camera stream');
        const emptyStream = new MediaStream();
        localStreamRef.current = emptyStream;
        setLocalStream(emptyStream);
        setIsVideoEnabled(false);
        setIsAudioEnabled(false);
        return emptyStream;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got camera media:', stream.id);

      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsVideoEnabled(videoTracks.length > 0 && videoTracks[0].enabled);
      setIsAudioEnabled(audioTracks.length > 0 && audioTracks[0].enabled);

      // Add tracks to peer connection
      const pc = peerConnectionRef.current;
      if (pc && stream.getTracks().length > 0) {
        stream.getTracks().forEach(track => {
          // Check if sender already exists for this track kind
          const existingSender = track.kind === 'video' ? findVideoSender(pc) : findAudioSender(pc);
          if (!existingSender) {
            console.log('Adding local track to peer connection:', track.kind);
            pc.addTrack(track, stream);
          } else {
            console.log('Sender already exists for', track.kind, '- skipping addTrack');
          }
        });
      }

      return stream;
    } catch (error) {
      console.error('Error getting camera media:', error);
      const emptyStream = new MediaStream();
      localStreamRef.current = emptyStream;
      setLocalStream(emptyStream);
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
      return emptyStream;
    }
  }, []);

  // --- Toggle Audio ---
  const toggleAudio = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream) {
      console.warn('No local camera stream available for audio toggle');
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      // TURN OFF
      audioTracks.forEach(track => {
        track.stop();
        stream.removeTrack(track);
      });

      const pc = peerConnectionRef.current;
      if (pc) {
        const audioSender = findAudioSender(pc);
        if (audioSender) {
          // Prefer disabling via replaceTrack(null) to keep transceiver alive
          try {
            await audioSender.replaceTrack(null);
            console.log('🎤 Audio track replaced with null');
          } catch (e) {
            console.warn('Failed to replace audio track with null, removing sender instead');
            try { pc.removeTrack(audioSender); } catch {
              
            }
          }
        }
      }

      setIsAudioEnabled(false);
      const newStream = new MediaStream(stream.getTracks());
      setLocalStream(newStream);
      localStreamRef.current = newStream;
    } else {
      // TURN ON
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const [newAudioTrack] = audioStream.getAudioTracks();
        stream.addTrack(newAudioTrack);

        const pc = peerConnectionRef.current;
        if (pc) {
          const existingSender = findAudioSender(pc);
          if (existingSender) {
            try {
              await existingSender.replaceTrack(newAudioTrack);
              console.log('🎤 Audio track replaced with new track (preserving video/screen track)');
            } catch (e) {
              console.warn('Failed to replace existing audio track, adding new sender');
              pc.addTrack(newAudioTrack, stream);
            }
          } else {
            console.log('🎤 Adding new audio track to peer connection (preserving video/screen track)');
            pc.addTrack(newAudioTrack, stream);
          }
          
          // CRITICAL FIX: Only renegotiate audio - don't disrupt video/screen tracks
          // The renegotiation will update the SDP to include audio, but won't affect existing video tracks
          console.log('🎤 Audio track added/replaced, triggering renegotiation (video/screen safe)');
          
          // Small delay to ensure track is properly set before renegotiation
          await new Promise(resolve => setTimeout(resolve, 100));
          await renegotiate();
        }

        setIsAudioEnabled(true);
        const newStream = new MediaStream(stream.getTracks());
        setLocalStream(newStream);
        localStreamRef.current = newStream;
      } catch (error) {
        console.error('Error restarting audio:', error);
        alert('Could not access microphone. Please check permissions.');
      }
    }
  }, [renegotiate, findAudioSender]);

  // --- Toggle Video ---
  const toggleVideo = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream) {
      console.warn('No local camera stream available for video toggle');
      return;
    }

    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length > 0) {
      // TURN OFF
      videoTracks.forEach(track => {
        track.stop();
        stream.removeTrack(track);
      });

      const pc = peerConnectionRef.current;
      if (pc && !isSharingScreen) {
        const videoSender = findVideoSender(pc);
        if (videoSender) {
          await videoSender.replaceTrack(null);
          // Renegotiate after track change
          await renegotiate();
        }
      }

      setIsVideoEnabled(false);
      const newStream = new MediaStream(stream.getTracks());
      setLocalStream(newStream);
      localStreamRef.current = newStream;
    } else {
      // TURN ON
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        const [newVideoTrack] = videoStream.getVideoTracks();
        stream.addTrack(newVideoTrack);

        const pc = peerConnectionRef.current;
        if (pc && !isSharingScreen) {
          const videoSender = findVideoSender(pc);
          if (videoSender) {
            await videoSender.replaceTrack(newVideoTrack);
            // Renegotiate after track change
            await renegotiate();
          } else {
            pc.addTrack(newVideoTrack, stream);
          }
        }

        setIsVideoEnabled(true);
        const newStream = new MediaStream(stream.getTracks());
        setLocalStream(newStream);
        localStreamRef.current = newStream;
      } catch (error) {
        console.error('Error restarting video:', error);
        alert('Could not access camera. Please check permissions.');
      }
    }
  }, [isSharingScreen, findVideoSender, renegotiate]);

  // --- Start Screen Share (FIXED VERSION) ---
  const startScreenShare = useCallback(async () => {
    try {
      console.log('🖥️ Starting screen share...');
      if (screenStreamRef.current) {
        console.log('Screen stream already exists');
        return;
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: false
      });

      if (screenStream.getVideoTracks().length === 0) {
        console.log("User cancelled screen share selection.");
        return;
      }

      screenStreamRef.current = screenStream;
      setScreenStream(screenStream);

      const [screenTrack] = screenStream.getVideoTracks();
      console.log('📹 Screen track ID:', screenTrack.id);

      screenTrack.onended = () => {
        console.log('Screen share stopped by user via browser UI');
        stopScreenShare();
      };

      const pc = peerConnectionRef.current;
      if (pc) {
        // CRITICAL FIX: Only replace VIDEO sender, keep audio sender intact
        const videoSender = findVideoSender(pc);
        const audioSender = findAudioSender(pc);
        
        console.log('Current senders:', {
          hasVideoSender: !!videoSender,
          hasAudioSender: !!audioSender,
          videoTrack: videoSender?.track?.id,
          audioTrack: audioSender?.track?.id
        });

        if (videoSender) {
          console.log('🔄 Replacing camera video track with screen track (keeping audio)');
          await videoSender.replaceTrack(screenTrack);
        } else {
          console.log('➕ Adding screen track (no existing video sender)');
          pc.addTrack(screenTrack, screenStream);
        }
        
        // CRITICAL: Force renegotiation to notify remote peer
        console.log('🔄 Triggering renegotiation for screen share');
        await renegotiate();
      }

      setIsSharingScreen(true);
      console.log('✅ Screen sharing started successfully');
    } catch (error) {
      console.error('❌ Error starting screen share:', error);
      if (error.name === 'NotAllowedError') {
        alert('Screen sharing permission denied or cancelled.');
      } else if (error.name === 'NotFoundError') {
        alert('No suitable source found for screen sharing.');
      } else {
        alert('An error occurred while starting screen sharing.');
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      screenStreamRef.current = null;
      setScreenStream(null);
      setIsSharingScreen(false);
    }
  }, [findVideoSender, findAudioSender, renegotiate]);

  // --- Stop Screen Share (FIXED VERSION) ---
  const stopScreenShare = useCallback(async () => {
    try {
      console.log('🛑 Stopping screen share...');
      if (!screenStreamRef.current) {
        console.warn('No screen stream to stop');
        return;
      }

      screenStreamRef.current.getTracks().forEach(track => {
        if (track.readyState !== 'ended') {
          track.stop();
        }
      });
      screenStreamRef.current = null;
      setScreenStream(null);

      const pc = peerConnectionRef.current;
      const localCameraStream = localStreamRef.current;
      if (pc && localCameraStream) {
        const videoTracks = localCameraStream.getVideoTracks();
        const videoSender = findVideoSender(pc);
        const audioSender = findAudioSender(pc);
        
        console.log('Stopping screen share - current senders:', {
          hasVideoSender: !!videoSender,
          hasAudioSender: !!audioSender,
          cameraVideoTracks: videoTracks.length
        });

        if (videoTracks.length > 0) {
          const [cameraVideoTrack] = videoTracks;
          console.log('🔄 Replacing screen track with camera track (keeping audio)');
          if (videoSender) {
            await videoSender.replaceTrack(cameraVideoTrack);
          } else {
            pc.addTrack(cameraVideoTrack, localCameraStream);
          }
        } else {
          console.log('🔄 No camera video track, replacing with null');
          if (videoSender) {
            await videoSender.replaceTrack(null);
          }
        }
        
        // CRITICAL: Force renegotiation to notify remote peer
        console.log('🔄 Triggering renegotiation to switch back to camera');
        await renegotiate();
      }

      setIsSharingScreen(false);
      console.log('✅ Screen sharing stopped');
    } catch (error) {
      console.error('❌ Error stopping screen share:', error);
    }
  }, [findVideoSender, findAudioSender, renegotiate]);

  // --- Create Offer (Initiator) ---
  const createOffer = useCallback(async () => {
    try {
      const pc = peerConnectionRef.current || initializePeerConnection();
      
      console.log('Creating offer...');
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await pc.setLocalDescription(offer);
      console.log('Local description set (offer)');

      if (socketFunctions?.sendOffer) {
        socketFunctions.sendOffer({
          offer: pc.localDescription,
          sessionId
        });
        console.log('Offer sent via socket');
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, [sessionId, socketFunctions, initializePeerConnection]);

  // --- Create Answer (Responder) ---
  const createAnswer = useCallback(async () => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) {
        console.error('No peer connection for creating answer');
        return;
      }

      console.log('Creating answer...');
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('Local description set (answer)');

      if (socketFunctions?.sendAnswer) {
        socketFunctions.sendAnswer({
          answer: pc.localDescription,
          sessionId
        });
        console.log('Answer sent via socket');
      }
    } catch (error) {
      console.error('Error creating answer:', error);
    }
  }, [sessionId, socketFunctions]);

  // --- Handle Incoming Offer ---
  const handleOffer = useCallback(async (offer) => {
    try {
      console.log('Received offer, setting remote description');
      const pc = peerConnectionRef.current || initializePeerConnection();

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      hasRemoteDescriptionRef.current = true;
      console.log('Remote description set (offer)');

      // Process queued ICE candidates
      console.log(`Processing ${iceCandidateQueueRef.current.length} queued ICE candidates`);
      while (iceCandidateQueueRef.current.length > 0) {
        const candidate = iceCandidateQueueRef.current.shift();
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }

      // Create and send answer
      await createAnswer();
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }, [initializePeerConnection, createAnswer]);

  // --- Handle Incoming Answer ---
  const handleAnswer = useCallback(async (answer) => {
    try {
      console.log('Received answer, setting remote description');
      const pc = peerConnectionRef.current;
      if (!pc) {
        console.error('No peer connection for handling answer');
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      hasRemoteDescriptionRef.current = true;
      console.log('Remote description set (answer)');

      // Process queued ICE candidates
      console.log(`Processing ${iceCandidateQueueRef.current.length} queued ICE candidates`);
      while (iceCandidateQueueRef.current.length > 0) {
        const candidate = iceCandidateQueueRef.current.shift();
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, []);

  // --- Handle Incoming ICE Candidate ---
  const handleIceCandidate = useCallback(async (candidate) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) {
        console.warn('No peer connection yet, ignoring ICE candidate');
        return;
      }

      if (!hasRemoteDescriptionRef.current) {
        console.log('Queueing ICE candidate (no remote description yet)');
        iceCandidateQueueRef.current.push(candidate);
        return;
      }

      console.log('Adding ICE candidate');
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, []);

  // --- Set Initiator Status ---
  const setInitiatorStatus = useCallback((status) => {
    console.log('Setting initiator status:', status);
    setIsInitiator(status);
  }, []);

  // --- Initialize Camera Media ---
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        await getCameraMedia(false, false);
        if (cancelled) return;
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to get initial camera media:', err);
      }
    };

    const timer = setTimeout(init, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [getCameraMedia]);

  // --- Initialize Peer Connection ---
  useEffect(() => {
    initializePeerConnection();
  }, [initializePeerConnection]);

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      console.log('Cleaning up WebRTC...');
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          if (track.readyState !== 'ended') track.stop();
        });
        localStreamRef.current = null;
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => {
          if (track.readyState !== 'ended') track.stop();
        });
        screenStreamRef.current = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, []);

  return {
    localStream,
    screenStream,
    remoteStream,
    isSharingScreen,
    isAudioEnabled,
    isVideoEnabled,
    connectionStatus,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    createOffer,
    createAnswer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    setInitiatorStatus
  };
};