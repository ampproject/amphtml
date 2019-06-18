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

import {
  FxBindings,
  FxType,
  getFxTypes,
  isValidTypeCombination,
  sanitizeFxTypes,
  validFxTypes,
} from '../fx-type';

describes.fakeWin('amp-fx types', {amp: false}, env => {
  function expectNoFalseDefinitions(objOrDef, id) {
    const msg = `FxBindings: False properties are unnecessary, just remove [${id}]`;
    expect(objOrDef, msg).not.to.be.false;
    if (typeof objOrDef != 'object') {
      return;
    }
    Object.keys(objOrDef).forEach(key => {
      expectNoFalseDefinitions(objOrDef[key], `${id}.${key}`);
    });
  }

  describe('FX types definition', () => {
    const expectedKey = type => type.replace(/\-/g, '_').toUpperCase();

    it('has matching FxType for each type', () => {
      expect(Object.keys(FxType), 'FxType').to.have.length(validFxTypes.length);

      validFxTypes.forEach(type => {
        expect(FxType).to.include({[expectedKey(type)]: type});
      });
    });

    it('has matching bindings for each type', () => {
      const typeBindings = Object.keys(FxBindings);
      expect(typeBindings, 'FxBindings').to.have.length(validFxTypes.length);
      typeBindings.forEach(type => {
        expect(FxBindings[type], `FxBindings.${expectedKey(type)}`).not.to.be
          .empty;
      });
    });

    it('has no false definitions', () => {
      Object.keys(FxBindings).forEach(type => {
        expectNoFalseDefinitions(
          FxBindings[type],
          `FxBindings.${expectedKey(type)}`
        );
      });
    });
  });

  describe('isValidTypeCombination', () => {
    it('allows', () => {
      expect(isValidTypeCombination('parallax', 'fade-in')).to.be.true;
      expect(isValidTypeCombination('fly-in-top', 'fade-in')).to.be.true;
      expect(isValidTypeCombination('fly-in-bottom', 'fade-in-scroll')).to.be
        .true;
    });
    it('restricts', () => {
      // dupes
      expect(isValidTypeCombination('foo', 'foo')).to.be.false;

      // translating along the same axis
      expect(isValidTypeCombination('parallax', 'fly-in-top')).to.be.false;
      expect(isValidTypeCombination('float-in-top', 'float-in-bottom')).to.be
        .false;

      // both change opacity
      expect(isValidTypeCombination('fade-in', 'fade-in-scroll')).to.be.false;

      // different signal types
      expect(isValidTypeCombination('fade-in', 'float-in-bottom')).to.be.false;
      expect(isValidTypeCombination('fly-in-left', 'float-in-bottom')).to.be
        .false;
    });
  });

  describe('sanitizeFxTypes', () => {
    it('leaves valid sets as-is', () => {
      [
        ['parallax'],
        ['fade-in'],
        ['float-in-top'],
        ['float-in-bottom'],
        ['fly-in-left'],
        ['parallax', 'fade-in'],
        ['fly-in-top', 'fade-in'],
        ['fly-in-bottom', 'fly-in-right', 'fade-in-scroll'],
        ['fly-in-top', 'fly-in-left', 'fade-in'],
      ].forEach(validSet => {
        expect(sanitizeFxTypes(validSet)).to.deep.equal(validSet);
      });
    });

    it('purges invalid fx kept by order', () => {
      [
        // two items, by order
        {
          invalid: ['parallax', 'float-in-top'],
          sanitized: ['parallax'],
        },
        {
          invalid: ['fly-in-top', 'parallax'],
          sanitized: ['fly-in-top'],
        },
        // three items, by order
        {
          invalid: ['float-in-top', 'fly-in-top', 'fly-in-left'],
          sanitized: ['float-in-top'],
        },
        {
          invalid: ['fly-in-top', 'float-in-top', 'fly-in-left'],
          sanitized: ['fly-in-top', 'fly-in-left'],
        },
        {
          invalid: ['fly-in-top', 'fly-in-left', 'float-in-top'],
          sanitized: ['fly-in-top', 'fly-in-left'],
        },
        // removes dupes
        {
          invalid: ['fly-in-top', 'fly-in-top', 'fly-in-top'],
          sanitized: ['fly-in-top'],
        },
      ].forEach(({invalid, sanitized}) => {
        expect(sanitizeFxTypes(invalid)).to.deep.equal(sanitized);
      });
    });
  });

  describe('getFxTypes', () => {
    function randomWhitespaceChar() {
      const chars = ['\n', ' ', '\t'];
      return chars[Math.floor(Math.random() * chars.length)];
    }

    function randomWhitespace(min = 0) {
      const amount = Math.round(min + Math.random() * 5);
      return Array(amount)
        .fill(null)
        .map(randomWhitespaceChar)
        .join('');
    }

    function elementWithTypesRandomWhitespace(types) {
      const element = env.win.document.createElement('div');
      element.setAttribute(
        'amp-fx',
        types.reduce(
          (acc, type, i) => acc + randomWhitespace(Math.min(i, 1)) + type,
          ''
        )
      );
      return element;
    }

    it('returns valid sets as-is', () => {
      [
        ['parallax'],
        ['fade-in'],
        ['float-in-top'],
        ['float-in-bottom'],
        ['fly-in-left'],
        ['parallax', 'fade-in'],
        ['fly-in-top', 'fade-in'],
        ['fly-in-bottom', 'fly-in-right', 'fade-in-scroll'],
        ['fly-in-top', 'fly-in-left', 'fade-in'],
      ].forEach(validSet => {
        expect(
          getFxTypes(elementWithTypesRandomWhitespace(validSet))
        ).to.deep.equal(validSet);
      });
    });

    it('purges invalid fx kept by order', () => {
      [
        // two items, by order
        {
          invalid: ['parallax', 'float-in-top'],
          sanitized: ['parallax'],
        },
        {
          invalid: ['fly-in-top', 'parallax'],
          sanitized: ['fly-in-top'],
        },
        // three items, by order
        {
          invalid: ['float-in-top', 'fly-in-top', 'fly-in-left'],
          sanitized: ['float-in-top'],
        },
        {
          invalid: ['fly-in-top', 'float-in-top', 'fly-in-left'],
          sanitized: ['fly-in-top', 'fly-in-left'],
        },
        {
          invalid: ['fly-in-top', 'fly-in-left', 'float-in-top'],
          sanitized: ['fly-in-top', 'fly-in-left'],
        },
        // removes dupes
        {
          invalid: ['fly-in-top', 'fly-in-top', 'fly-in-top'],
          sanitized: ['fly-in-top'],
        },
      ].forEach(({invalid, sanitized}) => {
        expect(
          getFxTypes(elementWithTypesRandomWhitespace(invalid))
        ).to.deep.equal(sanitized);
      });
    });
  });
});
