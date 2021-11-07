import {PullToRefreshBlocker} from '../../src/pull-to-refresh';

describes.sandboxed('PullToRefreshBlocker', {}, (env) => {
  let eventListeners;
  let viewportMock;
  let blocker;

  beforeEach(() => {
    eventListeners = {};
    const documentApi = {
      addEventListener: (eventType, handler) => {
        eventListeners[eventType] = handler;
      },
      removeEventListener: (eventType, handler) => {
        if (eventListeners[eventType] == handler) {
          delete eventListeners[eventType];
        }
      },
    };

    const viewportApi = {
      getScrollTop: () => 0,
    };
    viewportMock = env.sandbox.mock(viewportApi);

    blocker = new PullToRefreshBlocker(documentApi, viewportApi);
  });

  afterEach(() => {
    viewportMock.verify();
    blocker.cleanup();
  });

  function sendEvent(event, opt_prevetDefault) {
    event.preventDefault = opt_prevetDefault || (() => {});
    event.stopPropagation = () => {};
    eventListeners[event.type](event);
  }

  it('should only subscribe to touchstart initially', () => {
    expect(eventListeners['touchstart']).to.not.equal(undefined);
    expect(eventListeners['touchmove']).to.equal(undefined);
    expect(eventListeners['touchend']).to.equal(undefined);
    expect(eventListeners['touchcancel']).to.equal(undefined);
  });

  it('should start tracking on touch start', () => {
    sendEvent({type: 'touchstart', touches: [{clientY: 111}]});

    expect(blocker.tracking_).to.equal(true);
    expect(blocker.startPos_).to.equal(111);

    expect(eventListeners['touchstart']).to.not.equal(undefined);
    expect(eventListeners['touchmove']).to.not.equal(undefined);
    expect(eventListeners['touchend']).to.not.equal(undefined);
    expect(eventListeners['touchcancel']).to.not.equal(undefined);
  });

  it('should NOT start tracking with non-single-touch', () => {
    // No touches.
    sendEvent({type: 'touchstart'});
    expect(blocker.tracking_).to.equal(false);
    sendEvent({type: 'touchstart', touches: []});
    expect(blocker.tracking_).to.equal(false);

    // Multi-touch.
    sendEvent({type: 'touchstart', touches: [{}, {}]});
    expect(blocker.tracking_).to.equal(false);
  });

  it('should NOT start tracking when scrolled', () => {
    viewportMock.expects('getScrollTop').returns(11).once();
    sendEvent({type: 'touchstart', touches: [{clientY: 111}]});
    expect(blocker.tracking_).to.equal(false);
  });

  it('should stop tracking on touch end', () => {
    sendEvent({type: 'touchstart', touches: [{clientY: 111}]});
    expect(blocker.tracking_).to.equal(true);

    sendEvent({type: 'touchend'});
    expect(blocker.tracking_).to.equal(false);

    expect(eventListeners['touchstart']).to.not.equal(undefined);
    expect(eventListeners['touchmove']).to.equal(undefined);
    expect(eventListeners['touchend']).to.equal(undefined);
    expect(eventListeners['touchcancel']).to.equal(undefined);
  });

  it('should stop tracking on touch cancel', () => {
    sendEvent({type: 'touchstart', touches: [{clientY: 111}]});
    expect(blocker.tracking_).to.equal(true);

    sendEvent({type: 'touchend'});
    expect(blocker.tracking_).to.equal(false);

    expect(eventListeners['touchstart']).to.not.equal(undefined);
    expect(eventListeners['touchmove']).to.equal(undefined);
    expect(eventListeners['touchend']).to.equal(undefined);
    expect(eventListeners['touchcancel']).to.equal(undefined);
  });

  it('should cancel pull down on touch move', () => {
    sendEvent({type: 'touchstart', touches: [{clientY: 111}]});
    expect(blocker.tracking_).to.equal(true);

    const preventDefault = env.sandbox.spy();
    sendEvent({type: 'touchmove', touches: [{clientY: 112}]}, preventDefault);
    expect(blocker.tracking_).to.equal(false);
    expect(preventDefault).to.be.calledOnce;

    expect(eventListeners['touchstart']).to.not.equal(undefined);
    expect(eventListeners['touchmove']).to.equal(undefined);
    expect(eventListeners['touchend']).to.equal(undefined);
    expect(eventListeners['touchcancel']).to.equal(undefined);
  });

  it('should NOT cancel pull up on touch move', () => {
    sendEvent({type: 'touchstart', touches: [{clientY: 111}]});
    expect(blocker.tracking_).to.equal(true);

    const preventDefault = env.sandbox.spy();
    sendEvent({type: 'touchmove', touches: [{clientY: 100}]}, preventDefault);
    expect(blocker.tracking_).to.equal(false);
    expect(preventDefault).to.have.not.been.called;

    expect(eventListeners['touchstart']).to.not.equal(undefined);
    expect(eventListeners['touchmove']).to.equal(undefined);
    expect(eventListeners['touchend']).to.equal(undefined);
    expect(eventListeners['touchcancel']).to.equal(undefined);
  });

  it('should keep tracking on touch move if ', () => {
    sendEvent({type: 'touchstart', touches: [{clientY: 111}]});
    expect(blocker.tracking_).to.equal(true);

    const preventDefault = env.sandbox.spy();
    sendEvent({type: 'touchmove', touches: [{clientY: 111}]}, preventDefault);
    expect(blocker.tracking_).to.equal(true);
    expect(preventDefault).to.have.not.been.called;

    expect(eventListeners['touchstart']).to.not.equal(undefined);
    expect(eventListeners['touchmove']).to.not.equal(undefined);
    expect(eventListeners['touchend']).to.not.equal(undefined);
    expect(eventListeners['touchcancel']).to.not.equal(undefined);
  });
});
