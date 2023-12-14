import {devAssert} from '#core/assert';
import {Loading_Enum} from '#core/constants/loading-instructions';
import {sequentialIdGenerator} from '#core/data-structures/id-generator';
import {parseBooleanAttribute} from '#core/dom';
import {matches, realChildElements, realChildNodes} from '#core/dom/query';
import {getDate} from '#core/types/date';
import {dashToCamelCase} from '#core/types/string';

import * as Preact from '#preact';

import {Slot, createSlot} from './slot';

/** @typedef {import('#core/dom/media-query-props').MediaQueryProps} MediaQueryProps */

/** @typedef {{[key: string]: AmpElementProp}} AmpElementProps */

/**
 * The following combinations are allowed.
 * - `attr`, (optionally) `type`, and (optionally) `media` can be specified when
 *   an attribute maps to a component prop 1:1.
 * - `parseAttr` can be specified to parse the `attr` value before passing it
 *   into the component.
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
 *   attr?: string,
 *   type?: string,
 *   attrMatches?: function(string):boolean,
 *   attrs: string[],
 *   parseAttr?: function(string):*,
 *   parseAttrs?: function(Element):*,
 *   passthrough: boolean,
 *   passthroughNonEmpty: boolean,
 *   media?: boolean,
 *   default: *,
 *   name?: string,
 *   as?: boolean,
 *   selector?: string,
 *   single?: boolean,
 *   clone?: boolean,
 *   props?: JsonObject,
 * }} AmpElementProp
 */

const RENDERED_ATTR = 'i-amphtml-rendered';

/**
 * The same as `applyFillContent`, but inside the shadow.
 */
const SIZE_DEFINED_STYLE = {
  'position': 'absolute',
  'top': '0',
  'left': '0',
  'width': '100%',
  'height': '100%',
};

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
 * @param {AmpElementProps} propDefs
 * @param {function(AmpElementProp):boolean} cb
 * @return {boolean}
 */
export function checkPropsFor(propDefs, cb) {
  return Object.values(propDefs).some(cb);
}

/**
 * @param {AmpElementProp} def
 * @return {boolean}
 */
export const HAS_SELECTOR = (def) => typeof def === 'string' || !!def.selector;

/**
 * @param {Node} node
 * @return {boolean}
 */
const IS_EMPTY_TEXT_NODE = (node) =>
  node.nodeType === /* TEXT_NODE */ 3 && node.nodeValue?.trim().length === 0;

/**
 * @param {typeof import('./base-element').PreactBaseElement} Ctor
 * @param {AmpElement} element
 * @param {import('preact').Ref<T>} ref
 * @param {JsonObject|null|undefined} defaultProps
 * @param {?MediaQueryProps} mediaQueryProps
 * @return {JsonObject}
 * @template T
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

  const props = /** @type {JsonObject} */ ({...defaultProps, ref});

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
 * @param {typeof import('./base-element').PreactBaseElement} Ctor
 * @param {JsonObject} props
 * @param {AmpElementProps} propDefs
 * @param {Element} element
 * @param {?MediaQueryProps} mediaQueryProps
 */
function parsePropDefs(Ctor, props, propDefs, element, mediaQueryProps) {
  // Match all children defined with "selector".
  if (checkPropsFor(propDefs, HAS_SELECTOR)) {
    // There are plain "children" and there're slotted children assigned
    // as separate properties. Thus in a carousel the plain "children" are
    // slides, and the "arrowNext" children are passed via a "arrowNext"
    // property.
    const elements = realChildElements(element);
    for (let i = 0; i < elements.length; i++) {
      const childElement = /** @type {HTMLElement} */ (elements[i]);
      const match = matchChild(childElement, propDefs);
      if (!match) {
        continue;
      }
      const def = propDefs[match];
      const {
        as = false,
        clone,
        name = match,
        props: slotProps = {},
        single,
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
    const def = /** @type {AmpElementProp} */ (propDefs[name]);
    devAssert(
      [
        def.attr,
        def.attrs,
        def.attrMatches,
        def.selector,
        def.passthrough,
        def.passthroughNonEmpty,
      ].filter(Boolean).length <= 1,
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
      const attr = element.getAttribute(def.attr);
      if (attr && def.parseAttr) {
        value = def.parseAttr(attr);
      } else {
        value = attr;
      }
      if (def.media && value != null) {
        devAssert(mediaQueryProps);
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
 * @param {Element} element
 * @return {import('preact').VNode}
 */
function createShallowVNodeCopy(element) {
  /** @type {JsonObject} */
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
 * @param {HTMLElement} element
 * @param {{[key: string]: AmpElementProp}} defs
 * @return {string|null}
 */
function matchChild(element, defs) {
  // TODO: a little slow to do this repeatedly.
  for (const match in defs) {
    const def = defs[match];
    const selector = typeof def == 'string' ? def : def.selector;
    if (selector && matches(element, selector)) {
      return match;
    }
  }
  return null;
}

/**
 * @param {string} name
 * @param {function(string): T} parse
 * @return {{
 *   attrs: Array<string>,
 *   parseAttrs: function(Element):(T|''|null)
 * }}
 * @template T
 */
export function createParseAttr(name, parse) {
  const attrs = [name];
  /** @type {function(Element):T|''|null} */
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
 * @return {ReturnType<typeof createParseAttr>}
 */
export function createParseDateAttr(name) {
  return createParseAttr(name, getDate);
}

/**
 * Maps multiple attributes with the same prefix to a single prop object.
 * The prefix cannot equal the attribute name.
 * @param {string} prefix
 * @return {{
 *   attrMatches: function(?string=):boolean,
 *   parseAttrs: function(Element):(undefined|{[key: string]: string})
 * }}
 */
export function createParseAttrsWithPrefix(prefix) {
  /**
   * @param {string} name
   * @return {boolean}
   */
  const attrMatches = (name) => name?.startsWith(prefix) && name !== prefix;

  /**
   * @param {Element} element
   * @return {JsonObject|undefined}
   */
  const parseAttrs = (element) => {
    /** @type {JsonObject|undefined} */
    let currObj = undefined;
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
