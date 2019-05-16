/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {VisibilityModel} from '../visibility-model';

const NO_SPEC = {};
const NO_CALC = () => 0;

describes.sandboxed('VisibilityModel', {}, () => {
  let startTime;
  let clock;

  const tick = async (timeout = 0) => {
    // Wait for the micro-task queue to clear since we need to wait for
    // internal promises to finish before running assertions;
    await Promise.resolve();
    clock.tick(timeout);
  };

  beforeEach(() => {
    clock = sandbox.useFakeTimers();
    startTime = 10000;
    clock.tick(startTime + 1);
  });

  describe('config', () => {
    function config(spec) {
      return new VisibilityModel(spec, NO_CALC).spec_;
    }

    function getRepeat(spec) {
      const model = new VisibilityModel(spec, NO_CALC);
      return {
        repeat: model.repeat_,
      };
    }

    it('should parse visiblePercentageMin', () => {
      expect(config({}).visiblePercentageMin).to.equal(0);
      expect(config({visiblePercentageMin: ''}).visiblePercentageMin).to.equal(
        0
      );
      expect(config({visiblePercentageMin: 0}).visiblePercentageMin).to.equal(
        0
      );
      expect(config({visiblePercentageMin: '0'}).visiblePercentageMin).to.equal(
        0
      );
      expect(config({visiblePercentageMin: 50}).visiblePercentageMin).to.equal(
        0.5
      );
      expect(
        config({visiblePercentageMin: '50'}).visiblePercentageMin
      ).to.equal(0.5);
      expect(config({visiblePercentageMin: 100}).visiblePercentageMin).to.equal(
        1
      );
      expect(
        config({visiblePercentageMin: '100'}).visiblePercentageMin
      ).to.equal(1);
    });

    it('should parse visiblePercentageMax', () => {
      expect(config({}).visiblePercentageMax).to.equal(1);
      expect(config({visiblePercentageMax: ''}).visiblePercentageMax).to.equal(
        1
      );
      expect(config({visiblePercentageMax: 0}).visiblePercentageMax).to.equal(
        0
      );
      expect(config({visiblePercentageMax: '0'}).visiblePercentageMax).to.equal(
        0
      );
      expect(config({visiblePercentageMax: 50}).visiblePercentageMax).to.equal(
        0.5
      );
      expect(
        config({visiblePercentageMax: '50'}).visiblePercentageMax
      ).to.equal(0.5);
      expect(config({visiblePercentageMax: 100}).visiblePercentageMax).to.equal(
        1
      );
      expect(
        config({visiblePercentageMax: '100'}).visiblePercentageMax
      ).to.equal(1);
    });

    it('should parse totalTimeMin', () => {
      expect(config({}).totalTimeMin).to.equal(0);
      expect(config({totalTimeMin: ''}).totalTimeMin).to.equal(0);
      expect(config({totalTimeMin: 0}).totalTimeMin).to.equal(0);
      expect(config({totalTimeMin: '0'}).totalTimeMin).to.equal(0);
      expect(config({totalTimeMin: 50}).totalTimeMin).to.equal(50);
      expect(config({totalTimeMin: '50'}).totalTimeMin).to.equal(50);
      expect(config({totalTimeMin: 100}).totalTimeMin).to.equal(100);
      expect(config({totalTimeMin: '100'}).totalTimeMin).to.equal(100);
    });

    it('should parse totalTimeMax', () => {
      expect(config({}).totalTimeMax).to.equal(Infinity);
      expect(config({totalTimeMax: ''}).totalTimeMax).to.equal(Infinity);
      expect(config({totalTimeMax: 0}).totalTimeMax).to.equal(Infinity);
      expect(config({totalTimeMax: '0'}).totalTimeMax).to.equal(Infinity);
      expect(config({totalTimeMax: 50}).totalTimeMax).to.equal(50);
      expect(config({totalTimeMax: '50'}).totalTimeMax).to.equal(50);
      expect(config({totalTimeMax: 100}).totalTimeMax).to.equal(100);
      expect(config({totalTimeMax: '100'}).totalTimeMax).to.equal(100);
    });

    it('should parse continuousTimeMin', () => {
      expect(config({}).continuousTimeMin).to.equal(0);
      expect(config({continuousTimeMin: ''}).continuousTimeMin).to.equal(0);
      expect(config({continuousTimeMin: 0}).continuousTimeMin).to.equal(0);
      expect(config({continuousTimeMin: '0'}).continuousTimeMin).to.equal(0);
      expect(config({continuousTimeMin: 50}).continuousTimeMin).to.equal(50);
      expect(config({continuousTimeMin: '50'}).continuousTimeMin).to.equal(50);
      expect(config({continuousTimeMin: 100}).continuousTimeMin).to.equal(100);
      expect(config({continuousTimeMin: '100'}).continuousTimeMin).to.equal(
        100
      );
    });

    it('should parse continuousTimeMax', () => {
      expect(config({}).continuousTimeMax).to.equal(Infinity);
      expect(config({continuousTimeMax: ''}).continuousTimeMax).to.equal(
        Infinity
      );
      expect(config({continuousTimeMax: 0}).continuousTimeMax).to.equal(
        Infinity
      );
      expect(config({continuousTimeMax: '0'}).continuousTimeMax).to.equal(
        Infinity
      );
      expect(config({continuousTimeMax: 50}).continuousTimeMax).to.equal(50);
      expect(config({continuousTimeMax: '50'}).continuousTimeMax).to.equal(50);
      expect(config({continuousTimeMax: 100}).continuousTimeMax).to.equal(100);
      expect(config({continuousTimeMax: '100'}).continuousTimeMax).to.equal(
        100
      );
    });

    it('should parse repeat', () => {
      // Accept boolean
      expect(getRepeat({repeat: true}).repeat).to.be.true;
      expect(getRepeat({repeat: 'true'}).repeat).to.be.false;
      expect(getRepeat({repeat: 'invalid'}).repeat).to.be.false;

      // Not accept number
      expect(getRepeat({repeat: '200'}).repeat).to.be.false;
      expect(getRepeat({repeat: 200}).repeat).to.be.false;
    });
  });

  describe('structure', () => {
    let visibility;
    let calcVisibility;

    beforeEach(() => {
      visibility = 0;
      calcVisibility = () => visibility;
    });

    it('should dispose fully', () => {
      const vh = new VisibilityModel(NO_SPEC, calcVisibility);
      vh.scheduledUpdateTimeoutId_ = 1;
      vh.scheduleRepeatId_ = 1;
      const unsubscribeSpy = sandbox.spy();
      vh.unsubscribe(unsubscribeSpy);
      const removeSpy = sandbox.spy(vh.onTriggerObservable_, 'removeAll');

      vh.dispose();
      expect(vh.scheduledUpdateTimeoutId_).to.be.null;
      expect(vh.scheduleRepeatId_).to.be.null;
      expect(unsubscribeSpy).to.be.calledOnce;
      expect(vh.unsubscribe_).to.be.empty;
      expect(vh.eventResolver_).to.be.null;
      expect(removeSpy).to.be.called;
      expect(vh.onTriggerObservable_).to.be.null;
    });

    it('should update on any visibility event', () => {
      const updateStub = sandbox.stub(VisibilityModel.prototype, 'update_');
      const vh = new VisibilityModel(NO_SPEC, calcVisibility);
      vh.setReady(true);
      vh.setReady(false);
      expect(updateStub.callCount).to.equal(2);
    });

    it('should NOT update when started visible', () => {
      const updateStub = sandbox.stub(VisibilityModel.prototype, 'update_');
      visibility = 1;
      const vh = new VisibilityModel(NO_SPEC, calcVisibility);
      expect(updateStub).to.not.be.called;

      vh.update();
      expect(updateStub).to.be.calledOnce;
      expect(updateStub).to.be.calledWith(1);
    });

    it('should NOT update when started invisible', () => {
      const updateStub = sandbox.stub(VisibilityModel.prototype, 'update_');
      visibility = 0;
      const vh = new VisibilityModel(NO_SPEC, calcVisibility);
      expect(updateStub).to.not.be.called;

      vh.update();
      expect(updateStub).to.be.calledOnce;
      expect(updateStub).to.be.calledWith(0);
    });

    it('should update visibility and ready', () => {
      const updateStub = sandbox.stub(VisibilityModel.prototype, 'update_');
      visibility = 0;
      const vh = new VisibilityModel(NO_SPEC, calcVisibility);

      visibility = 0.5;
      vh.update();
      expect(updateStub.args[0][0]).to.equal(0.5);

      vh.setReady(false);
      expect(updateStub.args[1][0]).to.equal(0);

      vh.setReady(true);
      expect(updateStub.args[2][0]).to.equal(0.5);
    });

    it('should default export var state', () => {
      const vh = new VisibilityModel(NO_SPEC, calcVisibility);
      expect(vh.getState(0)).to.contains({
        firstSeenTime: 0,
        lastSeenTime: 0,
        lastVisibleTime: 0,
        firstVisibleTime: 0,
        maxContinuousVisibleTime: 0,
        totalVisibleTime: 0,
        loadTimeVisibility: 0,
        minVisiblePercentage: 0,
        maxVisiblePercentage: 0,
      });
    });

    it('should export full state', () => {
      const vh = new VisibilityModel(NO_SPEC, calcVisibility);
      vh.firstSeenTime_ = 2;
      vh.lastSeenTime_ = 3;
      vh.lastVisibleTime_ = 4;
      vh.firstVisibleTime_ = 5;
      vh.maxContinuousVisibleTime_ = 10;
      vh.totalVisibleTime_ = 11;
      vh.loadTimeVisibility_ = 0.1;
      vh.minVisiblePercentage_ = 0.2;
      vh.maxVisiblePercentage_ = 0.3;
      vh.initialScrollDepth_ = 123;
      expect(vh.getState(1)).to.deep.equal({
        // Base times:
        firstSeenTime: 1,
        lastSeenTime: 2,
        lastVisibleTime: 3,
        firstVisibleTime: 4,
        // Durations:
        maxContinuousVisibleTime: 10,
        totalVisibleTime: 11,
        // Percent:
        loadTimeVisibility: 10,
        minVisiblePercentage: 20,
        maxVisiblePercentage: 30,
      });
    });

    it('should reset on repeat', () => {
      const vh = new VisibilityModel(NO_SPEC, calcVisibility);
      vh.firstSeenTime_ = 2;
      vh.lastSeenTime_ = 3;
      vh.lastVisibleTime_ = 4;
      vh.firstVisibleTime_ = 5;
      vh.maxContinuousVisibleTime_ = 10;
      vh.totalVisibleTime_ = 11;
      vh.loadTimeVisibility_ = 0.1;
      vh.minVisiblePercentage_ = 0.2;
      vh.maxVisiblePercentage_ = 0.3;
      vh.eventResolver_ = null;
      vh.reset_();
      expect(vh.getState(0)).to.contains({
        firstSeenTime: 0,
        lastSeenTime: 0,
        lastVisibleTime: 0,
        firstVisibleTime: 0,
        maxContinuousVisibleTime: 0,
        totalVisibleTime: 0,
        loadTimeVisibility: 10,
        minVisiblePercentage: 0,
        maxVisiblePercentage: 0,
      });
      expect(vh.eventResolver_).to.not.be.null;
    });

    it('should not reset scroll depths on repeat', () => {
      const vh = new VisibilityModel(NO_SPEC, calcVisibility);
      vh.firstSeenTime_ = 2;
      vh.lastSeenTime_ = 3;
      vh.lastVisibleTime_ = 4;
      vh.firstVisibleTime_ = 5;
      vh.maxContinuousVisibleTime_ = 10;
      vh.totalVisibleTime_ = 11;
      vh.loadTimeVisibility_ = 0.1;
      vh.minVisiblePercentage_ = 0.2;
      vh.maxVisiblePercentage_ = 0.3;
      vh.eventResolver_ = null;
      vh.initialScrollDepth_ = 123;
      vh.reset_();
      expect(vh.getState(0)).to.contains({
        firstSeenTime: 0,
        lastSeenTime: 0,
        lastVisibleTime: 0,
        firstVisibleTime: 0,
        maxContinuousVisibleTime: 0,
        totalVisibleTime: 0,
        loadTimeVisibility: 10,
        minVisiblePercentage: 0,
        maxVisiblePercentage: 0,
      });
      expect(vh.eventResolver_).to.not.be.null;
    });
  });

  describe('update monitor', () => {
    let vh;
    let updateStub;
    let eventSpy;
    let visibilityValueForTesting = null;

    beforeEach(() => {
      vh = new VisibilityModel(
        {
          minVisiblePercentage: 25,
          totalTimeMin: 10,
          continuousTimeMin: 10,
          continuousTimeMax: 1000,
        },
        NO_CALC
      );
      updateStub = sandbox.stub(vh, 'update').callsFake(() => {
        if (visibilityValueForTesting) {
          vh.update_(visibilityValueForTesting);
        }
      });
      sandbox.stub(vh, 'getVisibility_').callsFake(() => {
        return visibilityValueForTesting;
      });
      eventSpy = vh.eventResolver_ = sandbox.spy();
    });

    afterEach(() => {
      visibilityValueForTesting = null;
    });

    it('conditions not met only', () => {
      sandbox.stub(vh, 'setReady'); // Because it calls update()
      visibilityValueForTesting = 0.1;
      vh.update_(visibilityValueForTesting);
      expect(vh.scheduledUpdateTimeoutId_).to.be.ok;
      expect(updateStub).to.not.be.called;

      // Check schedule for 10 seconds.
      clock.tick(9);
      expect(updateStub).to.not.be.called;
      clock.tick(1);
      expect(updateStub).to.be.calledOnce;
      expect(vh.scheduledUpdateTimeoutId_).to.be.null;
    });

    it('conditions not met and cannot schedule', () => {
      vh.continuousTime_ = vh.totalVisibleTime_ = 10;
      vh.update_(0.1);
      expect(vh.scheduledUpdateTimeoutId_).to.be.null;
    });

    it('conditions not met, schedule for total time', () => {
      vh.totalVisibleTime_ = 5;
      vh.continuousTime_ = 2;
      visibilityValueForTesting = 0.1;
      vh.update_(visibilityValueForTesting);
      expect(vh.scheduledUpdateTimeoutId_).to.be.ok;

      // Check schedule for 5 seconds.
      clock.tick(4);
      expect(updateStub).to.not.be.called;
      clock.tick(1);
      expect(updateStub).to.be.calledOnce;
      clock.tick(3);
      expect(updateStub).to.be.calledTwice;
      expect(vh.scheduledUpdateTimeoutId_).to.be.null;
    });

    it('conditions not met, schedule for continuous time', () => {
      vh.continuousTime_ = 4;
      vh.update_(0.1);
      expect(vh.scheduledUpdateTimeoutId_).to.be.ok;

      // Check schedule for 6 seconds.
      clock.tick(5);
      expect(updateStub).to.not.be.called;
      clock.tick(1);
      expect(updateStub).to.be.calledOnce;
      expect(vh.scheduledUpdateTimeoutId_).to.be.null;
    });

    it('conditions not met, schedule timeout again', () => {
      vh.spec_.totalTimeMin = 50;
      vh.totalVisibleTime_ = 4;
      vh.continuousTime_ = 4;
      visibilityValueForTesting = 0.1;
      vh.update_(visibilityValueForTesting);
      clock.tick(6);
      expect(updateStub).to.be.calledOnce;
      clock.tick(40);
      expect(updateStub).to.be.calledTwice;
      expect(vh.scheduledUpdateTimeoutId_).to.be.null;
    });

    it('conditions not met, schedule w/o total time', () => {
      vh.totalVisibleTime_ = 10;
      vh.continuousTime_ = 4;
      vh.update_(0.1);
      expect(vh.scheduledUpdateTimeoutId_).to.be.ok;

      // Check schedule for 6 seconds.
      clock.tick(5);
      expect(updateStub).to.not.be.called;
      clock.tick(1);
      expect(updateStub).to.be.calledOnce;
      expect(vh.scheduledUpdateTimeoutId_).to.be.null;
    });

    it('conditions not met, schedule w/o continuous time', () => {
      vh.totalVisibleTime_ = 5;
      vh.continuousTime_ = 10;
      vh.update_(0.1);
      expect(vh.scheduledUpdateTimeoutId_).to.be.ok;

      // Check schedule for 5 seconds.
      clock.tick(4);
      expect(updateStub).to.not.be.called;
      clock.tick(1);
      expect(updateStub).to.be.calledOnce;
      expect(vh.scheduledUpdateTimeoutId_).to.be.null;
    });

    it('conditions not met -> invisible', () => {
      vh.update_(0.1);
      expect(vh.scheduledUpdateTimeoutId_).to.be.ok;

      // Goes invisible.
      vh.update_(0);
      expect(vh.scheduledUpdateTimeoutId_).to.be.null;
      clock.tick(1000);
      expect(updateStub).to.not.be.called;
    });

    it('conditions met', () => {
      vh.update_(0.1);
      expect(vh.scheduledUpdateTimeoutId_).to.be.ok;

      // Goes invisible.
      vh.continuousTime_ = vh.totalVisibleTime_ = 10;
      vh.update_(1);
      expect(vh.scheduledUpdateTimeoutId_).to.be.null;
      expect(eventSpy).to.be.calledOnce;
      clock.tick(1000);
      expect(updateStub).to.not.be.called;
    });

    describe('with reportReadyPromise', () => {
      let reportPromise;
      let promiseResolver;
      beforeEach(() => {
        reportPromise = new Promise(resolve => {
          promiseResolver = resolve;
        });
        vh.setReportReady(() => reportPromise);
      });

      it('conditions met, send when report ready', () => {
        visibilityValueForTesting = 1;
        vh.update();
        clock.tick(20);
        vh.update();
        expect(eventSpy).to.not.be.called;
        promiseResolver();
        return reportPromise.then(() => {
          expect(eventSpy).to.be.calledOnce;
        });
      });

      it('conditions met, but no longer met when ready to report', () => {
        visibilityValueForTesting = 1;
        vh.update();
        clock.tick(20);
        vh.update();
        eventSpy.resetHistory();
        expect(eventSpy).to.not.be.called;
        clock.tick(1001);
        promiseResolver();
        return reportPromise.then(() => {
          expect(eventSpy).to.not.be.called;
        });
      });

      describe('with reportWhen', () => {
        beforeEach(() => {
          visibilityValueForTesting = 0;
        });

        const shouldTriggerEventTestSpecs = [
          {reportWhen: 'documentExit'},
          {reportWhen: 'documentHidden'},
          {
            reportWhen: 'documentExit',
            totalTimeMin: 100000,
            visiblePercentageMin: 50,
          },
        ];

        for (const i in shouldTriggerEventTestSpecs) {
          it(
            'should trigger event with reportWhen,' + `test case #${i}`,
            async () => {
              const vh = new VisibilityModel(
                shouldTriggerEventTestSpecs[i],
                () => 0
              );

              vh.onTriggerEvent(eventSpy);
              // TODO(warrengm): Inverting the two following lines will break this
              // test. Consider updating the API to make it safer.
              vh.setReportReady(() => reportPromise);
              vh.setReady(true);

              vh.update();
              await tick();
              expect(eventSpy).to.not.be.called;

              promiseResolver();
              await tick();
              expect(eventSpy).to.be.calledOnce;

              // Subsequent calls should not trigger the event again.
              vh.update();
              await tick();
              expect(eventSpy).to.be.calledOnce;
            }
          );
        }
      });
    });

    it('conditions met, wait to reset', () => {
      const resolveSpy = (vh.eventResolver_ = sandbox.spy());
      vh.update_(1);
      vh.continuousTime_ = 10;
      vh.totalVisibleTime_ = 10;
      vh.waitToReset_ = true;
      vh.update_(1);
      expect(resolveSpy).to.not.be.called;
    });

    it('conditions not met, reset', () => {
      const updateCounterSpy = (vh.updateCounters_ = sandbox.spy());
      const resetSpy = (vh.reset_ = sandbox.spy());
      vh.waitToReset_ = true;
      vh.update_(1);
      expect(resetSpy).to.not.be.called;
      vh.update_(0);
      expect(resetSpy).to.be.called;
      expect(updateCounterSpy).to.not.be.called;
    });
  });

  describe('tracking math', () => {
    it('should register "seen" values', () => {
      const vh = new VisibilityModel(NO_SPEC, NO_CALC);

      // Not yet visible: nothing is registered.
      vh.updateCounters_(0);
      expect(vh.getState(startTime)).to.contains({
        firstSeenTime: 0,
        lastSeenTime: 0,
        loadTimeVisibility: 0,
      });

      // First-time visible: values updated.
      clock.tick(100);
      vh.updateCounters_(0.1);
      expect(vh.getState(startTime)).to.contains({
        firstSeenTime: 101,
        lastSeenTime: 101,
        loadTimeVisibility: 10,
      });

      // Repeat visible: most values do not change.
      clock.tick(100);
      vh.updateCounters_(0.2);
      expect(vh.getState(startTime)).to.contains({
        firstSeenTime: 101,
        lastSeenTime: 201,
        loadTimeVisibility: 10,
      });
    });

    it('should ignore "load visibility" after timeout', () => {
      const vh = new VisibilityModel(NO_SPEC, NO_CALC);
      clock.tick(500);
      vh.updateCounters_(0.1);
      expect(vh.getState(startTime)).to.contains({
        firstSeenTime: 501,
        lastSeenTime: 501,
        loadTimeVisibility: 0,
      });
    });

    it('should match default visibility position', () => {
      const vh = new VisibilityModel(NO_SPEC, NO_CALC);
      vh.updateCounters_(0);
      expect(vh.matchesVisibility_).to.be.false;

      vh.updateCounters_(0.0001);
      expect(vh.matchesVisibility_).to.be.true;

      vh.updateCounters_(0.9999);
      expect(vh.matchesVisibility_).to.be.true;

      vh.updateCounters_(1);
      expect(vh.matchesVisibility_).to.be.true;
    });

    it('should NOT allow invalid values', () => {
      const vh = new VisibilityModel(NO_SPEC, NO_CALC);
      allowConsoleError(() => {
        expect(() => {
          vh.updateCounters_(-1);
        }).to.throw(/invalid visibility value/);
        expect(() => {
          vh.updateCounters_(1.00001);
        }).to.throw(/invalid visibility value/);
      });
    });

    it('should match custom visibility position', () => {
      const vh = new VisibilityModel(
        {
          visiblePercentageMin: 10,
          visiblePercentageMax: 90,
        },
        NO_CALC
      );
      vh.updateCounters_(0);
      expect(vh.matchesVisibility_).to.be.false;

      vh.updateCounters_(0.1);
      expect(vh.matchesVisibility_).to.be.false;

      vh.updateCounters_(0.1001);
      expect(vh.matchesVisibility_).to.be.true;

      vh.updateCounters_(0.9);
      expect(vh.matchesVisibility_).to.be.true;

      vh.updateCounters_(0.90001);
      expect(vh.matchesVisibility_).to.be.false;

      vh.updateCounters_(1);
      expect(vh.matchesVisibility_).to.be.false;
    });

    it('should transition to visible and stay visible', () => {
      const vh = new VisibilityModel(NO_SPEC, NO_CALC);
      clock.tick(100);
      vh.updateCounters_(0.1);
      expect(vh.getState(startTime)).to.contains({
        firstVisibleTime: 101,
        lastVisibleTime: 101,
        totalVisibleTime: 0,
        maxContinuousVisibleTime: 0,
        minVisiblePercentage: 10,
        maxVisiblePercentage: 10,
      });
      expect(vh.lastVisibleUpdateTime_).to.equal(Date.now());

      // Stay visible.
      clock.tick(100);
      vh.updateCounters_(0.05);
      expect(vh.getState(startTime)).to.contains({
        firstVisibleTime: 101, // Doesn't change.
        lastVisibleTime: 201,
        totalVisibleTime: 100,
        maxContinuousVisibleTime: 100,
        minVisiblePercentage: 5,
        maxVisiblePercentage: 10,
      });
      expect(vh.lastVisibleUpdateTime_).to.equal(Date.now());

      // Continue visible.
      clock.tick(100);
      vh.updateCounters_(0.2);
      expect(vh.getState(startTime)).to.contains({
        firstVisibleTime: 101, // Doesn't change.
        lastVisibleTime: 301,
        totalVisibleTime: 200,
        maxContinuousVisibleTime: 200,
        minVisiblePercentage: 5,
        maxVisiblePercentage: 20,
      });
      expect(vh.lastVisibleUpdateTime_).to.equal(Date.now());
    });

    it('should transition to invisible and back to visible', () => {
      const vh = new VisibilityModel(NO_SPEC, NO_CALC);
      clock.tick(100);
      vh.updateCounters_(0.1);
      expect(vh.getState(startTime)).to.contains({
        firstVisibleTime: 101,
        lastVisibleTime: 101,
        totalVisibleTime: 0,
        maxContinuousVisibleTime: 0,
        minVisiblePercentage: 10,
        maxVisiblePercentage: 10,
      });
      expect(vh.lastVisibleUpdateTime_).to.equal(Date.now());

      // Stay visible.
      clock.tick(100);
      vh.updateCounters_(0.05);
      expect(vh.getState(startTime)).to.contains({
        firstVisibleTime: 101, // Doesn't change.
        lastVisibleTime: 201,
        totalVisibleTime: 100,
        maxContinuousVisibleTime: 100,
        minVisiblePercentage: 5,
        maxVisiblePercentage: 10,
      });
      expect(vh.lastVisibleUpdateTime_).to.equal(Date.now());

      // Go invisible.
      clock.tick(100);
      vh.updateCounters_(0);
      expect(vh.getState(startTime)).to.contains({
        // Last update.
        totalVisibleTime: 200,
        maxContinuousVisibleTime: 200,
        lastVisibleTime: 301,
        // No changes.
        firstVisibleTime: 101,
        minVisiblePercentage: 5,
        maxVisiblePercentage: 10,
      });
      expect(vh.lastVisibleUpdateTime_).to.equal(0);

      // Stay invisible.
      clock.tick(100);
      vh.updateCounters_(0);
      expect(vh.getState(startTime)).to.contains({
        // No changes.
        totalVisibleTime: 200,
        maxContinuousVisibleTime: 200,
        lastVisibleTime: 301,
        firstVisibleTime: 101,
        minVisiblePercentage: 5,
        maxVisiblePercentage: 10,
      });
      expect(vh.lastVisibleUpdateTime_).to.equal(0);

      // Back to visible.
      clock.tick(100);
      vh.updateCounters_(0.6);
      expect(vh.getState(startTime)).to.contains({
        maxVisiblePercentage: 60,
        lastVisibleTime: 501,
        // No changes.
        totalVisibleTime: 200,
        maxContinuousVisibleTime: 200,
        firstVisibleTime: 101,
        minVisiblePercentage: 5,
      });
      expect(vh.lastVisibleUpdateTime_).to.equal(Date.now());

      // Stay to visible.
      clock.tick(100);
      vh.updateCounters_(0.7);
      expect(vh.getState(startTime)).to.contains({
        maxVisiblePercentage: 70,
        lastVisibleTime: 601,
        totalVisibleTime: 300,
        // No changes.
        maxContinuousVisibleTime: 200,
        firstVisibleTime: 101,
        minVisiblePercentage: 5,
      });
      expect(vh.lastVisibleUpdateTime_).to.equal(Date.now());
    });

    it('should yield based on position only', () => {
      const vh = new VisibilityModel(
        {
          visiblePercentageMin: 10,
          visiblePercentageMax: 90,
        },
        NO_CALC
      );
      clock.tick(100);
      expect(vh.updateCounters_(0)).to.be.false;
      expect(vh.updateCounters_(0.1)).to.be.false;
      expect(vh.updateCounters_(0.9001)).to.be.false;
      expect(vh.updateCounters_(0.1001)).to.be.true;
      expect(vh.updateCounters_(0.9)).to.be.true;
    });

    it('should yield based on total time only', () => {
      const vh = new VisibilityModel(
        {
          totalTimeMin: 10,
          totalTimeMax: 90,
        },
        NO_CALC
      );
      expect(vh.updateCounters_(0.1)).to.be.false;
      clock.tick(5);
      expect(vh.updateCounters_(0)).to.be.false;
      clock.tick(100);
      expect(vh.updateCounters_(0.1)).to.be.false;
      clock.tick(5);
      expect(vh.updateCounters_(0.1)).to.be.true;
      clock.tick(90);
      expect(vh.updateCounters_(0.1)).to.be.false;
    });

    it('should yield based on continuous time only', () => {
      const vh = new VisibilityModel(
        {
          continuousTimeMin: 10,
          continuousTimeMax: 90,
        },
        NO_CALC
      );
      expect(vh.updateCounters_(0.1)).to.be.false;
      clock.tick(5);
      expect(vh.updateCounters_(0)).to.be.false;
      clock.tick(100);
      expect(vh.updateCounters_(0.1)).to.be.false;
      clock.tick(5);
      expect(vh.updateCounters_(0.1)).to.be.false;
      clock.tick(5);
      expect(vh.updateCounters_(0.1)).to.be.true;
      clock.tick(90);
      expect(vh.updateCounters_(0.1)).to.be.false;
    });
  });

  describe('end-to-end events', () => {
    let visibility;
    let calcVisibility;

    beforeEach(() => {
      visibility = 0;
      calcVisibility = () => visibility;
    });

    it('should trigger for visibility percent only', () => {
      const vh = new VisibilityModel(
        {
          visiblePercentageMin: 49,
          visiblePercentageMax: 80,
        },
        calcVisibility
      );
      const eventSpy = (vh.eventResolver_ = sandbox.spy());

      visibility = 0.63;
      vh.update();
      expect(vh.getState(startTime)).to.contains({
        minVisiblePercentage: 63,
        maxVisiblePercentage: 63,
        loadTimeVisibility: 63,
      });
      expect(eventSpy).to.be.calledOnce;
    });

    it('should only update load-time visibility once', () => {
      const vh = new VisibilityModel(
        {
          visiblePercentageMin: 49,
          visiblePercentageMax: 80,
        },
        calcVisibility
      );
      const eventSpy = (vh.eventResolver_ = sandbox.spy());

      visibility = 0.49;
      vh.update();
      visibility = 0.63;
      vh.update();
      expect(vh.getState(startTime)).to.contains({
        minVisiblePercentage: 63,
        maxVisiblePercentage: 63,
        loadTimeVisibility: 49,
      });
      expect(eventSpy).to.be.calledOnce;
    });

    it('should fire with totalTimeMin condition', () => {
      const vh = new VisibilityModel(
        {
          totalTimeMin: 1000,
        },
        calcVisibility
      );
      const eventSpy = (vh.eventResolver_ = sandbox.spy());

      visibility = 0.63;
      vh.update();
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 63});
      expect(eventSpy).to.not.be.called;

      clock.tick(999);
      visibility = 0;
      vh.update();
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 63});
      expect(eventSpy).to.not.be.called;

      clock.tick(1000);
      visibility = 0.64;
      vh.update();
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 64});
      expect(eventSpy).to.not.be.called;

      sandbox.stub(vh, 'reset_');
      clock.tick(1);
      expect(vh.getState(startTime)).to.contains({
        maxVisiblePercentage: 64,
        totalVisibleTime: 1000,
      });
      expect(eventSpy).to.be.calledOnce;
    });

    it('should fire with continuousTimeMin condition', () => {
      const vh = new VisibilityModel(
        {
          continuousTimeMin: 1000,
        },
        calcVisibility
      );
      const eventSpy = (vh.eventResolver_ = sandbox.spy());

      visibility = 0.63;
      vh.update();
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 63});
      expect(eventSpy).to.not.be.called;

      clock.tick(999);
      visibility = 0;
      vh.update();
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 63});
      expect(eventSpy).to.not.be.called;

      clock.tick(1000);
      visibility = 0.64;
      vh.update();
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 64});
      expect(eventSpy).to.not.be.called;

      clock.tick(1);
      visibility = 0.65;
      vh.update();
      expect(vh.getState(startTime)).to.contains({
        maxVisiblePercentage: 65,
        totalVisibleTime: 1000,
      });
      expect(eventSpy).to.not.be.called;

      sandbox.stub(vh, 'reset_');
      clock.tick(999);
      expect(eventSpy).to.be.calledOnce;
      expect(vh.getState(startTime)).to.contains({
        maxVisiblePercentage: 65,
        totalVisibleTime: 1999,
      });
    });

    it('should fire with totalTimeMin and visiblePercentageMin', () => {
      const vh = new VisibilityModel(
        {
          totalTimeMin: 1000,
          visiblePercentageMin: 10,
        },
        calcVisibility
      );
      const eventSpy = (vh.eventResolver_ = sandbox.spy());

      visibility = 0.05;
      vh.update();
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 0});
      expect(eventSpy).to.not.be.called;

      clock.tick(1000);
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 0});
      expect(eventSpy).to.not.be.called;

      visibility = 0.11;
      vh.update();
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 11});
      expect(eventSpy).to.not.be.called;

      sandbox.stub(vh, 'reset_');
      clock.tick(1000);
      expect(eventSpy).to.be.calledOnce;
      expect(vh.getState(startTime)).to.contains({
        maxVisiblePercentage: 11,
        maxContinuousVisibleTime: 1000,
        totalVisibleTime: 1000,
        firstSeenTime: 1,
        firstVisibleTime: 1001,
        lastSeenTime: 2001,
        lastVisibleTime: 2001,
      });
    });

    it('should fire with continuousTimeMin=1k and totalTimeMin=2k', () => {
      const vh = new VisibilityModel(
        {
          totalTimeMin: 2000,
          continuousTimeMin: 1000,
        },
        calcVisibility
      );
      const eventSpy = (vh.eventResolver_ = sandbox.spy());

      visibility = 0.05;
      vh.update();
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 5});
      expect(eventSpy).to.not.be.called;

      clock.tick(1000);
      visibility = 0.1;
      vh.update();
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 10});
      expect(eventSpy).to.not.be.called;

      sandbox.stub(vh, 'reset_');
      clock.tick(1000);
      expect(eventSpy).to.be.calledOnce;
      expect(vh.getState(startTime)).to.contains({
        maxVisiblePercentage: 10,
        maxContinuousVisibleTime: 2000,
        totalVisibleTime: 2000,
        firstSeenTime: 1,
        firstVisibleTime: 1,
        lastSeenTime: 2001,
        lastVisibleTime: 2001,
      });
    });

    it('should fire with continuousTimeMin=1k and visPercentageMin=50', () => {
      const vh = new VisibilityModel(
        {
          continuousTimeMin: 1000,
          visiblePercentageMin: 49,
        },
        calcVisibility
      );
      const eventSpy = (vh.eventResolver_ = sandbox.spy());

      clock.tick(999);
      visibility = 0;
      vh.update();
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 0});
      expect(eventSpy).to.not.be.called;

      clock.tick(1000);
      visibility = 0.5;
      vh.update();
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 50});
      expect(eventSpy).to.not.be.called;

      clock.tick(999);
      expect(eventSpy).to.not.be.called;

      sandbox.stub(vh, 'reset_');
      clock.tick(1);
      expect(eventSpy).to.be.calledOnce;
      expect(vh.getState(startTime)).to.contains({
        maxContinuousVisibleTime: 1000,
        minVisiblePercentage: 50,
        maxVisiblePercentage: 50,
        totalVisibleTime: 1000,
      });
    });

    it('should fire for visiblePercentageMin=visiblePercentageMax=100', () => {
      const vh = new VisibilityModel(
        {
          visiblePercentageMin: 100,
          visiblePercentageMax: 100,
        },
        calcVisibility
      );
      const eventSpy = (vh.eventResolver_ = sandbox.spy());
      visibility = 0.99;
      clock.tick(200);
      vh.update();
      expect(eventSpy).to.not.be.called;
      visibility = 1.0;
      clock.tick(200);
      vh.update();
      expect(eventSpy).to.be.calledOnce;
    });

    it('should fire for visiblePercentageMin=visiblePercentageMax=0', () => {
      const vh = new VisibilityModel(
        {
          visiblePercentageMin: 0,
          visiblePercentageMax: 0,
          repeat: true,
        },
        calcVisibility
      );
      const eventSpy = (vh.eventResolver_ = sandbox.spy());
      sandbox.stub(vh, 'reset_').callsFake(() => {
        vh.eventPromise_ = new Promise(unused => {
          vh.eventResolver_ = eventSpy;
        });
        vh.eventPromise_.then(() => {
          vh.onTriggerObservable_.fire();
        });
        vh.scheduleRepeatId_ = null;
        vh.everMatchedVisibility_ = false;
        vh.matchesVisibility_ = false;
        vh.continuousTime_ = 0;
        vh.maxContinuousVisibleTime_ = 0;
        vh.totalVisibleTime_ = 0;
        vh.firstVisibleTime_ = 0;
        vh.firstSeenTime_ = 0;
        vh.lastSeenTime_ = 0;
        vh.lastVisibleTime_ = 0;
        vh.minVisiblePercentage_ = 0;
        vh.maxVisiblePercentage_ = 0;
        vh.lastVisibleUpdateTime_ = 0;
        vh.waitToReset_ = false;
      });
      visibility = 0;
      clock.tick(200);
      vh.update();
      expect(eventSpy).to.be.calledOnce;

      eventSpy.resetHistory();
      visibility = 1;
      clock.tick(200);
      vh.update();
      expect(eventSpy).to.not.be.called;

      visibility = 0;
      clock.tick(200);
      vh.update();
      expect(eventSpy).to.be.calledOnce;
    });
  });

  describe('end to end event repeat', () => {
    let visibility;
    let calcVisibility;

    beforeEach(() => {
      visibility = 0;
      calcVisibility = () => visibility;
    });

    it('should wait for repeat interval', function*() {
      const vh = new VisibilityModel(
        {
          visiblePercentageMin: 49,
          repeat: true,
        },
        calcVisibility
      );
      const spy = sandbox.spy();
      vh.onTriggerEvent(() => {
        spy();
        vh.maybeDispose();
      });
      visibility = 1;
      vh.update();
      yield vh.eventPromise_;
      expect(spy).to.be.calledOnce;
      clock.tick(999);
      yield vh.eventPromise_;
      expect(spy).to.be.calledOnce;
      clock.tick(1);
      yield vh.eventPromise_;
      expect(spy).to.be.calledOnce;
    });

    it('should wait for not match to fire again w/o interval', function*() {
      const vh = new VisibilityModel(
        {
          visiblePercentageMin: 49,
          repeat: true,
        },
        calcVisibility
      );
      const spy = sandbox.spy();
      vh.onTriggerEvent(() => {
        spy();
        vh.maybeDispose();
      });
      visibility = 0.5;
      vh.update();
      yield vh.eventPromise_;
      expect(spy).to.be.calledOnce;
      expect(vh.ready_).to.be.true;
      // With percentage range
      visibility = 0.51;
      vh.update();
      yield vh.eventPromise_;
      expect(spy).to.be.calledOnce;
      // Fallout percentage range
      visibility = 0;
      vh.update();
      visibility = 0.5;
      vh.update();
      yield vh.eventPromise_;
      expect(spy).to.be.calledTwice;
    });
  });

  describe('scroll depth', () => {
    let visibility;
    let calcVisibility;

    beforeEach(() => {
      visibility = 0;
      calcVisibility = () => visibility;
    });

    it('should correctly update initialScrollDepth', () => {
      const vh = new VisibilityModel(
        {
          repeat: true,
        },
        calcVisibility
      );
      vh.maybeSetInitialScrollDepth(200);
      vh.maybeSetInitialScrollDepth(100);
      vh.maybeSetInitialScrollDepth(400);
      expect(vh.getInitialScrollDepth()).to.equal(200);
    });
  });
});
