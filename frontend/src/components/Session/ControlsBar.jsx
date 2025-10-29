// src/components/Session/ControlsBar.jsx (updated version)    worked test version
import React from 'react';
import { Button } from '../ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  ScreenShare, 
  Square,
  Phone,
  Users
} from 'lucide-react';

const ControlsBar = ({ 
  isAudioEnabled, 
  isVideoEnabled, 
  isSharingScreen,
  onToggleAudio,
  onToggleVideo,
  onScreenShare,
  onEndCall
}) => {
  return (
    <div className="flex justify-center space-x-4">
      <Button 
        variant={isAudioEnabled ? "outline" : "destructive"} 
        size="lg" 
        onClick={onToggleAudio}
        className="flex items-center"
      >
        {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </Button>
      <Button 
        variant={isVideoEnabled ? "outline" : "destructive"} 
        size="lg" 
        onClick={onToggleVideo}
        className="flex items-center"
      >
        {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </Button>
      <Button 
        // variant={isSharingScreen ? "outline" : "default"} 
        size="lg" 
        onClick={onScreenShare}
        className="flex items-center "
      >
        {isSharingScreen ? <Square className="w-5 h-5 mr-2" /> : <ScreenShare className="w-5 h-5 mr-2" />}
        {isSharingScreen ? 'Stop Share' : 'Share Screen'}
      </Button>
      <Button 
        variant="destructive" 
        size="lg" 
        onClick={onEndCall}
        className="flex items-center"
      >
        <Phone className="w-5 h-5 mr-2" />
        End Call
      </Button>
    </div>
  );
};

export default ControlsBar;