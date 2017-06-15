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
  IntersectionObserverApi,
  IntersectionObserverPolyfill,
  getThresholdSlot,
  DEFAULT_THRESHOLD,
  getIntersectionChangeEntry,
} from '../../src/intersection-observer-polyfill';
import {DOMRectLtwh} from '../../src/DOM-rect';
import * as sinon from 'sinon';

describe('IntersectionObserverApi', () => {
  let sandbox;
  let onScrollSpy;
  let onChangeSpy;
  let testEle;
  let baseElement;
  let ioApi;
  let tickSpy;

  const iframeSrc = 'http://iframe.localhost:' + location.port +
      '/test/fixtures/served/iframe-intersection.html';
  let testIframe;

  function getIframe(src) {
    const i = document.createElement('iframe');
    i.src = src;
    return i;
  }

  function insert(iframe) {
    document.body.appendChild(iframe);
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    onScrollSpy = sandbox.spy();
    onChangeSpy = sandbox.spy();
    testIframe = getIframe(iframeSrc);
    testEle = {
      isBuilt: () => {return true;},
      getOwner: () => {return null;},
      getLayoutBox: () => {return DOMRectLtwh(50, 100, 150, 200);},
      win: window,
    };

    baseElement = {
      element: testEle,
      getVsync: () => {
        return {
          measure: func => {
            func();
          },
        };
      },
      getViewport: () => {
        return {
          getRect: () => {
            return DOMRectLtwh(50, 100, 150, 200);
          },
          onScroll: () => {
            onScrollSpy();
            return () => {};
          },
          onChanged: () => {
            onChangeSpy();
            return () => {};
          },
        };
      },
      isInViewport: () => {return false;},
    };
    ioApi = new IntersectionObserverApi(baseElement, testIframe);
    insert(testIframe);
    tickSpy = sandbox.spy(ioApi.intersectionObserver_, 'tick');
  });
  afterEach(() => {
    sandbox.restore();
    testIframe.parentNode.removeChild(testIframe);
    if (ioApi) {
      ioApi.destroy();
    }
    ioApi = null;
    tickSpy = null;
  });

  it('should tick if element in viewport when start sending io', () => {
    ioApi.startSendingIntersection_();
    expect(tickSpy).to.not.be.called;
    expect(onChangeSpy).to.be.calledOnce;
    expect(onScrollSpy).to.be.calledOnce;
    testIframe.parentNode.removeChild(testIframe);
    ioApi.destroy();
    baseElement.isInViewport = () => {return true;};
    ioApi = new IntersectionObserverApi(baseElement, testIframe);
    insert(testIframe);
    const inViewportTickSpy = sandbox.spy(ioApi.intersectionObserver_, 'tick');
    ioApi.startSendingIntersection_();
    expect(inViewportTickSpy).to.be.calledOnce;
    expect(onChangeSpy).to.be.calledTwice;
    expect(onScrollSpy).to.be.calledTwice;
  });

  it('should tick on inViewport value when element call fire', () => {
    ioApi.startSendingIntersection_();
    ioApi.fire();
    expect(tickSpy).to.not.be.called;
    ioApi.onViewportCallback(true);
    ioApi.fire();
    expect(tickSpy).to.be.calledOnce;
  });

  it('should not tick before start observing', () => {
    ioApi.onViewportCallback(true);
    expect(tickSpy).to.not.be.called;
    ioApi.fire();
    expect(tickSpy).to.not.be.called;
  });

  it('should destroy correctly', () => {
    const subscriptionApiDestroySy =
        sandbox.spy(ioApi.subscriptionApi_, 'destroy');
    ioApi.destroy();
    expect(subscriptionApiDestroySy).to.be.called;
    expect(ioApi.unlistenOnDestroy_).to.be.null;
    expect(ioApi.intersectionObserver_).to.be.null;
    expect(ioApi.subscriptionApi_).to.be.null;
    ioApi = null;
  });
});

