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

import {evaluateBindExpr} from '../bind-expr';

describe('evaluateBindExpr', () => {
  const argumentTypeError = 'Unexpected argument type';
  const unsupportedFunctionError = 'not a supported function';

  it('should evaluate arithmetic operations', () => {
    expect(evaluateBindExpr('-1')).to.equal(-1);
    expect(evaluateBindExpr('1 + 2')).to.equal(3);
    expect(evaluateBindExpr('2 - 3.5')).to.equal(-1.5);
    expect(evaluateBindExpr('3 * 4')).to.equal(12);
    expect(evaluateBindExpr('4 / 5')).to.equal(0.8);
    expect(evaluateBindExpr('5 % 4')).to.equal(1);
    expect(evaluateBindExpr('1 / 0')).to.be.Infinity;
    expect(evaluateBindExpr('0 / 0')).to.be.NaN;
  });

  it('should evaluate comparison operations', () => {
    expect(evaluateBindExpr('2 > 1')).to.be.true;
    expect(evaluateBindExpr('1 > 1')).to.be.false;
    expect(evaluateBindExpr('1 >= 1')).to.be.true;
    expect(evaluateBindExpr('1 >= 2')).to.be.false;
    expect(evaluateBindExpr('1 < 2')).to.be.true;
    expect(evaluateBindExpr('0 < 0')).to.be.false;
    expect(evaluateBindExpr('1 <= 1')).to.be.true;
    expect(evaluateBindExpr('1 <= 0')).to.be.false;
    expect(evaluateBindExpr('0 == 1')).to.be.false;
    expect(evaluateBindExpr('1 == 1')).to.be.true;
    expect(evaluateBindExpr('0 != 1')).to.be.true;
    expect(evaluateBindExpr('1 != 1')).to.be.false;
  });

  it('should evaluate logical operations', () => {
    expect(evaluateBindExpr('!false')).to.be.true;
    expect(evaluateBindExpr('true && true')).to.be.true;
    expect(evaluateBindExpr('true && false')).to.be.false;
    expect(evaluateBindExpr('false && false')).to.be.false;
    expect(evaluateBindExpr('true || true')).to.be.true;
    expect(evaluateBindExpr('true || false')).to.be.true;
    expect(evaluateBindExpr('false || false')).to.be.false;
  });

  it('should evaluate ternary operator', () => {
    expect(evaluateBindExpr('true ? "a" : "b"')).to.be.equal('a');
    expect(evaluateBindExpr('false ? "a" : "b"')).to.be.equal('b');
  });

  it('should respect arithmetic operator precedence', () => {
    expect(evaluateBindExpr('-1 + 2')).to.equal(1);
    expect(evaluateBindExpr('1 - -0.5')).to.equal(1.5);
    expect(evaluateBindExpr('1 + -2 * 3')).to.equal(-5);
    expect(evaluateBindExpr('1 / 2 - 3')).to.equal(-2.5);
    expect(evaluateBindExpr('4 % 3 - 2 * 1')).to.equal(-1);
  });

  it('should respect comparison operator precedence', () => {
    expect(evaluateBindExpr('true == 2 > 1')).to.equal(true);
    expect(evaluateBindExpr('true == 2 >= 1')).to.equal(true);
    expect(evaluateBindExpr('true == 2 < 1')).to.equal(false);
    expect(evaluateBindExpr('true == 2 <= 1')).to.equal(false);
    expect(evaluateBindExpr('1 > 2 == true')).to.equal(false);
    expect(evaluateBindExpr('1 >= 2 == true')).to.equal(false);
    expect(evaluateBindExpr('1 < 2 == true')).to.equal(true);
    expect(evaluateBindExpr('1 <= 2 == true')).to.equal(true);
  });

  it('should respect logical operator precedence', () => {
    expect(evaluateBindExpr('!false && true')).to.be.true;
    expect(evaluateBindExpr('false || !true')).to.be.false;
    expect(evaluateBindExpr('true && false || true')).to.be.true;
    expect(evaluateBindExpr('true && false == false')).to.be.true;
    expect(evaluateBindExpr('false || false == true')).to.be.false;
    expect(evaluateBindExpr('false == !true')).to.be.true;
  });

  it('should support strings', () => {
    expect(evaluateBindExpr('"a"')).to.equal('a');
    expect(evaluateBindExpr('"a".length')).to.equal(1);
    expect(evaluateBindExpr('"a" + "b"')).to.equal('ab');
    expect(evaluateBindExpr('"a" + 1')).to.equal('a1');
    expect(evaluateBindExpr('+"1"')).to.equal(1);
  });

  it('should support string whitelisted methods', () => {
    expect(evaluateBindExpr('"abc".charAt(0)')).to.equal('a');
    expect(evaluateBindExpr('"abc".charCodeAt(0)')).to.equal(97);
    expect(evaluateBindExpr('"abc".concat("def")')).to.equal('abcdef');
    expect(evaluateBindExpr('"abc".includes("ab")')).to.equal(true);
    expect(evaluateBindExpr('"abc".indexOf("b")')).to.equal(1);
    expect(evaluateBindExpr('"aaa".lastIndexOf("a")')).to.equal(2);
    expect(evaluateBindExpr('"ab".repeat(2)')).to.equal('abab');
    expect(evaluateBindExpr('"abc".slice(0, 2)')).to.equal('ab');
    expect(evaluateBindExpr('"a-b-c".split("-")'))
        .to.deep.equal(['a', 'b', 'c']);
    expect(evaluateBindExpr('"abc".substr(1)')).to.equal('bc');
    expect(evaluateBindExpr('"abc".substring(0, 2)')).to.equal('ab');
    expect(evaluateBindExpr('"ABC".toLowerCase()')).to.equal('abc');
    expect(evaluateBindExpr('"abc".toUpperCase()')).to.equal('ABC');
  });

  it('should NOT allow access to non-whitelisted string methods', () => {
    expect(() => {
      evaluateBindExpr('"abc".anchor()');
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('"abc".link()');
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('"abc".replace("bc", "xy")');
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('"abc".search()');
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('"  abc  ".trim()');
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('"abc  ".trimRight()');
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('"  abc".trimLeft()');
    }).to.throw(Error, unsupportedFunctionError);
  });

  it('should support variables', () => {
    expect(evaluateBindExpr('foo', {foo: 'bar'})).to.equal('bar');
    expect(evaluateBindExpr('foo', {foo: 1})).to.equal(1);
    expect(evaluateBindExpr('foo', {foo: [1, 2, 3]})).to.deep.equal([1, 2, 3]);
    expect(evaluateBindExpr('foo', {foo: {'bar': 'qux'}}))
        .to.deep.equal({bar: 'qux'});
    expect(evaluateBindExpr('{foo: "bar"}', {foo: 'qux'}))
        .to.deep.equal({qux: 'bar'});
    expect(evaluateBindExpr('{"foo": bar}', {bar: 'qux'}))
        .to.deep.equal({foo: 'qux'});
    expect(evaluateBindExpr('[foo]', {foo: 'bar'})).to.deep.equal(['bar']);
    expect(evaluateBindExpr('foo[1]', {foo: ['b', 'c']})).to.equal('c');
    expect(evaluateBindExpr('foo.length', {foo: [1, 2, 3]})).to.equal(3);
    expect(evaluateBindExpr('"abc".charAt(foo)', {foo: 1})).to.equal('b');
  });

  it('should support array literals', () => {
    expect(evaluateBindExpr('[]')).to.deep.equal([]);
    expect(evaluateBindExpr('["a", "b"].length')).to.equal(2);
    expect(evaluateBindExpr('[1, "a", [], {}]'))
        .to.deep.equal([1, 'a', [], {}]);
    expect(evaluateBindExpr('["a", "b"][1]')).to.equal('b');
    expect(evaluateBindExpr('["a", foo][1]', {foo: 'b'})).to.equal('b');
  });

  it('should NOT allow invalid array access', () => {
    expect(evaluateBindExpr('["a", "b"][-1]')).to.be.null;
    expect(evaluateBindExpr('["a", "b"][2]')).to.be.null;
    expect(evaluateBindExpr('["a", "b"][0.5]')).to.be.null;
    expect(evaluateBindExpr('["a", "b"]["a"]')).to.be.null;
    expect(evaluateBindExpr('["a", []][[]]')).to.be.null;
    expect(evaluateBindExpr('["a", {}][{}]')).to.be.null;
  });

  it('should support array whitelisted methods', () => {
    expect(evaluateBindExpr('["a", "b"].concat(["c", "d"])'))
        .to.deep.equal(['a', 'b', 'c', 'd']);
    expect(evaluateBindExpr('["a"].includes("a")')).to.be.true;
    expect(evaluateBindExpr('["a", "a"].indexOf("a")')).to.equal(0);
    expect(evaluateBindExpr('["a", "b", "c"].join("-")')).to.equal('a-b-c');
    expect(evaluateBindExpr('["a", "a"].lastIndexOf("a")')).to.equal(1);
    expect(evaluateBindExpr('["a", "b", "c"].slice(1, 2)'))
        .to.deep.equal(['b']);
  });

  it('should NOT allow access to array non-whitelisted methods', () => {
    expect(() => {
      evaluateBindExpr('["a", "b", "c"].find()');
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('["a", "b", "c"].forEach()');
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('["a", "b", "c"].splice(1, 1)');
    }).to.throw(Error, unsupportedFunctionError);

    expect(() => {
      evaluateBindExpr('foo.find()', {foo: ['a', 'b', 'c']});
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('foo.forEach()', {foo: ['a', 'b', 'c']});
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('foo.splice(1, 1)', {foo: ['a', 'b', 'c']});
    }).to.throw(Error, unsupportedFunctionError);
  });

  it('should support object literals', () => {
    expect(evaluateBindExpr('{}')).to.deep.equal({});
    expect(evaluateBindExpr('{}["a"]')).to.be.null;
    expect(evaluateBindExpr('{}[{}]')).to.be.null;
    expect(evaluateBindExpr('{"a": "b"}')).to.deep.equal({'a': 'b'});
    expect(evaluateBindExpr('{foo: "b"}', {foo: 'a'}))
        .to.deep.equal({'a': 'b'});
  });

  it('should evaluate undefined vars and properties to null', () => {
    expect(evaluateBindExpr('foo')).to.be.null;
    expect(evaluateBindExpr('foo.bar')).to.be.null;
    expect(evaluateBindExpr('foo["bar"]')).to.be.null;
    expect(evaluateBindExpr('foo[bar]')).to.be.null;
    expect(evaluateBindExpr('foo[0]')).to.be.null;
  });

  it('should NOT allow access to prototype properties', () => {
    expect(evaluateBindExpr('constructor')).to.be.null;
    expect(evaluateBindExpr('prototype')).to.be.null;
    expect(evaluateBindExpr('__proto__')).to.be.null;

    expect(evaluateBindExpr('{}.constructor')).to.be.null;
    expect(evaluateBindExpr('{}.prototype')).to.be.null;
    expect(evaluateBindExpr('{}.__proto__')).to.be.null;

    expect(evaluateBindExpr('[].constructor')).to.be.null;
    expect(evaluateBindExpr('[].prototype')).to.be.null;
    expect(evaluateBindExpr('[].__proto__')).to.be.null;

    expect(evaluateBindExpr('"abc".constructor')).to.be.null;
    expect(evaluateBindExpr('"abc".prototype')).to.be.null;
    expect(evaluateBindExpr('"abc".__proto__')).to.be.null;

    expect(evaluateBindExpr('123.constructor')).to.be.null;
    expect(evaluateBindExpr('123.prototype')).to.be.null;
    expect(evaluateBindExpr('123.__proto__')).to.be.null;

    const scope = {
      foo: {},
      bar: [],
      baz: 'abc',
      qux: 123,
    };

    expect(evaluateBindExpr('foo.constructor', scope)).to.be.null;
    expect(evaluateBindExpr('foo.prototype', scope)).to.be.null;
    expect(evaluateBindExpr('foo.__proto__', scope)).to.be.null;

    expect(evaluateBindExpr('bar.constructor', scope)).to.be.null;
    expect(evaluateBindExpr('bar.prototype', scope)).to.be.null;
    expect(evaluateBindExpr('bar.__proto__', scope)).to.be.null;

    expect(evaluateBindExpr('baz.constructor', scope)).to.be.null;
    expect(evaluateBindExpr('baz.prototype', scope)).to.be.null;
    expect(evaluateBindExpr('baz.__proto__', scope)).to.be.null;

    expect(evaluateBindExpr('qux.constructor', scope)).to.be.null;
    expect(evaluateBindExpr('qux.prototype', scope)).to.be.null;
    expect(evaluateBindExpr('qux.__proto__', scope)).to.be.null;
  });

  it('should NOT allow operators with side effects', () => {
    expect(() => { evaluateBindExpr('foo = 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo += 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo -= 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo *= 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo /= 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo %= 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo **= 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo <<= 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo >>= 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo >>>= 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo &= 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo ^= 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo |= 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo++', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo--', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('~foo', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo << 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo >> 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('foo >>> 1', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('new Object()', {foo: 0}); }).to.throw();
    expect(() => { evaluateBindExpr('delete foo', {foo: 0}); }).to.throw();
  });

  it('should NOT allow control flow or loops', () => {
    expect(() => { evaluateBindExpr('if (foo) "bar"', {foo: 0}); }).to.throw();
    expect(() => {
      evaluateBindExpr('switch (foo) { case 0: "bar" }', {foo: 0});
    }).to.throw();
    expect(() => { evaluateBindExpr('for (;;) {}'); }).to.throw();
    expect(() => { evaluateBindExpr('while (true) {}'); }).to.throw();
    expect(() => { evaluateBindExpr('do {} while (true)'); }).to.throw();
    expect(() => {
      evaluateBindExpr('for (var i in foo) {}', {foo: [1, 2, 3]});
    }).to.throw();
    expect(() => {
      evaluateBindExpr('for (var i of foo) {}', {foo: [1, 2, 3]});
    }).to.throw();
  });

  it('should NOT allow function declarations', () => {
    expect(() => { evaluateBindExpr('function() {}'); }).to.throw();
    expect(() => { evaluateBindExpr('function foo() {}'); }).to.throw();
    expect(() => { evaluateBindExpr('new Function()'); }).to.throw();
    expect(() => { evaluateBindExpr('() => {}'); }).to.throw();
    expect(() => { evaluateBindExpr('class Foo {}'); }).to.throw();
  });

  it('should NOT allow invocation of custom functions in scope', () => {
    const scope = {
      foo: {
        bar: () => { 'bar'; },
      },
      baz: () => { 'baz'; },
    };
    // baz() throws a parse error because functions must have a caller.
    expect(() => { evaluateBindExpr('baz()', scope); }).to.throw();
    expect(() => {
      evaluateBindExpr('foo.bar()', scope);
    }).to.throw(Error, unsupportedFunctionError);
  });

  it('shoud NOT allow invocation of prototype functions', () => {
    const scope = {
      foo: '',
      bar: [],
    };
    expect(() => {
      evaluateBindExpr('foo.constructor()', scope);
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('foo.__defineGetter__()', scope);
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('foo.__defineSetter__()', scope);
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('bar.constructor()', scope);
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('bar.__defineGetter__()', scope);
    }).to.throw(Error, unsupportedFunctionError);
    expect(() => {
      evaluateBindExpr('bar.__defineSetter__()', scope);
    }).to.throw(Error, unsupportedFunctionError);
  });

  it('should NOT allow invocation of whitelisted functions ' +
      'with invalid argument types', () => {
    expect(() => {
      evaluateBindExpr('[1, 2, 3].indexOf({})');
    }).to.throw(Error, argumentTypeError);
    expect(() => {
      evaluateBindExpr('"abc".substr({})');
    }).to.throw(Error, argumentTypeError);
  });

  /** @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects */
  it('should NOT allow access to globals', () => {
    expect(evaluateBindExpr('window')).to.be.null;
    expect(evaluateBindExpr('arguments')).to.be.null;

    expect(evaluateBindExpr('Infinity')).to.be.null;
    expect(evaluateBindExpr('NaN')).to.be.null;
    expect(evaluateBindExpr('undefined')).to.be.null;

    expect(() => { evaluateBindExpr('eval()'); }).to.throw();
    expect(() => { evaluateBindExpr('uneval()'); }).to.throw();
    expect(() => { evaluateBindExpr('isFinite()'); }).to.throw();
    expect(() => { evaluateBindExpr('isNaN()'); }).to.throw();
    expect(() => { evaluateBindExpr('parseFloat()'); }).to.throw();
    expect(() => { evaluateBindExpr('parseInt()'); }).to.throw();
    expect(() => { evaluateBindExpr('decodeURI()'); }).to.throw();
    expect(() => { evaluateBindExpr('decodeURIComponent()'); }).to.throw();
    expect(() => { evaluateBindExpr('encodeURI()'); }).to.throw();
    expect(() => { evaluateBindExpr('encodeURIComponent()'); }).to.throw();
    expect(() => { evaluateBindExpr('escape()'); }).to.throw();
    expect(() => { evaluateBindExpr('unescape()'); }).to.throw();

    expect(evaluateBindExpr('Object')).to.be.null;
    expect(evaluateBindExpr('Function')).to.be.null;
    expect(evaluateBindExpr('Boolean')).to.be.null;
    expect(evaluateBindExpr('Symbol')).to.be.null;
    expect(evaluateBindExpr('Error')).to.be.null;
    expect(evaluateBindExpr('EvalError')).to.be.null;
    expect(evaluateBindExpr('InternalError')).to.be.null;
    expect(evaluateBindExpr('RangeError')).to.be.null;
    expect(evaluateBindExpr('ReferenceError')).to.be.null;
    expect(evaluateBindExpr('SyntaxError')).to.be.null;
    expect(evaluateBindExpr('TypeError')).to.be.null;
    expect(evaluateBindExpr('URIError')).to.be.null;

    expect(evaluateBindExpr('Number')).to.be.null;
    expect(evaluateBindExpr('Math')).to.be.null;
    expect(evaluateBindExpr('Date')).to.be.null;

    expect(evaluateBindExpr('String')).to.be.null;
    expect(evaluateBindExpr('RegExp')).to.be.null;

    expect(evaluateBindExpr('Array')).to.be.null;
    expect(evaluateBindExpr('Int8Array')).to.be.null;
    expect(evaluateBindExpr('Uint8Array')).to.be.null;
    expect(evaluateBindExpr('Uint8ClampedArray')).to.be.null;
    expect(evaluateBindExpr('Int16Array')).to.be.null;
    expect(evaluateBindExpr('Uint16Array')).to.be.null;
    expect(evaluateBindExpr('Int32Array')).to.be.null;
    expect(evaluateBindExpr('Uint32Array')).to.be.null;
    expect(evaluateBindExpr('Float32Array')).to.be.null;
    expect(evaluateBindExpr('Float64Array')).to.be.null;

    expect(evaluateBindExpr('Map')).to.be.null;
    expect(evaluateBindExpr('Set')).to.be.null;
    expect(evaluateBindExpr('WeakMap')).to.be.null;
    expect(evaluateBindExpr('WeakSet')).to.be.null;

    expect(evaluateBindExpr('ArrayBuffer')).to.be.null;
    expect(evaluateBindExpr('SharedArrayBuffer')).to.be.null;
    expect(evaluateBindExpr('Atomics')).to.be.null;
    expect(evaluateBindExpr('DataView')).to.be.null;
    expect(evaluateBindExpr('JSON')).to.be.null;

    expect(evaluateBindExpr('Promise')).to.be.null;
    expect(evaluateBindExpr('Generator')).to.be.null;
    expect(evaluateBindExpr('GeneratorFunction')).to.be.null;
    expect(evaluateBindExpr('AsyncFunction')).to.be.null;

    expect(evaluateBindExpr('Reflect')).to.be.null;
    expect(evaluateBindExpr('Proxy')).to.be.null;

    expect(evaluateBindExpr('Intl')).to.be.null;

    expect(evaluateBindExpr('Iterator')).to.be.null;
    expect(evaluateBindExpr('ParallelArray')).to.be.null;
    expect(evaluateBindExpr('StopIteration')).to.be.null;
  });

  /** @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators */
  it('should NOT allow access to non-whitelisted operators', () => {
    expect(evaluateBindExpr('this')).to.be.null;
    expect(evaluateBindExpr('self')).to.be.null;
    expect(evaluateBindExpr('global')).to.be.null;
    expect(evaluateBindExpr('function')).to.be.null;
    expect(evaluateBindExpr('class')).to.be.null;
    expect(evaluateBindExpr('yield')).to.be.null;
    expect(evaluateBindExpr('await')).to.be.null;
    expect(evaluateBindExpr('new')).to.be.null;
    expect(evaluateBindExpr('super')).to.be.null;

    expect(() => { evaluateBindExpr('function*'); }).to.throw();
    expect(() => { evaluateBindExpr('/ab+c/i'); }).to.throw();
    expect(() => { evaluateBindExpr('yield*'); }).to.throw();
    expect(() => { evaluateBindExpr('async function*'); }).to.throw();
  });
});
