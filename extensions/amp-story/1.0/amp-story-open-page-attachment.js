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
export const buildOldAttachmentElement = (element) =>
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
    <a class="i-amphtml-story-page-open-attachment i-amphtml-story-system-reset i-amphtml-amp-story-page-attachment-ui-v2" role="button">
      <div class="i-amphtml-story-inline-page-attachment-chip" ref="chipEl">
        <div class="i-amphtml-story-inline-page-attachment-arrow"></div>
      </div>
    </a>`;

/**
 * @param {!Element} element
 * @return {!Element}
 */
const buildOpenOutlinkAttachmentElement = (element) =>
  htmlFor(element)`
    <a class="i-amphtml-story-page-open-attachment i-amphtml-amp-story-page-attachment-ui-v2" role="button" target="_top">
      <svg class="i-amphtml-story-outlink-page-attachment-arrow" xmlns="http://www.w3.org/2000/svg" width="18.7px" height="7.5px" viewBox="0 0 18.7 7.5"><path d="M18,4.7l-7.8-4.5C10,0,9.7,0,9.4,0C9.1,0,8.8,0,8.5,0.2L0.7,4.7C0,5.1-0.2,6,0.2,6.7c0.4,0.7,1.3,1,2.1,0.5l7.1-4.1l7.1,4.1c0.7,0.4,1.6,0.2,2.1-0.5C19,6,18.7,5.1,18,4.7z"/></svg>
      <div class="i-amphtml-story-outlink-page-attachment-outlink-chip" ref="chipEl">
        <span class="i-amphtml-story-page-attachment-label" ref="ctaLabelEl"></span>
      </div>
    </a>`;

/**
 * @param {!Element} element
 * @return {!Element}
 */
export const buildOpenAttachmentElementLinkIcon = (element) =>
  htmlFor(element)`
  <svg class="i-amphtml-story-page-open-attachment-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill-opacity=".1" d="M12 0c6.6 0 12 5.4 12 12s-5.4 12-12 12S0 18.6 0 12 5.4 0 12 0z"></path>
    <path d="M13.8 14.6c.1.1.2.3.2.5s-.1.3-.2.5L12.3 17c-.7.7-1.7 1.1-2.7 1.1-1 0-1.9-.4-2.7-1.1-.7-.7-1.1-1.7-1.1-2.7 0-1 .4-1.9 1.1-2.7l1.5-1.5c.2 0 .3-.1.5-.1s.3.1.5.2c.1.1.2.3.2.5s-.1.4-.2.5l-1.5 1.5c-.5.5-.7 1.1-.7 1.7 0 .6.3 1.3.7 1.7.5.5 1.1.7 1.7.7s1.3-.3 1.7-.7l1.5-1.5c.3-.3.7-.3 1 0zM17 7c-.7-.7-1.7-1.1-2.7-1.1-1 0-1.9.4-2.7 1.1l-1.5 1.5c0 .1-.1.3-.1.4 0 .2.1.3.2.5.1.1.3.2.5.2s.3-.1.5-.2l1.5-1.5c.5-.5 1.1-.7 1.7-.7.6 0 1.3.3 1.7.7.5.5.7 1.1.7 1.7 0 .6-.3 1.3-.7 1.7l-1.5 1.5c-.1.1-.2.3-.2.5s.1.3.2.5c.1.1.3.2.5.2s.3-.1.5-.2l1.5-1.5c.7-.7 1.1-1.7 1.1-2.7-.1-1-.5-1.9-1.2-2.6zm-7.9 7.2c0 .2.1.3.2.5.1.1.3.2.5.2s.4-.1.5-.2l4.5-4.5c.1-.1.2-.3.2-.5s-.1-.4-.2-.5c-.3-.2-.8-.2-1 .1l-4.5 4.5c-.1.1-.2.3-.2.4z"></path>
  </svg>`;

/**
 * Determines which open attachment UI to render.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
export const renderPageAttachmentUI = (pageEl, attachmentEl) => {
  if (isPageAttachmentUiV2ExperimentOn(pageEl.getAmpDoc().win)) {
    if (attachmentEl.getAttribute('href')) {
      return renderOutlinkPageAttachmentUI(pageEl, attachmentEl);
    } else {
      return renderInlinePageAttachmentUi(pageEl, attachmentEl);
    }
  }
  return renderOldPageAttachmentUI(pageEl, attachmentEl);
};

/**
 * Renders default page attachment UI.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
const renderOldPageAttachmentUI = (pageEl, attachmentEl) => {
  const openAttachmentEl = buildOldAttachmentElement(pageEl);

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
const renderOutlinkPageAttachmentUI = (pageEl, attachmentEl) => {
  const openAttachmentEl = buildOpenOutlinkAttachmentElement(pageEl);

  // Copy href to the element so it can be previewed on hover and long press.
  const attachmentHref = attachmentEl.getAttribute('href');
  if (attachmentHref) {
    openAttachmentEl.setAttribute('href', attachmentHref);
  }

  // Get elements.
  const {chipEl, ctaLabelEl} = htmlRefs(openAttachmentEl);

  // Set theme.
  let themeAttribute = attachmentEl.getAttribute('theme');
  if (themeAttribute) {
    themeAttribute = themeAttribute.toLowerCase();
  }
  openAttachmentEl.setAttribute('theme', themeAttribute);

  if (themeAttribute === AttachmentTheme.CUSTOM) {
    setCustomThemeStyles(attachmentEl, openAttachmentEl);
  }

  // Append text & aria-label.
  const openLabelAttr = attachmentEl.getAttribute('data-cta-text');
  const openLabel = openLabelAttr
    ? openLabelAttr.trim()
    : getLocalizationService(pageEl).getLocalizedString(
        LocalizedStringId.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL
      );
  ctaLabelEl.textContent = openLabel;
  openAttachmentEl.setAttribute('aria-label', openLabel);

  // Set image.
  const openImgAttr = attachmentEl.getAttribute('cta-image');
  if (openImgAttr && openImgAttr !== 'none') {
    const ctaImgEl = htmlFor(chipEl)`
      <div class="i-amphtml-story-outlink-page-attachment-img"></div>`;
    setImportantStyles(ctaImgEl, {
      'background-image': 'url(' + openImgAttr + ')',
    });
    chipEl.prepend(ctaImgEl);
  } else if (!openImgAttr) {
    // Attach link icon SVG by default.
    const linkImage = buildOpenAttachmentElementLinkIcon(attachmentEl);
    chipEl.prepend(linkImage);
  }

  return openAttachmentEl;
};

/**
 * Renders inline page attachment UI.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
const renderInlinePageAttachmentUi = (pageEl, attachmentEl) => {
  const openAttachmentEl = buildOpenInlineAttachmentElement(pageEl);

  // Set theme.
  const theme = attachmentEl.getAttribute('theme');
  if (theme && AttachmentTheme.DARK === theme.toLowerCase()) {
    openAttachmentEl.setAttribute('theme', AttachmentTheme.DARK);
  }

  // Append text & aria-label if defined.
  const openLabelAttr = attachmentEl.getAttribute('data-cta-text');
  const openLabel =
    (openLabelAttr && openLabelAttr.trim()) ||
    getLocalizationService(pageEl).getLocalizedString(
      LocalizedStringId.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL
    );
  openAttachmentEl.setAttribute('aria-label', openLabel);

  if (openLabel !== 'none') {
    const textEl = htmlFor(openAttachmentEl)`
      <span class="i-amphtml-story-page-attachment-label"></span>`;
    textEl.textContent = openLabel;
    openAttachmentEl.appendChild(textEl);
  }

  // Add images if they are defined.
  const {chipEl} = htmlRefs(openAttachmentEl);
  const makeImgElWithBG = (openImgAttr) => {
    const ctaImgEl = htmlFor(chipEl)`
      <div class="i-amphtml-story-inline-page-attachment-img"></div>`;
    setImportantStyles(ctaImgEl, {
      'background-image': 'url(' + openImgAttr + ')',
    });
    return ctaImgEl;
  };

  const openImgAttr2 = attachmentEl.getAttribute('cta-image-2');
  if (openImgAttr2) {
    chipEl.prepend(makeImgElWithBG(openImgAttr2));
  }

  const openImgAttr = attachmentEl.getAttribute('cta-image');
  if (openImgAttr) {
    chipEl.prepend(makeImgElWithBG(openImgAttr));
  }

  return openAttachmentEl;
};

/**
 * Sets custom theme attributes.
 * @param {!Element} attachmentEl
 * @param {!Element} openAttachmentEl
 */
export const setCustomThemeStyles = (attachmentEl, openAttachmentEl) => {
  const accentColor = attachmentEl.getAttribute('cta-accent-color');

  // Calculating contrast color (black or white) needed for outlink CTA UI.
  let contrastColor = null;
  if (accentColor) {
    setImportantStyles(attachmentEl, {
      'background-color': attachmentEl.getAttribute('cta-accent-color'),
    });
    const styles = computedStyle(attachmentEl.getAmpDoc().win, attachmentEl);
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
    setImportantStyles(attachmentEl, {
      '--i-amphtml-outlink-cta-background-color': accentColor,
      '--i-amphtml-outlink-cta-text-color': contrastColor,
    });
  } else {
    setImportantStyles(openAttachmentEl, {
      '--i-amphtml-outlink-cta-background-color': contrastColor,
      '--i-amphtml-outlink-cta-text-color': accentColor,
    });
    setImportantStyles(attachmentEl, {
      '--i-amphtml-outlink-cta-background-color': contrastColor,
      '--i-amphtml-outlink-cta-text-color': accentColor,
    });
  }
};
