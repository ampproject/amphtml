/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
  activateChunkingForTesting,
  chunkInstanceForTesting,
  deactivateChunking,
  onIdle,
  startupChunk,
} from '../../src/chunk';
import {installDocService} from '../../src/service/ampdoc-impl';
import {viewerForDoc, viewerPromiseForDoc} from '../../src/services';
import * as sinon from 'sinon';


describe('chunk', () => {

  beforeEach(() => {
    activateChunkingForTesting();
  });

  const resolvingIdleCallbackWithTimeRemaining = timeRemaining => fn => {
    Promise.resolve({
      timeRemaining: () => timeRemaining,
    }).then(fn);
  };

  function basicTests(env) {
    let fakeWin;

    beforeEach(() => {
      fakeWin = env.win;
      // If there is a viewer, wait for it, so we run with it being
      // installed.
      if (env.win.services.viewer) {
        return viewerPromiseForDoc(env.win.document).then(() => {
          // Make sure we make a chunk instance, so all runs
          // have a viewer.
          chunkInstanceForTesting(env.win.document);
        });
      }
    });

    it('should execute a chunk', done => {
      startupChunk(fakeWin.document, unusedIdleDeadline => {
        done();
      });
    });

    it('should execute chunks', done => {
      let count = 0;
      let progress = '';
      function complete(str) {
        return function(unusedIdleDeadline) {
          progress += str;
          if (++count == 6) {
            expect(progress).to.equal('abcdef');
            done();
          }
        };
      }
      startupChunk(fakeWin.document, complete('a'));
      startupChunk(fakeWin.document, complete('b'));
      startupChunk(fakeWin.document, function() {
        complete('c')();
        startupChunk(fakeWin.document, function() {
          complete('d')();
          startupChunk(fakeWin.document, complete('e'));
          startupChunk(fakeWin.document, complete('f'));
        });
      });
    });
  }

  describes.fakeWin('visible no amp', {
    amp: false,
  }, env => {

    beforeEach(() => {
      installDocService(env.win, /* isSingleDoc */ true);
      expect(env.win.services.viewer).to.be.undefined;
      env.win.document.hidden = false;
    });

    basicTests(env);
  });

  describes.fakeWin('invisible no amp', {
    amp: false,
  }, env => {

    beforeEach(() => {
      installDocService(env.win, /* isSingleDoc */ true);
      expect(env.win.services.viewer).to.be.undefined;
      env.win.document.hidden = true;
      env.win.requestIdleCallback = function() {
        throw new Error('Should not be called');
      };
      env.win.postMessage = function(data, targetOrigin) {
        expect(targetOrigin).to.equal('*');
        Promise.resolve().then(() => {
          const event = {
            data,
            type: 'message',
          };
          env.win.eventListeners.fire(event);
        });
      };
    });

    basicTests(env);
  });

  describes.fakeWin('with viewer', {
    amp: true,
  }, env => {

    beforeEach(() => {
      expect(env.win.services.viewer).to.not.be.undefined;
      env.win.document.hidden = false;
    });

    describe('visible', () => {
      beforeEach(() => {
        const viewer = viewerForDoc(env.win.document);
        env.sandbox.stub(viewer, 'isVisible', () => {
          return true;
        });
      });
      basicTests(env);
    });

    describe.configure().skip(() => !('onunhandledrejection' in window))
    .run('error handling', () => {
      let fakeWin;
      let done;

      function onReject(event) {
        expect(event.reason.message).to.match(/test async/);
        done();
      }

      beforeEach(() => {
        fakeWin = env.win;
        const viewer = viewerForDoc(env.win.document);
        env.sandbox.stub(viewer, 'isVisible', () => {
          return true;
        });
        window.addEventListener('unhandledrejection', onReject);
      });

      afterEach(() => {
        window.removeEventListener('unhandledrejection', onReject);
      });

      it('should proceed on error and rethrowAsync', d => {
        startupChunk(fakeWin.document, () => {
          throw new Error('test async');
        });
        startupChunk(fakeWin.document, () => {
          done = d;
        });
      });
    });

    describe('invisible', () => {
      beforeEach(() => {
        const viewer = viewerForDoc(env.win.document);
        env.sandbox.stub(viewer, 'isVisible', () => {
          return false;
        });
        env.win.requestIdleCallback =
            resolvingIdleCallbackWithTimeRemaining(15);
        const chunks = chunkInstanceForTesting(env.win.document);
        env.sandbox.stub(chunks, 'executeAsap_', () => {
          throw new Error('No calls expected: executeAsap_');
        });
        env.win.location.resetHref('test#visibilityState=hidden');
      });

      basicTests(env);
    });

    describe('invisible but deactivated', () => {
      beforeEach(() => {
        deactivateChunking();
        const viewer = viewerForDoc(env.win.document);
        env.sandbox.stub(viewer, 'isVisible', () => {
          return false;
        });
        env.win.requestIdleCallback = () => {
          throw new Error('No calls expected');
        };
        env.win.location.resetHref('test#visibilityState=hidden');
      });

      basicTests(env);
    });

    describe('invisible via document.hidden', () => {
      beforeEach(() => {
        const viewer = viewerForDoc(env.win.document);
        env.sandbox.stub(viewer, 'isVisible', () => {
          return false;
        });
        env.win.requestIdleCallback =
            resolvingIdleCallbackWithTimeRemaining(15);
        const chunks = chunkInstanceForTesting(env.win.document);
        env.sandbox.stub(chunks, 'executeAsap_', () => {
          throw new Error('No calls expected: executeAsap_');
        });
        env.win.document.hidden = true;
      });

      basicTests(env);
    });

    describe('invisible to visible', () => {
      beforeEach(() => {
        env.win.location.resetHref('test#visibilityState=hidden');
        const viewer = viewerForDoc(env.win.document);
        let visible = false;
        env.sandbox.stub(viewer, 'isVisible', () => {
          return visible;
        });
        env.win.requestIdleCallback = () => {
          // Don't call the callback, but transition to visible
          visible = true;
          viewer.onVisibilityChange_();
        };
      });

      basicTests(env);
    });

    describe('invisible to visible', () => {
      beforeEach(() => {
        env.win.location.resetHref('test#visibilityState=prerender');
        const viewer = viewerForDoc(env.win.document);
        let visible = false;
        env.sandbox.stub(viewer, 'isVisible', () => {
          return visible;
        });
        env.win.requestIdleCallback = () => {
          // Don't call the callback, but transition to visible
          visible = true;
          viewer.onVisibilityChange_();
        };
      });

      basicTests(env);
    });

    describe('invisible to visible after a while', () => {
      beforeEach(() => {
        env.win.location.resetHref('test#visibilityState=hidden');
        const viewer = viewerForDoc(env.win.document);
        let visible = false;
        env.sandbox.stub(viewer, 'isVisible', () => {
          return visible;
        });
        env.win.requestIdleCallback = () => {
          // Don't call the callback, but transition to visible
          setTimeout(() => {
            visible = true;
            viewer.onVisibilityChange_();
          }, 10);
        };
      });

      basicTests(env);
    });
  });

  describes.realWin('realWin', {
    amp: true,
  }, env => {
    beforeEach(() => {
      Object.defineProperty(env.win.document, 'hidden', {
        get: () => false,
      });
    });
    basicTests(env);
  });

  describes.realWin('realWin noIdleCallback', {
    amp: true,
  }, env => {
    beforeEach(() => {
      env.win.requestIdleCallback = null;
      expect(env.win.requestIdleCallback).to.be.null;
      const viewer = viewerForDoc(env.win.document);
      env.sandbox.stub(viewer, 'isVisible', () => {
        return false;
      });
      Object.defineProperty(env.win.document, 'hidden', {
        get: () => false,
      });
    });
    basicTests(env);
  });
});