describe('getIntersectionChangeEntry', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(performance, 'now', () => 100);
  });

  afterEach(() => {
    sandbox.restore();
  });
  it('without owner', () => {
    expect(getIntersectionChangeEntry(
        DOMRectLtwh(0, 100, 50, 50),
        null,
        DOMRectLtwh(0, 100, 100, 100))).to.jsonEqual({
          time: 100,
          rootBounds: DOMRectLtwh(0, 0, 100, 100),
          boundingClientRect: DOMRectLtwh(0, 0, 50, 50),
          intersectionRect: DOMRectLtwh(0, 0, 50, 50),
          intersectionRatio: 1,
        });
    expect(getIntersectionChangeEntry(
        DOMRectLtwh(50, 200, 150, 200),
        null,
        DOMRectLtwh(0, 100, 100, 100))).to.jsonEqual({
          time: 100,
          rootBounds: DOMRectLtwh(0, 0, 100, 100),
          boundingClientRect: DOMRectLtwh(50, 100, 150, 200),
          intersectionRect: DOMRectLtwh(50, 100, 50, 0),
          intersectionRatio: 0,
        });
  });
  it('with owner', () => {
    expect(getIntersectionChangeEntry(
        DOMRectLtwh(50, 50, 150, 200),
        DOMRectLtwh(0, 50, 100, 100),
        DOMRectLtwh(0, 100, 100, 100))).to.jsonEqual({
          time: 100,
          rootBounds: DOMRectLtwh(0, 0, 100, 100),
          boundingClientRect: DOMRectLtwh(50, -50, 150, 200),
          intersectionRect: DOMRectLtwh(50, 0, 50, 50),
          intersectionRatio: 1 / 12,
        });
  });
});

