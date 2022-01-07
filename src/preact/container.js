import {devAssert} from '#core/assert';
import {createElementWithAttributes} from '#core/dom';
import {applyFillContent} from '#core/dom/layout';
import {childElementByAttr, childElementByTag} from '#core/dom/query';

import * as Preact from '#preact';

import {installShadowStyle} from '../shadow-embed';

const SHADOW_CONTAINER_ATTRS = {
  'style': 'display: contents; background: inherit;',
  'part': 'c',
};

/**
 * @type {string}
 */
const SERVICE_SLOT_NAME = 'i-amphtml-svc';

/**
 * @type {JsonObject}
 */
const SERVICE_SLOT_ATTRS = {'name': SERVICE_SLOT_NAME};

const RENDERED_ATTR = 'i-amphtml-rendered';

const RENDERED_ATTRS = {'i-amphtml-rendered': ''};

/**
 * This is an internal property that marks light DOM nodes that were rendered
 * by AMP/Preact bridge and thus must be ignored by the mutation observer to
 * avoid mutate->rerender->mutate loops.
 */
const RENDERED_PROP = '__AMP_RENDERED';
// TODO: MARK RENDERED DURING HYDRATION.

/**
 * @param {{}} Ctor
 * @param {HTMLElement} element
 * @return {{
 *   hydrationPending: boolean,
 *   container: HTMLElement
 * }}
 */
export function createBentoContainer(Ctor, element) {
  const isShadow = Ctor['usesShadowDom'];
  const lightDomTag = isShadow ? null : Ctor['lightDomTag'];
  const isDetached = Ctor['detached'];
  const doc = element.ownerDoc;
  let hydrationPending = false;

  let container;
  if (isShadow) {
    devAssert(
      !isDetached,
      'The AMP element cannot be rendered in detached mode ' +
        'when "props" are configured with "children" property.'
    );
    // Check if there's a pre-constructed shadow DOM.
    let {shadowRoot} = element;
    container = shadowRoot && childElementByTag(shadowRoot, 'c');
    if (container) {
      hydrationPending = true;
    } else {
      shadowRoot = createShadowRoot(element, Ctor['delegatesFocus']);

      // The pre-constructed shadow root is required to have the stylesheet
      // inline. Thus, only the new shadow roots share the stylesheets.
      const shadowCss = Ctor['shadowCss'];
      if (shadowCss) {
        installShadowStyle(shadowRoot, element.tagName, shadowCss);
      }

      // Create container.
      // The pre-constructed shadow root is required to have this container.
      container = createElementWithAttributes(doc, 'c', SHADOW_CONTAINER_ATTRS);
      shadowRoot.appendChild(container);

      // Create a slot for internal service elements i.e. "i-amphtml-sizer".
      // The pre-constructed shadow root is required to have this slot.
      const serviceSlot = createElementWithAttributes(
        doc,
        'slot',
        SERVICE_SLOT_ATTRS
      );
      shadowRoot.appendChild(serviceSlot);
      // TODO!
      // this.getPlaceholder?.()?.setAttribute('slot', SERVICE_SLOT_NAME);
      // this.getFallback?.()?.setAttribute('slot', SERVICE_SLOT_NAME);
      // this.getOverflowElement?.()?.setAttribute('slot', SERVICE_SLOT_NAME);
    }
  } else if (lightDomTag) {
    container = element;
    const replacement =
      childElementByAttr(container, RENDERED_ATTR) ||
      createElementWithAttributes(doc, lightDomTag, RENDERED_ATTRS);
    replacement[RENDERED_PROP] = true;
    if (Ctor['layoutSizeDefined']) {
      replacement.classList.add('i-amphtml-fill-content');
    }
    container.appendChild(replacement);
  } else {
    container = doc.createElement('i-amphtml-c');
    applyFillContent(container);
    if (!isDetached) {
      element.appendChild(container);
    }
  }
  return {hydrationPending, container};
}

/**
 * Constructs a Shadow Root for both server
 * and client environments.
 *
 * @param {HTMLElement} element
 * @param {boolean} delegatesFocus
 * @return {HTMLTemplateElement | ShadowRoot}
 */
function createShadowRoot(element, delegatesFocus) {
  if (isBrowser()) {
    return element.attachShadow({
      mode: 'open',
      delegatesFocus,
    });
  }

  const template = (
    <template shadowroot="open" shadowrootdelegatesfocus={delegatesFocus} />
  );
  return template;
}

// TODO: verify this is this the right way to check (compiler.js needs to be compat).
/**
 * @return {boolean}
 */
function isBrowser() {
  return typeof window !== null; // eslint-disable-line local/no-global
}
