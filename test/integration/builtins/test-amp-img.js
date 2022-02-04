import {AmpEvents_Enum} from '#core/constants/amp-events';

import {createCustomEvent} from '#utils/event-helper';

import {createFixtureIframe, expectBodyToBecomeVisible} from '#testing/iframe';

describes.sandboxed('Rendering of amp-img', {}, () => {
  const timeout = window.ampTestRuntimeConfig.mochaTimeout;

  let fixture;
  beforeEach(async () => {
    fixture = await createFixtureIframe('test/fixtures/images.html', 500);
  });

  it('should show the body in image test', async () => {
    await expectBodyToBecomeVisible(fixture.win, timeout);
  });

  it('should be present', async () => {
    expect(fixture.doc.querySelectorAll('amp-img')).to.have.length(16);
    // 5 image visible in 500 pixel height. Note that there will be no load
    // event for the inabox image.
    await fixture.awaitEvent(AmpEvents_Enum.LOAD_START, 3);
    expect(fixture.doc.querySelectorAll('amp-img img[src]')).to.have.length(4);
  });

  it('should resize and load more elements', async () => {
    // Note that there will be no load event for the inabox image.
    fixture.iframe.height = 1500;
    fixture.win.dispatchEvent(createCustomEvent(fixture.win, 'resize', null));
    await fixture.awaitEvent(AmpEvents_Enum.LOAD_START, 11);
    expect(fixture.doc.querySelectorAll('amp-img img[src]')).to.have.length(12);

    fixture.iframe.height = 2000;
    fixture.win.dispatchEvent(createCustomEvent(fixture.win, 'resize', null));
    await fixture.awaitEvent(AmpEvents_Enum.LOAD_START, 13);
    expect(fixture.doc.querySelectorAll('amp-img img[src]')).to.have.length(14);
  });

  it('should respect media queries', async () => {
    await fixture.awaitEvent(AmpEvents_Enum.LOAD_START, 3);
    await new Promise((res) => setTimeout(res, 1));

    const smallScreen = fixture.doc.getElementById('img3');
    const largeScreen = fixture.doc.getElementById('img3_1');

    expect(smallScreen.className).to.not.match(
      /i-amphtml-hidden-by-media-query/
    );
    expect(largeScreen.className).to.match(/i-amphtml-hidden-by-media-query/);
    expect(smallScreen.offsetHeight).to.not.equal(0);
    expect(largeScreen.offsetHeight).to.equal(0);
    expect(smallScreen.querySelector('img')).to.exist;
    expect(largeScreen.querySelector('img')).to.not.exist;

    fixture.iframe.width = 600;
    fixture.win.dispatchEvent(createCustomEvent(fixture.win, 'resize', null));

    await largeScreen.whenLoaded();

    expect(smallScreen.className).to.match(/i-amphtml-hidden-by-media-query/);
    expect(largeScreen.className).to.not.match(
      /i-amphtml-hidden-by-media-query/
    );
    expect(smallScreen.offsetHeight).to.equal(0);
    expect(largeScreen.offsetHeight).to.not.equal(0);
    expect(largeScreen.querySelector('img')).to.exist;
  });

  it('should not load image if already present (inabox)', async () => {
    await fixture.awaitEvent(AmpEvents_Enum.LOAD_START, 3);

    const ampImage = fixture.doc.getElementById('img8');
    expect(ampImage).is.ok;
    expect(ampImage.querySelectorAll('img').length).to.equal(1);
  });
});
