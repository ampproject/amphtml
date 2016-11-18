/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {AmpDocSingle} from '../../src/service/ampdoc-impl';
import {
  History,
  HistoryBindingNatural_,
  HistoryBindingVirtual_,
  installHistoryServiceForDoc,
} from '../../src/service/history-impl';
import {listenOncePromise} from '../../src/event-helper';
import {installTimerService} from '../../src/service/timer-impl';
import {parseUrl} from '../../src/url';
import * as sinon from 'sinon';


describes.fakeWin('History', {
  win: {
    location: '#first',
  },
}, env => {

  let sandbox;
  let clock;
  let bindingMock;
  let onStackIndexUpdated;
  let history;

  beforeEach(() => {
    installTimerService(env.win);
    sandbox = env.sandbox;
    clock = sandbox.useFakeTimers();

    const binding = {
      cleanup_: () => {},
      setOnStackIndexUpdated: callback => {
        onStackIndexUpdated = callback;
      },
      push: () => {},
      pop(unusedStackIndex) {},
      replaceStateForTarget: () => {},
    };
    bindingMock = sandbox.mock(binding);

    history = new History(new AmpDocSingle(env.win), binding);
  });

  afterEach(() => {
    bindingMock.verify();
  });

  it('should initialize correctly', () => {
    expect(history.stackIndex_).to.equal(0);
    expect(history.stackOnPop_.length).to.equal(0);
    expect(onStackIndexUpdated).to.not.equal(null);
  });

  it('should push new state', () => {
    const onPop = sandbox.spy();
    bindingMock.expects('push').withExactArgs()
        .returns(Promise.resolve(11)).once();
    return history.push(onPop).then(unusedHistoryId => {
      expect(history.stackIndex_).to.equal(11);
      expect(history.stackOnPop_.length).to.equal(12);
      expect(history.stackOnPop_[11]).to.equal(onPop);
      expect(onPop.callCount).to.equal(0);
    });
  });

  it('should pop previously pushed state', () => {
    const onPop = sandbox.spy();
    bindingMock.expects('push').withExactArgs()
        .returns(Promise.resolve(11)).once();
    bindingMock.expects('pop').withExactArgs(11)
        .returns(Promise.resolve(10)).once();
    return history.push(onPop).then(historyId => {
      expect(historyId).to.equal(11);
      expect(history.stackOnPop_.length).to.equal(12);
      expect(history.stackOnPop_[11]).to.equal(onPop);
      expect(onPop.callCount).to.equal(0);
      return history.pop(historyId).then(() => {
        expect(history.stackIndex_).to.equal(10);
        expect(history.stackOnPop_.length).to.equal(11);
        clock.tick(1);
        expect(onPop.callCount).to.equal(1);
      });
    });
  });

  it('should return and call callback when history popped', () => {
    const onPop = sandbox.spy();
    bindingMock.expects('push').withExactArgs()
        .returns(Promise.resolve(11)).once();
    return history.push(onPop).then(unusedHistoryId => {
      expect(onPop.callCount).to.equal(0);
      onStackIndexUpdated(10);
      clock.tick(1);
      expect(history.stackIndex_).to.equal(10);
      expect(history.stackOnPop_.length).to.equal(11);
      clock.tick(1);
      expect(onPop.callCount).to.equal(1);
    });
  });

  it('should push a new state and replace it for target', () => {
    bindingMock.expects('push').withExactArgs()
        .returns(Promise.resolve(11)).once();
    bindingMock.expects('pop')
        .returns(Promise.resolve(10)).once();
    bindingMock.expects('replaceStateForTarget').withExactArgs('#hello');
    return history.replaceStateForTarget('#hello').then(() => {
      return history.pop(history.stackIndex_).then(() => {
        clock.tick(1);
        expect(env.win.location.hash).to.equal('#first');
      });
    });
  });
});


