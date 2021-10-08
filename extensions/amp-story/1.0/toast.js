import {Services} from '#service';
import {createElementWithAttributes, removeElement} from '#core/dom';
import {toWin} from '#core/window';

/** @private @const {string} */
const TOAST_CLASSNAME = 'i-amphtml-story-toast';

/**
 * The 'alert' role assertively announces toast content to screen readers.
 * @private @const {string}
 * */
const TOAST_ROLE = 'alert';

/**
 * Should be higher than total animation time.
 * @private @const {number}
 */
const TOAST_VISIBLE_TIME_MS = 2600;

/**
 * UI notifications service, displaying a message to the user for a limited
 * amount of time.
 */
export class Toast {
  /**
   * @param {!Element} storyEl
   * @param {!Node|string} childNodeOrText
   */
  static show(storyEl, childNodeOrText) {
    const win = toWin(storyEl.ownerDocument.defaultView);

    const toast = createElementWithAttributes(
      win.document,
      'div',
      /** @type {!JsonObject} */ ({
        'class': TOAST_CLASSNAME,
        'role': TOAST_ROLE,
      })
    );

    if (typeof childNodeOrText == 'string') {
      toast.textContent = childNodeOrText;
    } else {
      toast.appendChild(childNodeOrText);
    }

    storyEl.appendChild(toast);

    Services.timerFor(win).delay(
      () => removeElement(toast),
      TOAST_VISIBLE_TIME_MS
    );
  }
}
