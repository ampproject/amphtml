import * as Preact from '#core/dom/jsx';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {localizeTemplate} from './amp-story-localization-service';
import {
  EmbeddedComponentState,
  StateProperty,
  UIType_Enum,
  getStoreService,
} from './amp-story-store-service';
import {createShadowRootWithStyle} from './utils';

import {CSS} from '../../../build/amp-story-hint-1.0.css';

/**
 * @return {!Element}
 */
const renderHintElement = () => (
  <aside
    class={
      'i-amphtml-story-hint-container ' +
      'i-amphtml-story-system-reset i-amphtml-hidden'
    }
  >
    <div class="i-amphtml-story-navigation-help-overlay">
      <div class="i-amphtml-story-navigation-help-section prev-page">
        <div class="i-amphtml-story-hint-placeholder">
          <div class="i-amphtml-story-hint-tap-button">
            <div class="i-amphtml-story-hint-tap-button-icon" />
          </div>
          <div
            class="i-amphtml-story-hint-tap-button-text"
            i-amphtml-i18n-text-content={
              LocalizedStringId_Enum.AMP_STORY_HINT_UI_PREVIOUS_LABEL
            }
          ></div>
        </div>
      </div>
      <div class="i-amphtml-story-navigation-help-section next-page">
        <div class="i-amphtml-story-hint-placeholder">
          <div class="i-amphtml-story-hint-tap-button">
            <div class="i-amphtml-story-hint-tap-button-icon" />
          </div>
          <div
            class="i-amphtml-story-hint-tap-button-text"
            i-amphtml-i18n-text-content={
              LocalizedStringId_Enum.AMP_STORY_HINT_UI_NEXT_LABEL
            }
          ></div>
        </div>
      </div>
    </div>
  </aside>
);

/** @type {string} */
const NAVIGATION_OVERLAY_CLASS = 'show-navigation-overlay';

/** @type {string} */
const FIRST_PAGE_OVERLAY_CLASS = 'show-first-page-overlay';

/** @type {number} */
const NAVIGATION_OVERLAY_TIMEOUT = 3000;

/** @type {number} */
const FIRST_PAGE_NAVIGATION_OVERLAY_TIMEOUT = 275;

/**
 * User Hint Layer for <amp-story>.
 */
export class AmpStoryHint {
  /**
   * @param {!Window} win
   * @param {!Element} parentEl Element where to append the component
   */
  constructor(win, parentEl) {
    /** @private {!Window} */
    this.win_ = win;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /** @private {?Element} */
    this.hintContainer_ = null;

    /** @private {?(number|string)} */
    this.hintTimeout_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private @const {!Element} */
    this.parentEl_ = parentEl;
  }

  /**
   * Builds the hint layer DOM.
   */
  build() {
    if (this.hintContainer_) {
      return;
    }

    this.hintContainer_ = renderHintElement();

    localizeTemplate(this.hintContainer_, this.parentEl_).then(() => {
      const root = createShadowRootWithStyle(<div />, this.hintContainer_, CSS);
      this.vsync_.mutate(() => {
        this.parentEl_.appendChild(root);
      });
    });

    this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      (rtlState) => {
        this.onRtlStateUpdate_(rtlState);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.SYSTEM_UI_IS_VISIBLE_STATE,
      (isVisible) => {
        this.onSystemUiIsVisibleStateUpdate_(isVisible);
      }
    );

    this.storeService_.subscribe(
      StateProperty.INTERACTIVE_COMPONENT_STATE,
      /** @param {./amp-story-store-service.InteractiveComponentDef} component */ (
        component
      ) => {
        this.hideOnFocusedState_(
          component.state === EmbeddedComponentState.FOCUSED
        );
      }
    );
  }

  /**
   * Shows the given hint, only if not desktop.
   * @param {string} hintClass
   * @private
   */
  showHint_(hintClass) {
    if (this.storeService_.get(StateProperty.UI_STATE) !== UIType_Enum.MOBILE) {
      return;
    }

    this.build();

    this.vsync_.mutate(() => {
      this.hintContainer_.classList.toggle(
        NAVIGATION_OVERLAY_CLASS,
        hintClass == NAVIGATION_OVERLAY_CLASS
      );
      this.hintContainer_.classList.toggle(
        FIRST_PAGE_OVERLAY_CLASS,
        hintClass == FIRST_PAGE_OVERLAY_CLASS
      );
      this.hintContainer_.classList.remove('i-amphtml-hidden');

      const hideTimeout =
        hintClass == NAVIGATION_OVERLAY_CLASS
          ? NAVIGATION_OVERLAY_TIMEOUT
          : FIRST_PAGE_NAVIGATION_OVERLAY_TIMEOUT;
      this.hideAfterTimeout(hideTimeout);
    });
  }

  /**
   * Show navigation overlay DOM.
   */
  showNavigationOverlay() {
    // Don't show the overlay if the share menu is open.
    if (this.storeService_.get(StateProperty.SHARE_MENU_STATE)) {
      return;
    }

    this.showHint_(NAVIGATION_OVERLAY_CLASS);
  }

  /**
   * Show navigation overlay DOM.
   */
  showFirstPageHintOverlay() {
    this.showHint_(FIRST_PAGE_OVERLAY_CLASS);
  }

  /**
   * Hides the overlay after a given time
   * @param {number} timeout
   */
  hideAfterTimeout(timeout) {
    this.hintTimeout_ = this.timer_.delay(() => this.hideInternal_(), timeout);
  }

  /**
   * Hide all navigation hints.
   */
  hideAllNavigationHint() {
    this.hideInternal_();

    if (this.hintTimeout_ !== null) {
      this.timer_.cancel(this.hintTimeout_);
      this.hintTimeout_ = null;
    }
  }

  /** @private */
  hideInternal_() {
    if (!this.hintContainer_) {
      return;
    }

    this.vsync_.mutate(() => {
      this.hintContainer_.classList.add('i-amphtml-hidden');
    });
  }

  /**
   * Reacts to RTL state updates and triggers the UI for RTL.
   * @param {boolean} rtlState
   * @private
   */
  onRtlStateUpdate_(rtlState) {
    this.vsync_.mutate(() => {
      rtlState
        ? this.hintContainer_.setAttribute('dir', 'rtl')
        : this.hintContainer_.removeAttribute('dir');
    });
  }

  /**
   * Reacts to system UI visibility state updates.
   * @param {boolean} isVisible
   * @private
   */
  onSystemUiIsVisibleStateUpdate_(isVisible) {
    if (!isVisible) {
      this.hideAllNavigationHint();
    }
  }

  /**
   * Hides navigation hint if tooltip is open.
   * @param {boolean} isActive
   * @private
   */
  hideOnFocusedState_(isActive) {
    if (isActive) {
      this.hideAllNavigationHint();
    }
  }
}