describes.sandboxed('History install', {}, () => {
  let win;
  let ampdoc;
  let viewer;

  beforeEach(() => {
    viewer = {
      isOvertakeHistory: () => false,
      onHistoryPoppedEvent: () => function() {},
    };

    win = {
      services: {
        'viewer': {obj: viewer},
        'timer': {obj: installTimerService(window)},
      },
      history: {
        length: 0,
      },
      document: {
        body: {},
        querySelector: () => null,
      },
      location: parseUrl('https://cdn.ampproject.org/c/s/www.example.com/path'),
      addEventListener: () => null,
    };
    ampdoc = new AmpDocSingle(win);
  });

  it('should create natural binding and make it singleton', () => {
    const history = installHistoryServiceForDoc(ampdoc);
    expect(history.binding_).to.be.instanceOf(HistoryBindingNatural_);
    expect(win.services.history.obj).to.equal(history);
    // Ensure that binding is installed as a singleton.
    expect(win.services['global-history-binding'].obj)
        .to.equal(history.binding_);
  });

  it('should create virtual binding', () => {
    viewer.isOvertakeHistory = () => true;
    const history = installHistoryServiceForDoc(ampdoc);
    expect(history.binding_).to.be.instanceOf(HistoryBindingVirtual_);
    expect(win.services.history.obj).to.equal(history);
    // Ensure that the global singleton has not been created.
    expect(win.services['global-history-binding']).to.not.exist;
  });
});


describes.sandboxed('HistoryBindingNatural', {}, () => {
  let clock;
  let onStackIndexUpdated;
  let history;

  beforeEach(() => {
    clock = sandbox.useFakeTimers();
    onStackIndexUpdated = sandbox.spy();
    history = new HistoryBindingNatural_(window);
    history.setOnStackIndexUpdated(onStackIndexUpdated);
  });

  afterEach(() => {
    history.cleanup_();
  });

  it('should initialize correctly', () => {
    expect(history.stackIndex_).to.equal(window.history.length - 1);
    expect(history.startIndex_).to.equal(window.history.length - 1);
    expect(history.unsupportedState_['AMP.History']).to.equal(
        window.history.length - 1);
    expect(onStackIndexUpdated.callCount).to.equal(0);
  });

  it('should initialize correctly with preexisting state', () => {
    history.origPushState_({'AMP.History': window.history.length}, undefined);
    history.origReplaceState_({'AMP.History': window.history.length - 2},
        undefined);
    const history2 = new HistoryBindingNatural_(window);
    expect(history2.stackIndex_).to.equal(window.history.length - 2);
    expect(history2.startIndex_).to.equal(window.history.length - 2);
    expect(history.unsupportedState_['AMP.History']).to.equal(
        window.history.length - 2);
    history2.cleanup_();
    history.origReplaceState_({'AMP.History': window.history.length - 1},
        undefined);
    expect(onStackIndexUpdated.callCount).to.equal(0);
  });

  it('should override history.pushState and set its properties', () => {
    window.history.pushState({a: 111});
    expect(history.unsupportedState_.a).to.equal(111);
    expect(history.unsupportedState_['AMP.History']).to.equal(
        window.history.length - 1);
    expect(onStackIndexUpdated.callCount).to.equal(1);
    expect(onStackIndexUpdated.getCall(0).args[0]).to.equal(
        window.history.length - 1);
  });

  it('should override history.replaceState and set its properties', () => {
    window.history.replaceState({a: 112});
    expect(history.unsupportedState_.a).to.equal(112);
    expect(history.unsupportedState_['AMP.History']).to.equal(
        window.history.length - 1);
    expect(onStackIndexUpdated.callCount).to.equal(0);
  });

  // This prevents IE11/Edge from coercing undefined to become the new url
  it('should not pass in `url` argument to original replace state if ' +
    'parameter is undefined', () => {
    const replaceStateSpy = sandbox.spy();
    const windowStub = {
      history: {
        replaceState: replaceStateSpy,
        pushState: () => {},
        state: {},
        length: 11,
      },
      addEventListener: () => {},
      setTimeout: window.setTimeout,
      clearTimeout: window.clearTimeout,
    };
    installTimerService(windowStub);
    new HistoryBindingNatural_(windowStub);
    expect(replaceStateSpy.callCount).to.be.greaterThan(0);
    expect(replaceStateSpy.lastCall.args.length).to.equal(2);
  });

  it('should push new state in the window.history and notify', () => {
    return history.push().then(stackIndex => {
      expect(history.stackIndex_).to.equal(stackIndex);
      expect(history.stackIndex_).to.equal(window.history.length - 1);
      expect(history.unsupportedState_['AMP.History']).to.equal(
          window.history.length - 1);
      expect(onStackIndexUpdated.callCount).to.equal(1);
      expect(onStackIndexUpdated.getCall(0).args[0]).to.equal(
          window.history.length - 1);
    });
  });

  it('should pop a state from the window.history and notify', () => {
    return history.push().then(stackIndex => {
      expect(onStackIndexUpdated.callCount).to.equal(1);
      expect(onStackIndexUpdated.getCall(0).args[0]).to.equal(
          window.history.length - 1);
      const histPromise = listenOncePromise(window, 'popstate').then(() => {
        clock.tick(100);
      });
      const popPromise = history.pop(stackIndex);
      return histPromise.then(unusedHist => {
        return popPromise.then(pop => {
          expect(pop).to.equal(window.history.length - 2);
          expect(history.stackIndex_).to.equal(window.history.length - 2);
          expect(history.unsupportedState_['AMP.History']).to.equal(
              window.history.length - 2);
          expect(onStackIndexUpdated.callCount).to.equal(2);
          expect(onStackIndexUpdated.getCall(1).args[0]).to.equal(
              window.history.length - 2);
        });
      });
    });
  });

  it('should update its state and notify on history.back', () => {
    return history.push().then(unusedStackIndex => {
      expect(onStackIndexUpdated.callCount).to.equal(1);
      expect(onStackIndexUpdated.getCall(0).args[0]).to.equal(
          window.history.length - 1);
      const histPromise = listenOncePromise(window, 'popstate').then(() => {
        clock.tick(100);
      });
      window.history.go(-1);
      return histPromise.then(() => {
        clock.tick(100);
        expect(history.stackIndex_).to.equal(window.history.length - 2);
        expect(history.unsupportedState_['AMP.History']).to.equal(
            window.history.length - 2);
        expect(onStackIndexUpdated.callCount).to.equal(2);
        expect(onStackIndexUpdated.getCall(1).args[0]).to.equal(
            window.history.length - 2);
      });
    });
  });
});


