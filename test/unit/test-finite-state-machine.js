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
    let sandbox;
    let fsm;
    let spy;
    let other;

    beforeEach(() => {
      sandbox = sinon.sandbox;
      fsm = new FiniteStateMachine('init');
      spy = sandbox.spy();
      other = sandbox.spy();

      fsm.addTransition('init', 'start', spy);
      fsm.addTransition('init', 'other', other);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('invokes callbacks on transition', () => {
      fsm.setState('start');

      expect(spy).to.have.been.called;
    });

    it('ignores other transition callbacks', () => {
      fsm.setState('other');

      expect(spy).not.to.have.been.called;
      expect(other).to.have.been.called;
    });

    it('handles unregistered transitions', () => {
      fsm.setState('unknown');

      expect(spy).not.to.have.been.called;
      expect(other).not.to.have.been.called;
    });
  });
});
