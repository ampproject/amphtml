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

import * as Preact from '#preact';
import {Loading} from '#core/constants/loading-instructions';
import {Slot, createSlot} from './slot';
import {dashToCamelCase} from '#core/types/string';
import {devAssert} from '#core/assert';
import {getDate} from '#core/types/date';
import {matches, realChildNodes} from '#core/dom/query';
import {parseBooleanAttribute} from '#core/dom';
import {sequentialIdGenerator} from '#core/data-structures/id-generator';

/**
 * The following combinations are allowed.
 * - `attr`, (optionally) `type`, and (optionally) `media` can be specified when
 *   an attribute maps to a component prop 1:1.
 * - `attrs` and `parseAttrs` can be specified when multiple attributes map
 *   to a single prop.
 * - `attrPrefix` can be specified when multiple attributes with the same prefix
 *   map to a single prop object. The prefix cannot equal the attribute name.
 * - `selector` can be specified for children of a certain shape and structure
 *   according to ChildDef.
 * - `passthrough` can be specified to slot children using a single
 *   `<slot>` element for all children. This is in contrast to selector mode,
 *   which creates a new named `<slot>` for every selector.
 * - `passthroughNonEmpty` is similar to passthrough mode except that when there
 *   are no children elements, the returned value will be null instead of the
 *   unnamed `<slot>`. This allows the Preact environment to have conditional
 *   behavior depending on whether or not there are children.
 *
 * @typedef {{
 *   attr: (string|undefined),
 *   type: (string|undefined),
 *   attrPrefix: (string|undefined),
 *   attrs: (!Array<string>|undefined),
 *   parseAttrs: ((function(!Element):*)|undefined),
 *   media: (boolean|undefined),
 *   default: *,
 * }|string}
 */
export let AmpElementPropDef;

/**
 * @typedef {{
 *   name: string,
 *   selector: string,
 *   single: (boolean|undefined),
 *   clone: (boolean|undefined),
 *   props: (!JsonObject|undefined),
 * }}
 */
let ChildDef;

/** @const {string} */
const RENDERED_ATTR = 'i-amphtml-rendered';

/**
 * The same as `applyFillContent`, but inside the shadow.
 * @const {!Object}
 */
const SIZE_DEFINED_STYLE = {
  'position': 'absolute',
  'top': '0',
  'left': '0',
  'width': '100%',
  'height': '100%',
};

/**
 * This is an internal property that marks light DOM nodes that were rendered
 * by AMP/Preact bridge and thus must be ignored by the mutation observer to
 * avoid mutate->rerender->mutate loops.
 */
const RENDERED_PROP = '__AMP_RENDERED';

const childIdGenerator = sequentialIdGenerator();

const ONE_OF_ERROR_MESSAGE =
  'Only one of "attr", "attrs", "attrPrefix", "passthrough", ' +
  '"passthroughNonEmpty", or "selector" must be given';

/**
 * @param {!Object<string, !AmpElementPropDef>} propDefs
 * @param {function(!AmpElementPropDef):boolean} cb
 * @return {boolean}
 */
function checkPropsFor(propDefs, cb) {
  return Object.values(propDefs).some(cb);
}

/**
 * @param {!AmpElementPropDef} def
 * @return {boolean}
 */
const HAS_SELECTOR = (def) => typeof def === 'string' || !!def.selector;

/**
 * @param {Node} node
 * @return {boolean}
 */
const IS_EMPTY_TEXT_NODE = (node) =>
  node.nodeType === /* TEXT_NODE */ 3 && node.nodeValue.trim().length === 0;

/**
 * @param {null|string} attributeName
 * @param {string|undefined} attributePrefix
 * @return {boolean}
 */
function matchesAttrPrefix(attributeName, attributePrefix) {
  return (
    attributeName !== null &&
    attributePrefix !== undefined &&
    attributeName.startsWith(attributePrefix) &&
    attributeName !== attributePrefix
  );
}

/**
 * @param {typeof PreactBaseElement} Ctor
 * @param {!AmpElement} element
 * @param {{current: ?}} ref
 * @param {!JsonObject|null|undefined} defaultProps
 * @param {?MediaQueryProps} mediaQueryProps
 * @return {!JsonObject}
 */
export function collectProps(
  Ctor,
  element,
  ref,
  defaultProps,
  mediaQueryProps
) {
  const {
    'className': className,
    'layoutSizeDefined': layoutSizeDefined,
    'lightDomTag': lightDomTag,
    'props': propDefs,
  } = Ctor;

  if (mediaQueryProps) {
    mediaQueryProps.start();
  }

  const props = /** @type {!JsonObject} */ ({...defaultProps, ref});

  // Light DOM.
  if (lightDomTag) {
    props[RENDERED_ATTR] = true;
    props[RENDERED_PROP] = true;
    props['as'] = lightDomTag;
  }

  // Class.
  if (className) {
    props['className'] = className;
  }

  // Common styles.
  if (layoutSizeDefined) {
    if (Ctor['usesShadowDom']) {
      props['style'] = SIZE_DEFINED_STYLE;
    } else {
      props['className'] =
        `i-amphtml-fill-content ${className || ''}`.trim() || null;
    }
  }

  // Props.
  parsePropDefs(Ctor, props, propDefs, element, mediaQueryProps);
  if (mediaQueryProps) {
    mediaQueryProps.complete();
  }

  return props;
}

