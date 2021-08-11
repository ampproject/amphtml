var _VIEWER_CONTROL_DEFAU;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
import { Action, StateProperty, UIType, getStoreService } from "./amp-story-store-service";
import { AmpStoryViewerMessagingHandler } from "./amp-story-viewer-messaging-handler";
import { CSS } from "../../../build/amp-story-system-layer-1.0.css";
import { DevelopmentModeLog, DevelopmentModeLogButtonSet } from "./development-ui";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { ProgressBar } from "./progress-bar";
import { Services } from "../../../src/service";
import { closest, matches, scopedQuerySelector } from "../../../src/core/dom/query";
import { createShadowRootWithStyle, getStoryAttributeSrc, shouldShowStoryUrlInfo, triggerClickFromLightDom } from "./utils";
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
    'class': 'i-amphtml-story-system-layer i-amphtml-story-system-reset'
  }),
  children: [{
    tag: 'a',
    attrs: dict({
      'class': ATTRIBUTION_CLASS,
      'target': '_blank'
    }),
    children: [{
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-attribution-logo-container'
      }),
      children: [{
        tag: 'img',
        attrs: dict({
          'alt': '',
          'class': 'i-amphtml-story-attribution-logo'
        })
      }]
    }, {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-attribution-text'
      })
    }]
  }, {
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-has-new-page-notification-container'
    }),
    children: [{
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-has-new-page-text-wrapper'
      }),
      children: [{
        tag: 'span',
        attrs: dict({
          'class': 'i-amphtml-story-has-new-page-circle-icon'
        })
      }, {
        tag: 'div',
        attrs: dict({
          'class': 'i-amphtml-story-has-new-page-text'
        }),
        localizedStringId: LocalizedStringId.AMP_STORY_HAS_NEW_PAGE_TEXT
      }]
    }]
  }, {
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-system-layer-buttons'
    }),
    children: [{
      tag: 'div',
      attrs: dict({
        'role': 'button',
        'class': INFO_CLASS + ' i-amphtml-story-button'
      }),
      localizedLabelId: LocalizedStringId.AMP_STORY_INFO_BUTTON_LABEL
    }, {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-sound-display'
      }),
      children: [{
        tag: 'div',
        attrs: dict({
          'role': 'alert',
          'class': 'i-amphtml-message-container'
        }),
        children: [{
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-mute-text'
          }),
          localizedStringId: LocalizedStringId.AMP_STORY_AUDIO_MUTE_BUTTON_TEXT
        }, {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-unmute-sound-text'
          }),
          localizedStringId: LocalizedStringId.AMP_STORY_AUDIO_UNMUTE_SOUND_TEXT
        }, {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-unmute-no-sound-text'
          }),
          localizedStringId: LocalizedStringId.AMP_STORY_AUDIO_UNMUTE_NO_SOUND_TEXT
        }]
      }, {
        tag: 'button',
        attrs: dict({
          'class': UNMUTE_CLASS + ' i-amphtml-story-button'
        }),
        localizedLabelId: LocalizedStringId.AMP_STORY_AUDIO_UNMUTE_BUTTON_LABEL
      }, {
        tag: 'button',
        attrs: dict({
          'class': MUTE_CLASS + ' i-amphtml-story-button'
        }),
        localizedLabelId: LocalizedStringId.AMP_STORY_AUDIO_MUTE_BUTTON_LABEL
      }]
    }, {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-paused-display'
      }),
      children: [{
        tag: 'button',
        attrs: dict({
          'class': PAUSE_CLASS + ' i-amphtml-story-button'
        }),
        localizedLabelId: LocalizedStringId.AMP_STORY_PAUSE_BUTTON_LABEL
      }, {
        tag: 'button',
        attrs: dict({
          'class': PLAY_CLASS + ' i-amphtml-story-button'
        }),
        localizedLabelId: LocalizedStringId.AMP_STORY_PLAY_BUTTON_LABEL
      }]
    }, {
      tag: 'button',
      attrs: dict({
        'class': SKIP_TO_NEXT_CLASS + ' i-amphtml-story-ui-hide-button i-amphtml-story-button'
      }),
      localizedLabelId: LocalizedStringId.AMP_STORY_SKIP_TO_NEXT_BUTTON_LABEL
    }, {
      tag: 'button',
      attrs: dict({
        'class': SHARE_CLASS + ' i-amphtml-story-button'
      }),
      localizedLabelId: LocalizedStringId.AMP_STORY_SHARE_BUTTON_LABEL
    }, {
      tag: 'button',
      attrs: dict({
        'class': SIDEBAR_CLASS + ' i-amphtml-story-button'
      }),
      localizedLabelId: LocalizedStringId.AMP_STORY_SIDEBAR_BUTTON_LABEL
    }, {
      tag: 'button',
      attrs: dict({
        'class': CLOSE_CLASS + ' i-amphtml-story-ui-hide-button i-amphtml-story-button'
      }),
      localizedLabelId: LocalizedStringId.AMP_STORY_CLOSE_BUTTON_LABEL
    }]
  }, {
    tag: 'div',
    attrs: dict({
      'class': 'i-amphtml-story-system-layer-buttons-start-position'
    })
  }]
};

/**
 * Contains the event name belonging to the viewer control.
 * @const {string}
 */
var VIEWER_CONTROL_EVENT_NAME = '__AMP_VIEWER_CONTROL_EVENT_NAME__';

