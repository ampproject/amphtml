/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
  PositionObserver,
} from '../../src/service/position-observer/position-observer-impl';
import {
  PositionObserverFidelity,
} from '../../src/service/position-observer/position-observer-fidelity';
import {
  PosObAmpdocHostInterface,
} from '../../src/service/position-observer/position-observer-host-interface';
import {layoutRectLtwh} from '../../src/layout-rect';
import {Services} from '../../src/services';
import {setStyles} from '../../src/style';
import * as lolex from 'lolex';

describes.realWin('PositionObserver', {amp: 1}, env => {
  let win;
  let ampdoc;
  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
  });

  describe('PositionObserver for AMP doc', () => {
    let posOb;
    let host;
    let elem;
    let elem1;
    let clock;
    beforeEach(() => {
      host = new PosObAmpdocHostInterface(ampdoc);
      const vsync = Services.vsyncFor(ampdoc.win);
      clock = lolex.install(win);
      sandbox.stub(vsync, 'measure', callback => {
        win.setTimeout(callback, 1);
      });
      posOb = new PositionObserver(
          win, Services.vsyncFor(ampdoc.win), host);
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

    describe('API functions includes observe/unobserve/changeFidelity', () => {
      it('should observe identical element and start', () => {
        const spy = sandbox.spy(posOb, 'startCallback_');
        posOb.observe(elem, PositionObserverFidelity.LOW, () => {});
        posOb.observe(elem1, PositionObserverFidelity.LOW, () => {});
        expect(posOb.entries_).to.have.length(2);
        expect(spy).to.be.calledOnce;
      });

      it('should change fidelity', () => {
        posOb.observe(elem, PositionObserverFidelity.LOW, () => {});
        expect(posOb.entries_[0].fidelity).to.equal(
            PositionObserverFidelity.LOW);
        posOb.changeFidelity(elem, PositionObserverFidelity.HIGH);
        expect(posOb.entries_[0].fidelity).to.equal(
            PositionObserverFidelity.HIGH);
        expect(posOb.entries_[0].turn).to.equal(0);
      });

      it('should unobserve and stop', () => {
        const spy = sandbox.spy(posOb, 'stopCallback_');
        posOb.observe(elem, PositionObserverFidelity.LOW, () => {});
        posOb.observe(elem1, PositionObserverFidelity.LOW, () => {});
        posOb.unobserve(elem);
        expect(posOb.entries_).to.have.length(1);
        expect(spy).to.not.be.called;
        posOb.unobserve(elem1);
        expect(spy).to.be.calledOnce;
      });
    });

    describe('update position info at correct time', () => {
      it('should update new position with scroll event', () => {
        const spy = sandbox.spy();
        posOb.observe(elem, PositionObserverFidelity.HIGH, spy);
        clock.tick(2);
        spy.reset();
        const scrollEvent = new Event('scroll');
        win.dispatchEvent(scrollEvent);
        elem.style.top = '1px';
        clock.tick(1);
        expect(spy).to.be.calledOnce;
        elem.style.top = '2px';
        clock.tick(1);
        expect(spy).to.be.calledTwice;
        // stop fire scroll update after 500ms timeout
        // Make the number larger to avoid window scroll event
        clock.tick(5001);
        spy.reset();
        elem.style.top = '3px';
        clock.tick(1);
        expect(spy).to.not.be.called;
      });

      it.skip('should update new position with resize event', () => {
        const spy = sandbox.spy();
        posOb.observe(elem, PositionObserverFidelity.HIGH, spy);
        const spy1 = sandbox.spy();
        posOb.observe(elem1, PositionObserverFidelity.HIGH, spy1);
        clock.tick(1);
        spy.reset();
        spy1.reset();
        //expect(spy).to.be.calledOnce;
        elem.style.top = '1px';
        elem1.style.top = '1px';
        const resizeEvent = new Event('resize');
        ampdoc.win.dispatchEvent(resizeEvent);
        clock.tick(1);
        expect(spy).to.be.calledOnce;
        expect(spy1).to.be.calledOnce;
      });

      it('should not update if element position does not change', () => {
        const spy = sandbox.spy();
        posOb.observe(elem, PositionObserverFidelity.HIGH, spy);
        const spy1 = sandbox.spy();
        posOb.observe(elem1, PositionObserverFidelity.HIGH, spy1);
        clock.tick(1);
        const scrollEvent = new Event('scroll');
        win.dispatchEvent(scrollEvent);
        elem.style.top = '1px';
        clock.tick(1);
        expect(spy).to.be.calledTwice;
        expect(spy1).to.be.calledOnce;
      });
    });

    describe('should provide correct position data', () => {
      it('overlap with viewport', () => {
        setStyles(elem, {
          'position': 'absolute',
          'top': '1px',
          'left': '2px',
          'width': '20px',
          'height': '10px',
        });
        const viewport = Services.viewportForDoc(ampdoc);
        const sizes = viewport.getSize();
        const spy = sandbox.spy();
        posOb.observe(elem, PositionObserverFidelity.HIGH, spy);
        clock.tick(1);
        expect(spy).to.be.calledWith({
          positionRect: layoutRectLtwh(2, 1, 20, 10),
          relativePos: 'inside',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
        spy.reset();
        elem.style.top = '-5px';
        posOb.updateAllEntries();
        expect(spy).to.be.calledWith({
          positionRect: layoutRectLtwh(2, -5, 20, 10),
          relativePos: 'top',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
        spy.reset();
        elem.style.top = `${sizes.height - 5}px`;
        posOb.updateAllEntries();
        expect(spy).to.be.calledWith({
          positionRect: layoutRectLtwh(2, sizes.height - 5, 20, 10),
          relativePos: 'bottom',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
      });

      it('out of viewport', () => {
        setStyles(elem, {
          'position': 'absolute',
          'top': '1px',
          'left': '2px',
          'width': '20px',
          'height': '10px',
        });
        const viewport = Services.viewportForDoc(ampdoc);
        const sizes = viewport.getSize();
        const spy = sandbox.spy();
        posOb.observe(elem, PositionObserverFidelity.HIGH, spy);
        clock.tick(1);
        spy.reset();
        elem.style.top = '-11px';
        posOb.updateAllEntries();
        expect(spy).to.be.calledWith({
          positionRect: null,
          relativePos: 'top',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
        spy.reset();
        elem.style.top = `${sizes.height + 1}px`;
        posOb.updateAllEntries();
        expect(spy).to.not.be.called;
        elem.style.top = '0px';
        posOb.updateAllEntries();
        expect(spy).to.be.calledWith({
          positionRect: layoutRectLtwh(2, 0, 20, 10),
          relativePos: 'inside',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
        spy.reset();
        elem.style.top = `${sizes.height + 5}px`;
        posOb.updateAllEntries();
        expect(spy).to.be.calledWith({
          positionRect: null,
          relativePos: 'bottom',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
      });
    });
  });
});
