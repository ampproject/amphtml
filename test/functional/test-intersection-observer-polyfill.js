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

import {IntersectionObserverPolyfill,
} from '../../src/intersection-observer-polyfill';
import {layoutRectLtwh} from '../../src/layout-rect';
import * as sinon from 'sinon';

describe('IntersectionObserverPolyfill', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('getThresholdSlot_', () => {
    // default threshold
    let ioInstance = new IntersectionObserverPolyfill(() => {});
    expect(ioInstance.getThresholdSlot_(0)).to.equal(0);
    expect(ioInstance.getThresholdSlot_(0.67)).to.equal(14);
    expect(ioInstance.getThresholdSlot_(0.65)).to.equal(14);
    expect(ioInstance.getThresholdSlot_(1)).to.equal(21);
    let options = {threshold: [0.01, 0.25, 0.5, 1]};
    ioInstance = new IntersectionObserverPolyfill(() => {}, options);
    ioInstance.threshold_ = [0.01, 0.25, 0.5, 1];
    expect(ioInstance.getThresholdSlot_(0)).to.equal(0);
    options = {threshold: [0, 0.25, 0.5, 1]};
    ioInstance = new IntersectionObserverPolyfill(() => {}, options);
    expect(ioInstance.getThresholdSlot_(0)).to.equal(0);
    expect(ioInstance.getThresholdSlot_(0.1)).to.equal(1);
    expect(ioInstance.getThresholdSlot_(0.4)).to.equal(2);
    expect(ioInstance.getThresholdSlot_(0.25)).to.equal(2);
    expect(ioInstance.getThresholdSlot_(0.5)).to.equal(3);
    expect(ioInstance.getThresholdSlot_(1)).to.equal(4);
    options = {threshold: [0.5]};
    ioInstance = new IntersectionObserverPolyfill(() => {}, options);
    ioInstance.threshold_ = [0.5];
    expect(ioInstance.getThresholdSlot_(1)).to.equal(1);
  });

  describe('tick function', () => {
    describe('call callback with intersection change entry when', () => {
      it('intersect correctly base', done => {
        sandbox.stub(Date, 'now', () => {
          return 100;
        });
        const ioInstance = new IntersectionObserverPolyfill(change => {
          expect(change).to.be.object;
          expect(change.time).to.equal(100);
          expect(change.rootBounds).to.deep.equal({
            'left': 0,
            'top': 0,
            'width': 100,
            'height': 100,
            'bottom': 100,
            'right': 100,
            'x': 0,
            'y': 0,
          });
          expect(change.boundingClientRect).to.deep.equal({
            'left': 50,
            'top': -50,
            'width': 150,
            'height': 200,
            'bottom': 150,
            'right': 200,
            'x': 50,
            'y': -50,
          });
          expect(change.intersectionRect).to.deep.equal({
            'left': 50,
            'top': 0,
            'width': 50,
            'height': 100,
            'bottom': 100,
            'right': 100,
            'x': 50,
            'y': 0,
          });
          expect(change.intersectionRatio).to.be.closeTo(0.1666666, .0001);
          done();
        });
        ioInstance.observe(document.createElement('div'));
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        const layoutBox = layoutRectLtwh(50, 50, 150, 200);
        ioInstance.tick(layoutBox, rootBounds);
      });

      it('intersects on the edge', done => {
        const ioInstance = new IntersectionObserverPolyfill(change => {
          expect(change).to.be.object;
          expect(change.rootBounds).to.deep.equal({
            'left': 0,
            'top': 0,
            'width': 100,
            'height': 100,
            'bottom': 100,
            'right': 100,
            'x': 0,
            'y': 0,
          });
          expect(change.boundingClientRect).to.deep.equal({
            'left': 50,
            'top': 100,
            'width': 150,
            'height': 200,
            'bottom': 300,
            'right': 200,
            'x': 50,
            'y': 100,
          });
          expect(change.intersectionRect).to.deep.equal({
            'left': 50,
            'top': 100,
            'width': 50,
            'height': 0,
            'bottom': 100,
            'right': 100,
            'x': 50,
            'y': 100,
          });
          expect(change.intersectionRatio).to.equal(0);
          done();
        });
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        const layoutBox = layoutRectLtwh(50, 200, 150, 200);
        ioInstance.prevThresholdSlot_ = -1;
        ioInstance.observe(document.createElement('div'));
        ioInstance.tick(layoutBox, rootBounds);
      });

      it('intersect correctly 2', done => {
        const ioInstance = new IntersectionObserverPolyfill(change => {
          expect(change.intersectionRect).to.deep.equal({
            'left': 50,
            'top': 99,
            'width': 50,
            'height': 1,
            'bottom': 100,
            'right': 100,
            'x': 50,
            'y': 99,
          });
          done();
        });
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        const layoutBox = layoutRectLtwh(50, 199, 150, 200);
        ioInstance.observe(document.createElement('div'));
        ioInstance.tick(layoutBox, rootBounds);
      });

      it('intersect correctly 3', done => {
        const ioInstance = new IntersectionObserverPolyfill(change => {
          expect(change.intersectionRect.height).to.equal(1);
          expect(change.intersectionRect.width).to.equal(2);
          done();
        });
        const rootBounds = layoutRectLtwh(198, 299, 100, 100);
        const layoutBox = layoutRectLtwh(50, 100, 150, 200);
        ioInstance.observe(document.createElement('div'));
        ioInstance.tick(layoutBox, rootBounds);

      });

      it('intersect correctly 4', done => {
        const ioInstance = new IntersectionObserverPolyfill(change => {
          expect(change.intersectionRect.height).to.equal(0);
          expect(change.intersectionRect.width).to.equal(0);
          done();
        });
        const rootBounds = layoutRectLtwh(202, 299, 100, 100);
        const layoutBox = layoutRectLtwh(50, 100, 150, 200);
        ioInstance.prevThresholdSlot_ = -1;
        ioInstance.observe(document.createElement('div'));
        ioInstance.tick(layoutBox, rootBounds);
      });

      it('does not intersect with an element out of viewport', done => {
        const ioInstance = new IntersectionObserverPolyfill(change => {
          expect(change).to.be.object;

          expect(change.rootBounds).to.deep.equal({
            'left': 0,
            'top': 0,
            'width': 100,
            'height': 100,
            'bottom': 100,
            'right': 100,
            'x': 0,
            'y': 0,
          });
          expect(change.boundingClientRect).to.deep.equal({
            'left': 50,
            'top': 125,
            'width': 100,
            'height': 100,
            'bottom': 225,
            'right': 150,
            'x': 50,
            'y': 125,
          });
          expect(change.intersectionRect).to.deep.equal({
            'left': 0,
            'top': 0,
            'width': 0,
            'height': 0,
            'bottom': 0,
            'right': 0,
            'x': 0,
            'y': 0,
          });
          expect(change.intersectionRatio).to.equal(0);
          done();
        });
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        const layoutBox = layoutRectLtwh(50, 225, 100, 100);
        ioInstance.prevThresholdSlot_ = -1;
        ioInstance.observe(document.createElement('div'));
        ioInstance.tick(layoutBox, rootBounds);
      });
    });

    describe('should NOT call callback with', () => {
      it('same threshold value', () => {
        const callbackSpy = sandbox.spy();
        const ioInstance = new IntersectionObserverPolyfill(() => {
          callbackSpy();
        });
        ioInstance.observe(document.createElement('div'));
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        const layoutBox = layoutRectLtwh(50, 50, 150, 200);
        ioInstance.tick(layoutBox, rootBounds);
        expect(callbackSpy).to.be.calledOnce;
        // Force the prevTime_ to -1 to only test threshold
        ioInstance.prevTime_ = -1;
        ioInstance.tick(layoutBox, rootBounds);
        expect(callbackSpy).to.be.calledOnce;
      });

      it('same time value', () => {
        sandbox.stub(Date, 'now', () => {
          return 100;
        });
        const callbackSpy = sandbox.spy();
        const ioInstance = new IntersectionObserverPolyfill(() => {
          callbackSpy();
        });
        ioInstance.observe(document.createElement('div'));
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        const layoutBox = layoutRectLtwh(50, 50, 150, 200);
        ioInstance.tick(layoutBox, rootBounds);
        expect(callbackSpy).to.be.calledOnce;
        // Force the threshold to -1 to only test time
        ioInstance.prevThresholdSlot_ = -1;
        ioInstance.tick(layoutBox, rootBounds);
        expect(callbackSpy).to.be.calledOnce;
      });
    });
  });
});
