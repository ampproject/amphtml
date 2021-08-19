import {
  ResizeObserverStub,
  installStub,
} from '#polyfills/stubs/resize-observer-stub';

import {upgradeResizeObserverPolyfill} from '../amp-resize-observer-polyfill';

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
