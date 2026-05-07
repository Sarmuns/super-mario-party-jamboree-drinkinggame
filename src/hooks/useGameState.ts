import { useState, useEffect, useCallback, useRef } from 'react';
import type { Character, GameState } from '../types';

const STORAGE_KEY = 'smpj-game-state';

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { character: null, totalDrinks: 0, hasShield: false, isHomestretch: false };
}

function vibrate() {
  try { navigator.vibrate?.(60); } catch {}
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);
  const [canUndo, setCanUndo] = useState(false);
  const prevRef = useRef<GameState | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function snapshot(s: GameState) {
    prevRef.current = s;
    setCanUndo(true);
  }

  const selectCharacter = useCallback((character: Character) => {
    setState(s => ({ ...s, character }));
  }, []);

  const addDrinks = useCallback((count: number) => {
    vibrate();
    setState(s => { snapshot(s); return { ...s, totalDrinks: s.totalDrinks + count }; });
  }, []);

  const activateShield = useCallback(() => {
    setState(s => { snapshot(s); return { ...s, hasShield: true }; });
  }, []);

  const useShield = useCallback(() => {
    setState(s => { snapshot(s); return { ...s, hasShield: false }; });
  }, []);

  const undo = useCallback(() => {
    if (!prevRef.current) return;
    setState(prevRef.current);
    prevRef.current = null;
    setCanUndo(false);
  }, []);

  const toggleHomestretch = useCallback(() => {
    setState(s => ({ ...s, isHomestretch: !s.isHomestretch }));
  }, []);

  const resetGame = useCallback(() => {
    prevRef.current = null;
    setCanUndo(false);
    setState({ character: null, totalDrinks: 0, hasShield: false, isHomestretch: false });
  }, []);

  const goToCharacterSelect = useCallback(() => {
    setState(s => ({ ...s, character: null }));
  }, []);

  return {
    state,
    canUndo,
    selectCharacter,
    addDrinks,
    activateShield,
    useShield,
    undo,
    toggleHomestretch,
    resetGame,
    goToCharacterSelect,
  };
}
