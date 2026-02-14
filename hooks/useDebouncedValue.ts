import { useEffect, useState } from 'react'

/**
 * Debounces a value by the given delay (default 300ms).
 * The returned value only updates after the user stops changing it.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
