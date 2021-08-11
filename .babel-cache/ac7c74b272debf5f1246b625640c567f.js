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

import {
Loading,
reducer as loadingReducer } from "../core/constants/loading-instructions";


import * as Preact from "./";
import { createContext, useContext, useMemo } from "./";

/** @type {PreactDef.Context} */
var context;

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
  context || (
  context = createContext({
    renderable: true,
    playable: true,
    loading: Loading.AUTO })));


}

/**
 * A wrapper-component that recalculates and propagates AmpContext properties.
 *
 * @param {!AmpContextDef.ProviderProps} props
 * @return {!PreactDef.VNode}
 */
export function WithAmpContext(_ref)





{var children = _ref.children,_ref$loading = _ref.loading,loadingProp = _ref$loading === void 0 ? 'auto' : _ref$loading,notifyProp = _ref.notify,_ref$playable = _ref.playable,playableProp = _ref$playable === void 0 ? true : _ref$playable,_ref$renderable = _ref.renderable,renderableProp = _ref$renderable === void 0 ? true : _ref$renderable;
  var parent = useAmpContext();
  var renderable = renderableProp && parent.renderable;
  var playable = renderable && playableProp && parent.playable;
  var loading = loadingReducer(
  renderable ? Loading.AUTO : Loading.LAZY,
  loadingReducer(loadingProp, parent.loading));

  var notify = notifyProp || parent.notify;
  var current = useMemo(
  function () {return (
      /** @type {!AmpContextDef.ContextType} */({
        renderable: renderable,
        playable: playable,
        loading: loading,
        notify: notify }));},

  [renderable, playable, loading, notify]);

  var AmpContext = getAmpContext();
  return Preact.createElement(AmpContext.Provider, { children: children, value: current });
}

/**
 * @return {!AmpContextDef.ContextType}
 */
export function useAmpContext() {
  var AmpContext = getAmpContext();
  return useContext(AmpContext);
}

/**
 * Whether the calling component should currently be in the loaded state.
 *
 * @param {!Loading|string} loadingProp
 * @return {boolean}
 */
export function useLoading(loadingProp) {
  var _useAmpContext = useAmpContext(),loadingContext = _useAmpContext.loading;
  return loadingReducer(loadingProp, loadingContext);
}
// /Users/mszylkowski/src/amphtml/src/preact/context.js