import {expect} from 'chai';

import {Services} from '#service';

import * as analyticsApi from '#utils/analytics';

import {
  getAmpdoc,
  registerServiceBuilder,
} from '../../../../src/service-helpers';
import {AmpStoryShare} from '../amp-story-share';
import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../amp-story-store-service';
import {StoryAnalyticsEvent, getAnalyticsService} from '../story-analytics';

describes.realWin('amp-story-share', {amp: true}, (env) => {
  let ampStoryShare;
  let ampStory;
  let storeService;
  let win;
  let installExtensionForDoc;
  let analyticsTriggerStub;

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
    getAnalyticsService(win, ampStory);
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

  it('should send correct analytics tagName and eventType when opening the share menu', async () => {
    analyticsTriggerStub = env.sandbox.stub(
      analyticsApi,
      'triggerAnalyticsEvent'
    );
    env.sandbox.stub(ampStoryShare, 'isSystemShareSupported_').returns(false);

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);

    await getAmpdoc(win.document).whenFirstVisible();

    // tagName should be amp-story-share-menu as per extensions/amp-story/amp-story-analytics.md
    expect(analyticsTriggerStub).to.be.calledWith(
      ampStory,
      StoryAnalyticsEvent.OPEN,
      env.sandbox.match(
        (val) => val.eventDetails.tagName === 'amp-story-share-menu'
      )
    );
  });
});
