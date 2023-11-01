import {toggleAttribute, tryFocus} from '#core/dom';
import * as Preact from '#core/dom/jsx';
import {closest, matches} from '#core/dom/query';
import {resetStyles, setImportantStyles} from '#core/dom/style';

import {Services} from '#service';

import {dev, devAssert, user, userAssert} from '#utils/log';

import {
  Action,
  EmbeddedComponentState,
  InteractiveComponentDef,
  StateProperty,
  UIType_Enum,
  getStoreService,
} from './amp-story-store-service';
import {EventType, dispatch} from './events';
import {
  AdvancementMode,
  StoryAnalyticsEvent,
  getAnalyticsService,
} from './story-analytics';
import {
  createShadowRootWithStyle,
  getSourceOriginForElement,
  triggerClickFromLightDom,
} from './utils';

import {CSS} from '../../../build/amp-story-tooltip-1.0.css';
import {getAmpdoc} from '../../../src/service-helpers';

/** @private @const {string} */
const LAUNCH_ICON_CLASS = 'i-amphtml-tooltip-action-icon-launch';

/** @private @const {number} */
const TOOLTIP_CLOSE_ANIMATION_MS = 100;

/** @const {string} */
const DARK_THEME_CLASS = 'i-amphtml-story-tooltip-theme-dark';

/**
 * @enum {string}
 */
const TooltipTheme = {
  LIGHT: 'light', // default
  DARK: 'dark',
};

/** @private @const {!Object} list of embedded components that are click shielded */
const EMBEDDED_COMPONENTS_SELECTORS = {
  'amp-twitter': {
    customIconClassName: 'amp-social-share-twitter-no-background',
    actionIcon: LAUNCH_ICON_CLASS,
    selector: 'amp-twitter[interactive]',
  },
};

/**
 * Components that can be launched.
 * @const {!Object}
 * @private
 */
const LAUNCHABLE_COMPONENTS = {
  'a': {
    actionIcon: LAUNCH_ICON_CLASS,
    selector: 'a[href]',
  },
  ...EMBEDDED_COMPONENTS_SELECTORS,
};

/**
 * Gets the list of components with their respective selectors.
 * @param {!Object} components
 * @return {!{[key: string]: string}}
 */
function getComponentSelectors(components) {
  const componentSelectors = {};

  Object.keys(components).forEach((componentName) => {
    componentSelectors[componentName] = components[componentName].selector;
  });

  return componentSelectors;
}

/**
 * Selectors of elements that are embedded.
 * @return {!Object}
 */
export function embeddedElementsSelectors() {
  // Using indirect invocation to prevent no-export-side-effect issue.
  return Object.keys(EMBEDDED_COMPONENTS_SELECTORS).join(',');
}

/**
 * All selectors that should delegate to the AmpStoryEmbeddedComponent class.
 * @return {!Object}
 */
export function interactiveElementsSelectors() {
  // Using indirect invocation to prevent no-export-side-effect issue.
  return Object.values(getComponentSelectors(LAUNCHABLE_COMPONENTS)).join(',');
}

/**
 * @const {string}
 */
export const EMBED_ID_ATTRIBUTE_NAME = 'i-amphtml-embed-id';

/**
 * Minimum vertical space needed to position tooltip.
 * @const {number}
 */
