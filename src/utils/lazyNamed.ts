import { lazy, type ComponentType } from 'react';

/** React.lazy per moduli che esportano il componente con nome (non default). */
export function lazyNamed<T extends ComponentType<any>, K extends string>(
  loader: () => Promise<Record<K, T>>,
  name: K
) {
  return lazy(() => loader().then((m) => ({ default: m[name] })));
}
