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
  AmpDocPositionObserver,
  PositionObserverFidelity,
} from '../../src/service/position-observer-impl';

describes.realWin('PositionObserver', {amp: 1}, env => {
  let win;
  let ampdoc;
  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
  });

  describe('AmpDocPositionObserver', () => {
    let posOb;
    beforeEach(() => {
      posOb = new AmpDocPositionObserver(ampdoc);
    });

    describe('API functions includes observe/unobserve/changeFidelity', () => {
      it('should observe identical element and start', () => {
        const spy = sandbox.spy(posOb, 'startCallback');
        const elem = win.document.createElement('div');
        const elem1 = win.document.createElement('div');
        posOb.observe(elem, PositionObserverFidelity.LOW, () => {});
        posOb.observe(elem1, PositionObserverFidelity.LOW, () => {});
        expect(posOb.entries_).to.have.length(2);
        posOb.observe(elem, PositionObserverFidelity.LOW, () => {});
        expect(posOb.entries_).to.have.length(2);
        expect(spy).to.be.calledOnce;
      });

      it('should change fidelity', () => {
        const elem = win.document.createElement('div');
        posOb.observe(elem, PositionObserverFidelity.LOW, () => {});
        expect(posOb.entries_[0].fidelity).to.equal(
            PositionObserverFidelity.LOW);
        posOb.changeFidelity(elem, PositionObserverFidelity.HIGH);
        expect(posOb.entries_[0].fidelity).to.equal(
            PositionObserverFidelity.HIGH);
        expect(posOb.entries_[0].turn).to.equal(0);
      });

      it('should unobserve and stop', () => {
        const spy = sandbox.spy(posOb, 'stopCallback');
        const elem = win.document.createElement('div');
        const elem1 = win.document.createElement('div');
        posOb.observe(elem, PositionObserverFidelity.LOW, () => {});
        posOb.observe(elem1, PositionObserverFidelity.LOW, () => {});
        posOb.unobserve(elem);
        expect(posOb.entries_).to.have.length(1);
        expect(spy).to.not.be.called;
        posOb.unobserve(elem1);
        expect(spy).to.be.calledOnce;
      });
    });
  });
});
