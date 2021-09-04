import {install, installForChildWin} from '#polyfills/intersection-observer';
import {
  IntersectionObserverStub,
  installStub,
  resetStubsForTesting,
  shouldLoadPolyfill,
  upgradePolyfill,
} from '#polyfills/stubs/intersection-observer-stub';

import {Services} from '#service';

class NativeIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }

  get root() {
    return 'native.root';
  }

  get rootMargin() {
    return 'native.rootMargin';
  }

  get thresholds() {
    return 'native.thresholds';
  }

  takeRecords() {
    return 'native.takeRecords';
  }

  observe() {}

  unobserve() {}

  disconnect() {}
}

class NativeIntersectionObserverEntry {
  get isIntersecting() {}
}

const APPLE_NAVIGATOR = {vendor: 'Apple Computer, Inc.'};
const CHROME_NAVIGATOR = {vendor: 'Google Inc.'};

describes.sandboxed('shouldLoadPolyfill', {}, (env) => {
  let isIos;
  let isSafari;
  beforeEach(() => {
    isIos = false;
    isSafari = false;
    const platform = {isIos: () => isIos, isSafari: () => isSafari};
    env.sandbox.stub(Services, 'platformFor').returns(platform);
  });

  it('should not load with native', () => {
    const win = {
      IntersectionObserver: NativeIntersectionObserver,
      IntersectionObserverEntry: NativeIntersectionObserverEntry,
      navigator: CHROME_NAVIGATOR,
    };
    expect(shouldLoadPolyfill(win)).to.be.false;
  });

  it('should always load in WebKit/Safari', () => {
    const win = {
      IntersectionObserver: NativeIntersectionObserver,
      IntersectionObserverEntry: NativeIntersectionObserverEntry,
      navigator: CHROME_NAVIGATOR,
    };
    expect(shouldLoadPolyfill(win)).to.be.false;

    win.navigator = APPLE_NAVIGATOR;
    expect(shouldLoadPolyfill(win)).to.be.true;
  });

  it('should load when native does not support {root: document}', () => {
    class NativeNoDocumentRoot {
      constructor(_unused, opts) {
        if (opts && opts.root && opts.root.nodeType !== 1) {
          throw new TypeError('Root must be an Element');
        }
      }
    }
    const win = {
      IntersectionObserver: NativeNoDocumentRoot,
      IntersectionObserverEntry: NativeIntersectionObserverEntry,
      document: {nodeType: 9},
      navigator: CHROME_NAVIGATOR,
    };
    expect(shouldLoadPolyfill(win)).to.be.true;
  });

  it('should load when no native', () => {
    const win = {};
    expect(shouldLoadPolyfill(win)).to.be.true;
  });

  it('should load with the stub', () => {
    const win = {
      IntersectionObserver: IntersectionObserverStub,
      IntersectionObserverEntry: NativeIntersectionObserverEntry,
      navigator: CHROME_NAVIGATOR,
    };
    installStub(win);
    expect(shouldLoadPolyfill(win)).to.be.true;
  });

  it('should load when no native entry', () => {
    const win = {
      IntersectionObserver: NativeIntersectionObserver,
      navigator: CHROME_NAVIGATOR,
    };
    expect(shouldLoadPolyfill(win)).to.be.true;
  });
});

describes.fakeWin('install', {}, (env) => {
  it('should install IntersectionObserverStub when no native', () => {
    const {win} = env;
    delete win.IntersectionObserver;
    install(win);
    expect(win.IntersectionObserver).to.equal(IntersectionObserverStub);
  });

  it('Unsupported root:document: should return native when non-document root requested', () => {
    const {win} = env;
    const native = function () {};
    win.IntersectionObserver = native;
    install(win);
    expect(new win.IntersectionObserver(() => {})).instanceOf(native);
    expect(
      new win.IntersectionObserver(() => {
        root: null;
      })
    ).instanceOf(native);
    expect(
      new win.IntersectionObserver(() => {
        root: {
          nodeType: 1;
        }
      })
    ).instanceOf(native);
  });

  it('should return stub when {root:document} requested', () => {
    const {win} = env;
    const native = function () {
      return 'native';
    };
    win.IntersectionObserver = native;
    install(win);
    expect(
      new win.IntersectionObserver(() => {}, {root: document})
    ).to.be.instanceOf(IntersectionObserverStub);
  });

  it('should polyfill isIntersecting when absent in native', () => {
    const {win} = env;
    const native = function () {};
    const nativeEntry = function () {};
    win.IntersectionObserver = native;
    win.IntersectionObserverEntry = nativeEntry;
    expect('isIntersecting' in win.IntersectionObserverEntry.prototype).to.be
      .false;
    install(win);
    expect(win.IntersectionObserverEntry).to.equal(nativeEntry);
    expect('isIntersecting' in win.IntersectionObserverEntry.prototype).to.be
      .true;

    const entry = new win.IntersectionObserverEntry();
    expect(entry).to.be.instanceOf(nativeEntry);
    entry.intersectionRatio = 0;
    expect(entry.isIntersecting).to.be.false;
    entry.intersectionRatio = 1;
    expect(entry.isIntersecting).to.be.true;
  });

  it('should keep native isIntersecting when available', () => {
    const {win} = env;
    const native = function () {};
    const nativeEntry = function () {};
    Object.defineProperty(nativeEntry.prototype, 'isIntersecting', {
      value: 'A',
    });
    win.IntersectionObserver = native;
    win.IntersectionObserverEntry = nativeEntry;
    expect('isIntersecting' in win.IntersectionObserverEntry.prototype).to.be
      .true;
    install(win);

    const entry = new win.IntersectionObserverEntry();
    expect(entry).to.be.instanceOf(nativeEntry);
    entry.intersectionRatio = 0;
    expect(entry.isIntersecting).to.equal('A');
    entry.intersectionRatio = 1;
    expect(entry.isIntersecting).to.equal('A');
  });
});

