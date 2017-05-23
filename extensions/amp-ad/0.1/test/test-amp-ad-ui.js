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

import {setStyles} from '../../../../src/style';
import {AmpAdUIHandler} from '../amp-ad-ui';
import {BaseElement} from '../../../../src/base-element';
import * as adHelper from '../../../../src/ad-helper';

describes.realWin('amp-ad-ui handler', {
  amp: {
    ampdoc: 'single',
  },
}, env => {
  let sandbox;
  let adImpl;
  let uiHandler;
  let adContainer;
  let adElement;

  beforeEach(() => {
    sandbox = env.sandbox;
    adElement = env.win.document.createElement('amp-ad');
    adImpl = new BaseElement(adElement);
    uiHandler = new AmpAdUIHandler(adImpl);
    sandbox.stub(adHelper, 'getAdContainer', () => {
      return adContainer;
    });
    adContainer = null;
  });

  describe('applyNoContentUI', () => {
    it('should force collapse ad in special container', () => {
      adContainer = 'AMP-STICKY-AD';
      const attemptCollapseSpy = sandbox.spy(adImpl, 'attemptCollapse');
      const collapseSpy = sandbox.stub(adImpl, 'collapse', () => {});
      uiHandler.applyNoContentUI();
      expect(collapseSpy).to.be.calledOnce;
      expect(attemptCollapseSpy).to.not.be.called;
    });

    it('should try to collapse element first', () => {
      sandbox.stub(adImpl, 'getFallback', () => {
        return true;
      });
      const fallbackSpy = sandbox.stub(adImpl, 'toggleFallback', () => {});
      const collapseSpy = sandbox.stub(adImpl, 'attemptCollapse', () => {
        expect(fallbackSpy).to.not.been.called;
        return Promise.resolve();
      });
      uiHandler.applyNoContentUI();
      expect(collapseSpy).to.be.calledOnce;
    });

    it('should toggle fallback when collapse fail', () => {
      let resolve = null;
      const promise = new Promise(resolve_ => {
        resolve = resolve_;
      });
      const placeholderSpy = sandbox.spy(adImpl, 'togglePlaceholder');
      const fallbackSpy = sandbox.stub(adImpl, 'toggleFallback', () => {});
      sandbox.stub(uiHandler.baseInstance_, 'attemptCollapse', () => {
        return Promise.reject();
      });
      sandbox.stub(uiHandler.baseInstance_, 'deferMutate', callback => {
        callback();
        resolve();
      });
      uiHandler.applyNoContentUI();
      return promise.then(() => {
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
      uiHandler.applyNoContentUI();
      return promise.then(() => {
        expect(adImpl.element.querySelector('[fallback]')).to.be.ok;
      });
    });

    describe('updateSize function', () => {
      it('should calculate take consideration of padding', () => {
        setStyles(adImpl.element, {
          width: '350px',
          height: '50px',
        });
        env.win.document.body.appendChild(adElement);
        sandbox.stub(adImpl, 'attemptChangeSize', (height, width) => {
          expect(height).to.equal(100);
          expect(width).to.equal(450);
          return Promise.resolve();
        });
        return uiHandler.updateSize(100, 400, 50, 300).then(sizes => {
          expect(sizes).to.deep.equal({
            success: true,
            newWidth: 450,
            newHeight: 100,
          });
        });
      });

      it('should tolerate string input', () => {
        sandbox.stub(adImpl, 'attemptChangeSize', (height, width) => {
          expect(height).to.equal(100);
          expect(width).to.equal(400);
          return Promise.resolve();
        });
        return uiHandler.updateSize('100', 400, 0, 0).then(sizes => {
          expect(sizes).to.deep.equal({
            success: true,
            newWidth: 400,
            newHeight: 100,
          });
        });
      });

      it('should reject on special case undefined sizes', () => {
        const attemptChangeSizeSpy = sandbox.spy(adImpl, 'attemptChangeSize');
        return uiHandler.updateSize(undefined, undefined, 0, 0).catch(e => {
          expect(e.message).to.equal('undefined width and height');
          expect(attemptChangeSizeSpy).to.not.be.called;
        });
      });

      it('should reject on special case inside sticky ad', () => {
        adContainer = 'AMP-STICKY-AD';
        const attemptChangeSizeSpy = sandbox.spy(adImpl, 'attemptChangeSize');
        return uiHandler.updateSize(100, 400, 0, 0).then(sizes => {
          expect(sizes).to.deep.equal({
            success: false,
            newWidth: 400,
            newHeight: 100,
          });
          expect(attemptChangeSizeSpy).to.not.be.called;
        });
      });

      it('should reject on attemptChangeSize reject', () => {
        sandbox.stub(adImpl, 'attemptChangeSize', () => {
          return Promise.reject();
        });
        return uiHandler.updateSize(100, 400, 0, 0).then(sizes => {
          expect(sizes).to.deep.equal({
            success: false,
            newWidth: 400,
            newHeight: 100,
          });
        });
      });
    });
  });
});
