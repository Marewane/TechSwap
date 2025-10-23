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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index + 1 <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Learn</span>
            <span>Teach</span>
            <span>Profile</span>
          </div>
        </div>

        {/* Current Step Component */}
        {steps[currentStep - 1].component}
      </div>
    </div>
  );
}