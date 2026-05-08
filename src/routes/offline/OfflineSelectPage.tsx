import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CharacterSelect } from '../../components/CharacterSelect';
import { useOfflineContext } from './OfflineLayout';

export function OfflineSelectPage() {
  const { game } = useOfflineContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (game.state.character) navigate('/offline/game', { replace: true });
  }, [game.state.character]);

  return (
    <CharacterSelect
      onStart={(character) => {
        game.selectCharacter(character);
        navigate('/offline/game');
      }}
    />
  );
}
