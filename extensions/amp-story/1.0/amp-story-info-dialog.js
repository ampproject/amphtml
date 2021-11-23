import * as Preact from '#core/dom/jsx';
import {
  ANALYTICS_TAG_NAME,
  StoryAnalyticsEvent,
  getAnalyticsService,
} from './story-analytics';
import {
  Action,
  StateProperty,
  getStoreService,
} from './amp-story-store-service';
import {CSS} from '../../../build/amp-story-info-dialog-1.0.css';
import {LocalizedStringId_Enum} from '#service/localization/strings';
import {Services} from '#service';
import {assertAbsoluteHttpOrHttpsUrl} from '../../../src/url';
import {closest, matches} from '#core/dom/query';
import {createShadowRootWithStyle, triggerClickFromLightDom} from './utils';
import {dev, devAssert} from '#utils/log';
import {localize} from './amp-story-localization-service';

/** @const {string} Class to toggle the info dialog. */
export const DIALOG_VISIBLE_CLASS = 'i-amphtml-story-info-dialog-visible';

/** @const {string} Class to toggle the info dialog link. */
export const MOREINFO_VISIBLE_CLASS = 'i-amphtml-story-info-moreinfo-visible';

/**
 * A dialog that provides a link to the canonical URL of the story, as well as
 * a link to any more information that the viewer would like to provide about
 * linking on that platform.
 */
export class InfoDialog {
  /**
   * @param {!Window} win
   * @param {!Element} parentEl Element where to append the component
   */
  constructor(win, parentEl) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.element_ = null;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win_, parentEl);

    /** @private @const {!Element} */
    this.parentEl_ = parentEl;

    /** @private @const {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(parentEl);

    /** @const @private {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(parentEl);
  }

  /**
   * Builds and appends the component in the story.
   * @return {!Promise} used for testing to ensure that the component is built
   *     before assertions.
   */
  build() {
    if (this.element_) {
      return Promise.resolve();
    }

    const {canonicalUrl} = Services.documentInfoForDoc(this.parentEl_);

    this.element_ = (
      <div
        class="i-amphtml-story-info-dialog i-amphtml-story-system-reset"
        onClick={(event) => {
          this.onInfoDialogClick_(event);
        }}
      >
        <div class="i-amphtml-story-info-dialog-container">
          <h1 class="i-amphtml-story-info-heading">
            {localize(
              this.parentEl_,
              LocalizedStringId_Enum.AMP_STORY_DOMAIN_DIALOG_HEADING_LABEL
            )}
          </h1>
          <a class="i-amphtml-story-info-link" href={canonicalUrl}>
            {
              // Add zero-width space character (\u200B) after "." and "/"
              // characters to help line-breaks occur more naturally.
              canonicalUrl.replace(/([/.]+)/gi, '$1\u200B')
            }
          </a>
          <a class="i-amphtml-story-info-moreinfo" target="_blank">
            {localize(
              this.parentEl_,
              LocalizedStringId_Enum.AMP_STORY_DOMAIN_DIALOG_HEADING_LINK
            )}
          </a>
        </div>
      </div>
    );

    const root = createShadowRootWithStyle(<div />, this.element_, CSS);
    this.initializeListeners_();

    return this.requestMoreInfoLink_().then((moreInfoUrl) =>
      this.mutator_.mutateElement(this.parentEl_, () => {
        if (moreInfoUrl) {
          const linkElement = devAssert(
            this.element_.querySelector('.i-amphtml-story-info-moreinfo')
          );
          linkElement.classList.add(MOREINFO_VISIBLE_CLASS);
          linkElement.setAttribute('href', moreInfoUrl);
        }
        this.parentEl_.appendChild(root);
      })
    );
  }

  /**
   * Whether the element has been built.
   * @return {boolean}
   */
  isBuilt() {
    return this.isBuilt_;
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.INFO_DIALOG_STATE, (isOpen) => {
      this.onInfoDialogStateUpdated_(isOpen);
    });
  }

  /**
   * Reacts to dialog state updates and decides whether to show either the
   * native system sharing, or the fallback UI.
   * @param {boolean} isOpen
   * @private
   */
  onInfoDialogStateUpdated_(isOpen) {
    this.mutator_.mutateElement(dev().assertElement(this.element_), () => {
      this.element_.classList.toggle(DIALOG_VISIBLE_CLASS, isOpen);
    });

    this.element_[ANALYTICS_TAG_NAME] = 'amp-story-info-dialog';
    this.analyticsService_.triggerEvent(
      isOpen ? StoryAnalyticsEvent.OPEN : StoryAnalyticsEvent.CLOSE,
      this.element_
    );
  }

  /**
   * Handles click events and maybe closes the dialog.
   * @param  {!Event} event
   */
  onInfoDialogClick_(event) {
    const el = dev().assertElement(event.target);
    // Closes the dialog if click happened outside of the dialog main container.
    const mainContainer = this.element_.firstElementChild;
    if (!closest(el, (el) => el === mainContainer, this.element_)) {
      this.close_();
    }
    const anchorClicked = closest(event.target, (e) => matches(e, 'a[href]'));
    if (anchorClicked) {
      triggerClickFromLightDom(anchorClicked, this.element_);
      event.preventDefault();
    }
  }

  /**
   * Closes the info dialog.
   * @private
   */
  close_() {
    this.storeService_.dispatch(Action.TOGGLE_INFO_DIALOG, false);
  }

  /**
   * @return {!Promise<?string>} The URL to visit to receive more info on this
   *     page.
   * @private
   */
  requestMoreInfoLink_() {
    if (!this.viewer_.isEmbedded()) {
      return Promise.resolve(null);
    }
    return this.viewer_
      ./*OK*/ sendMessageAwaitResponse('moreInfoLinkUrl', /* data */ undefined)
      .then((moreInfoUrl) => {
        if (!moreInfoUrl) {
          return null;
        }
        return assertAbsoluteHttpOrHttpsUrl(dev().assertString(moreInfoUrl));
      });
  }
}
