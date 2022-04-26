import * as Preact from '#preact';
import {createContext, useContext} from '#preact';
import type {PropsWithChildren} from '#preact/types';

const MISSING_PROVIDER = 'MISSING_PROVIDER';

export function createProviderFromHook<THookValue, TProviderProps>(
  providerHook: (props: TProviderProps) => THookValue,
  defaultValue: THookValue | typeof MISSING_PROVIDER = MISSING_PROVIDER
) {
  const context = createContext(defaultValue);

  const Provider = (props: PropsWithChildren<TProviderProps>) => {
    const value = providerHook(props);
    const {children} = props;
    return <context.Provider value={value}>{children}</context.Provider>;
  };

  const useContextValue = (): THookValue => {
    const value = useContext(context);
    if (value === MISSING_PROVIDER) {
      const hookName = (providerHook as any).displayName || providerHook.name;
      throw new Error(
        `Missing Provider for ${hookName ? `the '${hookName}'` : 'this'} hook`
      );
    }
    return value;
  };

  return [Provider, useContextValue] as const;
}
