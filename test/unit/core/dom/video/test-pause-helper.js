import {PauseHelper} from '#core/dom/video/pause-helper';

import {installResizeObserverStub} from '#testing/resize-observer-stub';

describes.realWin('DOM - video - PauseHelper', {}, (env) => {
  let win, doc;
  let resizeObserverStub;
  let element;
  let helper;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    resizeObserverStub = installResizeObserverStub(env.sandbox, win);

    element = doc.createElement('amp-test');
    element.pause = () => {};
    env.sandbox.stub(element, 'pause');

    helper = new PauseHelper(element);
  });

  it('should start observing', () => {
    expect(resizeObserverStub.isObserved(element)).to.be.false;
    helper.updatePlaying(true);
    expect(resizeObserverStub.isObserved(element)).to.be.true;

    resizeObserverStub.notifySync({
      target: element,
      borderBoxSize: [{inlineSize: 101, blockSize: 102}],
    });
    expect(element.pause).to.not.be.called;
  });

  it('should pause only after the element receives a non-zero size', () => {
    expect(resizeObserverStub.isObserved(element)).to.be.false;
    helper.updatePlaying(true);
    expect(resizeObserverStub.isObserved(element)).to.be.true;

    // No size, but didn't have size before.
    resizeObserverStub.notifySync({
      target: element,
      borderBoxSize: [{inlineSize: 0, blockSize: 0}],
    });
    expect(element.pause).to.not.be.called;

    // Has size.
    resizeObserverStub.notifySync({
      target: element,
      borderBoxSize: [{inlineSize: 1, blockSize: 2}],
    });
    expect(element.pause).to.not.be.called;

    // No size, and had size before.
    resizeObserverStub.notifySync({
      target: element,
      borderBoxSize: [{inlineSize: 0, blockSize: 0}],
    });
    expect(element.pause).to.be.calledOnce;
  });

  it('should unobserve', () => {
    helper.updatePlaying(true);
    expect(resizeObserverStub.isObserved(element)).to.be.true;

    helper.updatePlaying(false);
    expect(resizeObserverStub.isObserved(element)).to.be.false;
  });
});
