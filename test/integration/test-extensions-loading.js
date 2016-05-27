/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {
  createFixtureIframe,
  expectBodyToBecomeVisible,
} from '../../testing/iframe';

// Checks if an amp element gets upgraded.
// Works for all amp elements used in this test.
function checkElementUpgrade(element) {
  expect(element).to.have.class('-amp-element');
  expect(element).to.have.class('-amp-layout-responsive');
  expect(element).to.have.class('-amp-layout-size-defined');
  expect(element).to.not.have.class('-amp-notbuilt');
  expect(element).to.not.have.class('amp-notbuilt');
  expect(element).to.not.have.class('amp-unresolved');
  expect(element).to.not.have.class('-amp-unresolved');
}

describe('test extensions loading in multiple orders', () => {
  let fixture;
  it('one extension, extension loads first, all scripts in header', () => {
    return createFixtureIframe(
        'test/fixtures/script-load-extension-head-v0-head.html').then(f => {
          fixture = f;
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          expect(ampFitText).to.have.length(1);
          return expectBodyToBecomeVisible(fixture.win);
        }).then(() => {
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          checkElementUpgrade(ampFitText[0]);
          expect(fixture.doc.getElementsByClassName('-amp-fit-text-content'))
              .to.have.length(1);
        });
  });

  it('one extension, v0 loads first, all scripts in header', () => {
    return createFixtureIframe(
        'test/fixtures/script-load-v0-head-extension-head.html').then(f => {
          fixture = f;
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          expect(ampFitText).to.have.length(1);
          return expectBodyToBecomeVisible(fixture.win);
        }).then(() => {
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          checkElementUpgrade(ampFitText[0]);
          expect(fixture.doc.getElementsByClassName('-amp-fit-text-content'))
              .to.have.length(1);
        });
  });

  it('one extension, extension loads first, all scripts in footer', () => {
    return createFixtureIframe(
        'test/fixtures/script-load-extension-footer-v0-footer.html').then(f => {
          fixture = f;
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          expect(ampFitText).to.have.length(1);
          return expectBodyToBecomeVisible(fixture.win);
        }).then(() => {
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          checkElementUpgrade(ampFitText[0]);
          expect(fixture.doc.getElementsByClassName('-amp-fit-text-content'))
              .to.have.length(1);
        });
  });

  it('one extension, v0 loads first, all scripts in footer', () => {
    return createFixtureIframe(
        'test/fixtures/script-load-v0-footer-extension-footer.html').then(f => {
          fixture = f;
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          expect(ampFitText).to.have.length(1);
          return expectBodyToBecomeVisible(fixture.win);
        }).then(() => {
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          checkElementUpgrade(ampFitText[0]);
          expect(fixture.doc.getElementsByClassName('-amp-fit-text-content'))
              .to.have.length(1);
        });
  });

  it('one extension, v0 in header, extension script in footer', () => {
    return createFixtureIframe(
        'test/fixtures/script-load-v0-head-extension-footer.html').then(f => {
          fixture = f;
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          expect(ampFitText).to.have.length(1);
          return expectBodyToBecomeVisible(fixture.win);
        }).then(() => {
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          checkElementUpgrade(ampFitText[0]);
          expect(fixture.doc.getElementsByClassName('-amp-fit-text-content'))
              .to.have.length(1);
        });
  });

  it('two extensions, one of extension scripts and v0 in header', () => {
    return createFixtureIframe(
        'test/fixtures/script-load-extensions.html').then(f => {
          fixture = f;
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          const ampIframe = fixture.doc.querySelectorAll('amp-iframe');
          expect(ampFitText).to.have.length(1);
          expect(ampIframe).to.have.length(1);
          return expectBodyToBecomeVisible(fixture.win);
        }).then(() => {
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          checkElementUpgrade(ampFitText[0]);
          expect(fixture.doc.getElementsByClassName('-amp-fit-text-content'))
              .to.have.length(1);
          const ampIframe = fixture.doc.querySelectorAll('amp-iframe');
          checkElementUpgrade(ampIframe[0]);
        });
  });
});
