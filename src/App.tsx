import { useEffect, useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { useRoom } from './hooks/useRoom';
import { useToast } from './hooks/useToast';
import { useLog } from './hooks/useLog';
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
  const { entries: logEntries, addEntry: addToLog } = useLog();

  // Tenta reconectar à sala ao abrir o app
  useEffect(() => {
    const session = room.loadSession();
    if (!session || appMode !== 'sala') return;
    if (room.status !== 'idle') return;
    room.reconnect(session, myStateFromGame()).then(ok => {
      if (!ok) setMode('select');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function myStateFromGame(): Partial<import('./types').RoomPlayer> {
    const c = game.state.character;
    if (!c) return {};
    return {
      name: c.name, characterId: c.id, characterColor: c.color,
      characterIcon: c.icon_url, characterPortrait: c.portrait_url,
      totalDrinks: game.state.totalDrinks, stars: game.state.stars, hasShield: game.state.hasShield,
    };
  }

  useEffect(() => {
    const color = game.state.character?.color ?? '#6366f1';
    document.documentElement.style.setProperty('--accent', color);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent-rgb', `${r} ${g} ${b}`);
  }, [game.state.character?.color]);

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

  // Log local: chamado pelo GameTracker para ações do próprio jogador
  function handleLog(emoji: string, message: string) {
    addToLog({
      emoji, message,
      playerName: game.state.character?.name ?? 'Você',
      playerColor: game.state.character?.color ?? '#6366f1',
      source: 'self',
    });
  }

  const multiplier = (game.state.isHomestretch ? 2 : 1) * (game.state.isJamboree ? 2 : 1);
  // Estado do minigame para guests
  const [guestMinigame, setGuestMinigame] = useState<{
    phase: 'prebrew' | 'waiting' | 'result';
    hostName: string;
    turn: number;
    format?: string;
  } | null>(null);

  const incomingEvent = room.incomingEvent;
  const isActivityEvent = incomingEvent?.type === 'activity';
  const isDrinkEvent = incomingEvent && incomingEvent.type !== 'activity'
    && incomingEvent.type !== 'minigame_prebrew'
    && incomingEvent.type !== 'minigame_start';

  // Activity → toast + log
  if (isActivityEvent && incomingEvent) {
    showToast(`${incomingEvent.emoji ?? '💬'} ${incomingEvent.message}`);
    addToLog({
      emoji: incomingEvent.emoji ?? '💬',
      message: incomingEvent.message,
      playerName: incomingEvent.fromPlayerName,
      playerColor: incomingEvent.characterColor,
      source: 'room',
    });
    room.dismissEvent();
  }

  // Minigame prebrew → fase 1 do guest
  if (incomingEvent?.type === 'minigame_prebrew' && !room.isHost) {
    setGuestMinigame({ phase: 'prebrew', hostName: incomingEvent.fromPlayerName, turn: incomingEvent.turn ?? game.state.turn });
    room.dismissEvent();
  }

  // Minigame start (formato enviado pelo host) → fase 3 do guest
  if (incomingEvent?.type === 'minigame_start' && !room.isHost) {
    setGuestMinigame(prev => prev
      ? { ...prev, phase: 'result', format: incomingEvent.minigameFormat }
      : { phase: 'result', hostName: incomingEvent.fromPlayerName, turn: incomingEvent.turn ?? game.state.turn, format: incomingEvent.minigameFormat }
    );
    room.dismissEvent();
  }

  function handleGuestPrebrew(drinks: number) {
    game.addDrinks(drinks);
    addToLog({ emoji: '🍺', message: `Pré-minigame — bebeu ${drinks} gole${drinks !== 1 ? 's' : ''}`, playerName: game.state.character?.name ?? 'Você', playerColor: game.state.character?.color ?? '#6366f1', source: 'self' });
    showToast(`🍺 +${drinks} (pré-minigame)`);
    setGuestMinigame(prev => prev ? { ...prev, phase: 'waiting' } : null);
  }

  function handleGuestResult(drinks: number) {
    if (drinks > 0) game.addDrinks(drinks);
    addToLog({ emoji: '🎮', message: `Minigame ${drinks > 0 ? '— perdi, bebeu ' + drinks : '— ganhei!'}`, playerName: game.state.character?.name ?? 'Você', playerColor: game.state.character?.color ?? '#6366f1', source: 'self' });
    if (drinks > 0) showToast(`😅 Perdeu! 🍺 +${drinks}`);
    else showToast('🏆 Ganhou o minigame!');
    setGuestMinigame(null);
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
    logEntries,
    onDrink: game.addDrinks,
    onActivateShield: game.activateShield,
    onUseShield: game.useShield,
    onUndo: game.undo,
    onToggleHomestretch: game.toggleHomestretch,
    onToggleJamboree: game.toggleJamboree,
    onAddStars: game.addStars,
    onIncrementTurn: game.incrementTurn,
    onLog: handleLog,
    showToast,
  };

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

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

      {/* Guest minigame modal — fases: prebrew → waiting → result */}
      {appMode === 'sala' && guestMinigame && room.status === 'playing' && !room.isHost && (
        <MinigameModal
          mode="guest"
          turn={guestMinigame.turn}
          multiplier={multiplier}
          hostName={guestMinigame.hostName}
          phase={guestMinigame.phase}
          format={guestMinigame.format}
          onConfirmPrebrew={handleGuestPrebrew}
          onConfirmResult={handleGuestResult}
          onClose={() => setGuestMinigame(null)}
        />
      )}

      {room.isReconnecting && (
        <div className="fixed inset-0 z-50 bg-gray-900/90 flex flex-col items-center justify-center gap-3">
          <div className="text-3xl animate-spin">🔄</div>
          <div className="text-white font-semibold">Reconectando à sala...</div>
        </div>
      )}

      {appMode === 'select' && (
        <ModeSelector onOffline={() => setMode('offline')} onSala={() => setMode('sala')} />
      )}

      {appMode === 'offline' && !game.state.character && (
        <CharacterSelect onStart={game.selectCharacter} />
      )}
      {appMode === 'offline' && game.state.character && (
        <GameTracker {...commonGameProps} onReset={() => { game.resetGame(); setMode('select'); }} onBroadcast={undefined} />
      )}

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
