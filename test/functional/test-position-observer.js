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
  trackOptionType,
} from '../../src/service/position-observer-impl';
import {positionObserverForDoc} from '../../src/position-observer';
import {
  IntersectionObserverPolyfill,
} from '../../src/intersection-observer-polyfill';
import {layoutRectLtwh} from '../../src/layout-rect';
import * as sinon from 'sinon';

describes.realWin.only('PositionObserver', {
  amp: {
    ampdoc: 'single',
  },
}, env => {
  let positionObserver;
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    installPositionObserverServiceForDoc(env.ampdoc);
    positionObserver = positionObserverForDoc(env.ampdoc);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('created InOb', () => {
    let element;
    beforeEach(() => {
      element = document.createElement('div');
      element.isBuilt = () => {return true;};
      element.getOwner = () => {return null;};
      element.getLayoutBox = () => {return layoutRectLtwh(0, 0, 100, 100);};
    });
    afterEach(() => {
      element = null;
    });

    it('should be native/polyfill Inob as expected', () => {
      const InObCallbackSpy = sandbox.spy();
      positionObserver.trackElement(element,
          trackOptionType.VIEWPORT,
          InObCallbackSpy);
      positionObserver.tick();
      expect(InObCallbackSpy).to.not.been.called;
      positionObserver.trackElement(element,
          trackOptionType.LAYOUT,
          InObCallbackSpy);
      positionObserver.tick();
      expect(InObCallbackSpy).to.be.calledOnce;
    });

    it('should untrack callback or unobserve element', () => {
      const InObCallbackSpy2 = sandbox.spy();
      const unobserveSpy = sandbox.spy(IntersectionObserverPolyfill, 'unobserve');
      const unlisten1 = positionObserver.trackElement(
          element, positionObserverTrackOption.LAYOUT, InObCallbackSpy);
      const unlisten2 = positionObserver.trackElement(
          element, positionObserverTrackOption.LAYOUT, InObCallbackSpy2);
      positionObserver.tick();
      expect(InObCallbackSpy).to.be.calledOnce;
      expect(InObCallbackSpy2).to.be.calledOnce;
      unlisten1();
      positionObserver.tick();
      expect(InObCallbackSpy).to.be.calledOnce;
      expect(InObCallbackSpy2).to.be.calledTwice;
      unlisten2();
      expect(unobserveSpy).to.be.calledOnce;


    });

    it('should unobserve element when only one callback is registerd', () => {

    });
  });

  describe('when create InOb with same track option', () => {
    it('should be reused when track multi elements', () => {

    });

    it('should support multi callbacks to one element', () => {

    });
  });

  describe('when create InOb with different track option', () => {
    it('should all be ticked', () => {

    });
  });
});
