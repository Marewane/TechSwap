// src/components/Session/SimpleVideoCall.jsx (Updated to use separate camera and screen streams)   work work good 
import React, { useRef, useEffect } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC';
import ControlsBar from './ControlsBar';

const SimpleVideoCall = ({ sessionId }) => {
  const mainVideoRef = useRef(null); // For remote video or shared screen content
  const cameraPreviewRef = useRef(null); // For local camera preview

  // Mock socket for testing - replace with real socket later
  const mockSocket = {
    sendIceCandidate: () => console.log('Sending ICE candidate'),
    sendOffer: () => console.log('Sending offer'),
    sendAnswer: () => console.log('Sending answer')
  };

  const {
    localStream, // Now represents the camera stream
    screenStream, // New stream for screen sharing
    remoteStream,
    isAudioEnabled,
    isVideoEnabled, // This indicates if the *local camera* is enabled
    isSharingScreen, // This indicates if screen sharing is active
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare
  } = useWebRTC(sessionId, mockSocket);

  // --- Main Video Display Logic ---
  useEffect(() => {
    if (mainVideoRef.current) {
      if (isSharingScreen && screenStream) {
        // If screen sharing, the main display shows the screen stream
        mainVideoRef.current.srcObject = screenStream;
      } else if (remoteStream) {
        // Otherwise, show the remote participant's video
        mainVideoRef.current.srcObject = remoteStream;
      } else {
        // If neither, clear the display or show a placeholder
        mainVideoRef.current.srcObject = null;
      }
    }
  }, [screenStream, remoteStream, isSharingScreen]);

  // --- Camera Preview Logic ---
  useEffect(() => {
    if (cameraPreviewRef.current) {
      // The camera preview should show the local camera stream if it exists and video is enabled
      // It will now show even during screen sharing!
      if (localStream && isVideoEnabled) {
        cameraPreviewRef.current.srcObject = localStream;
      } else {
        // Camera is off or not available
        cameraPreviewRef.current.srcObject = null; // Or show a "Camera Off" placeholder
      }
    }
  }, [localStream, isVideoEnabled]); // Removed isSharingScreen dependency


  // Determine if the main video area should show a placeholder
  const showMainPlaceholder = !isSharingScreen && !remoteStream;

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Main Content Area (Large) */}
        <div className="flex-grow relative bg-gray-800 rounded-lg overflow-hidden mb-4">
          {/* Main Display: Remote Video, Shared Screen, or Placeholder */}
          <video
            ref={mainVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
          {showMainPlaceholder && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <p className="text-gray-400">
                {isVideoEnabled ? "Waiting for participant or screen share..." : "Camera is off. Waiting for participant or screen share..."}
              </p>
            </div>
          )}
          {isSharingScreen && !screenStream && ( // Show loading hint if screen sharing but stream not ready
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <p className="text-gray-400">Screen sharing started...</p>
            </div>
          )}

          {/* Camera Preview (Small, in corner - example: bottom right) */}
          {/* This preview now shows the camera feed even during screen sharing */}
          <div className="absolute bottom-1 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white border-opacity-30 ">
            <video
              ref={cameraPreviewRef}
              autoPlay
              muted // Always muted for preview
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Show "Camera Off" placeholder only if video is disabled */}
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center ">
                    <span className="text-xl">👤</span>
                  </div>
                  <p className="text-xs text-gray-400">Camera Off</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls Bar */}
        <ControlsBar
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isSharingScreen={isSharingScreen}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onScreenShare={isSharingScreen ? stopScreenShare : startScreenShare}
          onEndCall={() => window.location.href = '/events'}
        />
      </div>
    </div>
  );
};

export default SimpleVideoCall;