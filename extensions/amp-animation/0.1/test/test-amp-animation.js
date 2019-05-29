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

import {AmpAnimation} from '../amp-animation';
import {DEFAULT_ACTION} from '../../../../src/action-constants';
import {NativeWebAnimationRunner} from '../runners/native-web-animation-runner';
import {WebAnimationPlayState} from '../web-animation-types';

describes.sandboxed('AmpAnimation', {}, () => {
  function createAnimInWindow(win, attrs, config) {
    const element = win.document.createElement('amp-animation');
    element.setAttribute('id', 'anim1');
    element.setAttribute('layout', 'nodisplay');
    for (const k in attrs) {
      element.setAttribute(k, attrs[k]);
    }

    if (config) {
      const configElement = win.document.createElement('script');
      configElement.setAttribute('type', 'application/json');
      if (typeof config == 'string') {
        configElement.textContent = config;
      } else {
        configElement.textContent = JSON.stringify(config);
      }
      element.appendChild(configElement);
    }

    win.document.body.appendChild(element);
    return element.build().then(() => element.implementation_);
  }

  describes.realWin(
    'in top-level doc',
    {
      amp: {
        ampdoc: 'single',
        extensions: ['amp-animation'],
      },
    },
    env => {
      let win;
      let viewer;
      let createRunnerStub;
      let runner;
      let runnerMock;

      beforeEach(() => {
        win = env.win;
        viewer = win.services.viewer.obj;
        viewer.setVisibilityState_('hidden');
        runner = new NativeWebAnimationRunner([]);
        runnerMock = sandbox.mock(runner);
        createRunnerStub = sandbox
          .stub(AmpAnimation.prototype, 'createRunner_')
          .callsFake(() => Promise.resolve(runner));
      });

      afterEach(() => {
        runnerMock.verify();
      });

      function createAnim(attrs, config) {
        return createAnimInWindow(win, attrs, config);
      }

      it('should load and parse config', function*() {
        const anim = yield createAnim({}, {duration: 1001});
        expect(anim.configJson_).to.deep.equal({duration: 1001});
      });

      it('should fail without config', () => {
        return createAnim({}, null).then(
          () => {
            throw new Error('must have failed');
          },
          reason => {
            expect(reason.message).to.match(
              /\"<script type=application\/json>\" must be present/
            );
          }
        );
      });

      it('should fail with malformed config', () => {
        return createAnim({}, 'broken').then(
          () => {
            throw new Error('must have failed');
          },
          reason => {
            expect(reason.message).to.match(/failed to parse animation script/);
          }
        );
      });

      it('should default trigger to none', function*() {
        const anim = yield createAnim({}, {duration: 1001});
        expect(anim.triggerOnVisibility_).to.be.false;
      });

      it('should parse visibility trigger', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001}
        );
        expect(anim.triggerOnVisibility_).to.be.true;

        // Animation is made to be always in viewport via mutateElement.
        expect(anim.element.style['position']).to.not.equal('fixed');
        return anim
          .mutateElement(() => {})
          .then(() => {
            expect(anim.element.style['position']).to.equal('fixed');
            expect(anim.element.style['visibility']).to.equal('hidden');
            expect(anim.element.style['top']).to.equal('0px');
            expect(anim.element.style['left']).to.equal('0px');
            expect(anim.element.style['width']).to.equal('1px');
            expect(anim.element.style['height']).to.equal('1px');
            expect(anim.element).to.have.display('block');
          });
      });

      it('should fail on invalid trigger', () => {
        return createAnim({trigger: 'unknown'}, {duration: 1001}).then(
          () => {
            throw new Error('must have failed');
          },
          reason => {
            expect(reason.message).to.match(
              /Only allowed value for \"trigger\" is \"visibility\"/
            );
          }
        );
      });

      it('should update visibility from viewer', function*() {
        const anim = yield createAnim({}, {duration: 1001});
        expect(anim.visible_).to.be.false;

        viewer.setVisibilityState_('visible');
        expect(anim.visible_).to.be.true;
      });

      it('should update visibility when paused', function*() {
        const anim = yield createAnim({}, {duration: 1001});
        viewer.setVisibilityState_('visible');
        expect(anim.visible_).to.be.true;

        anim.pauseCallback();
        expect(anim.visible_).to.be.false;
      });

      it('should not activate w/o visibility trigger', function*() {
        const anim = yield createAnim({}, {duration: 1001});
        const activateStub = sandbox.stub(anim, 'startAction_');
        viewer.setVisibilityState_('visible');
        yield anim.layoutCallback();
        expect(activateStub).to.not.be.called;
      });

      it('should activate with visibility trigger', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001}
        );
        const activateStub = sandbox.stub(anim, 'startAction_');
        viewer.setVisibilityState_('visible');
        yield anim.layoutCallback();
        expect(activateStub).to.be.calledOnce;
      });

      it('should trigger animation, but not start when invisible', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001}
        );
        const startStub = sandbox.stub(anim, 'startOrResume_');
        anim.startAction_();
        expect(anim.triggered_).to.be.true;
        expect(startStub).to.not.be.called;
      });

      it('should trigger animation and start when visible', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001}
        );
        const startStub = sandbox.stub(anim, 'startOrResume_');
        viewer.setVisibilityState_('visible');
        anim.startAction_();
        expect(anim.triggered_).to.be.true;
        expect(startStub).to.be.calledOnce;
      });

      it('should resume/pause when visibility changes', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001}
        );
        const startStub = sandbox.stub(anim, 'startOrResume_');
        const pauseStub = sandbox.stub(anim, 'pause_');
        anim.startAction_();
        expect(anim.triggered_).to.be.true;

        // Go to visible state.
        viewer.setVisibilityState_('visible');
        expect(startStub).to.be.calledOnce;
        expect(pauseStub).to.not.be.called;

        // Go to hidden state.
        viewer.setVisibilityState_('hidden');
        expect(pauseStub).to.be.calledOnce;
        expect(startStub).to.be.calledOnce; // Doesn't change.
      });

      it('should NOT resume/pause when visible, but not triggered', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001}
        );
        const startStub = sandbox.stub(anim, 'startOrResume_');
        const pauseStub = sandbox.stub(anim, 'pause_');
        expect(anim.triggered_).to.be.false;

        // Go to visible state.
        viewer.setVisibilityState_('visible');
        expect(startStub).to.not.be.called;
        expect(pauseStub).to.not.be.called;

        // Go to hidden state.
        viewer.setVisibilityState_('hidden');
        expect(pauseStub).to.not.be.called;
        expect(startStub).to.not.be.called;
      });

      it('should NOT resume when visible if paused by an action', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001}
        );
        const startStub = sandbox.stub(anim, 'startOrResume_');
        const pauseStub = sandbox.stub(anim, 'pause_');
        anim.startAction_();
        anim.pausedByAction_ = true;
        expect(anim.triggered_).to.be.true;

        // Go to visible state.
        viewer.setVisibilityState_('visible');
        expect(startStub).to.not.be.called;
        expect(pauseStub).to.not.be.called;
      });

      it('should create runner', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001, animations: []}
        );
        anim.startAction_();
        anim.visible_ = true;
        runnerMock.expects('start').once();
        runnerMock.expects('finish').never();
        yield anim.startOrResume_();
        expect(anim.triggered_).to.be.true;
        expect(anim.runner_).to.exist;
      });

      it('should finish animation and runner', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001, animations: []}
        );
        anim.startAction_();
        anim.visible_ = true;
        runnerMock.expects('start').once();
        runnerMock.expects('finish').once();
        yield anim.startOrResume_();
        anim.finish_();
        expect(anim.triggered_).to.be.false;
        expect(anim.runner_).to.be.null;
      });

      it('should pause/resume animation and runner', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001, animations: []}
        );
        anim.startAction_();
        anim.visible_ = true;
        runnerMock.expects('start').once();
        runnerMock.expects('pause').once();
        yield anim.startOrResume_();
        anim.pause_();
        expect(anim.triggered_).to.be.true;

        runnerMock.expects('resume').once();
        anim.startOrResume_();
        expect(anim.triggered_).to.be.true;
      });

      it('should finish when animation is complete', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001, animations: []}
        );
        anim.startAction_();
        anim.visible_ = true;
        yield anim.startOrResume_();
        expect(anim.triggered_).to.be.true;
        expect(anim.runner_).to.exist;

        runner.setPlayState_(WebAnimationPlayState.FINISHED);
        expect(anim.triggered_).to.be.false;
        expect(anim.runner_).to.be.null;
      });

      it('should resize from ampdoc viewport', function*() {
        const anim = yield createAnim({}, {duration: 1001});
        const stub = sandbox.stub(anim, 'onResize_');
        const viewport = win.services.viewport.obj;

        // No size changes.
        viewport.resizeObservable_.fire({relayoutAll: false});
        expect(stub).to.not.be.called;

        // Size has changed.
        viewport.resizeObservable_.fire({relayoutAll: true});
        expect(stub).to.be.calledOnce;
      });

      it('should cancel running animation on resize and schedule restart', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001, animations: []}
        );
        anim.startAction_();
        anim.visible_ = true;
        yield anim.startOrResume_();
        expect(anim.runner_).to.exist;

        runnerMock.expects('cancel').once();
        anim.onResize_();
        expect(anim.runner_).to.be.null;
        expect(anim.triggered_).to.be.true;
        expect(anim.restartPass_.isPending()).to.be.true;
        anim.restartPass_.cancel();
      });

      it('should ignore not-triggered animation on resize', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001, animations: []}
        );
        anim.visible_ = true;
        expect(anim.runner_).to.not.exist;
        runnerMock.expects('cancel').never();
        anim.onResize_();
        expect(anim.runner_).to.be.null;
        expect(anim.triggered_).to.be.false;
        expect(anim.restartPass_.isPending()).to.be.false;
      });

      it('should cancel and NOT restart hidden animation on resize', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001, animations: []}
        );
        anim.startAction_();
        anim.visible_ = true;
        yield anim.startOrResume_();
        expect(anim.runner_).to.exist;

        anim.visible_ = false;
        runnerMock.expects('cancel').once();
        anim.onResize_();
        expect(anim.runner_).to.be.null;
        expect(anim.triggered_).to.be.true;
        expect(anim.restartPass_.isPending()).to.be.false;
      });

      it('should ignore start when not triggered', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001, animations: []}
        );
        anim.visible_ = true;
        expect(anim.startOrResume_()).to.be.null;
      });

      it('should ignore start when not triggered', function*() {
        const anim = yield createAnim(
          {trigger: 'visibility'},
          {duration: 1001, animations: []}
        );
        anim.startAction_();
        anim.visible_ = false;
        expect(anim.startOrResume_()).to.be.null;
      });

      describe('actions', () => {
        let anim;

        beforeEach(() => {
          return createAnim({}, {duration: 1001}).then(a => {
            anim = a;
            anim.visible_ = true;
          });
        });

        it('should trigger activate', () => {
          const args = {};
          const invocation = {
            method: DEFAULT_ACTION,
            args,
            satisfiesTrust: () => true,
          };
          expect(runner.getPlayState()).to.equal(WebAnimationPlayState.IDLE);
          expect(anim.triggered_).to.be.false;

          return anim.executeAction(invocation).then(() => {
            expect(anim.triggered_).to.be.true;
            expect(runner.getPlayState()).to.equal(
              WebAnimationPlayState.RUNNING
            );
          });
        });

        it('should trigger start', () => {
          const args = {};
          const invocation = {
            method: 'start',
            args,
            satisfiesTrust: () => true,
          };
          expect(runner.getPlayState()).to.equal(WebAnimationPlayState.IDLE);
          expect(anim.triggered_).to.be.false;

          return anim.executeAction(invocation).then(() => {
            expect(anim.triggered_).to.be.true;
            expect(runner.getPlayState()).to.equal(
              WebAnimationPlayState.RUNNING
            );
          });
        });

        it('should create runner with args', () => {
          const args = {foo: 'bar'};
          const invocation = {
            method: 'start',
            args,
            satisfiesTrust: () => true,
          };

          expect(createRunnerStub).not.to.be.called;

          return anim.executeAction(invocation).then(() => {
            expect(createRunnerStub).to.be.calledWith(args);
          });
        });

        it('should trigger but not start if not visible', () => {
          anim.visible_ = false;
          const args = {};
          const invocation = {
            method: 'start',
            args,
            satisfiesTrust: () => true,
          };
          expect(runner.getPlayState()).to.equal(WebAnimationPlayState.IDLE);
          expect(anim.triggered_).to.be.false;

          return anim.executeAction(invocation).then(() => {
            expect(runner.getPlayState()).to.equal(WebAnimationPlayState.IDLE);
            expect(anim.triggered_).to.be.true;
          });
        });

        it('should trigger restart', () => {
          const cancelStub = sandbox.stub(anim, 'cancel_');
          const args = {};
          const invocation = {
            method: 'restart',
            args,
            satisfiesTrust: () => true,
          };
          return anim.executeAction(invocation).then(() => {
            expect(anim.triggered_).to.be.true;
            expect(cancelStub).to.be.calledOnce;
            expect(anim.triggered_).to.be.true;
            expect(runner.getPlayState()).to.equal(
              WebAnimationPlayState.RUNNING
            );
          });
        });

        it('should trigger pause after start', () => {
          const args = {};
          const startInvocation = {
            method: 'start',
            args,
            satisfiesTrust: () => true,
          };
          const pauseInvocation = {
            method: 'pause',
            args,
            satisfiesTrust: () => true,
          };
          anim.executeAction(startInvocation);
          return anim.executeAction(pauseInvocation).then(() => {
            expect(anim.triggered_).to.be.true;
            expect(runner.getPlayState()).to.equal(
              WebAnimationPlayState.PAUSED
            );
          });
        });

        it('should ignore pause before start', () => {
          runnerMock.expects('pause').never();
          return anim.executeAction({
            method: 'pause',
            satisfiesTrust: () => true,
          });
        });

        it('should trigger resume after start follwed by pause', () => {
          const args = {};
          const startInvocation = {
            method: 'start',
            args,
            satisfiesTrust: () => true,
          };
          const pauseInvocation = {
            method: 'pause',
            args,
            satisfiesTrust: () => true,
          };
          anim.executeAction(startInvocation);
          return anim
            .executeAction(pauseInvocation)
            .then(() => {
              expect(anim.triggered_).to.be.true;
              expect(runner.getPlayState()).to.equal(
                WebAnimationPlayState.PAUSED
              );
              const resumeInvocation = {
                method: 'resume',
                args,
                satisfiesTrust: () => true,
              };
              return anim.executeAction(resumeInvocation);
            })
            .then(() => {
              expect(runner.getPlayState()).to.equal(
                WebAnimationPlayState.RUNNING
              );
            });
        });

        it('should ignore resume before start', () => {
          runnerMock.expects('resume').never();
          return anim.executeAction({
            method: 'resume',
            satisfiesTrust: () => true,
          });
        });

        it('should toggle pause/resume after start', () => {
          const args = {};
          const startInvocation = {
            method: 'start',
            args,
            satisfiesTrust: () => true,
          };
          const togglePauseInvocation = {
            method: 'togglePause',
            args,
            satisfiesTrust: () => true,
          };
          anim.executeAction(startInvocation);
          return anim
            .executeAction(togglePauseInvocation)
            .then(() => {
              expect(anim.triggered_).to.be.true;
              expect(runner.getPlayState()).to.equal(
                WebAnimationPlayState.PAUSED
              );
              return anim.executeAction(togglePauseInvocation);
            })
            .then(() => {
              expect(runner.getPlayState()).to.equal(
                WebAnimationPlayState.RUNNING
              );
            });
        });

        it('should ignore toggle pause/resume before start', () => {
          runnerMock.expects('resume').never();
          runnerMock.expects('pause').never();
          return anim.executeAction({
            method: 'togglePause',
            satisfiesTrust: () => true,
          });
        });

        it('should seek-to (time) regardless of start', () => {
          const invocation = {
            method: 'seekTo',
            args: {time: 100},
            satisfiesTrust: () => true,
          };

          runnerMock
            .expects('seekTo')
            .withExactArgs(100)
            .once();
          return anim.executeAction(invocation).then(() => {
            expect(anim.triggered_).to.be.true;
          });
        });

        it('should seek-to (percent) regardless of start', () => {
          const invocation = {
            method: 'seekTo',
            args: {percent: 0.5},
            satisfiesTrust: () => true,
          };

          runnerMock
            .expects('seekToPercent')
            .withExactArgs(0.5)
            .once();
          return anim.executeAction(invocation).then(() => {
            expect(anim.triggered_).to.be.true;
          });
        });

        it('should clamp percent (upper) seekTo', () => {
          const invocation = {
            method: 'seekTo',
            args: {percent: 1.5},
            satisfiesTrust: () => true,
          };

          runnerMock
            .expects('seekToPercent')
            .withExactArgs(1)
            .once();
          return anim.executeAction(invocation).then(() => {
            expect(anim.triggered_).to.be.true;
          });
        });

        it('should clamp percent (lower) seekTo', () => {
          const invocation = {
            method: 'seekTo',
            args: {percent: -2},
            satisfiesTrust: () => true,
          };

          runnerMock
            .expects('seekToPercent')
            .withExactArgs(0)
            .once();
          return anim.executeAction(invocation).then(() => {
            expect(anim.triggered_).to.be.true;
          });
        });

        it('should trigger reverse after start', () => {
          const args = {};
          const startInvocation = {
            method: 'start',
            args,
            satisfiesTrust: () => true,
          };
          const invocation = {
            method: 'reverse',
            args,
            satisfiesTrust: () => true,
          };
          anim.executeAction(startInvocation);
          runnerMock.expects('reverse').once();
          return anim.executeAction(invocation);
        });

        it('should ignore reverse before start', () => {
          runnerMock.expects('reverse').never();
          return anim.executeAction({
            method: 'reverse',
            satisfiesTrust: () => true,
          });
        });

        it('should trigger finish after start', () => {
          anim.triggered_ = true;
          return anim.startOrResume_().then(() => {
            runnerMock.expects('finish').once();
            anim.executeAction({method: 'finish', satisfiesTrust: () => true});
          });
        });

        it('should trigger cancel after start', () => {
          anim.triggered_ = true;
          return anim.startOrResume_().then(() => {
            runnerMock.expects('cancel').once();
            anim.executeAction({method: 'cancel', satisfiesTrust: () => true});
          });
        });

        it('should set paused by action properly', () => {
          const args = {};
          const startInvocation = {
            method: 'start',
            args,
            satisfiesTrust: () => true,
          };
          const pauseInvocation = {
            method: 'pause',
            args,
            satisfiesTrust: () => true,
          };
          const resumeInvocation = {
            method: 'resume',
            args,
            satisfiesTrust: () => true,
          };
          const togglePauseInvocation = {
            method: 'togglePause',
            args,
            satisfiesTrust: () => true,
          };
          const cancelInvocation = {
            method: 'cancel',
            args,
            satisfiesTrust: () => true,
          };
          expect(anim.pausedByAction_).to.be.false;

          return anim
            .executeAction(startInvocation)
            .then(() => {
              expect(anim.pausedByAction_).to.be.false;
              return anim.executeAction(pauseInvocation);
            })
            .then(() => {
              expect(anim.pausedByAction_).to.be.true;
              return anim.executeAction(resumeInvocation);
            })
            .then(() => {
              expect(anim.pausedByAction_).to.be.false;
              return anim.executeAction(togglePauseInvocation);
            })
            .then(() => {
              expect(anim.pausedByAction_).to.be.true;
              return anim.executeAction(cancelInvocation);
            })
            .then(() => {
              expect(anim.pausedByAction_).to.be.false;
            });
        });

        it.skip('should set paused by action flag', () => {
          anim.triggered_ = true;
          return anim.startOrResume_().then(() => {
            expect(anim.pausedByAction_).to.be.false;
            let invocation = {
              method: 'pause',
              args: {},
              satisfiesTrust: () => true,
            };
            anim.executeAction(invocation);
            expect(anim.pausedByAction_).to.be.true;

            invocation = {
              method: 'resume',
              args: {},
              satisfiesTrust: () => true,
            };
            anim.executeAction(invocation);
            expect(anim.pausedByAction_).to.be.false;
          });
        });
      });
    }
  );

  describes.realWin(
    'in FIE',
    {
      amp: {
        ampdoc: 'fie',
        extensions: ['amp-animation'],
      },
    },
    env => {
      let embed;

      beforeEach(() => {
        embed = env.embed;
        embed.setVisible_(false);
      });

      function createAnim(attrs, config) {
        return createAnimInWindow(embed.win, attrs, config);
      }

      it('should update visibility from embed', function*() {
        const anim = yield createAnim({}, {duration: 1001});
        expect(anim.visible_).to.be.false;

        embed.setVisible_(true);
        expect(anim.visible_).to.be.true;
      });

      it('should find target in the embed only via selector', function*() {
        const parentWin = env.ampdoc.win;
        const embedWin = embed.win;
        const anim = yield createAnim(
          {},
          {duration: 1001, selector: '#target1', keyframes: {}}
        );
        const targetInDoc = parentWin.document.createElement('div');
        targetInDoc.setAttribute('id', 'target1');
        parentWin.document.body.appendChild(targetInDoc);
        const targetInEmbed = embedWin.document.createElement('div');
        targetInEmbed.setAttribute('id', 'target1');
        embedWin.document.body.appendChild(targetInEmbed);
        return anim.createRunner_().then(runner => {
          const requests = runner.requests_;
          expect(requests).to.have.length(1);
          expect(requests[0].target).to.equal(targetInEmbed);
        });
      });

      it('should find target in the embed only via target', function*() {
        const parentWin = env.ampdoc.win;
        const embedWin = embed.win;
        const anim = yield createAnim(
          {},
          {duration: 1001, target: 'target1', keyframes: {}}
        );
        const targetInDoc = parentWin.document.createElement('div');
        targetInDoc.setAttribute('id', 'target1');
        parentWin.document.body.appendChild(targetInDoc);
        const targetInEmbed = embedWin.document.createElement('div');
        targetInEmbed.setAttribute('id', 'target1');
        embedWin.document.body.appendChild(targetInEmbed);
        return anim.createRunner_().then(runner => {
          const requests = runner.requests_;
          expect(requests).to.have.length(1);
          expect(requests[0].target).to.equal(targetInEmbed);
        });
      });

      it("should take resize from embed's window", function*() {
        const anim = yield createAnim({}, {duration: 1001});
        const stub = sandbox.stub(anim, 'onResize_');
        embed.win.eventListeners.fire({type: 'resize'});
        expect(stub).to.be.calledOnce;
      });
    }
  );
});
