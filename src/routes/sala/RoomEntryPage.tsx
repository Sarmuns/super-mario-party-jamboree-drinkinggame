import { useNavigate } from 'react-router-dom';
import { RoomEntry } from '../../components/RoomEntry';
import { useSalaContext } from './SalaLayout';

export function RoomEntryPage() {
  const { room } = useSalaContext();
  const navigate = useNavigate();

  async function handleCreate(code: string) {
    const ok = await room.createRoom(code);
    if (ok) navigate(`/sala/${code}/select`);
  }

  async function handleJoin(code: string) {
    const ok = await room.joinRoom(code);
    if (ok) navigate(`/sala/${code}/select`);
  }

  return (
    <RoomEntry
      error={room.error}
      isConnecting={room.status === 'connecting'}
      onCreateRoom={handleCreate}
      onJoinRoom={handleJoin}
      onBack={() => navigate('/')}
    />
  );
}
