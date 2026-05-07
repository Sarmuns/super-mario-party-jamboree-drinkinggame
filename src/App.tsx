import { useGameState } from './hooks/useGameState';
import { useToast } from './hooks/useToast';
import { CharacterSelect } from './components/CharacterSelect';
import { GameTracker } from './components/GameTracker';
import { ToastContainer } from './components/Toast';
import type { Character } from './types';

function App() {
  const { state, selectCharacter, addDrinks, activateShield, useShield, toggleHomestretch, resetGame } = useGameState();
  const { toasts, showToast, dismissToast } = useToast();

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
          onDrink={addDrinks}
          onActivateShield={activateShield}
          onUseShield={useShield}
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
