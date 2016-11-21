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
  chunk,
  deactivateChunking,
  resolvedObjectforTesting,
} from '../../src/chunk';
import {installDocService} from '../../src/service/ampdoc-impl';
import {toggleExperiment} from '../../src/experiments';
import {viewerForDoc} from '../../src/viewer';


describe('chunk', () => {

  let resolved;
  let experimentOn;
  beforeEach(() => {
    resolved = resolvedObjectforTesting();
    experimentOn = true;
    activateChunkingForTesting();
  });

  function basicTests(env) {
    let fakeWin;

    beforeEach(() => {
      toggleExperiment(env.win, 'chunked-amp', experimentOn);
      fakeWin = env.win;
    });

    it('should execute a chunk', done => {
      chunk(fakeWin.document, done);
    });

    it('should execute chunks', done => {
      let count = 0;
      let progress = '';
      function complete(str) {
        return function() {
          progress += str;
          if (++count == 6) {
            expect(progress).to.equal('abcdef');
            done();
          }
        };
      }
      chunk(fakeWin.document, complete('a'));
      chunk(fakeWin.document, complete('b'));
      chunk(fakeWin.document, function() {
        complete('c')();
        chunk(fakeWin.document, function() {
          complete('d')();
          chunk(fakeWin.document, complete('e'));
          chunk(fakeWin.document, complete('f'));
        });
      });
    });
  }

  describes.fakeWin('no amp', {
    amp: false,
  }, env => {

    beforeEach(() => {
      installDocService(env.win, true);
      expect(env.win.services.viewer).to.be.undefined;
      env.win.document.hidden = false;
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
        toggleExperiment(env.win, 'chunked-amp', experimentOn);
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
        chunk(fakeWin.document, () => {
          throw new Error('test async');
        });
        chunk(fakeWin.document, () => {
          done = d;
        });
      });
    });

    describe('invisible experiment off', () => {
      beforeEach(() => {
        experimentOn = false;
        const viewer = viewerForDoc(env.win.document);
        env.sandbox.stub(viewer, 'isVisible', () => {
          throw new Error('No calls expected: isVisible');
        });
        env.win.requestIdleCallback = () => {
          throw new Error('No calls expected: requestIdleCallback');
        };
        env.win.location.resetHref('test#visibilityState=hidden');
      });

      basicTests(env);
    });

    describe('invisible', () => {
      beforeEach(() => {
        const viewer = viewerForDoc(env.win.document);
        env.sandbox.stub(viewer, 'isVisible', () => {
          return false;
        });
        env.win.requestIdleCallback = fn => {
          Promise.resolve().then(fn);
        };
        env.sandbox.stub(resolved, 'then', () => {
          throw new Error('No calls expected');
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
        env.win.requestIdleCallback = fn => {
          Promise.resolve().then(fn);
        };
        env.sandbox.stub(resolved, 'then', () => {
          throw new Error('No calls expected');
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
