export interface Character {
  id: string;
  name: string;
  color: string;
  icon_url: string;
  portrait_url: string;
  is_buddy: boolean;
  unlockable: boolean;
}

export interface Space {
  id: string;
  name: string;
  name_pt: string;
  color: string;
  icon_url: string | null;
  sprite_url: string | null;
  effect_in_game: string;
  drinking_rule: string;
  drinks: number | string;
  drinks_all?: boolean;
  drinks_others?: number;
  drinks_conditional?: {
    condition: string;
    drinks: number | string;
  };
}

export interface GameState {
  character: Character | null;
  totalDrinks: number;
  hasShield: boolean;
  isHomestretch: boolean;
  isJamboree: boolean;
  stars: number;
  turn: number;
}

export interface ToastMessage {
  id: number;
  message: string;
}

export interface RoomPlayer {
  playerId: string;
  name: string;
  characterId: string;
  characterColor: string;
  characterIcon: string;
  characterPortrait: string;
  totalDrinks: number;
  stars: number;
  hasShield: boolean;
  isHost: boolean;
  joinedAt: number;
  trackTimestamp?: number;
  gameStatus?: 'lobby' | 'playing';
  turn?: number; // turno atual do host — guests sincronizam com isso
}

export interface RoomEvent {
  type: 'drinks_all' | 'drinks_others' | 'minigame_prebrew' | 'minigame_start' | 'minigame_skip' | 'boo_steal' | 'duel_challenge' | 'duel_result' | 'duel_cancelled' | 'activity';
  fromPlayerId: string;
  fromPlayerName: string;
  characterColor: string;
  message: string;
  drinks: number;
  turn?: number;
  minigameFormat?: string;
  emoji?: string;
  targetPlayerId?: string;
  booType?: 'star' | 'coin';
}

export type RoomStatus = 'idle' | 'connecting' | 'lobby' | 'playing' | 'error';
