var _template = ["<a class=\"i-amphtml-story-page-open-attachment i-amphtml-story-system-reset\" role=button target=_top><span class=i-amphtml-story-page-open-attachment-icon><span class=i-amphtml-story-page-open-attachment-bar-left></span> <span class=i-amphtml-story-page-open-attachment-bar-right></span> </span><span class=i-amphtml-story-page-open-attachment-label></span></a>"],_template2 = ["<a class=\"i-amphtml-story-page-open-attachment i-amphtml-story-system-reset i-amphtml-amp-story-page-attachment-ui-v2\" role=button><div class=i-amphtml-story-inline-page-attachment-chip ref=chipEl><div class=i-amphtml-story-inline-page-attachment-arrow></div></div></a>"],_template3 = ["<a class=\"i-amphtml-story-page-open-attachment i-amphtml-amp-story-page-attachment-ui-v2\" role=button target=_top><svg class=i-amphtml-story-outlink-page-attachment-arrow xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 20 8\" width=20px height=8px><path d=M18,7.7c-0.2,0-0.5-0.1-0.7-0.2l-7.3-4l-7.3,4C2,7.9,1.1,7.7,0.7,6.9c-0.4-0.7-0.1-1.6,0.6-2l8-4.4c0.5-0.2,1-0.2,1.5,0l8,4.4c0.7,0.4,1,1.3,0.6,2C19,7.4,18.5,7.7,18,7.7z></path></svg><div class=i-amphtml-story-outlink-page-attachment-outlink-chip ref=chipEl><span class=i-amphtml-story-page-attachment-label ref=ctaLabelEl></span></div></a>"],_template4 = ["<svg class=i-amphtml-story-page-open-attachment-link-icon xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\"><path fill-opacity=.1 d=\"M12 0c6.6 0 12 5.4 12 12s-5.4 12-12 12S0 18.6 0 12 5.4 0 12 0z\"></path><path d=\"M13.8 14.6c.1.1.2.3.2.5s-.1.3-.2.5L12.3 17c-.7.7-1.7 1.1-2.7 1.1-1 0-1.9-.4-2.7-1.1-.7-.7-1.1-1.7-1.1-2.7 0-1 .4-1.9 1.1-2.7l1.5-1.5c.2 0 .3-.1.5-.1s.3.1.5.2c.1.1.2.3.2.5s-.1.4-.2.5l-1.5 1.5c-.5.5-.7 1.1-.7 1.7 0 .6.3 1.3.7 1.7.5.5 1.1.7 1.7.7s1.3-.3 1.7-.7l1.5-1.5c.3-.3.7-.3 1 0zM17 7c-.7-.7-1.7-1.1-2.7-1.1-1 0-1.9.4-2.7 1.1l-1.5 1.5c0 .1-.1.3-.1.4 0 .2.1.3.2.5.1.1.3.2.5.2s.3-.1.5-.2l1.5-1.5c.5-.5 1.1-.7 1.7-.7.6 0 1.3.3 1.7.7.5.5.7 1.1.7 1.7 0 .6-.3 1.3-.7 1.7l-1.5 1.5c-.1.1-.2.3-.2.5s.1.3.2.5c.1.1.3.2.5.2s.3-.1.5-.2l1.5-1.5c.7-.7 1.1-1.7 1.1-2.7-.1-1-.5-1.9-1.2-2.6zm-7.9 7.2c0 .2.1.3.2.5.1.1.3.2.5.2s.4-.1.5-.2l4.5-4.5c.1-.1.2-.3.2-.5s-.1-.4-.2-.5c-.3-.2-.8-.2-1 .1l-4.5 4.5c-.1.1-.2.3-.2.4z\"></path></svg>"],_template5 = ["<div class=i-amphtml-story-outlink-page-attachment-img></div>"],_template6 = ["<span class=i-amphtml-story-page-attachment-label></span>"],_template7 = ["<div class=i-amphtml-story-inline-page-attachment-img></div>"]; /**
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
import { AttachmentTheme } from "./amp-story-page-attachment";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { computedStyle, setImportantStyles } from "../../../src/core/dom/style";
import { getLocalizationService } from "./amp-story-localization-service";
import {
getRGBFromCssColorValue,
getTextColorForRGB,
maybeMakeProxyUrl } from "./utils";

import { htmlFor, htmlRefs } from "../../../src/core/dom/static-template";
import { isPageAttachmentUiV2ExperimentOn } from "./amp-story-page-attachment-ui-v2";
import { toWin } from "../../../src/core/window";

/**
 * @enum {string}
 */
var CtaAccentElement = {
  TEXT: 'text',
  BACKGROUND: 'background' };


/**
 * @param {!Element} element
 * @return {!Element}
 */
export var buildOldAttachmentElement = function buildOldAttachmentElement(element) {return (
    htmlFor(element)(_template));};










/**
 * For amp-story-page-attachment-ui-v2.
 * No image by default, if images are defined they are appended to the template.
 * @param {!Element} element
 * @return {!Element}
 */
