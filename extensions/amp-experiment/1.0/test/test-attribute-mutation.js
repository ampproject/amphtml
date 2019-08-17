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

import {AttributeMutationDefaultClass} from '../mutation/attribute-mutation-default-class';
import {AttributeMutationDefaultStyle} from '../mutation/attribute-mutation-default-style';
import {AttributeMutationDefaultUrl} from '../mutation/attribute-mutation-default-url';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin(
  'amp-experiment attribute-mutation-*',
  {
    amp: {
      extensions: ['amp-experiment:1.0'],
    },
  },
  env => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      toggleExperiment(win, 'amp-experiment-1.0', true);

      doc.body.innerHTML = '';
    });

    function getAttributeMutationParamsObject(attributeName, value, tagName) {
      return {
        mutationRecord: {
          'type': 'characterData',
          'target': '.my-test-element-with-this-class',
          'value': value,
          'attributeName': attributeName,
        },
        elements: [doc.createElement(tagName), doc.createElement(tagName)],
      };
    }

    function getAttributeMutationDefaultClass(value) {
      const paramsObject = getAttributeMutationParamsObject(
        'class',
        value,
        'div'
      );
      return new AttributeMutationDefaultClass(
        paramsObject.mutationRecord,
        paramsObject.elements
      );
    }

    function getAttributeMutationDefaultStyle(value) {
      const paramsObject = getAttributeMutationParamsObject(
        'style',
        value,
        'div'
      );
      return new AttributeMutationDefaultStyle(
        paramsObject.mutationRecord,
        paramsObject.elements
      );
    }

    function getAttributeMutationDefaultUrl(value) {
      const paramsObject = getAttributeMutationParamsObject('href', value, 'a');
      return new AttributeMutationDefaultUrl(
        paramsObject.mutationRecord,
        paramsObject.elements
      );
    }

    describe('validate', () => {
      describe('default class', () => {
        it('should allow valid mutations', () => {
          const attributeMutation = getAttributeMutationDefaultClass(
            'my-class'
          );
          expect(attributeMutation.validate()).to.be.equal(true);
        });

        it('should not allow i-amphtml-*', () => {
          const attributeMutation = getAttributeMutationDefaultClass(
            'i-amphtml-my-class'
          );
          expect(attributeMutation.validate()).to.be.equal(false);
        });
      });

      describe('default style', () => {
        it('should allow valid mutations', () => {
          const attributeMutation = getAttributeMutationDefaultStyle(
            'background-color: #000000'
          );
          expect(attributeMutation.validate()).to.be.equal(true);
        });

        it('should allow background-color mutations', () => {
          const attributeMutation = getAttributeMutationDefaultStyle(
            'background-color: #000000'
          );
          expect(attributeMutation.validate()).to.be.equal(true);
        });

        it('should allow color mutations', () => {
          const attributeMutation = getAttributeMutationDefaultStyle(
            'color: #000000'
          );
          expect(attributeMutation.validate()).to.be.equal(true);
        });

        it('should not allow !important mutations', () => {
          const attributeMutation = getAttributeMutationDefaultStyle(
            'color: #000000 !important;'
          );
          expect(attributeMutation.validate()).to.be.equal(false);
        });

        it('should not allow HTML Comment mutations', () => {
          const attributeMutation = getAttributeMutationDefaultStyle(
            '<!-- color: #000000;'
          );
          expect(attributeMutation.validate()).to.be.equal(false);
        });

        it('should not allow unallowed style mutations', () => {
          const attributeMutation = getAttributeMutationDefaultStyle(
            'position: fixed;'
          );
          expect(attributeMutation.validate()).to.be.equal(false);
        });
      });

      describe('default url', () => {
        it('should allow valid mutations', () => {
          const attributeMutation = getAttributeMutationDefaultUrl(
            'https://amp.dev/'
          );
          expect(attributeMutation.validate()).to.be.equal(true);
        });

        it('should not allow http:// mutations', () => {
          const attributeMutation = getAttributeMutationDefaultUrl(
            'http://amp.dev/'
          );
          expect(attributeMutation.validate()).to.be.equal(false);
        });

        it('should not allow non HTTPS mutations', () => {
          const attributeMutation = getAttributeMutationDefaultUrl(
            'tel:555-555-5555'
          );
          expect(attributeMutation.validate()).to.be.equal(false);
        });

        it('should not allow unsupported element mutations', () => {
          const attributeMutation = getAttributeMutationDefaultUrl(
            'tel:555-555-5555'
          );
          attributeMutation.elements = [doc.createElement('div')];
          expect(attributeMutation.validate()).to.be.equal(false);
        });
      });
    });

    describe('mutate', () => {
      it('should mutate default class mutations', () => {
        const attributeMutation = getAttributeMutationDefaultClass('my-class');
        const {attributeName, value} = attributeMutation.mutationRecord_;

        attributeMutation.mutate();

        attributeMutation.elements_.forEach(element => {
          expect(element.getAttribute(attributeName)).to.be.equal(value);
        });
      });

      it('should mutate default style mutations', () => {
        const attributeMutation = getAttributeMutationDefaultStyle(
          'background-color: #000000'
        );
        const {attributeName, value} = attributeMutation.mutationRecord_;

        attributeMutation.mutate();

        attributeMutation.elements_.forEach(element => {
          expect(element.getAttribute(attributeName)).to.be.equal(value);
        });
      });

      it('should mutate default url mutations', () => {
        const attributeMutation = getAttributeMutationDefaultUrl(
          'https://amp.dev/'
        );
        const {attributeName, value} = attributeMutation.mutationRecord_;

        attributeMutation.mutate();

        attributeMutation.elements_.forEach(element => {
          expect(element.getAttribute(attributeName)).to.be.equal(value);
        });
      });
    });
  }
);
