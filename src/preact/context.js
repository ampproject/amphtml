/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Preact from './index';
import {Loading, reducer as loadingReducer} from '../loading';
import {createContext, useContext, useMemo, useRef} from './index';

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
 * @return {!PreactDef.Context<AmpContextDef.ContextType>}
 */
function getAmpContext() {
  return (
    context ||
    (context = createContext({
      renderable: true,
      playable: true,
      loading: Loading.AUTO,
    }))
  );
}

/**
 * A wrapper-component that recalculates and propagates AmpContext properties.
 *
 * @param {!AmpContextDef.ProviderProps} props
 * @return {!PreactDef.VNode}
 */
export function WithAmpContext({
  renderable: renderableProp = true,
  playable: playableProp = true,
  loading: loadingProp = 'auto',
  notify: notifyProp,
  children,
}) {
  const parent = useAmpContext();
  const renderable = renderableProp && parent.renderable;
  const playable = renderable && playableProp && parent.playable;
  const loading = loadingReducer(
    renderable ? Loading.AUTO : Loading.LAZY,
    loadingReducer(loadingProp, parent.loading)
  );
  const notify = notifyProp || parent.notify;
  const current = useMemo(
    () =>
      /** @type {!AmpContextDef.ContextType} */ ({
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
 * @return {!AmpContextDef.ContextType}
 */
export function useAmpContext() {
  const AmpContext = getAmpContext();
  return useContext(AmpContext);
}

/**
 * Whether the calling component should currently be in the loaded state.
 *
 * @param {!Loading|string} loadingProp
 * @param {boolean} unloadOnPause
 * @return {boolean}
 */
export function useLoad(loadingProp, unloadOnPause = false) {
  const loadingRef = useRef(false);

  const {loading: loadingContext, renderable, playable} = useAmpContext();

  const loading = loadingReducer(loadingProp, loadingContext);

  // Compute whether the element should be loading at this time.
  const load =
    // Explicit instruction to unload.
    loading == Loading.UNLOAD
      ? false
      : // Must be unloaded to pause.
      unloadOnPause && !playable
      ? false
      : // Explicit instruction to load.
      loading == Loading.EAGER
      ? true
      : // Auto: allowed to load.
      loading == Loading.AUTO && renderable
      ? true
      : // Lazy: can continue loading if already started, but do not start it.
        loadingRef.current || false;
  loadingRef.current = load;
  return load;
}
