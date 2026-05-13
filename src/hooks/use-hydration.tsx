import { useState, useEffect } from 'react'

/**
 * Hydration hook — simplified for frontend-first build.
 * Returns true immediately. No persist gate.
 * Backend integration will reintroduce proper loading state.
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(true)
  return hydrated
}
