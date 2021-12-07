import {Keys_Enum} from '#core/constants/key-codes';
// import {getStyle} from '#core/dom/style';

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
  // let isSystemShareSupported;
  let parentEl;
  let shareMenu;
  let storeService;
  let win;
  let storyEl;

  beforeEach(() => {
    win = env.win;
    storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });

    const localizationService = new LocalizationService(win.document.body);
    env.sandbox
      .stub(Services, 'localizationServiceForOrNull')
      .returns(Promise.resolve(localizationService));

    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });

    // isSystemShareSupported = false;

    // Making sure the vsync tasks run synchronously.
    env.sandbox.stub(Services, 'vsyncFor').returns({
      mutate: (fn) => fn(),
      run: (vsyncTaskSpec, vsyncState) => {
        vsyncTaskSpec.measure(vsyncState);
        vsyncTaskSpec.mutate(vsyncState);
      },
    });

    parentEl = win.document.createElement('div');
    storyEl = win.document.createElement('amp-story');
    win.document.body.appendChild(storyEl);
    storyEl.appendChild(parentEl);
    shareMenu = new AmpStoryShareMenu(parentEl, win);

    env.sandbox.mock();
  });

  it('should build the sharing menu inside the parent element', async () => {
    await shareMenu.build();

    expect(parentEl.querySelector('.i-amphtml-story-share-menu')).to.exist;
  });

  it('should show the share menu on store property update', async () => {
    await shareMenu.build();

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);

    expect(shareMenu.rootEl_).to.have.class(VISIBLE_CLASS);
  });

  it('should hide the share menu on click on the overlay', async () => {
    await shareMenu.build();

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);
    shareMenu.rootEl_.dispatchEvent(new Event('click'));

    expect(shareMenu.rootEl_).not.to.have.class(VISIBLE_CLASS);
    expect(storeService.get(StateProperty.SHARE_MENU_STATE)).to.be.false;
  });

  it('should not hide the share menu on click on the widget container', async () => {
    await shareMenu.build();

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);
    parentEl
      .querySelector('.i-amphtml-story-share-menu-container')
      .dispatchEvent(new Event('click'));

    expect(shareMenu.rootEl_).to.have.class(VISIBLE_CLASS);
  });

  it('should hide the share menu on escape key press', async () => {
    await shareMenu.build();

    const clickCallbackSpy = env.sandbox.spy();
    win.addEventListener('keyup', clickCallbackSpy);

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);
    // Create escape keyup event.
    const keyupEvent = new Event('keyup');
    keyupEvent.keyCode = Keys_Enum.ESCAPE;
    win.dispatchEvent(keyupEvent);

    expect(clickCallbackSpy).to.have.been.calledOnce;
  });

  // it('should render the amp-social-share button if system share', () => {
  //   isSystemShareSupported = true;

  //   shareMenu.build();

  //   expect(shareMenu.element_.tagName).to.equal('AMP-SOCIAL-SHARE');
  // });

  // it('should hide the amp-social-share button if system share', () => {
  //   isSystemShareSupported = true;

  //   shareMenu.build();

  //   expect(getStyle(shareMenu.element_, 'visibility')).to.equal('hidden');
  // });

  // it('should load the amp-social-share extension if system share', () => {
  //   isSystemShareSupported = true;
  //   shareWidgetMock.expects('loadRequiredExtensions').once();

  //   shareMenu.build();

  //   shareWidgetMock.verify();
  // });

  // it('should dispatch an event on system share button if system share', () => {
  //   isSystemShareSupported = true;

  //   shareMenu.build();

  //   const clickCallbackSpy = env.sandbox.spy();
  //   shareMenu.element_.addEventListener('click', clickCallbackSpy);

  //   // Toggling the share menu dispatches a click event on the amp-social-share
  //   // button, which triggers the native sharing menu.
  //   storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);

  //   expect(clickCallbackSpy).to.have.been.calledOnce;
  // });

  // // See ShareMenu.onShareMenuStateUpdate_ for details.
  // it('should close back the share menu right away if system share', () => {
  //   isSystemShareSupported = true;

  //   shareMenu.build();

  //   storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);

  //   expect(storeService.get(StateProperty.SHARE_MENU_STATE)).to.be.false;
  // });
});