/**
 * @param {typeof PreactBaseElement} Ctor
 * @param {!Object} props
 * @param {!Object} propDefs
 * @param {!Element} element
 * @param {?MediaQueryProps} mediaQueryProps
 */
function parsePropDefs(Ctor, props, propDefs, element, mediaQueryProps) {
  // Match all children defined with "selector".
  if (checkPropsFor(propDefs, HAS_SELECTOR)) {
    // There are plain "children" and there're slotted children assigned
    // as separate properties. Thus in a carousel the plain "children" are
    // slides, and the "arrowNext" children are passed via a "arrowNext"
    // property.
    const nodes = realChildNodes(element);
    for (let i = 0; i < nodes.length; i++) {
      const childElement = nodes[i];
      const match = matchChild(childElement, propDefs);
      if (!match) {
        continue;
      }
      const def = propDefs[match];
      const {
        as = false,
        single,
        name = match,
        clone,
        props: slotProps = {},
      } = def;
      devAssert(clone || Ctor['usesShadowDom']);
      const parsedSlotProps = {};
      parsePropDefs(
        Ctor,
        parsedSlotProps,
        slotProps,
        childElement,
        mediaQueryProps
      );

      // TBD: assign keys, reuse slots, etc.
      if (single) {
        props[name] = createSlot(
          childElement,
          childElement.getAttribute('slot') || `i-amphtml-${name}`,
          parsedSlotProps,
          as
        );
      } else {
        const list = props[name] || (props[name] = []);
        devAssert(!as);
        list.push(
          clone
            ? createShallowVNodeCopy(childElement)
            : createSlot(
                childElement,
                childElement.getAttribute('slot') ||
                  `i-amphtml-${name}-${childIdGenerator()}`,
                parsedSlotProps
              )
        );
      }
    }
  }

  for (const name in propDefs) {
    const def = /** @type {!AmpElementPropDef} */ (propDefs[name]);
    devAssert(
      !!def.attr +
        !!def.attrs +
        !!def.attrPrefix +
        !!def.selector +
        !!def.passthrough +
        !!def.passthroughNonEmpty <=
        1,
      ONE_OF_ERROR_MESSAGE
    );
    let value;
    if (def.passthrough) {
      devAssert(Ctor['usesShadowDom']);
      // Use lazy loading inside the passthrough by default due to too many
      // elements.
      value = [<Slot loading={Loading.LAZY} />];
    } else if (def.passthroughNonEmpty) {
      devAssert(Ctor['usesShadowDom']);
      // Use lazy loading inside the passthrough by default due to too many
      // elements.
      value = realChildNodes(element).every(IS_EMPTY_TEXT_NODE)
        ? null
        : [<Slot loading={Loading.LAZY} />];
    } else if (def.attr) {
      value = element.getAttribute(def.attr);
      if (def.media && value != null) {
        value = mediaQueryProps.resolveListQuery(String(value));
      }
    } else if (def.parseAttrs) {
      devAssert(def.attrs);
      value = def.parseAttrs(element);
    } else if (def.attrPrefix) {
      const currObj = {};
      let objContains = false;
      const attrs = element.attributes;
      for (let i = 0; i < attrs.length; i++) {
        const attrib = attrs[i];
        if (matchesAttrPrefix(attrib.name, def.attrPrefix)) {
          currObj[dashToCamelCase(attrib.name.slice(def.attrPrefix.length))] =
            attrib.value;
          objContains = true;
        }
      }
      if (objContains) {
        value = currObj;
      }
    }
    if (value == null) {
      if (def.default != null) {
        props[name] = def.default;
      }
    } else {
      const v =
        def.type == 'number'
          ? parseFloat(value)
          : def.type == 'boolean'
          ? parseBooleanAttribute(/** @type {string} */ (value))
          : def.type == 'date'
          ? getDate(value)
          : value;
      props[name] = v;
    }
  }
}

/**
 * Copies an Element into a VNode representation.
 * (Interpretation into VNode is not recursive, so it excludes children.)
 * @param {!Element} element
 * @return {!PreactDef.Renderable}
 */
function createShallowVNodeCopy(element) {
  const props = {
    // Setting `key` to an object is fine in Preact, but not React.
    'key': element,
  };
  // We need to read element.attributes and element.attributes.length only once,
  // since reading a live NamedNodeMap repeatedly is expensive.
  const {attributes, localName} = element;
  const {length} = attributes;
  for (let i = 0; i < length; i++) {
    const {name, value} = attributes[i];
    props[name] = value;
  }
  return Preact.createElement(localName, props);
}

/**
 * @param {!Element} element
 * @param {!Object} defs
 * @return {?ChildDef}
 */
function matchChild(element, defs) {
  // TODO: a little slow to do this repeatedly.
  for (const match in defs) {
    const def = defs[match];
    const selector = typeof def == 'string' ? def : def.selector;
    if (matches(element, selector)) {
      return match;
    }
  }
  return null;
}
