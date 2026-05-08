interface Props {
  multiplier: number;
  characterName?: string;
  onDrink: (count: number) => void;
  onStarChange: (delta: number) => void;
  showToast: (msg: string) => void;
  onActivity?: (emoji: string, msg: string) => void;
}

const starEvents = [
  { emoji: '⭐', label: 'Comprei estrela',  base: 2, starDelta:  1, description: 'Comprou a estrela' },
  { emoji: '💀', label: 'Estrela roubada',  base: 3, starDelta: -1, description: 'Boo, Bowser, Chance Time...' },
  { emoji: '😭', label: 'Passei sem grana', base: 4, starDelta:  0, description: 'Sem as 20 moedas' },
];

export function StarsSection({ multiplier, characterName, onDrink, onStarChange, showToast, onActivity }: Props) {
  function handle(ev: typeof starEvents[number]) {
    const count = ev.base * multiplier;
    onDrink(count);
    if (ev.starDelta !== 0) onStarChange(ev.starDelta);
    const starMsg = ev.starDelta > 0 ? ' ⭐+1' : ev.starDelta < 0 ? ' ⭐-1' : '';
    showToast(`${ev.emoji} ${ev.label}: 🍺 ${count} gole${count !== 1 ? 's' : ''}${starMsg}`);
    if (characterName) {
      onActivity?.(ev.emoji, `${characterName}: ${ev.label} — ${count} gole${count !== 1 ? 's' : ''}${starMsg}`);
    }
  }

  return (
    <section className="px-4 py-4">
      <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--accent)' }}>Estrelas</h2>
      <div className="flex flex-col gap-2">
        {starEvents.map(ev => {
          const count = ev.base * multiplier;
          return (
            <button key={ev.label} onClick={() => handle(ev)}
              className="flex items-center gap-3 w-full px-4 py-4 rounded-2xl bg-gray-800 border border-gray-700 active:scale-[0.98] transition-transform text-left">
              <span className="text-2xl shrink-0">{ev.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">{ev.label}</div>
                <div className="text-xs text-gray-400">{ev.description}</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-lg font-bold text-white">{count}</div>
                <div className="text-xs text-gray-400">gole{count !== 1 ? 's' : ''}</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
