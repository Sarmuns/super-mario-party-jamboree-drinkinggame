import { useState, useCallback } from 'react';

export interface LogEntry {
  id: string;
  timestamp: Date;
  emoji: string;
  message: string;
  playerName: string;
  playerColor: string;
  source: 'self' | 'room';
}

export function useLog() {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  const addEntry = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setEntries(prev => [{
      ...entry,
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
    }, ...prev].slice(0, 150));
  }, []);

  return { entries, addEntry };
}
