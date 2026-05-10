import { useState } from 'react';
import type { RoomPlayer } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

type Phase = 'select' | 'result';

interface Props {
  roomPlayers?: RoomPlayer[];
  myPlayerId?: string;
  multiplier: number;
  onChallenge: (opponentId: string, opponentName: string) => void;
  onResult: (lost: boolean, opponentId: string, opponentName: string) => void;
  onClose: () => void;
}

const CPU_ID = '__cpu__';

export function DuelModal({ roomPlayers, myPlayerId, multiplier, onChallenge, onResult, onClose }: Props) {
  const others = (roomPlayers ?? []).filter(p => p.playerId !== myPlayerId && p.characterId);
  const hasPeers = others.length > 0;

  // Start at 'select' if there are real players to choose; jump straight to 'result' if offline
  const [phase, setPhase] = useState<Phase>(hasPeers ? 'select' : 'result');
  const [selectedId, setSelectedId] = useState<string | null>(hasPeers ? null : CPU_ID);
  const [selectedName, setSelectedName] = useState<string>(hasPeers ? '' : 'oponente');

  const preDrink = 1 * multiplier;
  const loserDrinks = 2 * multiplier;

  const cpuOption: Pick<RoomPlayer, 'playerId' | 'name' | 'characterColor' | 'characterIcon'> = {
    playerId: CPU_ID,
    name: 'CPU / Outro',
    characterColor: '#6b7280',
    characterIcon: '',
  };

  function selectPlayer(id: string, name: string) {
    setSelectedId(id);
    setSelectedName(name);
  }

  function handleChallenge() {
    if (!selectedId) return;
    onChallenge(selectedId, selectedName);
    setPhase('result');
  }

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
            {phase === 'select' ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl bg-gray-700 shrink-0">⚔️</div>
                  <div>
                    <div className="text-base font-bold text-white">Duelo!</div>
                    <div className="text-xs text-gray-400">Ambos bebem {preDrink} antes. Perdedor bebe +{loserDrinks}</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-700/50 p-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Pré-duelo (ambos)</span>
                    <span className="text-white font-bold">{preDrink} 🍺</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Perdedor bebe</span>
                    <span className="text-red-400 font-bold">+{loserDrinks} 🍺</span>
                  </div>
                  {multiplier > 1 && (
                    <div className="text-xs text-red-400 text-right">multiplicador {multiplier}x ativo</div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Selecione o oponente</div>
                  <div className="flex flex-col gap-2">
                    {others.map(p => (
                      <button key={p.playerId} onClick={() => selectPlayer(p.playerId, p.name)}
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
                    {/* CPU / Outro */}
                    <button onClick={() => selectPlayer(CPU_ID, cpuOption.name)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border-2 transition-all active:scale-[0.98]"
                      style={{
                        borderColor: selectedId === CPU_ID ? '#6b7280' : 'transparent',
                        backgroundColor: selectedId === CPU_ID ? '#6b728022' : '#374151',
                      }}>
                      <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-lg shrink-0">🤖</div>
                      <span className="text-sm font-semibold text-gray-300">{cpuOption.name}</span>
                      {selectedId === CPU_ID && (
                        <span className="ml-auto text-xs font-bold text-gray-400">✓</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={onClose}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-gray-700 active:scale-95 transition-transform">
                    Cancelar
                  </button>
                  <button
                    onClick={handleChallenge}
                    disabled={!selectedId}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold text-white active:scale-95 transition-transform disabled:opacity-40"
                    style={{ backgroundColor: 'var(--accent)' }}>
                    ⚔️ Desafiar — {preDrink}🍺
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl bg-gray-700 shrink-0">⚔️</div>
                  <div>
                    <div className="text-base font-bold text-white">Resultado do Duelo</div>
                    <div className="text-xs text-gray-400">vs {selectedName}</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-700/50 p-3 text-sm text-gray-400 text-center">
                  Perdedor bebe <span className="text-red-400 font-bold">+{loserDrinks} goles</span>
                  {multiplier > 1 && <span className="text-red-400"> ({multiplier}x)</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => onResult(false, selectedId ?? '', selectedName)}
                    className="py-4 rounded-2xl text-sm font-bold border-2 border-green-500/50 bg-green-900/20 text-green-400 active:scale-95 transition-transform">
                    🏆 Ganhei
                  </button>
                  <button onClick={() => onResult(true, selectedId ?? '', selectedName)}
                    className="py-4 rounded-2xl text-sm font-bold border-2 border-red-500/50 bg-red-900/20 text-red-400 active:scale-95 transition-transform">
                    😅 Perdi +{loserDrinks}🍺
                  </button>
                </div>

                <button onClick={onClose}
                  className="w-full py-2.5 rounded-2xl text-xs font-semibold text-gray-500 bg-gray-700/60 active:scale-95 transition-transform">
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
