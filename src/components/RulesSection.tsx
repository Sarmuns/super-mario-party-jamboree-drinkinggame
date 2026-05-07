import { useState } from 'react';

const rules = [
  {
    title: 'Minigames',
    content: 'Todo mundo bebe 1 gole antes de cada minigame. Perdedor bebe +1.',
  },
  {
    title: 'Formatos de Minigame',
    content: 'FFA: último bebe +1 | 2v2: dupla perdedora +1 cada | 1v3: lado perdedor +1 cada',
  },
  {
    title: 'Lucky Space',
    content: 'Você caiu na casa da sorte? Todos os outros bebem 1 gole.',
  },
  {
    title: 'Chance Time',
    content: 'Todo mundo bebe 1 gole. Quem saiu prejudicado na troca bebe +1.',
  },
  {
    title: 'Jamboree Buddy',
    content: 'Ganhou um buddy? Os outros jogadores bebem 1 gole.',
  },
  {
    title: 'Bonus Star (final)',
    content: 'Não ganhou nenhuma Bonus Star? 2 goles.',
  },
];

export function RulesSection() {
  const [open, setOpen] = useState(false);

  return (
    <section className="px-4 py-4 pb-8">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-800 border border-gray-700"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <span className="text-sm font-bold text-white">Regras de Mesa</span>
          <span className="text-xs text-gray-500">(consulta)</span>
        </div>
        <span className="text-gray-400 text-lg transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
          ↓
        </span>
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {rules.map(rule => (
            <div key={rule.title} className="px-4 py-3 rounded-2xl bg-gray-800/60 border border-gray-700/60">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{rule.title}</div>
              <div className="text-sm text-gray-200">{rule.content}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
