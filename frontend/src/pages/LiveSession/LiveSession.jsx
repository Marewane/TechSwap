// src/pages/LiveSession/LiveSession.jsx - FIXED AUDIO VERSION
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useSocket } from '../../hooks/useSocket';
import { useWebRTC } from '../../hooks/useWebRTC';
import ControlsBar from '../../components/Session/ControlsBar';
import { 
  Phone, 
  Clock, 
  User, 
  AlertCircle,
  Loader2,
  Users,
  Video as VideoIcon,
  MicOff,
  Mic,
  VideoOff,
  Video,
  ScreenShare,
  Square,
} from 'lucide-react';

const LiveSession = () => {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  
  // --- Get user data and token from Redux store ---
  const { user, tokens } = useSelector((state) => state.user);
  const token = tokens?.accessToken;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isInitiator, setIsInitiator] = useState(false);
  const hasInitiatedOfferRef = useRef(false);

  // --- Initialize Socket.IO connection ---
  const {
    socket,
    isConnected,
    connectionError,
    connect,
    disconnect,
    joinSession,
    leaveSession,
    sendOffer: socketSendOffer,
    sendAnswer: socketSendAnswer,
    sendIceCandidate: socketSendIceCandidate,
  } = useSocket(token);

  // --- Initialize WebRTC Hook ---
  const {
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
  } = useWebRTC(sessionId, {
    sendOffer: socketSendOffer,
    sendAnswer: socketSendAnswer,
    sendIceCandidate: socketSendIceCandidate,
  });

  // --- Refs for video elements ---
  const mainVideoRef = useRef(null);
  
  const cameraPreviewRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // --- Simulate fetching session data ---
  useEffect(() => {
    const fetchSession = async () => {
      console.log(`Fetching session data for ID: ${sessionId}`);
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockSession = {
          _id: sessionId,
          title: "React Fundamentals - Live Coding Session",
          description: "Learning React hooks and components with live code examples",
          status: "scheduled",
          scheduledTime: new Date(Date.now() + 30 * 60000).toISOString(),
          sessionType: "skillTeaching",
          hostId: {
            _id: "68ed1a63453769b1a7cae5d9",
            name: "Youssef fakhi",
            email: "youssef.fakhi.dev@gmail.com"
          },
          learnerId: {
            _id: "68f101e53e8926ff52306ac6",
            name: "Marouane",
            email: "mrxbrowkn@gmail.com"
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setSession(mockSession);
        setParticipants([mockSession.hostId, mockSession.learnerId]);

        // Determine if current user is the host (initiator)
        const loggedInUserId = user?._id;
        const userIsHost = mockSession.hostId._id === loggedInUserId;
        setIsInitiator(userIsHost);
        console.log(`User is ${userIsHost ? 'HOST (initiator)' : 'LEARNER (responder)'}`);

      } catch (err) {
        console.error("Failed to fetch session:", err);
        setError(err.message || "Failed to load session details.");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    } else {
      setError("Invalid session ID.");
      setLoading(false);
    }
  }, [sessionId, user]);

  // --- Connect to Socket.IO when component mounts and token is available ---
  useEffect(() => {
    if (token) {
      console.log("Attempting to connect Socket.IO with token...");
      connect();
    } else {
      console.warn("No token available for Socket.IO connection.");
      setError("Authentication required. Please log in.");
    }

    return () => {
      console.log("LiveSession unmounting, disconnecting Socket.IO...");
      disconnect();
    };
  }, [token, connect, disconnect]);

  // --- Join the session room once connected ---
  useEffect(() => {
    if (isConnected && sessionId) {
      console.log(`Socket.IO connected. Joining session room: ${sessionId}`);
      joinSession(sessionId);
    }
  }, [isConnected, sessionId, joinSession]);

  // --- Register Socket.IO Event Listeners for WebRTC Signaling ---
  useEffect(() => {
    if (!socket) return;

    console.log('Registering WebRTC signaling listeners...');

    // Handle incoming offer
    const onOffer = (data) => {
      console.log('Received WebRTC offer from:', data.from);
      handleOffer(data.offer);
    };

    // Handle incoming answer
    const onAnswer = (data) => {
      console.log('Received WebRTC answer from:', data.from);
      handleAnswer(data.answer);
    };

    // Handle incoming ICE candidate
    const onIceCandidate = (data) => {
      console.log('Received ICE candidate from:', data.from);
      handleIceCandidate(data.candidate);
    };

    // Handle user joined
    const onUserJoined = (data) => {
      console.log('User joined session:', data.userId);
      
      // If we're the initiator and haven't sent offer yet, send it now
      if (isInitiator && !hasInitiatedOfferRef.current) {
        console.log('Initiator sending offer to new participant...');
        hasInitiatedOfferRef.current = true;
        // Small delay to ensure both peers are ready
        setTimeout(() => {
          createOffer();
        }, 1000);
      }
    };

    // Handle user left
    const onUserLeft = (data) => {
      console.log('User left session:', data.userId);
    };

    // Register listeners
    socket.on('webrtc-offer', onOffer);
    socket.on('webrtc-answer', onAnswer);
    socket.on('webrtc-ice-candidate', onIceCandidate);
    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);

    // Cleanup listeners on unmount
    return () => {
      console.log('Cleaning up WebRTC signaling listeners...');
      socket.off('webrtc-offer', onOffer);
      socket.off('webrtc-answer', onAnswer);
      socket.off('webrtc-ice-candidate', onIceCandidate);
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
    };
  }, [socket, isInitiator, createOffer, handleOffer, handleAnswer, handleIceCandidate]);

  // --- Initiate Offer if User Joins First as Initiator ---
  useEffect(() => {
    // If we're the initiator, connected, and in the session, wait a bit then send offer
    // This handles the case where the initiator joins first
    if (isInitiator && isConnected && sessionId && !hasInitiatedOfferRef.current) {
      console.log('Initiator connected first, waiting for responder...');
      // The offer will be sent when 'user-joined' event fires (see above)
    }
  }, [isInitiator, isConnected, sessionId]);

  // --- Handle user interaction to enable audio ---
  useEffect(() => {
    const handleInteraction = () => {
      if (!hasUserInteracted) {
        console.log('✅ User interaction detected - enabling audio playback');
        setHasUserInteracted(true);
        setAutoplayBlocked(false);
        
        // Try to play remote audio if it exists
        if (remoteAudioRef.current && remoteAudioRef.current.srcObject) {
          remoteAudioRef.current.play().catch(err => {
            console.warn('Still cannot play audio:', err);
          });
        }
      }
    };

    // Listen for any user interaction
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [hasUserInteracted]);

  // --- MAIN VIDEO DISPLAY LOGIC ---
  useEffect(() => {
    const videoElement = mainVideoRef.current;
    if (!videoElement) return;

    const remoteHasVideo = !!(remoteStream && remoteStream.getVideoTracks().some(t => t.readyState === 'live'));

    // Priority:
    // 1) Remote stream ONLY if it has a video track
    // 2) Otherwise keep showing your screen share if active
    // 3) Otherwise nothing
    if (remoteStream && remoteHasVideo) {
      console.log('Displaying remote stream (with video) in main video');
      videoElement.srcObject = remoteStream;
      // Always mute the main video element - audio handled by separate element
      videoElement.muted = true;
      videoElement.play().catch(err => {
        console.warn('Failed to play remote video:', err);
      });
      return;
    }

    if (isSharingScreen && screenStream) {
      console.log('Displaying your screen share (remote has no video)');
      videoElement.srcObject = screenStream;
      videoElement.muted = true; // local content
      videoElement.play().catch(err => {
        console.warn('Failed to play screen share:', err);
      });
      return;
    }

    videoElement.srcObject = null;
  }, [screenStream, remoteStream, isSharingScreen]);

  // --- CAMERA PREVIEW LOGIC ---
  useEffect(() => {
    const previewElement = cameraPreviewRef.current;
    if (previewElement) {
      if (localStream && isVideoEnabled) {
        previewElement.srcObject = localStream;
        // Explicitly play the preview video
        previewElement.play().catch(err => {
          console.warn('Failed to play camera preview:', err);
        });
      } else {
        previewElement.srcObject = null;
      }
    }
  }, [localStream, isVideoEnabled]);

  // --- REMOTE AUDIO PLAYBACK (separate hidden audio element) ---
  useEffect(() => {
    const audioEl = remoteAudioRef.current;
    if (!audioEl) return;

    if (remoteStream && remoteStream.getAudioTracks().length > 0) {
      console.log('🔊 Setting up remote audio playback');
      audioEl.srcObject = remoteStream;
      audioEl.muted = false;
      audioEl.volume = 1.0;
      
      const play = async () => {
        try {
          await audioEl.play();
          console.log('✅ Remote audio playing successfully');
          setAutoplayBlocked(false);
        } catch (e) {
          console.warn('⚠️ Autoplay blocked for remote audio; will play after user interaction.');
          setAutoplayBlocked(true);
          
          // If user has already interacted, try again
          if (hasUserInteracted) {
            setTimeout(() => {
              audioEl.play().catch(err => {
                console.error('Failed to play audio even after interaction:', err);
              });
            }, 100);
          }
        }
      };
      play();
    } else {
      audioEl.srcObject = null;
    }
  }, [remoteStream, hasUserInteracted]);

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to end this session?')) {
      console.log("Ending session...");
      leaveSession(sessionId);
      navigate('/events');
    }
  };

  // --- Determine user role ---
  const loggedInUserId = user?._id;
  const isHost = session?.hostId?._id === loggedInUserId;
  const otherUser = isHost ? session?.learnerId : session?.hostId;

  // --- Format scheduled time ---
  const scheduledDate = session?.scheduledTime ? new Date(session.scheduledTime) : new Date();
  const formattedScheduledTime = scheduledDate.toLocaleString();
  const timeUntil = scheduledDate - new Date();
  const isPastScheduledTime = timeUntil < 0;
  const minutesUntil = Math.abs(Math.floor(timeUntil / 1000 / 60));

  // --- Connection Status Display ---
  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="default" className="bg-green-600">Connected</Badge>;
      case 'connecting':
        return <Badge variant="secondary">Connecting...</Badge>;
      case 'disconnected':
        return <Badge variant="outline">Disconnected</Badge>;
      case 'failed':
        return <Badge variant="destructive">Connection Failed</Badge>;
      default:
        return <Badge variant="outline">{connectionStatus}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-white">Loading session...</p>
          {isConnected && <p className="text-green-400 text-sm mt-2">Connected to server</p>}
          {!isConnected && <p className="text-yellow-400 text-sm mt-2">Connecting to server...</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6 max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-white mt-4">Error</h2>
          <p className="text-gray-300 mt-2">{error}</p>
          <Button 
            onClick={() => navigate('/events')} 
            className="mt-6"
            variant="default"
          >
            Go Back to Events
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto" />
          <h2 className="text-2xl font-bold text-white mt-4">Session Not Found</h2>
          <p className="text-gray-300 mt-2">The session you are looking for does not exist.</p>
          <Button 
            onClick={() => navigate('/events')} 
            className="mt-6"
            variant="default"
          >
            Go Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Autoplay Warning Banner */}
      {autoplayBlocked && (
        <div className="bg-yellow-600 text-white px-4 py-2 text-center text-sm font-medium">
          🔊 Click anywhere to enable audio playback
        </div>
      )}

      {/* Top Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl md:text-2xl font-bold truncate max-w-md">{session.title}</h1>
            <Badge variant="outline" className="text-xs text-white">
              Scheduled: {formattedScheduledTime}
            </Badge>
            {isPastScheduledTime ? (
              <Badge variant="destructive" className="text-xs">
                Late by {minutesUntil} min
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs ">
                In {minutesUntil} min
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Status Badges */}
            <Badge
              variant={
                session.status === 'in-progress' ? 'default' :
                session.status === 'completed' ? 'secondary' :
                session.status === 'no-show' || session.status === 'cancelled' ? 'destructive' :
                'outline'
              }
              className="capitalize text-xs text-white"
            >
              {session.status.replace('-', ' ')}
            </Badge>

            <Badge
              variant={isConnected ? 'default' : 'destructive'}
              className="text-xs flex items-center"
            >
              <div className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>

            {/* WebRTC Connection Status */}
            {getConnectionStatusBadge()}

            {/* Participant Info */}
            <div className="flex items-center text-sm text-gray-300 ">
              <User className="w-4 h-4 mr-1" />
              <span>{otherUser?.name || 'Participant'}</span>
              <span className="mx-2">•</span>
              <span>You are: {isHost ? 'Host' : 'Learner'}</span>
            </div>

            {/* End Call Button */}
            <Button
              onClick={handleEndCall}
              variant="destructive"
              size="sm"
              className="flex items-center whitespace-nowrap"
            >
              <Phone className="w-4 h-4 mr-2" />
              End Call
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        
        {/* Video Area (Main Content) */}
        <div className="flex-1 bg-gray-800 rounded-lg p-4 flex flex-col bg-black-800">
          <Card className="flex-1 flex flex-col h-full bg-black-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Video Call
                {remoteStream && <span className="ml-2 text-sm text-green-400">(Remote Stream Active)</span>}
                {!remoteStream && connectionStatus === 'connecting' && (
                  <span className="ml-2 text-sm text-yellow-400">(Connecting...)</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-0 relative overflow-hidden">
              {/* Main Video Element - Remote Stream (NOT MUTED) */}
              <video
                ref={mainVideoRef}
                autoPlay
                playsInline
                muted={true} // Always muted - audio handled by separate element
                className="w-full h-full object-contain bg-black rounded"
              />
              {/* Placeholder for Main Video */}
              {!remoteStream && !isSharingScreen && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700/50">
                  <div className="text-center">
                    <div className="bg-gray-600 border-2 border-dashed rounded-xl w-20 h-20 mx-auto flex items-center justify-center mb-2">
                      <VideoIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      {connectionStatus === 'connecting' ? 'Connecting to participant...' : 
                       connectionStatus === 'connected' ? 'Connected! Waiting for video...' :
                       'Waiting for participant...'}
                    </p>
                    {isInitiator && !hasInitiatedOfferRef.current && (
                      <p className="text-blue-400 text-xs mt-2">You are the host. Waiting for learner to join...</p>
                    )}
                  </div>
                </div>
              )}
              {isSharingScreen && !remoteStream && !screenStream && (
                 <div className="absolute inset-0 flex items-center justify-center bg-gray-700/50">
                  <p className="text-gray-400 text-sm">Preparing screen share...</p>
                </div>
              )}

              {/* Camera Preview (Small, in corner) - ALWAYS MUTED */}
              <div className="absolute bottom-4 right-4 w-32 h-24 md:w-48 md:h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white border-opacity-30">
                <video
                  ref={cameraPreviewRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* "Camera Off" Placeholder */}
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700/80">
                    <div className="text-center">
                      <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-600 rounded-full mx-auto mb-1 md:mb-2 flex items-center justify-center">
                        <span className="text-lg md:text-xl">👤</span>
                      </div>
                      <p className="text-[8px] md:text-xs text-gray-400">Camera Off</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="md:w-80 w-full flex-shrink-0 bg-gray-800 rounded-lg p-4 flex flex-col">
          <Card className="flex-1 flex flex-col bg-black-950 h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-white">
                <Users className="w-5 h-5 mr-2" />
                Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="space-y-3 p-4">
                {participants.map((participant) => (
                  <div
                    key={participant._id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      participant._id === loggedInUserId
                        ? 'bg-blue-900/30 border border-blue-700'
                        : 'bg-gray-700/50'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                        {participant.name.charAt(0)}
                      </div>
                      {/* Online status indicator */}
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                        isConnected ? 'bg-green-500' : 'bg-gray-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {participant.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {participant.email}
                      </p>
                    </div>
                    {participant._id === loggedInUserId && (
                      <Badge variant="default" className="text-xs">
                        You {isInitiator && '(Host)'}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Controls Bar */}
      <div className="bg-gray-800 border-t border-gray-700 p-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <ControlsBar
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isSharingScreen={isSharingScreen}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onScreenShare={isSharingScreen ? stopScreenShare : startScreenShare}
            onEndCall={handleEndCall}
          />
          {/* Hidden audio element to ensure remote audio is heard even when showing local screen */}
          <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
};

export default LiveSession;