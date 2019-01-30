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
  Action,
  StateProperty,
  UIType,
  getStoreService,
} from './amp-story-store-service';
import {AdvancementMode} from './analytics';
import {CSS} from '../../../build/amp-story-tooltip-1.0.css';
import {EventType, dispatch} from './events';
import {Services} from '../../../src/services';
import {addAttributesToElement, closest, matches} from '../../../src/dom';
import {createShadowRootWithStyle, getSourceOriginForElement} from './utils';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getAmpdoc} from '../../../src/service';
import {htmlFor, htmlRefs} from '../../../src/static-template';
import {isProtocolValid, parseUrlDeprecated} from '../../../src/url';
import {resetStyles, setImportantStyles, toggle} from '../../../src/style';

/**
 * Action icons to be placed in tooltip.
 * @enum {string}
 * @private
 */
const ActionIcon = {
  LAUNCH: 'i-amphtml-tooltip-action-icon-launch',
  EXPAND: 'i-amphtml-tooltip-action-icon-expand',
};

/**
 * Components that can be expanded.
 * @const {!Object}
 * @private
 */
const EXPANDABLE_COMPONENTS = {
  'amp-twitter': {
    componentIcon: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.' +
    'w3.org/2000/svg" width="400" height="400"><g fill="none" fill-rule="eve' +
    'nodd"><path d="M0 0h400v400H0z"/><path fill="%231da1f2" fill-rule="nonz' +
    'ero" d="M153.62 301.59c94.34 0 145.94-78.16 145.94-145.94 0-2.22 0-4.43' +
    '-.15-6.63A104.36 104.36 0 0 0 325 122.47a102.38 102.38 0 0 1-29.46 8.07 ' +
    '51.47 51.47 0 0 0 22.55-28.37 102.79 102.79 0 0 1-32.57 12.45c-15.9-16.' +
    '906-41.163-21.044-61.625-10.093-20.461 10.95-31.032 34.266-25.785 56.87' +
    '3A145.62 145.62 0 0 1 92.4 107.81c-13.614 23.436-6.66 53.419 15.88 68.4' +
    '7A50.91 50.91 0 0 1 85 169.86v.65c.007 24.416 17.218 45.445 41.15 50.28' +
    'a51.21 51.21 0 0 1-23.16.88c6.72 20.894 25.976 35.208 47.92 35.62a102.9' +
    '2 102.92 0 0 1-63.7 22 104.41 104.41 0 0 1-12.21-.74 145.21 145.21 0 0 ' +
    '0 78.62 23"/></g></svg>',
    actionIcon: ActionIcon.EXPAND,
    // TODO(enriqe): change for i18n label.
    defaultText: 'View on Twitter',
    selector: 'amp-twitter',
  },
};

/**
 * Components that can be launched.
 * @const {!Object}
 * @private
 */
const LAUNCHABLE_COMPONENTS = {
  'a': {
    componentIcon: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
    actionIcon: ActionIcon.LAUNCH,
    selector: 'a[href]',
  },
};

/**
 * Union of expandable and launchable components.
 * @private
 * @const {!Object}
 */
const INTERACTIVE_COMPONENTS = Object.assign({}, EXPANDABLE_COMPONENTS,
    LAUNCHABLE_COMPONENTS);

/**
 * Gets the list of components with their respective selectors.
 * @param {!Object} components
 * @return {!Object<string, string>}
 */
function getComponentSelectors(components) {
  const obj = {};

  Object.keys(components).forEach(key => {
    obj[key] = components[key].selector;
  });

  return obj;
}

/**
 * Contains all interactive component CSS selectors.
 * @type {!Object}
 */
const interactiveComponentSelectors = Object.assign({},
    getComponentSelectors(INTERACTIVE_COMPONENTS),
    {EXPANDED_VIEW_OVERLAY: '.i-amphtml-story-expanded-view-overflow, ' +
    '.i-amphtml-expanded-view-close-button',
    });

/**
 * Selectors that should delegate to AmpStoryEmbeddedComponent.
 * @return {!Object}
 */
