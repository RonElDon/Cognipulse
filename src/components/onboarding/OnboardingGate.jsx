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
      navigate('/baseline');
      setStatus('done');
    }
  }, [status]);

  if (status === 'loading') return null;

  if (status === 'onboarding') {
    return <OnboardingFlow onComplete={() => setStatus('baseline')} />;
  }

  return children;
}