import type {Ref, VNode} from 'preact';

import {devAssert} from '#core/assert';
import {Loading_Enum} from '#core/constants/loading-instructions';
import {sequentialIdGenerator} from '#core/data-structures/id-generator';
import {parseBooleanAttribute} from '#core/dom';
import {matches, realChildElements, realChildNodes} from '#core/dom/query';
import type {MediaQueryProps} from '#core/dom/media-query-props';
import {getDate} from '#core/types/date';
import {dashToCamelCase} from '#core/types/string';

import * as Preact from '#preact';

import type {PreactBaseElement} from './base-element';
import {Slot, createSlot} from './slot';

type AmpElementProps = {[k: string]: AmpElementProp};

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
 */
export interface AmpElementProp {
  attr?: string;
  type?: string;
  attrMatches?: (s: string) => boolean;
  attrs: string[];
  parseAttrs?: (e: Element) => any;
  passthrough: boolean;
  passthroughNonEmpty: boolean;
  media?: boolean;
  default: any;
  name?: string;
  as?: boolean;
  selector?: string;
  single?: boolean;
  clone?: boolean;
  props?: JsonObject;
}

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

export function checkPropsFor(
  propDefs: AmpElementProps,
  cb: (p: AmpElementProp) => boolean
): boolean {
  return Object.values(propDefs).some(cb);
}

export const HAS_SELECTOR = (def: AmpElementProp): boolean =>
  typeof def === 'string' || !!def.selector;

const IS_EMPTY_TEXT_NODE = (node: Node): boolean =>
  node.nodeType === /* TEXT_NODE */ 3 && node.nodeValue?.trim().length === 0;

export function collectProps<T>(
  Ctor: typeof PreactBaseElement,
  element: AmpElement,
  ref: Ref<T>,
  defaultProps: JsonObject,
  mediaQueryProps: MediaQueryProps
) {
  const {
    'layoutSizeDefined': layoutSizeDefined,
    'lightDomTag': lightDomTag,
    'props': propDefs,
  } = Ctor;

  if (mediaQueryProps) {
    mediaQueryProps.start();
  }

  const props = {...defaultProps, ref} as JsonObject;

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

function parsePropDefs(
  Ctor: typeof PreactBaseElement,
  props: JsonObject,
  propDefs: AmpElementProps,
  element: Element,
  mediaQueryProps?: MediaQueryProps
) {
  // Match all children defined with "selector".
  if (checkPropsFor(propDefs, HAS_SELECTOR)) {
    // There are plain "children" and there're slotted children assigned
    // as separate properties. Thus in a carousel the plain "children" are
    // slides, and the "arrowNext" children are passed via a "arrowNext"
    // property.
    const elements = realChildElements(element);
    for (let i = 0; i < elements.length; i++) {
      const childElement = elements[i] as HTMLElement;
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
    const def = propDefs[name] as AmpElementProp;
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
      value = element.getAttribute(def.attr);
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
          ? parseBooleanAttribute(value as string)
          : value;
      props[name] = v;
    }
  }
}

/**
 * Copies an Element into a VNode representation.
 * (Interpretation into VNode is not recursive, so it excludes children.)
 */
function createShallowVNodeCopy(element: Element): VNode {
  const props: JsonObject = {
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

function matchChild(
  element: HTMLElement,
  defs: {[k: string]: AmpElementProp}
): string | null {
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

export function createParseAttr<T>(
  name: string,
  parse: (s: string) => T
): {attrs: string[]; parseAttrs: (e: Element) => T | '' | null} {
  const attrs = [name];
  const parseAttrs = (element: Element) => {
    const attr = element.getAttribute(name);
    return attr && parse(attr);
  };
  return {attrs, parseAttrs};
}

export function createParseDateAttr(
  name: string
): ReturnType<typeof createParseAttr> {
  return createParseAttr(name, getDate);
}

/**
 * Maps multiple attributes with the same prefix to a single prop object.
 * The prefix cannot equal the attribute name.
 * @param {string} prefix
 * @return {{
 *   attrMatches: function(?string=):boolean,
 *   parseAttrs: function(Element):(undefined|Object<string, string>)
 * }}
 */
export function createParseAttrsWithPrefix(prefix: string): {
  attrMatches: (str?: string) => boolean;
  parseAttrs: (e: Element) => undefined | JsonObject;
} {
  const attrMatches = (name: string): boolean =>
    name?.startsWith(prefix) && name !== prefix;

  const parseAttrs = (element: Element): JsonObject | undefined => {
    let currObj: JsonObject | undefined = undefined;
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

  return {attrMatches, parseAttrs};
}