describes.fakeWin('installForChildWin', {}, (env) => {
  const IntersectionObserver1 = function () {};
  const IntersectionObserverEntry1 = function () {};
  const IntersectionObserver2 = function () {};
  const IntersectionObserverEntry2 = function () {};

  it('should install IntersectionObserverStub when no native', () => {
    const {win} = env;
    delete win.IntersectionObserver;
    const parentWin = {
      IntersectionObserver: IntersectionObserver1,
      IntersectionObserverEntry: IntersectionObserverEntry1,
    };
    installForChildWin(parentWin, win);
    expect(win.IntersectionObserver).to.equal(IntersectionObserver1);
    expect(win.IntersectionObserverEntry).to.equal(IntersectionObserverEntry1);

    // Change parent.
    parentWin.IntersectionObserver = IntersectionObserver2;
    parentWin.IntersectionObserverEntry = IntersectionObserverEntry2;
    expect(win.IntersectionObserver).to.equal(IntersectionObserver2);
    expect(win.IntersectionObserverEntry).to.equal(IntersectionObserverEntry2);
  });

  it('should install IntersectionObserverStub when native does not support document root', () => {
    const {win} = env;
    win.IntersectionObserver = function (callback, opts) {
      if (opts && opts.root && opts.root.nodeType !== 1) {
        throw new TypeError('Root must be an Element');
      }
    };
    const parentWin = {
      IntersectionObserver: IntersectionObserver1,
      IntersectionObserverEntry: IntersectionObserverEntry1,
    };
    installForChildWin(parentWin, win);
    expect(win.IntersectionObserver).to.equal(IntersectionObserver1);
    expect(win.IntersectionObserverEntry).to.equal(IntersectionObserverEntry1);

    // Change parent.
    parentWin.IntersectionObserver = IntersectionObserver2;
    parentWin.IntersectionObserverEntry = IntersectionObserverEntry2;
    expect(win.IntersectionObserver).to.equal(IntersectionObserver2);
    expect(win.IntersectionObserverEntry).to.equal(IntersectionObserverEntry2);
  });

  it('should keep native when available', () => {
    const {win} = env;
    const native = function () {};
    const nativeEntry = function () {};
    win.IntersectionObserver = native;
    win.IntersectionObserverEntry = nativeEntry;
    const parentWin = {
      IntersectionObserver: IntersectionObserver1,
      IntersectionObserverEntry: IntersectionObserverEntry1,
    };
    installForChildWin(parentWin, win);
    expect(win.IntersectionObserver).to.equal(native);
    expect(win.IntersectionObserverEntry).to.equal(nativeEntry);
  });
});