describe('HistoryBindingVirtual', () => {

  let sandbox;
  let clock;
  let onStackIndexUpdated;
  let viewerHistoryPoppedHandler;
  let viewerMock;
  let history;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    onStackIndexUpdated = sandbox.spy();
    viewerHistoryPoppedHandler = undefined;
    const viewer = {
      onHistoryPoppedEvent: handler => {
        viewerHistoryPoppedHandler = handler;
        return () => {};
      },
      postPushHistory: unusedStackIndex => {},
      postPopHistory: unusedStackIndex => {},
    };
    viewerMock = sandbox.mock(viewer);
    history = new HistoryBindingVirtual_(window, viewer);
    history.setOnStackIndexUpdated(onStackIndexUpdated);
  });

  afterEach(() => {
    viewerMock.verify();
    history.cleanup_();
    sandbox.restore();
  });

  it('should initialize correctly', () => {
    expect(history.stackIndex_).to.equal(0);
    expect(onStackIndexUpdated.callCount).to.equal(0);
    expect(viewerHistoryPoppedHandler).to.not.equal(undefined);
  });

  it('should push new state to viewer and notify', () => {
    viewerMock.expects('postPushHistory').withExactArgs(1).once().returns(
        Promise.resolve());
    return history.push().then(stackIndex => {
      expect(stackIndex).to.equal(1);
      expect(history.stackIndex_).to.equal(1);
      expect(onStackIndexUpdated.callCount).to.equal(1);
      expect(onStackIndexUpdated.getCall(0).args[0]).to.equal(1);
    });
  });

  it('should pop a state from the window.history and notify', () => {
    viewerMock.expects('postPushHistory').withExactArgs(1).once().returns(
        Promise.resolve());
    viewerMock.expects('postPopHistory').withExactArgs(1).once().returns(
        Promise.resolve());
    return history.push().then(stackIndex => {
      expect(stackIndex).to.equal(1);
      expect(onStackIndexUpdated.callCount).to.equal(1);
      expect(onStackIndexUpdated.getCall(0).args[0]).to.equal(1);
      return history.pop(stackIndex).then(newStackIndex => {
        expect(newStackIndex).to.equal(0);
        expect(history.stackIndex_).to.equal(0);
        expect(onStackIndexUpdated.callCount).to.equal(2);
        expect(onStackIndexUpdated.getCall(1).args[0]).to.equal(0);
      });
    });
  });

  it('should update its state and notify on history.back', () => {
    viewerMock.expects('postPushHistory').withExactArgs(1).once().returns(
        Promise.resolve());
    return history.push().then(stackIndex => {
      expect(stackIndex).to.equal(1);
      expect(onStackIndexUpdated.callCount).to.equal(1);
      expect(onStackIndexUpdated.getCall(0).args[0]).to.equal(1);
      viewerHistoryPoppedHandler({newStackIndex: 0});
      clock.tick(1);
      expect(history.stackIndex_).to.equal(0);
      expect(onStackIndexUpdated.callCount).to.equal(2);
      expect(onStackIndexUpdated.getCall(1).args[0]).to.equal(0);
    });
  });
});

