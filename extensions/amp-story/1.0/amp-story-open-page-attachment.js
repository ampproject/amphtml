/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Helper for amp-story rendering of page-attachment UI.
 */
import {LocalizedStringId} from '../../../src/localized-strings';
import {getLocalizationService} from './amp-story-localization-service';
import {htmlFor} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';

/**
 * @param {!Element} element
 * @return {!Element}
 */
export const buildOpenOutlinkAttachmentElement = (element) =>
  htmlFor(element)`
    <a class="
        i-amphtml-story-page-open-attachment i-amphtml-story-system-reset"
        role="button">
      <span class="i-amphtml-story-page-open-attachment-icon">
        <span class="i-amphtml-story-page-open-attachment-bar-left"></span>
        <span class="i-amphtml-story-page-open-attachment-bar-right"></span>
      </span>
      <span class="i-amphtml-story-page-open-attachment-label"></span>
    </a>`;

/**
 * @param {!Element} element
 * @return {!Element}
 */
export const buildOpenInlineAttachmentElement = (element) =>
  htmlFor(element)`
    <a class="
        i-amphtml-story-page-open-attachment i-amphtml-story-system-reset"
        role="button">
      <span class="i-amphtml-story-page-open-attachment-icon">
        <span class="i-amphtml-story-page-open-attachment-bar-left"></span>
        <span class="i-amphtml-story-page-open-attachment-bar-right"></span>
      </span>
      <span class="i-amphtml-story-page-open-attachment-label"></span>
    </a>`;

/**
 * Determines which open attachment UI to render.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
export const renderPageAttachmentUI = (win, pageEl, attachmentEl) => {
  const attachmentHref = attachmentEl.getAttribute('href');
  if (!attachmentHref && isInlinePageAttachmentV2ExperimentOn(win)) {
    return renderInlinePageAttachmentUI(
      pageEl,
      attachmentEl
    );
  } else {
    return renderOutlinkPageAttachmentUI(
      pageEl,
      attachmentEl
    );
  }
};

/**
 * Renders outlink page attachment UI.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
const renderOutlinkPageAttachmentUI = (pageEl, attachmentEl) => {
  const openAttachmentEl = buildOpenOutlinkAttachmentElement(pageEl);
  // If the attachment is a link, copy href to the element so it can be previewed on hover and long press.
  const attachmentHref = attachmentEl.getAttribute('href');
  if (attachmentHref) {
    openAttachmentEl.setAttribute('href', attachmentHref);
  }

  const textEl = openAttachmentEl.querySelector(
    '.i-amphtml-story-page-open-attachment-label'
  );

  const openLabelAttr = attachmentEl.getAttribute('data-cta-text');
  const openLabel =
    (openLabelAttr && openLabelAttr.trim()) ||
    getLocalizationService(pageEl).getLocalizedString(
      LocalizedStringId.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL
    );

  textEl.textContent = openLabel;
  return openAttachmentEl;
};

/**
 * Renders inline page attachment UI.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
const renderInlinePageAttachmentUI = (pageEl, attachmentEl) => {
  // TODO(raxsha): build inline functionality
  return renderOutlinkPageAttachmentUI(
    pageEl,
    attachmentEl
  );
}

/**
 * Returns true if new inline attachment UI is enabled.
 * @param {!Window} win
 * @return {boolean}
 */
export const isInlinePageAttachmentV2ExperimentOn = (win) => {
  return isExperimentOn(win, 'amp-story-inline-page-attachment-v2');
}
