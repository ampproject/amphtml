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

import {StandardActions} from '../../src/service/standard-actions-impl';
import {AmpDocSingle} from '../../src/service/ampdoc-impl';
import * as sinon from 'sinon';


describe('StandardActions', () => {

  let sandbox;
  let actions;
  let mutateElementStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    actions = new StandardActions(new AmpDocSingle(window));
    mutateElementStub = sandbox.stub(actions.resources_, 'mutateElement',
        (unusedElement, mutator) => mutator());
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('"hide" action', () => {
    it('should handle normal element', () => {
      const element = document.createElement('div');
      actions.handleHide({target: element});
      expect(mutateElementStub.callCount).to.equal(1);
      expect(mutateElementStub.firstCall.args[0]).to.equal(element);
      expect(element.style.display).to.equal('none');
    });

    it('should handle AmpElement', () => {
      const element = document.createElement('div');
      let called = false;
      element.classList.add('-amp-element');
      element.collapse = function() {
        called = true;
      };

      actions.handleHide({target: element});
      expect(mutateElementStub.callCount).to.equal(1);
      expect(mutateElementStub.firstCall.args[0]).to.equal(element);
      expect(called).to.equal(true);
    });
  });
});
