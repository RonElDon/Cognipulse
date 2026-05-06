import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      } else {
        // Create default profile
        const newProfile = await base44.entities.UserProfile.create({
          display_name: user.full_name || 'Brain Explorer',
          preferred_language: 'en',
          total_xp: 0,
          current_streak: 0,
          longest_streak: 0,
          badges: [],
          goals: { daily_exercises: 3, focus_domains: [] }
        });
        setProfile(newProfile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(data) {
    if (!profile) return;
    const updated = await base44.entities.UserProfile.update(profile.id, data);
    setProfile(updated);
    return updated;
  }

  useEffect(() => { loadProfile(); }, []);

  return { profile, loading, updateProfile, reload: loadProfile };
}