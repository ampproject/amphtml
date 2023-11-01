import {CommonSignals_Enum} from '#core/constants/common-signals';

import {forceExperimentBranch} from '#experiments';
import {divertStoryAdPlacements} from '#experiments/story-ad-placements';
import {StoryAdSegmentExp} from '#experiments/story-ad-progress-segment';

import {Services} from '#service';

import {dev, devAssert, userAssert} from '#utils/log';

import {getPlacementAlgo} from './algorithm-utils';
import {
  AnalyticsEvents,
  AnalyticsVars,
  STORY_AD_ANALYTICS,
  StoryAdAnalytics,
} from './story-ad-analytics';
import {StoryAdConfig} from './story-ad-config';
import {StoryAdPageManager} from './story-ad-page-manager';

import {CSS} from '../../../build/amp-story-auto-ads-0.1.css';
import {CSS as adBadgeCSS} from '../../../build/amp-story-auto-ads-ad-badge-0.1.css';
import {CSS as sharedCSS} from '../../../build/amp-story-auto-ads-shared-0.1.css';
import {getServicePromiseForDoc} from '../../../src/service-helpers';
import {
  StateProperty,
  UIType_Enum,
} from '../../amp-story/1.0/amp-story-store-service';
import {EventType, dispatch} from '../../amp-story/1.0/events';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';

/** @const {string} */
const TAG = 'amp-story-auto-ads';

/** @const {string} */
const AD_TAG = 'amp-ad';

/** @const {string} */
const MUSTACHE_TAG = 'amp-mustache';

/**
 * Map of experiment IDs that might be enabled by the player to
 * their experiment names. Used to toggle client side experiment on.
 * @const {{[key: string]: string}}
 * @visibleForTesting
 */
export const RELEVANT_PLAYER_EXPS = {
  [StoryAdSegmentExp.CONTROL]: StoryAdSegmentExp.ID,
  [StoryAdSegmentExp.AUTO_ADVANCE_OLD_CTA]: StoryAdSegmentExp.ID,
  [StoryAdSegmentExp.AUTO_ADVANCE_NEW_CTA]: StoryAdSegmentExp.ID,
  [StoryAdSegmentExp.AUTO_ADVANCE_NEW_CTA_NOT_ANIMATED]: StoryAdSegmentExp.ID,
};

/** @enum {string} */
export const Attributes = {
  AD_SHOWING: 'ad-showing',
  DESKTOP_FULLBLEED: 'desktop-fullbleed',
  DESKTOP_ONE_PANEL: 'desktop-one-panel',
  DIR: 'dir',
  PAUSED: 'paused',
};

