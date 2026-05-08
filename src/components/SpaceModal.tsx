import { useEffect } from 'react';
import type { Space, RoomEvent } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface Props {
  space: Space;
  multiplier: number;
  hasShield: boolean;
  characterName?: string;
  roomPlayerId?: string;
  isRoomMode?: boolean;
  onDrink: (count: number) => void;
  onUseShield: () => void;
  onClose: () => void;
  onBroadcast?: (event: RoomEvent) => void;
}

export function SpaceModal({
  space, multiplier, hasShield,
  characterName, roomPlayerId, isRoomMode,
  onDrink, onUseShield, onClose, onBroadcast,
}: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Quanto EU bebo
  const selfBase = typeof space.drinks === 'number' ? space.drinks : 0;
  const selfDrinks = selfBase * multiplier;

  // Quanto OS OUTROS bebem
  const othersBase = space.drinks_others ?? (space.drinks_all && selfBase > 0 ? selfBase : 0);
  const othersDrinks = typeof othersBase === 'number' ? othersBase * multiplier : 0;

  // É evento especial (VS Space etc.)
  const isSpecialRule = typeof space.drinks === 'string';

  function fireBroadcast() {
    if (!onBroadcast || !characterName) return;
    const type = space.drinks_all ? 'drinks_all' : 'drinks_others';
    const drinks = space.drinks_all
      ? selfBase  // all drink the same base amount
      : (space.drinks_others ?? 1);
    onBroadcast({
      type,
      fromPlayerId: roomPlayerId ?? '',
      fromPlayerName: characterName,
      message: `${characterName} caiu na ${space.name_pt}!`,
      drinks,
    });
  }

  function handleConfirm() {
    if (selfDrinks > 0) onDrink(selfDrinks);
    fireBroadcast();
    onClose();
  }

  function handleShield() {
    onUseShield();
    fireBroadcast(); // outros ainda bebem mesmo se usar escudo
    onClose();
  }

  const hasCollectiveEffect = !!space.drinks_all || space.drinks_others !== undefined;
  const notifiesOthers = isRoomMode && hasCollectiveEffect && !!onBroadcast;

  // Texto do botão de confirmação
  function confirmLabel() {
    if (selfDrinks > 0 && notifiesOthers) return `Beber ${selfDrinks} e notificar sala 🔔`;
    if (selfDrinks > 0) return `Beber! 🍺 (${selfDrinks} gole${selfDrinks !== 1 ? 's' : ''})`;
    if (notifiesOthers) return `Confirmar — notificar outros 🔔`;
    return 'Confirmar';
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:p-4">
        <div className="bg-gray-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-md shadow-2xl"
          style={{ borderTop: `3px solid ${space.color}` }}>

          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-600" />
          </div>
          <div className="flex justify-end px-4 pt-2">
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-gray-400 text-lg">×</button>
          </div>

          <div className="px-5 pb-6 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${space.color}30` }}>
                <ImageWithFallback src={space.sprite_url} alt={space.name}
                  fallbackChar={space.name_pt[0]} fallbackColor={space.color}
                  className="w-12 h-12 object-contain" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{space.name_pt}</div>
                <div className="text-xs text-gray-400">{space.name}</div>
              </div>
            </div>

            {/* Efeito no jogo */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Efeito no jogo</div>
              <div className="text-sm text-gray-300">{space.effect_in_game}</div>
            </div>

            {/* Regra */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: `${space.color}20`, border: `1px solid ${space.color}50` }}>
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
                      ? `${(space.drinks_conditional.drinks as number) * multiplier} goles`
                      : space.drinks_conditional.drinks}
                  </span>
                </div>
              )}
            </div>

            {/* Consequências explícitas */}
            {!isSpecialRule && (selfDrinks > 0 || othersDrinks > 0) && (
              <div className="rounded-2xl bg-gray-700/50 p-4 space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Consequências</div>

                {selfDrinks > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🍺</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">Você bebe</div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-white">{selfDrinks}</span>
                      <span className="text-xs text-gray-400 ml-1">gole{selfDrinks !== 1 ? 's' : ''}</span>
                      {multiplier > 1 && (
                        <span className="ml-1 text-xs text-red-400 bg-red-900/40 px-1 py-0.5 rounded-full font-bold">{multiplier}x</span>
                      )}
                    </div>
                  </div>
                )}

                {selfDrinks === 0 && (space.drinks_all === undefined || !space.drinks_all) && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    <div className="text-sm text-gray-400">Você não bebe</div>
                  </div>
                )}

                {othersDrinks > 0 && (
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-600">
                    <span className="text-xl">👥</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">
                        {space.drinks_all ? 'Todo mundo bebe' : 'Os outros bebem'}
                      </div>
                      {notifiesOthers && (
                        <div className="text-xs text-yellow-400">🔔 Eles vão receber uma notificação</div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-white">{othersDrinks}</span>
                      <span className="text-xs text-gray-400 ml-1">gole{othersDrinks !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VS Space */}
            {isSpecialRule && (
              <div className="rounded-2xl bg-gray-700/50 p-4 text-sm text-gray-300">
                Segue as regras de minigame. Use o botão <strong className="text-white">Fim do Turno</strong> para registrar.
              </div>
            )}

            {/* Botões */}
            <div className="flex flex-col gap-3">
              {/* Escudo (só para espaços que EU bebo) */}
              {hasShield && selfDrinks > 0 && (
                <button onClick={handleShield}
                  className="w-full py-4 rounded-2xl text-base font-bold text-yellow-400 border-2 border-yellow-500/60 bg-yellow-500/10 active:scale-95 transition-transform">
                  Usar escudo 🛡️ — {notifiesOthers ? 'Pulei, mas vou notificar os outros' : 'Dose pulada!'}
                </button>
              )}

              {/* Botão principal de confirmação */}
              {!isSpecialRule && (selfDrinks > 0 || hasCollectiveEffect) && (
                <button onClick={handleConfirm}
                  className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform"
                  style={{ backgroundColor: space.color }}>
                  {confirmLabel()}
                </button>
              )}

              {/* Fechar (sem consequência) */}
              {(isSpecialRule || (selfDrinks === 0 && !hasCollectiveEffect)) && (
                <button onClick={onClose}
                  className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gray-700 active:scale-95 transition-transform">
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
