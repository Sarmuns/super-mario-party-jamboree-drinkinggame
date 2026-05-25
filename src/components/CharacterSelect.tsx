import { useState } from 'react';
import type { Character, RoomPlayer } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import characters from '../data/smpj-characters.json';
import { t } from '../lib/labels';

interface Props {
  onStart: (character: Character) => void;
  roomPlayers?: RoomPlayer[];
  myPlayerId?: string;
}

export function CharacterSelect({ onStart, roomPlayers, myPlayerId }: Props) {
  const [selected, setSelected] = useState<Character | null>(null);

  const takenMap = new Map<string, RoomPlayer>();
  if (roomPlayers && myPlayerId) {
    for (const p of roomPlayers) {
      if (p.playerId !== myPlayerId && p.characterId) {
        takenMap.set(p.characterId, p);
      }
    }
  }

  const isRoomMode = !!roomPlayers;

  function handleSelect(char: Character) {
    if (takenMap.has(char.id)) return;
    setSelected(char);
  }

  return (
    <div className="min-h-dvh bg-gray-900 flex flex-col">
      <div className="px-4 pt-8 pb-4 text-center">
        <div className="text-3xl font-bold text-white mb-1">{t.characterSelect.title}</div>
        <div className="text-lg text-yellow-400 font-semibold">{t.characterSelect.subtitle}</div>
        <p className="text-gray-400 text-sm mt-2">
          {isRoomMode ? t.characterSelect.subtitleRoom : t.characterSelect.subtitleOffline}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(characters as Character[]).map(char => {
            const isSelected = selected?.id === char.id;
            const takenBy = takenMap.get(char.id);
            const isTaken = !!takenBy;

            return (
              <button
                key={char.id}
                onClick={() => handleSelect(char)}
                disabled={isTaken}
                className="relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-150"
                style={{
                  backgroundColor: isTaken ? '#111827' : '#1f2937',
                  borderColor: isSelected ? char.color : isTaken ? '#1f2937' : 'transparent',
                  boxShadow: isSelected ? `0 0 0 2px ${char.color}40` : 'none',
                  opacity: isTaken ? 0.45 : 1,
                  cursor: isTaken ? 'not-allowed' : 'pointer',
                }}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white z-10"
                    style={{ backgroundColor: char.color }}>
                    ✓
                  </div>
                )}

                {isTaken && takenBy.name && (
                  <div className="absolute top-2 left-2 right-2 flex items-center gap-1 z-10">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: takenBy.characterColor }} />
                    <span className="text-[10px] text-gray-400 truncate leading-none">{takenBy.name}</span>
                  </div>
                )}

                <ImageWithFallback
                  src={char.portrait_url}
                  alt={char.name}
                  fallbackChar={char.name[0]}
                  fallbackColor={char.color}
                  className="w-full aspect-square object-contain rounded-xl"
                />
                <span className="text-sm font-semibold text-white text-center leading-tight">
                  {char.name}
                </span>
                {isTaken && (
                  <span className="text-xs text-gray-600">{t.characterSelect.inUse}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 px-4 py-4">
        <button
          onClick={() => selected && onStart(selected)}
          disabled={!selected}
          className="w-full py-4 rounded-2xl text-lg font-bold transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white"
          style={{ backgroundColor: selected ? selected.color : '#374151' }}
        >
          {selected
            ? (isRoomMode ? `${t.characterSelect.confirm} ${selected.name}!` : t.characterSelect.playWith(selected.name))
            : t.characterSelect.selectFirst}
        </button>
      </div>
    </div>
  );
}