export var buildOpenInlineAttachmentElement = function buildOpenInlineAttachmentElement(element) {return (
    htmlFor(element)(_template2));};






/**
 * For amp-story-page-attachment-ui-v2.
 * @param {!Element} element
 * @return {!Element}
 */
var buildOpenOutlinkAttachmentElement = function buildOpenOutlinkAttachmentElement(element) {return (
    htmlFor(element)(_template3));};







/**
 * For amp-story-page-attachment-ui-v2.
 * @param {!Element} element
 * @return {!Element}
 */
export var buildOpenAttachmentElementLinkIcon = function buildOpenAttachmentElementLinkIcon(element) {return (
    htmlFor(element)(_template4));};





/**
 * Determines which open attachment UI to render.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
export var renderPageAttachmentUI = function renderPageAttachmentUI(pageEl, attachmentEl) {
  if (isPageAttachmentUiV2ExperimentOn(pageEl.getAmpDoc().win)) {
    // Outlinks can be an amp-story-page-outlink or the legacy version,
    // an amp-story-page-attachment with an href.
    var isOutlink =
    attachmentEl.tagName === 'AMP-STORY-PAGE-OUTLINK' ||
    attachmentEl.getAttribute('href');
    if (isOutlink) {
      return renderOutlinkPageAttachmentUI(pageEl, attachmentEl);
    } else {
      return renderInlinePageAttachmentUi(pageEl, attachmentEl);
    }
  }
  // This codepath can be removed after amp-story-page-attachment-ui-v2 is launched.
  return renderOldPageAttachmentUI(pageEl, attachmentEl);
};

/**
 * Renders default page attachment UI.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
var renderOldPageAttachmentUI = function renderOldPageAttachmentUI(pageEl, attachmentEl) {
  var openAttachmentEl = buildOldAttachmentElement(pageEl);

  // If the attachment is a link, copy href to the element so it can be previewed on hover and long press.
  var attachmentHref = attachmentEl.getAttribute('href');
  if (attachmentHref) {
    openAttachmentEl.setAttribute('href', attachmentHref);
  }

  var textEl = openAttachmentEl.querySelector(
  '.i-amphtml-story-page-open-attachment-label');


  var openLabelAttr =
  attachmentEl.getAttribute('cta-text') ||
  attachmentEl.getAttribute('data-cta-text');
  var openLabel =
  (openLabelAttr && openLabelAttr.trim()) ||
  getLocalizationService(pageEl).getLocalizedString(
  LocalizedStringId.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL);


  // Copy title to the element if it exists.
  var attachmentTitle = attachmentEl.getAttribute('data-title');
  if (attachmentTitle) {
    openAttachmentEl.setAttribute('title', attachmentTitle);
  }

  textEl.textContent = openLabel;

  return openAttachmentEl;
};

/**
 * Renders inline page attachment UI.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
var renderOutlinkPageAttachmentUI = function renderOutlinkPageAttachmentUI(pageEl, attachmentEl) {var _pageEl$querySelector;
  var openAttachmentEl = buildOpenOutlinkAttachmentElement(pageEl);

  // amp-story-page-outlink requires an anchor element child for SEO and analytics optimisations.
  // amp-story-page-attachment uses this same codepath and allows an href attribute.
  // This is hidden with css. Clicks are simulated from it when a remote attachment is clicked.
  var anchorChild = ((_pageEl$querySelector = pageEl.
  querySelector('amp-story-page-outlink')) === null || _pageEl$querySelector === void 0) ? (void 0) : _pageEl$querySelector.
  querySelector('a');

  // Copy href to the element so it can be previewed on hover and long press.
  var attachmentHref =
  ((anchorChild === null || anchorChild === void 0) ? (void 0) : anchorChild.getAttribute('href')) || attachmentEl.getAttribute('href');
  if (attachmentHref) {
    openAttachmentEl.setAttribute('href', attachmentHref);
  }

  // Copy title to the element if it exists.
  var attachmentTitle =
  ((anchorChild === null || anchorChild === void 0) ? (void 0) : anchorChild.getAttribute('title')) || attachmentEl.getAttribute('title');
  if (attachmentTitle) {
    openAttachmentEl.setAttribute('title', attachmentTitle);
  }

  // Get elements.
  var _htmlRefs = htmlRefs(openAttachmentEl),chipEl = _htmlRefs.chipEl,ctaLabelEl = _htmlRefs.ctaLabelEl;

  // Set theme.
  var themeAttribute = attachmentEl.getAttribute('theme');
  if (themeAttribute) {
    themeAttribute = themeAttribute.toLowerCase();
  }
  openAttachmentEl.setAttribute('theme', themeAttribute);

  if (themeAttribute === AttachmentTheme.CUSTOM) {
    setCustomThemeStyles(attachmentEl, openAttachmentEl);
  }

  // Append text & aria-label.
  var openLabelAttr =
  ((anchorChild === null || anchorChild === void 0) ? (void 0) : anchorChild.textContent) ||
  attachmentEl.getAttribute('cta-text') ||
  attachmentEl.getAttribute('data-cta-text');
  var openLabel = openLabelAttr ?
  openLabelAttr.trim() :
  getLocalizationService(pageEl).getLocalizedString(
  LocalizedStringId.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL);

  ctaLabelEl.textContent = openLabel;
  openAttachmentEl.setAttribute('aria-label', openLabel);

  // Set image.
  var openImgAttr = attachmentEl.getAttribute('cta-image');
  if (openImgAttr && openImgAttr !== 'none') {
    var ctaImgEl = htmlFor(chipEl)(_template5);

    setImportantStyles(ctaImgEl, {
      'background-image': 'url(' + openImgAttr + ')' });

    chipEl.prepend(ctaImgEl);
  } else if (!openImgAttr) {
    // Attach link icon SVG by default.
    var linkImage = buildOpenAttachmentElementLinkIcon(attachmentEl);
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
var renderInlinePageAttachmentUi = function renderInlinePageAttachmentUi(pageEl, attachmentEl) {
  var openAttachmentEl = buildOpenInlineAttachmentElement(pageEl);

  // Set theme.
  var theme = attachmentEl.getAttribute('theme');
  if (theme && AttachmentTheme.DARK === theme.toLowerCase()) {
    openAttachmentEl.setAttribute('theme', AttachmentTheme.DARK);
  }

  // Append text & aria-label if defined.
  var openLabelAttr =
  attachmentEl.getAttribute('cta-text') ||
  attachmentEl.getAttribute('data-cta-text');
  var openLabel =
  (openLabelAttr && openLabelAttr.trim()) ||
  getLocalizationService(pageEl).getLocalizedString(
  LocalizedStringId.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL);

  openAttachmentEl.setAttribute('aria-label', openLabel);

  if (openLabel !== 'none') {
    var textEl = htmlFor(openAttachmentEl)(_template6);

    textEl.textContent = openLabel;
    openAttachmentEl.appendChild(textEl);
  }

  // Add images if they are defined.
  var _htmlRefs2 = htmlRefs(openAttachmentEl),chipEl = _htmlRefs2.chipEl;
  var makeImgElWithBG = function makeImgElWithBG(openImgAttr) {
    var ctaImgEl = htmlFor(chipEl)(_template7);

    setImportantStyles(ctaImgEl, {
      'background-image': 'url(' + openImgAttr + ')' });

    return ctaImgEl;
  };

  var openImgAttr2 = attachmentEl.getAttribute('cta-image-2');
  if (openImgAttr2) {
    var src = maybeMakeProxyUrl(openImgAttr2, pageEl.getAmpDoc());
    chipEl.prepend(makeImgElWithBG(src));
  }

  var openImgAttr = attachmentEl.getAttribute('cta-image');
  if (openImgAttr) {
    var _src = maybeMakeProxyUrl(openImgAttr, pageEl.getAmpDoc());
    chipEl.prepend(makeImgElWithBG(_src));
  }

  return openAttachmentEl;
};

/**
 * Sets custom theme attributes.
 * @param {!Element} attachmentEl
 * @param {!Element} openAttachmentEl
 */
