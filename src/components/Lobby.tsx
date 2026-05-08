import type { RoomPlayer } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface Props {
  roomCode: string;
  players: RoomPlayer[];
  isHost: boolean;
  playerId: string;
  onStart: () => void;
  onLeave: () => void;
}

export function Lobby({ roomCode, players, isHost, playerId, onStart, onLeave }: Props) {
  const canStart = players.length >= 2;

  return (
    <div className="min-h-dvh bg-gray-900 flex flex-col px-4">
      <div className="pt-8 pb-2 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-1">Código da sala</div>
          <div className="text-4xl font-black text-white tracking-widest">{roomCode}</div>
        </div>
        <button onClick={onLeave} className="text-sm text-gray-500 px-3 py-2 rounded-xl border border-gray-700">
          Sair
        </button>
      </div>

      <div className="text-xs text-gray-500 mb-6">
        {isHost ? 'Você é o host — aguarde os jogadores e inicie a partida.' : 'Aguardando o host iniciar...'}
      </div>

      <div className="flex-1">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Jogadores ({players.length})
        </div>
        <div className="flex flex-col gap-2">
          {players.map(p => (
            <div key={p.playerId}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-800 border border-gray-700">
              <div className="rounded-full p-0.5 shrink-0" style={{ background: p.characterColor }}>
                <ImageWithFallback
                  src={p.characterIcon} alt={p.name}
                  fallbackChar={p.name[0]} fallbackColor={p.characterColor}
                  className="w-10 h-10 rounded-full object-contain bg-gray-900"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">{p.name}</div>
                {p.isHost && <div className="text-xs text-yellow-400">Host</div>}
              </div>
              {p.playerId === playerId && (
                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">você</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {isHost && (
        <div className="py-6">
          <button
            onClick={onStart}
            disabled={!canStart}
            className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent)' }}>
            {canStart ? '🎮 Começar Partida' : 'Aguardando mais jogadores...'}
          </button>
        </div>
      )}
    </div>
  );
}
