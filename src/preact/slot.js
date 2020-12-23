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
import {CanPlay, CanRender, LoadingProp} from '../contextprops';
import {dev} from '../log';
import {rediscoverChildren, removeProp, setProp} from '../context';
import {useAmpContext} from './context';
import {useEffect, useLayoutEffect, useRef} from './index';

/**
 * @param {!Element} element
 * @param {string} name
 * @param {!Object|undefined} props
 * @return {!PreactDef.VNode}
 */
export function createSlot(element, name, props) {
  element.setAttribute('slot', name);
  return <Slot {...(props || {})} name={name} />;
}

/**
 * Slot component.
 *
 * @param {!JsonObject} props
 * @return {!PreactDef.VNode}
 */
export function Slot(props) {
  const ref = useRef(/** @type {?Element} */ (null));

  useSlotContext(ref);

  useEffect(() => {
    // Post-rendering cleanup, if any.
    if (props['postRender']) {
      props['postRender']();
    }
  });

  return <slot {...props} ref={ref} />;
}

/**
 * @param {{current:?}} ref
 */
export function useSlotContext(ref) {
  const context = useAmpContext();
  useLayoutEffect(() => {
    const slot = dev().assertElement(ref.current);
    setProp(slot, CanRender, Slot, context.renderable);
    setProp(slot, CanPlay, Slot, context.playable);
    setProp(
      slot,
      LoadingProp,
      Slot,
      /** @type {!../loading.Loading} */ (context.loading)
    );
    return () => {
      removeProp(slot, CanRender, Slot);
      removeProp(slot, CanPlay, Slot);
      removeProp(slot, LoadingProp, Slot);
      rediscoverChildren(slot);
    };
  }, [ref, context]);
}
