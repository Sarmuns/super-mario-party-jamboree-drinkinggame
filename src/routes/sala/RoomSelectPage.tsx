import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CharacterSelect } from '../../components/CharacterSelect';
import { useSalaContext } from './SalaLayout';
import type { Character } from '../../types';

export function RoomSelectPage() {
  const { code } = useParams<{ code: string }>();
  const { game, room, nickname } = useSalaContext();
  const navigate = useNavigate();
  const [autoJoining, setAutoJoining] = useState(false);

  // Auto-join quando aberto via QR code / URL direta (camera do celular)
  useEffect(() => {
    if (room.status !== 'idle' || !code || autoJoining) return;
    setAutoJoining(true);
    game.resetGame(); // garante estado limpo
    room.joinRoom(code).then(ok => {
      if (!ok) navigate('/');
      setAutoJoining(false);
    });
  }, []);

  // Redireciona pro game se já tem personagem e jogo iniciou
  useEffect(() => {
    if (room.status === 'playing' && game.state.character) {
      navigate(`/sala/${code}/game`, { replace: true });
    }
  }, [room.status, game.state.character]);

  if (autoJoining || room.status === 'connecting') {
    return (
      <div className="min-h-dvh bg-gray-900 flex flex-col items-center justify-center gap-4">
        <div className="text-4xl animate-pulse">🎮</div>
        <div className="text-white font-semibold">Entrando na sala {code}...</div>
        {room.error && (
          <div className="text-red-400 text-sm mt-2">{room.error}</div>
        )}
      </div>
    );
  }

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
