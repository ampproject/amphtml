import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../amp-story-store-service';
import {Keys_Enum} from '#core/constants/key-codes';
import {Services} from '#service';
import {
  ShareMenu,
  VISIBLE_CLASS,
} from '../../../amp-story-share-menu/0.1/amp-story-share-menu';
import {ShareWidget} from '../amp-story-share';
import {registerServiceBuilder} from '../../../../src/service-helpers';

describes.realWin('amp-story-share-menu', {amp: true}, (env) => {
  let isSystemShareSupported;
  let parentEl;
  let shareMenu;
  let shareWidgetMock;
  let storeService;
  let win;
  let installExtensionForDoc;

  beforeEach(() => {
    win = env.win;
    storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });

    isSystemShareSupported = false;

    const shareWidget = {
      build: () => win.document.createElement('div'),
      isSystemShareSupported: () => isSystemShareSupported,
    };
    shareWidgetMock = env.sandbox.mock(shareWidget);
    env.sandbox.stub(ShareWidget, 'create').returns(shareWidget);

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

    parentEl = win.document.createElement('div');
    win.document.body.appendChild(parentEl);
    shareMenu = new ShareMenu(win, parentEl);
  });

  it('should build the sharing menu', () => {
    shareMenu.build();
    expect(shareMenu.element_).to.exist;
  });

  it('should append the sharing menu in the parentEl on build', () => {
    shareMenu.build();

    expect(parentEl.childElementCount).to.equal(1);
  });

  it('should build the share widget when building the component', () => {
    shareWidgetMock
      .expects('build')
      .once()
      .returns(win.document.createElement('div'));

    shareMenu.build();
    shareWidgetMock.verify();
  });

  it('should append the share widget when building the component', () => {
    const shareWidgetEl = win.document.createElement('div');
    shareWidgetEl.classList.add('foo');

    shareWidgetMock.expects('build').returns(shareWidgetEl);

    shareMenu.build();

    expect(shareMenu.element_.querySelector('.foo')).to.exist;
    shareWidgetMock.verify();
  });

  it('should show the share menu on store property update', () => {
    shareMenu.build();

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);

    expect(shareMenu.element_).to.have.class(VISIBLE_CLASS);
  });

  it('should hide the share menu on click on the overlay', () => {
    shareMenu.build();

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);
    shareMenu.element_.dispatchEvent(new Event('click'));

    expect(shareMenu.element_).not.to.have.class(VISIBLE_CLASS);
    expect(storeService.get(StateProperty.SHARE_MENU_STATE)).to.be.false;
  });

  it('should not hide the share menu on click on the widget container', () => {
    shareMenu.build();

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);
    parentEl
      .querySelector('.i-amphtml-story-share-menu-container')
      .dispatchEvent(new Event('click'));

    expect(shareMenu.element_).to.have.class(VISIBLE_CLASS);
  });

  it('should hide the share menu on escape key press', () => {
    shareMenu.build();

    const clickCallbackSpy = env.sandbox.spy();
    win.addEventListener('keyup', clickCallbackSpy);

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);
    // Create escape keyup event.
    const keyupEvent = new Event('keyup');
    keyupEvent.keyCode = Keys_Enum.ESCAPE;
    win.dispatchEvent(keyupEvent);

    expect(clickCallbackSpy).to.have.been.calledOnce;
  });

  it('should not load the amp-social-share extension if system share', () => {
    isSystemShareSupported = true;

    shareMenu.build();

    expect(
      installExtensionForDoc.withArgs(env.sandbox.match.any, 'amp-social-share')
    ).to.not.have.been.called;

    shareWidgetMock.verify();
  });

  it('should load the amp-social-share extension if fallback share', () => {
    isSystemShareSupported = false;

    shareMenu.build();

    expect(
      installExtensionForDoc.withArgs(env.sandbox.match.any, 'amp-social-share')
    ).to.have.been.called;

    shareWidgetMock.verify();
  });

  // See ShareMenu.onShareMenuStateUpdate_ for details.
  it('should close back the share menu right away if system share', () => {
    isSystemShareSupported = true;

    win.navigator.share = () => Promise.resolve();

    shareMenu.build();

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);

    expect(storeService.get(StateProperty.SHARE_MENU_STATE)).to.be.false;
  });
});
