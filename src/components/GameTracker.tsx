import { useState, useCallback } from 'react';
import type { Character, RoomPlayer, RoomEvent } from '../types';
import { calcMultiplier } from '../lib/multiplier';
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
  roomPlayers, roomCode, roomPlayerId, isHost, onBroadcast,
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
      fromPlayerName: character.name,
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
      showToast('Já tem escudo! 🛡️');
    } else {
      onActivateShield();
      showToast('Escudo ativado! 🛡️');
      logAndBroadcast('🛡️', 'Tirou 1 no dado — escudo ativado');
    }
  }

  function handleRoll10() {
    const count = 1 * multiplier;
    onDrink(count);
    showToast(`Imposto da sorte! 🎰 +${count} gole${count !== 1 ? 's' : ''}`);
    logAndBroadcast('🎰', `Tirou 10 no dado — pagou ${count} gole${count !== 1 ? 's' : ''}`);
  }

  function handleUseShieldFromHeader() {
    onUseShield();
    showToast('Escudo usado! 🛡️ Comunique à mesa.');
    logAndBroadcast('🛡️', 'Usou o escudo manualmente');
  }

  // Casa VS → minigame sem avançar turno
  function handleVsMinigame() {
    setIsVsMinigame(true);
    setShowMinigame(true);
    if (onBroadcast) {
      onBroadcast({
        type: 'minigame_prebrew',
        fromPlayerId: roomPlayerId ?? '',
        fromPlayerName: character.name,
        characterColor: character.color,
        message: `${character.name} caiu na Casa VS — minigame!`,
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
        fromPlayerName: character.name,
        characterColor: character.color,
        message: `${character.name} encerrou o Turno ${turn} — beba antes do minigame!`,
        drinks: 1,
        turn,
      });
    }
  }

  // Host selecionou formato → broadcast para guests entrarem na fase de resultado
  function handleStartMinigame(format: string) {
    if (onBroadcast) {
      onBroadcast({
        type: 'minigame_start',
        fromPlayerId: roomPlayerId ?? '',
        fromPlayerName: character.name,
        characterColor: character.color,
        message: `Formato: ${format.toUpperCase()}`,
        drinks: 1,
        turn,
        minigameFormat: format,
      });
    }
  }

  function handleMinigameConfirm(drinks: number, format: string) {
    onDrink(drinks);
    if (!isVsMinigame) onIncrementTurn(); // VS Space não avança turno
    setShowMinigame(false);
    const label = isVsMinigame ? 'Casa VS' : `Turno ${turn}`;
    showToast(`🎮 ${label} — minigame! 🍺 +${drinks}`);
    logAndBroadcast('🎮', `${label} — ${format.toUpperCase()} — bebeu ${drinks} gole${drinks !== 1 ? 's' : ''}`);
  }

  function handleMinigameSkip() {
    if (!isVsMinigame) onIncrementTurn();
    setShowMinigame(false);
    showToast(isVsMinigame ? 'Minigame VS pulado' : `Turno ${turn} encerrado`);
    onLog('🎮', isVsMinigame ? 'Casa VS — minigame pulado' : `Turno ${turn} encerrado (minigame pulado)`);
    // Avisa guests que o minigame foi cancelado (resolve BUG-01)
    if (onBroadcast) {
      onBroadcast({
        type: 'minigame_skip',
        fromPlayerId: roomPlayerId ?? '',
        fromPlayerName: character.name,
        characterColor: character.color,
        message: 'Minigame cancelado pelo host',
        drinks: 0,
      });
    }
  }

  function handleBooConfirm(victimId: string, victimName: string, drinks: number) {
    onAddStars(1);
    if (onBroadcast) {
      onBroadcast({
        type: 'boo_steal',
        fromPlayerId: roomPlayerId ?? '',
        fromPlayerName: character.name,
        characterColor: character.color,
        message: `${character.name} usou o Boo em ${victimName}!`,
        drinks,
        targetPlayerId: victimId,
      });
    }
    showToast(`👻 +1⭐ roubada de ${victimName}!`);
    logAndBroadcast('👻', `Usou o Boo em ${victimName} — +1⭐`);
    setShowBoo(false);
  }

  function handleDuelChallenge(opponentId: string, opponentName: string) {
    const preDrink = 1 * multiplier;
    onDrink(preDrink);
    if (onBroadcast) {
      onBroadcast({
        type: 'duel_challenge',
        fromPlayerId: roomPlayerId ?? '',
        fromPlayerName: character.name,
        characterColor: character.color,
        message: `${character.name} te desafiou para um duelo! Beba ${preDrink} antes`,
        drinks: preDrink,
        targetPlayerId: opponentId,
      });
    }
    logAndBroadcast('⚔️', `Desafiou ${opponentName} — bebeu ${preDrink} (pré-duelo)`);
    showToast(`⚔️ Duelo com ${opponentName}! Pré-duelo: +${preDrink}🍺`);
  }

  function handleDuelResult(lost: boolean, opponentId: string, opponentName: string) {
    const loserDrinks = 2 * multiplier;
    if (lost) {
      onDrink(loserDrinks);
      showToast(`😅 Perdeu o duelo! 🍺 +${loserDrinks}`);
      logAndBroadcast('😅', `Perdeu o duelo vs ${opponentName} — bebeu ${loserDrinks} goles`);
    } else {
      if (onBroadcast) {
        onBroadcast({
          type: 'duel_result',
          fromPlayerId: roomPlayerId ?? '',
          fromPlayerName: character.name,
          characterColor: character.color,
          message: `${character.name} ganhou o duelo!`,
          drinks: loserDrinks,
          targetPlayerId: opponentId,
        });
      }
      showToast(`🏆 Ganhou o duelo vs ${opponentName}!`);
      logAndBroadcast('🏆', `Ganhou o duelo vs ${opponentName}`);
    }
    setShowDuel(false);
  }

  function handleAddOne() {
    onDrink(1);
    showToast('🍺 +1');
    logAndBroadcast('🍺', 'Bebeu 1 gole avulso');
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#111827' }}>
      <Header
        character={character} totalDrinks={totalDrinks} hasShield={hasShield}
        isHomestretch={isHomestretch} isJamboree={isJamboree} stars={stars} turn={turn} canUndo={canUndo}
        roomPlayerCount={roomPlayers?.length}
        onUseShield={handleUseShieldFromHeader} onToggleHomestretch={onToggleHomestretch}
        onToggleJamboree={onToggleJamboree} onReset={onReset}
        onUndo={() => { onUndo(); onLog('↩', 'Desfez a última ação'); }}
        onAddOne={handleAddOne}
        onSetDrinks={(v) => {
          onSetDrinks(v);
          showToast(`✏️ Goles ajustados para ${v}`);
          logAndBroadcast('✏️', `Ajustou goles manualmente para ${v}`);
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
          🎮 Jogo
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className="flex-1 py-2.5 text-sm font-semibold transition-colors relative"
          style={activeTab === 'log'
            ? { color: 'var(--accent)', borderBottom: '2px solid var(--accent)' }
            : { color: '#6b7280' }}>
          📋 Log
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
              onActivity={logAndBroadcast} characterName={character.name} />

            <RulesSection />

            <div className="px-4 py-6 flex flex-col gap-3">
              {(!isRoomMode || isHost) && (
                <button onClick={isRoomMode ? handleMinigameOpen : () => setShowMinigame(true)}
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
              {isRoomMode && roomPlayers && roomPlayerId && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setShowBoo(true)}
                    className="py-3 rounded-2xl text-sm font-bold text-gray-300 border border-gray-600 bg-gray-800/60 active:scale-95 transition-transform">
                    👻 Usei o Boo
                  </button>
                  <button onClick={() => setShowDuel(true)}
                    className="py-3 rounded-2xl text-sm font-bold text-gray-300 border border-gray-600 bg-gray-800/60 active:scale-95 transition-transform">
                    ⚔️ Duelo
                  </button>
                </div>
              )}
              <button onClick={() => setShowEndGame(true)}
                className="w-full py-3 rounded-2xl text-sm font-bold text-gray-400 border border-gray-700 bg-gray-800/60 active:scale-95 transition-transform">
                🏁 Fim de Partida
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

      {showBoo && roomPlayers && roomPlayerId && (
        <BooModal
          roomPlayers={roomPlayers}
          myPlayerId={roomPlayerId}
          multiplier={multiplier}
          onConfirm={handleBooConfirm}
          onClose={() => setShowBoo(false)}
        />
      )}

      {showDuel && roomPlayers && roomPlayerId && (
        <DuelModal
          roomPlayers={roomPlayers}
          myPlayerId={roomPlayerId}
          multiplier={multiplier}
          onChallenge={handleDuelChallenge}
          onResult={handleDuelResult}
          onClose={() => setShowDuel(false)}
        />
      )}
    </div>
  );
}
