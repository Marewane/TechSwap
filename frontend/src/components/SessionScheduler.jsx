import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

const dayMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export default function SessionScheduler({
  postOwnerName,
  skillsOffered,
  skillsWanted,
  timeSlotsAvailable,
  availableDays = [],
  onSchedule,
  onClose,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const allowedDayIndexes = availableDays
    .map(day => dayMap[day])
    .filter(n => n !== undefined);

  const parseTimeSlot = (slot) => {
    const [start, end] = slot.split(" - ");
    return { start, end };
  };

  const handleConfirm = () => {
    if (!selectedTimeSlot) {
      alert("Please select a time slot.");
      return;
    }

    const { start: startTime, end: endTime } = parseTimeSlot(selectedTimeSlot);
    const scheduledTime = new Date(selectedDate);
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    scheduledTime.setHours(startH, startM, 0, 0);

    if (scheduledTime < new Date()) {
      alert("Cannot schedule in the past!");
      return;
    }

    const duration = (endH - startH) * 60 + (endM - startM);
    if (duration <= 0 || duration > 480) {
      alert("Session must be between 1 and 480 minutes.");
      return;
    }

    onSchedule({
      scheduledTime: scheduledTime.toISOString(),
      duration,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-gradient-to-br from-white via-blue-50 to-indigo-50 border border-blue-100 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            📅 Schedule Your Swap Session
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Choose a date and time that works for both of you
          </p>
        </DialogHeader>

        <div className="bg-gradient-to-r from-blue-100/70 to-indigo-100/70 rounded-xl p-4 border border-blue-200 shadow-sm mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {postOwnerName?.charAt(0) || "U"}
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
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                  >
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
                  <span
                    key={idx}
                    className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
                  >
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

        <div className="mt-8">
          <h3 className="text-center text-lg font-bold text-gray-800 mb-2">
             Select a Date
          </h3>
          <p className="text-center text-sm text-gray-600 mb-6">
            Only available days are enabled for this user
          </p>

          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPast = date < today;

                if (allowedDayIndexes.length === 0) {
                  return isPast;
                }

                const isAllowedDay = allowedDayIndexes.includes(date.getDay());
                return isPast || !isAllowedDay;
              }}
              className="max-w-md mx-auto"
              //  Add this to customize day classes
              classNames={{
                today: "bg-orange-500 text-white hover:bg-orange-600",
                selected: "bg-blue-600 text-white hover:bg-blue-700",
                disabled: "text-gray-400 opacity-50 cursor-not-allowed",
              }}
            />
          </div>

          <div className="text-center text-xs text-gray-500 mt-4 space-y-1">
            <p>
              <span className="font-semibold text-blue-600">Blue</span> = Selected date
            </p>
            <p>
              <span className="font-semibold text-orange-600">Orange</span> = Today
            </p>
            <p>
              <span className="font-semibold text-gray-400">Gray</span> = Disabled dates
            </p>
          </div>
        </div>

        <div className="mt-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
             Choose a Time Slot
          </label>
          {timeSlotsAvailable && timeSlotsAvailable.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2">
              {timeSlotsAvailable.map((slot, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTimeSlot === slot
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 italic">
              No time slots available for this post.
            </p>
          )}
        </div>

        {selectedDate && selectedTimeSlot && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
               Session Summary
            </h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-gray-700"> Date: </span>
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p>
                <span className="font-medium text-gray-700"> Time Slot: </span>
                {selectedTimeSlot}
              </p>
              <p>
                <span className="font-medium text-gray-700"> Duration: </span>
                {(() => {
                  const { start, end } = parseTimeSlot(selectedTimeSlot);
                  const [sH, sM] = start.split(":").map(Number);
                  const [eH, eM] = end.split(":").map(Number);
                  return (eH - sH) * 60 + (eM - sM);
                })()}{" "}
                minutes
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 hover:bg-gray-50 transition"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTimeSlot}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
             Send Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}