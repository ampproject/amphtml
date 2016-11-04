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
import {toggleExperiment} from '../../../../src/experiments';
import {UX_EXPERIMENT} from '../../../../src/layout';
import * as sinon from 'sinon';

describe('amp-ad-ui handler', () => {
  let sandbox;
  let adImpl;
  let uiHandler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const adElement = document.createElement('amp-ad');
    adImpl = new BaseElement(adElement);
    uiHandler = new AmpAdUIHandler(adImpl);
    uiHandler.setDisplayState(AdDisplayState.LOADING);
  });

  afterEach(() => {
    sandbox.restore();
    uiHandler = null;
  });

  describe('with state LOADED_NO_CONTENT', () => {
    it('should try to collapse element', () => {
      sandbox.stub(adImpl, 'getFallback', () => {
        return false;
      });
      sandbox.stub(adImpl, 'attemptChangeHeight', height => {
        expect(height).to.equal(0);
        return Promise.resolve();
      });
      const collapseSpy = sandbox.stub(adImpl, 'collapse', () => {});
      uiHandler.init();
      uiHandler.setDisplayState(AdDisplayState.LOADED_NO_CONTENT);
      return Promise.resolve().then(() => {
        expect(collapseSpy).to.be.calledOnce;
        expect(uiHandler.state).to.equal(3);
      });
    });

    it('should apply default holder when collapse fail', () => {
      sandbox.stub(adImpl, 'getFallback', () => {
        return false;
      });
      sandbox.stub(adImpl, 'attemptChangeHeight', () => {
        return Promise.reject();
      });
      toggleExperiment(window, UX_EXPERIMENT, true);
      uiHandler.init();
      uiHandler.setDisplayState(AdDisplayState.LOADED_NO_CONTENT);
      return Promise.resolve().then(() => {
        const holder = adImpl.element.querySelector('.amp-ad-default-fallback');
        expect(holder).to.not.be.null;
        expect(holder).to.have.attribute('fallback');
      });
    });

    it('should NOT continue with display state UN_LAID_OUT', () => {
      sandbox.stub(adImpl, 'getFallback', () => {
        return document.createElement('div');
      });
      uiHandler = new AmpAdUIHandler(adImpl);
      uiHandler.setDisplayState(AdDisplayState.LOADING);
      const spy = sandbox.stub(adImpl, 'deferMutate', callback => {
        uiHandler.state = AdDisplayState.NOT_LAID_OUT;
        callback();
      });
      const placeHolderSpy = sandbox.stub(adImpl, 'togglePlaceholder');
      uiHandler.init();
      uiHandler.setDisplayState(AdDisplayState.LOADED_NO_CONTENT);
      expect(spy).to.be.called;
      expect(placeHolderSpy).to.not.be.called;
      expect(uiHandler.state).to.equal(AdDisplayState.NOT_LAID_OUT);
    });
  });
});
