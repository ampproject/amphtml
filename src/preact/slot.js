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
import {dev} from '../log';
import {getAmpContext} from './context';
import {matches, toggleAttribute} from '../dom';
import {objectsEqualShallow} from '../utils/object';
import {toArray} from '../types';
import {useContext, useEffect, useRef} from './index';
import {useMountEffect} from './utils';

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
  const context = useContext(getAmpContext());
  const ref = useRef(/** @type {?Element} */ (null));
  const slotProps = {...props, ref};
  useEffect(() => {
    const slot = dev().assertElement(ref.current);
    const assignedElements = getAssignedElements(props, slot);
    slot.__assignedElements = assignedElements;

    // TBD: Just for debug for now. but maybe can also be used for hydration?
    slot.setAttribute('i-amphtml-context', JSON.stringify(context));
    // TODO: remove debug info.
    assignedElements.forEach((node) => {
      node.__assignedSlot = slot;
      node.setAttribute('i-amphtml-context', JSON.stringify(context));
    });

    // Retarget slots and content.
    if (props['retarget']) {
      // TBD: retargetting here is for:
      // 1. `disabled` doesn't apply inside subtrees. This makes it more like
      //    `hidden`. Similarly do other attributes.
      // 2. Re-propagate click events to slots since React stops propagation.
      //    See https://github.com/facebook/react/issues/9242.
      assignedElements.forEach((node) => {
        // Basic attributes:
        const {attributes} = slot;
        for (let i = 0, l = attributes.length; i < l; i++) {
          const {name, value} = attributes[i];
          if (
            name == 'name' ||
            name == 'class' ||
            name == 'style' ||
            name == 'i-amphtml-context'
          ) {
            // This is the slot's name or other internal attributes.
          } else {
            // TBD: switch to explicit definition of "supported" attributes.
            node.setAttribute(name, value);
          }
        }
        // Boolean attributes:
        node.disabled = slot.hasAttribute('disabled');
        node.hidden = slot.hasAttribute('hidden');
        toggleAttribute(node, 'selected', slot.hasAttribute('selected'));
        toggleAttribute(node, 'expanded', slot.hasAttribute('expanded'));
        if (!node['i-amphtml-event-distr']) {
          node['i-amphtml-event-distr'] = true;
          node.addEventListener('click', (e) => {
            // Stop propagation on the original event to avoid deliving this
            // event twice with frameworks that correctly work with composed
            // boundaries.
            e.stopPropagation();
            e.preventDefault();
            const event = new Event('click', {
              bubbles: true,
              cancelable: true,
              composed: false,
            });
            slot.dispatchEvent(event);
          });
        }
      });
    }

    const oldContext = slot['i-amphtml-context'];
    if (!objectsEqualShallow(oldContext, context)) {
      slot['i-amphtml-context'] = context;
      // TODO: Switch to fast child-node discover. See Revamp for the algo.
      const affectedNodes = [];
      assignedElements.forEach((node) => {
        node['i-amphtml-context'] = context;
        affectedNodes.push.apply(affectedNodes, getAmpElements(node));
      });
      affectedNodes.forEach((node) => {
        const event = new Event('i-amphtml-context-changed', {
          bubbles: false,
          cancelable: true,
          composed: true,
        });
        event.data = context;
        node.dispatchEvent(event);
      });
    }

    // Post-rendering cleanup, if any.
    if (props['postRender']) {
      props['postRender']();
    }
  });

  // Register an unmount listener. This can't be joined with the previous
  // useEffect, because it must only be run once while the previous needs to
  // run every render.
  useMountEffect(() => {
    const slot = dev().assertElement(ref.current);

    return () => {
      const affectedNodes = [];
      getAssignedElements(props, slot).forEach((node) => {
        affectedNodes.push.apply(affectedNodes, getAmpElements(node));
      });
      affectedNodes.forEach((node) => {
        const event = new Event('i-amphtml-unmounted', {
          bubbles: false,
          cancelable: true,
          composed: true,
        });
        node.dispatchEvent(event);
      });
    };
  });

  return <slot {...slotProps} />;
}

/**
 * @param {!Element} root
 * @return {!Array<!Node>}
 */
function getAmpElements(root) {
  const elements = toArray(root.querySelectorAll('.i-amphtml-element'));
  if (matches(root, '.i-amphtml-element')) {
    elements.unshift(root);
  }
  return elements;
}

/**
 * @param {!Object} props
 * @param {!Element} slotElement
 * @return {!Array<!Element>}
 */
function getAssignedElements(props, slotElement) {
  return props.assignedElements || toArray(slotElement.assignedElements());
}
