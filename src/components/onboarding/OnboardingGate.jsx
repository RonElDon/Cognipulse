import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import OnboardingFlow from './OnboardingFlow';

export default function OnboardingGate({ children }) {
  const [status, setStatus] = useState('loading'); // loading | onboarding | done

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (!profiles.length || !profiles[0]?.onboarding_completed) {
        setStatus('onboarding');
      } else {
        setStatus('done');
      }
    } catch (_) {
      setStatus('done');
    }
  };

  if (status === 'loading') return null;

  if (status === 'onboarding') {
    return <OnboardingFlow onComplete={() => setStatus('done')} />;
  }

  return children;
}