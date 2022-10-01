import {createElementWithAttributes, escapeHtml} from '#core/dom';

import {getFieSafeScriptSrcs} from '../../../src/friendly-iframe-embed';

// If making changes also change ALLOWED_FONT_REGEX in head-validation.js
/** @const {string} */
const fontProviderAllowList = [
  'https://cdn.materialdesignicons.com',
  'https://cloud.typography.com',
  'https://fast.fonts.net',
  'https://fonts.googleapis.com',
  'https://maxcdn.bootstrapcdn.com',
  'https://p.typekit.net',
  'https://pro.fontawesome.com',
  'https://use.fontawesome.com',
  'https://use.typekit.net',
].join(' ');

/** @const {string} */
const sandboxVals =
  'allow-forms ' +
  'allow-popups ' +
  'allow-popups-to-escape-sandbox ' +
  'allow-same-origin ' +
  'allow-scripts ' +
  'allow-top-navigation';

const TOKEN_VALUE_1P =
  'AlbC5LKqHkvdIY45O3/1Js/EyRmwSjb4wyp3XZy8KbMWhfMknydD4Wx9K9GyEIdG3ojUlZOdpdbX340wPHpYfQoAAABweyJvcmlnaW4iOiJodHRwczovL2FtcHByb2plY3Qub3JnOjQ0MyIsImZlYXR1cmUiOiJDb252ZXJzaW9uTWVhc3VyZW1lbnQiLCJleHBpcnkiOjE2NDMxNTUxOTksImlzU3ViZG9tYWluIjp0cnVlfQ==';

/**
 * Create the starting html for all FIE ads. If streaming is supported body will be
 * piped in later.
 * @param {string} url
 * @param {string} sanitizedHeadElements
 * @param {string} body
 * @return {string}
 */
export const createSecureDocSkeleton = (url, sanitizedHeadElements, body) =>
  `<!DOCTYPE html>
  <html ⚡4ads lang="en">
  <head>
    <base href="${escapeHtml(url)}">
    <meta charset="UTF-8">
    <meta http-equiv=Content-Security-Policy content="
      img-src * data:;
      media-src *;
      font-src *;
      connect-src *;
      script-src ${getFieSafeScriptSrcs()};
      object-src 'none';
      child-src 'none';
      default-src 'none';
      style-src ${fontProviderAllowList} 'unsafe-inline';
    ">
    <meta http-equiv="origin-trial" content=${TOKEN_VALUE_1P}>    
    ${sanitizedHeadElements}
  </head>
  <body>${body}</body>
  </html>`;

/**
 * Create iframe with predefined CSP and sandbox attributes for security.
 * @param {!Window} win
 * @param {string} title
 * @param {string} height
 * @param {string} width
 * @return {!HTMLIFrameElement}
 */
export function createSecureFrame(win, title, height, width) {
  const {document} = win;
  const iframe = /** @type {!HTMLIFrameElement} */ (
    createElementWithAttributes(document, 'iframe', {
      // NOTE: It is possible for either width or height to be 'auto',
      // a non-numeric value.
      'height': height,
      'width': width,
      'title': title,
      'frameborder': '0',
      'allowfullscreen': '',
      'allowtransparency': '',
      'scrolling': 'no',
      'sandbox': sandboxVals,
      'role': 'region',
      'aria-label': 'Advertisement',
      'tabindex': '0',
    })
  );

  if (isAttributionReportingSupported(document)) {
    iframe.setAttribute('allow', `attribution-reporting 'src'`);
  }

  return iframe;
}

/**
 * Determine if `attribution-reporting` API is available in browser.
 * @param {!Document} doc
 * @return {boolean}
 */
export function isAttributionReportingSupported(doc) {
  return doc.featurePolicy?.features().includes('attribution-reporting');
}
