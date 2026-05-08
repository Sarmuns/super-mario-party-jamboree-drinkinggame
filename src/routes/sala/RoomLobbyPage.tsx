import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lobby } from '../../components/Lobby';
import { useSalaContext } from './SalaLayout';

export function RoomLobbyPage() {
  const { code } = useParams<{ code: string }>();
  const { game, room, log } = useSalaContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (room.status === 'playing') navigate(`/sala/${code}/game`, { replace: true });
  }, [room.status]);

  useEffect(() => {
    if (!game.state.character && room.status === 'lobby') {
      navigate(`/sala/${code}/select`, { replace: true });
    }
  }, [game.state.character, room.status]);

  async function handleStart() {
    await room.startGame();
    navigate(`/sala/${code}/game`);
  }

  function handleLeave() {
    room.leaveRoom();
    game.resetGame();
    log.clearLog();
    navigate('/');
  }

  if (!game.state.character || !room.roomCode) return null;

  return (
    <Lobby
      roomCode={room.roomCode}
      players={room.players}
      isHost={room.isHost}
      playerId={room.playerId}
      onStart={handleStart}
      onLeave={handleLeave}
    />
  );
}
