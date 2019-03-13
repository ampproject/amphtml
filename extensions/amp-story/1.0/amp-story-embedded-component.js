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
  EmbeddedComponentState,
  InteractiveComponentDef,
  StateProperty,
  UIType,
  getStoreService,
} from './amp-story-store-service';
import {AdvancementMode} from './story-analytics';
import {CSS} from '../../../build/amp-story-tooltip-1.0.css';
import {EventType, dispatch} from './events';
import {LocalizedStringId} from './localization';
import {Services} from '../../../src/services';
import {addAttributesToElement, closest, matches} from '../../../src/dom';
import {createShadowRootWithStyle, getSourceOriginForElement} from './utils';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getAmpdoc} from '../../../src/service';
import {htmlFor, htmlRefs} from '../../../src/static-template';
import {isProtocolValid, parseUrlDeprecated} from '../../../src/url';
import {
  px,
  setImportantStyles,
  toggle,
} from '../../../src/style';

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
export const EXPANDABLE_COMPONENTS = {
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
    localizedStringId: LocalizedStringId.AMP_STORY_TOOLTIP_EXPAND_TWEET,
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
 * Maps each embedded element to its corresponding style.
 * @type {!JsonObject}
 */
const embedStyleEls = dict();

/**
 * Generates ids for embedded component styles.
 * @type {number}
 */
let embedIds = 0;

/**
 * Contains metadata about embedded components, found in <style> elements.
 * @const {string}
 */
const AMP_EMBED_DATA = '__AMP_EMBED_DATA__';

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
let EmbedDataDef;

/**
 * @const {string}
 */
export const EMBED_ID_ATTRIBUTE_NAME = 'i-amphtml-embed-id';

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
 * Updates embed's corresponding <style> element with embedData.
 * @param {!Element} embedStyleEl
 * @param {!EmbedDataDef} embedData
 */
function updateEmbedStyleEl(embedStyleEl, embedData) {
  const embedId = embedData.id;

  embedStyleEl.textContent = `[${EMBED_ID_ATTRIBUTE_NAME}="${embedId}"] {
      width: ${px(embedData.width)} !important;
      height: ${px(embedData.height)} !important;
      transform: ${embedData.transform} !important;
      margin: ${embedData.verticalMargin}px ${embedData.horizontalMargin}px
          !important;
      }`;
}

/**
 * Minimum vertical space needed to position tooltip.
 * @const {number}
 */
const MIN_VERTICAL_SPACE = 48;

/**
 * Limits the amount of vertical space a component can take in a page, this
 * makes sure no component is blocking the close button at the top of the
 * expanded view.
 * @const {number}
 * @private
 */
const VERTICAL_PADDING = 96;

/**
 * Padding between tooltip and vertical edges of screen.
 * @const {number}
 */
const VERTICAL_EDGE_PADDING = 24;

/**
 * Padding between tooltip and horizontal edges of screen.
 * @const {number}
 */
const HORIZONTAL_EDGE_PADDING = 32;

/**
 * Padding between tooltip arrow and right edge of the tooltip.
 * @const {number}
 */
const TOOLTIP_ARROW_RIGHT_PADDING = 24;

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
        /** @param {!InteractiveComponentDef} component */ component => {
          this.onComponentStateUpdate_(component);
        });

    /** @private {EmbeddedComponentState} */
    this.state_ = EmbeddedComponentState.HIDDEN;
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
  onComponentStateUpdate_(component) {
    switch (component.state) {
      case EmbeddedComponentState.HIDDEN:
        this.setState_(EmbeddedComponentState.HIDDEN, null /** component */);
        break;
      case EmbeddedComponentState.FOCUSED:
        if (this.state_ !== EmbeddedComponentState.HIDDEN) {
          dev().warn(TAG,
              `Invalid component update. Not possible to go from ${this.state_}
              to ${component.state}`);
        }
        this.setState_(EmbeddedComponentState.FOCUSED, component);
        break;
      case EmbeddedComponentState.EXPANDED:
        if (this.state_ === EmbeddedComponentState.FOCUSED) {
          this.setState_(EmbeddedComponentState.EXPANDED, component);
        } else if (this.state_ === EmbeddedComponentState.EXPANDED) {
          this.maybeCloseExpandedView_(component.element);
        } else {
          dev().warn(TAG,
              `Invalid component update. Not possible to go from ${this.state_}
               to ${component.state}`);
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
  setState_(state, component) {
    switch (state) {
      case EmbeddedComponentState.FOCUSED:
        this.state_ = state;
        this.onFocusedStateUpdate_(component);
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
        break;
      default:
        dev().warn(TAG, `EmbeddedComponentState ${this.state_} does not exist`);
        break;
    }
  }

  /**
   * Schedules embeds to be paused.
   * @param {!Element} embedEl
   * @private
   */
  scheduleEmbedToPause_(embedEl) {
    // Resources that previously called `schedulePause` must also call
    // `scheduleResume`. Calling `scheduleResume` on resources that did not
    // previously call `schedulePause` has no effect.
    this.resources_.scheduleResume(this.storyEl_, embedEl);
    if (!this.embedsToBePaused_.includes(embedEl)) {
      this.embedsToBePaused_.push(embedEl);
    }
  }

  /**
   * Toggles expanded view for interactive components that support it.
   * @param {?Element} targetToExpand
   * @private
   */
  toggleExpandedView_(targetToExpand) {
    if (!targetToExpand) {
      this.expandedViewOverlay_ &&
        this.resources_.mutateElement(this.expandedViewOverlay_, () => {
          this.componentPage_.classList.toggle(
              'i-amphtml-expanded-mode', false);
          toggle(devAssert(this.expandedViewOverlay_), false);
          this.closeExpandedEl_();
        });
      return;
    }

    this.animateExpanded_(devAssert(targetToExpand));

    this.expandedViewOverlay_ = this.componentPage_
        .querySelector('.i-amphtml-story-expanded-view-overflow');
    if (!this.expandedViewOverlay_) {
      this.buildAndAppendExpandedViewOverlay_();
    }
    this.resources_.mutateElement(devAssert(this.expandedViewOverlay_), () => {
      toggle(devAssert(this.expandedViewOverlay_), true);
      this.componentPage_.classList.toggle('i-amphtml-expanded-mode', true);
    });
  }

  /**
   * Builds the expanded view overlay element and appends it to the page.
   * @private
   */
  buildAndAppendExpandedViewOverlay_() {
    this.expandedViewOverlay_ = buildExpandedViewOverlay(this.storyEl_);
    this.resources_.mutateElement(devAssert(this.componentPage_),
        () => this.componentPage_.appendChild(this.expandedViewOverlay_));
  }

  /**
   * Closes the expanded view overlay.
   * @param {?Element} target
   * @param {boolean=} forceClose Force closing the expanded view.
   * @private
   */
  maybeCloseExpandedView_(target, forceClose = false) {
    if ((target && matches(target, '.i-amphtml-expanded-view-close-button')) ||
      forceClose) {
      // Target is expanded and going into hidden mode.
      this.close_();
      this.toggleExpandedView_(null);
      this.tooltip_.removeEventListener('click', this.expandComponentHandler_,
          true /** capture */);
    }
  }

  /**
   * Builds the tooltip overlay and appends it to the provided story.
   * @private
   */
  buildFocusedState_() {
    this.shadowRoot_ = this.win_.document.createElement('div');

    this.focusedStateOverlay_ = this.buildFocusedStateTemplate_();
    createShadowRootWithStyle(this.shadowRoot_, this.focusedStateOverlay_, CSS);

    this.focusedStateOverlay_
        .addEventListener('click', event => this.onOutsideTooltipClick_(event));

    return this.shadowRoot_;
  }

  /**
   * Clears tooltip UI and updates store state to hidden.
   * @private
   */
  close_() {
    this.clearTooltip_();
    this.storeService_.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT,
        {state: EmbeddedComponentState.HIDDEN});
  }

  /**
   * Reacts to store updates related to the focused state, when a tooltip is
   * active.
   * @param {?InteractiveComponentDef} component
   * @private
   */
  onFocusedStateUpdate_(component) {
    if (!component) {
      this.resources_.mutateElement(
          devAssert(this.focusedStateOverlay_),
          () => {
            this.focusedStateOverlay_
                .classList.toggle('i-amphtml-hidden', true);
          });
      return;
    }

    // First time attaching the overlay. Runs only once.
    if (!this.focusedStateOverlay_) {
      this.storyEl_.appendChild(this.buildFocusedState_());
      this.initializeListeners_();
    }

    this.updateTooltipBehavior_(component.element);
    this.updateTooltipEl_(component);
    this.componentPage_ = devAssert(this.storyEl_.querySelector(
        'amp-story-page[active]'));
    this.triggeringTarget_ = component.element;

    this.resources_.mutateElement(
        devAssert(this.focusedStateOverlay_),
        () => {
          this.focusedStateOverlay_
              .classList.toggle('i-amphtml-hidden', false);
        });
  }

  /**
   * Attaches listeners that listen for UI updates.
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.UI_STATE, uiState => {
      this.onUIStateUpdate_(uiState);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, () => {
      // Hide active tooltip when page switch is triggered by keyboard or
      // desktop buttons.
      if (this.state_ === EmbeddedComponentState.FOCUSED) {
        this.close_();
      }

      // Hide expanded view when page switch is triggered by keyboard or desktop
      // buttons.
      if (this.state_ === EmbeddedComponentState.EXPANDED) {
        this.maybeCloseExpandedView_(null /** target */,
            true /** forceClose */);
      }

      // Pauses content inside embeds when a page change occurs.
      while (this.embedsToBePaused_.length > 0) {
        const embedEl = this.embedsToBePaused_.pop();
        this.resources_.schedulePause(this.storyEl_, embedEl);
      }
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
   * Builds and attaches the tooltip.
   * @param {!InteractiveComponentDef} component
   * @private
   */
  updateTooltipEl_(component) {
    const embedConfig = userAssert(this.getEmbedConfigFor_(component.element),
        'Invalid embed config for target', component.element);

    this.updateTooltipText_(component.element, embedConfig);
    this.updateTooltipComponentIcon_(component.element, embedConfig);
    this.updateTooltipActionIcon_(embedConfig);
    this.positionTooltip_(component);
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

    this.storeService_.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, {
      state: EmbeddedComponentState.EXPANDED, element: this.triggeringTarget_});
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
   * Returns expanded element back to original state.
   * @private
   */
  closeExpandedEl_() {
    this.triggeringTarget_.classList.toggle(
        'i-amphtml-expanded-component', false);
    const embedId =
      this.triggeringTarget_.getAttribute(EMBED_ID_ATTRIBUTE_NAME);

    const embedStyleEl = dev().assertElement(embedStyleEls[embedId],
        `Failed to look up embed style element with ID ${embedId}`);

    embedStyleEl[AMP_EMBED_DATA].transform =
      `scale(${embedStyleEl[AMP_EMBED_DATA].scaleFactor})`;
    updateEmbedStyleEl(embedStyleEl, embedStyleEl[AMP_EMBED_DATA]);
  }

  /**
   * Animates into expanded view. It calculates what the full-screen dimensions
   * of the element will be, and uses them to deduce the translateX/Y values
   * once the element reaches its full-screen size.
   * @param {!Element} target
   * @private
   */
  animateExpanded_(target) {
    const embedId = target.getAttribute(EMBED_ID_ATTRIBUTE_NAME);
    const state = {};
    const embedStyleEl = dev().assertElement(embedStyleEls[embedId],
        `Failed to look up embed style element with ID ${embedId}`);
    const embedData = embedStyleEl[AMP_EMBED_DATA];
    this.resources_.measureMutateElement(target,
        /** measure */
        () => {
          const targetRect = target./*OK*/getBoundingClientRect();
          // TODO(#20832): Store DOMRect for the page in the store to avoid
          // having to call getBoundingClientRect().
          const pageRect = this.componentPage_./*OK*/getBoundingClientRect();

          // Gap on the left of the element between full-screen size and
          // current size.
          const leftGap = (embedData.width - targetRect.width) / 2;
          // Distance from left of page to what will be the left of the
          // element in full-screen.
          const fullScreenLeft = targetRect.left - leftGap - pageRect.left;
          const centeredLeft = pageRect.width / 2 - embedData.width / 2;
          state.translateX = centeredLeft - fullScreenLeft;

          // Gap on the top of the element between full-screen size and
          // current size.
          const topGap = (embedData.height - targetRect.height) / 2;
          // Distance from top of page to what will be the top of the element in
          // full-screen.
          const fullScreenTop = targetRect.top - topGap - pageRect.top;
          const centeredTop = pageRect.height / 2 - embedData.height / 2;
          state.translateY = centeredTop - fullScreenTop;
        },
        /** mutate */
        () => {
          target.classList.toggle('i-amphtml-expanded-component', true);

          embedData.transform = `translate3d(${state.translateX}px,
            ${state.translateY}px, 0) scale(1)`;

          updateEmbedStyleEl(embedStyleEl, embedData);
        });
  }

  /**
   * Resizes expandable element before it is expanded to full-screen, in
   * preparation for its animation. It resizes it to its full-screen size, and
   * scales it down to match size set by publisher, adding negative margins so
   * that content around stays put.
   * @param {!Element} pageEl
   * @param {!Element} element
   * @param {!../../../src/service/resources-impl.Resources} resources
   */
  static prepareForAnimation(pageEl, element, resources) {
    let elId = null;

    // When a window resize happens, we must reset the styles and prepare the
    // animation again.
    if (element.hasAttribute(EMBED_ID_ATTRIBUTE_NAME)) {
      elId = element.getAttribute(EMBED_ID_ATTRIBUTE_NAME);
      const embedStyleEl = dev().assertElement(embedStyleEls[elId],
          `Failed to look up embed style element with ID ${elId}`);
      embedStyleEl.textContent = '';
      embedStyleEl[AMP_EMBED_DATA] = {};
    }

    const state = {};
    resources.measureMutateElement(element,
        /** measure */
        () => {
          const pageRect = pageEl./*OK*/getBoundingClientRect();
          const elRect = element./*OK*/getBoundingClientRect();

          if (elRect.width >= elRect.height) {
            state.newWidth = pageRect.width;
            state.scaleFactor = elRect.width / state.newWidth;
            state.newHeight = elRect.height / elRect.width * state.newWidth;
          } else {
            const maxHeight = pageRect.height - VERTICAL_PADDING;
            state.newWidth = Math.min(
                elRect.width / elRect.height * maxHeight, pageRect.width);
            state.newHeight = elRect.height / elRect.width * state.newWidth;
            state.scaleFactor = elRect.height / state.newHeight;
          }

          state.verticalMargin =
            (-1 * ((state.newHeight - elRect.height) / 2));
          state.horizontalMargin =
            (-1 * ((state.newWidth - elRect.width) / 2));
        },
        /** mutate */
        () => {
          element.classList.add('i-amphtml-embedded-component');

          elId = elId ? elId : ++embedIds;
          if (!element.hasAttribute(EMBED_ID_ATTRIBUTE_NAME)) { // First time creating embed style element.
            const html = htmlFor(pageEl);
            const embedStyleEl = html`<style></style>`;

            element.setAttribute(EMBED_ID_ATTRIBUTE_NAME, elId);
            pageEl.insertBefore(embedStyleEl, pageEl.firstChild);
            embedStyleEls[elId] = embedStyleEl;
          }

          embedStyleEls[elId][AMP_EMBED_DATA] = Object.assign({}, {
            id: elId,
            width: state.newWidth,
            height: state.newHeight,
            scaleFactor: state.scaleFactor,
            transform: `scale(${state.scaleFactor})`,
            verticalMargin: state.verticalMargin,
            horizontalMargin: state.horizontalMargin,
          });

          const embedStyleEl = dev().assertElement(embedStyleEls[elId],
              `Failed to look up embed style element with ID ${elId}`);
          updateEmbedStyleEl(embedStyleEl, embedStyleEl[AMP_EMBED_DATA]);
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
      Services.localizationService(this.win_).getLocalizedString(
          embedConfig.localizedStringId) ||
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
   * @param {!InteractiveComponentDef} component
   * @private
   */
  positionTooltip_(component) {
    const state = {arrowOnTop: false};

    this.resources_.measureMutateElement(this.storyEl_,
        /** measure */
        () => {
          const pageRect = this.componentPage_./*OK*/getBoundingClientRect();

          this.horizontalPositioning_(component, pageRect, state);
          this.verticalPositioning_(component, pageRect, state);
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
   * Positions tooltip and its arrow vertically.
   * @param {!InteractiveComponentDef} component
   * @param {!ClientRect} pageRect
   * @param {!Object} state
   * @private
   */
  verticalPositioning_(component, pageRect, state) {
    const tooltipHeight = this.tooltip_./*OK*/offsetHeight;
    const verticalOffset = VERTICAL_EDGE_PADDING ;

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
  horizontalPositioning_(component, pageRect, state) {
    const tooltipWidth = this.tooltip_./*OK*/offsetWidth;
    state.tooltipLeft = component.clientX - (tooltipWidth / 2);
    const maxLeft =
      pageRect.left + pageRect.width - HORIZONTAL_EDGE_PADDING - tooltipWidth;
    const minLeft = pageRect.left + HORIZONTAL_EDGE_PADDING;

    // Make sure tooltip is inside bounds of the page.
    state.tooltipLeft = Math.min(state.tooltipLeft, maxLeft);
    state.tooltipLeft = Math.max(state.tooltipLeft, minLeft);

    state.arrowLeftOffset = Math.abs(component.clientX - state.tooltipLeft -
        this.tooltipArrow_./*OK*/offsetWidth / 2);

    // Make sure tooltip arrow is inside bounds of the tooltip.
    state.arrowLeftOffset = Math.min(state.arrowLeftOffset,
        tooltipWidth - TOOLTIP_ARROW_RIGHT_PADDING);
    state.arrowLeftOffset = Math.max(state.arrowLeftOffset, 0);
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
      this.close_();
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
   * @return {!Element}
   * @private
   */
  buildFocusedStateTemplate_() {
    const html = htmlFor(this.storyEl_);
    const tooltipOverlay =
        html`
        <section class="i-amphtml-story-focused-state-layer
            i-amphtml-story-system-reset i-amphtml-hidden">
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
