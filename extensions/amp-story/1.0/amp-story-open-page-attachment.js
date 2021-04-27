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
import {AttachmentTheme} from './amp-story-page-attachment';
import {LocalizedStringId} from '../../../src/localized-strings';
import {computedStyle, setImportantStyles} from '../../../src/style';
import {getLocalizationService} from './amp-story-localization-service';
import {getRGBFromCssColorValue, getTextColorForRGB} from './utils';
import {htmlFor, htmlRefs} from '../../../src/static-template';
import {isPageAttachmentUiV2ExperimentOn} from './amp-story-page-attachment-ui-v2';

/**
 * @enum {string}
 */
const CtaAccentElement = {
  TEXT: 'text',
  BACKGROUND: 'background',
};

/**
 * @param {!Element} element
 * @return {!Element}
 */
export const buildOpenDefaultAttachmentElement = (element) =>
  htmlFor(element)`
    <a class="
        i-amphtml-story-page-open-attachment i-amphtml-story-system-reset"
        role="button" target="_top">
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
        i-amphtml-story-page-open-attachment i-amphtml-story-system-reset i-amphtml-amp-story-page-attachment-ui-v2"
        role="button">
      <div class="i-amphtml-story-inline-page-attachment-chip">
        <div class="i-amphtml-story-inline-page-attachment-img"></div>
        <div class="i-amphtml-story-inline-page-attachment-arrow"></div>
      </div>
    </a>`;

/**
 * @param {!Element} element
 * @return {!Element}
 */
const buildOpenOutlinkAttachmentElement = (element) =>
  htmlFor(element)`
     <a class="i-amphtml-story-page-open-attachment i-amphtml-amp-story-page-attachment-ui-v2"
         role="button">
       <span class="i-amphtml-story-outlink-page-attachment-arrow">
         <span class="i-amphtml-story-outlink-page-open-attachment-bar-left"></span>
         <span class="i-amphtml-story-outlink-page-open-attachment-bar-right"></span>
       </span>
       <div class="i-amphtml-story-outlink-page-attachment-outlink-chip" ref="chipEl">
        <div class="i-amphtml-story-outlink-page-attachment-label" ref="ctaLabelEl"></div>
       </div>
     </a>`;

/**
 * Determines which open attachment UI to render.
 * @param {!Window} win
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
export const renderPageAttachmentUI = (win, pageEl, attachmentEl) => {
  const openImgAttr = attachmentEl.getAttribute('cta-image');
  const attachmentHref = attachmentEl.getAttribute('href');
  if (isPageAttachmentUiV2ExperimentOn(win) && attachmentHref) {
    return renderOutlinkPageAttachmentUI(
      win,
      pageEl,
      attachmentEl,
      attachmentHref
    );
  } else if (isPageAttachmentUiV2ExperimentOn(win) && openImgAttr) {
    return renderPageAttachmentUiWithImages(win, pageEl, attachmentEl);
  }
  return renderDefaultPageAttachmentUI(win, pageEl, attachmentEl);
};

/**
 * Renders default page attachment UI.
 * @param {!Window} win
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
const renderDefaultPageAttachmentUI = (win, pageEl, attachmentEl) => {
  const openAttachmentEl = buildOpenDefaultAttachmentElement(pageEl);
  if (isPageAttachmentUiV2ExperimentOn(win)) {
    openAttachmentEl.classList.add(
      '.i-amphtml-amp-story-page-attachment-ui-v2'
    );
    // Setting theme
    const theme = attachmentEl.getAttribute('theme');
    if (theme && AttachmentTheme.DARK === theme.toLowerCase()) {
      openAttachmentEl.setAttribute('theme', AttachmentTheme.DARK);
    }
  }
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

  if (isPageAttachmentUiV2ExperimentOn(win)) {
    openAttachmentEl.classList.add('i-amphtml-amp-story-page-attachment-ui-v2');
  }
  return openAttachmentEl;
};

/**
 * Renders inline page attachment UI.
 * @param {!Window} win
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @param {!Element} attachmentHref
 * @return {!Element}
 */
