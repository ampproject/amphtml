/**
 * Replacement for `Element.requestFullscreen()` method.
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
 * @param {Element} element
 */
export function fullscreenEnter(element) {
  const requestFs =
    element.requestFullscreen ||
    element.requestFullScreen ||
    element.webkitRequestFullscreen ||
    element.webkitEnterFullscreen ||
    element.msRequestFullscreen ||
    element.mozRequestFullScreen;
  if (requestFs) {
    requestFs.call(element);
  }
}

/**
 * Replacement for `Document.exitFullscreen()` method.
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/exitFullscreen
 * @param {Element} element
 */
export function fullscreenExit(element) {
  const elementBoundExit =
    element.cancelFullScreen ||
    element.exitFullscreen ||
    element.webkitExitFullscreen ||
    element.webkitCancelFullScreen ||
    element.mozCancelFullScreen ||
    element.msExitFullscreen;
  if (elementBoundExit) {
    elementBoundExit.call(element);
    return;
  }
  const {ownerDocument} = element;
  if (!ownerDocument) {
    return;
  }
  const docBoundExit =
    ownerDocument.cancelFullScreen ||
    ownerDocument.exitFullscreen ||
    ownerDocument.webkitExitFullscreen ||
    ownerDocument.webkitCancelFullScreen ||
    ownerDocument.mozCancelFullScreen ||
    ownerDocument.msExitFullscreen;
  if (docBoundExit) {
    docBoundExit.call(ownerDocument);
  }
}

/**
 * Replacement for `Document.fullscreenElement`.
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/fullscreenElement
 * @param {Element} element
 * @return {boolean}
 */
export function isFullscreenElement(element) {
  const {webkitDisplayingFullscreen} = element;
  if (webkitDisplayingFullscreen !== undefined) {
    return webkitDisplayingFullscreen;
  }
  const {ownerDocument} = element;
  if (!ownerDocument) {
    return false;
  }
  const fullscreenElement =
    ownerDocument.fullscreenElement ||
    ownerDocument.webkitFullscreenElement ||
    ownerDocument.mozFullScreenElement ||
    ownerDocument.webkitCurrentFullScreenElement;
  return fullscreenElement == element;
}
