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

import {AdDisplayState, AmpAdUIHandler} from '../amp-ad-ui';
import {BaseElement} from '../../../../src/base-element';

describes.realWin('amp-ad-ui handler', {
  amp: {
    ampdoc: 'single',
  },
}, env => {
  let sandbox;
  let adImpl;
  let uiHandler;

  beforeEach(() => {
    sandbox = env.sandbox;
    const adElement = env.win.document.createElement('amp-ad');
    adImpl = new BaseElement(adElement);
    uiHandler = new AmpAdUIHandler(adImpl);
    uiHandler.setDisplayState(AdDisplayState.LOADING);
  });

  describe('with state LOADED_NO_CONTENT', () => {
    it('should try to collapse element first', () => {
      sandbox.stub(adImpl, 'getFallback', () => {
        return true;
      });
      const fallbackSpy = sandbox.stub(adImpl, 'toggleFallback', () => {});
      const collapseSpy = sandbox.stub(adImpl, 'attemptCollapse', () => {
        expect(fallbackSpy).to.not.been.called;
        return Promise.resolve();
      });
      uiHandler.init();
      uiHandler.setDisplayState(AdDisplayState.LOADED_NO_CONTENT);
      expect(collapseSpy).to.be.calledOnce;
    });

    it('should toggle fallback when collapse fail', () => {
      let resolve = null;
      const promise = new Promise(resolve_ => {
        resolve = resolve_;
      });
      const placeholderSpy = sandbox.spy(adImpl, 'togglePlaceholder');
      const fallbackSpy = sandbox.spy(adImpl, 'toggleFallback');
      sandbox.stub(uiHandler.baseInstance_, 'attemptCollapse', () => {
        return Promise.reject();
      });
      sandbox.stub(uiHandler.baseInstance_, 'deferMutate', callback => {
        callback();
        resolve();
      });
      uiHandler.setDisplayState(AdDisplayState.LOADED_NO_CONTENT);
      return promise.then(() => {
        expect(uiHandler.state).to.equal(AdDisplayState.LOADED_NO_CONTENT);
        expect(placeholderSpy).to.be.calledWith(false);
        expect(fallbackSpy).to.be.calledWith(true);
      });
    });

    it('should apply default holder if not provided', () => {
      sandbox.stub(adImpl, 'getFallback', () => {
        return false;
      });
      let resolve = null;
      const promise = new Promise(resolve_ => {
        resolve = resolve_;
      });
      sandbox.stub(adImpl, 'attemptCollapse', () => {
        return Promise.reject();
      });
      sandbox.stub(adImpl, 'deferMutate', callback => {
        callback();
        resolve();
      });
      sandbox.stub(adImpl, 'togglePlaceholder', () => {});
      sandbox.stub(adImpl, 'toggleFallback', () => {});
      uiHandler.init();
      uiHandler.setDisplayState(AdDisplayState.LOADED_NO_CONTENT);
      return promise.then(() => {
        expect(uiHandler.state).to.equal(AdDisplayState.LOADED_NO_CONTENT);
        expect(adImpl.element.querySelector('[fallback]')).to.be.ok;
      });
    });

    it('should NOT continue with display state UN_LAID_OUT', () => {
      let resolve = null;
      const promise = new Promise(resolve_ => {
        resolve = resolve_;
      });

      sandbox.stub(adImpl, 'attemptCollapse', () => {
        return Promise.reject();
      });
      sandbox.stub(adImpl, 'deferMutate', callback => {
        uiHandler.state = AdDisplayState.NOT_LAID_OUT;
        callback();
        resolve();
      });
      const fallbackSpy = sandbox.spy(adImpl, 'toggleFallback');

      uiHandler.init();
      uiHandler.setDisplayState(AdDisplayState.LOADED_NO_CONTENT);
      return promise.then(() => {
        expect(fallbackSpy).to.not.be.called;
        expect(uiHandler.state).to.equal(AdDisplayState.NOT_LAID_OUT);
      });
    });
  });
});
