import {Services} from '#service';
import {AmpDocSingle} from '#service/ampdoc-impl';
import {LocalizationService} from '#service/localization';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../../../amp-story/1.0/amp-story-store-service';
import {AmpStoryEducation, State} from '../amp-story-education';

describes.realWin('amp-story-education', {amp: true}, (env) => {
  let ampdoc;
  let hasSwipeCap;
  let storeService;
  let storyEducation;
  let viewer;
  let win;

  beforeEach(() => {
    win = env.win;

    const localizationService = new LocalizationService(win.document.body);
    env.sandbox
      .stub(Services, 'localizationForDoc')
      .returns(localizationService);

    storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });

    const element = win.document.createElement('amp-story-education');
    ampdoc = new AmpDocSingle(win);
    element.getAmpDoc = () => ampdoc;
    win.document.body.appendChild(element);
    storyEducation = new AmpStoryEducation(element);

    hasSwipeCap = false;

    viewer = Services.viewerForDoc(storyEducation.element);
    env.sandbox.stub(viewer, 'isEmbedded').returns(true);
    env.sandbox.stub(viewer, 'hasCapability').callsFake(() => hasSwipeCap);
    env.sandbox.stub(storyEducation, 'mutateElement').callsFake((fn) => fn());
  });

  it('should render', () => {
    storyEducation.buildCallback();
    expect(storyEducation.containerEl_).to.have.class(
      'i-amphtml-story-education'
    );
  });

  it('should be hidden by default', () => {
    storyEducation.buildCallback();
    expect(storyEducation.containerEl_).to.have.attribute('hidden');
  });

  it('should be visible when rendering an education step', () => {
    storyEducation.buildCallback();
    // TODO(gmajoulet): remove private method call when viewer messaging is
    // introduced.
    storyEducation.setState_(State.NAVIGATION_TAP);
    expect(storyEducation.containerEl_).to.not.have.attribute('hidden');
  });

  it('should propagate the dir attribute', () => {
    storyEducation.buildCallback();
    storeService.dispatch(Action.TOGGLE_RTL, true);
    expect(storyEducation.containerEl_).to.have.attribute('dir', 'rtl');
  });

  describe('amp-story-education paused state', () => {
    it('should not update the paused state when hidden', () => {
      storeService.dispatch(Action.TOGGLE_PAUSED, false);
      storyEducation.buildCallback();

      expect(storeService.get(StateProperty.PAUSED_STATE)).to.be.false;
    });

    it('should pause the story when visible', () => {
      storeService.dispatch(Action.TOGGLE_PAUSED, false);
      storyEducation.buildCallback();

      // TODO(gmajoulet): remove private method call when viewer messaging is
      // introduced.
      storyEducation.setState_(State.NAVIGATION_TAP);

      expect(storeService.get(StateProperty.PAUSED_STATE)).to.be.true;
    });

    it('should unpause the story once the education is dismissed', () => {
      storeService.dispatch(Action.TOGGLE_PAUSED, false);
      storyEducation.buildCallback();

      // TODO(gmajoulet): remove private method call when viewer messaging is
      // introduced.
      storyEducation.setState_(State.NAVIGATION_SWIPE);
      const clickEvent = new MouseEvent('click', {clientX: 100, clientY: 100});
      storyEducation.containerEl_.dispatchEvent(clickEvent);

      expect(storeService.get(StateProperty.PAUSED_STATE)).to.be.false;
    });

    it('should not unpause a story that was already paused', () => {
      storeService.dispatch(Action.TOGGLE_PAUSED, true);
      storyEducation.buildCallback();

      // TODO(gmajoulet): remove private method call when viewer messaging is
      // introduced.
      storyEducation.setState_(State.NAVIGATION_SWIPE);
      const clickEvent = new MouseEvent('click', {clientX: 100, clientY: 100});
      storyEducation.containerEl_.dispatchEvent(clickEvent);

      expect(storeService.get(StateProperty.PAUSED_STATE)).to.be.true;
    });
  });

  describe('amp-story-education navigation', () => {
    it('should render the first navigation education step', () => {
      hasSwipeCap = true;
      storyEducation.buildCallback();

      // TODO(gmajoulet): remove private method call when viewer messaging is
      // introduced.
      storyEducation.setState_(State.NAVIGATION_TAP);
      const navigationTapEl =
        storyEducation.containerEl_.querySelector('[step="tap"]');

      expect(navigationTapEl).to.exist;
    });

    it('should render the second navigation education step', () => {
      hasSwipeCap = true;
      storyEducation.buildCallback();

      // TODO(gmajoulet): remove private method call when viewer messaging is
      // introduced.
      storyEducation.setState_(State.NAVIGATION_SWIPE);
      const navigationSwipeEl =
        storyEducation.containerEl_.querySelector('[step="swipe"]');

      expect(navigationSwipeEl).to.exist;
    });

    it('should not render the second navigation education step if no swipe capability', () => {
      hasSwipeCap = false;
      storyEducation.buildCallback();

      storyEducation.setState_(State.NAVIGATION_TAP);
      const clickEvent = new MouseEvent('click', {clientX: 100, clientY: 100});
      storyEducation.containerEl_.dispatchEvent(clickEvent);

      expect(storyEducation.containerEl_).to.have.attribute('hidden');
    });

    it('should navigate to the next step on tap', () => {
      hasSwipeCap = true;
      storyEducation.buildCallback();
      // TODO(gmajoulet): remove private method call when viewer messaging is
      // introduced.
      storyEducation.setState_(State.NAVIGATION_TAP);

      const clickEvent = new MouseEvent('click', {clientX: 100, clientY: 100});
      storyEducation.containerEl_.dispatchEvent(clickEvent);

      const navigationSwipeEl =
        storyEducation.containerEl_.querySelector('[step="swipe"]');
      expect(navigationSwipeEl).to.exist;
    });

    it('should hide the education on last step tap', () => {
      hasSwipeCap = true;
      storyEducation.buildCallback();
      // TODO(gmajoulet): remove private method call when viewer messaging is
      // introduced.
      storyEducation.setState_(State.NAVIGATION_SWIPE);

      const clickEvent = new MouseEvent('click', {clientX: 100, clientY: 100});
      storyEducation.containerEl_.dispatchEvent(clickEvent);

      expect(storyEducation.containerEl_).to.have.attribute('hidden');
    });
  });

  describe('amp-story-education viewer messaging', () => {
    it('should not send viewer message if not visible', async () => {
      const sendStub = env.sandbox.stub(viewer, 'sendMessageAwaitResponse');
      // Viewer is not visible.
      env.sandbox
        .stub(storyEducation.getAmpDoc(), 'whenFirstVisible')
        .rejects();

      storyEducation.buildCallback();
      await Promise.resolve();

      expect(sendStub).to.not.have.been.called;
    });

    it('should send canShowScreens ont for navigation on build', async () => {
      const sendStub = env.sandbox.stub(viewer, 'sendMessageAwaitResponse');
      env.sandbox
        .stub(storyEducation.getAmpDoc(), 'whenFirstVisible')
        .resolves();

      storyEducation.buildCallback();
      await Promise.resolve(); // Microtask tick.

      expect(sendStub).to.have.been.calledOnceWith('canShowScreens', {
        screens: [{screen: 'ont'}],
      });
    });

    it('should send canShowScreens ontas for navigation on build', async () => {
      hasSwipeCap = true;
      const sendStub = env.sandbox.stub(viewer, 'sendMessageAwaitResponse');
      env.sandbox
        .stub(storyEducation.getAmpDoc(), 'whenFirstVisible')
        .resolves();

      storyEducation.buildCallback();
      await Promise.resolve(); // Microtask tick.

      expect(sendStub).to.have.been.calledOnceWith('canShowScreens', {
        screens: [{screen: 'ontas'}],
      });
    });

    it('should show navigation screen on viewer response', async () => {
      env.sandbox.stub(viewer, 'sendMessageAwaitResponse').resolves({
        screens: [{screen: 'ontas', show: true}],
      });
      env.sandbox
        .stub(storyEducation.getAmpDoc(), 'whenFirstVisible')
        .resolves();

      storyEducation.buildCallback();
      await Promise.resolve(); // whenFirstVisible icrotask tick.
      await Promise.resolve(); // sendMessageAwaitResponse microtask tick.

      const navigationTapEl =
        storyEducation.containerEl_.querySelector('[step="tap"]');
      expect(navigationTapEl).to.exist;
    });

    it('should not show navigation screen on viewer response', async () => {
      env.sandbox.stub(viewer, 'sendMessageAwaitResponse').resolves({
        screens: [{screen: 'ontas', show: false}],
      });
      env.sandbox
        .stub(storyEducation.getAmpDoc(), 'whenFirstVisible')
        .resolves();

      storyEducation.buildCallback();
      await Promise.resolve(); // whenFirstVisible microtask tick.
      await Promise.resolve(); // sendMessageAwaitResponse microtask tick.

      const navigationTapEl =
        storyEducation.containerEl_.querySelector('[step="tap"]');
      expect(navigationTapEl).to.not.exist;
    });
  });
});
