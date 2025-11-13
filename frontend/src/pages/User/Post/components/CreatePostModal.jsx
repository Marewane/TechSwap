import { useState, useRef, useEffect } from "react";
import { Plus, X, Loader2, Calendar } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "@/features/posts/postsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
            <Button
                onClick={() => setOpen(true)}
                size="lg"
                className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full shadow-[0_28px_70px_rgba(46,47,70,0.32)]"
            >
                <Plus className="size-6" />
            </Button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.65)] px-4 py-8 backdrop-blur-xl">
                    <div ref={modalRef} className="w-full max-w-3xl">
                        <Card className="border border-border/60 bg-card/95 p-0 shadow-[0_45px_140px_rgba(46,47,70,0.36)]">
                            <CardContent className="p-8">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary">Create post</p>
                                        <h2 className="mt-3 text-3xl font-semibold text-foreground">Launch a premium swap listing</h2>
                                        <p className="mt-2 text-sm text-foreground/70">
                                            Showcase what you can teach, what you want to learn, and when you are available.
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-foreground/60 hover:text-secondary">
                                        <X className="size-5" />
                                    </Button>
                                </div>

                                <div className="mt-8 space-y-6">
                                    {/* Title */}
                                    <div className="space-y-2">
                                        <label htmlFor="title" className="text-sm font-semibold text-foreground/80">
                                            Title *
                                        </label>
                                        <Input
                                            id="title"
                                            name="title"
                                            type="text"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="Teach Python, Master React, Ship a CI/CD pipeline..."
                                            maxLength={100}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-2">
                                        <label htmlFor="content" className="text-sm font-semibold text-foreground/80">
                                            Description *
                                        </label>
                                        <Textarea
                                            id="content"
                                            name="content"
                                            value={formData.content}
                                            onChange={handleInputChange}
                                            placeholder="Describe what you can offer, what you want to learn, and the impact of your expertise."
                                            rows={5}
                                            maxLength={1000}
                                        />
                                    </div>

                                    {/* Skills Offered */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-foreground/80">Skills Offered</label>
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <Input
                                                type="text"
                                                value={skillInput.offered}
                                                onChange={(e) => setSkillInput({ ...skillInput, offered: e.target.value })}
                                                placeholder="e.g., Python"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addSkill("offered");
                                                    }
                                                }}
                                            />
                                            <Button type="button" variant="outline" onClick={() => addSkill("offered")} className="sm:w-[160px]">
                                                Add skill
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.skillsOffered.map((skill, idx) => (
                                                <Badge key={idx} variant="secondary" className="gap-1 rounded-full px-3 py-1 text-xs">
                                                    {skill}
                                                    <button type="button" onClick={() => removeSkill("skillsOffered", skill)} className="transition hover:text-primary-foreground/70">
                                                        <X className="size-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Skills Wanted */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-foreground/80">Skills Wanted</label>
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <Input
                                                type="text"
                                                value={skillInput.wanted}
                                                onChange={(e) => setSkillInput({ ...skillInput, wanted: e.target.value })}
                                                placeholder="e.g., React, Growth analytics"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addSkill("wanted");
                                                    }
                                                }}
                                            />
                                            <Button type="button" variant="outline" onClick={() => addSkill("wanted")} className="sm:w-[160px]">
                                                Add skill
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.skillsWanted.map((skill, idx) => (
                                                <Badge key={idx} variant="outline" className="gap-1 rounded-full border-secondary/40 px-3 py-1 text-xs text-secondary">
                                                    {skill}
                                                    <button type="button" onClick={() => removeSkill("skillsWanted", skill)} className="transition hover:text-secondary/70">
                                                        <X className="size-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Availability Section */}
                                    <div className="space-y-4 rounded-[var(--radius)] border border-border/50 bg-white/60 p-6 shadow-[0_18px_60px_rgba(46,47,70,0.12)]">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <Calendar className="size-4 text-secondary" />
                                            Availability (Optional)
                                        </div>
                                        <p className="text-sm text-foreground/65">
                                            Every swap session runs 2 hours (50 coins per person). Choose days and a time window to auto-generate eligible slots.
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={selectWeekdays}>
                                                Weekdays
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" onClick={selectWeekends}>
                                                Weekends
                                            </Button>
                                            <Button type="button" variant="ghost" size="sm" onClick={clearDays} className="text-destructive">
                                                Clear selection
                                            </Button>
                                        </div>

                                        <div className="rounded-[calc(var(--radius)/1.6)] border border-border/50 bg-white/70 p-4">
                                            <p className="text-sm font-semibold text-foreground/80">Select days</p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {daysOfWeek.map((day) => {
                                                    const isSelected = formData.availability.days.includes(day.value);
                                                    return (
                                                        <Button
                                                            key={day.value}
                                                            type="button"
                                                            variant={isSelected ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => toggleDay(day.value)}
                                                            className="min-w-[60px]"
                                                        >
                                                            {day.short}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                            {formData.availability.days.length > 0 && (
                                                <p className="mt-3 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                                                    {formData.availability.days.join(" · ")}
                                                </p>
                                            )}
                                        </div>

                                        {formData.availability.days.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-semibold text-foreground/70">Start Time</label>
                                                        <Input
                                                            type="time"
                                                            value={formData.availability.startTime}
                                                            onChange={(e) => updateAvailabilityTime("startTime", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-semibold text-foreground/70">End Time</label>
                                                        <Input
                                                            type="time"
                                                            value={formData.availability.endTime}
                                                            onChange={(e) => updateAvailabilityTime("endTime", e.target.value)}
                                                            disabled={isEndTimeDisabled}
                                                            className={isEndTimeDisabled ? "opacity-50" : ""}
                                                        />
                                                    </div>
                                                </div>

                                                {timeError && (
                                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                                        {timeError}
                                                    </div>
                                                )}

                                                {availableSlots.length > 0 && (
                                                    <div className="rounded-[calc(var(--radius)/1.8)] border border-border/50 bg-white/70 p-4">
                                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Eligible 2-hour slots</p>
                                                        <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                                                            {availableSlots.map((time, i) => (
                                                                <Badge key={i} variant="outline" className="rounded-full border-secondary/30 px-3 py-1 text-xs text-secondary">
                                                                    {time}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <p className="mt-2 text-xs text-foreground/50">
                                                            {availableSlots.length} time slots generated
                                                        </p>
                                                    </div>
                                                )}

                                                {formData.availability.startTime &&
                                                    formData.availability.endTime &&
                                                    !timeError &&
                                                    availableSlots.length === 0 && (
                                                        <div className="rounded-[calc(var(--radius)/1.8)] border border-accent/40 bg-accent/15 px-4 py-3 text-xs text-foreground/70">
                                                            No 2-hour slots available in this window. Extend your range to unlock swappable slots.
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
                                        <Button type="button" variant="ghost" className="sm:flex-1" onClick={() => setOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            className="sm:flex-1"
                                            onClick={handleSubmit}
                                            disabled={loading || (formData.availability.days.length > 0 && timeError)}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="size-4 animate-spin" />
                                                    Creating…
                                                </>
                                            ) : (
                                                "Create post"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreatePostModal;