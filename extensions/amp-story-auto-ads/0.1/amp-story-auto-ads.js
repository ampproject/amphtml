/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  AdvanceExpToTime,
  StoryAdAutoAdvance,
  divertStoryAdAutoAdvance,
} from '#experiments/story-ad-auto-advance';
import {
  AnalyticsEvents,
  AnalyticsVars,
  STORY_AD_ANALYTICS,
  StoryAdAnalytics,
} from './story-ad-analytics';
import {CSS} from '../../../build/amp-story-auto-ads-0.1.css';
import {CommonSignals} from '#core/constants/common-signals';
import {EventType, dispatch} from '../../amp-story/1.0/events';
import {Services} from '#service';
import {
  StateProperty,
  UIType,
} from '../../amp-story/1.0/amp-story-store-service';
import {StoryAdConfig} from './story-ad-config';
import {StoryAdPageManager} from './story-ad-page-manager';
import {
  StoryAdSegmentExp,
  ViewerSetTimeToBranch,
} from '#experiments/story-ad-progress-segment';
import {CSS as adBadgeCSS} from '../../../build/amp-story-auto-ads-ad-badge-0.1.css';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';
import {dev, devAssert, userAssert} from '../../../src/log';
import {dict} from '#core/types/object';
import {divertStoryAdPlacements} from '#experiments/story-ad-placements';
import {forceExperimentBranch, getExperimentBranch} from '#experiments';
import {getPlacementAlgo} from './algorithm-utils';
import {getServicePromiseForDoc} from '../../../src/service-helpers';
import {CSS as progessBarCSS} from '../../../build/amp-story-auto-ads-progress-bar-0.1.css';
import {setStyle} from '#core/dom/style';
import {CSS as sharedCSS} from '../../../build/amp-story-auto-ads-shared-0.1.css';
import {toggleAttribute} from '#core/dom';
import {svgFor} from '#core/dom/static-template';

/** @const {string} */
const TAG = 'amp-story-auto-ads';

/** @const {string} */
const AD_TAG = 'amp-ad';

/** @const {string} */
const MUSTACHE_TAG = 'amp-mustache';

