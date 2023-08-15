import {getStyle} from '#core/dom/style';

import {isAnimationNone} from '#testing/helpers/service';
import {createFixtureIframe, expectBodyToBecomeVisible} from '#testing/iframe';

const timeout = window.ampTestRuntimeConfig.mochaTimeout;

describes.sandboxed('Old Opacity Boilerplate', {}, () => {
  let fixture;
  beforeEach(() => {
    return createFixtureIframe(
      'test/fixtures/boilerplate-old-opacity.html',
      1000
    ).then((f) => {
      fixture = f;
    });
  });

  it('should show the body when opacity boilerplate is used', () => {
    return expectBodyToBecomeVisible(fixture.win, timeout).then(() => {
      expect(getStyle(fixture.win.document.body, 'opacity')).to.equal('1');
    });
  });
});

describes.sandboxed('New Visibility Boilerplate', {}, () => {
  let fixture;
  beforeEach(() => {
    return createFixtureIframe(
      'test/fixtures/boilerplate-new-visibility.html',
      10000
    ).then((f) => {
      fixture = f;
    });
  });

  it('should show the body in boilerplate test', () => {
    return expectBodyToBecomeVisible(fixture.win, timeout).then(() => {
      expect(getStyle(fixture.win.document.body, 'visibility')).to.equal(
        'visible'
      );
      expect(isAnimationNone(fixture.win.document.body, true)).to.be.true;
    });
  });
});
