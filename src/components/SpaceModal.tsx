import { useEffect, useState } from 'react';
import type { Space, RoomEvent } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { t } from '../lib/labels';

const SPACE_EMOJI: Record<string, string> = {
  blue: '🔵', red: '🔴', lucky: '🍀', unlucky: '💜',
  event: '🎪', item: '🎁', bowser: '👹', chance_time: '🎲', vs: '⚔️',
};

interface Props {
  space: Space;
  multiplier: number;
  hasShield: boolean;
  characterName?: string;
  characterColor?: string;
  roomPlayerId?: string;
  isRoomMode?: boolean;
  onDrink: (count: number) => void;
  onUseShield: () => void;
  onClose: () => void;
  onBroadcast?: (event: RoomEvent) => void;
  // log local sem broadcast de activity (evita race condition com IncomingEventModal)
  onLogLocal?: (emoji: string, message: string) => void;
  // log + broadcast activity (para casas pessoais que notificam via toast)
  onActivity?: (emoji: string, message: string) => void;
  onTriggerMinigame?: () => void;
}

function isCollective(space: Space) {
  return !!space.drinks_all || space.drinks_others !== undefined;
}

export function SpaceModal({
  space, multiplier, hasShield,
  characterName, roomPlayerId, isRoomMode,
  onDrink, onUseShield, onClose, onBroadcast,
  onLogLocal, onActivity, onTriggerMinigame,
}: Props) {
  const [step, setStep] = useState<'main' | 'prejudicado'>('main');

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const selfBase = typeof space.drinks === 'number' ? space.drinks : 0;
  const selfDrinks = selfBase * multiplier;
  const othersDrinks = (space.drinks_others ?? 0) * multiplier;
  const isSpecialRule = typeof space.drinks === 'string';
  const choice = space.drinks_choice;
  const conditional = space.drinks_conditional;
  const conditionalIsNumeric = typeof conditional?.drinks === 'number';
  const hasCollectiveEffect = isCollective(space);
  const notifiesOthers = isRoomMode && hasCollectiveEffect && !!onBroadcast;
  const spaceEmoji = SPACE_EMOJI[space.id] ?? '🏠';

  function buildLogMsg(extra = '') {
    const drinkPart = selfDrinks > 0 ? ` — bebeu ${selfDrinks} gole${selfDrinks !== 1 ? 's' : ''}` : '';
    const othersPart = othersDrinks > 0 && !selfDrinks ? ` — os outros bebem ${othersDrinks}` : '';
    const safePart = selfDrinks === 0 && !hasCollectiveEffect ? ' — seguro!' : '';
    return `${space.name_pt}${drinkPart}${othersPart}${safePart}${extra}`;
  }

  function fireBroadcast() {
    if (!onBroadcast || !characterName || !hasCollectiveEffect) return;
    const othersBase = space.drinks_others ?? (space.drinks_all ? selfBase : 0);
    onBroadcast({
      type: space.drinks_all ? 'drinks_all' : 'drinks_others',
      fromPlayerId: roomPlayerId ?? '',
      fromPlayerName: characterName,
      characterColor: space.color,
      message: `${characterName} caiu na ${space.name_pt}!`,
      drinks: typeof othersBase === 'number' ? othersBase : 1,
    });
  }

  function fireBroadcastOthers(amount: number) {
    if (!onBroadcast || !characterName) return;
    onBroadcast({
      type: 'drinks_others',
      fromPlayerId: roomPlayerId ?? '',
      fromPlayerName: characterName,
      characterColor: space.color,
      message: `${characterName} caiu na ${space.name_pt}!`,
      drinks: amount,
    });
  }

  function handleChoiceSelf() {
    const drinks = choice!.drinks_self * multiplier;
    onDrink(drinks);
    onActivity?.(spaceEmoji, t.spaceModal.choiceYouLog(space.name_pt, drinks));
    onClose();
  }

  function handleChoiceOthers() {
    const drinks = choice!.drinks_others * multiplier;
    if (isRoomMode && onBroadcast) {
      fireBroadcastOthers(drinks);
      onLogLocal?.(spaceEmoji, t.spaceModal.choiceOthersLog(space.name_pt));
    } else {
      onActivity?.(spaceEmoji, t.spaceModal.choiceOthersLog(space.name_pt));
    }
    onClose();
  }

  function handleConfirm() {
    if (selfDrinks > 0) onDrink(selfDrinks);

    if (hasCollectiveEffect) {
      // Casas coletivas: envia IncomingEventModal para outros via fireBroadcast
      // NÃO envia activity broadcast — evita race condition que descartaria o modal
      fireBroadcast();
      onLogLocal?.(spaceEmoji, buildLogMsg());
    } else {
      // Casas pessoais: loga + notifica outros via toast de activity
      onActivity?.(spaceEmoji, buildLogMsg());
    }

    if (space.id === 'chance_time') { setStep('prejudicado'); return; }
    onClose();
  }

  function handleShield() {
    onUseShield();
    if (hasCollectiveEffect) {
      fireBroadcast(); // outros ainda bebem mesmo com escudo
      onLogLocal?.(spaceEmoji, buildLogMsg(' (escudo usado)'));
    } else {
      onActivity?.(spaceEmoji, buildLogMsg(' (escudo usado)'));
    }
    onClose();
  }

  function handlePrejudicado(foi: boolean) {
    if (foi && conditionalIsNumeric) {
      const extra = (conditional!.drinks as number) * multiplier;
      onDrink(extra);
      onLogLocal?.(spaceEmoji, `${space.name_pt} — saiu prejudicado (+${extra} goles)`);
    }
    onClose();
  }

  // ── Step: prejudicado ──
  if (step === 'prejudicado') {
    const extraDrinks = conditionalIsNumeric ? (conditional!.drinks as number) * multiplier : 1;
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/70" />
        <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:p-4">
          <div className="bg-gray-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-md shadow-2xl"
            style={{ borderTop: `3px solid ${space.color}` }}>
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-600" />
            </div>
            <div className="px-5 pb-6 pt-4 space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🎲</div>
                <div className="text-lg font-bold text-white">{t.spaceModal.chanceTimeCard}</div>
                <div className="text-sm text-gray-400 mt-1">{conditional?.condition}</div>
              </div>
              <div className="rounded-2xl bg-gray-700/50 px-4 py-3 text-center">
                <div className="text-sm text-gray-300">{t.spaceModal.chanceTimeQuestion}</div>
                <div className="text-xs text-gray-500 mt-1">{t.spaceModal.chanceTimeYesNote(extraDrinks)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handlePrejudicado(true)}
                  className="py-4 rounded-2xl text-sm font-bold border-2 border-red-500/60 bg-red-900/20 text-red-400 active:scale-95 transition-transform">
                  {t.spaceModal.chanceTimeYes(extraDrinks)}
                </button>
                <button onClick={() => handlePrejudicado(false)}
                  className="py-4 rounded-2xl text-sm font-bold border-2 border-green-500/60 bg-green-900/20 text-green-400 active:scale-95 transition-transform">
                  {t.spaceModal.chanceTimeNo}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Step: main ──
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
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.spaceModal.effectLabel}</div>
              <div className="text-sm text-gray-300">{space.effect_in_game}</div>
            </div>

            {/* Regra */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: `${space.color}20`, border: `1px solid ${space.color}50` }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: space.color }}>
                {t.spaceModal.ruleLabel}
              </div>
              <div className="text-base font-semibold text-white">{space.drinking_rule}</div>
            </div>

            {/* Consequências — casas com choice (Event, Item) */}
            {choice && (
              <div className="rounded-2xl bg-gray-700/50 p-4 space-y-2">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t.spaceModal.consequencesLabel}</div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-xl bg-gray-800/60 px-3 py-2 text-center">
                    <div className="text-xs text-gray-400 mb-1">{choice.self_label}</div>
                    <div className="text-sm font-bold text-white">🍺 {t.common.goles(choice.drinks_self * multiplier)}</div>
                    {multiplier > 1 && <div className="text-[10px] text-red-400 mt-0.5">{multiplier}x</div>}
                  </div>
                  <div className="rounded-xl bg-gray-800/60 px-3 py-2 text-center">
                    <div className="text-xs text-gray-400 mb-1">{choice.others_label}</div>
                    <div className="text-sm font-bold text-white">👥 {t.common.goles(choice.drinks_others * multiplier)}</div>
                    {isRoomMode && <div className="text-[10px] text-yellow-400 mt-0.5">🔔 {t.spaceModal.choiceNotifies}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Consequências — casas normais */}
            {!isSpecialRule && !choice && (
              <div className="rounded-2xl bg-gray-700/50 p-4 space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t.spaceModal.consequencesLabel}</div>

                {selfDrinks > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🍺</span>
                    <div className="flex-1 text-sm font-bold text-white">{t.spaceModal.youDrink}</div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-white">{selfDrinks}</span>
                      <span className="text-xs text-gray-400 ml-1">{t.common.goles(selfDrinks)}</span>
                      {multiplier > 1 && <span className="ml-1 text-xs text-red-400 bg-red-900/40 px-1 py-0.5 rounded-full font-bold">{multiplier}x</span>}
                    </div>
                  </div>
                )}

                {selfDrinks === 0 && !space.drinks_all && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    <div className="text-sm text-gray-400">{t.spaceModal.youDontDrink}</div>
                  </div>
                )}

                {othersDrinks > 0 && (
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-600">
                    <span className="text-xl">👥</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">
                        {space.drinks_all ? t.spaceModal.everyoneDrinks : t.spaceModal.othersDrink}
                      </div>
                      {notifiesOthers && <div className="text-xs text-yellow-400">{t.spaceModal.notifyOthers}</div>}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-white">{othersDrinks}</span>
                      <span className="text-xs text-gray-400 ml-1">{t.common.goles(othersDrinks)}</span>
                    </div>
                  </div>
                )}

                {conditionalIsNumeric && (
                  <div className="pt-2 border-t border-gray-600 text-xs text-yellow-400">
                    + {conditional!.condition}: {(conditional!.drinks as number) * multiplier} {t.spaceModal.extraDrinksUnit}
                    {space.id === 'chance_time' ? ` ${t.spaceModal.extraDrinksNote}` : ''}
                  </div>
                )}
              </div>
            )}

            {/* VS Space */}
            {isSpecialRule && (
              <div className="rounded-2xl bg-gray-700/50 p-4 space-y-2">
                <div className="text-sm text-white font-semibold">{t.spaceModal.vsMinigame}</div>
                <div className="text-xs text-gray-400">{t.spaceModal.vsMinigameRule}</div>
              </div>
            )}

            {/* Botões */}
            <div className="flex flex-col gap-3">
              {/* Escudo */}
              {hasShield && selfDrinks > 0 && !choice && (
                <button onClick={handleShield}
                  className="w-full py-4 rounded-2xl text-base font-bold text-yellow-400 border-2 border-yellow-500/60 bg-yellow-500/10 active:scale-95 transition-transform">
                  {notifiesOthers && othersDrinks > 0 ? t.spaceModal.shieldSkipOthers : t.spaceModal.shieldSkipSelf}
                </button>
              )}

              {/* Choice — Event Space / Item Space */}
              {choice && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleChoiceSelf}
                    className="py-4 rounded-2xl text-sm font-bold border-2 active:scale-95 transition-transform"
                    style={{ borderColor: `${space.color}80`, backgroundColor: `${space.color}20`, color: space.color }}>
                    {t.spaceModal.choiceYouDrink(choice.drinks_self * multiplier)}
                  </button>
                  <button onClick={handleChoiceOthers}
                    className="py-4 rounded-2xl text-sm font-bold text-white active:scale-95 transition-transform"
                    style={{ backgroundColor: space.color }}>
                    {t.spaceModal.choiceOthersDrink(choice.drinks_others * multiplier)}
                  </button>
                </div>
              )}

              {/* Confirmar — para casas normais não-VS */}
              {!isSpecialRule && !choice && (
                <button onClick={handleConfirm}
                  className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform"
                  style={{ backgroundColor: selfDrinks > 0 || hasCollectiveEffect ? space.color : '#374151' }}>
                  {selfDrinks > 0 && notifiesOthers
                    ? t.spaceModal.drinkWithNotify(selfDrinks)
                    : selfDrinks > 0
                    ? t.spaceModal.drinkConfirm(selfDrinks)
                    : notifiesOthers
                    ? t.spaceModal.confirmWithNotify
                    : t.spaceModal.confirmLog}
                </button>
              )}

              {/* VS Space */}
              {isSpecialRule && (
                <button
                  onClick={() => {
                    onLogLocal?.(spaceEmoji, t.spaceModal.vsMinigameLog);
                    onTriggerMinigame?.();
                    onClose();
                  }}
                  className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform"
                  style={{ backgroundColor: space.color }}>
                  {t.spaceModal.startVsMinigame}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
