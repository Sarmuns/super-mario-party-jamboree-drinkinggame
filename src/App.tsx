import { useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useToast } from './hooks/useToast';
import { CharacterSelect } from './components/CharacterSelect';
import { GameTracker } from './components/GameTracker';
import { ToastContainer } from './components/Toast';
import type { Character } from './types';

function App() {
  const { state, canUndo, selectCharacter, addDrinks, activateShield, useShield, undo, toggleHomestretch, resetGame } = useGameState();
  const { toasts, showToast, dismissToast } = useToast();

  useEffect(() => {
    const color = state.character?.color ?? '#6366f1';
    document.documentElement.style.setProperty('--accent', color);
    // subtle rgb version for backgrounds
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent-rgb', `${r} ${g} ${b}`);
  }, [state.character?.color]);

  function handleStart(character: Character) {
    selectCharacter(character);
  }

  function handleReset() {
    resetGame();
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {state.character ? (
        <GameTracker
          character={state.character}
          totalDrinks={state.totalDrinks}
          hasShield={state.hasShield}
          isHomestretch={state.isHomestretch}
          canUndo={canUndo}
          onDrink={addDrinks}
          onActivateShield={activateShield}
          onUseShield={useShield}
          onUndo={undo}
          onToggleHomestretch={toggleHomestretch}
          onReset={handleReset}
          showToast={showToast}
        />
      ) : (
        <CharacterSelect onStart={handleStart} />
      )}
    </>
  );
}

export default App;
