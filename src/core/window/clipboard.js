
import {removeElement} from '#core/dom';
import {setStyles} from '#core/dom/style';

/**
 * @param {!Window} win
 * @param {string} text
 * @return {boolean}
 */
export function copyTextToClipboard(win, text) {
  let copySuccessful = false;
  const doc = win.document;

  const textarea =
    /** @type {!HTMLTextAreaElement} */
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
  textarea.contentEditable = true;

  doc.body.appendChild(textarea);
  win.getSelection().removeAllRanges();

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
 * @param {!Document} doc
 * @return {boolean}
 */
export function isCopyingToClipboardSupported(doc) {
  return doc.queryCommandSupported('copy');
}
