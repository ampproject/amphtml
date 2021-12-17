import * as Preact from '#preact';
import {useCallback, useEffect, useRef, useState} from '#preact';
import {ContainWrapper} from '#preact/component';
import {useAmpContext} from '#preact/context';
import {xhrUtils} from '#preact/utils/xhr';

import {useStyles} from './component.jss';

const listItemTemplate = (item) => <li>{item}</li>;
const listWrapperTemplate = (list) => <ul>{list}</ul>;

/**
 * @param {!BentoList.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoList({
  src = null,
  fetchJson = xhrUtils.fetchJson,
  itemsKey = 'items',
  template: itemTemplate = listItemTemplate,
  wrapper: wrapperTemplate = listWrapperTemplate,
  loading: loadingTemplate = (src) => 'Loading...',
  error: errorTemplate = (err) => 'Error: ' + err.message,
  ...rest
}) {
  const {playable, renderable} = useAmpContext();

  const styles = useStyles();

  const {error, loading, results} = useAsync(async () => {
    if (!renderable) {
      return null;
    }
    const results = await fetchJson(src);
    return results;
  }, [fetchJson, src]);

  const items = results?.[itemsKey];

  let children = items?.map((item) => itemTemplate(item));
  if (wrapperTemplate) {
    children = wrapperTemplate(children);
  }

  return (
    <ContainWrapper {...rest}>
      {children}
      {loading && loadingTemplate && loadingTemplate(src)}
      {error && errorTemplate && errorTemplate(error)}
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
