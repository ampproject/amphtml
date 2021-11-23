import * as Preact from '#core/dom/jsx';
/**
 * @fileoverview Helper for amp-story rendering of page-attachment UI.
 */
import {AttachmentTheme} from './amp-story-page-attachment';
import {LocalizedStringId_Enum} from '#service/localization/strings';
import {computedStyle, setImportantStyles} from '#core/dom/style';
import {dev} from '#utils/log';
import {localize} from './amp-story-localization-service';
import {
  getRGBFromCssColorValue,
  getTextColorForRGB,
  maybeMakeProxyUrl,
} from './utils';
import {getWin} from '#core/window';
import {scopedQuerySelector} from '#core/dom/query';

/**
 * @enum {string}
 */
const CtaAccentElement = {
  TEXT: 'text',
  BACKGROUND: 'background',
};

const renderOutlinkAttachmentArrow = () => (
  <svg
    class="i-amphtml-story-outlink-page-attachment-arrow"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 8"
    width="20px"
    height="8px"
  >
    <path d="M18,7.7c-0.2,0-0.5-0.1-0.7-0.2l-7.3-4l-7.3,4C2,7.9,1.1,7.7,0.7,6.9c-0.4-0.7-0.1-1.6,0.6-2l8-4.4c0.5-0.2,1-0.2,1.5,0l8,4.4c0.7,0.4,1,1.3,0.6,2C19,7.4,18.5,7.7,18,7.7z"></path>
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
 * @return {!Element}
 */
export const renderPageAttachmentUI = (pageEl, attachmentEl) => {
  // Outlinks can be an amp-story-page-outlink or the legacy version,
  // an amp-story-page-attachment with an href.
  const isOutlink =
    attachmentEl.tagName === 'AMP-STORY-PAGE-OUTLINK' ||
    attachmentEl.getAttribute('href');
  const element = isOutlink
    ? renderOutlinkUI(pageEl, attachmentEl)
    : renderInlineUi(pageEl, attachmentEl);
  // This ensures `active` is set on first render.
  // Otherwise setState may be called before this.openAttachmentEl_ exists.
  element.toggleAttribute('active', pageEl.hasAttribute('active'));
  return element;
};

const ctaLabelFromAttr = (element) =>
  // For legacy support of amp-story-page-attachment with a src and cta-text attribute.
  element.getAttribute('cta-text') || element.getAttribute('data-cta-text');

const openLabelOrFallback = (element, label) =>
  label?.trim() ||
  localize(
    element,
    LocalizedStringId_Enum.AMP_STORY_PAGE_ATTACHMENT_OPEN_LABEL
  );

/**
 * Renders inline page attachment UI.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
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

  const openLabel = openLabelOrFallback(
    anchorChild?.textContent || ctaLabelFromAttr(attachmentEl)
  );

  // Set image.
  const openImgAttr = attachmentEl.getAttribute('cta-image');
  const openImg =
    openImgAttr && openImgAttr !== 'none' ? (
      <div
        class="i-amphtml-story-outlink-page-attachment-img"
        style={{
          'background-image': 'url(' + openImgAttr + ') !important',
        }}
      ></div>
    ) : (
      renderOutlinkLinkIconElement()
    );

  const openAttachmentEl = (
    <a
      class="i-amphtml-story-page-open-attachment"
      role="button"
      target="_top"
      title={attachmentTitle}
      theme={theme}
      aria-label={openLabel}
    >
      {renderOutlinkAttachmentArrow()}
      <div class="i-amphtml-story-outlink-page-attachment-outlink-chip">
        {openImg}
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
};

/**
 * Renders inline page attachment UI.
 * @param {!Element} pageEl
 * @param {!Element} attachmentEl
 * @return {!Element}
 */
const renderInlineUi = (pageEl, attachmentEl) => {
  const makeImgElWithBG = (openImgAttr) => {
    if (!openImgAttr) {
      return null;
    }
    const proxied = maybeMakeProxyUrl(openImgAttr, pageEl.getAmpDoc());
    return (
      <div
        class="i-amphtml-story-inline-page-attachment-img"
        style={{'background-image': 'url(' + proxied + ') !important'}}
      ></div>
    );
  };

  const theme = attachmentEl.getAttribute('theme');
  const openLabel = openLabelOrFallback(ctaLabelFromAttr(attachmentEl));

  return (
    <a
      class="i-amphtml-story-page-open-attachment i-amphtml-story-system-reset"
      role="button"
      theme={
        AttachmentTheme.DARK === theme?.toLowerCase()
          ? AttachmentTheme.DARK
          : null
      }
      aria-label={openLabel}
    >
      <div class="i-amphtml-story-inline-page-attachment-chip">
        {makeImgElWithBG(attachmentEl.getAttribute('cta-image-2'))}
        {makeImgElWithBG(attachmentEl.getAttribute('cta-image'))}
        <div class="i-amphtml-story-inline-page-attachment-arrow"></div>
      </div>
      {openLabel !== 'none' && (
        <span class="i-amphtml-story-page-attachment-label">{openLabel}</span>
      )}
    </a>
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
