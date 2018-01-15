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

import * as object from '../../src/utils/object';

describe('Object', () => {
  it('hasOwn', () => {
    expect(object.hasOwn(object.map(), 'a')).to.be.false;
    expect(object.hasOwn(object.map({'a': 'b'}), 'b')).to.be.false;
    expect(object.hasOwn(object.map({'a': {}}), 'a')).to.be.true;
  });

  it('ownProperty', () => {
    expect(object.ownProperty({}, '__proto__')).to.be.undefined;
    expect(object.ownProperty({}, 'constructor')).to.be.undefined;
    expect(object.ownProperty({foo: 'bar'}, 'foo')).to.equal('bar');
  });

  describe('map', () => {
    it('should make map like objects', () => {
      expect(object.map().prototype).to.be.undefined;
      expect(object.map().__proto__).to.be.undefined;
      expect(object.map().toString).to.be.undefined;
    });

    it('should make map like objects from objects', () => {
      expect(object.map({}).prototype).to.be.undefined;
      expect(object.map({}).__proto__).to.be.undefined;
      expect(object.map({}).toString).to.be.undefined;
      expect(object.map({foo: 'bar'}).foo).to.equal('bar');
      const obj = {foo: 'bar', test: 1};
      expect(object.map(obj).test).to.equal(1);
      expect(object.map(obj)).to.not.equal(obj);
    });
  });

  describe('deepMerge', () => {
    it('should deep merge objects', () => {
      const destObject = {
        a: 'hello world',
        b: 'goodbye world',
        c: {
          d: 'foo',
          e: {
            f: 'bar',
          },
        },
      };
      const fromObject = {
        b: 'hello world',
        c: {
          d: 'bah',
          e: {
            g: 'baz',
          },
        },
      };
      expect(object.deepMerge(destObject, fromObject)).to.deep.equal({
        a: 'hello world',
        b: 'hello world',
        c: {
          d: 'bah',
          e: {
            f: 'bar',
            g: 'baz',
          },
        },
      });
    });

    it('should NOT deep merge arrays', () => {
      const destObject = {
        a: [1,2,3,4,5],
        b: {
          c: [9,8,7,6,5],
        },
      };
      const fromObject = {
        b: {
          c: ['h', 'i'],
        },
      };
      expect(object.deepMerge(destObject, fromObject)).to.deep.equal({
        a: [1,2,3,4,5],
        b: {
          c: ['h', 'i'],
        },
      });
    });

    it('should use Object.assign if merged object exceeds max depth', () => {
      const destObject = {
        a: {
          b: {
            c: {
              d: 'e',
              f: 'g',
            },
          },
        },
      };
      const fromObject = {
        a: {
          b: {
            c: {
              d: 'z',
              h: 'i',
            },
          },
        },
      };
      expect(object.deepMerge(destObject, fromObject, 1)).to.deep.equal({
        a: {
          b: {
            c: {
              d: 'z',
              h: 'i',
            },
          },
        },
      });
    });

    it('should handle destination objects with circular references', () => {
      const destObject = {};
      destObject.a = destObject;
      const fromObject = {};
      fromObject.a = {};
      expect(object.deepMerge(destObject, fromObject)).to.deep.equal({
        a: destObject,
      });
    });

    it('should throw on source objects with circular references', () => {
      const destObject = {};
      destObject.a = {};
      const fromObject = {};
      fromObject.a = fromObject;
      expect(() => object.deepMerge(destObject, fromObject))
          .to.throw(/Source object has a circular reference./);
    });

    it('should merge null and undefined correctly', () => {
      const destObject = {
        a: null,
        b: {
          c: 'd',
        },
        e: undefined,
        f: {
          g: 'h',
        },
      };
      const fromObject = {
        a: {
          i: 'j',
        },
        b: null,
        e: {
          k: 'm',
        },
        f: undefined,
      };
      expect(object.deepMerge(destObject, fromObject)).to.deep.equal({
        a: {
          i: 'j',
        },
        b: null,
        e: {
          k: 'm',
        },
        f: undefined,
      });
    });

    it('should short circuit when merging the same object', () => {
      const destObject = {
        set a(val) {
          throw new Error('deep merge tried to merge object with itself');
        },
      };
      expect(object.deepMerge(destObject, destObject)).to.not.throw;
    });
  });
});
