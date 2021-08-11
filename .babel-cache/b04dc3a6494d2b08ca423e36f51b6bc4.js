var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7;

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

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
import { AttachmentTheme } from "./amp-story-page-attachment";
import { LocalizedStringId } from "../../../src/service/localization/strings";
import { computedStyle, setImportantStyles } from "../../../src/core/dom/style";
import { getLocalizationService } from "./amp-story-localization-service";
import { getRGBFromCssColorValue, getTextColorForRGB, maybeMakeProxyUrl } from "./utils";
import { htmlFor, htmlRefs } from "../../../src/core/dom/static-template";
import { isPageAttachmentUiV2ExperimentOn } from "./amp-story-page-attachment-ui-v2";
import { toWin } from "../../../src/core/window";

/**
 * @enum {string}
 */
var CtaAccentElement = {
  TEXT: 'text',
  BACKGROUND: 'background'
};

/**
 * @param {!Element} element
 * @return {!Element}
 */
export var buildOldAttachmentElement = function buildOldAttachmentElement(element) {
  return htmlFor(element)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <a class=\"\n        i-amphtml-story-page-open-attachment i-amphtml-story-system-reset\"\n        role=\"button\" target=\"_top\">\n      <span class=\"i-amphtml-story-page-open-attachment-icon\">\n        <span class=\"i-amphtml-story-page-open-attachment-bar-left\"></span>\n        <span class=\"i-amphtml-story-page-open-attachment-bar-right\"></span>\n      </span>\n      <span class=\"i-amphtml-story-page-open-attachment-label\"></span>\n    </a>"])));
};

/**
 * For amp-story-page-attachment-ui-v2.
 * No image by default, if images are defined they are appended to the template.
 * @param {!Element} element
 * @return {!Element}
 */
export var buildOpenInlineAttachmentElement = function buildOpenInlineAttachmentElement(element) {
  return htmlFor(element)(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n    <a class=\"i-amphtml-story-page-open-attachment i-amphtml-story-system-reset i-amphtml-amp-story-page-attachment-ui-v2\" role=\"button\">\n      <div class=\"i-amphtml-story-inline-page-attachment-chip\" ref=\"chipEl\">\n        <div class=\"i-amphtml-story-inline-page-attachment-arrow\"></div>\n      </div>\n    </a>"])));
};

/**
 * For amp-story-page-attachment-ui-v2.
 * @param {!Element} element
 * @return {!Element}
 */
var buildOpenOutlinkAttachmentElement = function buildOpenOutlinkAttachmentElement(element) {
  return htmlFor(element)(_templateObject3 || (_templateObject3 = _taggedTemplateLiteralLoose(["\n    <a class=\"i-amphtml-story-page-open-attachment i-amphtml-amp-story-page-attachment-ui-v2\" role=\"button\" target=\"_top\">\n      <svg class=\"i-amphtml-story-outlink-page-attachment-arrow\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 8\" width=\"20px\" height=\"8px\"><path d=\"M18,7.7c-0.2,0-0.5-0.1-0.7-0.2l-7.3-4l-7.3,4C2,7.9,1.1,7.7,0.7,6.9c-0.4-0.7-0.1-1.6,0.6-2l8-4.4c0.5-0.2,1-0.2,1.5,0l8,4.4c0.7,0.4,1,1.3,0.6,2C19,7.4,18.5,7.7,18,7.7z\"></path></svg>\n      <div class=\"i-amphtml-story-outlink-page-attachment-outlink-chip\" ref=\"chipEl\">\n        <span class=\"i-amphtml-story-page-attachment-label\" ref=\"ctaLabelEl\"></span>\n      </div>\n    </a>"])));
};

/**
 * For amp-story-page-attachment-ui-v2.
 * @param {!Element} element
 * @return {!Element}
 */
