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

import * as lolex from 'lolex';
import {
  PositionObserver,
} from '../../src/service/position-observer/position-observer-impl';
import {
  PositionObserverFidelity,
} from '../../src/service/position-observer/position-observer-worker';
import {Services} from '../../src/services';
import {layoutRectLtwh} from '../../src/layout-rect';
import {macroTask} from '../../testing/yield';
import {setStyles} from '../../src/style';

describes.realWin('PositionObserver', {amp: 1}, env => {
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
      clock = lolex.install({target: ampdoc.win});
      posOb = new PositionObserver(ampdoc);
      sandbox.stub(posOb.vsync_, 'measure').callsFake(callback => {
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
        const spy = sandbox.spy(posOb, 'startCallback_');
        posOb.observe(elem, PositionObserverFidelity.LOW, () => {});
        posOb.observe(elem1, PositionObserverFidelity.LOW, () => {});
        expect(posOb.workers_).to.have.length(2);
        expect(spy).to.be.calledOnce;
      });

      it('should unobserve and stop', () => {
        const spy = sandbox.spy(posOb, 'stopCallback_');
        posOb.observe(elem, PositionObserverFidelity.LOW, () => {});
        posOb.observe(elem1, PositionObserverFidelity.LOW, () => {});
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
        sandbox.stub(posOb.viewport_, 'getClientRectAsync').callsFake(() => {
          return Promise.resolve(layoutRectLtwh(0, top, 0, 0));
        });
      });
      it('should update new position with scroll event', function* () {
        const spy = sandbox.spy();
        posOb.observe(elem, PositionObserverFidelity.HIGH, spy);
        clock.tick(2);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        spy.reset();
        top++;
        win.dispatchEvent(new Event('scroll'));
        yield macroTask();
        expect(spy).to.be.calledOnce;
        spy.reset();
        top++;
        clock.tick(1);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        // stop fire scroll update after 500ms timeout
        // Make the number larger to avoid window scroll event
        clock.tick(5001);
        spy.reset();
        top++;
        clock.tick(1);
        yield macroTask();
        expect(spy).to.not.be.called;
      });

      it('should not update if element position does not change', function* () {
        const spy = sandbox.spy();
        posOb.observe(elem, PositionObserverFidelity.HIGH, spy);
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
        sandbox.stub(posOb.viewport_, 'getClientRectAsync').callsFake(() => {
          return Promise.resolve(layoutRectLtwh(2, top, 20, 10));
        });
      });

      it('overlap with viewport', function* () {
        const viewport = Services.viewportForDoc(ampdoc);
        const sizes = viewport.getSize();
        const spy = sandbox.spy();
        top = 1;
        posOb.observe(elem, PositionObserverFidelity.HIGH, spy);
        yield macroTask();
        expect(spy).to.be.calledWith({
          positionRect: layoutRectLtwh(2, 1, 20, 10),
          relativePos: 'inside',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
        spy.reset();
        top = -5;
        posOb.updateAllEntries();
        yield macroTask();
        expect(spy).to.be.calledWith({
          positionRect: layoutRectLtwh(2, -5, 20, 10),
          relativePos: 'top',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
        spy.reset();
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
        const spy = sandbox.spy();
        posOb.observe(elem, PositionObserverFidelity.HIGH, spy);
        yield macroTask();
        spy.reset();
        top = -11;
        posOb.updateAllEntries();
        yield macroTask();
        expect(spy).to.be.calledWith({
          positionRect: null,
          relativePos: 'top',
          viewportRect: layoutRectLtwh(0, 0, sizes.width, sizes.height),
        });
        spy.reset();
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
        spy.reset();
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
