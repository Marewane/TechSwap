import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Edit } from "lucide-react";

const EditProfileModal = ({ profile, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        skillsToTeach: [],
        skillsToLearn: []
    });
    const [newTeachingSkill, setNewTeachingSkill] = useState("");
    const [newLearningSkill, setNewLearningSkill] = useState("");

    // Initialize form data when profile changes
    useEffect(() => {
        if (profile?.user) {
            setFormData({
                name: profile.user.name || "",
                bio: profile.user.bio || "",
                skillsToTeach: profile.user.skillsToTeach || [],
                skillsToLearn: profile.user.skillsToLearn || []
            });
        }
    }, [profile]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addTeachingSkill = () => {
        if (newTeachingSkill.trim() && !formData.skillsToTeach.includes(newTeachingSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skillsToTeach: [...prev.skillsToTeach, newTeachingSkill.trim()]
            }));
            setNewTeachingSkill("");
        }
    };

    const removeTeachingSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skillsToTeach: prev.skillsToTeach.filter(skill => skill !== skillToRemove)
        }));
    };

    const addLearningSkill = () => {
        if (newLearningSkill.trim() && !formData.skillsToLearn.includes(newLearningSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skillsToLearn: [...prev.skillsToLearn, newLearningSkill.trim()]
            }));
            setNewLearningSkill("");
        }
    };

    const removeLearningSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skillsToLearn: prev.skillsToLearn.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const handleKeyPress = (e, type) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (type === 'teaching') {
                addTeachingSkill();
            } else {
                addLearningSkill();
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Edit Profile
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>

                    {/* Bio Field */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                            rows={4}
                        />
                    </div>

                    {/* Skills to Teach */}
                    <div className="space-y-3">
                        <Label>Skills I Can Teach</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newTeachingSkill}
                                onChange={(e) => setNewTeachingSkill(e.target.value)}
                                onKeyPress={(e) => handleKeyPress(e, 'teaching')}
                                placeholder="Add a skill you can teach"
                            />
                            <Button type="button" onClick={addTeachingSkill} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.skillsToTeach.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => removeTeachingSkill(skill)}
                                        className="hover:text-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            {formData.skillsToTeach.length === 0 && (
                                <p className="text-sm text-gray-500">No skills added yet</p>
                            )}
                        </div>
                    </div>

                    {/* Skills to Learn */}
                    <div className="space-y-3">
                        <Label>Skills I Want to Learn</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newLearningSkill}
                                onChange={(e) => setNewLearningSkill(e.target.value)}
                                onKeyPress={(e) => handleKeyPress(e, 'learning')}
                                placeholder="Add a skill you want to learn"
                            />
                            <Button type="button" onClick={addLearningSkill} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.skillsToLearn.map((skill, index) => (
                                <Badge key={index} variant="outline" className="flex items-center gap-1">
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => removeLearningSkill(skill)}
                                        className="hover:text-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            {formData.skillsToLearn.length === 0 && (
                                <p className="text-sm text-gray-500">No skills added yet</p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileModal;