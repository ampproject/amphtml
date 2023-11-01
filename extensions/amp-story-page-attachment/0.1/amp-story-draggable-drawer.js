import {devAssert} from '#core/assert';
import {toggleAttribute} from '#core/dom';
import {isAmpElement} from '#core/dom/amp-element-helpers';
import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {closest} from '#core/dom/query';
import {resetStyles, setImportantStyles, toggle} from '#core/dom/style';
import {toArray} from '#core/types/array';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {listen} from '#utils/event-helper';
import {dev} from '#utils/log';

import {localizeTemplate} from 'extensions/amp-story/1.0/amp-story-localization-service';

import {CSS} from '../../../build/amp-story-draggable-drawer-header-0.1.css';
import {
  Action,
  StateProperty,
  UIType_Enum,
} from '../../amp-story/1.0/amp-story-store-service';
import {
  createShadowRootWithStyle,
  toggleA11yReadable,
} from '../../amp-story/1.0/utils';

/** @const {number} */
const TOGGLE_THRESHOLD_PX = 50;

/** @const {number} */
const DRAWER_ANIMATE_IN_TIME = 400;

/**
 * @enum {number}
 */
export const DrawerState = {
  CLOSED: 0,
  DRAGGING_TO_CLOSE: 1,
  DRAGGING_TO_OPEN: 2,
  OPEN: 3,
};

/**
 * Drawer's template.
 * @return {!Element}
 */
const renderDrawerElement = () => {
  return (
    <div class="i-amphtml-story-draggable-drawer">
      <div class="i-amphtml-story-draggable-drawer-container">
        <div class="i-amphtml-story-draggable-drawer-content"></div>
      </div>
    </div>
  );
};

/**
 * Drawer's header template.
 * @return {!Element}
 */
const renderHeaderElement = () => {
  return <div class="i-amphtml-story-draggable-drawer-header"></div>;
};

/**
 * Abstract draggable drawer.
 * @abstract
 */
export class DraggableDrawer extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    return false;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Array<!Element>} AMP components within the drawer. */
    this.ampComponents_ = [];

    /** @protected {?Element} */
    this.containerEl = null;

    /** @protected {?Element} */
    this.contentEl = null;

    /** @private {number} Max value in pixels that can be dragged when opening the drawer. */
    this.dragCap_ = Infinity;

    /** @protected {?Element} */
    this.headerEl = null;

    /** @private {boolean} */
    this.ignoreCurrentSwipeYGesture_ = false;

    /** @protected {!DrawerState} */
    this.state = DrawerState.CLOSED;

    /** @protected @const {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService = devAssert(Services.storyStoreService(this.win));

    /** @protected @const {!../../../src/services/localization.LocalizationService} */
    this.localizationService = devAssert(
      Services.localizationForDoc(this.element)
    );

    /** @private {!Object} */
    this.touchEventState_ = {
      startX: 0,
      startY: 0,
      lastY: 0,
      swipingUp: null,
      isSwipeY: null,
    };

    /** @private {!Array<function()>} */
    this.touchEventUnlisteners_ = [];

    /** @private {number} Threshold in pixels above which the drawer opens itself. */
    this.openThreshold_ = Infinity;

    /**
     * Used for offsetting drag.
     * @private {?number}
     */
    this.spacerElHeight_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    this.element.classList.add('amp-story-draggable-drawer-root');

    const templateEl = renderDrawerElement();
    this.headerEl = renderHeaderElement();

    this.containerEl = dev().assertElement(
      templateEl.querySelector('.i-amphtml-story-draggable-drawer-container')
    );
    // Hide `containerEl` to ensure that its content is not rendered/loaded by
    // the AMP Resources manager before we can set the draggable drawer as the
    // resource manager.
    toggle(dev().assertElement(this.containerEl), false);

    this.contentEl = dev().assertElement(
      this.containerEl.querySelector(
        '.i-amphtml-story-draggable-drawer-content'
      )
    );

    const spacerEl = (
      <button
        role="button"
        class="i-amphtml-story-draggable-drawer-spacer i-amphtml-story-system-reset"
        i-amphtml-i18n-aria-label={
          LocalizedStringId_Enum.AMP_STORY_CLOSE_BUTTON_LABEL
        }
      ></button>
    );

    this.containerEl.insertBefore(spacerEl, this.contentEl);
    this.contentEl.appendChild(
      createShadowRootWithStyle(<div />, this.headerEl, CSS)
    );

    localizeTemplate(this.containerEl, this.element);

    this.element.appendChild(templateEl);
    this.element.setAttribute('aria-hidden', true);
  }

  /** @override */
  layoutCallback() {
    this.initializeListeners_();

    const walker = this.win.document.createTreeWalker(
      this.element,
      NodeFilter.SHOW_ELEMENT,
      null /** filter */,
      false /** entityReferenceExpansion */
    );
    while (walker.nextNode()) {
      const el = dev().assertElement(walker.currentNode);
      if (isAmpElement(el)) {
        this.ampComponents_.push(el);
        Services.ownersForDoc(this.element).setOwner(el, this.element);
      }
    }

    // `containerEl` is hidden by default, to ensure that its content is not
    // rendered/loaded by the AMP Resources manager before we can set a
    // different owner. Now that the owner has been set, we can unhide it.
    toggle(dev().assertElement(this.containerEl), true);
  }

  /**
   * @protected
   */
  initializeListeners_() {
    this.storeService.subscribe(
      StateProperty.UI_STATE,
      (uiState) => {
        this.onUIStateUpdate_(uiState);
      },
      true /** callToInitialize */
    );

    const spacerEl = dev().assertElement(
      this.element.querySelector('.i-amphtml-story-draggable-drawer-spacer')
    );

    // Handle click on spacer element to close.
    spacerEl.addEventListener('click', () => {
      this.close_();
    });

    // For displaying sticky header on mobile. iOS devices & Safari are
    // excluded because the sticky positon has more restrictive functionality
    // on those surfaces that prevents it from behaving as intended.
    const platform = Services.platformFor(this.win);
    if (!platform.isSafari() && !platform.isIos()) {
      new this.win.IntersectionObserver((e) => {
        this.headerEl.classList.toggle(
          'i-amphtml-story-draggable-drawer-header-stuck',
          !e[0].isIntersecting
        );
      }).observe(spacerEl);
    }

    // Update spacerElHeight_ on resize for drag offset.
    new this.win.ResizeObserver((e) => {
      this.spacerElHeight_ = e[0].contentRect.height;
    }).observe(spacerEl);

    // Reset scroll position on end of close transiton.
    this.element.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'transform' && this.state === DrawerState.CLOSED) {
        this.containerEl./*OK*/ scrollTop = 0;
      }
    });
  }

  /**
   * Reacts to UI state updates.
   * @param {!UIType_Enum} uiState
   * @protected
   */
  onUIStateUpdate_(uiState) {
    const isMobile = uiState === UIType_Enum.MOBILE;
    isMobile
      ? this.startListeningForTouchEvents_()
      : this.stopListeningForTouchEvents_();

    toggleAttribute(this.headerEl, 'desktop', !isMobile);
  }

  /**
   * @private
   */
  startListeningForTouchEvents_() {
    // If the element is a direct descendant of amp-story-page or a descendant
    // of amp-story-shopping-attachment, authorize swiping up by listening to
    // events at the page level. Otherwise, only authorize swiping down to
    // close by listening to events at the current element level.
    const parentEl = this.element.parentElement;

    let targetEl;
    if (parentEl.tagName === 'AMP-STORY-PAGE') {
      targetEl = dev().assertElement(parentEl);
    } else if (parentEl.tagName === 'AMP-STORY-SHOPPING-ATTACHMENT') {
      targetEl = dev().assertElement(this.element.closest('amp-story-page'));
    } else {
      targetEl = dev().assertElement(this.element);
    }

    this.touchEventUnlisteners_.push(
      listen(targetEl, 'touchstart', this.onTouchStart_.bind(this), {
        capture: true,
      })
    );
    this.touchEventUnlisteners_.push(
      listen(targetEl, 'touchmove', this.onTouchMove_.bind(this), {
        capture: true,
      })
    );
    this.touchEventUnlisteners_.push(
      listen(targetEl, 'touchend', this.onTouchEnd_.bind(this), {
        capture: true,
      })
    );
  }

  /**
   * @private
   */
  stopListeningForTouchEvents_() {
    this.touchEventUnlisteners_.forEach((fn) => fn());
    this.touchEventUnlisteners_ = [];
  }

  /**
   * Helper to retrieve the touch coordinates from a TouchEvent.
   * @param {!Event} event
   * @return {?{x: number, y: number}}
   * @private
   */
  getClientTouchCoordinates_(event) {
    const {touches} = event;
    if (!touches || touches.length < 1) {
      return null;
    }

    const {clientX: x, clientY: y} = touches[0];
    return {x, y};
  }

  /**
   * Handles touchstart events to detect swipeY interactions.
   * @param {!Event} event
   * @private
   */
  onTouchStart_(event) {
    const coordinates = this.getClientTouchCoordinates_(event);
    if (!coordinates) {
      return;
    }

    this.touchEventState_.startX = coordinates.x;
    this.touchEventState_.startY = coordinates.y;
  }

  /**
   * Handles touchmove events to detect swipeY interactions.
   * @param {!Event} event
   * @private
   */
  onTouchMove_(event) {
    if (this.touchEventState_.isSwipeY === false) {
      return;
    }

    const coordinates = this.getClientTouchCoordinates_(event);
    if (!coordinates) {
      return;
    }

    const {x, y} = coordinates;

    this.touchEventState_.swipingUp = y < this.touchEventState_.lastY;
    this.touchEventState_.lastY = y;

    if (this.state === DrawerState.CLOSED && !this.touchEventState_.swipingUp) {
      return;
    }

    if (this.shouldStopPropagation_()) {
      event.stopPropagation();
    }

    if (this.touchEventState_.isSwipeY === null) {
      this.touchEventState_.isSwipeY =
        Math.abs(this.touchEventState_.startY - y) >
        Math.abs(this.touchEventState_.startX - x);
      if (!this.touchEventState_.isSwipeY) {
        return;
      }
    }

    this.onSwipeY_({
      event,
      data: {
        swipingUp: this.touchEventState_.swipingUp,
        deltaY: y - this.touchEventState_.startY,
        last: false,
      },
    });
  }

  /**
   * Checks for when scroll event should be stopped from propagating.
   * @return {boolean}
   * @private
   */
  shouldStopPropagation_() {
    return (
      this.state !== DrawerState.CLOSED ||
      (this.state === DrawerState.CLOSED && this.touchEventState_.swipingUp)
    );
  }

  /**
   * Handles touchend events to detect swipeY interactions.
   * @param {!Event} event
   * @private
   */
  onTouchEnd_(event) {
    if (this.touchEventState_.isSwipeY === true) {
      this.onSwipeY_({
        event,
        data: {
          swipingUp: this.touchEventState_.swipingUp,
          deltaY: this.touchEventState_.lastY - this.touchEventState_.startY,
          last: true,
        },
      });
    }

    this.touchEventState_.startX = 0;
    this.touchEventState_.startY = 0;
    this.touchEventState_.lastY = 0;
    this.touchEventState_.swipingUp = null;
    this.touchEventState_.isSwipeY = null;
  }

  /**
   * Handles swipeY events, detected by the touch events listeners.
   * @param {{event: !Event, data: !Object}} gesture
   * @private
   */
  onSwipeY_(gesture) {
    const {data} = gesture;

    if (this.ignoreCurrentSwipeYGesture_) {
      this.ignoreCurrentSwipeYGesture_ = !data.last;
      return;
    }

    const {deltaY, swipingUp} = data;

    // If the drawer is open, figure out if the user is trying to scroll the
    // content, or actually close the drawer.
    if (this.state === DrawerState.OPEN) {
      const isContentSwipe = this.isDrawerContentDescendant_(
        dev().assertElement(gesture.event.target)
      );

      // If user is swiping up, exit so the event bubbles up and maybe scrolls
      // the drawer content.
      // If user is swiping down and scrollTop is above zero, exit and let the
      // user scroll the content.
      // If user is swiping down and scrollTop is zero, don't exit and start
      // dragging/closing the drawer.
      if (
        (isContentSwipe && deltaY < 0) ||
        (isContentSwipe && deltaY > 0 && this.containerEl./*OK*/ scrollTop > 0)
      ) {
        this.ignoreCurrentSwipeYGesture_ = true;
        return;
      }
    }

    gesture.event.preventDefault();

    if (data.last === true) {
      if (this.state === DrawerState.DRAGGING_TO_CLOSE) {
        !swipingUp && deltaY > TOGGLE_THRESHOLD_PX
          ? this.close_()
          : this.open();
      }

      if (this.state === DrawerState.DRAGGING_TO_OPEN) {
        swipingUp && -deltaY > TOGGLE_THRESHOLD_PX
          ? this.open()
          : this.close_();
      }

      return;
    }

    if (
      this.state === DrawerState.DRAGGING_TO_OPEN &&
      swipingUp &&
      -deltaY > this.openThreshold_
    ) {
      this.open();
      return;
    }

    this.drag_(deltaY);
  }

  /**
   * Whether the element is a descendant of drawer-content.
   * @param {!Element} element
   * @return {boolean}
   * @private
   */
  isDrawerContentDescendant_(element) {
    return !!closest(
      element,
      (el) => {
        return el.classList.contains(
          'i-amphtml-story-draggable-drawer-content'
        );
      },
      /* opt_stopAt */ this.element
    );
  }

  /**
   * Sets a swipe threshold in pixels above which the drawer opens itself.
   * @param {number} openThreshold
   * @protected
   */
  setOpenThreshold_(openThreshold) {
    this.openThreshold_ = openThreshold;
  }

  /**
   * Sets the max value in pixels that can be dragged when opening the drawer.
   * @param {number} dragCap
   * @protected
   */
  setDragCap_(dragCap) {
    this.dragCap_ = dragCap;
  }

  /**
   * Drags the drawer on the screen upon user interaction.
   * @param {number} deltaY
   * @private
   */
  drag_(deltaY) {
    let translate;

    switch (this.state) {
      case DrawerState.CLOSED:
      case DrawerState.DRAGGING_TO_OPEN:
        if (deltaY > 0) {
          return;
        }
        this.state = DrawerState.DRAGGING_TO_OPEN;
        const drag = Math.max(deltaY, -this.dragCap_) - this.spacerElHeight_;

        translate = `translate3d(0, calc(100% + ${drag}px), 0)`;
        break;
      case DrawerState.OPEN:
      case DrawerState.DRAGGING_TO_CLOSE:
        if (deltaY < 0) {
          return;
        }
        this.state = DrawerState.DRAGGING_TO_CLOSE;
        translate = `translate3d(0, ${deltaY}px, 0)`;
        break;
    }

    this.mutateElement(() => {
      setImportantStyles(this.element, {
        transform: translate,
        transition: 'none',
        visibility: 'visible',
      });
    });
  }

  /**
   * Fully opens the drawer from its current position.
   * @param {boolean=} shouldAnimate
   */
  open(shouldAnimate = true) {
    if (this.state === DrawerState.OPEN) {
      return;
    }

    this.state = DrawerState.OPEN;

    this.storeService.dispatch(Action.TOGGLE_PAUSED, true);

    this.mutateElement(() => {
      this.element.setAttribute('aria-hidden', false);
      resetStyles(this.element, ['transform', 'transition', 'visibility']);

      if (!shouldAnimate) {
        // Resets the 'transition' property, and removes this override in the
        // next frame, after the element is positioned.
        setImportantStyles(this.element, {transition: 'initial'});
        this.mutateElement(() => resetStyles(this.element, ['transition']));
      }

      this.element.classList.add('i-amphtml-story-draggable-drawer-open');

      this.hideOrShowSiblingContent();
      // Focus spacer after transition for screen readers to be in
      // position to read drawer content.
      setTimeout(() => {
        dev()
          .assertElement(
            this.element.querySelector(
              '.i-amphtml-story-draggable-drawer-spacer'
            )
          )
          ./*OK*/ focus();
      }, DRAWER_ANIMATE_IN_TIME);

      toggle(dev().assertElement(this.containerEl), true);
    }).then(() => {
      const owners = Services.ownersForDoc(this.element);
      owners.scheduleLayout(this.element, this.ampComponents_);
      owners.scheduleResume(this.element, this.ampComponents_);
    });
  }

  /**
   * Handles hiding page content from assistive technology.
   * @protected
   */
  hideOrShowSiblingContent() {
    this.mutateElement(() => {
      toArray(this.element.parentElement.children).forEach((siblingEl) => {
        if (siblingEl !== this.element) {
          toggleA11yReadable(siblingEl, this.state === DrawerState.CLOSED);
        }
      });
    });
  }

  /**
   * Can be overriden for implementations using the browser history to close the
   * drawer.
   * @protected
   */
  close_() {
    this.closeInternal_();
  }

  /**
   * Fully closes the drawer from its current position.
   * @param {boolean=} shouldAnimate
   * @protected
   */
  closeInternal_(shouldAnimate = true) {
    if (this.state === DrawerState.CLOSED) {
      return;
    }

    this.state = DrawerState.CLOSED;

    this.storeService.dispatch(Action.TOGGLE_PAUSED, false);
    this.handleSoftKeyboardOnDrawerClose_();
    this.hideOrShowSiblingContent();

    this.mutateElement(() => {
      this.element.setAttribute('aria-hidden', true);
      resetStyles(this.element, ['transform', 'transition']);

      if (!shouldAnimate) {
        // Resets the 'transition' property, and removes this override in the
        // next frame, after the element is positioned.
        setImportantStyles(this.element, {transition: 'initial'});
        this.mutateElement(() => resetStyles(this.element, ['transition']));
      }

      this.element.classList.remove('i-amphtml-story-draggable-drawer-open');
    }).then(() => {
      const owners = Services.ownersForDoc(this.element);
      owners.schedulePause(this.element, this.ampComponents_);
    });
  }

  /**
   * Handle the soft keyboard during the closing of the drawer.
   * @private
   */
  handleSoftKeyboardOnDrawerClose_() {
    // Blur the focused element in order to dismiss the soft keyboard.
    this.win.document.activeElement?.blur();
    // Reset the story's scroll position, which can be unintentionally altered
    // by the opening of the soft keyboard on Android devices.
    this.resetStoryScrollPosition_();
  }

  /**
   * Set the story's scroll position to its default state, if necessary.
   * @private
   */
  resetStoryScrollPosition_() {
    const storyEl = closest(
      this.element,
      (el) => el.tagName === 'AMP-STORY-PAGE'
    );
    storyEl./*OK*/ scrollTo(0, 0);
  }
}
