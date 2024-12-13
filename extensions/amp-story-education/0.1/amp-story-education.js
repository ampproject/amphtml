import {removeChildren} from '#core/dom';
import {Layout_Enum} from '#core/dom/layout';
import {setModalAsClosed, setModalAsOpen} from '#core/dom/modal';
import {htmlFor} from '#core/dom/static-template';
import {toggle} from '#core/dom/style';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {dev} from '#utils/log';

import {CSS} from '../../../build/amp-story-education-0.1.css';
import {
  getLocalizationService,
  localizeTemplate,
} from '../../amp-story/1.0/amp-story-localization-service';
import {
  Action,
  StateProperty,
  UIType_Enum,
} from '../../amp-story/1.0/amp-story-store-service';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';

/** @type {string} */
const TAG = 'amp-story-education';

/**
 * Generates the navigation education template.
 * @param {!Element} element
 * @return {!Element}
 */
const buildNavigationEl = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-education-navigation">
      <div class="i-amphtml-story-education-navigation-gesture">
        <div class="i-amphtml-story-education-navigation-gesture-outer"></div>
        <div class="i-amphtml-story-education-navigation-gesture-inner"></div>
      </div>
      <div class="i-amphtml-story-education-navigation-progress"></div>
      <div class="i-amphtml-story-education-navigation-instructions"></div>
      <button class="i-amphtml-story-education-navigation-button"></button>
    </div>
  `;
};

/** @enum {string} */
const Screen = {
  ONBOARDING_NAVIGATION_TAP: 'ont', // Sent on page load if no "swipe" capability.
  ONBOARDING_NAVIGATION_TAP_AND_SWIPE: 'ontas', // Sent on page load if "swipe" capability.
};

/** @enum */
export const State = {
  HIDDEN: 0,
  NAVIGATION_TAP: 1,
  NAVIGATION_SWIPE: 2,
};

export class AmpStoryEducation extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Element} */
    this.containerEl_ = this.win.document.createElement('div');

    /** @private {?boolean} */
    this.storyPausedStateToRestore_ = null;

    /** @private {!State} */
    this.state_ = State.HIDDEN;

    /** @private @const {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ =
      /** @type {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */ (
        Services.storyStoreService(this.win)
      );

    /** @private {?../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = null;
  }

  /** @override */
  buildCallback() {
    this.localizationService_ = getLocalizationService(this.element);
    this.containerEl_.classList.add('i-amphtml-story-education');
    toggle(this.element, false);
    toggle(this.containerEl_, false);
    this.startListening_();
    // Extra host to reset inherited styles and further enforce shadow DOM style
    // scoping using amp-story-shadow-reset.css.
    const hostEl = this.win.document.createElement('div');
    this.element.appendChild(hostEl);
    createShadowRootWithStyle(hostEl, this.containerEl_, CSS);

    this.viewer_ = Services.viewerForDoc(this.element);
    const isMobileUI =
      this.storeService_.get(StateProperty.UI_STATE) === UIType_Enum.MOBILE;
    if (this.viewer_.isEmbedded() && isMobileUI) {
      const screen = this.viewer_.hasCapability('swipe')
        ? Screen.ONBOARDING_NAVIGATION_TAP_AND_SWIPE
        : Screen.ONBOARDING_NAVIGATION_TAP;
      this.maybeShowScreen_(screen, State.NAVIGATION_TAP);
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.CONTAINER;
  }

  /**
   * @private
   */
  startListening_() {
    this.containerEl_.addEventListener(
      'click',
      () => this.onClick_(),
      true /** useCapture */
    );

    // Prevent touchevents from being forwarded through viewer messaging.
    this.containerEl_.addEventListener(
      'touchstart',
      (event) => event.stopPropagation(),
      true /** useCapture */
    );
    this.containerEl_.addEventListener(
      'touchmove',
      (event) => event.stopPropagation(),
      true /** useCapture */
    );
    this.containerEl_.addEventListener(
      'touchend',
      (event) => event.stopPropagation(),
      true /** useCapture */
    );

    this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      (rtlState) => this.onRtlStateUpdate_(rtlState),
      true /** callToInitialize */
    );
  }

  /**
   * Handles click events.
   * @private
   */
  onClick_() {
    if (
      this.state_ === State.NAVIGATION_TAP &&
      this.viewer_.hasCapability('swipe')
    ) {
      this.setState_(State.NAVIGATION_SWIPE);
      return;
    }

    this.setState_(State.HIDDEN);
  }

  /**
   * @param {boolean} rtlState
   * @private
   */
  onRtlStateUpdate_(rtlState) {
    this.mutateElement(() => {
      rtlState
        ? this.containerEl_.setAttribute('dir', 'rtl')
        : this.containerEl_.removeAttribute('dir');
    });
  }

  /**
   * @param {!State} state
   * @private
   */
  setState_(state) {
    if (this.state_ === state) {
      return;
    }

    this.state_ = state;
    let el;

    switch (state) {
      case State.HIDDEN:
        this.storeService_.dispatch(Action.TOGGLE_EDUCATION, false);
        this.mutateElement(() => {
          removeChildren(this.containerEl_);
          toggle(this.element, false);
          toggle(this.containerEl_, false);
          this.storeService_.dispatch(
            Action.TOGGLE_PAUSED,
            this.storyPausedStateToRestore_
          );
          setModalAsClosed(this.element);
          this.element.removeAttribute('aria-modal');
        });
        break;
      case State.NAVIGATION_TAP:
        el = buildNavigationEl(this.element);
        el.setAttribute('step', 'tap');
        const progressStringId = this.viewer_.hasCapability('swipe')
          ? LocalizedStringId_Enum.AMP_STORY_EDUCATION_NAVIGATION_TAP_PROGRESS
          : LocalizedStringId_Enum.AMP_STORY_EDUCATION_NAVIGATION_TAP_PROGRESS_SINGLE;

        el.querySelector(
          '.i-amphtml-story-education-navigation-progress'
        ).setAttribute('i-amphtml-i18n-text-content', progressStringId);
        el.querySelector(
          '.i-amphtml-story-education-navigation-instructions'
        ).setAttribute(
          'i-amphtml-i18n-text-content',
          LocalizedStringId_Enum.AMP_STORY_EDUCATION_NAVIGATION_TAP_INSTRUCTIONS
        );
        el.querySelector(
          '.i-amphtml-story-education-navigation-button'
        ).setAttribute(
          'i-amphtml-i18n-text-content',
          LocalizedStringId_Enum.AMP_STORY_EDUCATION_NAVIGATION_TAP_DISMISS
        );
        this.showTemplate_(el);
        break;
      case State.NAVIGATION_SWIPE:
        el = buildNavigationEl(this.element);
        el.setAttribute('step', 'swipe');
        el.querySelector(
          '.i-amphtml-story-education-navigation-progress'
        ).setAttribute(
          'i-amphtml-i18n-text-content',
          LocalizedStringId_Enum.AMP_STORY_EDUCATION_NAVIGATION_SWIPE_PROGRESS
        );
        el.querySelector(
          '.i-amphtml-story-education-navigation-instructions'
        ).setAttribute(
          'i-amphtml-i18n-text-content',
          LocalizedStringId_Enum.AMP_STORY_EDUCATION_NAVIGATION_SWIPE_INSTRUCTIONS
        );
        el.querySelector(
          '.i-amphtml-story-education-navigation-button'
        ).setAttribute(
          'i-amphtml-i18n-text-content',
          LocalizedStringId_Enum.AMP_STORY_EDUCATION_NAVIGATION_SWIPE_DISMISS
        );
        this.showTemplate_(el);
        break;
      default:
        dev().error(TAG, 'Unknown state %s.', state);
        break;
    }
  }

  /**
   * @param {!Element} template
   * @private
   */
  showTemplate_(template) {
    if (this.storyPausedStateToRestore_ === null) {
      this.storyPausedStateToRestore_ = !!this.storeService_.get(
        StateProperty.PAUSED_STATE
      );
    }

    this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);
    this.storeService_.dispatch(Action.TOGGLE_EDUCATION, true);

    localizeTemplate(template, this.containerEl_);

    this.mutateElement(() => {
      removeChildren(this.containerEl_);
      toggle(this.element, true);
      toggle(this.containerEl_, true);
      this.containerEl_.appendChild(template);
      if (!this.element.hasAttribute('aria-modal')) {
        setModalAsOpen(this.element);
        this.element.setAttribute('aria-modal', 'true');
      }
    });
  }

  /**
   * Asks the viewer whether the navigation screen should be shown.
   * Viewer responses should be treated right away, and not cached.
   * @param {!Screen} screen Screen to show
   * @param {!State} state State to set
   * @private
   */
  maybeShowScreen_(screen, state) {
    // Only show education screens when the ampdoc is visible.
    this.getAmpDoc()
      .whenFirstVisible()
      .then(() => {
        // TODO(gmajoulet): update this method to support showing multiple
        // screens, if/when needed.
        this.viewer_
          .sendMessageAwaitResponse('canShowScreens', {
            'screens': [{'screen': screen}],
          })
          .then((response) => {
            const shouldShow = !!(
              response &&
              response['screens'] &&
              response['screens'][0] &&
              response['screens'][0]['show']
            );
            if (shouldShow) {
              this.setState_(state);
            }
          });
      });
  }
}

AMP.extension('amp-story-education', '0.1', (AMP) => {
  AMP.registerElement('amp-story-education', AmpStoryEducation, CSS);
});
