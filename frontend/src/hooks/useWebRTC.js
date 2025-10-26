// src/hooks/useWebRTC.js (fixed version)
import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebRTC = (sessionId, socket) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const isOfferCreatedRef = useRef(false);

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ]
    };

    const pc = new RTCPeerConnection(configuration);

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.sendIceCandidate({
          candidate: event.candidate,
          targetUserId: null,
          sessionId
        });
      }
    };

    // Handle remote track
    pc.ontrack = (event) => {
      console.log('Remote track received:', event.track.kind);
      setRemoteStream(event.streams[0]);
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      setConnectionStatus(pc.connectionState);
    };

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };

    peerConnectionRef.current = pc;
  }, [sessionId, socket]);

  // Get user media (camera and microphone)
  const getUserMedia = useCallback(async (video = true, audio = true) => {
    try {
      const constraints = {
        video: video ? { width: 1280, height: 720 } : false,
        audio: audio
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      // Update local state based on actual tracks
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      setIsVideoEnabled(videoTracks.length > 0 && videoTracks[0].enabled);
      setIsAudioEnabled(audioTracks.length > 0 && audioTracks[0].enabled);
      
      // Add tracks to peer connection
      if (peerConnectionRef.current) {
        stream.getTracks().forEach(track => {
          peerConnectionRef.current.addTrack(track, stream);
        });
      }

      return stream;
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error;
    }
  }, []);

  // Create offer
  const createOffer = useCallback(async () => {
    if (!peerConnectionRef.current) return;

    try {
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await peerConnectionRef.current.setLocalDescription(offer);
      
      if (socket) {
        socket.sendOffer({
          offer,
          targetUserId: null,
          sessionId
        });
      }

      isOfferCreatedRef.current = true;
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }, [sessionId, socket]);

  // Create answer
  const createAnswer = useCallback(async (offer) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      if (socket) {
        socket.sendAnswer({
          answer,
          targetUserId: null,
          sessionId
        });
      }

      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }, [sessionId, socket]);

  // Handle incoming ICE candidate
  const handleIceCandidate = useCallback((candidate) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.addIceCandidate(candidate);
    }
  }, []);

  // Toggle audio - FIXED VERSION
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const currentEnabled = audioTracks[0].enabled;
        audioTracks.forEach(track => {
          track.enabled = !currentEnabled; // Toggle to opposite of current state
        });
        setIsAudioEnabled(!currentEnabled); // Set to opposite of current state
      }
    }
  }, [localStream]);

  // Toggle video - FIXED VERSION
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const currentEnabled = videoTracks[0].enabled;
        videoTracks.forEach(track => {
          track.enabled = !currentEnabled; // Toggle to opposite of current state
        });
        setIsVideoEnabled(!currentEnabled); // Set to opposite of current state
      }
    }
  }, [localStream]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          width: 1920, 
          height: 1080,
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      if (localStream) {
        // Remove old video track
        const videoTracks = localStream.getVideoTracks();
        videoTracks.forEach(track => {
          localStream.removeTrack(track);
          track.stop();
        });

        // Add new screen track
        const [screenTrack] = screenStream.getVideoTracks();
        localStream.addTrack(screenTrack);

        // Update peer connection
        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }
      }

      setIsSharingScreen(true);
      return screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }, [localStream]);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    try {
      if (localStream) {
        const screenTracks = localStream.getVideoTracks();
        screenTracks.forEach(track => {
          if (track.getSettings().displaySurface) { // This is a screen share track
            localStream.removeTrack(track);
            track.stop();
          }
        });

        // Get back to camera
        const cameraStream = await getUserMedia(true, true);
        const [cameraTrack] = cameraStream.getVideoTracks();
        localStream.addTrack(cameraTrack);

        // Update peer connection
        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(cameraTrack);
          }
        }
      }

      setIsSharingScreen(false);
    } catch (error) {
      console.error('Error stopping screen share:', error);
      throw error;
    }
  }, [localStream, getUserMedia]);

  // Clean up
  const cleanup = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    isOfferCreatedRef.current = false;
  }, [localStream, remoteStream]);

  // Initialize on mount
  useEffect(() => {
    initializePeerConnection();

    return () => {
      cleanup();
    };
  }, [initializePeerConnection, cleanup]);

  return {
    localStream,
    remoteStream,
    isSharingScreen,
    isAudioEnabled,
    isVideoEnabled,
    connectionStatus,
    getUserMedia,
    createOffer,
    createAnswer,
    handleIceCandidate,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    cleanup
  };
};