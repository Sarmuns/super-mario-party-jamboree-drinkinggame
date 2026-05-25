import { useState } from 'react';
import { t } from '../lib/labels';

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
          <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{t.rulesSection.title}</span>
          <span className="text-xs text-gray-500">{t.rulesSection.subtitle}</span>
        </div>
        <span className="text-gray-400 text-lg transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
          ↓
        </span>
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {t.rulesSection.rules.map(rule => (
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
