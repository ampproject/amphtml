import {
  deepMerge,
  getValueForExpr,
  hasOwn,
  map,
  memo,
  objectsEqualDeep,
  ownProperty,
  recreateNonProtoObject,
} from '#core/types/object';

describes.sandboxed('type helpers - objects', {}, () => {
  it('hasOwn', () => {
    expect(hasOwn(map(), 'a')).to.be.false;
    expect(hasOwn(map({'a': 'b'}), 'b')).to.be.false;
    expect(hasOwn(map({'a': {}}), 'a')).to.be.true;
  });

  it('ownProperty', () => {
    expect(ownProperty({}, '__proto__')).to.be.undefined;
    expect(ownProperty({}, 'constructor')).to.be.undefined;
    expect(ownProperty({foo: 'bar'}, 'foo')).to.equal('bar');
  });

  describe('map', () => {
    it('should make map like objects', () => {
      expect(map().prototype).to.be.undefined;
      expect(map().__proto__).to.be.undefined;
      expect(map().toString).to.be.undefined;
    });

    it('should make map like objects from objects', () => {
      expect(map({}).prototype).to.be.undefined;
      expect(map({}).__proto__).to.be.undefined;
      expect(map({}).toString).to.be.undefined;
      expect(map({foo: 'bar'}).foo).to.equal('bar');
      const obj = {foo: 'bar', test: 1};
      expect(map(obj).test).to.equal(1);
      expect(map(obj)).to.not.equal(obj);
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
      expect(deepMerge(destObject, fromObject)).to.deep.equal({
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
        a: [1, 2, 3, 4, 5],
        b: {
          c: [9, 8, 7, 6, 5],
        },
      };
      const fromObject = {
        b: {
          c: ['h', 'i'],
        },
      };
      expect(deepMerge(destObject, fromObject)).to.deep.equal({
        a: [1, 2, 3, 4, 5],
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
      expect(deepMerge(destObject, fromObject, 1)).to.deep.equal({
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
      expect(deepMerge(destObject, fromObject)).to.deep.equal({
        a: destObject,
      });
    });

    it('should throw on source objects with circular references', () => {
      const destObject = {};
      destObject.a = {};
      const fromObject = {};
      fromObject.a = fromObject;
      expect(() => deepMerge(destObject, fromObject)).to.throw(
        /Source object has a circular reference./
      );
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
      expect(deepMerge(destObject, fromObject)).to.deep.equal({
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
      expect(() => deepMerge(destObject, destObject)).to.not.throw();
    });
  });

  describe('objectsEqualDeep', () => {
    const getDeepObject = () => ({
      a: 'A',
      b: 13,
      c: ['C', 'c', 'see', 'si'],
      d: {e: 'E'},
      f: {g: {h: [{i: ['J']}]}},
    });
    const deepObject = getDeepObject();

    it('should compare deep objects', () => {
      expect(objectsEqualDeep(deepObject, getDeepObject())).to.be.true;
    });
    it('should compare shallow objects', () => {
      expect(objectsEqualDeep(deepObject, deepObject)).to.be.true;
      expect(objectsEqualDeep(deepObject, {...deepObject})).to.be.true;
      expect(objectsEqualDeep({...deepObject}, {...deepObject})).to.be.true;
    });
    it('should not matter what order the keys are in', () => {
      expect(
        objectsEqualDeep(deepObject, {
          c: deepObject.c,
          f: deepObject.f,
          d: deepObject.d,
          a: deepObject.a,
          b: deepObject.b,
        })
      ).to.be.true;
    });
    it('should fail if there are extra keys', () => {
      expect(objectsEqualDeep(deepObject, {...deepObject, foo: 'foo'})).to.be
        .false;
    });
    it('should fail if there are too-few keys', () => {
      const missingKeys = {...deepObject};
      delete missingKeys['a'];
      expect(objectsEqualDeep(deepObject, missingKeys)).to.be.false;
    });
    it('should fail if values are different', () => {
      expect(objectsEqualDeep(deepObject, {...deepObject, a: 'AAA'})).to.be
        .false;
      expect(objectsEqualDeep(deepObject, {...deepObject, b: ['B']})).to.be
        .false;
      expect(objectsEqualDeep(deepObject, {...deepObject, c: 'C,c,see,si'})).to
        .be.false;
    });
    it('should fail if a deep value is different', () => {
      const o2 = getDeepObject();
      o2.f.g.h[0].i[0] = 'JJJ';
      expect(objectsEqualDeep(deepObject, o2)).to.be.false;
    });

    const getDeepArray = () => ['A', 'B', {c: 'C'}, ['D', 'E', 'F']];
    const deepArray = getDeepArray();
    it('should compare arrays', () => {
      expect(objectsEqualDeep(deepArray, getDeepArray())).to.be.true;
      expect(objectsEqualDeep(deepArray, [...getDeepArray()])).to.be.true;
    });
    it('should fail if the arrays are different', () => {
      const o2 = getDeepArray();
      expect(objectsEqualDeep(deepArray, o2.slice(1))).to.be.false;
      expect(objectsEqualDeep(deepArray, o2.slice(0, 2))).to.be.false;
      expect(objectsEqualDeep(deepArray, [...o2, 'extra'])).to.be.false;
      expect(objectsEqualDeep(deepArray, ['extra', ...o2])).to.be.false;
      expect(objectsEqualDeep(deepArray, [...o2, ...o2])).to.be.false;
      o2[1] = 'BB';
      expect(objectsEqualDeep(deepArray, o2)).to.be.false;

      // Just to make sure nothing funky happened:
      o2[1] = 'B';
      expect(objectsEqualDeep(deepArray, o2)).to.be.true;
    });
  });

  describe('memo', () => {
    const PROP = '_a';

    let counter;
    let obj;

    beforeEach(() => {
      counter = 0;
      obj = {
        name: 'OBJ',
      };
    });

    function factory(obj) {
      const id = ++counter;
      return `${obj.name}:${id}`;
    }

    it('should allocate object on first and first use only', () => {
      // First access: allocate and reuse.
      expect(memo(obj, PROP, factory)).to.equal('OBJ:1');
      expect(memo(obj, PROP, factory)).to.equal('OBJ:1');

      // Same object, different property: allocate again.
      expect(memo(obj, PROP + '2', factory)).to.equal('OBJ:2');
      expect(memo(obj, PROP + '2', factory)).to.equal('OBJ:2');

      // A new object: allocate again.
      expect(memo({name: 'OBJ'}, PROP, factory)).to.equal('OBJ:3');
    });
  });

  describe('getValueForExpr', () => {
    it('should return self for "."', () => {
      const obj = {str: 'A', num: 1, bool: true, val: null};
      expect(getValueForExpr(obj, '.')).to.equal(obj);
    });

    it('should return a simple value', () => {
      const obj = {str: 'A', num: 1, bool: true, val: null};
      expect(getValueForExpr(obj, 'str')).to.equal('A');
      expect(getValueForExpr(obj, 'num')).to.equal(1);
      expect(getValueForExpr(obj, 'bool')).to.equal(true);
      expect(getValueForExpr(obj, 'val')).to.be.null;
      expect(getValueForExpr(obj, 'other')).to.be.undefined;
    });

    it('should return a nested value', () => {
      const child = {str: 'A', num: 1, bool: true, val: null};
      const obj = {child};
      expect(getValueForExpr(obj, 'child')).to.deep.equal(child);
      expect(getValueForExpr(obj, 'child.str')).to.equal('A');
      expect(getValueForExpr(obj, 'child.num')).to.equal(1);
      expect(getValueForExpr(obj, 'child.bool')).to.equal(true);
      expect(getValueForExpr(obj, 'child.val')).to.be.null;
      expect(getValueForExpr(obj, 'child.other')).to.be.undefined;
    });

    it('should return a nested value without proto', () => {
      const child = {str: 'A', num: 1, bool: true, val: null};
      const obj = recreateNonProtoObject({child});
      expect(getValueForExpr(obj, 'child')).to.deep.equal(child);
      expect(getValueForExpr(obj, 'child.str')).to.equal('A');
      expect(getValueForExpr(obj, 'child.num')).to.equal(1);
      expect(getValueForExpr(obj, 'child.bool')).to.equal(true);
      expect(getValueForExpr(obj, 'child.val')).to.be.null;
      expect(getValueForExpr(obj, 'child.other')).to.be.undefined;
    });

    it('should shortcircuit if a parent in chain missing', () => {
      const child = {str: 'A'};
      const obj = {child};
      expect(getValueForExpr(obj, 'child.str')).to.equal('A');
      expect(getValueForExpr(obj, 'unknown.str')).to.be.undefined;
      expect(getValueForExpr(obj, 'unknown.chain.str')).to.be.undefined;
    });

    it('should shortcircuit if a parent in chain is not an object', () => {
      const child = {str: 'A'};
      const obj = {child, nonobj: 'B'};
      expect(getValueForExpr(obj, 'child.str')).to.equal('A');
      expect(getValueForExpr(obj, 'nonobj')).to.equal('B');
      expect(getValueForExpr(obj, 'nonobj.str')).to.be.undefined;
    });

    it('should only search in own properties', () => {
      const ancestor = {num: 1};
      const obj = Object.create(ancestor);
      obj.str = 'A';
      expect(getValueForExpr(obj, 'str')).to.equal('A');
      expect(getValueForExpr(ancestor, 'num')).to.equal(1);
      expect(getValueForExpr(obj, 'num')).to.be.undefined;
      expect(getValueForExpr(obj, '__proto__')).to.be.undefined;
    });

    it('should support array index', () => {
      const child = {num: 1, str: 'A'};
      const obj = {foo: [child]};
      expect(getValueForExpr(obj, 'foo.0.num')).to.equal(1);
      expect(getValueForExpr(obj, 'foo.0.str')).to.equal('A');
      expect(getValueForExpr(obj, 'foo.0a.str')).to.be.undefined;
      expect(getValueForExpr(obj, 'foo.1.num')).to.be.undefined;
      expect(getValueForExpr(obj, 'foo.1.str')).to.be.undefined;
    });

    it('should only search in own properties of arrays', () => {
      const arr = ['A'];
      expect(getValueForExpr(arr, '0')).to.equal('A');
      expect(getValueForExpr(arr, '1')).to.be.undefined;
      expect(getValueForExpr(arr, 'concat')).to.be.undefined;
      expect(getValueForExpr(arr, '__proto__')).to.be.undefined;
    });
  });

  describe('recreateNonProtoObject', () => {
    it('should recreate an empty object', () => {
      const original = {};
      const copy = recreateNonProtoObject(original);
      expect(copy).to.deep.equal(original);
      expect(copy).to.not.equal(original);
      expect(copy.__proto__).to.be.undefined;
    });

    it('should recreate an object', () => {
      const original = {str: 'A', num: 1, bool: true, val: null};
      const copy = recreateNonProtoObject(original);
      expect(copy).to.deep.equal(original);
      expect(copy).to.not.equal(original);
      expect(copy.__proto__).to.be.undefined;
      expect(copy.val).to.be.null;
    });

    it('should recreate a nested object', () => {
      const original = {child: {str: 'A', num: 1, bool: true, val: null}};
      const copy = recreateNonProtoObject(original);
      expect(copy).to.deep.equal(original);
      expect(copy).to.not.equal(original);
      expect(copy.__proto__).to.be.undefined;
      expect(copy.child).to.deep.equal(original.child);
      expect(copy.child).to.not.equal(original.child);
      expect(copy.child.__proto__).to.be.undefined;
    });
  });
});