/** @enum {string} */
var VIEWER_CONTROL_TYPES = {
  CLOSE: 'close',
  SHARE: 'share',
  DEPRECATED_SKIP_NEXT: 'skip-next',
  // Deprecated in favor of SKIP_TO_NEXT.
  SKIP_TO_NEXT: 'skip-to-next'
};
var VIEWER_CONTROL_DEFAULTS = (_VIEWER_CONTROL_DEFAU = {}, _VIEWER_CONTROL_DEFAU[VIEWER_CONTROL_TYPES.SHARE] = {
  'selector': "." + SHARE_CLASS
}, _VIEWER_CONTROL_DEFAU[VIEWER_CONTROL_TYPES.CLOSE] = {
  'selector': "." + CLOSE_CLASS
}, _VIEWER_CONTROL_DEFAU[VIEWER_CONTROL_TYPES.DEPRECATED_SKIP_NEXT] = {
  'selector': "." + SKIP_TO_NEXT_CLASS
}, _VIEWER_CONTROL_DEFAU[VIEWER_CONTROL_TYPES.SKIP_TO_NEXT] = {
  'selector': "." + SKIP_TO_NEXT_CLASS
}, _VIEWER_CONTROL_DEFAU);

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
  function SystemLayer(win, parentEl) {
    _classCallCheck(this, SystemLayer);

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
   */
  _createClass(SystemLayer, [{
    key: "build",
    value: function build(initialPageId) {
      var _this = this;

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
      this.systemLayerEl_.querySelector('.i-amphtml-story-share-control').href = Services.documentInfoForDoc(this.parentEl_).canonicalUrl;
      createShadowRootWithStyle(this.root_, this.systemLayerEl_, CSS);
      this.systemLayerEl_.insertBefore(this.progressBar_.build(initialPageId), this.systemLayerEl_.firstChild);
      this.buttonsContainer_ = this.systemLayerEl_.querySelector('.i-amphtml-story-system-layer-buttons');
      this.buildForDevelopmentMode_();
      this.initializeListeners_();
      this.storeService_.subscribe(StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS, function (canShowButtons) {
        _this.systemLayerEl_.classList.toggle('i-amphtml-story-ui-no-buttons', !canShowButtons);
      }, true
      /* callToInitialize */
      );

      if (Services.platformFor(this.win_).isIos()) {
        this.systemLayerEl_.setAttribute('ios', '');
      }

      this.viewer_ = Services.viewerForDoc(this.win_.document.documentElement);
      this.viewerMessagingHandler_ = this.viewer_.isEmbedded() ? new AmpStoryViewerMessagingHandler(this.win_, this.viewer_) : null;

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
    /** @private */

  }, {
    key: "maybeBuildAttribution_",
    value: function maybeBuildAttribution_() {
      if (!this.viewer_ || this.viewer_.getParam('attribution') !== 'auto') {
        return;
      }

      this.systemLayerEl_.querySelector('.i-amphtml-story-attribution-logo').src = getStoryAttributeSrc(this.parentEl_, 'entity-logo-src') || getStoryAttributeSrc(this.parentEl_, 'publisher-logo-src');
      var anchorEl = this.systemLayerEl_.querySelector("." + escapeCssSelectorIdent(ATTRIBUTION_CLASS));
      anchorEl.href = getStoryAttributeSrc(this.parentEl_, 'entity-url') || getSourceOrigin(Services.documentInfoForDoc(this.parentEl_).sourceUrl);
      this.systemLayerEl_.querySelector('.i-amphtml-story-attribution-text').textContent = this.parentEl_.getAttribute('entity') || this.parentEl_.getAttribute('publisher');
      anchorEl.classList.add('i-amphtml-story-attribution-visible');
    }
    /**
     * @private
     */

  }, {
    key: "buildForDevelopmentMode_",
    value: function buildForDevelopmentMode_() {
      if (!getMode().development) {
        return;
      }

      this.buttonsContainer_.appendChild(this.developerButtons_.build(this.developerLog_.toggle.bind(this.developerLog_)));
      this.getShadowRoot().appendChild(this.developerLog_.build());
    }
    /**
     * @private
     */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this2 = this;

      // TODO(alanorozco): Listen to tap event properly (i.e. fastclick)
      this.getShadowRoot().addEventListener('click', function (event) {
        var target = dev().assertElement(event.target);

        if (matches(target, "." + MUTE_CLASS + ", ." + MUTE_CLASS + " *")) {
          _this2.onAudioIconClick_(true);
        } else if (matches(target, "." + UNMUTE_CLASS + ", ." + UNMUTE_CLASS + " *")) {
          _this2.onAudioIconClick_(false);
        } else if (matches(target, "." + PAUSE_CLASS + ", ." + PAUSE_CLASS + " *")) {
          _this2.onPausedClick_(true);
        } else if (matches(target, "." + PLAY_CLASS + ", ." + PLAY_CLASS + " *")) {
          _this2.onPausedClick_(false);
        } else if (matches(target, "." + SHARE_CLASS + ", ." + SHARE_CLASS + " *")) {
          _this2.onShareClick_(event);
        } else if (matches(target, "." + INFO_CLASS + ", ." + INFO_CLASS + " *")) {
          _this2.onInfoClick_();
        } else if (matches(target, "." + SIDEBAR_CLASS + ", ." + SIDEBAR_CLASS + " *")) {
          _this2.onSidebarClick_();
        } else if (matches(target, "." + VIEWER_CUSTOM_CONTROL_CLASS + ", ." + VIEWER_CUSTOM_CONTROL_CLASS + " *")) {
          _this2.onViewerControlClick_(dev().assertElement(event.target));
        } else if (matches(target, "." + ATTRIBUTION_CLASS + ", ." + ATTRIBUTION_CLASS + " *")) {
          var anchorClicked = closest(target, function (e) {
            return matches(e, 'a[href]');
          });
          triggerClickFromLightDom(anchorClicked, _this2.parentEl_);
        }
      });
      this.storeService_.subscribe(StateProperty.AD_STATE, function (isAd) {
        _this2.onAdStateUpdate_(isAd);
      });
      this.storeService_.subscribe(StateProperty.CAN_SHOW_AUDIO_UI, function (show) {
        _this2.onCanShowAudioUiUpdate_(show);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.CAN_SHOW_SHARING_UIS, function (show) {
        _this2.onCanShowSharingUisUpdate_(show);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.STORY_HAS_AUDIO_STATE, function (hasAudio) {
        _this2.onStoryHasAudioStateUpdate_(hasAudio);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.STORY_HAS_PLAYBACK_UI_STATE, function (hasPlaybackUi) {
        _this2.onStoryHasPlaybackUiStateUpdate_(hasPlaybackUi);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.MUTED_STATE, function (isMuted) {
        _this2.onMutedStateUpdate_(isMuted);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.UI_STATE, function (uiState) {
        _this2.onUIStateUpdate_(uiState);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.PAUSED_STATE, function (isPaused) {
        _this2.onPausedStateUpdate_(isPaused);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.CURRENT_PAGE_INDEX, function (index) {
        _this2.onPageIndexUpdate_(index);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.RTL_STATE, function (rtlState) {
        _this2.onRtlStateUpdate_(rtlState);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.KEYBOARD_ACTIVE_STATE, function (keyboardState) {
        _this2.onKeyboardActiveUpdate_(keyboardState);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.PAGE_HAS_AUDIO_STATE, function (audio) {
        _this2.onPageHasAudioStateUpdate_(audio);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE, function (hasPlaybackUi) {
        _this2.onPageHasElementsWithPlaybackStateUpdate_(hasPlaybackUi);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.HAS_SIDEBAR_STATE, function (hasSidebar) {
        _this2.onHasSidebarStateUpdate_(hasSidebar);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.SYSTEM_UI_IS_VISIBLE_STATE, function (isVisible) {
        _this2.onSystemUiIsVisibleStateUpdate_(isVisible);
      });
      this.storeService_.subscribe(StateProperty.NEW_PAGE_AVAILABLE_ID, function () {
        _this2.onNewPageAvailable_();
      });
      this.storeService_.subscribe(StateProperty.VIEWER_CUSTOM_CONTROLS, function (config) {
        return _this2.onViewerCustomControls_(config);
      }, true
      /* callToInitialize */
      );
    }
    /**
     * @return {!Element}
     */

  }, {
    key: "getRoot",
    value: function getRoot() {
      return dev().assertElement(this.root_);
    }
    /**
     * @return {!Element}
     */

  }, {
    key: "getShadowRoot",
    value: function getShadowRoot() {
      return dev().assertElement(this.systemLayerEl_);
    }
    /**
     * Reacts to the ad state updates and updates the UI accordingly.
     * @param {boolean} isAd
     * @private
     */

  }, {
    key: "onAdStateUpdate_",
    value: function onAdStateUpdate_(isAd) {
      // This is not in vsync as we are showing/hiding items in the system layer
      // based upon this attribute, and when wrapped in vsync there is a visual
      // lag after the page change before the icons are updated.
      isAd ? this.getShadowRoot().setAttribute(AD_SHOWING_ATTRIBUTE, '') : this.getShadowRoot().removeAttribute(AD_SHOWING_ATTRIBUTE);
    }
    /**
     * Checks if the story has a sidebar in order to display the icon representing
     * the opening of the sidebar.
     * @param {boolean} hasSidebar
     * @private
     */

  }, {
    key: "onHasSidebarStateUpdate_",
    value: function onHasSidebarStateUpdate_(hasSidebar) {
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
     */

  }, {
    key: "onCanShowAudioUiUpdate_",
    value: function onCanShowAudioUiUpdate_(canShowAudioUi) {
      var _this3 = this;

      this.vsync_.mutate(function () {
        _this3.getShadowRoot().classList.toggle('i-amphtml-story-no-audio-ui', !canShowAudioUi);
      });
    }
    /**
     * Reacts to updates to whether sharing UIs may be shown, and updates the UI
     * accordingly.
     * @param {boolean} canShowSharingUis
     * @private
     */

  }, {
    key: "onCanShowSharingUisUpdate_",
    value: function onCanShowSharingUisUpdate_(canShowSharingUis) {
      var _this4 = this;

      this.vsync_.mutate(function () {
        _this4.getShadowRoot().classList.toggle('i-amphtml-story-no-sharing', !canShowSharingUis);
      });
    }
    /**
     * Reacts to has audio state updates, determining if the story has a global
     * audio track playing, or if any page has audio.
     * @param {boolean} hasAudio
     * @private
     */

  }, {
    key: "onStoryHasAudioStateUpdate_",
    value: function onStoryHasAudioStateUpdate_(hasAudio) {
      var _this5 = this;

      this.vsync_.mutate(function () {
        _this5.getShadowRoot().classList.toggle('i-amphtml-story-has-audio', hasAudio);
      });
    }
    /**
     * Reacts to story having elements with playback.
     * @param {boolean} hasPlaybackUi
     * @private
     */

  }, {
    key: "onStoryHasPlaybackUiStateUpdate_",
    value: function onStoryHasPlaybackUiStateUpdate_(hasPlaybackUi) {
      var _this6 = this;

      this.vsync_.mutate(function () {
        _this6.getShadowRoot().classList.toggle('i-amphtml-story-has-playback-ui', hasPlaybackUi);
      });
    }
    /**
     * Reacts to the presence of audio on a page to determine which audio messages
     * to display.
     * @param {boolean} pageHasAudio
     * @private
     */

  }, {
    key: "onPageHasAudioStateUpdate_",
    value: function onPageHasAudioStateUpdate_(pageHasAudio) {
      var _this7 = this;

      pageHasAudio = pageHasAudio || !!this.storeService_.get(StateProperty.STORY_HAS_BACKGROUND_AUDIO_STATE);
      this.vsync_.mutate(function () {
        pageHasAudio ? _this7.getShadowRoot().setAttribute(CURRENT_PAGE_HAS_AUDIO_ATTRIBUTE, '') : _this7.getShadowRoot().removeAttribute(CURRENT_PAGE_HAS_AUDIO_ATTRIBUTE);
      });
    }
    /**
     * Reacts to the presence of elements with playback on the page.
     * @param {boolean} pageHasElementsWithPlayback
     * @private
     */

  }, {
    key: "onPageHasElementsWithPlaybackStateUpdate_",
    value: function onPageHasElementsWithPlaybackStateUpdate_(pageHasElementsWithPlayback) {
      var _this8 = this;

      this.vsync_.mutate(function () {
        toArray(_this8.getShadowRoot().querySelectorAll('.i-amphtml-paused-display button')).forEach(function (button) {
          button.disabled = !pageHasElementsWithPlayback;
        });
      });
    }
    /**
     * Reacts to muted state updates.
     * @param {boolean} isMuted
     * @private
     */

  }, {
    key: "onMutedStateUpdate_",
    value: function onMutedStateUpdate_(isMuted) {
      var _this9 = this;

      this.vsync_.mutate(function () {
        isMuted ? _this9.getShadowRoot().setAttribute(AUDIO_MUTED_ATTRIBUTE, '') : _this9.getShadowRoot().removeAttribute(AUDIO_MUTED_ATTRIBUTE);
      });
    }
    /**
     * Reacts to paused state updates.
     * @param {boolean} isPaused
     * @private
     */

  }, {
    key: "onPausedStateUpdate_",
    value: function onPausedStateUpdate_(isPaused) {
      var _this10 = this;

      this.vsync_.mutate(function () {
        isPaused ? _this10.getShadowRoot().setAttribute(PAUSED_ATTRIBUTE, '') : _this10.getShadowRoot().removeAttribute(PAUSED_ATTRIBUTE);
      });
    }
    /**
     * Hides message after elapsed time.
     * @param {string} message
     * @private
     */

  }, {
    key: "hideMessageAfterTimeout_",
    value: function hideMessageAfterTimeout_(message) {
      var _this11 = this;

      if (this.timeoutId_) {
        this.timer_.cancel(this.timeoutId_);
      }

      this.timeoutId_ = this.timer_.delay(function () {
        return _this11.hideMessageInternal_(message);
      }, HIDE_MESSAGE_TIMEOUT_MS);
    }
    /**
     * Hides message.
     * @param {string} message
     * @private
     */

  }, {
    key: "hideMessageInternal_",
    value: function hideMessageInternal_(message) {
      var _this12 = this;

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
     */

  }, {
    key: "onUIStateUpdate_",
    value: function onUIStateUpdate_(uiState) {
      var _this13 = this;

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
            break;
        }
      });
    }
    /**
     * Reacts to system UI visibility state updates.
     * @param {boolean} isVisible
     * @private
     */

  }, {
    key: "onSystemUiIsVisibleStateUpdate_",
    value: function onSystemUiIsVisibleStateUpdate_(isVisible) {
      var _this14 = this;

      this.vsync_.mutate(function () {
        _this14.getShadowRoot().classList.toggle('i-amphtml-story-hidden', !isVisible);
      });
    }
    /**
     * Reacts to the active page index changing.
     * @param {number} index
     */

  }, {
    key: "onPageIndexUpdate_",
    value: function onPageIndexUpdate_(index) {
      var _this15 = this;

      this.vsync_.mutate(function () {
        var lastIndex = _this15.storeService_.get(StateProperty.PAGE_IDS).length - 1;

        _this15.getShadowRoot().classList.toggle('i-amphtml-first-page-active', index === 0);

        _this15.getShadowRoot().classList.toggle('i-amphtml-last-page-active', index === lastIndex);
      });
    }
    /**
     * Reacts to RTL state updates and triggers the UI for RTL.
     * @param {boolean} rtlState
     * @private
     */

  }, {
    key: "onRtlStateUpdate_",
    value: function onRtlStateUpdate_(rtlState) {
      var _this16 = this;

      this.vsync_.mutate(function () {
        rtlState ? _this16.getShadowRoot().setAttribute('dir', 'rtl') : _this16.getShadowRoot().removeAttribute('dir');
      });
    }
    /**
     * Reacts to keyboard updates and updates the UI.
     * @param {boolean} keyboardActive
     * @private
     */

  }, {
    key: "onKeyboardActiveUpdate_",
    value: function onKeyboardActiveUpdate_(keyboardActive) {
      var _this17 = this;

      this.vsync_.mutate(function () {
        _this17.getShadowRoot().classList.toggle('amp-mode-keyboard-active', keyboardActive);
      });
    }
    /**
     * Handles click events on the mute and unmute buttons.
     * @param {boolean} mute Specifies if the audio is being muted or unmuted.
     * @private
     */

  }, {
    key: "onAudioIconClick_",
    value: function onAudioIconClick_(mute) {
      var _this18 = this;

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
     */

  }, {
    key: "onPausedClick_",
    value: function onPausedClick_(paused) {
      this.storeService_.dispatch(Action.TOGGLE_PAUSED, paused);
    }
    /**
     * Handles click events on the share button and toggles the share menu.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onShareClick_",
    value: function onShareClick_(event) {
      event.preventDefault();

      if (event.target[VIEWER_CONTROL_EVENT_NAME]) {
        this.onViewerControlClick_(dev().assertElement(event.target));
        return;
      }

      var isOpen = this.storeService_.get(StateProperty.SHARE_MENU_STATE);
      this.storeService_.dispatch(Action.TOGGLE_SHARE_MENU, !isOpen);
    }
    /**
     * Sends message back to the viewer with the corresponding event.
     * @param {!Element} element
     * @private
     */

  }, {
    key: "onViewerControlClick_",
    value: function onViewerControlClick_(element) {
      var eventName = element[VIEWER_CONTROL_EVENT_NAME];
      this.viewerMessagingHandler_ && this.viewerMessagingHandler_.send('documentStateUpdate', dict({
        'state': AMP_STORY_PLAYER_EVENT,
        'value': eventName
      }));
    }
    /**
     * Handles click events on the info button and toggles the info dialog.
     * @private
     */

  }, {
    key: "onInfoClick_",
    value: function onInfoClick_() {
      var isOpen = this.storeService_.get(StateProperty.INFO_DIALOG_STATE);
      this.storeService_.dispatch(Action.TOGGLE_INFO_DIALOG, !isOpen);
    }
    /**
     * Handles click events on the sidebar button and toggles the sidebar.
     * @private
     */

  }, {
    key: "onSidebarClick_",
    value: function onSidebarClick_() {
      this.storeService_.dispatch(Action.TOGGLE_SIDEBAR, true);
    }
    /**
     * Shows the "story updated" label when a new page was added to the story.
     * @private
     */

  }, {
    key: "onNewPageAvailable_",
    value: function onNewPageAvailable_() {
      var _this19 = this;

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
     */

  }, {
    key: "onViewerCustomControls_",
    value: function onViewerCustomControls_(controls) {
      var _this20 = this;

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
          element = scopedQuerySelector(_this20.getShadowRoot(), defaultConfig.selector);
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
            dev().assertElement(element).classList.remove('i-amphtml-story-ui-hide-button');
          });
        }

        if (control.state === 'disabled') {
          _this20.vsync_.mutate(function () {
            element.disabled = true;
          });
        }

        if (control.position === 'start') {
          var startButtonContainer = _this20.systemLayerEl_.querySelector('.i-amphtml-story-system-layer-buttons-start-position');

          _this20.vsync_.mutate(function () {
            _this20.buttonsContainer_.removeChild(element);

            startButtonContainer.appendChild(element);
          });
        }

        if (control.backgroundImageUrl) {
          setImportantStyles(dev().assertElement(element), {
            'background-image': "url('" + control.backgroundImageUrl + "')"
          });
        }

        element[VIEWER_CONTROL_EVENT_NAME] = "amp-story-player-" + control.name;
      });
    }
    /**
     * @param {string} pageId The id of the page whose progress should be
     *     changed.
     * @param {number} progress A number from 0.0 to 1.0, representing the
     *     progress of the current page.
     * @public
     */

  }, {
    key: "updateProgress",
    value: function updateProgress(pageId, progress) {
      // TODO(newmuis) avoid passing progress logic through system-layer
      this.progressBar_.updateProgress(pageId, progress);
    }
    /**
     * @param {!./logging.AmpStoryLogEntryDef} logEntry
     * @private
     */

  }, {
    key: "logInternal_",
    value: function logInternal_(logEntry) {
      this.developerButtons_.log(logEntry);
      this.developerLog_.log(logEntry);
    }
    /**
     * Logs an array of entries to the developer logs.
     * @param {!Array<!./logging.AmpStoryLogEntryDef>} logEntries
     */

  }, {
    key: "logAll",
    value: function logAll(logEntries) {
      var _this21 = this;

      if (!getMode().development) {
        return;
      }

      this.vsync_.mutate(function () {
        logEntries.forEach(function (logEntry) {
          return _this21.logInternal_(logEntry);
        });
      });
    }
    /**
     * Logs a single entry to the developer logs.
     * @param {!./logging.AmpStoryLogEntryDef} logEntry
     */

  }, {
    key: "log",
    value: function log(logEntry) {
      if (!getMode().development) {
        return;
      }

      this.logInternal_(logEntry);
    }
    /**
     * Clears any state held by the developer log or buttons.
     */

  }, {
    key: "resetDeveloperLogs",
    value: function resetDeveloperLogs() {
      if (!getMode().development) {
        return;
      }

      this.developerButtons_.clear();
      this.developerLog_.clear();
    }
    /**
     * Sets the string providing context for the developer logs window.  This is
     * often the name or ID of the element that all logs are for (e.g. the page).
     * @param {string} contextString
     */

  }, {
    key: "setDeveloperLogContextString",
    value: function setDeveloperLogContextString(contextString) {
      if (!getMode().development) {
        return;
      }

      this.developerLog_.setContextString(contextString);
    }
    /**
     * Hides the developer log in the UI.
     */

  }, {
    key: "hideDeveloperLog",
    value: function hideDeveloperLog() {
      if (!getMode().development) {
        return;
      }

      this.developerLog_.hide();
    }
  }]);

  return SystemLayer;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1zeXN0ZW0tbGF5ZXIuanMiXSwibmFtZXMiOlsiQU1QX1NUT1JZX1BMQVlFUl9FVkVOVCIsIkFjdGlvbiIsIlN0YXRlUHJvcGVydHkiLCJVSVR5cGUiLCJnZXRTdG9yZVNlcnZpY2UiLCJBbXBTdG9yeVZpZXdlck1lc3NhZ2luZ0hhbmRsZXIiLCJDU1MiLCJEZXZlbG9wbWVudE1vZGVMb2ciLCJEZXZlbG9wbWVudE1vZGVMb2dCdXR0b25TZXQiLCJMb2NhbGl6ZWRTdHJpbmdJZCIsIlByb2dyZXNzQmFyIiwiU2VydmljZXMiLCJjbG9zZXN0IiwibWF0Y2hlcyIsInNjb3BlZFF1ZXJ5U2VsZWN0b3IiLCJjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlIiwiZ2V0U3RvcnlBdHRyaWJ1dGVTcmMiLCJzaG91bGRTaG93U3RvcnlVcmxJbmZvIiwidHJpZ2dlckNsaWNrRnJvbUxpZ2h0RG9tIiwiZGV2IiwiZGljdCIsImVzY2FwZUNzc1NlbGVjdG9ySWRlbnQiLCJnZXRNb2RlIiwiZ2V0U291cmNlT3JpZ2luIiwicmVuZGVyQXNFbGVtZW50Iiwic2V0SW1wb3J0YW50U3R5bGVzIiwidG9BcnJheSIsIkFEX1NIT1dJTkdfQVRUUklCVVRFIiwiQVVESU9fTVVURURfQVRUUklCVVRFIiwiUEFVU0VEX0FUVFJJQlVURSIsIkhBU19JTkZPX0JVVFRPTl9BVFRSSUJVVEUiLCJNVVRFX0NMQVNTIiwiQ0xPU0VfQ0xBU1MiLCJTS0lQX1RPX05FWFRfQ0xBU1MiLCJWSUVXRVJfQ1VTVE9NX0NPTlRST0xfQ0xBU1MiLCJVTk1VVEVfQ0xBU1MiLCJQQVVTRV9DTEFTUyIsIlBMQVlfQ0xBU1MiLCJNRVNTQUdFX0RJU1BMQVlfQ0xBU1MiLCJDVVJSRU5UX1BBR0VfSEFTX0FVRElPX0FUVFJJQlVURSIsIkhBU19TSURFQkFSX0FUVFJJQlVURSIsIlNIQVJFX0NMQVNTIiwiSU5GT19DTEFTUyIsIlNJREVCQVJfQ0xBU1MiLCJIQVNfTkVXX1BBR0VfQVRUUklCVVRFIiwiQVRUUklCVVRJT05fQ0xBU1MiLCJISURFX01FU1NBR0VfVElNRU9VVF9NUyIsIlRFTVBMQVRFIiwidGFnIiwiYXR0cnMiLCJjaGlsZHJlbiIsImxvY2FsaXplZFN0cmluZ0lkIiwiQU1QX1NUT1JZX0hBU19ORVdfUEFHRV9URVhUIiwibG9jYWxpemVkTGFiZWxJZCIsIkFNUF9TVE9SWV9JTkZPX0JVVFRPTl9MQUJFTCIsIkFNUF9TVE9SWV9BVURJT19NVVRFX0JVVFRPTl9URVhUIiwiQU1QX1NUT1JZX0FVRElPX1VOTVVURV9TT1VORF9URVhUIiwiQU1QX1NUT1JZX0FVRElPX1VOTVVURV9OT19TT1VORF9URVhUIiwiQU1QX1NUT1JZX0FVRElPX1VOTVVURV9CVVRUT05fTEFCRUwiLCJBTVBfU1RPUllfQVVESU9fTVVURV9CVVRUT05fTEFCRUwiLCJBTVBfU1RPUllfUEFVU0VfQlVUVE9OX0xBQkVMIiwiQU1QX1NUT1JZX1BMQVlfQlVUVE9OX0xBQkVMIiwiQU1QX1NUT1JZX1NLSVBfVE9fTkVYVF9CVVRUT05fTEFCRUwiLCJBTVBfU1RPUllfU0hBUkVfQlVUVE9OX0xBQkVMIiwiQU1QX1NUT1JZX1NJREVCQVJfQlVUVE9OX0xBQkVMIiwiQU1QX1NUT1JZX0NMT1NFX0JVVFRPTl9MQUJFTCIsIlZJRVdFUl9DT05UUk9MX0VWRU5UX05BTUUiLCJWSUVXRVJfQ09OVFJPTF9UWVBFUyIsIkNMT1NFIiwiU0hBUkUiLCJERVBSRUNBVEVEX1NLSVBfTkVYVCIsIlNLSVBfVE9fTkVYVCIsIlZJRVdFUl9DT05UUk9MX0RFRkFVTFRTIiwiU3lzdGVtTGF5ZXIiLCJ3aW4iLCJwYXJlbnRFbCIsIndpbl8iLCJwYXJlbnRFbF8iLCJpc0J1aWx0XyIsInJvb3RfIiwic3lzdGVtTGF5ZXJFbF8iLCJidXR0b25zQ29udGFpbmVyXyIsInByb2dyZXNzQmFyXyIsImNyZWF0ZSIsImRldmVsb3BlckxvZ18iLCJkZXZlbG9wZXJCdXR0b25zXyIsInN0b3JlU2VydmljZV8iLCJ2c3luY18iLCJ2c3luY0ZvciIsInRpbWVyXyIsInRpbWVyRm9yIiwidGltZW91dElkXyIsInZpZXdlcl8iLCJ2aWV3ZXJNZXNzYWdpbmdIYW5kbGVyXyIsImluaXRpYWxQYWdlSWQiLCJnZXRSb290IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwicXVlcnlTZWxlY3RvciIsImhyZWYiLCJkb2N1bWVudEluZm9Gb3JEb2MiLCJjYW5vbmljYWxVcmwiLCJpbnNlcnRCZWZvcmUiLCJidWlsZCIsImZpcnN0Q2hpbGQiLCJidWlsZEZvckRldmVsb3BtZW50TW9kZV8iLCJpbml0aWFsaXplTGlzdGVuZXJzXyIsInN1YnNjcmliZSIsIkNBTl9TSE9XX1NZU1RFTV9MQVlFUl9CVVRUT05TIiwiY2FuU2hvd0J1dHRvbnMiLCJ0b2dnbGUiLCJwbGF0Zm9ybUZvciIsImlzSW9zIiwic2V0QXR0cmlidXRlIiwidmlld2VyRm9yRG9jIiwiZG9jdW1lbnRFbGVtZW50IiwiaXNFbWJlZGRlZCIsImdldFNoYWRvd1Jvb3QiLCJyZW1vdmVBdHRyaWJ1dGUiLCJtYXliZUJ1aWxkQXR0cmlidXRpb25fIiwiZ2V0UGFyYW0iLCJzcmMiLCJhbmNob3JFbCIsInNvdXJjZVVybCIsInRleHRDb250ZW50IiwiZ2V0QXR0cmlidXRlIiwiZGV2ZWxvcG1lbnQiLCJhcHBlbmRDaGlsZCIsImJpbmQiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJ0YXJnZXQiLCJhc3NlcnRFbGVtZW50Iiwib25BdWRpb0ljb25DbGlja18iLCJvblBhdXNlZENsaWNrXyIsIm9uU2hhcmVDbGlja18iLCJvbkluZm9DbGlja18iLCJvblNpZGViYXJDbGlja18iLCJvblZpZXdlckNvbnRyb2xDbGlja18iLCJhbmNob3JDbGlja2VkIiwiZSIsIkFEX1NUQVRFIiwiaXNBZCIsIm9uQWRTdGF0ZVVwZGF0ZV8iLCJDQU5fU0hPV19BVURJT19VSSIsInNob3ciLCJvbkNhblNob3dBdWRpb1VpVXBkYXRlXyIsIkNBTl9TSE9XX1NIQVJJTkdfVUlTIiwib25DYW5TaG93U2hhcmluZ1Vpc1VwZGF0ZV8iLCJTVE9SWV9IQVNfQVVESU9fU1RBVEUiLCJoYXNBdWRpbyIsIm9uU3RvcnlIYXNBdWRpb1N0YXRlVXBkYXRlXyIsIlNUT1JZX0hBU19QTEFZQkFDS19VSV9TVEFURSIsImhhc1BsYXliYWNrVWkiLCJvblN0b3J5SGFzUGxheWJhY2tVaVN0YXRlVXBkYXRlXyIsIk1VVEVEX1NUQVRFIiwiaXNNdXRlZCIsIm9uTXV0ZWRTdGF0ZVVwZGF0ZV8iLCJVSV9TVEFURSIsInVpU3RhdGUiLCJvblVJU3RhdGVVcGRhdGVfIiwiUEFVU0VEX1NUQVRFIiwiaXNQYXVzZWQiLCJvblBhdXNlZFN0YXRlVXBkYXRlXyIsIkNVUlJFTlRfUEFHRV9JTkRFWCIsImluZGV4Iiwib25QYWdlSW5kZXhVcGRhdGVfIiwiUlRMX1NUQVRFIiwicnRsU3RhdGUiLCJvblJ0bFN0YXRlVXBkYXRlXyIsIktFWUJPQVJEX0FDVElWRV9TVEFURSIsImtleWJvYXJkU3RhdGUiLCJvbktleWJvYXJkQWN0aXZlVXBkYXRlXyIsIlBBR0VfSEFTX0FVRElPX1NUQVRFIiwiYXVkaW8iLCJvblBhZ2VIYXNBdWRpb1N0YXRlVXBkYXRlXyIsIlBBR0VfSEFTX0VMRU1FTlRTX1dJVEhfUExBWUJBQ0tfU1RBVEUiLCJvblBhZ2VIYXNFbGVtZW50c1dpdGhQbGF5YmFja1N0YXRlVXBkYXRlXyIsIkhBU19TSURFQkFSX1NUQVRFIiwiaGFzU2lkZWJhciIsIm9uSGFzU2lkZWJhclN0YXRlVXBkYXRlXyIsIlNZU1RFTV9VSV9JU19WSVNJQkxFX1NUQVRFIiwiaXNWaXNpYmxlIiwib25TeXN0ZW1VaUlzVmlzaWJsZVN0YXRlVXBkYXRlXyIsIk5FV19QQUdFX0FWQUlMQUJMRV9JRCIsIm9uTmV3UGFnZUF2YWlsYWJsZV8iLCJWSUVXRVJfQ1VTVE9NX0NPTlRST0xTIiwiY29uZmlnIiwib25WaWV3ZXJDdXN0b21Db250cm9sc18iLCJjYW5TaG93QXVkaW9VaSIsIm11dGF0ZSIsImNhblNob3dTaGFyaW5nVWlzIiwicGFnZUhhc0F1ZGlvIiwiZ2V0IiwiU1RPUllfSEFTX0JBQ0tHUk9VTkRfQVVESU9fU1RBVEUiLCJwYWdlSGFzRWxlbWVudHNXaXRoUGxheWJhY2siLCJxdWVyeVNlbGVjdG9yQWxsIiwiZm9yRWFjaCIsImJ1dHRvbiIsImRpc2FibGVkIiwibWVzc2FnZSIsImNhbmNlbCIsImRlbGF5IiwiaGlkZU1lc3NhZ2VJbnRlcm5hbF8iLCJzaGFkb3dSb290IiwicmVtb3ZlIiwiREVTS1RPUF9QQU5FTFMiLCJERVNLVE9QX0ZVTExCTEVFRCIsIkRFU0tUT1BfT05FX1BBTkVMIiwibGFzdEluZGV4IiwiUEFHRV9JRFMiLCJsZW5ndGgiLCJrZXlib2FyZEFjdGl2ZSIsIm11dGUiLCJkaXNwYXRjaCIsIlRPR0dMRV9NVVRFRCIsImhpZGVNZXNzYWdlQWZ0ZXJUaW1lb3V0XyIsInBhdXNlZCIsIlRPR0dMRV9QQVVTRUQiLCJwcmV2ZW50RGVmYXVsdCIsImlzT3BlbiIsIlNIQVJFX01FTlVfU1RBVEUiLCJUT0dHTEVfU0hBUkVfTUVOVSIsImVsZW1lbnQiLCJldmVudE5hbWUiLCJzZW5kIiwiSU5GT19ESUFMT0dfU1RBVEUiLCJUT0dHTEVfSU5GT19ESUFMT0ciLCJUT0dHTEVfU0lERUJBUiIsImNvbnRyb2xzIiwiY29udHJvbCIsIm5hbWUiLCJkZWZhdWx0Q29uZmlnIiwic2VsZWN0b3IiLCJ2aXNpYmlsaXR5Iiwic3RhdGUiLCJwb3NpdGlvbiIsInN0YXJ0QnV0dG9uQ29udGFpbmVyIiwicmVtb3ZlQ2hpbGQiLCJiYWNrZ3JvdW5kSW1hZ2VVcmwiLCJwYWdlSWQiLCJwcm9ncmVzcyIsInVwZGF0ZVByb2dyZXNzIiwibG9nRW50cnkiLCJsb2ciLCJsb2dFbnRyaWVzIiwibG9nSW50ZXJuYWxfIiwiY2xlYXIiLCJjb250ZXh0U3RyaW5nIiwic2V0Q29udGV4dFN0cmluZyIsImhpZGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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VUFBSSxDQUFDcE8sT0FBTyxHQUFHMEcsV0FBZixFQUE0QjtBQUMxQjtBQUNEOztBQUVELFdBQUs1QyxhQUFMLENBQW1Cd0ssSUFBbkI7QUFDRDtBQTUxQkg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IHtBTVBfU1RPUllfUExBWUVSX0VWRU5UfSBmcm9tICcuLi8uLi8uLi9zcmMvYW1wLXN0b3J5LXBsYXllci9hbXAtc3RvcnktcGxheWVyLWltcGwnO1xuaW1wb3J0IHtcbiAgQWN0aW9uLFxuICBTdGF0ZVByb3BlcnR5LFxuICBVSVR5cGUsXG4gIGdldFN0b3JlU2VydmljZSxcbn0gZnJvbSAnLi9hbXAtc3Rvcnktc3RvcmUtc2VydmljZSc7XG5pbXBvcnQge0FtcFN0b3J5Vmlld2VyTWVzc2FnaW5nSGFuZGxlcn0gZnJvbSAnLi9hbXAtc3Rvcnktdmlld2VyLW1lc3NhZ2luZy1oYW5kbGVyJztcbmltcG9ydCB7Q1NTfSBmcm9tICcuLi8uLi8uLi9idWlsZC9hbXAtc3Rvcnktc3lzdGVtLWxheWVyLTEuMC5jc3MnO1xuaW1wb3J0IHtcbiAgRGV2ZWxvcG1lbnRNb2RlTG9nLFxuICBEZXZlbG9wbWVudE1vZGVMb2dCdXR0b25TZXQsXG59IGZyb20gJy4vZGV2ZWxvcG1lbnQtdWknO1xuaW1wb3J0IHtMb2NhbGl6ZWRTdHJpbmdJZH0gZnJvbSAnI3NlcnZpY2UvbG9jYWxpemF0aW9uL3N0cmluZ3MnO1xuaW1wb3J0IHtQcm9ncmVzc0Jhcn0gZnJvbSAnLi9wcm9ncmVzcy1iYXInO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtjbG9zZXN0LCBtYXRjaGVzLCBzY29wZWRRdWVyeVNlbGVjdG9yfSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuaW1wb3J0IHtcbiAgY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZSxcbiAgZ2V0U3RvcnlBdHRyaWJ1dGVTcmMsXG4gIHNob3VsZFNob3dTdG9yeVVybEluZm8sXG4gIHRyaWdnZXJDbGlja0Zyb21MaWdodERvbSxcbn0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2Rldn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2RpY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge2VzY2FwZUNzc1NlbGVjdG9ySWRlbnR9IGZyb20gJyNjb3JlL2RvbS9jc3Mtc2VsZWN0b3JzJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vLi4vLi4vc3JjL21vZGUnO1xuaW1wb3J0IHtnZXRTb3VyY2VPcmlnaW59IGZyb20gJy4uLy4uLy4uL3NyYy91cmwnO1xuXG5pbXBvcnQge3JlbmRlckFzRWxlbWVudH0gZnJvbSAnLi9zaW1wbGUtdGVtcGxhdGUnO1xuXG5pbXBvcnQge3NldEltcG9ydGFudFN0eWxlc30gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCB7dG9BcnJheX0gZnJvbSAnI2NvcmUvdHlwZXMvYXJyYXknO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBBRF9TSE9XSU5HX0FUVFJJQlVURSA9ICdhZC1zaG93aW5nJztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgQVVESU9fTVVURURfQVRUUklCVVRFID0gJ211dGVkJztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgUEFVU0VEX0FUVFJJQlVURSA9ICdwYXVzZWQnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBIQVNfSU5GT19CVVRUT05fQVRUUklCVVRFID0gJ2luZm8nO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBNVVRFX0NMQVNTID0gJ2ktYW1waHRtbC1zdG9yeS1tdXRlLWF1ZGlvLWNvbnRyb2wnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBDTE9TRV9DTEFTUyA9ICdpLWFtcGh0bWwtc3RvcnktY2xvc2UtY29udHJvbCc7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFNLSVBfVE9fTkVYVF9DTEFTUyA9ICdpLWFtcGh0bWwtc3Rvcnktc2tpcC10by1uZXh0JztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgVklFV0VSX0NVU1RPTV9DT05UUk9MX0NMQVNTID0gJ2ktYW1waHRtbC1zdG9yeS12aWV3ZXItY3VzdG9tLWNvbnRyb2wnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBVTk1VVEVfQ0xBU1MgPSAnaS1hbXBodG1sLXN0b3J5LXVubXV0ZS1hdWRpby1jb250cm9sJztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgUEFVU0VfQ0xBU1MgPSAnaS1hbXBodG1sLXN0b3J5LXBhdXNlLWNvbnRyb2wnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBQTEFZX0NMQVNTID0gJ2ktYW1waHRtbC1zdG9yeS1wbGF5LWNvbnRyb2wnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBNRVNTQUdFX0RJU1BMQVlfQ0xBU1MgPSAnaS1hbXBodG1sLXN0b3J5LW1lc3NhZ2VkaXNwbGF5JztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgQ1VSUkVOVF9QQUdFX0hBU19BVURJT19BVFRSSUJVVEUgPSAnaS1hbXBodG1sLWN1cnJlbnQtcGFnZS1oYXMtYXVkaW8nO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBIQVNfU0lERUJBUl9BVFRSSUJVVEUgPSAnaS1hbXBodG1sLXN0b3J5LWhhcy1zaWRlYmFyJztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgU0hBUkVfQ0xBU1MgPSAnaS1hbXBodG1sLXN0b3J5LXNoYXJlLWNvbnRyb2wnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBJTkZPX0NMQVNTID0gJ2ktYW1waHRtbC1zdG9yeS1pbmZvLWNvbnRyb2wnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBTSURFQkFSX0NMQVNTID0gJ2ktYW1waHRtbC1zdG9yeS1zaWRlYmFyLWNvbnRyb2wnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBIQVNfTkVXX1BBR0VfQVRUUklCVVRFID0gJ2ktYW1waHRtbC1zdG9yeS1oYXMtbmV3LXBhZ2UnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBBVFRSSUJVVElPTl9DTEFTUyA9ICdpLWFtcGh0bWwtc3RvcnktYXR0cmlidXRpb24nO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtudW1iZXJ9ICovXG5jb25zdCBISURFX01FU1NBR0VfVElNRU9VVF9NUyA9IDE1MDA7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL3NpbXBsZS10ZW1wbGF0ZS5FbGVtZW50RGVmfSAqL1xuY29uc3QgVEVNUExBVEUgPSB7XG4gIHRhZzogJ2FzaWRlJyxcbiAgYXR0cnM6IGRpY3Qoe1xuICAgICdjbGFzcyc6ICdpLWFtcGh0bWwtc3Rvcnktc3lzdGVtLWxheWVyIGktYW1waHRtbC1zdG9yeS1zeXN0ZW0tcmVzZXQnLFxuICB9KSxcbiAgY2hpbGRyZW46IFtcbiAgICB7XG4gICAgICB0YWc6ICdhJyxcbiAgICAgIGF0dHJzOiBkaWN0KHtcbiAgICAgICAgJ2NsYXNzJzogQVRUUklCVVRJT05fQ0xBU1MsXG4gICAgICAgICd0YXJnZXQnOiAnX2JsYW5rJyxcbiAgICAgIH0pLFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAge1xuICAgICAgICAgIHRhZzogJ2RpdicsXG4gICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgJ2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1hdHRyaWJ1dGlvbi1sb2dvLWNvbnRhaW5lcicsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGFnOiAnaW1nJyxcbiAgICAgICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgICAgICdhbHQnOiAnJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnaS1hbXBodG1sLXN0b3J5LWF0dHJpYnV0aW9uLWxvZ28nLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRhZzogJ2RpdicsXG4gICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgJ2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1hdHRyaWJ1dGlvbi10ZXh0JyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0YWc6ICdkaXYnLFxuICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAnY2xhc3MnOiAnaS1hbXBodG1sLXN0b3J5LWhhcy1uZXctcGFnZS1ub3RpZmljYXRpb24tY29udGFpbmVyJyxcbiAgICAgIH0pLFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAge1xuICAgICAgICAgIHRhZzogJ2RpdicsXG4gICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgJ2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1oYXMtbmV3LXBhZ2UtdGV4dC13cmFwcGVyJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0YWc6ICdzcGFuJyxcbiAgICAgICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdpLWFtcGh0bWwtc3RvcnktaGFzLW5ldy1wYWdlLWNpcmNsZS1pY29uJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0YWc6ICdkaXYnLFxuICAgICAgICAgICAgICBhdHRyczogZGljdCh7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1oYXMtbmV3LXBhZ2UtdGV4dCcsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICBsb2NhbGl6ZWRTdHJpbmdJZDogTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX0hBU19ORVdfUEFHRV9URVhULFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRhZzogJ2RpdicsXG4gICAgICBhdHRyczogZGljdCh7J2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1zeXN0ZW0tbGF5ZXItYnV0dG9ucyd9KSxcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0YWc6ICdkaXYnLFxuICAgICAgICAgIGF0dHJzOiBkaWN0KHtcbiAgICAgICAgICAgICdyb2xlJzogJ2J1dHRvbicsXG4gICAgICAgICAgICAnY2xhc3MnOiBJTkZPX0NMQVNTICsgJyBpLWFtcGh0bWwtc3RvcnktYnV0dG9uJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBsb2NhbGl6ZWRMYWJlbElkOiBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfSU5GT19CVVRUT05fTEFCRUwsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0YWc6ICdkaXYnLFxuICAgICAgICAgIGF0dHJzOiBkaWN0KHtcbiAgICAgICAgICAgICdjbGFzcyc6ICdpLWFtcGh0bWwtc3Rvcnktc291bmQtZGlzcGxheScsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgICAgICdyb2xlJzogJ2FsZXJ0JyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnaS1hbXBodG1sLW1lc3NhZ2UtY29udGFpbmVyJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICAgICAgICAgIGF0dHJzOiBkaWN0KHtcbiAgICAgICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2ktYW1waHRtbC1zdG9yeS1tdXRlLXRleHQnLFxuICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICBsb2NhbGl6ZWRTdHJpbmdJZDpcbiAgICAgICAgICAgICAgICAgICAgTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX0FVRElPX01VVEVfQlVUVE9OX1RFWFQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0YWc6ICdkaXYnLFxuICAgICAgICAgICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgICAgICAgICAnY2xhc3MnOiAnaS1hbXBodG1sLXN0b3J5LXVubXV0ZS1zb3VuZC10ZXh0JyxcbiAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgbG9jYWxpemVkU3RyaW5nSWQ6XG4gICAgICAgICAgICAgICAgICAgIExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9BVURJT19VTk1VVEVfU09VTkRfVEVYVCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRhZzogJ2RpdicsXG4gICAgICAgICAgICAgICAgICBhdHRyczogZGljdCh7XG4gICAgICAgICAgICAgICAgICAgICdjbGFzcyc6ICdpLWFtcGh0bWwtc3RvcnktdW5tdXRlLW5vLXNvdW5kLXRleHQnLFxuICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICBsb2NhbGl6ZWRTdHJpbmdJZDpcbiAgICAgICAgICAgICAgICAgICAgTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX0FVRElPX1VOTVVURV9OT19TT1VORF9URVhULFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0YWc6ICdidXR0b24nLFxuICAgICAgICAgICAgICBhdHRyczogZGljdCh7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogVU5NVVRFX0NMQVNTICsgJyBpLWFtcGh0bWwtc3RvcnktYnV0dG9uJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIGxvY2FsaXplZExhYmVsSWQ6XG4gICAgICAgICAgICAgICAgTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX0FVRElPX1VOTVVURV9CVVRUT05fTEFCRUwsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0YWc6ICdidXR0b24nLFxuICAgICAgICAgICAgICBhdHRyczogZGljdCh7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogTVVURV9DTEFTUyArICcgaS1hbXBodG1sLXN0b3J5LWJ1dHRvbicsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICBsb2NhbGl6ZWRMYWJlbElkOlxuICAgICAgICAgICAgICAgIExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9BVURJT19NVVRFX0JVVFRPTl9MQUJFTCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRhZzogJ2RpdicsXG4gICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgJ2NsYXNzJzogJ2ktYW1waHRtbC1wYXVzZWQtZGlzcGxheScsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGFnOiAnYnV0dG9uJyxcbiAgICAgICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgICAgICdjbGFzcyc6IFBBVVNFX0NMQVNTICsgJyBpLWFtcGh0bWwtc3RvcnktYnV0dG9uJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIGxvY2FsaXplZExhYmVsSWQ6IExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9QQVVTRV9CVVRUT05fTEFCRUwsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0YWc6ICdidXR0b24nLFxuICAgICAgICAgICAgICBhdHRyczogZGljdCh7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogUExBWV9DTEFTUyArICcgaS1hbXBodG1sLXN0b3J5LWJ1dHRvbicsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICBsb2NhbGl6ZWRMYWJlbElkOiBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfUExBWV9CVVRUT05fTEFCRUwsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0YWc6ICdidXR0b24nLFxuICAgICAgICAgIGF0dHJzOiBkaWN0KHtcbiAgICAgICAgICAgICdjbGFzcyc6XG4gICAgICAgICAgICAgIFNLSVBfVE9fTkVYVF9DTEFTUyArXG4gICAgICAgICAgICAgICcgaS1hbXBodG1sLXN0b3J5LXVpLWhpZGUtYnV0dG9uIGktYW1waHRtbC1zdG9yeS1idXR0b24nLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGxvY2FsaXplZExhYmVsSWQ6XG4gICAgICAgICAgICBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfU0tJUF9UT19ORVhUX0JVVFRPTl9MQUJFTCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRhZzogJ2J1dHRvbicsXG4gICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgJ2NsYXNzJzogU0hBUkVfQ0xBU1MgKyAnIGktYW1waHRtbC1zdG9yeS1idXR0b24nLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGxvY2FsaXplZExhYmVsSWQ6IExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9TSEFSRV9CVVRUT05fTEFCRUwsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0YWc6ICdidXR0b24nLFxuICAgICAgICAgIGF0dHJzOiBkaWN0KHtcbiAgICAgICAgICAgICdjbGFzcyc6IFNJREVCQVJfQ0xBU1MgKyAnIGktYW1waHRtbC1zdG9yeS1idXR0b24nLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGxvY2FsaXplZExhYmVsSWQ6IExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9TSURFQkFSX0JVVFRPTl9MQUJFTCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRhZzogJ2J1dHRvbicsXG4gICAgICAgICAgYXR0cnM6IGRpY3Qoe1xuICAgICAgICAgICAgJ2NsYXNzJzpcbiAgICAgICAgICAgICAgQ0xPU0VfQ0xBU1MgK1xuICAgICAgICAgICAgICAnIGktYW1waHRtbC1zdG9yeS11aS1oaWRlLWJ1dHRvbiBpLWFtcGh0bWwtc3RvcnktYnV0dG9uJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBsb2NhbGl6ZWRMYWJlbElkOiBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfQ0xPU0VfQlVUVE9OX0xBQkVMLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRhZzogJ2RpdicsXG4gICAgICBhdHRyczogZGljdCh7XG4gICAgICAgICdjbGFzcyc6ICdpLWFtcGh0bWwtc3Rvcnktc3lzdGVtLWxheWVyLWJ1dHRvbnMtc3RhcnQtcG9zaXRpb24nLFxuICAgICAgfSksXG4gICAgfSxcbiAgXSxcbn07XG5cbi8qKlxuICogQ29udGFpbnMgdGhlIGV2ZW50IG5hbWUgYmVsb25naW5nIHRvIHRoZSB2aWV3ZXIgY29udHJvbC5cbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5jb25zdCBWSUVXRVJfQ09OVFJPTF9FVkVOVF9OQU1FID0gJ19fQU1QX1ZJRVdFUl9DT05UUk9MX0VWRU5UX05BTUVfXyc7XG5cbi8qKiBAZW51bSB7c3RyaW5nfSAqL1xuY29uc3QgVklFV0VSX0NPTlRST0xfVFlQRVMgPSB7XG4gIENMT1NFOiAnY2xvc2UnLFxuICBTSEFSRTogJ3NoYXJlJyxcbiAgREVQUkVDQVRFRF9TS0lQX05FWFQ6ICdza2lwLW5leHQnLCAvLyBEZXByZWNhdGVkIGluIGZhdm9yIG9mIFNLSVBfVE9fTkVYVC5cbiAgU0tJUF9UT19ORVhUOiAnc2tpcC10by1uZXh0Jyxcbn07XG5cbmNvbnN0IFZJRVdFUl9DT05UUk9MX0RFRkFVTFRTID0ge1xuICBbVklFV0VSX0NPTlRST0xfVFlQRVMuU0hBUkVdOiB7XG4gICAgJ3NlbGVjdG9yJzogYC4ke1NIQVJFX0NMQVNTfWAsXG4gIH0sXG4gIFtWSUVXRVJfQ09OVFJPTF9UWVBFUy5DTE9TRV06IHtcbiAgICAnc2VsZWN0b3InOiBgLiR7Q0xPU0VfQ0xBU1N9YCxcbiAgfSxcbiAgW1ZJRVdFUl9DT05UUk9MX1RZUEVTLkRFUFJFQ0FURURfU0tJUF9ORVhUXToge1xuICAgICdzZWxlY3Rvcic6IGAuJHtTS0lQX1RPX05FWFRfQ0xBU1N9YCxcbiAgfSxcbiAgW1ZJRVdFUl9DT05UUk9MX1RZUEVTLlNLSVBfVE9fTkVYVF06IHtcbiAgICAnc2VsZWN0b3InOiBgLiR7U0tJUF9UT19ORVhUX0NMQVNTfWAsXG4gIH0sXG59O1xuXG4vKipcbiAqIFN5c3RlbSBMYXllciAoaS5lLiBVSSBDaHJvbWUpIGZvciA8YW1wLXN0b3J5Pi5cbiAqIENocm9tZSBjb250YWluczpcbiAqICAgLSBtdXRlL3VubXV0ZSBidXR0b25cbiAqICAgLSBzdG9yeSBwcm9ncmVzcyBiYXJcbiAqICAgLSBzaGFyZSBidXR0b25cbiAqICAgLSBkb21haW4gaW5mbyBidXR0b25cbiAqICAgLSBzaWRlYmFyXG4gKiAgIC0gc3RvcnkgdXBkYXRlZCBsYWJlbCAoZm9yIGxpdmUgc3RvcmllcylcbiAqICAgLSBjbG9zZSAoZm9yIHBsYXllcnMpXG4gKiAgIC0gc2tpcCAoZm9yIHBsYXllcnMpXG4gKi9cbmV4cG9ydCBjbGFzcyBTeXN0ZW1MYXllciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBwYXJlbnRFbFxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCBwYXJlbnRFbCkge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFXaW5kb3d9ICovXG4gICAgdGhpcy53aW5fID0gd2luO1xuXG4gICAgLyoqIEBwcm90ZWN0ZWQgQGNvbnN0IHshRWxlbWVudH0gKi9cbiAgICB0aGlzLnBhcmVudEVsXyA9IHBhcmVudEVsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNCdWlsdF8gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFJvb3QgZWxlbWVudCBjb250YWluaW5nIGEgc2hhZG93IERPTSByb290LlxuICAgICAqIEBwcml2YXRlIHs/RWxlbWVudH1cbiAgICAgKi9cbiAgICB0aGlzLnJvb3RfID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEFjdHVhbCBzeXN0ZW0gbGF5ZXIuXG4gICAgICogQHByaXZhdGUgez9FbGVtZW50fVxuICAgICAqL1xuICAgIHRoaXMuc3lzdGVtTGF5ZXJFbF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLmJ1dHRvbnNDb250YWluZXJfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFQcm9ncmVzc0Jhcn0gKi9cbiAgICB0aGlzLnByb2dyZXNzQmFyXyA9IFByb2dyZXNzQmFyLmNyZWF0ZSh3aW4sIHRoaXMucGFyZW50RWxfKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IURldmVsb3BtZW50TW9kZUxvZ30gKi9cbiAgICB0aGlzLmRldmVsb3BlckxvZ18gPSBEZXZlbG9wbWVudE1vZGVMb2cuY3JlYXRlKHdpbik7XG5cbiAgICAvKiogQHByaXZhdGUgeyFEZXZlbG9wbWVudE1vZGVMb2dCdXR0b25TZXR9ICovXG4gICAgdGhpcy5kZXZlbG9wZXJCdXR0b25zXyA9IERldmVsb3BtZW50TW9kZUxvZ0J1dHRvblNldC5jcmVhdGUod2luKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IGdldFN0b3JlU2VydmljZSh0aGlzLndpbl8pO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3ZzeW5jLWltcGwuVnN5bmN9ICovXG4gICAgdGhpcy52c3luY18gPSBTZXJ2aWNlcy52c3luY0Zvcih0aGlzLndpbl8pO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3RpbWVyLWltcGwuVGltZXJ9ICovXG4gICAgdGhpcy50aW1lcl8gPSBTZXJ2aWNlcy50aW1lckZvcih0aGlzLndpbl8pO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/bnVtYmVyfD9zdHJpbmd9ICovXG4gICAgdGhpcy50aW1lb3V0SWRfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Py4uLy4uLy4uL3NyYy9zZXJ2aWNlL3ZpZXdlci1pbnRlcmZhY2UuVmlld2VySW50ZXJmYWNlfSAqL1xuICAgIHRoaXMudmlld2VyXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9BbXBTdG9yeVZpZXdlck1lc3NhZ2luZ0hhbmRsZXJ9ICovXG4gICAgdGhpcy52aWV3ZXJNZXNzYWdpbmdIYW5kbGVyXyA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IUVsZW1lbnR9XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpbml0aWFsUGFnZUlkXG4gICAqL1xuICBidWlsZChpbml0aWFsUGFnZUlkKSB7XG4gICAgaWYgKHRoaXMuaXNCdWlsdF8pIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKTtcbiAgICB9XG5cbiAgICB0aGlzLmlzQnVpbHRfID0gdHJ1ZTtcblxuICAgIHRoaXMucm9vdF8gPSB0aGlzLndpbl8uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5yb290Xy5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3lzdGVtLWxheWVyLWhvc3QnKTtcbiAgICB0aGlzLnN5c3RlbUxheWVyRWxfID0gcmVuZGVyQXNFbGVtZW50KHRoaXMud2luXy5kb2N1bWVudCwgVEVNUExBVEUpO1xuICAgIC8vIE1ha2UgdGhlIHNoYXJlIGJ1dHRvbiBsaW5rIHRvIHRoZSBjdXJyZW50IGRvY3VtZW50IHRvIG1ha2Ugc3VyZVxuICAgIC8vIGVtYmVkZGVkIFNUQU1QcyBhbHdheXMgaGF2ZSBhIGJhY2stbGluayB0byB0aGVtc2VsdmVzLCBhbmQgdG8gbWFrZVxuICAgIC8vIGdlc3R1cmVzIGxpa2UgcmlnaHQtY2xpY2tzIHdvcmsuXG4gICAgdGhpcy5zeXN0ZW1MYXllckVsXy5xdWVyeVNlbGVjdG9yKCcuaS1hbXBodG1sLXN0b3J5LXNoYXJlLWNvbnRyb2wnKS5ocmVmID1cbiAgICAgIFNlcnZpY2VzLmRvY3VtZW50SW5mb0ZvckRvYyh0aGlzLnBhcmVudEVsXykuY2Fub25pY2FsVXJsO1xuXG4gICAgY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZSh0aGlzLnJvb3RfLCB0aGlzLnN5c3RlbUxheWVyRWxfLCBDU1MpO1xuXG4gICAgdGhpcy5zeXN0ZW1MYXllckVsXy5pbnNlcnRCZWZvcmUoXG4gICAgICB0aGlzLnByb2dyZXNzQmFyXy5idWlsZChpbml0aWFsUGFnZUlkKSxcbiAgICAgIHRoaXMuc3lzdGVtTGF5ZXJFbF8uZmlyc3RDaGlsZFxuICAgICk7XG5cbiAgICB0aGlzLmJ1dHRvbnNDb250YWluZXJfID0gdGhpcy5zeXN0ZW1MYXllckVsXy5xdWVyeVNlbGVjdG9yKFxuICAgICAgJy5pLWFtcGh0bWwtc3Rvcnktc3lzdGVtLWxheWVyLWJ1dHRvbnMnXG4gICAgKTtcblxuICAgIHRoaXMuYnVpbGRGb3JEZXZlbG9wbWVudE1vZGVfKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVMaXN0ZW5lcnNfKCk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5DQU5fU0hPV19TWVNURU1fTEFZRVJfQlVUVE9OUyxcbiAgICAgIChjYW5TaG93QnV0dG9ucykgPT4ge1xuICAgICAgICB0aGlzLnN5c3RlbUxheWVyRWxfLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAgICAgJ2ktYW1waHRtbC1zdG9yeS11aS1uby1idXR0b25zJyxcbiAgICAgICAgICAhY2FuU2hvd0J1dHRvbnNcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICB0cnVlIC8qIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgaWYgKFNlcnZpY2VzLnBsYXRmb3JtRm9yKHRoaXMud2luXykuaXNJb3MoKSkge1xuICAgICAgdGhpcy5zeXN0ZW1MYXllckVsXy5zZXRBdHRyaWJ1dGUoJ2lvcycsICcnKTtcbiAgICB9XG5cbiAgICB0aGlzLnZpZXdlcl8gPSBTZXJ2aWNlcy52aWV3ZXJGb3JEb2ModGhpcy53aW5fLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7XG4gICAgdGhpcy52aWV3ZXJNZXNzYWdpbmdIYW5kbGVyXyA9IHRoaXMudmlld2VyXy5pc0VtYmVkZGVkKClcbiAgICAgID8gbmV3IEFtcFN0b3J5Vmlld2VyTWVzc2FnaW5nSGFuZGxlcih0aGlzLndpbl8sIHRoaXMudmlld2VyXylcbiAgICAgIDogbnVsbDtcblxuICAgIGlmIChzaG91bGRTaG93U3RvcnlVcmxJbmZvKHRoaXMudmlld2VyXykpIHtcbiAgICAgIHRoaXMuc3lzdGVtTGF5ZXJFbF8uY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWVtYmVkZGVkJyk7XG4gICAgICB0aGlzLmdldFNoYWRvd1Jvb3QoKS5zZXRBdHRyaWJ1dGUoSEFTX0lORk9fQlVUVE9OX0FUVFJJQlVURSwgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdldFNoYWRvd1Jvb3QoKS5yZW1vdmVBdHRyaWJ1dGUoSEFTX0lORk9fQlVUVE9OX0FUVFJJQlVURSk7XG4gICAgfVxuXG4gICAgdGhpcy5tYXliZUJ1aWxkQXR0cmlidXRpb25fKCk7XG5cbiAgICB0aGlzLmdldFNoYWRvd1Jvb3QoKS5zZXRBdHRyaWJ1dGUoTUVTU0FHRV9ESVNQTEFZX0NMQVNTLCAnbm9zaG93Jyk7XG4gICAgdGhpcy5nZXRTaGFkb3dSb290KCkuc2V0QXR0cmlidXRlKEhBU19ORVdfUEFHRV9BVFRSSUJVVEUsICdub3Nob3cnKTtcbiAgICByZXR1cm4gdGhpcy5nZXRSb290KCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgbWF5YmVCdWlsZEF0dHJpYnV0aW9uXygpIHtcbiAgICBpZiAoIXRoaXMudmlld2VyXyB8fCB0aGlzLnZpZXdlcl8uZ2V0UGFyYW0oJ2F0dHJpYnV0aW9uJykgIT09ICdhdXRvJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc3lzdGVtTGF5ZXJFbF8ucXVlcnlTZWxlY3RvcignLmktYW1waHRtbC1zdG9yeS1hdHRyaWJ1dGlvbi1sb2dvJykuc3JjID1cbiAgICAgIGdldFN0b3J5QXR0cmlidXRlU3JjKHRoaXMucGFyZW50RWxfLCAnZW50aXR5LWxvZ28tc3JjJykgfHxcbiAgICAgIGdldFN0b3J5QXR0cmlidXRlU3JjKHRoaXMucGFyZW50RWxfLCAncHVibGlzaGVyLWxvZ28tc3JjJyk7XG5cbiAgICBjb25zdCBhbmNob3JFbCA9IHRoaXMuc3lzdGVtTGF5ZXJFbF8ucXVlcnlTZWxlY3RvcihcbiAgICAgIGAuJHtlc2NhcGVDc3NTZWxlY3RvcklkZW50KEFUVFJJQlVUSU9OX0NMQVNTKX1gXG4gICAgKTtcblxuICAgIGFuY2hvckVsLmhyZWYgPVxuICAgICAgZ2V0U3RvcnlBdHRyaWJ1dGVTcmModGhpcy5wYXJlbnRFbF8sICdlbnRpdHktdXJsJykgfHxcbiAgICAgIGdldFNvdXJjZU9yaWdpbihTZXJ2aWNlcy5kb2N1bWVudEluZm9Gb3JEb2ModGhpcy5wYXJlbnRFbF8pLnNvdXJjZVVybCk7XG5cbiAgICB0aGlzLnN5c3RlbUxheWVyRWxfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC1zdG9yeS1hdHRyaWJ1dGlvbi10ZXh0J1xuICAgICkudGV4dENvbnRlbnQgPVxuICAgICAgdGhpcy5wYXJlbnRFbF8uZ2V0QXR0cmlidXRlKCdlbnRpdHknKSB8fFxuICAgICAgdGhpcy5wYXJlbnRFbF8uZ2V0QXR0cmlidXRlKCdwdWJsaXNoZXInKTtcblxuICAgIGFuY2hvckVsLmNsYXNzTGlzdC5hZGQoJ2ktYW1waHRtbC1zdG9yeS1hdHRyaWJ1dGlvbi12aXNpYmxlJyk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGJ1aWxkRm9yRGV2ZWxvcG1lbnRNb2RlXygpIHtcbiAgICBpZiAoIWdldE1vZGUoKS5kZXZlbG9wbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnV0dG9uc0NvbnRhaW5lcl8uYXBwZW5kQ2hpbGQoXG4gICAgICB0aGlzLmRldmVsb3BlckJ1dHRvbnNfLmJ1aWxkKFxuICAgICAgICB0aGlzLmRldmVsb3BlckxvZ18udG9nZ2xlLmJpbmQodGhpcy5kZXZlbG9wZXJMb2dfKVxuICAgICAgKVxuICAgICk7XG4gICAgdGhpcy5nZXRTaGFkb3dSb290KCkuYXBwZW5kQ2hpbGQodGhpcy5kZXZlbG9wZXJMb2dfLmJ1aWxkKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplTGlzdGVuZXJzXygpIHtcbiAgICAvLyBUT0RPKGFsYW5vcm96Y28pOiBMaXN0ZW4gdG8gdGFwIGV2ZW50IHByb3Blcmx5IChpLmUuIGZhc3RjbGljaylcbiAgICB0aGlzLmdldFNoYWRvd1Jvb3QoKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZGV2KCkuYXNzZXJ0RWxlbWVudChldmVudC50YXJnZXQpO1xuXG4gICAgICBpZiAobWF0Y2hlcyh0YXJnZXQsIGAuJHtNVVRFX0NMQVNTfSwgLiR7TVVURV9DTEFTU30gKmApKSB7XG4gICAgICAgIHRoaXMub25BdWRpb0ljb25DbGlja18odHJ1ZSk7XG4gICAgICB9IGVsc2UgaWYgKG1hdGNoZXModGFyZ2V0LCBgLiR7VU5NVVRFX0NMQVNTfSwgLiR7VU5NVVRFX0NMQVNTfSAqYCkpIHtcbiAgICAgICAgdGhpcy5vbkF1ZGlvSWNvbkNsaWNrXyhmYWxzZSk7XG4gICAgICB9IGVsc2UgaWYgKG1hdGNoZXModGFyZ2V0LCBgLiR7UEFVU0VfQ0xBU1N9LCAuJHtQQVVTRV9DTEFTU30gKmApKSB7XG4gICAgICAgIHRoaXMub25QYXVzZWRDbGlja18odHJ1ZSk7XG4gICAgICB9IGVsc2UgaWYgKG1hdGNoZXModGFyZ2V0LCBgLiR7UExBWV9DTEFTU30sIC4ke1BMQVlfQ0xBU1N9ICpgKSkge1xuICAgICAgICB0aGlzLm9uUGF1c2VkQ2xpY2tfKGZhbHNlKTtcbiAgICAgIH0gZWxzZSBpZiAobWF0Y2hlcyh0YXJnZXQsIGAuJHtTSEFSRV9DTEFTU30sIC4ke1NIQVJFX0NMQVNTfSAqYCkpIHtcbiAgICAgICAgdGhpcy5vblNoYXJlQ2xpY2tfKGV2ZW50KTtcbiAgICAgIH0gZWxzZSBpZiAobWF0Y2hlcyh0YXJnZXQsIGAuJHtJTkZPX0NMQVNTfSwgLiR7SU5GT19DTEFTU30gKmApKSB7XG4gICAgICAgIHRoaXMub25JbmZvQ2xpY2tfKCk7XG4gICAgICB9IGVsc2UgaWYgKG1hdGNoZXModGFyZ2V0LCBgLiR7U0lERUJBUl9DTEFTU30sIC4ke1NJREVCQVJfQ0xBU1N9ICpgKSkge1xuICAgICAgICB0aGlzLm9uU2lkZWJhckNsaWNrXygpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgbWF0Y2hlcyhcbiAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgYC4ke1ZJRVdFUl9DVVNUT01fQ09OVFJPTF9DTEFTU30sIC4ke1ZJRVdFUl9DVVNUT01fQ09OVFJPTF9DTEFTU30gKmBcbiAgICAgICAgKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMub25WaWV3ZXJDb250cm9sQ2xpY2tfKGRldigpLmFzc2VydEVsZW1lbnQoZXZlbnQudGFyZ2V0KSk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBtYXRjaGVzKHRhcmdldCwgYC4ke0FUVFJJQlVUSU9OX0NMQVNTfSwgLiR7QVRUUklCVVRJT05fQ0xBU1N9ICpgKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGFuY2hvckNsaWNrZWQgPSBjbG9zZXN0KHRhcmdldCwgKGUpID0+IG1hdGNoZXMoZSwgJ2FbaHJlZl0nKSk7XG4gICAgICAgIHRyaWdnZXJDbGlja0Zyb21MaWdodERvbShhbmNob3JDbGlja2VkLCB0aGlzLnBhcmVudEVsXyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFN0YXRlUHJvcGVydHkuQURfU1RBVEUsIChpc0FkKSA9PiB7XG4gICAgICB0aGlzLm9uQWRTdGF0ZVVwZGF0ZV8oaXNBZCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5DQU5fU0hPV19BVURJT19VSSxcbiAgICAgIChzaG93KSA9PiB7XG4gICAgICAgIHRoaXMub25DYW5TaG93QXVkaW9VaVVwZGF0ZV8oc2hvdyk7XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogY2FsbFRvSW5pdGlhbGl6ZSAqL1xuICAgICk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5DQU5fU0hPV19TSEFSSU5HX1VJUyxcbiAgICAgIChzaG93KSA9PiB7XG4gICAgICAgIHRoaXMub25DYW5TaG93U2hhcmluZ1Vpc1VwZGF0ZV8oc2hvdyk7XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogY2FsbFRvSW5pdGlhbGl6ZSAqL1xuICAgICk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5TVE9SWV9IQVNfQVVESU9fU1RBVEUsXG4gICAgICAoaGFzQXVkaW8pID0+IHtcbiAgICAgICAgdGhpcy5vblN0b3J5SGFzQXVkaW9TdGF0ZVVwZGF0ZV8oaGFzQXVkaW8pO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuU1RPUllfSEFTX1BMQVlCQUNLX1VJX1NUQVRFLFxuICAgICAgKGhhc1BsYXliYWNrVWkpID0+IHtcbiAgICAgICAgdGhpcy5vblN0b3J5SGFzUGxheWJhY2tVaVN0YXRlVXBkYXRlXyhoYXNQbGF5YmFja1VpKTtcbiAgICAgIH0sXG4gICAgICB0cnVlIC8qKiBjYWxsVG9Jbml0aWFsaXplICovXG4gICAgKTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5Lk1VVEVEX1NUQVRFLFxuICAgICAgKGlzTXV0ZWQpID0+IHtcbiAgICAgICAgdGhpcy5vbk11dGVkU3RhdGVVcGRhdGVfKGlzTXV0ZWQpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuVUlfU1RBVEUsXG4gICAgICAodWlTdGF0ZSkgPT4ge1xuICAgICAgICB0aGlzLm9uVUlTdGF0ZVVwZGF0ZV8odWlTdGF0ZSk7XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogY2FsbFRvSW5pdGlhbGl6ZSAqL1xuICAgICk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5QQVVTRURfU1RBVEUsXG4gICAgICAoaXNQYXVzZWQpID0+IHtcbiAgICAgICAgdGhpcy5vblBhdXNlZFN0YXRlVXBkYXRlXyhpc1BhdXNlZCk7XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogY2FsbFRvSW5pdGlhbGl6ZSAqL1xuICAgICk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5DVVJSRU5UX1BBR0VfSU5ERVgsXG4gICAgICAoaW5kZXgpID0+IHtcbiAgICAgICAgdGhpcy5vblBhZ2VJbmRleFVwZGF0ZV8oaW5kZXgpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuUlRMX1NUQVRFLFxuICAgICAgKHJ0bFN0YXRlKSA9PiB7XG4gICAgICAgIHRoaXMub25SdGxTdGF0ZVVwZGF0ZV8ocnRsU3RhdGUpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuS0VZQk9BUkRfQUNUSVZFX1NUQVRFLFxuICAgICAgKGtleWJvYXJkU3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy5vbktleWJvYXJkQWN0aXZlVXBkYXRlXyhrZXlib2FyZFN0YXRlKTtcbiAgICAgIH0sXG4gICAgICB0cnVlIC8qKiBjYWxsVG9Jbml0aWFsaXplICovXG4gICAgKTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LlBBR0VfSEFTX0FVRElPX1NUQVRFLFxuICAgICAgKGF1ZGlvKSA9PiB7XG4gICAgICAgIHRoaXMub25QYWdlSGFzQXVkaW9TdGF0ZVVwZGF0ZV8oYXVkaW8pO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuUEFHRV9IQVNfRUxFTUVOVFNfV0lUSF9QTEFZQkFDS19TVEFURSxcbiAgICAgIChoYXNQbGF5YmFja1VpKSA9PiB7XG4gICAgICAgIHRoaXMub25QYWdlSGFzRWxlbWVudHNXaXRoUGxheWJhY2tTdGF0ZVVwZGF0ZV8oaGFzUGxheWJhY2tVaSk7XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogY2FsbFRvSW5pdGlhbGl6ZSAqL1xuICAgICk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5IQVNfU0lERUJBUl9TVEFURSxcbiAgICAgIChoYXNTaWRlYmFyKSA9PiB7XG4gICAgICAgIHRoaXMub25IYXNTaWRlYmFyU3RhdGVVcGRhdGVfKGhhc1NpZGViYXIpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuU1lTVEVNX1VJX0lTX1ZJU0lCTEVfU1RBVEUsXG4gICAgICAoaXNWaXNpYmxlKSA9PiB7XG4gICAgICAgIHRoaXMub25TeXN0ZW1VaUlzVmlzaWJsZVN0YXRlVXBkYXRlXyhpc1Zpc2libGUpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFN0YXRlUHJvcGVydHkuTkVXX1BBR0VfQVZBSUxBQkxFX0lELCAoKSA9PiB7XG4gICAgICB0aGlzLm9uTmV3UGFnZUF2YWlsYWJsZV8oKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LlZJRVdFUl9DVVNUT01fQ09OVFJPTFMsXG4gICAgICAoY29uZmlnKSA9PiB0aGlzLm9uVmlld2VyQ3VzdG9tQ29udHJvbHNfKGNvbmZpZyksXG4gICAgICB0cnVlIC8qIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFFbGVtZW50fVxuICAgKi9cbiAgZ2V0Um9vdCgpIHtcbiAgICByZXR1cm4gZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLnJvb3RfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshRWxlbWVudH1cbiAgICovXG4gIGdldFNoYWRvd1Jvb3QoKSB7XG4gICAgcmV0dXJuIGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5zeXN0ZW1MYXllckVsXyk7XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIHRoZSBhZCBzdGF0ZSB1cGRhdGVzIGFuZCB1cGRhdGVzIHRoZSBVSSBhY2NvcmRpbmdseS5cbiAgICogQHBhcmFtIHtib29sZWFufSBpc0FkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkFkU3RhdGVVcGRhdGVfKGlzQWQpIHtcbiAgICAvLyBUaGlzIGlzIG5vdCBpbiB2c3luYyBhcyB3ZSBhcmUgc2hvd2luZy9oaWRpbmcgaXRlbXMgaW4gdGhlIHN5c3RlbSBsYXllclxuICAgIC8vIGJhc2VkIHVwb24gdGhpcyBhdHRyaWJ1dGUsIGFuZCB3aGVuIHdyYXBwZWQgaW4gdnN5bmMgdGhlcmUgaXMgYSB2aXN1YWxcbiAgICAvLyBsYWcgYWZ0ZXIgdGhlIHBhZ2UgY2hhbmdlIGJlZm9yZSB0aGUgaWNvbnMgYXJlIHVwZGF0ZWQuXG4gICAgaXNBZFxuICAgICAgPyB0aGlzLmdldFNoYWRvd1Jvb3QoKS5zZXRBdHRyaWJ1dGUoQURfU0hPV0lOR19BVFRSSUJVVEUsICcnKVxuICAgICAgOiB0aGlzLmdldFNoYWRvd1Jvb3QoKS5yZW1vdmVBdHRyaWJ1dGUoQURfU0hPV0lOR19BVFRSSUJVVEUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc3RvcnkgaGFzIGEgc2lkZWJhciBpbiBvcmRlciB0byBkaXNwbGF5IHRoZSBpY29uIHJlcHJlc2VudGluZ1xuICAgKiB0aGUgb3BlbmluZyBvZiB0aGUgc2lkZWJhci5cbiAgICogQHBhcmFtIHtib29sZWFufSBoYXNTaWRlYmFyXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkhhc1NpZGViYXJTdGF0ZVVwZGF0ZV8oaGFzU2lkZWJhcikge1xuICAgIGlmIChoYXNTaWRlYmFyKSB7XG4gICAgICB0aGlzLmdldFNoYWRvd1Jvb3QoKS5zZXRBdHRyaWJ1dGUoSEFTX1NJREVCQVJfQVRUUklCVVRFLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2V0U2hhZG93Um9vdCgpLnJlbW92ZUF0dHJpYnV0ZShIQVNfU0lERUJBUl9BVFRSSUJVVEUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gdXBkYXRlcyB0byB3aGV0aGVyIGF1ZGlvIFVJIG1heSBiZSBzaG93biwgYW5kIHVwZGF0ZXMgdGhlIFVJXG4gICAqIGFjY29yZGluZ2x5LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNhblNob3dBdWRpb1VpXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkNhblNob3dBdWRpb1VpVXBkYXRlXyhjYW5TaG93QXVkaW9VaSkge1xuICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICB0aGlzLmdldFNoYWRvd1Jvb3QoKS5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgICAnaS1hbXBodG1sLXN0b3J5LW5vLWF1ZGlvLXVpJyxcbiAgICAgICAgIWNhblNob3dBdWRpb1VpXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byB1cGRhdGVzIHRvIHdoZXRoZXIgc2hhcmluZyBVSXMgbWF5IGJlIHNob3duLCBhbmQgdXBkYXRlcyB0aGUgVUlcbiAgICogYWNjb3JkaW5nbHkuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gY2FuU2hvd1NoYXJpbmdVaXNcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uQ2FuU2hvd1NoYXJpbmdVaXNVcGRhdGVfKGNhblNob3dTaGFyaW5nVWlzKSB7XG4gICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgIHRoaXMuZ2V0U2hhZG93Um9vdCgpLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAgICdpLWFtcGh0bWwtc3Rvcnktbm8tc2hhcmluZycsXG4gICAgICAgICFjYW5TaG93U2hhcmluZ1Vpc1xuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gaGFzIGF1ZGlvIHN0YXRlIHVwZGF0ZXMsIGRldGVybWluaW5nIGlmIHRoZSBzdG9yeSBoYXMgYSBnbG9iYWxcbiAgICogYXVkaW8gdHJhY2sgcGxheWluZywgb3IgaWYgYW55IHBhZ2UgaGFzIGF1ZGlvLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhhc0F1ZGlvXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblN0b3J5SGFzQXVkaW9TdGF0ZVVwZGF0ZV8oaGFzQXVkaW8pIHtcbiAgICB0aGlzLnZzeW5jXy5tdXRhdGUoKCkgPT4ge1xuICAgICAgdGhpcy5nZXRTaGFkb3dSb290KCkuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICAgJ2ktYW1waHRtbC1zdG9yeS1oYXMtYXVkaW8nLFxuICAgICAgICBoYXNBdWRpb1xuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gc3RvcnkgaGF2aW5nIGVsZW1lbnRzIHdpdGggcGxheWJhY2suXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGFzUGxheWJhY2tVaVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25TdG9yeUhhc1BsYXliYWNrVWlTdGF0ZVVwZGF0ZV8oaGFzUGxheWJhY2tVaSkge1xuICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICB0aGlzLmdldFNoYWRvd1Jvb3QoKS5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgICAnaS1hbXBodG1sLXN0b3J5LWhhcy1wbGF5YmFjay11aScsXG4gICAgICAgIGhhc1BsYXliYWNrVWlcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIHRoZSBwcmVzZW5jZSBvZiBhdWRpbyBvbiBhIHBhZ2UgdG8gZGV0ZXJtaW5lIHdoaWNoIGF1ZGlvIG1lc3NhZ2VzXG4gICAqIHRvIGRpc3BsYXkuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcGFnZUhhc0F1ZGlvXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblBhZ2VIYXNBdWRpb1N0YXRlVXBkYXRlXyhwYWdlSGFzQXVkaW8pIHtcbiAgICBwYWdlSGFzQXVkaW8gPVxuICAgICAgcGFnZUhhc0F1ZGlvIHx8XG4gICAgICAhIXRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5TVE9SWV9IQVNfQkFDS0dST1VORF9BVURJT19TVEFURSk7XG4gICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgIHBhZ2VIYXNBdWRpb1xuICAgICAgICA/IHRoaXMuZ2V0U2hhZG93Um9vdCgpLnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAgIENVUlJFTlRfUEFHRV9IQVNfQVVESU9fQVRUUklCVVRFLFxuICAgICAgICAgICAgJydcbiAgICAgICAgICApXG4gICAgICAgIDogdGhpcy5nZXRTaGFkb3dSb290KCkucmVtb3ZlQXR0cmlidXRlKFxuICAgICAgICAgICAgQ1VSUkVOVF9QQUdFX0hBU19BVURJT19BVFRSSUJVVEVcbiAgICAgICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byB0aGUgcHJlc2VuY2Ugb2YgZWxlbWVudHMgd2l0aCBwbGF5YmFjayBvbiB0aGUgcGFnZS5cbiAgICogQHBhcmFtIHtib29sZWFufSBwYWdlSGFzRWxlbWVudHNXaXRoUGxheWJhY2tcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uUGFnZUhhc0VsZW1lbnRzV2l0aFBsYXliYWNrU3RhdGVVcGRhdGVfKHBhZ2VIYXNFbGVtZW50c1dpdGhQbGF5YmFjaykge1xuICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICB0b0FycmF5KFxuICAgICAgICB0aGlzLmdldFNoYWRvd1Jvb3QoKS5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICcuaS1hbXBodG1sLXBhdXNlZC1kaXNwbGF5IGJ1dHRvbidcbiAgICAgICAgKVxuICAgICAgKS5mb3JFYWNoKChidXR0b24pID0+IHtcbiAgICAgICAgYnV0dG9uLmRpc2FibGVkID0gIXBhZ2VIYXNFbGVtZW50c1dpdGhQbGF5YmFjaztcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBtdXRlZCBzdGF0ZSB1cGRhdGVzLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzTXV0ZWRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uTXV0ZWRTdGF0ZVVwZGF0ZV8oaXNNdXRlZCkge1xuICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICBpc011dGVkXG4gICAgICAgID8gdGhpcy5nZXRTaGFkb3dSb290KCkuc2V0QXR0cmlidXRlKEFVRElPX01VVEVEX0FUVFJJQlVURSwgJycpXG4gICAgICAgIDogdGhpcy5nZXRTaGFkb3dSb290KCkucmVtb3ZlQXR0cmlidXRlKEFVRElPX01VVEVEX0FUVFJJQlVURSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIHBhdXNlZCBzdGF0ZSB1cGRhdGVzLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzUGF1c2VkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblBhdXNlZFN0YXRlVXBkYXRlXyhpc1BhdXNlZCkge1xuICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICBpc1BhdXNlZFxuICAgICAgICA/IHRoaXMuZ2V0U2hhZG93Um9vdCgpLnNldEF0dHJpYnV0ZShQQVVTRURfQVRUUklCVVRFLCAnJylcbiAgICAgICAgOiB0aGlzLmdldFNoYWRvd1Jvb3QoKS5yZW1vdmVBdHRyaWJ1dGUoUEFVU0VEX0FUVFJJQlVURSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGlkZXMgbWVzc2FnZSBhZnRlciBlbGFwc2VkIHRpbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoaWRlTWVzc2FnZUFmdGVyVGltZW91dF8obWVzc2FnZSkge1xuICAgIGlmICh0aGlzLnRpbWVvdXRJZF8pIHtcbiAgICAgIHRoaXMudGltZXJfLmNhbmNlbCh0aGlzLnRpbWVvdXRJZF8pO1xuICAgIH1cbiAgICB0aGlzLnRpbWVvdXRJZF8gPSB0aGlzLnRpbWVyXy5kZWxheShcbiAgICAgICgpID0+IHRoaXMuaGlkZU1lc3NhZ2VJbnRlcm5hbF8obWVzc2FnZSksXG4gICAgICBISURFX01FU1NBR0VfVElNRU9VVF9NU1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogSGlkZXMgbWVzc2FnZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhpZGVNZXNzYWdlSW50ZXJuYWxfKG1lc3NhZ2UpIHtcbiAgICBpZiAoIXRoaXMuaXNCdWlsdF8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgIHRoaXMuZ2V0U2hhZG93Um9vdCgpLnNldEF0dHJpYnV0ZShtZXNzYWdlLCAnbm9zaG93Jyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIFVJIHN0YXRlIHVwZGF0ZXMgYW5kIHRyaWdnZXJzIHRoZSBleHBlY3RlZCBVSS5cbiAgICogQHBhcmFtIHshVUlUeXBlfSB1aVN0YXRlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblVJU3RhdGVVcGRhdGVfKHVpU3RhdGUpIHtcbiAgICB0aGlzLnZzeW5jXy5tdXRhdGUoKCkgPT4ge1xuICAgICAgY29uc3Qgc2hhZG93Um9vdCA9IHRoaXMuZ2V0U2hhZG93Um9vdCgpO1xuXG4gICAgICBzaGFkb3dSb290LmNsYXNzTGlzdC5yZW1vdmUoJ2ktYW1waHRtbC1zdG9yeS1kZXNrdG9wLWZ1bGxibGVlZCcpO1xuICAgICAgc2hhZG93Um9vdC5jbGFzc0xpc3QucmVtb3ZlKCdpLWFtcGh0bWwtc3RvcnktZGVza3RvcC1wYW5lbHMnKTtcbiAgICAgIHNoYWRvd1Jvb3QuY2xhc3NMaXN0LnJlbW92ZSgnaS1hbXBodG1sLXN0b3J5LWRlc2t0b3Atb25lLXBhbmVsJyk7XG4gICAgICBzaGFkb3dSb290LnJlbW92ZUF0dHJpYnV0ZSgnZGVza3RvcCcpO1xuXG4gICAgICBzd2l0Y2ggKHVpU3RhdGUpIHtcbiAgICAgICAgY2FzZSBVSVR5cGUuREVTS1RPUF9QQU5FTFM6XG4gICAgICAgICAgc2hhZG93Um9vdC5zZXRBdHRyaWJ1dGUoJ2Rlc2t0b3AnLCAnJyk7XG4gICAgICAgICAgc2hhZG93Um9vdC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktZGVza3RvcC1wYW5lbHMnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBVSVR5cGUuREVTS1RPUF9GVUxMQkxFRUQ6XG4gICAgICAgICAgc2hhZG93Um9vdC5zZXRBdHRyaWJ1dGUoJ2Rlc2t0b3AnLCAnJyk7XG4gICAgICAgICAgc2hhZG93Um9vdC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktZGVza3RvcC1mdWxsYmxlZWQnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBVSVR5cGUuREVTS1RPUF9PTkVfUEFORUw6XG4gICAgICAgICAgc2hhZG93Um9vdC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktZGVza3RvcC1vbmUtcGFuZWwnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gc3lzdGVtIFVJIHZpc2liaWxpdHkgc3RhdGUgdXBkYXRlcy5cbiAgICogQHBhcmFtIHtib29sZWFufSBpc1Zpc2libGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uU3lzdGVtVWlJc1Zpc2libGVTdGF0ZVVwZGF0ZV8oaXNWaXNpYmxlKSB7XG4gICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgIHRoaXMuZ2V0U2hhZG93Um9vdCgpLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICAgICdpLWFtcGh0bWwtc3RvcnktaGlkZGVuJyxcbiAgICAgICAgIWlzVmlzaWJsZVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gdGhlIGFjdGl2ZSBwYWdlIGluZGV4IGNoYW5naW5nLlxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcbiAgICovXG4gIG9uUGFnZUluZGV4VXBkYXRlXyhpbmRleCkge1xuICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICBjb25zdCBsYXN0SW5kZXggPVxuICAgICAgICB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuUEFHRV9JRFMpLmxlbmd0aCAtIDE7XG4gICAgICB0aGlzLmdldFNoYWRvd1Jvb3QoKS5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgICAnaS1hbXBodG1sLWZpcnN0LXBhZ2UtYWN0aXZlJyxcbiAgICAgICAgaW5kZXggPT09IDBcbiAgICAgICk7XG4gICAgICB0aGlzLmdldFNoYWRvd1Jvb3QoKS5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgICAnaS1hbXBodG1sLWxhc3QtcGFnZS1hY3RpdmUnLFxuICAgICAgICBpbmRleCA9PT0gbGFzdEluZGV4XG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBSVEwgc3RhdGUgdXBkYXRlcyBhbmQgdHJpZ2dlcnMgdGhlIFVJIGZvciBSVEwuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcnRsU3RhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uUnRsU3RhdGVVcGRhdGVfKHJ0bFN0YXRlKSB7XG4gICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgIHJ0bFN0YXRlXG4gICAgICAgID8gdGhpcy5nZXRTaGFkb3dSb290KCkuc2V0QXR0cmlidXRlKCdkaXInLCAncnRsJylcbiAgICAgICAgOiB0aGlzLmdldFNoYWRvd1Jvb3QoKS5yZW1vdmVBdHRyaWJ1dGUoJ2RpcicpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBrZXlib2FyZCB1cGRhdGVzIGFuZCB1cGRhdGVzIHRoZSBVSS5cbiAgICogQHBhcmFtIHtib29sZWFufSBrZXlib2FyZEFjdGl2ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25LZXlib2FyZEFjdGl2ZVVwZGF0ZV8oa2V5Ym9hcmRBY3RpdmUpIHtcbiAgICB0aGlzLnZzeW5jXy5tdXRhdGUoKCkgPT4ge1xuICAgICAgdGhpcy5nZXRTaGFkb3dSb290KCkuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgICAgJ2FtcC1tb2RlLWtleWJvYXJkLWFjdGl2ZScsXG4gICAgICAgIGtleWJvYXJkQWN0aXZlXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgY2xpY2sgZXZlbnRzIG9uIHRoZSBtdXRlIGFuZCB1bm11dGUgYnV0dG9ucy5cbiAgICogQHBhcmFtIHtib29sZWFufSBtdXRlIFNwZWNpZmllcyBpZiB0aGUgYXVkaW8gaXMgYmVpbmcgbXV0ZWQgb3IgdW5tdXRlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uQXVkaW9JY29uQ2xpY2tfKG11dGUpIHtcbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9NVVRFRCwgbXV0ZSk7XG4gICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgIHRoaXMuZ2V0U2hhZG93Um9vdCgpLnNldEF0dHJpYnV0ZShNRVNTQUdFX0RJU1BMQVlfQ0xBU1MsICdzaG93Jyk7XG4gICAgICB0aGlzLmhpZGVNZXNzYWdlQWZ0ZXJUaW1lb3V0XyhNRVNTQUdFX0RJU1BMQVlfQ0xBU1MpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgY2xpY2sgZXZlbnRzIG9uIHRoZSBwYXVzZWQgYW5kIHBsYXkgYnV0dG9ucy5cbiAgICogQHBhcmFtIHtib29sZWFufSBwYXVzZWQgU3BlY2lmaWVzIGlmIHRoZSBzdG9yeSBpcyBiZWluZyBwYXVzZWQgb3Igbm90LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25QYXVzZWRDbGlja18ocGF1c2VkKSB7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfUEFVU0VELCBwYXVzZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgY2xpY2sgZXZlbnRzIG9uIHRoZSBzaGFyZSBidXR0b24gYW5kIHRvZ2dsZXMgdGhlIHNoYXJlIG1lbnUuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25TaGFyZUNsaWNrXyhldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKGV2ZW50LnRhcmdldFtWSUVXRVJfQ09OVFJPTF9FVkVOVF9OQU1FXSkge1xuICAgICAgdGhpcy5vblZpZXdlckNvbnRyb2xDbGlja18oZGV2KCkuYXNzZXJ0RWxlbWVudChldmVudC50YXJnZXQpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpc09wZW4gPSB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuU0hBUkVfTUVOVV9TVEFURSk7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfU0hBUkVfTUVOVSwgIWlzT3Blbik7XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgbWVzc2FnZSBiYWNrIHRvIHRoZSB2aWV3ZXIgd2l0aCB0aGUgY29ycmVzcG9uZGluZyBldmVudC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25WaWV3ZXJDb250cm9sQ2xpY2tfKGVsZW1lbnQpIHtcbiAgICBjb25zdCBldmVudE5hbWUgPSBlbGVtZW50W1ZJRVdFUl9DT05UUk9MX0VWRU5UX05BTUVdO1xuXG4gICAgdGhpcy52aWV3ZXJNZXNzYWdpbmdIYW5kbGVyXyAmJlxuICAgICAgdGhpcy52aWV3ZXJNZXNzYWdpbmdIYW5kbGVyXy5zZW5kKFxuICAgICAgICAnZG9jdW1lbnRTdGF0ZVVwZGF0ZScsXG4gICAgICAgIGRpY3Qoe1xuICAgICAgICAgICdzdGF0ZSc6IEFNUF9TVE9SWV9QTEFZRVJfRVZFTlQsXG4gICAgICAgICAgJ3ZhbHVlJzogZXZlbnROYW1lLFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGNsaWNrIGV2ZW50cyBvbiB0aGUgaW5mbyBidXR0b24gYW5kIHRvZ2dsZXMgdGhlIGluZm8gZGlhbG9nLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25JbmZvQ2xpY2tfKCkge1xuICAgIGNvbnN0IGlzT3BlbiA9IHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5JTkZPX0RJQUxPR19TVEFURSk7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5UT0dHTEVfSU5GT19ESUFMT0csICFpc09wZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgY2xpY2sgZXZlbnRzIG9uIHRoZSBzaWRlYmFyIGJ1dHRvbiBhbmQgdG9nZ2xlcyB0aGUgc2lkZWJhci5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uU2lkZWJhckNsaWNrXygpIHtcbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9TSURFQkFSLCB0cnVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93cyB0aGUgXCJzdG9yeSB1cGRhdGVkXCIgbGFiZWwgd2hlbiBhIG5ldyBwYWdlIHdhcyBhZGRlZCB0byB0aGUgc3RvcnkuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbk5ld1BhZ2VBdmFpbGFibGVfKCkge1xuICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICB0aGlzLmdldFNoYWRvd1Jvb3QoKS5zZXRBdHRyaWJ1dGUoSEFTX05FV19QQUdFX0FUVFJJQlVURSwgJ3Nob3cnKTtcbiAgICAgIHRoaXMuaGlkZU1lc3NhZ2VBZnRlclRpbWVvdXRfKEhBU19ORVdfUEFHRV9BVFRSSUJVVEUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBhIGN1c3RvbSBjb25maWd1cmF0aW9uIGNoYW5nZSBjb21pbmcgZnJvbSB0aGUgcGxheWVyIGxldmVsLlxuICAgKiBVcGRhdGVzIFVJIHRvIG1hdGNoIGNvbmZpZ3VyYXRpb24gZGVzY3JpYmVkIGJ5IHB1Ymxpc2hlci5cbiAgICogQHBhcmFtIHshQXJyYXk8IS4uLy4uLy4uL3NyYy9hbXAtc3RvcnktcGxheWVyL2FtcC1zdG9yeS1wbGF5ZXItaW1wbC5WaWV3ZXJDb250cm9sRGVmPn0gY29udHJvbHNcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uVmlld2VyQ3VzdG9tQ29udHJvbHNfKGNvbnRyb2xzKSB7XG4gICAgaWYgKGNvbnRyb2xzLmxlbmd0aCA8PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29udHJvbHMuZm9yRWFjaCgoY29udHJvbCkgPT4ge1xuICAgICAgaWYgKCFjb250cm9sLm5hbWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkZWZhdWx0Q29uZmlnID0gVklFV0VSX0NPTlRST0xfREVGQVVMVFNbY29udHJvbC5uYW1lXTtcblxuICAgICAgbGV0IGVsZW1lbnQ7XG4gICAgICBpZiAoZGVmYXVsdENvbmZpZyAmJiBkZWZhdWx0Q29uZmlnLnNlbGVjdG9yKSB7XG4gICAgICAgIGVsZW1lbnQgPSBzY29wZWRRdWVyeVNlbGVjdG9yKFxuICAgICAgICAgIHRoaXMuZ2V0U2hhZG93Um9vdCgpLFxuICAgICAgICAgIGRlZmF1bHRDb25maWcuc2VsZWN0b3JcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQgPSB0aGlzLndpbl8uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktYnV0dG9uJyk7XG4gICAgICAgICAgdGhpcy5idXR0b25zQ29udGFpbmVyXy5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChWSUVXRVJfQ1VTVE9NX0NPTlRST0xfQ0xBU1MpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChjb250cm9sLnZpc2liaWxpdHkgPT09ICdoaWRkZW4nKSB7XG4gICAgICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktdWktaGlkZS1idXR0b24nKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghY29udHJvbC52aXNpYmlsaXR5IHx8IGNvbnRyb2wudmlzaWJpbGl0eSA9PT0gJ3Zpc2libGUnKSB7XG4gICAgICAgIHRoaXMudnN5bmNfLm11dGF0ZSgoKSA9PiB7XG4gICAgICAgICAgZGV2KClcbiAgICAgICAgICAgIC5hc3NlcnRFbGVtZW50KGVsZW1lbnQpXG4gICAgICAgICAgICAuY2xhc3NMaXN0LnJlbW92ZSgnaS1hbXBodG1sLXN0b3J5LXVpLWhpZGUtYnV0dG9uJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29udHJvbC5zdGF0ZSA9PT0gJ2Rpc2FibGVkJykge1xuICAgICAgICB0aGlzLnZzeW5jXy5tdXRhdGUoKCkgPT4ge1xuICAgICAgICAgIGVsZW1lbnQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbnRyb2wucG9zaXRpb24gPT09ICdzdGFydCcpIHtcbiAgICAgICAgY29uc3Qgc3RhcnRCdXR0b25Db250YWluZXIgPSB0aGlzLnN5c3RlbUxheWVyRWxfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgJy5pLWFtcGh0bWwtc3Rvcnktc3lzdGVtLWxheWVyLWJ1dHRvbnMtc3RhcnQtcG9zaXRpb24nXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmJ1dHRvbnNDb250YWluZXJfLnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xuICAgICAgICAgIHN0YXJ0QnV0dG9uQ29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbnRyb2wuYmFja2dyb3VuZEltYWdlVXJsKSB7XG4gICAgICAgIHNldEltcG9ydGFudFN0eWxlcyhkZXYoKS5hc3NlcnRFbGVtZW50KGVsZW1lbnQpLCB7XG4gICAgICAgICAgJ2JhY2tncm91bmQtaW1hZ2UnOiBgdXJsKCcke2NvbnRyb2wuYmFja2dyb3VuZEltYWdlVXJsfScpYCxcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnRbVklFV0VSX0NPTlRST0xfRVZFTlRfTkFNRV0gPSBgYW1wLXN0b3J5LXBsYXllci0ke2NvbnRyb2wubmFtZX1gO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYWdlSWQgVGhlIGlkIG9mIHRoZSBwYWdlIHdob3NlIHByb2dyZXNzIHNob3VsZCBiZVxuICAgKiAgICAgY2hhbmdlZC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHByb2dyZXNzIEEgbnVtYmVyIGZyb20gMC4wIHRvIDEuMCwgcmVwcmVzZW50aW5nIHRoZVxuICAgKiAgICAgcHJvZ3Jlc3Mgb2YgdGhlIGN1cnJlbnQgcGFnZS5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgdXBkYXRlUHJvZ3Jlc3MocGFnZUlkLCBwcm9ncmVzcykge1xuICAgIC8vIFRPRE8obmV3bXVpcykgYXZvaWQgcGFzc2luZyBwcm9ncmVzcyBsb2dpYyB0aHJvdWdoIHN5c3RlbS1sYXllclxuICAgIHRoaXMucHJvZ3Jlc3NCYXJfLnVwZGF0ZVByb2dyZXNzKHBhZ2VJZCwgcHJvZ3Jlc3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vbG9nZ2luZy5BbXBTdG9yeUxvZ0VudHJ5RGVmfSBsb2dFbnRyeVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbG9nSW50ZXJuYWxfKGxvZ0VudHJ5KSB7XG4gICAgdGhpcy5kZXZlbG9wZXJCdXR0b25zXy5sb2cobG9nRW50cnkpO1xuICAgIHRoaXMuZGV2ZWxvcGVyTG9nXy5sb2cobG9nRW50cnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgYW4gYXJyYXkgb2YgZW50cmllcyB0byB0aGUgZGV2ZWxvcGVyIGxvZ3MuXG4gICAqIEBwYXJhbSB7IUFycmF5PCEuL2xvZ2dpbmcuQW1wU3RvcnlMb2dFbnRyeURlZj59IGxvZ0VudHJpZXNcbiAgICovXG4gIGxvZ0FsbChsb2dFbnRyaWVzKSB7XG4gICAgaWYgKCFnZXRNb2RlKCkuZGV2ZWxvcG1lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnZzeW5jXy5tdXRhdGUoKCkgPT4ge1xuICAgICAgbG9nRW50cmllcy5mb3JFYWNoKChsb2dFbnRyeSkgPT4gdGhpcy5sb2dJbnRlcm5hbF8obG9nRW50cnkpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dzIGEgc2luZ2xlIGVudHJ5IHRvIHRoZSBkZXZlbG9wZXIgbG9ncy5cbiAgICogQHBhcmFtIHshLi9sb2dnaW5nLkFtcFN0b3J5TG9nRW50cnlEZWZ9IGxvZ0VudHJ5XG4gICAqL1xuICBsb2cobG9nRW50cnkpIHtcbiAgICBpZiAoIWdldE1vZGUoKS5kZXZlbG9wbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubG9nSW50ZXJuYWxfKGxvZ0VudHJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgYW55IHN0YXRlIGhlbGQgYnkgdGhlIGRldmVsb3BlciBsb2cgb3IgYnV0dG9ucy5cbiAgICovXG4gIHJlc2V0RGV2ZWxvcGVyTG9ncygpIHtcbiAgICBpZiAoIWdldE1vZGUoKS5kZXZlbG9wbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZGV2ZWxvcGVyQnV0dG9uc18uY2xlYXIoKTtcbiAgICB0aGlzLmRldmVsb3BlckxvZ18uY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzdHJpbmcgcHJvdmlkaW5nIGNvbnRleHQgZm9yIHRoZSBkZXZlbG9wZXIgbG9ncyB3aW5kb3cuICBUaGlzIGlzXG4gICAqIG9mdGVuIHRoZSBuYW1lIG9yIElEIG9mIHRoZSBlbGVtZW50IHRoYXQgYWxsIGxvZ3MgYXJlIGZvciAoZS5nLiB0aGUgcGFnZSkuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0U3RyaW5nXG4gICAqL1xuICBzZXREZXZlbG9wZXJMb2dDb250ZXh0U3RyaW5nKGNvbnRleHRTdHJpbmcpIHtcbiAgICBpZiAoIWdldE1vZGUoKS5kZXZlbG9wbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZGV2ZWxvcGVyTG9nXy5zZXRDb250ZXh0U3RyaW5nKGNvbnRleHRTdHJpbmcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZGVzIHRoZSBkZXZlbG9wZXIgbG9nIGluIHRoZSBVSS5cbiAgICovXG4gIGhpZGVEZXZlbG9wZXJMb2coKSB7XG4gICAgaWYgKCFnZXRNb2RlKCkuZGV2ZWxvcG1lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmRldmVsb3BlckxvZ18uaGlkZSgpO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-system-layer.js