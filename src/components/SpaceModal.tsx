import { useEffect } from 'react';
import type { Space } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface Props {
  space: Space;
  isHomestretch: boolean;
  hasShield: boolean;
  onDrink: (count: number) => void;
  onUseShield: () => void;
  onClose: () => void;
}

function getDrinkCount(space: Space, isHomestretch: boolean): number | null {
  if (typeof space.drinks !== 'number') return null;
  const base = space.drinks;
  return isHomestretch ? base * 2 : base;
}

export function SpaceModal({ space, isHomestretch, hasShield, onDrink, onUseShield, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const drinkCount = getDrinkCount(space, isHomestretch);
  const isSpecialRule = typeof space.drinks !== 'number';

  function handleDrink() {
    if (drinkCount !== null && drinkCount > 0) {
      onDrink(drinkCount);
    }
    onClose();
  }

  function handleShield() {
    onUseShield();
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70"
        onClick={onClose}
      />

      {/* Bottom sheet on mobile, centered modal on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:p-4">
        <div
          className="bg-gray-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-md shadow-2xl"
          style={{ borderTop: `3px solid ${space.color}` }}
        >
          {/* Drag handle (mobile only) */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-600" />
          </div>

          {/* Close button */}
          <div className="flex justify-end px-4 pt-2">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-gray-400 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>

          <div className="px-5 pb-6 space-y-4">
            {/* Space image + name */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${space.color}30` }}
              >
                <ImageWithFallback
                  src={space.sprite_url}
                  alt={space.name}
                  fallbackChar={space.name_pt[0]}
                  fallbackColor={space.color}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{space.name_pt}</div>
                <div className="text-xs text-gray-400">{space.name}</div>
              </div>
            </div>

            {/* Game effect */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Efeito no jogo</div>
              <div className="text-sm text-gray-300">{space.effect_in_game}</div>
            </div>

            {/* Drinking rule */}
            <div
              className="rounded-2xl p-4"
              style={{ backgroundColor: `${space.color}20`, border: `1px solid ${space.color}50` }}
            >
              <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: space.color }}>
                Regra do Drinking Game
              </div>
              <div className="text-base font-semibold text-white">{space.drinking_rule}</div>

              {space.drinks_conditional && (
                <div className="mt-2 text-sm text-gray-300">
                  <span className="text-yellow-400">Condicional:</span>{' '}
                  {space.drinks_conditional.condition} →{' '}
                  <span className="font-bold text-white">
                    {typeof space.drinks_conditional.drinks === 'number'
                      ? `${isHomestretch ? space.drinks_conditional.drinks * 2 : space.drinks_conditional.drinks} goles`
                      : space.drinks_conditional.drinks}
                  </span>
                </div>
              )}

              {!isSpecialRule && drinkCount !== null && drinkCount > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Goles:</span>
                  <span className="text-2xl font-bold text-white">{drinkCount}</span>
                  {isHomestretch && (
                    <span className="text-xs text-red-400 bg-red-900/40 px-1.5 py-0.5 rounded-full font-bold">2x</span>
                  )}
                </div>
              )}

              {space.drinks_others !== undefined && (
                <div className="mt-2 text-sm text-yellow-400">
                  Outros jogadores: {space.drinks_others} gole{space.drinks_others !== 1 ? 's' : ''} cada
                </div>
              )}

              {isSpecialRule && space.id === 'vs' && (
                <div className="mt-2 text-sm text-gray-300">
                  Segue a seção de minigames abaixo.
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              {hasShield && drinkCount !== null && drinkCount > 0 && (
                <button
                  onClick={handleShield}
                  className="w-full py-4 rounded-2xl text-base font-bold text-yellow-400 border-2 border-yellow-500/60 bg-yellow-500/10 active:scale-95 transition-transform"
                >
                  Usar escudo 🛡️ — Dose pulada!
                </button>
              )}

              {!isSpecialRule && drinkCount !== null && drinkCount > 0 && (
                <button
                  onClick={handleDrink}
                  className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform"
                  style={{ backgroundColor: space.color }}
                >
                  Beber! 🍺 ({drinkCount} gole{drinkCount !== 1 ? 's' : ''})
                </button>
              )}

              {(isSpecialRule || drinkCount === 0) && (
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gray-700 active:scale-95 transition-transform"
                >
                  Fechar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
