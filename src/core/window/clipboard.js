import {removeElement} from '#core/dom';
import {setStyles} from '#core/dom/style';

/**
 * Copies provided text to clipboard using deprecated API: document.execCommand('copy')
 * @param {Window} win Window context
 * @param {string} text Text to copy
 * @return {boolean} Return true on copy-success
 */
export function deprecatedCopyTextToClipboard(win, text) {
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

  return copySuccessful;
}

/**
 * @param {Document} doc Document context
 * @return {boolean} Returns true if copying support is available with deprecated API
 */
export function isDeprecatedCopyingToClipboardSupported(doc) {
  return doc.queryCommandSupported('copy');
}

/**
 * Copies provided text to clipboard using 'navigator.clipboard' API.
 * It will try to use deprecated API if 'navigator.clipboard' is not supported.
 * @param {Window} win Window context
 * @param {string} text Text to copy
 * @param {function():void} successCallback Executes when copying is successful
 * @param {function():void} failCallback Executes when copying is failed
 */
export function copyTextToClipboard(win, text, successCallback, failCallback) {
  /** Check which method is supported for the browser */
  if (win.navigator?.clipboard) {
    /*
      Try copying with `navigator.clipboard` method as a fallback support.
    */
    win.navigator.clipboard.writeText(text).then(
      /* Clipboard successfully set using 'navigator.clipboard' */
      successCallback,
      /* Clipboard write failed using 'navigator.clipboard' */
      failCallback
    );
  } else if (isDeprecatedCopyingToClipboardSupported(win.document)) {
    /*
      Try copying with deprecated method as a fallback support.
    */
    if (deprecatedCopyTextToClipboard(win, text)) {
      /* Clipboard successfully set using deprecated API */
      successCallback();
    } else {
      /* Clipboard write failed using deprecated API */
      failCallback();
    }
  } else {
    /** Browser that do not support any of copy API or disabled by user */
    failCallback();
  }
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
