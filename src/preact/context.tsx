import type {ComponentChildren, Context, VNode} from 'preact';

import {
  Loading_Enum,
  reducer as loadingReducer,
} from '#core/constants/loading-instructions';

import * as Preact from '#preact';
import {createContext, useContext, useMemo} from '#preact';

export interface AmpContext {
  renderable: boolean;
  playable: boolean;
  loading: Loading_Enum;
  notify?: () => {};
}

export interface ProviderProps {
  renderable?: boolean;
  playable?: boolean;
  loading?: string;
  notify?: () => {};
  children?: ComponentChildren;
}

let context: Context<AmpContext>;

/**
 * The external context given to React components to control whether they can
 * render/play/etc.
 *
 * - renderable: whether this vDOM area is renderable. Analogous to
 *   `display-locking` CSS.
 * - playable: whether the playback is allowed in this vDOM area. If playback
 *   is not allow, the component must immediately stop the playback.
 */
function getAmpContext(): Context<AmpContext> {
  return (
    context ||
    (context = createContext({
      renderable: true,
      playable: true,
      loading: Loading_Enum.AUTO,
    }))
  );
}

/**
 * A wrapper-component that recalculates and propagates AmpContext properties.
 */
export function WithAmpContext({
  children,
  loading: loadingProp = 'auto',
  notify: notifyProp,
  playable: playableProp = true,
  renderable: renderableProp = true,
}: ProviderProps): VNode {
  const parent = useAmpContext();
  const renderable = renderableProp && parent.renderable;
  const playable = renderable && playableProp && parent.playable;
  const loading = loadingReducer(
    renderable ? Loading_Enum.AUTO : Loading_Enum.LAZY,
    loadingReducer(loadingProp, parent.loading)
  );
  const notify = notifyProp || parent.notify;
  const current = useMemo(
    () =>
      ({
        renderable,
        playable,
        loading,
        notify,
      }) as AmpContext,
    [renderable, playable, loading, notify]
  );
  const AmpContext = getAmpContext();
  return <AmpContext.Provider children={children} value={current} />;
}

export function useAmpContext(): AmpContext {
  const AmpContext = getAmpContext();
  return useContext(AmpContext);
}

/**
 * Whether the calling component should currently be in the loaded state.
 */
export function useLoading(loadingProp?: Loading_Enum | string): Loading_Enum {
  const {loading: loadingContext} = useAmpContext();
  return loadingReducer(loadingProp, loadingContext);
}
