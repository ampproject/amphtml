import {Layout_Enum, isLayoutSizeDefined} from '#core/dom/layout';

import {Services} from '#service';

import {user} from '#utils/log';

import {assertHttpsUrl} from '../../../src/url';

const TAG = 'amp-call-tracking';

/**
 * Bookkeeps all unique URL requests so that no URL is called twice.
 * @type {!{[key: string]: !Promise}}
 */
let cachedResponsePromises_ = {};

/**
 * Fetches vendor response.
 * @param {!Window} win
 * @param {string} url
 * @return {!Promise<JsonObject>}
 */
function fetch_(win, url) {
  if (!(url in cachedResponsePromises_)) {
    cachedResponsePromises_[url] = Services.xhrFor(win)
      .fetchJson(url, {credentials: 'include'})
      .then((res) => res.json());
  }
  return cachedResponsePromises_[url];
}

/** @visibleForTesting */
export function clearResponseCacheForTesting() {
  cachedResponsePromises_ = {};
}

/**
 * Implementation of `amp-call-tracking` component. See
 * {@link ../amp-call-tracking.md} for the spec.
 */
export class AmpCallTracking extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.hyperlink_ = null;

    /** @private {?string} */
    this.configUrl_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout) || layout == Layout_Enum.CONTAINER;
  }

  /** @override */
  buildCallback() {
    this.configUrl_ = assertHttpsUrl(
      this.element.getAttribute('config'),
      this.element
    );

    this.hyperlink_ = this.element.firstElementChild;
  }

  /** @override */
  layoutCallback() {
    return Services.urlReplacementsForDoc(this.element)
      .expandUrlAsync(user().assertString(this.configUrl_))
      .then((url) => fetch_(this.win, url))
      .then((data) => {
        if (data['phoneNumber']) {
          this.hyperlink_.setAttribute('href', `tel:${data['phoneNumber']}`);
          this.hyperlink_.textContent =
            data['formattedPhoneNumber'] || data['phoneNumber'];
        } else {
          user().warn(
            TAG,
            'Response does not contain a phoneNumber field %s. Call tracking was not applied.',
            this.element
          );
        }
      });
  }
}

AMP.extension('amp-call-tracking', '0.1', (AMP) => {
  AMP.registerElement('amp-call-tracking', AmpCallTracking);
});
