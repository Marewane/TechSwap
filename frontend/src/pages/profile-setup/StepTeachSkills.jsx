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
    // Use PUT instead of PATCH
    const response = await api.put("/profile/update", {
      skillsToTeach: selectedSkills
    });

    if (response.data.success) {
      navigate("/onboarding/profile-info");
    } else {
      throw new Error(response.data.message || "Failed to save teaching skills");
    }
  } catch (error) {
    console.error("Error saving teaching skills:", error);
    console.error("Full error details:", error.response?.data);
    
    const errorMessage = error.response?.data?.message || "Failed to save your teaching skills. Please try again.";
    alert(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleSkip = () => {
    navigate("/onboarding/profile-info");
  };

  return (
    <Card className="border border-border/50 bg-card/95 p-0 shadow-[0_26px_90px_rgba(46,47,70,0.18)]">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-semibold text-foreground">What can you teach?</CardTitle>
        <CardDescription className="text-sm text-foreground/70">
          Highlight the skills you can mentor others on. We&apos;ll feature you in searches and reward you with coins.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Add a custom skill…"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
          />
          <Button type="button" onClick={addCustomSkill} className="sm:w-[140px]">
            Add skill
          </Button>
        </div>

        {selectedSkills.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground/80">Your teaching skills</h3>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="cursor-pointer rounded-full px-3 py-1 text-xs"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill} ×
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground/80">Popular skills</h3>
          <div className="flex flex-wrap gap-2">
            {popularSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <Badge
                  key={skill}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer rounded-full px-3 py-1 text-xs ${
                    isSelected ? "shadow-[0_16px_45px_rgba(109,122,255,0.25)]" : ""
                  }`}
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={handleSkip} className="sm:w-[160px]">
          Skip for now
        </Button>
        <Button onClick={handleContinue} disabled={loading} className="sm:w-[160px]">
          {loading ? "Saving…" : "Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}