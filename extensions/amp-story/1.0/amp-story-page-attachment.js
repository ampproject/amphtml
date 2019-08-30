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
import {AnalyticsEvent, getAnalyticsService} from './story-analytics';
import {DraggableDrawer, DrawerState} from './amp-story-draggable-drawer';
import {HistoryState, setHistoryState} from './utils';
import {Services} from '../../../src/services';
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
 * AMP Story page attachment.
 */
export class AmpStoryPageAttachment extends DraggableDrawer {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = getAnalyticsService(this.win, this.element);

    /** @type {!../../../src/service/history-impl.History} */
    this.historyService_ = Services.historyForDoc(this.element);
  }

  /**
   * @override
   */
  buildCallback() {
    super.buildCallback();

    this.headerEl_.appendChild(
      htmlFor(this.element)`
        <span class="i-amphtml-story-page-attachment-close-button"
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

    const theme = this.element.getAttribute('theme');
    if (theme && AttachmentTheme.DARK === theme.toLowerCase()) {
      this.headerEl_.classList.add(DARK_THEME_CLASS);
      this.element.classList.add(DARK_THEME_CLASS);
    }

    const templateEl = this.element.querySelector(
      '.i-amphtml-story-draggable-drawer'
    );

    while (this.element.firstChild && this.element.firstChild !== templateEl) {
      this.contentEl_.appendChild(this.element.firstChild);
    }

    // Ensures the content of the attachment won't be rendered/loaded until we
    // actually need it.
    toggle(dev().assertElement(this.containerEl_), false);
    toggle(this.element, true);
  }

  /**
   * @override
   */
  initializeListeners_() {
    super.initializeListeners_();

    this.headerEl_
      .querySelector('.i-amphtml-story-page-attachment-close-button')
      .addEventListener('click', () => this.close_(), true /** useCapture */);

    // Always open links in a new tab.
    this.contentEl_.addEventListener(
      'click',
      event => {
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
      event => {
        if (
          event.target.tagName.toLowerCase() === 'amp-story-page-attachment'
        ) {
          this.close_();
        }
      },
      true /** useCapture */
    );
  }

  /**
   * @override
   */
  open(shouldAnimate = true) {
    super.open(shouldAnimate);

    this.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, false);

    const currentHistoryState = /** @type {!Object} */ (getState(
      this.win.history
    ));
    const historyState = Object.assign({}, currentHistoryState, {
      [HistoryState.ATTACHMENT_PAGE_ID]: this.storeService_.get(
        StateProperty.CURRENT_PAGE_ID
      ),
    });

    this.historyService_.push(() => this.closeInternal_(), historyState);
    this.analyticsService_.triggerEvent(AnalyticsEvent.PAGE_ATTACHMENT_ENTER);
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
  closeInternal_() {
    super.closeInternal_();

    this.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, true);

    setHistoryState(this.win, HistoryState.ATTACHMENT_PAGE_ID, null);

    this.analyticsService_.triggerEvent(AnalyticsEvent.PAGE_ATTACHMENT_EXIT);
  }
}