export var buildOpenAttachmentElementLinkIcon = function buildOpenAttachmentElementLinkIcon(element) {
  return htmlFor(element)(_templateObject4 || (_templateObject4 = _taggedTemplateLiteralLoose(["\n  <svg class=\"i-amphtml-story-page-open-attachment-link-icon\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\">\n    <path fill-opacity=\".1\" d=\"M12 0c6.6 0 12 5.4 12 12s-5.4 12-12 12S0 18.6 0 12 5.4 0 12 0z\"></path>\n    <path d=\"M13.8 14.6c.1.1.2.3.2.5s-.1.3-.2.5L12.3 17c-.7.7-1.7 1.1-2.7 1.1-1 0-1.9-.4-2.7-1.1-.7-.7-1.1-1.7-1.1-2.7 0-1 .4-1.9 1.1-2.7l1.5-1.5c.2 0 .3-.1.5-.1s.3.1.5.2c.1.1.2.3.2.5s-.1.4-.2.5l-1.5 1.5c-.5.5-.7 1.1-.7 1.7 0 .6.3 1.3.7 1.7.5.5 1.1.7 1.7.7s1.3-.3 1.7-.7l1.5-1.5c.3-.3.7-.3 1 0zM17 7c-.7-.7-1.7-1.1-2.7-1.1-1 0-1.9.4-2.7 1.1l-1.5 1.5c0 .1-.1.3-.1.4 0 .2.1.3.2.5.1.1.3.2.5.2s.3-.1.5-.2l1.5-1.5c.5-.5 1.1-.7 1.7-.7.6 0 1.3.3 1.7.7.5.5.7 1.1.7 1.7 0 .6-.3 1.3-.7 1.7l-1.5 1.5c-.1.1-.2.3-.2.5s.1.3.2.5c.1.1.3.2.5.2s.3-.1.5-.2l1.5-1.5c.7-.7 1.1-1.7 1.1-2.7-.1-1-.5-1.9-1.2-2.6zm-7.9 7.2c0 .2.1.3.2.5.1.1.3.2.5.2s.4-.1.5-.2l4.5-4.5c.1-.1.2-.3.2-.5s-.1-.4-.2-.5c-.3-.2-.8-.2-1 .1l-4.5 4.5c-.1.1-.2.3-.2.4z\"></path>\n  </svg>"])));
};

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
    var isOutlink = attachmentEl.tagName === 'AMP-STORY-PAGE-OUTLINK' || attachmentEl.getAttribute('href');

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

  var textEl = openAttachmentEl.querySelector('.i-amphtml-story-page-open-attachment-label');
  var openLabelAttr = attachmentEl.getAttribute('cta-text') || attachmentEl.getAttribute('data-cta-text');
  var openLabel = openLabelAttr && openLabelAttr.trim() || getLocalizationService(pageEl).getLocalizedString(LocalizedStringId.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL);
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
var renderOutlinkPageAttachmentUI = function renderOutlinkPageAttachmentUI(pageEl, attachmentEl) {
  var _pageEl$querySelector;

  var openAttachmentEl = buildOpenOutlinkAttachmentElement(pageEl);
  // amp-story-page-outlink requires an anchor element child for SEO and analytics optimisations.
  // amp-story-page-attachment uses this same codepath and allows an href attribute.
  // This is hidden with css. Clicks are simulated from it when a remote attachment is clicked.
  var anchorChild = (_pageEl$querySelector = pageEl.querySelector('amp-story-page-outlink')) == null ? void 0 : _pageEl$querySelector.querySelector('a');
  // Copy href to the element so it can be previewed on hover and long press.
  var attachmentHref = (anchorChild == null ? void 0 : anchorChild.getAttribute('href')) || attachmentEl.getAttribute('href');

  if (attachmentHref) {
    openAttachmentEl.setAttribute('href', attachmentHref);
  }

  // Copy title to the element if it exists.
  var attachmentTitle = (anchorChild == null ? void 0 : anchorChild.getAttribute('title')) || attachmentEl.getAttribute('title');

  if (attachmentTitle) {
    openAttachmentEl.setAttribute('title', attachmentTitle);
  }

  // Get elements.
  var _htmlRefs = htmlRefs(openAttachmentEl),
      chipEl = _htmlRefs.chipEl,
      ctaLabelEl = _htmlRefs.ctaLabelEl;

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
  var openLabelAttr = (anchorChild == null ? void 0 : anchorChild.textContent) || attachmentEl.getAttribute('cta-text') || attachmentEl.getAttribute('data-cta-text');
  var openLabel = openLabelAttr ? openLabelAttr.trim() : getLocalizationService(pageEl).getLocalizedString(LocalizedStringId.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL);
  ctaLabelEl.textContent = openLabel;
  openAttachmentEl.setAttribute('aria-label', openLabel);
  // Set image.
  var openImgAttr = attachmentEl.getAttribute('cta-image');

  if (openImgAttr && openImgAttr !== 'none') {
    var ctaImgEl = htmlFor(chipEl)(_templateObject5 || (_templateObject5 = _taggedTemplateLiteralLoose(["\n      <div class=\"i-amphtml-story-outlink-page-attachment-img\"></div>"])));
    setImportantStyles(ctaImgEl, {
      'background-image': 'url(' + openImgAttr + ')'
    });
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
  var openLabelAttr = attachmentEl.getAttribute('cta-text') || attachmentEl.getAttribute('data-cta-text');
  var openLabel = openLabelAttr && openLabelAttr.trim() || getLocalizationService(pageEl).getLocalizedString(LocalizedStringId.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL);
  openAttachmentEl.setAttribute('aria-label', openLabel);

  if (openLabel !== 'none') {
    var textEl = htmlFor(openAttachmentEl)(_templateObject6 || (_templateObject6 = _taggedTemplateLiteralLoose(["\n      <span class=\"i-amphtml-story-page-attachment-label\"></span>"])));
    textEl.textContent = openLabel;
    openAttachmentEl.appendChild(textEl);
  }

  // Add images if they are defined.
  var _htmlRefs2 = htmlRefs(openAttachmentEl),
      chipEl = _htmlRefs2.chipEl;

  var makeImgElWithBG = function makeImgElWithBG(openImgAttr) {
    var ctaImgEl = htmlFor(chipEl)(_templateObject7 || (_templateObject7 = _taggedTemplateLiteralLoose(["\n      <div class=\"i-amphtml-story-inline-page-attachment-img\"></div>"])));
    setImportantStyles(ctaImgEl, {
      'background-image': 'url(' + openImgAttr + ')'
    });
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
      'background-color': attachmentEl.getAttribute('cta-accent-color')
    });
    var win = toWin(attachmentEl.ownerDocument.defaultView);
    var styles = computedStyle(win, attachmentEl);
    var rgb = getRGBFromCssColorValue(styles['background-color']);
    contrastColor = getTextColorForRGB(rgb);
    setImportantStyles(attachmentEl, {
      'background-color': ''
    });
  }

  if (attachmentEl.getAttribute('cta-accent-element') === CtaAccentElement.BACKGROUND) {
    setImportantStyles(openAttachmentEl, {
      '--i-amphtml-outlink-cta-background-color': accentColor,
      '--i-amphtml-outlink-cta-text-color': contrastColor
    });
    setImportantStyles(attachmentEl, {
      '--i-amphtml-outlink-cta-background-color': accentColor,
      '--i-amphtml-outlink-cta-text-color': contrastColor
    });
  } else {
    setImportantStyles(openAttachmentEl, {
      '--i-amphtml-outlink-cta-background-color': contrastColor,
      '--i-amphtml-outlink-cta-text-color': accentColor
    });
    setImportantStyles(attachmentEl, {
      '--i-amphtml-outlink-cta-background-color': contrastColor,
      '--i-amphtml-outlink-cta-text-color': accentColor
    });
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1vcGVuLXBhZ2UtYXR0YWNobWVudC5qcyJdLCJuYW1lcyI6WyJBdHRhY2htZW50VGhlbWUiLCJMb2NhbGl6ZWRTdHJpbmdJZCIsImNvbXB1dGVkU3R5bGUiLCJzZXRJbXBvcnRhbnRTdHlsZXMiLCJnZXRMb2NhbGl6YXRpb25TZXJ2aWNlIiwiZ2V0UkdCRnJvbUNzc0NvbG9yVmFsdWUiLCJnZXRUZXh0Q29sb3JGb3JSR0IiLCJtYXliZU1ha2VQcm94eVVybCIsImh0bWxGb3IiLCJodG1sUmVmcyIsImlzUGFnZUF0dGFjaG1lbnRVaVYyRXhwZXJpbWVudE9uIiwidG9XaW4iLCJDdGFBY2NlbnRFbGVtZW50IiwiVEVYVCIsIkJBQ0tHUk9VTkQiLCJidWlsZE9sZEF0dGFjaG1lbnRFbGVtZW50IiwiZWxlbWVudCIsImJ1aWxkT3BlbklubGluZUF0dGFjaG1lbnRFbGVtZW50IiwiYnVpbGRPcGVuT3V0bGlua0F0dGFjaG1lbnRFbGVtZW50IiwiYnVpbGRPcGVuQXR0YWNobWVudEVsZW1lbnRMaW5rSWNvbiIsInJlbmRlclBhZ2VBdHRhY2htZW50VUkiLCJwYWdlRWwiLCJhdHRhY2htZW50RWwiLCJnZXRBbXBEb2MiLCJ3aW4iLCJpc091dGxpbmsiLCJ0YWdOYW1lIiwiZ2V0QXR0cmlidXRlIiwicmVuZGVyT3V0bGlua1BhZ2VBdHRhY2htZW50VUkiLCJyZW5kZXJJbmxpbmVQYWdlQXR0YWNobWVudFVpIiwicmVuZGVyT2xkUGFnZUF0dGFjaG1lbnRVSSIsIm9wZW5BdHRhY2htZW50RWwiLCJhdHRhY2htZW50SHJlZiIsInNldEF0dHJpYnV0ZSIsInRleHRFbCIsInF1ZXJ5U2VsZWN0b3IiLCJvcGVuTGFiZWxBdHRyIiwib3BlbkxhYmVsIiwidHJpbSIsImdldExvY2FsaXplZFN0cmluZyIsIkFNUF9TVE9SWV9QQUdFX0FUVEFDSE1FTlRfT1BFTl9MQUJFTCIsImF0dGFjaG1lbnRUaXRsZSIsInRleHRDb250ZW50IiwiYW5jaG9yQ2hpbGQiLCJjaGlwRWwiLCJjdGFMYWJlbEVsIiwidGhlbWVBdHRyaWJ1dGUiLCJ0b0xvd2VyQ2FzZSIsIkNVU1RPTSIsInNldEN1c3RvbVRoZW1lU3R5bGVzIiwib3BlbkltZ0F0dHIiLCJjdGFJbWdFbCIsInByZXBlbmQiLCJsaW5rSW1hZ2UiLCJ0aGVtZSIsIkRBUksiLCJhcHBlbmRDaGlsZCIsIm1ha2VJbWdFbFdpdGhCRyIsIm9wZW5JbWdBdHRyMiIsInNyYyIsImFjY2VudENvbG9yIiwiY29udHJhc3RDb2xvciIsIm93bmVyRG9jdW1lbnQiLCJkZWZhdWx0VmlldyIsInN0eWxlcyIsInJnYiJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFRQSxlQUFSO0FBQ0EsU0FBUUMsaUJBQVI7QUFDQSxTQUFRQyxhQUFSLEVBQXVCQyxrQkFBdkI7QUFDQSxTQUFRQyxzQkFBUjtBQUNBLFNBQ0VDLHVCQURGLEVBRUVDLGtCQUZGLEVBR0VDLGlCQUhGO0FBS0EsU0FBUUMsT0FBUixFQUFpQkMsUUFBakI7QUFDQSxTQUFRQyxnQ0FBUjtBQUNBLFNBQVFDLEtBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsZ0JBQWdCLEdBQUc7QUFDdkJDLEVBQUFBLElBQUksRUFBRSxNQURpQjtBQUV2QkMsRUFBQUEsVUFBVSxFQUFFO0FBRlcsQ0FBekI7O0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQU1DLHlCQUF5QixHQUFHLFNBQTVCQSx5QkFBNEIsQ0FBQ0MsT0FBRDtBQUFBLFNBQ3ZDUixPQUFPLENBQUNRLE9BQUQsQ0FEZ0M7QUFBQSxDQUFsQzs7QUFZUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQU1DLGdDQUFnQyxHQUFHLFNBQW5DQSxnQ0FBbUMsQ0FBQ0QsT0FBRDtBQUFBLFNBQzlDUixPQUFPLENBQUNRLE9BQUQsQ0FE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RzlELGFBQWEsQ0FBQ3NCLEdBQUQsRUFBTUYsWUFBTixDQUE1QjtBQUNBLFFBQU0yQyxHQUFHLEdBQUc1RCx1QkFBdUIsQ0FBQzJELE1BQU0sQ0FBQyxrQkFBRCxDQUFQLENBQW5DO0FBQ0FILElBQUFBLGFBQWEsR0FBR3ZELGtCQUFrQixDQUFDMkQsR0FBRCxDQUFsQztBQUNBOUQsSUFBQUEsa0JBQWtCLENBQUNtQixZQUFELEVBQWU7QUFDL0IsMEJBQW9CO0FBRFcsS0FBZixDQUFsQjtBQUdEOztBQUNELE1BQ0VBLFlBQVksQ0FBQ0ssWUFBYixDQUEwQixvQkFBMUIsTUFDQWYsZ0JBQWdCLENBQUNFLFVBRm5CLEVBR0U7QUFDQVgsSUFBQUEsa0JBQWtCLENBQUM0QixnQkFBRCxFQUFtQjtBQUNuQyxrREFBNEM2QixXQURUO0FBRW5DLDRDQUFzQ0M7QUFGSCxLQUFuQixDQUFsQjtBQUlBMUQsSUFBQUEsa0JBQWtCLENBQUNtQixZQUFELEVBQWU7QUFDL0Isa0RBQTRDc0MsV0FEYjtBQUUvQiw0Q0FBc0NDO0FBRlAsS0FBZixDQUFsQjtBQUlELEdBWkQsTUFZTztBQUNMMUQsSUFBQUEsa0JBQWtCLENBQUM0QixnQkFBRCxFQUFtQjtBQUNuQyxrREFBNEM4QixhQURUO0FBRW5DLDRDQUFzQ0Q7QUFGSCxLQUFuQixDQUFsQjtBQUlBekQsSUFBQUEsa0JBQWtCLENBQUNtQixZQUFELEVBQWU7QUFDL0Isa0RBQTRDdUMsYUFEYjtBQUUvQiw0Q0FBc0NEO0FBRlAsS0FBZixDQUFsQjtBQUlEO0FBQ0YsQ0F4Q00iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIxIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEhlbHBlciBmb3IgYW1wLXN0b3J5IHJlbmRlcmluZyBvZiBwYWdlLWF0dGFjaG1lbnQgVUkuXG4gKi9cbmltcG9ydCB7QXR0YWNobWVudFRoZW1lfSBmcm9tICcuL2FtcC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQnO1xuaW1wb3J0IHtMb2NhbGl6ZWRTdHJpbmdJZH0gZnJvbSAnI3NlcnZpY2UvbG9jYWxpemF0aW9uL3N0cmluZ3MnO1xuaW1wb3J0IHtjb21wdXRlZFN0eWxlLCBzZXRJbXBvcnRhbnRTdHlsZXN9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge2dldExvY2FsaXphdGlvblNlcnZpY2V9IGZyb20gJy4vYW1wLXN0b3J5LWxvY2FsaXphdGlvbi1zZXJ2aWNlJztcbmltcG9ydCB7XG4gIGdldFJHQkZyb21Dc3NDb2xvclZhbHVlLFxuICBnZXRUZXh0Q29sb3JGb3JSR0IsXG4gIG1heWJlTWFrZVByb3h5VXJsLFxufSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7aHRtbEZvciwgaHRtbFJlZnN9IGZyb20gJyNjb3JlL2RvbS9zdGF0aWMtdGVtcGxhdGUnO1xuaW1wb3J0IHtpc1BhZ2VBdHRhY2htZW50VWlWMkV4cGVyaW1lbnRPbn0gZnJvbSAnLi9hbXAtc3RvcnktcGFnZS1hdHRhY2htZW50LXVpLXYyJztcbmltcG9ydCB7dG9XaW59IGZyb20gJyNjb3JlL3dpbmRvdyc7XG5cbi8qKlxuICogQGVudW0ge3N0cmluZ31cbiAqL1xuY29uc3QgQ3RhQWNjZW50RWxlbWVudCA9IHtcbiAgVEVYVDogJ3RleHQnLFxuICBCQUNLR1JPVU5EOiAnYmFja2dyb3VuZCcsXG59O1xuXG4vKipcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5leHBvcnQgY29uc3QgYnVpbGRPbGRBdHRhY2htZW50RWxlbWVudCA9IChlbGVtZW50KSA9PlxuICBodG1sRm9yKGVsZW1lbnQpYFxuICAgIDxhIGNsYXNzPVwiXG4gICAgICAgIGktYW1waHRtbC1zdG9yeS1wYWdlLW9wZW4tYXR0YWNobWVudCBpLWFtcGh0bWwtc3Rvcnktc3lzdGVtLXJlc2V0XCJcbiAgICAgICAgcm9sZT1cImJ1dHRvblwiIHRhcmdldD1cIl90b3BcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LXBhZ2Utb3Blbi1hdHRhY2htZW50LWljb25cIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktcGFnZS1vcGVuLWF0dGFjaG1lbnQtYmFyLWxlZnRcIj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LXBhZ2Utb3Blbi1hdHRhY2htZW50LWJhci1yaWdodFwiPjwvc3Bhbj5cbiAgICAgIDwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LXBhZ2Utb3Blbi1hdHRhY2htZW50LWxhYmVsXCI+PC9zcGFuPlxuICAgIDwvYT5gO1xuXG4vKipcbiAqIEZvciBhbXAtc3RvcnktcGFnZS1hdHRhY2htZW50LXVpLXYyLlxuICogTm8gaW1hZ2UgYnkgZGVmYXVsdCwgaWYgaW1hZ2VzIGFyZSBkZWZpbmVkIHRoZXkgYXJlIGFwcGVuZGVkIHRvIHRoZSB0ZW1wbGF0ZS5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5leHBvcnQgY29uc3QgYnVpbGRPcGVuSW5saW5lQXR0YWNobWVudEVsZW1lbnQgPSAoZWxlbWVudCkgPT5cbiAgaHRtbEZvcihlbGVtZW50KWBcbiAgICA8YSBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1wYWdlLW9wZW4tYXR0YWNobWVudCBpLWFtcGh0bWwtc3Rvcnktc3lzdGVtLXJlc2V0IGktYW1waHRtbC1hbXAtc3RvcnktcGFnZS1hdHRhY2htZW50LXVpLXYyXCIgcm9sZT1cImJ1dHRvblwiPlxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbmxpbmUtcGFnZS1hdHRhY2htZW50LWNoaXBcIiByZWY9XCJjaGlwRWxcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbmxpbmUtcGFnZS1hdHRhY2htZW50LWFycm93XCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2E+YDtcblxuLyoqXG4gKiBGb3IgYW1wLXN0b3J5LXBhZ2UtYXR0YWNobWVudC11aS12Mi5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5jb25zdCBidWlsZE9wZW5PdXRsaW5rQXR0YWNobWVudEVsZW1lbnQgPSAoZWxlbWVudCkgPT5cbiAgaHRtbEZvcihlbGVtZW50KWBcbiAgICA8YSBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1wYWdlLW9wZW4tYXR0YWNobWVudCBpLWFtcGh0bWwtYW1wLXN0b3J5LXBhZ2UtYXR0YWNobWVudC11aS12MlwiIHJvbGU9XCJidXR0b25cIiB0YXJnZXQ9XCJfdG9wXCI+XG4gICAgICA8c3ZnIGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LW91dGxpbmstcGFnZS1hdHRhY2htZW50LWFycm93XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjAgOFwiIHdpZHRoPVwiMjBweFwiIGhlaWdodD1cIjhweFwiPjxwYXRoIGQ9XCJNMTgsNy43Yy0wLjIsMC0wLjUtMC4xLTAuNy0wLjJsLTcuMy00bC03LjMsNEMyLDcuOSwxLjEsNy43LDAuNyw2LjljLTAuNC0wLjctMC4xLTEuNiwwLjYtMmw4LTQuNGMwLjUtMC4yLDEtMC4yLDEuNSwwbDgsNC40YzAuNywwLjQsMSwxLjMsMC42LDJDMTksNy40LDE4LjUsNy43LDE4LDcuN3pcIj48L3BhdGg+PC9zdmc+XG4gICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LW91dGxpbmstcGFnZS1hdHRhY2htZW50LW91dGxpbmstY2hpcFwiIHJlZj1cImNoaXBFbFwiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtbGFiZWxcIiByZWY9XCJjdGFMYWJlbEVsXCI+PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgPC9hPmA7XG5cbi8qKlxuICogRm9yIGFtcC1zdG9yeS1wYWdlLWF0dGFjaG1lbnQtdWktdjIuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHshRWxlbWVudH1cbiAqL1xuZXhwb3J0IGNvbnN0IGJ1aWxkT3BlbkF0dGFjaG1lbnRFbGVtZW50TGlua0ljb24gPSAoZWxlbWVudCkgPT5cbiAgaHRtbEZvcihlbGVtZW50KWBcbiAgPHN2ZyBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1wYWdlLW9wZW4tYXR0YWNobWVudC1saW5rLWljb25cIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiPlxuICAgIDxwYXRoIGZpbGwtb3BhY2l0eT1cIi4xXCIgZD1cIk0xMiAwYzYuNiAwIDEyIDUuNCAxMiAxMnMtNS40IDEyLTEyIDEyUzAgMTguNiAwIDEyIDUuNCAwIDEyIDB6XCI+PC9wYXRoPlxuICAgIDxwYXRoIGQ9XCJNMTMuOCAxNC42Yy4xLjEuMi4zLjIuNXMtLjEuMy0uMi41TDEyLjMgMTdjLS43LjctMS43IDEuMS0yLjcgMS4xLTEgMC0xLjktLjQtMi43LTEuMS0uNy0uNy0xLjEtMS43LTEuMS0yLjcgMC0xIC40LTEuOSAxLjEtMi43bDEuNS0xLjVjLjIgMCAuMy0uMS41LS4xcy4zLjEuNS4yYy4xLjEuMi4zLjIuNXMtLjEuNC0uMi41bC0xLjUgMS41Yy0uNS41LS43IDEuMS0uNyAxLjcgMCAuNi4zIDEuMy43IDEuNy41LjUgMS4xLjcgMS43LjdzMS4zLS4zIDEuNy0uN2wxLjUtMS41Yy4zLS4zLjctLjMgMSAwek0xNyA3Yy0uNy0uNy0xLjctMS4xLTIuNy0xLjEtMSAwLTEuOS40LTIuNyAxLjFsLTEuNSAxLjVjMCAuMS0uMS4zLS4xLjQgMCAuMi4xLjMuMi41LjEuMS4zLjIuNS4ycy4zLS4xLjUtLjJsMS41LTEuNWMuNS0uNSAxLjEtLjcgMS43LS43LjYgMCAxLjMuMyAxLjcuNy41LjUuNyAxLjEuNyAxLjcgMCAuNi0uMyAxLjMtLjcgMS43bC0xLjUgMS41Yy0uMS4xLS4yLjMtLjIuNXMuMS4zLjIuNWMuMS4xLjMuMi41LjJzLjMtLjEuNS0uMmwxLjUtMS41Yy43LS43IDEuMS0xLjcgMS4xLTIuNy0uMS0xLS41LTEuOS0xLjItMi42em0tNy45IDcuMmMwIC4yLjEuMy4yLjUuMS4xLjMuMi41LjJzLjQtLjEuNS0uMmw0LjUtNC41Yy4xLS4xLjItLjMuMi0uNXMtLjEtLjQtLjItLjVjLS4zLS4yLS44LS4yLTEgLjFsLTQuNSA0LjVjLS4xLjEtLjIuMy0uMi40elwiPjwvcGF0aD5cbiAgPC9zdmc+YDtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoaWNoIG9wZW4gYXR0YWNobWVudCBVSSB0byByZW5kZXIuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBwYWdlRWxcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGF0dGFjaG1lbnRFbFxuICogQHJldHVybiB7IUVsZW1lbnR9XG4gKi9cbmV4cG9ydCBjb25zdCByZW5kZXJQYWdlQXR0YWNobWVudFVJID0gKHBhZ2VFbCwgYXR0YWNobWVudEVsKSA9PiB7XG4gIGlmIChpc1BhZ2VBdHRhY2htZW50VWlWMkV4cGVyaW1lbnRPbihwYWdlRWwuZ2V0QW1wRG9jKCkud2luKSkge1xuICAgIC8vIE91dGxpbmtzIGNhbiBiZSBhbiBhbXAtc3RvcnktcGFnZS1vdXRsaW5rIG9yIHRoZSBsZWdhY3kgdmVyc2lvbixcbiAgICAvLyBhbiBhbXAtc3RvcnktcGFnZS1hdHRhY2htZW50IHdpdGggYW4gaHJlZi5cbiAgICBjb25zdCBpc091dGxpbmsgPVxuICAgICAgYXR0YWNobWVudEVsLnRhZ05hbWUgPT09ICdBTVAtU1RPUlktUEFHRS1PVVRMSU5LJyB8fFxuICAgICAgYXR0YWNobWVudEVsLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgIGlmIChpc091dGxpbmspIHtcbiAgICAgIHJldHVybiByZW5kZXJPdXRsaW5rUGFnZUF0dGFjaG1lbnRVSShwYWdlRWwsIGF0dGFjaG1lbnRFbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZW5kZXJJbmxpbmVQYWdlQXR0YWNobWVudFVpKHBhZ2VFbCwgYXR0YWNobWVudEVsKTtcbiAgICB9XG4gIH1cbiAgLy8gVGhpcyBjb2RlcGF0aCBjYW4gYmUgcmVtb3ZlZCBhZnRlciBhbXAtc3RvcnktcGFnZS1hdHRhY2htZW50LXVpLXYyIGlzIGxhdW5jaGVkLlxuICByZXR1cm4gcmVuZGVyT2xkUGFnZUF0dGFjaG1lbnRVSShwYWdlRWwsIGF0dGFjaG1lbnRFbCk7XG59O1xuXG4vKipcbiAqIFJlbmRlcnMgZGVmYXVsdCBwYWdlIGF0dGFjaG1lbnQgVUkuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBwYWdlRWxcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGF0dGFjaG1lbnRFbFxuICogQHJldHVybiB7IUVsZW1lbnR9XG4gKi9cbmNvbnN0IHJlbmRlck9sZFBhZ2VBdHRhY2htZW50VUkgPSAocGFnZUVsLCBhdHRhY2htZW50RWwpID0+IHtcbiAgY29uc3Qgb3BlbkF0dGFjaG1lbnRFbCA9IGJ1aWxkT2xkQXR0YWNobWVudEVsZW1lbnQocGFnZUVsKTtcblxuICAvLyBJZiB0aGUgYXR0YWNobWVudCBpcyBhIGxpbmssIGNvcHkgaHJlZiB0byB0aGUgZWxlbWVudCBzbyBpdCBjYW4gYmUgcHJldmlld2VkIG9uIGhvdmVyIGFuZCBsb25nIHByZXNzLlxuICBjb25zdCBhdHRhY2htZW50SHJlZiA9IGF0dGFjaG1lbnRFbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgaWYgKGF0dGFjaG1lbnRIcmVmKSB7XG4gICAgb3BlbkF0dGFjaG1lbnRFbC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBhdHRhY2htZW50SHJlZik7XG4gIH1cblxuICBjb25zdCB0ZXh0RWwgPSBvcGVuQXR0YWNobWVudEVsLnF1ZXJ5U2VsZWN0b3IoXG4gICAgJy5pLWFtcGh0bWwtc3RvcnktcGFnZS1vcGVuLWF0dGFjaG1lbnQtbGFiZWwnXG4gICk7XG5cbiAgY29uc3Qgb3BlbkxhYmVsQXR0ciA9XG4gICAgYXR0YWNobWVudEVsLmdldEF0dHJpYnV0ZSgnY3RhLXRleHQnKSB8fFxuICAgIGF0dGFjaG1lbnRFbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY3RhLXRleHQnKTtcbiAgY29uc3Qgb3BlbkxhYmVsID1cbiAgICAob3BlbkxhYmVsQXR0ciAmJiBvcGVuTGFiZWxBdHRyLnRyaW0oKSkgfHxcbiAgICBnZXRMb2NhbGl6YXRpb25TZXJ2aWNlKHBhZ2VFbCkuZ2V0TG9jYWxpemVkU3RyaW5nKFxuICAgICAgTG9jYWxpemVkU3RyaW5nSWQuQU1QX1NUT1JZX1BBR0VfQVRUQUNITUVOVF9PUEVOX0xBQkVMXG4gICAgKTtcblxuICAvLyBDb3B5IHRpdGxlIHRvIHRoZSBlbGVtZW50IGlmIGl0IGV4aXN0cy5cbiAgY29uc3QgYXR0YWNobWVudFRpdGxlID0gYXR0YWNobWVudEVsLmdldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScpO1xuICBpZiAoYXR0YWNobWVudFRpdGxlKSB7XG4gICAgb3BlbkF0dGFjaG1lbnRFbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgYXR0YWNobWVudFRpdGxlKTtcbiAgfVxuXG4gIHRleHRFbC50ZXh0Q29udGVudCA9IG9wZW5MYWJlbDtcblxuICByZXR1cm4gb3BlbkF0dGFjaG1lbnRFbDtcbn07XG5cbi8qKlxuICogUmVuZGVycyBpbmxpbmUgcGFnZSBhdHRhY2htZW50IFVJLlxuICogQHBhcmFtIHshRWxlbWVudH0gcGFnZUVsXG4gKiBAcGFyYW0geyFFbGVtZW50fSBhdHRhY2htZW50RWxcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5jb25zdCByZW5kZXJPdXRsaW5rUGFnZUF0dGFjaG1lbnRVSSA9IChwYWdlRWwsIGF0dGFjaG1lbnRFbCkgPT4ge1xuICBjb25zdCBvcGVuQXR0YWNobWVudEVsID0gYnVpbGRPcGVuT3V0bGlua0F0dGFjaG1lbnRFbGVtZW50KHBhZ2VFbCk7XG5cbiAgLy8gYW1wLXN0b3J5LXBhZ2Utb3V0bGluayByZXF1aXJlcyBhbiBhbmNob3IgZWxlbWVudCBjaGlsZCBmb3IgU0VPIGFuZCBhbmFseXRpY3Mgb3B0aW1pc2F0aW9ucy5cbiAgLy8gYW1wLXN0b3J5LXBhZ2UtYXR0YWNobWVudCB1c2VzIHRoaXMgc2FtZSBjb2RlcGF0aCBhbmQgYWxsb3dzIGFuIGhyZWYgYXR0cmlidXRlLlxuICAvLyBUaGlzIGlzIGhpZGRlbiB3aXRoIGNzcy4gQ2xpY2tzIGFyZSBzaW11bGF0ZWQgZnJvbSBpdCB3aGVuIGEgcmVtb3RlIGF0dGFjaG1lbnQgaXMgY2xpY2tlZC5cbiAgY29uc3QgYW5jaG9yQ2hpbGQgPSBwYWdlRWxcbiAgICAucXVlcnlTZWxlY3RvcignYW1wLXN0b3J5LXBhZ2Utb3V0bGluaycpXG4gICAgPy5xdWVyeVNlbGVjdG9yKCdhJyk7XG5cbiAgLy8gQ29weSBocmVmIHRvIHRoZSBlbGVtZW50IHNvIGl0IGNhbiBiZSBwcmV2aWV3ZWQgb24gaG92ZXIgYW5kIGxvbmcgcHJlc3MuXG4gIGNvbnN0IGF0dGFjaG1lbnRIcmVmID1cbiAgICBhbmNob3JDaGlsZD8uZ2V0QXR0cmlidXRlKCdocmVmJykgfHwgYXR0YWNobWVudEVsLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICBpZiAoYXR0YWNobWVudEhyZWYpIHtcbiAgICBvcGVuQXR0YWNobWVudEVsLnNldEF0dHJpYnV0ZSgnaHJlZicsIGF0dGFjaG1lbnRIcmVmKTtcbiAgfVxuXG4gIC8vIENvcHkgdGl0bGUgdG8gdGhlIGVsZW1lbnQgaWYgaXQgZXhpc3RzLlxuICBjb25zdCBhdHRhY2htZW50VGl0bGUgPVxuICAgIGFuY2hvckNoaWxkPy5nZXRBdHRyaWJ1dGUoJ3RpdGxlJykgfHwgYXR0YWNobWVudEVsLmdldEF0dHJpYnV0ZSgndGl0bGUnKTtcbiAgaWYgKGF0dGFjaG1lbnRUaXRsZSkge1xuICAgIG9wZW5BdHRhY2htZW50RWwuc2V0QXR0cmlidXRlKCd0aXRsZScsIGF0dGFjaG1lbnRUaXRsZSk7XG4gIH1cblxuICAvLyBHZXQgZWxlbWVudHMuXG4gIGNvbnN0IHtjaGlwRWwsIGN0YUxhYmVsRWx9ID0gaHRtbFJlZnMob3BlbkF0dGFjaG1lbnRFbCk7XG5cbiAgLy8gU2V0IHRoZW1lLlxuICBsZXQgdGhlbWVBdHRyaWJ1dGUgPSBhdHRhY2htZW50RWwuZ2V0QXR0cmlidXRlKCd0aGVtZScpO1xuICBpZiAodGhlbWVBdHRyaWJ1dGUpIHtcbiAgICB0aGVtZUF0dHJpYnV0ZSA9IHRoZW1lQXR0cmlidXRlLnRvTG93ZXJDYXNlKCk7XG4gIH1cbiAgb3BlbkF0dGFjaG1lbnRFbC5zZXRBdHRyaWJ1dGUoJ3RoZW1lJywgdGhlbWVBdHRyaWJ1dGUpO1xuXG4gIGlmICh0aGVtZUF0dHJpYnV0ZSA9PT0gQXR0YWNobWVudFRoZW1lLkNVU1RPTSkge1xuICAgIHNldEN1c3RvbVRoZW1lU3R5bGVzKGF0dGFjaG1lbnRFbCwgb3BlbkF0dGFjaG1lbnRFbCk7XG4gIH1cblxuICAvLyBBcHBlbmQgdGV4dCAmIGFyaWEtbGFiZWwuXG4gIGNvbnN0IG9wZW5MYWJlbEF0dHIgPVxuICAgIGFuY2hvckNoaWxkPy50ZXh0Q29udGVudCB8fFxuICAgIGF0dGFjaG1lbnRFbC5nZXRBdHRyaWJ1dGUoJ2N0YS10ZXh0JykgfHxcbiAgICBhdHRhY2htZW50RWwuZ2V0QXR0cmlidXRlKCdkYXRhLWN0YS10ZXh0Jyk7XG4gIGNvbnN0IG9wZW5MYWJlbCA9IG9wZW5MYWJlbEF0dHJcbiAgICA/IG9wZW5MYWJlbEF0dHIudHJpbSgpXG4gICAgOiBnZXRMb2NhbGl6YXRpb25TZXJ2aWNlKHBhZ2VFbCkuZ2V0TG9jYWxpemVkU3RyaW5nKFxuICAgICAgICBMb2NhbGl6ZWRTdHJpbmdJZC5BTVBfU1RPUllfUEFHRV9BVFRBQ0hNRU5UX09QRU5fTEFCRUxcbiAgICAgICk7XG4gIGN0YUxhYmVsRWwudGV4dENvbnRlbnQgPSBvcGVuTGFiZWw7XG4gIG9wZW5BdHRhY2htZW50RWwuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgb3BlbkxhYmVsKTtcblxuICAvLyBTZXQgaW1hZ2UuXG4gIGNvbnN0IG9wZW5JbWdBdHRyID0gYXR0YWNobWVudEVsLmdldEF0dHJpYnV0ZSgnY3RhLWltYWdlJyk7XG4gIGlmIChvcGVuSW1nQXR0ciAmJiBvcGVuSW1nQXR0ciAhPT0gJ25vbmUnKSB7XG4gICAgY29uc3QgY3RhSW1nRWwgPSBodG1sRm9yKGNoaXBFbClgXG4gICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LW91dGxpbmstcGFnZS1hdHRhY2htZW50LWltZ1wiPjwvZGl2PmA7XG4gICAgc2V0SW1wb3J0YW50U3R5bGVzKGN0YUltZ0VsLCB7XG4gICAgICAnYmFja2dyb3VuZC1pbWFnZSc6ICd1cmwoJyArIG9wZW5JbWdBdHRyICsgJyknLFxuICAgIH0pO1xuICAgIGNoaXBFbC5wcmVwZW5kKGN0YUltZ0VsKTtcbiAgfSBlbHNlIGlmICghb3BlbkltZ0F0dHIpIHtcbiAgICAvLyBBdHRhY2ggbGluayBpY29uIFNWRyBieSBkZWZhdWx0LlxuICAgIGNvbnN0IGxpbmtJbWFnZSA9IGJ1aWxkT3BlbkF0dGFjaG1lbnRFbGVtZW50TGlua0ljb24oYXR0YWNobWVudEVsKTtcbiAgICBjaGlwRWwucHJlcGVuZChsaW5rSW1hZ2UpO1xuICB9XG5cbiAgcmV0dXJuIG9wZW5BdHRhY2htZW50RWw7XG59O1xuXG4vKipcbiAqIFJlbmRlcnMgaW5saW5lIHBhZ2UgYXR0YWNobWVudCBVSS5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IHBhZ2VFbFxuICogQHBhcmFtIHshRWxlbWVudH0gYXR0YWNobWVudEVsXG4gKiBAcmV0dXJuIHshRWxlbWVudH1cbiAqL1xuY29uc3QgcmVuZGVySW5saW5lUGFnZUF0dGFjaG1lbnRVaSA9IChwYWdlRWwsIGF0dGFjaG1lbnRFbCkgPT4ge1xuICBjb25zdCBvcGVuQXR0YWNobWVudEVsID0gYnVpbGRPcGVuSW5saW5lQXR0YWNobWVudEVsZW1lbnQocGFnZUVsKTtcblxuICAvLyBTZXQgdGhlbWUuXG4gIGNvbnN0IHRoZW1lID0gYXR0YWNobWVudEVsLmdldEF0dHJpYnV0ZSgndGhlbWUnKTtcbiAgaWYgKHRoZW1lICYmIEF0dGFjaG1lbnRUaGVtZS5EQVJLID09PSB0aGVtZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgb3BlbkF0dGFjaG1lbnRFbC5zZXRBdHRyaWJ1dGUoJ3RoZW1lJywgQXR0YWNobWVudFRoZW1lLkRBUkspO1xuICB9XG5cbiAgLy8gQXBwZW5kIHRleHQgJiBhcmlhLWxhYmVsIGlmIGRlZmluZWQuXG4gIGNvbnN0IG9wZW5MYWJlbEF0dHIgPVxuICAgIGF0dGFjaG1lbnRFbC5nZXRBdHRyaWJ1dGUoJ2N0YS10ZXh0JykgfHxcbiAgICBhdHRhY2htZW50RWwuZ2V0QXR0cmlidXRlKCdkYXRhLWN0YS10ZXh0Jyk7XG4gIGNvbnN0IG9wZW5MYWJlbCA9XG4gICAgKG9wZW5MYWJlbEF0dHIgJiYgb3BlbkxhYmVsQXR0ci50cmltKCkpIHx8XG4gICAgZ2V0TG9jYWxpemF0aW9uU2VydmljZShwYWdlRWwpLmdldExvY2FsaXplZFN0cmluZyhcbiAgICAgIExvY2FsaXplZFN0cmluZ0lkLkFNUF9TVE9SWV9QQUdFX0FUVEFDSE1FTlRfT1BFTl9MQUJFTFxuICAgICk7XG4gIG9wZW5BdHRhY2htZW50RWwuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgb3BlbkxhYmVsKTtcblxuICBpZiAob3BlbkxhYmVsICE9PSAnbm9uZScpIHtcbiAgICBjb25zdCB0ZXh0RWwgPSBodG1sRm9yKG9wZW5BdHRhY2htZW50RWwpYFxuICAgICAgPHNwYW4gY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktcGFnZS1hdHRhY2htZW50LWxhYmVsXCI+PC9zcGFuPmA7XG4gICAgdGV4dEVsLnRleHRDb250ZW50ID0gb3BlbkxhYmVsO1xuICAgIG9wZW5BdHRhY2htZW50RWwuYXBwZW5kQ2hpbGQodGV4dEVsKTtcbiAgfVxuXG4gIC8vIEFkZCBpbWFnZXMgaWYgdGhleSBhcmUgZGVmaW5lZC5cbiAgY29uc3Qge2NoaXBFbH0gPSBodG1sUmVmcyhvcGVuQXR0YWNobWVudEVsKTtcbiAgY29uc3QgbWFrZUltZ0VsV2l0aEJHID0gKG9wZW5JbWdBdHRyKSA9PiB7XG4gICAgY29uc3QgY3RhSW1nRWwgPSBodG1sRm9yKGNoaXBFbClgXG4gICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWlubGluZS1wYWdlLWF0dGFjaG1lbnQtaW1nXCI+PC9kaXY+YDtcbiAgICBzZXRJbXBvcnRhbnRTdHlsZXMoY3RhSW1nRWwsIHtcbiAgICAgICdiYWNrZ3JvdW5kLWltYWdlJzogJ3VybCgnICsgb3BlbkltZ0F0dHIgKyAnKScsXG4gICAgfSk7XG4gICAgcmV0dXJuIGN0YUltZ0VsO1xuICB9O1xuXG4gIGNvbnN0IG9wZW5JbWdBdHRyMiA9IGF0dGFjaG1lbnRFbC5nZXRBdHRyaWJ1dGUoJ2N0YS1pbWFnZS0yJyk7XG4gIGlmIChvcGVuSW1nQXR0cjIpIHtcbiAgICBjb25zdCBzcmMgPSBtYXliZU1ha2VQcm94eVVybChvcGVuSW1nQXR0cjIsIHBhZ2VFbC5nZXRBbXBEb2MoKSk7XG4gICAgY2hpcEVsLnByZXBlbmQobWFrZUltZ0VsV2l0aEJHKHNyYykpO1xuICB9XG5cbiAgY29uc3Qgb3BlbkltZ0F0dHIgPSBhdHRhY2htZW50RWwuZ2V0QXR0cmlidXRlKCdjdGEtaW1hZ2UnKTtcbiAgaWYgKG9wZW5JbWdBdHRyKSB7XG4gICAgY29uc3Qgc3JjID0gbWF5YmVNYWtlUHJveHlVcmwob3BlbkltZ0F0dHIsIHBhZ2VFbC5nZXRBbXBEb2MoKSk7XG4gICAgY2hpcEVsLnByZXBlbmQobWFrZUltZ0VsV2l0aEJHKHNyYykpO1xuICB9XG5cbiAgcmV0dXJuIG9wZW5BdHRhY2htZW50RWw7XG59O1xuXG4vKipcbiAqIFNldHMgY3VzdG9tIHRoZW1lIGF0dHJpYnV0ZXMuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBhdHRhY2htZW50RWxcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IG9wZW5BdHRhY2htZW50RWxcbiAqL1xuZXhwb3J0IGNvbnN0IHNldEN1c3RvbVRoZW1lU3R5bGVzID0gKGF0dGFjaG1lbnRFbCwgb3BlbkF0dGFjaG1lbnRFbCkgPT4ge1xuICBjb25zdCBhY2NlbnRDb2xvciA9IGF0dGFjaG1lbnRFbC5nZXRBdHRyaWJ1dGUoJ2N0YS1hY2NlbnQtY29sb3InKTtcblxuICAvLyBDYWxjdWxhdGluZyBjb250cmFzdCBjb2xvciAoYmxhY2sgb3Igd2hpdGUpIG5lZWRlZCBmb3Igb3V0bGluayBDVEEgVUkuXG4gIGxldCBjb250cmFzdENvbG9yID0gbnVsbDtcbiAgaWYgKGFjY2VudENvbG9yKSB7XG4gICAgc2V0SW1wb3J0YW50U3R5bGVzKGF0dGFjaG1lbnRFbCwge1xuICAgICAgJ2JhY2tncm91bmQtY29sb3InOiBhdHRhY2htZW50RWwuZ2V0QXR0cmlidXRlKCdjdGEtYWNjZW50LWNvbG9yJyksXG4gICAgfSk7XG5cbiAgICBjb25zdCB3aW4gPSB0b1dpbihhdHRhY2htZW50RWwub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldyk7XG4gICAgY29uc3Qgc3R5bGVzID0gY29tcHV0ZWRTdHlsZSh3aW4sIGF0dGFjaG1lbnRFbCk7XG4gICAgY29uc3QgcmdiID0gZ2V0UkdCRnJvbUNzc0NvbG9yVmFsdWUoc3R5bGVzWydiYWNrZ3JvdW5kLWNvbG9yJ10pO1xuICAgIGNvbnRyYXN0Q29sb3IgPSBnZXRUZXh0Q29sb3JGb3JSR0IocmdiKTtcbiAgICBzZXRJbXBvcnRhbnRTdHlsZXMoYXR0YWNobWVudEVsLCB7XG4gICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcnLFxuICAgIH0pO1xuICB9XG4gIGlmIChcbiAgICBhdHRhY2htZW50RWwuZ2V0QXR0cmlidXRlKCdjdGEtYWNjZW50LWVsZW1lbnQnKSA9PT1cbiAgICBDdGFBY2NlbnRFbGVtZW50LkJBQ0tHUk9VTkRcbiAgKSB7XG4gICAgc2V0SW1wb3J0YW50U3R5bGVzKG9wZW5BdHRhY2htZW50RWwsIHtcbiAgICAgICctLWktYW1waHRtbC1vdXRsaW5rLWN0YS1iYWNrZ3JvdW5kLWNvbG9yJzogYWNjZW50Q29sb3IsXG4gICAgICAnLS1pLWFtcGh0bWwtb3V0bGluay1jdGEtdGV4dC1jb2xvcic6IGNvbnRyYXN0Q29sb3IsXG4gICAgfSk7XG4gICAgc2V0SW1wb3J0YW50U3R5bGVzKGF0dGFjaG1lbnRFbCwge1xuICAgICAgJy0taS1hbXBodG1sLW91dGxpbmstY3RhLWJhY2tncm91bmQtY29sb3InOiBhY2NlbnRDb2xvcixcbiAgICAgICctLWktYW1waHRtbC1vdXRsaW5rLWN0YS10ZXh0LWNvbG9yJzogY29udHJhc3RDb2xvcixcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBzZXRJbXBvcnRhbnRTdHlsZXMob3BlbkF0dGFjaG1lbnRFbCwge1xuICAgICAgJy0taS1hbXBodG1sLW91dGxpbmstY3RhLWJhY2tncm91bmQtY29sb3InOiBjb250cmFzdENvbG9yLFxuICAgICAgJy0taS1hbXBodG1sLW91dGxpbmstY3RhLXRleHQtY29sb3InOiBhY2NlbnRDb2xvcixcbiAgICB9KTtcbiAgICBzZXRJbXBvcnRhbnRTdHlsZXMoYXR0YWNobWVudEVsLCB7XG4gICAgICAnLS1pLWFtcGh0bWwtb3V0bGluay1jdGEtYmFja2dyb3VuZC1jb2xvcic6IGNvbnRyYXN0Q29sb3IsXG4gICAgICAnLS1pLWFtcGh0bWwtb3V0bGluay1jdGEtdGV4dC1jb2xvcic6IGFjY2VudENvbG9yLFxuICAgIH0pO1xuICB9XG59O1xuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-open-page-attachment.js