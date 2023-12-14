import {triggerAnalyticsEvent} from '#utils/analytics';

import {getUniqueId} from './utils';

/** @const {string} */
export const STORY_AD_ANALYTICS = 'story-ad-analytics';

/** @enum {string} */
export const AnalyticsEvents = {
  AD_REQUESTED: 'story-ad-request',
  AD_LOADED: 'story-ad-load',
  AD_INSERTED: 'story-ad-insert',
  AD_VIEWED: 'story-ad-view',
  AD_SWIPED: 'story-ad-swipe',
  AD_CLICKED: 'story-ad-click',
  AD_EXITED: 'story-ad-exit',
  AD_DISCARDED: 'story-ad-discard',
};

/** @enum {string} */
export const AnalyticsVars = {
  // Timestamp when ad is requested.
  AD_REQUESTED: 'requestTime',
  // Timestamp when ad emits `INI_LOAD` signal.
  AD_LOADED: 'loadTime',
  // Timestamp when ad is inserted into story as page after next.
  AD_INSERTED: 'insertTime',
  // Timestamp when page becomes active page.
  AD_VIEWED: 'viewTime',
  // Timestamp when ad page detects swipe event.
  AD_SWIPED: 'swipeTime',
  // Timestamp when ad is clicked.
  AD_CLICKED: 'clickTime',
  // Timestamp when ad page moves from active => inactive.
  AD_EXITED: 'exitTime',
  // Timestamp when ad is discared due to bad metadata etc.
  AD_DISCARDED: 'discardTime',
  // Index of the ad generating the trigger.
  AD_INDEX: 'adIndex',
  // Id that should be unique for every ad.
  AD_UNIQUE_ID: 'adUniqueId',
  // Position in the parent story. Number of page before ad + 1. Does not count
  // previously inserted ad pages.
  POSITION: 'position',
  // Given cta-type of inserted ad.
  CTA_TYPE: 'ctaType',
};

export class StoryAdAnalytics {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private {!Window} */
    this.win_ = ampdoc.win;
    /** @const @private {!{[key: number]: JsonObject}} */
    this.data_ = {};
  }

  /**
   * Construct an analytics event and trigger it.
   * @param {!Element} element amp-story-page element containing ad.
   * @param {number} adIndex
   * @param {string} eventType
   * @param {!{[key: string]: number}} vars A map of vars and their values.
   */
  fireEvent(element, adIndex, eventType, vars) {
    this.ensurePageTrackingInitialized_(adIndex);
    Object.assign(/** @type {!Object} */ (this.data_[adIndex]), vars);
    triggerAnalyticsEvent(
      element,
      eventType,
      /** @type {!JsonObject} */ (this.data_[adIndex])
    );
  }

  /**`
   * Adds a variable for a specific ad that can be used in all subsequent triggers.
   * @param {number} adIndex
   * @param {string} varName
   * @param {*} value
   */
  setVar(adIndex, varName, value) {
    this.ensurePageTrackingInitialized_(adIndex);
    this.data_[adIndex][varName] = value;
  }

  /**
   * Creates a tracking object for each page if non-existant.
   * @param {number} adIndex
   */
  ensurePageTrackingInitialized_(adIndex) {
    if (!this.data_[adIndex]) {
      this.data_[adIndex] = {
        [AnalyticsVars.AD_INDEX]: adIndex,
        [AnalyticsVars.AD_UNIQUE_ID]: getUniqueId(this.win_),
      };
    }
  }
}