describes.fakeWin('upgradePolyfill', {}, (env) => {
  beforeEach(() => {
    env.sandbox.stub(NativeIntersectionObserver.prototype, 'observe');
    env.sandbox.stub(NativeIntersectionObserver.prototype, 'disconnect');
  });

  afterEach(() => {
    resetStubsForTesting();
  });

  function nextMicroTask() {
    return Promise.resolve().then(() => Promise.resolve());
  }

  it('should reset stub before running the installer', () => {
    const {win} = env;
    delete win.IntersectionObserver;
    install(win);
    expect(win.IntersectionObserver).to.equal(IntersectionObserverStub);

    upgradePolyfill(win, function () {
      expect(win.IntersectionObserver).to.not.be.ok;
      expect(win.IntersectionObserverEntry).to.not.be.ok;
    });
  });

  it('should upgrade all stubs', async () => {
    const {win} = env;
    delete win.IntersectionObserver;
    install(win);

    const callback = function () {};
    const element1 = win.document.createElement('div');

    const io1 = new win.IntersectionObserver(callback);
    const io2 = new win.IntersectionObserver(callback);
    expect(io1).to.be.instanceOf(IntersectionObserverStub);
    expect(io2).to.be.instanceOf(IntersectionObserverStub);

    io1.observe(element1);
    io2.observe(element1);

    expect(NativeIntersectionObserver.prototype.observe).to.not.be.called;
    upgradePolyfill(win, function () {
      win.IntersectionObserver = NativeIntersectionObserver;
      win.IntersectionObserverEntry = NativeIntersectionObserverEntry;
    });

    await nextMicroTask();
    expect(NativeIntersectionObserver.prototype.observe).to.be.calledTwice;
    expect(NativeIntersectionObserver.prototype.observe).to.be.calledWith(
      element1
    );

    expect(NativeIntersectionObserver.prototype.disconnect).to.not.be.called;
    io1.disconnect();
    io2.disconnect();
    expect(NativeIntersectionObserver.prototype.disconnect).to.be.calledTwice;
  });

  it('should auto-upgrade any stub post upgrade', async () => {
    const {win} = env;
    delete win.IntersectionObserver;
    install(win);
    expect(win.IntersectionObserver).to.equal(IntersectionObserverStub);

    upgradePolyfill(win, function () {
      win.IntersectionObserver = NativeIntersectionObserver;
      win.IntersectionObserverEntry = NativeIntersectionObserverEntry;
    });

    const callback = function () {};
    const element1 = win.document.createElement('div');

    const io = new IntersectionObserverStub(callback);

    await nextMicroTask();
    io.observe(element1);
    expect(NativeIntersectionObserver.prototype.observe).to.be.calledOnce;
    expect(NativeIntersectionObserver.prototype.observe).to.be.calledWith(
      element1
    );
  });

  it('should choose best InOb possible before and after upgrade, as well as upgrade rootdoc stubs.', async () => {
    const {win} = env;
    function NativeInOb(_ioCallback, opts) {
      if (opts && opts.root && opts.root.nodeType === 9) {
        throw new Error('May not have root:document');
      }
    }
    win.IntersectionObserver = NativeInOb;
    const docRoot = {root: {nodeType: 9}};

    install(win);
    expect(new win.IntersectionObserver(() => {})).instanceOf(NativeInOb);
    expect(new win.IntersectionObserver(() => {}, docRoot)).instanceOf(
      IntersectionObserverStub
    );
    upgradePolyfill(win, function () {
      win.IntersectionObserver = NativeIntersectionObserver; // Native is the wrong name, its really Polyfilled.
      win.IntersectionObserverEntry = NativeIntersectionObserverEntry;
    });

    const el = win.document.createElement('div');
    const io = new IntersectionObserverStub(() => {}, docRoot);
    io.observe(el);
    await nextMicroTask();

    expect(NativeIntersectionObserver.prototype.observe).to.be.calledOnce;
    expect(NativeIntersectionObserver.prototype.observe).to.be.calledWith(el);
    expect(new win.IntersectionObserver(() => {})).instanceOf(NativeInOb);
  });

  it('should run installer even when native is available', () => {
    const {win} = env;
    win.IntersectionObserver = NativeIntersectionObserver;
    win.IntersectionObserverEntry = NativeIntersectionObserverEntry;
    installStub(win);

    const upgradeCall = env.sandbox.spy();
    upgradePolyfill(win, function () {
      upgradeCall();
    });
    expect(upgradeCall).to.be.calledOnce;
  });
});

