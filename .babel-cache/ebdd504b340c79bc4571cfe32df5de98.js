var _VIEWER_CONTROL_DEFAU;function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;} /**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import { AMP_STORY_PLAYER_EVENT } from "../../../src/amp-story-player/amp-story-player-impl";
import {
Action,
StateProperty,
UIType,
getStoreService } from "./amp-story-store-service";

import { AmpStoryViewerMessagingHandler } from "./amp-story-viewer-messaging-handler";
import { CSS } from "../../../build/amp-story-system-layer-1.0.css";
import {
DevelopmentModeLog,
DevelopmentModeLogButtonSet } from "./development-ui";

import { LocalizedStringId } from "../../../src/service/localization/strings";
import { ProgressBar } from "./progress-bar";
import { Services } from "../../../src/service";
import { closest, matches, scopedQuerySelector } from "../../../src/core/dom/query";
import {
createShadowRootWithStyle,
getStoryAttributeSrc,
shouldShowStoryUrlInfo,
triggerClickFromLightDom } from "./utils";

import { dev } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { escapeCssSelectorIdent } from "../../../src/core/dom/css-selectors";
import { getMode } from "../../../src/mode";
import { getSourceOrigin } from "../../../src/url";

import { renderAsElement } from "./simple-template";

import { setImportantStyles } from "../../../src/core/dom/style";
import { toArray } from "../../../src/core/types/array";

/** @private @const {string} */
var AD_SHOWING_ATTRIBUTE = 'ad-showing';

/** @private @const {string} */
var AUDIO_MUTED_ATTRIBUTE = 'muted';

/** @private @const {string} */
var PAUSED_ATTRIBUTE = 'paused';

/** @private @const {string} */
var HAS_INFO_BUTTON_ATTRIBUTE = 'info';

/** @private @const {string} */
var MUTE_CLASS = 'i-amphtml-story-mute-audio-control';

/** @private @const {string} */
var CLOSE_CLASS = 'i-amphtml-story-close-control';

/** @private @const {string} */
var SKIP_TO_NEXT_CLASS = 'i-amphtml-story-skip-to-next';

/** @private @const {string} */
var VIEWER_CUSTOM_CONTROL_CLASS = 'i-amphtml-story-viewer-custom-control';

/** @private @const {string} */
var UNMUTE_CLASS = 'i-amphtml-story-unmute-audio-control';

/** @private @const {string} */
var PAUSE_CLASS = 'i-amphtml-story-pause-control';

/** @private @const {string} */
var PLAY_CLASS = 'i-amphtml-story-play-control';

/** @private @const {string} */
var MESSAGE_DISPLAY_CLASS = 'i-amphtml-story-messagedisplay';

/** @private @const {string} */
var CURRENT_PAGE_HAS_AUDIO_ATTRIBUTE = 'i-amphtml-current-page-has-audio';

/** @private @const {string} */
var HAS_SIDEBAR_ATTRIBUTE = 'i-amphtml-story-has-sidebar';

/** @private @const {string} */
var SHARE_CLASS = 'i-amphtml-story-share-control';

/** @private @const {string} */
var INFO_CLASS = 'i-amphtml-story-info-control';

/** @private @const {string} */
var SIDEBAR_CLASS = 'i-amphtml-story-sidebar-control';

/** @private @const {string} */
var HAS_NEW_PAGE_ATTRIBUTE = 'i-amphtml-story-has-new-page';

/** @private @const {string} */
var ATTRIBUTION_CLASS = 'i-amphtml-story-attribution';

/** @private @const {number} */
var HIDE_MESSAGE_TIMEOUT_MS = 1500;

