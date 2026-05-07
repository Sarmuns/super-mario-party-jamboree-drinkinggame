import type { Character } from '../types';
import { Header } from './Header';
import { SpacesSection } from './SpacesSection';
import { DiceSection } from './DiceSection';
import { StarsSection } from './StarsSection';
import { RulesSection } from './RulesSection';

interface Props {
  character: Character;
  totalDrinks: number;
  hasShield: boolean;
  isHomestretch: boolean;
  onDrink: (count: number) => void;
  onActivateShield: () => void;
  onUseShield: () => void;
  onToggleHomestretch: () => void;
  onReset: () => void;
  showToast: (msg: string) => void;
}

export function GameTracker({
  character,
  totalDrinks,
  hasShield,
  isHomestretch,
  onDrink,
  onActivateShield,
  onUseShield,
  onToggleHomestretch,
  onReset,
  showToast,
}: Props) {
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
        onUseShield={handleUseShieldFromHeader}
        onToggleHomestretch={onToggleHomestretch}
        onReset={onReset}
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
      </div>
    </div>
  );
}
