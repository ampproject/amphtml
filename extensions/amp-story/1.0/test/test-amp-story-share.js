import {Services} from '#service';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../amp-story-store-service';

import {AmpStoryShare} from '../amp-story-share';
import {expect} from 'chai';

describes.realWin('amp-story-share', {amp: true}, (env) => {
  let ampStoryShare;
  let ampStory;
  let storeService;
  let win;
  let installExtensionForDoc;

  beforeEach(() => {
    win = env.win;
    storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });

    // Making sure the vsync tasks run synchronously.
    env.sandbox.stub(Services, 'vsyncFor').returns({
      mutate: (fn) => fn(),
      run: (vsyncTaskSpec, vsyncState) => {
        vsyncTaskSpec.measure(vsyncState);
        vsyncTaskSpec.mutate(vsyncState);
      },
    });

    installExtensionForDoc = env.sandbox.spy();

    env.sandbox.stub(Services, 'extensionsFor').returns({
      installExtensionForDoc,
    });

    ampStory = win.document.createElement('amp-story');
    win.document.body.appendChild(ampStory);
    ampStoryShare = new AmpStoryShare(win, ampStory);
  });

  it('should build the sharing menu if native sharing is unsupported', () => {
    const buildSpy = env.sandbox.spy(ampStoryShare, 'buildFallbackMenu_');
    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);
    expect(buildSpy).to.have.been.called;
  });

  it('should open the native sharing if it is supported', () => {
    win.navigator.share = () => Promise.resolve();
    const shareSpy = env.sandbox.spy(win.navigator, 'share');

    env.sandbox.stub(ampStoryShare, 'isSystemShareSupported_').returns(true);

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);
    expect(shareSpy).to.have.been.called;
  });

  // See ShareMenu.onShareMenuStateUpdate_ for details.
  it('should close back the share menu right away if system share', () => {
    win.navigator.share = () => Promise.resolve();
    env.sandbox.stub(ampStoryShare, 'isSystemShareSupported_').returns(true);

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);

    expect(storeService.get(StateProperty.SHARE_MENU_STATE)).to.be.false;
  });

  it('should share natively if available with the canonical url and window title', () => {
    win.navigator.share = () => Promise.resolve();
    const shareSpy = env.sandbox.spy(win.navigator, 'share');
    env.sandbox.stub(ampStoryShare, 'isSystemShareSupported_').returns(true);

    // Set canonicalUrl and window title for sharing.
    env.sandbox
      .stub(Services, 'documentInfoForDoc')
      .returns({canonicalUrl: 'https://amp.dev'});
    win.document.title = 'AMP';

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);

    expect(shareSpy).to.be.calledWith({
      url: 'https://amp.dev',
      text: 'AMP',
    });
  });
});