/** @private @const {!./simple-template.ElementDef} */
var TEMPLATE = {
  tag: 'aside',
  attrs: dict({
    'class': 'i-amphtml-story-system-layer i-amphtml-story-system-reset' }),

  children: [
  {
    tag: 'a',
    attrs: dict({
      'class': ATTRIBUTION_CLASS,
      'target': '_blank' }),

    children: [
    {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-attribution-logo-container' }),

      children: [
      {
        tag: 'img',
        attrs: dict({
          'alt': '',
          'class': 'i-amphtml-story-attribution-logo' }) }] },




    {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-attribution-text' }) }] },




  {
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-has-new-page-notification-container' }),

    children: [
    {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-has-new-page-text-wrapper' }),

      children: [
      {
        tag: 'span',
        attrs: dict({
          'class': 'i-amphtml-story-has-new-page-circle-icon' }) },


      {
        tag: 'div',
        attrs: dict({
          'class': 'i-amphtml-story-has-new-page-text' }),

        localizedStringId: LocalizedStringId.AMP_STORY_HAS_NEW_PAGE_TEXT }] }] },





  {
    tag: 'div',
    attrs: dict({ 'class': 'i-amphtml-story-system-layer-buttons' }),
    children: [
    {
      tag: 'div',
      attrs: dict({
        'role': 'button',
        'class': INFO_CLASS + ' i-amphtml-story-button' }),

      localizedLabelId: LocalizedStringId.AMP_STORY_INFO_BUTTON_LABEL },

    {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-sound-display' }),

      children: [
      {
        tag: 'div',
        attrs: dict({
          'role': 'alert',
          'class': 'i-amphtml-message-container' }),

        children: [
        {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-mute-text' }),

          localizedStringId:
          LocalizedStringId.AMP_STORY_AUDIO_MUTE_BUTTON_TEXT },

        {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-unmute-sound-text' }),

          localizedStringId:
          LocalizedStringId.AMP_STORY_AUDIO_UNMUTE_SOUND_TEXT },

        {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-unmute-no-sound-text' }),

          localizedStringId:
          LocalizedStringId.AMP_STORY_AUDIO_UNMUTE_NO_SOUND_TEXT }] },



      {
        tag: 'button',
        attrs: dict({
          'class': UNMUTE_CLASS + ' i-amphtml-story-button' }),

        localizedLabelId:
        LocalizedStringId.AMP_STORY_AUDIO_UNMUTE_BUTTON_LABEL },

      {
        tag: 'button',
        attrs: dict({
          'class': MUTE_CLASS + ' i-amphtml-story-button' }),

        localizedLabelId:
        LocalizedStringId.AMP_STORY_AUDIO_MUTE_BUTTON_LABEL }] },



    {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-paused-display' }),

      children: [
      {
        tag: 'button',
        attrs: dict({
          'class': PAUSE_CLASS + ' i-amphtml-story-button' }),

        localizedLabelId: LocalizedStringId.AMP_STORY_PAUSE_BUTTON_LABEL },

      {
        tag: 'button',
        attrs: dict({
          'class': PLAY_CLASS + ' i-amphtml-story-button' }),

        localizedLabelId: LocalizedStringId.AMP_STORY_PLAY_BUTTON_LABEL }] },



    {
      tag: 'button',
      attrs: dict({
        'class':
        SKIP_TO_NEXT_CLASS +
        ' i-amphtml-story-ui-hide-button i-amphtml-story-button' }),

      localizedLabelId:
      LocalizedStringId.AMP_STORY_SKIP_TO_NEXT_BUTTON_LABEL },

    {
      tag: 'button',
      attrs: dict({
        'class': SHARE_CLASS + ' i-amphtml-story-button' }),

      localizedLabelId: LocalizedStringId.AMP_STORY_SHARE_BUTTON_LABEL },

    {
      tag: 'button',
      attrs: dict({
        'class': SIDEBAR_CLASS + ' i-amphtml-story-button' }),

      localizedLabelId: LocalizedStringId.AMP_STORY_SIDEBAR_BUTTON_LABEL },

    {
      tag: 'button',
      attrs: dict({
        'class':
        CLOSE_CLASS +
        ' i-amphtml-story-ui-hide-button i-amphtml-story-button' }),

      localizedLabelId: LocalizedStringId.AMP_STORY_CLOSE_BUTTON_LABEL }] },



  {
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-system-layer-buttons-start-position' }) }] };





/**
 * Contains the event name belonging to the viewer control.
 * @const {string}
 */
var VIEWER_CONTROL_EVENT_NAME = '__AMP_VIEWER_CONTROL_EVENT_NAME__';

/** @enum {string} */
var VIEWER_CONTROL_TYPES = {
  CLOSE: 'close',
  SHARE: 'share',
  DEPRECATED_SKIP_NEXT: 'skip-next', // Deprecated in favor of SKIP_TO_NEXT.
  SKIP_TO_NEXT: 'skip-to-next' };


var VIEWER_CONTROL_DEFAULTS = (_VIEWER_CONTROL_DEFAU = {}, _defineProperty(_VIEWER_CONTROL_DEFAU,
VIEWER_CONTROL_TYPES.SHARE, {
  'selector': ".".concat(SHARE_CLASS) }), _defineProperty(_VIEWER_CONTROL_DEFAU,

VIEWER_CONTROL_TYPES.CLOSE, {
  'selector': ".".concat(CLOSE_CLASS) }), _defineProperty(_VIEWER_CONTROL_DEFAU,

VIEWER_CONTROL_TYPES.DEPRECATED_SKIP_NEXT, {
  'selector': ".".concat(SKIP_TO_NEXT_CLASS) }), _defineProperty(_VIEWER_CONTROL_DEFAU,

VIEWER_CONTROL_TYPES.SKIP_TO_NEXT, {
  'selector': ".".concat(SKIP_TO_NEXT_CLASS) }), _VIEWER_CONTROL_DEFAU);



/**
 * System Layer (i.e. UI Chrome) for <amp-story>.
 * Chrome contains:
 *   - mute/unmute button
 *   - story progress bar
 *   - share button
 *   - domain info button
 *   - sidebar
 *   - story updated label (for live stories)
 *   - close (for players)
 *   - skip (for players)
 */
export var SystemLayer = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} parentEl
   */
  function SystemLayer(win, parentEl) {_classCallCheck(this, SystemLayer);
    /** @private @const {!Window} */
    this.win_ = win;

    /** @protected @const {!Element} */
    this.parentEl_ = parentEl;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /**
     * Root element containing a shadow DOM root.
     * @private {?Element}
     */
    this.root_ = null;

    /**
     * Actual system layer.
     * @private {?Element}
     */
    this.systemLayerEl_ = null;

    /** @private {?Element} */
    this.buttonsContainer_ = null;

    /** @private @const {!ProgressBar} */
    this.progressBar_ = ProgressBar.create(win, this.parentEl_);

    /** @private {!DevelopmentModeLog} */
    this.developerLog_ = DevelopmentModeLog.create(win);

    /** @private {!DevelopmentModeLogButtonSet} */
    this.developerButtons_ = DevelopmentModeLogButtonSet.create(win);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /** @private {?number|?string} */
    this.timeoutId_ = null;

    /** @private {?../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = null;

    /** @private {?AmpStoryViewerMessagingHandler} */
    this.viewerMessagingHandler_ = null;
  }

  /**
   * @return {!Element}
   * @param {string} initialPageId
   */_createClass(SystemLayer, [{ key: "build", value:
    function build(initialPageId) {var _this = this;
      if (this.isBuilt_) {
        return this.getRoot();
      }

      this.isBuilt_ = true;

      this.root_ = this.win_.document.createElement('div');
      this.root_.classList.add('i-amphtml-system-layer-host');
      this.systemLayerEl_ = renderAsElement(this.win_.document, TEMPLATE);
      // Make the share button link to the current document to make sure
      // embedded STAMPs always have a back-link to themselves, and to make
      // gestures like right-clicks work.
      this.systemLayerEl_.querySelector('.i-amphtml-story-share-control').href =
      Services.documentInfoForDoc(this.parentEl_).canonicalUrl;

      createShadowRootWithStyle(this.root_, this.systemLayerEl_, CSS);

      this.systemLayerEl_.insertBefore(
      this.progressBar_.build(initialPageId),
      this.systemLayerEl_.firstChild);


      this.buttonsContainer_ = this.systemLayerEl_.querySelector(
      '.i-amphtml-story-system-layer-buttons');


      this.buildForDevelopmentMode_();

      this.initializeListeners_();

      this.storeService_.subscribe(
      StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS,
      function (canShowButtons) {
        _this.systemLayerEl_.classList.toggle(
        'i-amphtml-story-ui-no-buttons',
        !canShowButtons);

      },
      true /* callToInitialize */);


      if (Services.platformFor(this.win_).isIos()) {
        this.systemLayerEl_.setAttribute('ios', '');
      }

      this.viewer_ = Services.viewerForDoc(this.win_.document.documentElement);
      this.viewerMessagingHandler_ = this.viewer_.isEmbedded() ?
      new AmpStoryViewerMessagingHandler(this.win_, this.viewer_) :
      null;

      if (shouldShowStoryUrlInfo(this.viewer_)) {
        this.systemLayerEl_.classList.add('i-amphtml-embedded');
        this.getShadowRoot().setAttribute(HAS_INFO_BUTTON_ATTRIBUTE, '');
      } else {
        this.getShadowRoot().removeAttribute(HAS_INFO_BUTTON_ATTRIBUTE);
      }

      this.maybeBuildAttribution_();

      this.getShadowRoot().setAttribute(MESSAGE_DISPLAY_CLASS, 'noshow');
      this.getShadowRoot().setAttribute(HAS_NEW_PAGE_ATTRIBUTE, 'noshow');
      return this.getRoot();
    }

    /** @private */ }, { key: "maybeBuildAttribution_", value:
    function maybeBuildAttribution_() {
      if (!this.viewer_ || this.viewer_.getParam('attribution') !== 'auto') {
        return;
      }

      this.systemLayerEl_.querySelector('.i-amphtml-story-attribution-logo').src =
      getStoryAttributeSrc(this.parentEl_, 'entity-logo-src') ||
      getStoryAttributeSrc(this.parentEl_, 'publisher-logo-src');

      var anchorEl = this.systemLayerEl_.querySelector(".".concat(
      escapeCssSelectorIdent(ATTRIBUTION_CLASS)));


      anchorEl.href =
      getStoryAttributeSrc(this.parentEl_, 'entity-url') ||
      getSourceOrigin(Services.documentInfoForDoc(this.parentEl_).sourceUrl);

      this.systemLayerEl_.querySelector(
      '.i-amphtml-story-attribution-text').
      textContent =
      this.parentEl_.getAttribute('entity') ||
      this.parentEl_.getAttribute('publisher');

      anchorEl.classList.add('i-amphtml-story-attribution-visible');
    }

    /**
     * @private
     */ }, { key: "buildForDevelopmentMode_", value:
    function buildForDevelopmentMode_() {
      if (!false) {
        return;
      }

      this.buttonsContainer_.appendChild(
      this.developerButtons_.build(
      this.developerLog_.toggle.bind(this.developerLog_)));


      this.getShadowRoot().appendChild(this.developerLog_.build());
    }

    /**
     * @private
     */ }, { key: "initializeListeners_", value:
    function initializeListeners_() {var _this2 = this;
      // TODO(alanorozco): Listen to tap event properly (i.e. fastclick)
      this.getShadowRoot().addEventListener('click', function (event) {
        var target = /** @type {!Element} */(event.target);

        if (matches(target, ".".concat(MUTE_CLASS, ", .").concat(MUTE_CLASS, " *"))) {
          _this2.onAudioIconClick_(true);
        } else if (matches(target, ".".concat(UNMUTE_CLASS, ", .").concat(UNMUTE_CLASS, " *"))) {
          _this2.onAudioIconClick_(false);
        } else if (matches(target, ".".concat(PAUSE_CLASS, ", .").concat(PAUSE_CLASS, " *"))) {
          _this2.onPausedClick_(true);
        } else if (matches(target, ".".concat(PLAY_CLASS, ", .").concat(PLAY_CLASS, " *"))) {
          _this2.onPausedClick_(false);
        } else if (matches(target, ".".concat(SHARE_CLASS, ", .").concat(SHARE_CLASS, " *"))) {
          _this2.onShareClick_(event);
        } else if (matches(target, ".".concat(INFO_CLASS, ", .").concat(INFO_CLASS, " *"))) {
          _this2.onInfoClick_();
        } else if (matches(target, ".".concat(SIDEBAR_CLASS, ", .").concat(SIDEBAR_CLASS, " *"))) {
          _this2.onSidebarClick_();
        } else if (
        matches(
        target, ".".concat(
        VIEWER_CUSTOM_CONTROL_CLASS, ", .").concat(VIEWER_CUSTOM_CONTROL_CLASS, " *")))

        {
          _this2.onViewerControlClick_( /** @type {!Element} */(event.target));
        } else if (
        matches(target, ".".concat(ATTRIBUTION_CLASS, ", .").concat(ATTRIBUTION_CLASS, " *")))
        {
          var anchorClicked = closest(target, function (e) {return matches(e, 'a[href]');});
          triggerClickFromLightDom(anchorClicked, _this2.parentEl_);
        }
      });

      this.storeService_.subscribe(StateProperty.AD_STATE, function (isAd) {
        _this2.onAdStateUpdate_(isAd);
      });

      this.storeService_.subscribe(
      StateProperty.CAN_SHOW_AUDIO_UI,
      function (show) {
        _this2.onCanShowAudioUiUpdate_(show);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.CAN_SHOW_SHARING_UIS,
      function (show) {
        _this2.onCanShowSharingUisUpdate_(show);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.STORY_HAS_AUDIO_STATE,
      function (hasAudio) {
        _this2.onStoryHasAudioStateUpdate_(hasAudio);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.STORY_HAS_PLAYBACK_UI_STATE,
      function (hasPlaybackUi) {
        _this2.onStoryHasPlaybackUiStateUpdate_(hasPlaybackUi);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.MUTED_STATE,
      function (isMuted) {
        _this2.onMutedStateUpdate_(isMuted);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.UI_STATE,
      function (uiState) {
        _this2.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.PAUSED_STATE,
      function (isPaused) {
        _this2.onPausedStateUpdate_(isPaused);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_INDEX,
      function (index) {
        _this2.onPageIndexUpdate_(index);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      function (rtlState) {
        _this2.onRtlStateUpdate_(rtlState);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.KEYBOARD_ACTIVE_STATE,
      function (keyboardState) {
        _this2.onKeyboardActiveUpdate_(keyboardState);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.PAGE_HAS_AUDIO_STATE,
      function (audio) {
        _this2.onPageHasAudioStateUpdate_(audio);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE,
      function (hasPlaybackUi) {
        _this2.onPageHasElementsWithPlaybackStateUpdate_(hasPlaybackUi);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.HAS_SIDEBAR_STATE,
      function (hasSidebar) {
        _this2.onHasSidebarStateUpdate_(hasSidebar);
      },
      true /** callToInitialize */);


      this.storeService_.subscribe(
      StateProperty.SYSTEM_UI_IS_VISIBLE_STATE,
      function (isVisible) {
        _this2.onSystemUiIsVisibleStateUpdate_(isVisible);
      });


      this.storeService_.subscribe(StateProperty.NEW_PAGE_AVAILABLE_ID, function () {
        _this2.onNewPageAvailable_();
      });

      this.storeService_.subscribe(
      StateProperty.VIEWER_CUSTOM_CONTROLS,
      function (config) {return _this2.onViewerCustomControls_(config);},
      true /* callToInitialize */);

    }

    /**
     * @return {!Element}
     */ }, { key: "getRoot", value:
    function getRoot() {
      return (/** @type {!Element} */(this.root_));
    }

    /**
     * @return {!Element}
     */ }, { key: "getShadowRoot", value:
    function getShadowRoot() {
      return (/** @type {!Element} */(this.systemLayerEl_));
    }

    /**
     * Reacts to the ad state updates and updates the UI accordingly.
     * @param {boolean} isAd
     * @private
     */ }, { key: "onAdStateUpdate_", value:
    function onAdStateUpdate_(isAd) {
      // This is not in vsync as we are showing/hiding items in the system layer
      // based upon this attribute, and when wrapped in vsync there is a visual
      // lag after the page change before the icons are updated.
      isAd ?
      this.getShadowRoot().setAttribute(AD_SHOWING_ATTRIBUTE, '') :
      this.getShadowRoot().removeAttribute(AD_SHOWING_ATTRIBUTE);
    }

    /**
     * Checks if the story has a sidebar in order to display the icon representing
     * the opening of the sidebar.
     * @param {boolean} hasSidebar
     * @private
     */ }, { key: "onHasSidebarStateUpdate_", value:
    function onHasSidebarStateUpdate_(hasSidebar) {
      if (hasSidebar) {
        this.getShadowRoot().setAttribute(HAS_SIDEBAR_ATTRIBUTE, '');
      } else {
        this.getShadowRoot().removeAttribute(HAS_SIDEBAR_ATTRIBUTE);
      }
    }

    /**
     * Reacts to updates to whether audio UI may be shown, and updates the UI
     * accordingly.
     * @param {boolean} canShowAudioUi
     * @private
     */ }, { key: "onCanShowAudioUiUpdate_", value:
    function onCanShowAudioUiUpdate_(canShowAudioUi) {var _this3 = this;
      this.vsync_.mutate(function () {
        _this3.getShadowRoot().classList.toggle(
        'i-amphtml-story-no-audio-ui',
        !canShowAudioUi);

      });
    }

    /**
     * Reacts to updates to whether sharing UIs may be shown, and updates the UI
     * accordingly.
     * @param {boolean} canShowSharingUis
     * @private
     */ }, { key: "onCanShowSharingUisUpdate_", value:
    function onCanShowSharingUisUpdate_(canShowSharingUis) {var _this4 = this;
      this.vsync_.mutate(function () {
        _this4.getShadowRoot().classList.toggle(
        'i-amphtml-story-no-sharing',
        !canShowSharingUis);

      });
    }

    /**
     * Reacts to has audio state updates, determining if the story has a global
     * audio track playing, or if any page has audio.
     * @param {boolean} hasAudio
     * @private
     */ }, { key: "onStoryHasAudioStateUpdate_", value:
    function onStoryHasAudioStateUpdate_(hasAudio) {var _this5 = this;
      this.vsync_.mutate(function () {
        _this5.getShadowRoot().classList.toggle(
        'i-amphtml-story-has-audio',
        hasAudio);

      });
    }

    /**
     * Reacts to story having elements with playback.
     * @param {boolean} hasPlaybackUi
     * @private
     */ }, { key: "onStoryHasPlaybackUiStateUpdate_", value:
    function onStoryHasPlaybackUiStateUpdate_(hasPlaybackUi) {var _this6 = this;
      this.vsync_.mutate(function () {
        _this6.getShadowRoot().classList.toggle(
        'i-amphtml-story-has-playback-ui',
        hasPlaybackUi);

      });
    }

    /**
     * Reacts to the presence of audio on a page to determine which audio messages
     * to display.
     * @param {boolean} pageHasAudio
     * @private
     */ }, { key: "onPageHasAudioStateUpdate_", value:
    function onPageHasAudioStateUpdate_(pageHasAudio) {var _this7 = this;
      pageHasAudio =
      pageHasAudio ||
      !!this.storeService_.get(StateProperty.STORY_HAS_BACKGROUND_AUDIO_STATE);
      this.vsync_.mutate(function () {
        pageHasAudio ?
        _this7.getShadowRoot().setAttribute(
        CURRENT_PAGE_HAS_AUDIO_ATTRIBUTE,
        '') :

        _this7.getShadowRoot().removeAttribute(
        CURRENT_PAGE_HAS_AUDIO_ATTRIBUTE);

      });
    }

    /**
     * Reacts to the presence of elements with playback on the page.
     * @param {boolean} pageHasElementsWithPlayback
     * @private
     */ }, { key: "onPageHasElementsWithPlaybackStateUpdate_", value:
    function onPageHasElementsWithPlaybackStateUpdate_(pageHasElementsWithPlayback) {var _this8 = this;
      this.vsync_.mutate(function () {
        toArray(
        _this8.getShadowRoot().querySelectorAll(
        '.i-amphtml-paused-display button')).

        forEach(function (button) {
          button.disabled = !pageHasElementsWithPlayback;
        });
      });
    }

    /**
     * Reacts to muted state updates.
     * @param {boolean} isMuted
     * @private
     */ }, { key: "onMutedStateUpdate_", value:
    function onMutedStateUpdate_(isMuted) {var _this9 = this;
      this.vsync_.mutate(function () {
        isMuted ?
        _this9.getShadowRoot().setAttribute(AUDIO_MUTED_ATTRIBUTE, '') :
        _this9.getShadowRoot().removeAttribute(AUDIO_MUTED_ATTRIBUTE);
      });
    }

    /**
     * Reacts to paused state updates.
     * @param {boolean} isPaused
     * @private
     */ }, { key: "onPausedStateUpdate_", value:
    function onPausedStateUpdate_(isPaused) {var _this10 = this;
      this.vsync_.mutate(function () {
        isPaused ?
        _this10.getShadowRoot().setAttribute(PAUSED_ATTRIBUTE, '') :
        _this10.getShadowRoot().removeAttribute(PAUSED_ATTRIBUTE);
      });
    }

    /**
     * Hides message after elapsed time.
     * @param {string} message
     * @private
     */ }, { key: "hideMessageAfterTimeout_", value:
    function hideMessageAfterTimeout_(message) {var _this11 = this;
      if (this.timeoutId_) {
        this.timer_.cancel(this.timeoutId_);
      }
      this.timeoutId_ = this.timer_.delay(
      function () {return _this11.hideMessageInternal_(message);},
      HIDE_MESSAGE_TIMEOUT_MS);

    }

    /**
     * Hides message.
     * @param {string} message
     * @private
     */ }, { key: "hideMessageInternal_", value:
    function hideMessageInternal_(message) {var _this12 = this;
      if (!this.isBuilt_) {
        return;
      }
      this.vsync_.mutate(function () {
        _this12.getShadowRoot().setAttribute(message, 'noshow');
      });
    }

    /**
     * Reacts to UI state updates and triggers the expected UI.
     * @param {!UIType} uiState
     * @private
     */ }, { key: "onUIStateUpdate_", value:
    function onUIStateUpdate_(uiState) {var _this13 = this;
      this.vsync_.mutate(function () {
        var shadowRoot = _this13.getShadowRoot();

        shadowRoot.classList.remove('i-amphtml-story-desktop-fullbleed');
        shadowRoot.classList.remove('i-amphtml-story-desktop-panels');
        shadowRoot.classList.remove('i-amphtml-story-desktop-one-panel');
        shadowRoot.removeAttribute('desktop');

        switch (uiState) {
          case UIType.DESKTOP_PANELS:
            shadowRoot.setAttribute('desktop', '');
            shadowRoot.classList.add('i-amphtml-story-desktop-panels');
            break;
          case UIType.DESKTOP_FULLBLEED:
            shadowRoot.setAttribute('desktop', '');
            shadowRoot.classList.add('i-amphtml-story-desktop-fullbleed');
            break;
          case UIType.DESKTOP_ONE_PANEL:
            shadowRoot.classList.add('i-amphtml-story-desktop-one-panel');
            break;}

      });
    }

    /**
     * Reacts to system UI visibility state updates.
     * @param {boolean} isVisible
     * @private
     */ }, { key: "onSystemUiIsVisibleStateUpdate_", value:
    function onSystemUiIsVisibleStateUpdate_(isVisible) {var _this14 = this;
      this.vsync_.mutate(function () {
        _this14.getShadowRoot().classList.toggle(
        'i-amphtml-story-hidden',
        !isVisible);

      });
    }

    /**
     * Reacts to the active page index changing.
     * @param {number} index
     */ }, { key: "onPageIndexUpdate_", value:
    function onPageIndexUpdate_(index) {var _this15 = this;
      this.vsync_.mutate(function () {
        var lastIndex =
        _this15.storeService_.get(StateProperty.PAGE_IDS).length - 1;
        _this15.getShadowRoot().classList.toggle(
        'i-amphtml-first-page-active',
        index === 0);

        _this15.getShadowRoot().classList.toggle(
        'i-amphtml-last-page-active',
        index === lastIndex);

      });
    }

    /**
     * Reacts to RTL state updates and triggers the UI for RTL.
     * @param {boolean} rtlState
     * @private
     */ }, { key: "onRtlStateUpdate_", value:
    function onRtlStateUpdate_(rtlState) {var _this16 = this;
      this.vsync_.mutate(function () {
        rtlState ?
        _this16.getShadowRoot().setAttribute('dir', 'rtl') :
        _this16.getShadowRoot().removeAttribute('dir');
      });
    }

    /**
     * Reacts to keyboard updates and updates the UI.
     * @param {boolean} keyboardActive
     * @private
     */ }, { key: "onKeyboardActiveUpdate_", value:
    function onKeyboardActiveUpdate_(keyboardActive) {var _this17 = this;
      this.vsync_.mutate(function () {
        _this17.getShadowRoot().classList.toggle(
        'amp-mode-keyboard-active',
        keyboardActive);

      });
    }

    /**
     * Handles click events on the mute and unmute buttons.
     * @param {boolean} mute Specifies if the audio is being muted or unmuted.
     * @private
     */ }, { key: "onAudioIconClick_", value:
    function onAudioIconClick_(mute) {var _this18 = this;
      this.storeService_.dispatch(Action.TOGGLE_MUTED, mute);
      this.vsync_.mutate(function () {
        _this18.getShadowRoot().setAttribute(MESSAGE_DISPLAY_CLASS, 'show');
        _this18.hideMessageAfterTimeout_(MESSAGE_DISPLAY_CLASS);
      });
    }

    /**
     * Handles click events on the paused and play buttons.
     * @param {boolean} paused Specifies if the story is being paused or not.
     * @private
     */ }, { key: "onPausedClick_", value:
    function onPausedClick_(paused) {
      this.storeService_.dispatch(Action.TOGGLE_PAUSED, paused);
    }

    /**
     * Handles click events on the share button and toggles the share menu.
     * @param {!Event} event
     * @private
     */ }, { key: "onShareClick_", value:
    function onShareClick_(event) {
      event.preventDefault();
      if (event.target[VIEWER_CONTROL_EVENT_NAME]) {
        this.onViewerControlClick_( /** @type {!Element} */(event.target));
        return;
      }

      var isOpen = this.storeService_.get(StateProperty.SHARE_MENU_STATE);
      this.storeService_.dispatch(Action.TOGGLE_SHARE_MENU, !isOpen);
    }

    /**
     * Sends message back to the viewer with the corresponding event.
     * @param {!Element} element
     * @private
     */ }, { key: "onViewerControlClick_", value:
    function onViewerControlClick_(element) {
      var eventName = element[VIEWER_CONTROL_EVENT_NAME];

      this.viewerMessagingHandler_ &&
      this.viewerMessagingHandler_.send(
      'documentStateUpdate',
      dict({
        'state': AMP_STORY_PLAYER_EVENT,
        'value': eventName }));


    }

    /**
     * Handles click events on the info button and toggles the info dialog.
     * @private
     */ }, { key: "onInfoClick_", value:
    function onInfoClick_() {
      var isOpen = this.storeService_.get(StateProperty.INFO_DIALOG_STATE);
      this.storeService_.dispatch(Action.TOGGLE_INFO_DIALOG, !isOpen);
    }

    /**
     * Handles click events on the sidebar button and toggles the sidebar.
     * @private
     */ }, { key: "onSidebarClick_", value:
    function onSidebarClick_() {
      this.storeService_.dispatch(Action.TOGGLE_SIDEBAR, true);
    }

    /**
     * Shows the "story updated" label when a new page was added to the story.
     * @private
     */ }, { key: "onNewPageAvailable_", value:
    function onNewPageAvailable_() {var _this19 = this;
      this.vsync_.mutate(function () {
        _this19.getShadowRoot().setAttribute(HAS_NEW_PAGE_ATTRIBUTE, 'show');
        _this19.hideMessageAfterTimeout_(HAS_NEW_PAGE_ATTRIBUTE);
      });
    }

    /**
     * Reacts to a custom configuration change coming from the player level.
     * Updates UI to match configuration described by publisher.
     * @param {!Array<!../../../src/amp-story-player/amp-story-player-impl.ViewerControlDef>} controls
     * @private
     */ }, { key: "onViewerCustomControls_", value:
    function onViewerCustomControls_(controls) {var _this20 = this;
      if (controls.length <= 0) {
        return;
      }

      controls.forEach(function (control) {
        if (!control.name) {
          return;
        }

        var defaultConfig = VIEWER_CONTROL_DEFAULTS[control.name];

        var element;
        if (defaultConfig && defaultConfig.selector) {
          element = scopedQuerySelector(
          _this20.getShadowRoot(),
          defaultConfig.selector);

        } else {
          element = _this20.win_.document.createElement('button');
          _this20.vsync_.mutate(function () {
            element.classList.add('i-amphtml-story-button');
            _this20.buttonsContainer_.appendChild(element);
          });
        }

        _this20.vsync_.mutate(function () {
          element.classList.add(VIEWER_CUSTOM_CONTROL_CLASS);
        });

        if (control.visibility === 'hidden') {
          _this20.vsync_.mutate(function () {
            element.classList.add('i-amphtml-story-ui-hide-button');
          });
        }

        if (!control.visibility || control.visibility === 'visible') {
          _this20.vsync_.mutate(function () {
            /** @type {!Element} */(
            element).
            classList.remove('i-amphtml-story-ui-hide-button');
          });
        }

        if (control.state === 'disabled') {
          _this20.vsync_.mutate(function () {
            element.disabled = true;
          });
        }

        if (control.position === 'start') {
          var startButtonContainer = _this20.systemLayerEl_.querySelector(
          '.i-amphtml-story-system-layer-buttons-start-position');


          _this20.vsync_.mutate(function () {
            _this20.buttonsContainer_.removeChild(element);
            startButtonContainer.appendChild(element);
          });
        }

        if (control.backgroundImageUrl) {
          setImportantStyles( /** @type {!Element} */(element), {
            'background-image': "url('".concat(control.backgroundImageUrl, "')") });

        }

        element[VIEWER_CONTROL_EVENT_NAME] = "amp-story-player-".concat(control.name);
      });
    }

    /**
     * @param {string} pageId The id of the page whose progress should be
     *     changed.
     * @param {number} progress A number from 0.0 to 1.0, representing the
     *     progress of the current page.
     * @public
     */ }, { key: "updateProgress", value:
    function updateProgress(pageId, progress) {
      // TODO(newmuis) avoid passing progress logic through system-layer
      this.progressBar_.updateProgress(pageId, progress);
    }

    /**
     * @param {!./logging.AmpStoryLogEntryDef} logEntry
     * @private
     */ }, { key: "logInternal_", value:
    function logInternal_(logEntry) {
      this.developerButtons_.log(logEntry);
      this.developerLog_.log(logEntry);
    }

    /**
     * Logs an array of entries to the developer logs.
     * @param {!Array<!./logging.AmpStoryLogEntryDef>} logEntries
     */ }, { key: "logAll", value:
    function logAll(logEntries) {var _this21 = this;
      if (!false) {
        return;
      }

      this.vsync_.mutate(function () {
        logEntries.forEach(function (logEntry) {return _this21.logInternal_(logEntry);});
      });
    }

    /**
     * Logs a single entry to the developer logs.
     * @param {!./logging.AmpStoryLogEntryDef} logEntry
     */ }, { key: "log", value:
    function log(logEntry) {
      if (!false) {
        return;
      }

      this.logInternal_(logEntry);
    }

    /**
     * Clears any state held by the developer log or buttons.
     */ }, { key: "resetDeveloperLogs", value:
    function resetDeveloperLogs() {
      if (!false) {
        return;
      }

      this.developerButtons_.clear();
      this.developerLog_.clear();
    }

    /**
     * Sets the string providing context for the developer logs window.  This is
     * often the name or ID of the element that all logs are for (e.g. the page).
     * @param {string} contextString
     */ }, { key: "setDeveloperLogContextString", value:
    function setDeveloperLogContextString(contextString) {
      if (!false) {
        return;
      }

      this.developerLog_.setContextString(contextString);
    }

    /**
     * Hides the developer log in the UI.
     */ }, { key: "hideDeveloperLog", value:
    function hideDeveloperLog() {
      if (!false) {
        return;
      }

      this.developerLog_.hide();
    } }]);return SystemLayer;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-system-layer.js