const MIN_VERTICAL_SPACE = 48;

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

    /** @private @const {../../../src/service/url-impl.js.Url} */
    this.urlService_ = Services.urlForDoc(storyEl);

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

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /**
     * Target producing the tooltip.
     * @private {?Element}
     */
    this.triggeringTarget_ = null;

    /**
     * Page containing component.
     * @private {?Element}
     */
    this.componentPage_ = null;

    this.storeService_.subscribe(
      StateProperty.INTERACTIVE_COMPONENT_STATE,
      /** @param {!InteractiveComponentDef} component */ (component) => {
        this.onComponentStateUpdate_(component);
      }
    );

    /** @private {EmbeddedComponentState} */
    this.state_ = EmbeddedComponentState.HIDDEN;

    /** @private {?Element} */
    this.buttonLeft_ = null;

    /** @private {?Element} */
    this.buttonRight_ = null;
  }

  /**
   * Reacts to embedded component state updates.
   * Possible state updates:
   *
   *    HIDDEN ==> FOCUSED
   *      /\          |
   *      ||__________|
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
        this.setState_(EmbeddedComponentState.FOCUSED, component);
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
        this.analyticsService_.triggerEvent(
          StoryAnalyticsEvent.FOCUS,
          this.triggeringTarget_
        );
        break;
      case EmbeddedComponentState.HIDDEN:
        this.state_ = state;
        this.onFocusedStateUpdate_(null);
        break;
      default:
        dev().warn(TAG, `EmbeddedComponentState ${this.state_} does not exist`);
        break;
    }
  }

  /**
   * Builds the tooltip overlay and appends it to the provided story.
   * @private
   * @return {Node}
   */
  buildFocusedState_() {
    this.focusedStateOverlay_ = this.renderFocusedStateElement_();
    this.shadowRoot_ = createShadowRootWithStyle(
      <div />,
      this.focusedStateOverlay_,
      CSS
    );

    this.tooltip_.addEventListener(
      'click',
      (event) => {
        event.stopPropagation();
        this.analyticsService_.triggerEvent(
          StoryAnalyticsEvent.CLICK_THROUGH,
          this.triggeringTarget_
        );
        this.tooltip_.href && this.onAnchorClick_(event);
      },
      true /** capture */
    );

    return this.shadowRoot_;
  }

  /**
   * Clears tooltip UI and updates store state to hidden.
   * @private
   */
  close_() {
    // Wait until tooltip closing animation is finished before clearing it.
    // Otherwise jank is noticeable.
    this.timer_.delay(() => {
      this.clearTooltip_();
    }, TOOLTIP_CLOSE_ANIMATION_MS);

    this.storeService_.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, {
      state: EmbeddedComponentState.HIDDEN,
    });
  }

  /**
   * Reacts to store updates related to the focused state, when a tooltip is
   * active.
   * @param {?InteractiveComponentDef} component
   * @private
   */
  onFocusedStateUpdate_(component) {
    if (!component) {
      this.mutator_.mutateElement(
        dev().assertElement(this.focusedStateOverlay_),
        () => {
          this.focusedStateOverlay_.classList.toggle('i-amphtml-hidden', true);
        }
      );
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
    this.timer_.delay(() => {
      this.buildTooltip_(component);
    }, TOOLTIP_CLOSE_ANIMATION_MS);
  }

  /**
   * Builds and displays tooltip
   * @param {?InteractiveComponentDef} component
   * @private
   */
  buildTooltip_(component) {
    this.updateTooltipBehavior_(component.element);
    this.updateTooltipEl_(component);
    this.componentPage_ = devAssert(
      this.storyEl_.querySelector('amp-story-page[active]')
    );

    this.mutator_.mutateElement(
      dev().assertElement(this.focusedStateOverlay_),
      () => {
        this.focusedStateOverlay_.classList.toggle('i-amphtml-hidden', false);
        tryFocus(
          dev().assertElement(
            this.focusedStateOverlay_.querySelector('a.i-amphtml-story-tooltip')
          )
        );
      }
    );
  }

  /**
   * Attaches listeners that listen for UI updates.
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(
      StateProperty.UI_STATE,
      (uiState) => {
        this.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, () => {
      // Hide active tooltip when page switch is triggered by keyboard or
      // desktop buttons.
      if (this.state_ === EmbeddedComponentState.FOCUSED) {
        this.close_();
      }
    });
  }

  /**
   * Reacts to desktop state updates and hides navigation buttons since we
   * already have in the desktop UI.
   * @param {!UIType_Enum} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.mutator_.mutateElement(
      dev().assertElement(this.focusedStateOverlay_),
      () => {
        const isDesktop =
          uiState === UIType_Enum.DESKTOP_FULLBLEED ||
          uiState === UIType_Enum.DESKTOP_ONE_PANEL;
        toggleAttribute(this.focusedStateOverlay_, 'desktop', isDesktop);
      }
    );
  }

  /**
   * Builds and attaches the tooltip.
   * @param {!InteractiveComponentDef} component
   * @private
   */
  updateTooltipEl_(component) {
    const embedConfig = /** @type {!Object} */ (
      userAssert(
        this.getEmbedConfigFor_(component.element),
        'Invalid embed config for target',
        component.element
      )
    );

    const theme = this.triggeringTarget_.getAttribute('theme');
    if (theme && TooltipTheme.DARK === theme.toLowerCase()) {
      this.tooltip_.classList.add(DARK_THEME_CLASS);
    }

    this.updateTooltipText_(component.element);
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
  updateTooltipBehavior_(target) {
    if (matches(target, interactiveElementsSelectors())) {
      dev()
        .assertElement(this.tooltip_)
        .setAttribute('href', this.getElementHref_(target));
      return;
    }
  }

  /**
   * Gets href from an element containing a url.
   * @param {!Element} target
   * @return {string}
   * @private
   */
  getElementHref_(target) {
    if (target.tagName.toLowerCase() == 'amp-twitter') {
      return (
        'https://twitter.com/_/status/' + target.getAttribute('data-tweetid')
      );
    }
    const elUrl = target.getAttribute('href');
    if (!this.urlService_.isProtocolValid(elUrl)) {
      user().error(TAG, 'The tooltip url is invalid');
      return '';
    }

    return this.urlService_.parse(elUrl).href;
  }

  /**
   * Gets corresponding config for a given embed target.
   * @param {!Element} target
   * @return {?Object}
   */
  getEmbedConfigFor_(target) {
    const config = LAUNCHABLE_COMPONENTS[target.tagName.toLowerCase()];
    if (config && matches(target, config.selector)) {
      return config;
    }

    user().error(TAG, 'No config matching provided target.');
    return null;
  }

  /**
   * Updates tooltip text content.
   * @param {!Element} target
   * @private
   */
  updateTooltipText_(target) {
    const tooltipText =
      target.getAttribute('data-tooltip-text') ||
      getSourceOriginForElement(target, this.getElementHref_(target));
    const existingTooltipText = this.tooltip_.querySelector(
      '.i-amphtml-tooltip-text'
    );

    existingTooltipText.textContent = tooltipText;
  }

  /**
   * Updates tooltip action icon. This is found on the right of the text.
   * @param {!Object} embedConfig
   * @private
   */
  updateTooltipActionIcon_(embedConfig) {
    const actionIcon = this.tooltip_.querySelector(
      '.i-amphtml-tooltip-action-icon'
    );

    this.mutator_.mutateElement(dev().assertElement(actionIcon), () => {
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
    if (!this.urlService_.isProtocolValid(iconUrl)) {
      user().error(TAG, 'The tooltip icon url is invalid');
      return;
    }

    const tooltipCustomIcon = this.tooltip_.querySelector(
      '.i-amphtml-story-tooltip-custom-icon'
    );

    // No icon src specified by publisher and no default icon in config.
    if (!iconUrl && !embedConfig.customIconClassName) {
      tooltipCustomIcon.classList.toggle('i-amphtml-hidden', true);
      return;
    }

    // Publisher specified a valid icon url.
    if (iconUrl) {
      this.mutator_.mutateElement(
        dev().assertElement(tooltipCustomIcon),
        () => {
          const {href} = this.urlService_.parse(iconUrl);
          setImportantStyles(dev().assertElement(tooltipCustomIcon), {
            'background-image': `url(${href})`,
          });
        }
      );
      return;
    }

    // No icon src specified by publisher. Use default icon found in the config.
    this.mutator_.mutateElement(dev().assertElement(tooltipCustomIcon), () => {
      tooltipCustomIcon.classList.add(embedConfig.customIconClassName);
    });
  }

  /**
   * Show or hide arrows based on current page.
   * @private
   */
  updateNavButtons_() {
    if (!this.isLastPage_()) {
      this.buttonLeft_.removeAttribute('hidden');
      this.buttonRight_.removeAttribute('hidden');
    } else {
      this.storeService_.get(StateProperty.RTL_STATE)
        ? this.buttonLeft_.setAttribute('hidden', true)
        : this.buttonRight_.setAttribute('hidden', true);
    }
  }

  /**
   * Is last page.
   * @return {boolean}
   * @private
   */
  isLastPage_() {
    const pageIndex = this.storeService_.get(StateProperty.CURRENT_PAGE_INDEX);
    const pageCount = this.storeService_.get(StateProperty.PAGE_IDS).length;
    return pageIndex + 1 === pageCount;
  }

  /**
   * Positions tooltip and its pointing arrow according to the position of the
   * target.
   * @param {!InteractiveComponentDef} component
   * @private
   */
  positionTooltip_(component) {
    const state = {arrowOnTop: false};

    this.mutator_.measureMutateElement(
      this.storyEl_,
      /** measure */
      () => {
        const pageRect = this.componentPage_./*OK*/ getBoundingClientRect();

        this.horizontalPositioning_(component, pageRect, state);
        this.verticalPositioning_(component, pageRect, state);
      },
      /** mutate */
      () => {
        // Arrow on top or bottom of tooltip.
        this.tooltip_.classList.toggle(
          'i-amphtml-tooltip-arrow-on-top',
          state.arrowOnTop
        );

        setImportantStyles(dev().assertElement(this.tooltipArrow_), {
          left: `${state.arrowLeftOffset}px`,
        });
        setImportantStyles(devAssert(this.tooltip_), {
          top: `${state.tooltipTop}px`,
          left: `${state.tooltipLeft}px`,
        });
      }
    );
  }

  /**
   * Positions tooltip and its arrow vertically.
   * @param {!InteractiveComponentDef} component
   * @param {!ClientRect} pageRect
   * @param {!Object} state
   * @private
   */
  verticalPositioning_(component, pageRect, state) {
    const tooltipHeight = this.tooltip_./*OK*/ offsetHeight;
    const verticalOffset = VERTICAL_EDGE_PADDING;

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
    const tooltipWidth = this.tooltip_./*OK*/ offsetWidth;
    state.tooltipLeft = component.clientX - tooltipWidth / 2;
    const maxLeft =
      pageRect.left + pageRect.width - HORIZONTAL_EDGE_PADDING - tooltipWidth;
    const minLeft = pageRect.left + HORIZONTAL_EDGE_PADDING;

    // Make sure tooltip is inside bounds of the page.
    state.tooltipLeft = Math.min(state.tooltipLeft, maxLeft);
    state.tooltipLeft = Math.max(state.tooltipLeft, minLeft);

    state.arrowLeftOffset = Math.abs(
      component.clientX -
        state.tooltipLeft -
        this.tooltipArrow_./*OK*/ offsetWidth / 2
    );

    // Make sure tooltip arrow is inside bounds of the tooltip.
    state.arrowLeftOffset = Math.min(
      state.arrowLeftOffset,
      tooltipWidth - TOOLTIP_ARROW_RIGHT_PADDING
    );
    state.arrowLeftOffset = Math.max(state.arrowLeftOffset, 0);
  }

  /**
   * Handles click outside the tooltip.
   * @param {!Event} event
   * @private
   */
  onOutsideTooltipClick_(event) {
    if (
      !closest(dev().assertElement(event.target), (el) => el == this.tooltip_)
    ) {
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
    this.mutator_.mutateElement(dev().assertElement(this.tooltip_), () => {
      const actionIcon = this.tooltip_.querySelector(
        '.i-amphtml-tooltip-action-icon'
      );
      actionIcon.className = 'i-amphtml-tooltip-action-icon';

      const customIcon = this.tooltip_.querySelector(
        '.i-amphtml-story-tooltip-custom-icon'
      );
      customIcon.className = 'i-amphtml-story-tooltip-custom-icon';
      resetStyles(customIcon, ['background-image']);
      this.tooltip_.classList.remove(DARK_THEME_CLASS);
      this.tooltip_.removeAttribute('href');
    });
  }

  /**
   * Builds the focused state template.
   * @return {!Element}
   * @private
   */
  renderFocusedStateElement_() {
    const rtlState = this.storeService_.get(StateProperty.RTL_STATE);

    this.tooltipArrow_ = <div class="i-amphtml-story-tooltip-arrow"></div>;
    this.tooltip_ = (
      <a class="i-amphtml-story-tooltip" target="_blank" role="tooltip">
        <div class="i-amphtml-story-tooltip-custom-icon"></div>
        <p class="i-amphtml-tooltip-text" ref="text"></p>
        <div class="i-amphtml-tooltip-action-icon"></div>
        {this.tooltipArrow_}
      </a>
    );
    this.buttonLeft_ = (
      <button
        class={
          'i-amphtml-story-focused-state-layer-nav-button' +
          ' i-amphtml-story-tooltip-nav-button-left'
        }
        onClick={(e) =>
          this.onNavigationalClick_(
            e,
            rtlState ? EventType.NEXT_PAGE : EventType.PREVIOUS_PAGE
          )
        }
      ></button>
    );
    this.buttonRight_ = (
      <button
        class={
          'i-amphtml-story-focused-state-layer-nav-button' +
          ' i-amphtml-story-tooltip-nav-button-right'
        }
        onClick={(e) =>
          this.onNavigationalClick_(
            e,
            rtlState ? EventType.PREVIOUS_PAGE : EventType.NEXT_PAGE
          )
        }
      ></button>
    );

    return (
      <section
        onClick={(e) => this.onOutsideTooltipClick_(e)}
        class={
          'i-amphtml-story-focused-state-layer' +
          ' i-amphtml-story-system-reset i-amphtml-hidden'
        }
      >
        <div
          class={
            'i-amphtml-story-focused-state-layer-nav-button-container' +
            ' i-amphtml-story-tooltip-nav-button-left'
          }
        >
          {this.buttonLeft_}
        </div>
        <div
          class={
            'i-amphtml-story-focused-state-layer-nav-button-container' +
            ' i-amphtml-story-tooltip-nav-button-right'
          }
        >
          {this.buttonRight_}
        </div>
        {this.tooltip_}
      </section>
    );
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
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.MANUAL_ADVANCE
    );
    dispatch(
      this.win_,
      dev().assertElement(this.shadowRoot_),
      direction,
      undefined,
      {bubbles: true}
    );
  }

  /**
   * Linkers don't work on shadow root elements so we click a clone of the anchor on the root dom.
   * @param {!Event} event
   * @private
   */
  onAnchorClick_(event) {
    event.preventDefault();
    triggerClickFromLightDom(this.tooltip_, this.storyEl_);
  }

  /**
   * @visibleForTesting
   * @return {?Element}
   */
  getShadowRootForTesting() {
    return this.shadowRoot_;
  }
}
