import * as Preact from '#core/dom/jsx';
import {closest, matches} from '#core/dom/query';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {dev} from '#utils/log';

import {localizeTemplate} from './amp-story-localization-service';
import {
  Action,
  StateProperty,
  getStoreService,
} from './amp-story-store-service';
import {
  ANALYTICS_TAG_NAME,
  StoryAnalyticsEvent,
  getAnalyticsService,
} from './story-analytics';
import {createShadowRootWithStyle, triggerClickFromLightDom} from './utils';

import {CSS} from '../../../build/amp-story-info-dialog-1.0.css';

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

    const linkElement = (
      <a
        class="i-amphtml-story-info-moreinfo"
        target="_blank"
        i-amphtml-i18n-text-content={
          LocalizedStringId_Enum.AMP_STORY_DOMAIN_DIALOG_HEADING_LINK
        }
      ></a>
    );

    this.element_ = (
      <div
        class="i-amphtml-story-info-dialog i-amphtml-story-system-reset"
        onClick={(event) => {
          // Close if click occurred directly on this element.
          if (event.target === event.currentTarget) {
            this.close_();
          }
        }}
      >
        <div
          class="i-amphtml-story-info-dialog-container"
          onClick={(event) => {
            this.onClick_(event);
          }}
        >
          <h1
            class="i-amphtml-story-info-heading"
            i-amphtml-i18n-text-content={
              LocalizedStringId_Enum.AMP_STORY_DOMAIN_DIALOG_HEADING_LABEL
            }
          ></h1>
          <a class="i-amphtml-story-info-link" href={canonicalUrl}>
            {
              // Add zero-width space character (\u200B) after "." and "/"
              // characters to help line-breaks occur more naturally.
              canonicalUrl.replace(/([/.]+)/gi, '$1\u200B')
            }
          </a>
          {linkElement}
        </div>
      </div>
    );

    this.initializeListeners_();

    return Promise.all([
      localizeTemplate(this.element_, this.parentEl_),
      this.mutator_.mutateElement(this.parentEl_, () => {
        const root = createShadowRootWithStyle(<div />, this.element_, CSS);
        this.parentEl_.appendChild(root);
      }),
      this.requestMoreInfoLink_().then((moreInfoUrl) => {
        if (moreInfoUrl) {
          return this.mutator_.mutateElement(this.parentEl_, () => {
            linkElement.classList.add(MOREINFO_VISIBLE_CLASS);
            linkElement.setAttribute('href', moreInfoUrl);
          });
        }
      }),
    ]);
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
   * @param  {!Event} event
   */
  onClick_(event) {
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
        return Services.urlForDoc(this.parentEl_).assertAbsoluteHttpOrHttpsUrl(
          dev().assertString(moreInfoUrl)
        );
      });
  }
}
