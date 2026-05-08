import type { LogEntry } from '../hooks/useLog';

interface Props {
  entries: LogEntry[];
  onClear?: () => void;
}

function timeStr(ts: string): string {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function LogTab({ entries, onClear }: Props) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-600">
        <div className="text-4xl mb-3">📋</div>
        <div className="text-sm">Nenhuma ação registrada ainda.</div>
        <div className="text-xs mt-1">Confirme ações no jogo para aparecerem aqui.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {onClear && (
        <div className="flex justify-end px-4 py-2 border-b border-gray-800">
          <button onClick={onClear} className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1">
            🗑️ Limpar log
          </button>
        </div>
      )}
      <div className="px-4 py-3 flex flex-col gap-1.5">
        {entries.map(entry => (
          <div
            key={entry.id}
            className="flex items-start gap-2.5 py-2.5 px-3 rounded-xl"
            style={{
              backgroundColor: entry.source === 'self' ? `${entry.playerColor}15` : '#1f2937',
              borderLeft: `3px solid ${entry.source === 'self' ? entry.playerColor : '#374151'}`,
            }}
          >
            <span className="text-lg shrink-0 mt-0.5">{entry.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white leading-snug">{entry.message}</div>
              <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0 inline-block" style={{ backgroundColor: entry.playerColor }} />
                <span>{entry.playerName}</span>
                <span>·</span>
                <span>{timeStr(entry.timestamp as unknown as string)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
