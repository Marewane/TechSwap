// src/hooks/useWebRTC.js (Corrected to fix Temporal Dead Zone)
import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebRTC = (sessionId, socket) => {
  // --- State ---
  const [localStream, setLocalStream] = useState(null); // This will be the CAMERA stream
  const [screenStream, setScreenStream] = useState(null); // New state for screen stream
  const [remoteStream, setRemoteStream] = useState(null);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false); // This refers to the camera
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // --- Refs ---
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null); // Ref for camera stream
  const screenStreamRef = useRef(null); // Ref for screen stream
  const initRef = useRef({ initialized: false, cleanupCalled: false });

  // --- Helper: Find Video Sender ---
  // Define this early as it's a simple helper and used by callbacks
  const findVideoSender = useCallback((pc) => {
    if (!pc) return null;
    const senders = pc.getSenders();
    return senders.find(sender => sender.track && sender.track.kind === 'video');
  }, []);

  // --- Stubs for cyclic dependency functions ---
  // We define these stubs to hold the actual functions later
  // This avoids the Temporal Dead Zone issue with const functions
  const stopScreenShareRef = useRef();
  const startScreenShareRef = useRef();

  // Assign the actual functions to the refs inside a useEffect or similar,
  // or define them as var (less preferred) or rearrange.
  // Rearranging is cleanest.

  // --- Initialize Peer Connection ---
  const initializePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    };

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.sendIceCandidate({
          candidate: event.candidate,
          targetUserId: null,
          sessionId
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Remote track received:', event.track.kind);
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      setConnectionStatus(pc.connectionState);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [sessionId, socket]);


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
        // If neither is requested, create an empty stream
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

      // Store camera stream ref FIRST
      localStreamRef.current = stream;

      // Update state
      setLocalStream(stream);
      setIsVideoEnabled(videoTracks.length > 0 && videoTracks[0].enabled);
      setIsAudioEnabled(audioTracks.length > 0 && audioTracks[0].enabled);

      // Add tracks to peer connection if not screen sharing
      const pc = peerConnectionRef.current || initializePeerConnection();
      if (pc && !isSharingScreen && stream.getTracks().length > 0) {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      }

      return stream;
    } catch (error) {
      console.error('Error getting camera media:', error);
      // Still initialize with empty stream if camera access fails
      const emptyStream = new MediaStream();
      localStreamRef.current = emptyStream;
      setLocalStream(emptyStream);
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
      return emptyStream;
    }
  }, [initializePeerConnection, isSharingScreen]); // Add isSharingScreen as dependency

  // --- Toggle Audio ---
  const toggleAudio = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream) {
      console.warn('No local camera stream available for audio toggle');
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      // TURN OFF: Stop and remove the track
      audioTracks.forEach(track => {
        track.stop();
        stream.removeTrack(track);
      });

      // Remove from peer connection
      const pc = peerConnectionRef.current;
      if (pc) {
        const senders = pc.getSenders();
        const audioSender = senders.find(s => s.track && s.track.kind === 'audio');
        if (audioSender) {
          pc.removeTrack(audioSender);
        }
      }

      setIsAudioEnabled(false);
      // Update state and ref with new stream object
      const newStream = new MediaStream(stream.getTracks());
      setLocalStream(newStream);
      localStreamRef.current = newStream;
    } else {
      // TURN ON: Request new audio track and add to existing camera stream
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const [newAudioTrack] = audioStream.getAudioTracks();
        stream.addTrack(newAudioTrack);

        // Add to peer connection
        const pc = peerConnectionRef.current;
        if (pc && !isSharingScreen) { // Only add if not screen sharing
          pc.addTrack(newAudioTrack, stream);
        }

        setIsAudioEnabled(true);
        // Update state and ref with new stream object
        const newStream = new MediaStream(stream.getTracks());
        setLocalStream(newStream);
        localStreamRef.current = newStream;
      } catch (error) {
        console.error('Error restarting audio:', error);
        alert('Could not access microphone. Please check permissions.');
      }
    }
  }, [isSharingScreen]); // Add isSharingScreen as dependency

  // --- Toggle Camera Video ---
  const toggleVideo = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream) {
      console.warn('No local camera stream available for video toggle');
      return;
    }

    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length > 0) {
      // TURN OFF: Stop and remove the track
      videoTracks.forEach(track => {
        track.stop();
        stream.removeTrack(track);
      });

      // Remove from peer connection (only if not screen sharing)
      const pc = peerConnectionRef.current;
      if (pc && !isSharingScreen) {
        const videoSender = findVideoSender(pc);
        if (videoSender) {
          pc.removeTrack(videoSender);
        }
      }

      setIsVideoEnabled(false);
      // Update state and ref with new stream object
      const newStream = new MediaStream(stream.getTracks());
      setLocalStream(newStream);
      localStreamRef.current = newStream;
    } else {
      // TURN ON: Request new video track and add to existing camera stream
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
        const [newVideoTrack] = videoStream.getVideoTracks();
        stream.addTrack(newVideoTrack);

        // Add to peer connection (only if not screen sharing)
        const pc = peerConnectionRef.current;
        if (pc && !isSharingScreen) {
          pc.addTrack(newVideoTrack, stream);
        }

        setIsVideoEnabled(true);
        // Update state and ref with new stream object
        const newStream = new MediaStream(stream.getTracks());
        setLocalStream(newStream);
        localStreamRef.current = newStream;
      } catch (error) {
        console.error('Error restarting video:', error);
        alert('Could not access camera. Please check permissions.');
      }
    }
  }, [isSharingScreen, findVideoSender]); // Add dependencies

  // --- STOP SCREEN SHARE (Defined BEFORE startScreenShare that references it) ---
  const stopScreenShare = useCallback(async () => {
    try {
      console.log('Stopping screen share...');
      if (!screenStreamRef.current) {
        console.warn('No screen stream to stop');
        return;
      }

      // Stop screen stream tracks
      screenStreamRef.current.getTracks().forEach(track => {
        // Explicitly stop the track
        if (track.readyState !== 'ended') {
          track.stop();
        }
      });
      screenStreamRef.current = null;
      setScreenStream(null);

      // Update peer connection to send camera stream again (if camera is enabled)
      const pc = peerConnectionRef.current;
      const localCameraStream = localStreamRef.current; // The camera stream
      if (pc && localCameraStream) {
        const videoTracks = localCameraStream.getVideoTracks();
        const videoSender = findVideoSender(pc);
        if (videoTracks.length > 0) {
          const [cameraVideoTrack] = videoTracks;
          if (videoSender) {
            // Replace the screen track with the camera track
            await videoSender.replaceTrack(cameraVideoTrack);
          } else {
            // If no video sender existed, add the camera track
            pc.addTrack(cameraVideoTrack, localCameraStream);
          }
        } else {
          // If camera is off, remove video track from sender
          if (videoSender) {
            pc.removeTrack(videoSender);
          }
        }
      }

      setIsSharingScreen(false);
      console.log('Screen sharing stopped');
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  }, [findVideoSender]); // Add findVideoSender as dependency

  // --- START SCREEN SHARE (References stopScreenShare correctly now) ---
  const startScreenShare = useCallback(async () => {
    try {
      console.log('Starting screen share...');
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
        // Consider if you want to capture system audio
        audio: false // Often not included in screen share for simplicity
      });

      // Check if user actually selected a source or cancelled
      if (screenStream.getVideoTracks().length === 0) {
        console.log("User cancelled screen share selection.");
        screenStreamRef.current = null;
        setScreenStream(null);
        return;
      }

      screenStreamRef.current = screenStream;
      setScreenStream(screenStream);

      const [screenTrack] = screenStream.getVideoTracks();

      // Handle when user stops sharing via browser UI (e.g., clicks "Stop sharing")
      screenTrack.onended = () => {
        console.log('Screen share stopped by user via browser UI');
        // Call the actual stop function
        stopScreenShare();
      };

      // Update peer connection to send screen stream
      const pc = peerConnectionRef.current;
      if (pc) {
        const videoSender = findVideoSender(pc);
        if (videoSender) {
          // Replace the current video track (likely camera) with the screen track
          await videoSender.replaceTrack(screenTrack);
        } else {
          // If no existing video sender, add the screen track
          pc.addTrack(screenTrack, screenStream);
        }
      }

      setIsSharingScreen(true);
      console.log('Screen sharing started');
    } catch (error) {
      console.error('Error starting screen share:', error);
      // Handle specific errors
      if (error.name === 'NotAllowedError') {
        // User denied permission or dismissed the picker
        alert('Screen sharing permission denied or cancelled.');
      } else if (error.name === 'NotFoundError') {
        // No suitable source found (e.g., no screens, windows, tabs)
        alert('No suitable source found for screen sharing.');
      } else {
        // Other errors
        alert('An error occurred while starting screen sharing.');
      }
      // Ensure state is consistent even on error
      if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      screenStreamRef.current = null;
      setScreenStream(null);
      setIsSharingScreen(false);
    }
  }, [stopScreenShare, findVideoSender]); // Add stopScreenShare and findVideoSender as dependencies


  // --- Initialize Camera Media ---
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (initRef.current.initialized) return;

      initRef.current.initialized = true;

      try {
        // Initialize camera with both camera and microphone OFF by default
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
  }, [getCameraMedia]); // Add getCameraMedia as dependency

  // --- Initialize Peer Connection ---
  useEffect(() => {
    initializePeerConnection();
  }, [initializePeerConnection]); // Add initializePeerConnection as dependency

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
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => {
             if (track.readyState !== 'ended') track.stop();
        });
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
       // Reset state setters might not work reliably in cleanup, but good practice
      // setLocalStream(null); // Might cause issues if component unmounted
      // setScreenStream(null);
      // setRemoteStream(null);
      // setIsSharingScreen(false);
      // setConnectionStatus('disconnected');
    };
  }, [remoteStream]); // Add remoteStream as dependency

  return {
    localStream, // This is now the camera stream
    screenStream, // The screen share stream
    remoteStream,
    isSharingScreen,
    isAudioEnabled,
    isVideoEnabled, // This refers to the camera
    connectionStatus,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare
  };
};