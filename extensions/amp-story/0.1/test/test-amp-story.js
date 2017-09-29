import {AmpStory} from '../amp-story';
import {AnalyticsTrigger} from '../analytics';
import {EventType} from '../events';
import {KeyCodes} from '../../../../src/utils/key-codes';
import {VariableService} from '../variable-service';


const NOOP = () => {};


describes.realWin('amp-story', {
  amp: {
    extensions: ['amp-story'],
  }
}, env => {

  let win;
  let element;

  function appendEmptyPage(container, opt_active) {
    const page = document.createElement('amp-story-page');
    page.id = '-empty-page';
    if (opt_active) {
      page.setAttribute('active', true);
    }
    container.appendChild(page);
    return page;
  }

  function stubBookend(bookend) {
    sandbox./*OK*/stub(element.implementation_, 'bookend_', bookend);
  }

  function createPages(container, count, opt_ids) {
    return Array(count).fill(undefined).map((unused, i) => {
      const page = win.document.createElement('amp-story-page');
      page.id = opt_ids && opt_ids[i] ? opt_ids[i] : `-page-${i}`;
      container.appendChild(page);
      return page;
    });
  }

  function createEvent(eventType) {
    const eventObj = document.createEventObject ?
        document.createEventObject() : document.createEvent('Events');
    if (eventObj.initEvent) {
      eventObj.initEvent(eventType, true, true);
    }
    return eventObj;
  }

  function stubViewportSize(width, height) {
    sandbox./*OK*/stub(element.implementation_.getViewport(), 'getSize', () =>
        ({width, height}));
  }

  beforeEach(() => {
    win = env.win;
    element = win.document.createElement('amp-story');
    win.document.body.appendChild(element);

    // TODO(alanorozco): Test active page event triggers once the stubbable
    // `Services` module is part of the amphtml-story repo.
    sandbox.stub(element.implementation_, 'triggerActiveEventForPage_', NOOP);
  });

  afterEach(() => {
    sandbox.restore();
    element.remove();
  });

  it('should build', () => {
    const firstPageId = 'first-page-foo';

    const systemLayerRootMock = {};

    const systemLayerBuild =
        sandbox.stub(element.implementation_.systemLayer_, 'build')
            .returns(systemLayerRootMock);

    const updateActivePageState =
        sandbox.stub(element.implementation_.navigationState_,
            'updateActivePage',
            NOOP);

    const installNavigationStateConsumer =
        sandbox.stub(element.implementation_.navigationState_,
            'installConsumer');

    createPages(element, 5, [firstPageId]);
    const appendChild = sandbox.stub(element, 'appendChild', NOOP);

    element.build();

    expect(appendChild).to.have.been.calledWithExactly(systemLayerRootMock);
    expect(updateActivePageState).to.have.been.calledWith(0, firstPageId);
    expect(updateActivePageState).to.have.been.calledOnce;
    expect(installNavigationStateConsumer).to.have.been.calledWith(
        sandbox.match(consumer => consumer instanceof VariableService));
    expect(installNavigationStateConsumer).to.have.been.calledWith(
        sandbox.match(consumer => consumer instanceof AnalyticsTrigger));
  });

  // TODO(amphtml-story#187): Re-enable this test.
  it.skip('should enter fullscreen when switching pages', () => {
    const requestFullScreen = sandbox.spy();
    const systemLayerSetInFullScreen = sandbox.stub(
        element.implementation_.systemLayer_, 'setInFullScreen', NOOP);

    appendEmptyPage(element, /* opt_active */ true);
    stubFullScreenForTesting(/* isSupported */ true, requestFullScreen, NOOP);
    stubViewportSize(320, 480); // "mobile" as long as both dimensions <= 1024px

    element.implementation_.switchTo_(win.document.createElement('div'));

    expect(requestFullScreen).to.be.calledOnce;
    expect(systemLayerSetInFullScreen)
        .to.have.been.calledWith(/* inFullScreen */ true);
  });

  // TODO(amphtml-story#187): Re-enable this test.
  it.skip('should not enter fullscreen when switching if auto is disabled', () => {
    const requestFullScreen = sandbox.spy();

    const enterFullScreen = sandbox.stub(
        element.implementation_, 'enterFullScreen_', NOOP);

    appendEmptyPage(element, /* opt_active */ true);
    stubViewportSize(320, 480); // "mobile" as long as both dimensions <= 1024px

    element.implementation_.setAutoFullScreen(false);
    element.implementation_.switchTo_(win.document.createElement('div'));

    expect(enterFullScreen).to.not.have.been.called;
  });

  // TODO(amphtml-story#187): Re-enable this test.
  it.skip('should not enter fullscreen when switching if on "desktop"', () => {
    const requestFullScreen = sandbox.spy();

    const enterFullScreen = sandbox.stub(
        element.implementation_, 'enterFullScreen_', NOOP);

    appendEmptyPage(element, /* opt_active */ true);
    stubViewportSize(1200, 1200); // "desktop" as long as one dimension > 1024px

    element.implementation_.switchTo_(win.document.createElement('div'));

    expect(enterFullScreen).to.not.have.been.called;
  });

  // TODO(amphtml-story#187): Re-enable this test.
  it.skip('should exit fullscreen when switching to the bookend page', () => {
    const exitFullScreen = sandbox.spy();
    const systemLayerSetInFullScreen = sandbox.stub(
        element.implementation_.systemLayer_, 'setInFullScreen', NOOP);

    const bookend = win.document.createElement('section');

    appendEmptyPage(element);
    stubFullScreenForTesting(/* isSupported */ true, NOOP, exitFullScreen);

    element.build();
    element.implementation_.buildBookend_();
    element.implementation_.showBookend_();

    expect(exitFullScreen).to.be.calledOnce;
    expect(systemLayerSetInFullScreen)
        .to.have.been.calledWith(/* inFullScreen */ false);
  });

  // TODO(amphtml-story#187): Re-enable this test.
  it.skip('should disable auto fullscreen when exiting explicitly', () => {
    const setAutoFullScreenSpy = sandbox.spy(
        element.implementation_, 'setAutoFullScreen');

    stubFullScreenForTesting(/* isSupported */ true, NOOP, NOOP);

    element.implementation_.exitFullScreen_(/* opt_explicitUserAction */ true);

    expect(setAutoFullScreenSpy)
        .to.have.been.calledWith(/* isEnabled */ false);
  });

  // TODO(amphtml-story#187): Re-enable this test.
  it.skip('should exit fullscreen when EXIT_FULLSCREEN is triggered', () => {
    const exitFullScreenStub = sandbox.stub(
        element.implementation_, 'exitFullScreen_', NOOP);

    createPages(element, 5);
    element.build();

    element.dispatchEvent(new Event(EventType.EXIT_FULLSCREEN));

    expect(exitFullScreenStub)
        .to.have.been.calledWith(/* opt_explicitUserAction */ true);
  });

  it('should hide bookend when CLOSE_BOOKEND is triggered', () => {
    const hideBookendStub = sandbox.stub(
        element.implementation_, 'hideBookend_', NOOP);

    appendEmptyPage(element);

    element.build();

    element.dispatchEvent(new Event(EventType.CLOSE_BOOKEND));

    expect(hideBookendStub).to.have.been.calledOnce;
  });

  it('should return a valid page count', () => {
    const count = 5;

    createPages(element, count);

    expect(element.implementation_.getPageCount()).to.equal(count);
  });

  it('should return a valid page index', () => {
    const count = 5;

    const pages = createPages(element, count);

    pages.forEach((page, i) => {
      expect(element.implementation_.getPageIndex(page)).to.equal(i);
    });
  });

  it('should return all pages', () => {
    const pages = createPages(element, 5);

    const result = element.implementation_.getPages();

    expect(result.length).to.equal(pages.length);

    pages.forEach((page, i) =>
        expect(Array.prototype.includes.call(result, page)).to.be.true);
  });

  it('should update progress bar when switching pages', () => {
    const impl = element.implementation_;

    const count = 10;
    const index = 2;

    const page = win.document.createElement('div');

    const updateProgressBarStub =
        sandbox.stub(impl.systemLayer_, 'updateProgressBar', NOOP);

    appendEmptyPage(element, /* opt_active */ true);

    sandbox.stub(impl, 'getPageCount').returns(count);
    sandbox.stub(impl, 'getPageIndex').withArgs(page).returns(index);

    impl.switchTo_(page);

    // first page is not counted as part of the progress
    expect(updateProgressBarStub).to.have.been.calledWith(index, count - 1);
  });

  it('should pause/resume pages when switching pages', () => {
    const impl = element.implementation_;
    const pages = createPages(element, 5);
    impl.schedulePause = sandbox.spy();
    impl.scheduleResume = sandbox.spy();

    const oldPage = pages[0];
    const newPage = pages[1];

    element.build();

    return impl.switchTo_(newPage).then(() => {
      expect(impl.schedulePause).to.have.been.calledWith(oldPage);
      expect(impl.scheduleResume).to.have.been.calledWith(newPage);
    });
  });

  it('should go to next page on right arrow keydown', () => {
    const impl = element.implementation_;
    const pages = createPages(element, 5);

    element.build();

    expect(pages[0].hasAttribute('active')).to.be.true;
    expect(pages[1].hasAttribute('active')).to.be.false;

    // Stubbing because we need to assert synchronously
    sandbox.stub(element.implementation_, 'mutateElement', mutator => {
      mutator();
      return Promise.resolve();
    });

    const eventObj = createEvent('keydown');
    eventObj.keyCode = KeyCodes.RIGHT_ARROW;
    eventObj.which = KeyCodes.RIGHT_ARROW;
    const docEl = win.document.documentElement;
    docEl.dispatchEvent ?
        docEl.dispatchEvent(eventObj) :
        docEl.fireEvent('onkeydown', eventObj);

    expect(pages[0].hasAttribute('active')).to.be.false;
    expect(pages[1].hasAttribute('active')).to.be.true;
  });
});
