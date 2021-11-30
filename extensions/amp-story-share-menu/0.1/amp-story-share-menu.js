import {Keys_Enum} from '#core/constants/key-codes';
import * as Preact from '#core/dom/jsx';
// import {closest} from '#core/dom/query';
// import {setStyles} from '#core/dom/style';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {dev} from '#utils/log';

// import {localize} from './amp-story-localization-service';
// import {ShareWidget} from './amp-story-share';
// import {
//   Action,
//   StateProperty,
//   UIType,
//   getStoreService,
// } from './amp-story-store-service';
// import {
//   ANALYTICS_TAG_NAME,
//   StoryAnalyticsEvent,
//   getAnalyticsService,
// } from './story-analytics';
// import {createShadowRootWithStyle} from './utils';

// import {CSS} from '../../../build/amp-story-share-menu-1.0.css';
import {getAmpdoc} from '../../../src/service-helpers';
import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';

/** @const {string} Class to toggle the share menu. */
export const VISIBLE_CLASS = 'i-amphtml-story-share-menu-visible';

/**
 * Quick share template, used as a fallback if native sharing is not supported.
 * @return {!Element}
 */
const renderShareMenu = () => {
  return (
    <div
      class="i-amphtml-story-share-menu i-amphtml-story-system-reset"
      aria-hidden="true"
      role="alert"
    >
      <div class="i-amphtml-story-share-menu-container">
        <button
          class="i-amphtml-story-share-menu-close-button"
          aria-label="close"
          role="button"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

// /**
//  * System amp-social-share button template.
//  * @return {!Element}
//  */
// const renderAmpSocialSystemShareElement = () => {
//   return <amp-social-share type="system"></amp-social-share>;
// };

/**
 * Share menu UI.
 */
export class AmpStoryShareMenu extends AMP.BaseElement {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.closeButton_ = null;

    /** @private {?Element} */
    this.innerContainerEl_ = null;

    this.localizationService_ = null;

    // /** @private @const {!ShareWidget} */
    // this.shareWidget_ = new ShareWidget(this.win, storyEl);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    // /** @private {!./story-analytics.StoryAnalyticsService} */
    // this.analyticsService_ = getAnalyticsService(this.win_, storyEl);

    // /** @private @const {!Element} */
    // this.parentEl_ = storyEl;
  }

  /** @override */
  buildCallback() {
    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win).then((service) => {
        this.storeService_ = service;
      }),
      Services.storyRequestServiceForOrNull(this.win).then((service) => {
        this.requestService_ = service;
      }),
      Services.localizationServiceForOrNull(this.element).then((service) => {
        this.localizationService_ = service;
      }),
    ]).then(() => this.buildForFallbackSharing_());
  }

  /**
   * Builds and appends the fallback UI.
   * @private
   */
  buildForFallbackSharing_() {
    const root = this.win.document.createElement('div');
    root.classList.add('i-amphtml-story-share-menu-host');

    this.element_ = renderShareMenu();
    createShadowRootWithStyle(root, this.element_, CSS);

    this.closeButton_ = dev().assertElement(
      this.element_.querySelector('.i-amphtml-story-share-menu-close-button')
    );
    this.closeButton_.setAttribute(
      'aria-label',
      this.localizationService_.getLocalizedString(
        LocalizedStringId_Enum.AMP_STORY_CLOSE_BUTTON_LABEL
      )
    );

    this.initializeListeners_();

    this.measureMutateElement(
      () => {
        this.innerContainerEl_ = this.element_./*OK*/ querySelector(
          '.i-amphtml-story-share-menu-container'
        );
      },
      () => {
        this.parentEl_.appendChild(root);
        // Preloads and renders the share widget content.
        const shareWidget = this.shareWidget_.build(getAmpdoc(this.parentEl_));
        this.innerContainerEl_.appendChild(shareWidget);
      }
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === 'container';
  }

  /**
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

    this.storeService_.subscribe(StateProperty.SHARE_MENU_STATE, (isOpen) => {
      this.onShareMenuStateUpdate_(isOpen);
    });

    // Don't listen to click events if the system share is supported, since the
    // native layer handles all the UI interactions.
    if (!this.isSystemShareSupported_) {
      this.element_.addEventListener('click', (event) =>
        this.onShareMenuClick_(event)
      );

      this.win_.addEventListener('keyup', (event) => {
        if (event.key == Keys_Enum.ESCAPE) {
          event.preventDefault();
          this.close_();
        }
      });
    }
  }

  // /**
  //  * Reacts to menu state updates and decides whether to show either the native
  //  * system sharing, or the fallback UI.
  //  * @param {boolean} isOpen
  //  * @private
  //  */
  // onShareMenuStateUpdate_(isOpen) {
  //   if (this.isSystemShareSupported_ && isOpen) {
  //     // Dispatches a click event on the amp-social-share button to trigger the
  //     // native system sharing UI. This has to be done upon user interaction.
  //     this.element_.dispatchEvent(new Event('click'));

  //     // There is no way to know when the user dismisses the native system share
  //     // menu, so we pretend it is closed on the story end, and let the native
  //     // end handle the UI interactions.
  //     this.close_();
  //   }

  //   if (!this.isSystemShareSupported_) {
  //     this.vsync_.mutate(() => {
  //       this.element_.classList.toggle(VISIBLE_CLASS, isOpen);
  //       this.element_.setAttribute('aria-hidden', !isOpen);
  //     });
  //   }
  //   this.element_[ANALYTICS_TAG_NAME] = 'amp-story-share-menu';
  //   this.analyticsService_.triggerEvent(
  //     isOpen ? StoryAnalyticsEvent.OPEN : StoryAnalyticsEvent.CLOSE,
  //     this.element_
  //   );
  // }

  // /**
  //  * Handles click events and maybe closes the menu for the fallback UI.
  //  * @param  {!Event} event
  //  */
  // onShareMenuClick_(event) {
  //   const el = dev().assertElement(event.target);

  //   if (el === this.closeButton_) {
  //     this.close_();
  //   }

  //   // Closes the menu if click happened outside of the menu main container.
  //   if (!closest(el, (el) => el === this.innerContainerEl_, this.element_)) {
  //     this.close_();
  //   }
  // }

  // /**
  //  * Reacts to UI state updates and triggers the right UI.
  //  * @param {!UIType} uiState
  //  * @private
  //  */
  // onUIStateUpdate_(uiState) {
  //   this.vsync_.mutate(() => {
  //     uiState !== UIType.MOBILE
  //       ? this.element_.setAttribute('desktop', '')
  //       : this.element_.removeAttribute('desktop');
  //   });
  // }

  // /**
  //  * Closes the share menu.
  //  * @private
  //  */
  // close_() {
  //   this.storeService_.dispatch(Action.TOGGLE_SHARE_MENU, false);
  // }
}

/**
 * This extension installs the share widget.
 */

AMP.extension('amp-story-share-menu', '0.1', (AMP) => {
  AMP.registerElement('amp-story-share-menu', AmpStoryShareMenu);
});
