import { useState, useCallback } from 'react';
import type { Character, RoomPlayer, RoomEvent } from '../types';
import { Header } from './Header';
import { SpacesSection } from './SpacesSection';
import { DiceSection } from './DiceSection';
import { StarsSection } from './StarsSection';
import { RulesSection } from './RulesSection';
import { EndGameModal } from './EndGameModal';
import { MinigameModal } from './MinigameModal';
import { PlayersOverlay } from './PlayersOverlay';
import { PlayersStrip } from './PlayersStrip';

interface Props {
  character: Character;
  totalDrinks: number;
  hasShield: boolean;
  isHomestretch: boolean;
  isJamboree: boolean;
  stars: number;
  turn: number;
  canUndo: boolean;
  roomPlayers?: RoomPlayer[];
  roomCode?: string;
  roomPlayerId?: string;
  isHost?: boolean;
  onBroadcast?: (event: RoomEvent) => void;
  onDrink: (count: number) => void;
  onActivateShield: () => void;
  onUseShield: () => void;
  onUndo: () => void;
  onToggleHomestretch: () => void;
  onToggleJamboree: () => void;
  onAddStars: (delta: number) => void;
  onIncrementTurn: () => void;
  onReset: () => void;
  showToast: (msg: string) => void;
}

export function GameTracker({
  character, totalDrinks, hasShield, isHomestretch, isJamboree,
  stars, turn, canUndo,
  roomPlayers, roomCode, roomPlayerId, isHost, onBroadcast,
  onDrink, onActivateShield, onUseShield, onUndo,
  onToggleHomestretch, onToggleJamboree, onAddStars, onIncrementTurn,
  onReset, showToast,
}: Props) {
  const [showEndGame, setShowEndGame] = useState(false);
  const [showMinigame, setShowMinigame] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);

  const multiplier = (isHomestretch ? 2 : 1) * (isJamboree ? 2 : 1);
  const isRoomMode = !!roomPlayers;

  // Broadcast informacional para os outros (não exige ação)
  const sendActivity = useCallback((emoji: string, msg: string) => {
    if (!onBroadcast) return;
    onBroadcast({
      type: 'activity',
      fromPlayerId: roomPlayerId ?? '',
      fromPlayerName: character.name,
      characterColor: character.color,
      message: msg,
      emoji,
      drinks: 0,
    });
  }, [onBroadcast, roomPlayerId, character.name, character.color]);

  function handleRoll1() {
    if (hasShield) {
      showToast('Já tem escudo! 🛡️');
    } else {
      onActivateShield();
      showToast('Escudo ativado! 🛡️');
      sendActivity('🛡️', `${character.name} ativou o escudo`);
    }
  }

  function handleRoll10() {
    const count = 1 * multiplier;
    onDrink(count);
    showToast(`Imposto da sorte! 🎰 +${count} gole${count !== 1 ? 's' : ''}`);
    sendActivity('🎰', `${character.name} tirou 10 — bebeu ${count} gole${count !== 1 ? 's' : ''}`);
  }

  function handleUseShieldFromHeader() {
    onUseShield();
    showToast('Escudo usado! 🛡️ Comunique à mesa.');
    sendActivity('🛡️', `${character.name} usou o escudo`);
  }

  function handleMinigameConfirm(drinks: number, format: string) {
    onDrink(drinks);
    onIncrementTurn();
    setShowMinigame(false);
    showToast(`🎮 Turno ${turn} encerrado! 🍺 +${drinks}`);
    if (onBroadcast) {
      onBroadcast({
        type: 'minigame_start',
        fromPlayerId: roomPlayerId ?? '',
        fromPlayerName: character.name,
        characterColor: character.color,
        message: `${character.name} encerrou o Turno ${turn}!`,
        drinks: 1,
        turn,
        minigameFormat: format,
      });
    }
  }

  function handleMinigameSkip() {
    onIncrementTurn();
    setShowMinigame(false);
    showToast(`Turno ${turn} encerrado`);
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#111827' }}>
      <Header
        character={character} totalDrinks={totalDrinks} hasShield={hasShield}
        isHomestretch={isHomestretch} isJamboree={isJamboree} stars={stars} turn={turn} canUndo={canUndo}
        roomPlayerCount={roomPlayers?.length}
        onUseShield={handleUseShieldFromHeader} onToggleHomestretch={onToggleHomestretch}
        onToggleJamboree={onToggleJamboree} onReset={onReset} onUndo={onUndo}
        onAddOne={() => { onDrink(1); showToast('🍺 +1'); sendActivity('🍺', `${character.name} bebeu 1 gole`); }}
        onShowPlayers={isRoomMode ? () => setShowPlayers(true) : undefined}
      />

      {/* Faixa de outros jogadores — só em sala */}
      {isRoomMode && roomPlayers && roomPlayerId && (
        <PlayersStrip players={roomPlayers} myPlayerId={roomPlayerId} />
      )}

      <div className="flex-1 overflow-y-auto divide-y divide-gray-800">
        <SpacesSection multiplier={multiplier} hasShield={hasShield}
          onDrink={onDrink} onUseShield={onUseShield} showToast={showToast}
          onBroadcast={onBroadcast} isRoomMode={isRoomMode}
          characterName={character.name} characterColor={character.color}
          roomPlayerId={roomPlayerId} onActivity={sendActivity}
        />

        <DiceSection hasShield={hasShield} multiplier={multiplier}
          onRoll1={handleRoll1} onRoll10={handleRoll10} />

        <StarsSection multiplier={multiplier} onDrink={onDrink}
          onStarChange={onAddStars} showToast={showToast}
          onActivity={sendActivity} characterName={character.name} />

        <RulesSection />

        <div className="px-4 py-6 flex flex-col gap-3">
          {(!isRoomMode || isHost) && (
            <button onClick={() => setShowMinigame(true)}
              className="w-full py-4 rounded-2xl text-sm font-bold text-white active:scale-95 transition-transform"
              style={{ backgroundColor: 'var(--accent)', opacity: 0.9 }}>
              🎮 Fim do Turno {turn}
            </button>
          )}
          {isRoomMode && !isHost && (
            <div className="text-center text-xs text-gray-600 py-2">
              Aguardando o host encerrar o turno...
            </div>
          )}
          <button onClick={() => setShowEndGame(true)}
            className="w-full py-3 rounded-2xl text-sm font-bold text-gray-400 border border-gray-700 bg-gray-800/60 active:scale-95 transition-transform">
            🏁 Fim de Partida
          </button>
        </div>
      </div>

      {showMinigame && (
        <MinigameModal mode="host" turn={turn} multiplier={multiplier}
          onConfirm={handleMinigameConfirm} onClose={handleMinigameSkip} />
      )}

      {showEndGame && (
        <EndGameModal character={character} totalDrinks={totalDrinks} stars={stars} turn={turn}
          onClose={() => setShowEndGame(false)}
          onReset={() => { setShowEndGame(false); onReset(); }} />
      )}

      {showPlayers && roomPlayers && roomCode && roomPlayerId && (
        <PlayersOverlay players={roomPlayers} playerId={roomPlayerId} roomCode={roomCode}
          onClose={() => setShowPlayers(false)} />
      )}
    </div>
  );
}
