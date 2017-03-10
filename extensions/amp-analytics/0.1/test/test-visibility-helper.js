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

import {
  IntersectionObserverPolyfill,
  nativeIntersectionObserverSupported,
} from '../../../../src/intersection-observer-polyfill';
import {
  VisibilityModel,
  VisibilityManagerForDoc,
  VisibilityManagerForEmbed,
} from '../visibility-helper';
import {VisibilityState} from '../../../../src/visibility-state';
import {documentStateFor} from '../../../../src/service/document-state';
import {layoutRectLtwh, rectIntersection} from '../../../../src/layout-rect';

const NO_PARENT = null;
const NO_SPEC = {};


describes.sandboxed('VisibilityModel', {}, () => {
  let startTime;
  let clock;

  beforeEach(() => {
    clock = sandbox.useFakeTimers();
    startTime = 10000;
    clock.tick(startTime + 1);
  });


  describe('config', () => {

    function config(spec) {
      return new VisibilityModel(NO_PARENT, spec, 0).spec_;
    }

    it('should parse visiblePercentageMin', () => {
      expect(config({}).visiblePercentageMin).to.equal(0);
      expect(config({visiblePercentageMin: ''}).visiblePercentageMin)
          .to.equal(0);
      expect(config({visiblePercentageMin: 0}).visiblePercentageMin)
          .to.equal(0);
      expect(config({visiblePercentageMin: '0'}).visiblePercentageMin)
          .to.equal(0);
      expect(config({visiblePercentageMin: 50}).visiblePercentageMin)
          .to.equal(0.5);
      expect(config({visiblePercentageMin: '50'}).visiblePercentageMin)
          .to.equal(0.5);
      expect(config({visiblePercentageMin: 100}).visiblePercentageMin)
          .to.equal(1);
      expect(config({visiblePercentageMin: '100'}).visiblePercentageMin)
          .to.equal(1);
    });

    it('should parse visiblePercentageMax', () => {
      expect(config({}).visiblePercentageMax).to.equal(1);
      expect(config({visiblePercentageMax: ''}).visiblePercentageMax)
          .to.equal(1);
      expect(config({visiblePercentageMax: 0}).visiblePercentageMax)
          .to.equal(1);
      expect(config({visiblePercentageMax: '0'}).visiblePercentageMax)
          .to.equal(1);
      expect(config({visiblePercentageMax: 50}).visiblePercentageMax)
          .to.equal(0.5);
      expect(config({visiblePercentageMax: '50'}).visiblePercentageMax)
          .to.equal(0.5);
      expect(config({visiblePercentageMax: 100}).visiblePercentageMax)
          .to.equal(1);
      expect(config({visiblePercentageMax: '100'}).visiblePercentageMax)
          .to.equal(1);
    });

    it('should parse totalTimeMin', () => {
      expect(config({}).totalTimeMin).to.equal(0);
      expect(config({totalTimeMin: ''}).totalTimeMin)
          .to.equal(0);
      expect(config({totalTimeMin: 0}).totalTimeMin)
          .to.equal(0);
      expect(config({totalTimeMin: '0'}).totalTimeMin)
          .to.equal(0);
      expect(config({totalTimeMin: 50}).totalTimeMin)
          .to.equal(50);
      expect(config({totalTimeMin: '50'}).totalTimeMin)
          .to.equal(50);
      expect(config({totalTimeMin: 100}).totalTimeMin)
          .to.equal(100);
      expect(config({totalTimeMin: '100'}).totalTimeMin)
          .to.equal(100);
    });

    it('should parse totalTimeMax', () => {
      expect(config({}).totalTimeMax).to.equal(Infinity);
      expect(config({totalTimeMax: ''}).totalTimeMax)
          .to.equal(Infinity);
      expect(config({totalTimeMax: 0}).totalTimeMax)
          .to.equal(Infinity);
      expect(config({totalTimeMax: '0'}).totalTimeMax)
          .to.equal(Infinity);
      expect(config({totalTimeMax: 50}).totalTimeMax)
          .to.equal(50);
      expect(config({totalTimeMax: '50'}).totalTimeMax)
          .to.equal(50);
      expect(config({totalTimeMax: 100}).totalTimeMax)
          .to.equal(100);
      expect(config({totalTimeMax: '100'}).totalTimeMax)
          .to.equal(100);
    });

    it('should parse continuousTimeMin', () => {
      expect(config({}).continuousTimeMin).to.equal(0);
      expect(config({continuousTimeMin: ''}).continuousTimeMin)
          .to.equal(0);
      expect(config({continuousTimeMin: 0}).continuousTimeMin)
          .to.equal(0);
      expect(config({continuousTimeMin: '0'}).continuousTimeMin)
          .to.equal(0);
      expect(config({continuousTimeMin: 50}).continuousTimeMin)
          .to.equal(50);
      expect(config({continuousTimeMin: '50'}).continuousTimeMin)
          .to.equal(50);
      expect(config({continuousTimeMin: 100}).continuousTimeMin)
          .to.equal(100);
      expect(config({continuousTimeMin: '100'}).continuousTimeMin)
          .to.equal(100);
    });

    it('should parse continuousTimeMax', () => {
      expect(config({}).continuousTimeMax).to.equal(Infinity);
      expect(config({continuousTimeMax: ''}).continuousTimeMax)
          .to.equal(Infinity);
      expect(config({continuousTimeMax: 0}).continuousTimeMax)
          .to.equal(Infinity);
      expect(config({continuousTimeMax: '0'}).continuousTimeMax)
          .to.equal(Infinity);
      expect(config({continuousTimeMax: 50}).continuousTimeMax)
          .to.equal(50);
      expect(config({continuousTimeMax: '50'}).continuousTimeMax)
          .to.equal(50);
      expect(config({continuousTimeMax: 100}).continuousTimeMax)
          .to.equal(100);
      expect(config({continuousTimeMax: '100'}).continuousTimeMax)
          .to.equal(100);
    });
  });


  describe('structure', () => {
    beforeEach(() => {
    });

    it('should dispose fully', () => {
      const vh = new VisibilityModel(NO_PARENT, NO_SPEC, 0);
      vh.scheduledRunId_ = 1;
      const unsubscribeSpy = sandbox.spy();
      vh.unsubscribe(unsubscribeSpy);

      vh.dispose();
      expect(vh.scheduledRunId_).to.be.null;
      expect(unsubscribeSpy).to.be.calledOnce;
      expect(vh.unsubscribe_).to.be.empty;
      expect(vh.eventResolver_).to.be.null;
    });

    it('should dispose with parent', () => {
      const parent = new VisibilityModel(NO_PARENT, NO_SPEC, 0);
      const vh = new VisibilityModel(parent, NO_SPEC, 0);
      expect(parent.children_).to.have.length(1);
      expect(parent.children_[0]).to.equal(vh);

      vh.dispose();
      expect(parent.children_).to.have.length(0);
    });

    it('should update on any visibility event', () => {
      const updateStub = sandbox.stub(VisibilityModel.prototype, 'update');
      const vh = new VisibilityModel(NO_PARENT, NO_SPEC, 0);
      vh.setVisibility(0);
      vh.setVisibility(1);
      vh.setReady(true);
      vh.setReady(false);
      expect(updateStub.callCount).to.equal(4);
    });

    it('should NOT update when started visible', () => {
      const updateStub = sandbox.stub(VisibilityModel.prototype, 'update');
      new VisibilityModel(NO_PARENT, NO_SPEC, 1);
      expect(updateStub).to.not.be.called;
    });

    it('should NOT update when started invisible', () => {
      const updateStub = sandbox.stub(VisibilityModel.prototype, 'update');
      new VisibilityModel(NO_PARENT, NO_SPEC, 0);
      expect(updateStub).to.not.be.called;
    });

    it('should work w/o parent', () => {
      const vh = new VisibilityModel(NO_PARENT, NO_SPEC, 0);
      expect(vh.children_).to.be.null;  // Don't take extra memory.

      vh.setVisibility(0.5);
      expect(vh.getVisibility()).to.equal(0.5);

      vh.setReady(false);
      expect(vh.getVisibility()).to.equal(0);

      vh.setReady(true);
      expect(vh.getVisibility()).to.equal(0.5);
    });

    it('should work w/children', () => {
      const parent = new VisibilityModel(NO_PARENT, NO_SPEC, 0);
      const child1 = new VisibilityModel(parent, NO_SPEC, 0);
      const child2 = new VisibilityModel(parent, NO_SPEC, 0,
          /* factorParent */ true);
      expect(parent.children_).to.deep.equal([child1, child2]);
      expect(child1.parent_).to.equal(parent);
      expect(child2.parent_).to.equal(parent);

      // Visibility blocked by parent.
      child1.setVisibility(0.5);
      child2.setVisibility(0.5);
      expect(child1.getVisibility()).to.equal(0);
      expect(child2.getVisibility()).to.equal(0);

      // Visibility unblocked by parent.
      parent.setVisibility(0.7);
      expect(child1.getVisibility()).to.equal(0.5);
      expect(child2.getVisibility()).to.equal(0.35);  // 0.5 * 0.7 = 0.35

      // Block parent.
      parent.setReady(false);
      expect(child1.getVisibility()).to.equal(0);
      expect(child2.getVisibility()).to.equal(0);

      // Unlock parent.
      parent.setReady(true);
      expect(child1.getVisibility()).to.equal(0.5);
      expect(child2.getVisibility()).to.equal(0.35);  // 0.5 * 0.7 = 0.35

      // Block children.
      child1.setReady(false);
      child2.setReady(false);
      expect(child1.getVisibility()).to.equal(0);
      expect(child2.getVisibility()).to.equal(0);

      // Unblock children.
      child1.setReady(true);
      child2.setReady(true);
      expect(child1.getVisibility()).to.equal(0.5);
      expect(child2.getVisibility()).to.equal(0.35);  // 0.5 * 0.7 = 0.35

      // Invisible again.
      parent.setVisibility(0);
      expect(child1.getVisibility()).to.equal(0);
      expect(child2.getVisibility()).to.equal(0);
    });

    it('should update on visibility change', () => {
      const parent = new VisibilityModel(NO_PARENT, NO_SPEC, 0);
      const child1 = new VisibilityModel(parent, NO_SPEC, 0);
      const child2 = new VisibilityModel(parent, NO_SPEC, 0);
      child1.setVisibility(0.2);
      sandbox.stub(parent, 'update_');
      sandbox.stub(child1, 'update_');
      sandbox.stub(child2, 'update_');

      parent.setVisibility(0.1);
      expect(parent.update_).to.be.calledOnce;
      expect(child1.update_).to.be.calledOnce;
      expect(child2.update_).to.be.calledOnce;
      expect(parent.update_.args[0][0]).to.equal(0.1);
      expect(child1.update_.args[0][0]).to.equal(0.2);
      expect(child2.update_.args[0][0]).to.equal(0);

      parent.update();
      expect(parent.update_).to.be.calledTwice;
      expect(child1.update_).to.be.calledTwice;
      expect(child2.update_).to.be.calledTwice;
      expect(parent.update_.args[1][0]).to.equal(0.1);
      expect(child1.update_.args[1][0]).to.equal(0.2);
      expect(child2.update_.args[1][0]).to.equal(0);
    });

    it('should default export var state', () => {
      const vh = new VisibilityModel(NO_PARENT, NO_SPEC, 0);
      expect(vh.getState(0)).to.contains({
        firstSeenTime: 0,
        lastSeenTime: 0,
        lastVisibleTime: 0,
        fistVisibleTime: 0,
        maxContinuousVisibleTime: 0,
        totalVisibleTime: 0,
        loadTimeVisibility: 0,
        minVisiblePercentage: 0,
        maxVisiblePercentage: 0,
      });
    });

    it('should export full state', () => {
      const vh = new VisibilityModel(NO_PARENT, NO_SPEC, 0);
      vh.firstSeenTime_ = 2;
      vh.lastSeenTime_ = 3;
      vh.lastVisibleTime_ = 4;
      vh.fistVisibleTime_ = 5;
      vh.maxContinuousVisibleTime_ = 10;
      vh.totalVisibleTime_ = 11;
      vh.loadTimeVisibility_ = 0.1;
      vh.minVisiblePercentage_ = 0.2;
      vh.maxVisiblePercentage_ = 0.3;
      expect(vh.getState(1)).to.deep.equal({
        // Base times:
        firstSeenTime: 1,
        lastSeenTime: 2,
        lastVisibleTime: 3,
        fistVisibleTime: 4,
        // Durations:
        maxContinuousVisibleTime: 10,
        totalVisibleTime: 11,
        // Percent:
        loadTimeVisibility: 10,
        minVisiblePercentage: 20,
        maxVisiblePercentage: 30,
      });
    });
  });


  describe('update monitor', () => {
    let vh;
    let updateStub;
    let eventSpy;

    beforeEach(() => {
      vh = new VisibilityModel(NO_PARENT, {
        minVisiblePercentage: 25,
        totalTimeMin: 10,
        continuousTimeMin: 10,
      }, 0);
      updateStub = sandbox.stub(vh, 'update');
      eventSpy = vh.eventResolver_ = sandbox.spy();
    });

    it('conditions not met', () => {
      vh.update_(0.1);
      expect(vh.scheduledRunId_).to.be.ok;
      expect(updateStub).to.not.be.called;

      // Check schedule for 10 seconds.
      clock.tick(9);
      expect(updateStub).to.not.be.called;
      clock.tick(1);
      expect(updateStub).to.be.calledOnce;
      expect(vh.scheduledRunId_).to.be.null;
    });

    it('conditions not met and cannot schedule', () => {
      vh.continuousTime_ = vh.totalVisibleTime_ = 10;
      vh.update_(0.1);
      expect(vh.scheduledRunId_).to.be.null;
    });

    it('conditions not met, schedule for total time', () => {
      vh.totalVisibleTime_ = 5;
      vh.update_(0.1);
      expect(vh.scheduledRunId_).to.be.ok;

      // Check schedule for 5 seconds.
      clock.tick(4);
      expect(updateStub).to.not.be.called;
      clock.tick(1);
      expect(updateStub).to.be.calledOnce;
      expect(vh.scheduledRunId_).to.be.null;
    });

    it('conditions not met, schedule for continuous time', () => {
      vh.continuousTime_ = 4;
      vh.update_(0.1);
      expect(vh.scheduledRunId_).to.be.ok;

      // Check schedule for 6 seconds.
      clock.tick(5);
      expect(updateStub).to.not.be.called;
      clock.tick(1);
      expect(updateStub).to.be.calledOnce;
      expect(vh.scheduledRunId_).to.be.null;
    });

    it('conditions not met, schedule w/o total time', () => {
      vh.totalVisibleTime_ = 10;
      vh.continuousTime_ = 4;
      vh.update_(0.1);
      expect(vh.scheduledRunId_).to.be.ok;

      // Check schedule for 6 seconds.
      clock.tick(5);
      expect(updateStub).to.not.be.called;
      clock.tick(1);
      expect(updateStub).to.be.calledOnce;
      expect(vh.scheduledRunId_).to.be.null;
    });

    it('conditions not met, schedule w/o continuous time', () => {
      vh.totalVisibleTime_ = 5;
      vh.continuousTime_ = 10;
      vh.update_(0.1);
      expect(vh.scheduledRunId_).to.be.ok;

      // Check schedule for 5 seconds.
      clock.tick(4);
      expect(updateStub).to.not.be.called;
      clock.tick(1);
      expect(updateStub).to.be.calledOnce;
      expect(vh.scheduledRunId_).to.be.null;
    });

    it('conditions not met -> invisible', () => {
      vh.update_(0.1);
      expect(vh.scheduledRunId_).to.be.ok;

      // Goes invisible.
      vh.update_(0);
      expect(vh.scheduledRunId_).to.be.null;
      clock.tick(1000);
      expect(updateStub).to.not.be.called;
    });

    it('conditions met', () => {
      vh.update_(0.1);
      expect(vh.scheduledRunId_).to.be.ok;

      // Goes invisible.
      vh.continuousTime_ = vh.totalVisibleTime_ = 10;
      vh.update_(1);
      expect(vh.scheduledRunId_).to.be.null;
      expect(eventSpy).to.be.calledOnce;
      clock.tick(1000);
      expect(updateStub).to.not.be.called;
    });
  });


  describe('tracking math', () => {

    it('should register "seen" values', () => {
      const vh = new VisibilityModel(NO_PARENT, NO_SPEC);

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
      const vh = new VisibilityModel(NO_PARENT, NO_SPEC);
      clock.tick(500);
      vh.updateCounters_(0.1);
      expect(vh.getState(startTime)).to.contains({
        firstSeenTime: 501,
        lastSeenTime: 501,
        loadTimeVisibility: 0,
      });
    });

    it('should match default visibility position', () => {
      const vh = new VisibilityModel(NO_PARENT, NO_SPEC);
      vh.updateCounters_(0);
      expect(vh.matchesVisibility_).to.be.false;

      vh.updateCounters_(-1);
      expect(vh.matchesVisibility_).to.be.false;

      vh.updateCounters_(0.0001);
      expect(vh.matchesVisibility_).to.be.true;

      vh.updateCounters_(0.9999);
      expect(vh.matchesVisibility_).to.be.true;

      vh.updateCounters_(1);
      expect(vh.matchesVisibility_).to.be.true;

      vh.updateCounters_(1.00001);
      expect(vh.matchesVisibility_).to.be.false;
    });

    it('should match custom visibility position', () => {
      const vh = new VisibilityModel(NO_PARENT, {
        visiblePercentageMin: 10,
        visiblePercentageMax: 90,
      });
      vh.updateCounters_(0);
      expect(vh.matchesVisibility_).to.be.false;

      vh.updateCounters_(-1);
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

      vh.updateCounters_(1.00001);
      expect(vh.matchesVisibility_).to.be.false;
    });

    it('should transition to visible and stay visible', () => {
      const vh = new VisibilityModel(NO_PARENT, NO_SPEC);
      clock.tick(100);
      vh.updateCounters_(0.1);
      expect(vh.getState(startTime)).to.contains({
        fistVisibleTime: 101,
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
        fistVisibleTime: 101,  // Doesn't change.
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
        fistVisibleTime: 101,  // Doesn't change.
        lastVisibleTime: 301,
        totalVisibleTime: 200,
        maxContinuousVisibleTime: 200,
        minVisiblePercentage: 5,
        maxVisiblePercentage: 20,
      });
      expect(vh.lastVisibleUpdateTime_).to.equal(Date.now());
    });

    it('should transition to invisible and back to visible', () => {
      const vh = new VisibilityModel(NO_PARENT, NO_SPEC);
      clock.tick(100);
      vh.updateCounters_(0.1);
      expect(vh.getState(startTime)).to.contains({
        fistVisibleTime: 101,
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
        fistVisibleTime: 101,  // Doesn't change.
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
        fistVisibleTime: 101,
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
        fistVisibleTime: 101,
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
        fistVisibleTime: 101,
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
        fistVisibleTime: 101,
        minVisiblePercentage: 5,
      });
      expect(vh.lastVisibleUpdateTime_).to.equal(Date.now());
    });

    it('should yield based on position only', () => {
      const vh = new VisibilityModel(NO_PARENT, {
        visiblePercentageMin: 10,
        visiblePercentageMax: 90,
      });
      clock.tick(100);
      expect(vh.updateCounters_(0)).to.be.false;
      expect(vh.updateCounters_(0.1)).to.be.false;
      expect(vh.updateCounters_(0.9001)).to.be.false;
      expect(vh.updateCounters_(0.1001)).to.be.true;
      expect(vh.updateCounters_(0.9)).to.be.true;
    });

    it('should yield based on total time only', () => {
      const vh = new VisibilityModel(NO_PARENT, {
        totalTimeMin: 10,
        totalTimeMax: 90,
      });
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
      const vh = new VisibilityModel(NO_PARENT, {
        continuousTimeMin: 10,
        continuousTimeMax: 90,
      });
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

    it('should trigger for visibility percent only', () => {
      const vh = new VisibilityModel(NO_PARENT, {
        visiblePercentageMin: 49,
        visiblePercentageMax: 80,
      }, 0);
      const eventSpy = vh.eventResolver_ = sandbox.spy();

      vh.setVisibility(0.63);
      expect(vh.getState(startTime)).to.contains({
        minVisiblePercentage: 63,
        maxVisiblePercentage: 63,
        loadTimeVisibility: 63,
      });
      expect(eventSpy).to.be.calledOnce;
    });

    it('should only update load-time visibility once', () => {
      const vh = new VisibilityModel(NO_PARENT, {
        visiblePercentageMin: 49,
        visiblePercentageMax: 80,
      }, 0);
      const eventSpy = vh.eventResolver_ = sandbox.spy();

      vh.setVisibility(0.49);
      vh.setVisibility(0.63);
      expect(vh.getState(startTime)).to.contains({
        minVisiblePercentage: 63,
        maxVisiblePercentage: 63,
        loadTimeVisibility: 49,
      });
      expect(eventSpy).to.be.calledOnce;
    });

    it('should fire with totalTimeMin condition', () => {
      const vh = new VisibilityModel(NO_PARENT, {
        totalTimeMin: 1000,
      }, 0);
      const eventSpy = vh.eventResolver_ = sandbox.spy();

      vh.setVisibility(0.63);
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 63});
      expect(eventSpy).to.not.be.called;

      clock.tick(999);
      vh.setVisibility(0);
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 63});
      expect(eventSpy).to.not.be.called;

      clock.tick(1000);
      vh.setVisibility(0.64);
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 64});
      expect(eventSpy).to.not.be.called;

      clock.tick(1);
      expect(vh.getState(startTime)).to.contains({
        maxVisiblePercentage: 64,
        totalVisibleTime: 1000,
      });
      expect(eventSpy).to.be.calledOnce;
    });

    it('should fire with continuousTimeMin condition', () => {
      const vh = new VisibilityModel(NO_PARENT, {
        continuousTimeMin: 1000,
      }, 0);
      const eventSpy = vh.eventResolver_ = sandbox.spy();

      vh.setVisibility(0.63);
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 63});
      expect(eventSpy).to.not.be.called;

      clock.tick(999);
      vh.setVisibility(0);
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 63});
      expect(eventSpy).to.not.be.called;

      clock.tick(1000);
      vh.setVisibility(0.64);
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 64});
      expect(eventSpy).to.not.be.called;

      clock.tick(1);
      vh.setVisibility(0.65);
      expect(vh.getState(startTime)).to.contains({
        maxVisiblePercentage: 65,
        totalVisibleTime: 1000,
      });
      expect(eventSpy).to.not.be.called;

      clock.tick(999);
      expect(eventSpy).to.be.calledOnce;
      expect(vh.getState(startTime)).to.contains({
        maxVisiblePercentage: 65,
        totalVisibleTime: 1999,
      });
    });

    it('should fire with totalTimeMin and visiblePercentageMin', () => {
      const vh = new VisibilityModel(NO_PARENT, {
        totalTimeMin: 1000,
        visiblePercentageMin: 10,
      }, 0);
      const eventSpy = vh.eventResolver_ = sandbox.spy();

      vh.setVisibility(0.05);
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 0});
      expect(eventSpy).to.not.be.called;

      clock.tick(1000);
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 0});
      expect(eventSpy).to.not.be.called;

      vh.setVisibility(0.11);
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 11});
      expect(eventSpy).to.not.be.called;

      clock.tick(1000);
      expect(eventSpy).to.be.calledOnce;
      expect(vh.getState(startTime)).to.contains({
        maxVisiblePercentage: 11,
        maxContinuousVisibleTime: 1000,
        totalVisibleTime: 1000,
        firstSeenTime: 1,
        fistVisibleTime: 1001,
        lastSeenTime: 2001,
        lastVisibleTime: 2001,
      });
    });

    it('should fire with continuousTimeMin=1k and totalTimeMin=2k', () => {
      const vh = new VisibilityModel(NO_PARENT, {
        totalTimeMin: 2000,
        continuousTimeMin: 1000,
      }, 0);
      const eventSpy = vh.eventResolver_ = sandbox.spy();

      vh.setVisibility(0.05);
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 5});
      expect(eventSpy).to.not.be.called;

      clock.tick(1000);
      vh.setVisibility(0.1);
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 10});
      expect(eventSpy).to.not.be.called;

      clock.tick(1000);
      expect(eventSpy).to.be.calledOnce;
      expect(vh.getState(startTime)).to.contains({
        maxVisiblePercentage: 10,
        maxContinuousVisibleTime: 2000,
        totalVisibleTime: 2000,
        firstSeenTime: 1,
        fistVisibleTime: 1,
        lastSeenTime: 2001,
        lastVisibleTime: 2001,
      });
    });

    it('should fire with continuousTimeMin=1k and visPercentageMin=50', () => {
      const vh = new VisibilityModel(NO_PARENT, {
        continuousTimeMin: 1000,
        visiblePercentageMin: 49,
      }, 0);
      const eventSpy = vh.eventResolver_ = sandbox.spy();

      clock.tick(999);
      vh.setVisibility(0);
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 0});
      expect(eventSpy).to.not.be.called;

      clock.tick(1000);
      vh.setVisibility(0.5);
      expect(vh.getState(startTime)).to.contains({maxVisiblePercentage: 50});
      expect(eventSpy).to.not.be.called;

      clock.tick(999);
      expect(eventSpy).to.not.be.called;

      clock.tick(1);
      expect(eventSpy).to.be.calledOnce;
      expect(vh.getState(startTime)).to.contains({
        maxContinuousVisibleTime: 1000,
        minVisiblePercentage: 50,
        maxVisiblePercentage: 50,
        totalVisibleTime: 1000,
      });
    });
  });
});


