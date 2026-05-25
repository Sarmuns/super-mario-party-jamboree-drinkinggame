import { useState } from 'react';
import { t } from '../lib/labels';

const FORMATS = t.minigame.formats;

// ── Host: 2 fases — format → result ──
interface HostProps {
  mode: 'host';
  turn: number;
  multiplier: number;
  onStartMinigame: (format: string) => void;
  onConfirm: (drinks: number, format: string) => void;
  onClose: () => void;
}

// ── Guest: 3 fases — prebrew → waiting → result ──
interface GuestProps {
  mode: 'guest';
  turn: number;
  multiplier: number;
  hostName: string;
  phase: 'prebrew' | 'waiting' | 'result';
  format?: string;
  onConfirmPrebrew: (drinks: number) => void;
  onConfirmResult: (drinks: number) => void;
  onClose: () => void;
}

type Props = HostProps | GuestProps;

export function MinigameModal(props: Props) {
  const [format, setFormat] = useState('ffa');
  const [result, setResult] = useState<'won' | 'lost' | null>(null);
  const [hostStep, setHostStep] = useState<'format' | 'result'>('format');

  const { turn, multiplier } = props;
  const preDrink = 1 * multiplier;
  const loserDrink = 1 * multiplier;
  const selectedFormat = FORMATS.find(f => f.id === format)!;

  // ── Host ──
  if (props.mode === 'host') {
    if (hostStep === 'format') {
      return (
        <ModalShell title={t.minigame.hostTitle} subtitle={t.minigame.hostSubtitle(turn)} onClose={props.onClose}>
          <div className="rounded-2xl bg-gray-700/60 px-4 py-3 flex items-center gap-3">
            <span className="text-xl">🍺</span>
            <div>
              <div className="text-sm font-semibold text-white">{t.minigame.prebrewNotified}</div>
              <div className="text-xs text-gray-400">{t.minigame.prebrewNote(preDrink)}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">{t.minigame.formatLabel}</div>
            <div className="flex gap-2">
              {FORMATS.map(f => (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border"
                  style={format === f.id
                    ? { backgroundColor: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                    : { backgroundColor: '#374151', color: '#9ca3af', borderColor: 'transparent' }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-2">{selectedFormat.description}</div>
          </div>

          <button onClick={() => { props.onStartMinigame(format); setHostStep('result'); }}
            className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform"
            style={{ backgroundColor: 'var(--accent)' }}>
            {t.minigame.startMinigame}
          </button>
        </ModalShell>
      );
    }

    // hostStep === 'result'
    return (
      <ModalShell title={t.minigame.resultTitle} subtitle={`${selectedFormat.label} — ${selectedFormat.description}`} onClose={props.onClose}>
        <ResultSelector
          result={result} setResult={setResult}
          preDrink={preDrink} loserDrink={loserDrink}
        />
        {result && (
          <button onClick={() => props.onConfirm(result === 'lost' ? loserDrink : 0, format)}
            className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform"
            style={{ backgroundColor: 'var(--accent)' }}>
            {result === 'lost' ? t.minigame.confirmLoss(loserDrink) : t.minigame.confirmWin}
          </button>
        )}
      </ModalShell>
    );
  }

  // ── Guest ──
  const { phase, hostName, format: guestFormat } = props as GuestProps;
  const guestSelectedFormat = FORMATS.find(f => f.id === guestFormat) ?? FORMATS[0];

  if (phase === 'prebrew') {
    return (
      <ModalShell title={t.minigame.guestPrebrewTitle} subtitle={t.minigame.guestPrebrewSubtitle(hostName, turn)} onClose={undefined}>
        <div className="text-center py-4">
          <div className="text-6xl font-black text-white mb-2">{preDrink}</div>
          <div className="text-gray-400 text-sm">{t.minigame.drinksBefore(preDrink)}</div>
        </div>
        <button onClick={() => (props as GuestProps).onConfirmPrebrew(preDrink)}
          className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform bg-yellow-600">
          {t.minigame.drinkConfirm}
        </button>
      </ModalShell>
    );
  }

  if (phase === 'waiting') {
    return (
      <ModalShell title={t.minigame.waitingTitle} subtitle={t.minigame.waitingSubtitle} onClose={undefined}>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-3 animate-pulse">🎮</div>
          <div className="text-sm">{t.minigame.waitingBody(hostName)}</div>
        </div>
      </ModalShell>
    );
  }

  // phase === 'result'
  return (
    <ModalShell title={t.minigame.resultTitle} subtitle={`${guestSelectedFormat.label} — ${guestSelectedFormat.description}`} onClose={undefined}>
      <ResultSelector
        result={result} setResult={setResult}
        preDrink={0} loserDrink={loserDrink}
        hidePreDrink
      />
      {result && (
        <button onClick={() => (props as GuestProps).onConfirmResult(result === 'lost' ? loserDrink : 0)}
          className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform"
          style={{ backgroundColor: 'var(--accent)' }}>
          {result === 'lost' ? t.minigame.confirmLoss(loserDrink) : t.minigame.confirmWin}
        </button>
      )}
    </ModalShell>
  );
}

function ModalShell({ title, subtitle, onClose, children }: {
  title: string; subtitle: string;
  onClose?: () => void; children: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/75" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:p-4">
        <div className="bg-gray-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-md shadow-2xl"
          style={{ borderTop: '3px solid var(--accent)' }}>
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-600" />
          </div>
          <div className="px-5 pb-6 pt-3 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-white">{title}</div>
                <div className="text-xs text-gray-400">{subtitle}</div>
              </div>
              {onClose && (
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-gray-400 text-lg">×</button>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

function ResultSelector({ result, setResult, preDrink, loserDrink, hidePreDrink }: {
  result: 'won' | 'lost' | null;
  setResult: (r: 'won' | 'lost') => void;
  preDrink: number; loserDrink: number;
  hidePreDrink?: boolean;
}) {
  return (
    <div className="space-y-3">
      {!hidePreDrink && preDrink > 0 && (
        <div className="rounded-2xl bg-gray-700/60 px-4 py-2 text-xs text-gray-400">
          {t.minigame.prebrewCounted(preDrink)}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setResult('won')}
          className="py-4 rounded-2xl text-sm font-bold border-2 transition-all active:scale-95"
          style={result === 'won'
            ? { backgroundColor: '#166534', borderColor: '#22c55e', color: '#86efac' }
            : { backgroundColor: '#1f2937', borderColor: '#374151', color: '#9ca3af' }}>
          {t.common.won}
        </button>
        <button onClick={() => setResult('lost')}
          className="py-4 rounded-2xl text-sm font-bold border-2 transition-all active:scale-95"
          style={result === 'lost'
            ? { backgroundColor: '#7f1d1d', borderColor: '#ef4444', color: '#fca5a5' }
            : { backgroundColor: '#1f2937', borderColor: '#374151', color: '#9ca3af' }}>
          {t.minigame.lost} +{loserDrink}
        </button>
      </div>
    </div>
  );
}
