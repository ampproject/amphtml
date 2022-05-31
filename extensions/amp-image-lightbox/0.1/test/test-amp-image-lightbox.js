import '../amp-image-lightbox';
import * as fakeTimers from '@sinonjs/fake-timers';

import {ActionTrust_Enum} from '#core/constants/action-constants';
import {Keys_Enum} from '#core/constants/key-codes';
import * as dom from '#core/dom';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {parseSrcset} from '#core/dom/srcset';
import {WindowInterface} from '#core/window/interface';

import {Services} from '#service';
import {ActionService} from '#service/action-impl';

import {ImageViewer} from '../amp-image-lightbox';

describes.realWin(
  'amp-image-lightbox component',
  {
    amp: {
      extensions: ['amp-image-lightbox'],
      runtimeOn: true,
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getImageLightbox() {
      const el = doc.createElement('amp-image-lightbox');
      el.setAttribute('layout', 'nodisplay');
      doc.body.appendChild(el);
      return el
        .buildInternal()
        .then(() => el.layoutCallback())
        .then(() => el);
    }

    it('should not render if not activated', () => {
      return getImageLightbox().then((lightbox) => {
        const container = lightbox.querySelector(
          '.i-amphtml-image-lightbox-container'
        );
        expect(container).to.equal(null);
      });
    });

    it('should render correctly', async () => {
      const lightbox = await getImageLightbox();
      const impl = await lightbox.getImpl(false);

      const noop = () => {};
      impl.getViewport = () => ({
        onChanged: noop,
        enterLightboxMode: noop,
      });
      impl.getHistory_ = () => ({
        push: () => Promise.resolve(),
      });
      impl.enter_ = noop;

      const ampImage = doc.createElement('amp-img');
      ampImage.setAttribute('src', 'data:');
      impl.open_({caller: ampImage});

      const container = lightbox.querySelector(
        '.i-amphtml-image-lightbox-container'
      );
      expect(container).to.not.be.null;

      const caption = container.querySelector(
        '.i-amphtml-image-lightbox-caption'
      );
      expect(caption).to.not.be.null;
      expect(caption).to.have.class('amp-image-lightbox-caption');

      const viewer = container.querySelector(
        '.i-amphtml-image-lightbox-viewer'
      );
      expect(viewer).to.not.be.null;

      const image = viewer.querySelector(
        '.i-amphtml-image-lightbox-viewer-image'
      );
      expect(image).to.not.be.null;

      // Very important. Image must have transform-origin=50% 50%.
      const win = image.ownerDocument.defaultView;
      expect(win.getComputedStyle(image)['transform-origin']).to.equal(
        '50% 50%'
      );
    });

    it('should render correctly with an img element', async () => {
      const lightbox = await getImageLightbox();
      const impl = await lightbox.getImpl(false);

      const noop = () => {};
      impl.getViewport = () => ({
        onChanged: noop,
        enterLightboxMode: noop,
      });
      impl.getHistory_ = () => ({
        push: () => Promise.resolve(),
      });
      impl.enter_ = noop;

      const img = doc.createElement('img');
      img.setAttribute('src', 'data:');
      impl.open_({caller: img});

      const container = lightbox.querySelector(
        '.i-amphtml-image-lightbox-container'
      );
      expect(container).to.not.be.null;

      const caption = container.querySelector(
        '.i-amphtml-image-lightbox-caption'
      );
      expect(caption).to.not.be.null;
      expect(caption).to.have.class('amp-image-lightbox-caption');

      const viewer = container.querySelector(
        '.i-amphtml-image-lightbox-viewer'
      );
      expect(viewer).to.not.be.null;

      const image = viewer.querySelector(
        '.i-amphtml-image-lightbox-viewer-image'
      );
      expect(image).to.not.be.null;

      // Very important. Image must have transform-origin=50% 50%.
      const win = image.ownerDocument.defaultView;
      expect(win.getComputedStyle(image)['transform-origin']).to.equal(
        '50% 50%'
      );
    });

    it('should activate all steps', async () => {
      const lightbox = await getImageLightbox();
      const impl = await lightbox.getImpl(false);

      const viewportOnChanged = env.sandbox.spy();
      const enterLightboxMode = env.sandbox.spy();
      const leaveLightboxMode = env.sandbox.spy();
      impl.getViewport = () => {
        return {
          onChanged: viewportOnChanged,
          enterLightboxMode,
          leaveLightboxMode,
        };
      };
      const historyPush = env.sandbox.spy();
      impl.getHistory_ = () => {
        return {
          push: () => {
            historyPush();
            return Promise.resolve(11);
          },
        };
      };
      const enter = env.sandbox.spy();
      impl.enter_ = enter;

      const ampImage = doc.createElement('amp-img');
      ampImage.setAttribute('src', 'data:');
      impl.open_({caller: ampImage});

      expect(viewportOnChanged).to.be.calledOnce;
      expect(impl.unlistenViewport_).to.not.equal(null);
      expect(historyPush).to.be.calledOnce;
      expect(enter).to.be.calledOnce;
      expect(impl.sourceElement_).to.equal(ampImage);
      expect(enterLightboxMode).to.be.calledOnce;
      expect(leaveLightboxMode).to.have.not.been.called;
    });

    it('should deactivate all steps', async () => {
      const lightbox = await getImageLightbox();
      const impl = await lightbox.getImpl(false);

      impl.active_ = true;
      impl.historyId_ = 11;
      const viewportOnChangedUnsubscribed = env.sandbox.spy();
      impl.unlistenViewport_ = viewportOnChangedUnsubscribed;
      const enterLightboxMode = env.sandbox.spy();
      const leaveLightboxMode = env.sandbox.spy();
      impl.getViewport = () => {
        return {enterLightboxMode, leaveLightboxMode};
      };
      const historyPop = env.sandbox.spy();
      impl.getHistory_ = () => {
        return {pop: historyPop};
      };
      const exit = env.sandbox.spy();
      impl.exit_ = exit;

      impl.close();

      expect(impl.active_).to.equal(false);
      expect(exit).to.be.calledOnce;
      expect(viewportOnChangedUnsubscribed).to.be.calledOnce;
      expect(impl.unlistenViewport_).to.equal(null);
      expect(leaveLightboxMode).to.be.calledOnce;
      expect(enterLightboxMode).to.have.not.been.called;
      expect(historyPop).to.be.calledOnce;
    });

    it('should close on ESC', async () => {
      const lightbox = await getImageLightbox();
      const impl = await lightbox.getImpl(false);

      const setupCloseSpy = env.sandbox.spy(impl, 'close');
      const nullAddEventListenerSpy = env.sandbox
        .spy(impl.win.document.documentElement, 'addEventListener')
        .withArgs('keydown', null);
      const viewportOnChanged = env.sandbox.spy();
      const enterLightboxMode = env.sandbox.spy();
      const leaveLightboxMode = env.sandbox.spy();
      impl.getViewport = () => {
        return {
          onChanged: viewportOnChanged,
          enterLightboxMode,
          leaveLightboxMode,
        };
      };
      const historyPush = env.sandbox.spy();
      impl.getHistory_ = () => {
        return {
          push: () => {
            historyPush();
            return Promise.resolve(11);
          },
        };
      };
      const enter = env.sandbox.spy();
      impl.enter_ = enter;

      const ampImage = doc.createElement('amp-img');
      ampImage.setAttribute('src', 'data:');
      ampImage.setAttribute('width', '100');
      ampImage.setAttribute('height', '100');
      impl.open_({caller: ampImage});
      impl.closeOnEscape_(
        new KeyboardEvent('keydown', {key: Keys_Enum.ESCAPE})
      );
      expect(setupCloseSpy).to.be.calledOnce;

      // Regression test: ensure escape event listener is bound properly
      expect(nullAddEventListenerSpy).to.have.not.been.called;
      impl.open_({caller: ampImage});
      expect(nullAddEventListenerSpy).to.have.not.been.called;
    });

    // Accessibility
    it('should return focus to source element after close', async () => {
      const lightbox = await getImageLightbox();
      const impl = await lightbox.getImpl(false);

      impl.enter_ = () => {};
      impl.getHistory_ = () => {
        return {
          pop: () => {},
          push: () => Promise.resolve(11),
        };
      };

      const tryFocus = env.sandbox.spy(dom, 'tryFocus');

      const sourceElement = doc.createElement('amp-img');
      sourceElement.setAttribute('src', 'data:');

      impl.open_({caller: sourceElement});
      impl.close();

      expect(tryFocus).to.be.calledOnce;
    });

    it('should allow default actions in email documents', async () => {
      env.win.document.documentElement.setAttribute('amp4email', '');
      const action = new ActionService(env.ampdoc, env.win.document);
      env.sandbox.stub(Services, 'actionServiceForDoc').returns(action);

      const element = dom.createElementWithAttributes(
        env.win.document,
        'amp-image-lightbox',
        {'layout': 'nodisplay'}
      );
      env.win.document.body.appendChild(element);
      env.sandbox.spy(element, 'enqueAction');
      env.sandbox.stub(element, 'getDefaultActionAlias');
      await whenUpgradedToCustomElement(element);

      const impl = await element.getImpl();
      env.sandbox.stub(impl, 'open_');
      action.execute(
        element,
        'open',
        null,
        'source',
        'caller',
        'event',
        ActionTrust_Enum.HIGH
      );
      expect(element.enqueAction).to.be.calledWith(
        env.sandbox.match({
          actionEventType: '?',
          args: null,
          caller: 'caller',
          event: 'event',
          method: 'open',
          node: element,
          source: 'source',
          trust: ActionTrust_Enum.HIGH,
        })
      );
      expect(impl.open_).to.be.calledOnce;
    });
  }
);

describes.realWin(
  'amp-image-lightbox image viewer',
  {
    amp: {
      extensions: ['amp-image-lightbox'],
    },
  },
  (env) => {
    let win, doc;
    let clock;
    let lightbox;
    let lightboxMock;
    let imageViewer;
    let loadPromiseStub;

    const sourceElement = {
      tagName: 'amp-img',
      offsetWidth: 101,
      offsetHeight: 201,
      getAttribute: (name) => {
        if (name == 'src') {
          return 'image1';
        }
        return undefined;
      },
      hasAttribute: () => undefined,
      getImpl: () => Promise.resolve({}),
    };

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      clock = fakeTimers.withGlobal(win).install();

      env.sandbox.stub(WindowInterface, 'getDevicePixelRatio').returns(1);
      lightbox = {
        element: {
          ownerDocument: doc,
        },
      };
      lightboxMock = env.sandbox.mock(lightbox);
      loadPromiseStub = env.sandbox.stub().returns(Promise.resolve());

      env.sandbox
        .stub(Services.timerFor(win), 'promise')
        .returns(Promise.resolve());
      imageViewer = new ImageViewer(lightbox, win, loadPromiseStub);
      doc.body.appendChild(imageViewer.getElement());
    });

    afterEach(() => {
      clock.uninstall();
      doc.body.removeChild(imageViewer.getElement());
      lightboxMock.verify();
    });

    it('should have 0 initial dimensions', () => {
      expect(imageViewer.getImage().src).to.equal('');
      expect(imageViewer.getViewerBox().width).to.equal(0);
      expect(imageViewer.getImageBox().width).to.equal(0);
      expect(imageViewer.sourceWidth_).to.equal(0);
      expect(imageViewer.sourceHeight_).to.equal(0);
    });

    it('should init to the source element without image', () => {
      imageViewer.init(sourceElement, null);
      expect(imageViewer.sourceWidth_).to.equal(101);
      expect(imageViewer.sourceHeight_).to.equal(201);
      expect(imageViewer.getImage().src).to.equal('');
    });

    it('should init to the source element with unloaded image', () => {
      const sourceImage = {
        complete: false,
        src: 'image1-smaller',
      };
      imageViewer.init(sourceElement, sourceImage);

      expect(imageViewer.getImage().src).to.equal('');
    });

    it('should init to the source element with loaded image', () => {
      const sourceImage = {
        complete: true,
        src: 'image1-smaller',
      };
      imageViewer.init(sourceElement, sourceImage);

      expect(imageViewer.getImage().getAttribute('src')).to.equal(
        'image1-smaller'
      );
    });

    it('should reset', () => {
      imageViewer.sourceWidth_ = 101;
      imageViewer.sourceHeight_ = 201;
      imageViewer.getImage().setAttribute('src', 'image1');

      imageViewer.reset();

      expect(imageViewer.sourceWidth_).to.equal(0);
      expect(imageViewer.sourceHeight_).to.equal(0);
      expect(imageViewer.getImage().getAttribute('src')).to.equal('');
      expect(imageViewer.srcset_).to.equal(null);
      expect(imageViewer.imageBox_.width).to.equal(0);
    });

    it('should measure horiz aspect ratio and assign image.src', () => {
      imageViewer.getElement().style.width = '100px';
      imageViewer.getElement().style.height = '200px';
      imageViewer.srcset_ = parseSrcset('image1');
      imageViewer.sourceWidth_ = 80;
      imageViewer.sourceHeight_ = 60;

      const promise = imageViewer.measure();

      expect(imageViewer.viewerBox_.width).to.equal(100);
      expect(imageViewer.viewerBox_.height).to.equal(200);

      expect(imageViewer.imageBox_.width).to.equal(100);
      expect(imageViewer.imageBox_.height).to.equal(75);
      expect(imageViewer.imageBox_.left).to.equal(0);
      expect(imageViewer.imageBox_.top).to.be.closeTo(62.5, 1);

      expect(imageViewer.getImage().style.left).to.equal('0px');
      expect(imageViewer.getImage().style.top).to.equal('63px');
      expect(imageViewer.getImage().style.width).to.equal('100px');
      expect(imageViewer.getImage().style.height).to.equal('75px');

      clock.tick(10);
      const checkSrc = () => {
        expect(imageViewer.getImage().getAttribute('src')).to.equal('image1');
      };
      return promise.then(checkSrc, checkSrc);
    });

    it('should measure vert aspect ratio but small height', () => {
      imageViewer.getElement().style.width = '100px';
      imageViewer.getElement().style.height = '200px';
      imageViewer.srcset_ = parseSrcset('image1');
      imageViewer.sourceWidth_ = 80;
      imageViewer.sourceHeight_ = 120;

      imageViewer.measure();
      expect(imageViewer.imageBox_.width).to.equal(100);
      expect(imageViewer.imageBox_.height).to.equal(150);
      expect(imageViewer.imageBox_.left).to.equal(0);
      expect(imageViewer.imageBox_.top).to.be.closeTo(25, 1);
    });

    it('should measure vert aspect ratio but high height', () => {
      imageViewer.getElement().style.width = '100px';
      imageViewer.getElement().style.height = '200px';
      imageViewer.srcset_ = parseSrcset('image1');
      imageViewer.sourceWidth_ = 40;
      imageViewer.sourceHeight_ = 100;

      imageViewer.measure();
      expect(imageViewer.imageBox_.width).to.be.closeTo(80, 1);
      expect(imageViewer.imageBox_.height).to.equal(200);
      expect(imageViewer.imageBox_.left).to.be.closeTo(10, 1);
      expect(imageViewer.imageBox_.top).to.equal(0);
    });

    it('should use the load function passed in when switching images', () => {
      expect(loadPromiseStub).to.have.not.been.called;
      imageViewer.getElement().style.width = '100px';
      imageViewer.getElement().style.height = '200px';
      imageViewer.srcset_ = parseSrcset('image1');
      imageViewer.sourceWidth_ = 80;
      imageViewer.sourceHeight_ = 60;
      return imageViewer.measure().then(() => {
        expect(loadPromiseStub).to.be.calledOnce;
      });
    });
  }
);

