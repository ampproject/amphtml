import * as fakeTimers from '@sinonjs/fake-timers';

import {layoutRectLtwh} from '#core/dom/layout/rect';
import {setStyles} from '#core/dom/style';

import {Services} from '#service';
import {PositionObserver} from '#service/position-observer/position-observer-impl';
import {PositionObserverFidelity_Enum} from '#service/position-observer/position-observer-worker';

import {macroTask} from '#testing/helpers';

describes.realWin('PositionObserver', {amp: 1}, (env) => {
  let win;
  let ampdoc;
  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
  });

  describe('PositionObserver for AMP doc', () => {
    let posOb;
    let elem;
    let elem1;
    let clock;
    beforeEach(() => {
      clock = fakeTimers.withGlobal(ampdoc.win).install();
      posOb = new PositionObserver(ampdoc);
      env.sandbox.stub(posOb.vsync_, 'measure').callsFake((callback) => {
        win.setTimeout(callback, 1);
      });
      elem = win.document.createElement('div');
      win.document.body.appendChild(elem);
      setStyles(elem, {
        'position': 'absolute',
        'width': 1,
        'height': 1,
        'top': 0,
      });
      elem1 = win.document.createElement('div');
      win.document.body.appendChild(elem1);
      setStyles(elem1, {
        'position': 'absolute',
        'width': 1,
        'height': 1,
        'top': 0,
      });
    });

    afterEach(() => {
      clock.uninstall();
    });

    describe('API functions includes observe/unobserve/changeFidelity', () => {
      it('should observe identical element and start', () => {
        const spy = env.sandbox.spy(posOb, 'startCallback_');
        posOb.observe(elem, PositionObserverFidelity_Enum.LOW, () => {});
        posOb.observe(elem1, PositionObserverFidelity_Enum.LOW, () => {});
        expect(posOb.workers_).to.have.length(2);
        expect(spy).to.be.calledOnce;
      });

      it('should unobserve and stop', () => {
        const spy = env.sandbox.spy(posOb, 'stopCallback_');
        posOb.observe(elem, PositionObserverFidelity_Enum.LOW, () => {});
        posOb.observe(elem1, PositionObserverFidelity_Enum.LOW, () => {});
        posOb.unobserve(elem);
        expect(posOb.workers_).to.have.length(1);
        expect(spy).to.not.be.called;
        posOb.unobserve(elem1);
        expect(spy).to.be.calledOnce;
      });
    });

    describe('update position info at correct time', () => {
      let top;
      beforeEach(() => {
        top = 0;
        env.sandbox
          .stub(posOb.viewport_, 'getClientRectAsync')
          .callsFake(() => {
            return Promise.resolve(layoutRectLtwh(0, top, 0, 0));
          });
      });
      it('should update new position with scroll event', function* () {
        const spy = env.sandbox.spy();
        posOb.observe(elem, PositionObserverFidelity_Enum.HIGH, spy);
        clock.tick(2);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        spy.resetHistory();
        top++;
        win.dispatchEvent(new Event('scroll'));
        yield macroTask();
        expect(spy).to.be.calledOnce;
        spy.resetHistory();
        top++;
        clock.tick(1);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        // stop fire scroll update after 500ms timeout
        // Make the number larger to avoid window scroll event
        clock.tick(5001);
        spy.resetHistory();
        top++;
        clock.tick(1);
        yield macroTask();
        expect(spy).to.not.be.called;
      });

      it('should not update if element position does not change', function* () {
        const spy = env.sandbox.spy();
        posOb.observe(elem, PositionObserverFidelity_Enum.HIGH, spy);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        win.dispatchEvent(new Event('scroll'));
        yield macroTask();
        expect(spy).to.be.calledOnce;
      });
    });

    describe('should provide correct position data', () => {
      let top;
      beforeEach(() => {
        top = 0;
        env.sandbox
          .stub(posOb.viewport_, 'getClientRectAsync')
          .callsFake(() => {
            return Promise.resolve(layoutRectLtwh(2, top, 20, 10));
          });
      });

      it('overlap with viewport', function* () {
        const viewport = Services.viewportForDoc(ampdoc);
        const sizes = viewport.getSize();
        const spy = env.sandbox.spy();
        top = 1;
        posOb.observe(elem, PositionObserverFidelity_Enum.HIGH, spy);
        yield macroTask();
        expect(spy).to.be.calledWith({
          positionRect: layoutRectLtwh(2, 1, 20, 10),
          relativePos: 'inside',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
        spy.resetHistory();
        top = -5;
        posOb.updateAllEntries();
        yield macroTask();
        expect(spy).to.be.calledWith({
          positionRect: layoutRectLtwh(2, -5, 20, 10),
          relativePos: 'top',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
        spy.resetHistory();
        top = sizes.height - 5;
        posOb.updateAllEntries();
        yield macroTask();
        expect(spy).to.be.calledWith({
          positionRect: layoutRectLtwh(2, sizes.height - 5, 20, 10),
          relativePos: 'bottom',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
      });

      it('out of viewport', function* () {
        setStyles(elem, {
          'position': 'absolute',
          'top': '1px',
          'left': '2px',
          'width': '20px',
          'height': '10px',
        });
        const viewport = Services.viewportForDoc(ampdoc);
        const sizes = viewport.getSize();
        const spy = env.sandbox.spy();
        posOb.observe(elem, PositionObserverFidelity_Enum.HIGH, spy);
        yield macroTask();
        spy.resetHistory();
        top = -11;
        posOb.updateAllEntries();
        yield macroTask();
        expect(spy).to.be.calledWith({
          positionRect: null,
          relativePos: 'top',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
        spy.resetHistory();
        elem.style.top = sizes.height + 1;
        posOb.updateAllEntries();
        yield macroTask();
        expect(spy).to.not.be.called;
        top = 0;
        posOb.updateAllEntries();
        yield macroTask();
        expect(spy).to.be.calledWith({
          positionRect: layoutRectLtwh(2, 0, 20, 10),
          relativePos: 'inside',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
        spy.resetHistory();
        top = sizes.height + 5;
        posOb.updateAllEntries();
        yield macroTask();
        expect(spy).to.be.calledWith({
          positionRect: null,
          relativePos: 'bottom',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
      });
    });
  });
});
