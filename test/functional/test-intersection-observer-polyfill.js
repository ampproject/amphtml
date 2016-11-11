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

import {IntersectionObserverPolyfill, getThresholdSlot,
} from '../../src/intersection-observer-polyfill';
import {layoutRectLtwh} from '../../src/layout-rect';
import * as sinon from 'sinon';

const DEFAULT_THRESHOLD = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4,
    0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1];

/**
 * Creates a DOM rect based on the left, top, width and height parameters
 * in that order.
 * @param {number} left
 * @param {number} top
 * @param {number} width
 * @param {number} height
 * @return {!DOMRect}
 */
function DomRectLtwh(left, top, width, height) {
  const res = layoutRectLtwh(left, top, width, height);
  res.x = left;
  res.y = top;
  return res;
}

describe('IntersectionObserverPolyfill', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(performance, 'now', () => {
      return 100;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('threshold', () => {
    it('will be sorted', () => {
      const io1 = new IntersectionObserverPolyfill(() => {}, {
        threshold: [0, 0.9, 0.3, 1, 0.02],
      });
      const io2 = new IntersectionObserverPolyfill(() => {}, {
        threshold: [0, 0.02, 0.3, 0.9, 1],
      });
      expect(io1.threshold_).to.deep.equal(io2.threshold_);
    });

    it('should NOT contain value less than 0 or greater than 1', () => {
      const io1 = () => {
        new IntersectionObserverPolyfill(() => {}, {
          threshold: [0, -2, 0.3, 1, 0.02],
        });
      };
      const io2 = () => {
        new IntersectionObserverPolyfill(() => {}, {
          threshold: [0, 1.1, 0.3, 1, 0.02],
        });
      };
      expect(io1).to.throw(
          'Threshold should be in the range from "[0, 1]"');
      expect(io2).to.throw(
          'Threshold should be in the range from "[0, 1]"');
    });

    it('getThresholdSlot function', () => {
      let threshold = DEFAULT_THRESHOLD;
      expect(getThresholdSlot(threshold, 0)).to.equal(0);
      expect(getThresholdSlot(threshold, 0.67)).to.equal(14);
      expect(getThresholdSlot(threshold, 0.65)).to.equal(14);
      expect(getThresholdSlot(threshold, 1)).to.equal(21);
      threshold = [0.01, 0.25, 0.5, 1];
      expect(getThresholdSlot(threshold, 0)).to.equal(0);
      threshold = [0, 0.25, 0.5, 1];
      expect(getThresholdSlot(threshold, 0)).to.equal(0);
      expect(getThresholdSlot(threshold, 0.1)).to.equal(1);
      expect(getThresholdSlot(threshold, 0.4)).to.equal(2);
      expect(getThresholdSlot(threshold, 0.25)).to.equal(2);
      expect(getThresholdSlot(threshold, 0.5)).to.equal(3);
      expect(getThresholdSlot(threshold, 1)).to.equal(4);
      threshold = [0.5];
      expect(getThresholdSlot(threshold, 1)).to.equal(1);
    });

  });

  describe('tick function', () => {
    let element;
    let callbackSpy;

    let io;
    beforeEach(() => {
      callbackSpy = sandbox.spy();
      io = new IntersectionObserverPolyfill(callbackSpy);
      element = {
        isBuilt: () => {return true;},
        getOwner: () => {return null;},
      };
    });

    afterEach(() => {
      element = null;
    });


    describe('w/o container should get IntersectionChangeEntry when', () => {
      it('intersect correctly base', () => {
        element.getLayoutBox = () => {
          return layoutRectLtwh(50, 50, 150, 200);
        };
        io.observe(element);
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        io.tick(rootBounds);
        const change = {
          time: 100,
          rootBounds: DomRectLtwh(0, 0, 100, 100),
          boundingClientRect: DomRectLtwh(50, -50, 150, 200),
          intersectionRect: DomRectLtwh(50, 0, 50, 100),
          intersectionRatio: 1 / 6,
        };
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith(change);
      });

      it('intersects on the edge', () => {
        element.getLayoutBox = () => {
          return layoutRectLtwh(50, 200, 150, 200);
        };
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        io.observe(element);
        io.prevThresholdSlot_ = -1;
        io.tick(rootBounds);
        const change = {
          time: 100,
          rootBounds: DomRectLtwh(0, 0, 100, 100),
          boundingClientRect: DomRectLtwh(50, 100, 150, 200),
          intersectionRect: DomRectLtwh(50, 100, 50, 0),
          intersectionRatio: 0,
        };
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith(change);
      });

      it('intersect correctly 2', () => {
        element.getLayoutBox = () => {
          return layoutRectLtwh(50, 199, 150, 200);
        };
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        io.observe(element);
        io.tick(rootBounds);
        const change = {
          time: 100,
          rootBounds: DomRectLtwh(0, 0, 100, 100),
          boundingClientRect: DomRectLtwh(50, 99, 150, 200),
          intersectionRect: DomRectLtwh(50, 99, 50, 1),
          intersectionRatio: 1 / 600,
        };
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith(change);
      });

      it('intersect correctly 3', () => {
        element.getLayoutBox = () => {
          return layoutRectLtwh(50, 100, 150, 200);
        };
        const rootBounds = layoutRectLtwh(198, 299, 100, 100);
        io.observe(element);
        io.tick(rootBounds);
        const change = {
          time: 100,
          rootBounds: DomRectLtwh(0, 0, 100, 100),
          boundingClientRect: DomRectLtwh(-148, -199, 150, 200),
          intersectionRect: DomRectLtwh(0, 0, 2, 1),
          intersectionRatio: 2 / 30000,
        };
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith(change);
      });

      it('intersect correctly 4', () => {
        element.getLayoutBox = () => {
          return layoutRectLtwh(50, 100, 150, 200);
        };
        const rootBounds = layoutRectLtwh(202, 299, 100, 100);
        io.observe(element);
        io.prevThresholdSlot_ = -1;
        io.tick(rootBounds);
        const change = {
          time: 100,
          rootBounds: DomRectLtwh(0, 0, 100, 100),
          boundingClientRect: DomRectLtwh(-152, -199, 150, 200),
          intersectionRect: DomRectLtwh(0, 0, 0, 0),
          intersectionRatio: 0,
        };
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith(change);
      });

      it('does not intersect with an element out of viewport', () => {
        element.getLayoutBox = () => {
          return layoutRectLtwh(50, 225, 100, 100);
        };
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        io.observe(element);
        io.prevThresholdSlot_ = -1;
        io.tick(rootBounds);
        const change = {
          time: 100,
          rootBounds: DomRectLtwh(0, 0, 100, 100),
          boundingClientRect: DomRectLtwh(50, 125, 100, 100),
          intersectionRect: DomRectLtwh(0, 0, 0, 0),
          intersectionRatio: 0,
        };
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith(change);
      });

      it('element has owner', () => {
        element.getLayoutBox = () => {
          return layoutRectLtwh(50, 50, 150, 200);
        };
        element.getOwner = () => {
          return {
            getLayoutBox: () => {
              return layoutRectLtwh(0, 50, 100, 100);
            },
          };
        };
        io.observe(element);
        io.prevThresholdSlot_ = -1;
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        io.tick(rootBounds);
        const change = {
          time: 100,
          rootBounds: DomRectLtwh(0, 0, 100, 100),
          boundingClientRect: DomRectLtwh(50, -50, 150, 200),
          intersectionRect: DomRectLtwh(50, 0, 50, 50),
          intersectionRatio: 1 / 12,
        };
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith(change);
      });
    });

    describe('w/ container should get IntersectionChangeEntry when', () => {
      it('nested element in container in viewport', () => {
        element.getLayoutBox = () => {
          return layoutRectLtwh(10, 10, 10, 10);
        };
        const rootBounds = layoutRectLtwh(1, 100, 200, 200);
        const containerBounds = layoutRectLtwh(1, 2, 50, 50);
        io.observe(element);
        io.prevThresholdSlot_ = -1;
        io.tick(rootBounds, containerBounds);
        const change = {
          time: 100,
          rootBounds: DomRectLtwh(0, 0, 200, 200),
          boundingClientRect: DomRectLtwh(11, 12, 10, 10),
          intersectionRect: DomRectLtwh(11, 12, 10, 10),
          intersectionRatio: 1,
        };
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith(change);
      });

      it('nested element in container, container intersect viewport', () => {
        element.getLayoutBox = () => {
          return layoutRectLtwh(75, 0, 50, 50);
        };
        const rootBounds = layoutRectLtwh(0, 100, 200, 200);
        const containerBounds = layoutRectLtwh(100, 0, 200, 200);
        io.observe(element);
        io.prevThresholdSlot_ = -1;
        io.tick(rootBounds, containerBounds);
        const change = {
          time: 100,
          rootBounds: DomRectLtwh(0, 0, 200, 200),
          boundingClientRect: DomRectLtwh(175, 0, 50, 50),
          intersectionRect: DomRectLtwh(175, 0, 25, 50),
          intersectionRatio: 0.5,
        };
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith(change);
      });

      it('nested element in container, container not in viewport', () => {
        element.getLayoutBox = () => {
          return layoutRectLtwh(0, 0, 50, 50);
        };
        const rootBounds = layoutRectLtwh(0, 100, 200, 200);
        const containerBounds = layoutRectLtwh(0, 200, 100, 100);
        io.observe(element);
        io.prevThresholdSlot_ = -1;
        io.tick(rootBounds, containerBounds);
        const change = {
          time: 100,
          rootBounds: DomRectLtwh(0, 0, 200, 200),
          boundingClientRect: DomRectLtwh(0, 200, 50, 50),
          intersectionRect: DomRectLtwh(0, 200, 50, 0),
          intersectionRatio: 0,
        };
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith(change);
      });

      it('nested element outside container but in viewport', () => {
        element.getLayoutBox = () => {
          return layoutRectLtwh(0, -101, 50, 50);
        };
        const rootBounds = layoutRectLtwh(0, 100, 200, 200);
        const containerBounds = layoutRectLtwh(0, 201, 100, 100);
        io.observe(element);
        io.prevThresholdSlot_ = -1;
        io.tick(rootBounds, containerBounds);
        const change = {
          time: 100,
          rootBounds: DomRectLtwh(0, 0, 200, 200),
          boundingClientRect: DomRectLtwh(0, 100, 50, 50),
          intersectionRect: DomRectLtwh(0, 0, 0, 0),
          intersectionRatio: 0,
        };
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith(change);
      });

      it('element has an owner', () => {
        element.getLayoutBox = () => {
          return layoutRectLtwh(75, 0, 50, 50);
        };
        element.getOwner = () => {
          return {
            getLayoutBox: () => {
              return layoutRectLtwh(0, 25, 200, 25);
            },
          };
        };
        const rootBounds = layoutRectLtwh(0, 100, 200, 200);
        const containerBounds = layoutRectLtwh(100, 0, 200, 200);
        io.observe(element);
        io.prevThresholdSlot_ = -1;
        io.tick(rootBounds, containerBounds);
        const change = {
          time: 100,
          rootBounds: DomRectLtwh(0, 0, 200, 200),
          boundingClientRect: DomRectLtwh(175, 0, 50, 50),
          intersectionRect: DomRectLtwh(175, 25, 25, 25),
          intersectionRatio: 0.25,
        };
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith(change);
      });
    });

    describe('with non AMP element', () => {
      it('without container', () => {
        element.isBuilt = null;
        element.getBoundingClientRect = () => {
          return DomRectLtwh(0, 0, 50, 50);
        };
        const rootBounds = layoutRectLtwh(0, 100, 200, 200);
        io.observe(element);
        io.prevThresholdSlot_ = -1;
        io.tick(rootBounds);
        const change = {
          time: 100,
          rootBounds: DomRectLtwh(0, 0, 200, 200),
          boundingClientRect: DomRectLtwh(0, 0, 50, 50),
          intersectionRect: DomRectLtwh(0, 0, 50, 50),
          intersectionRatio: 1,
        };
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith(change);
      });

      it('with container', () => {
        element.isBuilt = null;
        element.getBoundingClientRect = () => {
          return DomRectLtwh(0, 0, 50, 50);
        };
        const rootBounds = layoutRectLtwh(0, 100, 200, 200);
        const containerBounds = layoutRectLtwh(0, 0, 100, 100);
        io.observe(element);
        io.prevThresholdSlot_ = -1;
        io.tick(rootBounds, containerBounds);
        const change = {
          time: 100,
          rootBounds: DomRectLtwh(0, 0, 200, 200),
          boundingClientRect: DomRectLtwh(0, 0, 50, 50),
          intersectionRect: DomRectLtwh(0, 0, 50, 50),
          intersectionRatio: 1,
        };
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith(change);
      });
    });

    describe('should NOT call callback with', () => {
      it('same threshold value', () => {
        io.observe(document.createElement('div'));
        const rootBounds = layoutRectLtwh(0, 100, 100, 100);
        const layoutBox = layoutRectLtwh(50, 50, 150, 200);
        io.tick(layoutBox, rootBounds);
        expect(callbackSpy).to.be.calledOnce;
        io.tick(layoutBox, rootBounds);
        expect(callbackSpy).to.be.calledOnce;
      });
    });
  });
});