describes.fakeWin('VisibilityManagerForDoc', {amp: true}, env => {
  let win;
  let ampdoc;
  let clock;
  let viewer, viewport;
  let root;
  let rootModel;
  let startVisibilityHandlerCount;
  let eventResolver, eventPromise;

  class IntersectionObserverStub {

    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.elements = [];
      this.disconnected = false;
    }

    observe(element) {
      if (this.disconnected) {
        throw new Error('disconnected');
      }
      if (this.elements.indexOf(element) == -1) {
        this.elements.push(element);
      }
    }

    unobserve(element) {
      if (this.disconnected) {
        throw new Error('disconnected');
      }
      const index = this.elements.indexOf(element);
      if (index == -1) {
        throw new Error('element not found');
      }
      this.elements.splice(index, 1);
    }

    disconnect() {
      if (this.disconnected) {
        throw new Error('disconnected');
      }
      this.disconnected = true;
    }
  }

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    clock = sandbox.useFakeTimers();
    clock.tick(1);

    viewer = win.services.viewer.obj;
    sandbox.stub(viewer, 'getFirstVisibleTime', () => 1);
    viewport = win.services.viewport.obj;
    startVisibilityHandlerCount =
        viewer.visibilityObservable_.getHandlerCount();

    root = new VisibilityManagerForDoc(ampdoc);
    rootModel = root.getRootModel();

    win.IntersectionObserver = IntersectionObserverStub;
    win.IntersectionObserverEntry = function() {};
    win.IntersectionObserverEntry.prototype.intersectionRatio = 1;

    eventPromise = new Promise(resolve => {
      eventResolver = resolve;
    });
  });

  it('should initialize correctly backgrounded', () => {
    viewer.setVisibilityState_(VisibilityState.HIDDEN);
    root = new VisibilityManagerForDoc(ampdoc);
    rootModel = root.getRootModel();

    expect(root.parent).to.be.null;
    expect(root.ampdoc).to.equal(ampdoc);
    expect(root.getStartTime()).to.equal(viewer.getFirstVisibleTime());
    expect(root.isBackgrounded()).to.be.true;
    expect(root.isBackgroundedAtStart()).to.be.true;

    // Will be initialized lazily
    expect(root.intersectionObserver_).to.be.null;

    // Root model starts invisible.
    expect(rootModel.parent_).to.be.null;
    expect(rootModel.getVisibility()).to.equal(0);
  });

  it('should initialize correctly foregrounded', () => {
    expect(root.parent).to.be.null;
    expect(root.ampdoc).to.equal(ampdoc);
    expect(root.getStartTime()).to.equal(viewer.getFirstVisibleTime());
    expect(root.isBackgrounded()).to.be.false;
    expect(root.isBackgroundedAtStart()).to.be.false;

    // Will be initialized lazily
    expect(root.intersectionObserver_).to.be.null;

    // Root model starts invisible.
    expect(rootModel.parent_).to.be.null;
    expect(rootModel.getVisibility()).to.equal(1);
  });

  it('should switch visibility based on viewer for main doc', () => {
    expect(viewer.visibilityObservable_.getHandlerCount())
        .equal(startVisibilityHandlerCount + 1);
    expect(rootModel.getVisibility()).to.equal(1);

    // Go prerender.
    viewer.setVisibilityState_(VisibilityState.PRERENDER);
    expect(rootModel.getVisibility()).to.equal(0);

    // Go hidden.
    viewer.setVisibilityState_(VisibilityState.HIDDEN);
    expect(rootModel.getVisibility()).to.equal(0);

    // Go visible.
    viewer.setVisibilityState_(VisibilityState.VISIBLE);
    expect(rootModel.getVisibility()).to.equal(1);
    expect(root.getStartTime()).to.equal(viewer.getFirstVisibleTime());
  });

  it('should switch visibility for in-a-box', () => {
    win.AMP_MODE = {runtime: 'inabox'};
    root = new VisibilityManagerForDoc(ampdoc);
    rootModel = root.getRootModel();

    // Check observer is correctly set.
    const inOb = root.intersectionObserver_;
    expect(inOb).to.be.instanceOf(IntersectionObserverStub);
    expect(inOb.elements).to.contain(win.document.documentElement);

    // Start as invisible.
    expect(rootModel.getVisibility()).to.equal(0);

    // Unrelated event.
    const otherTarget = win.document.createElement('div');
    inOb.callback([{
      target: otherTarget,
      intersectionRatio: 0.3,
    }]);
    expect(rootModel.getVisibility()).to.equal(0);

    // Move to the viewport.
    inOb.callback([
      {
        target: otherTarget,
        intersectionRatio: 0.5,
      },
      {
        target: win.document.documentElement,
        intersectionRatio: 0.3,
      },
    ]);
    expect(rootModel.getVisibility()).to.equal(0.3);

    // Back out of viewport.
    inOb.callback([
      {
        target: win.document.documentElement,
        intersectionRatio: 0,
      },
    ]);
    expect(rootModel.getVisibility()).to.equal(0);
  });

  it('should switch root model to no-visibility on dispose', () => {
    expect(rootModel.getVisibility()).to.equal(1);
    root.dispose();
    expect(rootModel.getVisibility()).to.equal(0);
  });

  it('should dispose everything', () => {
    const rootModelDisposed = sandbox.spy();
    rootModel.unsubscribe(rootModelDisposed);
    const modelsDisposed = sandbox.spy();
    const modelsCalled = sandbox.spy();
    const otherTarget = win.document.createElement('div');
    const spec = {totalTimeMin: 10};
    root.listenRoot(spec, null, modelsCalled);
    root.listenElement(otherTarget, spec, null, modelsCalled);
    root.listenElement(otherTarget, {totalTimeMin: 20}, null, modelsCalled);
    expect(root.models_).to.have.length(3);
    root.models_.forEach(model => {
      model.unsubscribe(modelsDisposed);
    });
    const otherUnsubscribes = sandbox.spy();
    root.unsubscribe(otherUnsubscribes);
    root.unsubscribe(otherUnsubscribes);
    const inOb = root.intersectionObserver_;
    expect(inOb.elements).to.contain(otherTarget);

    root.dispose();

    // Root model has been disposed.
    expect(rootModelDisposed).to.be.calledOnce;

    // All other models have been disposed.
    expect(root.models_).to.have.length(0);
    expect(modelsCalled).to.not.be.called;
    expect(modelsDisposed.callCount).to.equal(3);

    // All other unsubscribes have been called.
    expect(otherUnsubscribes.callCount).to.equal(2);

    // Viewer and viewport have been unsubscribed.
    expect(viewer.visibilityObservable_.getHandlerCount())
        .equal(startVisibilityHandlerCount);

    // Intersection observer disconnected.
    expect(inOb.disconnected).to.be.true;
    expect(root.intersectionObserver_).to.be.null;
    expect(inOb.elements).to.not.contain(otherTarget);
  });

  it('should polyfill and dispose intersection observer', () => {
    delete win.IntersectionObserver;

    const startScrollCount = viewport.scrollObservable_.getHandlerCount();
    const startChangeCount = viewport.changeObservable_.getHandlerCount();

    // Check observer is correctly set.
    const inOb = root.getIntersectionObserver_();
    expect(inOb).to.be.instanceOf(IntersectionObserverPolyfill);
    expect(viewport.scrollObservable_.getHandlerCount())
        .to.equal(startScrollCount + 1);
    expect(viewport.changeObservable_.getHandlerCount())
        .to.equal(startChangeCount + 1);

    root.dispose();
    expect(viewport.scrollObservable_.getHandlerCount())
        .to.equal(startScrollCount);
    expect(viewport.changeObservable_.getHandlerCount())
        .to.equal(startChangeCount);
  });

  it('should support polyfill on non-amp root element', () => {
    delete win.IntersectionObserver;
    const inOb = root.getIntersectionObserver_();

    const rootElement = win.document.documentElement;
    root.listenElement(rootElement, {}, null, eventResolver);
    expect(root.models_).to.have.length(1);
    const model = root.models_[0];
    expect(inOb.observeEntries_).to.have.length(1);

    // AMP API is polyfilled.
    expect(rootElement.getLayoutBox).to.be.function;
    expect(rootElement.getOwner()).to.be.null;

    // Starts as invisible.
    expect(model.getVisibility()).to.equal(0);

    // Trigger tick.
    sandbox.stub(viewport, 'getRect', () => {
      return {left: 0, top: 0, width: 100, height: 100};
    });
    expect(rootElement.getLayoutBox())
        .to.contain({left: 0, top: 0, width: 100, height: 100});
    viewport.scrollObservable_.fire({type: 'scroll'});
    expect(model.getVisibility()).to.equal(1);

    return eventPromise.then(() => {
      expect(inOb.observeEntries_).to.have.length(0);
    });
  });

  it('should listen on root', () => {
    clock.tick(1);
    const disposed = sandbox.spy();
    const spec = {totalTimeMin: 10};
    root.listenRoot(spec, null, eventResolver);

    expect(root.models_).to.have.length(1);
    const model = root.models_[0];
    model.unsubscribe(disposed);
    expect(model.parent_).to.equal(rootModel);
    expect(model.spec_.totalTimeMin).to.equal(10);
    expect(model.getVisibility()).to.equal(1);

    // Go invisible.
    rootModel.setVisibility(0);
    expect(model.getVisibility()).to.equal(0);

    // Back to visible.
    rootModel.setVisibility(1);
    expect(model.getVisibility()).to.equal(1);

    // Fire event.
    clock.tick(11);
    return eventPromise.then(state => {
      expect(disposed).to.be.calledOnce;
      expect(root.models_).to.have.length(0);

      expect(state.totalVisibleTime).to.equal(10);
      expect(state.firstSeenTime).to.equal(1);
      expect(state.backgrounded).to.equal(0);
      expect(state.backgroundedAtStart).to.equal(0);
      expect(state.totalTime).to.equal(12);
    });
  });

  it('should listen on root with ready signal', () => {
    clock.tick(1);
    const disposed = sandbox.spy();
    const spec = {totalTimeMin: 0};
    const readyPromise = Promise.resolve().then(() => {
      clock.tick(21);
    });
    root.listenRoot(spec, readyPromise, eventResolver);

    expect(root.models_).to.have.length(1);
    const model = root.models_[0];
    model.unsubscribe(disposed);

    // Blocked by ready promise: visibility == 0.
    expect(model.getVisibility()).to.equal(0);

    // Fire event.
    return eventPromise.then(state => {
      expect(model.getVisibility()).to.equal(1);
      expect(disposed).to.be.calledOnce;
      expect(root.models_).to.have.length(0);

      expect(state.totalVisibleTime).to.equal(0);
      expect(state.firstSeenTime).to.equal(22);
      expect(state.backgrounded).to.equal(0);
      expect(state.backgroundedAtStart).to.equal(0);
      expect(state.totalTime).to.equal(22);
    });
  });

  it('should unlisten root', () => {
    clock.tick(1);
    const disposed = sandbox.spy();
    const spec = {totalTimeMin: 10};
    const unlisten = root.listenRoot(spec, null, eventResolver);

    expect(root.models_).to.have.length(1);
    expect(Object.keys(root.trackedElements_)).to.have.length(0);
    expect(root.getIntersectionObserver_().elements).to.have.length(0);
    const model = root.models_[0];
    model.unsubscribe(disposed);

    unlisten();
    expect(root.models_).to.have.length(0);
    expect(disposed).to.be.calledOnce;
  });

  it('should listen on a element', () => {
    clock.tick(1);
    const disposed = sandbox.spy();
    const target = win.document.createElement('div');
    const spec = {totalTimeMin: 10};
    root.listenElement(target, spec, null, eventResolver);

    expect(root.models_).to.have.length(1);
    const model = root.models_[0];
    model.unsubscribe(disposed);
    expect(model.parent_).to.equal(rootModel);
    expect(model.spec_.totalTimeMin).to.equal(10);
    expect(target.__AMP_VIS_ID).to.be.ok;
    expect(root.trackedElements_[target.__AMP_VIS_ID].element).to.equal(target);

    const inOb = root.getIntersectionObserver_();
    expect(inOb.elements).to.contain(target);
    expect(model.getVisibility()).to.equal(0);

    // In viewport.
    inOb.callback([{
      target,
      intersectionRatio: 0.3,
    }]);
    expect(model.getVisibility()).to.equal(0.3);

    // Go invisible on root.
    rootModel.setVisibility(0);
    expect(model.getVisibility()).to.equal(0);

    // Back to visible on root.
    rootModel.setVisibility(1);
    expect(model.getVisibility()).to.equal(0.3);

    // Fire event.
    clock.tick(11);
    return eventPromise.then(state => {
      expect(disposed).to.be.calledOnce;
      expect(root.models_).to.have.length(0);
      expect(root.trackedElements_[target.__AMP_VIS_ID]).to.not.exist;
      expect(inOb.elements).to.not.contain(target);

      expect(state.totalVisibleTime).to.equal(10);
      expect(state.firstSeenTime).to.equal(1);
      expect(state.backgrounded).to.equal(0);
      expect(state.backgroundedAtStart).to.equal(0);
      expect(state.totalTime).to.equal(12);

      expect(state.elementX).to.be.undefined;
    });
  });

  it('should listen on a element with different specs', () => {
    clock.tick(1);
    const inOb = root.getIntersectionObserver_();
    const target = win.document.createElement('div');

    // Listen to the first spec.
    const disposed1 = sandbox.spy();
    const spec1 = {totalTimeMin: 10};
    root.listenElement(target, spec1, null, eventResolver);
    expect(root.models_).to.have.length(1);
    const model1 = root.models_[0];
    expect(model1.spec_.totalTimeMin).to.equal(10);
    model1.unsubscribe(disposed1);
    expect(target.__AMP_VIS_ID).to.be.ok;
    const trackedElement = root.trackedElements_[target.__AMP_VIS_ID];
    expect(trackedElement.element).to.equal(target);
    expect(trackedElement.models).to.have.length(1);
    expect(root.trackedElements_[target.__AMP_VIS_ID].models)
        .to.deep.equal([model1]);
    expect(inOb.elements).to.contain(target);

    // In viewport.
    inOb.callback([{
      target,
      intersectionRatio: 0.3,
    }]);
    expect(model1.getVisibility()).to.equal(0.3);
    expect(trackedElement.intersectionRatio).to.equal(0.3);

    // Second spec on the same element.
    const disposed2 = sandbox.spy();
    const spec2 = {totalTimeMin: 20};
    let eventResolver2;
    const eventPromise2 = new Promise(resolve => {
      eventResolver2 = resolve;
    });
    root.listenElement(target, spec2, null, eventResolver2);
    expect(root.models_).to.have.length(2);
    const model2 = root.models_[1];
    expect(model2.spec_.totalTimeMin).to.equal(20);
    model2.unsubscribe(disposed2);
    expect(trackedElement.models).to.have.length(2);
    expect(root.trackedElements_[target.__AMP_VIS_ID].models)
        .to.deep.equal([model1, model2]);
    // Immediately visible.
    expect(model2.getVisibility()).to.equal(0.3);

    // Fire the first event.
    clock.tick(11);
    return eventPromise.then(state => {
      // First event fired. The first model should be cleaned up, but not
      // the other.
      expect(state.totalVisibleTime).to.equal(10);
      expect(disposed1).to.be.calledOnce;
      expect(root.models_).to.have.length(1);
      expect(root.trackedElements_[target.__AMP_VIS_ID])
          .to.equal(trackedElement);
      expect(trackedElement.models).to.have.length(1);
      expect(inOb.elements).to.contain(target);

      // Fire the second event.
      clock.tick(10);
      return eventPromise2;
    }).then(state => {
      // Second event fired. Everything should be released now.
      expect(state.totalVisibleTime).to.equal(20);
      expect(disposed2).to.be.calledOnce;
      expect(root.models_).to.have.length(0);
      expect(root.trackedElements_[target.__AMP_VIS_ID]).to.not.exist;
      expect(trackedElement.models).to.have.length(0);
      expect(inOb.elements).to.not.contain(target);
    });
  });

  it('should listen on a resource', () => {
    clock.tick(1);
    const target = win.document.createElement('div');
    const resource = {
      getLayoutBox() {
        return {top: 10, left: 11, width: 110, height: 111};
      },
    };
    const resources = win.services.resources.obj;
    sandbox.stub(resources, 'getResourceForElementOptional',
        () => resource);
    const spec = {totalTimeMin: 10};
    root.listenElement(target, spec, null, eventResolver);

    const inOb = root.getIntersectionObserver_();
    inOb.callback([{
      target,
      intersectionRatio: 0.3,
    }]);

    // Fire event.
    clock.tick(11);
    return eventPromise.then(state => {
      expect(state.totalVisibleTime).to.equal(10);
      expect(state.elementY).to.equal(10);
      expect(state.elementX).to.equal(11);
      expect(state.elementWidth).to.equal(110);
      expect(state.elementHeight).to.equal(111);
    });
  });
});


