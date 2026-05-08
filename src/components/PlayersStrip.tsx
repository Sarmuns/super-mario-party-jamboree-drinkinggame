import type { RoomPlayer } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { resolvePortrait } from '../lib/characterLookup';

interface Props {
  players: RoomPlayer[];
  myPlayerId: string;
}

export function PlayersStrip({ players, myPlayerId }: Props) {
  const others = players.filter(p => p.playerId !== myPlayerId && p.characterId);
  if (others.length === 0) return null;

  return (
    <div className="border-b border-gray-800 bg-gray-900/80 px-3 py-2">
      <div className="flex gap-3 overflow-x-auto pb-0.5">
        {others.map(p => (
          <div key={p.playerId} className="flex items-center gap-2 shrink-0 bg-gray-800/60 rounded-xl px-2.5 py-1.5">
            <div className="rounded-full p-0.5 shrink-0" style={{ background: p.characterColor }}>
              <ImageWithFallback
                src={resolvePortrait(p.characterId, p.characterPortrait)}
                alt={p.name}
                fallbackChar={(p.name || '?')[0]}
                fallbackColor={p.characterColor}
                className="w-7 h-7 rounded-full object-contain bg-gray-900"
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate max-w-[60px] leading-none mb-0.5">
                {p.name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span>🍺<span className="font-bold text-white ml-0.5">{p.totalDrinks}</span></span>
                <span>⭐<span className="font-bold text-white ml-0.5">{p.stars}</span></span>
                {p.hasShield && <span title="Tem escudo">🛡️</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
