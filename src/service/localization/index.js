import {Observable} from '#core/data-structures/observable';
import {closest} from '#core/dom/query';
import {getWin} from '#core/window';

import {Services} from '#service';

import {
  LocalizedStringBundleDef,
  // The LocalizedStringId_Enum type is imported even though it is not used because
  // the compiler does not output types for enums, but we want to distinguish
  // between LocalizedStringId_Enum enum values and any other strings.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LocalizedStringId_Enum,
} from './strings';

/**
 * Localization service.
 */
export class LocalizationService {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    this.element_ = element;

    this.language_ =
      getWin(element).document.querySelector('[lang]')?.getAttribute('lang') ||
      'en';

    /** Informs when new strings are available.
     * @private @const {!Observable}
     * */
    this.newBundleObserver_ = new Observable();

    /**
     * A mapping of codes to localized strings.
     * @private @const {!LocalizedStringBundleDef}
     */
    this.localizedStrings_ = {};
  }

  /**
   * Synchronously gets the string if available.
   * Useful for bundles that are registered synchronously (and not fetched async).
   * @param {string} code
   * @returns {?string}
   */
  getLocalizedString(code) {
    return this.localizedStrings_[code];
  }

  /**
   * @param {!LocalizedStringBundleDef} localizedStringBundle
   *     The localized string bundle to register.
   * @return {!LocalizationService} For chaining.
   */
  registerLocalizedStringBundle(localizedStringBundle) {
    this.localizedStrings_ = {
      ...this.localizedStrings_,
      ...localizedStringBundle,
    };
    return this;
  }

  /**
   * Fetches and registers the localization bundle from the given URL.
   * @param {string} url
   */
  registerFromUrl(url) {
    Services.xhrFor(getWin(this.element_))
      .fetchJson(url)
      .then((res) => {
        this.registerLocalizedStringBundle(res.json());
        this.newBundleObserver_.fire();
      });
  }

  getLocalizedStringAsync(code) {
    if (this.localizedStrings_[code]) {
      return Promise.resolve(this.localizedStrings_[code]);
    }
    return new Promise((res) => {
      const remove = this.newBundleObserver_.add(() => {
        if (this.localizedStrings_[code]) {
          res(this.localizedStrings_[code]);
          remove();
        }
      });
    });
  }

  /**
   * Localizes the element textContent or attribute (if present) asynchromously.
   * Useful for localization bundles that are fetched asynchronously.
   * @param {!Element} el
   * @param {!LocalizedStringId_Enum} code
   * @param {?string} attribute
   * @returns {!Promise}
   */
  localizeEl(el, code, attribute = null) {
    return this.getLocalizedStringAsync(code).then((val) => {
      if (attribute == null) {
        el.textContent = val;
      } else {
        el.setAttribute(attribute, val);
      }
    });
  }
}
