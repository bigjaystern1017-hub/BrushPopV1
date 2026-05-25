import { useState, useEffect } from 'react';
import { KidProfile } from './types';

const PROFILES_KEY = 'brushpop_profiles';

export function useProfiles() {
  const [profiles, setProfiles] = useState<KidProfile[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(PROFILES_KEY);
    if (stored) {
      try {
        setProfiles(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse profiles");
      }
    }
    setLoaded(true);
  }, []);

  const saveProfile = (profile: KidProfile) => {
    const newProfiles = [...profiles.filter(p => p.id !== profile.id), profile];
    setProfiles(newProfiles);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(newProfiles));
  };

  const deleteProfile = (id: string) => {
    const newProfiles = profiles.filter(p => p.id !== id);
    setProfiles(newProfiles);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(newProfiles));
  };

  const getProfile = (id: string) => {
    return profiles.find(p => p.id === id);
  };

  return { profiles, saveProfile, deleteProfile, getProfile, loaded };
}
