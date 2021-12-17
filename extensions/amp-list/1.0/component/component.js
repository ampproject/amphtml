import {useCallback, useEffect, useMemo, useRef, useState} from '#preact';
import * as Preact from '#preact';
import {ContainWrapper} from '#preact/component';
import {useAmpContext} from '#preact/context';
import {xhrUtils} from '#preact/utils/xhr';

import {useStyles} from './component.jss';

/**
 * @param {!BentoList.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoList({fetchJson, src, template, wrapper, ...rest}) {
  const {playable, renderable} = useAmpContext();

  const styles = useStyles();

  const {
    error,
    loading,
    results: items,
  } = useAsync(async () => {
    if (!renderable) {
      return null;
    }
    const results = await (fetchJson || xhrUtils.fetchJson)(src);
    const items = results['items'];
    return items;
  }, [src]);

  const children = useMemo(() => {
    let templates = items?.map((item) => template(item));
    if (wrapper) {
      templates = wrapper(templates);
    }
    return templates;
  }, [items, template]);

  return (
    <ContainWrapper {...rest}>
      {children}
      {loading && 'loading...'}
      {error && 'Error: ' + error.message}
    </ContainWrapper>
  );
}

function useAsyncCallback(asyncCallback, dependencies) {
  const [state, setState] = useState(() => ({
    loading: false,
    error: null,
    results: null,
  }));

  const isMounted = useIsMountedRef();

  const execute = useCallback(async () => {
    setState((s) => ({...s, loading: true}));
    try {
      const results = await asyncCallback(...dependencies);
      if (isMounted.current) {
        setState((s) => ({...s, loading: false, error: null, results}));
      }
    } catch (error) {
      if (isMounted.current) {
        setState((s) => ({...s, loading: false, error}));
      }
    }
  }, dependencies);

  return {...state, execute};
}
function useAsync(asyncCallback, dependencies) {
  const state = useAsyncCallback(asyncCallback, dependencies);
  useEffect(() => {
    state.execute();
  }, dependencies);

  return state;
}
function useIsMountedRef() {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
}
