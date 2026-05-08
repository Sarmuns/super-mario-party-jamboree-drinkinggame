import { useState } from 'react';
import { generateRoomCode } from '../lib/roomUtils';

interface Props {
  error: string | null;
  isConnecting: boolean;
  onCreateRoom: (code: string) => void;
  onJoinRoom: (code: string) => void;
  onBack: () => void;
}

export function RoomEntry({ error, isConnecting, onCreateRoom, onJoinRoom, onBack }: Props) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [code, setCode] = useState('');
  const [generatedCode] = useState(() => generateRoomCode());

  return (
    <div className="min-h-dvh bg-gray-900 flex flex-col px-4">
      <div className="pt-8 pb-6 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 text-2xl px-2 active:scale-95 transition-transform">←</button>
        <div>
          <div className="text-xl font-bold text-white">Modo Sala</div>
          <div className="text-xs text-gray-400">Escolha o personagem depois de entrar</div>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 mb-8">
        {(['create', 'join'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={tab === t
              ? { backgroundColor: 'var(--accent, #6366f1)', color: '#fff' }
              : { backgroundColor: '#1f2937', color: '#9ca3af' }}>
            {t === 'create' ? 'Criar Sala' : 'Entrar na Sala'}
          </button>
        ))}
      </div>

      {tab === 'create' && (
        <div className="flex flex-col items-center gap-8">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Código da sua sala</div>
            <div className="text-7xl font-black tracking-widest text-white" style={{ letterSpacing: '0.25em' }}>
              {generatedCode}
            </div>
            <div className="text-xs text-gray-500 mt-3">Compartilhe com os amigos antes de criar</div>
          </div>

          <button onClick={() => onCreateRoom(generatedCode)} disabled={isConnecting}
            className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent, #6366f1)' }}>
            {isConnecting ? 'Criando...' : 'Criar Sala'}
          </button>
        </div>
      )}

      {tab === 'join' && (
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Código da sala</div>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))}
              placeholder="ABCD"
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-4 py-4 text-4xl font-black text-white text-center tracking-widest focus:outline-none focus:border-gray-500"
              style={{ letterSpacing: '0.35em' }}
            />
          </div>

          <button onClick={() => onJoinRoom(code)} disabled={code.length < 4 || isConnecting}
            className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-95 transition-transform disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent, #6366f1)' }}>
            {isConnecting ? 'Entrando...' : 'Entrar na Sala'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 px-4 py-3 rounded-2xl bg-red-900/40 border border-red-500/50 text-red-400 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
