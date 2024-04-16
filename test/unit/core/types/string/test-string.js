import {
  asyncStringReplace,
  camelCaseToDash,
  dashToCamelCase,
  endsWith,
  expandTemplate,
  includes,
  isString,
  padStart,
  trimEnd,
} from '#core/types/string';

describes.sandboxed('type helpers - strings', {}, () => {
  describe('dashToCamelCase', () => {
    it('should transform dashes to camel case.', () => {
      expect(dashToCamelCase('foo')).to.equal('foo');
      expect(dashToCamelCase('foo-bar')).to.equal('fooBar');
      expect(dashToCamelCase('foo-bar-baz')).to.equal('fooBarBaz');
      expect(dashToCamelCase('-foo')).to.equal('Foo');
    });
  });

  describe('endsWith', () => {
    it('should determine whether string ends with.', () => {
      expect(endsWith('a', 'a')).to.be.true;
      expect(endsWith('b', 'a')).to.be.false;
      expect(endsWith('ab', 'a')).to.be.false;
      expect(endsWith('aba', 'a')).to.be.true;
      expect(endsWith('aba', 'aba')).to.be.true;
      expect(endsWith('Xaba', 'aba')).to.be.true;
      expect(endsWith('Xaba', '')).to.be.true;
      expect(endsWith('', 'a')).to.be.false;
      expect(endsWith('aa', 'aaa')).to.be.false;
      expect(endsWith('aa', 'aaaa')).to.be.false;
      expect(endsWith('', '')).to.be.true;
    });
  });

  describe('includes', () => {
    it('should determine whether string includes.', () => {
      expect(includes('a', 'a')).to.be.true;
      expect(includes('a', 'a', 0)).to.be.true;
      expect(includes('a', 'a', 1)).to.be.false;
      expect(includes('b', 'a')).to.be.false;
      expect(includes('ab', 'a')).to.be.true;
      expect(includes('aba', 'a')).to.be.true;
      expect(includes('aba', 'aba')).to.be.true;
      expect(includes('Xaba', 'aba')).to.be.true;
      expect(includes('Xaba', '')).to.be.true;
      expect(includes('', 'a')).to.be.false;
      expect(includes('aa', 'aaa')).to.be.false;
      expect(includes('aa', 'aaaa')).to.be.false;
      expect(includes('', '')).to.be.true;
    });
  });

  describe('expandTemplate', () => {
    const data = {
      'x': 'Test 1',
      'y': 'Test 2',
      'test': 'test value',
      'test2': 'another test value',
      'tox': '${x}',
      'toy': '${y}',
      'toxy': '${x}${y}',
      'totoxy': '${toxy}',
      'loop1': '${loop2}',
      'loop2': '${loop1}',
      'loop': '${loop}',
    };

    function testGetter(key) {
      return data[key] || 'not found';
    }

    it('should replace place holders with values.', () => {
      expect(expandTemplate('${x}', testGetter)).to.equal('Test 1');
      expect(expandTemplate('${y}', testGetter)).to.equal('Test 2');
      expect(expandTemplate('${x} ${y}', testGetter)).to.equal('Test 1 Test 2');
      expect(expandTemplate('a${x}', testGetter)).to.equal('aTest 1');
      expect(expandTemplate('${x}a', testGetter)).to.equal('Test 1a');
      expect(expandTemplate('a${x}a', testGetter)).to.equal('aTest 1a');
      expect(expandTemplate('${unknown}', testGetter)).to.equal('not found');
    });

    it('should handle malformed place holders.', () => {
      expect(expandTemplate('${x', testGetter)).to.equal('${x');
      expect(expandTemplate('${', testGetter)).to.equal('${');
      expect(expandTemplate('$x}', testGetter)).to.equal('$x}');
      expect(expandTemplate('$x', testGetter)).to.equal('$x');
      expect(expandTemplate('{x}', testGetter)).to.equal('{x}');
      expect(expandTemplate('${{x}', testGetter)).to.equal('${{x}');
      expect(expandTemplate('${${x}', testGetter)).to.equal('${Test 1');
    });

    it('should default to one iteration.', () => {
      expect(expandTemplate('${tox}', testGetter)).to.equal('${x}');
      expect(expandTemplate('${toxy}', testGetter)).to.equal('${x}${y}');
    });

    it('should handle multiple iterations when asked to.', () => {
      expect(expandTemplate('${tox}', testGetter, 2)).to.equal('Test 1');
      expect(expandTemplate('${toxy}', testGetter, 2)).to.equal('Test 1Test 2');
      expect(expandTemplate('${totoxy}', testGetter, 2)).to.equal('${x}${y}');
      expect(expandTemplate('${totoxy}', testGetter, 3)).to.equal(
        'Test 1Test 2'
      );
      expect(expandTemplate('${totoxy}', testGetter, 10)).to.equal(
        'Test 1Test 2'
      );
    });

    it('should handle circular expansions without hanging', () => {
      expect(expandTemplate('${loop}', testGetter)).to.equal('${loop}');
      expect(expandTemplate('${loop}', testGetter), 10).to.equal('${loop}');
      expect(expandTemplate('${loop1}', testGetter), 10).to.equal('${loop2}');
    });
  });

  describe('camelCaseToDash', () => {
    it('should convert camelCase strings to dash-case strings', () => {
      expect(camelCaseToDash('foo')).to.equal('foo');
      expect(camelCaseToDash('fooBar')).to.equal('foo-bar');
      expect(camelCaseToDash('fooBarBaz')).to.equal('foo-bar-baz');
      // Not really valid camel case
      expect(camelCaseToDash('FooBarBaz')).to.equal('Foo-bar-baz');
      expect(camelCaseToDash('f00B4rB4z')).to.equal('f00-b4r-b4z');
      expect(camelCaseToDash('f00b4rb4z')).to.equal('f00b4rb4z');
      expect(camelCaseToDash('ABC')).to.equal('A-b-c');
      expect(camelCaseToDash('aBC')).to.equal('a-b-c');
    });
  });

  describe('trimEnd', () => {
    it('remove trailing spaces', () => {
      expect(trimEnd('abc ')).to.equal('abc');
    });

    it('remove trailing whitespace characters', () => {
      expect(trimEnd('abc\n\t')).to.equal('abc');
    });

    it('should keep leading spaces', () => {
      expect(trimEnd(' abc')).to.equal(' abc');
    });

    it('should keep leading whitespace characters', () => {
      expect(trimEnd('\n\tabc')).to.equal('\n\tabc');
    });
  });

  describe('asyncStringReplace', () => {
    it('should not replace with no match', () => {
      const result = asyncStringReplace('the quick silver fox', /brown/, 'red');
      return expect(result).to.eventually.equal('the quick silver fox');
    });

    it('should replace with string as callback', () => {
      const result = asyncStringReplace('the quick brown fox', /brown/, 'red');
      return expect(result).to.eventually.equal('the quick red fox');
    });

    it('should use replacer with special pattern', async () => {
      await expect(
        asyncStringReplace('the quick brown fox', /brown/, '$$')
      ).to.eventually.equal('the quick $ fox');
      await expect(
        asyncStringReplace('the quick brown fox', /brown/, 'purple $& grey')
      ).to.eventually.equal('the quick purple brown grey fox');
      await expect(
        asyncStringReplace('the quick brown fox', /brown/, "sweet $'")
      ).to.eventually.equal('the quick sweet  fox fox');
      await expect(
        asyncStringReplace('the quick brown fox', /brown/, '$`empathetic')
      ).to.eventually.equal('the quick the quick empathetic fox');
    });

    it('should replace with sync function as callback', () => {
      const result = asyncStringReplace(
        'the quick brown fox',
        /brown/,
        () => 'red'
      );
      return expect(result).to.eventually.equal('the quick red fox');
    });

    it('should replace with no capture groups', () => {
      const result = asyncStringReplace('the quick brown fox', /brown/, () =>
        Promise.resolve('red')
      );
      return expect(result).to.eventually.equal('the quick red fox');
    });

    it('should replace with one capture group', () => {
      const result = asyncStringReplace('item 798', /item (\d*)/, (match, p1) =>
        Promise.resolve(p1)
      );
      return expect(result).to.eventually.equal('798');
    });

    it('should replace with two capture groups', () => {
      const result = asyncStringReplace(
        'John Smith',
        /(\w+)\s(\w+)/,
        (match, p1, p2) => Promise.resolve(`${p2}, ${p1}`)
      );
      return expect(result).to.eventually.equal('Smith, John');
    });

    it('should replace twice', () => {
      const result = asyncStringReplace(
        'John 123 Smith 456 III',
        /(\d+)/g,
        () => Promise.resolve('**')
      );
      return expect(result).to.eventually.equal('John ** Smith ** III');
    });
  });

  describe('padStart', () => {
    it('should pad string to target length', () => {
      expect(padStart('abc', 4, ' ')).to.equal(' abc');
      expect(padStart('abc', 8, ' ')).to.equal('     abc');
    });

    it('should trim padString if necessary to fit target length', () => {
      expect(padStart('abc', 4, 'xy')).to.equal('xabc');
      expect(padStart('abc', 6, 'xy')).to.equal('xyxabc');
    });

    it('should return original string if equal or greater than target length', () => {
      expect(padStart('abc', 3, ' ')).to.equal('abc');
      expect(padStart('abc', 0, ' ')).to.equal('abc');
    });
  });

  describe('isString', () => {
    it('returns true for strings', () => {
      ['hello', '', `template ${1}`].forEach(
        (s) => expect(isString(s)).to.be.true
      );
    });

    it('returns true for anything else', () => {
      [[], {}, true, -1, null, undefined, function () {}].forEach(
        (s) => expect(isString(s)).to.be.false
      );
    });
  });
});
