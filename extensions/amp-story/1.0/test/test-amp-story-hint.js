import {Services} from '#service';
import {LocalizationService} from '#service/localization';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {AmpStoryHint} from '../amp-story-hint';
import {AmpStoryStoreService} from '../amp-story-store-service';

const NOOP = () => {};

describes.fakeWin('amp-story hint layer', {amp: true}, (env) => {
  let host;
  let win;
  let ampStoryHint;

  beforeEach(() => {
    win = env.win;

    const localizationService = new LocalizationService(win.document.body);
    env.sandbox
      .stub(Services, 'localizationForDoc')
      .returns(localizationService);

    const storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });

    env.sandbox
      .stub(Services, 'vsyncFor')
      .callsFake(() => ({mutate: (task) => task()}));
    env.sandbox
      .stub(Services, 'timerFor')
      .callsFake(() => ({delay: NOOP, cancel: NOOP}));

    host = win.document.createElement('div');
    ampStoryHint = new AmpStoryHint(win, host);
  });

  it('should not build the UI until we have to display it', () => {
    expect(getHintContainerFromHost(host)).to.be.null;
  });

  it('should be able to show navigation help overlay', () => {
    const hideAfterTimeoutStub = env.sandbox
      .stub(ampStoryHint, 'hideAfterTimeout')
      .callsFake(NOOP);
    ampStoryHint.showNavigationOverlay();

    const hintContainer = getHintContainerFromHost(host);

    expect(hintContainer.className).to.contain('show-navigation-overlay');
    expect(hintContainer.className).to.not.contain('show-first-page-overlay');
    expect(hintContainer.className).to.not.contain('i-amphtml-hidden');
    expect(hideAfterTimeoutStub).to.be.calledOnce;
  });

  it('should be able to show no previous page help overlay', () => {
    const hideAfterTimeoutStub = env.sandbox
      .stub(ampStoryHint, 'hideAfterTimeout')
      .callsFake(NOOP);

    ampStoryHint.showFirstPageHintOverlay();

    const hintContainer = getHintContainerFromHost(host);

    expect(hintContainer.className).to.contain('show-first-page-overlay');
    expect(hintContainer.className).to.not.contain('show-navigation-overlay');
    expect(hintContainer.className).to.not.contain('i-amphtml-hidden');
    expect(hideAfterTimeoutStub).to.be.calledOnce;
  });

  it('should be able to hide shown hint', () => {
    ampStoryHint.showNavigationOverlay();
    ampStoryHint.hideAllNavigationHint();

    const hintContainer = getHintContainerFromHost(host);

    expect(hintContainer.className).to.contain('i-amphtml-hidden');
  });
});

/**
 * Helper function to get the actual hint container from its host.
 * @param  {!Element} host
 * @return {?Element}
 */
function getHintContainerFromHost(host) {
  if (!host.lastElementChild) {
    return null;
  }

  const hintRoot = host.lastElementChild.shadowRoot || host.lastElementChild;
  return hintRoot.querySelector('.i-amphtml-story-hint-container');
}