describes.fakeWin('Local Hash Navigation', {
  win: {
    location: '#first',
  },
}, env => {

  let sandbox;
  let clock;
  let history;

  beforeEach(() => {
    installTimerService(env.win);
    sandbox = env.sandbox;
    clock = sandbox.useFakeTimers();
  });

  afterEach(() => {
    if (history) {
      history.cleanup_();
    }
  });

  it('should push a new state and replace it for target on Natural', () => {
    history = new History(new AmpDocSingle(env.win),
        new HistoryBindingNatural_(env.win));
    const startIndex = env.win.history.index;
    return history.replaceStateForTarget('#hello').then(() => {
      clock.tick(1);
      expect(env.win.location.hash).to.equal('#hello');
      expect(env.win.history.index).to.equal(startIndex + 1);
      const historyPopPromise = history.pop(history.stackIndex_);

      clock.tick(1);
      return historyPopPromise.then(() => {
        expect(env.win.location.hash).to.equal('#first');
        expect(env.win.history.index).to.equal(startIndex);
      });
    });
  });

  it('should push a new state and replace it for target on Virtual', () => {
    const viewer = {
      onHistoryPoppedEvent: () => {
        return () => {};
      },
      postPushHistory: unusedStackIndex => {},
      postPopHistory: unusedStackIndex => {},
    };
    const viewerMock = sandbox.mock(viewer);
    history = new History(new AmpDocSingle(env.win),
        new HistoryBindingVirtual_(env.win, viewer));
    const startIndex = history.stackIndex_;

    viewerMock.expects('postPushHistory').withExactArgs(1).once().returns(
        Promise.resolve());
    viewerMock.expects('postPopHistory').withExactArgs(1).once().returns(
        Promise.resolve());
    return history.replaceStateForTarget('#hello').then(() => {
      clock.tick(1);
      expect(env.win.location.hash).to.equal('#hello');
      expect(history.stackIndex_).to.equal(startIndex + 1);
      return history.pop(history.stackIndex_).then(() => {
        clock.tick(1);
        expect(env.win.location.hash).to.equal('#first');
        expect(history.stackIndex_).to.equal(startIndex);
      });
    });
  });
});
