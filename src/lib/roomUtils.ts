const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sem I e O pra evitar confusão

export function generateRoomCode(): string {
  return Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

export function getPlayerId(): string {
  let id = localStorage.getItem('smpj-player-id');
  if (!id) {
    id = `p_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('smpj-player-id', id);
  }
  return id;
}
