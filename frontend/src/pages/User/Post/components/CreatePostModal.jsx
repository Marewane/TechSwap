import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, X, Loader2, Calendar, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyProfile } from "@/features/profile/profileSlice";
import { createPost } from "@/features/posts/postsSlice";

const CreatePostModal = () => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.posts);
    const { user } = useSelector((state) => state.user); // fallback
    const { myProfile } = useSelector((state) => state.profile); // source of truth for skills
    
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

    const [timeError, setTimeError] = useState("");
    const modalRef = useRef(null);
    const teachInputRef = useRef(null);
    const learnInputRef = useRef(null);
    const [teachInput, setTeachInput] = useState("");
    const [learnInput, setLearnInput] = useState("");

    // Get user's actual skills from profile first, fallback to user slice
    const profileUser = myProfile?.user || user;
    const userTeachingSkills = profileUser?.skillsToTeach || [];
    const userLearningSkills = profileUser?.skillsToLearn || [];

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

    // Ensure we have fresh profile data when opening the modal so suggested tags appear
    useEffect(() => {
        if (open && !myProfile) {
            dispatch(fetchMyProfile());
        }
    }, [open, myProfile, dispatch]);

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
            
            const timeSlot = `${startTimeFormatted} - ${endTimeFormatted}`;
            
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

    // Toggle skill selection
    const toggleSkill = (skill, type) => {
        setFormData((prev) => {
            const currentSkills = prev[type === "offered" ? "skillsOffered" : "skillsWanted"];
            const isSelected = currentSkills.includes(skill);
            
            if (isSelected) {
                return {
                    ...prev,
                    [type === "offered" ? "skillsOffered" : "skillsWanted"]: 
                        currentSkills.filter(s => s !== skill)
                };
            } else {
                return {
                    ...prev,
                    [type === "offered" ? "skillsOffered" : "skillsWanted"]: 
                        [...currentSkills, skill]
                };
            }
        });
    };

    // Clear all selected skills for a type
    const clearSkills = (type) => {
        setFormData((prev) => ({
            ...prev,
            [type === "offered" ? "skillsOffered" : "skillsWanted"]: []
        }));
    };

    const addInputSkill = useCallback((type) => {
        const raw = type === "offered" ? teachInput : learnInput;
        const skill = (raw || "").trim();
        if (!skill) return;
        setFormData((prev) => {
            const key = type === "offered" ? "skillsOffered" : "skillsWanted";
            const exists = prev[key].some((s) => s.toLowerCase() === skill.toLowerCase());
            if (exists) return prev;
            return { ...prev, [key]: [...prev[key], skill] };
        });
        if (type === "offered") {
            setTeachInput("");
            // Maintain focus on the input after clearing
            setTimeout(() => {
                teachInputRef.current?.focus();
            }, 0);
        }
        if (type === "wanted") {
            setLearnInput("");
            // Maintain focus on the input after clearing
            setTimeout(() => {
                learnInputRef.current?.focus();
            }, 0);
        }
    }, [teachInput, learnInput]);

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

        if (formData.skillsOffered.length === 0) {
            alert("Please select at least one skill you can offer");
            return;
        }

        if (formData.skillsWanted.length === 0) {
            alert("Please select at least one skill you want to learn");
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

    // Skills Selection Component - Stacked layout
    const SkillsSelection = () => (
        <div className="space-y-6">
            {/* Skills Offered Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                        Skills I Can Teach *
                    </label>
                    {formData.skillsOffered.length > 0 && (
                        <button
                            type="button"
                            onClick={() => clearSkills("offered")}
                            className="text-xs text-red-600 hover:text-red-700"
                        >
                            Clear all
                        </button>
                    )}
                </div>
                
                {/* Selected Skills Preview - Offered */}
                <div className="flex flex-wrap gap-2 min-h-8">
                    {formData.skillsOffered.map((skill, index) => (
                        <span
                            key={`offered-${index}`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded-full text-xs"
                        >
                            📤 {skill}
                            <X
                                className="h-3 w-3 cursor-pointer hover:text-gray-300 ml-1"
                                onClick={() => toggleSkill(skill, "offered")}
                            />
                        </span>
                    ))}
                    {formData.skillsOffered.length === 0 && (
                        <span className="text-xs text-gray-500 italic">
                            No skills selected yet
                        </span>
                    )}
                </div>

                {/* Skills Grid - Offered */}
                {userTeachingSkills.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                        {userTeachingSkills.map((skill, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => toggleSkill(skill, "offered")}
                                className={`p-2 rounded text-left transition-all text-xs ${
                                    formData.skillsOffered.includes(skill)
                                        ? "bg-gray-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium truncate">{skill}</span>
                                    {formData.skillsOffered.includes(skill) && (
                                        <Check className="h-3 w-3 ml-1 flex-shrink-0" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Manual add input - Offered */}
                <div className="mt-2 flex items-center gap-2">
                    <input
                        key="teach-input"
                        ref={teachInputRef}
                        type="text"
                        value={teachInput}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            const cursorPosition = e.target.selectionStart;
                            setTeachInput(newValue);
                            // Restore focus and cursor position after state update
                            requestAnimationFrame(() => {
                                if (teachInputRef.current) {
                                    teachInputRef.current.focus();
                                    // Set cursor to the correct position (after the typed character)
                                    const newCursorPos = Math.min(cursorPosition, newValue.length);
                                    teachInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
                                }
                            });
                        }}
                        onKeyDown={(e) => { 
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addInputSkill('offered');
                            }
                        }}
                        placeholder="Type a skill you can teach and press Enter"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                    />
                    <button
                        type="button"
                        onClick={() => addInputSkill('offered')}
                        className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Skills Wanted Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                        Skills I Want to Learn *
                    </label>
                    {formData.skillsWanted.length > 0 && (
                        <button
                            type="button"
                            onClick={() => clearSkills("wanted")}
                            className="text-xs text-red-600 hover:text-red-700"
                        >
                            Clear all
                        </button>
                    )}
                </div>
                
                {/* Selected Skills Preview - Wanted */}
                <div className="flex flex-wrap gap-2 min-h-8">
                    {formData.skillsWanted.map((skill, index) => (
                        <span
                            key={`wanted-${index}`}
                            className="inline-flex items-center gap-1 px-2 py-1 border border-blue-400 bg-blue-50 text-blue-700 rounded-full text-xs"
                        >
                            📥 {skill}
                            <X
                                className="h-3 w-3 cursor-pointer hover:text-blue-500 ml-1"
                                onClick={() => toggleSkill(skill, "wanted")}
                            />
                        </span>
                    ))}
                    {formData.skillsWanted.length === 0 && (
                        <span className="text-xs text-gray-500 italic">
                            No skills selected yet
                        </span>
                    )}
                </div>

                {/* Skills Grid - Wanted */}
                {userLearningSkills.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                        {userLearningSkills.map((skill, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => toggleSkill(skill, "wanted")}
                                className={`p-2 rounded text-left transition-all text-xs ${
                                    formData.skillsWanted.includes(skill)
                                        ? "bg-blue-500 text-white"
                                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium truncate">{skill}</span>
                                    {formData.skillsWanted.includes(skill) && (
                                        <Check className="h-3 w-3 ml-1 flex-shrink-0" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Manual add input - Wanted */}
                <div className="mt-2 flex items-center gap-2">
                    <input
                        key="learn-input"
                        ref={learnInputRef}
                        type="text"
                        value={learnInput}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            const cursorPosition = e.target.selectionStart;
                            setLearnInput(newValue);
                            // Restore focus and cursor position after state update
                            requestAnimationFrame(() => {
                                if (learnInputRef.current) {
                                    learnInputRef.current.focus();
                                    // Set cursor to the correct position (after the typed character)
                                    const newCursorPos = Math.min(cursorPosition, newValue.length);
                                    learnInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
                                }
                            });
                        }}
                        onKeyDown={(e) => { 
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addInputSkill('wanted');
                            }
                        }}
                        placeholder="Type a skill you want to learn and press Enter"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                    />
                    <button
                        type="button"
                        onClick={() => addInputSkill('wanted')}
                        className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Validation Messages */}
            <div className="space-y-1">
                {formData.skillsOffered.length === 0 && (
                    <p className="text-xs text-red-600">Please select at least one skill to teach</p>
                )}
                {formData.skillsWanted.length === 0 && (
                    <p className="text-xs text-red-600">Please select at least one skill to learn</p>
                )}
            </div>
        </div>
    );

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

                                {/* Skills Selection - Stacked Layout */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Skills Selection *
                                    </label>
                                    <SkillsSelection />
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
                                        disabled={loading || 
                                                 (formData.availability.days.length > 0 && timeError) ||
                                                 formData.skillsOffered.length === 0 ||
                                                 formData.skillsWanted.length === 0}
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