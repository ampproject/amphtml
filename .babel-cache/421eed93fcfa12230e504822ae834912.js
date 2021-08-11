var _templateObject, _templateObject2, _templateObject3;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

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
import { Action, EmbeddedComponentState, InteractiveComponentDef, StateProperty, UIType, getStoreService } from "./amp-story-store-service";
import { AdvancementMode, StoryAnalyticsEvent, getAnalyticsService } from "./story-analytics";
import { CSS } from "../../../build/amp-story-tooltip-1.0.css";
import { EventType, dispatch } from "./events";
import { Keys } from "../../../src/core/constants/key-codes";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { Services } from "../../../src/service";
import { addAttributesToElement, tryFocus } from "../../../src/core/dom";
import { closest, matches } from "../../../src/core/dom/query";
import { createShadowRootWithStyle, getSourceOriginForElement, triggerClickFromLightDom } from "./utils";
import { dev, devAssert, user, userAssert } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { getAmpdoc } from "../../../src/service-helpers";
import { getLocalizationService } from "./amp-story-localization-service";
import { htmlFor, htmlRefs } from "../../../src/core/dom/static-template";
import { isProtocolValid, parseUrlDeprecated } from "../../../src/url";
import { px, resetStyles, setImportantStyles, toggle } from "../../../src/core/dom/style";

/**
 * Action icons to be placed in tooltip.
 * @enum {string}
 * @private
 */
var ActionIcon = {
  LAUNCH: 'i-amphtml-tooltip-action-icon-launch',
  EXPAND: 'i-amphtml-tooltip-action-icon-expand'
};

/** @private @const {number} */
var TOOLTIP_CLOSE_ANIMATION_MS = 100;

/** @const {string} */
var DARK_THEME_CLASS = 'i-amphtml-story-tooltip-theme-dark';

/**
 * @enum {string}
 */
var TooltipTheme = {
  LIGHT: 'light',
  // default
  DARK: 'dark'
};

/**
 * Since we don't know the actual width of the content inside the iframe
 * and in responsive environments the iframe takes the whole width, we
 * hardcode a limit based on what we know of how the embed behaves (only true
 * for Twitter embeds). See #22334.
 * @const {number}
 * @private
 */
var MAX_TWEET_WIDTH_PX = 500;

/**
 * Components that can be expanded.
 * @const {!Object}
 * @package
 */
export var EXPANDABLE_COMPONENTS = {
  'amp-twitter': {
    customIconClassName: 'amp-social-share-twitter-no-background',
    actionIcon: ActionIcon.EXPAND,
    localizedStringId: LocalizedStringId.AMP_STORY_TOOLTIP_EXPAND_TWEET,
    selector: 'amp-twitter'
  }
};

/**
 * Components that can be launched.
 * @const {!Object}
 * @private
 */
var LAUNCHABLE_COMPONENTS = {
  'a': {
    actionIcon: ActionIcon.LAUNCH,
    selector: 'a[href]:not([affiliate-link-icon])'
  }
};

/**
 * Union of expandable and launchable components.
 * @private
 * @const {!Object}
 */
var INTERACTIVE_COMPONENTS = _extends({}, EXPANDABLE_COMPONENTS, LAUNCHABLE_COMPONENTS);

/**
 * Gets the list of components with their respective selectors.
 * @param {!Object} components
 * @param {string=} opt_predicate
 * @return {!Object<string, string>}
 */
function getComponentSelectors(components, opt_predicate) {
  var componentSelectors = {};
  Object.keys(components).forEach(function (componentName) {
    componentSelectors[componentName] = opt_predicate ? components[componentName].selector + opt_predicate : components[componentName].selector;
  });
  return componentSelectors;
}

/** @const {string} */
var INTERACTIVE_EMBED_SELECTOR = '[interactive]';

/**
 * Selectors of elements that can go into expanded view.
 * @return {!Object}
 */
export function expandableElementsSelectors() {
  // Using indirect invocation to prevent no-export-side-effect issue.
  return getComponentSelectors(EXPANDABLE_COMPONENTS, INTERACTIVE_EMBED_SELECTOR);
}

/**
 * Contains all interactive component CSS selectors.
 * @type {!Object}
 */
var interactiveSelectors = _extends({}, getComponentSelectors(LAUNCHABLE_COMPONENTS), getComponentSelectors(EXPANDABLE_COMPONENTS, INTERACTIVE_EMBED_SELECTOR), {
  EXPANDED_VIEW_OVERLAY: '.i-amphtml-story-expanded-view-overflow, ' + '.i-amphtml-expanded-view-close-button'
});

/**
 * All selectors that should delegate to the AmpStoryEmbeddedComponent class.
 * @return {!Object}
 */
export function interactiveElementsSelectors() {
  // Using indirect invocation to prevent no-export-side-effect issue.
  return interactiveSelectors;
}

/**
 * Maps each embedded element to its corresponding style.
 * @type {!JsonObject}
 */
var embedStyleEls = dict();

/**
 * Generates ids for embedded component styles.
 * @type {number}
 */
var embedIds = 0;

/**
 * Contains metadata about embedded components, found in <style> elements.
 * @const {string}
 */
var AMP_EMBED_DATA = '__AMP_EMBED_DATA__';

/**
 * @typedef {{
 *  id: number,
 *  width: number,
 *  height: number,
 *  scaleFactor: number,
 *  transform: string,
 *  verticalMargin: number,
 *  horizontalMargin: number,
 * }}
 */
var EmbedDataDef;

/**
 * @const {string}
 */
export var EMBED_ID_ATTRIBUTE_NAME = 'i-amphtml-embed-id';

/**
 * Builds expanded view overlay for expandable components.
 * @param {!Element} element
 * @return {!Element}
 */
var buildExpandedViewOverlay = function buildExpandedViewOverlay(element) {
  return htmlFor(element)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <div class=\"i-amphtml-story-expanded-view-overflow i-amphtml-story-system-reset\">\n      <button class=\"i-amphtml-expanded-view-close-button\" aria-label=\"close\" role=\"button\"></button>\n    </div>"])));
};

/**
 * Updates embed's corresponding <style> element with embedData.
 * @param {!Element} target
 * @param {!Element} embedStyleEl
 * @param {!EmbedDataDef} embedData
 */
function updateEmbedStyleEl(target, embedStyleEl, embedData) {
  var embedId = embedData.id;
  embedStyleEl.textContent = "[" + EMBED_ID_ATTRIBUTE_NAME + "=\"" + embedId + "\"]\n  " + buildStringStyleFromEl(target, embedData);
}

/**
 * Builds a string containing the corresponding style depending on the
 * element.
 * @param {!Element} target
 * @param {!EmbedDataDef} embedData
 * @return {string}
 */
function buildStringStyleFromEl(target, embedData) {
  switch (target.tagName.toLowerCase()) {
    case EXPANDABLE_COMPONENTS['amp-twitter'].selector:
      return buildStringStyleForTweet(embedData);

    default:
      return buildDefaultStringStyle(embedData);
  }
}

/**
 * Builds string used in the <style> element for tweets. We ignore the height
 * as its non-deterministic.
 * @param {!EmbedDataDef} embedData
 * @return {string}
 */
function buildStringStyleForTweet(embedData) {
  return "{\n    width: " + px(embedData.width) + " !important;\n    transform: " + embedData.transform + " !important;\n    margin: " + embedData.verticalMargin + "px " + embedData.horizontalMargin + "px !important;\n    }";
}

/**
 * Builds string used in the <style> element for default embeds.
 * @param {!EmbedDataDef} embedData
 * @return {string}
 */
function buildDefaultStringStyle(embedData) {
  return "{\n    width: " + px(embedData.width) + " !important;\n    height: " + px(embedData.height) + " !important;\n    transform: " + embedData.transform + " !important;\n    margin: " + embedData.verticalMargin + "px " + embedData.horizontalMargin + "px !important;\n    }";
}

/**
 * Measures styles for a given element in preparation for its expanded animation.
 * @param {!Element} element
 * @param {!Object} state
 * @param {!DOMRect} pageRect
 * @param {!DOMRect} elRect
 * @return {!Object}
 */
function measureStyleForEl(element, state, pageRect, elRect) {
  switch (element.tagName.toLowerCase()) {
    case EXPANDABLE_COMPONENTS['amp-twitter'].selector:
      return measureStylesForTwitter(state, pageRect, elRect);

    default:
      return measureDefaultStyles(state, pageRect, elRect);
  }
}

/**
 * Since amp-twitter handles its own resize events for its height, we don't
 * resize based on its height, but rather just based on its width.
 * @param {!Object} state
 * @param {!DOMRect} pageRect
 * @param {!DOMRect} elRect
 * @return {!Object}
 */
function measureStylesForTwitter(state, pageRect, elRect) {
  // If screen is very wide and story has supports-landscape attribute,
  // we don't want it to take the whole width. We take the maximum width
  // that the tweet can actually use instead.
  state.newWidth = Math.min(pageRect.width, MAX_TWEET_WIDTH_PX);
  state.scaleFactor = Math.min(elRect.width, MAX_TWEET_WIDTH_PX) / state.newWidth;
  var shrinkedSize = elRect.height * state.scaleFactor;
  state.verticalMargin = -1 * ((elRect.height - shrinkedSize) / 2);
  state.horizontalMargin = -1 * ((state.newWidth - elRect.width) / 2);
  return state;
}

/**
 * Measures styles for a given element in preparation for its expanded
 * animation.
 * @param {!Object} state
 * @param {!DOMRect} pageRect
 * @param {!DOMRect} elRect
 * @return {!Object}
 */
function measureDefaultStyles(state, pageRect, elRect) {
  if (elRect.width >= elRect.height) {
    state.newWidth = pageRect.width;
    state.scaleFactor = elRect.width / state.newWidth;
    state.newHeight = elRect.height / elRect.width * state.newWidth;
  } else {
    var maxHeight = pageRect.height - VERTICAL_PADDING;
    state.newWidth = Math.min(elRect.width / elRect.height * maxHeight, pageRect.width);
    state.newHeight = elRect.height / elRect.width * state.newWidth;
    state.scaleFactor = elRect.height / state.newHeight;
  }

  state.verticalMargin = -1 * ((state.newHeight - elRect.height) / 2);
  state.horizontalMargin = -1 * ((state.newWidth - elRect.width) / 2);
  return state;
}

/**
 * Gets updated style object for a given element.
 * @param {!Element} element
 * @param {number} elId
 * @param {!Object} state
 * @return {!Object}
 */
function updateStyleForEl(element, elId, state) {
  switch (element.tagName.toLowerCase()) {
    case EXPANDABLE_COMPONENTS['amp-twitter'].selector:
      return updateStylesForTwitter(elId, state);

    default:
      return updateDefaultStyles(elId, state);
  }
}

/**
 * Gets style object for an embedded component, setting negative margins
 * to make up for the expanded size in preparation of the expanded animation.
 * @param {number} elId
 * @param {!Object} state
 * @return {!Object}
 */
function updateDefaultStyles(elId, state) {
  return {
    id: elId,
    width: state.newWidth,
    height: state.newHeight,
    scaleFactor: state.scaleFactor,
    transform: "scale(" + state.scaleFactor + ")",
    verticalMargin: state.verticalMargin,
    horizontalMargin: state.horizontalMargin
  };
}

/**
 * Gets style object for twitter. Notice there is no height or vertical margin
 * since we don't know the final height of tweets even after layout, so we just
 * let the embed handle its own height.
 * @param {number} elId
 * @param {!Object} state
 * @return {!Object}
 */
function updateStylesForTwitter(elId, state) {
  return {
    id: elId,
    width: state.newWidth,
    scaleFactor: state.scaleFactor,
    transform: "scale(" + state.scaleFactor + ")",
    horizontalMargin: state.horizontalMargin,
    verticalMargin: state.verticalMargin
  };
}

/**
 * Minimum vertical space needed to position tooltip.
 * @const {number}
 */
var MIN_VERTICAL_SPACE = 48;

/**
 * Limits the amount of vertical space a component can take in a page, this
 * makes sure no component is blocking the close button at the top of the
 * expanded view.
 * @const {number}
 * @private
 */
var VERTICAL_PADDING = 96;

/**
 * Padding between tooltip and vertical edges of screen.
 * @const {number}
 */
var VERTICAL_EDGE_PADDING = 24;

/**
 * Padding between tooltip and horizontal edges of screen.
 * @const {number}
 */
var HORIZONTAL_EDGE_PADDING = 32;

/**
 * Padding between tooltip arrow and right edge of the tooltip.
 * @const {number}
 */
var TOOLTIP_ARROW_RIGHT_PADDING = 24;

/**
 * @struct @typedef {{
 *   tooltip: !Element,
 *   buttonLeft: !Element,
 *   buttonRight: !Element,
 *   arrow: !Element,
 * }}
 */
var tooltipElementsDef;
var TAG = 'amp-story-embedded-component';

/**
 * Embedded components found in amp-story.
 */