export function embeddedComponentSelectors() {
  // Using indirect invocation to prevent no-export-side-effect issue.
  return interactiveComponentSelectors;
}

/**
 * Builds expanded view overlay for expandable components.
 * @param {!Element} element
 * @return {!Element}
 */
const buildExpandedViewOverlay = element => htmlFor(element)`
    <div class="i-amphtml-story-expanded-view-overflow
        i-amphtml-story-system-reset">
      <span class="i-amphtml-expanded-view-close-button" role="button">
      </span>
    </div>`;

/**
 * Minimum vertical space needed to position tooltip.
 * @const {number}
 */
const MIN_VERTICAL_SPACE = 48;

/**
 * Padding between tooltip and edges of screen.
 * @const {number}
 */
const EDGE_PADDING = 8;

/**
 * Blank icon when no data-tooltip-icon src is specified.
 * @const {string}
 */
const DEFAULT_ICON_SRC =
  'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

/**
 * @struct @typedef {{
 *   tooltip: !Element,
 *   buttonLeft: !Element,
 *   buttonRight: !Element,
 *   arrow: !Element,
 * }}
 */
let tooltipElementsDef;

const TAG = 'amp-story-embedded-component';

/**
 * States in which an embedded component could be found in.
 * @enum {number}
 */
const ComponentState = {
  HIDDEN: 0, // Component is present in page, but hasn't been interacted with.
  FOCUSED: 1, // Component has been clicked, a tooltip should be shown.
  EXPANDED: 2, // Component is in expanded mode.
};

/**
 * Embedded components found in amp-story.
 */
export class AmpStoryEmbeddedComponent {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   */
  constructor(win, storyEl) {
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

    /** @private @const {!../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(getAmpdoc(this.win_.document));

    /** @private {?Element} */
    this.expandedViewOverlay_ = null;

    /**
     * Target producing the tooltip. Used to avoid building the same
     * element twice.
     * @private {?Element} */
    this.previousTarget_ = null;

    /** @private */
    this.expandComponentHandler_ = this.onExpandComponent_.bind(this);

    this.storeService_.subscribe(StateProperty.EMBEDDED_COMPONENT, target => {
      this.onEmbeddedComponentUpdate_(target);
    });

    this.state_ = ComponentState.HIDDEN;
  }

  /**
   * Reacts to embedded component updates.
   * @param {?Element} target
   * @private
   */
  onEmbeddedComponentUpdate_(target) {
    switch (this.state_) {
      case ComponentState.FOCUSED:
      case ComponentState.HIDDEN:
        target ? this.setState_(ComponentState.FOCUSED, target) :
          this.setState_(ComponentState.HIDDEN, null /** target */);
        break;
      case ComponentState.EXPANDED:
        this.maybeCloseExpandedView_(target);
        break;
      default:
        dev().warn(TAG, `ComponentState ${this.state_} does not exist`);
        break;
    }
  }

  /**
   * Sets new state for the embedded component.
   * @param {ComponentState} state
   * @param {?Element} target
   * @private
   */
  setState_(state, target) {
    switch (state) {
      case ComponentState.FOCUSED:
      case ComponentState.HIDDEN:
        this.state_ = state;
        this.onFocusedStateUpdate_(target);
        break;
      case ComponentState.EXPANDED:
        this.state_ = state;
        this.onFocusedStateUpdate_(null);
        this.toggleExpandedView_(target);
        break;
      default:
        dev().warn(TAG, `ComponentState ${this.state_} does not exist`);
        break;
    }
  }

  /**
   * Toggles expanded view for interactive components that support it.
   * @param {?Element} targetToExpand
   * @private
   */
  toggleExpandedView_(targetToExpand) {
    const storyPage = devAssert(
        this.storyEl_.querySelector('amp-story-page[active]'));

    if (!targetToExpand) {
      this.expandedViewOverlay_ &&
        this.resources_.mutateElement(this.expandedViewOverlay_, () => {
          storyPage.classList.toggle('i-amphtml-expanded-mode', false);
          toggle(devAssert(this.expandedViewOverlay_), false);
          resetStyles(devAssert(this.previousTarget_), ['transform']);
        });
      return;
    }

    this.animateExpanded_(devAssert(targetToExpand));

    if (!this.expandedViewOverlay_) {
      this.buildAndAppendExpandedViewOverlay_(storyPage);
    }
    this.resources_.mutateElement(devAssert(this.expandedViewOverlay_), () => {
      toggle(devAssert(this.expandedViewOverlay_), true);
      storyPage.classList.toggle('i-amphtml-expanded-mode', true);
    });
  }