describe('onIdle', () => {
  let win;
  let calls;
  let callbackCalled;
  let sandbox;
  let clock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    calls = [];
    callbackCalled = false;
    win = {
      requestIdleCallback: (fn, options) => {
        calls.push({
          invoke: (timeRemaining, didTimeout) => {
            fn({
              timeRemaining: () => timeRemaining,
              didTimeout: !!didTimeout,
            });
          },
          options,
        });
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  function markCalled() {
    callbackCalled = true;
  }

  it('should fire for sufficient remaining time', () => {
    onIdle(win, 66, 1000, markCalled);
    expect(calls).to.have.length(1);
    expect(callbackCalled).to.be.false;
    expect(calls[0].options.timeout).to.equal(1000);
    calls[0].invoke(66);
    expect(callbackCalled).to.be.true;
    expect(calls).to.have.length(1);
  });

  it('should try again with not enough time', () => {
    onIdle(win, 66, 1000, markCalled);
    expect(calls).to.have.length(1);
    expect(callbackCalled).to.be.false;
    expect(calls[0].options.timeout).to.equal(1000);
    clock.tick(100);
    calls[0].invoke(65);
    expect(callbackCalled).to.be.false;
    expect(calls).to.have.length(2);
    expect(calls[1].options.timeout).to.equal(900);
    calls[1].invoke(66);
    expect(callbackCalled).to.be.true;
    expect(calls).to.have.length(2);
  });

  it('should try again with not enough time (2 recursions)', () => {
    onIdle(win, 66, 1000, markCalled);
    expect(calls).to.have.length(1);
    expect(callbackCalled).to.be.false;
    expect(calls[0].options.timeout).to.equal(1000);
    clock.tick(100);
    calls[0].invoke(65);
    expect(callbackCalled).to.be.false;
    expect(calls).to.have.length(2);
    expect(calls[1].options.timeout).to.equal(900);
    clock.tick(50);
    calls[1].invoke(0);
    expect(callbackCalled).to.be.false;
    expect(calls).to.have.length(3);
    expect(calls[2].options.timeout).to.equal(850);
    calls[2].invoke(66);
    expect(callbackCalled).to.be.true;
    expect(calls).to.have.length(3);
  });

  it('should timeout when callback is called after timeout', () => {
    onIdle(win, 66, 1000, markCalled);
    expect(calls).to.have.length(1);
    expect(callbackCalled).to.be.false;
    expect(calls[0].options.timeout).to.equal(1000);
    clock.tick(1000);
    // Not enough time remaining but timed out via time.
    calls[0].invoke(1);
    expect(callbackCalled).to.be.true;
    expect(calls).to.have.length(1);
  });

  it('should timeout when callback is called with didTimeout', () => {
    onIdle(win, 66, 1000, markCalled);
    expect(calls).to.have.length(1);
    expect(callbackCalled).to.be.false;
    expect(calls[0].options.timeout).to.equal(1000);
    // Not enough time remaining but timed out via didTimeout.
    calls[0].invoke(1, /* didTimeout */ true);
    expect(callbackCalled).to.be.true;
    expect(calls).to.have.length(1);
  });
});
