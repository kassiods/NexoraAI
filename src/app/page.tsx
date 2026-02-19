"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      router.replace('/auth/login');
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data }) => {
        const hasSession = !!data.session;
        router.replace(hasSession ? '/dashboard' : '/auth/login');
      })
      .catch(() => {
        router.replace('/auth/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] text-sm text-[var(--text-secondary)]">
        Checando sessão...
      </div>
    );
  }

  return null;
}
