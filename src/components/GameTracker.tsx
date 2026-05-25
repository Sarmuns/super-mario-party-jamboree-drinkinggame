import { useState, useCallback } from 'react';
import type { Character, RoomPlayer, RoomEvent } from '../types';
import { calcMultiplier } from '../lib/multiplier';
import { t } from '../lib/labels';
import type { LogEntry } from '../hooks/useLog';
import { Header } from './Header';
import { SpacesSection } from './SpacesSection';
import { DiceSection } from './DiceSection';
import { StarsSection } from './StarsSection';
import { RulesSection } from './RulesSection';
import { EndGameModal } from './EndGameModal';
import { MinigameModal } from './MinigameModal';
import { PlayersOverlay } from './PlayersOverlay';
import { PlayersStrip } from './PlayersStrip';
import { LogTab } from './LogTab';
import { BooModal } from './BooModal';
import { DuelModal } from './DuelModal';

interface Props {
  character: Character;
  totalDrinks: number;
  hasShield: boolean;
  isHomestretch: boolean;
  isJamboree: boolean;
  stars: number;
  turn: number;
  canUndo: boolean;
  logEntries: LogEntry[];
  onClearLog?: () => void;
  roomPlayers?: RoomPlayer[];
  roomCode?: string;
  roomPlayerId?: string;
  isHost?: boolean;
  displayName?: string;
  onBroadcast?: (event: RoomEvent) => void;
  onDrink: (count: number) => void;
  onSetDrinks: (value: number) => void;
  onActivateShield: () => void;
  onUseShield: () => void;
  onUndo: () => void;
  onToggleHomestretch: () => void;
  onToggleJamboree: () => void;
  onAddStars: (delta: number) => void;
  onIncrementTurn: () => void;
  onReset: () => void;
  onLog: (emoji: string, message: string) => void;
  showToast: (msg: string) => void;
}

