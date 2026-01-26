import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nexora',
  description: 'Plataforma de networking e feedback de projetos',
  manifest: '/manifest.json',
  themeColor: '#2d5ff0'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#0B0B0F] text-[#E5E7EB]">{children}</body>
    </html>
  );
}
