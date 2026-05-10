import { useState, useEffect, useRef, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getPlayerId } from '../lib/roomUtils';
import type { RoomPlayer, RoomEvent, RoomStatus, Character } from '../types';

const PLACEHOLDER: Omit<RoomPlayer, 'playerId' | 'isHost' | 'joinedAt'> = {
  name: '',
  characterId: '',
  characterColor: '#374151',
  characterIcon: '',
  characterPortrait: '',
  totalDrinks: 0,
  stars: 0,
  hasShield: false,
};

// Persiste dados mínimos da sala para reconexão
const ROOM_PERSIST_KEY = 'smpj-room-session';

interface RoomSession {
  code: string;
  isHost: boolean;
  status: 'lobby' | 'playing';
}

function saveSession(session: RoomSession | null) {
  if (session) localStorage.setItem(ROOM_PERSIST_KEY, JSON.stringify(session));
  else localStorage.removeItem(ROOM_PERSIST_KEY);
}

function loadSession(): RoomSession | null {
  try {
    const raw = localStorage.getItem(ROOM_PERSIST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function useRoom() {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [status, setStatus] = useState<RoomStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [incomingEvent, setIncomingEvent] = useState<RoomEvent | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [presenceNotification, setPresenceNotification] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const myStateRef = useRef<RoomPlayer | null>(null);
  const savedHostRef = useRef<boolean>(false);

  const playerId = getPlayerId();

  const isHost = (() => {
    // Durante reconexão, usamos o valor salvo antes do sync chegar
    const fromPresence = players.find(p => p.playerId === playerId)?.isHost;
    return fromPresence ?? savedHostRef.current;
  })();

  const myPlayer = players.find(p => p.playerId === playerId);

  function syncPresence(channel: RealtimeChannel) {
    const raw = channel.presenceState<RoomPlayer>();
    const all: RoomPlayer[] = Object.values(raw).flat();
    const byPlayer = new Map<string, RoomPlayer>();
    for (const p of all) {
      const existing = byPlayer.get(p.playerId);
      if (!existing) {
        byPlayer.set(p.playerId, p);
      } else if (p.characterId && !existing.characterId) {
        // tem personagem, outro não → prefere este
        byPlayer.set(p.playerId, p);
      } else if (p.characterId && existing.characterId) {
        // ambos têm personagem → trackTimestamp decide qual é o mais recente
        if ((p.trackTimestamp ?? 0) > (existing.trackTimestamp ?? 0)) {
          byPlayer.set(p.playerId, p);
        }
      }
    }
    const deduped = Array.from(byPlayer.values()).sort((a, b) => a.joinedAt - b.joinedAt);
    setPlayers(deduped);
  }

  function buildChannel(code: string): RealtimeChannel {
    return supabase
      .channel(`room:${code}`, { config: { presence: { key: playerId } } })
      .on('presence', { event: 'sync' }, () => syncPresence(channelRef.current!))
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // Só notifica quem tem personagem definido (filtra updates de PLACEHOLDER)
        const others = (newPresences as unknown as RoomPlayer[]).filter(
          p => p.playerId !== playerId && p.characterId
        );
        if (others.length > 0) {
          setPresenceNotification(`${others[0].name || 'Alguém'} entrou na sala 👋`);
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const ch = channelRef.current;
        const others = (leftPresences as unknown as RoomPlayer[]).filter(
          p => p.playerId !== playerId && p.characterId
        );
        if (others.length > 0 && ch) {
          // Verifica se o player ainda está no canal (leave pode ser só um track update)
          const stillPresent = Object.values(ch.presenceState()).flat()
            .some((p: any) => p.playerId === others[0].playerId);
          if (!stillPresent) {
            setPresenceNotification(`${others[0].name || 'Alguém'} saiu da sala 💨`);
          }
        }
      })
      .on('broadcast', { event: 'game_event' }, ({ payload }) => {
        setIncomingEvent(payload as RoomEvent);
      })
      .on('broadcast', { event: 'game_start' }, () => {
        setStatus('playing');
        const session = loadSession();
        if (session) saveSession({ ...session, status: 'playing' });
      });
  }

  async function trackPlayer(channel: RealtimeChannel, playerState: RoomPlayer) {
    const stamped = { ...playerState, trackTimestamp: Date.now() };
    myStateRef.current = stamped;
    await channel.track(stamped);
  }

  // Reconecta a uma sala existente (chamada ao voltar do background ou recarregar)
  const reconnect = useCallback(async (session: RoomSession, savedState?: Partial<RoomPlayer>): Promise<boolean> => {
    setIsReconnecting(true);
    setError(null);
    savedHostRef.current = session.isHost;

    // Remove canal antigo se existir
    if (channelRef.current) {
      await channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    const channel = buildChannel(session.code);
    channelRef.current = channel;

    return new Promise(resolve => {
      channel.subscribe(async (s) => {
        if (s === 'SUBSCRIBED') {
          // Se era host e status era playing, verifica se ainda há outros
          // (sala pode ter sumido se todos saíram)
          await new Promise(r => setTimeout(r, 1200));

          const raw = channel.presenceState<RoomPlayer>();
          const others = Object.values(raw).flat().filter(p => p.playerId !== playerId);

          // Host pode reconectar mesmo sem outros (sala é dele)
          // Guest precisa encontrar o host
          if (!session.isHost && !others.some(p => p.isHost)) {
            await channel.unsubscribe();
            channelRef.current = null;
            saveSession(null);
            setStatus('idle');
            setError('Sala não encontrada — o host pode ter saído.');
            setIsReconnecting(false);
            resolve(false);
            return;
          }

          // Lê o gameStatus da presença do host para determinar
          // se o jogo já começou (guest pode ter perdido o broadcast game_start)
          const hostPlayer = Object.values(channel.presenceState<RoomPlayer>())
            .flat()
            .find(p => p.isHost && p.playerId !== playerId);
          const actualStatus: 'lobby' | 'playing' =
            hostPlayer?.gameStatus ?? session.status;

          const state: RoomPlayer = {
            ...PLACEHOLDER,
            ...savedState,
            playerId,
            isHost: session.isHost,
            gameStatus: session.isHost ? actualStatus : undefined,
            joinedAt: myStateRef.current?.joinedAt ?? Date.now(),
          };
          await trackPlayer(channel, state);

          setRoomCode(session.code);
          setStatus(actualStatus);
          setIsReconnecting(false);
          resolve(true);
        } else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
          setIsReconnecting(false);
          setStatus('idle');
          setError('Erro ao reconectar.');
          resolve(false);
        }
      });
    });
  }, []);

  const createRoom = useCallback(async (code: string): Promise<boolean> => {
    setStatus('connecting');
    setError(null);
    savedHostRef.current = true;
    const channel = buildChannel(code);
    channelRef.current = channel;

    return new Promise(resolve => {
      channel.subscribe(async (s) => {
        if (s === 'SUBSCRIBED') {
          const state: RoomPlayer = { ...PLACEHOLDER, playerId, isHost: true, joinedAt: Date.now() };
          await trackPlayer(channel, state);
          setRoomCode(code);
          setStatus('lobby');
          saveSession({ code, isHost: true, status: 'lobby' });
          resolve(true);
        } else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
          setError('Erro ao criar sala. Verifique sua conexão.');
          setStatus('error');
          resolve(false);
        }
      });
    });
  }, []);

  const joinRoom = useCallback(async (code: string): Promise<boolean> => {
    setStatus('connecting');
    setError(null);
    savedHostRef.current = false;
    const channel = buildChannel(code);
    channelRef.current = channel;

    return new Promise(resolve => {
      channel.subscribe(async (s) => {
        if (s === 'SUBSCRIBED') {
          await new Promise(r => setTimeout(r, 1500));
          const raw = channel.presenceState<RoomPlayer>();
          const others = Object.values(raw).flat().filter(p => p.playerId !== playerId);
          const hasHost = others.some(p => p.isHost);

          if (!hasHost) {
            await channel.unsubscribe();
            channelRef.current = null;
            setError('Sala não encontrada. Verifique o código.');
            setStatus('error');
            resolve(false);
            return;
          }

          const state: RoomPlayer = { ...PLACEHOLDER, playerId, isHost: false, joinedAt: Date.now() };
          await trackPlayer(channel, state);
          setRoomCode(code);
          setStatus('lobby');
          saveSession({ code, isHost: false, status: 'lobby' });
          resolve(true);
        } else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
          setError('Erro ao entrar na sala.');
          setStatus('error');
          resolve(false);
        }
      });
    });
  }, []);

  const selectRoomCharacter = useCallback(async (character: Character, displayName?: string) => {
    if (!channelRef.current || !myStateRef.current) return;
    const updated: RoomPlayer = {
      ...myStateRef.current,
      name: displayName || character.name,
      characterId: character.id,
      characterColor: character.color,
      characterIcon: character.icon_url,
      characterPortrait: character.portrait_url,
    };
    await trackPlayer(channelRef.current, updated);
  }, []);

  const updateMyState = useCallback(async (updates: Partial<RoomPlayer>) => {
    if (!channelRef.current || !myStateRef.current) return;
    const updated = { ...myStateRef.current, ...updates };
    await trackPlayer(channelRef.current, updated);
  }, []);

  const broadcast = useCallback(async (event: RoomEvent) => {
    if (!channelRef.current) return;
    await channelRef.current.send({ type: 'broadcast', event: 'game_event', payload: event });
  }, []);

  const startGame = useCallback(async () => {
    if (!channelRef.current || !isHost) return;
    // Atualiza presença do host com gameStatus=playing ANTES do broadcast
    // Assim guests que reconectarem depois vão ler isso da presença
    if (myStateRef.current) {
      await trackPlayer(channelRef.current, { ...myStateRef.current, gameStatus: 'playing' });
    }
    await channelRef.current.send({ type: 'broadcast', event: 'game_start', payload: {} });
    setStatus('playing');
    const session = loadSession();
    if (session) saveSession({ ...session, status: 'playing' });
  }, [isHost]);

  const leaveRoom = useCallback(async () => {
    if (channelRef.current) {
      await channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    myStateRef.current = null;
    savedHostRef.current = false;
    saveSession(null);
    setRoomCode(null);
    setPlayers([]);
    setStatus('idle');
    setError(null);
    setIncomingEvent(null);
    setPresenceNotification(null);
  }, []);

  const dismissEvent = useCallback(() => setIncomingEvent(null), []);
  const dismissPresenceNotification = useCallback(() => setPresenceNotification(null), []);

  // Reconecta ao voltar do background (visibilitychange)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') return;
      if (!roomCode || !channelRef.current) return;

      // Verifica se o canal ainda está subscrito
      const state = (channelRef.current as any).state;
      if (state === 'joined') return; // ainda conectado

      const session = loadSession();
      if (session) {
        reconnect(session, myStateRef.current ?? undefined);
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [roomCode, reconnect]);

  useEffect(() => () => { channelRef.current?.unsubscribe(); }, []);

  return {
    roomCode, players, status, error, incomingEvent, isReconnecting, presenceNotification,
    isHost, playerId, myPlayer,
    reconnect, createRoom, joinRoom, selectRoomCharacter, updateMyState, broadcast,
    startGame, leaveRoom, dismissEvent, dismissPresenceNotification,
    loadSession,
  };
}
