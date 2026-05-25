import { useState, useCallback } from 'react';

export interface LogEntry {
  id: string;
  timestamp: string; // ISO string para serialização
  emoji: string;
  message: string;
  playerName: string;
  playerColor: string;
  source: 'self' | 'room';
}

const LOG_KEY = 'smpj-game-log';
const LOG_ROOM_KEY = 'smpj-log-room';
const MAX_ENTRIES = 200;

function loadLog(): LogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLog(entries: LogEntry[]) {
  try { localStorage.setItem(LOG_KEY, JSON.stringify(entries)); } catch {}
}

export function useLog() {
  const [entries, setEntries] = useState<LogEntry[]>(loadLog);

  const addEntry = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setEntries(prev => {
      const next = [{
        ...entry,
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        timestamp: new Date().toISOString(),
      }, ...prev].slice(0, MAX_ENTRIES);
      saveLog(next);
      return next;
    });
  }, []);

  const clearLog = useCallback(() => {
    setEntries([]);
    localStorage.removeItem(LOG_KEY);
  }, []);

  // Call when entering a room — clears the log if the room code changed since last session.
  const setActiveRoom = useCallback((code: string) => {
    const stored = localStorage.getItem(LOG_ROOM_KEY);
    if (stored !== code) {
      setEntries([]);
      localStorage.removeItem(LOG_KEY);
      localStorage.setItem(LOG_ROOM_KEY, code);
    }
  }, []);

  return { entries, addEntry, clearLog, setActiveRoom };
}
