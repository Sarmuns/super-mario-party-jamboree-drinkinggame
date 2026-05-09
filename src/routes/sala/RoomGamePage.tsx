import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GameTracker } from '../../components/GameTracker';
import { useSalaContext } from './SalaLayout';

export function RoomGamePage() {
  const { code } = useParams<{ code: string }>();
  const { game, room, log, showToast } = useSalaContext();
  const navigate = useNavigate();

  // Reconexão via URL — o código está na URL, sem depender de localStorage de modo
  useEffect(() => {
    if (room.status !== 'idle' || !code) return;
    const session = room.loadSession();
    if (session?.code === code) {
      const savedState = game.state.character ? {
        name: game.state.character.name,
        characterId: game.state.character.id,
        characterColor: game.state.character.color,
        characterIcon: game.state.character.icon_url,
        characterPortrait: game.state.character.portrait_url,
        totalDrinks: game.state.totalDrinks,
        stars: game.state.stars,
        hasShield: game.state.hasShield,
      } : undefined;
      room.reconnect(session, savedState).then(ok => { if (!ok) navigate('/'); });
    } else {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (room.status === 'lobby') navigate(`/sala/${code}/lobby`, { replace: true });
  }, [room.status]);

  // BUG-04 fix: se personagem sumiu do localStorage, redireciona para selecionar
  useEffect(() => {
    if (!game.state.character && room.status === 'playing') {
      navigate(`/sala/${code}/select`, { replace: true });
    }
  }, [game.state.character, room.status]);

  if (!game.state.character) return null;

  function handleLog(emoji: string, msg: string) {
    log.addEntry({
      emoji, message: msg,
      playerName: game.state.character!.name,
      playerColor: game.state.character!.color,
      source: 'self',
    });
  }

  function handleLeave() {
    room.leaveRoom();
    game.resetGame();
    log.clearLog();
    navigate('/');
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
      roomPlayers={room.players}
      roomCode={room.roomCode ?? undefined}
      roomPlayerId={room.playerId}
      isHost={room.isHost}
      onDrink={game.addDrinks}
      onSetDrinks={game.setTotalDrinks}
      onActivateShield={game.activateShield}
      onUseShield={game.useShield}
      onUndo={game.undo}
      onToggleHomestretch={game.toggleHomestretch}
      onToggleJamboree={game.toggleJamboree}
      onAddStars={game.addStars}
      onIncrementTurn={game.incrementTurn}
      onReset={handleLeave}
      onLog={handleLog}
      showToast={showToast}
      onBroadcast={room.broadcast}
    />
  );
}
