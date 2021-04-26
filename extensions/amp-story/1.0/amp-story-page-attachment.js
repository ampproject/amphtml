/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {Action, StateProperty, UIType} from './amp-story-store-service';
import {DraggableDrawer, DrawerState} from './amp-story-draggable-drawer';
import {HistoryState, setHistoryState} from './history';
import {LocalizedStringId} from '../../../src/localized-strings';
import {Services} from '../../../src/services';
import {StoryAnalyticsEvent, getAnalyticsService} from './story-analytics';
import {closest, removeElement} from '../../../src/dom';
import {dev, devAssert} from '../../../src/log';
import {getLocalizationService} from './amp-story-localization-service';
import {getState} from '../../../src/history';
import {htmlFor, htmlRefs} from '../../../src/static-template';
import {
  buildOpenAttachmentElementLinkIcon,
  isPageAttachmentUiV2ExperimentOn,
} from './amp-story-open-page-attachment';
import {setImportantStyles} from '../../../src/style';
import {toggle} from '../../../src/style';
import {triggerClickFromLightDom} from './utils';

/** @const {string} */
const DARK_THEME_CLASS = 'i-amphtml-story-draggable-drawer-theme-dark';

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
  REMOTE: 1,
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

    const theme = this.element.getAttribute('theme');
    if (theme && AttachmentTheme.DARK === theme.toLowerCase()) {
      this.headerEl_.classList.add(DARK_THEME_CLASS);
      this.element.classList.add(DARK_THEME_CLASS);
    }

    // URL will be validated and resolved based on the canonical URL if relative
    // when navigating.
    const href = this.element.getAttribute('href');
    this.type_ = href ? AttachmentType.REMOTE : AttachmentType.INLINE;

    if (this.type_ === AttachmentType.INLINE) {
      this.buildInline_();
    }

    if (this.type_ === AttachmentType.REMOTE) {
      if (isPageAttachmentUiV2ExperimentOn(this.win)) {
        this.buildRemoteV2_();
      } else {
        this.buildRemote_();
      }
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
   * Builds inline page attachment's UI.
   * @private
   */
  buildInline_() {
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

    if (isPageAttachmentUiV2ExperimentOn(this.win)) {
      const titleAndCloseWrapperEl = this.headerEl_.appendChild(
        htmlFor(this.element)`
            <div class="i-amphtml-story-draggable-drawer-header-title-and-close"></div>`
      );
      titleAndCloseWrapperEl.appendChild(closeButtonEl);
      titleAndCloseWrapperEl.appendChild(titleEl);
    } else {
      this.headerEl_.appendChild(closeButtonEl);
      this.headerEl_.appendChild(titleEl);
    }

    const templateEl = this.element.querySelector(
      '.i-amphtml-story-draggable-drawer'
    );

    while (this.element.firstChild && this.element.firstChild !== templateEl) {
      this.contentEl_.appendChild(this.element.firstChild);
    }

    // Ensures the content of the attachment won't be rendered/loaded until we
    // actually need it.
    toggle(dev().assertElement(this.containerEl_), true);
  }

  /**
   * Builds remote page attachment's UI.
   * @private
   */
  buildRemote_() {
    this.setDragCap_(48 /* pixels */);
    this.setOpenThreshold_(150 /* pixels */);

    this.headerEl_.classList.add(
      'i-amphtml-story-draggable-drawer-header-attachment-remote'
    );
    this.element.classList.add('i-amphtml-story-page-attachment-remote');
    // Use an anchor element to make this a real link in vertical rendering.
    const link = htmlFor(this.element)`
    <a class="i-amphtml-story-page-attachment-remote-content" target="_blank">
      <span class="i-amphtml-story-page-attachment-remote-title"></span>
      <span class="i-amphtml-story-page-attachment-remote-icon"></span>
    </a>`;
    link.setAttribute('href', this.element.getAttribute('href'));
    this.contentEl_.appendChild(link);

    this.contentEl_.querySelector(
      '.i-amphtml-story-page-attachment-remote-title'
    ).textContent =
      this.element.getAttribute('data-title') ||
      Services.urlForDoc(this.element).getSourceOrigin(
        this.element.getAttribute('href')
      );
  }

  /**
   * Builds remote V2 page attachment's UI.
   * @private
   */
  buildRemoteV2_() {
    this.setOpenThreshold_(150 /* pixels */);
    this.setDragCap_(56 /* pixels */);

    this.headerEl_.classList.add(
      'i-amphtml-story-draggable-drawer-header-attachment-remote'
    );
    this.element.classList.add('i-amphtml-story-page-attachment-remote');

    const link = htmlFor(this.element)`
      <a class="i-amphtml-story-page-attachment-remote-content" target="_blank">
        <span class="i-amphtml-story-page-attachment-remote-img" ref="remoteImgEl"></span>
        <span class="i-amphtml-story-page-attachment-remote-title"><span ref="openStringEl"></span><span ref="urlStringEl"></span></span>
        <svg class="i-amphtml-story-page-attachment-remote-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M38 38H10V10h14V6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V24h-4v14zM28 6v4h7.17L15.51 29.66l2.83 2.83L38 12.83V20h4V6H28z"/></svg>
      </a>`;

    // Use an anchor element to make this a real link in vertical rendering.
    const hrefAttr = this.element.getAttribute('href');
    link.setAttribute('href', hrefAttr);

    const {remoteImgEl, openStringEl, urlStringEl} = htmlRefs(link);

    // Set image.
    const openImgAttr = this.element.getAttribute('cta-image');
    if (openImgAttr) {
      setImportantStyles(remoteImgEl, {
        'background-image': 'url(' + openImgAttr + ')',
      });
    } else {
      // Attach link icon SVG by default.
      const linkIcon = buildOpenAttachmentElementLinkIcon(link);
      remoteImgEl.appendChild(linkIcon);
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

    this.contentEl_.appendChild(link);
  }

  /**
   * @override
   */
  initializeListeners_() {
    super.initializeListeners_();

    const closeButtonEl = this.headerEl_.querySelector(
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
    this.contentEl_.addEventListener(
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
    if (this.type_ === AttachmentType.REMOTE) {
      const ampdoc = this.getAmpDoc();
      ampdoc.onVisibilityChanged(() => {
        if (ampdoc.isVisible() && this.state_ === DrawerState.OPEN) {
          this.closeInternal_(false /** shouldAnimate */);
        }
      });
    }
  }

  /**
   * @override
   */
  open(shouldAnimate = true) {
    if (this.state_ === DrawerState.OPEN) {
      return;
    }

    super.open(shouldAnimate);

    this.storeService_.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, true);
    this.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, false);

    // Don't create a new history entry for remote attachment as user is
    // navigating away.
    if (this.type_ !== AttachmentType.REMOTE) {
      const currentHistoryState = /** @type {!Object} */ (getState(
        this.win.history
      ));
      const historyState = {
        ...currentHistoryState,
        [HistoryState.ATTACHMENT_PAGE_ID]: this.storeService_.get(
          StateProperty.CURRENT_PAGE_ID
        ),
      };
      this.historyService_.push(() => this.closeInternal_(), historyState);
    }

    this.analyticsService_.triggerEvent(StoryAnalyticsEvent.OPEN, this.element);
    this.analyticsService_.triggerEvent(
      StoryAnalyticsEvent.PAGE_ATTACHMENT_ENTER
    );

    if (this.type_ === AttachmentType.REMOTE) {
      this.openRemote_();
    }
  }

  /**
   * Triggers a remote attachment opening animation, and redirects to the
   * specified URL.
   * @private
   */
  openRemote_() {
    const clickTarget = this.element.parentElement
      .querySelector('.i-amphtml-story-page-open-attachment-host')
      .shadowRoot.querySelector('a.i-amphtml-story-page-open-attachment');

    const isMobileUI =
      this.storeService_.get(StateProperty.UI_STATE) === UIType.MOBILE;
    // Shows outlink url preview on mobile only.
    if (!isMobileUI) {
      triggerClickFromLightDom(clickTarget, this.element);
    } else {
      const animationEl = this.win.document.createElement('div');
      animationEl.classList.add('i-amphtml-story-page-attachment-expand');
      const storyEl = closest(this.element, (el) => el.tagName === 'AMP-STORY');

      this.mutateElement(() => {
        clickTarget.classList.add(
          'i-amphtml-story-page-open-attachment-opening'
        );
      });
      // Play post-tap animation before opening link.
      this.win.setTimeout(() => {
        this.mutateElement(() => {
          storyEl.appendChild(animationEl);
        });
        triggerClickFromLightDom(clickTarget, this.element);
      }, 1000);
    }
  }

  /**
   * Ensures the history state we added when opening the drawer is popped,
   * and closes the drawer either directly, or through the onPop callback.
   * @override
   */
  close_() {
    switch (this.state_) {
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
    if (this.state_ === DrawerState.CLOSED) {
      return;
    }

    super.closeInternal_(shouldAnimate);

    this.storeService_.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, false);
    this.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, true);

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
}
