import {
  Loading_Enum,
  reducer as loadingReducer,
} from '#core/constants/loading-instructions';

import * as Preact from '#preact';
import {createContext, useContext, useMemo} from '#preact';

/**
 * @typedef {{
 *   renderable: boolean;
 *   playable: boolean;
 *   loading: Loading_Enum;
 *   notify?: () => {};
 * }} AmpContext
 */

/**
 * @typedef {{
 *   renderable: boolean | undefined;
 *   playable: boolean | undefined;
 *   loading: string | undefined;
 *   notify?: () => {} | undefined;
 *   children?: import('preact').ComponentChildren;
 * }} ProviderProps
 */

/** @type {import('preact').Context<AmpContext>} */
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
 * @return {import('preact').Context<AmpContext>}
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
 * @param {ProviderProps} props
 * @return {import('preact').VNode}
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
      /** @type {AmpContext} */ ({
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
 * @return {AmpContext}
 */
export function useAmpContext() {
  const AmpContext = getAmpContext();
  return useContext(AmpContext);
}

/**
 * Whether the calling component should currently be in the loaded state.
 *
 * @param {Loading_Enum|string} loadingProp
 * @return {Loading_Enum}
 */
export function useLoading(loadingProp) {
  const {loading: loadingContext} = useAmpContext();
  return loadingReducer(loadingProp, loadingContext);
}
