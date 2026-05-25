import type { Character } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { t } from '../lib/labels';

interface Props {
  character: Character;
  totalDrinks: number;
  stars: number;
  turn: number;
  onClose: () => void;
  onReset: () => void;
}

const EMOJIS: Record<number, string> = {
  0:'🧃', 1:'😶', 2:'🙃', 3:'😐', 4:'🙂', 5:'😊', 6:'😏', 7:'😌', 8:'😅', 9:'😬',
  10:'🎉', 11:'😤', 12:'😮', 13:'🤨', 14:'😳', 15:'🔥', 16:'😵', 17:'📞', 18:'🎂', 19:'👀',
  20:'😱', 21:'🃏', 22:'😶‍🌫️', 23:'⏰', 24:'🌙', 25:'🙏', 26:'🤔', 27:'🎸', 28:'❓', 29:'🤐',
  30:'🗿', 31:'📅', 32:'👑', 33:'✝️', 34:'🚗', 35:'🎡', 36:'🆘', 37:'🏥', 38:'🌍', 39:'📖',
  40:'😇', 41:'👻', 42:'🌌', 43:'🏠', 44:'🎥', 45:'📆', 46:'🏆', 47:'🎖️', 48:'🪣', 49:'⚠️',
  50:'💀',
};

function getMessage(drinks: number) {
  if (drinks <= 50) return { emoji: EMOJIS[drinks] ?? '🧃', text: t.endGame.comments[drinks] ?? t.endGame.comments[0] };
  return { emoji: '☠️', text: t.endGame.over50 };
}

export function EndGameModal({ character, totalDrinks, stars, turn, onClose, onReset }: Props) {
  const { emoji, text } = getMessage(totalDrinks);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/80" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
          style={{ border: `2px solid ${character.color}` }}>

          <div className="px-6 pt-8 pb-6 flex flex-col items-center gap-4 text-center"
            style={{ background: `linear-gradient(160deg, ${character.color}25 0%, transparent 60%)` }}>

            <div className="rounded-full p-1" style={{ background: character.color }}>
              <ImageWithFallback
                src={character.portrait_url} alt={character.name}
                fallbackChar={character.name[0]} fallbackColor={character.color}
                className="w-24 h-24 rounded-full object-contain bg-gray-900"
              />
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-1">{character.name} • {turn - 1} {t.endGame.turnos}</div>
              <div className="text-7xl font-black leading-none" style={{ color: character.color }}>
                {totalDrinks}
              </div>
              <div className="text-gray-400 text-sm mt-1">{t.common.goles(totalDrinks)}</div>
              <div className="text-yellow-400 text-sm mt-1">⭐ {stars} {t.common.estrelas(stars)}</div>
            </div>

            <div className="mt-2">
              <div className="text-4xl mb-2">{emoji}</div>
              <div className="text-base font-semibold text-white">{text}</div>
            </div>
          </div>

          <div className="px-6 pb-6 flex flex-col gap-3">
            <button onClick={onReset}
              className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform"
              style={{ backgroundColor: character.color }}>
              {t.endGame.playAgain}
            </button>
            <button onClick={onClose}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-gray-700/60 active:scale-95 transition-transform">
              {t.endGame.close}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
