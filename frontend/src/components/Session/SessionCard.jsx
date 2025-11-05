// src/components/Session/SessionCard.jsx
import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import SessionPopup from './SessionPopup';
import { 
  Clock, 
  User, 
  Code, 
  Video, 
  Calendar,
  MapPin,
  Users,
  Info,
  AlertCircle, // Import AlertCircle icon for warnings
  X // Import X icon for Cancel button
} from 'lucide-react';

const SessionCard = ({ 
  session, 
  currentUser, 
  onJoinSession,
  onStartSession,
  onViewDetails,
  onCancelSession // New prop for cancel functionality
}) => {
  const [showPopup, setShowPopup] = useState(false);

  // Determine user's role and other participant
  const isHost = currentUser && session.hostId._id === currentUser._id;
  const isLearner = currentUser && session.learnerId._id === currentUser._id;
  const otherUser = isHost ? session.learnerId : session.hostId;
  const userRole = isHost ? 'Host' : 'Learner';

  // Format date and time
  const scheduledDate = new Date(session.scheduledTime);
  const formattedDateTime = scheduledDate.toLocaleString();
  const timeUntil = scheduledDate - new Date();
  const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
  const minutesUntil = Math.floor(timeUntil / (1000 * 60));
  const isSoon = timeUntil > 0 && timeUntil <= 1000 * 60 * 60 * 2; // Within 2 hours
  const isTooLate = hoursUntil < -1; // More than 1 hour past scheduled time
  // Check if scheduled time has been reached (backend requirement: now >= scheduledTime)
  const isTimeReached = timeUntil <= 0;
  // Allow starting within 5 minutes BEFORE scheduled time (matches backend buffer)
  // Backend allows: time has passed OR (0 < timeDifference <= 5 minutes)
  const canStartNow = isTimeReached || (minutesUntil > 0 && minutesUntil <= 5);

  // Get button props based on session status and user role
  const getButtonProps = () => {
    switch (session.status) {
      case 'scheduled':
        if (isHost) {
          // CRITICAL FIX: Match backend validation exactly
          // Backend allows: status === 'ready' OR (status === 'scheduled' AND (time has passed OR within 5 min before))
          // isTooLate: more than 1 hour past (disabled)
          // canStartNow: time has passed OR within 5 minutes before
          const isDisabled = isTooLate || (!canStartNow);
          const tooltipText = isTooLate 
            ? 'Session time has passed more than 1 hour ago.' 
            : !canStartNow && minutesUntil > 5
              ? `Session starts in ${minutesUntil} minutes. You can start 5 minutes before.`
              : null;
          return {
            text: 'Start Session',
            onClick: () => onStartSession(session),
            variant: 'default',
            disabled: isDisabled,
            tooltip: tooltipText
          };
        } else if (isLearner) {
          return {
            text: 'Join Session (Not Started)',
            onClick: () => onJoinSession(session),
            variant: 'outline',
            disabled: true, // Always disabled for scheduled sessions for learner
            tooltip: 'Session has not started yet. Please wait for the host to start the session.'
          };
        }
        break;
      case 'ready':
        if (isHost) {
          return {
            text: 'Start Session',
            onClick: () => onStartSession(session),
            variant: 'default',
            disabled: false,
            tooltip: null
          };
        } else if (isLearner) {
          return {
            text: 'Join Session',
            onClick: () => onJoinSession(session),
            variant: 'outline',
            disabled: false,
            tooltip: null
          };
        }
        break;
      case 'in-progress':
        // Both host and learner can join when in progress
        return {
          text: 'Join Live Session',
          onClick: () => onJoinSession(session),
          variant: 'default',
          disabled: false,
          tooltip: null
        };
      case 'completed':
        return {
          text: 'View Details',
          onClick: () => onViewDetails(session),
          variant: 'secondary',
          disabled: false,
          tooltip: null
        };
      case 'cancelled':
        return {
          text: 'Cancelled',
          onClick: null,
          variant: 'destructive',
          disabled: true,
          tooltip: 'This session has been cancelled.'
        };
      default:
        return {
          text: 'View Details',
          onClick: () => onViewDetails(session),
          variant: 'ghost',
          disabled: false,
          tooltip: null
        };
    }
  };

  const buttonProps = getButtonProps();

  // Function to render tooltip/warning message
  const renderTooltip = (tooltipText) => {
    if (!tooltipText) return null;
    return (
      <div className="flex items-center text-xs text-yellow-600 mt-1">
        <AlertCircle className="w-3 h-3 mr-1" />
        <span>{tooltipText}</span>
      </div>
    );
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${
      isSoon && session.status === 'scheduled' ? 'border-2 border-yellow-400' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
              <Badge variant={session.status === 'in-progress' ? 'default' : 'outline'}>
                {session.status}
              </Badge>
            </div>
            
            <p className="text-gray-600 text-sm mb-3">{session.description}</p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formattedDateTime}</span>
                {isSoon && session.status === 'scheduled' && (
                  <span className="text-yellow-600 font-medium">(Soon!)</span>
                )}
                {isTooLate && session.status === 'scheduled' && (
                  <span className="text-red-600 font-medium">(Time Passed)</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>With: {otherUser.name}</span>
                <span className="text-gray-400">•</span>
                <span>You are: {userRole}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span>Mode: {session.sessionType}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 ml-4">
            {/* Main Action Button */}
            <div className="flex flex-col items-end">
              <Button
                onClick={buttonProps.onClick}
                variant={buttonProps.variant}
                size="sm"
                disabled={buttonProps.disabled}
              >
                {buttonProps.text}
              </Button>
              {/* Tooltip/Warning Message */}
              {buttonProps.tooltip && renderTooltip(buttonProps.tooltip)}
              {session.status === 'scheduled' && isTooLate && renderTooltip('Session time has passed.')}
            </div>

            {/* Cancel Session Button - Only for scheduled sessions */}
            {session.status === 'scheduled' && (
              <Button
                onClick={() => onCancelSession(session)} // Call the new handler
                variant="destructive"
                size="sm"
                className="flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel Session
              </Button>
            )}

            {/* Details Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPopup(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Info className="w-4 h-4 mr-1" />
              Details
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Session Modal Popup */}
      <SessionPopup
        session={session}
        currentUser={currentUser}
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
      />
    </Card>
  );
};

export default SessionCard;