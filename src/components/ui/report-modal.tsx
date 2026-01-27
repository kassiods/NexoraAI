"use client";

import { useMemo, useState } from 'react';

export type ReportModalProps = {
  open: boolean;
  targetLabel: string;
  onCancel: () => void;
  onSubmit: (reason: string, details: string) => Promise<void> | void;
  submitting?: boolean;
};

const commonReasons = ['Conteúdo impróprio', 'Spam ou promoção', 'Assédio ou discurso de ódio', 'Informação incorreta', 'Outro'];

export function ReportModal({ open, targetLabel, onCancel, onSubmit, submitting }: ReportModalProps) {
  const [reason, setReason] = useState(commonReasons[0]);
  const [details, setDetails] = useState('');
  const disabled = submitting || !reason.trim();

  const header = useMemo(() => `Denunciar ${targetLabel}`, [targetLabel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.55)] backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Segurança</p>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{header}</h2>
            <p className="text-sm text-[var(--text-secondary)]">Descreva o problema para nossa equipe de moderação.</p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg px-2 py-1 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--action-hover)]"
          >
            Fechar
          </button>
        </div>

        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (disabled) return;
            await onSubmit(reason, details.trim());
            setDetails('');
            setReason(commonReasons[0]);
          }}
        >
          <label className="space-y-1 text-sm text-[var(--text-primary)]">
            <span className="text-[var(--text-secondary)]">Motivo principal</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--action)] focus:ring-2 focus:ring-[color:rgba(231,233,234,0.12)]"
            >
              {commonReasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm text-[var(--text-primary)]">
            <span className="text-[var(--text-secondary)]">Detalhes (opcional)</span>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="Descreva o que aconteceu, links ou contexto adicional."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--action)] focus:ring-2 focus:ring-[color:rgba(231,233,234,0.12)]"
            />
          </label>

          <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
            <span>Denúncias são analisadas pela moderação (mock).</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-surface-hover)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={disabled}
                className="rounded-lg bg-[var(--action)] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[var(--action-hover)] disabled:opacity-60"
              >
                Enviar denúncia
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