describes.realWin(
  'amp-image-lightbox image viewer gestures',
  {
    amp: {
      extensions: ['amp-image-lightbox'],
    },
  },
  (env) => {
    let win, doc;
    let lightbox;
    let lightboxMock;
    let imageViewer;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      env.sandbox.stub(WindowInterface, 'getDevicePixelRatio').returns(1);
      lightbox = {
        close: () => {},
        toggleViewMode: () => {},
        element: {
          ownerDocument: doc,
        },
      };
      lightboxMock = env.sandbox.mock(lightbox);

      imageViewer = new ImageViewer(lightbox, win);
      doc.body.appendChild(imageViewer.getElement());

      imageViewer.getElement().style.width = '100px';
      imageViewer.getElement().style.height = '200px';
      imageViewer.srcset_ = parseSrcset('image1');
      imageViewer.sourceWidth_ = 100;
      imageViewer.sourceHeight_ = 80;
      imageViewer.measure();
    });

    afterEach(() => {
      doc.body.removeChild(imageViewer.getElement());
      lightboxMock.verify();
    });

    it('should have initial bounds', () => {
      expect(imageViewer.minX_).to.equal(0);
      expect(imageViewer.maxX_).to.equal(0);
      expect(imageViewer.minY_).to.equal(0);
      expect(imageViewer.maxY_).to.equal(0);
    });

    it('should update bounds but fits Y-axis', () => {
      imageViewer.updatePanZoomBounds_(2);
      expect(imageViewer.minX_).to.equal(-50);
      expect(imageViewer.maxX_).to.equal(50);
      expect(imageViewer.minY_).to.equal(0);
      expect(imageViewer.maxY_).to.equal(0);
    });

    it('should update bounds and covers both axis', () => {
      imageViewer.updatePanZoomBounds_(3);
      expect(imageViewer.minX_).to.equal(-100);
      expect(imageViewer.maxX_).to.equal(100);
      expect(imageViewer.minY_).to.equal(-20);
      expect(imageViewer.maxY_).to.equal(20);
    });

    it('should pan on swipe', () => {
      imageViewer.updatePanZoomBounds_(2);
      imageViewer.onMove_(-25, -25, false);

      // X is within the bounds and Y is within the extent.
      expect(imageViewer.posX_).to.equal(-25);
      expect(imageViewer.posY_).to.equal(-25);

      // Start X/Y don't change until release
      expect(imageViewer.startX_).to.equal(0);
      expect(imageViewer.startY_).to.equal(0);
    });

    it('should correct pan on swipe within bounds', () => {
      imageViewer.updatePanZoomBounds_(2);
      imageViewer.onMove_(-100, -100, false);

      // X and Y are constrained by the bounds.
      expect(imageViewer.posX_).to.equal(-50);
      expect(imageViewer.posY_).to.equal(-50);
    });

    it('should cancel lightbox when pulled down at scale = 1', () => {
      lightboxMock.expects('close').once();
      imageViewer.onMove_(0, -100, false);
      imageViewer.onMoveRelease_(0, 0.5);
    });

    it('should zoom step', () => {
      imageViewer.onZoomInc_(10, 10, -10, -10);

      expect(imageViewer.posX_).to.be.closeTo(6.5, 1e-1);
      expect(imageViewer.posY_).to.equal(0);
      expect(imageViewer.scale_).to.be.closeTo(1.1, 1e-1);

      // Start X/Y/scale don't change until release
      expect(imageViewer.startX_).to.equal(0);
      expect(imageViewer.startY_).to.equal(0);
      expect(imageViewer.startScale_).to.equal(1);
    });

    it('should zoom release', () => {
      const updateSrc = env.sandbox.spy();
      imageViewer.updateSrc_ = updateSrc;
      imageViewer.onZoomInc_(10, 10, -10, -10);
      return imageViewer.onZoomRelease_(10, 10, -10, -10, 0, 0).then(() => {
        expect(updateSrc).to.be.calledOnce;
        expect(imageViewer.posX_).to.be.closeTo(6.5, 1e-1);
        expect(imageViewer.startX_).to.be.closeTo(6.5, 1e-1);
        expect(imageViewer.posY_).to.equal(0);
        expect(imageViewer.startY_).to.equal(0);
        expect(imageViewer.scale_).to.be.closeTo(1.1, 1e-1);
        expect(imageViewer.startScale_).to.be.closeTo(1.1, 1e-1);
      });
    });
  }
);
