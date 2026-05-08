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

  // Personagem escolhido dentro da sala
  async function handleRoomCharacterSelect(character: Character) {
    game.selectCharacter(character);
    await room.selectRoomCharacter(character);
  }

  const multiplier = (game.state.isHomestretch ? 2 : 1) * (game.state.isJamboree ? 2 : 1);

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

      {/* Incoming event modal (sala only) */}
      {appMode === 'sala' && room.incomingEvent && room.status === 'playing' && (
        <IncomingEventModal
          event={room.incomingEvent}
          hasShield={game.state.hasShield}
          multiplier={multiplier}
          onDrink={game.addDrinks}
          onUseShield={() => { game.useShield(); showToast('Escudo usado! 🛡️'); }}
          onDismiss={room.dismissEvent}
        />
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

      {/* 1. Entrar/criar sala */}
      {appMode === 'sala' && (room.status === 'idle' || room.status === 'connecting' || room.status === 'error') && (
        <RoomEntry
          error={room.error}
          isConnecting={room.status === 'connecting'}
          onCreateRoom={room.createRoom}
          onJoinRoom={room.joinRoom}
          onBack={() => setMode('select')}
        />
      )}

      {/* 2. Escolher personagem dentro da sala (vê personagens bloqueados em tempo real) */}
      {appMode === 'sala' && room.status === 'lobby' && !game.state.character && (
        <CharacterSelect
          onStart={handleRoomCharacterSelect}
          roomPlayers={room.players}
          myPlayerId={room.playerId}
        />
      )}

      {/* 3. Lobby (personagem já escolhido, aguardando host) */}
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

      {/* 4. Jogo */}
      {appMode === 'sala' && room.status === 'playing' && game.state.character && (
        <GameTracker
          {...commonGameProps}
          onReset={handleLeaveRoom}
          onBroadcast={room.broadcast}
          roomPlayers={room.players}
          roomCode={room.roomCode ?? undefined}
          roomPlayerId={room.playerId}
        />
      )}
    </>
  );
}
