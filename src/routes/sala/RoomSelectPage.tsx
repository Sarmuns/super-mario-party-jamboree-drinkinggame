import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CharacterSelect } from '../../components/CharacterSelect';
import { useSalaContext } from './SalaLayout';
import type { Character } from '../../types';

export function RoomSelectPage() {
  const { code } = useParams<{ code: string }>();
  const { game, room, nickname } = useSalaContext();
  const navigate = useNavigate();

  // Só redireciona pro game se já tem personagem (evita loop com RoomGamePage)
  useEffect(() => {
    if (room.status === 'playing' && game.state.character) {
      navigate(`/sala/${code}/game`, { replace: true });
    }
  }, [room.status, game.state.character]);

  // BUG-03 fix: não usar useEffect para navegar — isso criava race condition
  // porque game.selectCharacter() é síncrono e o efeito disparava antes de
  // room.selectRoomCharacter() terminar. Navegamos somente após ambas concluírem.
  async function handleStart(character: Character) {
    game.selectCharacter(character);
    await room.selectRoomCharacter(character, nickname.trim() || undefined);
    navigate(`/sala/${code}/lobby`);
  }

  return (
    <CharacterSelect
      onStart={handleStart}
      roomPlayers={room.players}
      myPlayerId={room.playerId}
    />
  );
}