/** @enum {string} */
export const Attributes = {
  AD_SHOWING: 'ad-showing',
  DESKTOP_ONE_PANEL: 'desktop-one-panel',
  DESKTOP_PANELS: 'desktop-panels',
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
    this.config_ = dict();

    /** @private {?Promise} */
    this.analytics_ = null;

    /** @private {?Element} */
    this.adBadgeContainer_ = null;

    /** @private {?Element} */
    this.progressBarBackground_ = null;

    /** @private {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?StoryAdPlacementAlgorithm} */
    this.placementAlgorithm_ = null;

    /** @private {?StoryAdPageManager} */
    this.adPageManager_ = null;
  }

  /** @override */
  buildCallback() {
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
      .whenSignal(CommonSignals.INI_LOAD)
      .then(() => this.handleConfig_())
      .then(() => {
        this.adPageManager_ = new StoryAdPageManager(
          this.ampStory_,
          this.config_
        );
        divertStoryAdPlacements(this.win);
        divertStoryAdAutoAdvance(this.win);
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
        this.maybeCreateProgressBar_();
        this.initializeListeners_();
        this.initializePages_();
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
    const payload = dict({
      'targetPageId': 'i-amphtml-ad-page-1',
      'direction': 'next',
    });
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
        // TODO(#33969) can no longer be null when launched.
        this.progressBarBackground_ &&
          this.progressBarBackground_.setAttribute(Attributes.AD_SHOWING, '');
      } else {
        this.adBadgeContainer_.removeAttribute(Attributes.AD_SHOWING);
        // TODO(#33969) can no longer be null when launched.
        this.progressBarBackground_ &&
          this.progressBarBackground_.removeAttribute(Attributes.AD_SHOWING);
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
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.mutateElement(() => {
      const {DESKTOP_ONE_PANEL, DESKTOP_PANELS} = Attributes;
      this.adBadgeContainer_.removeAttribute(DESKTOP_PANELS);
      this.adBadgeContainer_.removeAttribute(DESKTOP_ONE_PANEL);
      // TODO(#33969) can no longer be null when launched.
      this.progressBarBackground_?.removeAttribute(DESKTOP_PANELS);
      this.progressBarBackground_?.removeAttribute(DESKTOP_ONE_PANEL);

      if (uiState === UIType.DESKTOP_PANELS) {
        this.adBadgeContainer_.setAttribute(DESKTOP_PANELS, '');
        this.progressBarBackground_?.setAttribute(DESKTOP_PANELS, '');
      }
      if (uiState === UIType.DESKTOP_ONE_PANEL) {
        this.adBadgeContainer_.setAttribute(DESKTOP_ONE_PANEL, '');
        this.progressBarBackground_?.setAttribute(DESKTOP_ONE_PANEL, '');
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

    const svg = svgFor(this.doc_);
    const badgeSVG = svg`<svg
      width="39"
      height="31"
      viewBox="0 0 39 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d)">
        <path
          d="M17.3672 19.3633H12.7441L11.8652 22H9.06152L13.8252 9.20312H16.2686L21.0586 22H18.2549L17.3672 19.3633ZM13.4561 17.2275H16.6553L15.0469 12.4375L13.4561 17.2275ZM22.1914 17.1748C22.1914 15.6924 22.5225 14.5117 23.1846 13.6328C23.8525 12.7539 24.7637 12.3145 25.918 12.3145C26.8438 12.3145 27.6084 12.6602 28.2119 13.3516V8.5H30.7607V22H28.4668L28.3438 20.9893C27.7109 21.7803 26.8965 22.1758 25.9004 22.1758C24.7812 22.1758 23.8818 21.7363 23.2021 20.8574C22.5283 19.9727 22.1914 18.7451 22.1914 17.1748ZM24.7314 17.3594C24.7314 18.25 24.8867 18.9326 25.1973 19.4072C25.5078 19.8818 25.959 20.1191 26.5508 20.1191C27.3359 20.1191 27.8896 19.7881 28.2119 19.126V15.373C27.8955 14.7109 27.3477 14.3799 26.5684 14.3799C25.3438 14.3799 24.7314 15.373 24.7314 17.3594Z"
          fill="white"
        ></path>
        <path
          d="M17.3672 19.3633L17.4857 19.3234L17.457 19.2383H17.3672V19.3633ZM12.7441 19.3633V19.2383H12.654L12.6256 19.3238L12.7441 19.3633ZM11.8652 22V22.125H11.9553L11.9838 22.0395L11.8652 22ZM9.06152 22L8.94438 21.9564L8.88161 22.125H9.06152V22ZM13.8252 9.20312V9.07812H13.7383L13.708 9.15952L13.8252 9.20312ZM16.2686 9.20312L16.3856 9.15931L16.3552 9.07812H16.2686V9.20312ZM21.0586 22V22.125H21.2389L21.1757 21.9562L21.0586 22ZM18.2549 22L18.1364 22.0399L18.1651 22.125H18.2549V22ZM13.4561 17.2275L13.3374 17.1881L13.2828 17.3525H13.4561V17.2275ZM16.6553 17.2275V17.3525H16.8291L16.7738 17.1877L16.6553 17.2275ZM15.0469 12.4375L15.1654 12.3977L15.0462 12.0429L14.9282 12.3981L15.0469 12.4375ZM17.3672 19.2383H12.7441V19.4883H17.3672V19.2383ZM12.6256 19.3238L11.7466 21.9605L11.9838 22.0395L12.8627 19.4028L12.6256 19.3238ZM11.8652 21.875H9.06152V22.125H11.8652V21.875ZM9.17867 22.0436L13.9423 9.24673L13.708 9.15952L8.94438 21.9564L9.17867 22.0436ZM13.8252 9.32812H16.2686V9.07812H13.8252V9.32812ZM16.1515 9.24694L20.9415 22.0438L21.1757 21.9562L16.3856 9.15931L16.1515 9.24694ZM21.0586 21.875H18.2549V22.125H21.0586V21.875ZM18.3733 21.9601L17.4857 19.3234L17.2487 19.4032L18.1364 22.0399L18.3733 21.9601ZM13.4561 17.3525H16.6553V17.1025H13.4561V17.3525ZM16.7738 17.1877L15.1654 12.3977L14.9284 12.4773L16.5368 17.2673L16.7738 17.1877ZM14.9282 12.3981L13.3374 17.1881L13.5747 17.2669L15.1655 12.4769L14.9282 12.3981ZM23.1846 13.6328L23.085 13.5572L23.0847 13.5576L23.1846 13.6328ZM28.2119 13.3516L28.1177 13.4338L28.3369 13.6849V13.3516H28.2119ZM28.2119 8.5V8.375H28.0869V8.5H28.2119ZM30.7607 8.5H30.8857V8.375H30.7607V8.5ZM30.7607 22V22.125H30.8857V22H30.7607ZM28.4668 22L28.3427 22.0151L28.3561 22.125H28.4668V22ZM28.3438 20.9893L28.4678 20.9742L28.4319 20.679L28.2461 20.9112L28.3438 20.9893ZM23.2021 20.8574L23.1027 20.9332L23.1033 20.9339L23.2021 20.8574ZM28.2119 19.126L28.3243 19.1807L28.3369 19.1548V19.126H28.2119ZM28.2119 15.373H28.3369V15.3447L28.3247 15.3192L28.2119 15.373ZM22.3164 17.1748C22.3164 15.7102 22.6435 14.5588 23.2844 13.708L23.0847 13.5576C22.4015 14.4646 22.0664 15.6746 22.0664 17.1748H22.3164ZM23.2841 13.7084C23.9272 12.8623 24.8007 12.4395 25.918 12.4395V12.1895C24.7267 12.1895 23.7779 12.6455 23.0851 13.5572L23.2841 13.7084ZM25.918 12.4395C26.808 12.4395 27.5382 12.7698 28.1177 13.4338L28.3061 13.2694C27.6786 12.5505 26.8795 12.1895 25.918 12.1895V12.4395ZM28.3369 13.3516V8.5H28.0869V13.3516H28.3369ZM28.2119 8.625H30.7607V8.375H28.2119V8.625ZM30.6357 8.5V22H30.8857V8.5H30.6357ZM30.7607 21.875H28.4668V22.125H30.7607V21.875ZM28.5909 21.9849L28.4678 20.9742L28.2197 21.0044L28.3427 22.0151L28.5909 21.9849ZM28.2461 20.9112C27.6366 21.6731 26.8578 22.0508 25.9004 22.0508V22.3008C26.9352 22.3008 27.7853 21.8874 28.4414 21.0673L28.2461 20.9112ZM25.9004 22.0508C24.8196 22.0508 23.9568 21.629 23.301 20.781L23.1033 20.9339C23.8068 21.8437 24.7429 22.3008 25.9004 22.3008V22.0508ZM23.3016 20.7817C22.65 19.9261 22.3164 18.7287 22.3164 17.1748H22.0664C22.0664 18.7615 22.4067 20.0193 23.1027 20.9332L23.3016 20.7817ZM24.6064 17.3594C24.6064 18.2616 24.7632 18.9722 25.0927 19.4757L25.3019 19.3388C25.0102 18.8931 24.8564 18.2384 24.8564 17.3594H24.6064ZM25.0927 19.4757C25.4275 19.9874 25.919 20.2441 26.5508 20.2441V19.9941C25.999 19.9941 25.5881 19.7763 25.3019 19.3388L25.0927 19.4757ZM26.5508 20.2441C26.961 20.2441 27.319 20.1575 27.6191 19.9781C27.9196 19.7984 28.1541 19.5304 28.3243 19.1807L28.0995 19.0713C27.9475 19.3837 27.744 19.6122 27.4908 19.7636C27.2371 19.9152 26.9257 19.9941 26.5508 19.9941V20.2441ZM28.3369 19.126V15.373H28.0869V19.126H28.3369ZM28.3247 15.3192C28.1576 14.9694 27.9261 14.7011 27.6284 14.5212C27.3311 14.3416 26.9758 14.2549 26.5684 14.2549V14.5049C26.9402 14.5049 27.2485 14.5837 27.4991 14.7352C27.7492 14.8863 27.9499 15.1146 28.0991 15.4269L28.3247 15.3192ZM26.5684 14.2549C25.9153 14.2549 25.4145 14.5235 25.0843 15.0592C24.7601 15.5849 24.6064 16.3574 24.6064 17.3594H24.8564C24.8564 16.375 25.0089 15.6578 25.2971 15.1904C25.5791 14.7329 25.9968 14.5049 26.5684 14.5049V14.2549Z"
          fill="white"
        ></path>
      </g>
      <defs>
        <filter
          id="filter0_d"
          x="0.881836"
          y="0.375"
          width="38.0041"
          height="29.9258"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="4" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.24 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg> `;

    badge.appendChild(badgeSVG);

    this.ampStory_.element.appendChild(root);
  }

  /**
   * Create progress bar if auto advance exp is on.
   * TODO(#33969) move to chosen UI and delete the others.
   */
  maybeCreateProgressBar_() {
    const autoAdvanceExpBranch = getExperimentBranch(
      this.win,
      StoryAdAutoAdvance.ID
    );
    const storyNextUpParam = Services.viewerForDoc(this.element).getParam(
      'storyNextUp'
    );
    if (storyNextUpParam && ViewerSetTimeToBranch[storyNextUpParam]) {
      // Actual progress bar creation handled in progress-bar.js.
      forceExperimentBranch(
        this.win,
        StoryAdSegmentExp.ID,
        ViewerSetTimeToBranch[storyNextUpParam]
      );
    } else if (
      autoAdvanceExpBranch &&
      autoAdvanceExpBranch !== StoryAdAutoAdvance.CONTROL
    ) {
      this.createProgressBar_(AdvanceExpToTime[autoAdvanceExpBranch]);
    } else if (storyNextUpParam) {
      this.createProgressBar_(storyNextUpParam);
    }
  }

  /**
   * Create progress bar that will be shown when ad is advancing.
   * @param {string} time
   */
  createProgressBar_(time) {
    const progressBar = this.doc_.createElement('div');
    progressBar.className = 'i-amphtml-story-ad-progress-bar';
    setStyle(progressBar, 'animationDuration', time);

    this.progressBarBackground_ = this.doc_.createElement('div');
    this.progressBarBackground_.className =
      'i-amphtml-story-ad-progress-background';

    const host = this.doc_.createElement('div');
    host.className = 'i-amphtml-story-ad-progress-bar-host';

    this.progressBarBackground_.appendChild(progressBar);
    createShadowRootWithStyle(host, this.progressBarBackground_, progessBarCSS);
    this.ampStory_.element.appendChild(host);

    // TODO(#33969) move this to init listeners when no longer conditional.
    this.storeService_.subscribe(StateProperty.PAUSED_STATE, (isPaused) => {
      this.onPauseStateUpdate_(isPaused);
    });
  }

  /**
   * If video is paused and ad is showing pause the progress bar.
   * @param {boolean} isPaused
   */
  onPauseStateUpdate_(isPaused) {
    const adShowing = this.storeService_.get(StateProperty.AD_STATE);
    if (!adShowing) {
      return;
    }

    toggleAttribute(this.progressBarBackground_, Attributes.PAUSED, isPaused);
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
   * @param {number} pageIndex Does not update when ad is showing.
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

    this.placementAlgorithm_.onPageChange(pageId);

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
   * @param {number} pageIndex
   * @param {string} adPageId
   */
  transitionToAdShowing_(pageIndex, adPageId) {
    const adPage = this.adPageManager_.getAdPageById(adPageId);
    const adIndex = this.adPageManager_.getIndexById(adPageId);

    if (!adPage.hasBeenViewed()) {
      this.placementAlgorithm_.onNewAdView(pageIndex);
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
   * @param {!Object<string, number>} vars A map of vars and their values.
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
