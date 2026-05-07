import { useState } from 'react';
import type { Character } from '../types';
import { Header } from './Header';
import { SpacesSection } from './SpacesSection';
import { DiceSection } from './DiceSection';
import { StarsSection } from './StarsSection';
import { RulesSection } from './RulesSection';
import { EndGameModal } from './EndGameModal';

interface Props {
  character: Character;
  totalDrinks: number;
  hasShield: boolean;
  isHomestretch: boolean;
  canUndo: boolean;
  onDrink: (count: number) => void;
  onActivateShield: () => void;
  onUseShield: () => void;
  onUndo: () => void;
  onToggleHomestretch: () => void;
  onReset: () => void;
  showToast: (msg: string) => void;
}

export function GameTracker({
  character,
  totalDrinks,
  hasShield,
  isHomestretch,
  canUndo,
  onDrink,
  onActivateShield,
  onUseShield,
  onUndo,
  onToggleHomestretch,
  onReset,
  showToast,
}: Props) {
  const [showEndGame, setShowEndGame] = useState(false);
  function handleRoll1() {
    if (hasShield) {
      showToast('Já tem escudo! 🛡️');
    } else {
      onActivateShield();
      showToast('Escudo ativado! 🛡️');
    }
  }

  function handleRoll10() {
    const count = isHomestretch ? 2 : 1;
    onDrink(count);
    showToast(`Imposto da sorte! 🎰 +${count} gole${count !== 1 ? 's' : ''}`);
  }

  function handleUseShieldFromHeader() {
    onUseShield();
    showToast('Escudo usado! 🛡️ Comunique à mesa.');
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#111827' }}>
      <Header
        character={character}
        totalDrinks={totalDrinks}
        hasShield={hasShield}
        isHomestretch={isHomestretch}
        canUndo={canUndo}
        onUseShield={handleUseShieldFromHeader}
        onToggleHomestretch={onToggleHomestretch}
        onReset={onReset}
        onUndo={onUndo}
      />

      <div className="flex-1 overflow-y-auto divide-y divide-gray-800">
        <SpacesSection
          isHomestretch={isHomestretch}
          hasShield={hasShield}
          onDrink={onDrink}
          onUseShield={onUseShield}
          showToast={showToast}
        />

        <DiceSection
          hasShield={hasShield}
          isHomestretch={isHomestretch}
          onRoll1={handleRoll1}
          onRoll10={handleRoll10}
        />

        <StarsSection
          isHomestretch={isHomestretch}
          onDrink={onDrink}
          showToast={showToast}
        />

        <RulesSection />

        {/* End game button */}
        <div className="px-4 py-6">
          <button
            onClick={() => setShowEndGame(true)}
            className="w-full py-4 rounded-2xl text-sm font-bold text-gray-400 border border-gray-700 bg-gray-800/60 active:scale-95 transition-transform"
          >
            🏁 Fim de Partida
          </button>
        </div>
      </div>

      {showEndGame && (
        <EndGameModal
          character={character}
          totalDrinks={totalDrinks}
          onClose={() => setShowEndGame(false)}
          onReset={() => { setShowEndGame(false); onReset(); }}
        />
      )}
    </div>
  );
}