describes.realWin('EmbedAnalyticsRoot', {
  amp: {ampdoc: 'fie'},
}, env => {
  let parentWin;
  let win;
  let ampdoc;
  let embed;
  let clock;
  let viewer;
  let parentRoot;
  let root;
  let rootModel;

  beforeEach(() => {
    parentWin = env.parentWin;
    win = env.win;
    ampdoc = env.ampdoc;
    embed = env.embed;
    embed.host = ampdoc.win.document.createElement('amp-host');
    clock = sandbox.useFakeTimers();
    clock.tick(1);

    viewer = parentWin.services.viewer.obj;
    sandbox.stub(viewer, 'getFirstVisibleTime', () => 1);

    parentRoot = new VisibilityManagerForDoc(ampdoc);

    root = new VisibilityManagerForEmbed(parentRoot, embed);
    rootModel = root.getRootModel();
  });

  it('should initialize correctly backgrounded', () => {
    viewer.setVisibilityState_(VisibilityState.HIDDEN);
    root = new VisibilityManagerForEmbed(parentRoot, embed);
    rootModel = root.getRootModel();

    expect(root.parent).to.equal(parentRoot);
    expect(root.ampdoc).to.equal(ampdoc);
    expect(root.getStartTime()).to.equal(embed.getStartTime());
    expect(root.isBackgrounded()).to.be.true;
    expect(root.isBackgroundedAtStart()).to.be.true;

    // Root model starts invisible.
    expect(rootModel.parent_).to.equal(parentRoot.getRootModel());
    expect(rootModel.getVisibility()).to.equal(0);
  });

  it('should initialize correctly foregrounded', () => {
    expect(root.parent).to.equal(parentRoot);
    expect(root.ampdoc).to.equal(ampdoc);
    expect(root.getStartTime()).to.equal(embed.getStartTime());
    expect(root.isBackgrounded()).to.be.false;
    expect(root.isBackgroundedAtStart()).to.be.false;

    // Root model starts invisible.
    expect(rootModel.parent_).to.equal(parentRoot.getRootModel());
    rootModel.setVisibility(1);
    expect(rootModel.getVisibility()).to.equal(1);
  });

  it('should ask parent to observe host element', () => {
    const id = embed.host.__AMP_VIS_ID;
    expect(parentRoot.trackedElements_[id]).to.be.ok;

    root.dispose();
    expect(parentRoot.trackedElements_[id]).to.be.undefined;
  });

  it('should delegate observation to parent', () => {
    const inOb = {
      observe: sandbox.spy(),
      unobserve: sandbox.spy(),
    };
    parentRoot.intersectionObserver_ = inOb;

    const model = new VisibilityModel(null, {});
    const target = win.document.createElement('div');

    // Observe.
    root.observe(target, model);
    expect(inOb.observe).to.be.calledOnce;
    expect(inOb.observe).to.be.calledWith(target);
    const id = target.__AMP_VIS_ID;
    expect(parentRoot.trackedElements_[id]).to.be.ok;

    // Unobserve.
    model.dispose();
    expect(inOb.unobserve).to.be.calledOnce;
    expect(inOb.unobserve).to.be.calledWith(target);
    expect(parentRoot.trackedElements_[id]).to.be.undefined;
  });
});


