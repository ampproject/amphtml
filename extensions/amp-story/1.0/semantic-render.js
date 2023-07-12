import * as Preact from '#core/dom/jsx';
import {includes} from '#core/types/string';

import {Services} from '#service';

import {dev} from '#utils/log';

/**
 * Renders the page description, and videos title/alt attributes in the page.
 * @param {!./amp-story-page.AmpStoryPage} page
 * @param {!Array<?Element>} videos
 */
export function renderPageDescription(page, videos) {
  const descriptionElId = `i-amphtml-story-${page.element.id}-description`;
  const descriptionEl = (
    <div class="i-amphtml-story-page-description" id={descriptionElId}></div>
  );
  const append = (el) => {
    page.mutateElement(() => {
      descriptionEl.appendChild(el);
      // Add descriptionEl to actual page if that hasn't happened yet.
      if (descriptionEl.parentNode) {
        return;
      }
      page.element.parentElement.insertBefore(
        descriptionEl,
        page.element.nextElementSibling
      );
      if (!page.element.getAttribute('aria-labelledby')) {
        page.element.setAttribute('aria-labelledby', descriptionElId);
      }
    });
  };

  const addTagToDescriptionEl = (tagName, text) => {
    if (!text) {
      return;
    }
    const el = page.win.document.createElement(tagName);
    el./* OK */ textContent = text;
    append(el);
  };

  addTagToDescriptionEl('h2', page.element.getAttribute('title'));

  videos.forEach((videoEl) => {
    addTagToDescriptionEl('p', videoEl.getAttribute('alt'));
    addTagToDescriptionEl('p', videoEl.getAttribute('title'));
    addTagToDescriptionEl('p', videoEl.getAttribute('aria-label'));
    fetchCaptions(page, videoEl).then((text) => {
      addTagToDescriptionEl('p', text);
    });
  });
}

/**
 * Fetches captions for a video if available and returns them as plain
 * text.
 * @param {!./amp-story-page.AmpStoryPage} page
 * @param {!Element} videoEl
 * @return {!Promise<string|undefined>}
 */
function fetchCaptions(page, videoEl) {
  // Prefer the default track, otherwise pick the first.
  // Could be extended to prefer the language of the doc.
  const track =
    videoEl.querySelector('track[default]') || videoEl.querySelector('track');
  if (!track || !track.src) {
    return Promise.resolve();
  }
  return Services.xhrFor(page.win)
    .fetchText(track.src, {
      mode: 'cors',
    })
    .then((response) => {
      if (!response.ok) {
        return;
      }
      return response.text().then(extractTextContent);
    });
}

/**
 * Extract the text content from a captions file.
 * @param {string} text
 * @return {string}
 * @visibleForTesting
 */
export function extractTextContent(text) {
  text = text.trim();
  if (text.startsWith('WEBVTT')) {
    return extractTextContentWebVtt(text);
  }
  if (includes(text, 'http://www.w3.org/ns/ttml')) {
    return extractTextContentTtml(text);
  }

  return '';
}

/**
 * Extract the text content from a TTML file.
 * https://www.w3.org/TR/2018/REC-ttml2-20181108/
 * @param {string} text
 * @return {string}
 */
function extractTextContentTtml(text) {
  try {
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    return doc
      .querySelector('body')
      .textContent.replace(/[\s\n\r]+/g, ' ')
      .trim();
  } catch (e) {
    dev().error('TTML', e.message);
  }
  return '';
}

/**
 * Extract the text content from a WebVTT file.
 * https://www.w3.org/TR/webvtt1/
 * @param {string} text
 * @return {string}
 */
function extractTextContentWebVtt(text) {
  const queue = /^\d\d\:\d\d/;
  let seenQueue = false;
  text = text
    .split(/[\n\r]+/)
    .filter((line) => {
      const isQueue = queue.test(line);
      seenQueue = seenQueue || isQueue;
      // Filter queues and everything before.
      if (!seenQueue || isQueue) {
        return false;
      }
      // Filter comments.
      return !/^NOTE\s+/.test(line);
    })
    .map((line) => {
      return (
        line
          // Strip multiline indicators.
          .replace(/^- /, '')
      );
    })
    .join(' ');
  // Super loose HTML parsing to get HTML entity parsing and removal
  // of WebVTT elements.
  // Assigning .innerHTML of a <template> node to prevent XSS risk.
  const wrapperTemplate = <template />;
  // Make innerHTML assignment Trusted Types compliant for compatible browsers
  if (self.trustedTypes && self.trustedTypes.createPolicy) {
    const policy = self.trustedTypes.createPolicy(
      'semantic-render#extractTextContentWebVtt',
      {
        createHTML: function (unused) {
          return text;
        },
      }
    );
    wrapperTemplate./* element is never added to DOM */ innerHTML =
      policy.createHTML('ignored');
  } else {
    wrapperTemplate./* element is never added to DOM */ innerHTML = text;
  }
  return wrapperTemplate.content.textContent;
}
