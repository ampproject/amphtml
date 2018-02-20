/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {dev} from './log';
import {endsWith, startsWith} from './string';
import {hasOwn} from './utils/object';

/**
 * A global property that checks if black magic has already been performed.
 * @const {string}
 */
const INSTALLED_PROP = '__AMP_BLACK_MAGIC_INSTALLED_';

/**
 * The property on `window` where we will store whether we are currently
 * performing the mutate-phase.
 *
 * @const {string}
 */
const IN_MUTATE_PHASE_PROP = '__AMP_VSYNC_IN_MUTATE_';

/**
 * A stack used for keeping the previous mutation state whenever a new mutation
 * phase is entered.
 *
 * @const {!Array<boolean>}
 */
const MUTATION_STACK = [];

/**
 * Creates a "mutation" phase regardless of vsync's async batching.
 * THIS IS DANGEROUS, AND BREAKS AN IMPLICIT AMP INVARIANT.
 *
 * @param {!Window} win
 */
export function dangerousSyncMutateStart(win) {
  MUTATION_STACK.push(win[IN_MUTATE_PHASE_PROP]);
  win[IN_MUTATE_PHASE_PROP] = true;
}

/**
 * Stops the "mutation" phase regardless of vsync's async batching.
 * THIS IS DANGEROUS, AND BREAKS AN IMPLICIT AMP INVARIANT.
 *
 * @param {!Window} win
 */
export function dangerousSyncMutateStop(win) {
  win[IN_MUTATE_PHASE_PROP] = dev().assertBoolean(MUTATION_STACK.pop());
}


/**
 * Gathers the node's ancestry tree, so that the location may be logged.
 *
 * @param {!Node} node
 * @return {string}
 */
function ancestryCssSelector(node) {
  const tree = [node.tagName];
  for (let c = node.parentElement; c; c = c.parentElement) {
    const tag = c.tagName;
    tree.push(tag);
    if (startsWith(tag, 'AMP-')) {
      break;
    }
  }

  return tree.reverse().join(' > ');
}

/**
 * Checks that this mutation is occurring in a mutation phase.
 *
 * @param {!Node|!Attr} nodeOrAttr
 */
function assertMutationPhase(nodeOrAttr) {
  const node = nodeOrAttr.ownerElement || nodeOrAttr;
  const window = node.ownerDocument.defaultView;
  if (node.isConnected !== false && !window[IN_MUTATE_PHASE_PROP]) {
    dev().error('MUTATE', 'mutation occurred outside mutation phase',
        ancestryCssSelector(node));
  }
}

/**
 * Installs the mutation-outside-mutation-phase monkey patches.
 * Note: this is considered taboo, and should only be done in development
 * environments.
 *
 * This makes excessive use of property descriptors, read about them at
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description
 *
 * @param {!Window} window
 */
