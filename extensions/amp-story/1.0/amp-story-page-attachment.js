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

import {Action, StateProperty} from './amp-story-store-service';
import {DraggableDrawer, DrawerState} from './amp-story-draggable-drawer';
import {HistoryState, setHistoryState} from './history';
import {Services} from '../../../src/services';
import {StoryAnalyticsEvent, getAnalyticsService} from './story-analytics';
import {closest, removeElement} from '../../../src/dom';
import {dev} from '../../../src/log';
import {getState} from '../../../src/history';
import {htmlFor} from '../../../src/static-template';
import {toggle} from '../../../src/style';

/** @const {string} */
const DARK_THEME_CLASS = 'i-amphtml-story-draggable-drawer-theme-dark';

/**
 * @enum {string}
 */
const AttachmentTheme = {
  LIGHT: 'light', // default
  DARK: 'dark',
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
      this.buildRemote_();
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
    this.headerEl_.appendChild(
      htmlFor(this.element)`
          <span class="i-amphtml-story-page-attachment-close-button" aria-label="X"
              role="button">
          </span>`
    );
    this.headerEl_.appendChild(
      htmlFor(this.element)`
          <span class="i-amphtml-story-page-attachment-title"></span>`
    );

    if (this.element.hasAttribute('data-title')) {
      this.headerEl_.querySelector(
        '.i-amphtml-story-page-attachment-title'
      ).textContent = this.element.getAttribute('data-title');
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
    const animationEl = this.win.document.createElement('div');
    animationEl.classList.add('i-amphtml-story-page-attachment-expand');
    const storyEl = closest(this.element, (el) => el.tagName === 'AMP-STORY');

    this.mutateElement(() => {
      storyEl.appendChild(animationEl);
    }).then(() => {
      // Give some time for the 120ms CSS animation to run (cf
      // amp-story-page-attachment.css). The navigation itself will take some
      // time, depending on the target and network conditions.
      this.win.setTimeout(() => {
        const navigationService = Services.navigationForDoc(this.getAmpDoc());
        navigationService.navigateTo(
          this.win,
          this.element.getAttribute('href')
        );
      }, 50);
    });
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
