'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { MasterData } from '@/lib/types';

const DataContext = createContext<{ data: MasterData | null; loading: boolean }>({
  data: null,
  loading: true,
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/master_data.json')
      .then((r) => r.json())
      .then((d: MasterData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <DataContext.Provider value={{ data, loading }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
