import { useState } from 'react';
import { t } from '../lib/labels';

interface StarEvent {
  emoji: string;
  label: string;
  description: string;
  base: number;
  starDelta: number;
}

const starEvents: StarEvent[] = t.starsSection.events.map((ev, i) => ({
  emoji: ['⭐', '💀', '😭'][i],
  label: ev.label,
  description: ev.description,
  base: [2, 3, 4][i],
  starDelta: [1, -1, 0][i],
}));

interface Props {
  multiplier: number;
  characterName?: string;
  onDrink: (count: number) => void;
  onStarChange: (delta: number) => void;
  showToast: (msg: string) => void;
  onActivity?: (emoji: string, msg: string) => void;
  onShowBoo?: () => void;
  onShowDuel?: () => void;
}

export function StarsSection({ multiplier, onDrink, onStarChange, showToast, onActivity, onShowBoo, onShowDuel }: Props) {
  const [pending, setPending] = useState<StarEvent | null>(null);

  function confirm() {
    if (!pending) return;
    const count = pending.base * multiplier;
    onDrink(count);
    if (pending.starDelta !== 0) onStarChange(pending.starDelta);

    const starNote = pending.starDelta > 0 ? ' ⭐+1' : pending.starDelta < 0 ? ' ⭐-1' : '';
    showToast(`${pending.emoji} ${pending.label}: 🍺 ${count} ${t.common.goles(count)}${starNote}`);
    onActivity?.(pending.emoji, `${pending.label} — bebeu ${count} ${t.common.goles(count)}${starNote}`);
    setPending(null);
  }

  return (
    <section className="px-4 py-4">
      <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--accent)' }}>{t.starsSection.title}</h2>
      <div className="flex flex-col gap-2">
        {starEvents.map(ev => {
          const count = ev.base * multiplier;
          return (
            <button key={ev.label} onClick={() => setPending(ev)}
              className="flex items-center gap-3 w-full px-4 py-4 rounded-2xl bg-gray-800 border border-gray-700 active:scale-[0.98] transition-transform text-left">
              <span className="text-2xl shrink-0">{ev.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">{ev.label}</div>
                <div className="text-xs text-gray-400">{ev.description}</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-lg font-bold text-white">{count}</div>
                <div className="text-xs text-gray-400">{t.common.goles(count)}</div>
              </div>
            </button>
          );
        })}
      </div>

      {(onShowBoo || onShowDuel) && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {onShowBoo && (
            <button onClick={onShowBoo}
              className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-gray-800 border border-gray-700 active:scale-[0.98] transition-transform">
              <span className="text-xl shrink-0">👻</span>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-white leading-tight">{t.starsSection.boo}</div>
                <div className="text-[10px] text-gray-400 leading-tight">{t.starsSection.booSubtitle}</div>
              </div>
            </button>
          )}
          {onShowDuel && (
            <button onClick={onShowDuel}
              className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-gray-800 border border-gray-700 active:scale-[0.98] transition-transform">
              <span className="text-xl shrink-0">⚔️</span>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-white leading-tight">{t.starsSection.duel}</div>
                <div className="text-[10px] text-gray-400 leading-tight">{t.starsSection.duelSubtitle}</div>
              </div>
            </button>
          )}
        </div>
      )}

      {pending && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70" onClick={() => setPending(null)} />
          <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:p-4">
            <div className="bg-gray-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-md shadow-2xl border-t-[3px]"
              style={{ borderColor: 'var(--accent)' }}>

              <div className="flex justify-center pt-3 pb-1 md:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-600" />
              </div>

              <div className="px-5 pb-6 pt-3 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-4xl shrink-0 bg-gray-700">
                    {pending.emoji}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{pending.label}</div>
                    <div className="text-xs text-gray-400">{pending.description}</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-700/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🍺</span>
                      <span className="text-sm font-bold text-white">{t.starsSection.youDrink}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-black text-white">{pending.base * multiplier}</span>
                      <span className="text-xs text-gray-400">{t.starsSection.goles}</span>
                      {multiplier > 1 && (
                        <span className="text-xs text-red-400 bg-red-900/40 px-1 py-0.5 rounded-full font-bold ml-1">{multiplier}x</span>
                      )}
                    </div>
                  </div>
                  {pending.starDelta !== 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⭐</span>
                        <span className="text-sm text-gray-300">{t.starsSection.starsLabel}</span>
                      </div>
                      <span className={`text-sm font-bold ${pending.starDelta > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {pending.starDelta > 0 ? '+1' : '-1'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setPending(null)}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-gray-700 active:scale-95 transition-transform">
                    {t.common.cancel}
                  </button>
                  <button onClick={confirm}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold text-white active:scale-95 transition-transform"
                    style={{ backgroundColor: 'var(--accent)' }}>
                    {t.common.confirm}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
