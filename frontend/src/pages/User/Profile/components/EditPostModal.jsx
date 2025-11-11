import { useEffect, useMemo, useRef, useState } from "react";
import { X, Calendar, Check, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updatePost } from "@/features/posts/postsSlice";
import { fetchMyProfile } from "@/features/profile/profileSlice";

const daysOfWeek = [
  { value: "Monday", label: "Monday", short: "Mon" },
  { value: "Tuesday", label: "Tuesday", short: "Tue" },
  { value: "Wednesday", label: "Wednesday", short: "Wed" },
  { value: "Thursday", label: "Thursday", short: "Thu" },
  { value: "Friday", label: "Friday", short: "Fri" },
  { value: "Saturday", label: "Saturday", short: "Sat" },
  { value: "Sunday", label: "Sunday", short: "Sun" },
];

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

function generateTimeSlots(start, end) {
  if (!start || !end) return [];
  const slots = [];
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const intervalMinutes = 30;
  while (currentMinutes + 120 <= endMinutes) {
    const slotStartMinutes = currentMinutes;
    const slotEndMinutes = currentMinutes + 120;
    const sH = String(Math.floor(slotStartMinutes / 60)).padStart(2, "0");
    const sM = String(slotStartMinutes % 60).padStart(2, "0");
    const eH = String(Math.floor(slotEndMinutes / 60)).padStart(2, "0");
    const eM = String(slotEndMinutes % 60).padStart(2, "0");
    const rawStart = `${sH}:${sM}`;
    const rawEnd = `${eH}:${eM}`;
    slots.push(`${formatTime(rawStart)} - ${formatTime(rawEnd)}`);
    currentMinutes += intervalMinutes;
  }
  return slots;
}

export default function EditPostModal({ open, post, onClose }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.posts);
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    availability: { days: [], startTime: "", endTime: "" },
  });
  const [timeError, setTimeError] = useState("");

  useEffect(() => {
    if (post) {
      setFormData({
        availability: {
          days: post?.availability?.days || [],
          startTime: post?.availability?.startTime || "",
          endTime: post?.availability?.endTime || "",
        },
      });
      setTimeError("");
    }
  }, [post]);

  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  useEffect(() => {
    const { startTime, endTime } = formData.availability || {};
    if (startTime && endTime) {
      const [sH, sM] = startTime.split(":").map(Number);
      const [eH, eM] = endTime.split(":").map(Number);
      const diff = eH * 60 + eM - (sH * 60 + sM);
      setTimeError(diff < 120 ? "End time must be at least 2 hours after start time" : "");
    } else {
      setTimeError("");
    }
  }, [formData.availability?.startTime, formData.availability?.endTime]);

  const availablePreview = useMemo(() => {
    const { startTime, endTime, days } = formData.availability || {};
    if (!startTime || !endTime || !days?.length || timeError) return [];
    return generateTimeSlots(startTime, endTime);
  }, [formData, timeError]);

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: prev.availability.days.includes(day)
          ? prev.availability.days.filter((d) => d !== day)
          : [...prev.availability.days, day],
      },
    }));
  };

  const updateAvailabilityTime = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value,
        ...(field === "startTime" && !value ? { endTime: "" } : {}),
      },
    }));
  };

  const handleSave = async () => {
    const { days, startTime, endTime } = formData.availability;
    if (days.length > 0) {
      if (!startTime || !endTime) {
        alert("Please set start and end time for selected days");
        return;
      }
      if (timeError) {
        alert(timeError);
        return;
      }
    }
    try {
      await dispatch(
        updatePost({
          postId: post._id,
          updates: { availability: { days, startTime, endTime } },
        })
      ).unwrap();
      // Refresh profile to reflect updated post list
      dispatch(fetchMyProfile());
      onClose?.();
    } catch (e) {
      alert(e || "Failed to update post");
    }
  };

  if (!open || !post) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Post Availability</h2>
              <p className="text-gray-600 text-sm">Update when you're available for this post.</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700"><span className="font-semibold">Title:</span> {post.title}</p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" /> Availability
              </label>

              <div className="border border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Days</label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        formData.availability.days.includes(day.value)
                          ? "bg-gray-600 text-white hover:bg-gray-700"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
                {formData.availability.days.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    Selected: {formData.availability.days.join(", ")}
                  </div>
                )}
              </div>

              {formData.availability.days.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={formData.availability.startTime}
                        onChange={(e) => updateAvailabilityTime("startTime", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                      />
                      {formData.availability.startTime && (
                        <p className="mt-1 text-xs text-gray-500">
                          {formatTime(formData.availability.startTime)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={formData.availability.endTime}
                        onChange={(e) => updateAvailabilityTime("endTime", e.target.value)}
                        disabled={!formData.availability.startTime}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                          !formData.availability.startTime
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 focus:ring-gray-600"
                        }`}
                      />
                      {formData.availability.endTime && (
                        <p className="mt-1 text-xs text-gray-500">
                          {formatTime(formData.availability.endTime)}
                        </p>
                      )}
                    </div>
                  </div>

                  {timeError && (
                    <div className="text-red-600 text-sm font-medium">{timeError}</div>
                  )}

                  {availablePreview.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Available time slots (2-hour sessions):
                      </p>
                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                        {availablePreview.map((time, i) => (
                          <span key={i} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                            {time}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Found {availablePreview.length} available slots</p>
                    </div>
                  )}

                  {formData.availability.startTime && formData.availability.endTime && !timeError && availablePreview.length === 0 && (
                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                      <p className="text-xs text-yellow-700">
                        No 2-hour slots available in this time range. Try extending your end time.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Skills preview (read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Skills Offered</p>
                <div className="flex flex-wrap gap-1">
                  {(post.skillsOffered || []).slice(0, 6).map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Skills Wanted</p>
                <div className="flex flex-wrap gap-1">
                  {(post.skillsWanted || []).slice(0, 6).map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || (formData.availability.days.length > 0 && timeError)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
