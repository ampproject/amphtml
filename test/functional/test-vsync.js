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

import * as sinon from 'sinon';
import {AmpDocShadow, installDocService} from '../../src/service/ampdoc-impl';
import {Services} from '../../src/services';
import {Vsync} from '../../src/service/vsync-impl';
import {installTimerService} from '../../src/service/timer-impl';


describe('vsync', () => {
  let sandbox;
  let clock;
  let win;
  let viewer;
  let viewerVisibilityChangedHandler;
  let docState;
  let docVisibilityHandler;
  let contextNode;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    win = {
      document: {
        nodeType: /* DOCUMENT */ 9,
        body: {},
      },
      navigator: {
      },
      services: {},
      setTimeout: (fn, t) => {
        return window.setTimeout(fn, t);
      },
      clearTimeout: index => {
        window.clearTimeout(index);
      },
      requestAnimationFrame: window.requestAnimationFrame.bind(window),
    };
    win.document.defaultView = win;

    installTimerService(win);

    viewerVisibilityChangedHandler = undefined;
    viewer = {
      isVisible: () => true,
      onVisibilityChanged: handler => viewerVisibilityChangedHandler = handler,
    };

    docVisibilityHandler = undefined;
    docState = {
      isHidden: () => false,
      onVisibilityChanged: handler => docVisibilityHandler = handler,
    };
    win.services['documentState'] = {obj: docState};

    contextNode = document.createElement('div');
    document.body.appendChild(contextNode);
  });

  afterEach(() => {
    sandbox.restore();
    document.body.removeChild(contextNode);
  });


  describe('single-doc', () => {
    let ampdoc;
    let vsync;

    beforeEach(() => {
      installDocService(win, /* isSingleDoc */ true);
      ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
      win.services['viewer'] = {obj: viewer};
      vsync = new Vsync(win);
      return Services.viewerPromiseForDoc(ampdoc);
    });

    afterEach(() => {
    });

    it('should init correctly', () => {
      expect(vsync.canAnimate(contextNode)).to.be.true;
      expect(viewerVisibilityChangedHandler).to.exist;
      expect(docVisibilityHandler).to.not.exist;
    });

    it('should fail canAnimate without node', () => {
      allowConsoleError(() => { expect(() => {
        vsync.canAnimate();
      }).to.throw(/Assertion failed/); });
    });

    // TODO(choumx, #12476): Make this test work with sinon 4.0.
    it.skip('should generate a frame and run callbacks', () => {
      let result = '';
      return new Promise(resolve => {
        vsync.run({
          measure: () => {
            result += 'me1';
          },
          mutate: () => {
            result += 'mu1';
          },
        });
        vsync.run({
          measure: () => {
            result += 'me2';
          },
          mutate: () => {
            result += 'mu2';
          },
        });
        vsync.run({
          measure: () => {
            result += 'me3';
          },
        });
        vsync.run({
          mutate: () => {
            result += 'mu3';
          },
        });
        vsync.mutate(() => {
          result += 'mu4';
          resolve();
        });
        vsync.measure(() => {
          result += 'me4';
          resolve();
        });
      }).then(() => {
        expect(result).to.equal('me1me2me3me4mu1mu2mu3mu4');
      });
    });

    // TODO(choumx, #12476): Make this test work with sinon 4.0.
    it.skip('should tolerate errors in measures and mutates', () => {
      let result = '';
      return new Promise(resolve => {
        vsync.run({
          measure: () => {
            result += 'me1';
          },
          mutate: () => {
            result += 'mu1';
          },
        });
        // Measure fails.
        vsync.run({
          measure: () => {
            throw new Error('intentional');
          },
          mutate: () => {
            result += 'mu2';
          },
        });
        // Mutate fails.
        vsync.run({
          measure: () => {
            result += 'me3';
          },
          mutate: () => {
            throw new Error('intentional');
          },
        });
        // Both fail.
        vsync.run({
          measure: () => {
            throw new Error('intentional');
          },
          mutate: () => {
            throw new Error('intentional');
          },
        });
        // Both succeed.
        vsync.run({
          measure: () => {
            result += 'me5';
          },
          mutate: () => {
            result += 'mu5';
          },
        });
        // Resolve.
        vsync.mutate(resolve);
      }).then(() => {
        // Notice that `mu2` is skipped becuase `me2` failed.
        expect(result).to.equal('me1me3me5mu1mu5');
      });
    });

    // TODO(choumx, #12476): Make this test work with sinon 4.0.
    it.skip('should schedule nested vsyncs', () => {
      let result = '';
      return new Promise(resolve => {
        vsync.run({
          measure: () => {
            result += 'me1';
            vsync.run({
              measure: () => {
                result += 'me2';
              },
              mutate: () => {
                result += 'mu2';
                vsync.run({
                  measure: () => {
                    result += 'me3';
                  },
                });
                vsync.run({
                  mutate: () => {
                    result += 'mu3';
                    resolve();
                  },
                });
              },
            });
          },
          mutate: () => {
            result += 'mu1';
          },
        });
      }).then(() => {
        expect(result).to.equal('me1mu1me2mu2me3mu3');
      });
    });

    // TODO(choumx, #12476): Make this test work with sinon 4.0.
    it.skip('should return a promise from runPromise that ' +
        'executes "run"', () => {
      const measureSpy = sandbox.spy();
      const mutateSpy = sandbox.spy();
      return vsync.runPromise({measure: measureSpy, mutate: mutateSpy})
          .then(() => {
            expect(mutateSpy).to.be.calledOnce;
            expect(measureSpy).to.be.calledOnce;
          });
    });

    // TODO(choumx, #12476): Make this test work with sinon 4.0.
    it.skip('should return a promise from measurePromise ' +
        'that runs measurer', () => {
      let measured = false;
      return vsync.measurePromise(() => {
        measured = true;
      }).then(() => {
        expect(measured).to.be.true;
      });
    });

    // TODO(choumx, #12476): Make this test work with sinon 4.0.
    it.skip('should return a promise from mutatePromise' +
        'that runs mutator', () => {
      const mutator = sandbox.spy();
      return vsync.mutatePromise(mutator).then(() => {
        expect(mutator).to.be.calledOnce;
      });
    });

    it('should schedule via animation frames when doc is visible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      viewer.isVisible = () => true;

      let result = '';
      vsync.run({
        mutate: () => {
          result += 'mu1';
        },
      });

      expect(vsync.tasks_).to.have.length(1);
      expect(vsync.scheduled_).to.be.true;
      expect(rafHandler).to.exist;
      expect(vsync.invisiblePass_.isPending()).to.be.false;
      expect(vsync.backupPass_.isPending()).to.be.true;

      rafHandler();
      expect(result).to.equal('mu1');
      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
      expect(vsync.invisiblePass_.isPending()).to.be.false;
      expect(vsync.backupPass_.isPending()).to.be.false;
    });

    it('should schedule via timer frames when doc is not visible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      viewer.isVisible = () => false;

      let result = '';
      vsync.run({
        mutate: () => {
          result += 'mu1';
        },
      });

      expect(vsync.tasks_).to.have.length(1);
      expect(vsync.scheduled_).to.be.true;
      expect(rafHandler).to.be.undefined;
      expect(vsync.invisiblePass_.isPending()).to.be.true;

      clock.tick(17);
      expect(result).to.equal('mu1');
      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
      expect(vsync.invisiblePass_.isPending()).to.be.false;
    });

    it('should run via backup timer if rAF somehow doesnt fire', () => {
      let rafHandler;
      vsync.raf_ = function() {
        // intentionally empty
      };
      viewer.isVisible = () => true;

      let result = '';
      vsync.run({
        mutate: () => {
          result += 'mu1';
        },
      });

      expect(vsync.tasks_).to.have.length(1);
      expect(vsync.scheduled_).to.be.true;
      expect(rafHandler).to.be.undefined;
      expect(vsync.invisiblePass_.isPending()).to.be.false;
      expect(vsync.backupPass_.isPending()).to.be.true;

      clock.tick(17);
      expect(result).to.equal('');
      expect(vsync.tasks_).to.have.length(1);
      expect(vsync.scheduled_).to.be.true;
      expect(vsync.invisiblePass_.isPending()).to.be.false;
      expect(vsync.backupPass_.isPending()).to.be.true;

      clock.tick(240);
      expect(result).to.equal('mu1');
      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
      expect(vsync.invisiblePass_.isPending()).to.be.false;
      expect(vsync.backupPass_.isPending()).to.be.false;
    });

    it('should re-schedule when doc goes invisible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      viewer.isVisible = () => true;

      let result = '';
      vsync.run({
        mutate: () => {
          result += 'mu1';
        },
      });

      expect(vsync.tasks_).to.have.length(1);
      expect(vsync.scheduled_).to.be.true;
      expect(rafHandler).to.exist;
      expect(vsync.invisiblePass_.isPending()).to.be.false;

      viewer.isVisible = () => false;
      viewerVisibilityChangedHandler();

      expect(vsync.tasks_).to.have.length(1);
      expect(vsync.scheduled_).to.be.true;
      expect(vsync.invisiblePass_.isPending()).to.be.true;

      clock.tick(17);
      expect(result).to.equal('mu1');
      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
      expect(vsync.invisiblePass_.isPending()).to.be.false;
    });

    it('should re-schedule when doc goes visible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      viewer.isVisible = () => false;

      let result = '';
      vsync.run({
        mutate: () => {
          result += 'mu1';
        },
      });

      expect(vsync.tasks_).to.have.length(1);
      expect(vsync.scheduled_).to.be.true;
      expect(rafHandler).to.be.undefined;
      expect(vsync.invisiblePass_.isPending()).to.be.true;

      viewer.isVisible = () => true;
      viewerVisibilityChangedHandler();

      expect(vsync.tasks_).to.have.length(1);
      expect(vsync.scheduled_).to.be.true;
      expect(rafHandler).to.exist;

      rafHandler();
      expect(result).to.equal('mu1');
      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
    });

    it('should NOT re-schedule when no tasks pending', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      viewer.isVisible = () => true;

      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
      expect(rafHandler).to.be.undefined;
      expect(vsync.invisiblePass_.isPending()).to.be.false;

      viewer.isVisible = () => false;
      viewerVisibilityChangedHandler();

      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
      expect(rafHandler).to.be.undefined;
      expect(vsync.invisiblePass_.isPending()).to.be.false;
    });

    it('should run anim task when visible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      viewer.isVisible = () => true;

      let result = '';
      const res = vsync.runAnim(contextNode, {
        mutate: () => {
          result += 'mu1';
        },
      });

      expect(res).to.be.true;
      expect(rafHandler).to.exist;
      expect(vsync.scheduled_).to.be.true;

      rafHandler();
      expect(result).to.equal('mu1');
    });

    it('should create and run anim task when visible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      viewer.isVisible = () => true;

      let result = '';
      const task = vsync.createAnimTask(contextNode, {
        mutate: () => {
          result += 'mu1';
        },
      });
      const res = task();

      expect(res).to.be.true;
      expect(rafHandler).to.exist;
      expect(vsync.scheduled_).to.be.true;

      rafHandler();
      expect(result).to.equal('mu1');
    });

    it('should NOT run anim task when invisible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      viewer.isVisible = () => false;

      let result = ''; // eslint-disable-line no-unused-vars
      const res = vsync.runAnim(contextNode, {
        mutate: () => {
          result += 'mu1';
        },
      });

      expect(res).to.be.false;
      expect(rafHandler).to.be.undefined;
      expect(vsync.scheduled_).to.be.false;
    });

    it('should create but NOT run anim task when invisible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      viewer.isVisible = () => false;

      let result = ''; // eslint-disable-line no-unused-vars
      const task = vsync.createAnimTask(contextNode, {
        mutate: () => {
          result += 'mu1';
        },
      });
      const res = task();

      expect(res).to.be.false;
      expect(rafHandler).to.be.undefined;
      expect(vsync.scheduled_).to.be.false;
    });

    it('should reject mutate series when invisible', () => {
      viewer.isVisible = () => false;
      const mutatorSpy = sandbox.spy();

      const promise = vsync.runAnimMutateSeries(contextNode, mutatorSpy);
      return promise.then(() => {
        return 'SUCCESS';
      }, error => {
        return 'ERROR: ' + error;
      }).then(response => {
        expect(response).to.match(/^ERROR/);
        expect(mutatorSpy).to.have.not.been.called;
      });
    });

    describe('RAF polyfill', () => {
      let vsync;

      beforeEach(() => {
        delete win.requestAnimationFrame;
        vsync = new Vsync(win);
      });

      it('should schedule frames using the polyfill', () => {
        let calls = 0;
        vsync.mutate(() => {
          calls++;
        });
        clock.tick(15);
        vsync.mutate(() => {
          calls++;
        });
        expect(calls).to.equal(0);
        clock.tick(1);
        expect(calls).to.equal(2);
        clock.tick(10);
        vsync.mutate(() => {
          calls++;
        });
        expect(calls).to.equal(2);
        clock.tick(6);
        expect(calls).to.equal(3);
      });
    });
  });


  describe('multi-doc', () => {
    let root;
    let ampdoc;
    let vsync;

    beforeEach(() => {
      installDocService(win, /* isSingleDoc */ false);
      root = document.createElement('i-amphtml-shadow-root');
      document.body.appendChild(root);
      ampdoc = new AmpDocShadow(win, 'https://acme.org/', root);
      ampdoc.services = {};
      ampdoc.services['viewer'] = {obj: viewer};
      contextNode.ampdoc_ = ampdoc;
      vsync = new Vsync(win);
    });

    afterEach(() => {
      document.body.removeChild(root);
    });

    it('should init correctly', () => {
      expect(vsync.canAnimate(contextNode)).to.be.true;
      expect(docVisibilityHandler).to.exist;
      expect(viewerVisibilityChangedHandler).to.not.exist;
    });

    it('should schedule via animation frames when doc is visible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      viewer.isVisible = () => true;

      let result = '';
      vsync.run({
        mutate: () => {
          result += 'mu1';
        },
      });

      expect(vsync.tasks_).to.have.length(1);
      expect(vsync.scheduled_).to.be.true;
      expect(rafHandler).to.exist;
      expect(vsync.invisiblePass_.isPending()).to.be.false;

      rafHandler();
      expect(result).to.equal('mu1');
      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
    });

    it('should schedule via timer frames when doc is not visible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      docState.isHidden = () => true;

      let result = '';
      vsync.run({
        mutate: () => {
          result += 'mu1';
        },
      });

      expect(vsync.tasks_).to.have.length(1);
      expect(vsync.scheduled_).to.be.true;
      expect(rafHandler).to.be.undefined;
      expect(vsync.invisiblePass_.isPending()).to.be.true;

      clock.tick(17);
      expect(result).to.equal('mu1');
      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
      expect(vsync.invisiblePass_.isPending()).to.be.false;
    });

    it('should re-schedule when doc goes invisible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      docState.isHidden = () => false;

      let result = '';
      vsync.run({
        mutate: () => {
          result += 'mu1';
        },
      });

      expect(vsync.tasks_).to.have.length(1);
      expect(vsync.scheduled_).to.be.true;
      expect(rafHandler).to.exist;
      expect(vsync.invisiblePass_.isPending()).to.be.false;

      docState.isHidden = () => true;
      docVisibilityHandler();

      expect(vsync.tasks_).to.have.length(1);
      expect(vsync.scheduled_).to.be.true;
      expect(vsync.invisiblePass_.isPending()).to.be.true;

      clock.tick(17);
      expect(result).to.equal('mu1');
      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
      expect(vsync.invisiblePass_.isPending()).to.be.false;
    });

    it('should re-schedule when doc goes visible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      docState.isHidden = () => true;

      let result = '';
      vsync.run({
        mutate: () => {
          result += 'mu1';
        },
      });

      expect(vsync.tasks_).to.have.length(1);
      expect(vsync.scheduled_).to.be.true;
      expect(rafHandler).to.be.undefined;
      expect(vsync.invisiblePass_.isPending()).to.be.true;

      docState.isHidden = () => false;
      docVisibilityHandler();

      expect(vsync.tasks_).to.have.length(1);
      expect(vsync.scheduled_).to.be.true;
      expect(rafHandler).to.exist;

      rafHandler();
      expect(result).to.equal('mu1');
      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
    });

    it('should NOT re-schedule when no tasks pending', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      docState.isHidden = () => false;

      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
      expect(rafHandler).to.be.undefined;
      expect(vsync.invisiblePass_.isPending()).to.be.false;

      docState.isHidden = () => true;
      docVisibilityHandler();

      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
      expect(rafHandler).to.be.undefined;
      expect(vsync.invisiblePass_.isPending()).to.be.false;
    });

    it('should run anim task when visible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      docState.isHidden = () => false;

      let result = '';
      const res = vsync.runAnim(contextNode, {
        mutate: () => {
          result += 'mu1';
        },
      });

      expect(res).to.be.true;
      expect(rafHandler).to.exist;
      expect(vsync.scheduled_).to.be.true;

      rafHandler();
      expect(result).to.equal('mu1');
    });

    it('should create and run anim task when visible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      docState.isHidden = () => false;

      let result = '';
      const task = vsync.createAnimTask(contextNode, {
        mutate: () => {
          result += 'mu1';
        },
      });
      const res = task();

      expect(res).to.be.true;
      expect(rafHandler).to.exist;
      expect(vsync.scheduled_).to.be.true;

      rafHandler();
      expect(result).to.equal('mu1');
    });

    it('should NOT run anim task when invisible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      docState.isHidden = () => true;

      let result = ''; // eslint-disable-line no-unused-vars
      const res = vsync.runAnim(contextNode, {
        mutate: () => {
          result += 'mu1';
        },
      });

      expect(res).to.be.false;
      expect(rafHandler).to.be.undefined;
      expect(vsync.scheduled_).to.be.false;
    });

    it('should create but NOT run anim task when invisible', () => {
      let rafHandler;
      vsync.raf_ = handler => rafHandler = handler;
      docState.isHidden = () => true;

      let result = ''; // eslint-disable-line no-unused-vars
      const task = vsync.createAnimTask(contextNode, {
        mutate: () => {
          result += 'mu1';
        },
      });
      const res = task();

      expect(res).to.be.false;
      expect(rafHandler).to.be.undefined;
      expect(vsync.scheduled_).to.be.false;
    });

    it('should reject mutate series when invisible', () => {
      docState.isHidden = () => true;
      const mutatorSpy = sandbox.spy();

      const promise = vsync.runAnimMutateSeries(contextNode, mutatorSpy);
      return promise.then(() => {
        return 'SUCCESS';
      }, error => {
        return 'ERROR: ' + error;
      }).then(response => {
        expect(response).to.match(/^ERROR/);
        expect(mutatorSpy).to.have.not.been.called;
      });
    });
  });
});
