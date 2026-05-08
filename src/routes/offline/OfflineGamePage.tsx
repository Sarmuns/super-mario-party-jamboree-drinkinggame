import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameTracker } from '../../components/GameTracker';
import { useOfflineContext } from './OfflineLayout';

export function OfflineGamePage() {
  const { game, log, showToast } = useOfflineContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!game.state.character) navigate('/offline', { replace: true });
  }, [game.state.character]);

  if (!game.state.character) return null;

  function handleLog(emoji: string, msg: string) {
    log.addEntry({
      emoji, message: msg,
      playerName: game.state.character!.name,
      playerColor: game.state.character!.color,
      source: 'self',
    });
  }

  return (
    <GameTracker
      character={game.state.character}
      totalDrinks={game.state.totalDrinks}
      hasShield={game.state.hasShield}
      isHomestretch={game.state.isHomestretch}
      isJamboree={game.state.isJamboree}
      stars={game.state.stars}
      turn={game.state.turn}
      canUndo={game.canUndo}
      logEntries={log.entries}
      onClearLog={log.clearLog}
      onDrink={game.addDrinks}
      onActivateShield={game.activateShield}
      onUseShield={game.useShield}
      onUndo={game.undo}
      onToggleHomestretch={game.toggleHomestretch}
      onToggleJamboree={game.toggleJamboree}
      onAddStars={game.addStars}
      onIncrementTurn={game.incrementTurn}
      onReset={() => { game.resetGame(); log.clearLog(); navigate('/'); }}
      onLog={handleLog}
      showToast={showToast}
      onBroadcast={undefined}
    />
  );
}
