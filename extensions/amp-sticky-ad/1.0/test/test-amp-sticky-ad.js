import '../../../amp-ad/0.1/amp-ad';
import '../amp-sticky-ad';
import {createElementWithAttributes} from '#core/dom';

import {Services} from '#service';

import {macroTask} from '#testing/helpers';
import {poll} from '#testing/iframe';

describes.realWin(
  'amp-sticky-ad 1.0 version',
  {
    win: {
      /* window spec */
      location: '...',
      historyOff: false,
    },
    amp: {
      /* amp spec */
      runtimeOn: false,
      extensions: ['amp-sticky-ad:1.0', 'amp-ad'],
    },
  },
  (env) => {
    let win;
    let ampStickyAd;
    let ampAd;
    let impl;
    let addToFixedLayerStub, addToFixedLayerPromise;
    const adUpgradedToCustomElementPromise = Promise.resolve();
    describe('with valid child 1.0', () => {
      beforeEach(async () => {
        win = env.win;
        ampStickyAd = win.document.createElement('amp-sticky-ad');
        ampStickyAd.setAttribute('layout', 'nodisplay');
        ampAd = createElementWithAttributes(win.document, 'amp-ad', {
          'type': '_ping_',
          'height': 50,
          'width': 300,
        });
        ampStickyAd.appendChild(ampAd);
        win.document.body.appendChild(ampStickyAd);
        ampStickyAd.buildInternal();
        impl = await ampStickyAd.getImpl(false);
        addToFixedLayerPromise = Promise.resolve();
        addToFixedLayerStub = env.sandbox
          .stub(impl.viewport_, 'addToFixedLayer')
          .callsFake(() => addToFixedLayerPromise);
      });

      it('should listen to scroll event', function* () {
        const spy = env.sandbox.spy(impl, 'removeOnScrollListener_');
        expect(impl.scrollUnlisten_).to.be.null;
        yield macroTask();
        // Hack to handle possible unexpected page scroll
        if (impl.scrollUnlisten_) {
          expect(impl.scrollUnlisten_).to.be.a('function');
        } else {
          expect(spy).to.be.calledOnce;
        }
      });

      it('should not build when scrollTop not greater than 1', async () => {
        const scheduleLayoutSpy = env.sandbox.spy(
          Services.ownersForDoc(impl.element),
          'scheduleLayout'
        );
        const removeOnScrollListenerSpy = env.sandbox.spy(
          impl,
          'removeOnScrollListener_'
        );
        const getScrollTopSpy = env.sandbox.spy();
        const getScrollHeightSpy = env.sandbox.spy();

        impl.viewport_.getScrollTop = function () {
          getScrollTopSpy();
          return 1;
        };
        impl.viewport_.getScrollHeight = function () {
          getScrollHeightSpy();
          return 300;
        };
        impl.onScroll_();
        await macroTask();
        expect(getScrollTopSpy).to.have.been.called;
        expect(scheduleLayoutSpy).to.not.have.been.called;
        expect(removeOnScrollListenerSpy).to.not.have.been.called;
      });

      it('should display once user scroll', () => {
        const scheduleLayoutSpy = env.sandbox
          .stub(impl, 'scheduleLayoutForAd_')
          .callsFake(() => {});
        const removeOnScrollListenerSpy = env.sandbox.spy(
          impl,
          'removeOnScrollListener_'
        );

        const getScrollTopStub = env.sandbox.stub(
          impl.viewport_,
          'getScrollTop'
        );
        getScrollTopStub.returns(2);
        const getSizeStub = env.sandbox.stub(impl.viewport_, 'getSize');
        getSizeStub.returns({
          height: 50,
        });
        const getScrollHeightStub = env.sandbox.stub(
          impl.viewport_,
          'getScrollHeight'
        );
        getScrollHeightStub.returns(300);

        impl.mutateElement = function (callback) {
          callback();
        };
        impl.vsync_.mutate = function (callback) {
          callback();
        };
        impl.adReadyPromise_ = Promise.resolve();

        impl.onScroll_();
        expect(removeOnScrollListenerSpy).to.have.been.called;
        // Layout on ad is called only after fixed layer is done.
        expect(scheduleLayoutSpy).to.not.have.been.called;
        return impl.adReadyPromise_.then(() => {
          expect(addToFixedLayerStub).to.have.been.calledOnce;
          return addToFixedLayerPromise.then(() => {
            expect(scheduleLayoutSpy).to.have.been.calledOnce;
          });
        });
      });

      it('should set body borderBottom correctly', () => {
        let borderWidth = win
          .getComputedStyle(win.document.body, null)
          .getPropertyValue('border-bottom-width');
        let borderStyle = win
          .getComputedStyle(win.document.body, null)
          .getPropertyValue('border-bottom-style');
        expect(borderWidth).to.equal('0px');
        expect(borderStyle).to.equal('none');

        impl.viewport_.updatePaddingBottom(50);
        return impl.viewport_.ampdoc.waitForBodyOpen().then(() => {
          borderWidth = win
            .getComputedStyle(win.document.body, null)
            .getPropertyValue('border-bottom-width');
          borderStyle = win
            .getComputedStyle(win.document.body, null)
            .getPropertyValue('border-bottom-style');
          expect(borderWidth).to.equal('50px');
          expect(borderStyle).to.equal('solid');
        });
      });

      it('should create a close button', () => {
        const addCloseButtonSpy = env.sandbox.spy(impl, 'addCloseButton_');
        env.sandbox.stub(impl, 'scheduleLayoutForAd_').callsFake(() => {});

        impl.viewport_.getScrollTop = function () {
          return 100;
        };
        impl.viewport_.getSize = function () {
          return {height: 50};
        };
        impl.viewport_.getScrollHeight = function () {
          return 300;
        };
        impl.mutateElement = function (callback) {
          callback();
        };
        impl.vsync_.mutate = function (callback) {
          callback();
        };

        impl.adReadyPromise_ = Promise.resolve();
        impl.display_();
        return impl.adReadyPromise_.then(() => {
          expect(addCloseButtonSpy).to.be.called;
          expect(impl.element.children[0]).to.be.not.null;
          expect(
            impl.element.children[0].classList.contains(
              'amp-sticky-ad-top-padding'
            )
          ).to.be.true;
          expect(impl.element.children[0].tagName).to.equal(
            'AMP-STICKY-AD-TOP-PADDING'
          );
          expect(impl.element.children[2]).to.be.not.null;
          expect(impl.element.children[2].tagName).to.equal('BUTTON');
        });
      });

      it('should wait for built and render-start signals', async () => {
        impl.vsync_.mutate = function (callback) {
          callback();
        };
        const layoutAdSpy = env.sandbox.spy(impl, 'layoutAd_');
        impl.scheduleLayoutForAd_();
        expect(layoutAdSpy).to.not.been.called;

        await adUpgradedToCustomElementPromise;
        const ad = impl.ad_;
        ad.signals().signal('built');
        await ad.signals().whenSignal('built');
        await macroTask();
        expect(layoutAdSpy).to.be.called;
        expect(ampStickyAd).to.not.have.attribute('visible');

        ad.signals().signal('render-start');
        await poll('visible attribute must be set', () =>
          ampStickyAd.hasAttribute('visible')
        );
      });

      it('should not allow container to be set semi-transparent', () => {
        ampStickyAd.setAttribute(
          'style',
          'background-color: rgba(55, 55, 55, 0.55) !important'
        );
        impl.vsync_.mutate = function (callback) {
          callback();
        };
        const layoutPromise = impl.layoutAd_();
        impl.ad_.signals().signal('render-start');
        return layoutPromise.then(() => {
          const bg = window
            .getComputedStyle(ampStickyAd)
            .getPropertyValue('background-color');
          return bg == 'rgb(55, 55, 55)';
        });
      });

      it('should not allow container to be set to transparent', () => {
        ampStickyAd.setAttribute(
          'style',
          'background-color: transparent !important'
        );
        impl.vsync_.mutate = function (callback) {
          callback();
        };
        const layoutPromise = impl.layoutAd_();
        impl.ad_.signals().signal('render-start');
        return layoutPromise.then(() => {
          const bg = window
            .getComputedStyle(ampStickyAd)
            .getPropertyValue('background-color');
          return bg == 'rgb(0, 0, 0)';
        });
      });
    });

    describe('with unvalid child 1.0', () => {
      let ampImg;
      let ampAd1;
      let ampAd2;
      beforeEach(() => {
        win = env.win;
        ampStickyAd = win.document.createElement('amp-sticky-ad');
        ampStickyAd.setAttribute('layout', 'nodisplay');
        ampImg = win.document.createElement('amp-img');
        ampImg.setAttribute('layout', 'nodisplay');
        ampAd1 = createElementWithAttributes(win.document, 'amp-ad', {
          'type': '_ping_',
          'height': 50,
          'width': 300,
        });
        ampAd2 = createElementWithAttributes(win.document, 'amp-ad', {
          'type': '_ping_',
          'height': 50,
          'width': 300,
        });
        win.document.body.appendChild(ampStickyAd);
      });

      it('should not build when child is not ad', async () => {
        ampStickyAd.appendChild(ampImg);
        const impl = await ampStickyAd.getImpl(false);
        allowConsoleError(() => {
          expect(() => impl.buildCallback()).to.throw(
            /amp-sticky-ad must have a single amp-ad child/
          );
        });
      });

      it('should not build when has more than 1 children', async () => {
        ampStickyAd.appendChild(ampAd1);
        ampStickyAd.appendChild(ampAd2);
        const impl = await ampStickyAd.getImpl(false);

        allowConsoleError(() => {
          expect(() => impl.buildCallback()).to.throw(
            /amp-sticky-ad must have a single amp-ad child/
          );
        });
      });
    });
  }
);

