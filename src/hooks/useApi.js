/**
 * hooks/useApi.js
 * Generic hook that wraps any api.js function with loading / error state.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(fetchStudents, 10, 0);
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi(apiFn, ...args) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const execute = useCallback(async (...overrideArgs) => {
    setLoading(true);
    setError(null);
    const callArgs = overrideArgs.length ? overrideArgs : args;
    const result   = await apiFn(...callArgs);
    if (!mounted.current) return;
    if (result.error) setError(result.error);
    else              setData(result.data);
    setLoading(false);
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFn]);

  return { data, loading, error, execute };
}

export default useApi;
