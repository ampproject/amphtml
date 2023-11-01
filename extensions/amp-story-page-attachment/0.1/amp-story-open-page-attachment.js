/**
 * @fileoverview Helper for amp-story rendering of page-attachment UI.
 */
import objStr from 'obj-str';

import * as Preact from '#core/dom/jsx';
import {scopedQuerySelector} from '#core/dom/query';
import {computedStyle, setImportantStyles} from '#core/dom/style';
import {getWin} from '#core/window';

import {getExperimentBranch} from '#experiments';
import {StoryAdSegmentExp} from '#experiments/story-ad-progress-segment';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {dev} from '#utils/log';

import {
  getRGBFromCssColorValue,
  getTextColorForRGB,
  maybeMakeProxyUrl,
} from '../../amp-story/1.0/utils';

/**
 * @enum {string}
 */
const CtaAccentElement = {
  TEXT: 'text',
  BACKGROUND: 'background',
};

/**
 * @enum {string}
 */
export const AttachmentTheme = {
  LIGHT: 'light', // default
  DARK: 'dark',
  CUSTOM: 'custom',
};

const renderOutlinkAttachmentArrow = () => (
  <svg
    class="i-amphtml-story-outlink-page-attachment-arrow"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 8"
    width="20px"
    height="8px"
  >
    <path d="m18 7.7-.7-.2-7.3-4-7.3 4c-.7.4-1.6.2-2-.6-.4-.7-.1-1.6.6-2l8-4.4a2 2 0 0 1 1.5 0l8 4.4c.7.4 1 1.3.6 2-.4.5-.9.8-1.4.8z" />
  </svg>
);

/**
 * Link icon used in amp-story-page-outlink UI and drawer.
 * @return {!Element}
 */
export const renderOutlinkLinkIconElement = () => (
  <svg
    class="i-amphtml-story-page-open-attachment-link-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <path
      fill-opacity=".1"
      d="M12 0c6.6 0 12 5.4 12 12s-5.4 12-12 12S0 18.6 0 12 5.4 0 12 0z"
    />
    <path d="m13.8 14.6.2.5-.2.5-1.5 1.4c-.7.7-1.7 1.1-2.7 1.1A4 4 0 0 1 6.9 17a3.9 3.9 0 0 1-1.1-2.7 4 4 0 0 1 1.1-2.7l1.5-1.5.5-.1.5.2.2.5-.2.5-1.5 1.5c-.5.5-.7 1.1-.7 1.7 0 .6.3 1.3.7 1.7.5.5 1.1.7 1.7.7s1.3-.3 1.7-.7l1.5-1.5c.3-.3.7-.3 1 0zM17 7a3.9 3.9 0 0 0-2.7-1.1A4 4 0 0 0 11.6 7l-1.5 1.5-.1.4.2.5.5.2.5-.2 1.5-1.5c.5-.5 1.1-.7 1.7-.7.6 0 1.3.3 1.7.7.5.5.7 1.1.7 1.7 0 .6-.3 1.3-.7 1.7l-1.5 1.5-.2.5.2.5.5.2.5-.2 1.5-1.5c.7-.7 1.1-1.7 1.1-2.7-.1-1-.5-1.9-1.2-2.6zm-7.9 7.2.2.5.5.2.5-.2 4.5-4.5.2-.5-.2-.5c-.3-.2-.8-.2-1 .1l-4.5 4.5-.2.4z" />
  </svg>
);

/**
 * Determines which open attachment UI to render.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Promise<Element>}
 */
export const renderPageAttachmentUI = (pageEl, attachmentEl) => {
  // Outlinks can be an amp-story-page-outlink or the legacy version,
  // an amp-story-page-attachment with an href.
  const isOutlink =
    attachmentEl.tagName === 'AMP-STORY-PAGE-OUTLINK' ||
    attachmentEl.getAttribute('href');
  if (isOutlink) {
    return renderOutlinkUI(pageEl, attachmentEl);
  } else {
    return renderInlineUi(pageEl, attachmentEl);
  }
};

/**
 * @param {!Element} element
 * @return {?string}
 */
const ctaLabelFromAttr = (element) =>
  // For legacy support of amp-story-page-attachment with a src and cta-text attribute.
  element.getAttribute('cta-text') || element.getAttribute('data-cta-text');

/**
 * @param {!Element} element
 * @param {?string} label
 * @return {!Promise<string>}
 */
const openLabelOrFallback = (element, label) => {
  // Disallow empty label
  if (label) {
    const trimmedLabel = label.trim();
    if (trimmedLabel) {
      return Promise.resolve(trimmedLabel);
    }
  }

  const localizationService = Services.localizationForDoc(element);
  return localizationService.getLocalizedStringAsync(
    LocalizedStringId_Enum.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL
  );
};

/**
 * Renders inline page attachment UI.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Promise<Element>}
 */
