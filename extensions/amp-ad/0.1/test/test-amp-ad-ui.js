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

import * as adHelper from '../../../../src/ad-helper';
import * as dom from '../../../../src/dom';
import {AmpAdUIHandler} from '../amp-ad-ui';
import {BaseElement} from '../../../../src/base-element';
import {createElementWithAttributes} from '../../../../src/dom';
import {macroTask} from '../../../../testing/yield';
import {setStyles} from '../../../../src/style';

describes.realWin(
  'amp-ad-ui handler',
  {
    amp: {
      ampdoc: 'single',
    },
  },
  env => {
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
      sandbox.stub(adHelper, 'getAdContainer').callsFake(() => {
        return adContainer;
      });
      adContainer = null;
    });

    describe('applyNoContentUI', () => {
      it('should force collapse ad in sticky ad container', () => {
        adContainer = 'AMP-STICKY-AD';
        const attemptCollapseSpy = sandbox.spy(adImpl, 'attemptCollapse');
        const collapseSpy = sandbox
          .stub(adImpl, 'collapse')
          .callsFake(() => {});
        uiHandler.applyNoContentUI();
        expect(collapseSpy).to.be.calledOnce;
        expect(attemptCollapseSpy).to.not.be.called;
      });

      it(
        'should force collapse ad inside flying carpet, ' +
          'if it is the only and direct child of flying carpet',
        function*() {
          adContainer = 'AMP-FX-FLYING-CARPET';
          const attemptCollapseSpy = sandbox.spy(adImpl, 'attemptCollapse');
          const collapseSpy = sandbox
            .stub(adImpl, 'collapse')
            .callsFake(() => {});

          sandbox.stub(dom, 'ancestorElementsByTag').callsFake(() => {
            return [
              {
                getImpl: () =>
                  Promise.resolve({
                    getChildren: () => [adElement],
                  }),
              },
            ];
          });

          uiHandler.applyNoContentUI();
          yield macroTask();

          expect(collapseSpy).to.be.calledOnce;
          expect(attemptCollapseSpy).to.not.be.called;
        }
      );

      it(
        'should NOT force collapse ad inside flying carpet, ' +
          'if there is another element',
        function*() {
          adContainer = 'AMP-FX-FLYING-CARPET';
          const attemptCollapseSpy = sandbox.spy(adImpl, 'attemptCollapse');
          const collapseSpy = sandbox
            .stub(adImpl, 'collapse')
            .callsFake(() => {});

          const otherElement = env.win.document.createElement('div');

          sandbox.stub(dom, 'ancestorElementsByTag').callsFake(() => {
            return [
              {
                getImpl: () =>
                  Promise.resolve({
                    getChildren: () => [adElement, otherElement],
                  }),
              },
            ];
          });

          uiHandler.applyNoContentUI();
          yield macroTask();

          expect(collapseSpy).to.not.be.called;
          expect(attemptCollapseSpy).to.not.be.called;
        }
      );

      it(
        'should NOT force collapse ad inside flying carpet, ' +
          'if it is not a direct child of flying carpet.',
        function*() {
          adContainer = 'AMP-FX-FLYING-CARPET';
          const attemptCollapseSpy = sandbox.spy(adImpl, 'attemptCollapse');
          const collapseSpy = sandbox
            .stub(adImpl, 'collapse')
            .callsFake(() => {});

          const otherElement = env.win.document.createElement('div');
          adElement.remove();
          otherElement.appendChild(adElement);

          sandbox.stub(dom, 'ancestorElementsByTag').callsFake(() => {
            return [
              {
                getImpl: () =>
                  Promise.resolve({
                    getChildren: () => [otherElement],
                  }),
              },
            ];
          });

          uiHandler.applyNoContentUI();
          yield macroTask();

          expect(collapseSpy).to.not.be.called;
          expect(attemptCollapseSpy).to.not.be.called;
        }
      );

      it('should collapse ad amp-layout container if there is one', () => {
        adElement = createElementWithAttributes(env.win.document, 'amp-ad', {
          'data-ad-container-id': 'test',
        });
        const container = createElementWithAttributes(
          env.win.document,
          'amp-layout',
          {'id': 'test'}
        );
        container.appendChild(adElement);
        env.win.document.body.appendChild(container);
        adImpl = new BaseElement(adElement);
        uiHandler = new AmpAdUIHandler(adImpl);
        const adAttemptCollapseSpy = sandbox.spy(adImpl, 'attemptCollapse');
        uiHandler.applyNoContentUI();
        expect(adAttemptCollapseSpy).to.not.be.called;
      });

      it('should try to collapse element first', () => {
        sandbox.stub(adImpl, 'getFallback').callsFake(() => {
          return true;
        });
        const fallbackSpy = sandbox
          .stub(adImpl, 'toggleFallback')
          .callsFake(() => {});
        const collapseSpy = sandbox
          .stub(adImpl, 'attemptCollapse')
          .callsFake(() => {
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
        const fallbackSpy = sandbox
          .stub(adImpl, 'toggleFallback')
          .callsFake(() => {});
        sandbox
          .stub(uiHandler.baseInstance_, 'attemptCollapse')
          .callsFake(() => {
            return Promise.reject();
          });
        sandbox
          .stub(uiHandler.baseInstance_, 'mutateElement')
          .callsFake(callback => {
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
        sandbox.stub(adImpl, 'getFallback').callsFake(() => {
          return false;
        });
        let resolve = null;
        const promise = new Promise(resolve_ => {
          resolve = resolve_;
        });
        sandbox.stub(adImpl, 'attemptCollapse').callsFake(() => {
          return Promise.reject();
        });
        sandbox.stub(adImpl, 'mutateElement').callsFake(callback => {
          callback();
          resolve();
        });
        sandbox.stub(adImpl, 'togglePlaceholder').callsFake(() => {});
        sandbox.stub(adImpl, 'toggleFallback').callsFake(() => {});
        uiHandler.applyNoContentUI();
        return promise.then(() => {
          const el = adImpl.element.querySelector('[fallback]');
          expect(el).to.be.ok;
          expect(el.children[0]).to.have.class('i-amphtml-ad-default-holder');
          expect(el.children[0]).to.have.attribute('data-ad-holder-text');
        });
      });

      describe('updateSize function', () => {
        it('should calculate take consideration of padding', () => {
          setStyles(adImpl.element, {
            width: '350px',
            height: '50px',
          });
          env.win.document.body.appendChild(adElement);
          sandbox
            .stub(adImpl, 'attemptChangeSize')
            .callsFake((height, width) => {
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
          sandbox
            .stub(adImpl, 'attemptChangeSize')
            .callsFake((height, width) => {
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
          sandbox.stub(adImpl, 'attemptChangeSize').callsFake(() => {
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
  }
);
