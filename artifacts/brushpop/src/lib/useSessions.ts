import { useState, useEffect } from 'react';
import { BrushSession } from './types';

const SESSIONS_KEY = 'brushpop_sessions';

export function useSessions() {
  const [sessions, setSessions] = useState<BrushSession[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(SESSIONS_KEY);
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse sessions");
      }
    }
  }, []);

  const saveSession = (session: BrushSession) => {
    const newSessions = [...sessions, session];
    setSessions(newSessions);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
  };

  const getKidSessions = (kidId: string) => {
    return sessions.filter(s => s.kidId === kidId).sort((a, b) => b.completedAt - a.completedAt);
  };

  const getStreak = (kidId: string) => {
    const kidSessions = getKidSessions(kidId);
    if (kidSessions.length === 0) return 0;

    const uniqueDates = [...new Set(kidSessions.map(s => s.date))].sort((a, b) => b.localeCompare(a));
    
    let streak = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Simple streak calc
    if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
      streak = 1;
      let checkDate = new Date(uniqueDates[0]);
      for (let i = 1; i < uniqueDates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        if (uniqueDates[i] === checkDate.toISOString().split('T')[0]) {
          streak++;
        } else {
          break;
        }
      }
    }
    return streak;
  };

  return { sessions, saveSession, getKidSessions, getStreak };
}
