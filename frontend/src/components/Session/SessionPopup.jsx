// src/components/Session/SessionPopup.jsx
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '../ui/dialog';

const SessionPopup = ({ session, currentUser, isOpen, onClose }) => {
  if (!session) return null;

  const isHost = currentUser && session.hostId._id === currentUser._id;
  const otherUser = isHost ? session.learnerId : session.hostId;

  const scheduledDate = new Date(session.scheduledTime);
  const duration = session.duration || 120; // Default 2 hours
  const endTime = new Date(scheduledDate.getTime() + duration * 60000);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{session.title}</DialogTitle>
          <DialogDescription>
            Session details and information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              session.status === 'ready' ? 'bg-yellow-100 text-yellow-800' :
              session.status === 'in-progress' ? 'bg-green-100 text-green-800' :
              session.status === 'completed' ? 'bg-gray-100 text-gray-800' :
              session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {session.status}
            </span>
            <span className="text-sm text-gray-500 capitalize">{session.sessionType}</span>
          </div>

          {session.description && (
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Description</h4>
              <p className="text-gray-600">{session.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 text-sm">Start Time</h4>
              <p className="text-gray-600 text-sm">{scheduledDate.toLocaleString()}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 text-sm">Duration</h4>
              <p className="text-gray-600 text-sm">{duration} min</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 text-sm">End Time</h4>
            <p className="text-gray-600 text-sm">{endTime.toLocaleString()}</p>
          </div>

          <div className="border-t pt-3">
            <h4 className="font-medium text-gray-700 mb-2">Participants</h4>
            <div className="space-y-2">
              <div className={`flex justify-between items-center p-2 rounded ${
                isHost ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}>
                <span className="text-sm text-gray-700">Host</span>
                <span className="text-sm text-gray-600">{session.hostId.name}</span>
              </div>
              <div className={`flex justify-between items-center p-2 rounded ${
                !isHost ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}>
                <span className="text-sm text-gray-700">Learner</span>
                <span className="text-sm text-gray-600">{session.learnerId.name}</span>
              </div>
            </div>
          </div>

          {session.actualDuration && (
            <div>
              <h4 className="font-medium text-gray-700 text-sm">Actual Duration</h4>
              <p className="text-gray-600 text-sm">{session.actualDuration} min</p>
            </div>
          )}

          {session.startedAt && (
            <div>
              <h4 className="font-medium text-gray-700 text-sm">Started At</h4>
              <p className="text-gray-600 text-sm">{new Date(session.startedAt).toLocaleString()}</p>
            </div>
          )}

          {session.endedAt && (
            <div>
              <h4 className="font-medium text-gray-700 text-sm">Ended At</h4>
              <p className="text-gray-600 text-sm">{new Date(session.endedAt).toLocaleString()}</p>
            </div>
          )}

          <div className="pt-2 border-t text-xs text-gray-500">
            <p>Created: {new Date(session.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionPopup;