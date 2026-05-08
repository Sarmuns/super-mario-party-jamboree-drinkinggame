import { useState } from 'react';

interface Props {
  turn: number;
  multiplier: number;
  onConfirm: (drinksToAdd: number) => void;
  onClose: () => void;
}

const FORMATS = [
  { id: 'ffa',  label: 'FFA',  description: 'Último lugar bebe +1' },
  { id: '2v2',  label: '2v2',  description: 'Dupla perdedora bebe +1 cada' },
  { id: '1v3',  label: '1v3',  description: 'Lado perdedor bebe +1 cada' },
];

export function MinigameModal({ turn, multiplier, onConfirm, onClose }: Props) {
  const [format, setFormat] = useState('ffa');
  const [result, setResult] = useState<'won' | 'lost' | null>(null);

  const preDrink = 1 * multiplier;
  const loserDrink = 1 * multiplier;

  function confirm() {
    const total = preDrink + (result === 'lost' ? loserDrink : 0);
    onConfirm(total);
  }

  const selectedFormat = FORMATS.find(f => f.id === format)!;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/75" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:p-4">
        <div className="bg-gray-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-md shadow-2xl"
          style={{ borderTop: '3px solid var(--accent)' }}>

          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-600" />
          </div>

          <div className="px-5 pb-6 pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-white">🎮 Minigame</div>
                <div className="text-xs text-gray-400">Fim do Turno {turn}</div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-gray-400 text-lg">×</button>
            </div>

            {/* Pre-game drink */}
            <div className="rounded-2xl bg-gray-700/60 px-4 py-3 flex items-center gap-3">
              <span className="text-xl">🍺</span>
              <div>
                <div className="text-sm font-semibold text-white">Antes de jogar</div>
                <div className="text-xs text-gray-400">Todo mundo bebe {preDrink} gole{preDrink !== 1 ? 's' : ''}{multiplier > 1 ? ` (${multiplier}x)` : ''}</div>
              </div>
            </div>

            {/* Format selector */}
            <div>
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">Formato</div>
              <div className="flex gap-2">
                {FORMATS.map(f => (
                  <button key={f.id} onClick={() => setFormat(f.id)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border"
                    style={format === f.id
                      ? { backgroundColor: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                      : { backgroundColor: '#374151', color: '#9ca3af', borderColor: 'transparent' }
                    }>
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-2">{selectedFormat.description}</div>
            </div>

            {/* Result */}
            <div>
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">Resultado</div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setResult('won')}
                  className="py-4 rounded-2xl text-sm font-bold border-2 transition-all active:scale-95"
                  style={result === 'won'
                    ? { backgroundColor: '#166534', borderColor: '#22c55e', color: '#86efac' }
                    : { backgroundColor: '#1f2937', borderColor: '#374151', color: '#9ca3af' }
                  }>
                  🏆 Ganhei
                </button>
                <button onClick={() => setResult('lost')}
                  className="py-4 rounded-2xl text-sm font-bold border-2 transition-all active:scale-95"
                  style={result === 'lost'
                    ? { backgroundColor: '#7f1d1d', borderColor: '#ef4444', color: '#fca5a5' }
                    : { backgroundColor: '#1f2937', borderColor: '#374151', color: '#9ca3af' }
                  }>
                  😅 Perdi
                </button>
              </div>
              {result === 'lost' && (
                <div className="text-xs text-red-400 mt-2 text-center">
                  +{loserDrink} gole{loserDrink !== 1 ? 's' : ''} de perdedor
                </div>
              )}
            </div>

            {/* Summary + confirm */}
            {result && (
              <button onClick={confirm}
                className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform"
                style={{ backgroundColor: 'var(--accent)' }}>
                Beber {preDrink + (result === 'lost' ? loserDrink : 0)} gole{(preDrink + (result === 'lost' ? loserDrink : 0)) !== 1 ? 's' : ''} e avançar turno
              </button>
            )}

            {!result && (
              <button onClick={onClose}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-gray-700/60 active:scale-95 transition-transform">
                Pular minigame
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
