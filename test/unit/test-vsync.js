import {Services} from '#service';
import {AmpDocShadow, installDocService} from '#service/ampdoc-impl';
import {installTimerService} from '#service/timer-impl';
import {Vsync} from '#service/vsync-impl';

describes.fakeWin('vsync', {}, (env) => {
  let win, doc;
  let clock;
  let contextNode;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    clock = env.sandbox.useFakeTimers();

    installTimerService(win);

    contextNode = doc.createElement('div');
    doc.body.appendChild(contextNode);
  });

  describe('single-doc', () => {
    let ampdoc;
    let isVisibleStub;
    let onVisibilityChangedStub;
    let vsync;
    let iniVisibilityEventCount;

    beforeEach(() => {
      installDocService(win, /* isSingleDoc */ true);
      ampdoc = Services.ampdocServiceFor(win).getSingleDoc();
      isVisibleStub = env.sandbox.stub(ampdoc, 'isVisible').returns(true);
      onVisibilityChangedStub = env.sandbox.stub(ampdoc, 'onVisibilityChanged');
      iniVisibilityEventCount = 0;
      iniVisibilityEventCount = getVisibilityEventCount();
      vsync = new Vsync(win);
    });

    function getVisibilityEventCount() {
      return (
        doc.eventListeners.count('visibilitychange') - iniVisibilityEventCount
      );
    }

    it('should init correctly', () => {
      expect(vsync.canAnimate(contextNode)).to.be.true;
      expect(onVisibilityChangedStub).to.be.calledOnce;
      expect(getVisibilityEventCount()).to.equal(0);
    });

    it('should fail canAnimate without node', () => {
      allowConsoleError(() => {
        expect(() => {
          vsync.canAnimate();
        }).to.throw(/Assertion failed/);
      });
    });

    it('should generate a frame and run callbacks', () => {
      let result = '';
      return new Promise((resolve) => {
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
      return new Promise((resolve) => {
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

    it('should schedule nested vsyncs', () => {
      let result = '';
      return new Promise((resolve) => {
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

    it('should return a promise from runPromise that executes "run"', () => {
      const measureSpy = env.sandbox.spy();
      const mutateSpy = env.sandbox.spy();
      return vsync
        .runPromise({measure: measureSpy, mutate: mutateSpy})
        .then(() => {
          expect(mutateSpy).to.be.calledOnce;
          expect(measureSpy).to.be.calledOnce;
        });
    });

    it('should return a promise from measurePromise that runs measurer', () => {
      let measured = false;
      return vsync
        .measurePromise(() => {
          measured = true;
        })
        .then(() => {
          expect(measured).to.be.true;
        });
    });

    it('should return a promise from mutatePromisethat runs mutator', () => {
      const mutator = env.sandbox.spy();
      return vsync.mutatePromise(mutator).then(() => {
        expect(mutator).to.be.calledOnce;
      });
    });

    it('should schedule via animation frames when doc is visible', () => {
      let rafHandler;
      vsync.raf_ = (handler) => (rafHandler = handler);
      isVisibleStub.returns(true);

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
      vsync.raf_ = (handler) => (rafHandler = handler);
      isVisibleStub.returns(false);

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
      vsync.raf_ = function () {
        // intentionally empty
      };
      isVisibleStub.returns(true);

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
      vsync.raf_ = (handler) => (rafHandler = handler);
      isVisibleStub.returns(true);

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

      isVisibleStub.returns(false);
      onVisibilityChangedStub.args[0][0]();

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
      vsync.raf_ = (handler) => (rafHandler = handler);
      isVisibleStub.returns(false);

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

      isVisibleStub.returns(true);
      onVisibilityChangedStub.args[0][0]();

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
      vsync.raf_ = (handler) => (rafHandler = handler);
      isVisibleStub.returns(true);

      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
      expect(rafHandler).to.be.undefined;
      expect(vsync.invisiblePass_.isPending()).to.be.false;

      isVisibleStub.returns(false);
      onVisibilityChangedStub.args[0][0]();

      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
      expect(rafHandler).to.be.undefined;
      expect(vsync.invisiblePass_.isPending()).to.be.false;
    });

    it('should run anim task when visible', () => {
      let rafHandler;
      vsync.raf_ = (handler) => (rafHandler = handler);
      isVisibleStub.returns(true);

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
      vsync.raf_ = (handler) => (rafHandler = handler);
      isVisibleStub.returns(true);

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
      vsync.raf_ = (handler) => (rafHandler = handler);
      isVisibleStub.returns(false);

      let result = ''; // eslint-disable-line @typescript-eslint/no-unused-vars
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
      vsync.raf_ = (handler) => (rafHandler = handler);
      isVisibleStub.returns(false);

      let result = ''; // eslint-disable-line @typescript-eslint/no-unused-vars
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
      isVisibleStub.returns(false);
      const mutatorSpy = env.sandbox.spy();

      const promise = vsync.runAnimMutateSeries(contextNode, mutatorSpy);
      return promise
        .then(
          () => {
            return 'SUCCESS';
          },
          (error) => {
            return 'ERROR: ' + error;
          }
        )
        .then((response) => {
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
    let isVisibleStub;
    let onVisibilityChangedStub;
    let vsync;
    let iniVisibilityEventCount;

    beforeEach(() => {
      installDocService(win, /* isSingleDoc */ false);
      root = doc.createElement('i-amphtml-shadow-root');
      doc.body.appendChild(root);
      ampdoc = new AmpDocShadow(win, 'https://acme.org/', root);
      isVisibleStub = env.sandbox.stub(ampdoc, 'isVisible').returns(true);
      onVisibilityChangedStub = env.sandbox.stub(ampdoc, 'onVisibilityChanged');
      contextNode.ampdoc_ = ampdoc;
      iniVisibilityEventCount = 0;
      iniVisibilityEventCount = getVisibilityEventCount();
      vsync = new Vsync(win);
    });

    function getVisibilityEventCount() {
      return (
        doc.eventListeners.count('visibilitychange') - iniVisibilityEventCount
      );
    }

    it('should init correctly', () => {
      expect(vsync.canAnimate(contextNode)).to.be.true;
      expect(getVisibilityEventCount()).to.equal(1);
      expect(onVisibilityChangedStub).to.not.be.called;
    });

    it('should schedule via animation frames when doc is visible', () => {
      let rafHandler;
      vsync.raf_ = (handler) => (rafHandler = handler);
      isVisibleStub.returns(true);

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
      vsync.raf_ = (handler) => (rafHandler = handler);
      doc.visibilityState = 'hidden';

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
      vsync.raf_ = (handler) => (rafHandler = handler);

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

      doc.visibilityState = 'hidden';

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
      vsync.raf_ = (handler) => (rafHandler = handler);
      doc.visibilityState = 'hidden';

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

      doc.visibilityState = 'visible';

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
      vsync.raf_ = (handler) => (rafHandler = handler);

      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
      expect(rafHandler).to.be.undefined;
      expect(vsync.invisiblePass_.isPending()).to.be.false;

      doc.visibilityState = 'hidden';

      expect(vsync.tasks_).to.have.length(0);
      expect(vsync.scheduled_).to.be.false;
      expect(rafHandler).to.be.undefined;
      expect(vsync.invisiblePass_.isPending()).to.be.false;
    });

    it('should run anim task when visible', () => {
      let rafHandler;
      vsync.raf_ = (handler) => (rafHandler = handler);

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
      vsync.raf_ = (handler) => (rafHandler = handler);

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
      vsync.raf_ = (handler) => (rafHandler = handler);
      doc.visibilityState = 'hidden';

      let result = ''; // eslint-disable-line @typescript-eslint/no-unused-vars
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
      vsync.raf_ = (handler) => (rafHandler = handler);
      doc.visibilityState = 'hidden';

      let result = ''; // eslint-disable-line @typescript-eslint/no-unused-vars
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
      doc.visibilityState = 'hidden';
      const mutatorSpy = env.sandbox.spy();

      const promise = vsync.runAnimMutateSeries(contextNode, mutatorSpy);
      return promise
        .then(
          () => {
            return 'SUCCESS';
          },
          (error) => {
            return 'ERROR: ' + error;
          }
        )
        .then((response) => {
          expect(response).to.match(/^ERROR/);
          expect(mutatorSpy).to.have.not.been.called;
        });
    });
  });
});
