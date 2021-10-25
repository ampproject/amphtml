import {install, installForChildWin} from '#polyfills/resize-observer';
import {
  ResizeObserverStub,
  installStub,
  resetStubsForTesting,
  shouldLoadPolyfill,
  upgradePolyfill,
} from '#polyfills/stubs/resize-observer-stub';

class NativeResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {}

  unobserve() {}

  disconnect() {}
}

class NativeResizeObserverEntry {
  get clientRect() {}
}

describes.sandboxed('shouldLoadPolyfill', {}, () => {
  it('should not load with native', () => {
    const win = {
      ResizeObserver: NativeResizeObserver,
      ResizeObserverEntry: NativeResizeObserverEntry,
    };
    expect(shouldLoadPolyfill(win)).to.be.false;
  });

  it('should load when no native', () => {
    const win = {};
    expect(shouldLoadPolyfill(win)).to.be.true;
  });

  it('should load with the stub', () => {
    const win = {};
    installStub(win);
    expect(shouldLoadPolyfill(win)).to.be.true;
  });
});

describes.fakeWin('install', {}, (env) => {
  it('should install ResizeObserverStub when no native', () => {
    const {win} = env;
    delete win.ResizeObserver;
    install(win);
    expect(win.ResizeObserver).to.equal(ResizeObserverStub);
  });

  it('should keep native when available', () => {
    const {win} = env;
    win.ResizeObserver = NativeResizeObserver;
    win.ResizeObserverEntry = NativeResizeObserverEntry;
    install(win);

    expect(win.ResizeObserver).to.equal(NativeResizeObserver);
    expect(win.ResizeObserverEntry).to.equal(NativeResizeObserverEntry);
  });
});

describes.fakeWin('installForChildWin', {}, (env) => {
  const ResizeObserver1 = function () {};
  const ResizeObserverEntry1 = function () {};
  const ResizeObserver2 = function () {};
  const ResizeObserverEntry2 = function () {};

  it('should install ResizeObserverStub when no native', () => {
    const {win} = env;
    delete win.ResizeObserver;
    const parentWin = {
      ResizeObserver: ResizeObserver1,
      ResizeObserverEntry: ResizeObserverEntry1,
    };
    installForChildWin(parentWin, win);
    expect(win.ResizeObserver).to.equal(ResizeObserver1);
    expect(win.ResizeObserverEntry).to.equal(ResizeObserverEntry1);

    // Change parent.
    parentWin.ResizeObserver = ResizeObserver2;
    parentWin.ResizeObserverEntry = ResizeObserverEntry2;
    expect(win.ResizeObserver).to.equal(ResizeObserver2);
    expect(win.ResizeObserverEntry).to.equal(ResizeObserverEntry2);
  });

  it('should keep native when available', () => {
    const {win} = env;
    win.ResizeObserver = NativeResizeObserver;
    win.ResizeObserverEntry = NativeResizeObserverEntry;
    const parentWin = {
      ResizeObserver: ResizeObserver1,
      ResizeObserverEntry: ResizeObserverEntry1,
    };
    installForChildWin(parentWin, win);
    expect(win.ResizeObserver).to.equal(NativeResizeObserver);
    expect(win.ResizeObserverEntry).to.equal(NativeResizeObserverEntry);
  });
});

describes.fakeWin('upgradePolyfill', {}, (env) => {
  beforeEach(() => {
    env.sandbox.stub(NativeResizeObserver.prototype, 'observe');
    env.sandbox.stub(NativeResizeObserver.prototype, 'disconnect');
  });

  afterEach(() => {
    resetStubsForTesting();
  });

  function nextMicroTask() {
    return Promise.resolve().then(() => Promise.resolve());
  }

  it('should reset stub before running the installer', () => {
    const {win} = env;
    delete win.ResizeObserver;
    install(win);
    expect(win.ResizeObserver).to.equal(ResizeObserverStub);

    upgradePolyfill(win, function () {
      expect(win.ResizeObserver).to.not.be.ok;
      expect(win.ResizeObserverEntry).to.not.be.ok;
    });
  });

  it('should upgrade all stubs', async () => {
    const {win} = env;
    delete win.ResizeObserver;
    install(win);

    const callback = function () {};
    const element1 = win.document.createElement('div');

    const ro1 = new win.ResizeObserver(callback);
    const ro2 = new win.ResizeObserver(callback);
    expect(ro1).to.be.instanceOf(ResizeObserverStub);
    expect(ro2).to.be.instanceOf(ResizeObserverStub);

    ro1.observe(element1);
    ro2.observe(element1);

    expect(NativeResizeObserver.prototype.observe).to.not.be.called;
    upgradePolyfill(win, function () {
      win.ResizeObserver = NativeResizeObserver;
      win.ResizeObserverEntry = NativeResizeObserverEntry;
    });

    await nextMicroTask();
    expect(NativeResizeObserver.prototype.observe).to.be.calledTwice;
    expect(NativeResizeObserver.prototype.observe).to.be.calledWith(element1);

    expect(NativeResizeObserver.prototype.disconnect).to.not.be.called;
    ro1.disconnect();
    ro2.disconnect();
    expect(NativeResizeObserver.prototype.disconnect).to.be.calledTwice;
  });

  it('should auto-upgrade any stub post upgrade', async () => {
    const {win} = env;
    delete win.ResizeObserver;
    install(win);
    expect(win.ResizeObserver).to.equal(ResizeObserverStub);

    upgradePolyfill(win, function () {
      win.ResizeObserver = NativeResizeObserver;
      win.ResizeObserverEntry = NativeResizeObserverEntry;
    });

    const callback = function () {};
    const element1 = win.document.createElement('div');

    const ro = new ResizeObserverStub(callback);

    await nextMicroTask();
    ro.observe(element1);
    expect(NativeResizeObserver.prototype.observe).to.be.calledOnce;
    expect(NativeResizeObserver.prototype.observe).to.be.calledWith(element1);
  });

  it('should run installer even when native is available', () => {
    const {win} = env;
    win.ResizeObserver = NativeResizeObserver;
    win.ResizeObserverEntry = NativeResizeObserverEntry;
    installStub(win);

    const upgradeCall = env.sandbox.spy();
    upgradePolyfill(win, function () {
      upgradeCall();
    });
    expect(upgradeCall).to.be.calledOnce;
  });
});