describes.realWin('VisibilityManager integrated', {amp: true}, env => {
  let win, doc;
  let ampdoc;
  let viewer;
  let resources;
  let clock, startTime;
  let scrollTop;
  let inObCallback;
  let observeSpy;
  let unobserveSpy;
  let visibility;
  let ampElement;
  let eventPromise, eventResolver;
  let eventPromise2, eventResolver2;
  let readyPromise, readyResolver;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    viewer = win.services.viewer.obj;
    resources = win.services.resources.obj;

    clock = sandbox.useFakeTimers();
    startTime = 10000;
    clock.tick(startTime);

    const docState = documentStateFor(win);
    sandbox.stub(docState, 'isHidden', () => false);
    sandbox.stub(viewer, 'getFirstVisibleTime', () => startTime);

    ampElement = doc.createElement('amp-img');
    ampElement.id = 'abc';
    ampElement.setAttribute('width', '100');
    ampElement.setAttribute('height', '100');
    doc.body.appendChild(ampElement);
    const resource = resources.getResourceForElement(ampElement);
    scrollTop = 10;
    sandbox.stub(resource, 'getLayoutBox',
        () => layoutRectLtwh(0, scrollTop, 100, 100));

    observeSpy = sandbox.stub();
    unobserveSpy = sandbox.stub();
    const inob = callback => {
      inObCallback = callback;
      return {
        observe: observeSpy,
        unobserve: unobserveSpy,
      };
    };
    if (nativeIntersectionObserverSupported(ampdoc.win)) {
      sandbox.stub(win, 'IntersectionObserver', inob);
    } else {
      win.IntersectionObserver = inob;
    }

    readyPromise = new Promise(resolve => {
      readyResolver = resolve;
    });
    eventPromise = new Promise(resolve => {
      eventResolver = resolve;
    });
    eventPromise2 = new Promise(resolve => {
      eventResolver2 = resolve;
    });
  });

  function fireIntersect(intersectPercent) {
    scrollTop = 100 - intersectPercent;
    const entry = makeIntersectionEntry(
        [0, scrollTop, 100, 100], [0, 0, 100, 100]);
    inObCallback([entry]);
  }

  function makeIntersectionEntry(boundingClientRect, rootBounds) {
    boundingClientRect = layoutRectLtwh.apply(null, boundingClientRect);
    rootBounds = layoutRectLtwh.apply(null, rootBounds);
    const intersect = rectIntersection(boundingClientRect, rootBounds);
    const ratio = (intersect.width * intersect.height) /
        (boundingClientRect.width * boundingClientRect.height);
    return {
      intersectionRect: intersect,
      boundingClientRect,
      rootBounds,
      intersectionRatio: ratio,
      target: ampElement,
    };
  }

  function isModelResolved(model) {
    return !model.eventResolver_;
  }

  it('should execute "visible" trigger with simple spec', () => {
    viewer.setVisibilityState_(VisibilityState.VISIBLE);
    visibility = new VisibilityManagerForDoc(ampdoc);

    visibility.listenElement(ampElement, {}, readyPromise, eventResolver);

    return Promise.resolve().then(() => {
      clock.tick(100);
      fireIntersect(25); // visible
      readyResolver();
      return eventPromise;
    }).then(state => {
      expect(state).to.contains({
        backgrounded: 0,
        backgroundedAtStart: 0,
        elementHeight: 100,
        elementWidth: 100,
        elementX: 0,
        elementY: 75,
        firstSeenTime: 100,
        fistVisibleTime: 100,
        lastSeenTime: 100,
        lastVisibleTime: 100,
        loadTimeVisibility: 25,
        maxVisiblePercentage: 25,
        minVisiblePercentage: 25,
        totalVisibleTime: 0,
        maxContinuousVisibleTime: 0,
      });
    });
  });

  it('should triger "visible" with no duration condition', () => {
    viewer.setVisibilityState_(VisibilityState.VISIBLE);
    visibility = new VisibilityManagerForDoc(ampdoc);

    visibility.listenElement(
        ampElement,
        {visiblePercentageMin: 20},
        readyPromise,
        eventResolver);

    // add multiple triggers on the same element
    visibility.listenElement(
        ampElement,
        {visiblePercentageMin: 30},
        readyPromise,
        eventResolver2);

    // "observe" should not have been called since resource not loaded yet.
    expect(observeSpy).to.be.called;
    readyResolver();
    return Promise.resolve().then(() => {
      expect(observeSpy).to.be.calledWith(ampElement);

      clock.tick(135);
      fireIntersect(5); // below visiblePercentageMin, no trigger

      clock.tick(100);
      fireIntersect(25); // above spec 1 min visible, trigger callback 1
      return eventPromise.then(state => {
        expect(state).to.contains({
          backgrounded: 0,
          backgroundedAtStart: 0,
          elementHeight: 100,
          elementWidth: 100,
          elementX: 0,
          elementY: 75,
          firstSeenTime: 135,
          fistVisibleTime: 235,  // 135 + 100
          lastSeenTime: 235,
          lastVisibleTime: 235,
          loadTimeVisibility: 5,
          maxVisiblePercentage: 25,
          minVisiblePercentage: 25,
          totalVisibleTime: 0,  // duration metrics are always 0
          maxContinuousVisibleTime: 0,  // as it triggers immediately
        });
        expect(unobserveSpy).to.not.be.called;

        clock.tick(100);
        fireIntersect(35); // above spec 2 min visible, trigger callback 2
        return eventPromise2;
      }).then(state => {
        expect(state).to.contains({
          backgrounded: 0,
          backgroundedAtStart: 0,
          elementHeight: 100,
          elementWidth: 100,
          elementX: 0,
          elementY: 65,
          firstSeenTime: 135,
          fistVisibleTime: 335,  // 235 + 100
          lastSeenTime: 335,
          lastVisibleTime: 335,
          loadTimeVisibility: 5,
          maxVisiblePercentage: 35,
          minVisiblePercentage: 35,
          totalVisibleTime: 0,  // duration metrics is always 0
          maxContinuousVisibleTime: 0,  // as it triggers immediately
        });
      });
    }).then(() => {
      expect(unobserveSpy).to.be.called; // unobserve when all callback fired
    });
  });

  it('should trigger "visible" with duration condition', () => {
    viewer.setVisibilityState_(VisibilityState.VISIBLE);
    visibility = new VisibilityManagerForDoc(ampdoc);

    visibility.listenElement(
        ampElement,
        {continuousTimeMin: 1000},
        readyPromise,
        eventResolver);
    const model = visibility.models_[0];

    readyResolver();
    return Promise.resolve().then(() => {
      expect(observeSpy).to.be.calledWith(ampElement);

      clock.tick(100);
      fireIntersect(25); // visible
      expect(isModelResolved(model)).to.be.false;

      clock.tick(999);
      fireIntersect(0); // this will reset the timer for continuous time
      expect(isModelResolved(model)).to.be.false;

      clock.tick(100);
      fireIntersect(5); // visible again.
      expect(isModelResolved(model)).to.be.false;

      clock.tick(100);
      // Enters background. this will reset the timer for continuous time
      viewer.setVisibilityState_(VisibilityState.HIDDEN);
      expect(isModelResolved(model)).to.be.false;

      clock.tick(2000); // this 2s should not be counted in visible time
      expect(isModelResolved(model)).to.be.false;
      viewer.setVisibilityState_(VisibilityState.VISIBLE); // now we're back

      clock.tick(100);
      fireIntersect(35); // keep being visible
      expect(isModelResolved(model)).to.be.false;
      clock.tick(899); // not yet!
      expect(isModelResolved(model)).to.be.false;
      clock.tick(1);  // now fire
      expect(isModelResolved(model)).to.be.true;
      return eventPromise.then(state => {
        expect(state).to.contains({
          backgrounded: 1,
          backgroundedAtStart: 0,
          elementHeight: 100,
          elementWidth: 100,
          elementX: 0,
          elementY: 65,
          firstSeenTime: 100,
          fistVisibleTime: 100,
          lastSeenTime: 4299,
          lastVisibleTime: 4299,
          loadTimeVisibility: 25,
          maxVisiblePercentage: 35,
          minVisiblePercentage: 5,
          totalVisibleTime: 2099,
          maxContinuousVisibleTime: 1000,
        });
      });
    });
  });

  it('should populate "backgrounded" and "backgroundedAtStart"', () => {
    viewer.setVisibilityState_(VisibilityState.HIDDEN);
    visibility = new VisibilityManagerForDoc(ampdoc);

    visibility.listenElement(
        ampElement,
        {},
        readyPromise,
        eventResolver);

    viewer.setVisibilityState_(VisibilityState.VISIBLE);
    readyResolver();
    return Promise.resolve().then(() => {
      expect(observeSpy).to.be.calledWith(ampElement);

      clock.tick(100);
      fireIntersect(25); // visible
      return eventPromise.then(state => {
        expect(state).to.contains({
          backgroundedAtStart: 1,
          backgrounded: 1,
        });
      });
    });
  });
});
