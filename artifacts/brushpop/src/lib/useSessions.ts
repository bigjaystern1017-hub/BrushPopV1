import { useState, useEffect } from 'react';
import { BrushSession } from './types';

const SESSIONS_KEY = 'brushpop_sessions';

/** Returns YYYY-MM-DD in local time (not UTC) */
export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Pure streak calculator — takes any sessions array, no React state dependency.
 * Rules:
 * - Brushing multiple times in one day counts as 1 streak day.
 * - The streak is alive if the most recent brush day is today OR yesterday.
 * - Any gap of 2+ days resets to 0.
 * - Dates are compared in local calendar time.
 */
export function computeStreak(sessions: BrushSession[], kidId: string): number {
  const kidDates = sessions
    .filter(s => s.kidId === kidId)
    .map(s => s.date);

  if (kidDates.length === 0) return 0;

  // Deduplicate and sort descending (most-recent first)
  const uniqueDates = [...new Set(kidDates)].sort((a, b) => b.localeCompare(a));

  const todayStr     = localDateStr();
  const yesterdayStr = localDateStr(new Date(Date.now() - 86_400_000));

  // Streak is only alive if last brush was today or yesterday
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    // Build the expected "day before" date purely from the string, no toISOString()
    const prev = uniqueDates[i - 1]; // e.g. "2025-06-15"
    const [py, pm, pd] = prev.split('-').map(Number);
    // Create a noon-local Date so DST can't shift the day
    const prevDate = new Date(py, pm - 1, pd, 12, 0, 0);
    prevDate.setDate(prevDate.getDate() - 1);
    const expected = localDateStr(prevDate);

    if (uniqueDates[i] === expected) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

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

  /** Saves a session and returns the full updated sessions array synchronously */
  const saveSession = (session: BrushSession): BrushSession[] => {
    const newSessions = [...sessions, session];
    setSessions(newSessions);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
    return newSessions;
  };

  const getKidSessions = (kidId: string) => {
    return sessions
      .filter(s => s.kidId === kidId)
      .sort((a, b) => b.completedAt - a.completedAt);
  };

  /**
   * getStreak always reads from localStorage so it is never stale
   * right after saveSession (state update is async; localStorage is sync).
   */
  const getStreak = (kidId: string): number => {
    try {
      const raw = localStorage.getItem(SESSIONS_KEY);
      const latest: BrushSession[] = raw ? JSON.parse(raw) : sessions;
      return computeStreak(latest, kidId);
    } catch {
      return computeStreak(sessions, kidId);
    }
  };

  return { sessions, saveSession, getKidSessions, getStreak };
}
