import { useEffect, useRef } from 'react';
import { createScope } from 'animejs';
import { prefersReducedMotion } from './motion';

/**
 * React hook pembungkus Anime.js v4 createScope.
 * Aman untuk React 19 / StrictMode.
 * Membersihkan animasi secara otomatis dengan scope.revert() pada unmount/cleanup.
 *
 * @param {Function} [callback] - Callback pendaftaran animasi: ({ scope, root, prefersReducedMotion }) => void
 * @param {React.DependencyList} [deps=[]] - Array dependensi useEffect
 * @param {React.RefObject} [customRootRef] - Opsional root ref jika elemen root dikontrol dari luar
 * @returns {React.RefObject} ref yang dapat dipasangkan ke elemen kontainer root (juga memiliki property .scope)
 */
export function useAnimeScope(callback, deps = [], customRootRef) {
  const internalRef = useRef(null);
  const rootRef = customRootRef || internalRef;
  const scopeRef = useRef(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const isReduced = prefersReducedMotion();
    const scope = createScope({ root: rootRef });
    scopeRef.current = scope;
    rootRef.scope = scope;

    if (typeof callbackRef.current === 'function') {
      scope.add((self) => {
        return callbackRef.current({
          scope: self,
          root: rootRef.current,
          prefersReducedMotion: isReduced,
        });
      });
    }

    return () => {
      scope.revert();
      scopeRef.current = null;
      rootRef.scope = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return rootRef;
}

export default useAnimeScope;

