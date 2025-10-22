import { useState, useRef, useEffect } from "react";
import { Plus, X, Loader2, Calendar } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "@/features/posts/postsSlice";

const CreatePostModal = () => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.posts);
    
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        skillsOffered: [],
        skillsWanted: [],
        availability: {
            days: [],
            startTime: "",
            endTime: ""
        }
    });

    const [skillInput, setSkillInput] = useState({ offered: "", wanted: "" });
    const [timeError, setTimeError] = useState("");
    const modalRef = useRef(null);

    const daysOfWeek = [
        { value: "Monday", label: "Monday", short: "Mon" },
        { value: "Tuesday", label: "Tuesday", short: "Tue" },
        { value: "Wednesday", label: "Wednesday", short: "Wed" },
        { value: "Thursday", label: "Thursday", short: "Thu" },
        { value: "Friday", label: "Friday", short: "Fri" },
        { value: "Saturday", label: "Saturday", short: "Sat" },
        { value: "Sunday", label: "Sunday", short: "Sun" }
    ];

    const weekdaysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const weekendsList = ["Saturday", "Sunday"];

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "unset";
        };
    }, [open]);

    // Generate time slots function
const generateTimeSlots = (start, end, days) => {
    if (!start || !end || !days || days.length === 0) return [];
    
    const slots = [];
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const intervalMinutes = 30;

    while (currentMinutes + 120 <= endMinutes) {
        const slotStartMinutes = currentMinutes;
        const slotEndMinutes = currentMinutes + 120;
        
        const startHours = Math.floor(slotStartMinutes / 60);
        const startMins = slotStartMinutes % 60;
        const endHours = Math.floor(slotEndMinutes / 60);
        const endMins = slotEndMinutes % 60;
        
        const startTimeFormatted = `${String(startHours).padStart(2, '0')}:${String(startMins).padStart(2, '0')}`;
        const endTimeFormatted = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
        
        // Create time slot without day: "12:00 - 14:00"
        const timeSlot = `${startTimeFormatted} - ${endTimeFormatted}`;
        
        // Only add unique time slots (avoid duplicates)
        if (!slots.includes(timeSlot)) {
            slots.push(timeSlot);
        }
        
        currentMinutes += intervalMinutes;
    }

    return slots;
};
    // Validate time difference when both times are set
    useEffect(() => {
        if (formData.availability.startTime && formData.availability.endTime) {
            const [startHour, startMin] = formData.availability.startTime.split(":").map(Number);
            const [endHour, endMin] = formData.availability.endTime.split(":").map(Number);
            
            const startTotalMinutes = startHour * 60 + startMin;
            const endTotalMinutes = endHour * 60 + endMin;
            const differenceMinutes = endTotalMinutes - startTotalMinutes;
            
            if (differenceMinutes < 120) {
                setTimeError("End time must be at least 2 hours after start time");
            } else {
                setTimeError("");
            }
        } else {
            setTimeError("");
        }
    }, [formData.availability.startTime, formData.availability.endTime]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const addSkill = (type) => {
        const skill = skillInput[type].trim();
        if (skill && !formData[type === "offered" ? "skillsOffered" : "skillsWanted"].includes(skill)) {
            setFormData((prev) => ({
                ...prev,
                [type === "offered" ? "skillsOffered" : "skillsWanted"]: [
                    ...prev[type === "offered" ? "skillsOffered" : "skillsWanted"],
                    skill
                ]
            }));
            setSkillInput((prev) => ({ ...prev, [type]: "" }));
        }
    };

    const removeSkill = (type, skillToRemove) => {
        setFormData((prev) => ({
            ...prev,
            [type]: prev[type].filter((skill) => skill !== skillToRemove)
        }));
    };

    const toggleDay = (day) => {
        setFormData((prev) => ({
            ...prev,
            availability: {
                ...prev.availability,
                days: prev.availability.days.includes(day)
                    ? prev.availability.days.filter((d) => d !== day)
                    : [...prev.availability.days, day]
            }
        }));
    };

    const selectWeekdays = () => {
        setFormData((prev) => ({
            ...prev,
            availability: {
                ...prev.availability,
                days: weekdaysList
            }
        }));
    };

    const selectWeekends = () => {
        setFormData((prev) => ({
            ...prev,
            availability: {
                ...prev.availability,
                days: weekendsList
            }
        }));
    };

    const clearDays = () => {
        setFormData((prev) => ({
            ...prev,
            availability: {
                ...prev.availability,
                days: []
            }
        }));
    };

    const updateAvailabilityTime = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            availability: {
                ...prev.availability,
                [field]: value
            }
        }));

        if (field === 'startTime' && !value) {
            setFormData((prev) => ({
                ...prev,
                availability: {
                    ...prev.availability,
                    endTime: ""
                }
            }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.content) {
            alert("Please fill in title and content");
            return;
        }

        if (formData.availability.days.length > 0) {
            if (!formData.availability.startTime || !formData.availability.endTime) {
                alert("Please set start and end time for selected days");
                return;
            }
            
            if (timeError) {
                alert(timeError);
                return;
            }
        }

        try {
            // Prepare the data in the correct format for backend
            const postDataToSend = {
                title: formData.title,
                content: formData.content,
                skillsOffered: formData.skillsOffered,
                skillsWanted: formData.skillsWanted,
                availability: {
                    days: formData.availability.days,
                    startTime: formData.availability.startTime,
                    endTime: formData.availability.endTime
                }
            };

            console.log('📤 Sending post data to backend:', postDataToSend);

            // Dispatch the createPost action with properly formatted data
            const result = await dispatch(createPost(postDataToSend)).unwrap();
            
            console.log("✅ Post created successfully:", result);
            alert("Post created successfully!");
            
            // Reset form
            setFormData({
                title: "",
                content: "",
                skillsOffered: [],
                skillsWanted: [],
                availability: {
                    days: [],
                    startTime: "",
                    endTime: ""
                }
            });
            setTimeError("");
            setOpen(false);
        } catch (error) {
            console.error("❌ Failed to create post:", error);
            alert(error || "Failed to create post");
        }
    };

    // Generate available time slots for preview
    const availableSlots = formData.availability.days.length > 0 && 
                          formData.availability.startTime && 
                          formData.availability.endTime &&
                          !timeError
        ? generateTimeSlots(
            formData.availability.startTime, 
            formData.availability.endTime, 
            formData.availability.days
          )
        : [];

    const isEndTimeDisabled = !formData.availability.startTime;

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg bg-gray-600 hover:bg-gray-700 text-white z-50 flex items-center justify-center transition-colors"
            >
                <Plus className="h-6 w-6" />
            </button>

            {open && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-lg">
                    <div 
                        ref={modalRef}
                        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
                                    <p className="text-gray-600 mt-1">Share your skills and find others to swap with</p>
                                </div>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Title */}
                                <div className="space-y-2">
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                        Title *
                                    </label>
                                    <input
                                        id="title"
                                        name="title"
                                        type="text"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Teach Python, Learn React"
                                        maxLength={100}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                                    />
                                </div>

                                {/* Content */}
                                <div className="space-y-2">
                                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                        Description *
                                    </label>
                                    <textarea
                                        id="content"
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        placeholder="Describe what you can offer and what you're looking for..."
                                        rows={4}
                                        maxLength={1000}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                                    />
                                </div>

                                {/* Skills Offered */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Skills Offered</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={skillInput.offered}
                                            onChange={(e) => setSkillInput({ ...skillInput, offered: e.target.value })}
                                            placeholder="e.g., Python"
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addSkill("offered");
                                                }
                                            }}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addSkill("offered")}
                                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.skillsOffered.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-full text-sm"
                                            >
                                                {skill}
                                                <X
                                                    className="h-3 w-3 cursor-pointer hover:text-gray-300"
                                                    onClick={() => removeSkill("skillsOffered", skill)}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills Wanted */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Skills Wanted</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={skillInput.wanted}
                                            onChange={(e) => setSkillInput({ ...skillInput, wanted: e.target.value })}
                                            placeholder="e.g., React"
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addSkill("wanted");
                                                }
                                            }}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addSkill("wanted")}
                                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.skillsWanted.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-1 px-3 py-1 border border-gray-400 rounded-full text-sm"
                                            >
                                                {skill}
                                                <X
                                                    className="h-3 w-3 cursor-pointer hover:text-gray-500"
                                                    onClick={() => removeSkill("skillsWanted", skill)}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Availability Section */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Calendar className="w-4 h-4" />
                                        Availability (Optional)
                                    </label>
                                    <p className="text-sm text-gray-600">
                                        All sessions are 2 hours long. Select days and set your time range to see available slots.
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={selectWeekdays}
                                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Select Weekdays
                                        </button>
                                        <button
                                            type="button"
                                            onClick={selectWeekends}
                                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Select Weekends
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearDays}
                                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-red-600"
                                        >
                                            Clear All
                                        </button>
                                    </div>

                                    <div className="border border-gray-300 rounded-lg p-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Select Days
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {daysOfWeek.map((day) => (
                                                <button
                                                    key={day.value}
                                                    type="button"
                                                    onClick={() => toggleDay(day.value)}
                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Start Time
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={formData.availability.startTime}
                                                        onChange={(e) => updateAvailabilityTime('startTime', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        End Time
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={formData.availability.endTime}
                                                        onChange={(e) => updateAvailabilityTime('endTime', e.target.value)}
                                                        disabled={isEndTimeDisabled}
                                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                                            isEndTimeDisabled 
                                                                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                                                                : 'border-gray-300 focus:ring-gray-600'
                                                        }`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Time Validation Error */}
                                            {timeError && (
                                                <div className="text-red-600 text-sm font-medium">
                                                    {timeError}
                                                </div>
                                            )}

                                            {/* Available Time Slots Preview */}
                                            {availableSlots.length > 0 && (
                                                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                                    <p className="text-xs font-medium text-gray-700 mb-2">
                                                        Available time slots (2-hour sessions):
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                                        {availableSlots.map((time, i) => (
                                                            <span 
                                                                key={i} 
                                                                className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono"
                                                            >
                                                                {time}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Found {availableSlots.length} available slots
                                                    </p>
                                                </div>
                                            )}

                                            {formData.availability.startTime && 
                                             formData.availability.endTime && 
                                             !timeError && 
                                             availableSlots.length === 0 && (
                                                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                                                    <p className="text-xs text-yellow-700">
                                                        No 2-hour slots available in this time range. 
                                                        Try extending your end time.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setOpen(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading || (formData.availability.days.length > 0 && timeError)}
                                        className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Post"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreatePostModal;