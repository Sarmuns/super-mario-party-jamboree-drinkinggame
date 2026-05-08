import type { RoomPlayer } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface Props {
  players: RoomPlayer[];
  playerId: string;
  roomCode: string;
  onClose: () => void;
}

export function PlayersOverlay({ players, playerId, roomCode, onClose }: Props) {
  const sorted = [...players].sort((a, b) => b.totalDrinks - a.totalDrinks);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:p-4">
        <div className="bg-gray-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-md shadow-2xl"
          style={{ borderTop: '3px solid var(--accent)' }}>

          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-600" />
          </div>

          <div className="px-5 pt-2 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-base font-bold text-white">Jogadores</div>
                <div className="text-xs text-gray-500">Sala {roomCode}</div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-gray-400 text-lg">×</button>
            </div>

            <div className="flex flex-col gap-2">
              {sorted.map((p, i) => (
                <div key={p.playerId}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ backgroundColor: p.playerId === playerId ? `${p.characterColor}20` : '#1f2937' }}>
                  <div className="text-lg font-bold text-gray-500 w-6 text-center">{i + 1}</div>
                  <div className="rounded-full p-0.5 shrink-0" style={{ background: p.characterColor }}>
                    <ImageWithFallback
                      src={p.characterIcon} alt={p.name}
                      fallbackChar={p.name[0]} fallbackColor={p.characterColor}
                      className="w-8 h-8 rounded-full object-contain bg-gray-900"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {p.name} {p.playerId === playerId && <span className="text-xs text-gray-400">(você)</span>}
                    </div>
                    <div className="text-xs text-gray-400">⭐ {p.stars} • {p.isHost ? 'Host' : 'Guest'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-black" style={{ color: p.characterColor }}>{p.totalDrinks}</div>
                    <div className="text-xs text-gray-500">goles</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
