import {isLayoutSizeDefined} from '#core/dom/layout';
import {observeIntersections} from '#core/dom/layout/viewport-observer';

import {userAssert} from '#utils/log';

import {format, getLocale} from './locales';

export class AmpTimeAgo extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.datetime_ = '';

    /** @private {string} */
    this.locale_ = '';

    /** @private {string} */
    this.title_ = '';

    /** @private {?Element} */
    this.timeElement_ = null;

    /** @private {boolean} */
    this.cutOffReached_ = false;

    /** @private {?UnlistenDef} */
    this.unobserveIntersections_ = null;
  }

  /** @override */
  buildCallback() {
    userAssert(
      this.element.textContent.length > 0,
      'Content cannot be empty. Found in: %s',
      this.element
    );

    this.datetime_ = this.element.getAttribute('datetime');
    this.locale_ = getLocale(
      this.element.getAttribute('locale') ||
        this.win.document.documentElement.lang
    );
    this.title_ = this.element.textContent.trim();

    this.element.textContent = '';
    if (!this.element.hasAttribute('role')) {
      this.element.setAttribute('role', 'text');
    }

    this.timeElement_ = document.createElement('time');
    this.timeElement_.setAttribute('datetime', this.datetime_);

    this.setFuzzyTimestampValue_();
    this.element.appendChild(this.timeElement_);
  }

  /**
   * @param {boolean} inViewport
   * @private
   */
  viewportCallback_(inViewport) {
    if (inViewport && !this.cutOffReached_) {
      this.setFuzzyTimestampValue_();
    }
  }

  /** @override */
  layoutCallback() {
    this.unobserveIntersections_ = observeIntersections(
      this.element,
      ({isIntersecting}) => this.viewportCallback_(isIntersecting)
    );
    return Promise.resolve();
  }

  /** @override */
  unlayoutCallback() {
    this.unobserveIntersections_?.();
    this.unobserveIntersections_ = null;
    return false;
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const datetime = mutations['datetime'];
    if (datetime !== undefined) {
      this.datetime_ = datetime;
      this.setFuzzyTimestampValue_();
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @private */
  setFuzzyTimestampValue_() {
    if (this.element.hasAttribute('cutoff')) {
      const cutoff = parseInt(this.element.getAttribute('cutoff'), 10);
      const elDate = new Date(this.datetime_);
      const secondsAgo = Math.floor((Date.now() - elDate.getTime()) / 1000);

      if (secondsAgo > cutoff) {
        this.timeElement_.textContent = this.title_;
        this.cutOffReached_ = true;
      } else {
        this.timeElement_.textContent = format(this.datetime_, this.locale_);
      }
    } else {
      this.timeElement_.textContent = format(this.datetime_, this.locale_);
    }
  }
}

AMP.extension('amp-timeago', '0.1', (AMP) => {
  AMP.registerElement('amp-timeago', AmpTimeAgo);
});
