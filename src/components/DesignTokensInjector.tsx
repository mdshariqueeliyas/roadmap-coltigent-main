'use client';

import { useEffect } from 'react';
import { useData } from '@/context/DataContext';

export function DesignTokensInjector() {
  const { data } = useData();

  useEffect(() => {
    if (!data?.config?.design_tokens) return;
    const tokens = data.config.design_tokens;
    const root = document.documentElement;
    if (tokens.colors) {
      root.style.setProperty('--color-primary', tokens.colors.primary);
      root.style.setProperty('--color-secondary', tokens.colors.secondary);
      root.style.setProperty('--color-accent', tokens.colors.accent);
      root.style.setProperty('--color-background', tokens.colors.background);
    }
    if (tokens.typography) {
      root.style.setProperty('--font-heading', `"${tokens.typography.heading_font}", system-ui, sans-serif`);
      root.style.setProperty('--font-body', `"${tokens.typography.body_font}", system-ui, sans-serif`);
    }
  }, [data?.config?.design_tokens]);

  return null;
}
