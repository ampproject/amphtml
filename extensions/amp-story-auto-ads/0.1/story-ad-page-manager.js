import {findIndex} from '#core/types/array';

import {devAssert} from '#utils/log';

import {
  AnalyticsEvents,
  AnalyticsVars,
  STORY_AD_ANALYTICS,
} from './story-ad-analytics';
import {ButtonTextFitter} from './story-ad-button-text-fitter';
import {StoryAdLocalization} from './story-ad-localization';
import {StoryAdPage} from './story-ad-page';

import {getServicePromiseForDoc} from '../../../src/service-helpers';
import {getStoreService} from '../../amp-story/1.0/amp-story-store-service';

/** @const {string} */
const TAG = 'amp-story-auto-ads:page-manager';

/** @enum {number} */
export const InsertionState = {
  DELAYED: 0,
  FAILURE: 1,
  SUCCESS: 2,
};

export const NEXT_PAGE_NO_AD_ATTR = 'next-page-no-ad';

/**
 * Manages creation and retrieval of story ad pages.
 */
export class StoryAdPageManager {
  /**
   * @param {!../../amp-story/1.0/amp-story.AmpStory} ampStory
   * @param {!JsonObject} config
   */
  constructor(ampStory, config) {
    /** @private {!../../amp-story/1.0/amp-story.AmpStory} */
    this.ampStory_ = ampStory;

    /** @private {!JsonObject} */
    this.config_ = config;

    /*** @private {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
    this.ampdoc_ = ampStory.getAmpDoc();

    /** @private {!Promise<!StoryAdAnalytics>} */
    this.analytics_ = getServicePromiseForDoc(this.ampdoc_, STORY_AD_ANALYTICS);

    /** @private {!./story-ad-localization.StoryAdLocalization} */
    this.localizationService_ = new StoryAdLocalization(this.ampStory_.element);

    /** @private {!./story-ad-button-text-fitter.ButtonTextFitter} */
    this.buttonFitter_ = new ButtonTextFitter(this.ampdoc_);

    /** @private {{[key: string]: StoryAdPage}} */
    this.pages_ = {};

    /** @private {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} **/
    this.storeService_ = getStoreService(this.ampdoc_.win);

    /** @private {number} */
    this.adsConsumed_ = 0;

    /** @private {Array<string>} */
    this.createdPageIds_ = [];
  }

  /**
   * Check if we have any pages left that have not been inserted or discarded.
   * @return {boolean}
   */
  hasUnusedAdPage() {
    return this.adsConsumed_ < this.createdPageIds_.length;
  }

  /**
   * Gets the next ad page that has not yet been inserted or discarded.
   * @return {!StoryAdPage}
   */
  getUnusedAdPage() {
    const pageId = this.createdPageIds_[this.adsConsumed_];
    devAssert(pageId, `${TAG} all created ads consumed.`);
    return this.pages_[pageId];
  }

  /**
   * Called when ad has failed or been placed and we should move to next ad.
   */
  discardCurrentAd() {
    this.adsConsumed_++;
    this.analyticsEvent_(AnalyticsEvents.AD_DISCARDED, {
      [AnalyticsVars.AD_INDEX]: this.adsConsumed_,
      [AnalyticsVars.AD_DISCARDED]: Date.now(),
    });
  }

  /**
   * Number of ads created by this manager.
   * @return {number}
   */
  numberOfAdsCreated() {
    return this.createdPageIds_.length;
  }

  /**
   * Creates a StoryAdPage, appends the element to DOM, and adds it to
   * parent story pages Array.
   * @return {!StoryAdPage}
   */
  createAdPage() {
    const index = this.createdPageIds_.length + 1;
    const page = new StoryAdPage(
      this.ampdoc_,
      this.config_,
      index,
      this.localizationService_,
      devAssert(this.buttonFitter_),
      devAssert(this.storeService_)
    );

    const pageElement = page.build();
    const pageId = page.getId();
    this.pages_[pageId] = page;
    this.createdPageIds_.push(pageId);

    this.ampStory_.element.appendChild(pageElement);
    pageElement.getImpl().then((impl) => {
      this.ampStory_.addPage(impl);
    });

    return page;
  }

