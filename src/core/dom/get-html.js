import {isElement, isString} from '#core/types';

/** @type {Array<string>} */
const excludedTags = ['script', 'style'];

/** @type {Array<string>} */
const allowedAmpTags = [
  'amp-accordion',
  'amp-app-banner',
  'amp-carousel',
  'amp-fit-text',
  'amp-form',
  'amp-selector',
  'amp-sidebar',
];

/** @type {Array<string>} */
const allowedAttributes = [
  'action',
  'alt',
  'class',
  'disabled',
  'height',
  'href',
  'id',
  'name',
  'placeholder',
  'readonly',
  'src',
  'tabindex',
  'title',
  'type',
  'value',
  'width',
];

/**
 * Returns content of HTML node
 * @param {Window} win
 * @param {string} selector - CSS selector of the node to take content from
 * @param {Array<string>} attrs - tag attributes to be left in the stringified
 * HTML
 * @return {string}
 */
export function getHtml(win, selector, attrs) {
  const root = win.document.querySelector(selector);
  /** @type {string[]} */
  const result = [];

  if (root) {
    appendToResult(root, attrs, result);
  }

  return result.join('').replace(/\s{2,}/g, ' ');
}

/**
 * @param {Element} rootNode - node to take content from
 * @param {Array<string>} attrs - tag attributes to be left in the stringified HTML
 * @param {Array<string>} result
 */
function appendToResult(rootNode, attrs, result) {
  /** @type {Array<string|Element>} */
  const stack = [rootNode];
  const allowedAttrs = attrs.filter((attr) => allowedAttributes.includes(attr));

  while (stack.length > 0) {
    const node = /** @type {string|Element} */ (stack.pop());

    if (isString(node)) {
      result.push(node);
    } else if (node.nodeType === Node.TEXT_NODE) {
      result.push(node.textContent ?? '');
    } else if (isElement(node) && isApplicableNode(node)) {
      appendOpenTag(node, allowedAttrs, result);
      stack.push(`</${node.tagName.toLowerCase()}>`);

      for (let child = node.lastChild; child; child = child.previousSibling) {
        stack.push(/** @type {Element} */ (child));
      }
    }
  }
}

/**
 * Returns true for allowed AMP tags and non-AMP tags except <script>/<style>
 * @param {Element} node
 * @return {boolean}
 */
function isApplicableNode(node) {
  const tagName = node.tagName.toLowerCase();

  if (tagName.startsWith('amp-')) {
    return !!(allowedAmpTags.includes(tagName) && node.textContent);
  } else {
    return !!(!excludedTags.includes(tagName) && node.textContent);
  }
}

/**
 * Constructs an open-tag with the provided attributes.
 * @param {Element} node
 * @param {Array<string>} attrs
 * @param {Array<string>} result
 */
function appendOpenTag(node, attrs, result) {
  result.push(`<${node.tagName.toLowerCase()}`);

  attrs.forEach((attr) => {
    if (node.hasAttribute(attr)) {
      result.push(` ${attr}="${node.getAttribute(attr)}"`);
    }
  });

  result.push('>');
}
