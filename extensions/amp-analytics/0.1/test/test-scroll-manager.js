import {AmpdocAnalyticsRoot} from '../analytics-root';
import {ScrollManager} from '../scroll-manager';

describes.realWin('ScrollManager', {amp: 1}, (env) => {
  let win;
  let ampdoc;
  let root;
  let body, target, child, other;
  let scrollManager;
  let fakeViewport;

  function expectNthCallToMatch(fn, callIndex, expected) {
    expect(fn.getCall(callIndex).calledWithMatch(env.sandbox.match(expected)))
      .to.be.true;
  }

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    root = new AmpdocAnalyticsRoot(ampdoc);
    body = win.document.body;

    target = win.document.createElement('target');
    target.id = 'target';
    target.className = 'target';
    body.appendChild(target);

    child = win.document.createElement('child');
    child.id = 'child';
    child.className = 'child';
    target.appendChild(child);

    other = win.document.createElement('div');
    other.id = 'other';
    other.className = 'other';
    body.appendChild(other);

    scrollManager = new ScrollManager(root);
    root.scrollManager_ = scrollManager;
    fakeViewport = {
      'getSize': env.sandbox
        .stub()
        .returns({top: 0, left: 0, height: 200, width: 200}),
      'getScrollTop': env.sandbox.stub().returns(0),
      'getScrollLeft': env.sandbox.stub().returns(0),
      'getLayoutRect': env.sandbox
        .stub()
        .returns({width: 500, height: 500, top: 0, left: 0}),
      'onChanged': () => {
        return env.sandbox.stub();
      },
    };
    scrollManager.viewport_ = fakeViewport;
  });

  it('should initalize, add listeners and dispose', () => {
    expect(scrollManager.scrollObservable_.getHandlerCount()).to.equal(0);

    scrollManager.addScrollHandler(env.sandbox.stub());
    expect(scrollManager.scrollObservable_.getHandlerCount()).to.equal(1);

    scrollManager.dispose();
    expect(scrollManager.scrollObservable_.getHandlerCount()).to.equal(0);
  });

  it(
    'should add a viewport onChanged listener with scroll handlers, ' +
      'and dispose when there are none',
    () => {
      expect(scrollManager.viewportOnChangedUnlistener_).to.not.be.ok;

      const fn1 = env.sandbox.stub();
      scrollManager.addScrollHandler(fn1);

      expect(scrollManager.viewportOnChangedUnlistener_).to.be.ok;
      const unlistenStub = scrollManager.viewportOnChangedUnlistener_;

      scrollManager.removeScrollHandler(fn1);

      expect(scrollManager.viewportOnChangedUnlistener_).to.not.be.ok;
      expect(unlistenStub).to.have.callCount(1);
    }
  );

  it('fires on scroll', async () => {
    const fn1 = env.sandbox.stub();
    const fn2 = env.sandbox.stub();
    scrollManager.addScrollHandler(fn1);
    scrollManager.addScrollHandler(fn2);

    await scrollManager.measureRootElement_(true);

    expect(fn1).to.have.callCount(1);
    expect(fn2).to.have.callCount(1);

    // Scroll Down
    fakeViewport.getScrollTop.returns(500);
    fakeViewport.getScrollLeft.returns(500);
    fakeViewport.getLayoutRect.returns({
      width: 800,
      height: 700,
      top: 0,
      left: 0,
    });
    await scrollManager.onScroll_({
      top: 500,
      left: 500,
      height: 250,
      width: 250,
    });

    const expectedScrollEvent = {
      top: 500,
      left: 500,
      height: 250,
      width: 250,
      scrollWidth: 800,
      scrollHeight: 700,
      initialSize: {scrollHeight: 500, scrollWidth: 500},
    };

    expect(fn1).to.have.callCount(2);
    expectNthCallToMatch(fn1, 1, expectedScrollEvent);

    expect(fn2).to.have.callCount(2);
    expectNthCallToMatch(fn2, 1, expectedScrollEvent);
  });

  it('fires on scroll inside an embedded doc', async () => {
    const fn1 = env.sandbox.stub();
    const fn2 = env.sandbox.stub();
    scrollManager.addScrollHandler(fn1);
    scrollManager.addScrollHandler(fn2);

    await scrollManager.measureRootElement_(true);

    expect(fn1).to.have.callCount(1);
    expect(fn2).to.have.callCount(1);

    // Scroll Down
    fakeViewport.getScrollTop.returns(500);
    fakeViewport.getScrollLeft.returns(500);
    fakeViewport.getLayoutRect.returns({
      width: 800,
      height: 700,
      top: 200,
      left: 50,
    });
    await scrollManager.onScroll_({
      top: 500,
      left: 500,
      height: 250,
      width: 250,
    });

    const expectedScrollEvent = {
      top: 300,
      left: 450,
      height: 250,
      width: 250,
      scrollWidth: 800,
      scrollHeight: 700,
      initialSize: {scrollHeight: 500, scrollWidth: 500},
    };

    expect(fn1).to.have.callCount(2);
    expectNthCallToMatch(fn1, 1, expectedScrollEvent);

    expect(fn2).to.have.callCount(2);
    expectNthCallToMatch(fn2, 1, expectedScrollEvent);
  });

  it('can remove specifc handlers', async () => {
    const fn1 = env.sandbox.stub();
    const fn2 = env.sandbox.stub();
    scrollManager.addScrollHandler(fn1);
    scrollManager.addScrollHandler(fn2);
    await scrollManager.measureRootElement_(true);

    expect(fn1).to.have.callCount(1);
    expect(fn2).to.have.callCount(1);

    scrollManager.removeScrollHandler(fn2);

    // Scroll Down
    fakeViewport.getScrollTop.returns(500);
    fakeViewport.getScrollLeft.returns(500);
    await scrollManager.onScroll_({
      top: 500,
      left: 500,
      height: 250,
      width: 250,
    });

    expect(fn1).to.have.callCount(2);
    expect(fn2).to.have.callCount(1);
  });
});