  /**
   * @param {string} pageId
   * @return {boolean}
   */
  hasId(pageId) {
    return !!this.pages_[pageId];
  }

  /**
   * @param {string} pageId
   * @return {StoryAdPage}
   */
  getAdPageById(pageId) {
    return this.pages_[pageId];
  }

  /**
   * @param {string} pageId
   * @return {number}
   */
  getIndexById(pageId) {
    return findIndex(this.createdPageIds_, (id) => id === pageId) + 1;
  }

  /**
   * Can fail if slot is protected by next-page-no-ad, if there are not enough
   * pages left in the story for insertion, or the page before or after is an ad.
   * @param {string} pageBeforeAdId
   * @param {!StoryAdPage} nextAdPage
   * @return {!Promise<!InsertionState>}
   */
  maybeInsertPageAfter(pageBeforeAdId, nextAdPage) {
    const pageBeforeAd = this.ampStory_.getPageById(pageBeforeAdId);
    const pageAfterAd = this.ampStory_.getNextPage(pageBeforeAd);
    if (!pageAfterAd) {
      return Promise.resolve(InsertionState.DELAYED);
    }

    // We will not insert an ad in any slot containing `next-page-no-ad` nor
    // two ads in a row.
    if (
      this.nextPageNoAd_(pageBeforeAd) ||
      pageBeforeAd.isAd() ||
      pageAfterAd.isAd()
    ) {
      return Promise.resolve(InsertionState.DELAYED);
    }

    return nextAdPage.maybeCreateCta().then((ctaCreated) => {
      if (!ctaCreated) {
        this.discardCurrentAd();
        return InsertionState.FAILURE;
      }
      return this.insertIntoParentStory_(nextAdPage, pageBeforeAdId);
    });
  }

  /**
   *
   * @param {!StoryAdPage} nextAdPage
   * @param {string} pageBeforeAdId
   * @return {InsertionState}
   */
  insertIntoParentStory_(nextAdPage, pageBeforeAdId) {
    const nextAdPageId = nextAdPage.getId();
    this.ampStory_.insertPage(pageBeforeAdId, nextAdPageId);

    // If we are inserted we now have a `position` macro available for any
    // analytics events moving forward.
    const adIndex = this.getIndexById(nextAdPageId);
    const pageNumber = this.ampStory_.getPageIndexById(pageBeforeAdId);

    this.analytics_.then((analytics) =>
      analytics.setVar(adIndex, AnalyticsVars.POSITION, pageNumber + 1)
    );

    this.currentAdInserted_();
    return InsertionState.SUCCESS;
  }

  /**
   *
   */
  currentAdInserted_() {
    this.adsConsumed_++;
    this.analyticsEvent_(AnalyticsEvents.AD_INSERTED, {
      [AnalyticsVars.AD_INDEX]: this.adsConsumed_,
      [AnalyticsVars.AD_INSERTED]: Date.now(),
    });
  }

  /**
   * Users may put an 'next-page-no-ad' attribute on their pages to prevent ads
   * from showing as the next page.
   * @param {?../../amp-story/1.0/amp-story-page.AmpStoryPage} page
   * @return {boolean}
   * @private
   */
  nextPageNoAd_(page) {
    return page.element.hasAttribute(NEXT_PAGE_NO_AD_ATTR);
  }

  /**
   * Construct an analytics event and trigger it.
   * @param {string} eventType
   * @param {!{[key: string]: number}} vars A map of vars and their values.
   * @private
   */
  analyticsEvent_(eventType, vars) {
    this.analytics_.then((analytics) =>
      analytics.fireEvent(
        this.ampStory_.element,
        vars['adIndex'],
        eventType,
        vars
      )
    );
  }
}
