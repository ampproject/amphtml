import {parseQueryString} from '#core/types/string/url';

/**
 * Updates the hashString with the dictionary<string, string> passed in
 * @public
 * @param {!{[key: string]: string}} updates
 * @param {!Window} win
 */
export function updateHash(updates, win) {
  let queryHash = parseQueryString(win.location.hash);
  queryHash = Object.assign(queryHash, updates);
  win.location.hash = Object.entries(queryHash)
    .filter((keyValue) => keyValue[1] != undefined)
    .map((keyValue) => keyValue[0] + '=' + keyValue[1])
    .join('&');
}

/**
 * Deletes the node after the passed timeout.
 * @public
 * @param {!Element} context the mutateElement context
 * @param {!Element} element the element to remove
 * @param {number} timeout time in ms after which the element will be removed
 */
export function removeAfterTimeout(context, element, timeout) {
  setTimeout(() => context.mutateElement(() => element.remove()), timeout);
}

/**
 * Deletes the node after the passed timeout.
 * @public
 * @param {!Element} context the mutateElement context
 * @param {!Element} element the element to remove
 * @param {number} timeout time in ms after which the element will be removed
 * @param {string} attributeName
 * @param {string=} attributeValue
 */
export function addAttributeAfterTimeout(
  context,
  element,
  timeout,
  attributeName,
  attributeValue = ''
) {
  setTimeout(
    () =>
      context.mutateElement(() =>
        element.setAttribute(attributeName, attributeValue)
      ),
    timeout
  );
}
