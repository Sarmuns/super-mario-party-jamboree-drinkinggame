interface Props {
  hasShield: boolean;
  multiplier: number;
  onRoll1: () => void;
  onRoll10: () => void;
}

export function DiceSection({ hasShield, multiplier, onRoll1, onRoll10 }: Props) {
  const roll10Drinks = 1 * multiplier;
  return (
    <section className="px-4 py-4">
      <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--accent)' }}>Dado</h2>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onRoll1}
          className="flex flex-col items-center gap-1.5 py-5 px-3 rounded-2xl border-2 active:scale-95 transition-transform"
          style={{ borderColor: hasShield ? '#eab308' : '#374151', backgroundColor: hasShield ? '#eab30820' : '#1f2937' }}>
          <span className="text-3xl">🛡️</span>
          <span className="text-sm font-bold text-white">Tirei 1</span>
          <span className="text-xs text-gray-400">{hasShield ? 'Já tem escudo!' : 'Ativa escudo'}</span>
        </button>

        <button onClick={onRoll10}
          className="flex flex-col items-center gap-1.5 py-5 px-3 rounded-2xl border-2 border-gray-700 bg-gray-800 active:scale-95 transition-transform">
          <span className="text-3xl">🎰</span>
          <span className="text-sm font-bold text-white">Tirei 10</span>
          <span className="text-xs text-gray-400">{roll10Drinks} gole{roll10Drinks !== 1 ? 's' : ''}{multiplier > 1 ? ` (${multiplier}x)` : ''}</span>
        </button>
      </div>
    </section>
  );
}