const renderOutlinkUI = (pageEl, attachmentEl) => {
  // amp-story-page-outlink requires an anchor element child for SEO and analytics optimisations.
  // amp-story-page-attachment uses this same codepath and allows an href attribute.
  // This is hidden with css. Clicks are simulated from it when a remote attachment is clicked.
  const anchorChild = scopedQuerySelector(pageEl, 'amp-story-page-outlink a');

  // Copy title to the element if it exists.
  const attachmentTitle =
    anchorChild?.getAttribute('title') ||
    attachmentEl.getAttribute('data-title');

  const theme = attachmentEl.getAttribute('theme')?.toLowerCase();

  // Set image.
  const openImgAttr = attachmentEl.getAttribute('cta-image');

  const noAnimation =
    getExperimentBranch(getWin(pageEl), 'story-ad-auto-advance') ==
    StoryAdSegmentExp.AUTO_ADVANCE_NEW_CTA_NOT_ANIMATED;

  return openLabelOrFallback(
    pageEl,
    anchorChild?.textContent || ctaLabelFromAttr(attachmentEl)
  ).then((openLabel) => {
    const openAttachmentEl = (
      <a
        class={objStr({
          'i-amphtml-story-page-open-attachment': true,
          'i-amphtml-story-page-open-attachment-outlink': true,
          'i-amphtml-story-page-open-attachment-outlink-no-animation-exp':
            noAnimation,
        })}
        role="button"
        target="_top"
        title={attachmentTitle}
        theme={theme}
        aria-label={openLabel}
      >
        {renderOutlinkAttachmentArrow()}
        <div class="i-amphtml-story-outlink-page-attachment-outlink-chip">
          {openImgAttr && openImgAttr !== 'none' ? (
            <div
              class="i-amphtml-story-outlink-page-attachment-img"
              style={{backgroundImage: `url(${openImgAttr}) !important`}}
            ></div>
          ) : openImgAttr ? null : (
            renderOutlinkLinkIconElement()
          )}
          <span class="i-amphtml-story-page-attachment-label">{openLabel}</span>
        </div>
      </a>
    );

    if (theme === AttachmentTheme.CUSTOM) {
      setCustomThemeStyles(attachmentEl, openAttachmentEl);
    }

    // Copy href to the element so it can be previewed on hover and long press.
    const attachmentHref =
      anchorChild?.getAttribute('href') || attachmentEl.getAttribute('href');
    if (attachmentHref) {
      openAttachmentEl.setAttribute('href', attachmentHref);
    }
    return openAttachmentEl;
  });
};

/**
 * Renders inline page attachment UI.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
const renderInlineUi = (pageEl, attachmentEl) => {
  const makeImgElWithBG = (attr) => {
    const url = attachmentEl.getAttribute(attr);
    if (!url) {
      return;
    }
    const proxied = maybeMakeProxyUrl(url, pageEl.getAmpDoc());
    return (
      <div
        class="i-amphtml-story-inline-page-attachment-img"
        style={{backgroundImage: `url(${proxied}) !important`}}
      ></div>
    );
  };

  const theme = attachmentEl.getAttribute('theme')?.toLowerCase();

  return openLabelOrFallback(pageEl, ctaLabelFromAttr(attachmentEl)).then(
    (openLabel) => (
      <a
        class="i-amphtml-story-page-open-attachment i-amphtml-story-page-open-attachment-inline"
        role="button"
        theme={AttachmentTheme.DARK === theme && theme}
        aria-label={openLabel}
      >
        <div class="i-amphtml-story-inline-page-attachment-chip">
          {makeImgElWithBG('cta-image')}
          {makeImgElWithBG('cta-image-2')}
          <div class="i-amphtml-story-inline-page-attachment-arrow"></div>
        </div>
        {openLabel !== 'none' && (
          <span class="i-amphtml-story-page-attachment-label">{openLabel}</span>
        )}
      </a>
    )
  );
};

/**
 * Sets custom theme attributes.
 * @param {!Element} attachmentEl
 * @param {!Element} openAttachmentEl
 */
export const setCustomThemeStyles = (attachmentEl, openAttachmentEl) => {
  if (!attachmentEl.hasAttribute('cta-accent-color')) {
    dev().warn(
      'AMP-STORY-PAGE-OUTLINK',
      'No cta-accent-color attribute found.'
    );
  }

  const accentColor =
    attachmentEl.getAttribute('cta-accent-color') || '#000000';

  // Calculating contrast color (black or white) needed for outlink CTA UI.
  let contrastColor = null;
  setImportantStyles(attachmentEl, {
    'background-color': accentColor,
  });

  const win = getWin(attachmentEl);
  const styles = computedStyle(win, attachmentEl);
  const rgb = getRGBFromCssColorValue(styles['background-color']);
  contrastColor = getTextColorForRGB(rgb);
  setImportantStyles(attachmentEl, {
    'background-color': '',
  });
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
