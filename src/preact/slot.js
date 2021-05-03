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
import {CanPlay, CanRender, LoadingProp} from '../context/contextprops';
import {Loading} from '../core/loading-instructions';
import {pureDevAssert as devAssert} from '../core/assert';
import {isElement} from '../core/types';
import {
  loadAll,
  pauseAll,
  unmountAll,
} from '../utils/resource-container-helper';
import {objectsEqualShallow} from '../core/types/object';
import {rediscoverChildren, removeProp, setProp} from '../context';
import {useAmpContext} from './context';
import {useEffect, useLayoutEffect, useRef} from './index';

const EMPTY = {};

/** @const {WeakMap<Element, {oldDefauls: (!Object|undefined), component: Component}>} */
const cache = new WeakMap();

/**
 * @param {!Element} element
 * @param {string} name
 * @param {!Object|undefined} defaultProps
 * @param {boolean|undefined} as
 * @return {!PreactDef.VNode|!PreactDef.FunctionalComponent}
 */
export function createSlot(element, name, defaultProps, as = false) {
  element.setAttribute('slot', name);
  if (!as) {
    return <Slot {...(defaultProps || EMPTY)} name={name} />;
  }

  const cached = cache.get(element);
  if (cached && objectsEqualShallow(cached.oldProps, defaultProps)) {
    return cached.component;
  }

  /**
   * @param {!Object|undefined} props
   * @return {!PreactDef.VNode}
   */
  function SlotWithProps(props) {
    return <Slot {...(defaultProps || EMPTY)} name={name} {...props} />;
  }
  cache.set(element, {oldProps: defaultProps, component: SlotWithProps});

  return SlotWithProps;
}

/**
 * Slot component.
 *
 * @param {!JsonObject} props
 * @return {!PreactDef.VNode}
 */
export function Slot(props) {
  const ref = useRef(/** @type {?Element} */ (null));

  useSlotContext(ref, props);

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
 * @param {!JsonObject=} opt_props
 */
export function useSlotContext(ref, opt_props) {
  const {'loading': loading} = opt_props || EMPTY;
  const context = useAmpContext();

  // Context changes.
  useLayoutEffect(() => {
    const slot = ref.current;
    devAssert(isElement(slot), 'Element expected');

    setProp(slot, CanRender, Slot, context.renderable);
    setProp(slot, CanPlay, Slot, context.playable);
    setProp(
      slot,
      LoadingProp,
      Slot,
      /** @type {!./core/loading-instructions.Loading} */ (context.loading)
    );

    if (!context.playable) {
      execute(slot, pauseAll);
    }

    return () => {
      removeProp(slot, CanRender, Slot);
      removeProp(slot, CanPlay, Slot);
      removeProp(slot, LoadingProp, Slot);
      rediscoverChildren(slot);
    };
  }, [ref, context]);

  // Mount and unmount. Keep it at the bottom because it's much better to
  // execute `pause` before `unmount` in this case.
  // This has to be a layout-effect to capture the old `Slot.assignedElements`
  // before the browser undistributes them.
  useLayoutEffect(() => {
    const slot = ref.current;
    devAssert(isElement(slot), 'Element expected');

    // Mount children, unless lazy loading requested. If so the element should
    // use `BaseElement.setAsContainer`.
    if (loading != Loading.LAZY) {
      // TODO(#31915): switch to `mount`.
      execute(slot, loadAll);
    }

    return () => {
      execute(slot, unmountAll);
    };
  }, [ref, loading]);
}

/**
 * @param {!Element} slot
 * @param {function(!AmpElement|!Array<!AmpElement>)} action
 */
function execute(slot, action) {
  const assignedElements = slot.assignedElements
    ? slot.assignedElements()
    : slot;
  if (Array.isArray(assignedElements) && assignedElements.length == 0) {
    return;
  }

  const win = slot.ownerDocument.defaultView;
  if (!win) {
    return;
  }

  const scheduler = win.requestIdleCallback || win.setTimeout;
  scheduler(() => action(assignedElements));
}
