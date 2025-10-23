import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";

const popularSkills = [
  "JavaScript", "Python", "React", "Node.js", "TypeScript", 
  "HTML/CSS", "UI/UX Design", "Graphic Design", "Digital Marketing",
  "Content Writing", "Data Analysis", "Machine Learning", "Web Development",
  "Mobile Development", "DevOps", "Cloud Computing", "Project Management"
];

export default function StepTeachSkills() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleContinue = async () => {
    if (selectedSkills.length === 0) {
      alert("Please select at least one skill you can teach");
      return;
    }

    setLoading(true);

    try {
      // Save teaching skills to user profile
      await api.patch("/users/profile", {
        skillsToTeach: selectedSkills
      });

      navigate("/onboarding/profile-info");
    } catch (error) {
      console.error("Error saving teaching skills:", error);
      // Still navigate to next step even if save fails
      navigate("/onboarding/profile-info");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/onboarding/profile-info");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">What can you teach?</CardTitle>
          <CardDescription>
            Select the skills you're confident in teaching others. This helps us match you with learners.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Custom Skill Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a custom skill..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
            />
            <Button onClick={addCustomSkill}>Add</Button>
          </div>

          {/* Selected Skills */}
          {selectedSkills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Your teaching skills:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(skill => (
                  <Badge 
                    key={skill} 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Popular Skills */}
          <div>
            <h3 className="font-semibold mb-2">Popular Skills:</h3>
            <div className="flex flex-wrap gap-2">
              {popularSkills.map(skill => (
                <Badge
                  key={skill}
                  variant={selectedSkills.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button onClick={handleContinue} disabled={loading}>
            {loading ? "Saving..." : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}