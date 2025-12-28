import { useState, useEffect } from 'react';
import { loadStoreConfig } from '@/services/dataService';
import type { StoreConfig } from '@/types/config';

export function useStoreConfig() {
  const [config, setConfig] = useState<Partial<StoreConfig>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await loadStoreConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load store config:', error);
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, reload: loadConfig };
}