  /**
   * Builds the expanded view overlay element and appends it to the page.
   * @param {!Element} storyPage
   * @private
   */
  buildAndAppendExpandedViewOverlay_(storyPage) {
    this.expandedViewOverlay_ = buildExpandedViewOverlay(this.storyEl_);
    this.resources_.mutateElement(storyPage, () => storyPage.appendChild(
        this.expandedViewOverlay_));
  }

  /**
   * Closes the expanded view overlay.
   * @param {?Element} target
   * @private
   */
  maybeCloseExpandedView_(target) {
    if (target && matches(target, '.i-amphtml-expanded-view-close-button')) {
      // Target is expanded and going into hidden mode.
      this.closeFocusedState_();
      this.toggleExpandedView_(null);
      this.tooltip_.removeEventListener('click', this.expandComponentHandler_,
          true /** capture */);
      this.storeService_.dispatch(Action.TOGGLE_EXPANDED_COMPONENT, null);
    }
  }

  /**
   * Builds the tooltip overlay and appends it to the provided story.
   * @private
   */
  buildFocusedState_() {
    this.shadowRoot_ = this.win_.document.createElement('div');

    this.focusedStateOverlay_ =
      devAssert(this.buildFocusedStateTemplate_(this.win_.document));
    createShadowRootWithStyle(this.shadowRoot_, this.focusedStateOverlay_, CSS);

    this.focusedStateOverlay_
        .addEventListener('click', event => this.onOutsideTooltipClick_(event));

    this.storeService_.subscribe(StateProperty.UI_STATE, isDesktop => {
      this.onUIStateUpdate_(isDesktop);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, () => {
      // Hide active tooltip when page switch is triggered by keyboard or
      // desktop buttons.
      if (this.storeService_.get(StateProperty.EMBEDDED_COMPONENT)) {
        this.closeFocusedState_();
      }
    });

    return this.shadowRoot_;
  }

  /**
   * Hides the tooltip layer.
   * @private
   */
  closeFocusedState_() {
    this.clearTooltip_();
    this.setState_(ComponentState.HIDDEN, null /** target */);
  }

  /**
   * Reacts to store updates related to the focused state, when a tooltip is
   * active.
   * @param {?Element} target
   * @private
   */
  onFocusedStateUpdate_(target) {
    if (!target) {
      this.storeService_.dispatch(Action.TOGGLE_EMBEDDED_COMPONENT, null);
      this.resources_.mutateElement(
          devAssert(this.focusedStateOverlay_),
          () => {
            this.focusedStateOverlay_
                .classList.toggle('i-amphtml-hidden', true);
          });
      return;
    }

    if (!this.focusedStateOverlay_) {
      this.storyEl_.appendChild(this.buildFocusedState_());
    }

    this.updateTooltipBehavior_(target);
    this.updateTooltipEl_(target);
    this.previousTarget_ = target;

    this.resources_.mutateElement(
        devAssert(this.focusedStateOverlay_),
        () => {
          this.focusedStateOverlay_
              .classList.toggle('i-amphtml-hidden', false);
        });
  }

  /**
   * Reacts to desktop state updates and hides navigation buttons since we
   * already have in the desktop UI.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.resources_.mutateElement(
        devAssert(this.focusedStateOverlay_),
        () => {
          [UIType.DESKTOP_FULLBLEED, UIType.DESKTOP_PANELS].includes(uiState) ?
            this.focusedStateOverlay_.setAttribute('desktop', '') :
            this.focusedStateOverlay_.removeAttribute('desktop');
        });
  }

  /**
   * Builds tooltip and attaches it depending on the target's content and
   * position.
   * @param {!Element} target
   * @private
   */
  updateTooltipEl_(target) {
    const embedConfig = userAssert(this.getEmbedConfigFor_(target), 'Invalid ' +
      'embed config for target', target);

    this.updateTooltipText_(target, embedConfig);
    this.updateTooltipComponentIcon_(target, embedConfig);
    this.updateTooltipActionIcon_(embedConfig);
    this.positionTooltip_(target);
  }

  /**
   * Updates tooltip behavior depending on the target.
   * @param {!Element} target
   * @private
   */
  updateTooltipBehavior_(target) {
    if (matches(target, LAUNCHABLE_COMPONENTS['a'].selector)) {
      addAttributesToElement(devAssert(this.tooltip_),
          dict({'href': this.getElementHref_(target)}));
      return;
    }

    if (EXPANDABLE_COMPONENTS[target.tagName.toLowerCase()]) {
      this.tooltip_.addEventListener('click', this.expandComponentHandler_,
          true);
    }
  }

  /**
   * Handles the event of an interactive element coming into expanded view.
   * @param {!Event} event
   * @private
   */
  onExpandComponent_(event) {
    event.preventDefault();
    event.stopPropagation();

    this.setState_(ComponentState.EXPANDED, this.previousTarget_);

    this.storeService_.dispatch(
        Action.TOGGLE_EXPANDED_COMPONENT, this.previousTarget_);
  }

  /**
   * Gets href from an element containing a url.
   * @param {!Element} target
   * @private
   */
  getElementHref_(target) {
    const elUrl = target.getAttribute('href');
    if (!isProtocolValid(elUrl)) {
      user().error(TAG, 'The tooltip url is invalid');
      return;
    }

    return parseUrlDeprecated(elUrl).href;
  }

  /**
   * Gets corresponding config for a given embed target.
   * @param {!Element} target
   * @return {?Object}
   */
  getEmbedConfigFor_(target) {
    const config = INTERACTIVE_COMPONENTS[target.tagName.toLowerCase()];
    if (config && matches(target, config.selector)) {
      return config;
    }

    user().error(TAG, 'No config matching provided target.');
    return null;
  }

  /**
   * Animates into expanded view.
   * @param {!Element} target
   * @private
   */
  animateExpanded_(target) {
    const state = {};
    this.resources_.measureMutateElement(target,
        /** measure */
        () => {
          const targetRect = target./*OK*/getBoundingClientRect();
          const storyPage =
            this.storyEl_.querySelector('amp-story-page[active]');
          const pageRect = storyPage./*OK*/getBoundingClientRect();

          const centeredTop = pageRect.height / 2 - targetRect.height / 2;
          const centeredLeft = pageRect.width / 2 - targetRect.width / 2;

          // Only account for offset from target to page borders. Since in
          // desktop mode page is not at the borders of viewport.
          const leftOffset = targetRect.left - pageRect.left;
          const topOffset = targetRect.top - pageRect.top;

          state.translateY = centeredTop - topOffset;
          state.translateX = leftOffset - centeredLeft;
        },
        /** mutate */
        () => {
          target.classList.add('i-amphtml-animate-expand-in');
          setImportantStyles(dev().assertElement(target),
              {
                transform: `translate3d(${state.translateX}px,
                    ${state.translateY}px, 0)`,
              });
        });
  }

  /**
   * Updates tooltip text content.
   * @param {!Element} target
   * @param {!Object} embedConfig
   * @private
   */
  updateTooltipText_(target, embedConfig) {
    const tooltipText = target.getAttribute('data-tooltip-text') ||
      embedConfig.defaultText ||
      getSourceOriginForElement(target, this.getElementHref_(target));
    const existingTooltipText =
      this.tooltip_.querySelector('.i-amphtml-tooltip-text');

    existingTooltipText.textContent = tooltipText;
  }

  /**
   * Updates tooltip action icon. This is found on the right of the text.
   * @param {!Object} embedConfig
   * @private
   */
  updateTooltipActionIcon_(embedConfig) {
    const actionIcon =
      this.tooltip_.querySelector('.i-amphtml-tooltip-action-icon');

    this.resources_.mutateElement(devAssert(actionIcon), () => {
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
  updateTooltipComponentIcon_(target, embedConfig) {
    const iconUrl = target.getAttribute('data-tooltip-icon');
    if (!isProtocolValid(iconUrl)) {
      user().error(TAG, 'The tooltip icon url is invalid');
      return;
    }
    const iconSrc = iconUrl ? parseUrlDeprecated(iconUrl).href :
      embedConfig.componentIcon;

    const existingTooltipIcon =
      this.tooltip_.querySelector('.i-amphtml-story-tooltip-icon');

    if (existingTooltipIcon.firstElementChild) {
      addAttributesToElement(existingTooltipIcon.firstElementChild,
          dict({'src': iconSrc}));
    }

    existingTooltipIcon.classList.toggle('i-amphtml-hidden',
        iconSrc == DEFAULT_ICON_SRC);
  }

  /**
   * Positions tooltip and its pointing arrow according to the position of the
   * target.
   * @param {!Element} target
   * @private
   */
  positionTooltip_(target) {
    const state = {arrowOnTop: false};

    this.resources_.measureMutateElement(this.storyEl_,
        /** measure */
        () => {
          const storyPage =
              this.storyEl_.querySelector('amp-story-page[active]');
          const targetRect = target./*OK*/getBoundingClientRect();
          const pageRect = storyPage./*OK*/getBoundingClientRect();

          this.verticalPositioning_(targetRect, pageRect, state);
          this.horizontalPositioning_(targetRect, pageRect, state);
        },
        /** mutate */
        () => {
          // Arrow on top or bottom of tooltip.
          this.tooltip_.classList.toggle('i-amphtml-tooltip-arrow-on-top',
              state.arrowOnTop);

          setImportantStyles(devAssert(this.tooltipArrow_),
              {left: `${state.arrowLeftOffset}px`});
          setImportantStyles(devAssert(this.tooltip_),
              {top: `${state.tooltipTop}px`, left: `${state.tooltipLeft}px`});
        });
  }

  /**
   * In charge of deciding where to position the tooltip depending on the
   * target's position and size, and available space in the page. Also
   * places the tooltip's arrow on top when the tooltip is below an element.
   * @param {!ClientRect} targetRect
   * @param {!ClientRect} pageRect
   * @param {!Object} state
   * @private
   */
  verticalPositioning_(targetRect, pageRect, state) {
    const targetTopOffset = targetRect.top - pageRect.top;
    const targetBottomOffset = targetRect.bottom - pageRect.top;

    if (targetTopOffset > MIN_VERTICAL_SPACE) { // Tooltip fits above target.
      state.tooltipTop = targetRect.top - MIN_VERTICAL_SPACE;
    } else if (pageRect.height - targetBottomOffset >
        MIN_VERTICAL_SPACE) { // Tooltip fits below target. Place arrow on top of the tooltip.
      state.tooltipTop = targetRect.bottom + EDGE_PADDING;
      state.arrowOnTop = true;
    } else { // Element takes whole vertical space. Place tooltip on the middle.
      state.tooltipTop = pageRect.height / 2;
    }
  }

  /**
   * In charge of positioning the tooltip and the tooltip's arrow horizontally.
   * @param {!ClientRect} targetRect
   * @param {!ClientRect} pageRect
   * @param {!Object} state
   * @private
   */
  horizontalPositioning_(targetRect, pageRect, state) {
    const targetLeftOffset = targetRect.left - pageRect.left;
    const elCenterLeft = targetRect.width / 2 + targetLeftOffset;
    const tooltipWidth = this.tooltip_./*OK*/offsetWidth;
    state.tooltipLeft = elCenterLeft - (tooltipWidth / 2);
    const maxHorizontalLeft = pageRect.width - tooltipWidth - EDGE_PADDING;

    // Make sure tooltip is not out of the page.
    state.tooltipLeft = Math.min(state.tooltipLeft, maxHorizontalLeft);
    state.tooltipLeft = Math.max(EDGE_PADDING, state.tooltipLeft);

    state.arrowLeftOffset = Math.abs(elCenterLeft - state.tooltipLeft -
        this.tooltipArrow_./*OK*/offsetWidth / 2);
    // Make sure tooltip arrow is not out of the tooltip.
    state.arrowLeftOffset =
      Math.min(state.arrowLeftOffset, tooltipWidth - EDGE_PADDING * 3);

    state.tooltipLeft += pageRect.left;
  }

  /**
   * Handles click outside the tooltip.
   * @param {!Event} event
   * @private
   */
  onOutsideTooltipClick_(event) {
    if (!closest(dev().assertElement(event.target),
        el => el == this.tooltip_)) {
      event.stopPropagation();
      this.closeFocusedState_();
    }
  }

  /**
   * Clears any attributes or handlers that may have been added to the tooltip,
   * but weren't used because the user dismissed the tooltip.
   * @private
   */
  clearTooltip_() {
    this.resources_.mutateElement(devAssert(this.tooltip_), () => {
      const actionIcon =
        this.tooltip_.querySelector('.i-amphtml-tooltip-action-icon');
      actionIcon.classList.toggle(ActionIcon.LAUNCH, false);
      actionIcon.classList.toggle(ActionIcon.EXPAND, false);

      this.tooltip_.removeEventListener('click', this.expandComponentHandler_,
          true);
      this.tooltip_.removeAttribute('href');
    });
  }

  /**
   * Builds the focused state template.
   * @param {!Document} doc
   * @return {!Element}
   * @private
   */
  buildFocusedStateTemplate_(doc) {
    const html = htmlFor(doc);
    const tooltipOverlay =
        html`
        <section class="i-amphtml-story-focused-state-layer i-amphtml-hidden">
          <div class="i-amphtml-story-focused-state-layer-nav-button-container
              i-amphtml-story-tooltip-nav-button-left">
            <button role="button" ref="buttonLeft"
                class="i-amphtml-story-focused-state-layer-nav-button
                i-amphtml-story-tooltip-nav-button-left">
            </button>
          </div>
          <div class="i-amphtml-story-focused-state-layer-nav-button-container
              i-amphtml-story-tooltip-nav-button-right">
            <button role="button" ref="buttonRight"
                class="i-amphtml-story-focused-state-layer-nav-button
                    i-amphtml-story-tooltip-nav-button-right">
            </button>
          </div>
          <a class="i-amphtml-story-tooltip" target="_blank" ref="tooltip">
            <div class="i-amphtml-story-tooltip-icon"><img ref="icon"></div>
            <p class="i-amphtml-tooltip-text" ref="text"></p>
            <div class="i-amphtml-tooltip-action-icon"></div>
            <div class="i-amphtml-story-tooltip-arrow" ref="arrow"></div>
          </a>
        </section>`;
    const overlayEls = htmlRefs(tooltipOverlay);
    const {tooltip, buttonLeft, buttonRight, arrow} =
      /** @type {!tooltipElementsDef} */ (overlayEls);

    this.tooltip_ = tooltip;
    this.tooltipArrow_ = arrow;
    const rtlState = this.storeService_.get(StateProperty.RTL_STATE);

    buttonLeft.addEventListener('click', e =>
      this.onNavigationalClick_(e, rtlState ?
        EventType.NEXT_PAGE : EventType.PREVIOUS_PAGE));


    buttonRight.addEventListener('click', e =>
      this.onNavigationalClick_(e, rtlState ?
        EventType.PREVIOUS_PAGE : EventType.NEXT_PAGE));

    return tooltipOverlay;
  }

  /**
   * Navigates to next/previous page.
   * @param {!Event} event
   * @param {string} direction
   * @private
   */
  onNavigationalClick_(event, direction) {
    event.preventDefault();
    this.storeService_.dispatch(
        Action.SET_ADVANCEMENT_MODE, AdvancementMode.MANUAL_ADVANCE);
    dispatch(
        this.win_,
        devAssert(this.shadowRoot_),
        direction,
        undefined,
        {bubbles: true});
  }
}
