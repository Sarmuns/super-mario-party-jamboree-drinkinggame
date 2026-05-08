import { useState } from 'react';
import type { Space } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { SpaceModal } from './SpaceModal';
import gameData from '../data/smpj-drinking-game-data.json';

const EXCLUDED_SPACES = new Set(['start', 'star_exchange']);
const playableSpaces = (gameData.spaces as Space[]).filter(s => !EXCLUDED_SPACES.has(s.id));

interface Props {
  multiplier: number;
  hasShield: boolean;
  onDrink: (count: number) => void;
  onUseShield: () => void;
  showToast: (msg: string) => void;
}

export function SpacesSection({ multiplier, hasShield, onDrink, onUseShield, showToast }: Props) {
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);

  function handleDrink(count: number) {
    onDrink(count);
    showToast(`🍺 +${count} gole${count !== 1 ? 's' : ''}!`);
  }

  function handleShield() {
    onUseShield();
    showToast('Escudo usado! Dose pulada 🛡️');
  }

  return (
    <section className="px-4 py-4">
      <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--accent)' }}>Casas</h2>
      <div className="grid grid-cols-3 gap-2">
        {playableSpaces.map(space => (
          <button key={space.id} onClick={() => setActiveSpace(space)}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-700 active:scale-95 transition-transform min-h-[5rem]"
            style={{ backgroundColor: `${space.color}18` }}>
            <ImageWithFallback src={space.sprite_url} alt={space.name}
              fallbackChar={space.name_pt[0]} fallbackColor={space.color}
              className="w-10 h-10 object-contain" />
            <span className="text-xs font-medium text-gray-200 text-center leading-tight">{space.name_pt}</span>
          </button>
        ))}
      </div>

      {activeSpace && (
        <SpaceModal space={activeSpace} multiplier={multiplier} hasShield={hasShield}
          onDrink={handleDrink} onUseShield={handleShield} onClose={() => setActiveSpace(null)} />
      )}
    </section>
  );
}
