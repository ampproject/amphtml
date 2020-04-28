/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IntersectionObserverStub,
  resetSubsForTesting,
  shouldLoadPolyfill,
  upgradePolyfill,
} from '../../../src/polyfillstub/intersection-observer-stub';
import {
  install,
  installForChildWin,
} from '../../../src/polyfills/intersection-observer';

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

describes.sandboxed('shouldLoadPolyfill', {}, () => {
  it('should not load with native', () => {
    const win = {
      IntersectionObserver: NativeIntersectionObserver,
      IntersectionObserverEntry: NativeIntersectionObserverEntry,
    };
    expect(shouldLoadPolyfill(win)).to.be.false;
  });

  it('should load when no native', () => {
    const win = {};
    expect(shouldLoadPolyfill(win)).to.be.true;
  });

  it('should load with the stub', () => {
    const win = {
      IntersectionObserver: IntersectionObserverStub,
      IntersectionObserverEntry: NativeIntersectionObserverEntry,
    };
    expect(shouldLoadPolyfill(win)).to.be.true;
  });

  it('should load when no native entry', () => {
    const win = {
      IntersectionObserver: NativeIntersectionObserver,
    };
    expect(shouldLoadPolyfill(win)).to.be.true;
  });

  it('should not load even if entry doesn not have isIntersecting', () => {
    class IntersectionObserverEntryWithMissingIsIntersecting {}
    const win = {
      IntersectionObserver: NativeIntersectionObserver,
      IntersectionObserverEntry: IntersectionObserverEntryWithMissingIsIntersecting,
    };
    expect(shouldLoadPolyfill(win)).to.be.false;
  });
});

describes.fakeWin('install', {}, (env) => {
  it('should install IntersectionObserverStub when no native', () => {
    const {win} = env;
    delete win.IntersectionObserver;
    install(win);
    expect(win.IntersectionObserver).to.equal(IntersectionObserverStub);
  });

  it('should keep native when available', () => {
    const {win} = env;
    const native = function () {};
    win.IntersectionObserver = native;
    install(win);
    expect(win.IntersectionObserver).to.equal(native);
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
    expect(win.IntersectionObserver).to.equal(native);
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
    resetSubsForTesting();
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

  it('should run installer even when native is available', () => {
    const {win} = env;
    win.IntersectionObserver = NativeIntersectionObserver;
    win.IntersectionObserverEntry = NativeIntersectionObserverEntry;
    const upgradeCall = env.sandbox.spy();
    upgradePolyfill(win, function () {
      expect(win.IntersectionObserver).to.equal(NativeIntersectionObserver);
      expect(win.IntersectionObserverEntry).to.equal(
        NativeIntersectionObserverEntry
      );
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
    it('should disallow non-element root', () => {
      // Must fail on any non-element root. This is critical because this
      // failure is used as a feature-detection for document root support.
      expect(
        () => new IntersectionObserverStub(callback, {root: win.document})
      ).to.throw(/root must be an Element/);
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

    it('should not re-queue if nothing is currently observed', () => {
      const io = new IntersectionObserverStub(callback);
      io.observe(element1);
      io.unobserve(element1);
      const native = upgrade(io);
      expect(native.observe).to.not.be.called;
      expect(io.elements_).to.be.null;
    });

    it('should re-queue previously observed elements', () => {
      const io = new IntersectionObserverStub(callback);
      io.observe(element1);
      io.observe(element2);
      const native = upgrade(io);
      expect(native.observe).to.be.calledTwice;
      expect(native.observe).to.be.calledWith(element1);
      expect(native.observe).to.be.calledWith(element2);
      expect(io.elements_).to.be.null;
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