describes.fakeWin('IntersectionObserverStub', {}, (env) => {
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

  describe('constructor', () => {
    it('should allow Document root', () => {
      const io = new IntersectionObserverStub(callback, {root: win.document});
      expect(io.root).to.eql(win.document);
      expect(io.rootMargin).to.equal('0px 0px 0px 0px');
      expect(io.thresholds).to.deep.equal([0]);
    });

    it('should allow default options', () => {
      const io = new IntersectionObserverStub(callback);
      expect(io.root).to.be.null;
      expect(io.rootMargin).to.equal('0px 0px 0px 0px');
      expect(io.thresholds).to.deep.equal([0]);
    });

    it('should allow null root', () => {
      const io = new IntersectionObserverStub(callback, {root: null});
      expect(io.root).to.be.null;
      expect(io.rootMargin).to.equal('0px 0px 0px 0px');
      expect(io.thresholds).to.deep.equal([0]);
    });

    it('should allow element root', () => {
      const element = win.document.createElement('div');
      const io = new IntersectionObserverStub(callback, {root: element});
      expect(io.root).to.equal(element);
    });

    it('should override rootMargin', () => {
      const io = new IntersectionObserverStub(callback, {rootMargin: '10px'});
      expect(io.rootMargin).to.equal('10px');
    });

    it('should override threshold as number', () => {
      const io = new IntersectionObserverStub(callback, {threshold: 0.1});
      expect(io.thresholds).to.deep.equal([0.1]);
    });

    it('should override threshold as array', () => {
      const io = new IntersectionObserverStub(callback, {
        threshold: [0.1, 0.2],
      });
      expect(io.thresholds).to.deep.equal([0.1, 0.2]);
    });
  });

  describe('takeRecords', () => {
    it('should always be empty', () => {
      const io = new IntersectionObserverStub(callback);
      expect(io.takeRecords()).to.deep.equal([]);
    });
  });

  describe('observe/unobserve/disconnect', () => {
    it('should queue up elements when observed, but only once', () => {
      const io = new IntersectionObserverStub(callback);
      io.observe(element1);
      expect(io.elements_).to.deep.equal([element1]);
      io.observe(element1);
      expect(io.elements_).to.deep.equal([element1]);
      io.observe(element2);
      expect(io.elements_).to.deep.equal([element1, element2]);
    });

    it('should dequeue elements when observed', () => {
      const io = new IntersectionObserverStub(callback);
      io.observe(element1);
      io.observe(element2);
      expect(io.elements_).to.deep.equal([element1, element2]);
      io.unobserve(element1);
      expect(io.elements_).to.deep.equal([element2]);
      io.unobserve(element2);
      expect(io.elements_).to.deep.equal([]);
      io.unobserve(element1);
      io.unobserve(element2);
      expect(io.elements_).to.deep.equal([]);
    });

    it('should dequeue elements when disconnected', () => {
      const io = new IntersectionObserverStub(callback);
      io.observe(element1);
      io.observe(element2);
      expect(io.elements_).to.deep.equal([element1, element2]);
      io.disconnect();
      expect(io.elements_).to.deep.equal([]);
      io.disconnect();
      expect(io.elements_).to.deep.equal([]);
    });
  });

  describe('upgrade', () => {
    beforeEach(() => {
      env.sandbox.stub(NativeIntersectionObserver.prototype, 'observe');
      env.sandbox.stub(NativeIntersectionObserver.prototype, 'unobserve');
      env.sandbox.stub(NativeIntersectionObserver.prototype, 'disconnect');
    });

    function upgrade(io) {
      io.upgrade_(NativeIntersectionObserver);
      return io.inst_;
    }

    it('should forward callback and default options', () => {
      const io = new IntersectionObserverStub(callback);
      const native = upgrade(io);
      expect(native.callback).to.equal(callback);
      expect(native.options).to.deep.equal({
        root: null,
        rootMargin: '0px 0px 0px 0px',
      });
    });

    it('should forward custom options', () => {
      const io = new IntersectionObserverStub(callback, {
        root: element1,
        rootMargin: '10px',
        threshold: 0.1,
      });
      const native = upgrade(io);
      expect(native.options).to.deep.equal({
        root: element1,
        rootMargin: '10px',
        threshold: 0.1,
      });
    });

    it('should delegate getters to the native', () => {
      const io = new IntersectionObserverStub(callback);
      upgrade(io);
      expect(io.root).to.equal('native.root');
      expect(io.rootMargin).to.equal('native.rootMargin');
      expect(io.thresholds).to.equal('native.thresholds');
      expect(io.takeRecords()).to.equal('native.takeRecords');
    });

    it('should not re-observe if nothing is currently observed', () => {
      const io = new IntersectionObserverStub(callback);
      io.observe(element1);
      io.unobserve(element1);
      const native = upgrade(io);
      expect(native.observe).to.not.be.called;
      expect(io.elements_.length).to.equal(0);
    });

    it('should re-observe previously observed elements', () => {
      const io = new IntersectionObserverStub(callback);
      io.observe(element1);
      io.observe(element2);
      const native = upgrade(io);
      expect(native.observe).to.be.calledTwice;
      expect(native.observe).to.be.calledWith(element1);
      expect(native.observe).to.be.calledWith(element2);
      expect(io.elements_.length).to.equal(0);
    });

    it('should observe new elements only on native', () => {
      const io = new IntersectionObserverStub(callback);
      const native = upgrade(io);
      io.observe(element1);
      expect(native.observe).to.be.calledOnce.calledWith(element1);
    });

    it('should unobserve new elements only on native', () => {
      const io = new IntersectionObserverStub(callback);
      const native = upgrade(io);
      io.unobserve(element1);
      expect(native.unobserve).to.be.calledOnce.calledWith(element1);
    });

    it('should disconnect on native', () => {
      const io = new IntersectionObserverStub(callback);
      const native = upgrade(io);
      io.disconnect();
      expect(native.disconnect).to.be.calledOnce;
    });
  });
});
