import { useState, useEffect } from 'react';
import { useIndustryStore } from '@/lib/industry-store';

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useIndustryStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useIndustryStore.persist.hasHydrated());
    return () => unsub();
  }, []);

  return hydrated;
};