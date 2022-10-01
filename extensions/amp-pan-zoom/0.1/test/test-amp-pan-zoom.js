import '../amp-pan-zoom';
import {htmlFor} from '#core/dom/static-template';
import {setStyles} from '#core/dom/style';

import {Services} from '#service';

import {listenOncePromise} from '#utils/event-helper';

import {createPointerEvent} from '#testing/helpers/service';

describes.realWin(
  'amp-pan-zoom',
  {
    amp: {
      extensions: ['amp-pan-zoom'],
    },
  },
  (env) => {
    let win;
    let doc;
    let el;
    let impl;
    let svg;

    const measureMutateElementStub = (measure, mutate) => {
      return Promise.resolve().then(measure).then(mutate);
    };

    /**
     * This function takes an object of attributes and constructs and builds
     * an amp-pan-zoom element and attaches it to the page. Assumes the contents
     * to be an SVG of width and height 300x300.
     * @param {Object} opt_attributes
     */
    function getPanZoom(opt_attributes) {
      el = htmlFor(doc)`
      <amp-pan-zoom layout="fixed" width ="300" height="400">
      </amp-pan-zoom>
    `;

      for (const key in opt_attributes) {
        el.setAttribute(key, opt_attributes[key]);
      }

      svg = htmlFor(doc)`
      <svg width="100" height="100">
        <rect width="100" height="100" fill="#95B3D7"></rect>
      </svg>
    `;

      el.appendChild(svg);
      doc.body.appendChild(el);
      return el
        .buildInternal()
        .then(() => el.getImpl(false))
        .then((aImpl) => {
          impl = aImpl;
          env.sandbox
            .stub(impl, 'measureMutateElement')
            .callsFake(measureMutateElementStub);
          env.sandbox
            .stub(impl, 'mutateElement')
            .callsFake((mutate) => measureMutateElementStub(undefined, mutate));
        });
    }

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      env.iframe.height = 500;
      env.iframe.width = 400;
    });

    it('should schedule layout of own children', () => {
      let scheduleLayoutSpy;
      return getPanZoom()
        .then(() => {
          scheduleLayoutSpy = env.sandbox.spy(
            Services.ownersForDoc(impl.element),
            'scheduleLayout'
          );
          el.layoutCallback();
        })
        .then(() => {
          expect(scheduleLayoutSpy).to.be.calledOnceWith(impl.element, svg);
        });
    });

    it('should size contents correctly', () => {
      return getPanZoom()
        .then(() => el.layoutCallback())
        .then(() => {
          expect(svg.clientWidth).to.equal(300);
          expect(svg.clientHeight).to.equal(300);
          expect(svg.getAttribute('class')).to.match(
            /i-amphtml-pan-zoom-child/
          );
          expect(el.className).to.match(/i-amphtml-pan-zoom/);
        });
    });

    it('should position and scale correctly based on initial values', () => {
      return getPanZoom({
        'initial-scale': '2',
        'initial-x': '10',
        'initial-y': '50',
      })
        .then(() => el.layoutCallback())
        .then(() => {
          expect(impl.startX_).to.equal(10);
          expect(impl.posX_).to.equal(10);
          expect(impl.startY_).to.equal(50);
          expect(impl.posY_).to.equal(50);
          expect(svg.style.transform).to.equal(
            'translate(10px, 50px) scale(2)'
          );
        });
    });

    it('should initialize all measured variables correctly', () => {
      return getPanZoom()
        .then(() => el.layoutCallback())
        .then(() => {
          expect(impl.startScale_).to.equal(1);
          expect(impl.startX_).to.equal(0);
          expect(impl.startY_).to.equal(0);
          expect(impl.sourceWidth_).to.equal(100);
          expect(impl.sourceHeight_).to.equal(100);
        });
    });

    it('should update pan and zoom bounds correctly', () => {
      return getPanZoom()
        .then(() => {
          el.getBoundingClientRect = () => {
            return {
              'top': 0,
              'left': 0,
              'height': 400,
              'width': 300,
            };
          };
          return el.layoutCallback();
        })
        .then(() => {
          expect(impl.elementBox_.height).to.equal(400);
          expect(impl.elementBox_.width).to.equal(300);
          expect(impl.contentBox_.height).to.equal(300);
          expect(impl.contentBox_.width).to.equal(300);

          expect(impl.minX_).to.equal(0);
          expect(impl.maxX_).to.equal(0);
          expect(impl.minY_).to.equal(0);
          expect(impl.maxY_).to.equal(0);

          impl.updatePanZoomBounds_(2);
          // (600 - 300) / 2
          expect(impl.minX_).to.equal(-150);
          expect(impl.maxX_).to.equal(150);
          // (600 - 400) / 2
          expect(impl.minY_).to.equal(-100);
          expect(impl.maxY_).to.equal(100);

          impl.updatePanZoomBounds_(3);
          // (900 - 300) / 2
          expect(impl.minX_).to.equal(-300);
          expect(impl.maxX_).to.equal(300);
          // (900 - 400) / 2
          expect(impl.minY_).to.equal(-250);
          expect(impl.maxY_).to.equal(250);
        });
    });

    it('should correctly update bounds with top-aligned content', () => {
      return getPanZoom({
        'style': 'display: initial',
      })
        .then(() => {
          el.getBoundingClientRect = () => {
            return {
              'top': 0,
              'left': 0,
              'height': 400,
              'width': 300,
            };
          };
          return el.layoutCallback();
        })
        .then(() => {
          expect(impl.minY_).to.equal(0);
          expect(impl.maxY_).to.equal(0);

          impl.updatePanZoomBounds_(2);
          expect(impl.minY_).to.equal(-50);
          expect(impl.maxY_).to.equal(150);

          impl.updatePanZoomBounds_(3);
          expect(impl.minY_).to.equal(-200);
          expect(impl.maxY_).to.equal(300);
        });
    });

    it('should correctly update bounds with left-aligned content', () => {
      return getPanZoom({
        'height': '300',
        'width': '400',
        'style': 'justify-content: start',
      })
        .then(() => {
          el.getBoundingClientRect = () => {
            return {
              'top': 0,
              'left': 0,
              'height': 300,
              'width': 400,
            };
          };
          return el.layoutCallback();
        })
        .then(() => {
          expect(impl.minY_).to.equal(0);
          expect(impl.maxY_).to.equal(0);

          impl.updatePanZoomBounds_(2);
          expect(impl.minX_).to.equal(-50);
          expect(impl.maxX_).to.equal(150);

          impl.updatePanZoomBounds_(3);
          expect(impl.minX_).to.equal(-200);
          expect(impl.maxX_).to.equal(300);
        });
    });

    // TODO(): unskip.
    it.skip('should correctly update bounds with bottom-aligned content', () => {
      return getPanZoom({
        'style': 'justify-content: start; flex-direction: column-reverse',
      })
        .then(() => {
          el.getBoundingClientRect = () => {
            return {
              'top': 0,
              'left': 0,
              'height': 400,
              'width': 300,
            };
          };
          return el.layoutCallback();
        })
        .then(() => {
          expect(impl.minY_).to.equal(0);
          expect(impl.maxY_).to.equal(0);

          impl.updatePanZoomBounds_(2);

          expect(impl.minY_).to.equal(-150);
          expect(impl.maxY_).to.equal(50);

          impl.updatePanZoomBounds_(3);
          expect(impl.minY_).to.equal(-300);
          expect(impl.maxY_).to.equal(200);
        });
    });

    it('should correctly update css after calling transform', () => {
      return getPanZoom()
        .then(() => el.layoutCallback())
        .then(() => impl.transform(10, 20, 2))
        .then(() => {
          expect(impl.posX_).to.equal(10);
          expect(impl.posY_).to.equal(20);
          expect(impl.scale_).to.equal(2);
          expect(svg.style.transform).to.equal(
            'translate(10px, 20px) scale(2)'
          );
        });
    });

    describe('reset-on-resize', () => {
      it('should clear inline width/height before measuring', async function () {
        await getPanZoom();
        await el.layoutCallback();
        expect(svg.style.width).to.equal('300px');
        expect(svg.style.height).to.equal('300px');
        setStyles(svg, {
          'width': '50px',
          'height': '400px',
        });
        expect(svg.style.width).to.equal('50px');
        expect(svg.style.height).to.equal('400px');
        await impl.resetContentDimensions_();
        expect(svg.style.width).to.equal('300px');
        expect(svg.style.height).to.equal('300px');
      });
    });

    describe('gestures', () => {
      it('should pan correctly via mouse when zoomed', async function () {
        await getPanZoom();
        await el.layoutCallback();
        await impl.transform(0, 0, 2);
        expect(svg.style.transform).to.equal('translate(0px, 0px) scale(2)');
        const mouseDown = createPointerEvent('mousedown', 10, 10);
        const mouseMove = createPointerEvent('mousemove', 20, 20);
        const mouseUp = createPointerEvent('mouseup', 20, 20);
        const transformEndPromise = listenOncePromise(el, 'transformEnd');
        el.dispatchEvent(mouseDown);
        el.dispatchEvent(mouseMove);
        el.dispatchEvent(mouseUp);
        await transformEndPromise;
        expect(svg.style.transform).to.equal('translate(10px, 10px) scale(2)');
      });
    });

    describe('transformEnd', () => {
      it('should trigger only once after double tap zoom', async function () {
        await getPanZoom();
        await el.layoutCallback();
        const transformEndPromise = listenOncePromise(el, 'transformEnd');
        const actionTriggerSpy = env.sandbox.spy(impl.action_, 'trigger');
        impl.handleDoubleTap({clientX: 10, clientY: 10});
        await transformEndPromise;
        expect(actionTriggerSpy).to.be.calledOnce;
      });

      it('should not trigger while pinch zooming', async function () {
        await getPanZoom();
        await el.layoutCallback();
        const actionTriggerSpy = env.sandbox.spy(impl.action_, 'trigger');
        await impl.handlePinch({
          centerClientX: 10,
          centerClientY: 10,
          deltaX: 10,
          deltaY: 10,
          dir: 1,
          last: false,
        });
        expect(actionTriggerSpy).not.to.be.called;
      });

      it('should trigger exactly once after pinch zoom ends', async function () {
        await getPanZoom();
        await el.layoutCallback();
        const transformEndPromise = listenOncePromise(el, 'transformEnd');
        const actionTriggerSpy = env.sandbox.spy(impl.action_, 'trigger');
        impl.handlePinch({
          centerClientX: 10,
          centerClientY: 10,
          deltaX: 10,
          deltaY: 10,
          dir: 1,
          last: true, // This indicates zoom ended
        });
        await transformEndPromise;
        expect(actionTriggerSpy).to.be.calledOnce;
      });

      it('should not trigger while panning', async function () {
        await getPanZoom();
        await el.layoutCallback();
        const actionTriggerSpy = env.sandbox.spy(impl.action_, 'trigger');
        await impl.handleSwipe({
          deltaX: 10,
          deltaY: 10,
          last: false,
          velocityX: 10,
          velocityY: 10,
        });
        expect(actionTriggerSpy).not.to.be.called;
      });

      it('should trigger exactly once after panning ends', async function () {
        await getPanZoom();
        await el.layoutCallback();
        const transformEndPromise = listenOncePromise(el, 'transformEnd');
        const actionTriggerSpy = env.sandbox.spy(impl.action_, 'trigger');
        impl.handleSwipe({
          deltaX: 10,
          deltaY: 10,
          last: true, // This indicates panning ended.
          velocityX: 10,
          velocityY: 10,
        });
        await transformEndPromise;
        expect(actionTriggerSpy).to.be.calledOnce;
      });
    });
  }
);
