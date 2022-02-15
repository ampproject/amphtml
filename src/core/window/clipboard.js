import {removeElement} from '#core/dom';
import {setStyles} from '#core/dom/style';

/**
 * Copies provided text to clipboard using deprecated API: document.execCommand('copy')
 * @param {Window} win Window context
 * @param {string} text Text to copy
 * @param {*} successCallback Executes when copying is successful
 * @param {*} failCallback Executes when copying is failed
 */
export function deprecatedCopyTextToClipboard(
  win,
  text,
  successCallback,
  failCallback
) {
  let copySuccessful = false;
  const doc = win.document;

  const textarea =
    /** @type {HTMLTextAreaElement} */
    (doc.createElement('textarea'));

  setStyles(textarea, {
    'position': 'fixed',
    'top': 0,
    'left': 0,
    'width': '50px',
    'height': '50px',
    'padding': 0,
    'border': 'none',
    'outline': 'none',
    'background': 'transparent',
  });

  textarea.value = text;
  textarea.readOnly = true;
  textarea.contentEditable = 'true';

  doc.body.appendChild(textarea);
  win.getSelection()?.removeAllRanges();

  textarea./*OK*/ focus();
  textarea.setSelectionRange(0, text.length);

  try {
    copySuccessful = doc.execCommand('copy');
  } catch (e) {
    // 🤷
  }

  removeElement(textarea);

  if (copySuccessful) {
    successCallback();
  } else {
    failCallback();
  }
}

/**
 * @param {Document} doc Document context
 * @return {boolean} Returns true if copying support is available with deprecated API
 */
export function isDeprecatedCopyingToClipboardSupported(doc) {
  return doc.queryCommandSupported('copy');
}

/**
 * Copies provided text to clipboard using 'navigator.clipboard' API
 * @param {Window} win Window context
 * @param {string} text Text to copy
 * @param {*} successCallback Executes when copying is successful
 * @param {*} failCallback Executes when copying is failed
 */
export function copyTextToClipboard(win, text, successCallback, failCallback) {
  win.navigator.clipboard.writeText(text).then(
    function () {
      /* Clipboard successfully set using 'navigator.clipboard' */
      successCallback();
    },
    function () {
      /*
        Clipboard write failed using 'navigator.clipboard',
        Try using deprecated method as a fallback support.
      */
      deprecatedCopyTextToClipboard(win, text, successCallback, failCallback);
    }
  );
}

/**
 * @param {Document} doc Document context
 * @return {boolean} Returns true if copying support is available with new (or with deprecated) API
 */
export function isCopyingToClipboardSupported(doc) {
  return (
    !!doc.defaultView?.navigator?.clipboard ||
    isDeprecatedCopyingToClipboardSupported(doc)
  );
}
