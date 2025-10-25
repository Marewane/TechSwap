// src/pages/LiveSession/LiveSession.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useSocket } from '../../hooks/useSocket';
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
    onUserJoined,
    onUserLeft,
    onSessionStarted,
    onSessionEnded
  } = useSocket(token);

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
    // Handle user joined
    const handleUserJoined = (data) => {
      console.log('User joined:', data);
      // Update participants list if needed
    };

    // Handle user left
    const handleUserLeft = (data) => {
      console.log('User left:', data);
      // Update participants list if needed
    };

    // Handle session started
    const handleSessionStarted = (data) => {
      console.log('Session started:', data);
    };

    // Handle session ended
    const handleSessionEnded = (data) => {
      console.log('Session ended:', data);
      navigate('/events');
    };

    // Add listeners
    onUserJoined(handleUserJoined);
    onUserLeft(handleUserLeft);
    onSessionStarted(handleSessionStarted);
    onSessionEnded(handleSessionEnded);

    // Cleanup listeners
    return () => {
      // In a real implementation, you'd need to remove listeners properly
    };
  }, [onUserJoined, onUserLeft, onSessionStarted, onSessionEnded, navigate]);

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to end this session?')) {
      // In real implementation: call end session API
      navigate('/events');
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
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-gray-400">You</p>
                      <p className="text-xs text-gray-500 mt-1">Local Video</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Remote Video */}
              <Card className="bg-gray-800 border-gray-700 h-full">
                <CardContent className="p-4 h-full flex flex-col items-center justify-center">
                  <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center relative">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-gray-400">{otherUser.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Remote Video</p>
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
            <Button variant="outline" size="lg" className="flex items-center">
              <Mic className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="flex items-center">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="flex items-center">
              <ScreenShare className="w-5 h-5" />
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