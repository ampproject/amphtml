import {AmpEvents_Enum} from '#core/constants/amp-events';
import {computedStyle} from '#core/dom/style';

import {createFixtureIframe, expectBodyToBecomeVisible} from '#testing/iframe';

describes.sandboxed.configure().run('CSS', {}, () => {
  it('should include height of [overflow] child in size before build', async () => {
    const fixture = await createFixtureIframe(
      'test/fixtures/overflow.html',
      500
    );
    // Wait until layout.js CSS is applied.
    await fixture.awaitEvent(AmpEvents_Enum.ATTACHED, 1);
    const {doc} = fixture;

    const iframe = doc.querySelector('amp-iframe');
    const iframeRect = iframe.getBoundingClientRect();

    const overflow = doc.querySelector('[overflow]');
    const overflowRect = overflow.getBoundingClientRect();

    expect(overflowRect.height).to.be.greaterThan(0);
    // The amp-iframe has a 1:1 aspect ratio, and its height should be
    // incremented by the overflow's height.
    expect(Math.abs(iframeRect.width - iframeRect.height)).to.lessThan(2);
  });

  it('should include height of [placeholder] child in size before build', async () => {
    const fixture = await createFixtureIframe(
      'test/fixtures/placeholder.html',
      500
    );
    // Wait until layout.js CSS is applied.
    await expectBodyToBecomeVisible(fixture.win);
    const {doc} = fixture;

    const placeholder = doc.querySelector('[placeholder]');
    expect(computedStyle(fixture.win, placeholder).lineHeight).to.equal(
      'normal'
    );
  });
});
