import { useState } from 'react';
import type { RoomPlayer } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface Props {
  roomPlayers?: RoomPlayer[];
  myPlayerId?: string;
  multiplier: number;
  onConfirm: (booType: 'star' | 'coin', victimId: string, victimName: string) => void;
  onClose: () => void;
}

export function BooModal({ roomPlayers, myPlayerId, multiplier, onConfirm, onClose }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const others = (roomPlayers ?? []).filter(p => p.playerId !== myPlayerId && p.characterId);
  const isRoomMode = others.length > 0;
  const selected = others.find(p => p.playerId === selectedId);
  const starDrinks = 3 * multiplier;
  const coinDrinks = 1 * multiplier;

  const victimId = selected?.playerId ?? '';
  const victimName = selected?.name ?? '';

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
                <div className="text-base font-bold text-white">Boo!</div>
                <div className="text-xs text-gray-400">O que o Boo roubou?</div>
              </div>
            </div>

            {/* Victim list — room mode only */}
            {isRoomMode && (
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Selecione a vítima</div>
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
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onConfirm('star', victimId, victimName)}
                disabled={isRoomMode && !selected}
                className="py-4 rounded-2xl border-2 border-yellow-500/50 bg-yellow-900/20 active:scale-95 transition-transform disabled:opacity-40 space-y-0.5">
                <div className="text-xl">⭐</div>
                <div className="text-xs font-bold text-yellow-400">Roubou Estrela</div>
                <div className="text-xs text-gray-400">você +1⭐</div>
                <div className="text-xs text-gray-400">vítima −1⭐ +{starDrinks}🍺</div>
              </button>
              <button
                onClick={() => onConfirm('coin', victimId, victimName)}
                disabled={isRoomMode && !selected}
                className="py-4 rounded-2xl border-2 border-orange-500/50 bg-orange-900/20 active:scale-95 transition-transform disabled:opacity-40 space-y-0.5">
                <div className="text-xl">🪙</div>
                <div className="text-xs font-bold text-orange-400">Roubou Dinheiro</div>
                <div className="text-xs text-gray-400">sem mudança de ⭐</div>
                <div className="text-xs text-gray-400">vítima bebe +{coinDrinks}🍺</div>
              </button>
            </div>

            <button onClick={onClose}
              className="w-full py-2.5 rounded-2xl text-sm font-semibold text-gray-400 bg-gray-700 active:scale-95 transition-transform">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
