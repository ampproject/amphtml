import {AmpEvents_Enum} from '#core/constants/amp-events';

import {createFixtureIframe} from '#testing/iframe';

function checkElementUpgrade(element) {
  expect(element).to.have.class('i-amphtml-element');
  expect(element).to.have.class('i-amphtml-layout-responsive');
  expect(element).to.have.class('i-amphtml-layout-size-defined');
  expect(element).to.not.have.class('amp-notbuilt');
  expect(element).to.not.have.class('i-amphtml-notbuilt');
  expect(element).to.not.have.class('amp-unresolved');
  expect(element).to.not.have.class('i-amphtml-unresolved');
}

describes.sandboxed
  .configure()
  .ifModuleBuild()
  .run('runtime', {}, () => {
    it('should only execute module code', async () => {
      const testExtension = 'amp-carousel';
      const fixture = await createFixtureIframe(
        'test/fixtures/doubleload-module.html',
        500
      );
      expect(fixture.doc.querySelectorAll(testExtension)).to.have.length(1);
      // Wait for a the LOAD_START event which is enough of a signal that the
      // runtime has executed.
      await fixture.awaitEvent(AmpEvents_Enum.LOAD_START, 1);
      expect(fixture.doc.documentElement.getAttribute('esm')).to.equal('1');
      checkElementUpgrade(fixture.doc.querySelector(testExtension));
    });

    it('should only execute nomodule code', async () => {
      const testExtension = 'amp-carousel';
      const fixture = await createFixtureIframe(
        'test/fixtures/doubleload-nomodule.html',
        500
      );
      expect(fixture.doc.querySelectorAll(testExtension)).to.have.length(1);
      // Wait for a the LOAD_START event which is enough of a signal that the
      // runtime has executed.
      await fixture.awaitEvent(AmpEvents_Enum.LOAD_START, 1);
      expect(fixture.doc.documentElement.getAttribute('esm')).to.equal('0');
      checkElementUpgrade(fixture.doc.querySelector(testExtension));
    });
  });
