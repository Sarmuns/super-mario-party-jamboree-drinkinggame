import type { Character } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface Props {
  character: Character;
  totalDrinks: number;
  stars: number;
  turn: number;
  onClose: () => void;
  onReset: () => void;
}

const MESSAGES: Record<number, { emoji: string; text: string }> = {
  0:  { emoji: '🧃', text: 'Zero goles. Você jogou Mario Party sóbrio. Parabéns, acho.' },
  1:  { emoji: '😶', text: 'Um gole. Quase um brinde. Tá quente aí?' },
  2:  { emoji: '🙃', text: 'Dois goles. Ainda contando. Que diligente.' },
  3:  { emoji: '😐', text: 'Três. Isso é o mínimo pro jogo ter sentido.' },
  4:  { emoji: '🙂', text: 'Quatro goles. Uma base sólida. Continua.' },
  5:  { emoji: '😊', text: 'Cinco. Metade de uma lata. Tá ensaiando.' },
  6:  { emoji: '😏', text: 'Seis goles. Uma lata inteira. Hoje tá fácil.' },
  7:  { emoji: '😌', text: 'Sete. Número da sorte... ou do azar.' },
  8:  { emoji: '😅', text: 'Oito goles. Dois dedos a mais que o recomendado.' },
  9:  { emoji: '😬', text: 'Nove. Tá quase em dois dígitos. Vai fundo.' },
  10: { emoji: '🎉', text: 'Dois dígitos! Marco histórico. Desce mais.' },
  11: { emoji: '😤', text: 'Onze. Começou a ficar interessante por aqui.' },
  12: { emoji: '😮', text: 'Doze goles. Uma dúzia de más decisões.' },
  13: { emoji: '🤨', text: 'Treze. Número azarado pra quem cai no Bowser.' },
  14: { emoji: '😳', text: 'Quatorze goles. A festa tá pegando fogo.' },
  15: { emoji: '🔥', text: 'Quinze. Meio caminho andado pra lenda.' },
  16: { emoji: '😵', text: 'Dezesseis. O jogo já foi, você ficou.' },
  17: { emoji: '📞', text: 'Dezessete. Alguém já avisou sua família?' },
  18: { emoji: '🎂', text: 'Dezoito. Maior de idade em goles. Parabéns.' },
  19: { emoji: '👀', text: 'Dezenove. Um a mais e vira número redondo.' },
  20: { emoji: '😱', text: 'Vinte goles. Vinte. Você tá bem?' },
  21: { emoji: '🃏', text: 'Vinte e um. BlackJack. Ganhou... mais goles.' },
  22: { emoji: '😶‍🌫️', text: 'Vinte e dois. Não tem mais volta, amigo.' },
  23: { emoji: '⏰', text: 'Vinte e três. A noite vai ser muito longa.' },
  24: { emoji: '🌙', text: 'Vinte e quatro. Um gole por hora de sono perdido.' },
  25: { emoji: '🙏', text: 'Vinte e cinco. Metade de cinquenta. Deus te abençoe.' },
  26: { emoji: '🤔', text: 'Vinte e seis. Quem te conhecia antes dessa partida?' },
  27: { emoji: '🎸', text: 'Vinte e sete. Club dos 27. Território perigoso.' },
  28: { emoji: '❓', text: 'Vinte e oito. Você ainda sabe o nome do jogo?' },
  29: { emoji: '🤐', text: 'Vinte e nove. Um a mais e trinta. Pensa bem.' },
  30: { emoji: '🗿', text: 'Trinta goles. Digno de uma estátua. De vergonha.' },
  31: { emoji: '📅', text: 'Trinta e um. Agosto. Nem faz sentido mais.' },
  32: { emoji: '👑', text: 'Trinta e dois. Você é uma lenda ou uma vítima?' },
  33: { emoji: '✝️', text: 'Trinta e três. Cristo tinha essa idade. Coincidência?' },
  34: { emoji: '🚗', text: 'Trinta e quatro. O Uber já deve estar a caminho.' },
  35: { emoji: '🎡', text: 'Trinta e cinco. O tapete vai girar daqui a pouco.' },
  36: { emoji: '🆘', text: 'Trinta e seis. Você pediu ajuda hoje? Não, né?' },
  37: { emoji: '🏥', text: 'Trinta e sete. Essa quantidade tem nome de doença.' },
  38: { emoji: '🌍', text: 'Trinta e oito. Os outros jogadores já foram embora?' },
  39: { emoji: '📖', text: 'Trinta e nove. Um a mais e você vira mito urbano.' },
  40: { emoji: '😇', text: 'Quarenta. Que Deus tenha misericórdia da sua alma.' },
  41: { emoji: '👻', text: 'Quarenta e um. Tá vendo coisas? Pode ser normal.' },
  42: { emoji: '🌌', text: 'Quarenta e dois. A resposta pra tudo. Incluindo a sua ruína.' },
  43: { emoji: '🏠', text: 'Quarenta e três. Você ainda sabe onde mora?' },
  44: { emoji: '🎥', text: 'Quarenta e quatro. Alguém documenta isso, por favor.' },
  45: { emoji: '📆', text: 'Quarenta e cinco. Amanhã vai ser difícil. E depois também.' },
  46: { emoji: '🏆', text: 'Quarenta e seis. Isso é uma conquista ou uma tragédia?' },
  47: { emoji: '🎖️', text: 'Quarenta e sete. Você merece um troféu. De sofrimento.' },
  48: { emoji: '🪣', text: 'Quarenta e oito. Mantém um balde por perto.' },
  49: { emoji: '⚠️', text: 'Quarenta e nove. UM. GOLE. A. MAIS.' },
  50: { emoji: '💀', text: 'Cinquenta. C-I-N-Q-U-E-N-T-A. Você é uma obra de arte.' },
};

function getMessage(drinks: number) {
  if (drinks <= 50) return MESSAGES[drinks] ?? MESSAGES[0];
  return { emoji: '☠️', text: 'Passou de cinquenta. Não existe número pra isso. Vai dormir.' };
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
              <div className="text-sm text-gray-400 mb-1">{character.name} • {turn - 1} turnos</div>
              <div className="text-7xl font-black leading-none" style={{ color: character.color }}>
                {totalDrinks}
              </div>
              <div className="text-gray-400 text-sm mt-1">gole{totalDrinks !== 1 ? 's' : ''}</div>
              <div className="text-yellow-400 text-sm mt-1">⭐ {stars} estrela{stars !== 1 ? 's' : ''}</div>
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
              Jogar de novo
            </button>
            <button onClick={onClose}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-gray-700/60 active:scale-95 transition-transform">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
