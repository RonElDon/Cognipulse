import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import OnboardingFlow from './OnboardingFlow';

export default function OnboardingGate({ children }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | onboarding | baseline | done

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (!profiles.length) {
        // Create empty profile first so Neuro can update it
        await base44.entities.UserProfile.create({
          display_name: user.full_name || '',
          preferred_language: 'de',
          total_xp: 0,
          current_streak: 0,
          longest_streak: 0,
          badges: [],
          goals: { daily_exercises: 3, focus_domains: [] },
          onboarding_completed: false,
        });
        setStatus('onboarding');
      } else if (!profiles[0]?.onboarding_completed) {
        setStatus('onboarding');
      } else {
        setStatus('done');
      }
    } catch (_) {
      setStatus('done');
    }
  };

  useEffect(() => {
    if (status === 'baseline') {
      // Only navigate to /baseline if not already there
      if (window.location.pathname !== '/baseline') {
        navigate('/baseline');
      }
      setStatus('done');
    }
  }, [status]);

  if (status === 'loading') return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-white font-black text-lg">BrainBoost</div>
      </div>
    </div>
  );

  if (status === 'onboarding') {
    return <OnboardingFlow onComplete={() => setStatus('baseline')} />;
  }

  return children;
}