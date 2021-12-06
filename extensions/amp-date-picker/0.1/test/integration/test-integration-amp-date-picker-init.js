import {AmpEvents_Enum} from '#core/constants/amp-events';

import {createFixtureIframe} from '#testing/iframe';

function checkElementUpgrade(element) {
  expect(element).to.have.class('i-amphtml-element');
  expect(element).to.have.class('i-amphtml-layout-size-defined');
  expect(element).to.not.have.class('amp-notbuilt');
  expect(element).to.not.have.class('i-amphtml-notbuilt');
  expect(element).to.not.have.class('amp-unresolved');
  expect(element).to.not.have.class('i-amphtml-unresolved');
}

// NOTE: this only executes on module build tests
const config = describes.sandboxed.configure().ifModuleBuild();

config.run('amp-date-picker', {}, async () => {
  it('initializes the date picker', async () => {
    const testExtension = 'amp-date-picker';
    const fixture = await createFixtureIframe(
      'test/fixtures/datepicker.html',
      500
    );
    expect(fixture.doc.querySelectorAll(testExtension)).to.have.length(1);
    // Wait for a the LOAD_START event which is enough of a signal that the
    // runtime has executed.
    await fixture.awaitEvent(AmpEvents_Enum.LOAD_START, 1);
    expect(fixture.doc.documentElement.getAttribute('esm')).to.equal('1');
    checkElementUpgrade(fixture.doc.querySelector(testExtension));
  });
});
