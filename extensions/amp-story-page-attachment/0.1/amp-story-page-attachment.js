import {devAssert} from '#core/assert';
import {removeElement, toggleAttribute} from '#core/dom';
import * as Preact from '#core/dom/jsx';
import {closest, closestAncestorElementBySelector} from '#core/dom/query';
import {toggle} from '#core/dom/style';
import {getHistoryState} from '#core/window/history';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {dev} from '#utils/log';

import {localizeTemplate} from 'extensions/amp-story/1.0/amp-story-localization-service';

import {DraggableDrawer, DrawerState} from './amp-story-draggable-drawer';
import {
  allowlistFormActions,
  setupResponseAttributeElements,
} from './amp-story-form';
import {
  AttachmentTheme,
  renderOutlinkLinkIconElement,
  renderPageAttachmentUI,
} from './amp-story-open-page-attachment';

import {CSS as pageAttachmentCss} from '../../../build/amp-story-open-page-attachment-0.1.css';
import {CSS} from '../../../build/amp-story-page-attachment-0.1.css';
import {
  Action,
  StateProperty,
  UIType_Enum,
} from '../../amp-story/1.0/amp-story-store-service';
import {HistoryState, setHistoryState} from '../../amp-story/1.0/history';
import {StoryAnalyticsEvent} from '../../amp-story/1.0/story-analytics';
import {
  createShadowRootWithStyle,
  dependsOnStoryServices,
  triggerClickFromLightDom,
} from '../../amp-story/1.0/utils';

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

    /** @private @const {!Element} */
    this.storyEl_ = devAssert(
      closestAncestorElementBySelector(this.element, 'amp-story')
    );

    /** @private @const {!Element} */
    this.pageEl_ = devAssert(
      closestAncestorElementBySelector(this.element, 'amp-story-page')
    );

    /** @private @const {!../../amp-story/1.0/story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = Services.storyAnalyticsService(this.win);

    /** @private @const {!../../../src/service/history-impl.History} */
    this.historyService_ = Services.historyForDoc(this.element);

    /** @private {?AttachmentType} */
    this.type_ = null;

    /** @private {?Element} */
    this.outlinkEl_ = null;

    /** @private {?Element} */
    this.legacyOutlinkEl_ = null;
  }

  /**
   * @override
   */
  buildCallback() {
    super.buildCallback();
    this.buildOpenAttachmentUI_();
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
      return this.buildOutlink_();
    }
  }

  /** @private */
  buildOpenAttachmentUI_() {
    // To prevent 'title' attribute from being used by browser, copy value to 'data-title' and remove.
    if (this.element.hasAttribute('title')) {
      this.element.setAttribute(
        'data-title',
        this.element.getAttribute('title')
      );
      this.element.removeAttribute('title');
    }

    if (!this.openAttachmentEl_) {
      renderPageAttachmentUI(this.pageEl_, this.element).then((el) => {
        this.openAttachmentEl_ = el;

        // This ensures `active` is set on first render.
        // Otherwise setState may be called before this.openAttachmentEl_ exists.
        if (this.storyEl_.hasAttribute('active')) {
          this.openAttachmentEl_.setAttribute('active', '');
        }

        const container = (
          <div
            class="i-amphtml-story-page-open-attachment-host"
            role="button"
            onClick={(e) => {
              // Prevent default so link can be opened programmatically after URL preview is shown.
              e.preventDefault();
              this.open();
            }}
          ></div>
        );

        this.mutateElement(() => {
          this.pageEl_.appendChild(
            createShadowRootWithStyle(
              container,
              this.openAttachmentEl_,
              pageAttachmentCss
            )
          );
        });
      });
    }
  }

  /**
   * Builds inline page attachment's drawer UI.
   * @private
   */
  buildInline_() {
    const titleText =
      this.element.getAttribute('title') ||
      this.element.getAttribute('data-title');

    this.headerEl.appendChild(
      <div class="i-amphtml-story-draggable-drawer-header-title-and-close">
        <button
          class="i-amphtml-story-page-attachment-close-button"
          i-amphtml-i18n-aria-label={
            LocalizedStringId_Enum.AMP_STORY_CLOSE_BUTTON_LABEL
          }
          role="button"
          onClick={() => this.close_()}
          tabindex="-1"
        ></button>
        {titleText && (
          <span class="i-amphtml-story-page-attachment-title">{titleText}</span>
        )}
      </div>
    );
    localizeTemplate(this.headerEl, this.element);

    const forms = this.element.querySelectorAll('form');
    if (forms.length > 0) {
      allowlistFormActions(this.win);

      forms.forEach((form) => {
        // Scroll each response attribute element into view, when displayed.
        setupResponseAttributeElements(form, this.storyEl_).forEach((el) => {
          // TODO(wg-stories): Share ResizeObserver for runtime performance.
          new this.win.ResizeObserver((e) => {
            if (
              this.state === DrawerState.OPEN &&
              e[0].contentRect.height > 0
            ) {
              el./*OK*/ scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
              });
            }
          }).observe(el);
        });
      });

      // Page attachments that contain forms must display the page's publisher
      // domain above the attachment's contents. This enables users to gauge
      // the trustworthiness of publishers before sending data to them.
      this.headerEl.append(this.createDomainLabelElement_());
      this.headerEl.classList.add('i-amphtml-story-page-attachment-with-form');
    }

    const templateEl = this.element.querySelector(
      '.i-amphtml-story-draggable-drawer'
    );

    while (this.element.firstChild && this.element.firstChild !== templateEl) {
      this.contentEl.appendChild(this.element.firstChild);
    }
  }

  /**
   * Builds outlink CTA drawer UI.
   * @return {!Promise}
   * @private
   */
  buildOutlink_() {
    this.setDragCap_(DRAG_CAP_PX);
    this.setOpenThreshold_(OPEN_THRESHOLD_PX);

    this.headerEl.classList.add(
      'i-amphtml-story-draggable-drawer-header-attachment-remote'
    );
    this.element.classList.add('i-amphtml-story-page-attachment-remote');

    const isPageOutlink = this.element.tagName === 'AMP-STORY-PAGE-OUTLINK';

    // For backwards compatibility if element is amp-story-page-outlink.
    const hrefAttr = isPageOutlink
      ? this.element.querySelector('a').getAttribute('href')
      : this.element.getAttribute('href');

    // Set image.
    const openImgAttr = this.element.getAttribute('cta-image');
    const image =
      openImgAttr && openImgAttr !== 'none' ? (
        <div
          class="i-amphtml-story-page-attachment-remote-img"
          style={{backgroundImage: `url(${openImgAttr}) !important`}}
        ></div>
      ) : (
        // Attach link icon SVG by default.
        renderOutlinkLinkIconElement()
      );

    // Use an anchor element to make this a real link in vertical rendering.
    const link = (
      <a
        class="i-amphtml-story-page-attachment-remote-content"
        target="_blank"
        // Navigation is handled programmatically. Disable clicks on the placeholder
        // anchor to prevent from users triggering double navigations, which has
        // side effects in native contexts opening webviews/CCTs.
        onClick={(event) => event.preventDefault()}
      >
        {image}
        <span class="i-amphtml-story-page-attachment-remote-title">
          <span
            i-amphtml-i18n-text-content={
              LocalizedStringId_Enum.AMP_STORY_OPEN_OUTLINK_TEXT
            }
          ></span>
          <span>{hrefAttr}</span>
        </span>
        <svg
          class="i-amphtml-story-page-attachment-remote-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
        >
          <path d="M38 38H10V10h14V6H10a4 4 0 0 0-4 4v28a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V24h-4v14zM28 6v4h7.2L15.5 29.7l2.8 2.8L38 12.8V20h4V6H28z" />
        </svg>
      </a>
    );

    if (isPageOutlink) {
      // The target must be '_top' for page outlinks, which will result in the
      // link opening in the current tab. Opening links in a new tab requires a
      // trusted event, and Safari does not consider swiping up to be trusted.
      this.element.querySelector('a').setAttribute('target', '_top');
    }

    // URL will be validated and resolved based on the canonical URL if relative
    // when navigating.
    // TODO(wg-stories): It would be much nicer if this attribute was set inline
    // on the JSX tag above. However, that makes the LGTM analysis fail on
    // "Potentially unsafe external link".
    // See https://lgtm.com/rules/1806963085/
    // We set the href imperatively here to avoid triggering the warning
    // (an lgtm-disable comment will not work due to formatting, unfortunately.)
    // Consider whether we can use `noopener` and/or `noreferrer` so that we
    // can inline the attribute, and avoid the warning.
    link.setAttribute('href', hrefAttr);

    return localizeTemplate(link, this.element).then(() =>
      this.mutateElement(() => this.contentEl.appendChild(link))
    );
  }

  /**
   * Activate or deactivate open page attachment
   * @param {boolean} isActive
   */
  setOpenAttachmentActive(isActive) {
    this.openAttachmentEl_ &&
      toggleAttribute(this.openAttachmentEl_, 'active', isActive);
  }

  /**
   * @override
   */
  initializeListeners_() {
    super.initializeListeners_();

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

    this.storeService.subscribe(
      StateProperty.CURRENT_PAGE_ID,
      (id) => {
        this.setOpenAttachmentActive(id === this.pageEl_.id);
      },
      true
    );
  }

  /**
   * Get outlink element.
   * @return {?Element}
   * @private
   */
  getOutlinkEl_() {
    if (!this.outlinkEl_) {
      this.outlinkEl_ = this.element.parentElement
        .querySelector('amp-story-page-outlink')
        ?.querySelector('a');
    }
    return this.outlinkEl_;
  }

  /**
   * Get legacy outlink element.
   * @return {?Element}
   * @private
   */
  getLegacyOutlinkEl_() {
    if (!this.legacyOutlinkEl_) {
      this.legacyOutlinkEl_ = this.element.parentElement
        .querySelector('.i-amphtml-story-page-open-attachment-host')
        ?.shadowRoot?.querySelector('a.i-amphtml-story-page-open-attachment');
    }
    return this.legacyOutlinkEl_;
  }

  /**
   * Check if two URLs have the same origin and path but different hashes at the end.
   * @param {string} url1
   * @param {string} url2
   * @return {boolean}
   * @private
   */
  urlsHaveSameOriginAndPath_(url1, url2) {
    if (!url1 || !url2) {
      return false;
    }

    const url1WithoutHash = url1.split('#')[0];
    const url2WithoutHash = url2.split('#')[0];

    return url1WithoutHash === url2WithoutHash;
  }

  /**
   * If the element is an amp-story-page-outlink the click target is its anchor element child.
   * This is for SEO and analytics optimisation.
   * Otherwise the element is the legacy version, amp-story-page-attachment with an href,
   * and a click target is the button built by the component.
   * @private
   */
  programmaticallyClickOnOutlink_() {
    const pageOutlinkChild = this.getOutlinkEl_();
    const pageAttachmentChild = this.getLegacyOutlinkEl_();
    if (pageOutlinkChild) {
      pageOutlinkChild.click();
    } else if (pageAttachmentChild) {
      triggerClickFromLightDom(pageAttachmentChild, this.element);
    }
  }

  /**
   * @override
   */
  open(shouldAnimate = true) {
    // If the target is a branching link, redirect immediately without opening the drawer.
    const outlinkEl = this.getOutlinkEl_() || this.getLegacyOutlinkEl_();
    if (
      this.urlsHaveSameOriginAndPath_(window.location.href, outlinkEl?.href) &&
      outlinkEl?.href.includes('#page=')
    ) {
      if (window.location.href === outlinkEl.href) {
        // Should hard reload if the starting URL is the same as the target URL, otherwise
        // the page wouldn't do hash navigation at all.
        window.location.reload(true);
      } else {
        this.programmaticallyClickOnOutlink_();
      }
      return;
    }

    if (this.state === DrawerState.OPEN) {
      return;
    }

    super.open(shouldAnimate);

    this.storeService.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, true);
    this.storeService.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, false);

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

    this.toggleBackgroundOverlay_(true);
    this.toggleCloseButtonTabIndex_(true);

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
    const isMobileUI =
      this.storeService.get(StateProperty.UI_STATE) === UIType_Enum.MOBILE;
    if (!isMobileUI) {
      this.programmaticallyClickOnOutlink_();
    } else {
      // Timeout to shows post-tap animation on mobile only.
      Services.timerFor(this.win).delay(() => {
        this.programmaticallyClickOnOutlink_();
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
    this.toggleCloseButtonTabIndex_(false);

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
   * Handles tab-ability of header close button.
   * @param {boolean} isActive
   * @private
   */
  toggleCloseButtonTabIndex_(isActive) {
    const closeButton = this.headerEl.querySelector(
      '.i-amphtml-story-page-attachment-close-button'
    );
    // If attachment is outlink, there is no close button.
    if (!closeButton) {
      return;
    }
    this.mutateElement(() => {
      if (isActive) {
        closeButton.removeAttribute('tabindex');
      } else {
        closeButton.setAttribute('tabindex', -1);
      }
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
    return (
      <div class="i-amphtml-story-page-attachment-domain-label">
        {this.getPublisherOrigin_()}
      </div>
    );
  }

  /**
   * Returns the publisher origin URL string (e.g., "stories.example.com").
   * @return {string} The domain of the publisher.
   * @private
   */
  getPublisherOrigin_() {
    const urlService = Services.urlForDoc(this.element);
    const url = this.getAmpDoc().getUrl();
    const publisherOrigin = urlService.getSourceOrigin(url);
    return publisherOrigin.replace(/^http(s)?:\/\/(www.)?/, '');
  }
}

AMP.extension('amp-story-page-attachment', '0.1', (AMP) => {
  const delayedAttachmentClass = dependsOnStoryServices(AmpStoryPageAttachment);
  AMP.registerElement('amp-story-page-attachment', delayedAttachmentClass, CSS);
  AMP.registerElement('amp-story-page-outlink', delayedAttachmentClass);
});
