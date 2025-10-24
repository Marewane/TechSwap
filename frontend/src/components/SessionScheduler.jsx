// src/components/SessionScheduler.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SessionScheduler({ postOwnerName, skillsOffered, skillsWanted, onSchedule, onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('14:00');

  const handleConfirm = () => {
    // ✅ Build valid date
    const scheduledTime = new Date(selectedDate);
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    scheduledTime.setHours(startH, startM, 0, 0);
    
    // ✅ Validate future date
    if (scheduledTime < new Date()) {
      alert('Cannot schedule in the past!');
      return;
    }

    // ✅ Calculate duration (in minutes)
    const duration = (endH - startH) * 60 + (endM - startM);
    if (duration <= 0 || duration > 480) {
      alert('Session must be between 1 and 480 minutes.');
      return;
    }

    // ✅ Send ISO string + number
    onSchedule({
      scheduledTime: scheduledTime.toISOString(),
      duration: duration
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            📅 Schedule Your Swap Session
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Choose a date and time that works for both of you
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Post Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {postOwnerName?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{postOwnerName}</h4>
                <p className="text-sm text-gray-600">Post Owner</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700 mb-1">Skills Offered:</p>
                <div className="flex flex-wrap gap-1">
                  {skillsOffered?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                  {skillsOffered?.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      +{skillsOffered.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <p className="font-medium text-gray-700 mb-1">Skills Wanted:</p>
                <div className="flex flex-wrap gap-1">
                  {skillsWanted?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                  {skillsWanted?.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      +{skillsWanted.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              📅 Select Date
            </label>
            <div className="flex justify-center bg-white rounded-xl border-2 border-gray-200 shadow-lg p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              ⏰ Select Time
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Start Time</label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Start Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 16 }, (_, i) => {
                      const hour = i + 8;
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">End Time</label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="End Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 16 }, (_, i) => {
                      const hour = i + 9;
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Session Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">📋</span>
              Session Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="font-medium text-gray-700">Date:</span>
                <span className="text-gray-600">{selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="font-medium text-gray-700">Time:</span>
                <span className="text-gray-600">{startTime} - {endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="text-gray-600">{((parseInt(endTime.split(':')[0]) - parseInt(startTime.split(':')[0])) * 60)} minutes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🚀 Send Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}