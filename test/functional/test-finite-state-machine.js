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

import {FiniteStateMachine} from '../../src/finite-state-machine';

describe('Finite State Machine', () => {

  describe('simple machines', () => {
    let fsm;
    let spy;

    beforeEach(() => {
      fsm = new FiniteStateMachine({
        bit1: undefined,
      });
      spy = sinon.spy();

      fsm.addTransition({
        bit1: undefined,
      }, {
        bit1: true,
      }, spy);
    });

    it('invokes callbacks on transition', () => {
      fsm.setState({
        bit1: true,
      });

      expect(spy).to.have.been.called;
    });
  });

  describe('complex machines', () => {
    let fsm;
    let goodSpy;
    let badSpy;

    const initialState = {
      bit1: true,
      bit2: true,
    };
    const goodState = {
      bit1: true,
      bit2: false,
    };
    const badState = {
      bit1: false,
      bit2: false,
    };

    beforeEach(() => {
      fsm = new FiniteStateMachine(initialState);
      goodSpy = sinon.spy();
      badSpy = sinon.spy();

      fsm.addTransition(initialState, goodState, goodSpy);
      fsm.addTransition(initialState, badState, badSpy);
    });

    it('invokes callbacks on transition', () => {
      fsm.setState(goodState);

      expect(goodSpy).to.have.been.called;
    });

    it('ignores callbacks registered to other transitions', () => {
      fsm.setState(goodState);

      expect(badSpy).not.to.have.been.called;
    });
  });
});
