import { useState, useEffect, useCallback } from 'react';
import type { Character, GameState } from '../types';

const STORAGE_KEY = 'smpj-game-state';

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { character: null, totalDrinks: 0, hasShield: false, isHomestretch: false };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const selectCharacter = useCallback((character: Character) => {
    setState(s => ({ ...s, character }));
  }, []);

  const addDrinks = useCallback((count: number) => {
    setState(s => ({ ...s, totalDrinks: s.totalDrinks + count }));
  }, []);

  const activateShield = useCallback(() => {
    setState(s => ({ ...s, hasShield: true }));
  }, []);

  const useShield = useCallback(() => {
    setState(s => ({ ...s, hasShield: false }));
  }, []);

  const toggleHomestretch = useCallback(() => {
    setState(s => ({ ...s, isHomestretch: !s.isHomestretch }));
  }, []);

  const resetGame = useCallback(() => {
    setState({ character: null, totalDrinks: 0, hasShield: false, isHomestretch: false });
  }, []);

  const goToCharacterSelect = useCallback(() => {
    setState(s => ({ ...s, character: null }));
  }, []);

  return {
    state,
    selectCharacter,
    addDrinks,
    activateShield,
    useShield,
    toggleHomestretch,
    resetGame,
    goToCharacterSelect,
  };
}
