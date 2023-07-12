import {devAssert} from '#core/assert';
import {hasOwn, map} from '#core/types/object';

/** @type {HTMLElement} */
let htmlContainer;

/** @type {SVGSVGElement} */
let svgContainer;

/**
 * Creates the html helper for the doc.
 *
 * @param {HTMLElement|Document} nodeOrDoc
 * @return {function(readonly string[]):HTMLElement}
 */
export function htmlFor(nodeOrDoc) {
  const doc = nodeOrDoc.ownerDocument || /** @type {Document} */ (nodeOrDoc);
  if (!htmlContainer || htmlContainer.ownerDocument !== doc) {
    htmlContainer = doc.createElement('div');
  }

  return html;
}

/**
 * Creates the svg helper for the doc.
 *
 * @param {HTMLElement|Document} nodeOrDoc
 * @return {function(readonly string[]):HTMLElement}
 */
export function svgFor(nodeOrDoc) {
  const doc = nodeOrDoc.ownerDocument || /** @type {Document} */ (nodeOrDoc);
  if (!svgContainer || svgContainer.ownerDocument !== doc) {
    svgContainer = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  }

  return svg;
}

/**
 * A tagged template literal helper to generate static SVG trees.
 * This must be used as a tagged template, ie
 *
 * ```
 * const circle = svg`<circle cx="60" cy="60" r="22"></circle>`;
 * ```
 *
 * Only the root element and its subtree will be returned. DO NOT use this to
 * render subtree's with dynamic content, it WILL result in an error!
 *
 * @param {readonly string[]} strings
 * @return {HTMLElement}
 */
function svg(strings) {
  return createNode(svgContainer, strings);
}

/**
 * A tagged template literal helper to generate static DOM trees.
 * This must be used as a tagged template, ie
 *
 * ```
 * const div = html`<div><span></span></div>`;
 * ```
 *
 * Only the root element and its subtree will be returned. DO NOT use this to
 * render subtree's with dynamic content, it WILL result in an error!
 *
 * @param {readonly string[]} strings
 * @return {HTMLElement}
 */
function html(strings) {
  return createNode(htmlContainer, strings);
}

/**
 * Helper used by html and svg string literal functions.
 * @param {HTMLElement | SVGSVGElement} container
 * @param {readonly string[]} strings
 * @return {HTMLElement}
 */
function createNode(container, strings) {
  devAssert(strings.length === 1, 'Improper html template tag usage.');
  devAssert(
    Array.isArray(strings) || hasOwn(strings, 'raw'),
    'Invalid template strings array'
  );

  if (self.trustedTypes && self.trustedTypes.createPolicy) {
    const policy = self.trustedTypes.createPolicy(
      'static-template#createNode',
      {
        createHTML: function (unused) {
          return strings[0];
        },
      }
    );
    // @ts-ignore
    container./*OK*/ innerHTML = policy.createHTML('ignored');
  } else {
    container./*OK*/ innerHTML = strings[0];
  }

  const el = /** @type {HTMLElement} */ (container.firstElementChild);
  devAssert(el, 'No elements in template');
  devAssert(!el.nextElementSibling, 'Too many root elements in template');

  // Clear to free memory.
  container.removeChild(el);

  return el;
}

/**
 * Queries an element for all elements with a "ref" attribute, removing
 * the attribute afterwards.
 * Returns a named map of all ref elements.
 *
 * @param {HTMLElement} root
 * @return {{[key: string]: HTMLElement}}
 */
export function htmlRefs(root) {
  const elements = root.querySelectorAll('[ref]');
  const refs = map();

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const ref = element.getAttribute('ref');
    devAssert(ref, 'Empty ref attr');
    element.removeAttribute('ref');
    devAssert(refs[ref] === undefined, 'Duplicate ref');
    refs[ref] = element;
  }

  return refs;
}
