import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nexora',
  description: 'Plataforma de networking e feedback de projetos',
  manifest: '/manifest.json'
};

export const viewport = {
  themeColor: '#0A0A0A'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-[var(--bg-base)] text-[var(--text-primary)]">{children}</body>
    </html>
  );
}
