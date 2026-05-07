import { useRef } from 'react';
import type { Character } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface Props {
  character: Character;
  totalDrinks: number;
  hasShield: boolean;
  isHomestretch: boolean;
  onUseShield: () => void;
  onToggleHomestretch: () => void;
  onReset: () => void;
}

export function Header({
  character,
  totalDrinks,
  hasShield,
  isHomestretch,
  onUseShield,
  onToggleHomestretch,
  onReset,
}: Props) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startLongPress() {
    longPressTimer.current = setTimeout(() => {
      if (window.confirm('Resetar o jogo? Isso apaga tudo.')) {
        onReset();
      }
    }, 800);
  }

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-gray-700 px-4 py-3"
      style={{ backgroundColor: isHomestretch ? '#1f0a0a' : '#111827' }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar — long press to reset */}
        <button
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onTouchCancel={cancelLongPress}
          className="shrink-0 select-none"
          title="Segure para resetar"
        >
          <ImageWithFallback
            src={character.icon_url}
            alt={character.name}
            fallbackChar={character.name[0]}
            fallbackColor={character.color}
            className="w-10 h-10 rounded-full object-contain border-2"
          />
        </button>

        {/* Name + drink count */}
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 leading-none">{character.name}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white leading-tight">{totalDrinks}</span>
            <span className="text-xs text-gray-400">goles</span>
            {isHomestretch && (
              <span className="ml-1 text-xs font-bold text-red-400 bg-red-900/40 px-1.5 py-0.5 rounded-full">
                2x
              </span>
            )}
          </div>
        </div>

        {/* Shield badge */}
        {hasShield && (
          <button
            onClick={onUseShield}
            className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl border border-yellow-500/50 bg-yellow-500/20 text-yellow-400 text-sm font-semibold active:scale-95 transition-transform"
            title="Usar escudo"
          >
            <span>🛡️</span>
            <span className="text-xs hidden sm:inline">Usar</span>
          </button>
        )}

        {/* Reset button */}
        <button
          onClick={() => { if (window.confirm('Resetar o jogo? Isso apaga tudo.')) onReset(); }}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-300 active:scale-95 transition-all"
          title="Resetar jogo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>

        {/* Homestretch toggle */}
        <button
          onClick={onToggleHomestretch}
          className="shrink-0 flex flex-col items-center gap-0.5"
          title="Últimos 5 turnos"
        >
          <div
            className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
              isHomestretch ? 'bg-red-600' : 'bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                isHomestretch ? 'left-5' : 'left-1'
              }`}
            />
          </div>
          <span className="text-[10px] text-gray-400 leading-none">5 turnos</span>
        </button>
      </div>
    </header>
  );
}
