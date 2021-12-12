import {AmpEvents_Enum} from '#core/constants/amp-events';

import {createFixtureIframe} from '#testing/iframe';

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
  return createFixtureIframe(fixtureName, 500)
    .then((f) => {
      fixture = f;
      for (let i = 0; i < testElements.length; i++) {
        expect(fixture.doc.querySelectorAll(testElements[i])).to.have.length(1);
      }
      return fixture.awaitEvent(AmpEvents_Enum.LOAD_START, testElements.length);
    })
    .then(() => {
      for (let i = 0; i < testElements.length; i++) {
        const testElement = fixture.doc.querySelectorAll(testElements[i])[0];
        checkElementUpgrade(testElement);
        if (testElement.tagName == 'AMP-FIT-TEXT') {
          expect(
            fixture.doc.getElementsByClassName('i-amphtml-fit-text-content')
          ).to.have.length(1);
        }
      }
    });
}

describes.sandboxed(
  'test extensions loading in multiple orders',
  {},
  function () {
    this.timeout(15000);

    it('one extension, extension loads first, all scripts in header', () => {
      return testLoadOrderFixture(
        'test/fixtures/script-load-extension-head-v0-head.html',
        ['amp-fit-text']
      );
    });

    it('one extension, v0 loads first, all scripts in header', () => {
      return testLoadOrderFixture(
        'test/fixtures/script-load-v0-head-extension-head.html',
        ['amp-fit-text']
      );
    });

    // TODO(#30528): skip this test as it doesn't make sense. The script
    // tags are in the footer and our posthtml transforms break on the
    // transformation of these invalid html files.
    it.skip('one extension, extension loads first, all scripts in footer', () => {
      return testLoadOrderFixture(
        'test/fixtures/script-load-extension-footer-v0-footer.html',
        ['amp-fit-text']
      );
    });

    // TODO(#30528): skip this test as it doesn't make sense. The script
    // tags are in the footer and our posthtml transforms break on the
    // transformation of these invalid html files.
    it.skip('one extension, v0 loads first, all scripts in footer', () => {
      return testLoadOrderFixture(
        'test/fixtures/script-load-v0-footer-extension-footer.html',
        ['amp-fit-text']
      );
    });

    it('one extension, v0 in header, extension script in footer', () => {
      return testLoadOrderFixture(
        'test/fixtures/script-load-v0-head-extension-footer.html',
        ['amp-fit-text']
      );
    });

    // TODO(choumx); This test times out when run with the prod AMP config.
    // See #11588.
    it.skip('two extensions, one of extension scripts and v0 in header', () => {
      return testLoadOrderFixture('test/fixtures/script-load-extensions.html', [
        'amp-fit-text',
        'amp-iframe',
      ]);
    });
  }
);
