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
    let element;
    element = {
      isBuilt: () => {return true;},
    };

    describe('w/o container should get IntersectionChangeEntry when', () => {
      it('intersect correctly base', done => {
        sandbox.stub(performance, 'now', () => {
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
        element.getLayoutBox = () => {
          return layoutRectLtwh(50, 50, 150, 200);
        };
        ioInstance.observe(element);
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        ioInstance.tick(rootBounds);
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
        element.getLayoutBox = () => {
          return layoutRectLtwh(50, 200, 150, 200);
        };
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        ioInstance.prevThresholdSlot_ = -1;
        ioInstance.observe(element);
        ioInstance.tick(rootBounds);
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
        element.getLayoutBox = () => {
          return layoutRectLtwh(50, 199, 150, 200);
        };
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        ioInstance.observe(element);
        ioInstance.tick(rootBounds);
      });

      it('intersect correctly 3', done => {
        const ioInstance = new IntersectionObserverPolyfill(change => {
          expect(change.intersectionRect.height).to.equal(1);
          expect(change.intersectionRect.width).to.equal(2);
          done();
        });
        element.getLayoutBox = () => {
          return layoutRectLtwh(50, 100, 150, 200);
        };
        const rootBounds = layoutRectLtwh(198, 299, 100, 100);
        ioInstance.observe(element);
        ioInstance.tick(rootBounds);
      });

      it('intersect correctly 4', done => {
        const ioInstance = new IntersectionObserverPolyfill(change => {
          expect(change.intersectionRect.height).to.equal(0);
          expect(change.intersectionRect.width).to.equal(0);
          done();
        });
        element.getLayoutBox = () => {
          return layoutRectLtwh(50, 100, 150, 200);
        };
        const rootBounds = layoutRectLtwh(202, 299, 100, 100);
        ioInstance.prevThresholdSlot_ = -1;
        ioInstance.observe(element);
        ioInstance.tick(rootBounds);
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
        element.getLayoutBox = () => {
          return layoutRectLtwh(50, 225, 100, 100);
        };
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        ioInstance.prevThresholdSlot_ = -1;
        ioInstance.observe(element);
        ioInstance.tick(rootBounds);
      });
    });

    describe('w/ container should get IntersectionChangeEntry when', () => {
      it('nested element in container in viewport', done => {
        const ioInstance = new IntersectionObserverPolyfill(change => {
          expect(change.boundingClientRect).to.deep.equal({
            'left': 11,
            'top': 12,
            'width': 10,
            'height': 10,
            'bottom': 22,
            'right': 21,
            'x': 11,
            'y': 12,
          });
          expect(change.intersectionRect).to.deep.equal({
            'left': 11,
            'top': 12,
            'width': 10,
            'height': 10,
            'bottom': 22,
            'right': 21,
            'x': 11,
            'y': 12,
          });
          expect(change.intersectionRatio).to.be.equal(1);
          done();
        });
        element.getLayoutBox = () => {
          return layoutRectLtwh(10, 10, 10, 10);
        };
        const rootBounds = layoutRectLtwh(1, 100, 200, 200);
        const containerBounds = layoutRectLtwh(1, 2, 50, 50);
        ioInstance.prevThresholdSlot_ = -1;
        ioInstance.observe(element);
        ioInstance.tick(rootBounds, containerBounds);
      });

      it('nested element in container, container intersect viewport', done => {
        const ioInstance = new IntersectionObserverPolyfill(change => {
          expect(change.boundingClientRect).to.deep.equal({
            'left': 175,
            'top': 0,
            'width': 50,
            'height': 50,
            'bottom': 50,
            'right': 225,
            'x': 175,
            'y': 0,
          });
          expect(change.intersectionRect).to.deep.equal({
            'left': 175,
            'top': 0,
            'width': 25,
            'height': 50,
            'bottom': 50,
            'right': 200,
            'x': 175,
            'y': 0,
          });
          expect(change.intersectionRatio).to.be.equal(0.5);
          done();
        });
        element.getLayoutBox = () => {
          return layoutRectLtwh(75, 0, 50, 50);
        };
        const rootBounds = layoutRectLtwh(0, 100, 200, 200);
        const containerBounds = layoutRectLtwh(100, 0, 200, 200);
        ioInstance.prevThresholdSlot_ = -1;
        ioInstance.observe(element);
        ioInstance.tick(rootBounds, containerBounds);
      });

      it('nested element in container, container not in viewport', done => {
        const ioInstance = new IntersectionObserverPolyfill(change => {
          expect(change.boundingClientRect).to.deep.equal({
            'left': 0,
            'top': 200,
            'width': 50,
            'height': 50,
            'bottom': 250,
            'right': 50,
            'x': 0,
            'y': 200,
          });
          expect(change.intersectionRect).to.deep.equal({
            'left': 0,
            'top': 200,
            'width': 50,
            'height': 0,
            'bottom': 200,
            'right': 50,
            'x': 0,
            'y': 200,
          });
          expect(change.intersectionRatio).to.be.equal(0);
          done();
        });
        element.getLayoutBox = () => {
          return layoutRectLtwh(0, 0, 50, 50);
        };
        const rootBounds = layoutRectLtwh(0, 100, 200, 200);
        const containerBounds = layoutRectLtwh(0, 200, 100, 100);
        ioInstance.prevThresholdSlot_ = -1;
        ioInstance.observe(element);
        ioInstance.tick(rootBounds, containerBounds);
      });

      it('nested element outside container but in viewport', done => {
        const ioInstance = new IntersectionObserverPolyfill(change => {
          expect(change.boundingClientRect).to.deep.equal({
            'left': 0,
            'top': 100,
            'width': 50,
            'height': 50,
            'bottom': 150,
            'right': 50,
            'x': 0,
            'y': 100,
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
          expect(change.intersectionRatio).to.be.equal(0);
          done();
        });
        element.getLayoutBox = () => {
          return layoutRectLtwh(0, -101, 50, 50);
        };
        const rootBounds = layoutRectLtwh(0, 100, 200, 200);
        const containerBounds = layoutRectLtwh(0, 201, 100, 100);
        ioInstance.prevThresholdSlot_ = -1;
        ioInstance.observe(element);
        ioInstance.tick(rootBounds, containerBounds);
      });
    });

    describe('with non AMP element', () => {
      it('with container', done => {
        const ioInstance = new IntersectionObserverPolyfill(change => {
          console.log(change.boundingClientRect);
          expect(change.boundingClientRect).to.deep.equal({
            'left': 0,
            'top': 0,
            'width': 50,
            'height': 50,
            'bottom': 50,
            'right': 50,
            'x': 0,
            'y': 0,
          });
          console.log(change.intersectionRect);
          expect(change.intersectionRect).to.deep.equal({
            'left': 0,
            'top': 0,
            'width': 50,
            'height': 50,
            'bottom': 50,
            'right': 50,
            'x': 0,
            'y': 0,
          });
          expect(change.intersectionRatio).to.be.equal(1);
          done();
        });
        element.isBuilt = null;
        element.getBoundingClientRect = () => {
          return {
            'left': 0,
            'top': 0,
            'width': 50,
            'height': 50,
            'bottom': 50,
            'right': 50,
            'x': 0,
            'y': 0,
          };
        };
        const rootBounds = layoutRectLtwh(0, 100, 200, 200);
        const containerBounds = layoutRectLtwh(0, 0, 100, 100);
        ioInstance.prevThresholdSlot_ = -1;
        ioInstance.observe(element);
        ioInstance.tick(rootBounds, containerBounds);
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
        ioInstance.tick(layoutBox, rootBounds);
        expect(callbackSpy).to.be.calledOnce;
      });
    });
  });
});