export var setCustomThemeStyles = function setCustomThemeStyles(attachmentEl, openAttachmentEl) {
  var accentColor = attachmentEl.getAttribute('cta-accent-color');

  // Calculating contrast color (black or white) needed for outlink CTA UI.
  var contrastColor = null;
  if (accentColor) {
    setImportantStyles(attachmentEl, {
      'background-color': attachmentEl.getAttribute('cta-accent-color') });


    var win = toWin(attachmentEl.ownerDocument.defaultView);
    var styles = computedStyle(win, attachmentEl);
    var rgb = getRGBFromCssColorValue(styles['background-color']);
    contrastColor = getTextColorForRGB(rgb);
    setImportantStyles(attachmentEl, {
      'background-color': '' });

  }
  if (
  attachmentEl.getAttribute('cta-accent-element') ===
  CtaAccentElement.BACKGROUND)
  {
    setImportantStyles(openAttachmentEl, {
      '--i-amphtml-outlink-cta-background-color': accentColor,
      '--i-amphtml-outlink-cta-text-color': contrastColor });

    setImportantStyles(attachmentEl, {
      '--i-amphtml-outlink-cta-background-color': accentColor,
      '--i-amphtml-outlink-cta-text-color': contrastColor });

  } else {
    setImportantStyles(openAttachmentEl, {
      '--i-amphtml-outlink-cta-background-color': contrastColor,
      '--i-amphtml-outlink-cta-text-color': accentColor });

    setImportantStyles(attachmentEl, {
      '--i-amphtml-outlink-cta-background-color': contrastColor,
      '--i-amphtml-outlink-cta-text-color': accentColor });

  }
};
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-open-page-attachment.js