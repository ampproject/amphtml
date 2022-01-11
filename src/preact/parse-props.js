import {devAssert} from '#core/assert';
import {Loading_Enum} from '#core/constants/loading-instructions';
import {sequentialIdGenerator} from '#core/data-structures/id-generator';
import {parseBooleanAttribute} from '#core/dom';
import {matches, realChildNodes} from '#core/dom/query';
import {getDate} from '#core/types/date';
import {dashToCamelCase} from '#core/types/string';

import * as Preact from '#preact';

import {Slot, createSlot} from './slot';

/**
 * The following combinations are allowed.
 * - `attr`, (optionally) `type`, and (optionally) `media` can be specified when
 *   an attribute maps to a component prop 1:1.
 * - `attrs` and `parseAttrs` can be specified when multiple attributes map
 *   to a single prop.
 * - `attrMatches` and `parseAttrs` can be specified when multiple attributes
 *   map to a single prop.
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
 *   attrMatches: (function(string):boolean|undefined),
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

/** @const {string} */
const FILL_CONTENT_CLASS = 'i-amphtml-fill-content';

/**
 * This is an internal property that marks light DOM nodes that were rendered
 * by AMP/Preact bridge and thus must be ignored by the mutation observer to
 * avoid mutate->rerender->mutate loops.
 */
const RENDERED_PROP = '__AMP_RENDERED';

const childIdGenerator = sequentialIdGenerator();

const ONE_OF_ERROR_MESSAGE =
  'Only one of "attr", "attrs", "attrMatches", "passthrough", "passthroughNonEmpty", or "selector" must be given';

/**
 * @param {!Object<string, !AmpElementPropDef>} propDefs
 * @param {function(!AmpElementPropDef):boolean} cb
 * @return {boolean}
 */
export function checkPropsFor(propDefs, cb) {
  return Object.values(propDefs).some(cb);
}

/**
 * @param {!AmpElementPropDef} def
 * @return {boolean}
 */
export const HAS_SELECTOR = (def) => typeof def === 'string' || !!def.selector;

/**
 * @param {Node} node
 * @return {boolean}
 */
const IS_EMPTY_TEXT_NODE = (node) =>
  node.nodeType === /* TEXT_NODE */ 3 && node.nodeValue.trim().length === 0;

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

  // Common styles.
  if (layoutSizeDefined) {
    if (Ctor['usesShadowDom']) {
      props['style'] = SIZE_DEFINED_STYLE;
    } else {
      // `class` is preferred to `className` for Preact
      props['class'] = FILL_CONTENT_CLASS;
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
        !!def.attrMatches +
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
      value = [<Slot loading={Loading_Enum.LAZY} />];
    } else if (def.passthroughNonEmpty) {
      devAssert(Ctor['usesShadowDom']);
      // Use lazy loading inside the passthrough by default due to too many
      // elements.
      value = realChildNodes(element).every(IS_EMPTY_TEXT_NODE)
        ? null
        : [<Slot loading={Loading_Enum.LAZY} />];
    } else if (def.attr) {
      value = element.getAttribute(def.attr);
      if (def.media && value != null) {
        value = mediaQueryProps.resolveListQuery(String(value));
      }
    } else if (def.parseAttrs) {
      devAssert(def.attrs || def.attrMatches);
      value = def.parseAttrs(element);
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

/**
 * @param {string} name
 * @param {function(string): T} parse
 * @return {{attrs: Array<string>, parseAttrs: function(!Element):(?T|undefined)}}
 * @template T
 */
export function createParseAttr(name, parse) {
  const attrs = [name];
  const parseAttrs = (element) => {
    const attr = element.getAttribute(name);
    return attr && parse(attr);
  };
  return {
    'attrs': attrs,
    'parseAttrs': parseAttrs,
  };
}

/**
 * @param {string} name
 * @return {{attrMatches: function(?string=):boolean, parseAttrs: function(!Element):(?number|undefined)}}
 */
export function createParseDateAttr(name) {
  return createParseAttr(name, getDate);
}

/**
 * Maps multiple attributes with the same prefix to a single prop object.
 * The prefix cannot equal the attribute name.
 * @param {string} prefix
 * @return {{attrMatches: function(?string=):boolean, parseAttrs: function(!Element):(undefined|Object<string, string>)}}
 */
export function createParseAttrsWithPrefix(prefix) {
  const attrMatches = (name) => name?.startsWith(prefix) && name !== prefix;
  const parseAttrs = (element) => {
    let currObj;
    const attrs = element.attributes;
    for (let i = 0; i < attrs.length; i++) {
      const attrib = attrs[i];
      if (attrMatches(attrib.name)) {
        if (!currObj) {
          currObj = {};
        }
        currObj[dashToCamelCase(attrib.name.slice(prefix.length))] =
          attrib.value;
      }
    }
    return currObj;
  };
  return {
    'attrMatches': attrMatches,
    'parseAttrs': parseAttrs,
  };
}
