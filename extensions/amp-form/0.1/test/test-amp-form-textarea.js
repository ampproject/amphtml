/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../../build/amp-form-0.1.css';
import {Services} from '../../../../src/services';
import {
  getHasOverflow,
  maybeResizeTextarea,
} from '../amp-form-textarea';
import {installStylesForDoc} from '../../../../src/style-installer';

describes.realWin('amp-form textarea[autoexpand]', {
  amp: {
    ampdoc: 'single',
  },
}, env => {
  let doc;
  let sandbox;
  beforeEach(() => {
    doc = env.ampdoc.getRootNode();
    installStylesForDoc(env.ampdoc, CSS, () => {}, false, 'amp-form');
    sandbox = env.sandbox;
  });

  describe('AmpFormTextarea', () => {
    it('should remove autoexpand on elements with initial overflow', () => {

    });
  });

  describe('getHasOverflow', () => {
    it('should detect if an element has overflow', () => {
      const textarea = doc.createElement('textarea');
      textarea.setAttribute('autoexpand', '');
      textarea.setAttribute('rows', '1');
      textarea.setAttribute('cols', '80');
      textarea.innerHTML = 'big text'.repeat(30);
      doc.body.appendChild(textarea);

      return expect(getHasOverflow(textarea)).to.eventually.be.true;
    });

    it('should detect if an element does not have overflow', () => {
      const textarea = doc.createElement('textarea');
      textarea.setAttribute('autoexpand', '');
      textarea.setAttribute('rows', '1');
      textarea.setAttribute('cols', '80');
      textarea.innerHTML = 'small text';
      doc.body.appendChild(textarea);

      return expect(getHasOverflow(textarea)).to.eventually.be.false;
    });
  });

  describe('maybeResizeTextarea', () => {
    it('should not resize an element that has not expanded', () => {
      const textarea = doc.createElement('textarea');
      textarea.setAttribute('autoexpand', '');
      textarea.setAttribute('rows', '4');
      textarea.setAttribute('cols', '80');
      textarea.innerHTML = 'small text';
      doc.body.appendChild(textarea);

      const fakeResources = {
        measureMutateElement(unusedElement, measurer, mutator) {
          measurer();
          return mutator() || Promise.resolve();
        },
      };
      sandbox.stub(Services, 'resourcesForDoc').returns(fakeResources);

      const initialHeight = textarea.clientHeight;
      return maybeResizeTextarea(textarea).then(() => {
        expect(textarea.clientHeight).to.equal(initialHeight);
      });
    });

    it('should expand an element that exceeds its boundary', () => {
      const textarea = doc.createElement('textarea');
      textarea.setAttribute('autoexpand', '');
      textarea.setAttribute('rows', '4');
      textarea.setAttribute('cols', '80');
      textarea.innerHTML = 'big text'.repeat(100);
      doc.body.appendChild(textarea);

      const fakeResources = {
        measureMutateElement(unusedElement, measurer, mutator) {
          measurer();
          return mutator() || Promise.resolve();
        },
      };
      sandbox.stub(Services, 'resourcesForDoc').returns(fakeResources);

      const initialHeight = textarea.clientHeight;
      return maybeResizeTextarea(textarea).then(() => {
        expect(textarea.clientHeight).to.be.greaterThan(initialHeight);
      });
    });

    it('should shrink an element that expands and then reduces', () => {
      const textarea = doc.createElement('textarea');
      textarea.setAttribute('autoexpand', '');
      textarea.setAttribute('rows', '4');
      textarea.setAttribute('cols', '80');
      textarea.innerHTML = 'big text'.repeat(100);
      doc.body.appendChild(textarea);

      const fakeResources = {
        measureMutateElement(unusedElement, measurer, mutator) {
          measurer();
          return mutator() || Promise.resolve();
        },
      };
      sandbox.stub(Services, 'resourcesForDoc').returns(fakeResources);

      const initialHeight = textarea.clientHeight;
      let increasedHeight;
      return maybeResizeTextarea(textarea).then(() => {
        increasedHeight = textarea.clientHeight;
        expect(increasedHeight).to.be.greaterThan(initialHeight);
      }).then(() => {
        textarea.innerHTML = 'small text';
        return maybeResizeTextarea(textarea);
      }).then(() => {
        expect(textarea.clientHeight).to.be.lessThan(increasedHeight);
      });
    });
  });
});
