import {upgradeResizeObserverPolyfill} from '#extensions/amp-resize-observer-polyfill/0.1/amp-resize-observer-polyfill';

import {
  ResizeObserverStub,
  installStub,
} from '#polyfills/stubs/resize-observer-stub';

describes.realWin('amp-resize-observer-polyfill', {amp: false}, (env) => {
  let win;

  beforeEach(() => {
    win = env.win;
    delete win.ResizeObserver;
    installStub(win);
  });

  it('should install ResizeObserver polyfill', () => {
    expect(win.ResizeObserver).to.equal(ResizeObserverStub);
    upgradeResizeObserverPolyfill(win);
    expect(win.ResizeObserver).to.exist;
    expect(win.ResizeObserver).to.not.equal(ResizeObserverStub);
  });
});
