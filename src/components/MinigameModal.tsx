import { useState } from 'react';

const FORMATS = [
  { id: 'ffa',  label: 'FFA',  description: 'Último lugar bebe +1' },
  { id: '2v2',  label: '2v2',  description: 'Dupla perdedora bebe +1 cada' },
  { id: '1v3',  label: '1v3',  description: 'Lado perdedor bebe +1 cada' },
];

// ── Modo Host ── (controla formato e encerra turno)
interface HostProps {
  mode: 'host';
  turn: number;
  multiplier: number;
  onConfirm: (drinksToAdd: number, format: string) => void;
  onClose: () => void;
}

// ── Modo Guest ── (só seleciona resultado)
interface GuestProps {
  mode: 'guest';
  turn: number;
  multiplier: number;
  hostName: string;
  format?: string;
  onConfirm: (drinksToAdd: number) => void;
  onClose: () => void;
}

type Props = HostProps | GuestProps;

export function MinigameModal(props: Props) {
  const [format, setFormat] = useState(props.mode === 'guest' ? (props.format ?? 'ffa') : 'ffa');
  const [result, setResult] = useState<'won' | 'lost' | null>(null);

  const { turn, multiplier, onClose } = props;
  const preDrink = 1 * multiplier;
  const loserDrink = 1 * multiplier;

  const selectedFormat = FORMATS.find(f => f.id === format)!;

  function confirm() {
    const total = preDrink + (result === 'lost' ? loserDrink : 0);
    if (props.mode === 'host') props.onConfirm(total, format);
    else props.onConfirm(total);
  }

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
                <div className="text-xs text-gray-400">
                  {props.mode === 'host'
                    ? `Fim do Turno ${turn}`
                    : `Turno ${turn} encerrado por ${props.hostName}`}
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-gray-400 text-lg">×</button>
            </div>

            {/* Pre-game drink */}
            <div className="rounded-2xl bg-gray-700/60 px-4 py-3 flex items-center gap-3">
              <span className="text-xl">🍺</span>
              <div>
                <div className="text-sm font-semibold text-white">Antes de jogar</div>
                <div className="text-xs text-gray-400">
                  Todo mundo bebe {preDrink} gole{preDrink !== 1 ? 's' : ''}{multiplier > 1 ? ` (${multiplier}x)` : ''}
                </div>
              </div>
            </div>

            {/* Formato — host seleciona, guest vê somente */}
            <div>
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">Formato</div>
              {props.mode === 'host' ? (
                <>
                  <div className="flex gap-2">
                    {FORMATS.map(f => (
                      <button key={f.id} onClick={() => setFormat(f.id)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border"
                        style={format === f.id
                          ? { backgroundColor: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                          : { backgroundColor: '#374151', color: '#9ca3af', borderColor: 'transparent' }}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">{selectedFormat.description}</div>
                </>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-gray-700/60 text-sm text-gray-300">
                  <span className="font-bold text-white">{selectedFormat.label}</span> — {selectedFormat.description}
                </div>
              )}
            </div>

            {/* Resultado */}
            <div>
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">Seu resultado</div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setResult('won')}
                  className="py-4 rounded-2xl text-sm font-bold border-2 transition-all active:scale-95"
                  style={result === 'won'
                    ? { backgroundColor: '#166534', borderColor: '#22c55e', color: '#86efac' }
                    : { backgroundColor: '#1f2937', borderColor: '#374151', color: '#9ca3af' }}>
                  🏆 Ganhei
                </button>
                <button onClick={() => setResult('lost')}
                  className="py-4 rounded-2xl text-sm font-bold border-2 transition-all active:scale-95"
                  style={result === 'lost'
                    ? { backgroundColor: '#7f1d1d', borderColor: '#ef4444', color: '#fca5a5' }
                    : { backgroundColor: '#1f2937', borderColor: '#374151', color: '#9ca3af' }}>
                  😅 Perdi
                </button>
              </div>
              {result === 'lost' && (
                <div className="text-xs text-red-400 mt-2 text-center">
                  +{loserDrink} gole{loserDrink !== 1 ? 's' : ''} de perdedor
                </div>
              )}
            </div>

            {result && (
              <button onClick={confirm}
                className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform"
                style={{ backgroundColor: 'var(--accent)' }}>
                {props.mode === 'host' ? 'Confirmar e encerrar turno' : 'Confirmar'}
                {' '}({preDrink + (result === 'lost' ? loserDrink : 0)} gole{(preDrink + (result === 'lost' ? loserDrink : 0)) !== 1 ? 's' : ''})
              </button>
            )}

            {!result && (
              <button onClick={onClose}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-gray-700/60 active:scale-95 transition-transform">
                {props.mode === 'host' ? 'Pular minigame' : 'Fechar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
