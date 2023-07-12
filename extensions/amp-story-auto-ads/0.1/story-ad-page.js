import {CommonSignals_Enum} from '#core/constants/common-signals';
import {
  createElementWithAttributes,
  isJsonScriptTag,
  toggleAttribute,
} from '#core/dom';
import {elementByTag} from '#core/dom/query';
import {setStyle} from '#core/dom/style';
import {map} from '#core/types/object';
import {parseJson} from '#core/types/object/json';

import {getExperimentBranch} from '#experiments';
import {StoryAdSegmentExp} from '#experiments/story-ad-progress-segment';

import {getData, listen} from '#utils/event-helper';
import {dev, devAssert, userAssert} from '#utils/log';

import {
  AnalyticsEvents,
  AnalyticsVars,
  STORY_AD_ANALYTICS,
} from './story-ad-analytics';
import {
  A4AVarNames,
  START_CTA_ANIMATION_ATTR,
  createCta,
  getStoryAdMacroTags,
  getStoryAdMetaTags,
  getStoryAdMetadataFromDoc,
  getStoryAdMetadataFromElement,
  maybeCreateAttribution,
  validateCtaMetadata,
} from './story-ad-ui';
import {getFrameDoc, localizeCtaText} from './utils';

import {Gestures} from '../../../src/gesture';
import {SwipeXRecognizer} from '../../../src/gesture-recognizers';
import {getServicePromiseForDoc} from '../../../src/service-helpers';
import {assertConfig} from '../../amp-ad-exit/0.1/config';
import {
  StateProperty,
  UIType_Enum,
} from '../../amp-story/1.0/amp-story-store-service';

/** @const {string} */
const TAG = 'amp-story-auto-ads:page';

/** @const {number} */
const TIMEOUT_LIMIT = 10000; // 10 seconds

/** @const {string} */
const GLASS_PANE_CLASS = 'i-amphtml-glass-pane';

/** @const {string} */
const DESKTOP_FULLBLEED_CLASS = 'i-amphtml-story-ad-fullbleed';

/** @enum {string} */
const PageAttributes = {
  LOADING: 'i-amphtml-loading',
  IFRAME_BODY_VISIBLE: 'amp-story-visible',
};

