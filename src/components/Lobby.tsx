import { useState } from 'react';
import type { RoomPlayer } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { resolvePortrait } from '../lib/characterLookup';

interface Props {
  roomCode: string;
  players: RoomPlayer[];
  isHost: boolean;
  playerId: string;
  onStart: () => void;
  onLeave: () => void;
}

export function Lobby({ roomCode, players, isHost, playerId, onStart, onLeave }: Props) {
  const canStart = players.filter(p => p.characterId).length >= 2;
  const [showQR, setShowQR] = useState(false);
  const joinUrl = `${window.location.origin}/sala/${roomCode}/select`;

  return (
    <div className="min-h-dvh bg-gray-900 flex flex-col px-4">
      <div className="pt-8 pb-2 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-1">Código da sala</div>
          <div className="text-4xl font-black text-white tracking-widest">{roomCode}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowQR(true)}
            className="text-sm text-gray-400 px-3 py-2 rounded-xl border border-gray-700 active:scale-95 transition-transform"
            title="QR Code de entrada">
            📱
          </button>
          <button onClick={onLeave} className="text-sm text-gray-500 px-3 py-2 rounded-xl border border-gray-700">
            Sair
          </button>
        </div>
      </div>

      {/* QR Code modal */}
      {showQR && (
        <>
          <div className="fixed inset-0 z-40 bg-black/80" onClick={() => setShowQR(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="bg-gray-800 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-2xl border border-gray-700 max-w-xs w-full">
              <div className="text-base font-bold text-white">Entrar na sala</div>
              <div className="bg-white p-3 rounded-2xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(joinUrl)}&size=180x180&margin=0`}
                  alt="QR Code"
                  width={180} height={180}
                />
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-white tracking-widest">{roomCode}</div>
                <div className="text-xs text-gray-400 mt-1 break-all">{joinUrl}</div>
              </div>
              <button onClick={() => setShowQR(false)}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-gray-700 active:scale-95 transition-transform">
                Fechar
              </button>
            </div>
          </div>
        </>
      )}

      <div className="text-xs text-gray-500 mb-6">
        {isHost ? 'Você é o host — aguarde os jogadores e inicie a partida.' : 'Aguardando o host iniciar...'}
      </div>

      <div className="flex-1">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Jogadores ({players.length})
        </div>
        <div className="flex flex-col gap-2">
          {players.map(p => {
            const portrait = resolvePortrait(p.characterId, p.characterPortrait || p.characterIcon);
            const color = p.characterId ? p.characterColor : '#374151';
            const hasChar = !!p.characterId;
            return (
              <div key={p.playerId}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-800 border border-gray-700">
                <div className="rounded-full p-0.5 shrink-0" style={{ background: color }}>
                  <ImageWithFallback
                    src={hasChar ? portrait : null}
                    alt={p.name || '?'}
                    fallbackChar={(p.name || '?')[0]}
                    fallbackColor={color}
                    className="w-10 h-10 rounded-full object-contain bg-gray-900"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">
                    {p.name || <span className="text-gray-500 italic">escolhendo personagem...</span>}
                  </div>
                  {p.isHost && <div className="text-xs text-yellow-400">Host</div>}
                </div>
                {p.playerId === playerId && (
                  <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">você</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isHost && (
        <div className="py-6">
          <button onClick={onStart} disabled={!canStart}
            className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent)' }}>
            {canStart ? '🎮 Começar Partida' : 'Aguardando jogadores escolherem personagem...'}
          </button>
        </div>
      )}
    </div>
  );
}
