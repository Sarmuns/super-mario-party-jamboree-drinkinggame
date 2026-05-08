import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CharacterSelect } from '../../components/CharacterSelect';
import { useSalaContext } from './SalaLayout';
import type { Character } from '../../types';

export function RoomSelectPage() {
  const { code } = useParams<{ code: string }>();
  const { game, room } = useSalaContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (game.state.character) navigate(`/sala/${code}/lobby`, { replace: true });
  }, [game.state.character]);

  async function handleStart(character: Character) {
    game.selectCharacter(character);
    await room.selectRoomCharacter(character);
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
