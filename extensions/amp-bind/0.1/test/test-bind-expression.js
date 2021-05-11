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

import {BindExpression} from '../bind-expression';
import {BindMacro} from '../bind-macro';

describes.sandboxed('BindExpression', {}, () => {
  const argumentTypeError = 'Unexpected argument type';
  const unsupportedFunctionError = 'not a supported function';
  const expressionSizeExceededError = 'exceeds max';

  /**
   * @param {string} expression
   * @param {Object=} opt_scope
   * @return {*}
   */
  function evaluate(expression, opt_scope) {
    return new BindExpression(expression, {}).evaluate(opt_scope || {});
  }

  describe('operations', () => {
    it('arithmetic', () => {
      expect(evaluate('-1')).to.equal(-1);
      expect(evaluate('1 + 2')).to.equal(3);
      expect(evaluate('2 - 3.5')).to.equal(-1.5);
      expect(evaluate('3 * 4')).to.equal(12);
      expect(evaluate('4 / 5')).to.equal(0.8);
      expect(evaluate('5 % 4')).to.equal(1);
      expect(evaluate('1 / 0')).to.equal(Infinity);
      expect(evaluate('0 / 0')).to.be.NaN;
    });

    it('comparison', () => {
      expect(evaluate('2 > 1')).to.be.true;
      expect(evaluate('1 > 1')).to.be.false;
      expect(evaluate('1 >= 1')).to.be.true;
      expect(evaluate('1 >= 2')).to.be.false;
      expect(evaluate('1 < 2')).to.be.true;
      expect(evaluate('0 < 0')).to.be.false;
      expect(evaluate('1 <= 1')).to.be.true;
      expect(evaluate('1 <= 0')).to.be.false;
      expect(evaluate('0 == 1')).to.be.false;
      expect(evaluate('1 == 1')).to.be.true;
      expect(evaluate('0 != 1')).to.be.true;
      expect(evaluate('1 != 1')).to.be.false;
    });

    it('logical', () => {
      expect(evaluate('!false')).to.be.true;
      expect(evaluate('true && true')).to.be.true;
      expect(evaluate('true && false')).to.be.false;
      expect(evaluate('false && false')).to.be.false;
      expect(evaluate('true || true')).to.be.true;
      expect(evaluate('true || false')).to.be.true;
      expect(evaluate('false || false')).to.be.false;
    });

    it('ternary', () => {
      expect(evaluate('true ? "a" : "b"')).to.be.equal('a');
      expect(evaluate('false ? "a" : "b"')).to.be.equal('b');
    });

    it('disallow: operators with side effects', () => {
      expect(() => {
        evaluate('foo = 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo += 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo -= 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo *= 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo /= 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo %= 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo **= 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo <<= 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo >>= 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo >>>= 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo &= 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo ^= 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo |= 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo++', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo--', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('~foo', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo << 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo >> 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('foo >>> 1', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('new Object()', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('delete foo', {foo: 0});
      }).to.throw();
    });

    /** @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators */
    it('disallow: non-allowlisted operators', () => {
      expect(evaluate('this')).to.be.null;
      expect(evaluate('self')).to.be.null;
      expect(evaluate('global')).to.be.null;
      expect(evaluate('function')).to.be.null;
      expect(evaluate('class')).to.be.null;
      expect(evaluate('yield')).to.be.null;
      expect(evaluate('await')).to.be.null;
      expect(evaluate('new')).to.be.null;
      expect(evaluate('super')).to.be.null;

      expect(() => {
        evaluate('function*');
      }).to.throw();
      expect(() => {
        evaluate('/ab+c/i');
      }).to.throw();
      expect(() => {
        evaluate('yield*');
      }).to.throw();
      expect(() => {
        evaluate('async function*');
      }).to.throw();
    });
  });

  describe('operator precedence', () => {
    it('arithmetic operators', () => {
      expect(evaluate('-1 + 2')).to.equal(1);
      expect(evaluate('1 - -0.5')).to.equal(1.5);
      expect(evaluate('1 + -2 * 3')).to.equal(-5);
      expect(evaluate('1 / 2 - 3')).to.equal(-2.5);
      expect(evaluate('4 % 3 - 2 * 1')).to.equal(-1);
    });

    it('comparison operators', () => {
      expect(evaluate('true == 2 > 1')).to.equal(true);
      expect(evaluate('true == 2 >= 1')).to.equal(true);
      expect(evaluate('true == 2 < 1')).to.equal(false);
      expect(evaluate('true == 2 <= 1')).to.equal(false);
      expect(evaluate('1 > 2 == true')).to.equal(false);
      expect(evaluate('1 >= 2 == true')).to.equal(false);
      expect(evaluate('1 < 2 == true')).to.equal(true);
      expect(evaluate('1 <= 2 == true')).to.equal(true);
    });

    it('logical operators', () => {
      expect(evaluate('!false && true')).to.be.true;
      expect(evaluate('false || !true')).to.be.false;
      expect(evaluate('true && false || true')).to.be.true;
      expect(evaluate('true && false == false')).to.be.true;
      expect(evaluate('false || false == true')).to.be.false;
      expect(evaluate('false == !true')).to.be.true;
    });
  });

  describe('strings', () => {
    it('basic support', () => {
      expect(evaluate('"a"')).to.equal('a');
      expect(evaluate('"a".length')).to.equal(1);
      expect(evaluate('"a" + "b"')).to.equal('ab');
      expect(evaluate('"a" + 1')).to.equal('a1');
      expect(evaluate('+"1"')).to.equal(1);
    });

    it('should parse special characters', () => {
      expect(evaluate('"\\n"')).to.equal('\n');
      expect(evaluate('"\\t"')).to.equal('\t');
      expect(evaluate('"\\u041f"')).to.equal('\u041f');

      // Single quote strings should be handled.
      expect(evaluate("'\\n'")).to.equal('\n');
      expect(evaluate("'\\t'")).to.equal('\t');
      expect(evaluate("'\\u041f'")).to.equal('\u041f');

      // Escaping special chars should work.
      expect(evaluate('"\\\\n"')).to.equal('\\n');
      expect(evaluate('"\\\\t"')).to.equal('\\t');
      expect(evaluate('"\\\\u041f"')).to.equal('\\u041f');

      // Double quotes inside the string should be escaped.
      expect(evaluate('\'a"b"c\'')).to.equal('a"b"c');
      expect(evaluate('\'a"\\n"c\'')).to.equal('a"\n"c');
    });

    it('allowlisted functions', () => {
      expect(evaluate('"abc".charAt(0)')).to.equal('a');
      expect(evaluate('"abc".charCodeAt(0)')).to.equal(97);
      expect(evaluate('"abc".concat("def")')).to.equal('abcdef');
      expect(evaluate('"abc".indexOf("b")')).to.equal(1);
      expect(evaluate('"aaa".lastIndexOf("a")')).to.equal(2);
      expect(evaluate('"abc".slice(0, 2)')).to.equal('ab');
      expect(evaluate('"abc".replace("bc", "xy")')).to.equal('axy');
      expect(evaluate('"a-b-c".split("-")')).to.deep.equal(['a', 'b', 'c']);
      expect(evaluate('"abc".substr(1)')).to.equal('bc');
      expect(evaluate('"abc".substring(0, 2)')).to.equal('ab');
      expect(evaluate('"ABC".toLowerCase()')).to.equal('abc');
      expect(evaluate('"abc".toUpperCase()')).to.equal('ABC');
    });

    it('escaped quotes', () => {
      expect(evaluate(`'\\"'`)).to.equal(`"`);
      expect(evaluate(`"\\'"`)).to.equal(`'`);

      expect(evaluate(`"Hello \\"World\\""`)).to.equal(`Hello "World"`);
      expect(evaluate(`'Hello\\'s world'`)).to.equal(`Hello's world`);
      expect(evaluate(`"\t\r"`)).to.equal(`\t\r`);
    });

    it('ban: non-allowlisted string methods', () => {
      expect(() => {
        evaluate('"abc".anchor()');
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('"abc".includes("ab")');
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('"abc".link()');
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('"abc".repeat(2)');
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('"abc".search()');
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('"  abc  ".trim()');
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('"abc  ".trimRight()');
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('"  abc".trimLeft()');
      }).to.throw(Error, unsupportedFunctionError);
    });
  });

  describe('numbers', () => {
    it('prototype functions', () => {
      expect(evaluate('3.14.toExponential()')).to.equal('3.14e+0');
      expect(evaluate('3.14.toFixed()')).to.equal('3');
      expect(evaluate('3.14.toPrecision(2)')).to.equal('3.1');
      expect(evaluate('3.14.toString()')).to.equal('3.14');
    });
  });

  describe('variables', () => {
    it('basic support', () => {
      expect(evaluate('foo', {foo: 'bar'})).to.equal('bar');
      expect(evaluate('foo', {foo: 1})).to.equal(1);
      expect(evaluate('foo', {foo: [1, 2, 3]})).to.deep.equal([1, 2, 3]);
      expect(evaluate('foo', {foo: {'bar': 'qux'}})).to.deep.equal({
        bar: 'qux',
      });
      expect(evaluate('{"foo": bar}', {bar: 'qux'})).to.deep.equal({
        foo: 'qux',
      });
      expect(evaluate('[foo]', {foo: 'bar'})).to.deep.equal(['bar']);
      expect(evaluate('foo[1]', {foo: ['b', 'c']})).to.equal('c');
      expect(evaluate('foo.length', {foo: [1, 2, 3]})).to.equal(3);
      expect(evaluate('"abc".charAt(foo)', {foo: 1})).to.equal('b');
    });
  });

  describe('arrays', () => {
    it('literals', () => {
      expect(evaluate('[]')).to.deep.equal([]);
      expect(evaluate('["a", "b"].length')).to.equal(2);
      expect(evaluate('[1, "a", [], {}]')).to.deep.equal([1, 'a', [], {}]);
      expect(evaluate('["a", "b"][1]')).to.equal('b');
      expect(evaluate('["a", foo][1]', {foo: 'b'})).to.equal('b');
    });

    it('trailing commas in literals', () => {
      expect(evaluate('[1,2,3,]')).to.deep.equal([1, 2, 3]);
      expect(evaluate('["a", "b",].length')).to.equal(2);
      expect(evaluate('[1, "a", [], {},]')).to.deep.equal([1, 'a', [], {}]);
      expect(evaluate('["a", "b",][1]')).to.equal('b');
      expect(evaluate('["a", foo,][1]', {foo: 'b'})).to.equal('b');
    });

    it('invalid array access', () => {
      expect(evaluate('["a", "b"][-1]')).to.be.null;
      expect(evaluate('["a", "b"][2]')).to.be.null;
      expect(evaluate('["a", "b"][0.5]')).to.be.null;
      expect(evaluate('["a", "b"]["a"]')).to.be.null;
      expect(evaluate('["a", []][[]]')).to.be.null;
      expect(evaluate('["a", {}][{}]')).to.be.null;
    });

    it('prototype functions', () => {
      expect(evaluate('["a", "b"].concat(["c", "d"])')).to.deep.equal([
        'a',
        'b',
        'c',
        'd',
      ]);
      expect(evaluate('["a", "a"].indexOf("a")')).to.equal(0);
      expect(evaluate('["a", "b", "c"].join("-")')).to.equal('a-b-c');
      expect(evaluate('["a", "a"].lastIndexOf("a")')).to.equal(1);
      expect(evaluate('["a", "b", "c"].slice(1, 2)')).to.deep.equal(['b']);
      expect(evaluate('[1, 2, 3, 4, 5].includes(3)')).to.be.true;
    });

    it('custom Array#sort()', () => {
      expect(evaluate('[11, 1, 2].sort()')).to.deep.equal([1, 11, 2]);
      expect(evaluate('[11, 1, 2].sort((x, y) => x - y)')).to.deep.equal([
        1, 2, 11,
      ]);

      const a = [11, 1, 2];
      expect(evaluate('a.sort()', {a})).to.deep.equal([1, 11, 2]);
      expect(evaluate('a.sort((x, y) => x - y)', {a})).to.deep.equal([
        1, 2, 11,
      ]);

      // Sort should be out-of-place i.e. does not sort the caller.
      expect(evaluate('a.sort().concat(a)', {a})).to.deep.equal([
        1, 11, 2, 11, 1, 2,
      ]);
    });

    it('custom Array#splice()', () => {
      expect(evaluate('[1, 2, 3].splice()')).to.deep.equal([1, 2, 3]);
      expect(evaluate('[1, 2, 3].splice(1)')).to.deep.equal([1]);
      expect(evaluate('[1, 2, 3].splice(1, 1)')).to.deep.equal([1, 3]);
      expect(evaluate('[1, 2, 3].splice(1, 1, 47)')).to.deep.equal([1, 47, 3]);

      const a = [1, 2, 3];
      expect(evaluate('a.splice()', {a})).to.deep.equal([1, 2, 3]);
      expect(evaluate('a.splice(1)', {a})).to.deep.equal([1]);
      expect(evaluate('a.splice(1, 1)', {a})).to.deep.equal([1, 3]);
      expect(evaluate('a.splice(1, 1, 47)', {a})).to.deep.equal([1, 47, 3]);

      // Splice should be out-of-place i.e. does not splice the caller.
      expect(evaluate('a.splice(1).concat(a)', {a})).to.deep.equal([
        1, 1, 2, 3,
      ]);
    });

    it('non-allowlisted functions', () => {
      expect(() => {
        evaluate('["a", "b", "c"].find()');
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('["a", "b", "c"].forEach()');
      }).to.throw(Error, unsupportedFunctionError);

      expect(() => {
        evaluate('foo.find()', {foo: ['a', 'b', 'c']});
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('foo.forEach()', {foo: ['a', 'b', 'c']});
      }).to.throw(Error, unsupportedFunctionError);
    });
  });

  describe('objects', () => {
    it('literals', () => {
      expect(evaluate('{}')).to.deep.equal({});
      expect(evaluate('{}["a"]')).to.be.null;
      expect(evaluate('{}[{}]')).to.be.null;
      expect(evaluate('{a: "b"}')).to.deep.equal({a: 'b'});
      expect(evaluate('{"a": "b"}')).to.deep.equal({'a': 'b'});
      expect(evaluate('{123: "b"}')).to.deep.equal({123: 'b'});
      expect(evaluate('{true: "b"}')).to.deep.equal({true: 'b'});
      expect(evaluate('{null: "b"}')).to.deep.equal({null: 'b'});
      // Unquoted string keys should _not_ be evaluated as expressions.
      expect(evaluate('{a: "b"}', {a: 'foo'})).to.deep.equal({a: 'b'});
      expect(() => evaluate('{1+1: "b"}')).to.throw();
    });

    it('computed property names', () => {
      expect(evaluate('{["a" + "b" + "c"]: 123}')).to.deep.equal({abc: 123});
      expect(evaluate('{[foo]: 123}', {foo: 'abc'})).to.deep.equal({abc: 123});
    });

    it('trailing commas in object literals', () => {
      expect(evaluate('{a: "b",}')).to.deep.equal({a: 'b'});
      expect(evaluate('{a: "b", c: "d",}')).to.deep.equal({a: 'b', c: 'd'});
    });

    it('undefined vars and properties should be null', () => {
      expect(evaluate('foo')).to.be.null;
      expect(evaluate('foo.bar')).to.be.null;
      expect(evaluate('foo["bar"]')).to.be.null;
      expect(evaluate('foo[bar]')).to.be.null;
      expect(evaluate('foo[0]')).to.be.null;
    });

    it('static functions', () => {
      expect(evaluate('keys({a: 1, b: 2})')).to.deep.equal(['a', 'b']);
      expect(evaluate('values({a: 1, b: 2})')).to.deep.equal([1, 2]);
    });
  });

  describe('function invocation', () => {
    it('Math functions', () => {
      expect(evaluate('abs(-1)')).to.equal(1);
      expect(evaluate('ceil(0.1)')).to.equal(1);
      expect(evaluate('floor(1.9)')).to.equal(1);
      expect(evaluate('max(0, 1)')).to.equal(1);
      expect(evaluate('min(0, 1)')).to.equal(0);
      expect(evaluate('round(0.6)')).to.equal(1);
      expect(evaluate('pow(2, 2)')).to.equal(4);
      expect(evaluate('sqrt(4)')).to.equal(2);
      expect(evaluate('log(20.2)')).to.equal(3.005682604407159);
      const r = evaluate('random()');
      expect(r).to.be.at.least(0);
      expect(r).to.be.at.below(1);
      expect(evaluate('sign(-1)')).to.equal(-1);

      // Functions should not conflict with scope variables.
      expect(evaluate('abs(-2) + abs', {abs: 2})).to.equal(4);
      expect(evaluate('sqrt(4) + sqrt', {sqrt: 2})).to.equal(4);
      expect(evaluate('log(20) + log', {log: 1})).to.equal(3.995732273553991);

      // Don't support non-allowlisted functions.
      expect(() => {
        evaluate('sin(0.5)');
      }).to.throw(unsupportedFunctionError);
      expect(() => {
        evaluate('trunc(13.37)');
      }).to.throw(unsupportedFunctionError);

      // Don't support calling functions with `Math.` prefix.
      expect(() => {
        evaluate('Math.abs(-1)', {Math});
      }).to.throw(unsupportedFunctionError);

      expect(() => {
        evaluate('Math.sqrt(4)', {Math});
      }).to.throw(unsupportedFunctionError);

      expect(() => {
        evaluate('Math.log(20.2)', {Math});
      }).to.throw(unsupportedFunctionError);
    });

    it('encodeURI and encodeURIComponent', () => {
      expect(
        evaluate('encodeURI("http://google.com/s p a c e.html")')
      ).to.equal('http://google.com/s%20p%20a%20c%20e.html');
      expect(
        evaluate('encodeURIComponent("http://google.com/foo?foo=bar")')
      ).to.equal('http%3A%2F%2Fgoogle.com%2Ffoo%3Ffoo%3Dbar');
    });

    it('splice()', () => {
      const a = [1, 2, 3];
      expect(() => evaluate('splice()')).to.throw(/not an array/);
      expect(() => evaluate('splice(x)', {x: 8472})).to.throw(/not an array/);
      expect(evaluate('splice(a)', {a})).to.not.equal(a);
      expect(evaluate('splice(a)', {a})).to.deep.equal(a);
      expect(evaluate('splice(a, 1)', {a})).to.deep.equal([1]);
      expect(evaluate('splice(a, 1, 1)', {a})).to.deep.equal([1, 3]);
      expect(evaluate('splice(a, 1, 1, 47)', {a})).to.deep.equal([1, 47, 3]);
    });

    it('sort()', () => {
      const a = [2, 3, 1];
      expect(() => evaluate('sort()')).to.throw(/not an array/);
      expect(() => evaluate('sort("abc")')).to.throw(/not an array/);
      expect(evaluate('sort(a)', {a})).to.not.equal(a);
      expect(evaluate('sort(a)', {a})).to.deep.equal([1, 2, 3]);
    });

    it('return null when caller is null', () => {
      expect(evaluate('null.charAt(0)')).to.be.null;
      expect(evaluate('null.includes(3)')).to.be.null;
      expect(evaluate('a.indexOf("baz")', {a: null})).to.be.null;
      expect(evaluate('(false || null).replace("foo", "bar")')).to.be.null;
    });

    it('disallow: function declarations', () => {
      expect(() => {
        evaluate('(function() {})');
      }).to.throw();
      expect(() => {
        evaluate('function foo() {}');
      }).to.throw();
      expect(() => {
        evaluate('new Function()');
      }).to.throw();
      expect(() => {
        evaluate('Function()');
      }).to.throw();
      expect(() => {
        evaluate('() => {}');
      }).to.throw();
      expect(() => {
        evaluate('class Foo {}');
      }).to.throw();
    });

    it('disallow: invocation of custom functions in scope', () => {
      const scope = {
        foo: {
          bar: () => {
            'bar';
          },
        },
        baz: () => {
          'baz';
        },
        qux: window.Function,
      };
      // baz() throws a parse error because functions must have a caller.
      expect(() => {
        evaluate('baz()', scope);
      }).to.throw();
      expect(() => {
        evaluate('foo.bar()', scope);
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('foo.qux("a", "return a")', scope);
      }).to.throw(unsupportedFunctionError);
    });

    it('disallow: invocation of prototype functions', () => {
      const scope = {
        foo: '',
        bar: [],
      };
      expect(() => {
        evaluate('foo.constructor()', scope);
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('foo.__defineGetter__()', scope);
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('foo.__defineSetter__()', scope);
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('bar.constructor()', scope);
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('bar.__defineGetter__()', scope);
      }).to.throw(Error, unsupportedFunctionError);
      expect(() => {
        evaluate('bar.__defineSetter__()', scope);
      }).to.throw(Error, unsupportedFunctionError);
    });

    it('disallow: object in arguments for most functions', () => {
      expect(() => {
        evaluate('[1, 2, 3].indexOf({})');
      }).to.throw(Error, argumentTypeError);
      expect(() => {
        evaluate('"abc".substr({})');
      }).to.throw(Error, argumentTypeError);

      // Only allow objects in arguments for some functions.
      expect(evaluate('keys({x: 2})')).to.deep.equal(['x']);
      expect(evaluate('values({x: 2})')).to.deep.equal([2]);
      expect(evaluate('splice([1, 3], 1, 0, {x: 2})')).to.deep.equal([
        1,
        {x: 2},
        3,
      ]);
    });
  });

  describe('banned', () => {
    it('disallow: prototype property access', () => {
      expect(evaluate('constructor')).to.be.null;
      expect(evaluate('prototype')).to.be.null;
      expect(evaluate('__proto__')).to.be.null;

      expect(evaluate('{}.constructor')).to.be.null;
      expect(evaluate('{}.prototype')).to.be.null;
      expect(evaluate('{}.__proto__')).to.be.null;

      expect(evaluate('[].constructor')).to.be.null;
      expect(evaluate('[].prototype')).to.be.null;
      expect(evaluate('[].__proto__')).to.be.null;

      expect(evaluate('"abc".constructor')).to.be.null;
      expect(evaluate('"abc".prototype')).to.be.null;
      expect(evaluate('"abc".__proto__')).to.be.null;

      expect(evaluate('123.constructor')).to.be.null;
      expect(evaluate('123.prototype')).to.be.null;
      expect(evaluate('123.__proto__')).to.be.null;

      const scope = {
        foo: {},
        bar: [],
        baz: 'abc',
        qux: 123,
      };

      expect(evaluate('foo.constructor', scope)).to.be.null;
      expect(evaluate('foo.prototype', scope)).to.be.null;
      expect(evaluate('foo.__proto__', scope)).to.be.null;

      expect(evaluate('bar.constructor', scope)).to.be.null;
      expect(evaluate('bar.prototype', scope)).to.be.null;
      expect(evaluate('bar.__proto__', scope)).to.be.null;

      expect(evaluate('baz.constructor', scope)).to.be.null;
      expect(evaluate('baz.prototype', scope)).to.be.null;
      expect(evaluate('baz.__proto__', scope)).to.be.null;

      expect(evaluate('qux.constructor', scope)).to.be.null;
      expect(evaluate('qux.prototype', scope)).to.be.null;
      expect(evaluate('qux.__proto__', scope)).to.be.null;
    });

    it('disallow: loops', () => {
      expect(() => {
        evaluate('if (foo) "bar"', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('switch (foo) { case 0: "bar" }', {foo: 0});
      }).to.throw();
      expect(() => {
        evaluate('for (;;) {}');
      }).to.throw();
      expect(() => {
        evaluate('while (true) {}');
      }).to.throw();
      expect(() => {
        evaluate('do {} while (true)');
      }).to.throw();
      expect(() => {
        evaluate('for (var i in foo) {}', {foo: [1, 2, 3]});
      }).to.throw();
      expect(() => {
        evaluate('for (var i of foo) {}', {foo: [1, 2, 3]});
      }).to.throw();
    });

    /** @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects */
    it('disallow: globals', () => {
      expect(evaluate('window')).to.be.null;
      expect(evaluate('arguments')).to.be.null;

      expect(evaluate('Infinity')).to.be.null;
      expect(evaluate('NaN')).to.be.null;
      expect(evaluate('undefined')).to.be.null;

      expect(() => {
        evaluate('eval()');
      }).to.throw();
      expect(() => {
        evaluate('uneval()');
      }).to.throw();
      expect(() => {
        evaluate('isFinite()');
      }).to.throw();
      expect(() => {
        evaluate('isNaN()');
      }).to.throw();
      expect(() => {
        evaluate('parseFloat()');
      }).to.throw();
      expect(() => {
        evaluate('parseInt()');
      }).to.throw();
      expect(() => {
        evaluate('decodeURI()');
      }).to.throw();
      expect(() => {
        evaluate('decodeURIComponent()');
      }).to.throw();
      expect(() => {
        evaluate('escape()');
      }).to.throw();
      expect(() => {
        evaluate('unescape()');
      }).to.throw();

      expect(evaluate('Object')).to.be.null;
      expect(evaluate('Function')).to.be.null;
      expect(evaluate('Boolean')).to.be.null;
      expect(evaluate('Symbol')).to.be.null;
      expect(evaluate('Error')).to.be.null;
      expect(evaluate('EvalError')).to.be.null;
      expect(evaluate('InternalError')).to.be.null;
      expect(evaluate('RangeError')).to.be.null;
      expect(evaluate('ReferenceError')).to.be.null;
      expect(evaluate('SyntaxError')).to.be.null;
      expect(evaluate('TypeError')).to.be.null;
      expect(evaluate('URIError')).to.be.null;

      expect(evaluate('Number')).to.be.null;
      expect(evaluate('Math')).to.be.null;
      expect(evaluate('Date')).to.be.null;

      expect(evaluate('String')).to.be.null;
      expect(evaluate('RegExp')).to.be.null;

      expect(evaluate('Array')).to.be.null;
      expect(evaluate('Int8Array')).to.be.null;
      expect(evaluate('Uint8Array')).to.be.null;
      expect(evaluate('Uint8ClampedArray')).to.be.null;
      expect(evaluate('Int16Array')).to.be.null;
      expect(evaluate('Uint16Array')).to.be.null;
      expect(evaluate('Int32Array')).to.be.null;
      expect(evaluate('Uint32Array')).to.be.null;
      expect(evaluate('Float32Array')).to.be.null;
      expect(evaluate('Float64Array')).to.be.null;

      expect(evaluate('Map')).to.be.null;
      expect(evaluate('Set')).to.be.null;
      expect(evaluate('WeakMap')).to.be.null;
      expect(evaluate('WeakSet')).to.be.null;

      expect(evaluate('ArrayBuffer')).to.be.null;
      expect(evaluate('SharedArrayBuffer')).to.be.null;
      expect(evaluate('Atomics')).to.be.null;
      expect(evaluate('DataView')).to.be.null;
      expect(evaluate('JSON')).to.be.null;

      expect(evaluate('Promise')).to.be.null;
      expect(evaluate('Generator')).to.be.null;
      expect(evaluate('GeneratorFunction')).to.be.null;
      expect(evaluate('AsyncFunction')).to.be.null;

      expect(evaluate('Reflect')).to.be.null;
      expect(evaluate('Proxy')).to.be.null;

      expect(evaluate('Intl')).to.be.null;

      expect(evaluate('Iterator')).to.be.null;
      expect(evaluate('ParallelArray')).to.be.null;
      expect(evaluate('StopIteration')).to.be.null;
    });

    it('disallow: exceeding maximum AST size', () => {
      expect(new BindExpression('1 + 1', {}, /* maxAstSize */ 3)).to.not.be
        .null;

      // The expression '1 + 1' should have an AST size of 3 -- one for each
      // literal, and a PLUS expression wrapping them.
      expect(() => {
        new BindExpression('1 + 1', {}, /* maxAstSize */ 2);
      }).to.throw(expressionSizeExceededError);

      // Test size computation for macros.
      const add = new BindMacro({
        name: 'add',
        argumentNames: ['x', 'y'],
        expressionString: 'x + y',
      });
      expect(add.getExpressionSize()).to.equal(3);

      // The expression add(1, 1) should have an AST size of 3.
      expect(new BindExpression('add(1, 1)', {add}, /* maxAstSize */ 3)).to.not
        .be.null;

      expect(() => {
        new BindExpression('add(1, 1)', {add}, /* maxAstSize */ 2);
      }).to.throw(expressionSizeExceededError);

      // The expression add(1, 1 + 1) should have an AST size of 5.
      expect(new BindExpression('add(1, 1 + 1)', {add}, /* maxAstSize */ 5)).to
        .not.be.null;

      expect(() => {
        new BindExpression('add(1, 1 + 1)', {add}, /* maxAstSize */ 4);
      }).to.throw(expressionSizeExceededError);
    });
  });

  describe('arrow functions', () => {
    it('known issue: single parameters with parentheses are ambiguous', () => {
      // Single parameters in parentheses are ambiguous to the parser.
      expect(() => evaluate('[1, 2, 3].map((x) => x * x)')).to.throw();
    });

    it('return a non-primitive', () => {
      expect(evaluate('[0].map(x => ({a: x + 1}))')).to.deep.equal([{a: 1}]);
      expect(evaluate('[0].map(x => [x, x+1])')).to.deep.equal([[0, 1]]);
    });

    it('Array#map()', () => {
      const a = [1, 2, 3];
      expect(evaluate('a.map(() => 5)', {a})).to.deep.equal([5, 5, 5]);
      expect(evaluate('a.map(x => x + 1)', {a})).to.deep.equal([2, 3, 4]);
      expect(evaluate('a.map((x, i) => i * 2)', {a})).to.deep.equal([0, 2, 4]);

      const b = [{foo: 'x'}, {foo: 'y'}, {foo: 'z'}];
      expect(evaluate('b.map(x => x.foo)', {b})).to.deep.equal(['x', 'y', 'z']);
    });

    it('Array#reduce()', () => {
      const a = [1, 2, 3];
      expect(evaluate('a.reduce((x, y) => x + y)', {a})).to.equal(6);
      expect(evaluate('a.reduce((x, y) => x + y, 4)', {a})).to.equal(10);
    });

    it('Array#filter', () => {
      const a = [1, 2, 3];
      expect(evaluate('a.filter(x => x > 1)', {a})).to.deep.equal([2, 3]);
    });

    it('Array#some', () => {
      const a = [1, 2, 3];
      expect(evaluate('a.some(x => x == 0)', {a})).to.be.false;
      expect(evaluate('a.some(x => x == 1)', {a})).to.be.true;
    });

    it('disallow: usage other than as function parameter', () => {
      expect(() => {
        evaluate('() => 123');
      }).to.throw();
      expect(() => {
        evaluate('x => 123');
      }).to.throw();
      expect(() => {
        evaluate('(x, y) => 123');
      }).to.throw();

      expect(() => {
        evaluate('(() => 123).constructor()');
      }).to.throw();
      expect(() => {
        evaluate('(x => 123).constructor()');
      }).to.throw();
      expect(() => {
        evaluate('((x, y) => 123).constructor()');
      }).to.throw();

      expect(() => {
        evaluate('(() => 123).name');
      }).to.throw();
      expect(() => {
        evaluate('(x => 123).name');
      }).to.throw();
      expect(() => {
        evaluate('((x, y) => 123).name');
      }).to.throw();
    });

    it('disallow: `arguments` or `this`', () => {
      const a = [1, 2, 3];
      expect(evaluate('a.map(() => arguments)', {a})).to.deep.equal([
        null,
        null,
        null,
      ]);
      expect(evaluate('a.reduce(() => arguments)', {a})).to.deep.equal(null);

      expect(evaluate('a.map(() => this)', {a})).to.deep.equal([
        null,
        null,
        null,
      ]);
      expect(evaluate('a.reduce(() => this)', {a})).to.deep.equal(null);
    });
  });
});
