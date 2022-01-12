import {
  Loading_Enum,
  reducer as loadingReducer,
} from '#core/constants/loading-instructions';

import * as Preact from '#preact';
import {createContext, useContext, useMemo} from '#preact';

/** @type {PreactDef.Context} */
let context;

/**
 * The external context given to React components to control whether they can
 * render/play/etc.
 *
 * - renderable: whether this vDOM area is renderable. Analogous to
 *   `display-locking` CSS.
 * - playable: whether the playback is allowed in this vDOM area. If playback
 *   is not allow, the component must immediately stop the playback.
 *
 * @return {PreactDef.Context<AmpContextDef.ContextType>}
 */
function getAmpContext() {
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
 *
 * @param {AmpContextDef.ProviderProps} props
 * @return {PreactDef.VNode}
 */
export function WithAmpContext({
  children,
  loading: loadingProp = 'auto',
  notify: notifyProp,
  playable: playableProp = true,
  renderable: renderableProp = true,
}) {
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
      /** @type {AmpContextDef.ContextType} */ ({
        renderable,
        playable,
        loading,
        notify,
      }),
    [renderable, playable, loading, notify]
  );
  const AmpContext = getAmpContext();
  return <AmpContext.Provider children={children} value={current} />;
}

/**
 * @return {AmpContextDef.ContextType}
 */
export function useAmpContext() {
  const AmpContext = getAmpContext();
  return useContext(AmpContext);
}

/**
 * Whether the calling component should currently be in the loaded state.
 *
 * @param {Loading_Enum|string} loadingProp
 * @return {boolean}
 */
export function useLoading(loadingProp) {
  const {loading: loadingContext} = useAmpContext();
  return loadingReducer(loadingProp, loadingContext);
}
