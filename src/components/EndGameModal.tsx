import type { Character } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface Props {
  character: Character;
  totalDrinks: number;
  onClose: () => void;
  onReset: () => void;
}

function getMessage(drinks: number): { emoji: string; text: string } {
  if (drinks === 0)  return { emoji: '🧃', text: 'Isso é suco. Você nem apareceu.' };
  if (drinks <= 3)   return { emoji: '😴', text: 'Praticamente sóbrio. Tá bem?' };
  if (drinks <= 7)   return { emoji: '🙂', text: 'Participou, pelo menos.' };
  if (drinks <= 12)  return { emoji: '😏', text: 'Já tá sentindo, né? Bom jogo.' };
  if (drinks <= 18)  return { emoji: '😅', text: 'Bem lubrificado. Boa partida.' };
  if (drinks <= 25)  return { emoji: '🥴', text: 'Campeão do loser board. Parabéns.' };
  if (drinks <= 35)  return { emoji: '🫠', text: 'Alguém chama um Uber.' };
  return               { emoji: '💀', text: 'Você não vai lembrar disso amanhã.' };
}

export function EndGameModal({ character, totalDrinks, onClose, onReset }: Props) {
  const { emoji, text } = getMessage(totalDrinks);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/80" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
          style={{ border: `2px solid ${character.color}` }}>

          {/* Header strip */}
          <div className="px-6 pt-8 pb-6 flex flex-col items-center gap-4 text-center"
            style={{ background: `linear-gradient(160deg, ${character.color}25 0%, transparent 60%)` }}>

            <div className="rounded-full p-1" style={{ background: character.color }}>
              <ImageWithFallback
                src={character.portrait_url}
                alt={character.name}
                fallbackChar={character.name[0]}
                fallbackColor={character.color}
                className="w-24 h-24 rounded-full object-contain bg-gray-900"
              />
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-1">{character.name} bebeu</div>
              <div className="text-7xl font-black leading-none" style={{ color: character.color }}>
                {totalDrinks}
              </div>
              <div className="text-gray-400 text-sm mt-1">gole{totalDrinks !== 1 ? 's' : ''}</div>
            </div>

            <div className="mt-2">
              <div className="text-4xl mb-2">{emoji}</div>
              <div className="text-base font-semibold text-white">{text}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex flex-col gap-3">
            <button
              onClick={onReset}
              className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform"
              style={{ backgroundColor: character.color }}
            >
              Jogar de novo
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-gray-700/60 active:scale-95 transition-transform"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
