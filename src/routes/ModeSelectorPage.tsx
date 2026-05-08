import { useNavigate } from 'react-router-dom';
import { ModeSelector } from '../components/ModeSelector';

export function ModeSelectorPage() {
  const navigate = useNavigate();
  return (
    <ModeSelector
      onOffline={() => navigate('/offline')}
      onSala={() => navigate('/sala')}
    />
  );
}