export class StoryAdPage {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} config
   * @param {number} index
   * @param {!./story-ad-localization.StoryAdLocalization} localization
   * @param {!./story-ad-button-text-fitter.ButtonTextFitter} buttonFitter
   * @param {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} storeService
   */
  constructor(ampdoc, config, index, localization, buttonFitter, storeService) {
    /** @private @const {!JsonObject} */
    this.config_ = config;

    /** @private @const {number} */
    this.index_ = index;

    /** @private @const {!./story-ad-localization.StoryAdLocalization} */
    this.localizationService_ = localization;

    /** @private @const {string} */
    this.id_ = `i-amphtml-ad-page-${this.index_}`;

    /** @private @const {!Window} */
    this.win_ = ampdoc.win;

    /** @private @const {!Document} */
    this.doc_ = this.win_.document;

    /** @private @const {!Promise} */
    this.analytics_ = getServicePromiseForDoc(ampdoc, STORY_AD_ANALYTICS);

    /** @private {?number} */
    this.timeCreated_ = null;

    /** @private {?Element} */
    this.pageElement_ = null;

    /** @private {?Element} */
    this.adElement_ = null;

    /** @private {?HTMLIFrameElement} */
    this.adFrame_ = null;

    /** @private {?Element} */
    this.adChoicesIcon_ = null;

    /** @private {?Element} */
    this.ctaAnchor_ = null;

    /** @private {?Document} */
    this.adDoc_ = null;

    /** @private {boolean} */
    this.loaded_ = false;

    /** @private @const {!Array<Function>} */
    this.loadCallbacks_ = [];

    /** @private @const {./story-ad-button-text-fitter.ButtonTextFitter} */
    this.buttonFitter_ = buttonFitter;

    /** @private {boolean} */
    this.viewed_ = false;

    /** @private @const {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = storeService;

    /** @private {boolean} */
    this.is3pAdFrame_ = false;
  }

  /** @return {?Document} ad document within FIE */
  getAdDoc() {
    return this.adDoc_;
  }

  /** @return {string} */
  getId() {
    return this.id_;
  }

  /** @return {boolean} */
  hasTimedOut() {
    return (
      !!this.timeCreated_ && Date.now() - this.timeCreated_ > TIMEOUT_LIMIT
    );
  }

  /** @return {boolean} */
  isLoaded() {
    return this.loaded_;
  }

  /** @return {boolean} */
  hasBeenViewed() {
    return this.viewed_;
  }

  /** @return {?Element} */
  getPageElement() {
    return this.pageElement_;
  }

  /**
   * Register functions to be executed when ad has loaded.
   * @param {Function} cb
   */
  registerLoadCallback(cb) {
    this.loadCallbacks_.push(cb);
  }

  /**
   * Adds/removes [amp-story-visible] on FIE body so that animations can
   * respond accordingly.
   */
  toggleVisibility() {
    this.viewed_ = true;
    this.ctaAnchor_ &&
      toggleAttribute(this.ctaAnchor_, START_CTA_ANIMATION_ATTR);

    // TODO(calebcordry): Properly handle visible attribute for custom ads.
    if (this.adDoc_) {
      toggleAttribute(
        dev().assertElement(this.adDoc_.body),
        PageAttributes.IFRAME_BODY_VISIBLE
      );
      // TODO(#24829) Remove alternate body when we have full ad network support.
      const alternateBody = this.adDoc_.querySelector('#x-a4a-former-body');
      alternateBody &&
        toggleAttribute(alternateBody, PageAttributes.IFRAME_BODY_VISIBLE);
    }
  }

  /**
   * Create an `amp-story-page` containing an `amp-ad`.
   * @return {!Element}
   */
  build() {
    this.timeCreated_ = Date.now();
    this.pageElement_ = this.createPageElement_();
    this.adElement_ = this.createAdElement_();

    const glassPane = this.doc_.createElement('div');
    glassPane.classList.add(GLASS_PANE_CLASS);

    const gridLayer = this.doc_.createElement('amp-story-grid-layer');
    gridLayer.setAttribute('template', 'fill');

    const paneGridLayer = gridLayer.cloneNode(/* deep */ false);

    gridLayer.appendChild(this.adElement_);
    paneGridLayer.appendChild(glassPane);
    this.pageElement_.appendChild(gridLayer);
    this.pageElement_.appendChild(paneGridLayer);

    this.listenForAdLoadSignals_();
    this.listenForSwipes_();

    this.analyticsEvent_(AnalyticsEvents.AD_REQUESTED, {
      [AnalyticsVars.AD_REQUESTED]: Date.now(),
    });

    return this.pageElement_;
  }

  /**
   * Try to create CTA (Click-To-Action) before showing the ad. Will fail if
   * not enough metadata to create the outlink button.
   * @return {Promise<boolean>}
   */
  maybeCreateCta() {
    return Promise.resolve().then(() => {
      // Inabox story ads control their own CTA creation.
      if (this.is3pAdFrame_) {
        return true;
      }

      const uiMetadata = map();
      const metaTags = getStoryAdMetaTags(this.adDoc_ ?? this.adElement_);

      // Template Ads.
      if (!this.adDoc_) {
        Object.assign(
          uiMetadata,
          getStoryAdMetadataFromElement(devAssert(this.adElement_))
        );
      } else {
        Object.assign(
          uiMetadata,
          getStoryAdMetadataFromDoc(metaTags),
          // TODO(ccordry): Depricate when possible.
          this.readAmpAdExit_()
        );
      }

      if (!validateCtaMetadata(uiMetadata)) {
        return false;
      }

      uiMetadata[A4AVarNames.CTA_TYPE] =
        localizeCtaText(
          uiMetadata[A4AVarNames.CTA_TYPE],
          this.localizationService_
        ) || uiMetadata[A4AVarNames.CTA_TYPE];

      this.analytics_.then((analytics) => {
        // Store the cta-type as an accesible var for any further pings.
        analytics.setVar(
          this.index_, // adIndex
          AnalyticsVars.CTA_TYPE,
          uiMetadata[A4AVarNames.CTA_TYPE]
        );

        // Set meta tag based variables.
        for (const [key, value] of Object.entries(
          getStoryAdMacroTags(metaTags)
        )) {
          analytics.setVar(this.index_, `STORY_AD_META_${key}`, value);
        }
      });

      if (
        (this.adChoicesIcon_ = maybeCreateAttribution(
          this.win_,
          uiMetadata,
          devAssert(this.pageElement_)
        ))
      ) {
        this.storeService_.subscribe(
          StateProperty.UI_STATE,
          (uiState) => {
            this.onUIStateUpdate_(uiState);
          },
          true /** callToInitialize */
        );
      }

      return this.createCtaLayer_(uiMetadata);
    });
  }

  /**
   * @return {!Element}
   * @private
   */
  createPageElement_() {
    const attributes = {
      'ad': '',
      'aria-hidden': true,
      'distance': '2',
      'i-amphtml-loading': '',
      'id': this.id_,
    };

    const storyAdSegmentBranch = getExperimentBranch(
      this.win_,
      StoryAdSegmentExp.ID
    );
    if (
      storyAdSegmentBranch &&
      storyAdSegmentBranch != StoryAdSegmentExp.CONTROL
    ) {
      attributes['auto-advance-after'] = '10s';
    }

    const page = createElementWithAttributes(
      this.doc_,
      'amp-story-page',
      attributes
    );
    // TODO(ccordry): Allow creative to change default background color.
    setStyle(page, 'background-color', '#212125');
    return page;
  }

  /**
   * @return {!Element}
   * @private
   */
  createAdElement_() {
    if (this.config_['type'] === 'fake') {
      this.config_['id'] = `i-amphtml-demo-${this.index_}`;
    }
    return createElementWithAttributes(this.doc_, 'amp-ad', this.config_);
  }

  /**
   * Creates listeners to receive signal that ad is ready to be shown
   * for both FIE & inabox case.
   * @private
   */
  listenForAdLoadSignals_() {
    // Friendly frame INI_LOAD.
    this.adElement_
      .signals()
      // TODO(ccordry): Investigate using a better signal waiting for video loads.
      .whenSignal(CommonSignals_Enum.INI_LOAD)
      .then(() => this.onAdLoaded_());

    // Inabox custom event.
    const removeListener = listen(this.win_, 'message', (e) => {
      if (getData(e) !== 'amp-story-ad-load') {
        return;
      }
      if (this.getAdFrame_() && e.source === this.adFrame_.contentWindow) {
        this.is3pAdFrame_ = true;
        this.pageElement_.setAttribute('xdomain-ad', '');
        this.onAdLoaded_();
        removeListener();
      }
    });
  }

  /**
   * Listen for any horizontal swipes, and fire an analytics event if it happens.
   */
  listenForSwipes_() {
    const gestures = Gestures.get(
      this.pageElement_,
      true /* shouldNotPreventDefault */,
      false /* shouldStopPropogation */
    );
    gestures.onGesture(SwipeXRecognizer, () => {
      this.analyticsEvent_(AnalyticsEvents.AD_SWIPED, {
        [AnalyticsVars.AD_SWIPED]: Date.now(),
      });
      gestures.cleanup();
    });
  }

  /**
   * Returns the iframe containing the creative if it exists.
   * @return {?HTMLIFrameElement}
   */
  getAdFrame_() {
    if (this.adFrame_) {
      return this.adFrame_;
    }
    return (this.adFrame_ = /** @type {?HTMLIFrameElement} */ (
      elementByTag(devAssert(this.pageElement_), 'iframe')
    ));
  }

  /**
   * Things that need to happen after the created ad is "loaded".
   * @private
   */
  onAdLoaded_() {
    // Ensures the video-manager does not follow the autoplay attribute on
    // amp-video tags, which would play the ad in the background before it is
    // displayed.
    // TODO(ccordry): do we still need this? Its a pain to always stub in tests.
    this.pageElement_.getImpl().then((impl) => impl.delegateVideoAutoplay());

    // Remove loading attribute once loaded so that desktop CSS will position
    // offscren with all other pages.
    this.pageElement_.removeAttribute(PageAttributes.LOADING);

    this.analyticsEvent_(AnalyticsEvents.AD_LOADED, {
      [AnalyticsVars.AD_LOADED]: Date.now(),
    });

    if (this.getAdFrame_() && !this.is3pAdFrame_) {
      this.adDoc_ = getFrameDoc(
        /** @type {!HTMLIFrameElement} */ (this.adFrame_)
      );
    }

    this.loaded_ = true;

    this.loadCallbacks_.forEach((cb) => cb());
  }

  /**
   * Create layer to contain outlink button.
   * @param {!./story-ad-ui.StoryAdUIMetadata} uiMetadata
   * @return {Promise<boolean>}
   */
  createCtaLayer_(uiMetadata) {
    return createCta(
      this.doc_,
      devAssert(this.buttonFitter_),
      dev().assertElement(this.pageElement_), // Container.
      uiMetadata
    ).then((anchor) => {
      if (anchor) {
        this.ctaAnchor_ = anchor;
        // Click listener so that we can fire `story-ad-click` analytics trigger at
        // the appropriate time.
        anchor.addEventListener('click', () => {
          const vars = {
            [AnalyticsVars.AD_CLICKED]: Date.now(),
          };
          this.analyticsEvent_(AnalyticsEvents.AD_CLICKED, vars);
        });
        return true;
      }
      return false;
    });
  }

  /**
   * TODO(#24080) Remove this when story ads have full ad network support.
   * This in intended to be a temporary hack so we can can support
   * ad serving pipelines that are reliant on using amp-ad-exit for
   * outlinks.
   * Reads amp-ad-exit config and tries to extract a suitable outlink.
   * If there are multiple exits present, behavior is unpredictable due to
   * JSON parse.
   * @private
   * @return {!Object}
   */
  readAmpAdExit_() {
    const ampAdExit = elementByTag(
      dev().assertElement(this.adDoc_.body),
      'amp-ad-exit'
    );
    if (ampAdExit) {
      try {
        const {children} = ampAdExit;
        userAssert(
          children.length == 1,
          'The tag should contain exactly one <script> child.'
        );
        const child = children[0];
        userAssert(
          isJsonScriptTag(child),
          'The amp-ad-exit config should ' +
            'be inside a <script> tag with type="application/json"'
        );
        const config = assertConfig(parseJson(child.textContent));
        const target =
          config['targets'] &&
          Object.keys(config['targets']) &&
          config['targets'][Object.keys(config['targets'])[0]];
        const finalUrl = target && target['finalUrl'];
        return target ? {[A4AVarNames.CTA_URL]: finalUrl} : {};
      } catch (e) {
        dev().error(TAG, e);
        return {};
      }
    }
  }

  /**
   * Reacts to UI state updates and passes the information along as
   * attributes to the shadowed attribution icon.
   * @param {!UIType_Enum} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    if (!this.adChoicesIcon_) {
      return;
    }

    this.adChoicesIcon_.classList.toggle(
      DESKTOP_FULLBLEED_CLASS,
      uiState === UIType_Enum.DESKTOP_FULLBLEED
    );
  }

  /**
   * Construct an analytics event and trigger it.
   * @param {string} eventType
   * @param {!{[key: string]: number}} vars A map of vars and their values.
   * @private
   */
  analyticsEvent_(eventType, vars) {
    this.analytics_.then((analytics) =>
      analytics.fireEvent(this.pageElement_, this.index_, eventType, vars)
    );
  }
}
