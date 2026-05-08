import type { Character } from '../types';
import charactersJson from '../data/smpj-characters.json';

const characters = charactersJson as Character[];

/** Resolve portrait a partir de um RoomPlayer — usa o JSON local pelo characterId,
 *  que é sempre confiável independente do que veio da presença do Supabase. */
export function resolvePortrait(characterId: string, fallback?: string): string {
  if (!characterId) return fallback ?? '';
  const char = characters.find(c => c.id === characterId);
  return char?.portrait_url ?? fallback ?? '';
}

export function resolveIcon(characterId: string, fallback?: string): string {
  if (!characterId) return fallback ?? '';
  const char = characters.find(c => c.id === characterId);
  return char?.icon_url ?? fallback ?? '';
}

export function resolveCharacter(characterId: string): Character | undefined {
  return characters.find(c => c.id === characterId);
}
