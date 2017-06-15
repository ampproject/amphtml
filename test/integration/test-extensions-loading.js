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

import {createFixtureIframe} from '../../testing/iframe';

// Checks if an amp element gets upgraded.
function checkElementUpgrade(element) {
  expect(element).to.have.class('i-amphtml-element');
  expect(element).to.have.class('i-amphtml-layout-responsive');
  expect(element).to.have.class('i-amphtml-layout-size-defined');
  expect(element).to.not.have.class('amp-notbuilt');
  expect(element).to.not.have.class('i-amphtml-notbuilt');
  expect(element).to.not.have.class('amp-unresolved');
  expect(element).to.not.have.class('i-amphtml-unresolved');
}

/**
 * Check all elements in the fixture are upgraded correctly.
 * @param {string} fixtureName
 * @param {!Array} testElements
 */
function testLoadOrderFixture(fixtureName, testElements) {
  let fixture;
  return createFixtureIframe(fixtureName).then(f => {
    fixture = f;
    for (let i = 0; i < testElements.length; i++) {
      expect(fixture.doc.querySelectorAll(testElements[i]))
          .to.have.length(1);
    }
    return fixture.awaitEvent('amp:load:start', testElements.length);
  }).then(() => {
    for (let i = 0; i < testElements.length; i++) {
      const testElement = fixture.doc.querySelectorAll(testElements[i])[0];
      checkElementUpgrade(testElement);
      if (testElement.tagName == 'AMP-FIT-TEXT') {
        expect(fixture.doc.getElementsByClassName('i-amphtml-fit-text-content'))
            .to.have.length(1);
      }
    }
  });
}

const t = describe.configure().retryOnSaucelabs();
t.run('test extensions loading in multiple orders', () => {
  it('one extension, extension loads first, all scripts in header', () => {
    return testLoadOrderFixture(
        'test/fixtures/script-load-extension-head-v0-head.html',
        ['amp-fit-text']);
  });

  it('one extension, v0 loads first, all scripts in header', () => {
    return testLoadOrderFixture(
        'test/fixtures/script-load-v0-head-extension-head.html',
        ['amp-fit-text']);
  });

  it('one extension, extension loads first, all scripts in footer', () => {
    return testLoadOrderFixture(
        'test/fixtures/script-load-extension-footer-v0-footer.html',
        ['amp-fit-text']);
  });

  it('one extension, v0 loads first, all scripts in footer', () => {
    return testLoadOrderFixture(
        'test/fixtures/script-load-v0-footer-extension-footer.html',
        ['amp-fit-text']);
  });

  it('one extension, v0 in header, extension script in footer', () => {
    return testLoadOrderFixture(
        'test/fixtures/script-load-v0-head-extension-footer.html',
        ['amp-fit-text']);
  });

  it('two extensions, one of extension scripts and v0 in header', () => {
    return testLoadOrderFixture('test/fixtures/script-load-extensions.html',
        ['amp-fit-text', 'amp-iframe']);
  });
});
