import { useState, useEffect, useCallback, useRef } from 'react';
import type { Character, GameState } from '../types';

const STORAGE_KEY = 'smpj-game-state';

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { character: null, totalDrinks: 0, hasShield: false, isHomestretch: false, isJamboree: false, stars: 0, turn: 1 };
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

  const setTotalDrinks = useCallback((value: number) => {
    setState(s => { snapshot(s); return { ...s, totalDrinks: Math.max(0, value) }; });
  }, []);

  const setTurn = useCallback((value: number) => {
    setState(s => ({ ...s, turn: Math.max(1, value) }));
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

  const toggleJamboree = useCallback(() => {
    setState(s => ({ ...s, isJamboree: !s.isJamboree }));
  }, []);

  const addStars = useCallback((delta: number) => {
    setState(s => { snapshot(s); return { ...s, stars: s.stars + delta }; });
  }, []);

  const incrementTurn = useCallback(() => {
    setState(s => ({ ...s, turn: s.turn + 1 }));
  }, []);

  const resetGame = useCallback(() => {
    prevRef.current = null;
    setCanUndo(false);
    setState({ character: null, totalDrinks: 0, hasShield: false, isHomestretch: false, isJamboree: false, stars: 0, turn: 1 });
  }, []);

  const goToCharacterSelect = useCallback(() => {
    setState(s => ({ ...s, character: null }));
  }, []);

  return {
    state,
    canUndo,
    selectCharacter,
    addDrinks,
    setTotalDrinks,
    setTurn,
    activateShield,
    useShield,
    undo,
    toggleHomestretch,
    toggleJamboree,
    addStars,
    incrementTurn,
    resetGame,
    goToCharacterSelect,
  };
}
