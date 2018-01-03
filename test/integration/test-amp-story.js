/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {poll} from '../../testing/iframe';


const ACTIVE_BOOKEND_SELECTOR = '.i-amphtml-story-bookend:not([hidden])';

const ACTIVE_PAGE_SELECTOR = 'amp-story-page[active]';

const REPLAY_BUTTON_SELECTOR = '.i-amphtml-story-bookend-replay';

const PAGE_LOADED_CLASS = 'i-amphtml-story-page-loaded';

const STORY_EL_ID = 'amp-story-for-test';

const AUTO_ADVANCE_TOLERANCE_MS = 1000;

const CSS =
  // <amp-story> dimensions set as to not be bound by testing frame size.
  // Id for selector specificity.
  `#${STORY_EL_ID} {
    width: 400px !important;
    height: 600px !important;
  }`;


describe.configure().skip(function() {
  // TODO(alanorozco): Marking pages as loaded is broken in iOS < 11.
  // Waiting for roll forward MediaPool to enable this test (PR #12604)
  return this.platform.isIos() &&
      this.platform.isSafari() &&
      this.platform.getMajorVersion() < 11;
}).run('amp-story', function() {
  let win;

  function describesAmpStoryIntegration(name, pagesHtml, fn) {
    describes.integration(name, {
      extensions: ['amp-story'],
      experiments: ['amp-story'],
      body: ampStoryHtml(pagesHtml.join('')),
      css: CSS,
    }, env => {
      beforeEach(() => {
        win = env.win;
      });
      afterEach(() => {
        win = null; // GC
      });
      fn(env);
    });
  }

  function ampStoryHtml(body) {
    return `
      <amp-story id="${STORY_EL_ID}" standalone>
        <script type="application/ld+json">
          {"headline": "My AMP Story"}
        </script>
        ${body}
      </amp-story>`;
  }

  function ampStoryPageHtml(attrs, opt_body) {
    return `
      <amp-story-page ${attrsHtml(attrs)}>
        <amp-story-grid-layer template="vertical">
          ${opt_body || `<h1>${attrs['id'] || '[no id]'}</h1>`}
        </amp-story-grid-layer>
      </amp-story-page>`;
  }

  function attrsHtml(attrs) {
    return Object.keys(attrs).map(key => `${key}="${attrs[key]}"`).join(' ');
  }

  function expectActivePage(pageId, opt_timeout) {
    return poll(`page with id "${pageId}" to activate`,
        () => {
          const pages = win.document.querySelectorAll(ACTIVE_PAGE_SELECTOR);
          return pages.length == 1 && pages[0].id == pageId;
        },
        /* opt_onError */ undefined, opt_timeout);
  }

  function expectActivePageToLoad() {
    return poll('active page to load',
        () => win.document.querySelector(
            `${ACTIVE_PAGE_SELECTOR}.${PAGE_LOADED_CLASS}`));
  }

  function expectActiveBookend(opt_timeout) {
    return poll('bookend to activate',
        () => win.document.querySelector(ACTIVE_BOOKEND_SELECTOR),
        /* opt_onError */ undefined, opt_timeout);
  }

  function expectActivePageAfterWait(pageId, time) {
    return wait(time)
        .then(() => expectActivePage(pageId, AUTO_ADVANCE_TOLERANCE_MS));
  }

  function expectActivePageAfterClickForward(pageId) {
    return expectActivePageToLoad().then(() => {
      clickForward();
      return expectActivePage(pageId);
    });
  }

  function expectActivePageAfterClickBackward(pageId) {
    return expectActivePageToLoad().then(() => {
      clickBackward();
      return expectActivePage(pageId);
    });
  }

  function wait(time) {
    return new Promise(resolve => {
      setTimeout(resolve, time);
    });
  }

  function clickForward() {
    // Active area for forward click is rightmost 75% of page.
    clickAt(0.5, 0.5);
  }

  function clickBackward() {
    // Active area for backward click is leftmost 25% of page.
    clickAt(0.15, 0.5);
  }

  function clickAt(widthPercent, heightPercent) {
    const docEl = win.document.documentElement;

    const x = parseInt(docEl.scrollWidth * widthPercent, 10);
    const y = parseInt(docEl.scrollHeight * heightPercent, 10);

    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      screenX: x,
      screenY: y,
      clientX: x,
      clientY: y,
    });

    win.document.elementFromPoint(x, y).dispatchEvent(event);
  }

  describesAmpStoryIntegration('with manual advancement', [
    ampStoryPageHtml({id: 'page-0'}),
    ampStoryPageHtml({id: 'page-1'}),
    ampStoryPageHtml({id: 'page-2'}),
  ], () => {
    it('should advance in the correct order', () =>
      expectActivePage('page-0')
          // Forwards.
          .then(() => expectActivePageAfterClickForward('page-1'))
          .then(() => expectActivePageAfterClickForward('page-2'))

          // Backwards.
          .then(() => expectActivePageAfterClickBackward('page-1'))
          .then(() => expectActivePageAfterClickBackward('page-0')));

    it('should activate bookend and replay on click', () =>
      expectActivePage('page-0')
          .then(() => expectActivePageAfterClickForward('page-1'))
          .then(() => expectActivePageAfterClickForward('page-2'))
          .then(() => {
            clickForward();
            return expectActiveBookend();
          })
          .then(() => {
            win.document.querySelector(REPLAY_BUTTON_SELECTOR).click();
            return expectActivePage('page-0');
          }));
  });

  const TIME_PAGE_0 = 800;
  const TIME_PAGE_1 = 1500;
  const TIME_PAGE_2 = 1000;

  const TIME_ADVANCE_TIMEOUT = 2000 +
      TIME_PAGE_0 +
      TIME_PAGE_1 +
      TIME_PAGE_2 +
      AUTO_ADVANCE_TOLERANCE_MS * 3;

  describesAmpStoryIntegration('with time-based advancement', [
    ampStoryPageHtml({id: 'page-0', 'auto-advance-after': `${TIME_PAGE_0}ms`}),
    ampStoryPageHtml({id: 'page-1', 'auto-advance-after': `${TIME_PAGE_1}ms`}),
    ampStoryPageHtml({id: 'page-2', 'auto-advance-after': `${TIME_PAGE_2}ms`}),
  ], () => {
    it('should go forwards automatically', () =>
      expectActivePage('page-0')
          .then(expectActivePageToLoad)
          .then(() => expectActivePageAfterWait('page-1', TIME_PAGE_0))
          .then(() => expectActivePageAfterWait('page-2', TIME_PAGE_1))
          .then(() => wait(TIME_PAGE_2))
          .then(() => expectActiveBookend(AUTO_ADVANCE_TOLERANCE_MS)))
        .timeout(TIME_ADVANCE_TIMEOUT);

    it('should allow for combined advancement', () =>
      expectActivePage('page-0')
          .then(expectActivePageToLoad)
          .then(() => expectActivePageAfterWait('page-1', TIME_PAGE_0))
          .then(() => expectActivePageAfterClickBackward('page-0'))
          .then(() => expectActivePageAfterWait('page-1', TIME_PAGE_0))
          .then(() => expectActivePageAfterClickForward('page-2'))
          .then(() => {
            clickForward();
            return expectActiveBookend();
          }))
        .timeout(TIME_ADVANCE_TIMEOUT);
  });

  // TODO(alanorozco): Test for media-based advancement
});