export function GameTracker({
  character, totalDrinks, hasShield, isHomestretch, isJamboree,
  stars, turn, canUndo, logEntries, onClearLog,
  roomPlayers, roomCode, roomPlayerId, isHost, displayName, onBroadcast,
  onDrink, onSetDrinks, onActivateShield, onUseShield, onUndo,
  onToggleHomestretch, onToggleJamboree, onAddStars, onIncrementTurn,
  onReset, onLog, showToast,
}: Props) {
  const [activeTab, setActiveTab] = useState<'game' | 'log'>('game');
  const [showEndGame, setShowEndGame] = useState(false);
  const [showMinigame, setShowMinigame] = useState(false);
  const [isVsMinigame, setIsVsMinigame] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);
  const [showBoo, setShowBoo] = useState(false);
  const [showDuel, setShowDuel] = useState(false);

  const multiplier = calcMultiplier(isHomestretch, isJamboree);
  const isRoomMode = !!roomPlayers;

  const sendActivity = useCallback((emoji: string, msg: string) => {
    if (!onBroadcast) return;
    onBroadcast({
      type: 'activity',
      fromPlayerId: roomPlayerId ?? '',
      fromPlayerName: displayName ?? character.name,
      characterColor: character.color,
      message: msg,
      emoji,
      drinks: 0,
    });
  }, [onBroadcast, roomPlayerId, character.name, character.color]);

  // Log local + broadcast activity
  function logAndBroadcast(emoji: string, msg: string) {
    onLog(emoji, msg);
    sendActivity(emoji, msg);
  }

  function handleRoll1() {
    if (hasShield) {
      showToast(t.gameTracker.alreadyHasShield);
    } else {
      onActivateShield();
      showToast(t.gameTracker.shieldActivated);
      logAndBroadcast('🛡️', t.gameTracker.shieldActivatedLog);
    }
  }

  function handleRoll10() {
    const count = 1 * multiplier;
    onDrink(count);
    showToast(t.gameTracker.luckyTax(count));
    logAndBroadcast('🎰', t.gameTracker.luckyTaxLog(count));
  }

  function handleUseShieldFromHeader() {
    onUseShield();
    showToast(t.gameTracker.shieldUsed);
    logAndBroadcast('🛡️', t.gameTracker.shieldUsedLog);
  }

  // Casa VS → minigame sem avançar turno
  function handleVsMinigame() {
    setIsVsMinigame(true);
    setShowMinigame(true);
    if (onBroadcast) {
      onBroadcast({
        type: 'minigame_prebrew',
        fromPlayerId: roomPlayerId ?? '',
        fromPlayerName: displayName ?? character.name,
        characterColor: character.color,
        message: t.gameTracker.vsMinigameMessage(displayName ?? character.name),
        drinks: 1,
        turn,
      });
    }
  }

  // Host clicou em "Fim do Turno" → broadcast prebrew imediato
  function handleMinigameOpen() {
    setIsVsMinigame(false);
    setShowMinigame(true);
    if (onBroadcast) {
      onBroadcast({
        type: 'minigame_prebrew',
        fromPlayerId: roomPlayerId ?? '',
        fromPlayerName: displayName ?? character.name,
        characterColor: character.color,
        message: t.gameTracker.minigameOpenMessage(displayName ?? character.name, turn),
        drinks: 1,
        turn,
      });
    }
  }

  // Host selecionou formato → contabiliza prebrew agora + broadcast para guests
  function handleStartMinigame(format: string) {
    const preDrink = 1 * multiplier;
    onDrink(preDrink);
    showToast(t.gameTracker.prebrewToast(preDrink));
    onLog('🍺', t.gameTracker.prebrewLog(preDrink));
    if (onBroadcast) {
      onBroadcast({
        type: 'minigame_start',
        fromPlayerId: roomPlayerId ?? '',
        fromPlayerName: displayName ?? character.name,
        characterColor: character.color,
        message: t.gameTracker.minigameStartFormat(format),
        drinks: 1,
        turn,
        minigameFormat: format,
      });
    }
  }

  function handleMinigameConfirm(penalty: number, format: string) {
    if (penalty > 0) onDrink(penalty);
    if (!isVsMinigame) onIncrementTurn(); // VS Space não avança turno
    setShowMinigame(false);
    const label = isVsMinigame ? 'Casa VS' : `Turno ${turn}`;
    if (penalty > 0) {
      showToast(t.gameTracker.minigameLostToast(label, penalty));
      logAndBroadcast('🎮', t.gameTracker.minigameLostLog(label, format, penalty));
    } else {
      showToast(t.gameTracker.minigameWonToast(label));
      logAndBroadcast('🎮', t.gameTracker.minigameWonLog(label, format));
    }
  }

  function handleMinigameSkip() {
    if (!isVsMinigame) onIncrementTurn();
    setShowMinigame(false);
    showToast(isVsMinigame ? t.gameTracker.minigameSkipToastVs : t.gameTracker.minigameSkipToast(turn));
    onLog('🎮', isVsMinigame ? t.gameTracker.minigameSkipLogVs : t.gameTracker.minigameSkipLog(turn));
    // Avisa guests que o minigame foi cancelado (resolve BUG-01)
    if (onBroadcast) {
      onBroadcast({
        type: 'minigame_skip',
        fromPlayerId: roomPlayerId ?? '',
        fromPlayerName: displayName ?? character.name,
        characterColor: character.color,
        message: t.gameTracker.minigameSkipMessage,
        drinks: 0,
      });
    }
  }

  function handleBooConfirm(booType: 'star' | 'coin', victimId: string, victimName: string) {
    const drinks = booType === 'star' ? 3 * multiplier : 1 * multiplier;
    if (booType === 'star') onAddStars(1);
    const victimPart = victimName ? ` de ${victimName}` : '';
    if (victimId && onBroadcast) {
      onBroadcast({
        type: 'boo_steal',
        fromPlayerId: roomPlayerId ?? '',
        fromPlayerName: displayName ?? character.name,
        characterColor: character.color,
        message: booType === 'star'
          ? t.gameTracker.booStarMessage(displayName ?? character.name, victimName)
          : t.gameTracker.booCoinMessage(displayName ?? character.name, victimName),
        drinks,
        targetPlayerId: victimId,
        booType,
      });
    }
    if (booType === 'star') {
      showToast(t.gameTracker.booStarToast(victimPart));
      logAndBroadcast('👻', t.gameTracker.booStarLog(victimPart));
    } else {
      showToast(t.gameTracker.booCoinToast(victimPart));
      logAndBroadcast('👻', t.gameTracker.booCoinLog(victimPart));
    }
    setShowBoo(false);
  }

  function handleDuelChallenge(opponentId: string, opponentName: string) {
    const preDrink = 1 * multiplier;
    onDrink(preDrink);
    const isCpu = opponentId === '__cpu__' || !opponentId;
    if (!isCpu && onBroadcast) {
      onBroadcast({
        type: 'duel_challenge',
        fromPlayerId: roomPlayerId ?? '',
        fromPlayerName: displayName ?? character.name,
        characterColor: character.color,
        message: t.gameTracker.duelChallengeMessage(displayName ?? character.name, preDrink),
        drinks: preDrink,
        targetPlayerId: opponentId,
      });
    }
    const label = opponentName && opponentName !== 'oponente' ? ` vs ${opponentName}` : '';
    logAndBroadcast('⚔️', t.gameTracker.duelChallengeLog(label, preDrink));
    showToast(t.gameTracker.duelChallengeToast(label, preDrink));
  }

  function handleDuelCancel(opponentId: string, opponentName: string) {
    const isCpu = opponentId === '__cpu__' || !opponentId;
    if (!isCpu && onBroadcast) {
      onBroadcast({
        type: 'duel_cancelled',
        fromPlayerId: roomPlayerId ?? '',
        fromPlayerName: displayName ?? character.name,
        characterColor: character.color,
        message: t.gameTracker.duelCancelledMessage(displayName ?? character.name),
        drinks: 0,
        targetPlayerId: opponentId,
      });
    }
    const label = opponentName && opponentName !== 'oponente' ? ` vs ${opponentName}` : '';
    showToast(t.gameTracker.duelCancelToast(label));
    onLog('⚔️', t.gameTracker.duelCancelLog(label));
    setShowDuel(false);
  }

  function handleDuelResult(lost: boolean, opponentId: string, opponentName: string) {
    const loserDrinks = 2 * multiplier;
    const isCpu = opponentId === '__cpu__' || !opponentId;
    const label = opponentName && opponentName !== 'oponente' ? ` vs ${opponentName}` : '';
    if (lost) {
      onDrink(loserDrinks);
      showToast(t.gameTracker.duelLostToast(label, loserDrinks));
      logAndBroadcast('😅', t.gameTracker.duelLostLog(label, loserDrinks));
    } else {
      if (!isCpu && onBroadcast) {
        onBroadcast({
          type: 'duel_result',
          fromPlayerId: roomPlayerId ?? '',
          fromPlayerName: displayName ?? character.name,
          characterColor: character.color,
          message: t.gameTracker.duelWonMessage(displayName ?? character.name),
          drinks: loserDrinks,
          targetPlayerId: opponentId,
        });
      }
      showToast(t.gameTracker.duelWonToast(label));
      logAndBroadcast('🏆', t.gameTracker.duelWonLog(label));
    }
    setShowDuel(false);
  }

  function handleAddOne() {
    onDrink(1);
    showToast(t.gameTracker.addOneToast);
    logAndBroadcast('🍺', t.gameTracker.addOneLog);
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#111827' }}>
      <Header
        character={character} totalDrinks={totalDrinks} hasShield={hasShield}
        isHomestretch={isHomestretch} isJamboree={isJamboree} stars={stars} turn={turn} canUndo={canUndo}
        roomPlayerCount={roomPlayers?.length}
        onUseShield={handleUseShieldFromHeader} onToggleHomestretch={onToggleHomestretch}
        onToggleJamboree={onToggleJamboree} onReset={onReset}
        onUndo={() => { onUndo(); onLog('↩', t.gameTracker.undoLog); }}
        onAddOne={handleAddOne}
        onSetDrinks={(v) => {
          onSetDrinks(v);
          showToast(t.gameTracker.drinkAdjustedToast(v));
          logAndBroadcast('✏️', t.gameTracker.drinkAdjustedLog(v));
        }}
        onShowPlayers={isRoomMode ? () => setShowPlayers(true) : undefined}
      />

      {isRoomMode && roomPlayers && roomPlayerId && (
        <PlayersStrip players={roomPlayers} myPlayerId={roomPlayerId} />
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-gray-900 shrink-0">
        <button
          onClick={() => setActiveTab('game')}
          className="flex-1 py-2.5 text-sm font-semibold transition-colors"
          style={activeTab === 'game'
            ? { color: 'var(--accent)', borderBottom: '2px solid var(--accent)' }
            : { color: '#6b7280' }}>
          {t.gameTracker.tabGame}
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className="flex-1 py-2.5 text-sm font-semibold transition-colors relative"
          style={activeTab === 'log'
            ? { color: 'var(--accent)', borderBottom: '2px solid var(--accent)' }
            : { color: '#6b7280' }}>
          {t.gameTracker.tabLog}
          {activeTab === 'game' && logEntries.length > 0 && (
            <span className="absolute top-1.5 right-6 w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>
      </div>

      {/* Conteúdo da aba */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'game' ? (
          <div className="divide-y divide-gray-800">
            <SpacesSection multiplier={multiplier} hasShield={hasShield}
              onDrink={onDrink} onUseShield={onUseShield} showToast={showToast}
              onBroadcast={onBroadcast} isRoomMode={isRoomMode}
              characterName={character.name} characterColor={character.color}
              roomPlayerId={roomPlayerId}
              onActivity={logAndBroadcast}
              onLogLocal={onLog}
              onTriggerMinigame={handleVsMinigame}
            />

            <DiceSection hasShield={hasShield} multiplier={multiplier}
              onRoll1={handleRoll1} onRoll10={handleRoll10} />

            <StarsSection multiplier={multiplier} onDrink={onDrink}
              onStarChange={onAddStars} showToast={showToast}
              onActivity={logAndBroadcast} characterName={character.name}
              onShowBoo={() => setShowBoo(true)}
              onShowDuel={() => setShowDuel(true)} />

            <RulesSection />

            <div className="px-4 py-6 flex flex-col gap-3">
              {(!isRoomMode || isHost) && (
                <button onClick={isRoomMode ? handleMinigameOpen : () => setShowMinigame(true)}
                  className="w-full py-4 rounded-2xl text-sm font-bold text-white active:scale-95 transition-transform"
                  style={{ backgroundColor: 'var(--accent)', opacity: 0.9 }}>
                  {t.gameTracker.endTurn(turn)}
                </button>
              )}
              {isRoomMode && !isHost && (
                <div className="text-center text-xs text-gray-600 py-2">
                  {t.gameTracker.waitingHost}
                </div>
              )}

              <button onClick={() => setShowEndGame(true)}
                className="w-full py-3 rounded-2xl text-sm font-bold text-gray-400 border border-gray-700 bg-gray-800/60 active:scale-95 transition-transform">
                {t.gameTracker.endGame}
              </button>
            </div>
          </div>
        ) : (
          <LogTab entries={logEntries} onClear={onClearLog} />
        )}
      </div>

      {showMinigame && (
        <MinigameModal mode="host" turn={turn} multiplier={multiplier}
          onStartMinigame={handleStartMinigame}
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

      {showBoo && (
        <BooModal
          roomPlayers={roomPlayers}
          myPlayerId={roomPlayerId}
          multiplier={multiplier}
          onConfirm={handleBooConfirm}
          onClose={() => setShowBoo(false)}
        />
      )}

      {showDuel && (
        <DuelModal
          roomPlayers={roomPlayers}
          myPlayerId={roomPlayerId}
          multiplier={multiplier}
          onChallenge={handleDuelChallenge}
          onResult={handleDuelResult}
          onCancelAfterChallenge={handleDuelCancel}
          onClose={() => setShowDuel(false)}
        />
      )}
    </div>
  );
}
