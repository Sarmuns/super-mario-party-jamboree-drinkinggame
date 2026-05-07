import { useState } from 'react';
import type { Character } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import characters from '../data/smpj-characters.json';

interface Props {
  onStart: (character: Character) => void;
}

export function CharacterSelect({ onStart }: Props) {
  const [selected, setSelected] = useState<Character | null>(null);

  return (
    <div className="min-h-dvh bg-gray-900 flex flex-col">
      <div className="px-4 pt-8 pb-4 text-center">
        <div className="text-3xl font-bold text-white mb-1">Mario Party</div>
        <div className="text-lg text-yellow-400 font-semibold">Drinking Game 🍺</div>
        <p className="text-gray-400 text-sm mt-2">Escolha seu personagem</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(characters as Character[]).map(char => {
            const isSelected = selected?.id === char.id;
            return (
              <button
                key={char.id}
                onClick={() => setSelected(char)}
                className="relative flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-800 border-2 transition-all duration-150 active:scale-95"
                style={{
                  borderColor: isSelected ? char.color : 'transparent',
                  boxShadow: isSelected ? `0 0 0 2px ${char.color}40` : 'none',
                }}
              >
                {isSelected && (
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: char.color }}
                  >
                    ✓
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
                {char.unlockable && (
                  <span className="text-xs text-gray-500">desbloqueável</span>
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
          style={{
            backgroundColor: selected ? selected.color : '#374151',
          }}
        >
          {selected ? `Jogar com ${selected.name}!` : 'Selecione um personagem'}
        </button>
      </div>
    </div>
  );
}
