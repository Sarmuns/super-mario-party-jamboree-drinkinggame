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
