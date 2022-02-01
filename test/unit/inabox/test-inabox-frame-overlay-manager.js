import {
  stubCollapseFrameForTesting,
  stubExpandFrameForTesting,
} from '#ads/inabox/frame-overlay-helper';
import {FrameOverlayManager} from '#ads/inabox/frame-overlay-manager';

const NOOP = () => {};

describes.fakeWin('inabox-host:FrameOverlayManager', {}, (env) => {
  let win;
  let addEventListenerSpy;

  let manager;

  beforeEach(() => {
    win = env.win;
    addEventListenerSpy = env.sandbox.spy(win, 'addEventListener');

    manager = new FrameOverlayManager(win);
  });

  it('should listen to window resize event', () => {
    expect(addEventListenerSpy).to.have.been.calledWith(
      'resize',
      env.sandbox.match.any
    );
  });

  it('should expand frame and execute callback', () => {
    const expandedRect = {a: 2, b: 3};
    const iframe = {};

    const expandFrame = env.sandbox.spy((win, iframe, onFinish) => {
      onFinish({}, expandedRect);
    });

    const callback = env.sandbox.spy();

    stubExpandFrameForTesting(expandFrame);

    manager.expandFrame(iframe, callback);

    expect(callback).to.have.been.calledWith(expandedRect);
    expect(expandFrame).to.have.been.calledWith(
      win,
      iframe,
      env.sandbox.match.any
    );
  });

  it('should collapse frame and execute callback with remeasured box', () => {
    const remeasuredCollapsedRect = {a: 2, b: 3};
    const iframe = {};

    const collapseFrame = env.sandbox.spy(
      (win, iframe, onFinish, onRemeasure) => {
        onFinish();
        onRemeasure(remeasuredCollapsedRect);
      }
    );

    const callback = env.sandbox.spy();

    stubCollapseFrameForTesting(collapseFrame);
    stubExpandFrameForTesting((win, iframe, onFinish) => onFinish({}, {}));

    manager.expandFrame(iframe, NOOP);
    manager.onWindowResize();
    manager.collapseFrame(iframe, callback);

    expect(callback).to.have.been.calledWith(remeasuredCollapsedRect);
    expect(collapseFrame).to.have.been.calledWith(
      win,
      iframe,
      env.sandbox.match.any,
      env.sandbox.match.any
    );
  });

  it('should collapse frame and execute callback with known box rect', () => {
    const knownBoxRect = {a: 2, b: 3};

    const iframe = {};

    const collapseFrame = env.sandbox.spy(
      (win, iframe, onFinish, onRemeasure) => {
        onFinish();
        onRemeasure({});
      }
    );

    const callback = env.sandbox.spy();

    stubCollapseFrameForTesting(collapseFrame);
    stubExpandFrameForTesting((win, iframe, onFinish) =>
      onFinish(knownBoxRect, {})
    );

    manager.expandFrame(iframe, NOOP);
    manager.collapseFrame(iframe, callback);

    expect(callback).to.have.been.calledWith(knownBoxRect);
    expect(collapseFrame).to.have.been.calledWith(
      win,
      iframe,
      env.sandbox.match.any,
      env.sandbox.match.any
    );
  });
});
