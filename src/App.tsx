import { useEffect, useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { useRoom } from './hooks/useRoom';
import { useToast } from './hooks/useToast';
import { ModeSelector } from './components/ModeSelector';
import { CharacterSelect } from './components/CharacterSelect';
import { RoomEntry } from './components/RoomEntry';
import { Lobby } from './components/Lobby';
import { GameTracker } from './components/GameTracker';
import { IncomingEventModal } from './components/IncomingEventModal';
import { MinigameModal } from './components/MinigameModal';
import { ToastContainer } from './components/Toast';
import type { Character } from './types';

type AppMode = 'select' | 'offline' | 'sala';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>(() =>
    (localStorage.getItem('smpj-app-mode') as AppMode) || 'select'
  );

  const game = useGameState();
  const room = useRoom();
  const { toasts, showToast, dismissToast } = useToast();

  // Tenta reconectar à sala ao abrir o app
  useEffect(() => {
    const session = room.loadSession();
    if (!session || appMode !== 'sala') return;
    if (room.status !== 'idle') return;

    const savedState = myStateFromGame();
    room.reconnect(session, savedState).then(ok => {
      if (!ok) setMode('select');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function myStateFromGame(): Partial<import('./types').RoomPlayer> {
    const c = game.state.character;
    if (!c) return {};
    return {
      name: c.name,
      characterId: c.id,
      characterColor: c.color,
      characterIcon: c.icon_url,
      characterPortrait: c.portrait_url,
      totalDrinks: game.state.totalDrinks,
      stars: game.state.stars,
      hasShield: game.state.hasShield,
    };
  }

  // Accent color from character
  useEffect(() => {
    const color = game.state.character?.color ?? '#6366f1';
    document.documentElement.style.setProperty('--accent', color);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent-rgb', `${r} ${g} ${b}`);
  }, [game.state.character?.color]);

  // Sync local game state → Supabase Presence
  useEffect(() => {
    if (appMode !== 'sala' || room.status !== 'playing') return;
    room.updateMyState({
      totalDrinks: game.state.totalDrinks,
      stars: game.state.stars,
      hasShield: game.state.hasShield,
    });
  }, [game.state.totalDrinks, game.state.stars, game.state.hasShield]);

  function setMode(mode: AppMode) {
    setAppMode(mode);
    localStorage.setItem('smpj-app-mode', mode);
  }

  function handleLeaveRoom() {
    room.leaveRoom();
    game.resetGame();
    setMode('select');
  }

  async function handleRoomCharacterSelect(character: Character) {
    game.selectCharacter(character);
    await room.selectRoomCharacter(character);
  }

  const multiplier = (game.state.isHomestretch ? 2 : 1) * (game.state.isJamboree ? 2 : 1);

  // Evento incoming: minigame_start abre modal próprio, outros vão pro IncomingEventModal
  const incomingEvent = room.incomingEvent;
  const isMinigameEvent = incomingEvent?.type === 'minigame_start';
  const isActivityEvent = incomingEvent?.type === 'activity';
  const isDrinkEvent = incomingEvent && !isMinigameEvent && !isActivityEvent;

  // Activity events viram toast e são descartados imediatamente
  if (isActivityEvent && incomingEvent) {
    showToast(`${incomingEvent.emoji ?? '💬'} ${incomingEvent.message}`);
    room.dismissEvent();
  }

  function handleGuestMinigameConfirm(drinks: number) {
    game.addDrinks(drinks);
    room.dismissEvent();
    showToast(`🎮 Minigame! 🍺 +${drinks}`);
  }

  const commonGameProps = {
    character: game.state.character!,
    totalDrinks: game.state.totalDrinks,
    hasShield: game.state.hasShield,
    isHomestretch: game.state.isHomestretch,
    isJamboree: game.state.isJamboree,
    stars: game.state.stars,
    turn: game.state.turn,
    canUndo: game.canUndo,
    onDrink: game.addDrinks,
    onActivateShield: game.activateShield,
    onUseShield: game.useShield,
    onUndo: game.undo,
    onToggleHomestretch: game.toggleHomestretch,
    onToggleJamboree: game.toggleJamboree,
    onAddStars: game.addStars,
    onIncrementTurn: game.incrementTurn,
    showToast,
  };

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Drink event modal (Lucky Space, Chance Time etc.) */}
      {appMode === 'sala' && isDrinkEvent && room.status === 'playing' && (
        <IncomingEventModal
          event={incomingEvent!}
          hasShield={game.state.hasShield}
          multiplier={multiplier}
          onDrink={game.addDrinks}
          onUseShield={() => { game.useShield(); showToast('Escudo usado! 🛡️'); }}
          onDismiss={room.dismissEvent}
        />
      )}

      {/* Minigame modal para guests (host encerrou o turno) */}
      {appMode === 'sala' && isMinigameEvent && room.status === 'playing' && !room.isHost && (
        <MinigameModal
          mode="guest"
          turn={incomingEvent!.turn ?? game.state.turn}
          multiplier={multiplier}
          hostName={incomingEvent!.fromPlayerName}
          format={incomingEvent!.minigameFormat}
          onConfirm={handleGuestMinigameConfirm}
          onClose={room.dismissEvent}
        />
      )}

      {/* Reconectando... */}
      {room.isReconnecting && (
        <div className="fixed inset-0 z-50 bg-gray-900/90 flex flex-col items-center justify-center gap-3">
          <div className="text-3xl animate-spin">🔄</div>
          <div className="text-white font-semibold">Reconectando à sala...</div>
        </div>
      )}

      {/* ── Mode select ── */}
      {appMode === 'select' && (
        <ModeSelector onOffline={() => setMode('offline')} onSala={() => setMode('sala')} />
      )}

      {/* ── Offline ── */}
      {appMode === 'offline' && !game.state.character && (
        <CharacterSelect onStart={game.selectCharacter} />
      )}
      {appMode === 'offline' && game.state.character && (
        <GameTracker {...commonGameProps} onReset={() => { game.resetGame(); setMode('select'); }} onBroadcast={undefined} />
      )}

      {/* ── Sala ── */}
      {appMode === 'sala' && (room.status === 'idle' || room.status === 'connecting' || room.status === 'error') && (
        <RoomEntry
          error={room.error}
          isConnecting={room.status === 'connecting'}
          onCreateRoom={room.createRoom}
          onJoinRoom={room.joinRoom}
          onBack={() => setMode('select')}
        />
      )}

      {appMode === 'sala' && room.status === 'lobby' && !game.state.character && (
        <CharacterSelect
          onStart={handleRoomCharacterSelect}
          roomPlayers={room.players}
          myPlayerId={room.playerId}
        />
      )}

      {appMode === 'sala' && room.status === 'lobby' && game.state.character && room.roomCode && (
        <Lobby
          roomCode={room.roomCode}
          players={room.players}
          isHost={room.isHost}
          playerId={room.playerId}
          onStart={room.startGame}
          onLeave={handleLeaveRoom}
        />
      )}

      {appMode === 'sala' && room.status === 'playing' && game.state.character && (
        <GameTracker
          {...commonGameProps}
          onReset={handleLeaveRoom}
          onBroadcast={room.broadcast}
          roomPlayers={room.players}
          roomCode={room.roomCode ?? undefined}
          roomPlayerId={room.playerId}
          isHost={room.isHost}
        />
      )}
    </>
  );
}
