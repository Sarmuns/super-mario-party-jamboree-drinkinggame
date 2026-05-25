import { useRef, useEffect, useState } from 'react';
import type { Character } from '../types';
import { calcMultiplier } from '../lib/multiplier';
import { ImageWithFallback } from './ImageWithFallback';
import { t } from '../lib/labels';

interface Props {
  character: Character;
  totalDrinks: number;
  hasShield: boolean;
  isHomestretch: boolean;
  isJamboree: boolean;
  stars: number;
  turn: number;
  canUndo: boolean;
  roomPlayerCount?: number;
  onUseShield: () => void;
  onToggleHomestretch: () => void;
  onToggleJamboree: () => void;
  onReset: () => void;
  onUndo: () => void;
  onAddOne: () => void;
  onSetDrinks: (value: number) => void;
  onShowPlayers?: () => void;
}

export function Header({
  character, totalDrinks, hasShield, isHomestretch, isJamboree,
  stars, turn, canUndo, roomPlayerCount,
  onUseShield, onToggleHomestretch, onToggleJamboree, onReset, onUndo, onAddOne, onSetDrinks, onShowPlayers,
}: Props) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const prevDrinks = useRef(totalDrinks);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(0);

  useEffect(() => {
    if (totalDrinks > prevDrinks.current) setAnimKey(k => k + 1);
    prevDrinks.current = totalDrinks;
  }, [totalDrinks]);

  function startLongPress() {
    longPressTimer.current = setTimeout(() => {
      if (window.confirm(t.header.resetConfirm)) onReset();
    }, 800);
  }
  function cancelLongPress() {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }

  function openEdit() {
    setEditValue(totalDrinks);
    setIsEditing(true);
  }
  function confirmEdit() {
    onSetDrinks(editValue);
    setIsEditing(false);
  }
  function cancelEdit() {
    setIsEditing(false);
  }

  const multiplier = calcMultiplier(isHomestretch, isJamboree);

  return (
    <header
      className="sticky top-0 z-40 border-b px-4 py-3 space-y-2"
      style={{
        backgroundColor: isHomestretch ? '#1f0a0a' : '#111827',
        borderBottomColor: `rgba(var(--accent-rgb) / 0.35)`,
        boxShadow: `0 1px 20px rgba(var(--accent-rgb) / 0.1)`,
      }}
    >
      {/* Row 1 */}
      <div className="flex items-center gap-3">
        <button
          onMouseDown={startLongPress} onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress} onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress} onTouchCancel={cancelLongPress}
          className="shrink-0 select-none" title={t.header.resetHold}
        >
          <div className="rounded-full p-0.5" style={{ background: 'var(--accent)' }}>
            <ImageWithFallback
              src={character.icon_url} alt={character.name}
              fallbackChar={character.name[0]} fallbackColor={character.color}
              className="w-9 h-9 rounded-full object-contain bg-gray-900"
            />
          </div>
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-white leading-none truncate">{character.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-yellow-400">⭐ {stars}</span>
            <span className="text-gray-600 text-xs">•</span>
            <span className="text-xs text-gray-400">{t.header.turn} {turn}</span>
          </div>
        </div>

        {onShowPlayers && (
          <button onClick={onShowPlayers}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-gray-600 text-gray-300 bg-gray-800 active:scale-95 transition-transform">
            <span>👥</span>
            <span>{roomPlayerCount ?? 0}</span>
          </button>
        )}

        {hasShield && (
          <button onClick={onUseShield}
            className="shrink-0 px-2.5 py-1.5 rounded-xl border border-yellow-500/50 bg-yellow-500/20 text-yellow-400 text-sm active:scale-95 transition-transform"
            title={t.header.useShield}>🛡️</button>
        )}

        <button onClick={onUndo} disabled={!canUndo}
          className="shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-25 text-gray-400">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>
          </svg>
          <span>{t.header.undo}</span>
        </button>

        <button onClick={() => { if (window.confirm(t.header.resetConfirm)) onReset(); }}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-300 active:scale-95 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
          </svg>
        </button>
      </div>

      {/* Row 2: drink counter + toggles */}
      <div className="flex items-center gap-3">
        {isEditing ? (
          /* ── Stepper mode ── */
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setEditValue(v => Math.max(0, v - 1))}
              className="w-9 h-9 rounded-full border-2 border-gray-600 bg-gray-800 text-white text-xl font-bold flex items-center justify-center active:scale-90 transition-transform"
            >{t.header.drinkMinus}</button>

            <span className="text-3xl font-black w-12 text-center leading-none" style={{ color: 'var(--accent)' }}>
              {editValue}
            </span>

            <button
              onClick={() => setEditValue(v => v + 1)}
              className="w-9 h-9 rounded-full border-2 border-gray-600 bg-gray-800 text-white text-xl font-bold flex items-center justify-center active:scale-90 transition-transform"
            >{t.header.drinkPlus}</button>

            <button onClick={confirmEdit}
              className="ml-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-transform"
              style={{ backgroundColor: 'var(--accent)' }}>
              {t.header.drinkOk}
            </button>
            <button onClick={cancelEdit}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-400 bg-gray-800 border border-gray-700 active:scale-95 transition-transform">
              {t.header.drinkBack}
            </button>
          </div>
        ) : (
          /* ── Normal mode ── */
          <div className="flex items-center gap-2">
            <span key={animKey} className="text-3xl font-black leading-none drink-bump" style={{ color: 'var(--accent)' }}>
              {totalDrinks}
            </span>
            <span className="text-xs text-gray-400">{t.header.drinkGoles}</span>
            <button onClick={onAddOne}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border border-gray-600 text-gray-300 active:scale-95 transition-transform bg-gray-800"
              title={t.header.drinkPlus1}>+1</button>
            <button onClick={openEdit}
              className="w-6 h-6 flex items-center justify-center rounded-full text-gray-600 hover:text-gray-400 active:scale-95 transition-all"
              title={t.header.drinkEdit}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        )}

        <div className="flex-1" />

        {multiplier > 1 && !isEditing && (
          <span className="text-xs font-bold text-red-400 bg-red-900/40 px-1.5 py-0.5 rounded-full">
            {multiplier}x
          </span>
        )}

        {!isEditing && (
          <>
            <button onClick={onToggleJamboree} className="shrink-0 flex flex-col items-center gap-0.5" title="Jamboree Buddy">
              <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${isJamboree ? 'bg-yellow-500' : 'bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${isJamboree ? 'left-4' : 'left-0.5'}`} />
              </div>
              <span className="text-[9px] text-gray-400 leading-none">{t.header.jamboree}</span>
            </button>

            <button onClick={onToggleHomestretch} className="shrink-0 flex flex-col items-center gap-0.5" title="Últimos 5 turnos">
              <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${isHomestretch ? 'bg-red-600' : 'bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${isHomestretch ? 'left-4' : 'left-0.5'}`} />
              </div>
              <span className="text-[9px] text-gray-400 leading-none">{t.header.jamboreeNote}</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
