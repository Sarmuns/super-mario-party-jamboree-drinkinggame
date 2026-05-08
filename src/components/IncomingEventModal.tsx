import type { RoomEvent } from '../types';

interface Props {
  event: RoomEvent;
  hasShield: boolean;
  multiplier: number;
  onDrink: (count: number) => void;
  onUseShield: () => void;
  onDismiss: () => void;
}

export function IncomingEventModal({ event, hasShield, multiplier, onDrink, onUseShield, onDismiss }: Props) {
  const drinks = event.drinks * multiplier;

  function handleDrink() { onDrink(drinks); onDismiss(); }
  function handleShield() { onUseShield(); onDismiss(); }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/80" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="fade-in bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl border-2 border-yellow-500/50 overflow-hidden">

          <div className="bg-yellow-500/10 px-6 pt-6 pb-4 text-center">
            <div className="text-4xl mb-2">🍺</div>
            <div className="text-base font-bold text-yellow-400 mb-1">{event.message}</div>
            <div className="text-xs text-gray-400">
              {event.type === 'drinks_all' ? 'Todo mundo bebe!' : 'Você precisa beber!'}
            </div>
          </div>

          <div className="px-6 py-4 text-center">
            <div className="text-5xl font-black text-white mb-1">{drinks}</div>
            <div className="text-sm text-gray-400">gole{drinks !== 1 ? 's' : ''}{multiplier > 1 ? ` (${multiplier}x)` : ''}</div>
          </div>

          <div className="px-6 pb-6 flex flex-col gap-3">
            {hasShield && (
              <button onClick={handleShield}
                className="w-full py-4 rounded-2xl text-base font-bold text-yellow-400 border-2 border-yellow-500/60 bg-yellow-500/10 active:scale-95 transition-transform">
                Usar escudo 🛡️ — Dose pulada!
              </button>
            )}
            <button onClick={handleDrink}
              className="w-full py-4 rounded-2xl text-base font-bold text-white bg-yellow-600 active:scale-95 transition-transform">
              Bebi! ✓ ({drinks} gole{drinks !== 1 ? 's' : ''})
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