export class AmpStoryAutoAds extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private */
    this.doc_ = this.win.document;

    /** @private {?../../amp-story/1.0/amp-story.AmpStory} */
    this.ampStory_ = null;

    /** @private {?StoryAdPage} */
    this.visibleAdPage_ = null;

    /** @private {!JsonObject} */
    this.config_ = {};

    /** @private {?Promise} */
    this.analytics_ = null;

    /** @private {?Element} */
    this.adBadgeContainer_ = null;

    /** @private {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?StoryAdPlacementAlgorithm} */
    this.placementAlgorithm_ = null;

    /** @private {?StoryAdPageManager} */
    this.adPageManager_ = null;
  }

  /** @override */
  buildCallback() {
    // TODO(ccordry): properly block on this when #cap check is possible.
    this.askPlayerForActiveExperiments_();

    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        devAssert(storeService, 'Could not retrieve AmpStoryStoreService');
        this.storeService_ = storeService;

        if (!this.isAutomaticAdInsertionAllowed_()) {
          return;
        }

        const ampStoryElement = this.element.parentElement;
        userAssert(
          ampStoryElement.tagName === 'AMP-STORY',
          `<${TAG}> should be child of <amp-story>`
        );

        const ampdoc = this.getAmpDoc();
        const extensionService = Services.extensionsFor(this.win);
        extensionService./*OK*/ installExtensionForDoc(ampdoc, AD_TAG);
        return ampStoryElement.getImpl().then((impl) => {
          this.ampStory_ = impl;
        });
      }
    );
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  layoutCallback() {
    if (!this.isAutomaticAdInsertionAllowed_()) {
      return Promise.resolve();
    }
    return this.ampStory_
      .signals()
      .whenSignal(CommonSignals_Enum.INI_LOAD)
      .then(() => this.handleConfig_())
      .then(() => {
        this.adPageManager_ = new StoryAdPageManager(
          this.ampStory_,
          this.config_
        );
        divertStoryAdPlacements(this.win);
        this.placementAlgorithm_ = getPlacementAlgo(
          this.win,
          this.storeService_,
          this.adPageManager_
        );
        // Bail out early on short stories.
        if (!this.placementAlgorithm_.isStoryEligible()) {
          return;
        }
        this.analytics_ = getServicePromiseForDoc(
          this.element,
          STORY_AD_ANALYTICS
        );
        this.createAdOverlay_();
        this.initializeListeners_();
        this.initializePages_();
      });
  }

  /**
   * Sends message to player asking for active experiments and enables
   * the branch for any relevant experiments.
   */
  askPlayerForActiveExperiments_() {
    const viewer = Services.viewerForDoc(this.doc_);
    if (!viewer.isEmbedded()) {
      return;
    }
    viewer
      ./*OK*/ sendMessageAwaitResponse('playerExperiments')
      .then((expObj) => {
        const ids = expObj?.['experimentIds'];
        if (ids) {
          ids.forEach((id) => {
            const relevantExp = RELEVANT_PLAYER_EXPS[id];
            if (relevantExp) {
              forceExperimentBranch(this.win, relevantExp, id.toString());
            }
          });
        }
      })
      .catch((e) => {
        dev().expectedError(
          TAG,
          'Player does not support `playerExperiments` message',
          e
        );
      });
  }

  /**
   * Force an immediate ad placement without waiting for ad being loaded,
   * and then navigate to the ad page.
   * @param {!StoryAdPage} adPage
   */
  forcePlaceAdAfterPage_(adPage) {
    const pageBeforeAdId = /** @type {string} */ (
      this.storeService_.get(StateProperty.CURRENT_PAGE_ID)
    );
    adPage.registerLoadCallback(() =>
      this.adPageManager_
        .maybeInsertPageAfter(pageBeforeAdId, adPage)
        .then(() => this.navigateToFirstAdPage_(adPage))
    );
  }

  /**
   * Fires event to navigate to ad page once inserted into the story.
   * @param {!StoryAdPage} adPage
   */
  navigateToFirstAdPage_(adPage) {
    const firstAdPageElement = adPage.getPageElement();
    // Setting distance manually to avoid flash of next page.
    firstAdPageElement.setAttribute('distance', '1');
    const payload = {
      'targetPageId': 'i-amphtml-ad-page-1',
      'direction': 'next',
    };
    const eventInit = {bubbles: true};
    dispatch(
      this.win,
      firstAdPageElement,
      EventType.SWITCH_PAGE,
      payload,
      eventInit
    );
  }

  /**
   * Sets config and installs additional extensions if necessary.
   * @private
   * @return {Promise}
   */
  handleConfig_() {
    return new StoryAdConfig(this.element, this.win)
      .getConfig()
      .then((config) => {
        this.config_ = config;
        if (config['type'] === 'custom') {
          Services.extensionsFor(this.win)./*OK*/ installExtensionForDoc(
            this.element.getAmpDoc(),
            MUSTACHE_TAG,
            'latest'
          );
        }
        return config;
      });
  }

  /**
   * Determines whether or not ad insertion is allowed based on how the story
   * is served, and the number of pages in the story.
   * @return {boolean}
   * @private
   */
  isAutomaticAdInsertionAllowed_() {
    return !!this.storeService_.get(StateProperty.CAN_INSERT_AUTOMATIC_AD);
  }

  /**
   * Subscribes to all relevant state changes from the containing story.
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.AD_STATE, (isAd) => {
      this.onAdStateUpdate_(isAd);
    });

    this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      (rtlState) => {
        this.onRtlStateUpdate_(rtlState);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.UI_STATE,
      (uiState) => {
        this.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, (pageId) => {
      const pageIndex = this.storeService_.get(
        StateProperty.CURRENT_PAGE_INDEX
      );

      this.handleActivePageChange_(
        dev().assertNumber(pageIndex),
        dev().assertString(pageId)
      );
    });
  }

  /**
   * Reacts to the ad state updates and passes the information along as
   * attributes to the shadowed ad badge.
   * @param {boolean} isAd
   */
  onAdStateUpdate_(isAd) {
    this.mutateElement(() => {
      if (isAd) {
        this.adBadgeContainer_.setAttribute(Attributes.AD_SHOWING, '');
      } else {
        this.adBadgeContainer_.removeAttribute(Attributes.AD_SHOWING);
      }
    });
  }

  /**
   * Reacts to the rtl state updates and passes the information along as
   * attributes to the shadowed ad badge.
   * @param {boolean} rtlState
   */
  onRtlStateUpdate_(rtlState) {
    this.mutateElement(() => {
      rtlState
        ? this.adBadgeContainer_.setAttribute(Attributes.DIR, 'rtl')
        : this.adBadgeContainer_.removeAttribute(Attributes.DIR);
    });
  }

  /**
   * Reacts to UI state updates and passes the information along as
   * attributes to the shadowed ad badge.
   * @param {!UIType_Enum} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.mutateElement(() => {
      const {DESKTOP_FULLBLEED, DESKTOP_ONE_PANEL} = Attributes;
      this.adBadgeContainer_.removeAttribute(DESKTOP_FULLBLEED);
      this.adBadgeContainer_.removeAttribute(DESKTOP_ONE_PANEL);

      if (uiState === UIType_Enum.DESKTOP_FULLBLEED) {
        this.adBadgeContainer_.setAttribute(DESKTOP_FULLBLEED, '');
      }
      if (uiState === UIType_Enum.DESKTOP_ONE_PANEL) {
        this.adBadgeContainer_.setAttribute(DESKTOP_ONE_PANEL, '');
      }
    });
  }

  /**
   * Create a hidden UI that will be shown when ad is displayed
   * @private
   */
  createAdOverlay_() {
    const root = this.doc_.createElement('div');
    root.className = 'i-amphtml-ad-overlay-host';

    this.adBadgeContainer_ = this.doc_.createElement('aside');
    this.adBadgeContainer_.className = 'i-amphtml-ad-overlay-container';

    const badge = this.doc_.createElement('div');
    badge.className = 'i-amphtml-story-ad-badge';

    this.adBadgeContainer_.appendChild(badge);
    createShadowRootWithStyle(root, this.adBadgeContainer_, adBadgeCSS);

    this.ampStory_.element.appendChild(root);
  }

  /**
   * Create new page containing ad and start preloading.
   * @private
   */
  initializePages_() {
    const pages = this.placementAlgorithm_.initializePages();
    this.maybeForceAdPlacement_(devAssert(pages[0]));
  }

  /**
   * Development mode forces navigation to ad page for better dev-x.
   * @param {StoryAdPage} adPage
   */
  maybeForceAdPlacement_(adPage) {
    if (
      this.element.hasAttribute('development') &&
      this.config_['type'] === 'fake'
    ) {
      this.forcePlaceAdAfterPage_(adPage);
    }
  }

  /**
   * Respond to page navigation event. This method is not called for the first
   * page that is shown on load.
   * @param {number} pageIndex
   * @param {string} pageId
   * @private
   */
  handleActivePageChange_(pageIndex, pageId) {
    if (this.adPageManager_.numberOfAdsCreated() === 0) {
      // This is protection against us running our placement algorithm in a
      // story where no ads have been created. Most likely because INI_LOAD on
      // the story has not fired yet but we still are receiving page changes.
      return;
    }

    // Not a story ads page.
    if (!this.adPageManager_.hasId(pageId)) {
      this.placementAlgorithm_.onPageChange(pageId);
    }

    if (this.visibleAdPage_) {
      this.transitionFromAdShowing_();
    }

    if (this.adPageManager_.hasId(pageId)) {
      this.transitionToAdShowing_(pageIndex, pageId);
    }
  }

  /**
   * Called when switching away from an ad.
   */
  transitionFromAdShowing_() {
    // We are transitioning away from an ad
    const adPageId = this.visibleAdPage_.getId();
    const adIndex = this.adPageManager_.getIndexById(adPageId);
    this.removeVisibleAttribute_();
    // Fire the exit event.
    this.analyticsEvent_(AnalyticsEvents.AD_EXITED, {
      [AnalyticsVars.AD_EXITED]: Date.now(),
      [AnalyticsVars.AD_INDEX]: adIndex,
    });
  }

  /**
   * We are switching to an ad.
   * @param {number} adPageIndex
   * @param {string} adPageId
   */
  transitionToAdShowing_(adPageIndex, adPageId) {
    const adPage = this.adPageManager_.getAdPageById(adPageId);
    const adIndex = this.adPageManager_.getIndexById(adPageId);

    if (!adPage.hasBeenViewed()) {
      this.placementAlgorithm_.onNewAdView(adPageIndex);
    }

    // Tell the iframe that it is visible.
    this.setVisibleAttribute_(adPage);

    // Fire the view event on the corresponding Ad.
    this.analyticsEvent_(AnalyticsEvents.AD_VIEWED, {
      [AnalyticsVars.AD_VIEWED]: Date.now(),
      [AnalyticsVars.AD_INDEX]: adIndex,
    });
  }

  /**
   * Sets a `amp-story-visible` attribute on the fie body so that embedded ads
   * can know when they are visible and do things like trigger animations.
   * @param {StoryAdPage} adPage
   */
  setVisibleAttribute_(adPage) {
    this.mutateElement(() => {
      adPage.toggleVisibility();
      this.visibleAdPage_ = adPage;
    });
  }

  /**
   *  Removes `amp-story-visible` attribute from the fie body.
   */
  removeVisibleAttribute_() {
    this.mutateElement(() => {
      if (this.visibleAdPage_) {
        this.visibleAdPage_.toggleVisibility();
        this.visibleAdPage_ = null;
      }
    });
  }

  /**
   * Construct an analytics event and trigger it.
   * @param {string} eventType
   * @param {!{[key: string]: number}} vars A map of vars and their values.
   * @private
   */
  analyticsEvent_(eventType, vars) {
    this.analytics_.then((analytics) =>
      analytics.fireEvent(this.element, vars['adIndex'], eventType, vars)
    );
  }
}

AMP.extension('amp-story-auto-ads', '0.1', (AMP) => {
  AMP.registerElement('amp-story-auto-ads', AmpStoryAutoAds, CSS + sharedCSS);
  AMP.registerServiceForDoc(STORY_AD_ANALYTICS, StoryAdAnalytics);
});