export function install(window) {
  if (window[INSTALLED_PROP]) {
    return;
  }
  window[INSTALLED_PROP] = true;
  window[IN_MUTATE_PHASE_PROP] = false;

  // First, we'll do runtime inspection to find special setter properties
  // for Nodes, and monkey patch them.
  // Setters are functions that run when `obj.prop = value` executed.
  const setterPatches = Object.getOwnPropertyNames(window).filter(prop => {
    return endsWith(prop, 'Element') && window[prop];
  }).map(prop => {
    return window[prop];
  });
  // Include Attr, Node, DOMTokenList, in the setter monkey-patches
  setterPatches.push(window.Attr);
  setterPatches.push(window.Node);

  setterPatches.forEach(Element => {
    const proto = Element.prototype;
    const names = Object.getOwnPropertyNames(proto);

    names.forEach(prop => {
      const descriptor = Object.getOwnPropertyDescriptor(proto, prop);

      // We only care about accessor descriptors that include a setter.
      if (!descriptor.set) {
        return;
      }

      const setter = descriptor.set;
      descriptor.set = function(value) {
        assertMutationPhase(this);
        return setter.call(this, value);
      };
      Object.defineProperty(descriptor.set, 'name', {
        value: `${Element.name}#${prop}#set`,
      });

      Object.defineProperty(proto, prop, descriptor);
    });
  });

  // Now, we'll monkey patch node methods that cause mutations.
  const mutateMethods = [
    {
      klass: Node,
      methods: [
        'insertBefore',
        'appendChild',
        'replaceChild',
        'removeChild',
      ],
    },
    {
      klass: Element,
      methods: [
        'setAttribute',
        'removeAttribute',
      ],
    },
  ];
  mutateMethods.forEach(({klass, methods}) => {
    const proto = klass.prototype;

    methods.forEach(prop => {
      const descriptor = Object.getOwnPropertyDescriptor(proto, prop);

      // We only care if this is a data descriptor (which guarantees the
      // `value` is the function).
      if (!descriptor || !descriptor.value) {
        return;
      }

      const method = descriptor.value;
      descriptor.value = function() {
        assertMutationPhase(this);
        return method.apply(this, arguments);
      };
      Object.defineProperty(descriptor.value, 'name', {
        value: `${klass.name}#${prop}`,
      });

      Object.defineProperty(proto, prop, descriptor);
    });
  });

  // Next, we'll monkey patch live-connected objects which can cause mutations
  const liveConnectedMutators = [
    {
      // NamedNodeMap
      klasses: [
        {klass: Element, prop: 'attributes'},
      ],
      methods: [
        'setNamedItem',
        'removeNamedItem',
      ],
      setters: [],
    },
    {
      // DOMTokenList
      klasses: [
        {klass: Element, prop: 'classList'},
        {klass: window.HTMLLinkElement, prop: 'relList'},
        {klass: window.HTMLAnchorElement, prop: 'relList'},
        {klass: window.HTMLIFrameElement, prop: 'sandbox'},
        {klass: window.HTMLAreaElement, prop: 'relList'},
        {klass: window.HTMLOutputElement, prop: 'htmlFor'},
      ],
      methods: [
        'add',
        'remove',
        'replace',
        'toggle',

      ],
      setters: [
        'value',
      ],
    },
    {
      // CSSStyleDeclaration
      klasses: [
        {klass: HTMLElement, prop: 'style'},
      ],
      methods: [
        'setProperty',
        'setPropertyValue',
        'setPropertyPriority',
        'removeProperty',
      ],
      setters: [
        'cssText',
        'cssFloat',
      ],
    },
  ];
  liveConnectedMutators.forEach(({klasses, methods, setters}) => {
    klasses.forEach(({klass, prop}) => {
      if (!klass) {
        return;
      }
      const proto = klass.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(proto, prop);

      // We only care if this is an accessor descriptor with a getter.
      if (!descriptor || !descriptor.get) {
        return;
      }

      const getter = descriptor.get;
      descriptor.get = function() {
        const element = this;
        const liveObject = getter.call(this);

        methods.forEach(prop => {
          // Only install once
          if (hasOwn(liveObject, prop) || !(prop in liveObject)) {
            return;
          }

          const method = liveObject[prop];
          // Shadow the prototype method with an own method.
          liveObject[prop] = function() {
            assertMutationPhase(element);
            return method.apply(liveObject, arguments);
          };
          Object.defineProperty(liveObject[prop], 'name', {
            value: `${liveObject.constructor.name}#${prop}`,
          });
        });

        setters.forEach(prop => {
          // Only install once
          if (hasOwn(liveObject, prop) || !(prop in liveObject)) {
            return;
          }

          const liveProto = Object.getPrototypeOf(liveObject);
          const descriptor = Object.getOwnPropertyDescriptor(liveProto, prop);

          // We only care about accessor descriptors that include a setter.
          if (!descriptor || !descriptor.set) {
            return;
          }

          const setter = descriptor.set;
          descriptor.set = function(value) {
            assertMutationPhase(element);
            return setter.call(liveObject, value);
          };
          Object.defineProperty(descriptor.set, 'name', {
            value: `${liveObject.constructor.name}#${prop}#set`,
          });

          Object.defineProperty(liveObject, prop, descriptor);
        });

        return liveObject;
      };
      Object.defineProperty(descriptor.get, 'name', {
        value: `${klass.name}#${prop}#get`,
      });

      Object.defineProperty(proto, prop, descriptor);
    });
  });

  // Ooo boy, datasets are DOMStringMaps, which allow arbitrary properties to
  // be defined (which are synced to data attributes). And don't even get me
  // started on CSSStyleDeclaration's magic properties.
  // The only way to handle this is with a proxy wrapping the dataset itself.
  if (typeof Proxy === 'function') {
    const proto = HTMLElement.prototype;
    const props = [
      'dataset',
      'style',
    ];

    props.forEach(prop => {
      const descriptor = Object.getOwnPropertyDescriptor(proto, prop);

      if (descriptor && descriptor.get) {
        const getter = descriptor.get;

        // We don't (really) change the behavior of the getter, only the
        // value that is returned by it.
        descriptor.get = function() {
          const element = this;
          const liveObject = getter.call(element);

          // Datasets allow arbitrary property writes/deletes, so we need to trap
          // both.
          const handler = {
            set(target, property, value) {
              assertMutationPhase(element);
              target[property] = value;
              return true;
            },

            deleteProperty(target, prop) {
              assertMutationPhase(element);
              return delete target[prop];
            },
          };
          Object.defineProperty(handler.set, 'name', {
            value: `${liveObject.constructor.name}#${prop}#set`,
          });
          Object.defineProperty(handler.deleteProperty, 'name', {
            value: `${liveObject.constructor.name}#${prop}#delete`,
          });
          return new Proxy(liveObject, handler);
        };
        Object.defineProperty(descriptor.get, 'name', {
          value: `HTMLElement#${prop}#get`,
        });

        Object.defineProperty(proto, prop, descriptor);
      }
    });
  }
}
