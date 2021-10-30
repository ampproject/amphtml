/**
 * @fileoverview Affiliate link component that expands when clicked.
 */

import {Services} from '#service';
import {StateProperty, getStoreService} from './amp-story-store-service';
import {StoryAnalyticsEvent, getAnalyticsService} from './story-analytics';
import {getAmpdoc} from '../../../src/service-helpers';
import {htmlFor} from '#core/dom/static-template';

/**
 * Links that are affiliate links.
 * @const {string}
 */
export const AFFILIATE_LINK_SELECTOR = 'a[affiliate-link-icon]';

/**
 * Custom property signifying a built link.
 * @const {string}
 */
export const AFFILIATE_LINK_BUILT = '__AMP_AFFILIATE_LINK_BUILT';

export class AmpStoryAffiliateLink {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  constructor(win, element) {
    /** @public {!Window} */
    this.win = win;

    /** @public {!Element} */
    this.element = element;

    /** @private {?Element} */
    this.textEl_ = null;

    /** @private {?Element} */
    this.launchEl_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);

    /** @private {string} */
    this.text_ = this.element.textContent;

    /** @private @const {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(getAmpdoc(this.win.document));

    /** @private @const {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win, element);
  }

  /**
   * Builds affiliate link.
   */
  build() {
    if (this.element[AFFILIATE_LINK_BUILT]) {
      return;
    }

    this.mutator_.mutateElement(this.element, () => {
      this.element.textContent = '';
      this.element.setAttribute('pristine', '');
      this.addPulseElement_();
      this.addIconElement_();
      this.addText_();
      this.addLaunchElement_();
    });

    this.initializeListeners_();
    this.element[AFFILIATE_LINK_BUILT] = true;
  }

  /**
   * Initializes listeners.
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(
      StateProperty.AFFILIATE_LINK_STATE,
      (elementToToggleExpand) => {
        const expand = this.element === elementToToggleExpand;
        if (expand) {
          this.element.setAttribute('expanded', '');
          this.textEl_.removeAttribute('hidden');
          this.launchEl_.removeAttribute('hidden');
        } else {
          this.element.removeAttribute('expanded');
          this.textEl_.setAttribute('hidden', '');
          this.launchEl_.setAttribute('hidden', '');
        }
        if (expand) {
          this.element.removeAttribute('pristine');
          this.analyticsService_.triggerEvent(
            StoryAnalyticsEvent.FOCUS,
            this.element
          );
        }
      }
    );

    this.element.addEventListener('click', (event) => {
      if (this.element.hasAttribute('expanded')) {
        event.stopPropagation();
        this.analyticsService_.triggerEvent(
          StoryAnalyticsEvent.CLICK_THROUGH,
          this.element
        );
      }
    });
  }

  /**
   * Adds icon as a child element of <amp-story-affiliate-link>.
   * @private
   */
  addIconElement_() {
    const iconEl = htmlFor(this.element)`
      <div class="i-amphtml-story-affiliate-link-circle">
        <i class="i-amphtml-story-affiliate-link-icon"></i>
        <div class="i-amphtml-story-reset i-amphtml-hidden">
          <span class="i-amphtml-story-affiliate-link-text" hidden></span>
          <i class="i-amphtml-story-affiliate-link-launch" hidden></i>
        </div>
      </div>`;
    this.element.appendChild(iconEl);
  }

  /**
   * Adds text from <a> tag to expanded link.
   * @private
   */
  addText_() {
    this.textEl_ = this.element.querySelector(
      '.i-amphtml-story-affiliate-link-text'
    );

    this.textEl_.textContent = this.text_;
    this.textEl_.setAttribute('hidden', '');
  }

  /**
   * Adds launch arrow to expanded link.
   * @private
   */
  addLaunchElement_() {
    this.launchEl_ = this.element.querySelector(
      '.i-amphtml-story-affiliate-link-launch'
    );

    this.launchEl_.setAttribute('hidden', '');
  }

  /**
   * Adds pulse as a child element of <amp-story-affiliate-link>.
   * @private
   */
  addPulseElement_() {
    const pulseEl = htmlFor(this.element)`
      <div class="i-amphtml-story-affiliate-link-pulse"></div>`;
    this.element.appendChild(pulseEl);
  }
}