describe('IntersectionObserverPolyfill', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(performance, 'now', () => 100);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('threshold', () => {
    it('will be sorted', () => {
      const io = new IntersectionObserverPolyfill(() => {}, {
        threshold: [0, 0.9, 0.3, 1, 0.02],
      });
      expect(io.threshold_).to.jsonEqual([0, 0.02, 0.3, 0.9, 1]);
    });

    it('should NOT contain value less than 0 or greater than 1', () => {
      const io1 = () => {
        new IntersectionObserverPolyfill(() => {}, {
          threshold: [0, -2],
        });
      };
      const io2 = () => {
        new IntersectionObserverPolyfill(() => {}, {
          threshold: [0, 1.1],
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

    it('should tick with right threshold', () => {
      io = new IntersectionObserverPolyfill(callbackSpy, {
        threshold: [0, 1],
      });
      element.getLayoutBox = () => {
        return DOMRectLtwh(0, 0, 100, 100);
      };
      io.observe(element);
      // 1st tick with 0 doesn't fire
      io.tick(DOMRectLtwh(0, 100, 100, 100));
      expect(callbackSpy).to.not.be.called;
      // 2nd tick with 0.1 does fire
      io.tick(DOMRectLtwh(0, 90, 100, 100));
      expect(callbackSpy).to.be.calledOnce;
      callbackSpy.reset();
      // 3rd tick with 0.9 doesn't fire
      io.tick(DOMRectLtwh(0, 10, 100, 100));
      expect(callbackSpy).to.not.be.called;
      callbackSpy.reset();
      // 4rd tick with 1 does fire
      io.tick(DOMRectLtwh(0, 0, 100, 100));
      expect(callbackSpy).to.be.calledOnce;
      callbackSpy.reset();
      // 5th tick with 1 doesn't fire
      io.tick(DOMRectLtwh(0, 0, 100, 100));
      expect(callbackSpy).to.not.be.called;
      // 6th tick with 0.9 does fire
      io.tick(DOMRectLtwh(0, 10, 100, 100));
      expect(callbackSpy).to.be.calledOnce;
      callbackSpy.reset();
      // 7th tick with 0.1 doesn't fire
      io.tick(DOMRectLtwh(0, 90, 100, 100));
      expect(callbackSpy).to.not.be.called;
      // 8th tick with 0 does fire
      io.tick(DOMRectLtwh(0, 100, 100, 100));
      expect(callbackSpy).to.be.calledOnce;
      callbackSpy.reset();
      // 9th tick with 0 doesn't fire
      io.tick(DOMRectLtwh(0, 100, 100, 100));
      expect(callbackSpy).to.not.be.called;
    });

    it('should trigger for new observed element', () => {
      io = new IntersectionObserverPolyfill(callbackSpy, {
        threshold: [0, 1],
      });
      element.getLayoutBox = () => {
        return DOMRectLtwh(0, 0, 100, 100);
      };
      io.tick(DOMRectLtwh(0, 90, 100, 100));

      // Observe after tick.
      io.observe(element);
      expect(callbackSpy).to.be.calledOnce;
    });



    describe('w/o container should get IntersectionChangeEntry when', () => {
      it('completely in viewport', () => {
        element.getLayoutBox = () => {
          return DOMRectLtwh(0, 100, 50, 50);
        };
        io.observe(element);
        const rootBounds = DOMRectLtwh(0, 100, 100, 100);
        io.tick(rootBounds);
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith([{
          time: 100,
          rootBounds: DOMRectLtwh(0, 0, 100, 100),
          boundingClientRect: DOMRectLtwh(0, 0, 50, 50),
          intersectionRect: DOMRectLtwh(0, 0, 50, 50),
          intersectionRatio: 1,
          target: element,
        }]);
      });

      it('intersects on the edge', () => {
        element.getLayoutBox = () => {
          return DOMRectLtwh(50, 200, 150, 200);
        };
        const rootBounds = DOMRectLtwh(0, 100, 100, 100);
        io.observe(element);
        // Tick once before to set threshold to value other than 0;
        io.tick(DOMRectLtwh(50, 200, 100, 100));
        io.tick(rootBounds);
        expect(callbackSpy).to.be.calledTwice;
        expect(callbackSpy.secondCall).to.be.calledWith([{
          time: 100,
          rootBounds: DOMRectLtwh(0, 0, 100, 100),
          boundingClientRect: DOMRectLtwh(50, 100, 150, 200),
          intersectionRect: DOMRectLtwh(50, 100, 50, 0),
          intersectionRatio: 0,
          target: element,
        }]);
      });

      it('intersects the viewport (bottom right)', () => {
        element.getLayoutBox = () => {
          return DOMRectLtwh(50, 199, 150, 200);
        };
        const rootBounds = DOMRectLtwh(0, 100, 100, 100);
        io.observe(element);
        io.tick(rootBounds);
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith([{
          time: 100,
          rootBounds: DOMRectLtwh(0, 0, 100, 100),
          boundingClientRect: DOMRectLtwh(50, 99, 150, 200),
          intersectionRect: DOMRectLtwh(50, 99, 50, 1),
          intersectionRatio: 1 / 600,
          target: element,
        }]);
      });

      it('intersects the viewport (top left)', () => {
        element.getLayoutBox = () => {
          return DOMRectLtwh(50, 100, 150, 200);
        };
        const rootBounds = DOMRectLtwh(198, 299, 100, 100);
        io.observe(element);
        io.tick(rootBounds);
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith([{
          time: 100,
          rootBounds: DOMRectLtwh(0, 0, 100, 100),
          boundingClientRect: DOMRectLtwh(-148, -199, 150, 200),
          intersectionRect: DOMRectLtwh(0, 0, 2, 1),
          intersectionRatio: 2 / 30000,
          target: element,
        }]);
      });

      it('NOT intersects when element outside (top left) viewport', () => {
        element.getLayoutBox = () => {
          return DOMRectLtwh(50, 100, 150, 200);
        };
        const rootBounds = DOMRectLtwh(202, 299, 100, 100);
        io.observe(element);
        // Tick once before to set threshold to value other than 0;
        io.tick(DOMRectLtwh(50, 100, 100, 100));
        io.tick(rootBounds);
        expect(callbackSpy).to.be.calledTwice;
        expect(callbackSpy.secondCall).to.be.calledWith([{
          time: 100,
          rootBounds: DOMRectLtwh(0, 0, 100, 100),
          boundingClientRect: DOMRectLtwh(-152, -199, 150, 200),
          intersectionRect: DOMRectLtwh(0, 0, 0, 0),
          intersectionRatio: 0,
          target: element,
        }]);
      });

      it('NOT intersects with element outside (bottom) viewport', () => {
        element.getLayoutBox = () => {
          return DOMRectLtwh(50, 225, 100, 100);
        };
        const rootBounds = DOMRectLtwh(0, 100, 100, 100);
        io.observe(element);
        // Tick once before to set threshold to value other than 0;
        io.tick(DOMRectLtwh(50, 225, 100, 100));
        io.tick(rootBounds);
        expect(callbackSpy).to.be.calledTwice;
        expect(callbackSpy.secondCall).to.be.calledWith([{
          time: 100,
          rootBounds: DOMRectLtwh(0, 0, 100, 100),
          boundingClientRect: DOMRectLtwh(50, 125, 100, 100),
          intersectionRect: DOMRectLtwh(0, 0, 0, 0),
          intersectionRatio: 0,
          target: element,
        }]);
      });

      it('element has owner', () => {
        element.getLayoutBox = () => {
          return DOMRectLtwh(50, 50, 150, 200);
        };
        element.getOwner = () => {
          return {
            getLayoutBox: () => {
              return DOMRectLtwh(0, 50, 100, 100);
            },
          };
        };
        io.observe(element);
        const rootBounds = DOMRectLtwh(0, 100, 100, 100);
        io.tick(rootBounds);
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith([{
          time: 100,
          rootBounds: DOMRectLtwh(0, 0, 100, 100),
          boundingClientRect: DOMRectLtwh(50, -50, 150, 200),
          intersectionRect: DOMRectLtwh(50, 0, 50, 50),
          intersectionRatio: 1 / 12,
          target: element,
        }]);
      });
    });

    describe('w/ container should get IntersectionChangeEntry when', () => {
      it('nested element in container in viewport', () => {
        element.getLayoutBox = () => {
          return DOMRectLtwh(10, 10, 10, 10);
        };
        const rootBounds = DOMRectLtwh(1, 100, 200, 200);
        const containerBounds = DOMRectLtwh(2, 102, 50, 50);
        io.observe(element);
        io.tick(rootBounds, containerBounds);
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith([{
          time: 100,
          rootBounds: null,
          boundingClientRect: DOMRectLtwh(10, 10, 10, 10),
          intersectionRect: DOMRectLtwh(10, 10, 10, 10),
          intersectionRatio: 1,
          target: element,
        }]);
      });

      it('nested element in container, container intersect viewport', () => {
        element.getLayoutBox = () => {
          return DOMRectLtwh(75, 0, 50, 50);
        };
        const rootBounds = DOMRectLtwh(0, 100, 200, 200);
        const containerBounds = DOMRectLtwh(100, 100, 200, 200);
        io.observe(element);
        io.tick(rootBounds, containerBounds);
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith([{
          time: 100,
          rootBounds: null,
          boundingClientRect: DOMRectLtwh(75, 0, 50, 50),
          intersectionRect: DOMRectLtwh(75, 0, 25, 50),
          intersectionRatio: 0.5,
          target: element,
        }]);
      });

      it('nested element in container, container not in viewport', () => {
        element.getLayoutBox = () => {
          return DOMRectLtwh(0, 0, 50, 50);
        };
        const rootBounds = DOMRectLtwh(0, 100, 200, 200);
        const containerBounds = DOMRectLtwh(0, 300, 100, 100);
        io.observe(element);
        // Tick once before to set threshold to value other than 0;
        io.tick(rootBounds, DOMRectLtwh(0, 200, 200, 200));
        io.tick(rootBounds, containerBounds);
        expect(callbackSpy).to.be.calledTwice;
        expect(callbackSpy.secondCall).to.be.calledWith([{
          time: 100,
          rootBounds: null,
          boundingClientRect: DOMRectLtwh(0, 0, 50, 50),
          intersectionRect: DOMRectLtwh(0, 0, 50, 0),
          intersectionRatio: 0,
          target: element,
        }]);
      });

      it('nested element outside container but in viewport', () => {
        const rootBounds = DOMRectLtwh(0, 100, 200, 200);
        const containerBounds = DOMRectLtwh(0, 301, 100, 100);
        // Tick once before to set threshold to value other than 0;
        element.getLayoutBox = () => {
          return DOMRectLtwh(0, 0, 50, 50);
        };
        io.observe(element);
        io.tick(rootBounds, DOMRectLtwh(0, 200, 200, 200));
        element.getLayoutBox = () => {
          return DOMRectLtwh(0, -101, 50, 50);
        };
        io.tick(rootBounds, containerBounds);
        expect(callbackSpy).to.be.calledTwice;
        expect(callbackSpy.secondCall).to.be.calledWith([{
          time: 100,
          rootBounds: null,
          boundingClientRect: DOMRectLtwh(0, -101, 50, 50),
          intersectionRect: DOMRectLtwh(0, 0, 0, 0),
          intersectionRatio: 0,
          target: element,
        }]);
      });

      it('element has an owner', () => {
        element.getLayoutBox = () => {
          return DOMRectLtwh(75, 0, 50, 50);
        };
        element.getOwner = () => {
          return {
            getLayoutBox: () => {
              return DOMRectLtwh(0, 25, 200, 25);
            },
          };
        };
        const rootBounds = DOMRectLtwh(0, 100, 200, 200);
        const containerBounds = DOMRectLtwh(100, 100, 200, 200);
        io.observe(element);
        io.tick(rootBounds, containerBounds);
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith([{
          time: 100,
          rootBounds: null,
          boundingClientRect: DOMRectLtwh(75, 0, 50, 50),
          intersectionRect: DOMRectLtwh(75, 25, 25, 25),
          intersectionRatio: 0.25,
          target: element,
        }]);
      });
    });

    describe('with multiple elements', () => {
      let element2;
      beforeEach(() => {
        element2 = {
          isBuilt: () => {return true;},
          getOwner: () => {return null;},
          getLayoutBox: () => {return DOMRectLtwh(0, 100, 50, 50);},
        };
      });

      afterEach(() => {
        element2 = null;
      });

      it('should tick on multi elements', () => {
        const rootBounds = DOMRectLtwh(0, 100, 100, 100);
        element.getLayoutBox = () => {
          return DOMRectLtwh(0, 100, 25, 25);
        };
        io.observe(element);
        io.observe(element2);
        io.tick(rootBounds);
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith([{
          time: 100,
          rootBounds: DOMRectLtwh(0, 0, 100, 100),
          boundingClientRect: DOMRectLtwh(0, 0, 25, 25),
          intersectionRect: DOMRectLtwh(0, 0, 25, 25),
          intersectionRatio: 1,
          target: element,
        }, {
          time: 100,
          rootBounds: DOMRectLtwh(0, 0, 100, 100),
          boundingClientRect: DOMRectLtwh(0, 0, 50, 50),
          intersectionRect: DOMRectLtwh(0, 0, 50, 50),
          intersectionRatio: 1,
          target: element2,
        }]);
      });

      it('should only fire for elements that crossed threshold', () => {
        const rootBounds = DOMRectLtwh(0, 100, 100, 100);
        element.getLayoutBox = () => {
          return DOMRectLtwh(50, 200, 150, 200);
        };
        io.observe(element);
        io.observe(element2);
        io.tick(rootBounds);
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith([{
          time: 100,
          rootBounds: DOMRectLtwh(0, 0, 100, 100),
          boundingClientRect: DOMRectLtwh(0, 0, 50, 50),
          intersectionRect: DOMRectLtwh(0, 0, 50, 50),
          intersectionRatio: 1,
          target: element2,
        }]);
      });

      it('should stop observing after unobserve', () => {
        element.getLayoutBox = () => {
          return DOMRectLtwh(0, 50, 50, 50);
        };
        io.observe(element);
        io.observe(element2);
        io.tick(DOMRectLtwh(0, 0, 200, 200));
        expect(callbackSpy).to.be.calledOnce;
        io.unobserve(element);
        io.tick(DOMRectLtwh(0, 0, 10, 10));
        expect(callbackSpy).to.be.calledTwice;
        expect(callbackSpy.secondCall).to.be.calledWith([{
          time: 100,
          rootBounds: DOMRectLtwh(0, 0, 10, 10),
          boundingClientRect: DOMRectLtwh(0, 100, 50, 50),
          intersectionRect: DOMRectLtwh(0, 0, 0, 0),
          intersectionRatio: 0,
          target: element2,
        }]);
      });
    });
  });
});

// /**
//  * Creates a DOM rect based on the left, top, width and height parameters
//  * in that order.
//  * @param {number} left
//  * @param {number} top
//  * @param {number} width
//  * @param {number} height
//  * @return {!DOMRect}
//  */
// function DomRectLtwh(left, top, width, height) {
//   const res = DOMRectLtwh(left, top, width, height);
//   res.x = left;
//   res.y = top;
//   return res;
// }
