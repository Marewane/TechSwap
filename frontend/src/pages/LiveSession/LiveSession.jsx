// src/pages/LiveSession/LiveSession.jsx (fixed debug version)
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useSocket } from '../../hooks/useSocket';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useSelector } from 'react-redux';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  ScreenShare, 
  Square,
  Phone,
  Users,
  Clock,
  User
} from 'lucide-react';

const LiveSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);

  // Get user and token from Redux
  const { user } = useSelector(state => state.user) || {};
  const token = useSelector(state => state.user?.tokens?.accessToken);

  // Initialize socket
  const {
    isConnected,
    connectionError,
    connect,
    disconnect,
    joinSession,
    leaveSession,
    onOffer,
    onAnswer,
    onIceCandidate,
    onUserJoined,
    onUserLeft,
    onSessionEnded,
    sendAnswer,
    sendOffer,
    sendIceCandidate
  } = useSocket(token);

  // Initialize WebRTC
  const {
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
    stopScreenShare
  } = useWebRTC(id, {
    sendOffer,
    sendAnswer,
    sendIceCandidate
  });

  // Refs for video elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Mock session data for now (we'll fetch real data later)
  useEffect(() => {
    // Simulate API call
    const fetchSession = async () => {
      try {
        setLoading(true);
        // In real implementation: const response = await api.get(`/sessions/${id}`);
        
        // Mock data
        const mockSession = {
          _id: id,
          title: "React Fundamentals - Live Coding Session",
          description: "Learning React hooks and components with live code examples",
          status: "in-progress",
          scheduledTime: "2025-10-24T15:00:00.000Z",
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
          startedAt: new Date().toISOString(),
          duration: 120
        };
        
        setSession(mockSession);
        
        // Set initial participants
        setParticipants([
          mockSession.hostId,
          mockSession.learnerId
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  // Connect to socket and join session room
  useEffect(() => {
    if (token && id) {
      connect();
    }

    return () => {
      if (id) {
        leaveSession(id);
      }
      disconnect();
    };
  }, [token, id, connect, disconnect, leaveSession]);

  // Join session room when connected
  useEffect(() => {
    if (isConnected && id) {
      joinSession(id);
    }
  }, [isConnected, id, joinSession]);

  // Set up socket event listeners
  useEffect(() => {
    // Handle WebRTC offer
    const handleOffer = async (data) => {
      console.log('Received offer:', data);
      // Create answer in response to offer
      try {
        await createAnswer(data.offer);
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    };

    // Handle WebRTC answer
    const handleAnswer = (data) => {
      console.log('Received answer:', data);
      // Set remote description for answer
      if (peerConnectionRef.current) {
        peerConnectionRef.current.setRemoteDescription(data.answer)
          .catch(err => console.error('Error setting remote description:', err));
      }
    };

    // Handle ICE candidate
    const handleIceCandidate = (data) => {
      console.log('Received ICE candidate:', data);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(data.candidate)
          .catch(err => console.error('Error adding ICE candidate:', err));
      }
    };

    // Handle user joined
    const handleUserJoined = (data) => {
      console.log('User joined:', data);
      // Start WebRTC connection - only host creates offer
      if (user && session && session.hostId._id === user._id) {
        // Host creates offer
        createOffer().catch(err => console.error('Error creating offer:', err));
      }
    };

    // Handle user left
    const handleUserLeft = (data) => {
      console.log('User left:', data);
      // Handle user leaving
    };

    // Handle session ended
    const handleSessionEnded = (data) => {
      console.log('Session ended:', data);
      navigate('/events');
    };

    // Add listeners
    onOffer(handleOffer);
    onAnswer(handleAnswer);
    onIceCandidate(handleIceCandidate);
    onUserJoined(handleUserJoined);
    onUserLeft(handleUserLeft);
    onSessionEnded(handleSessionEnded);

    // Cleanup listeners
    return () => {
      // In a real implementation, you'd need to remove listeners properly
    };
  }, [onOffer, onAnswer, onIceCandidate, onUserJoined, onUserLeft, onSessionEnded, navigate, user, session, createOffer, createAnswer]);

  // Get user media on component mount
  useEffect(() => {
    if (isConnected) {
      getUserMedia(true, true).catch(err => {
        console.error('Could not get user media:', err);
        // Continue without media if permission denied
      });
    }
  }, [isConnected, getUserMedia]);

  // Set up video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      console.log('=== VIDEO SRC UPDATED ===');
      console.log('New local stream assigned to video element');
      console.log('Video tracks in stream:', localStream.getVideoTracks().length);
      console.log('Audio tracks in stream:', localStream.getAudioTracks().length);
      if (localStream.getVideoTracks().length > 0) {
        console.log('Video track enabled:', localStream.getVideoTracks()[0].enabled);
      }
      if (localStream.getAudioTracks().length > 0) {
        console.log('Audio track enabled:', localStream.getAudioTracks()[0].enabled);
      }
      console.log('========================');
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Enhanced debug logging
  useEffect(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      const audioTracks = localStream.getAudioTracks();
      
      console.log('=== STREAM STATE CHANGE ===');
      console.log('Video tracks count:', videoTracks.length);
      console.log('Audio tracks count:', audioTracks.length);
      if (videoTracks.length > 0) {
        console.log('Video track enabled:', videoTracks[0].enabled);
      }
      if (audioTracks.length > 0) {
        console.log('Audio track enabled:', audioTracks[0].enabled);
      }
      console.log('isVideoEnabled state:', isVideoEnabled);
      console.log('isAudioEnabled state:', isAudioEnabled);
      console.log('========================');
    }
  }, [localStream, isVideoEnabled, isAudioEnabled]);

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to end this session?')) {
      // In real implementation: call end session API
      navigate('/events');
    }
  };

  const handleToggleAudio = () => {
    console.log('=== TOGGLING AUDIO ===');
    console.log('Before toggle - Audio enabled:', isAudioEnabled);
    console.log('Before toggle - Video enabled:', isVideoEnabled);
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      const videoTracks = localStream.getVideoTracks();
      if (audioTracks.length > 0) {
        console.log('Before toggle - Audio track enabled:', audioTracks[0].enabled);
      }
      if (videoTracks.length > 0) {
        console.log('Before toggle - Video track enabled:', videoTracks[0].enabled);
      }
    }
    console.log('========================');
    
    toggleAudio();
  };

  const handleToggleVideo = () => {
    console.log('=== TOGGLING VIDEO ===');
    console.log('Before toggle - Video enabled:', isVideoEnabled);
    console.log('Before toggle - Audio enabled:', isAudioEnabled);
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      const audioTracks = localStream.getAudioTracks();
      if (videoTracks.length > 0) {
        console.log('Before toggle - Video track enabled:', videoTracks[0].enabled);
      }
      if (audioTracks.length > 0) {
        console.log('Before toggle - Audio track enabled:', audioTracks[0].enabled);
      }
    }
    console.log('========================');
    
    toggleVideo();
  };

  const handleScreenShare = async () => {
    if (isSharingScreen) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Joining session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">Error: {error}</p>
          <Button 
            onClick={() => navigate('/events')}
            className="mt-4"
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
          <p className="text-white">Session not found</p>
          <Button 
            onClick={() => navigate('/events')}
            className="mt-4"
          >
            Go Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const isHost = user && session.hostId._id === user._id;
  const otherUser = user && session.hostId._id === user._id ? session.learnerId : session.hostId;

  // Check if video track is enabled (separate from localStream existence)
  const isVideoTrackEnabled = localStream && localStream.getVideoTracks().length > 0 && localStream.getVideoTracks()[0].enabled;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">{session.title}</h1>
            <Badge variant="secondary" className={`${
              isConnected ? 'bg-green-600' : 'bg-red-600'
            } text-white`}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {connectionStatus}
            </Badge>
            {connectionError && (
              <span className="text-red-400 text-sm">Error: {connectionError}</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300">
              <Clock className="w-4 h-4 inline mr-1" />
              {new Date(session.startedAt).toLocaleTimeString()}
            </div>
            <Button 
              onClick={handleEndCall}
              variant="destructive"
              className="flex items-center"
            >
              <Phone className="w-4 h-4 mr-2" />
              End Call
            </Button>
          </div>
        </div>
      </header>

      {/* Debug Info  for debuging
      <div className="bg-yellow-900 text-yellow-100 p-2 text-sm">
        <div>Debug Info:</div>
        <div>Local Stream: {localStream ? 'Available' : 'Not Available'}</div>
        <div>Video Tracks: {localStream ? localStream.getVideoTracks().length : 0}</div>
        <div>Audio Tracks: {localStream ? localStream.getAudioTracks().length : 0}</div>
        {localStream && localStream.getVideoTracks().length > 0 && (
          <div>Video Track Enabled: {localStream.getVideoTracks()[0].enabled.toString()}</div>
        )}
        {localStream && localStream.getAudioTracks().length > 0 && (
          <div>Audio Track Enabled: {localStream.getAudioTracks()[0].enabled.toString()}</div>
        )}
        <div>isVideoEnabled: {isVideoEnabled?.toString() || 'N/A'}</div>
        <div>isAudioEnabled: {isAudioEnabled?.toString() || 'N/A'}</div>
        <div>isVideoTrackEnabled (display logic): {isVideoTrackEnabled?.toString() || 'N/A'}</div>
      </div> */}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[calc(100vh-80px)]">
        <div className="flex-1 flex">
          {/* Video Grid */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* Local Video */}
              <Card className="bg-gray-800 border-gray-700 h-full">
                <CardContent className="p-4 h-full flex flex-col items-center justify-center">
                  <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center relative">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {!isVideoTrackEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400" />
                          </div>
                          <p className="text-gray-400">Camera Off</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                      You
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Remote Video */}
              <Card className="bg-gray-800 border-gray-700 h-full">
                <CardContent className="p-4 h-full flex flex-col items-center justify-center">
                  <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center relative">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {!remoteStream && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400" />
                          </div>
                          <p className="text-gray-400">{otherUser?.name || 'Participant'} Not Connected</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                      {otherUser?.name || 'Participant'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader>
                <CardTitle className="text-sm">Participants ({participants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div 
                      key={participant._id} 
                      className={`flex items-center space-x-2 p-2 bg-gray-600 rounded ${
                        user && participant._id === user._id ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm">{participant.name}</span>
                      {user && participant._id === user._id && (
                        <span className="text-xs bg-blue-500 px-2 py-1 rounded">You</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex justify-center space-x-4">
            <Button 
              variant={isAudioEnabled ? "outline" : "destructive"} 
              size="lg" 
              onClick={handleToggleAudio}
              className="flex items-center"
            >
              {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            <Button 
              variant={isVideoEnabled ? "outline" : "destructive"} 
              size="lg" 
              onClick={handleToggleVideo}
              className="flex items-center"
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            <Button 
              variant={isSharingScreen ? "default" : "outline"} 
              size="lg" 
              onClick={handleScreenShare}
              className="flex items-center"
            >
              {isSharingScreen ? <Square className="w-5 h-5 mr-2" /> : <ScreenShare className="w-5 h-5 mr-2" />}
              {isSharingScreen ? 'Stop Share' : 'Share Screen'}
            </Button>
            <Button 
              variant="destructive" 
              size="lg" 
              onClick={handleEndCall}
              className="flex items-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              End Call
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveSession;