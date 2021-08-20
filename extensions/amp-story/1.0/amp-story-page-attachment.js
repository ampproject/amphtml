import {Action, StateProperty, UIType} from './amp-story-store-service';
import {DraggableDrawer, DrawerState} from './amp-story-draggable-drawer';
import {HistoryState, setHistoryState} from './history';
import {LocalizedStringId} from '#service/localization/strings';
import {Services} from '#service';
import {StoryAnalyticsEvent, getAnalyticsService} from './story-analytics';
import {buildOutlinkLinkIconElement} from './amp-story-open-page-attachment';
import {closest} from '#core/dom/query';
import {dev, devAssert} from '../../../src/log';
import {getHistoryState} from '#core/window/history';
import {getLocalizationService} from './amp-story-localization-service';
import {getSourceOrigin} from '../../../src/url';
import {htmlFor, htmlRefs} from '#core/dom/static-template';
import {removeElement} from '#core/dom';
import {setImportantStyles, toggle} from '#core/dom/style';

import {triggerClickFromLightDom} from './utils';

/**
 * Distance to swipe before opening attachment.
 * @const {number}
 */
const OPEN_THRESHOLD_PX = 150;

/**
 * Max pixels to transform the remote attachment URL preview. Equivilent to the height of preview element.
 * @const {number}
 */
const DRAG_CAP_PX = 56;

/**
 * Duration of post-tap URL preview progress bar animation minus 100ms.
 * The minus 100ms roughly accounts for the small system delay in opening a link.
 * @const {number}
 */
const POST_TAP_ANIMATION_DURATION = 500;

/**
 * @enum {string}
 */
export const AttachmentTheme = {
  LIGHT: 'light', // default
  DARK: 'dark',
  CUSTOM: 'custom',
};

/**
 * @enum
 */
const AttachmentType = {
  INLINE: 0,
  OUTLINK: 1,
};

/**
 * AMP Story page attachment.
 */
export class AmpStoryPageAttachment extends DraggableDrawer {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win, this.element);

    /** @private @const {!../../../src/service/history-impl.History} */
    this.historyService_ = Services.historyForDoc(this.element);

    /** @private {?AttachmentType} */
    this.type_ = null;
  }

  /**
   * @override
   */
  buildCallback() {
    super.buildCallback();

    this.maybeSetDarkThemeForElement_(this.headerEl);
    this.maybeSetDarkThemeForElement_(this.element);

    // Outlinks can be an amp-story-page-outlink or the legacy version,
    // an amp-story-page-attachment with an href.
    const isOutlink =
      this.element.tagName === 'AMP-STORY-PAGE-OUTLINK' ||
      this.element.hasAttribute('href');
    this.type_ = isOutlink ? AttachmentType.OUTLINK : AttachmentType.INLINE;

    if (this.type_ === AttachmentType.INLINE) {
      this.buildInline_();
    }

    this.win.addEventListener('pageshow', (event) => {
      // On browser back, Safari does not reload the page but resumes its cached
      // version. This event's parameter lets us know when this happens so we
      // can cleanup the remote opening animation.
      if (event.persisted) {
        this.closeInternal_(false /** shouldAnimate */);
      }
    });

    toggle(this.element, true);
    this.element.setAttribute('aria-live', 'assertive');
  }

  /**
   * @override
   */
  layoutCallback() {
    super.layoutCallback();
    // Outlink renders an image and must be built in layoutCallback.
    if (this.type_ === AttachmentType.OUTLINK) {
      this.buildOutlink_();
    }
  }

  /**
   * Builds inline page attachment's drawer UI.
   * @private
   */
  buildInline_() {
    if (this.doesContainFormElement_()) {
      // Page attachments that contain forms must display the page's publisher
      // domain above the attachment's contents. This enables users to gauge
      // the trustworthiness of publishers before sending data to them.
      this.headerEl.append(this.createDomainLabelElement_());
      this.headerEl.classList.add('i-amphtml-story-page-attachment-with-form');
    }

    const closeButtonEl = htmlFor(this.element)`
          <button class="i-amphtml-story-page-attachment-close-button" aria-label="close"
              role="button">
          </button>`;
    const localizationService = getLocalizationService(devAssert(this.element));

    const titleEl = htmlFor(this.element)`
    <span class="i-amphtml-story-page-attachment-title"></span>`;

    if (localizationService) {
      const localizedCloseString = localizationService.getLocalizedString(
        LocalizedStringId.AMP_STORY_CLOSE_BUTTON_LABEL
      );
      closeButtonEl.setAttribute('aria-label', localizedCloseString);
    }

    if (this.element.hasAttribute('data-title')) {
      titleEl.textContent = this.element.getAttribute('data-title');
    }

    const titleAndCloseWrapperEl = this.headerEl.appendChild(
      htmlFor(this.element)`
            <div class="i-amphtml-story-draggable-drawer-header-title-and-close"></div>`
    );
    titleAndCloseWrapperEl.appendChild(closeButtonEl);
    titleAndCloseWrapperEl.appendChild(titleEl);

    const templateEl = this.element.querySelector(
      '.i-amphtml-story-draggable-drawer'
    );

    while (this.element.firstChild && this.element.firstChild !== templateEl) {
      this.contentEl.appendChild(this.element.firstChild);
    }

    // Ensures the content of the attachment won't be rendered/loaded until we
    // actually need it.
    toggle(dev().assertElement(this.containerEl), true);
  }

  /**
   * Builds outlink CTA drawer UI.
   * @private
   */
  buildOutlink_() {
    this.setDragCap_(DRAG_CAP_PX);
    this.setOpenThreshold_(OPEN_THRESHOLD_PX);

    this.headerEl.classList.add(
      'i-amphtml-story-draggable-drawer-header-attachment-remote'
    );
    this.element.classList.add('i-amphtml-story-page-attachment-remote');
    // Use an anchor element to make this a real link in vertical rendering.
    const link = htmlFor(this.element)`
      <a class="i-amphtml-story-page-attachment-remote-content" target="_blank">
        <span class="i-amphtml-story-page-attachment-remote-title"><span ref="openStringEl"></span><span ref="urlStringEl"></span></span>
        <svg class="i-amphtml-story-page-attachment-remote-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M38 38H10V10h14V6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V24h-4v14zM28 6v4h7.17L15.51 29.66l2.83 2.83L38 12.83V20h4V6H28z"></path></svg>
      </a>`;

    // For backwards compatibility if element is amp-story-page-outlink.
    const hrefAttr =
      this.element.tagName === 'AMP-STORY-PAGE-OUTLINK'
        ? this.element.querySelector('a').getAttribute('href')
        : this.element.getAttribute('href');

    // URL will be validated and resolved based on the canonical URL if relative
    // when navigating.
    link.setAttribute('href', hrefAttr);
    const {openStringEl, urlStringEl} = htmlRefs(link);

    // Navigation is handled programmatically. Disable clicks on the placeholder
    // anchor to prevent from users triggering double navigations, which has
    // side effects in native contexts opening webviews/CCTs.
    link.addEventListener('click', (event) => event.preventDefault());

    // Set image.
    const openImgAttr = this.element.getAttribute('cta-image');
    if (openImgAttr && openImgAttr !== 'none') {
      const ctaImgEl = this.win.document.createElement('div');
      ctaImgEl.classList.add('i-amphtml-story-page-attachment-remote-img');
      setImportantStyles(ctaImgEl, {
        'background-image': 'url(' + openImgAttr + ')',
      });
      link.prepend(ctaImgEl);
    } else if (!openImgAttr) {
      // Attach link icon SVG by default.
      const linkImage = buildOutlinkLinkIconElement(link);
      link.prepend(linkImage);
    }

    // Set url prevew text.
    const localizationService = getLocalizationService(devAssert(this.element));
    if (localizationService) {
      const localizedOpenString = localizationService.getLocalizedString(
        LocalizedStringId.AMP_STORY_OPEN_OUTLINK_TEXT
      );
      openStringEl.textContent = localizedOpenString;
    }
    urlStringEl.textContent = hrefAttr;

    this.contentEl.appendChild(link);
  }

  /**
   * @override
   */
  initializeListeners_() {
    super.initializeListeners_();

    const closeButtonEl = this.headerEl.querySelector(
      '.i-amphtml-story-page-attachment-close-button'
    );
    if (closeButtonEl) {
      closeButtonEl.addEventListener(
        'click',
        () => this.close_(),
        true /** useCapture */
      );
    }

    // Always open links in a new tab.
    this.contentEl.addEventListener(
      'click',
      (event) => {
        const {target} = event;
        if (target.tagName.toLowerCase() === 'a') {
          target.setAttribute('target', '_blank');
        }
      },
      true /** useCapture */
    );

    // Closes the attachment on opacity background clicks.
    this.element.addEventListener(
      'click',
      (event) => {
        if (
          event.target.tagName.toLowerCase() === 'amp-story-page-attachment'
        ) {
          this.close_();
        }
      },
      true /** useCapture */
    );

    // Closes the remote attachment drawer when navigation deeplinked to an app.
    if (this.type_ === AttachmentType.OUTLINK) {
      const ampdoc = this.getAmpDoc();
      ampdoc.onVisibilityChanged(() => {
        if (ampdoc.isVisible() && this.state === DrawerState.OPEN) {
          this.closeInternal_(false /** shouldAnimate */);
        }
      });
    }
  }

  /**
   * @override
   */
  open(shouldAnimate = true) {
    if (this.state === DrawerState.OPEN) {
      return;
    }

    super.open(shouldAnimate);

    this.storeService.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, true);
    this.storeService.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, false);

    this.toggleBackgroundOverlay_(true);

    // Don't create a new history entry for remote attachment as user is
    // navigating away.
    if (this.type_ !== AttachmentType.OUTLINK) {
      const currentHistoryState = /** @type {!Object} */ (
        getHistoryState(this.win.history)
      );
      const historyState = {
        ...currentHistoryState,
        [HistoryState.ATTACHMENT_PAGE_ID]: this.storeService.get(
          StateProperty.CURRENT_PAGE_ID
        ),
      };

      this.historyService_.push(() => this.closeInternal_(), historyState);
    }

    this.analyticsService_.triggerEvent(StoryAnalyticsEvent.OPEN, this.element);
    this.analyticsService_.triggerEvent(
      StoryAnalyticsEvent.PAGE_ATTACHMENT_ENTER
    );

    if (this.type_ === AttachmentType.OUTLINK) {
      this.openRemote_();
    }
  }

  /**
   * Triggers a remote attachment preview URL animation on mobile,
   * and redirects to the specified URL.
   * @private
   */
  openRemote_() {
    // If the element is an amp-story-page-outlink the click target is its anchor element child.
    // This is for SEO and analytics optimisation.
    // Otherwise the element is the legacy version, amp-story-page-attachment with an href,
    // and a click target is the button built by the component.
    const programaticallyClickOnTarget = () => {
      const pageOutlinkChild = this.element.parentElement
        .querySelector('amp-story-page-outlink')
        ?.querySelector('a');

      const pageAttachmentChild = this.element.parentElement
        ?.querySelector('.i-amphtml-story-page-open-attachment-host')
        .shadowRoot.querySelector('a.i-amphtml-story-page-open-attachment');

      if (pageOutlinkChild) {
        pageOutlinkChild.click();
      } else if (pageAttachmentChild) {
        triggerClickFromLightDom(pageAttachmentChild, this.element);
      }
    };

    const isMobileUI =
      this.storeService.get(StateProperty.UI_STATE) === UIType.MOBILE;
    if (!isMobileUI) {
      programaticallyClickOnTarget();
    } else {
      // Timeout to shows post-tap animation on mobile only.
      Services.timerFor(this.win).delay(() => {
        programaticallyClickOnTarget();
      }, POST_TAP_ANIMATION_DURATION);
    }
  }

  /**
   * Ensures the history state we added when opening the drawer is popped,
   * and closes the drawer either directly, or through the onPop callback.
   * @override
   */
  close_() {
    switch (this.state) {
      // If the drawer was open, pop the history entry that was added, which
      // will close the drawer through the onPop callback.
      case DrawerState.OPEN:
      case DrawerState.DRAGGING_TO_CLOSE:
        this.historyService_.goBack();
        break;
      // If the drawer was not open, no history entry was added, so we can
      // close the drawer directly.
      case DrawerState.DRAGGING_TO_OPEN:
        this.closeInternal_();
        break;
    }
  }

  /**
   * @override
   */
  closeInternal_(shouldAnimate = true) {
    if (this.state === DrawerState.CLOSED) {
      return;
    }

    super.closeInternal_(shouldAnimate);

    this.toggleBackgroundOverlay_(false);

    this.storeService.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, false);
    this.storeService.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, true);

    const storyEl = closest(this.element, (el) => el.tagName === 'AMP-STORY');
    const animationEl = storyEl.querySelector(
      '.i-amphtml-story-page-attachment-expand'
    );
    if (animationEl) {
      this.mutateElement(() => {
        removeElement(dev().assertElement(animationEl));
      });
    }

    setHistoryState(this.win, HistoryState.ATTACHMENT_PAGE_ID, null);

    this.analyticsService_.triggerEvent(
      StoryAnalyticsEvent.CLOSE,
      this.element
    );
    this.analyticsService_.triggerEvent(
      StoryAnalyticsEvent.PAGE_ATTACHMENT_EXIT
    );
  }

  /**
   * @param {boolean} isActive
   * @private
   */
  toggleBackgroundOverlay_(isActive) {
    const activePageEl = closest(
      this.element,
      (el) => el.tagName === 'AMP-STORY-PAGE'
    );
    this.mutateElement(() => {
      activePageEl.classList.toggle(
        'i-amphtml-story-page-attachment-active',
        isActive
      );
    });
  }

  /**
   * Updates the given element with the appropriate class or attribute, if the
   * page attachment's theme is 'dark'.
   * @param {!Element} element The element upon which to set the dark theme.
   * @private
   */
  maybeSetDarkThemeForElement_(element) {
    const theme = this.element.getAttribute('theme')?.toLowerCase();
    if (theme && AttachmentTheme.DARK === theme) {
      element.setAttribute('theme', theme);
    }
  }

  /**
   * Create the domain label element to be displayed at the top of the page
   * attachment.
   * @return {!Element} element The domain label element.
   * @private
   */
  createDomainLabelElement_() {
    const domainLabelEl = this.win.document.createElement('div');
    domainLabelEl.classList.add('i-amphtml-story-page-attachment-domain-label');
    domainLabelEl.textContent = this.getPublisherOrigin_();
    return domainLabelEl;
  }

  /**
   * Returns whether a form element exists within this page attachment.
   * @return {boolean} True, only if a form element exists as a descendant of
   *     this page attachment.
   * @private
   */
  doesContainFormElement_() {
    return Boolean(this.element.querySelector('form'));
  }

  /**
   * Returns the publisher origin URL string (e.g., "stories.example.com").
   * @return {string} The domain of the publisher.
   * @private
   */
  getPublisherOrigin_() {
    const publisherOrigin = getSourceOrigin(this.getAmpDoc().getUrl());
    return publisherOrigin.replace(/https?:\/\//, '');
  }
}
