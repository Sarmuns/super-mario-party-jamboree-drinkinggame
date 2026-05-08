import { useState } from 'react';
import type { Character } from '../types';
import { Header } from './Header';
import { SpacesSection } from './SpacesSection';
import { DiceSection } from './DiceSection';
import { StarsSection } from './StarsSection';
import { RulesSection } from './RulesSection';
import { EndGameModal } from './EndGameModal';
import { MinigameModal } from './MinigameModal';

interface Props {
  character: Character;
  totalDrinks: number;
  hasShield: boolean;
  isHomestretch: boolean;
  isJamboree: boolean;
  stars: number;
  turn: number;
  canUndo: boolean;
  onDrink: (count: number) => void;
  onActivateShield: () => void;
  onUseShield: () => void;
  onUndo: () => void;
  onToggleHomestretch: () => void;
  onToggleJamboree: () => void;
  onAddStars: (delta: number) => void;
  onIncrementTurn: () => void;
  onReset: () => void;
  showToast: (msg: string) => void;
}

export function GameTracker({
  character, totalDrinks, hasShield, isHomestretch, isJamboree,
  stars, turn, canUndo,
  onDrink, onActivateShield, onUseShield, onUndo,
  onToggleHomestretch, onToggleJamboree, onAddStars, onIncrementTurn,
  onReset, showToast,
}: Props) {
  const [showEndGame, setShowEndGame] = useState(false);
  const [showMinigame, setShowMinigame] = useState(false);

  const multiplier = (isHomestretch ? 2 : 1) * (isJamboree ? 2 : 1);

  function handleRoll1() {
    if (hasShield) { showToast('Já tem escudo! 🛡️'); }
    else { onActivateShield(); showToast('Escudo ativado! 🛡️'); }
  }

  function handleRoll10() {
    const count = 1 * multiplier;
    onDrink(count);
    showToast(`Imposto da sorte! 🎰 +${count} gole${count !== 1 ? 's' : ''}`);
  }

  function handleUseShieldFromHeader() {
    onUseShield();
    showToast('Escudo usado! 🛡️ Comunique à mesa.');
  }

  function handleMinigameConfirm(drinks: number) {
    onDrink(drinks);
    onIncrementTurn();
    setShowMinigame(false);
    showToast(`🎮 Turno ${turn} encerrado! 🍺 +${drinks}`);
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#111827' }}>
      <Header
        character={character} totalDrinks={totalDrinks} hasShield={hasShield}
        isHomestretch={isHomestretch} isJamboree={isJamboree} stars={stars} turn={turn} canUndo={canUndo}
        onUseShield={handleUseShieldFromHeader} onToggleHomestretch={onToggleHomestretch}
        onToggleJamboree={onToggleJamboree} onReset={onReset} onUndo={onUndo}
        onAddOne={() => { onDrink(1); showToast('🍺 +1'); }}
      />

      <div className="flex-1 overflow-y-auto divide-y divide-gray-800">
        <SpacesSection multiplier={multiplier} hasShield={hasShield}
          onDrink={onDrink} onUseShield={onUseShield} showToast={showToast} />

        <DiceSection hasShield={hasShield} multiplier={multiplier}
          onRoll1={handleRoll1} onRoll10={handleRoll10} />

        <StarsSection multiplier={multiplier} onDrink={onDrink}
          onStarChange={onAddStars} showToast={showToast} />

        <RulesSection />

        {/* Bottom actions */}
        <div className="px-4 py-6 flex flex-col gap-3">
          <button onClick={() => setShowMinigame(true)}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white active:scale-95 transition-transform"
            style={{ backgroundColor: 'var(--accent)', opacity: 0.9 }}>
            🎮 Fim do Turno {turn}
          </button>
          <button onClick={() => setShowEndGame(true)}
            className="w-full py-3 rounded-2xl text-sm font-bold text-gray-400 border border-gray-700 bg-gray-800/60 active:scale-95 transition-transform">
            🏁 Fim de Partida
          </button>
        </div>
      </div>

      {showMinigame && (
        <MinigameModal turn={turn} multiplier={multiplier}
          onConfirm={handleMinigameConfirm}
          onClose={() => { onIncrementTurn(); setShowMinigame(false); showToast(`Turno ${turn} encerrado`); }} />
      )}

      {showEndGame && (
        <EndGameModal character={character} totalDrinks={totalDrinks} stars={stars} turn={turn}
          onClose={() => setShowEndGame(false)}
          onReset={() => { setShowEndGame(false); onReset(); }} />
      )}
    </div>
  );
}
