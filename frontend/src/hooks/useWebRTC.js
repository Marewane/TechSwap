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
  const [remoteVideoAvailable, setRemoteVideoAvailable] = useState(false);

  // --- Refs ---
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);
  const hasRemoteDescriptionRef = useRef(false);
  const isNegotiatingRef = useRef(false); // Prevent duplicate renegotiations
  const pendingRenegotiationRef = useRef(false);
  const remoteVideoMuteTimerRef = useRef(null);

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

  const waitForStableSignaling = useCallback((pc, timeout = 3000) => {
    if (!pc) {
      return Promise.reject(new Error('No peer connection'));
    }

    if (pc.signalingState === 'stable') {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      let settled = false;

      const cleanup = () => {
        if (settled) return;
        settled = true;
        pc.removeEventListener('signalingstatechange', onStateChange);
        clearTimeout(timer);
      };

      const onStateChange = () => {
        if (pc.signalingState === 'stable') {
          cleanup();
          resolve();
        } else if (pc.signalingState === 'closed') {
          cleanup();
          reject(new Error('Peer connection closed while waiting for stable state'));
        }
      };

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('Timed out waiting for stable signaling state'));
      }, timeout);

      pc.addEventListener('signalingstatechange', onStateChange);
    });
  }, []);

  // --- Renegotiation Helper (CRITICAL FOR SCREEN SHARE) ---
  // FIXED: Both initiator and responder can now trigger renegotiation without collisions
  const renegotiate = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc) {
      console.log('❌ No peer connection for renegotiation');
      return;
    }

    if (!hasRemoteDescriptionRef.current) {
      console.log('⏭️ Skipping renegotiation (no remote description yet); will retry later.');
      pendingRenegotiationRef.current = true;
      return;
    }

    if (isNegotiatingRef.current) {
      console.log('⏳ Already negotiating, queueing another attempt');
      pendingRenegotiationRef.current = true;
      return;
    }

    isNegotiatingRef.current = true;

    try {
      if (pc.signalingState !== 'stable') {
        console.log('⏳ Signaling state not stable, waiting before renegotiation...', pc.signalingState);
        await waitForStableSignaling(pc);
      }

      console.log(`🔄 Starting renegotiation (${isInitiator ? 'INITIATOR' : 'RESPONDER'})...`);

      let offer;
      try {
        offer = await pc.createOffer();
      } catch (offerError) {
        if (offerError.name === 'InvalidStateError' || /signaling state/i.test(offerError.message || '')) {
          console.warn('⚠️ createOffer failed due to signaling state, retrying after stability...');
          await waitForStableSignaling(pc);
          offer = await pc.createOffer();
        } else {
          throw offerError;
        }
      }

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
      throw error;
    } finally {
      setTimeout(() => {
        isNegotiatingRef.current = false;
        if (pendingRenegotiationRef.current) {
          pendingRenegotiationRef.current = false;
          renegotiate();
        }
      }, 100);
    }
  }, [sessionId, socketFunctions, isInitiator, waitForStableSignaling]);

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

      if (incomingTrack.kind === 'video') {
        setRemoteVideoAvailable(true);

        const handleTrackUnavailable = () => {
          console.log('🎬 Remote video track muted/ended');
          if (remoteVideoMuteTimerRef.current) {
            clearTimeout(remoteVideoMuteTimerRef.current);
          }
          remoteVideoMuteTimerRef.current = setTimeout(() => {
            const hasLiveVideo = Boolean(
              remoteStreamRef.current?.getVideoTracks()?.some(track => track.readyState === 'live' && !track.muted)
            );
            if (!hasLiveVideo) {
              setRemoteVideoAvailable(false);
            }
            remoteVideoMuteTimerRef.current = null;
          }, 1500);
        };

        const handleTrackAvailable = () => {
          console.log('🎬 Remote video track active');
          if (remoteVideoMuteTimerRef.current) {
            clearTimeout(remoteVideoMuteTimerRef.current);
            remoteVideoMuteTimerRef.current = null;
          }
          setRemoteVideoAvailable(true);
        };

        incomingTrack.addEventListener('mute', handleTrackUnavailable);
        incomingTrack.addEventListener('ended', handleTrackUnavailable);
        incomingTrack.addEventListener('unmute', handleTrackAvailable);
      }

      console.log('✅ Updated remote stream:', combinedStream.id, 'tracks:', combinedStream.getTracks().map(t => `${t.kind}:${t.id}`));
    };

    // Connection State Handler
    pc.onconnectionstatechange = () => {
      console.log('Connection state changed:', pc.connectionState);
      setConnectionStatus(pc.connectionState);

      if (pc.connectionState === 'failed') {
        // This often happens when the other participant closes their
        // browser or leaves the live session. Treat it as a normal
        // end-of-call condition instead of spamming ICE restarts.
        console.warn('WebRTC connection failed (this is expected if the other participant left the session).');
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
    let stream = localStreamRef.current;
    if (!stream) {
      console.warn('No local stream found; creating placeholder for audio toggle');
      stream = new MediaStream();
      localStreamRef.current = stream;
    }

    const audioTracks = stream.getAudioTracks();
    const pc = peerConnectionRef.current;
    const existingSender = pc ? findAudioSender(pc) : null;

    if (audioTracks.length > 0) {
      const [audioTrack] = audioTracks;

      if (audioTrack.enabled) {
        console.log('🎤 Muting local audio track');
        audioTrack.enabled = false;
        setIsAudioEnabled(false);
      } else {
        console.log('🎤 Unmuting local audio track');
        audioTrack.enabled = true;
        setIsAudioEnabled(true);

        if (pc && !existingSender) {
          console.log('🎤 Audio sender missing, re-adding track to peer connection');
          pc.addTrack(audioTrack, stream);
          // Ensure SDP reflects the restored audio sender
          await new Promise(resolve => setTimeout(resolve, 50));
          try {
            await renegotiate();
          } catch (renegotiateError) {
            console.error('Renegotiation after unmuting audio failed:', renegotiateError);
          }
        }
      }

      setLocalStream(new MediaStream(stream.getTracks()));
      return;
    }

    try {
      console.log('🎤 Requesting microphone access...');
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const [newAudioTrack] = audioStream.getAudioTracks();

      if (!newAudioTrack) {
        throw new Error('No audio track returned from getUserMedia');
      }

      stream.addTrack(newAudioTrack);

      if (pc) {
        if (existingSender) {
          await existingSender.replaceTrack(newAudioTrack);
          console.log('🎤 Replaced existing audio sender with new microphone track');
        } else {
          pc.addTrack(newAudioTrack, stream);
          console.log('🎤 Added new audio sender to peer connection');
        }

        await new Promise(resolve => setTimeout(resolve, 100));
        try {
          await renegotiate();
        } catch (renegotiateError) {
          console.error('Renegotiation after enabling microphone failed:', renegotiateError);
        }
      }

      setIsAudioEnabled(true);
      setLocalStream(new MediaStream(stream.getTracks()));
    } catch (error) {
      console.error('Error restarting audio:', error);
      const message = error?.name === 'NotAllowedError'
        ? 'Microphone access was blocked. Please allow mic permissions in your browser settings and try again.'
        : 'Could not access microphone. Please check permissions.';
      alert(message);
    }
  }, [renegotiate, findAudioSender]);

  // --- Toggle Video ---
  const toggleVideo = useCallback(async () => {
    let stream = localStreamRef.current;
    if (!stream) {
      console.warn('No local camera stream found; creating placeholder stream for video toggle');
      stream = new MediaStream();
      localStreamRef.current = stream;
      setLocalStream(stream);
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
        if (!newVideoTrack) {
          console.warn('No video track returned from getUserMedia');
          return;
        }

        stream.addTrack(newVideoTrack);

        const pc = peerConnectionRef.current;
        if (pc && !isSharingScreen) {
          const videoSender = findVideoSender(pc);
          if (videoSender) {
            await videoSender.replaceTrack(newVideoTrack);
          } else {
            pc.addTrack(newVideoTrack, stream);
          }
          console.log('🎥 Video track added/replaced, triggering renegotiation');
          await renegotiate();
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
      } else if (error.name === 'NotReadableError') {
        alert('Your browser could not start screen capture. Close other screen-sharing or recording tools and try again.');
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

      if (pendingRenegotiationRef.current) {
        console.log('🔁 Executing pending renegotiation after receiving offer');
        pendingRenegotiationRef.current = false;
        await renegotiate();
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

      if (pendingRenegotiationRef.current) {
        console.log('🔁 Executing pending renegotiation after receiving answer');
        pendingRenegotiationRef.current = false;
        await renegotiate();
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

  // --- Handle page refresh/reconnection ---
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Cleanup will be handled by the cleanup useEffect
      console.log('🔄 Page unloading, WebRTC cleanup will occur');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // --- Monitor connection state and attempt recovery ---
  useEffect(() => {
    if (!peerConnectionRef.current) return;

    const checkConnection = setInterval(() => {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      // If connection fails, log it (recovery will be handled by manual renegotiation)
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.warn('⚠️ WebRTC connection state:', pc.connectionState);
      }
    }, 5000);

    return () => clearInterval(checkConnection);
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
      if (remoteVideoMuteTimerRef.current) {
        clearTimeout(remoteVideoMuteTimerRef.current);
        remoteVideoMuteTimerRef.current = null;
      }
      setRemoteVideoAvailable(false);
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
    setInitiatorStatus,
    hasRemoteVideo: remoteVideoAvailable,
  };
};
//hello