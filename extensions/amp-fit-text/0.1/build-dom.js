import {copyChildren, isServerRendered, removeChildren} from '#core/dom';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {applyFillContent} from '#core/dom/layout';
import {realChildNodes} from '#core/dom/query';

const MEASURER_CLASS = 'i-amphtml-fit-text-measurer';
const CONTENT_CLASS = 'i-amphtml-fit-text-content';
const CONTENT_WRAPPER_CLASS = 'i-amphtml-fit-text-content-wrapper';

/**
 * @see amphtml/compiler/types.js for full description
 *
 * @param {HTMLElement} element
 * @return {{content: Element, contentWrapper: Element, measurer: Element}}
 */
export function buildDom(element) {
  if (isServerRendered(element)) {
    return queryDom(element);
  }

  const doc = element.ownerDocument;
  const content = doc.createElement('div');
  applyFillContent(content);
  content.classList.add(CONTENT_CLASS);

  const contentWrapper = doc.createElement('div');
  contentWrapper.classList.add(CONTENT_WRAPPER_CLASS);
  content.appendChild(contentWrapper);

  const measurer = doc.createElement('div');
  measurer.classList.add(MEASURER_CLASS);

  realChildNodes(element).forEach((node) => contentWrapper.appendChild(node));
  mirrorNode(contentWrapper, measurer);
  element.appendChild(content);
  element.appendChild(measurer);

  return {content, contentWrapper, measurer};
}

/**
 * Returns all of the needed ivars from a server rendered element.
 * @param {HTMLElement} element
 * @return {{content: Element, contentWrapper: Element, measurer: Element}}
 */
export function queryDom(element) {
  const content = element.querySelector(
    `.${escapeCssSelectorIdent(CONTENT_CLASS)}`
  );
  const contentWrapper = element.querySelector(
    `.${escapeCssSelectorIdent(CONTENT_WRAPPER_CLASS)}`
  );
  const measurer = element.querySelector(
    `.${escapeCssSelectorIdent(MEASURER_CLASS)}`
  );

  if (!content || !contentWrapper || !measurer) {
    throw new Error('Invalid server render');
  }

  return {content, contentWrapper, measurer};
}

/**
 * Make a destination node a clone of the source.
 *
 * @param {Node} from
 * @param {Node} to
 */
export function mirrorNode(from, to) {
  // First clear out the destination node.
  removeChildren(to);

  // Then copy all the source's child nodes into destination node.
  copyChildren(from, to);
}