const renderOutlinkPageAttachmentUI = (
  win,
  pageEl,
  attachmentEl,
  attachmentHref
) => {
  const openAttachmentEl = buildOpenOutlinkAttachmentElement(pageEl);

  // Copy href to the element so it can be previewed on hover and long press.
  if (attachmentHref) {
    openAttachmentEl.setAttribute('href', attachmentHref);
  }

  // Getting elements
  const {chipEl, ctaLabelEl} = htmlRefs(openAttachmentEl);

  // Setting theme
  let themeAttribute = attachmentEl.getAttribute('theme');
  if (themeAttribute) {
    themeAttribute = themeAttribute.toLowerCase();
  }
  openAttachmentEl.setAttribute('theme', themeAttribute);

  if (themeAttribute === AttachmentTheme.CUSTOM) {
    setCustomThemeStyles(win, attachmentEl, openAttachmentEl);
  }

  // Appending text & aria-label.
  const openLabelAttr = attachmentEl.getAttribute('data-cta-text');
  const openLabel = openLabelAttr
    ? openLabelAttr.trim()
    : getLocalizationService(pageEl).getLocalizedString(
        LocalizedStringId.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL
      );
  ctaLabelEl.textContent = openLabel;
  openAttachmentEl.setAttribute('aria-label', openLabel);

  // Adding image.
  const openImgAttr = attachmentEl.getAttribute('cta-image');

  // Removes image if attribute is explicitly set to "none".
  if (openImgAttr === 'none') {
    chipEl.classList.add(
      'i-amphtml-story-outlink-page-attachment-outlink-chip-no-image'
    );
  } else {
    if (openImgAttr) {
      const ctaImgEl = win.document.createElement('div');
      ctaImgEl.classList.add('i-amphtml-story-outlink-page-attachment-img');
      setImportantStyles(ctaImgEl, {
        'background-image': 'url(' + openImgAttr + ')',
      });
      chipEl.prepend(ctaImgEl);
    } else {
      const linkImage = htmlFor(
        attachmentEl
      )`<svg class="i-amphtml-story-page-open-attachment-link-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <rect stroke-width="0" width="24" height="24" fill-opacity="0.1" rx="12"></rect>
          <path stroke-width=".25" d="M9.63 18s0 0 0 0c.98 0 1.9-.38 2.58-1.07l1.47-1.48a.55.55 0 000-.77.55.55 0 00-.77 0l-1.47 1.48a2.53 2.53 0 01-3.6 0 2.53 2.53 0 010-3.6l1.48-1.48a.54.54 0 000-.77.54.54 0 00-.77 0L7.07 11.8a3.62 3.62 0 000 5.14A3.6 3.6 0 009.63 18zM11.09 9.31l1.47-1.48a2.53 2.53 0 013.6 0 2.53 2.53 0 010 3.6l-1.48 1.48a.54.54 0 000 .77.55.55 0 00.77 0l1.48-1.47a3.62 3.62 0 000-5.14A3.61 3.61 0 0014.36 6s0 0 0 0c-.98 0-1.9.38-2.58 1.07l-1.47 1.48a.55.55 0 000 .77c.22.21.57.21.78 0z"></path>
          <path stroke-width=".25" d="M14.63 9.37a.55.55 0 00-.78 0l-4.48 4.48a.55.55 0 00.39.94c.13 0 .28-.06.38-.17l4.48-4.48a.54.54 0 000-.77z"></path>
        </svg>`;

      chipEl.prepend(linkImage);
    }
  }

  return openAttachmentEl;
};

/**
 * Renders inline page attachment UI.
 * @param {!Window} win
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
const renderPageAttachmentUiWithImages = (win, pageEl, attachmentEl) => {
  const openAttachmentEl = buildOpenInlineAttachmentElement(pageEl);

  // Setting theme
  const theme = attachmentEl.getAttribute('theme');
  if (theme && AttachmentTheme.DARK === theme.toLowerCase()) {
    openAttachmentEl.setAttribute('theme', AttachmentTheme.DARK);
  }

  // Appending text & aria-label.
  const openLabelAttr = attachmentEl.getAttribute('data-cta-text');
  const openLabel =
    (openLabelAttr && openLabelAttr.trim()) ||
    getLocalizationService(pageEl).getLocalizedString(
      LocalizedStringId.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL
    );
  openAttachmentEl.setAttribute('aria-label', openLabel);

  if (openLabel !== 'none') {
    const textEl = win.document.createElement('span');
    textEl.classList.add('i-amphtml-story-inline-page-attachment-label');
    textEl.textContent = openLabel;
    openAttachmentEl.appendChild(textEl);
  }

  // Adding images.
  const openImgAttr = attachmentEl.getAttribute('cta-image');

  const ctaImgEl = openAttachmentEl.querySelector(
    '.i-amphtml-story-inline-page-attachment-img'
  );

  setImportantStyles(ctaImgEl, {
    'background-image': 'url(' + openImgAttr + ')',
  });

  const openImgAttr2 = attachmentEl.getAttribute('cta-image-2');

  if (openImgAttr2) {
    const ctaImgEl2 = win.document.createElement('div');
    ctaImgEl2.classList.add('i-amphtml-story-inline-page-attachment-img');
    setImportantStyles(ctaImgEl2, {
      'background-image': 'url(' + openImgAttr2 + ')',
    });
    ctaImgEl.parentNode.insertBefore(ctaImgEl2, ctaImgEl.nextSibling);
  }

  return openAttachmentEl;
};

/**
 * Sets custom theme attributes.
 * @param {!Window} win
 * @param {!Element} attachmentEl
 * @param {!Element} openAttachmentEl
 */
export const setCustomThemeStyles = (win, attachmentEl, openAttachmentEl) => {
  const accentColor = attachmentEl.getAttribute('cta-accent-color');

  // Calculating contrast color (black or white) needed for outlink CTA UI.
  let contrastColor = null;
  if (accentColor) {
    setImportantStyles(attachmentEl, {
      'background-color': attachmentEl.getAttribute('cta-accent-color'),
    });
    const styles = computedStyle(win, attachmentEl);
    const rgb = getRGBFromCssColorValue(styles['background-color']);
    contrastColor = getTextColorForRGB(rgb);
    setImportantStyles(attachmentEl, {
      'background-color': '',
    });
  }
  if (
    attachmentEl.getAttribute('cta-accent-element') ===
    CtaAccentElement.BACKGROUND
  ) {
    setImportantStyles(openAttachmentEl, {
      '--i-amphtml-outlink-cta-background-color': accentColor,
      '--i-amphtml-outlink-cta-text-color': contrastColor,
    });
  } else {
    setImportantStyles(openAttachmentEl, {
      '--i-amphtml-outlink-cta-background-color': contrastColor,
      '--i-amphtml-outlink-cta-text-color': accentColor,
    });
  }
};
