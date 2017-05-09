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
  installPositionObserverServiceForDoc,
} from '../../src/service/position-observer-impl';
import {positionObserverForDoc} from '../../src/position-observer';
import {
  IntersectionObserverPolyfill,
} from '../../src/intersection-observer-polyfill';
import {layoutRectLtwh} from '../../src/layout-rect';
import * as sinon from 'sinon';

describes.realWin('PositionObserver', {
  amp: {
    ampdoc: 'single',
  },
}, env => {
  let positionObserver;
  let sandbox;
  let element;
  let element2;
  const trackOption = {
    id: 'testpolyfill',
    useNative: false,
    options: {
      threshold: [0],
    },
  };
  const trackOption2 = {
    id: 'testpolyfill2',
    useNative: false,
    options: {
      threshold: [0],
    },
  };
  beforeEach(() => {
    element = document.createElement('div');
    element.isBuilt = () => {return true;};
    element.getOwner = () => {return null;};
    element.getLayoutBox = () => {return layoutRectLtwh(0, 0, 100, 100);};

    element2 = document.createElement('div');
    element2.isBuilt = () => {return true;};
    element2.getOwner = () => {return null;};
    element2.getLayoutBox = () => {return layoutRectLtwh(0, 0, 100, 100);};
    sandbox = sinon.sandbox.create();
    installPositionObserverServiceForDoc(env.ampdoc);
    positionObserver = positionObserverForDoc(env.ampdoc);
  });

  afterEach(() => {
    sandbox.restore();
    element = null;
  });

  describe('created InOb', () => {
    const nativeTrackOption = {
      id: 'testnative',
      options: {
        threshold: [0],
      },
    };

    it('should be native/polyfill Inob as expected', () => {
      const polyfillInObSpy = sandbox.spy();
      positionObserver.trackElement(element, nativeTrackOption,
          polyfillInObSpy);
      positionObserver.tick();
      expect(polyfillInObSpy).to.not.been.called;
      positionObserver.trackElement(element, trackOption,
          polyfillInObSpy);
      positionObserver.tick();
      expect(polyfillInObSpy).to.be.calledOnce;
    });

    it('should call observe/unobserve at correct time', () => {
      const observeSpy =
          sandbox.spy(IntersectionObserverPolyfill.prototype, 'observe');
      const unobserveSpy =
          sandbox.spy(IntersectionObserverPolyfill.prototype, 'unobserve');
      const unlisten1 = positionObserver.trackElement(
          element, trackOption, () => {});
      expect(observeSpy).to.be.calledOnce;
      const unlisten2 = positionObserver.trackElement(
          element, trackOption, () => {});
      positionObserver.tick();
      expect(observeSpy).to.be.calledOnce;
      unlisten1();
      expect(unobserveSpy).to.not.be.called;
      unlisten2();
      expect(unobserveSpy).to.be.calledOnce;
    });

    it('should be reused only with same trackoption', () => {
      const InObTickSpy =
          sandbox.spy(IntersectionObserverPolyfill.prototype, 'tick');

      positionObserver.trackElement(element, trackOption, () => {});
      positionObserver.trackElement(element2, trackOption, () => {});
      positionObserver.tick();
      expect(InObTickSpy).to.be.calledOnce;
      InObTickSpy.reset();
      positionObserver.trackElement(element, trackOption2, () => {});
      positionObserver.trackElement(element2, trackOption2, () => {});
      positionObserver.tick();
      expect(InObTickSpy).to.be.calledTwice;
    });
  });

  describe('registered callbacks', () => {
    it('should all be called when same InOb observe multi elements', () => {
      const callbackSpy1 = sandbox.spy();
      const callbackSpy2 = sandbox.spy();
      positionObserver.trackElement(element, trackOption, callbackSpy1);
      positionObserver.trackElement(element2, trackOption, callbackSpy2);
      positionObserver.tick();
      expect(callbackSpy1).to.be.calledOnce;
      expect(callbackSpy2).to.be.calledOnce;
    });

    it('should all be called element has multi callbacks in same InOb', () => {
      const callbackSpy1 = sandbox.spy();
      const callbackSpy2 = sandbox.spy();
      positionObserver.trackElement(element, trackOption, callbackSpy1);
      const unlisten =
          positionObserver.trackElement(element, trackOption, callbackSpy2);
      positionObserver.tick();
      expect(callbackSpy1).to.be.calledOnce;
      expect(callbackSpy2).to.be.calledOnce;
      // change the fake layoutbox of the element to tick
      element.getLayoutBox =
          () => {return layoutRectLtwh(-1, -1, 1, 1);};
      unlisten();
      positionObserver.tick();
      expect(callbackSpy1).to.be.calledTwice;
      expect(callbackSpy2).to.be.calledOnce;
    });

    it('should all be called with multi InOb', () => {
      const callbackSpy1 = sandbox.spy();
      const callbackSpy2 = sandbox.spy();
      const callbackSpy3 = sandbox.spy();
      positionObserver.trackElement(element, trackOption, callbackSpy1);
      positionObserver.trackElement(element, trackOption2, callbackSpy2);
      positionObserver.trackElement(element2, trackOption2, callbackSpy3);
      positionObserver.tick();
      expect(callbackSpy1).to.be.calledOnce;
      expect(callbackSpy2).to.be.calledOnce;
      expect(callbackSpy3).to.be.calledOnce;
    });
  });
});