export var AmpStoryEmbeddedComponent = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   */
  function AmpStoryEmbeddedComponent(win, storyEl) {
    var _this = this;

    _classCallCheck(this, AmpStoryEmbeddedComponent);

    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Element} */
    this.storyEl_ = storyEl;

    /** @private {?Element} */
    this.shadowRoot_ = null;

    /** @private {?Element} */
    this.focusedStateOverlay_ = null;

    /** @private {?Element} */
    this.tooltip_ = null;

    /** @private {?Element} */
    this.tooltipArrow_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private @const {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(getAmpdoc(this.win_.document));

    /** @private @const {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win_, storyEl);

    /** @private @const {!../../../src/service/owners-interface.OwnersInterface} */
    this.owners_ = Services.ownersForDoc(getAmpdoc(this.win_.document));

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /** @private {?Element} */
    this.expandedViewOverlay_ = null;

    /**
     * Target producing the tooltip and going to expanded view (when
     * expandable).
     * @private {?Element}
     */
    this.triggeringTarget_ = null;

    /**
     * Page containing component.
     * @private {?Element}
     */
    this.componentPage_ = null;

    /** @private */
    this.expandComponentHandler_ = this.onExpandComponent_.bind(this);

    /** @private */
    this.embedsToBePaused_ = [];
    this.storeService_.subscribe(StateProperty.INTERACTIVE_COMPONENT_STATE,
    /** @param {!InteractiveComponentDef} component */
    function (component) {
      _this.onComponentStateUpdate_(component);
    });

    /** @type {!../../../src/service/history-impl.History} */
    this.historyService_ = Services.historyForDoc(getAmpdoc(this.win_.document));

    /** @private {EmbeddedComponentState} */
    this.state_ = EmbeddedComponentState.HIDDEN;

    /** @private {?Element} */
    this.buttonLeft_ = null;

    /** @private {?Element} */
    this.buttonRight_ = null;

    /** @private {number} */
    this.historyId_ = -1;
  }

  /**
   * Reacts to embedded component state updates.
   * Possible state updates:
   *
   *    HIDDEN ==> FOCUSED ==> EXPANDED
   *      /\ _________|           |
   *      ||______________________|
   *
   * @param {!InteractiveComponentDef} component
   * @private
   */
  _createClass(AmpStoryEmbeddedComponent, [{
    key: "onComponentStateUpdate_",
    value: function onComponentStateUpdate_(component) {
      switch (component.state) {
        case EmbeddedComponentState.HIDDEN:
          this.setState_(EmbeddedComponentState.HIDDEN, null
          /** component */
          );
          break;

        case EmbeddedComponentState.FOCUSED:
          if (this.state_ !== EmbeddedComponentState.HIDDEN) {
            dev().warn(TAG, "Invalid component update. Not possible to go from " + this.state_ + "\n              to " + component.state);
          }

          this.setState_(EmbeddedComponentState.FOCUSED, component);
          break;

        case EmbeddedComponentState.EXPANDED:
          if (this.state_ === EmbeddedComponentState.FOCUSED) {
            this.setState_(EmbeddedComponentState.EXPANDED, component);
          } else if (this.state_ === EmbeddedComponentState.EXPANDED) {
            this.maybeCloseExpandedView_(component.element);
          } else {
            dev().warn(TAG, "Invalid component update. Not possible to go from " + this.state_ + "\n               to " + component.state);
          }

          break;
      }
    }
    /**
     * Sets new state for the embedded component.
     * @param {EmbeddedComponentState} state
     * @param {?InteractiveComponentDef} component
     * @private
     */

  }, {
    key: "setState_",
    value: function setState_(state, component) {
      var _this2 = this;

      switch (state) {
        case EmbeddedComponentState.FOCUSED:
          this.state_ = state;
          this.onFocusedStateUpdate_(component);
          this.analyticsService_.triggerEvent(StoryAnalyticsEvent.FOCUS, this.triggeringTarget_);
          break;

        case EmbeddedComponentState.HIDDEN:
          this.state_ = state;
          this.onFocusedStateUpdate_(null);
          break;

        case EmbeddedComponentState.EXPANDED:
          this.state_ = state;
          this.onFocusedStateUpdate_(null);
          this.scheduleEmbedToPause_(component.element);
          this.toggleExpandedView_(component.element);
          this.historyService_.push(function () {
            return _this2.close_();
          }).then(function (historyId) {
            _this2.historyId_ = historyId;
          });
          break;

        default:
          dev().warn(TAG, "EmbeddedComponentState " + this.state_ + " does not exist");
          break;
      }
    }
    /**
     * Schedules embeds to be paused.
     * @param {!Element} embedEl
     * @private
     */

  }, {
    key: "scheduleEmbedToPause_",
    value: function scheduleEmbedToPause_(embedEl) {
      // Resources that previously called `schedulePause` must also call
      // `scheduleResume`. Calling `scheduleResume` on resources that did not
      // previously call `schedulePause` has no effect.
      this.owners_.scheduleResume(this.storyEl_, embedEl);

      if (!this.embedsToBePaused_.includes(embedEl)) {
        this.embedsToBePaused_.push(embedEl);
      }
    }
    /**
     * Toggles expanded view for interactive components that support it.
     * @param {?Element} targetToExpand
     * @private
     */

  }, {
    key: "toggleExpandedView_",
    value: function toggleExpandedView_(targetToExpand) {
      var _this3 = this;

      if (!targetToExpand) {
        this.expandedViewOverlay_ && this.mutator_.mutateElement(this.expandedViewOverlay_, function () {
          _this3.componentPage_.classList.toggle('i-amphtml-expanded-mode', false);

          toggle(dev().assertElement(_this3.expandedViewOverlay_), false);

          _this3.closeExpandedEl_();
        });
        return;
      }

      this.animateExpanded_(devAssert(targetToExpand));
      this.expandedViewOverlay_ = this.componentPage_.querySelector('.i-amphtml-story-expanded-view-overflow');

      if (!this.expandedViewOverlay_) {
        this.buildAndAppendExpandedViewOverlay_();
      }

      this.mutator_.mutateElement(dev().assertElement(this.expandedViewOverlay_), function () {
        toggle(dev().assertElement(_this3.expandedViewOverlay_), true);

        _this3.componentPage_.classList.toggle('i-amphtml-expanded-mode', true);
      });
    }
    /**
     * Builds the expanded view overlay element and appends it to the page.
     * @private
     */

  }, {
    key: "buildAndAppendExpandedViewOverlay_",
    value: function buildAndAppendExpandedViewOverlay_() {
      var _this4 = this;

      this.expandedViewOverlay_ = buildExpandedViewOverlay(this.storyEl_);
      var closeButton = dev().assertElement(this.expandedViewOverlay_.querySelector('.i-amphtml-expanded-view-close-button'));
      var localizationService = getLocalizationService(devAssert(this.storyEl_));

      if (localizationService) {
        var localizedCloseString = localizationService.getLocalizedString(LocalizedStringId.AMP_STORY_CLOSE_BUTTON_LABEL);
        closeButton.setAttribute('aria-label', localizedCloseString);
      }

      this.mutator_.mutateElement(dev().assertElement(this.componentPage_), function () {
        return _this4.componentPage_.appendChild(_this4.expandedViewOverlay_);
      });
    }
    /**
     * Closes the expanded view overlay.
     * @param {?Element} target
     * @param {boolean=} forceClose Force closing the expanded view.
     * @private
     */

  }, {
    key: "maybeCloseExpandedView_",
    value: function maybeCloseExpandedView_(target, forceClose) {
      if (forceClose === void 0) {
        forceClose = false;
      }

      if (target && matches(target, '.i-amphtml-expanded-view-close-button') || forceClose) {
        if (this.historyId_ !== -1) {
          this.historyService_.goBack();
        } else {
          // Used for visual diff testing viewer.
          this.close_();
        }
      }
    }
    /**
     * Builds the tooltip overlay and appends it to the provided story.
     * @private
     * @return {Node}
     */

  }, {
    key: "buildFocusedState_",
    value: function buildFocusedState_() {
      var _this5 = this;

      this.shadowRoot_ = this.win_.document.createElement('div');
      this.focusedStateOverlay_ = devAssert(this.buildFocusedStateTemplate_(this.win_.document));
      createShadowRootWithStyle(this.shadowRoot_, this.focusedStateOverlay_, CSS);
      this.focusedStateOverlay_.addEventListener('click', function (event) {
        return _this5.onOutsideTooltipClick_(event);
      });
      this.tooltip_.addEventListener('click', function (event) {
        event.stopPropagation();

        _this5.analyticsService_.triggerEvent(StoryAnalyticsEvent.CLICK_THROUGH, _this5.triggeringTarget_);

        _this5.tooltip_.href && _this5.onAnchorClick_(event);
      }, true
      /** capture */
      );
      return this.shadowRoot_;
    }
    /**
     * Clears tooltip UI and updates store state to hidden.
     * @private
     */

  }, {
    key: "close_",
    value: function close_() {
      var _this6 = this;

      // Wait until tooltip closing animation is finished before clearing it.
      // Otherwise jank is noticeable.
      this.timer_.delay(function () {
        _this6.clearTooltip_();
      }, TOOLTIP_CLOSE_ANIMATION_MS);

      if (this.state_ === EmbeddedComponentState.EXPANDED) {
        this.toggleExpandedView_(null);
      }

      this.storeService_.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, {
        state: EmbeddedComponentState.HIDDEN
      });
      this.tooltip_.removeEventListener('click', this.expandComponentHandler_, true
      /** capture */
      );
    }
    /**
     * Reacts to store updates related to the focused state, when a tooltip is
     * active.
     * @param {?InteractiveComponentDef} component
     * @private
     */

  }, {
    key: "onFocusedStateUpdate_",
    value: function onFocusedStateUpdate_(component) {
      var _this7 = this;

      if (!component) {
        this.mutator_.mutateElement(dev().assertElement(this.focusedStateOverlay_), function () {
          _this7.focusedStateOverlay_.classList.toggle('i-amphtml-hidden', true);
        });
        return;
      }

      this.triggeringTarget_ = component.element;

      // First time attaching the overlay. Runs only once.
      if (!this.focusedStateOverlay_) {
        this.storyEl_.appendChild(this.buildFocusedState_());
        this.initializeListeners_();
      }

      // Delay building the tooltip to make sure it runs after clearTooltip_,
      // in the case the user taps on a target in quick succession.
      this.timer_.delay(function () {
        _this7.buildTooltip_(component);
      }, TOOLTIP_CLOSE_ANIMATION_MS);
    }
    /**
     * Builds and displays tooltip
     * @param {?InteractiveComponentDef} component
     * @private
     */

  }, {
    key: "buildTooltip_",
    value: function buildTooltip_(component) {
      var _this8 = this;

      this.updateTooltipBehavior_(component.element);
      this.updateTooltipEl_(component);
      this.componentPage_ = devAssert(this.storyEl_.querySelector('amp-story-page[active]'));
      this.mutator_.mutateElement(dev().assertElement(this.focusedStateOverlay_), function () {
        _this8.focusedStateOverlay_.classList.toggle('i-amphtml-hidden', false);

        tryFocus(dev().assertElement(_this8.focusedStateOverlay_.querySelector('a.i-amphtml-story-tooltip')));
      });
    }
    /**
     * Attaches listeners that listen for UI updates.
     * @private
     */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this9 = this;

      this.storeService_.subscribe(StateProperty.UI_STATE, function (uiState) {
        _this9.onUIStateUpdate_(uiState);
      }, true
      /** callToInitialize */
      );
      this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, function () {
        // Hide active tooltip when page switch is triggered by keyboard or
        // desktop buttons.
        if (_this9.state_ === EmbeddedComponentState.FOCUSED) {
          _this9.close_();
        }

        // Hide expanded view when page switch is triggered by keyboard or desktop
        // buttons.
        if (_this9.state_ === EmbeddedComponentState.EXPANDED) {
          _this9.maybeCloseExpandedView_(null
          /** target */
          , true
          /** forceClose */
          );
        }

        // Pauses content inside embeds when a page change occurs.
        while (_this9.embedsToBePaused_.length > 0) {
          var embedEl = _this9.embedsToBePaused_.pop();

          _this9.owners_.schedulePause(_this9.storyEl_, embedEl);
        }
      });
      this.win_.addEventListener('keyup', function (event) {
        if (event.key === Keys.ESCAPE && _this9.state_ === EmbeddedComponentState.EXPANDED) {
          event.preventDefault();

          _this9.maybeCloseExpandedView_(null
          /** target */
          , true
          /** forceClose */
          );
        }
      });
    }
    /**
     * Reacts to desktop state updates and hides navigation buttons since we
     * already have in the desktop UI.
     * @param {!UIType} uiState
     * @private
     */

  }, {
    key: "onUIStateUpdate_",
    value: function onUIStateUpdate_(uiState) {
      var _this10 = this;

      this.mutator_.mutateElement(dev().assertElement(this.focusedStateOverlay_), function () {
        [UIType.DESKTOP_FULLBLEED, UIType.DESKTOP_PANELS].includes(uiState) ? _this10.focusedStateOverlay_.setAttribute('desktop', '') : _this10.focusedStateOverlay_.removeAttribute('desktop');
      });
    }
    /**
     * Builds and attaches the tooltip.
     * @param {!InteractiveComponentDef} component
     * @private
     */

  }, {
    key: "updateTooltipEl_",
    value: function updateTooltipEl_(component) {
      var embedConfig =
      /** @type {!Object} */
      userAssert(this.getEmbedConfigFor_(component.element), 'Invalid embed config for target', component.element);
      var theme = this.triggeringTarget_.getAttribute('theme');

      if (theme && TooltipTheme.DARK === theme.toLowerCase()) {
        this.tooltip_.classList.add(DARK_THEME_CLASS);
      }

      this.updateTooltipText_(component.element, embedConfig);
      this.updateTooltipComponentIcon_(component.element, embedConfig);
      this.updateTooltipActionIcon_(embedConfig);
      this.updateNavButtons_();
      this.positionTooltip_(component);
    }
    /**
     * Updates tooltip behavior depending on the target.
     * @param {!Element} target
     * @private
     */

  }, {
    key: "updateTooltipBehavior_",
    value: function updateTooltipBehavior_(target) {
      if (matches(target, LAUNCHABLE_COMPONENTS['a'].selector)) {
        addAttributesToElement(dev().assertElement(this.tooltip_), dict({
          'href': this.getElementHref_(target)
        }));
        return;
      }

      if (EXPANDABLE_COMPONENTS[target.tagName.toLowerCase()]) {
        this.tooltip_.addEventListener('click', this.expandComponentHandler_, true);
      }
    }
    /**
     * Handles the event of an interactive element coming into expanded view.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onExpandComponent_",
    value: function onExpandComponent_(event) {
      event.preventDefault();
      event.stopPropagation();
      this.storeService_.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, {
        state: EmbeddedComponentState.EXPANDED,
        element: this.triggeringTarget_
      });
    }
    /**
     * Gets href from an element containing a url.
     * @param {!Element} target
     * @return {string}
     * @private
     */

  }, {
    key: "getElementHref_",
    value: function getElementHref_(target) {
      var elUrl = target.getAttribute('href');

      if (!isProtocolValid(elUrl)) {
        user().error(TAG, 'The tooltip url is invalid');
        return '';
      }

      return parseUrlDeprecated(elUrl).href;
    }
    /**
     * Gets corresponding config for a given embed target.
     * @param {!Element} target
     * @return {?Object}
     */

  }, {
    key: "getEmbedConfigFor_",
    value: function getEmbedConfigFor_(target) {
      var config = INTERACTIVE_COMPONENTS[target.tagName.toLowerCase()];

      if (config && matches(target, config.selector)) {
        return config;
      }

      user().error(TAG, 'No config matching provided target.');
      return null;
    }
    /**
     * Returns expanded element back to original state.
     * @private
     */

  }, {
    key: "closeExpandedEl_",
    value: function closeExpandedEl_() {
      this.triggeringTarget_.classList.toggle('i-amphtml-expanded-component', false);
      var embedId = this.triggeringTarget_.getAttribute(EMBED_ID_ATTRIBUTE_NAME);
      var embedStyleEl = dev().assertElement(embedStyleEls[embedId], "Failed to look up embed style element with ID " + embedId);
      embedStyleEl[AMP_EMBED_DATA].transform = "scale(" + embedStyleEl[AMP_EMBED_DATA].scaleFactor + ")";
      updateEmbedStyleEl(this.triggeringTarget_, embedStyleEl, embedStyleEl[AMP_EMBED_DATA]);
    }
    /**
     * Animates into expanded view. It calculates what the full-screen dimensions
     * of the element will be, and uses them to deduce the translateX/Y values
     * once the element reaches its full-screen size.
     * @param {!Element} target
     * @private
     */

  }, {
    key: "animateExpanded_",
    value: function animateExpanded_(target) {
      var _this11 = this;

      var embedId = target.getAttribute(EMBED_ID_ATTRIBUTE_NAME);
      var state = {};
      var embedStyleEl = dev().assertElement(embedStyleEls[embedId], "Failed to look up embed style element with ID " + embedId);
      var embedData = embedStyleEl[AMP_EMBED_DATA];
      this.mutator_.measureMutateElement(target,
      /** measure */
      function () {
        var targetRect = target.
        /*OK*/
        getBoundingClientRect();

        // TODO(#20832): Store DOMRect for the page in the store to avoid
        // having to call getBoundingClientRect().
        var pageRect = _this11.componentPage_.
        /*OK*/
        getBoundingClientRect();

        var realHeight = target.
        /*OK*/
        offsetHeight;
        var maxHeight = pageRect.height - VERTICAL_PADDING;
        state.scaleFactor = 1;

        if (realHeight > maxHeight) {
          state.scaleFactor = maxHeight / realHeight;
        }

        // Gap on the left of the element between full-screen size and
        // current size.
        var leftGap = (embedData.width - targetRect.width) / 2;
        // Distance from left of page to what will be the left of the
        // element in full-screen.
        var fullScreenLeft = targetRect.left - leftGap - pageRect.left;
        var centeredLeft = pageRect.width / 2 - embedData.width / 2;
        state.translateX = centeredLeft - fullScreenLeft;
        // Gap on the top of the element between full-screen size and
        // current size.
        var topGap = (realHeight * state.scaleFactor - targetRect.height) / 2;
        // Distance from top of page to what will be the top of the element in
        // full-screen.
        var fullScreenTop = targetRect.top - topGap - pageRect.top;
        var centeredTop = pageRect.height / 2 - realHeight * state.scaleFactor / 2;
        state.translateY = centeredTop - fullScreenTop;
      },
      /** mutate */
      function () {
        target.classList.toggle('i-amphtml-expanded-component', true);
        embedData.transform = "translate3d(" + state.translateX + "px,\n            " + state.translateY + "px, 0) scale(" + state.scaleFactor + ")";
        updateEmbedStyleEl(target, embedStyleEl, embedData);
      });
    }
    /**
     * Resizes expandable element before it is expanded to full-screen, in
     * preparation for its animation. It resizes it to its full-screen size, and
     * scales it down to match size set by publisher, adding negative margins so
     * that content around stays put.
     * @param {!Element} pageEl
     * @param {!Element} element
     * @param {!../../../src/service/mutator-interface.MutatorInterface} mutator
     */

  }, {
    key: "updateTooltipText_",
    value:
    /**
     * Updates tooltip text content.
     * @param {!Element} target
     * @param {!Object} embedConfig
     * @private
     */
    function updateTooltipText_(target, embedConfig) {
      var tooltipText = target.getAttribute('data-tooltip-text') || getLocalizationService(this.storyEl_).getLocalizedString(embedConfig.localizedStringId) || getSourceOriginForElement(target, this.getElementHref_(target));
      var existingTooltipText = this.tooltip_.querySelector('.i-amphtml-tooltip-text');
      existingTooltipText.textContent = tooltipText;
    }
    /**
     * Updates tooltip action icon. This is found on the right of the text.
     * @param {!Object} embedConfig
     * @private
     */

  }, {
    key: "updateTooltipActionIcon_",
    value: function updateTooltipActionIcon_(embedConfig) {
      var actionIcon = this.tooltip_.querySelector('.i-amphtml-tooltip-action-icon');
      this.mutator_.mutateElement(dev().assertElement(actionIcon), function () {
        actionIcon.classList.toggle(embedConfig.actionIcon, true);
      });
    }
    /**
     * Updates tooltip icon. If no icon src is declared, it sets a default for a
     * given component type.
     * @param {!Element} target
     * @param {!Object} embedConfig
     * @private
     */

  }, {
    key: "updateTooltipComponentIcon_",
    value: function updateTooltipComponentIcon_(target, embedConfig) {
      var iconUrl = target.getAttribute('data-tooltip-icon');

      if (!isProtocolValid(iconUrl)) {
        user().error(TAG, 'The tooltip icon url is invalid');
        return;
      }

      var tooltipCustomIcon = this.tooltip_.querySelector('.i-amphtml-story-tooltip-custom-icon');

      // No icon src specified by publisher and no default icon in config.
      if (!iconUrl && !embedConfig.customIconClassName) {
        tooltipCustomIcon.classList.toggle('i-amphtml-hidden', true);
        return;
      }

      // Publisher specified a valid icon url.
      if (iconUrl) {
        this.mutator_.mutateElement(dev().assertElement(tooltipCustomIcon), function () {
          setImportantStyles(dev().assertElement(tooltipCustomIcon), {
            'background-image': "url(" + parseUrlDeprecated(iconUrl).href + ")"
          });
        });
        return;
      }

      // No icon src specified by publisher. Use default icon found in the config.
      this.mutator_.mutateElement(dev().assertElement(tooltipCustomIcon), function () {
        tooltipCustomIcon.classList.add(embedConfig.customIconClassName);
      });
    }
    /**
     * Show or hide arrows based on current page.
     * @private
     */

  }, {
    key: "updateNavButtons_",
    value: function updateNavButtons_() {
      if (!this.isLastPage_()) {
        this.buttonLeft_.removeAttribute('hidden');
        this.buttonRight_.removeAttribute('hidden');
      } else {
        this.storeService_.get(StateProperty.RTL_STATE) ? this.buttonLeft_.setAttribute('hidden', true) : this.buttonRight_.setAttribute('hidden', true);
      }
    }
    /**
     * Is last page.
     * @return {boolean}
     * @private
     */

  }, {
    key: "isLastPage_",
    value: function isLastPage_() {
      var pageIndex = this.storeService_.get(StateProperty.CURRENT_PAGE_INDEX);
      var pageCount = this.storeService_.get(StateProperty.PAGE_IDS).length;
      return pageIndex + 1 === pageCount;
    }
    /**
     * Positions tooltip and its pointing arrow according to the position of the
     * target.
     * @param {!InteractiveComponentDef} component
     * @private
     */

  }, {
    key: "positionTooltip_",
    value: function positionTooltip_(component) {
      var _this12 = this;

      var state = {
        arrowOnTop: false
      };
      this.mutator_.measureMutateElement(this.storyEl_,
      /** measure */
      function () {
        var pageRect = _this12.componentPage_.
        /*OK*/
        getBoundingClientRect();

        _this12.horizontalPositioning_(component, pageRect, state);

        _this12.verticalPositioning_(component, pageRect, state);
      },
      /** mutate */
      function () {
        // Arrow on top or bottom of tooltip.
        _this12.tooltip_.classList.toggle('i-amphtml-tooltip-arrow-on-top', state.arrowOnTop);

        setImportantStyles(dev().assertElement(_this12.tooltipArrow_), {
          left: state.arrowLeftOffset + "px"
        });
        setImportantStyles(devAssert(_this12.tooltip_), {
          top: state.tooltipTop + "px",
          left: state.tooltipLeft + "px"
        });
      });
    }
    /**
     * Positions tooltip and its arrow vertically.
     * @param {!InteractiveComponentDef} component
     * @param {!ClientRect} pageRect
     * @param {!Object} state
     * @private
     */

  }, {
    key: "verticalPositioning_",
    value: function verticalPositioning_(component, pageRect, state) {
      var tooltipHeight = this.tooltip_.
      /*OK*/
      offsetHeight;
      var verticalOffset = VERTICAL_EDGE_PADDING;
      state.tooltipTop = component.clientY - tooltipHeight - verticalOffset;

      if (state.tooltipTop < pageRect.top + MIN_VERTICAL_SPACE) {
        // Target is too high up screen, place tooltip facing down with
        // arrow on top.
        state.arrowOnTop = true;
        state.tooltipTop = component.clientY + verticalOffset;
      }
    }
    /**
     * Positions tooltip and its arrow horizontally.
     * @param {!InteractiveComponentDef} component
     * @param {!ClientRect} pageRect
     * @param {!Object} state
     * @private
     */

  }, {
    key: "horizontalPositioning_",
    value: function horizontalPositioning_(component, pageRect, state) {
      var tooltipWidth = this.tooltip_.
      /*OK*/
      offsetWidth;
      state.tooltipLeft = component.clientX - tooltipWidth / 2;
      var maxLeft = pageRect.left + pageRect.width - HORIZONTAL_EDGE_PADDING - tooltipWidth;
      var minLeft = pageRect.left + HORIZONTAL_EDGE_PADDING;
      // Make sure tooltip is inside bounds of the page.
      state.tooltipLeft = Math.min(state.tooltipLeft, maxLeft);
      state.tooltipLeft = Math.max(state.tooltipLeft, minLeft);
      state.arrowLeftOffset = Math.abs(component.clientX - state.tooltipLeft - this.tooltipArrow_.
      /*OK*/
      offsetWidth / 2);
      // Make sure tooltip arrow is inside bounds of the tooltip.
      state.arrowLeftOffset = Math.min(state.arrowLeftOffset, tooltipWidth - TOOLTIP_ARROW_RIGHT_PADDING);
      state.arrowLeftOffset = Math.max(state.arrowLeftOffset, 0);
    }
    /**
     * Handles click outside the tooltip.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onOutsideTooltipClick_",
    value: function onOutsideTooltipClick_(event) {
      var _this13 = this;

      if (!closest(dev().assertElement(event.target), function (el) {
        return el == _this13.tooltip_;
      })) {
        event.stopPropagation();
        this.close_();
      }
    }
    /**
     * Clears any attributes or handlers that may have been added to the tooltip,
     * but weren't used because the user dismissed the tooltip.
     * @private
     */

  }, {
    key: "clearTooltip_",
    value: function clearTooltip_() {
      var _this14 = this;

      this.mutator_.mutateElement(dev().assertElement(this.tooltip_), function () {
        var actionIcon = _this14.tooltip_.querySelector('.i-amphtml-tooltip-action-icon');

        actionIcon.className = 'i-amphtml-tooltip-action-icon';

        var customIcon = _this14.tooltip_.querySelector('.i-amphtml-story-tooltip-custom-icon');

        customIcon.className = 'i-amphtml-story-tooltip-custom-icon';
        resetStyles(customIcon, ['background-image']);

        _this14.tooltip_.removeEventListener('click', _this14.expandComponentHandler_, true);

        _this14.tooltip_.classList.remove(DARK_THEME_CLASS);

        _this14.tooltip_.removeAttribute('href');
      });
    }
    /**
     * Builds the focused state template.
     * @param {!Document} doc
     * @return {!Element}
     * @private
     */

  }, {
    key: "buildFocusedStateTemplate_",
    value: function buildFocusedStateTemplate_(doc) {
      var _this15 = this;

      var html = htmlFor(doc);
      var tooltipOverlay = html(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n      <section\n        class=\"i-amphtml-story-focused-state-layer\n            i-amphtml-story-system-reset i-amphtml-hidden\"\n      >\n        <div\n          class=\"i-amphtml-story-focused-state-layer-nav-button-container\n              i-amphtml-story-tooltip-nav-button-left\"\n        >\n          <button\n            ref=\"buttonLeft\"\n            class=\"i-amphtml-story-focused-state-layer-nav-button\n                i-amphtml-story-tooltip-nav-button-left\"\n          ></button>\n        </div>\n        <div\n          class=\"i-amphtml-story-focused-state-layer-nav-button-container\n              i-amphtml-story-tooltip-nav-button-right\"\n        >\n          <button\n            ref=\"buttonRight\"\n            class=\"i-amphtml-story-focused-state-layer-nav-button\n                    i-amphtml-story-tooltip-nav-button-right\"\n          ></button>\n        </div>\n        <a\n          class=\"i-amphtml-story-tooltip\"\n          target=\"_blank\"\n          ref=\"tooltip\"\n          role=\"tooltip\"\n        >\n          <div class=\"i-amphtml-story-tooltip-custom-icon\"></div>\n          <p class=\"i-amphtml-tooltip-text\" ref=\"text\"></p>\n          <div class=\"i-amphtml-tooltip-action-icon\"></div>\n          <div class=\"i-amphtml-story-tooltip-arrow\" ref=\"arrow\"></div>\n        </a>\n      </section>\n    "])));
      var overlayEls = htmlRefs(tooltipOverlay);
      var arrow =
      /** @type {!tooltipElementsDef} */
      overlayEls.arrow,
          buttonLeft =
      /** @type {!tooltipElementsDef} */
      overlayEls.buttonLeft,
          buttonRight =
      /** @type {!tooltipElementsDef} */
      overlayEls.buttonRight,
          tooltip =
      /** @type {!tooltipElementsDef} */
      overlayEls.tooltip;
      this.tooltip_ = tooltip;
      this.tooltipArrow_ = arrow;
      this.buttonLeft_ = buttonLeft;
      this.buttonRight_ = buttonRight;
      var rtlState = this.storeService_.get(StateProperty.RTL_STATE);
      this.buttonLeft_.addEventListener('click', function (e) {
        return _this15.onNavigationalClick_(e, rtlState ? EventType.NEXT_PAGE : EventType.PREVIOUS_PAGE);
      });
      this.buttonRight_.addEventListener('click', function (e) {
        return _this15.onNavigationalClick_(e, rtlState ? EventType.PREVIOUS_PAGE : EventType.NEXT_PAGE);
      });
      return tooltipOverlay;
    }
    /**
     * Navigates to next/previous page.
     * @param {!Event} event
     * @param {string} direction
     * @private
     */

  }, {
    key: "onNavigationalClick_",
    value: function onNavigationalClick_(event, direction) {
      event.preventDefault();
      this.storeService_.dispatch(Action.SET_ADVANCEMENT_MODE, AdvancementMode.MANUAL_ADVANCE);
      dispatch(this.win_, dev().assertElement(this.shadowRoot_), direction, undefined, {
        bubbles: true
      });
    }
    /**
     * Linkers don't work on shadow root elements so we click a clone of the anchor on the root dom.
     * @param {!Event} event
     * @private
     */

  }, {
    key: "onAnchorClick_",
    value: function onAnchorClick_(event) {
      event.preventDefault();
      triggerClickFromLightDom(this.tooltip_, this.storyEl_);
    }
    /**
     * @visibleForTesting
     * @return {?Element}
     */

  }, {
    key: "getShadowRootForTesting",
    value: function getShadowRootForTesting() {
      return this.shadowRoot_;
    }
  }], [{
    key: "prepareForAnimation",
    value: function prepareForAnimation(pageEl, element, mutator) {
      var elId = null;

      // When a window resize happens, we must reset the styles and prepare the
      // animation again.
      if (element.hasAttribute(EMBED_ID_ATTRIBUTE_NAME)) {
        elId = parseInt(element.getAttribute(EMBED_ID_ATTRIBUTE_NAME), 10);
        var embedStyleEl = dev().assertElement(embedStyleEls[elId], "Failed to look up embed style element with ID " + elId);
        embedStyleEl.textContent = '';
        embedStyleEl[AMP_EMBED_DATA] = {};
      }

      var state = {};
      mutator.measureMutateElement(element,
      /** measure */
      function () {
        var pageRect = pageEl.
        /*OK*/
        getBoundingClientRect();
        var elRect = element.
        /*OK*/
        getBoundingClientRect();
        state = measureStyleForEl(element, state, pageRect, elRect);
      },
      /** mutate */
      function () {
        elId = elId ? elId : ++embedIds;

        if (!element.hasAttribute(EMBED_ID_ATTRIBUTE_NAME)) {
          // First time creating <style> element for embed.
          var html = htmlFor(pageEl);

          var _embedStyleEl = html(_templateObject3 || (_templateObject3 = _taggedTemplateLiteralLoose([" <style></style> "])));

          element.setAttribute(EMBED_ID_ATTRIBUTE_NAME, elId);
          pageEl.insertBefore(_embedStyleEl, pageEl.firstChild);
          embedStyleEls[elId] = _embedStyleEl;
        }

        embedStyleEls[elId][AMP_EMBED_DATA] = _extends({}, updateStyleForEl(element, elId, state));
        var embedStyleEl = dev().assertElement(embedStyleEls[elId], "Failed to look up embed style element with ID " + elId);
        updateEmbedStyleEl(element, embedStyleEl, embedStyleEl[AMP_EMBED_DATA]);
      });
    }
  }]);

  return AmpStoryEmbeddedComponent;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1lbWJlZGRlZC1jb21wb25lbnQuanMiXSwibmFtZXMiOlsiQWN0aW9uIiwiRW1iZWRkZWRDb21wb25lbnRTdGF0ZSIsIkludGVyYWN0aXZlQ29tcG9uZW50RGVmIiwiU3RhdGVQcm9wZXJ0eSIsIlVJVHlwZSIsImdldFN0b3JlU2VydmljZSIsIkFkdmFuY2VtZW50TW9kZSIsIlN0b3J5QW5hbHl0aWNzRXZlbnQiLCJnZXRBbmFseXRpY3NTZXJ2aWNlIiwiQ1NTIiwiRXZlbnRUeXBlIiwiZGlzcGF0Y2giLCJLZXlzIiwiTG9jYWxpemVkU3RyaW5nSWQiLCJTZXJ2aWNlcyIsImFkZEF0dHJpYnV0ZXNUb0VsZW1lbnQiLCJ0cnlGb2N1cyIsImNsb3Nlc3QiLCJtYXRjaGVzIiwiY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZSIsImdldFNvdXJjZU9yaWdpbkZvckVsZW1lbnQiLCJ0cmlnZ2VyQ2xpY2tGcm9tTGlnaHREb20iLCJkZXYiLCJkZXZBc3NlcnQiLCJ1c2VyIiwidXNlckFzc2VydCIsImRpY3QiLCJnZXRBbXBkb2MiLCJnZXRMb2NhbGl6YXRpb25TZXJ2aWNlIiwiaHRtbEZvciIsImh0bWxSZWZzIiwiaXNQcm90b2NvbFZhbGlkIiwicGFyc2VVcmxEZXByZWNhdGVkIiwicHgiLCJyZXNldFN0eWxlcyIsInNldEltcG9ydGFudFN0eWxlcyIsInRvZ2dsZSIsIkFjdGlvbkljb24iLCJMQVVOQ0giLCJFWFBBTkQiLCJUT09MVElQX0NMT1NFX0FOSU1BVElPTl9NUyIsIkRBUktfVEhFTUVfQ0xBU1MiLCJUb29sdGlwVGhlbWUiLCJMSUdIVCIsIkRBUksiLCJNQVhfVFdFRVRfV0lEVEhfUFgiLCJFWFBBTkRBQkxFX0NPTVBPTkVOVFMiLCJjdXN0b21JY29uQ2xhc3NOYW1lIiwiYWN0aW9uSWNvbiIsImxvY2FsaXplZFN0cmluZ0lkIiwiQU1QX1NUT1JZX1RPT0xUSVBfRVhQQU5EX1RXRUVUIiwic2VsZWN0b3IiLCJMQVVOQ0hBQkxFX0NPTVBPTkVOVFMiLCJJTlRFUkFDVElWRV9DT01QT05FTlRTIiwiZ2V0Q29tcG9uZW50U2VsZWN0b3JzIiwiY29tcG9uZW50cyIsIm9wdF9wcmVkaWNhdGUiLCJjb21wb25lbnRTZWxlY3RvcnMiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImNvbXBvbmVudE5hbWUiLCJJTlRFUkFDVElWRV9FTUJFRF9TRUxFQ1RPUiIsImV4cGFuZGFibGVFbGVtZW50c1NlbGVjdG9ycyIsImludGVyYWN0aXZlU2VsZWN0b3JzIiwiRVhQQU5ERURfVklFV19PVkVSTEFZIiwiaW50ZXJhY3RpdmVFbGVtZW50c1NlbGVjdG9ycyIsImVtYmVkU3R5bGVFbHMiLCJlbWJlZElkcyIsIkFNUF9FTUJFRF9EQVRBIiwiRW1iZWREYXRhRGVmIiwiRU1CRURfSURfQVRUUklCVVRFX05BTUUiLCJidWlsZEV4cGFuZGVkVmlld092ZXJsYXkiLCJlbGVtZW50IiwidXBkYXRlRW1iZWRTdHlsZUVsIiwidGFyZ2V0IiwiZW1iZWRTdHlsZUVsIiwiZW1iZWREYXRhIiwiZW1iZWRJZCIsImlkIiwidGV4dENvbnRlbnQiLCJidWlsZFN0cmluZ1N0eWxlRnJvbUVsIiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwiYnVpbGRTdHJpbmdTdHlsZUZvclR3ZWV0IiwiYnVpbGREZWZhdWx0U3RyaW5nU3R5bGUiLCJ3aWR0aCIsInRyYW5zZm9ybSIsInZlcnRpY2FsTWFyZ2luIiwiaG9yaXpvbnRhbE1hcmdpbiIsImhlaWdodCIsIm1lYXN1cmVTdHlsZUZvckVsIiwic3RhdGUiLCJwYWdlUmVjdCIsImVsUmVjdCIsIm1lYXN1cmVTdHlsZXNGb3JUd2l0dGVyIiwibWVhc3VyZURlZmF1bHRTdHlsZXMiLCJuZXdXaWR0aCIsIk1hdGgiLCJtaW4iLCJzY2FsZUZhY3RvciIsInNocmlua2VkU2l6ZSIsIm5ld0hlaWdodCIsIm1heEhlaWdodCIsIlZFUlRJQ0FMX1BBRERJTkciLCJ1cGRhdGVTdHlsZUZvckVsIiwiZWxJZCIsInVwZGF0ZVN0eWxlc0ZvclR3aXR0ZXIiLCJ1cGRhdGVEZWZhdWx0U3R5bGVzIiwiTUlOX1ZFUlRJQ0FMX1NQQUNFIiwiVkVSVElDQUxfRURHRV9QQURESU5HIiwiSE9SSVpPTlRBTF9FREdFX1BBRERJTkciLCJUT09MVElQX0FSUk9XX1JJR0hUX1BBRERJTkciLCJ0b29sdGlwRWxlbWVudHNEZWYiLCJUQUciLCJBbXBTdG9yeUVtYmVkZGVkQ29tcG9uZW50Iiwid2luIiwic3RvcnlFbCIsIndpbl8iLCJzdG9yeUVsXyIsInNoYWRvd1Jvb3RfIiwiZm9jdXNlZFN0YXRlT3ZlcmxheV8iLCJ0b29sdGlwXyIsInRvb2x0aXBBcnJvd18iLCJzdG9yZVNlcnZpY2VfIiwibXV0YXRvcl8iLCJtdXRhdG9yRm9yRG9jIiwiZG9jdW1lbnQiLCJhbmFseXRpY3NTZXJ2aWNlXyIsIm93bmVyc18iLCJvd25lcnNGb3JEb2MiLCJ0aW1lcl8iLCJ0aW1lckZvciIsImV4cGFuZGVkVmlld092ZXJsYXlfIiwidHJpZ2dlcmluZ1RhcmdldF8iLCJjb21wb25lbnRQYWdlXyIsImV4cGFuZENvbXBvbmVudEhhbmRsZXJfIiwib25FeHBhbmRDb21wb25lbnRfIiwiYmluZCIsImVtYmVkc1RvQmVQYXVzZWRfIiwic3Vic2NyaWJlIiwiSU5URVJBQ1RJVkVfQ09NUE9ORU5UX1NUQVRFIiwiY29tcG9uZW50Iiwib25Db21wb25lbnRTdGF0ZVVwZGF0ZV8iLCJoaXN0b3J5U2VydmljZV8iLCJoaXN0b3J5Rm9yRG9jIiwic3RhdGVfIiwiSElEREVOIiwiYnV0dG9uTGVmdF8iLCJidXR0b25SaWdodF8iLCJoaXN0b3J5SWRfIiwic2V0U3RhdGVfIiwiRk9DVVNFRCIsIndhcm4iLCJFWFBBTkRFRCIsIm1heWJlQ2xvc2VFeHBhbmRlZFZpZXdfIiwib25Gb2N1c2VkU3RhdGVVcGRhdGVfIiwidHJpZ2dlckV2ZW50IiwiRk9DVVMiLCJzY2hlZHVsZUVtYmVkVG9QYXVzZV8iLCJ0b2dnbGVFeHBhbmRlZFZpZXdfIiwicHVzaCIsImNsb3NlXyIsInRoZW4iLCJoaXN0b3J5SWQiLCJlbWJlZEVsIiwic2NoZWR1bGVSZXN1bWUiLCJpbmNsdWRlcyIsInRhcmdldFRvRXhwYW5kIiwibXV0YXRlRWxlbWVudCIsImNsYXNzTGlzdCIsImFzc2VydEVsZW1lbnQiLCJjbG9zZUV4cGFuZGVkRWxfIiwiYW5pbWF0ZUV4cGFuZGVkXyIsInF1ZXJ5U2VsZWN0b3IiLCJidWlsZEFuZEFwcGVuZEV4cGFuZGVkVmlld092ZXJsYXlfIiwiY2xvc2VCdXR0b24iLCJsb2NhbGl6YXRpb25TZXJ2aWNlIiwibG9jYWxpemVkQ2xvc2VTdHJpbmciLCJnZXRMb2NhbGl6ZWRTdHJpbmciLCJBTVBfU1RPUllfQ0xPU0VfQlVUVE9OX0xBQkVMIiwic2V0QXR0cmlidXRlIiwiYXBwZW5kQ2hpbGQiLCJmb3JjZUNsb3NlIiwiZ29CYWNrIiwiY3JlYXRlRWxlbWVudCIsImJ1aWxkRm9jdXNlZFN0YXRlVGVtcGxhdGVfIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwib25PdXRzaWRlVG9vbHRpcENsaWNrXyIsInN0b3BQcm9wYWdhdGlvbiIsIkNMSUNLX1RIUk9VR0giLCJocmVmIiwib25BbmNob3JDbGlja18iLCJkZWxheSIsImNsZWFyVG9vbHRpcF8iLCJUT0dHTEVfSU5URVJBQ1RJVkVfQ09NUE9ORU5UIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImJ1aWxkRm9jdXNlZFN0YXRlXyIsImluaXRpYWxpemVMaXN0ZW5lcnNfIiwiYnVpbGRUb29sdGlwXyIsInVwZGF0ZVRvb2x0aXBCZWhhdmlvcl8iLCJ1cGRhdGVUb29sdGlwRWxfIiwiVUlfU1RBVEUiLCJ1aVN0YXRlIiwib25VSVN0YXRlVXBkYXRlXyIsIkNVUlJFTlRfUEFHRV9JRCIsImxlbmd0aCIsInBvcCIsInNjaGVkdWxlUGF1c2UiLCJrZXkiLCJFU0NBUEUiLCJwcmV2ZW50RGVmYXVsdCIsIkRFU0tUT1BfRlVMTEJMRUVEIiwiREVTS1RPUF9QQU5FTFMiLCJyZW1vdmVBdHRyaWJ1dGUiLCJlbWJlZENvbmZpZyIsImdldEVtYmVkQ29uZmlnRm9yXyIsInRoZW1lIiwiZ2V0QXR0cmlidXRlIiwiYWRkIiwidXBkYXRlVG9vbHRpcFRleHRfIiwidXBkYXRlVG9vbHRpcENvbXBvbmVudEljb25fIiwidXBkYXRlVG9vbHRpcEFjdGlvbkljb25fIiwidXBkYXRlTmF2QnV0dG9uc18iLCJwb3NpdGlvblRvb2x0aXBfIiwiZ2V0RWxlbWVudEhyZWZfIiwiZWxVcmwiLCJlcnJvciIsImNvbmZpZyIsIm1lYXN1cmVNdXRhdGVFbGVtZW50IiwidGFyZ2V0UmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInJlYWxIZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJsZWZ0R2FwIiwiZnVsbFNjcmVlbkxlZnQiLCJsZWZ0IiwiY2VudGVyZWRMZWZ0IiwidHJhbnNsYXRlWCIsInRvcEdhcCIsImZ1bGxTY3JlZW5Ub3AiLCJ0b3AiLCJjZW50ZXJlZFRvcCIsInRyYW5zbGF0ZVkiLCJ0b29sdGlwVGV4dCIsImV4aXN0aW5nVG9vbHRpcFRleHQiLCJpY29uVXJsIiwidG9vbHRpcEN1c3RvbUljb24iLCJpc0xhc3RQYWdlXyIsImdldCIsIlJUTF9TVEFURSIsInBhZ2VJbmRleCIsIkNVUlJFTlRfUEFHRV9JTkRFWCIsInBhZ2VDb3VudCIsIlBBR0VfSURTIiwiYXJyb3dPblRvcCIsImhvcml6b250YWxQb3NpdGlvbmluZ18iLCJ2ZXJ0aWNhbFBvc2l0aW9uaW5nXyIsImFycm93TGVmdE9mZnNldCIsInRvb2x0aXBUb3AiLCJ0b29sdGlwTGVmdCIsInRvb2x0aXBIZWlnaHQiLCJ2ZXJ0aWNhbE9mZnNldCIsImNsaWVudFkiLCJ0b29sdGlwV2lkdGgiLCJvZmZzZXRXaWR0aCIsImNsaWVudFgiLCJtYXhMZWZ0IiwibWluTGVmdCIsIm1heCIsImFicyIsImVsIiwiY2xhc3NOYW1lIiwiY3VzdG9tSWNvbiIsInJlbW92ZSIsImRvYyIsImh0bWwiLCJ0b29sdGlwT3ZlcmxheSIsIm92ZXJsYXlFbHMiLCJhcnJvdyIsImJ1dHRvbkxlZnQiLCJidXR0b25SaWdodCIsInRvb2x0aXAiLCJydGxTdGF0ZSIsImUiLCJvbk5hdmlnYXRpb25hbENsaWNrXyIsIk5FWFRfUEFHRSIsIlBSRVZJT1VTX1BBR0UiLCJkaXJlY3Rpb24iLCJTRVRfQURWQU5DRU1FTlRfTU9ERSIsIk1BTlVBTF9BRFZBTkNFIiwidW5kZWZpbmVkIiwiYnViYmxlcyIsInBhZ2VFbCIsIm11dGF0b3IiLCJoYXNBdHRyaWJ1dGUiLCJwYXJzZUludCIsImluc2VydEJlZm9yZSIsImZpcnN0Q2hpbGQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQ0VBLE1BREYsRUFFRUMsc0JBRkYsRUFHRUMsdUJBSEYsRUFJRUMsYUFKRixFQUtFQyxNQUxGLEVBTUVDLGVBTkY7QUFRQSxTQUNFQyxlQURGLEVBRUVDLG1CQUZGLEVBR0VDLG1CQUhGO0FBS0EsU0FBUUMsR0FBUjtBQUNBLFNBQVFDLFNBQVIsRUFBbUJDLFFBQW5CO0FBQ0EsU0FBUUMsSUFBUjtBQUNBLFNBQVFDLGlCQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLHNCQUFSLEVBQWdDQyxRQUFoQztBQUNBLFNBQVFDLE9BQVIsRUFBaUJDLE9BQWpCO0FBQ0EsU0FDRUMseUJBREYsRUFFRUMseUJBRkYsRUFHRUMsd0JBSEY7QUFLQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWIsRUFBd0JDLElBQXhCLEVBQThCQyxVQUE5QjtBQUNBLFNBQVFDLElBQVI7QUFDQSxTQUFRQyxTQUFSO0FBQ0EsU0FBUUMsc0JBQVI7QUFDQSxTQUFRQyxPQUFSLEVBQWlCQyxRQUFqQjtBQUNBLFNBQVFDLGVBQVIsRUFBeUJDLGtCQUF6QjtBQUVBLFNBQVFDLEVBQVIsRUFBWUMsV0FBWixFQUF5QkMsa0JBQXpCLEVBQTZDQyxNQUE3Qzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsVUFBVSxHQUFHO0FBQ2pCQyxFQUFBQSxNQUFNLEVB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akIsRUFBMkJDLE1BQTNCLENBQXpCO0FBQ0QsT0FQSDtBQVFFO0FBQ0Esa0JBQU07QUFDSlksUUFBQUEsSUFBSSxHQUFHQSxJQUFJLEdBQUdBLElBQUgsR0FBVSxFQUFFdEMsUUFBdkI7O0FBQ0EsWUFBSSxDQUFDSyxPQUFPLENBQUMrTixZQUFSLENBQXFCak8sdUJBQXJCLENBQUwsRUFBb0Q7QUFDbEQ7QUFDQSxjQUFNOE0sSUFBSSxHQUFHeFAsT0FBTyxDQUFDeVEsTUFBRCxDQUFwQjs7QUFDQSxjQUFNMU4sYUFBWSxHQUFHeU0sSUFBSCw2RkFBbEI7O0FBRUE1TSxVQUFBQSxPQUFPLENBQUM0RyxZQUFSLENBQXFCOUcsdUJBQXJCLEVBQThDbUMsSUFBOUM7QUFDQTRMLFVBQUFBLE1BQU0sQ0FBQ0ksWUFBUCxDQUFvQjlOLGFBQXBCLEVBQWtDME4sTUFBTSxDQUFDSyxVQUF6QztBQUNBeE8sVUFBQUEsYUFBYSxDQUFDdUMsSUFBRCxDQUFiLEdBQXNCOUIsYUFBdEI7QUFDRDs7QUFFRFQsUUFBQUEsYUFBYSxDQUFDdUMsSUFBRCxDQUFiLENBQW9CckMsY0FBcEIsaUJBQ0tvQyxnQkFBZ0IsQ0FBQ2hDLE9BQUQsRUFBVWlDLElBQVYsRUFBZ0JkLEtBQWhCLENBRHJCO0FBSUEsWUFBTWhCLFlBQVksR0FBR3RELEdBQUcsR0FBR3FKLGFBQU4sQ0FDbkJ4RyxhQUFhLENBQUN1QyxJQUFELENBRE0scURBRThCQSxJQUY5QixDQUFyQjtBQUlBaEMsUUFBQUEsa0JBQWtCLENBQUNELE9BQUQsRUFBVUcsWUFBVixFQUF3QkEsWUFBWSxDQUFDUCxjQUFELENBQXBDLENBQWxCO0FBQ0QsT0E5Qkg7QUFnQ0Q7QUEzcUJIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtcbiAgQWN0aW9uLFxuICBFbWJlZGRlZENvbXBvbmVudFN0YXRlLFxuICBJbnRlcmFjdGl2ZUNvbXBvbmVudERlZixcbiAgU3RhdGVQcm9wZXJ0eSxcbiAgVUlUeXBlLFxuICBnZXRTdG9yZVNlcnZpY2UsXG59IGZyb20gJy4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UnO1xuaW1wb3J0IHtcbiAgQWR2YW5jZW1lbnRNb2RlLFxuICBTdG9yeUFuYWx5dGljc0V2ZW50LFxuICBnZXRBbmFseXRpY3NTZXJ2aWNlLFxufSBmcm9tICcuL3N0b3J5LWFuYWx5dGljcyc7XG5pbXBvcnQge0NTU30gZnJvbSAnLi4vLi4vLi4vYnVpbGQvYW1wLXN0b3J5LXRvb2x0aXAtMS4wLmNzcyc7XG5pbXBvcnQge0V2ZW50VHlwZSwgZGlzcGF0Y2h9IGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCB7S2V5c30gZnJvbSAnI2NvcmUvY29uc3RhbnRzL2tleS1jb2Rlcyc7XG5pbXBvcnQge0xvY2FsaXplZFN0cmluZ0lkfSBmcm9tICcjc2VydmljZS9sb2NhbGl6YXRpb24vc3RyaW5ncyc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge2FkZEF0dHJpYnV0ZXNUb0VsZW1lbnQsIHRyeUZvY3VzfSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtjbG9zZXN0LCBtYXRjaGVzfSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuaW1wb3J0IHtcbiAgY3JlYXRlU2hhZG93Um9vdFdpdGhTdHlsZSxcbiAgZ2V0U291cmNlT3JpZ2luRm9yRWxlbWVudCxcbiAgdHJpZ2dlckNsaWNrRnJvbUxpZ2h0RG9tLFxufSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnQsIHVzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtnZXRBbXBkb2N9IGZyb20gJy4uLy4uLy4uL3NyYy9zZXJ2aWNlLWhlbHBlcnMnO1xuaW1wb3J0IHtnZXRMb2NhbGl6YXRpb25TZXJ2aWNlfSBmcm9tICcuL2FtcC1zdG9yeS1sb2NhbGl6YXRpb24tc2VydmljZSc7XG5pbXBvcnQge2h0bWxGb3IsIGh0bWxSZWZzfSBmcm9tICcjY29yZS9kb20vc3RhdGljLXRlbXBsYXRlJztcbmltcG9ydCB7aXNQcm90b2NvbFZhbGlkLCBwYXJzZVVybERlcHJlY2F0ZWR9IGZyb20gJy4uLy4uLy4uL3NyYy91cmwnO1xuXG5pbXBvcnQge3B4LCByZXNldFN0eWxlcywgc2V0SW1wb3J0YW50U3R5bGVzLCB0b2dnbGV9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5cbi8qKlxuICogQWN0aW9uIGljb25zIHRvIGJlIHBsYWNlZCBpbiB0b29sdGlwLlxuICogQGVudW0ge3N0cmluZ31cbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IEFjdGlvbkljb24gPSB7XG4gIExBVU5DSDogJ2ktYW1waHRtbC10b29sdGlwLWFjdGlvbi1pY29uLWxhdW5jaCcsXG4gIEVYUEFORDogJ2ktYW1waHRtbC10b29sdGlwLWFjdGlvbi1pY29uLWV4cGFuZCcsXG59O1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtudW1iZXJ9ICovXG5jb25zdCBUT09MVElQX0NMT1NFX0FOSU1BVElPTl9NUyA9IDEwMDtcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgREFSS19USEVNRV9DTEFTUyA9ICdpLWFtcGh0bWwtc3RvcnktdG9vbHRpcC10aGVtZS1kYXJrJztcblxuLyoqXG4gKiBAZW51bSB7c3RyaW5nfVxuICovXG5jb25zdCBUb29sdGlwVGhlbWUgPSB7XG4gIExJR0hUOiAnbGlnaHQnLCAvLyBkZWZhdWx0XG4gIERBUks6ICdkYXJrJyxcbn07XG5cbi8qKlxuICogU2luY2Ugd2UgZG9uJ3Qga25vdyB0aGUgYWN0dWFsIHdpZHRoIG9mIHRoZSBjb250ZW50IGluc2lkZSB0aGUgaWZyYW1lXG4gKiBhbmQgaW4gcmVzcG9uc2l2ZSBlbnZpcm9ubWVudHMgdGhlIGlmcmFtZSB0YWtlcyB0aGUgd2hvbGUgd2lkdGgsIHdlXG4gKiBoYXJkY29kZSBhIGxpbWl0IGJhc2VkIG9uIHdoYXQgd2Uga25vdyBvZiBob3cgdGhlIGVtYmVkIGJlaGF2ZXMgKG9ubHkgdHJ1ZVxuICogZm9yIFR3aXR0ZXIgZW1iZWRzKS4gU2VlICMyMjMzNC5cbiAqIEBjb25zdCB7bnVtYmVyfVxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgTUFYX1RXRUVUX1dJRFRIX1BYID0gNTAwO1xuXG4vKipcbiAqIENvbXBvbmVudHMgdGhhdCBjYW4gYmUgZXhwYW5kZWQuXG4gKiBAY29uc3QgeyFPYmplY3R9XG4gKiBAcGFja2FnZVxuICovXG5leHBvcnQgY29uc3QgRVhQQU5EQUJMRV9DT01QT05FTlRTID0ge1xuICAnYW1wLXR3aXR0ZXInOiB7XG4gICAgY3VzdG9tSWNvbkNsYXNzTmFtZTogJ2FtcC1zb2NpYWwtc2hhcmUtdHdpdHRlci1uby1iYWNrZ3JvdW5kJyxcbiAgICBhY3Rpb25JY29uOiBBY3Rpb25JY29uLkVYUEFORCxcbiAgICBsb2NhbGl6ZWRTdHJpbmdJZDogTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX1RPT0xUSVBfRVhQQU5EX1RXRUVULFxuICAgIHNlbGVjdG9yOiAnYW1wLXR3aXR0ZXInLFxuICB9LFxufTtcblxuLyoqXG4gKiBDb21wb25lbnRzIHRoYXQgY2FuIGJlIGxhdW5jaGVkLlxuICogQGNvbnN0IHshT2JqZWN0fVxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgTEFVTkNIQUJMRV9DT01QT05FTlRTID0ge1xuICAnYSc6IHtcbiAgICBhY3Rpb25JY29uOiBBY3Rpb25JY29uLkxBVU5DSCxcbiAgICBzZWxlY3RvcjogJ2FbaHJlZl06bm90KFthZmZpbGlhdGUtbGluay1pY29uXSknLFxuICB9LFxufTtcblxuLyoqXG4gKiBVbmlvbiBvZiBleHBhbmRhYmxlIGFuZCBsYXVuY2hhYmxlIGNvbXBvbmVudHMuXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0IHshT2JqZWN0fVxuICovXG5jb25zdCBJTlRFUkFDVElWRV9DT01QT05FTlRTID0ge1xuICAuLi5FWFBBTkRBQkxFX0NPTVBPTkVOVFMsXG4gIC4uLkxBVU5DSEFCTEVfQ09NUE9ORU5UUyxcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgbGlzdCBvZiBjb21wb25lbnRzIHdpdGggdGhlaXIgcmVzcGVjdGl2ZSBzZWxlY3RvcnMuXG4gKiBAcGFyYW0geyFPYmplY3R9IGNvbXBvbmVudHNcbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3ByZWRpY2F0ZVxuICogQHJldHVybiB7IU9iamVjdDxzdHJpbmcsIHN0cmluZz59XG4gKi9cbmZ1bmN0aW9uIGdldENvbXBvbmVudFNlbGVjdG9ycyhjb21wb25lbnRzLCBvcHRfcHJlZGljYXRlKSB7XG4gIGNvbnN0IGNvbXBvbmVudFNlbGVjdG9ycyA9IHt9O1xuXG4gIE9iamVjdC5rZXlzKGNvbXBvbmVudHMpLmZvckVhY2goKGNvbXBvbmVudE5hbWUpID0+IHtcbiAgICBjb21wb25lbnRTZWxlY3RvcnNbY29tcG9uZW50TmFtZV0gPSBvcHRfcHJlZGljYXRlXG4gICAgICA/IGNvbXBvbmVudHNbY29tcG9uZW50TmFtZV0uc2VsZWN0b3IgKyBvcHRfcHJlZGljYXRlXG4gICAgICA6IGNvbXBvbmVudHNbY29tcG9uZW50TmFtZV0uc2VsZWN0b3I7XG4gIH0pO1xuXG4gIHJldHVybiBjb21wb25lbnRTZWxlY3RvcnM7XG59XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IElOVEVSQUNUSVZFX0VNQkVEX1NFTEVDVE9SID0gJ1tpbnRlcmFjdGl2ZV0nO1xuXG4vKipcbiAqIFNlbGVjdG9ycyBvZiBlbGVtZW50cyB0aGF0IGNhbiBnbyBpbnRvIGV4cGFuZGVkIHZpZXcuXG4gKiBAcmV0dXJuIHshT2JqZWN0fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhwYW5kYWJsZUVsZW1lbnRzU2VsZWN0b3JzKCkge1xuICAvLyBVc2luZyBpbmRpcmVjdCBpbnZvY2F0aW9uIHRvIHByZXZlbnQgbm8tZXhwb3J0LXNpZGUtZWZmZWN0IGlzc3VlLlxuICByZXR1cm4gZ2V0Q29tcG9uZW50U2VsZWN0b3JzKFxuICAgIEVYUEFOREFCTEVfQ09NUE9ORU5UUyxcbiAgICBJTlRFUkFDVElWRV9FTUJFRF9TRUxFQ1RPUlxuICApO1xufVxuXG4vKipcbiAqIENvbnRhaW5zIGFsbCBpbnRlcmFjdGl2ZSBjb21wb25lbnQgQ1NTIHNlbGVjdG9ycy5cbiAqIEB0eXBlIHshT2JqZWN0fVxuICovXG5jb25zdCBpbnRlcmFjdGl2ZVNlbGVjdG9ycyA9IHtcbiAgLi4uZ2V0Q29tcG9uZW50U2VsZWN0b3JzKExBVU5DSEFCTEVfQ09NUE9ORU5UUyksXG4gIC4uLmdldENvbXBvbmVudFNlbGVjdG9ycyhFWFBBTkRBQkxFX0NPTVBPTkVOVFMsIElOVEVSQUNUSVZFX0VNQkVEX1NFTEVDVE9SKSxcbiAgRVhQQU5ERURfVklFV19PVkVSTEFZOlxuICAgICcuaS1hbXBodG1sLXN0b3J5LWV4cGFuZGVkLXZpZXctb3ZlcmZsb3csICcgK1xuICAgICcuaS1hbXBodG1sLWV4cGFuZGVkLXZpZXctY2xvc2UtYnV0dG9uJyxcbn07XG5cbi8qKlxuICogQWxsIHNlbGVjdG9ycyB0aGF0IHNob3VsZCBkZWxlZ2F0ZSB0byB0aGUgQW1wU3RvcnlFbWJlZGRlZENvbXBvbmVudCBjbGFzcy5cbiAqIEByZXR1cm4geyFPYmplY3R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcmFjdGl2ZUVsZW1lbnRzU2VsZWN0b3JzKCkge1xuICAvLyBVc2luZyBpbmRpcmVjdCBpbnZvY2F0aW9uIHRvIHByZXZlbnQgbm8tZXhwb3J0LXNpZGUtZWZmZWN0IGlzc3VlLlxuICByZXR1cm4gaW50ZXJhY3RpdmVTZWxlY3RvcnM7XG59XG5cbi8qKlxuICogTWFwcyBlYWNoIGVtYmVkZGVkIGVsZW1lbnQgdG8gaXRzIGNvcnJlc3BvbmRpbmcgc3R5bGUuXG4gKiBAdHlwZSB7IUpzb25PYmplY3R9XG4gKi9cbmNvbnN0IGVtYmVkU3R5bGVFbHMgPSBkaWN0KCk7XG5cbi8qKlxuICogR2VuZXJhdGVzIGlkcyBmb3IgZW1iZWRkZWQgY29tcG9uZW50IHN0eWxlcy5cbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cbmxldCBlbWJlZElkcyA9IDA7XG5cbi8qKlxuICogQ29udGFpbnMgbWV0YWRhdGEgYWJvdXQgZW1iZWRkZWQgY29tcG9uZW50cywgZm91bmQgaW4gPHN0eWxlPiBlbGVtZW50cy5cbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5jb25zdCBBTVBfRU1CRURfREFUQSA9ICdfX0FNUF9FTUJFRF9EQVRBX18nO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgaWQ6IG51bWJlcixcbiAqICB3aWR0aDogbnVtYmVyLFxuICogIGhlaWdodDogbnVtYmVyLFxuICogIHNjYWxlRmFjdG9yOiBudW1iZXIsXG4gKiAgdHJhbnNmb3JtOiBzdHJpbmcsXG4gKiAgdmVydGljYWxNYXJnaW46IG51bWJlcixcbiAqICBob3Jpem9udGFsTWFyZ2luOiBudW1iZXIsXG4gKiB9fVxuICovXG5sZXQgRW1iZWREYXRhRGVmO1xuXG4vKipcbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgRU1CRURfSURfQVRUUklCVVRFX05BTUUgPSAnaS1hbXBodG1sLWVtYmVkLWlkJztcblxuLyoqXG4gKiBCdWlsZHMgZXhwYW5kZWQgdmlldyBvdmVybGF5IGZvciBleHBhbmRhYmxlIGNvbXBvbmVudHMuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHshRWxlbWVudH1cbiAqL1xuY29uc3QgYnVpbGRFeHBhbmRlZFZpZXdPdmVybGF5ID0gKGVsZW1lbnQpID0+IGh0bWxGb3IoZWxlbWVudClgXG4gICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1leHBhbmRlZC12aWV3LW92ZXJmbG93IGktYW1waHRtbC1zdG9yeS1zeXN0ZW0tcmVzZXRcIj5cbiAgICAgIDxidXR0b24gY2xhc3M9XCJpLWFtcGh0bWwtZXhwYW5kZWQtdmlldy1jbG9zZS1idXR0b25cIiBhcmlhLWxhYmVsPVwiY2xvc2VcIiByb2xlPVwiYnV0dG9uXCI+PC9idXR0b24+XG4gICAgPC9kaXY+YDtcblxuLyoqXG4gKiBVcGRhdGVzIGVtYmVkJ3MgY29ycmVzcG9uZGluZyA8c3R5bGU+IGVsZW1lbnQgd2l0aCBlbWJlZERhdGEuXG4gKiBAcGFyYW0geyFFbGVtZW50fSB0YXJnZXRcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVtYmVkU3R5bGVFbFxuICogQHBhcmFtIHshRW1iZWREYXRhRGVmfSBlbWJlZERhdGFcbiAqL1xuZnVuY3Rpb24gdXBkYXRlRW1iZWRTdHlsZUVsKHRhcmdldCwgZW1iZWRTdHlsZUVsLCBlbWJlZERhdGEpIHtcbiAgY29uc3QgZW1iZWRJZCA9IGVtYmVkRGF0YS5pZDtcbiAgZW1iZWRTdHlsZUVsLnRleHRDb250ZW50ID0gYFske0VNQkVEX0lEX0FUVFJJQlVURV9OQU1FfT1cIiR7ZW1iZWRJZH1cIl1cbiAgJHtidWlsZFN0cmluZ1N0eWxlRnJvbUVsKHRhcmdldCwgZW1iZWREYXRhKX1gO1xufVxuXG4vKipcbiAqIEJ1aWxkcyBhIHN0cmluZyBjb250YWluaW5nIHRoZSBjb3JyZXNwb25kaW5nIHN0eWxlIGRlcGVuZGluZyBvbiB0aGVcbiAqIGVsZW1lbnQuXG4gKiBAcGFyYW0geyFFbGVtZW50fSB0YXJnZXRcbiAqIEBwYXJhbSB7IUVtYmVkRGF0YURlZn0gZW1iZWREYXRhXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGJ1aWxkU3RyaW5nU3R5bGVGcm9tRWwodGFyZ2V0LCBlbWJlZERhdGEpIHtcbiAgc3dpdGNoICh0YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSBFWFBBTkRBQkxFX0NPTVBPTkVOVFNbJ2FtcC10d2l0dGVyJ10uc2VsZWN0b3I6XG4gICAgICByZXR1cm4gYnVpbGRTdHJpbmdTdHlsZUZvclR3ZWV0KGVtYmVkRGF0YSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBidWlsZERlZmF1bHRTdHJpbmdTdHlsZShlbWJlZERhdGEpO1xuICB9XG59XG5cbi8qKlxuICogQnVpbGRzIHN0cmluZyB1c2VkIGluIHRoZSA8c3R5bGU+IGVsZW1lbnQgZm9yIHR3ZWV0cy4gV2UgaWdub3JlIHRoZSBoZWlnaHRcbiAqIGFzIGl0cyBub24tZGV0ZXJtaW5pc3RpYy5cbiAqIEBwYXJhbSB7IUVtYmVkRGF0YURlZn0gZW1iZWREYXRhXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGJ1aWxkU3RyaW5nU3R5bGVGb3JUd2VldChlbWJlZERhdGEpIHtcbiAgcmV0dXJuIGB7XG4gICAgd2lkdGg6ICR7cHgoZW1iZWREYXRhLndpZHRoKX0gIWltcG9ydGFudDtcbiAgICB0cmFuc2Zvcm06ICR7ZW1iZWREYXRhLnRyYW5zZm9ybX0gIWltcG9ydGFudDtcbiAgICBtYXJnaW46ICR7ZW1iZWREYXRhLnZlcnRpY2FsTWFyZ2lufXB4ICR7XG4gICAgZW1iZWREYXRhLmhvcml6b250YWxNYXJnaW5cbiAgfXB4ICFpbXBvcnRhbnQ7XG4gICAgfWA7XG59XG5cbi8qKlxuICogQnVpbGRzIHN0cmluZyB1c2VkIGluIHRoZSA8c3R5bGU+IGVsZW1lbnQgZm9yIGRlZmF1bHQgZW1iZWRzLlxuICogQHBhcmFtIHshRW1iZWREYXRhRGVmfSBlbWJlZERhdGFcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gYnVpbGREZWZhdWx0U3RyaW5nU3R5bGUoZW1iZWREYXRhKSB7XG4gIHJldHVybiBge1xuICAgIHdpZHRoOiAke3B4KGVtYmVkRGF0YS53aWR0aCl9ICFpbXBvcnRhbnQ7XG4gICAgaGVpZ2h0OiAke3B4KGVtYmVkRGF0YS5oZWlnaHQpfSAhaW1wb3J0YW50O1xuICAgIHRyYW5zZm9ybTogJHtlbWJlZERhdGEudHJhbnNmb3JtfSAhaW1wb3J0YW50O1xuICAgIG1hcmdpbjogJHtlbWJlZERhdGEudmVydGljYWxNYXJnaW59cHggJHtcbiAgICBlbWJlZERhdGEuaG9yaXpvbnRhbE1hcmdpblxuICB9cHggIWltcG9ydGFudDtcbiAgICB9YDtcbn1cblxuLyoqXG4gKiBNZWFzdXJlcyBzdHlsZXMgZm9yIGEgZ2l2ZW4gZWxlbWVudCBpbiBwcmVwYXJhdGlvbiBmb3IgaXRzIGV4cGFuZGVkIGFuaW1hdGlvbi5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7IU9iamVjdH0gc3RhdGVcbiAqIEBwYXJhbSB7IURPTVJlY3R9IHBhZ2VSZWN0XG4gKiBAcGFyYW0geyFET01SZWN0fSBlbFJlY3RcbiAqIEByZXR1cm4geyFPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIG1lYXN1cmVTdHlsZUZvckVsKGVsZW1lbnQsIHN0YXRlLCBwYWdlUmVjdCwgZWxSZWN0KSB7XG4gIHN3aXRjaCAoZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlIEVYUEFOREFCTEVfQ09NUE9ORU5UU1snYW1wLXR3aXR0ZXInXS5zZWxlY3RvcjpcbiAgICAgIHJldHVybiBtZWFzdXJlU3R5bGVzRm9yVHdpdHRlcihzdGF0ZSwgcGFnZVJlY3QsIGVsUmVjdCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBtZWFzdXJlRGVmYXVsdFN0eWxlcyhzdGF0ZSwgcGFnZVJlY3QsIGVsUmVjdCk7XG4gIH1cbn1cblxuLyoqXG4gKiBTaW5jZSBhbXAtdHdpdHRlciBoYW5kbGVzIGl0cyBvd24gcmVzaXplIGV2ZW50cyBmb3IgaXRzIGhlaWdodCwgd2UgZG9uJ3RcbiAqIHJlc2l6ZSBiYXNlZCBvbiBpdHMgaGVpZ2h0LCBidXQgcmF0aGVyIGp1c3QgYmFzZWQgb24gaXRzIHdpZHRoLlxuICogQHBhcmFtIHshT2JqZWN0fSBzdGF0ZVxuICogQHBhcmFtIHshRE9NUmVjdH0gcGFnZVJlY3RcbiAqIEBwYXJhbSB7IURPTVJlY3R9IGVsUmVjdFxuICogQHJldHVybiB7IU9iamVjdH1cbiAqL1xuZnVuY3Rpb24gbWVhc3VyZVN0eWxlc0ZvclR3aXR0ZXIoc3RhdGUsIHBhZ2VSZWN0LCBlbFJlY3QpIHtcbiAgLy8gSWYgc2NyZWVuIGlzIHZlcnkgd2lkZSBhbmQgc3RvcnkgaGFzIHN1cHBvcnRzLWxhbmRzY2FwZSBhdHRyaWJ1dGUsXG4gIC8vIHdlIGRvbid0IHdhbnQgaXQgdG8gdGFrZSB0aGUgd2hvbGUgd2lkdGguIFdlIHRha2UgdGhlIG1heGltdW0gd2lkdGhcbiAgLy8gdGhhdCB0aGUgdHdlZXQgY2FuIGFjdHVhbGx5IHVzZSBpbnN0ZWFkLlxuICBzdGF0ZS5uZXdXaWR0aCA9IE1hdGgubWluKHBhZ2VSZWN0LndpZHRoLCBNQVhfVFdFRVRfV0lEVEhfUFgpO1xuXG4gIHN0YXRlLnNjYWxlRmFjdG9yID1cbiAgICBNYXRoLm1pbihlbFJlY3Qud2lkdGgsIE1BWF9UV0VFVF9XSURUSF9QWCkgLyBzdGF0ZS5uZXdXaWR0aDtcblxuICBjb25zdCBzaHJpbmtlZFNpemUgPSBlbFJlY3QuaGVpZ2h0ICogc3RhdGUuc2NhbGVGYWN0b3I7XG5cbiAgc3RhdGUudmVydGljYWxNYXJnaW4gPSAtMSAqICgoZWxSZWN0LmhlaWdodCAtIHNocmlua2VkU2l6ZSkgLyAyKTtcbiAgc3RhdGUuaG9yaXpvbnRhbE1hcmdpbiA9IC0xICogKChzdGF0ZS5uZXdXaWR0aCAtIGVsUmVjdC53aWR0aCkgLyAyKTtcblxuICByZXR1cm4gc3RhdGU7XG59XG5cbi8qKlxuICogTWVhc3VyZXMgc3R5bGVzIGZvciBhIGdpdmVuIGVsZW1lbnQgaW4gcHJlcGFyYXRpb24gZm9yIGl0cyBleHBhbmRlZFxuICogYW5pbWF0aW9uLlxuICogQHBhcmFtIHshT2JqZWN0fSBzdGF0ZVxuICogQHBhcmFtIHshRE9NUmVjdH0gcGFnZVJlY3RcbiAqIEBwYXJhbSB7IURPTVJlY3R9IGVsUmVjdFxuICogQHJldHVybiB7IU9iamVjdH1cbiAqL1xuZnVuY3Rpb24gbWVhc3VyZURlZmF1bHRTdHlsZXMoc3RhdGUsIHBhZ2VSZWN0LCBlbFJlY3QpIHtcbiAgaWYgKGVsUmVjdC53aWR0aCA+PSBlbFJlY3QuaGVpZ2h0KSB7XG4gICAgc3RhdGUubmV3V2lkdGggPSBwYWdlUmVjdC53aWR0aDtcbiAgICBzdGF0ZS5zY2FsZUZhY3RvciA9IGVsUmVjdC53aWR0aCAvIHN0YXRlLm5ld1dpZHRoO1xuICAgIHN0YXRlLm5ld0hlaWdodCA9IChlbFJlY3QuaGVpZ2h0IC8gZWxSZWN0LndpZHRoKSAqIHN0YXRlLm5ld1dpZHRoO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IG1heEhlaWdodCA9IHBhZ2VSZWN0LmhlaWdodCAtIFZFUlRJQ0FMX1BBRERJTkc7XG4gICAgc3RhdGUubmV3V2lkdGggPSBNYXRoLm1pbihcbiAgICAgIChlbFJlY3Qud2lkdGggLyBlbFJlY3QuaGVpZ2h0KSAqIG1heEhlaWdodCxcbiAgICAgIHBhZ2VSZWN0LndpZHRoXG4gICAgKTtcbiAgICBzdGF0ZS5uZXdIZWlnaHQgPSAoZWxSZWN0LmhlaWdodCAvIGVsUmVjdC53aWR0aCkgKiBzdGF0ZS5uZXdXaWR0aDtcbiAgICBzdGF0ZS5zY2FsZUZhY3RvciA9IGVsUmVjdC5oZWlnaHQgLyBzdGF0ZS5uZXdIZWlnaHQ7XG4gIH1cblxuICBzdGF0ZS52ZXJ0aWNhbE1hcmdpbiA9IC0xICogKChzdGF0ZS5uZXdIZWlnaHQgLSBlbFJlY3QuaGVpZ2h0KSAvIDIpO1xuICBzdGF0ZS5ob3Jpem9udGFsTWFyZ2luID0gLTEgKiAoKHN0YXRlLm5ld1dpZHRoIC0gZWxSZWN0LndpZHRoKSAvIDIpO1xuXG4gIHJldHVybiBzdGF0ZTtcbn1cblxuLyoqXG4gKiBHZXRzIHVwZGF0ZWQgc3R5bGUgb2JqZWN0IGZvciBhIGdpdmVuIGVsZW1lbnQuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge251bWJlcn0gZWxJZFxuICogQHBhcmFtIHshT2JqZWN0fSBzdGF0ZVxuICogQHJldHVybiB7IU9iamVjdH1cbiAqL1xuZnVuY3Rpb24gdXBkYXRlU3R5bGVGb3JFbChlbGVtZW50LCBlbElkLCBzdGF0ZSkge1xuICBzd2l0Y2ggKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSBFWFBBTkRBQkxFX0NPTVBPTkVOVFNbJ2FtcC10d2l0dGVyJ10uc2VsZWN0b3I6XG4gICAgICByZXR1cm4gdXBkYXRlU3R5bGVzRm9yVHdpdHRlcihlbElkLCBzdGF0ZSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1cGRhdGVEZWZhdWx0U3R5bGVzKGVsSWQsIHN0YXRlKTtcbiAgfVxufVxuXG4vKipcbiAqIEdldHMgc3R5bGUgb2JqZWN0IGZvciBhbiBlbWJlZGRlZCBjb21wb25lbnQsIHNldHRpbmcgbmVnYXRpdmUgbWFyZ2luc1xuICogdG8gbWFrZSB1cCBmb3IgdGhlIGV4cGFuZGVkIHNpemUgaW4gcHJlcGFyYXRpb24gb2YgdGhlIGV4cGFuZGVkIGFuaW1hdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBlbElkXG4gKiBAcGFyYW0geyFPYmplY3R9IHN0YXRlXG4gKiBAcmV0dXJuIHshT2JqZWN0fVxuICovXG5mdW5jdGlvbiB1cGRhdGVEZWZhdWx0U3R5bGVzKGVsSWQsIHN0YXRlKSB7XG4gIHJldHVybiB7XG4gICAgaWQ6IGVsSWQsXG4gICAgd2lkdGg6IHN0YXRlLm5ld1dpZHRoLFxuICAgIGhlaWdodDogc3RhdGUubmV3SGVpZ2h0LFxuICAgIHNjYWxlRmFjdG9yOiBzdGF0ZS5zY2FsZUZhY3RvcixcbiAgICB0cmFuc2Zvcm06IGBzY2FsZSgke3N0YXRlLnNjYWxlRmFjdG9yfSlgLFxuICAgIHZlcnRpY2FsTWFyZ2luOiBzdGF0ZS52ZXJ0aWNhbE1hcmdpbixcbiAgICBob3Jpem9udGFsTWFyZ2luOiBzdGF0ZS5ob3Jpem9udGFsTWFyZ2luLFxuICB9O1xufVxuXG4vKipcbiAqIEdldHMgc3R5bGUgb2JqZWN0IGZvciB0d2l0dGVyLiBOb3RpY2UgdGhlcmUgaXMgbm8gaGVpZ2h0IG9yIHZlcnRpY2FsIG1hcmdpblxuICogc2luY2Ugd2UgZG9uJ3Qga25vdyB0aGUgZmluYWwgaGVpZ2h0IG9mIHR3ZWV0cyBldmVuIGFmdGVyIGxheW91dCwgc28gd2UganVzdFxuICogbGV0IHRoZSBlbWJlZCBoYW5kbGUgaXRzIG93biBoZWlnaHQuXG4gKiBAcGFyYW0ge251bWJlcn0gZWxJZFxuICogQHBhcmFtIHshT2JqZWN0fSBzdGF0ZVxuICogQHJldHVybiB7IU9iamVjdH1cbiAqL1xuZnVuY3Rpb24gdXBkYXRlU3R5bGVzRm9yVHdpdHRlcihlbElkLCBzdGF0ZSkge1xuICByZXR1cm4ge1xuICAgIGlkOiBlbElkLFxuICAgIHdpZHRoOiBzdGF0ZS5uZXdXaWR0aCxcbiAgICBzY2FsZUZhY3Rvcjogc3RhdGUuc2NhbGVGYWN0b3IsXG4gICAgdHJhbnNmb3JtOiBgc2NhbGUoJHtzdGF0ZS5zY2FsZUZhY3Rvcn0pYCxcbiAgICBob3Jpem9udGFsTWFyZ2luOiBzdGF0ZS5ob3Jpem9udGFsTWFyZ2luLFxuICAgIHZlcnRpY2FsTWFyZ2luOiBzdGF0ZS52ZXJ0aWNhbE1hcmdpbixcbiAgfTtcbn1cblxuLyoqXG4gKiBNaW5pbXVtIHZlcnRpY2FsIHNwYWNlIG5lZWRlZCB0byBwb3NpdGlvbiB0b29sdGlwLlxuICogQGNvbnN0IHtudW1iZXJ9XG4gKi9cbmNvbnN0IE1JTl9WRVJUSUNBTF9TUEFDRSA9IDQ4O1xuXG4vKipcbiAqIExpbWl0cyB0aGUgYW1vdW50IG9mIHZlcnRpY2FsIHNwYWNlIGEgY29tcG9uZW50IGNhbiB0YWtlIGluIGEgcGFnZSwgdGhpc1xuICogbWFrZXMgc3VyZSBubyBjb21wb25lbnQgaXMgYmxvY2tpbmcgdGhlIGNsb3NlIGJ1dHRvbiBhdCB0aGUgdG9wIG9mIHRoZVxuICogZXhwYW5kZWQgdmlldy5cbiAqIEBjb25zdCB7bnVtYmVyfVxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgVkVSVElDQUxfUEFERElORyA9IDk2O1xuXG4vKipcbiAqIFBhZGRpbmcgYmV0d2VlbiB0b29sdGlwIGFuZCB2ZXJ0aWNhbCBlZGdlcyBvZiBzY3JlZW4uXG4gKiBAY29uc3Qge251bWJlcn1cbiAqL1xuY29uc3QgVkVSVElDQUxfRURHRV9QQURESU5HID0gMjQ7XG5cbi8qKlxuICogUGFkZGluZyBiZXR3ZWVuIHRvb2x0aXAgYW5kIGhvcml6b250YWwgZWRnZXMgb2Ygc2NyZWVuLlxuICogQGNvbnN0IHtudW1iZXJ9XG4gKi9cbmNvbnN0IEhPUklaT05UQUxfRURHRV9QQURESU5HID0gMzI7XG5cbi8qKlxuICogUGFkZGluZyBiZXR3ZWVuIHRvb2x0aXAgYXJyb3cgYW5kIHJpZ2h0IGVkZ2Ugb2YgdGhlIHRvb2x0aXAuXG4gKiBAY29uc3Qge251bWJlcn1cbiAqL1xuY29uc3QgVE9PTFRJUF9BUlJPV19SSUdIVF9QQURESU5HID0gMjQ7XG5cbi8qKlxuICogQHN0cnVjdCBAdHlwZWRlZiB7e1xuICogICB0b29sdGlwOiAhRWxlbWVudCxcbiAqICAgYnV0dG9uTGVmdDogIUVsZW1lbnQsXG4gKiAgIGJ1dHRvblJpZ2h0OiAhRWxlbWVudCxcbiAqICAgYXJyb3c6ICFFbGVtZW50LFxuICogfX1cbiAqL1xubGV0IHRvb2x0aXBFbGVtZW50c0RlZjtcblxuY29uc3QgVEFHID0gJ2FtcC1zdG9yeS1lbWJlZGRlZC1jb21wb25lbnQnO1xuXG4vKipcbiAqIEVtYmVkZGVkIGNvbXBvbmVudHMgZm91bmQgaW4gYW1wLXN0b3J5LlxuICovXG5leHBvcnQgY2xhc3MgQW1wU3RvcnlFbWJlZGRlZENvbXBvbmVudCB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBzdG9yeUVsXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4sIHN0b3J5RWwpIHtcbiAgICAvKiogQHByaXZhdGUgeyFXaW5kb3d9ICovXG4gICAgdGhpcy53aW5fID0gd2luO1xuXG4gICAgLyoqIEBwcml2YXRlIHshRWxlbWVudH0gKi9cbiAgICB0aGlzLnN0b3J5RWxfID0gc3RvcnlFbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5zaGFkb3dSb290XyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMuZm9jdXNlZFN0YXRlT3ZlcmxheV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLnRvb2x0aXBfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy50b29sdGlwQXJyb3dfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IGdldFN0b3JlU2VydmljZSh0aGlzLndpbl8pO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL211dGF0b3ItaW50ZXJmYWNlLk11dGF0b3JJbnRlcmZhY2V9ICovXG4gICAgdGhpcy5tdXRhdG9yXyA9IFNlcnZpY2VzLm11dGF0b3JGb3JEb2MoZ2V0QW1wZG9jKHRoaXMud2luXy5kb2N1bWVudCkpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vc3RvcnktYW5hbHl0aWNzLlN0b3J5QW5hbHl0aWNzU2VydmljZX0gKi9cbiAgICB0aGlzLmFuYWx5dGljc1NlcnZpY2VfID0gZ2V0QW5hbHl0aWNzU2VydmljZSh0aGlzLndpbl8sIHN0b3J5RWwpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL293bmVycy1pbnRlcmZhY2UuT3duZXJzSW50ZXJmYWNlfSAqL1xuICAgIHRoaXMub3duZXJzXyA9IFNlcnZpY2VzLm93bmVyc0ZvckRvYyhnZXRBbXBkb2ModGhpcy53aW5fLmRvY3VtZW50KSk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvdGltZXItaW1wbC5UaW1lcn0gKi9cbiAgICB0aGlzLnRpbWVyXyA9IFNlcnZpY2VzLnRpbWVyRm9yKHRoaXMud2luXyk7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMuZXhwYW5kZWRWaWV3T3ZlcmxheV8gPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVGFyZ2V0IHByb2R1Y2luZyB0aGUgdG9vbHRpcCBhbmQgZ29pbmcgdG8gZXhwYW5kZWQgdmlldyAod2hlblxuICAgICAqIGV4cGFuZGFibGUpLlxuICAgICAqIEBwcml2YXRlIHs/RWxlbWVudH1cbiAgICAgKi9cbiAgICB0aGlzLnRyaWdnZXJpbmdUYXJnZXRfID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFBhZ2UgY29udGFpbmluZyBjb21wb25lbnQuXG4gICAgICogQHByaXZhdGUgez9FbGVtZW50fVxuICAgICAqL1xuICAgIHRoaXMuY29tcG9uZW50UGFnZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlICovXG4gICAgdGhpcy5leHBhbmRDb21wb25lbnRIYW5kbGVyXyA9IHRoaXMub25FeHBhbmRDb21wb25lbnRfLmJpbmQodGhpcyk7XG5cbiAgICAvKiogQHByaXZhdGUgKi9cbiAgICB0aGlzLmVtYmVkc1RvQmVQYXVzZWRfID0gW107XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFxuICAgICAgU3RhdGVQcm9wZXJ0eS5JTlRFUkFDVElWRV9DT01QT05FTlRfU1RBVEUsXG4gICAgICAvKiogQHBhcmFtIHshSW50ZXJhY3RpdmVDb21wb25lbnREZWZ9IGNvbXBvbmVudCAqLyAoY29tcG9uZW50KSA9PiB7XG4gICAgICAgIHRoaXMub25Db21wb25lbnRTdGF0ZVVwZGF0ZV8oY29tcG9uZW50KTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLyoqIEB0eXBlIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvaGlzdG9yeS1pbXBsLkhpc3Rvcnl9ICovXG4gICAgdGhpcy5oaXN0b3J5U2VydmljZV8gPSBTZXJ2aWNlcy5oaXN0b3J5Rm9yRG9jKFxuICAgICAgZ2V0QW1wZG9jKHRoaXMud2luXy5kb2N1bWVudClcbiAgICApO1xuXG4gICAgLyoqIEBwcml2YXRlIHtFbWJlZGRlZENvbXBvbmVudFN0YXRlfSAqL1xuICAgIHRoaXMuc3RhdGVfID0gRW1iZWRkZWRDb21wb25lbnRTdGF0ZS5ISURERU47XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMuYnV0dG9uTGVmdF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLmJ1dHRvblJpZ2h0XyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLmhpc3RvcnlJZF8gPSAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFjdHMgdG8gZW1iZWRkZWQgY29tcG9uZW50IHN0YXRlIHVwZGF0ZXMuXG4gICAqIFBvc3NpYmxlIHN0YXRlIHVwZGF0ZXM6XG4gICAqXG4gICAqICAgIEhJRERFTiA9PT4gRk9DVVNFRCA9PT4gRVhQQU5ERURcbiAgICogICAgICAvXFwgX19fX19fX19ffCAgICAgICAgICAgfFxuICAgKiAgICAgIHx8X19fX19fX19fX19fX19fX19fX19fX3xcbiAgICpcbiAgICogQHBhcmFtIHshSW50ZXJhY3RpdmVDb21wb25lbnREZWZ9IGNvbXBvbmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25Db21wb25lbnRTdGF0ZVVwZGF0ZV8oY29tcG9uZW50KSB7XG4gICAgc3dpdGNoIChjb21wb25lbnQuc3RhdGUpIHtcbiAgICAgIGNhc2UgRW1iZWRkZWRDb21wb25lbnRTdGF0ZS5ISURERU46XG4gICAgICAgIHRoaXMuc2V0U3RhdGVfKEVtYmVkZGVkQ29tcG9uZW50U3RhdGUuSElEREVOLCBudWxsIC8qKiBjb21wb25lbnQgKi8pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRW1iZWRkZWRDb21wb25lbnRTdGF0ZS5GT0NVU0VEOlxuICAgICAgICBpZiAodGhpcy5zdGF0ZV8gIT09IEVtYmVkZGVkQ29tcG9uZW50U3RhdGUuSElEREVOKSB7XG4gICAgICAgICAgZGV2KCkud2FybihcbiAgICAgICAgICAgIFRBRyxcbiAgICAgICAgICAgIGBJbnZhbGlkIGNvbXBvbmVudCB1cGRhdGUuIE5vdCBwb3NzaWJsZSB0byBnbyBmcm9tICR7dGhpcy5zdGF0ZV99XG4gICAgICAgICAgICAgIHRvICR7Y29tcG9uZW50LnN0YXRlfWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGVfKEVtYmVkZGVkQ29tcG9uZW50U3RhdGUuRk9DVVNFRCwgY29tcG9uZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEVtYmVkZGVkQ29tcG9uZW50U3RhdGUuRVhQQU5ERUQ6XG4gICAgICAgIGlmICh0aGlzLnN0YXRlXyA9PT0gRW1iZWRkZWRDb21wb25lbnRTdGF0ZS5GT0NVU0VEKSB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZV8oRW1iZWRkZWRDb21wb25lbnRTdGF0ZS5FWFBBTkRFRCwgY29tcG9uZW50KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlXyA9PT0gRW1iZWRkZWRDb21wb25lbnRTdGF0ZS5FWFBBTkRFRCkge1xuICAgICAgICAgIHRoaXMubWF5YmVDbG9zZUV4cGFuZGVkVmlld18oY29tcG9uZW50LmVsZW1lbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRldigpLndhcm4oXG4gICAgICAgICAgICBUQUcsXG4gICAgICAgICAgICBgSW52YWxpZCBjb21wb25lbnQgdXBkYXRlLiBOb3QgcG9zc2libGUgdG8gZ28gZnJvbSAke3RoaXMuc3RhdGVffVxuICAgICAgICAgICAgICAgdG8gJHtjb21wb25lbnQuc3RhdGV9YFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgbmV3IHN0YXRlIGZvciB0aGUgZW1iZWRkZWQgY29tcG9uZW50LlxuICAgKiBAcGFyYW0ge0VtYmVkZGVkQ29tcG9uZW50U3RhdGV9IHN0YXRlXG4gICAqIEBwYXJhbSB7P0ludGVyYWN0aXZlQ29tcG9uZW50RGVmfSBjb21wb25lbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNldFN0YXRlXyhzdGF0ZSwgY29tcG9uZW50KSB7XG4gICAgc3dpdGNoIChzdGF0ZSkge1xuICAgICAgY2FzZSBFbWJlZGRlZENvbXBvbmVudFN0YXRlLkZPQ1VTRUQ6XG4gICAgICAgIHRoaXMuc3RhdGVfID0gc3RhdGU7XG4gICAgICAgIHRoaXMub25Gb2N1c2VkU3RhdGVVcGRhdGVfKGNvbXBvbmVudCk7XG4gICAgICAgIHRoaXMuYW5hbHl0aWNzU2VydmljZV8udHJpZ2dlckV2ZW50KFxuICAgICAgICAgIFN0b3J5QW5hbHl0aWNzRXZlbnQuRk9DVVMsXG4gICAgICAgICAgdGhpcy50cmlnZ2VyaW5nVGFyZ2V0X1xuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRW1iZWRkZWRDb21wb25lbnRTdGF0ZS5ISURERU46XG4gICAgICAgIHRoaXMuc3RhdGVfID0gc3RhdGU7XG4gICAgICAgIHRoaXMub25Gb2N1c2VkU3RhdGVVcGRhdGVfKG51bGwpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRW1iZWRkZWRDb21wb25lbnRTdGF0ZS5FWFBBTkRFRDpcbiAgICAgICAgdGhpcy5zdGF0ZV8gPSBzdGF0ZTtcbiAgICAgICAgdGhpcy5vbkZvY3VzZWRTdGF0ZVVwZGF0ZV8obnVsbCk7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVFbWJlZFRvUGF1c2VfKGNvbXBvbmVudC5lbGVtZW50KTtcbiAgICAgICAgdGhpcy50b2dnbGVFeHBhbmRlZFZpZXdfKGNvbXBvbmVudC5lbGVtZW50KTtcbiAgICAgICAgdGhpcy5oaXN0b3J5U2VydmljZV9cbiAgICAgICAgICAucHVzaCgoKSA9PiB0aGlzLmNsb3NlXygpKVxuICAgICAgICAgIC50aGVuKChoaXN0b3J5SWQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaGlzdG9yeUlkXyA9IGhpc3RvcnlJZDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBkZXYoKS53YXJuKFRBRywgYEVtYmVkZGVkQ29tcG9uZW50U3RhdGUgJHt0aGlzLnN0YXRlX30gZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlcyBlbWJlZHMgdG8gYmUgcGF1c2VkLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbWJlZEVsXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzY2hlZHVsZUVtYmVkVG9QYXVzZV8oZW1iZWRFbCkge1xuICAgIC8vIFJlc291cmNlcyB0aGF0IHByZXZpb3VzbHkgY2FsbGVkIGBzY2hlZHVsZVBhdXNlYCBtdXN0IGFsc28gY2FsbFxuICAgIC8vIGBzY2hlZHVsZVJlc3VtZWAuIENhbGxpbmcgYHNjaGVkdWxlUmVzdW1lYCBvbiByZXNvdXJjZXMgdGhhdCBkaWQgbm90XG4gICAgLy8gcHJldmlvdXNseSBjYWxsIGBzY2hlZHVsZVBhdXNlYCBoYXMgbm8gZWZmZWN0LlxuICAgIHRoaXMub3duZXJzXy5zY2hlZHVsZVJlc3VtZSh0aGlzLnN0b3J5RWxfLCBlbWJlZEVsKTtcbiAgICBpZiAoIXRoaXMuZW1iZWRzVG9CZVBhdXNlZF8uaW5jbHVkZXMoZW1iZWRFbCkpIHtcbiAgICAgIHRoaXMuZW1iZWRzVG9CZVBhdXNlZF8ucHVzaChlbWJlZEVsKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyBleHBhbmRlZCB2aWV3IGZvciBpbnRlcmFjdGl2ZSBjb21wb25lbnRzIHRoYXQgc3VwcG9ydCBpdC5cbiAgICogQHBhcmFtIHs/RWxlbWVudH0gdGFyZ2V0VG9FeHBhbmRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHRvZ2dsZUV4cGFuZGVkVmlld18odGFyZ2V0VG9FeHBhbmQpIHtcbiAgICBpZiAoIXRhcmdldFRvRXhwYW5kKSB7XG4gICAgICB0aGlzLmV4cGFuZGVkVmlld092ZXJsYXlfICYmXG4gICAgICAgIHRoaXMubXV0YXRvcl8ubXV0YXRlRWxlbWVudCh0aGlzLmV4cGFuZGVkVmlld092ZXJsYXlfLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jb21wb25lbnRQYWdlXy5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgICAgICAgJ2ktYW1waHRtbC1leHBhbmRlZC1tb2RlJyxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgKTtcbiAgICAgICAgICB0b2dnbGUoZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLmV4cGFuZGVkVmlld092ZXJsYXlfKSwgZmFsc2UpO1xuICAgICAgICAgIHRoaXMuY2xvc2VFeHBhbmRlZEVsXygpO1xuICAgICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmFuaW1hdGVFeHBhbmRlZF8oZGV2QXNzZXJ0KHRhcmdldFRvRXhwYW5kKSk7XG5cbiAgICB0aGlzLmV4cGFuZGVkVmlld092ZXJsYXlfID0gdGhpcy5jb21wb25lbnRQYWdlXy5xdWVyeVNlbGVjdG9yKFxuICAgICAgJy5pLWFtcGh0bWwtc3RvcnktZXhwYW5kZWQtdmlldy1vdmVyZmxvdydcbiAgICApO1xuICAgIGlmICghdGhpcy5leHBhbmRlZFZpZXdPdmVybGF5Xykge1xuICAgICAgdGhpcy5idWlsZEFuZEFwcGVuZEV4cGFuZGVkVmlld092ZXJsYXlfKCk7XG4gICAgfVxuICAgIHRoaXMubXV0YXRvcl8ubXV0YXRlRWxlbWVudChcbiAgICAgIGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5leHBhbmRlZFZpZXdPdmVybGF5XyksXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRvZ2dsZShkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMuZXhwYW5kZWRWaWV3T3ZlcmxheV8pLCB0cnVlKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRQYWdlXy5jbGFzc0xpc3QudG9nZ2xlKCdpLWFtcGh0bWwtZXhwYW5kZWQtbW9kZScsIHRydWUpO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIHRoZSBleHBhbmRlZCB2aWV3IG92ZXJsYXkgZWxlbWVudCBhbmQgYXBwZW5kcyBpdCB0byB0aGUgcGFnZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGJ1aWxkQW5kQXBwZW5kRXhwYW5kZWRWaWV3T3ZlcmxheV8oKSB7XG4gICAgdGhpcy5leHBhbmRlZFZpZXdPdmVybGF5XyA9IGJ1aWxkRXhwYW5kZWRWaWV3T3ZlcmxheSh0aGlzLnN0b3J5RWxfKTtcbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICB0aGlzLmV4cGFuZGVkVmlld092ZXJsYXlfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICcuaS1hbXBodG1sLWV4cGFuZGVkLXZpZXctY2xvc2UtYnV0dG9uJ1xuICAgICAgKVxuICAgICk7XG4gICAgY29uc3QgbG9jYWxpemF0aW9uU2VydmljZSA9IGdldExvY2FsaXphdGlvblNlcnZpY2UoXG4gICAgICBkZXZBc3NlcnQodGhpcy5zdG9yeUVsXylcbiAgICApO1xuICAgIGlmIChsb2NhbGl6YXRpb25TZXJ2aWNlKSB7XG4gICAgICBjb25zdCBsb2NhbGl6ZWRDbG9zZVN0cmluZyA9IGxvY2FsaXphdGlvblNlcnZpY2UuZ2V0TG9jYWxpemVkU3RyaW5nKFxuICAgICAgICBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfQ0xPU0VfQlVUVE9OX0xBQkVMXG4gICAgICApO1xuICAgICAgY2xvc2VCdXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgbG9jYWxpemVkQ2xvc2VTdHJpbmcpO1xuICAgIH1cbiAgICB0aGlzLm11dGF0b3JfLm11dGF0ZUVsZW1lbnQoZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLmNvbXBvbmVudFBhZ2VfKSwgKCkgPT5cbiAgICAgIHRoaXMuY29tcG9uZW50UGFnZV8uYXBwZW5kQ2hpbGQodGhpcy5leHBhbmRlZFZpZXdPdmVybGF5XylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgZXhwYW5kZWQgdmlldyBvdmVybGF5LlxuICAgKiBAcGFyYW0gez9FbGVtZW50fSB0YXJnZXRcbiAgICogQHBhcmFtIHtib29sZWFuPX0gZm9yY2VDbG9zZSBGb3JjZSBjbG9zaW5nIHRoZSBleHBhbmRlZCB2aWV3LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWF5YmVDbG9zZUV4cGFuZGVkVmlld18odGFyZ2V0LCBmb3JjZUNsb3NlID0gZmFsc2UpIHtcbiAgICBpZiAoXG4gICAgICAodGFyZ2V0ICYmIG1hdGNoZXModGFyZ2V0LCAnLmktYW1waHRtbC1leHBhbmRlZC12aWV3LWNsb3NlLWJ1dHRvbicpKSB8fFxuICAgICAgZm9yY2VDbG9zZVxuICAgICkge1xuICAgICAgaWYgKHRoaXMuaGlzdG9yeUlkXyAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5oaXN0b3J5U2VydmljZV8uZ29CYWNrKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBVc2VkIGZvciB2aXN1YWwgZGlmZiB0ZXN0aW5nIHZpZXdlci5cbiAgICAgICAgdGhpcy5jbG9zZV8oKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIHRoZSB0b29sdGlwIG92ZXJsYXkgYW5kIGFwcGVuZHMgaXQgdG8gdGhlIHByb3ZpZGVkIHN0b3J5LlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cbiAgYnVpbGRGb2N1c2VkU3RhdGVfKCkge1xuICAgIHRoaXMuc2hhZG93Um9vdF8gPSB0aGlzLndpbl8uZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICB0aGlzLmZvY3VzZWRTdGF0ZU92ZXJsYXlfID0gZGV2QXNzZXJ0KFxuICAgICAgdGhpcy5idWlsZEZvY3VzZWRTdGF0ZVRlbXBsYXRlXyh0aGlzLndpbl8uZG9jdW1lbnQpXG4gICAgKTtcbiAgICBjcmVhdGVTaGFkb3dSb290V2l0aFN0eWxlKHRoaXMuc2hhZG93Um9vdF8sIHRoaXMuZm9jdXNlZFN0YXRlT3ZlcmxheV8sIENTUyk7XG5cbiAgICB0aGlzLmZvY3VzZWRTdGF0ZU92ZXJsYXlfLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PlxuICAgICAgdGhpcy5vbk91dHNpZGVUb29sdGlwQ2xpY2tfKGV2ZW50KVxuICAgICk7XG5cbiAgICB0aGlzLnRvb2x0aXBfLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAnY2xpY2snLFxuICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLmFuYWx5dGljc1NlcnZpY2VfLnRyaWdnZXJFdmVudChcbiAgICAgICAgICBTdG9yeUFuYWx5dGljc0V2ZW50LkNMSUNLX1RIUk9VR0gsXG4gICAgICAgICAgdGhpcy50cmlnZ2VyaW5nVGFyZ2V0X1xuICAgICAgICApO1xuICAgICAgICB0aGlzLnRvb2x0aXBfLmhyZWYgJiYgdGhpcy5vbkFuY2hvckNsaWNrXyhldmVudCk7XG4gICAgICB9LFxuICAgICAgdHJ1ZSAvKiogY2FwdHVyZSAqL1xuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290XztcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgdG9vbHRpcCBVSSBhbmQgdXBkYXRlcyBzdG9yZSBzdGF0ZSB0byBoaWRkZW4uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjbG9zZV8oKSB7XG4gICAgLy8gV2FpdCB1bnRpbCB0b29sdGlwIGNsb3NpbmcgYW5pbWF0aW9uIGlzIGZpbmlzaGVkIGJlZm9yZSBjbGVhcmluZyBpdC5cbiAgICAvLyBPdGhlcndpc2UgamFuayBpcyBub3RpY2VhYmxlLlxuICAgIHRoaXMudGltZXJfLmRlbGF5KCgpID0+IHtcbiAgICAgIHRoaXMuY2xlYXJUb29sdGlwXygpO1xuICAgIH0sIFRPT0xUSVBfQ0xPU0VfQU5JTUFUSU9OX01TKTtcblxuICAgIGlmICh0aGlzLnN0YXRlXyA9PT0gRW1iZWRkZWRDb21wb25lbnRTdGF0ZS5FWFBBTkRFRCkge1xuICAgICAgdGhpcy50b2dnbGVFeHBhbmRlZFZpZXdfKG51bGwpO1xuICAgIH1cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9JTlRFUkFDVElWRV9DT01QT05FTlQsIHtcbiAgICAgIHN0YXRlOiBFbWJlZGRlZENvbXBvbmVudFN0YXRlLkhJRERFTixcbiAgICB9KTtcbiAgICB0aGlzLnRvb2x0aXBfLnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICAnY2xpY2snLFxuICAgICAgdGhpcy5leHBhbmRDb21wb25lbnRIYW5kbGVyXyxcbiAgICAgIHRydWUgLyoqIGNhcHR1cmUgKi9cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBzdG9yZSB1cGRhdGVzIHJlbGF0ZWQgdG8gdGhlIGZvY3VzZWQgc3RhdGUsIHdoZW4gYSB0b29sdGlwIGlzXG4gICAqIGFjdGl2ZS5cbiAgICogQHBhcmFtIHs/SW50ZXJhY3RpdmVDb21wb25lbnREZWZ9IGNvbXBvbmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25Gb2N1c2VkU3RhdGVVcGRhdGVfKGNvbXBvbmVudCkge1xuICAgIGlmICghY29tcG9uZW50KSB7XG4gICAgICB0aGlzLm11dGF0b3JfLm11dGF0ZUVsZW1lbnQoXG4gICAgICAgIGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5mb2N1c2VkU3RhdGVPdmVybGF5XyksXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICB0aGlzLmZvY3VzZWRTdGF0ZU92ZXJsYXlfLmNsYXNzTGlzdC50b2dnbGUoJ2ktYW1waHRtbC1oaWRkZW4nLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnRyaWdnZXJpbmdUYXJnZXRfID0gY29tcG9uZW50LmVsZW1lbnQ7XG5cbiAgICAvLyBGaXJzdCB0aW1lIGF0dGFjaGluZyB0aGUgb3ZlcmxheS4gUnVucyBvbmx5IG9uY2UuXG4gICAgaWYgKCF0aGlzLmZvY3VzZWRTdGF0ZU92ZXJsYXlfKSB7XG4gICAgICB0aGlzLnN0b3J5RWxfLmFwcGVuZENoaWxkKHRoaXMuYnVpbGRGb2N1c2VkU3RhdGVfKCkpO1xuICAgICAgdGhpcy5pbml0aWFsaXplTGlzdGVuZXJzXygpO1xuICAgIH1cblxuICAgIC8vIERlbGF5IGJ1aWxkaW5nIHRoZSB0b29sdGlwIHRvIG1ha2Ugc3VyZSBpdCBydW5zIGFmdGVyIGNsZWFyVG9vbHRpcF8sXG4gICAgLy8gaW4gdGhlIGNhc2UgdGhlIHVzZXIgdGFwcyBvbiBhIHRhcmdldCBpbiBxdWljayBzdWNjZXNzaW9uLlxuICAgIHRoaXMudGltZXJfLmRlbGF5KCgpID0+IHtcbiAgICAgIHRoaXMuYnVpbGRUb29sdGlwXyhjb21wb25lbnQpO1xuICAgIH0sIFRPT0xUSVBfQ0xPU0VfQU5JTUFUSU9OX01TKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW5kIGRpc3BsYXlzIHRvb2x0aXBcbiAgICogQHBhcmFtIHs/SW50ZXJhY3RpdmVDb21wb25lbnREZWZ9IGNvbXBvbmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYnVpbGRUb29sdGlwXyhjb21wb25lbnQpIHtcbiAgICB0aGlzLnVwZGF0ZVRvb2x0aXBCZWhhdmlvcl8oY29tcG9uZW50LmVsZW1lbnQpO1xuICAgIHRoaXMudXBkYXRlVG9vbHRpcEVsXyhjb21wb25lbnQpO1xuICAgIHRoaXMuY29tcG9uZW50UGFnZV8gPSBkZXZBc3NlcnQoXG4gICAgICB0aGlzLnN0b3J5RWxfLnF1ZXJ5U2VsZWN0b3IoJ2FtcC1zdG9yeS1wYWdlW2FjdGl2ZV0nKVxuICAgICk7XG5cbiAgICB0aGlzLm11dGF0b3JfLm11dGF0ZUVsZW1lbnQoXG4gICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMuZm9jdXNlZFN0YXRlT3ZlcmxheV8pLFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLmZvY3VzZWRTdGF0ZU92ZXJsYXlfLmNsYXNzTGlzdC50b2dnbGUoJ2ktYW1waHRtbC1oaWRkZW4nLCBmYWxzZSk7XG4gICAgICAgIHRyeUZvY3VzKFxuICAgICAgICAgIGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWRTdGF0ZU92ZXJsYXlfLnF1ZXJ5U2VsZWN0b3IoJ2EuaS1hbXBodG1sLXN0b3J5LXRvb2x0aXAnKVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIGxpc3RlbmVycyB0aGF0IGxpc3RlbiBmb3IgVUkgdXBkYXRlcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGluaXRpYWxpemVMaXN0ZW5lcnNfKCkge1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5zdWJzY3JpYmUoXG4gICAgICBTdGF0ZVByb3BlcnR5LlVJX1NUQVRFLFxuICAgICAgKHVpU3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy5vblVJU3RhdGVVcGRhdGVfKHVpU3RhdGUpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShTdGF0ZVByb3BlcnR5LkNVUlJFTlRfUEFHRV9JRCwgKCkgPT4ge1xuICAgICAgLy8gSGlkZSBhY3RpdmUgdG9vbHRpcCB3aGVuIHBhZ2Ugc3dpdGNoIGlzIHRyaWdnZXJlZCBieSBrZXlib2FyZCBvclxuICAgICAgLy8gZGVza3RvcCBidXR0b25zLlxuICAgICAgaWYgKHRoaXMuc3RhdGVfID09PSBFbWJlZGRlZENvbXBvbmVudFN0YXRlLkZPQ1VTRUQpIHtcbiAgICAgICAgdGhpcy5jbG9zZV8oKTtcbiAgICAgIH1cblxuICAgICAgLy8gSGlkZSBleHBhbmRlZCB2aWV3IHdoZW4gcGFnZSBzd2l0Y2ggaXMgdHJpZ2dlcmVkIGJ5IGtleWJvYXJkIG9yIGRlc2t0b3BcbiAgICAgIC8vIGJ1dHRvbnMuXG4gICAgICBpZiAodGhpcy5zdGF0ZV8gPT09IEVtYmVkZGVkQ29tcG9uZW50U3RhdGUuRVhQQU5ERUQpIHtcbiAgICAgICAgdGhpcy5tYXliZUNsb3NlRXhwYW5kZWRWaWV3XyhcbiAgICAgICAgICBudWxsIC8qKiB0YXJnZXQgKi8sXG4gICAgICAgICAgdHJ1ZSAvKiogZm9yY2VDbG9zZSAqL1xuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBQYXVzZXMgY29udGVudCBpbnNpZGUgZW1iZWRzIHdoZW4gYSBwYWdlIGNoYW5nZSBvY2N1cnMuXG4gICAgICB3aGlsZSAodGhpcy5lbWJlZHNUb0JlUGF1c2VkXy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGVtYmVkRWwgPSB0aGlzLmVtYmVkc1RvQmVQYXVzZWRfLnBvcCgpO1xuICAgICAgICB0aGlzLm93bmVyc18uc2NoZWR1bGVQYXVzZSh0aGlzLnN0b3J5RWxfLCBlbWJlZEVsKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMud2luXy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChldmVudCkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBldmVudC5rZXkgPT09IEtleXMuRVNDQVBFICYmXG4gICAgICAgIHRoaXMuc3RhdGVfID09PSBFbWJlZGRlZENvbXBvbmVudFN0YXRlLkVYUEFOREVEXG4gICAgICApIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5tYXliZUNsb3NlRXhwYW5kZWRWaWV3XyhcbiAgICAgICAgICBudWxsIC8qKiB0YXJnZXQgKi8sXG4gICAgICAgICAgdHJ1ZSAvKiogZm9yY2VDbG9zZSAqL1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBkZXNrdG9wIHN0YXRlIHVwZGF0ZXMgYW5kIGhpZGVzIG5hdmlnYXRpb24gYnV0dG9ucyBzaW5jZSB3ZVxuICAgKiBhbHJlYWR5IGhhdmUgaW4gdGhlIGRlc2t0b3AgVUkuXG4gICAqIEBwYXJhbSB7IVVJVHlwZX0gdWlTdGF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25VSVN0YXRlVXBkYXRlXyh1aVN0YXRlKSB7XG4gICAgdGhpcy5tdXRhdG9yXy5tdXRhdGVFbGVtZW50KFxuICAgICAgZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLmZvY3VzZWRTdGF0ZU92ZXJsYXlfKSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgW1VJVHlwZS5ERVNLVE9QX0ZVTExCTEVFRCwgVUlUeXBlLkRFU0tUT1BfUEFORUxTXS5pbmNsdWRlcyh1aVN0YXRlKVxuICAgICAgICAgID8gdGhpcy5mb2N1c2VkU3RhdGVPdmVybGF5Xy5zZXRBdHRyaWJ1dGUoJ2Rlc2t0b3AnLCAnJylcbiAgICAgICAgICA6IHRoaXMuZm9jdXNlZFN0YXRlT3ZlcmxheV8ucmVtb3ZlQXR0cmlidXRlKCdkZXNrdG9wJyk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW5kIGF0dGFjaGVzIHRoZSB0b29sdGlwLlxuICAgKiBAcGFyYW0geyFJbnRlcmFjdGl2ZUNvbXBvbmVudERlZn0gY29tcG9uZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVUb29sdGlwRWxfKGNvbXBvbmVudCkge1xuICAgIGNvbnN0IGVtYmVkQ29uZmlnID0gLyoqIEB0eXBlIHshT2JqZWN0fSAqLyAoXG4gICAgICB1c2VyQXNzZXJ0KFxuICAgICAgICB0aGlzLmdldEVtYmVkQ29uZmlnRm9yXyhjb21wb25lbnQuZWxlbWVudCksXG4gICAgICAgICdJbnZhbGlkIGVtYmVkIGNvbmZpZyBmb3IgdGFyZ2V0JyxcbiAgICAgICAgY29tcG9uZW50LmVsZW1lbnRcbiAgICAgIClcbiAgICApO1xuXG4gICAgY29uc3QgdGhlbWUgPSB0aGlzLnRyaWdnZXJpbmdUYXJnZXRfLmdldEF0dHJpYnV0ZSgndGhlbWUnKTtcbiAgICBpZiAodGhlbWUgJiYgVG9vbHRpcFRoZW1lLkRBUksgPT09IHRoZW1lLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIHRoaXMudG9vbHRpcF8uY2xhc3NMaXN0LmFkZChEQVJLX1RIRU1FX0NMQVNTKTtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZVRvb2x0aXBUZXh0Xyhjb21wb25lbnQuZWxlbWVudCwgZW1iZWRDb25maWcpO1xuICAgIHRoaXMudXBkYXRlVG9vbHRpcENvbXBvbmVudEljb25fKGNvbXBvbmVudC5lbGVtZW50LCBlbWJlZENvbmZpZyk7XG4gICAgdGhpcy51cGRhdGVUb29sdGlwQWN0aW9uSWNvbl8oZW1iZWRDb25maWcpO1xuICAgIHRoaXMudXBkYXRlTmF2QnV0dG9uc18oKTtcbiAgICB0aGlzLnBvc2l0aW9uVG9vbHRpcF8oY29tcG9uZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRvb2x0aXAgYmVoYXZpb3IgZGVwZW5kaW5nIG9uIHRoZSB0YXJnZXQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHRhcmdldFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlVG9vbHRpcEJlaGF2aW9yXyh0YXJnZXQpIHtcbiAgICBpZiAobWF0Y2hlcyh0YXJnZXQsIExBVU5DSEFCTEVfQ09NUE9ORU5UU1snYSddLnNlbGVjdG9yKSkge1xuICAgICAgYWRkQXR0cmlidXRlc1RvRWxlbWVudChcbiAgICAgICAgZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLnRvb2x0aXBfKSxcbiAgICAgICAgZGljdCh7J2hyZWYnOiB0aGlzLmdldEVsZW1lbnRIcmVmXyh0YXJnZXQpfSlcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKEVYUEFOREFCTEVfQ09NUE9ORU5UU1t0YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpXSkge1xuICAgICAgdGhpcy50b29sdGlwXy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAnY2xpY2snLFxuICAgICAgICB0aGlzLmV4cGFuZENvbXBvbmVudEhhbmRsZXJfLFxuICAgICAgICB0cnVlXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBldmVudCBvZiBhbiBpbnRlcmFjdGl2ZSBlbGVtZW50IGNvbWluZyBpbnRvIGV4cGFuZGVkIHZpZXcuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25FeHBhbmRDb21wb25lbnRfKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChBY3Rpb24uVE9HR0xFX0lOVEVSQUNUSVZFX0NPTVBPTkVOVCwge1xuICAgICAgc3RhdGU6IEVtYmVkZGVkQ29tcG9uZW50U3RhdGUuRVhQQU5ERUQsXG4gICAgICBlbGVtZW50OiB0aGlzLnRyaWdnZXJpbmdUYXJnZXRfLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgaHJlZiBmcm9tIGFuIGVsZW1lbnQgY29udGFpbmluZyBhIHVybC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gdGFyZ2V0XG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldEVsZW1lbnRIcmVmXyh0YXJnZXQpIHtcbiAgICBjb25zdCBlbFVybCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICBpZiAoIWlzUHJvdG9jb2xWYWxpZChlbFVybCkpIHtcbiAgICAgIHVzZXIoKS5lcnJvcihUQUcsICdUaGUgdG9vbHRpcCB1cmwgaXMgaW52YWxpZCcpO1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJzZVVybERlcHJlY2F0ZWQoZWxVcmwpLmhyZWY7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBjb3JyZXNwb25kaW5nIGNvbmZpZyBmb3IgYSBnaXZlbiBlbWJlZCB0YXJnZXQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHRhcmdldFxuICAgKiBAcmV0dXJuIHs/T2JqZWN0fVxuICAgKi9cbiAgZ2V0RW1iZWRDb25maWdGb3JfKHRhcmdldCkge1xuICAgIGNvbnN0IGNvbmZpZyA9IElOVEVSQUNUSVZFX0NPTVBPTkVOVFNbdGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKV07XG4gICAgaWYgKGNvbmZpZyAmJiBtYXRjaGVzKHRhcmdldCwgY29uZmlnLnNlbGVjdG9yKSkge1xuICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9XG5cbiAgICB1c2VyKCkuZXJyb3IoVEFHLCAnTm8gY29uZmlnIG1hdGNoaW5nIHByb3ZpZGVkIHRhcmdldC4nKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGV4cGFuZGVkIGVsZW1lbnQgYmFjayB0byBvcmlnaW5hbCBzdGF0ZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNsb3NlRXhwYW5kZWRFbF8oKSB7XG4gICAgdGhpcy50cmlnZ2VyaW5nVGFyZ2V0Xy5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgJ2ktYW1waHRtbC1leHBhbmRlZC1jb21wb25lbnQnLFxuICAgICAgZmFsc2VcbiAgICApO1xuICAgIGNvbnN0IGVtYmVkSWQgPSB0aGlzLnRyaWdnZXJpbmdUYXJnZXRfLmdldEF0dHJpYnV0ZShcbiAgICAgIEVNQkVEX0lEX0FUVFJJQlVURV9OQU1FXG4gICAgKTtcblxuICAgIGNvbnN0IGVtYmVkU3R5bGVFbCA9IGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICBlbWJlZFN0eWxlRWxzW2VtYmVkSWRdLFxuICAgICAgYEZhaWxlZCB0byBsb29rIHVwIGVtYmVkIHN0eWxlIGVsZW1lbnQgd2l0aCBJRCAke2VtYmVkSWR9YFxuICAgICk7XG5cbiAgICBlbWJlZFN0eWxlRWxbXG4gICAgICBBTVBfRU1CRURfREFUQVxuICAgIF0udHJhbnNmb3JtID0gYHNjYWxlKCR7ZW1iZWRTdHlsZUVsW0FNUF9FTUJFRF9EQVRBXS5zY2FsZUZhY3Rvcn0pYDtcbiAgICB1cGRhdGVFbWJlZFN0eWxlRWwoXG4gICAgICB0aGlzLnRyaWdnZXJpbmdUYXJnZXRfLFxuICAgICAgZW1iZWRTdHlsZUVsLFxuICAgICAgZW1iZWRTdHlsZUVsW0FNUF9FTUJFRF9EQVRBXVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQW5pbWF0ZXMgaW50byBleHBhbmRlZCB2aWV3LiBJdCBjYWxjdWxhdGVzIHdoYXQgdGhlIGZ1bGwtc2NyZWVuIGRpbWVuc2lvbnNcbiAgICogb2YgdGhlIGVsZW1lbnQgd2lsbCBiZSwgYW5kIHVzZXMgdGhlbSB0byBkZWR1Y2UgdGhlIHRyYW5zbGF0ZVgvWSB2YWx1ZXNcbiAgICogb25jZSB0aGUgZWxlbWVudCByZWFjaGVzIGl0cyBmdWxsLXNjcmVlbiBzaXplLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSB0YXJnZXRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFuaW1hdGVFeHBhbmRlZF8odGFyZ2V0KSB7XG4gICAgY29uc3QgZW1iZWRJZCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoRU1CRURfSURfQVRUUklCVVRFX05BTUUpO1xuICAgIGNvbnN0IHN0YXRlID0ge307XG4gICAgY29uc3QgZW1iZWRTdHlsZUVsID0gZGV2KCkuYXNzZXJ0RWxlbWVudChcbiAgICAgIGVtYmVkU3R5bGVFbHNbZW1iZWRJZF0sXG4gICAgICBgRmFpbGVkIHRvIGxvb2sgdXAgZW1iZWQgc3R5bGUgZWxlbWVudCB3aXRoIElEICR7ZW1iZWRJZH1gXG4gICAgKTtcbiAgICBjb25zdCBlbWJlZERhdGEgPSBlbWJlZFN0eWxlRWxbQU1QX0VNQkVEX0RBVEFdO1xuICAgIHRoaXMubXV0YXRvcl8ubWVhc3VyZU11dGF0ZUVsZW1lbnQoXG4gICAgICB0YXJnZXQsXG4gICAgICAvKiogbWVhc3VyZSAqL1xuICAgICAgKCkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXRSZWN0ID0gdGFyZ2V0Li8qT0sqLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgLy8gVE9ETygjMjA4MzIpOiBTdG9yZSBET01SZWN0IGZvciB0aGUgcGFnZSBpbiB0aGUgc3RvcmUgdG8gYXZvaWRcbiAgICAgICAgLy8gaGF2aW5nIHRvIGNhbGwgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuXG4gICAgICAgIGNvbnN0IHBhZ2VSZWN0ID0gdGhpcy5jb21wb25lbnRQYWdlXy4vKk9LKi8gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHJlYWxIZWlnaHQgPSB0YXJnZXQuLypPSyovIG9mZnNldEhlaWdodDtcbiAgICAgICAgY29uc3QgbWF4SGVpZ2h0ID0gcGFnZVJlY3QuaGVpZ2h0IC0gVkVSVElDQUxfUEFERElORztcbiAgICAgICAgc3RhdGUuc2NhbGVGYWN0b3IgPSAxO1xuICAgICAgICBpZiAocmVhbEhlaWdodCA+IG1heEhlaWdodCkge1xuICAgICAgICAgIHN0YXRlLnNjYWxlRmFjdG9yID0gbWF4SGVpZ2h0IC8gcmVhbEhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdhcCBvbiB0aGUgbGVmdCBvZiB0aGUgZWxlbWVudCBiZXR3ZWVuIGZ1bGwtc2NyZWVuIHNpemUgYW5kXG4gICAgICAgIC8vIGN1cnJlbnQgc2l6ZS5cbiAgICAgICAgY29uc3QgbGVmdEdhcCA9IChlbWJlZERhdGEud2lkdGggLSB0YXJnZXRSZWN0LndpZHRoKSAvIDI7XG4gICAgICAgIC8vIERpc3RhbmNlIGZyb20gbGVmdCBvZiBwYWdlIHRvIHdoYXQgd2lsbCBiZSB0aGUgbGVmdCBvZiB0aGVcbiAgICAgICAgLy8gZWxlbWVudCBpbiBmdWxsLXNjcmVlbi5cbiAgICAgICAgY29uc3QgZnVsbFNjcmVlbkxlZnQgPSB0YXJnZXRSZWN0LmxlZnQgLSBsZWZ0R2FwIC0gcGFnZVJlY3QubGVmdDtcbiAgICAgICAgY29uc3QgY2VudGVyZWRMZWZ0ID0gcGFnZVJlY3Qud2lkdGggLyAyIC0gZW1iZWREYXRhLndpZHRoIC8gMjtcbiAgICAgICAgc3RhdGUudHJhbnNsYXRlWCA9IGNlbnRlcmVkTGVmdCAtIGZ1bGxTY3JlZW5MZWZ0O1xuXG4gICAgICAgIC8vIEdhcCBvbiB0aGUgdG9wIG9mIHRoZSBlbGVtZW50IGJldHdlZW4gZnVsbC1zY3JlZW4gc2l6ZSBhbmRcbiAgICAgICAgLy8gY3VycmVudCBzaXplLlxuICAgICAgICBjb25zdCB0b3BHYXAgPSAocmVhbEhlaWdodCAqIHN0YXRlLnNjYWxlRmFjdG9yIC0gdGFyZ2V0UmVjdC5oZWlnaHQpIC8gMjtcbiAgICAgICAgLy8gRGlzdGFuY2UgZnJvbSB0b3Agb2YgcGFnZSB0byB3aGF0IHdpbGwgYmUgdGhlIHRvcCBvZiB0aGUgZWxlbWVudCBpblxuICAgICAgICAvLyBmdWxsLXNjcmVlbi5cbiAgICAgICAgY29uc3QgZnVsbFNjcmVlblRvcCA9IHRhcmdldFJlY3QudG9wIC0gdG9wR2FwIC0gcGFnZVJlY3QudG9wO1xuICAgICAgICBjb25zdCBjZW50ZXJlZFRvcCA9XG4gICAgICAgICAgcGFnZVJlY3QuaGVpZ2h0IC8gMiAtIChyZWFsSGVpZ2h0ICogc3RhdGUuc2NhbGVGYWN0b3IpIC8gMjtcbiAgICAgICAgc3RhdGUudHJhbnNsYXRlWSA9IGNlbnRlcmVkVG9wIC0gZnVsbFNjcmVlblRvcDtcbiAgICAgIH0sXG4gICAgICAvKiogbXV0YXRlICovXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKCdpLWFtcGh0bWwtZXhwYW5kZWQtY29tcG9uZW50JywgdHJ1ZSk7XG5cbiAgICAgICAgZW1iZWREYXRhLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUzZCgke3N0YXRlLnRyYW5zbGF0ZVh9cHgsXG4gICAgICAgICAgICAke3N0YXRlLnRyYW5zbGF0ZVl9cHgsIDApIHNjYWxlKCR7c3RhdGUuc2NhbGVGYWN0b3J9KWA7XG5cbiAgICAgICAgdXBkYXRlRW1iZWRTdHlsZUVsKHRhcmdldCwgZW1iZWRTdHlsZUVsLCBlbWJlZERhdGEpO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmVzaXplcyBleHBhbmRhYmxlIGVsZW1lbnQgYmVmb3JlIGl0IGlzIGV4cGFuZGVkIHRvIGZ1bGwtc2NyZWVuLCBpblxuICAgKiBwcmVwYXJhdGlvbiBmb3IgaXRzIGFuaW1hdGlvbi4gSXQgcmVzaXplcyBpdCB0byBpdHMgZnVsbC1zY3JlZW4gc2l6ZSwgYW5kXG4gICAqIHNjYWxlcyBpdCBkb3duIHRvIG1hdGNoIHNpemUgc2V0IGJ5IHB1Ymxpc2hlciwgYWRkaW5nIG5lZ2F0aXZlIG1hcmdpbnMgc29cbiAgICogdGhhdCBjb250ZW50IGFyb3VuZCBzdGF5cyBwdXQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHBhZ2VFbFxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL211dGF0b3ItaW50ZXJmYWNlLk11dGF0b3JJbnRlcmZhY2V9IG11dGF0b3JcbiAgICovXG4gIHN0YXRpYyBwcmVwYXJlRm9yQW5pbWF0aW9uKHBhZ2VFbCwgZWxlbWVudCwgbXV0YXRvcikge1xuICAgIGxldCBlbElkID0gbnVsbDtcblxuICAgIC8vIFdoZW4gYSB3aW5kb3cgcmVzaXplIGhhcHBlbnMsIHdlIG11c3QgcmVzZXQgdGhlIHN0eWxlcyBhbmQgcHJlcGFyZSB0aGVcbiAgICAvLyBhbmltYXRpb24gYWdhaW4uXG4gICAgaWYgKGVsZW1lbnQuaGFzQXR0cmlidXRlKEVNQkVEX0lEX0FUVFJJQlVURV9OQU1FKSkge1xuICAgICAgZWxJZCA9IHBhcnNlSW50KGVsZW1lbnQuZ2V0QXR0cmlidXRlKEVNQkVEX0lEX0FUVFJJQlVURV9OQU1FKSwgMTApO1xuICAgICAgY29uc3QgZW1iZWRTdHlsZUVsID0gZGV2KCkuYXNzZXJ0RWxlbWVudChcbiAgICAgICAgZW1iZWRTdHlsZUVsc1tlbElkXSxcbiAgICAgICAgYEZhaWxlZCB0byBsb29rIHVwIGVtYmVkIHN0eWxlIGVsZW1lbnQgd2l0aCBJRCAke2VsSWR9YFxuICAgICAgKTtcbiAgICAgIGVtYmVkU3R5bGVFbC50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgZW1iZWRTdHlsZUVsW0FNUF9FTUJFRF9EQVRBXSA9IHt9O1xuICAgIH1cblxuICAgIGxldCBzdGF0ZSA9IHt9O1xuICAgIG11dGF0b3IubWVhc3VyZU11dGF0ZUVsZW1lbnQoXG4gICAgICBlbGVtZW50LFxuICAgICAgLyoqIG1lYXN1cmUgKi9cbiAgICAgICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFnZVJlY3QgPSBwYWdlRWwuLypPSyovIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCBlbFJlY3QgPSBlbGVtZW50Li8qT0sqLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgc3RhdGUgPSBtZWFzdXJlU3R5bGVGb3JFbChlbGVtZW50LCBzdGF0ZSwgcGFnZVJlY3QsIGVsUmVjdCk7XG4gICAgICB9LFxuICAgICAgLyoqIG11dGF0ZSAqL1xuICAgICAgKCkgPT4ge1xuICAgICAgICBlbElkID0gZWxJZCA/IGVsSWQgOiArK2VtYmVkSWRzO1xuICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQXR0cmlidXRlKEVNQkVEX0lEX0FUVFJJQlVURV9OQU1FKSkge1xuICAgICAgICAgIC8vIEZpcnN0IHRpbWUgY3JlYXRpbmcgPHN0eWxlPiBlbGVtZW50IGZvciBlbWJlZC5cbiAgICAgICAgICBjb25zdCBodG1sID0gaHRtbEZvcihwYWdlRWwpO1xuICAgICAgICAgIGNvbnN0IGVtYmVkU3R5bGVFbCA9IGh0bWxgIDxzdHlsZT48L3N0eWxlPiBgO1xuXG4gICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoRU1CRURfSURfQVRUUklCVVRFX05BTUUsIGVsSWQpO1xuICAgICAgICAgIHBhZ2VFbC5pbnNlcnRCZWZvcmUoZW1iZWRTdHlsZUVsLCBwYWdlRWwuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgZW1iZWRTdHlsZUVsc1tlbElkXSA9IGVtYmVkU3R5bGVFbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVtYmVkU3R5bGVFbHNbZWxJZF1bQU1QX0VNQkVEX0RBVEFdID0ge1xuICAgICAgICAgIC4uLnVwZGF0ZVN0eWxlRm9yRWwoZWxlbWVudCwgZWxJZCwgc3RhdGUpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGVtYmVkU3R5bGVFbCA9IGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICAgICAgZW1iZWRTdHlsZUVsc1tlbElkXSxcbiAgICAgICAgICBgRmFpbGVkIHRvIGxvb2sgdXAgZW1iZWQgc3R5bGUgZWxlbWVudCB3aXRoIElEICR7ZWxJZH1gXG4gICAgICAgICk7XG4gICAgICAgIHVwZGF0ZUVtYmVkU3R5bGVFbChlbGVtZW50LCBlbWJlZFN0eWxlRWwsIGVtYmVkU3R5bGVFbFtBTVBfRU1CRURfREFUQV0pO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0b29sdGlwIHRleHQgY29udGVudC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gdGFyZ2V0XG4gICAqIEBwYXJhbSB7IU9iamVjdH0gZW1iZWRDb25maWdcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZVRvb2x0aXBUZXh0Xyh0YXJnZXQsIGVtYmVkQ29uZmlnKSB7XG4gICAgY29uc3QgdG9vbHRpcFRleHQgPVxuICAgICAgdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10b29sdGlwLXRleHQnKSB8fFxuICAgICAgZ2V0TG9jYWxpemF0aW9uU2VydmljZSh0aGlzLnN0b3J5RWxfKS5nZXRMb2NhbGl6ZWRTdHJpbmcoXG4gICAgICAgIGVtYmVkQ29uZmlnLmxvY2FsaXplZFN0cmluZ0lkXG4gICAgICApIHx8XG4gICAgICBnZXRTb3VyY2VPcmlnaW5Gb3JFbGVtZW50KHRhcmdldCwgdGhpcy5nZXRFbGVtZW50SHJlZl8odGFyZ2V0KSk7XG4gICAgY29uc3QgZXhpc3RpbmdUb29sdGlwVGV4dCA9IHRoaXMudG9vbHRpcF8ucXVlcnlTZWxlY3RvcihcbiAgICAgICcuaS1hbXBodG1sLXRvb2x0aXAtdGV4dCdcbiAgICApO1xuXG4gICAgZXhpc3RpbmdUb29sdGlwVGV4dC50ZXh0Q29udGVudCA9IHRvb2x0aXBUZXh0O1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdG9vbHRpcCBhY3Rpb24gaWNvbi4gVGhpcyBpcyBmb3VuZCBvbiB0aGUgcmlnaHQgb2YgdGhlIHRleHQuXG4gICAqIEBwYXJhbSB7IU9iamVjdH0gZW1iZWRDb25maWdcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZVRvb2x0aXBBY3Rpb25JY29uXyhlbWJlZENvbmZpZykge1xuICAgIGNvbnN0IGFjdGlvbkljb24gPSB0aGlzLnRvb2x0aXBfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmktYW1waHRtbC10b29sdGlwLWFjdGlvbi1pY29uJ1xuICAgICk7XG5cbiAgICB0aGlzLm11dGF0b3JfLm11dGF0ZUVsZW1lbnQoZGV2KCkuYXNzZXJ0RWxlbWVudChhY3Rpb25JY29uKSwgKCkgPT4ge1xuICAgICAgYWN0aW9uSWNvbi5jbGFzc0xpc3QudG9nZ2xlKGVtYmVkQ29uZmlnLmFjdGlvbkljb24sIHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdG9vbHRpcCBpY29uLiBJZiBubyBpY29uIHNyYyBpcyBkZWNsYXJlZCwgaXQgc2V0cyBhIGRlZmF1bHQgZm9yIGFcbiAgICogZ2l2ZW4gY29tcG9uZW50IHR5cGUuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHRhcmdldFxuICAgKiBAcGFyYW0geyFPYmplY3R9IGVtYmVkQ29uZmlnXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVUb29sdGlwQ29tcG9uZW50SWNvbl8odGFyZ2V0LCBlbWJlZENvbmZpZykge1xuICAgIGNvbnN0IGljb25VcmwgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRvb2x0aXAtaWNvbicpO1xuICAgIGlmICghaXNQcm90b2NvbFZhbGlkKGljb25VcmwpKSB7XG4gICAgICB1c2VyKCkuZXJyb3IoVEFHLCAnVGhlIHRvb2x0aXAgaWNvbiB1cmwgaXMgaW52YWxpZCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRvb2x0aXBDdXN0b21JY29uID0gdGhpcy50b29sdGlwXy5xdWVyeVNlbGVjdG9yKFxuICAgICAgJy5pLWFtcGh0bWwtc3RvcnktdG9vbHRpcC1jdXN0b20taWNvbidcbiAgICApO1xuXG4gICAgLy8gTm8gaWNvbiBzcmMgc3BlY2lmaWVkIGJ5IHB1Ymxpc2hlciBhbmQgbm8gZGVmYXVsdCBpY29uIGluIGNvbmZpZy5cbiAgICBpZiAoIWljb25VcmwgJiYgIWVtYmVkQ29uZmlnLmN1c3RvbUljb25DbGFzc05hbWUpIHtcbiAgICAgIHRvb2x0aXBDdXN0b21JY29uLmNsYXNzTGlzdC50b2dnbGUoJ2ktYW1waHRtbC1oaWRkZW4nLCB0cnVlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBQdWJsaXNoZXIgc3BlY2lmaWVkIGEgdmFsaWQgaWNvbiB1cmwuXG4gICAgaWYgKGljb25VcmwpIHtcbiAgICAgIHRoaXMubXV0YXRvcl8ubXV0YXRlRWxlbWVudChcbiAgICAgICAgZGV2KCkuYXNzZXJ0RWxlbWVudCh0b29sdGlwQ3VzdG9tSWNvbiksXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBzZXRJbXBvcnRhbnRTdHlsZXMoZGV2KCkuYXNzZXJ0RWxlbWVudCh0b29sdGlwQ3VzdG9tSWNvbiksIHtcbiAgICAgICAgICAgICdiYWNrZ3JvdW5kLWltYWdlJzogYHVybCgke3BhcnNlVXJsRGVwcmVjYXRlZChpY29uVXJsKS5ocmVmfSlgLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIE5vIGljb24gc3JjIHNwZWNpZmllZCBieSBwdWJsaXNoZXIuIFVzZSBkZWZhdWx0IGljb24gZm91bmQgaW4gdGhlIGNvbmZpZy5cbiAgICB0aGlzLm11dGF0b3JfLm11dGF0ZUVsZW1lbnQoZGV2KCkuYXNzZXJ0RWxlbWVudCh0b29sdGlwQ3VzdG9tSWNvbiksICgpID0+IHtcbiAgICAgIHRvb2x0aXBDdXN0b21JY29uLmNsYXNzTGlzdC5hZGQoZW1iZWRDb25maWcuY3VzdG9tSWNvbkNsYXNzTmFtZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2hvdyBvciBoaWRlIGFycm93cyBiYXNlZCBvbiBjdXJyZW50IHBhZ2UuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVOYXZCdXR0b25zXygpIHtcbiAgICBpZiAoIXRoaXMuaXNMYXN0UGFnZV8oKSkge1xuICAgICAgdGhpcy5idXR0b25MZWZ0Xy5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICAgICAgdGhpcy5idXR0b25SaWdodF8ucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdG9yZVNlcnZpY2VfLmdldChTdGF0ZVByb3BlcnR5LlJUTF9TVEFURSlcbiAgICAgICAgPyB0aGlzLmJ1dHRvbkxlZnRfLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgdHJ1ZSlcbiAgICAgICAgOiB0aGlzLmJ1dHRvblJpZ2h0Xy5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJcyBsYXN0IHBhZ2UuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpc0xhc3RQYWdlXygpIHtcbiAgICBjb25zdCBwYWdlSW5kZXggPSB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuQ1VSUkVOVF9QQUdFX0lOREVYKTtcbiAgICBjb25zdCBwYWdlQ291bnQgPSB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuUEFHRV9JRFMpLmxlbmd0aDtcbiAgICByZXR1cm4gcGFnZUluZGV4ICsgMSA9PT0gcGFnZUNvdW50O1xuICB9XG5cbiAgLyoqXG4gICAqIFBvc2l0aW9ucyB0b29sdGlwIGFuZCBpdHMgcG9pbnRpbmcgYXJyb3cgYWNjb3JkaW5nIHRvIHRoZSBwb3NpdGlvbiBvZiB0aGVcbiAgICogdGFyZ2V0LlxuICAgKiBAcGFyYW0geyFJbnRlcmFjdGl2ZUNvbXBvbmVudERlZn0gY29tcG9uZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwb3NpdGlvblRvb2x0aXBfKGNvbXBvbmVudCkge1xuICAgIGNvbnN0IHN0YXRlID0ge2Fycm93T25Ub3A6IGZhbHNlfTtcblxuICAgIHRoaXMubXV0YXRvcl8ubWVhc3VyZU11dGF0ZUVsZW1lbnQoXG4gICAgICB0aGlzLnN0b3J5RWxfLFxuICAgICAgLyoqIG1lYXN1cmUgKi9cbiAgICAgICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFnZVJlY3QgPSB0aGlzLmNvbXBvbmVudFBhZ2VfLi8qT0sqLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICB0aGlzLmhvcml6b250YWxQb3NpdGlvbmluZ18oY29tcG9uZW50LCBwYWdlUmVjdCwgc3RhdGUpO1xuICAgICAgICB0aGlzLnZlcnRpY2FsUG9zaXRpb25pbmdfKGNvbXBvbmVudCwgcGFnZVJlY3QsIHN0YXRlKTtcbiAgICAgIH0sXG4gICAgICAvKiogbXV0YXRlICovXG4gICAgICAoKSA9PiB7XG4gICAgICAgIC8vIEFycm93IG9uIHRvcCBvciBib3R0b20gb2YgdG9vbHRpcC5cbiAgICAgICAgdGhpcy50b29sdGlwXy5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgICAgICdpLWFtcGh0bWwtdG9vbHRpcC1hcnJvdy1vbi10b3AnLFxuICAgICAgICAgIHN0YXRlLmFycm93T25Ub3BcbiAgICAgICAgKTtcblxuICAgICAgICBzZXRJbXBvcnRhbnRTdHlsZXMoZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLnRvb2x0aXBBcnJvd18pLCB7XG4gICAgICAgICAgbGVmdDogYCR7c3RhdGUuYXJyb3dMZWZ0T2Zmc2V0fXB4YCxcbiAgICAgICAgfSk7XG4gICAgICAgIHNldEltcG9ydGFudFN0eWxlcyhkZXZBc3NlcnQodGhpcy50b29sdGlwXyksIHtcbiAgICAgICAgICB0b3A6IGAke3N0YXRlLnRvb2x0aXBUb3B9cHhgLFxuICAgICAgICAgIGxlZnQ6IGAke3N0YXRlLnRvb2x0aXBMZWZ0fXB4YCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3NpdGlvbnMgdG9vbHRpcCBhbmQgaXRzIGFycm93IHZlcnRpY2FsbHkuXG4gICAqIEBwYXJhbSB7IUludGVyYWN0aXZlQ29tcG9uZW50RGVmfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHshQ2xpZW50UmVjdH0gcGFnZVJlY3RcbiAgICogQHBhcmFtIHshT2JqZWN0fSBzdGF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdmVydGljYWxQb3NpdGlvbmluZ18oY29tcG9uZW50LCBwYWdlUmVjdCwgc3RhdGUpIHtcbiAgICBjb25zdCB0b29sdGlwSGVpZ2h0ID0gdGhpcy50b29sdGlwXy4vKk9LKi8gb2Zmc2V0SGVpZ2h0O1xuICAgIGNvbnN0IHZlcnRpY2FsT2Zmc2V0ID0gVkVSVElDQUxfRURHRV9QQURESU5HO1xuXG4gICAgc3RhdGUudG9vbHRpcFRvcCA9IGNvbXBvbmVudC5jbGllbnRZIC0gdG9vbHRpcEhlaWdodCAtIHZlcnRpY2FsT2Zmc2V0O1xuICAgIGlmIChzdGF0ZS50b29sdGlwVG9wIDwgcGFnZVJlY3QudG9wICsgTUlOX1ZFUlRJQ0FMX1NQQUNFKSB7XG4gICAgICAvLyBUYXJnZXQgaXMgdG9vIGhpZ2ggdXAgc2NyZWVuLCBwbGFjZSB0b29sdGlwIGZhY2luZyBkb3duIHdpdGhcbiAgICAgIC8vIGFycm93IG9uIHRvcC5cbiAgICAgIHN0YXRlLmFycm93T25Ub3AgPSB0cnVlO1xuICAgICAgc3RhdGUudG9vbHRpcFRvcCA9IGNvbXBvbmVudC5jbGllbnRZICsgdmVydGljYWxPZmZzZXQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBvc2l0aW9ucyB0b29sdGlwIGFuZCBpdHMgYXJyb3cgaG9yaXpvbnRhbGx5LlxuICAgKiBAcGFyYW0geyFJbnRlcmFjdGl2ZUNvbXBvbmVudERlZn0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7IUNsaWVudFJlY3R9IHBhZ2VSZWN0XG4gICAqIEBwYXJhbSB7IU9iamVjdH0gc3RhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhvcml6b250YWxQb3NpdGlvbmluZ18oY29tcG9uZW50LCBwYWdlUmVjdCwgc3RhdGUpIHtcbiAgICBjb25zdCB0b29sdGlwV2lkdGggPSB0aGlzLnRvb2x0aXBfLi8qT0sqLyBvZmZzZXRXaWR0aDtcbiAgICBzdGF0ZS50b29sdGlwTGVmdCA9IGNvbXBvbmVudC5jbGllbnRYIC0gdG9vbHRpcFdpZHRoIC8gMjtcbiAgICBjb25zdCBtYXhMZWZ0ID1cbiAgICAgIHBhZ2VSZWN0LmxlZnQgKyBwYWdlUmVjdC53aWR0aCAtIEhPUklaT05UQUxfRURHRV9QQURESU5HIC0gdG9vbHRpcFdpZHRoO1xuICAgIGNvbnN0IG1pbkxlZnQgPSBwYWdlUmVjdC5sZWZ0ICsgSE9SSVpPTlRBTF9FREdFX1BBRERJTkc7XG5cbiAgICAvLyBNYWtlIHN1cmUgdG9vbHRpcCBpcyBpbnNpZGUgYm91bmRzIG9mIHRoZSBwYWdlLlxuICAgIHN0YXRlLnRvb2x0aXBMZWZ0ID0gTWF0aC5taW4oc3RhdGUudG9vbHRpcExlZnQsIG1heExlZnQpO1xuICAgIHN0YXRlLnRvb2x0aXBMZWZ0ID0gTWF0aC5tYXgoc3RhdGUudG9vbHRpcExlZnQsIG1pbkxlZnQpO1xuXG4gICAgc3RhdGUuYXJyb3dMZWZ0T2Zmc2V0ID0gTWF0aC5hYnMoXG4gICAgICBjb21wb25lbnQuY2xpZW50WCAtXG4gICAgICAgIHN0YXRlLnRvb2x0aXBMZWZ0IC1cbiAgICAgICAgdGhpcy50b29sdGlwQXJyb3dfLi8qT0sqLyBvZmZzZXRXaWR0aCAvIDJcbiAgICApO1xuXG4gICAgLy8gTWFrZSBzdXJlIHRvb2x0aXAgYXJyb3cgaXMgaW5zaWRlIGJvdW5kcyBvZiB0aGUgdG9vbHRpcC5cbiAgICBzdGF0ZS5hcnJvd0xlZnRPZmZzZXQgPSBNYXRoLm1pbihcbiAgICAgIHN0YXRlLmFycm93TGVmdE9mZnNldCxcbiAgICAgIHRvb2x0aXBXaWR0aCAtIFRPT0xUSVBfQVJST1dfUklHSFRfUEFERElOR1xuICAgICk7XG4gICAgc3RhdGUuYXJyb3dMZWZ0T2Zmc2V0ID0gTWF0aC5tYXgoc3RhdGUuYXJyb3dMZWZ0T2Zmc2V0LCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGNsaWNrIG91dHNpZGUgdGhlIHRvb2x0aXAuXG4gICAqIEBwYXJhbSB7IUV2ZW50fSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25PdXRzaWRlVG9vbHRpcENsaWNrXyhldmVudCkge1xuICAgIGlmIChcbiAgICAgICFjbG9zZXN0KGRldigpLmFzc2VydEVsZW1lbnQoZXZlbnQudGFyZ2V0KSwgKGVsKSA9PiBlbCA9PSB0aGlzLnRvb2x0aXBfKVxuICAgICkge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB0aGlzLmNsb3NlXygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgYW55IGF0dHJpYnV0ZXMgb3IgaGFuZGxlcnMgdGhhdCBtYXkgaGF2ZSBiZWVuIGFkZGVkIHRvIHRoZSB0b29sdGlwLFxuICAgKiBidXQgd2VyZW4ndCB1c2VkIGJlY2F1c2UgdGhlIHVzZXIgZGlzbWlzc2VkIHRoZSB0b29sdGlwLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2xlYXJUb29sdGlwXygpIHtcbiAgICB0aGlzLm11dGF0b3JfLm11dGF0ZUVsZW1lbnQoZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLnRvb2x0aXBfKSwgKCkgPT4ge1xuICAgICAgY29uc3QgYWN0aW9uSWNvbiA9IHRoaXMudG9vbHRpcF8ucXVlcnlTZWxlY3RvcihcbiAgICAgICAgJy5pLWFtcGh0bWwtdG9vbHRpcC1hY3Rpb24taWNvbidcbiAgICAgICk7XG4gICAgICBhY3Rpb25JY29uLmNsYXNzTmFtZSA9ICdpLWFtcGh0bWwtdG9vbHRpcC1hY3Rpb24taWNvbic7XG5cbiAgICAgIGNvbnN0IGN1c3RvbUljb24gPSB0aGlzLnRvb2x0aXBfLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICcuaS1hbXBodG1sLXN0b3J5LXRvb2x0aXAtY3VzdG9tLWljb24nXG4gICAgICApO1xuICAgICAgY3VzdG9tSWNvbi5jbGFzc05hbWUgPSAnaS1hbXBodG1sLXN0b3J5LXRvb2x0aXAtY3VzdG9tLWljb24nO1xuICAgICAgcmVzZXRTdHlsZXMoY3VzdG9tSWNvbiwgWydiYWNrZ3JvdW5kLWltYWdlJ10pO1xuXG4gICAgICB0aGlzLnRvb2x0aXBfLnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICAgICdjbGljaycsXG4gICAgICAgIHRoaXMuZXhwYW5kQ29tcG9uZW50SGFuZGxlcl8sXG4gICAgICAgIHRydWVcbiAgICAgICk7XG4gICAgICB0aGlzLnRvb2x0aXBfLmNsYXNzTGlzdC5yZW1vdmUoREFSS19USEVNRV9DTEFTUyk7XG4gICAgICB0aGlzLnRvb2x0aXBfLnJlbW92ZUF0dHJpYnV0ZSgnaHJlZicpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyB0aGUgZm9jdXNlZCBzdGF0ZSB0ZW1wbGF0ZS5cbiAgICogQHBhcmFtIHshRG9jdW1lbnR9IGRvY1xuICAgKiBAcmV0dXJuIHshRWxlbWVudH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGJ1aWxkRm9jdXNlZFN0YXRlVGVtcGxhdGVfKGRvYykge1xuICAgIGNvbnN0IGh0bWwgPSBodG1sRm9yKGRvYyk7XG4gICAgY29uc3QgdG9vbHRpcE92ZXJsYXkgPSBodG1sYFxuICAgICAgPHNlY3Rpb25cbiAgICAgICAgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktZm9jdXNlZC1zdGF0ZS1sYXllclxuICAgICAgICAgICAgaS1hbXBodG1sLXN0b3J5LXN5c3RlbS1yZXNldCBpLWFtcGh0bWwtaGlkZGVuXCJcbiAgICAgID5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWZvY3VzZWQtc3RhdGUtbGF5ZXItbmF2LWJ1dHRvbi1jb250YWluZXJcbiAgICAgICAgICAgICAgaS1hbXBodG1sLXN0b3J5LXRvb2x0aXAtbmF2LWJ1dHRvbi1sZWZ0XCJcbiAgICAgICAgPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHJlZj1cImJ1dHRvbkxlZnRcIlxuICAgICAgICAgICAgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktZm9jdXNlZC1zdGF0ZS1sYXllci1uYXYtYnV0dG9uXG4gICAgICAgICAgICAgICAgaS1hbXBodG1sLXN0b3J5LXRvb2x0aXAtbmF2LWJ1dHRvbi1sZWZ0XCJcbiAgICAgICAgICA+PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktZm9jdXNlZC1zdGF0ZS1sYXllci1uYXYtYnV0dG9uLWNvbnRhaW5lclxuICAgICAgICAgICAgICBpLWFtcGh0bWwtc3RvcnktdG9vbHRpcC1uYXYtYnV0dG9uLXJpZ2h0XCJcbiAgICAgICAgPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHJlZj1cImJ1dHRvblJpZ2h0XCJcbiAgICAgICAgICAgIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWZvY3VzZWQtc3RhdGUtbGF5ZXItbmF2LWJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBpLWFtcGh0bWwtc3RvcnktdG9vbHRpcC1uYXYtYnV0dG9uLXJpZ2h0XCJcbiAgICAgICAgICA+PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YVxuICAgICAgICAgIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LXRvb2x0aXBcIlxuICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgcmVmPVwidG9vbHRpcFwiXG4gICAgICAgICAgcm9sZT1cInRvb2x0aXBcIlxuICAgICAgICA+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS10b29sdGlwLWN1c3RvbS1pY29uXCI+PC9kaXY+XG4gICAgICAgICAgPHAgY2xhc3M9XCJpLWFtcGh0bWwtdG9vbHRpcC10ZXh0XCIgcmVmPVwidGV4dFwiPjwvcD5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXRvb2x0aXAtYWN0aW9uLWljb25cIj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LXRvb2x0aXAtYXJyb3dcIiByZWY9XCJhcnJvd1wiPjwvZGl2PlxuICAgICAgICA8L2E+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgYDtcbiAgICBjb25zdCBvdmVybGF5RWxzID0gaHRtbFJlZnModG9vbHRpcE92ZXJsYXkpO1xuICAgIGNvbnN0IHthcnJvdywgYnV0dG9uTGVmdCwgYnV0dG9uUmlnaHQsIHRvb2x0aXB9ID1cbiAgICAgIC8qKiBAdHlwZSB7IXRvb2x0aXBFbGVtZW50c0RlZn0gKi8gKG92ZXJsYXlFbHMpO1xuXG4gICAgdGhpcy50b29sdGlwXyA9IHRvb2x0aXA7XG4gICAgdGhpcy50b29sdGlwQXJyb3dfID0gYXJyb3c7XG4gICAgdGhpcy5idXR0b25MZWZ0XyA9IGJ1dHRvbkxlZnQ7XG4gICAgdGhpcy5idXR0b25SaWdodF8gPSBidXR0b25SaWdodDtcbiAgICBjb25zdCBydGxTdGF0ZSA9IHRoaXMuc3RvcmVTZXJ2aWNlXy5nZXQoU3RhdGVQcm9wZXJ0eS5SVExfU1RBVEUpO1xuXG4gICAgdGhpcy5idXR0b25MZWZ0Xy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PlxuICAgICAgdGhpcy5vbk5hdmlnYXRpb25hbENsaWNrXyhcbiAgICAgICAgZSxcbiAgICAgICAgcnRsU3RhdGUgPyBFdmVudFR5cGUuTkVYVF9QQUdFIDogRXZlbnRUeXBlLlBSRVZJT1VTX1BBR0VcbiAgICAgIClcbiAgICApO1xuXG4gICAgdGhpcy5idXR0b25SaWdodF8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT5cbiAgICAgIHRoaXMub25OYXZpZ2F0aW9uYWxDbGlja18oXG4gICAgICAgIGUsXG4gICAgICAgIHJ0bFN0YXRlID8gRXZlbnRUeXBlLlBSRVZJT1VTX1BBR0UgOiBFdmVudFR5cGUuTkVYVF9QQUdFXG4gICAgICApXG4gICAgKTtcblxuICAgIHJldHVybiB0b29sdGlwT3ZlcmxheTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgdG8gbmV4dC9wcmV2aW91cyBwYWdlLlxuICAgKiBAcGFyYW0geyFFdmVudH0gZXZlbnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25OYXZpZ2F0aW9uYWxDbGlja18oZXZlbnQsIGRpcmVjdGlvbikge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKFxuICAgICAgQWN0aW9uLlNFVF9BRFZBTkNFTUVOVF9NT0RFLFxuICAgICAgQWR2YW5jZW1lbnRNb2RlLk1BTlVBTF9BRFZBTkNFXG4gICAgKTtcbiAgICBkaXNwYXRjaChcbiAgICAgIHRoaXMud2luXyxcbiAgICAgIGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5zaGFkb3dSb290XyksXG4gICAgICBkaXJlY3Rpb24sXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB7YnViYmxlczogdHJ1ZX1cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIExpbmtlcnMgZG9uJ3Qgd29yayBvbiBzaGFkb3cgcm9vdCBlbGVtZW50cyBzbyB3ZSBjbGljayBhIGNsb25lIG9mIHRoZSBhbmNob3Igb24gdGhlIHJvb3QgZG9tLlxuICAgKiBAcGFyYW0geyFFdmVudH0gZXZlbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uQW5jaG9yQ2xpY2tfKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0cmlnZ2VyQ2xpY2tGcm9tTGlnaHREb20odGhpcy50b29sdGlwXywgdGhpcy5zdG9yeUVsXyk7XG4gIH1cblxuICAvKipcbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqIEByZXR1cm4gez9FbGVtZW50fVxuICAgKi9cbiAgZ2V0U2hhZG93Um9vdEZvclRlc3RpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2hhZG93Um9vdF87XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-embedded-component.js