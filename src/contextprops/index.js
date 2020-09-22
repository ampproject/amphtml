/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {Loading, reducer as loadingReducer} from '../loading';
import {contextProp} from '../context';

/**
 * Defines whether a DOM subtree can be currently seen by the user. A subtree
 * can be not renderable due `display: none`, or `hidden` attribute, unslotted
 * in shadow DOM, or because a parent component knows for certain that this
 * subtree cannot be seen by the user without some active interaction.
 *
 * Default is `true`.
 *
 * @const {!ContextProp<boolean>}
 */
const CanRender = contextProp('CanRender', {
  defaultValue: true,
  recursive: (inputs) => inputs.reduce(andReducer),
  compute: (contextNode, inputs, parentValue) =>
    (parentValue && inputs.reduce(andReducer, true)) || false,
});

/**
 * Defines whether a DOM subtree can be currently played or animated. If a
 * a subtree not renderable (`canRender == false`), it also cannot be played.
 * But even if a subtree is renderable, a parent component may decide that
 * playback should not be possible.
 *
 * Default is `true`.
 *
 * @const {!ContextProp<boolean>}
 */
const CanPlay = contextProp('CanPlay', {
  defaultValue: true,
  recursive: (inputs) => inputs.reduce(andReducer),
  deps: [CanRender],
  compute: (contextNode, inputs, parentValue, canRender) =>
    (canRender && parentValue && inputs.reduce(andReducer, true)) || false,
});

/**
 * The default `Loading` instruction for a subtree. See `Loading` for the set
 * of possible values. Non-renderable subtrees automatically get a value of
 * "lazy".
 *
 * Default is "auto".
 *
 * @const {!ContextProp<!Loading>}
 */
const LoadingProp = contextProp('Loading', {
  defaultValue: Loading.AUTO,
  recursive: (inputs) => inputs.reduce(loadingReducer),
  deps: [CanRender],
  compute: (contextNode, inputs, parentValue, canRender) =>
    loadingReducer(
      canRender ? Loading.AUTO : Loading.LAZY,
      loadingReducer(
        parentValue || Loading.AUTO,
        inputs.reduce(loadingReducer, Loading.AUTO)
      )
    ),
});

/**
 * @param {T} acc
 * @param {T} value
 * @return {T}
 * @template T
 */
const andReducer = (acc, value) => acc && value;

export {CanRender, CanPlay, LoadingProp};
