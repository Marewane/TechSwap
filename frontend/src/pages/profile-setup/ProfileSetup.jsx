import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepLearnSkills from './StepLearnSkills';
import StepTeachSkills from './StepTeachSkills';
import StepProfileInfo from './StepProfileInfo';

export default function ProfileSetup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    skillsToLearn: [],
    skillsToTeach: [],
    name: '',
    bio: '',
    avatar: ''
  });
  const navigate = useNavigate();

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit all data to backend
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      // Save profile data to backend
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      
      const response = await fetch(`${API_BASE}/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.tokens?.accessToken}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate('/home');
      } else {
        console.error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const steps = [
    {
      component: (
        <StepLearnSkills
          skillsToLearn={formData.skillsToLearn}
          setSkillsToLearn={(skills) => updateFormData('skillsToLearn', skills)}
          onNext={handleNext}
        />
      ),
      title: "Learn Skills"
    },
    {
      component: (
        <StepTeachSkills
          skillsToTeach={formData.skillsToTeach}
          setSkillsToTeach={(skills) => updateFormData('skillsToTeach', skills)}
          onNext={handleNext}
          onBack={handleBack}
        />
      ),
      title: "Teach Skills"
    },
    {
      component: (
        <StepProfileInfo
          formData={formData}
          updateFormData={updateFormData}
          onFinish={handleFinish}
          onBack={handleBack}
        />
      ),
      title: "Profile Info"
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#f9fafb] via-white to-[#eef1ff] px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute left-6 top-10 h-72 w-72 rounded-full bg-secondary/20 blur-[160px]" />
      <div className="absolute right-6 bottom-10 h-72 w-72 rounded-full bg-accent/20 blur-[160px]" />
      <div className="relative mx-auto max-w-3xl rounded-[var(--radius)] border border-border/60 bg-white/80 p-8 shadow-[0_40px_120px_rgba(46,47,70,0.25)] backdrop-blur-2xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary">Profile onboarding</p>
            <h1 className="mt-3 text-3xl font-semibold text-foreground md:text-4xl">
              Set up your premium TechSwap profile
            </h1>
            <p className="mt-2 text-sm text-foreground/70">
              Curate your learning targets, highlight what you teach, and craft a profile that earns coins faster.
            </p>
          </div>
          <div className="shrink-0 text-right text-sm text-foreground/60">
            Step <span className="font-semibold text-secondary">{currentStep}</span> of 3
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3">
            {steps.map((step, index) => {
              const isActive = index + 1 === currentStep;
              const isCompleted = index + 1 < currentStep;
              return (
                <div key={step.title} className="flex flex-1 items-center gap-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-full border text-sm font-semibold transition-all ${
                      isActive
                        ? "border-secondary bg-secondary text-secondary-foreground shadow-[0_16px_45px_rgba(109,122,255,0.28)]"
                        : isCompleted
                        ? "border-secondary/60 bg-secondary/15 text-secondary"
                        : "border-border/60 bg-white/70 text-foreground/50"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-mono uppercase tracking-[0.2em] ${isActive ? "text-secondary" : "text-foreground/50"}`}>
                      {step.title}
                    </p>
                    <div className="mt-2 h-1 rounded-full bg-border/40">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isActive ? "bg-secondary" : isCompleted ? "bg-secondary/60" : "bg-transparent"
                        }`}
                        style={{ width: isActive ? "100%" : isCompleted ? "100%" : "0%" }}
                      />
                    </div>
                  </div>
                  {index !== steps.length - 1 && <div className="hidden h-px flex-1 bg-gradient-to-r from-border/30 to-border/80 md:block" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10">
          {steps[currentStep - 1].component}
        </div>
      </div>
    </div>
  );
}