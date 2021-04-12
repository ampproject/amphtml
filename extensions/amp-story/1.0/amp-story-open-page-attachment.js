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
import {htmlFor, htmlRefs} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';
import {setImportantStyles} from '../../../src/style';

/**
 * @enum {string}
 */
const AttachmentTheme = {
  LIGHT: 'light', // default
  DARK: 'dark',
};

/**
 * @param {!Element} element
 * @return {!Element}
 */
export const buildOpenDefaultAttachmentElement = (element) =>
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
     <a class="i-amphtml-story-page-open-attachment"
         role="button">
       <span class="i-amphtml-story-outlink-page-attachment-arrow">
         <span class="i-amphtml-story-outlink-page-open-attachment-bar-left" ref="barLeft"></span>
         <span class="i-amphtml-story-outlink-page-open-attachment-bar-right" ref="barRight"></span>
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
 * @param  {string} contrastColor '#FFF' or '#000'
 * @return {!Element}
 */
export const renderPageAttachmentUI = (win, pageEl, attachmentEl, contrastColor) => {
  const openImgAttr = attachmentEl.getAttribute('cta-image');
  const attachmentHref = attachmentEl.getAttribute('href');
  if (isPageAttachmentUiV2ExperimentOn(win) && attachmentHref) {
    return renderOutlinkPageAttachmentUI(
      win,
      pageEl,
      attachmentEl,
      attachmentHref,
      contrastColor
    );
  } else if (isPageAttachmentUiV2ExperimentOn(win) && openImgAttr) {
    return renderPageAttachmentUiWithImages(win, pageEl, attachmentEl);
  }
  return renderDefaultPageAttachmentUI(pageEl, attachmentEl);
};

/**
 * Renders default page attachment UI.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
const renderDefaultPageAttachmentUI = (pageEl, attachmentEl) => {
  const openAttachmentEl = buildOpenDefaultAttachmentElement(pageEl);
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
 * @param {!Window} win
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @param {!Element} attachmentHref
 * @param  {string} contrastColor '#FFF' or '#000'
 * @return {!Element}
 */
const renderOutlinkPageAttachmentUI = (
  win,
  pageEl,
  attachmentEl,
  attachmentHref,
  contrastColor
) => {
  const openAttachmentEl = buildOpenOutlinkAttachmentElement(pageEl);

  // Copy href to the element so it can be previewed on hover and long press.
  if (attachmentHref) {
    openAttachmentEl.setAttribute('href', attachmentHref);
  }

  // Getting elements
  let {barLeft, barRight, chipEl, ctaLabelEl} = htmlRefs(openAttachmentEl);

  // Setting theme
  const themeAttribute = attachmentEl.getAttribute('theme');
  openAttachmentEl.setAttribute('theme', themeAttribute);

  const accentColor = attachmentEl.getAttribute('cta-accent-color');
  if (themeAttribute === "custom") {
    if (attachmentEl.getAttribute('cta-accent-element') === "background") {
      setImportantStyles(ctaLabelEl, {
        'color': contrastColor
      });
      setImportantStyles(chipEl, {
        'background-color': accentColor
      });
      setImportantStyles(barLeft, {
        'background-color': accentColor
      });
      setImportantStyles(barRight, {
        'background-color': accentColor
      });
    } else {
      setImportantStyles(ctaLabelEl, {
        'color': accentColor
      });
      setImportantStyles(chipEl, {
        'background-color': contrastColor
      });
      setImportantStyles(barLeft, {
        'background-color': contrastColor
      });
      setImportantStyles(barRight, {
        'background-color': contrastColor
      });
    }
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
    const ctaImgEl = win.document.createElement('div');
    ctaImgEl.classList.add('i-amphtml-story-outlink-page-attachment-img');
    if (openImgAttr) {
      setImportantStyles(ctaImgEl, {
        'background-image': 'url(' + openImgAttr + ')',
      });
    } else {
      console.log("set SVG img here");
    }
    chipEl.prepend(ctaImgEl);
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
 * Returns true if new inline attachment UI is enabled.
 * @param {!Window} win
 * @return {boolean}
 */
export const isPageAttachmentUiV2ExperimentOn = (win) => {
  return isExperimentOn(win, 'amp-story-page-attachment-ui-v2');
};

/**
 * Generates the correct link image SVG based on the CTA chip colors.
 * Link icon is the same color as the CTA label text.
 * Link icon background is 10% opacity of the icon color.
 * @return {String}
 */
 export const linkSvg = () => {
  return "";
};
