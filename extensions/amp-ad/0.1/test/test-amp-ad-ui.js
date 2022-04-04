import {createElementWithAttributes} from '#core/dom';
import * as domQuery from '#core/dom/query';
import {setStyles} from '#core/dom/style';

import {macroTask} from '#testing/helpers';

import * as adHelper from '../../../../src/ad-helper';
import {BaseElement} from '../../../../src/base-element';
import {AmpAdUIHandler} from '../amp-ad-ui';

describes.realWin(
  'amp-ad-ui handler',
  {
    amp: {
      ampdoc: 'single',
    },
  },
  (env) => {
    let adImpl;
    let uiHandler;
    let adContainer;
    let adElement;

    beforeEach(() => {
      adElement = env.win.document.createElement('amp-ad');
      adElement.ampdoc_ = env.win.document;
      adImpl = new BaseElement(adElement);
      uiHandler = new AmpAdUIHandler(adImpl);
      env.sandbox.stub(adHelper, 'getAdContainer').callsFake(() => {
        return adContainer;
      });
      adContainer = null;
    });

    describe('applyNoContentUI', () => {
      it('should force collapse ad in sticky ad container', () => {
        adContainer = 'AMP-STICKY-AD';
        const attemptCollapseSpy = env.sandbox.spy(adImpl, 'attemptCollapse');
        const collapseSpy = env.sandbox
          .stub(adImpl, 'collapse')
          .callsFake(() => {});
        uiHandler.applyNoContentUI();
        expect(collapseSpy).to.be.calledOnce;
        expect(attemptCollapseSpy).to.not.be.called;
      });

      it(
        'should force collapse ad inside flying carpet, ' +
          'if it is the only and direct child of flying carpet',
        function* () {
          adContainer = 'AMP-FX-FLYING-CARPET';
          const attemptCollapseSpy = env.sandbox.spy(adImpl, 'attemptCollapse');
          const collapseSpy = env.sandbox
            .stub(adImpl, 'collapse')
            .callsFake(() => {});

          env.sandbox.stub(domQuery, 'ancestorElementsByTag').callsFake(() => {
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
        function* () {
          adContainer = 'AMP-FX-FLYING-CARPET';
          const attemptCollapseSpy = env.sandbox.spy(adImpl, 'attemptCollapse');
          const collapseSpy = env.sandbox
            .stub(adImpl, 'collapse')
            .callsFake(() => {});

          const otherElement = env.win.document.createElement('div');

          env.sandbox.stub(domQuery, 'ancestorElementsByTag').callsFake(() => {
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
        function* () {
          adContainer = 'AMP-FX-FLYING-CARPET';
          const attemptCollapseSpy = env.sandbox.spy(adImpl, 'attemptCollapse');
          const collapseSpy = env.sandbox
            .stub(adImpl, 'collapse')
            .callsFake(() => {});

          const otherElement = env.win.document.createElement('div');
          adElement.remove();
          otherElement.appendChild(adElement);

          env.sandbox.stub(domQuery, 'ancestorElementsByTag').callsFake(() => {
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
        const adAttemptCollapseSpy = env.sandbox.spy(adImpl, 'attemptCollapse');
        uiHandler.applyNoContentUI();
        expect(adAttemptCollapseSpy).to.not.be.called;
      });

      it('should try to collapse element first', () => {
        env.sandbox.stub(adImpl, 'getFallback').callsFake(() => {
          return true;
        });
        const fallbackSpy = env.sandbox
          .stub(adImpl, 'toggleFallback')
          .callsFake(() => {});
        const collapseSpy = env.sandbox
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
        const promise = new Promise((resolve_) => {
          resolve = resolve_;
        });
        const placeholderSpy = env.sandbox.spy(adImpl, 'togglePlaceholder');
        const fallbackSpy = env.sandbox
          .stub(adImpl, 'toggleFallback')
          .callsFake(() => {});
        env.sandbox
          .stub(uiHandler.baseInstance_, 'attemptCollapse')
          .callsFake(() => {
            return Promise.reject();
          });
        env.sandbox
          .stub(uiHandler.baseInstance_, 'mutateElement')
          .callsFake((callback) => {
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
        env.sandbox.stub(adImpl, 'getFallback').callsFake(() => {
          return false;
        });
        let resolve = null;
        const promise = new Promise((resolve_) => {
          resolve = resolve_;
        });
        env.sandbox.stub(adImpl, 'attemptCollapse').callsFake(() => {
          return Promise.reject();
        });
        env.sandbox.stub(adImpl, 'mutateElement').callsFake((callback) => {
          callback();
          resolve();
        });
        env.sandbox.stub(adImpl, 'togglePlaceholder').callsFake(() => {});
        env.sandbox.stub(adImpl, 'toggleFallback').callsFake(() => {});
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
          env.sandbox.stub(uiHandler, 'setSize_');
          env.sandbox
            .stub(adImpl, 'attemptChangeSize')
            .callsFake((height, width) => {
              expect(height).to.equal(100);
              expect(width).to.equal(450);
              return Promise.resolve();
            });
          return uiHandler.updateSize(100, 400, 50, 300, {}).then((sizes) => {
            expect(sizes).to.deep.equal({
              success: true,
              newWidth: 450,
              newHeight: 100,
            });
          });
        });

        it('should tolerate string input', () => {
          env.sandbox.stub(uiHandler, 'setSize_');
          env.sandbox
            .stub(adImpl, 'attemptChangeSize')
            .callsFake((height, width) => {
              expect(height).to.equal(100);
              expect(width).to.equal(400);
              return Promise.resolve();
            });
          return uiHandler.updateSize('100', 400, 0, 0, {}).then((sizes) => {
            expect(sizes).to.deep.equal({
              success: true,
              newWidth: 400,
              newHeight: 100,
            });
          });
        });

        it('should reject on special case undefined sizes', () => {
          const attemptChangeSizeSpy = env.sandbox.spy(
            adImpl,
            'attemptChangeSize'
          );
          return uiHandler
            .updateSize(undefined, undefined, 0, 0, {})
            .catch((e) => {
              expect(e.message).to.equal('undefined width and height');
              expect(attemptChangeSizeSpy).to.not.be.called;
            });
        });

        it('should reject on special case inside sticky ad', () => {
          adContainer = 'AMP-STICKY-AD';
          const attemptChangeSizeSpy = env.sandbox.spy(
            adImpl,
            'attemptChangeSize'
          );
          return uiHandler.updateSize(100, 400, 0, 0, {}).then((sizes) => {
            expect(sizes).to.deep.equal({
              success: false,
              newWidth: 400,
              newHeight: 100,
            });
            expect(attemptChangeSizeSpy).to.not.be.called;
          });
        });

        it('should reject on attemptChangeSize reject', () => {
          env.sandbox.stub(adImpl, 'attemptChangeSize').callsFake(() => {
            return Promise.reject();
          });
          return uiHandler.updateSize(100, 400, 0, 0, {}).then((sizes) => {
            expect(sizes).to.deep.equal({
              success: false,
              newWidth: 400,
              newHeight: 100,
            });
          });
        });
      });
    });

    describe('sticky ads', () => {
      it('should reject invalid sticky type', () => {
        expectAsyncConsoleError(/Invalid sticky ad type: invalid/, 1);
        adElement.setAttribute('sticky', 'invalid');
        const uiHandler = new AmpAdUIHandler(adImpl);
        expect(uiHandler.stickyAdPosition_).to.be.null;
      });

      it('should render close buttons', () => {
        expect(uiHandler.unlisteners_).to.be.empty;
        uiHandler.stickyAdPosition_ = 'bottom';
        uiHandler.maybeInitStickyAd();
        expect(uiHandler.unlisteners_.length).to.equal(1);
        expect(uiHandler.element_.querySelector('.amp-ad-close-button')).to.be
          .not.null;
      });

      it('top sticky ads shall cause scroll trigger', () => {
        uiHandler.stickyAdPosition_ = 'top';
        uiHandler.maybeInitStickyAd();
        expect(uiHandler.topStickyAdScrollListener_).to.not.be.undefined;
      });

      it('should refuse to load the second sticky ads', () => {
        for (let i = 0; i < 2; i++) {
          const adElement = env.win.document.createElement('amp-ad');
          adElement.setAttribute('sticky', 'top');
          adElement.setAttribute('class', 'i-amphtml-built');
          env.win.document.body.insertBefore(adElement, null);
        }
        allowConsoleError(() => {
          expect(() => {
            uiHandler.validateStickyAd();
          }).to.throw();
        });
      });
    });
  }
);
