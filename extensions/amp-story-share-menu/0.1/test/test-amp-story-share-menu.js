import {Keys_Enum} from '#core/constants/key-codes';

import {Services} from '#service';
import {LocalizationService} from '#service/localization';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../../../amp-story/1.0/amp-story-store-service';
import {AmpStoryShareMenu, VISIBLE_CLASS} from '../amp-story-share-menu';

describes.realWin('amp-story-share-menu', {amp: true}, (env) => {
  let hostEl;
  let shareMenu;
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

    const localizationService = new LocalizationService(win.document.body);
    env.sandbox
      .stub(Services, 'localizationForDoc')
      .returns(localizationService);

    hostEl = win.document.createElement('div');
    ampStory = win.document.createElement('amp-story');
    win.document.body.appendChild(ampStory);
    ampStory.appendChild(hostEl);
    shareMenu = new AmpStoryShareMenu(hostEl);
  });

  it('should build the sharing menu', async () => {
    await shareMenu.buildCallback();
    expect(shareMenu.rootEl_).to.exist;
  });

  it('should show the share menu on store property update', async () => {
    await shareMenu.buildCallback();

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);

    expect(shareMenu.rootEl_).to.have.class(VISIBLE_CLASS);
  });

  it('should hide the share menu on click on the overlay', async () => {
    await shareMenu.buildCallback();

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);
    shareMenu.rootEl_.dispatchEvent(new Event('click'));

    expect(shareMenu.rootEl_).not.to.have.class(VISIBLE_CLASS);
    expect(storeService.get(StateProperty.SHARE_MENU_STATE)).to.be.false;
  });

  it('should not hide the share menu on click on the widget container', async () => {
    await shareMenu.buildCallback();

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);
    hostEl
      .querySelector('.i-amphtml-story-share-menu-container')
      .dispatchEvent(new Event('click'));

    expect(shareMenu.rootEl_).to.have.class(VISIBLE_CLASS);
  });

  it('should hide the share menu on escape key press', async () => {
    await shareMenu.buildCallback();

    const clickCallbackSpy = env.sandbox.spy();
    win.addEventListener('keyup', clickCallbackSpy);

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);
    // Create escape keyup event.
    const keyupEvent = new Event('keyup');
    keyupEvent.keyCode = Keys_Enum.ESCAPE;
    win.dispatchEvent(keyupEvent);

    expect(clickCallbackSpy).to.have.been.calledOnce;
  });

  it('should send message to viewer to execute copy url if embedded', async () => {
    const viewer = Services.viewerForDoc(env.ampdoc);
    env.sandbox.stub(viewer, 'isEmbedded').returns(true);
    env.sandbox.stub(Services, 'viewerForDoc').returns(viewer);

    await shareMenu.buildCallback();

    const onMessageSpy = env.sandbox.spy(
      shareMenu.viewerMessagingHandler_,
      'onMessage'
    );
    const sendSpy = env.sandbox.spy(shareMenu.viewerMessagingHandler_, 'send');

    const shareLinkEl = win.document.querySelector(
      '.i-amphtml-story-share-icon-link'
    );
    shareLinkEl.click();
    expect(onMessageSpy).to.have.been.calledOnce;
    expect(sendSpy).to.have.been.calledOnce;
  });
});
