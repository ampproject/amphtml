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
  refreshManagerFor,
  resetRefreshManagerFor,
  REFRESH_REFERENCE_ATTRIBUTE,
} from '../refresh-manager';
import * as sinon from 'sinon'; // eslint-disable-line no-unused-vars

function getNumElementsRegistered(refreshManager) {
  return Object.keys(refreshManager.registeredElementWrappers_).length;
}

function getTestElement() {
  const div = window.document.createElement('div');
  div.setAttribute('style', 'width:1px; height:1px;');
  return div;
}


describe('refresh-manager', () => {
  let refreshManager;
  let testElement;

  const noop = () => {};

  beforeEach(() => {
    refreshManager = refreshManagerFor(window);
    testElement = getTestElement();
  });

  afterEach(() => {
    refreshManager = null;
    testElement = null;
    resetRefreshManagerFor(window);
  });

  describe('#registerElement', () => {

    it('should have no registered elements', () => {
      expect(getNumElementsRegistered(refreshManager)).to.equal(0);
    });

    it('should have one registered element', () => {
      expect(getNumElementsRegistered(refreshManager)).to.equal(0);
      refreshManager.registerElement(testElement, noop);
      expect(getNumElementsRegistered(refreshManager)).to.equal(1);
    });

    it('should add correct attribute to element', () => {
      refreshManager.registerElement(testElement, noop);
      expect(testElement.getAttribute(REFRESH_REFERENCE_ATTRIBUTE))
          .to.equal('0');
    });

    it('should have multiple registered elements', () => {
      expect(getNumElementsRegistered(refreshManager)).to.equal(0);
      refreshManager.registerElement(testElement, noop);
      refreshManager.registerElement(getTestElement(), noop);
      refreshManager.registerElement(getTestElement(), noop);
      refreshManager.registerElement(getTestElement(), noop);
      refreshManager.registerElement(getTestElement(), noop);
      expect(getNumElementsRegistered(refreshManager)).to.equal(5);
    });
  });

  describe('#resetManager', () => {
    it('should reset manager to initial state', () => {
      expect(getNumElementsRegistered(refreshManager)).to.equal(0);
      refreshManager.registerElement(testElement, noop);
      refreshManager.registerElement(getTestElement(), noop);
      refreshManager.registerElement(getTestElement(), noop);
      refreshManager.registerElement(getTestElement(), noop);
      refreshManager.registerElement(getTestElement(), noop);
      expect(getNumElementsRegistered(refreshManager)).to.equal(5);
      expect(refreshManager.elementReferenceId_).to.equal(5);
      refreshManager.resetManager();
      expect(getNumElementsRegistered(refreshManager)).to.equal(0);
      expect(refreshManager.elementReferenceId_).to.equal(0);
    });
  });

  describe('visibility detection', () => {
    it('should refresh right away', () => {
      let resolver;
      const promise = new Promise(resolve => {
        resolver = resolve;
      });
      refreshManager.registerElement(
          testElement, () => {
            expect(false).to.be.true;
            resolver();
          }, {
            minOnScreenTimeThrehold: 0,
            // Not allowed in practice, but for this test the delay doesn't
            // matter.
            refreshInterval: 0,
          });
      return promise;
    });
  });
});
