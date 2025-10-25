// src/pages/LiveSession/LiveSession.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  ScreenShare, 
  Square,  // Use Square instead of ScreenShareStop
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
            _id: "host-id-123",
            name: "John Developer",
            email: "john@example.com"
          },
          learnerId: {
            _id: "learner-id-456", 
            name: "Jane Student",
            email: "jane@example.com"
          },
          startedAt: new Date().toISOString(),
          duration: 120
        };
        
        setSession(mockSession);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to end this session?')) {
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

  const isHost = session.hostId._id === "current-user-id"; // We'll get this from Redux
  const otherUser = session.hostId._id === "current-user-id" ? session.learnerId : session.hostId;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">{session.title}</h1>
            <Badge variant="secondary" className="bg-green-600 text-white">
              Live
            </Badge>
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
                <CardTitle className="text-sm">Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 bg-gray-600 rounded">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">{session.hostId.name}</span>
                    {isHost && <span className="text-xs bg-blue-500 px-2 py-1 rounded">You</span>}
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-gray-600 rounded">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">{session.learnerId.name}</span>
                    {!isHost && <span className="text-xs bg-blue-500 px-2 py-1 rounded">You</span>}
                  </div>
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