interface Props {
  onOffline: () => void;
  onSala: () => void;
}

export function ModeSelector({ onOffline, onSala }: Props) {
  return (
    <div className="min-h-dvh bg-gray-900 flex flex-col items-center justify-center px-6 gap-8">
      <div className="text-center">
        <div className="text-4xl font-black text-white mb-2">Mario Party</div>
        <div className="text-xl text-yellow-400 font-bold">Drinking Game 🍺</div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button
          onClick={onOffline}
          className="w-full py-5 rounded-2xl bg-gray-800 border-2 border-gray-700 active:scale-95 transition-transform text-left px-6"
        >
          <div className="text-2xl mb-1">🎮</div>
          <div className="text-lg font-bold text-white">Jogar Sozinho</div>
          <div className="text-sm text-gray-400">Modo offline, sem conexão</div>
        </button>

        <button
          onClick={onSala}
          className="w-full py-5 rounded-2xl border-2 active:scale-95 transition-transform text-left px-6"
          style={{ backgroundColor: 'rgba(var(--accent-rgb,99,102,241)/0.15)', borderColor: 'var(--accent,#6366f1)' }}
        >
          <div className="text-2xl mb-1">🏠</div>
          <div className="text-lg font-bold text-white">Criar / Entrar em Sala</div>
          <div className="text-sm text-gray-400">Sincronizado com os amigos em tempo real</div>
        </button>
      </div>
    </div>
  );
}