describes.realWin(
  'amp-sticky-ad 1.0 with real ad child',
  {
    win: {
      /* window spec */
      location: '...',
      historyOff: false,
    },
    amp: {
      /* amp spec */
      runtimeOn: false,
      extensions: ['amp-sticky-ad:1.0', 'amp-ad'],
    },
  },
  (env) => {
    let win;
    let ampStickyAd;
    let impl;
    let addToFixedLayerPromise;
    beforeEach(async () => {
      win = env.win;
      ampStickyAd = win.document.createElement('amp-sticky-ad');
      ampStickyAd.setAttribute('layout', 'nodisplay');
      const ampAd = createElementWithAttributes(win.document, 'amp-ad', {
        'type': '_ping_',
        'height': 50,
        'width': 200,
      });
      ampStickyAd.appendChild(ampAd);
      win.document.body.appendChild(ampStickyAd);
      ampStickyAd.buildInternal();
      impl = await ampStickyAd.getImpl(false);
      addToFixedLayerPromise = Promise.resolve();
      env.sandbox
        .stub(impl.viewport_, 'addToFixedLayer')
        .callsFake(() => addToFixedLayerPromise);
      return impl.upgradeCallback();
    });

    // TODO(zhouyx, #18574): Fix failing borderWidth check and re-enable.
    it.skip('close button should close ad and reset body borderBottom', () => {
      impl.viewport_.getScrollTop = function () {
        return 100;
      };
      impl.viewport_.getSize = function () {
        return {height: 50};
      };
      impl.viewport_.getScrollHeight = function () {
        return 300;
      };
      impl.mutateElement = function (callback) {
        callback();
      };
      impl.vsync_.mutate = function (callback) {
        callback();
      };
      env.sandbox.defineProperty(impl.element, 'offsetHeight', {value: 20});

      impl.display_();
      impl.ad_.signals().signal('built');
      impl.ad_.signals().signal('load-end');
      const layoutPromise = impl.layoutAd_();
      const bodyPromise = impl.viewport_.ampdoc.waitForBodyOpen();
      const p = Promise.all([
        addToFixedLayerPromise,
        layoutPromise,
        bodyPromise,
      ]);
      return p.then(() => {
        let borderWidth = win
          .getComputedStyle(win.document.body, null)
          .getPropertyValue('border-bottom-width');
        expect(borderWidth).to.equal('54px');
        expect(impl.element.children[2]).to.be.not.null;
        impl.element.children[2].dispatchEvent(new Event('click'));
        return impl.viewport_.ampdoc.waitForBodyOpen().then(() => {
          borderWidth = win
            .getComputedStyle(win.document.body, null)
            .getPropertyValue('border-bottom-width');
          expect(borderWidth).to.equal('0px');
        });
      });
    });

    // TODO(zhouyx, #18574): Fix failing borderWidth check and re-enable.
    it.skip('should collapse and reset borderBottom when its child do', () => {
      impl.viewport_.getScrollTop = function () {
        return 100;
      };
      impl.viewport_.getSize = function () {
        return {height: 50};
      };
      impl.viewport_.getScrollHeight = function () {
        return 300;
      };
      impl.mutateElement = function (callback) {
        callback();
      };
      impl.vsync_.mutate = function (callback) {
        callback();
      };
      env.sandbox.defineProperty(impl.element, 'offsetHeight', {value: 20});

      impl.display_();
      impl.ad_.signals().signal('built');
      impl.ad_.signals().signal('load-end');
      const layoutPromise = impl.layoutAd_();
      const bodyPromise = impl.viewport_.ampdoc.waitForBodyOpen();
      const p = Promise.all([
        addToFixedLayerPromise,
        layoutPromise,
        bodyPromise,
      ]);
      return p.then(() => {
        let borderWidth = win
          .getComputedStyle(win.document.body, null)
          .getPropertyValue('border-bottom-width');
        expect(borderWidth).to.equal('54px');
        impl.collapsedCallback();
        return impl.viewport_.ampdoc.waitForBodyOpen().then(() => {
          borderWidth = win
            .getComputedStyle(win.document.body, null)
            .getPropertyValue('border-bottom-width');
          expect(borderWidth).to.equal('0px');
          expect(ampStickyAd).to.have.display('none');
        });
      });
    });
  }
);
