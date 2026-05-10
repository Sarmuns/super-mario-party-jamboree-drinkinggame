import { useState } from 'react';
import type { RoomPlayer } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface Props {
  roomPlayers: RoomPlayer[];
  myPlayerId: string;
  multiplier: number;
  onConfirm: (victimId: string, victimName: string, drinks: number) => void;
  onClose: () => void;
}

export function BooModal({ roomPlayers, myPlayerId, multiplier, onConfirm, onClose }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const others = roomPlayers.filter(p => p.playerId !== myPlayerId && p.characterId);
  const drinks = 3 * multiplier;
  const selected = others.find(p => p.playerId === selectedId);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/75" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-end md:justify-center md:p-4">
        <div className="bg-gray-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-md shadow-2xl border-t-[3px]"
          style={{ borderColor: 'var(--accent)' }}>

          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-600" />
          </div>

          <div className="px-5 pb-6 pt-3 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl bg-gray-700 shrink-0">👻</div>
              <div>
                <div className="text-base font-bold text-white">Roubou Estrela!</div>
                <div className="text-xs text-gray-400">Você ganha +1⭐ — a vítima perde -1⭐ e bebe {drinks} gole{drinks !== 1 ? 's' : ''}</div>
              </div>
            </div>

            {/* Info box */}
            <div className="rounded-2xl bg-gray-700/50 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>👻 Você</span>
                <span className="text-yellow-400 font-bold">+1⭐</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>Vítima</span>
                <span className="text-red-400 font-bold">-1⭐ +{drinks}🍺</span>
                {multiplier > 1 && (
                  <span className="text-xs text-red-400 bg-red-900/40 px-1 py-0.5 rounded-full font-bold">{multiplier}x</span>
                )}
              </div>
            </div>

            {/* Player list */}
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Selecione a vítima</div>
              {others.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">Nenhum outro jogador na sala</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {others.map(p => (
                    <button key={p.playerId} onClick={() => setSelectedId(p.playerId)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border-2 transition-all active:scale-[0.98]"
                      style={{
                        borderColor: selectedId === p.playerId ? p.characterColor : 'transparent',
                        backgroundColor: selectedId === p.playerId ? `${p.characterColor}22` : '#374151',
                      }}>
                      <div className="shrink-0 rounded-full p-0.5" style={{ background: p.characterColor }}>
                        <ImageWithFallback
                          src={p.characterIcon} alt={p.name}
                          fallbackChar={p.name[0] ?? '?'} fallbackColor={p.characterColor}
                          className="w-8 h-8 rounded-full object-contain bg-gray-900"
                        />
                      </div>
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                      {selectedId === p.playerId && (
                        <span className="ml-auto text-xs font-bold" style={{ color: p.characterColor }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-gray-700 active:scale-95 transition-transform">
                Cancelar
              </button>
              <button
                onClick={() => selected && onConfirm(selected.playerId, selected.name, drinks)}
                disabled={!selected}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white active:scale-95 transition-transform disabled:opacity-40"
                style={{ backgroundColor: 'var(--accent)' }}>
                👻 Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
