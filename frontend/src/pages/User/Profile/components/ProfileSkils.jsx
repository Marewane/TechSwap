import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ProfileSkills = ({ skillsToTeach, skillsToLearn, isOwner }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Skills Offered */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Skills Offered</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>

            {/* Skills Wanted (only show for owner) */}
            {isOwner && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Skills Wanted</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ProfileSkills;