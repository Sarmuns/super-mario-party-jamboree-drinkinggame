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
  totalDrinks: 0,
  stars: 0,
  hasShield: false,
};

export function useRoom() {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [status, setStatus] = useState<RoomStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [incomingEvent, setIncomingEvent] = useState<RoomEvent | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  // Track our own state locally so updateMyState doesn't depend on presence sync timing
  const myStateRef = useRef<RoomPlayer | null>(null);

  const playerId = getPlayerId();
  const isHost = players.find(p => p.playerId === playerId)?.isHost ?? false;
  const myPlayer = players.find(p => p.playerId === playerId);

  function syncPresence(channel: RealtimeChannel) {
    const raw = channel.presenceState<RoomPlayer>();
    const all: RoomPlayer[] = Object.values(raw).flat();
    all.sort((a, b) => a.joinedAt - b.joinedAt);
    setPlayers(all);
  }

  function buildChannel(code: string): RealtimeChannel {
    return supabase
      .channel(`room:${code}`, { config: { presence: { key: playerId } } })
      .on('presence', { event: 'sync' }, () => syncPresence(channelRef.current!))
      .on('broadcast', { event: 'game_event' }, ({ payload }) => {
        setIncomingEvent(payload as RoomEvent);
      })
      .on('broadcast', { event: 'game_start' }, () => {
        setStatus('playing');
      });
  }

  async function trackPlayer(channel: RealtimeChannel, playerState: RoomPlayer) {
    myStateRef.current = playerState;
    await channel.track(playerState);
  }

  // Entra na sala SEM personagem — personagem é escolhido depois
  const createRoom = useCallback(async (code: string): Promise<boolean> => {
    setStatus('connecting');
    setError(null);
    const channel = buildChannel(code);
    channelRef.current = channel;

    return new Promise(resolve => {
      channel.subscribe(async (s) => {
        if (s === 'SUBSCRIBED') {
          const state: RoomPlayer = { ...PLACEHOLDER, playerId, isHost: true, joinedAt: Date.now() };
          await trackPlayer(channel, state);
          setRoomCode(code);
          setStatus('lobby');
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
          resolve(true);
        } else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
          setError('Erro ao entrar na sala.');
          setStatus('error');
          resolve(false);
        }
      });
    });
  }, []);

  // Seleciona personagem dentro da sala — atualiza presença em tempo real
  const selectRoomCharacter = useCallback(async (character: Character) => {
    if (!channelRef.current || !myStateRef.current) return;
    const updated: RoomPlayer = {
      ...myStateRef.current,
      name: character.name,
      characterId: character.id,
      characterColor: character.color,
      characterIcon: character.icon_url,
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
    await channelRef.current.send({ type: 'broadcast', event: 'game_start', payload: {} });
    setStatus('playing');
  }, [isHost]);

  const leaveRoom = useCallback(async () => {
    if (channelRef.current) {
      await channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    myStateRef.current = null;
    setRoomCode(null);
    setPlayers([]);
    setStatus('idle');
    setError(null);
    setIncomingEvent(null);
  }, []);

  const dismissEvent = useCallback(() => setIncomingEvent(null), []);

  useEffect(() => () => { channelRef.current?.unsubscribe(); }, []);

  return {
    roomCode, players, status, error, incomingEvent,
    isHost, playerId, myPlayer,
    createRoom, joinRoom, selectRoomCharacter, updateMyState, broadcast,
    startGame, leaveRoom, dismissEvent,
  };
}
