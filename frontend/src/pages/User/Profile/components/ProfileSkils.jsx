import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import EditSkillsModal from "./EditSkillsModal";

const ProfileSkills = ({ skillsToTeach, skillsToLearn, isOwner, onUpdateSkills }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Skills</CardTitle>
                    {isOwner && (
                        <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="text-gray-700">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Offered</p>
                            <div className="flex flex-wrap gap-2">
                                {skillsToTeach?.map((skill, index) => (
                                    <Badge 
                                        key={index} 
                                        variant="secondary"
                                        className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                                {(!skillsToTeach || skillsToTeach.length === 0) && (
                                    <p className="text-gray-500 text-sm">No skills offered yet.</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Wanted</p>
                            <div className="flex flex-wrap gap-2">
                                {skillsToLearn?.map((skill, index) => (
                                    <Badge 
                                        key={index} 
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200"
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                                {(!skillsToLearn || skillsToLearn.length === 0) && (
                                    <p className="text-gray-500 text-sm">No skills wanted yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isOwner && (
                <EditSkillsModal
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    initialTeach={skillsToTeach}
                    initialLearn={skillsToLearn}
                    onSave={(data) => {
                        onUpdateSkills && onUpdateSkills(data);
                        setOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default ProfileSkills;