describes.fakeWin('ResizeObserverStub', {}, (env) => {
  let win;
  let callback;
  let element1;
  let element2;

  beforeEach(() => {
    win = env.win;
    callback = env.sandbox.spy();
    element1 = win.document.createElement('div');
    element2 = win.document.createElement('div');
  });

  it('should allow default constructor', () => {
    expect(() => new ResizeObserverStub(callback)).to.not.throw();
  });

  describe('observe/unobserve/disconnect', () => {
    it('should queue up elements when observed, but only once', () => {
      const ro = new ResizeObserverStub(callback);
      ro.observe(element1);
      expect(ro.elements_).to.deep.equal([element1]);
      ro.observe(element1);
      expect(ro.elements_).to.deep.equal([element1]);
      ro.observe(element2);
      expect(ro.elements_).to.deep.equal([element1, element2]);
    });

    it('should dequeue elements when observed', () => {
      const ro = new ResizeObserverStub(callback);
      ro.observe(element1);
      ro.observe(element2);
      expect(ro.elements_).to.deep.equal([element1, element2]);
      ro.unobserve(element1);
      expect(ro.elements_).to.deep.equal([element2]);
      ro.unobserve(element2);
      expect(ro.elements_).to.deep.equal([]);
      ro.unobserve(element1);
      ro.unobserve(element2);
      expect(ro.elements_).to.deep.equal([]);
    });

    it('should dequeue elements when disconnected', () => {
      const ro = new ResizeObserverStub(callback);
      ro.observe(element1);
      ro.observe(element2);
      expect(ro.elements_).to.deep.equal([element1, element2]);
      ro.disconnect();
      expect(ro.elements_).to.deep.equal([]);
      ro.disconnect();
      expect(ro.elements_).to.deep.equal([]);
    });
  });

  describe('upgrade', () => {
    beforeEach(() => {
      env.sandbox.stub(NativeResizeObserver.prototype, 'observe');
      env.sandbox.stub(NativeResizeObserver.prototype, 'unobserve');
      env.sandbox.stub(NativeResizeObserver.prototype, 'disconnect');
    });

    function upgrade(io) {
      io.upgrade_(NativeResizeObserver);
      return io.inst_;
    }

    it('should forward callback', () => {
      const ro = new ResizeObserverStub(callback);
      const native = upgrade(ro);
      expect(native.callback).to.equal(callback);
    });

    it('should not re-observe if nothing is currently observed', () => {
      const ro = new ResizeObserverStub(callback);
      ro.observe(element1);
      ro.unobserve(element1);
      const native = upgrade(ro);
      expect(native.observe).to.not.be.called;
      expect(ro.elements_.length).to.equal(0);
    });

    it('should re-observe previously observed elements', () => {
      const ro = new ResizeObserverStub(callback);
      ro.observe(element1);
      ro.observe(element2);
      const native = upgrade(ro);
      expect(native.observe).to.be.calledTwice;
      expect(native.observe).to.be.calledWith(element1);
      expect(native.observe).to.be.calledWith(element2);
      expect(ro.elements_.length).to.equal(0);
    });

    it('should observe new elements only on native', () => {
      const ro = new ResizeObserverStub(callback);
      const native = upgrade(ro);
      ro.observe(element1);
      expect(native.observe).to.be.calledOnce.calledWith(element1);
    });

    it('should unobserve new elements only on native', () => {
      const ro = new ResizeObserverStub(callback);
      const native = upgrade(ro);
      ro.unobserve(element1);
      expect(native.unobserve).to.be.calledOnce.calledWith(element1);
    });

    it('should disconnect on native', () => {
      const ro = new ResizeObserverStub(callback);
      const native = upgrade(ro);
      ro.disconnect();
      expect(native.disconnect).to.be.calledOnce;
    });
  });
});
