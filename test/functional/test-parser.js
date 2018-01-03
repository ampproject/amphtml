import {GlobalVariableSource} from '../../src/service/url-replacements-impl';
import {findMatches, mergeMatches, parseUrlRecursively} from '../../src/service/parser';

describe('mergePositions', () => {
  const url = 'http://www.google.com/?client=CLIENT_ID(__ga)&canon=CANONICAL_URL&random=RANDOM';

  it('should handle empty', () => {
    const array = [];
    const expected = null;
    expect(mergeMatches(array, url)).to.deep.equal(expected);
  });

  it('should return single item', () => {
    const array = [
      {start: 58, stop: 64, length: 6, name: 'RANDOM'},
    ];
    const expected = [
      {start: 58, stop: 64, length: 6, name: 'RANDOM'},
    ];
    expect(mergeMatches(array, url)).to.deep.equal(expected);
  });

  it('should sort basic case', () => {
    const array = [
      {start: 58, stop: 64, length: 6, name: 'RANDOM'},
      {start: 37, stop: 50, length: 13, name: 'CANONICAL_URL'},
    ];
    const expected = [
      {start: 37, stop: 50, length: 13, name: 'CANONICAL_URL'},
      {start: 58, stop: 64, length: 6, name: 'RANDOM'},
    ];
    expect(mergeMatches(array, url)).to.deep.equal(expected);
  });

  it('should sort overlapping case', () => {
    const array = [
      {start: 58, stop: 64, length: 6, name: 'RANDOM'},
      {start: 37, stop: 50, length: 13, name: 'CANONICAL_URL'},
      {start: 45, stop: 70, length: 15, name: '123456789012345'},
    ];
    const expected = [
      {start: 45, stop: 70, length: 15, name: '123456789012345'},
    ];
    expect(mergeMatches(array, url)).to.deep.equal(expected);
  });

  it('should handle same start', () => {
    const array = [
      {start: 58, stop: 90, length: 13, name: 'CANONICAL_URL'},
      {start: 58, stop: 64, length: 6, name: 'RANDOM'},
    ];
    const expected = [
      {start: 58, stop: 90, length: 13, name: 'CANONICAL_URL'},
    ];
    expect(mergeMatches(array, url)).to.deep.equal(expected);
  });

  it('should handle keywords next to each other', () => {
    const array = [
      {start: 58, stop: 64, length: 13, name: 'CANONICAL_URL'},
      {start: 65, stop: 71, length: 6, name: 'RANDOM'},
    ];
    const expected = [
      {start: 58, stop: 64, length: 13, name: 'CANONICAL_URL'},
      {start: 65, stop: 71, length: 6, name: 'RANDOM'},
    ];
    expect(mergeMatches(array, url)).to.deep.equal(expected);
  });
});

function prep(url, varSource, opt_bindings) {
  const expr = varSource.getExpr(opt_bindings);
  const rawMatches = findMatches(url, expr);
  return mergeMatches(rawMatches);
}

function mockClientId(str) {
  if (str === '__ga') {
    return 'amp-GA578';
  }
  return 'amp-987654321';
}

// parseUrlRecursively(url, matches, variableSource, opt_bindings, opt_collectVars)
describes.realWin('parseUrlRecursively', {
  amp: {
    ampdoc: 'single',
  },
}, env => {
  let ampdoc;
  let globalVarSource;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    globalVarSource = new GlobalVariableSource(env.ampdoc);
  });

  const mockBindings = {
    RANDOM: () => 123456,
    CANONICAL_URL: 'www.google.com',
    CLIENT_ID: mockClientId,
  };

  it('should work', () => {
    const url = 'http://www.google.com/?client=CLIENT_ID(__ga)&canon=CANONICAL_URL&random=RANDOM';
    const expected = 'http://www.google.com/?client=amp-GA578&canon=www.google.com&random=123456';
    debugger;
    const matches = prep(url, globalVarSource);
    
    expect(parseUrlRecursively(url, matches).toBe(expected));
  });
});

// test('one function, one argument', () =>
//   expect(evaluateStringRecursively_('TRIM(aaaaa    )')).toBe('aaaaa')
// );

// test('one unknown function, one argument', () =>
//   expect(evaluateStringRecursively_('UNKNOWN(aaaaa)')).toBe('')
// );

// test('nested function one level', () =>
//   expect(evaluateStringRecursively_('UPPERCASE(TRIM(aaaaa    ))')).toBe('AAAAA')
// );

// test('nested function two levels', () =>
//   expect(evaluateStringRecursively_('LOWERCASE(UPPERCASE(TRIM(aAaA    )))')).toBe('aaaa')
// );

// test('one function, two string arguments', () =>
//   expect(evaluateStringRecursively_('CONCAT(aaa,bbb)')).toBe('aaabbb')
// );

// // should we return an empty string here?
// test('one bad function, two string arguments', () =>
//   expect(evaluateStringRecursively_('FAKE(aaa,bbb)')).toBe('')
// );

// test('one function, two string arguments with space', () =>
//   expect(evaluateStringRecursively_('CONCAT(aaa , bbb)')).toBe('aaabbb')
// );

// test('function with func then string as args', () =>
//   expect(evaluateStringRecursively_('CONCAT(UPPERCASE(aaa),bbb)')).toBe('AAAbbb')
// );

// test('function with const then string as args', () =>
//   expect(evaluateStringRecursively_('CONCAT(NAME(),bbb)')).toBe('AMPbbb')
// );

// test('function with bad function then string as args', () =>
//   expect(evaluateStringRecursively_('CONCAT(FAKE(aaa),bbb)')).toBe('bbb')
// );

// test('function with string then func as args', () =>
//   expect(evaluateStringRecursively_('CONCAT(aaa,UPPERCASE(bbb)')).toBe('aaaBBB')
// );

// test('function with two funcs as args', () =>
//   expect(evaluateStringRecursively_('CONCAT(LOWERCASE(AAA),UPPERCASE(bbb)')).toBe('aaaBBB')
// );

// test('function with three funcs as args', () =>
//   expect(evaluateStringRecursively_('CAT_THREE(LOWERCASE(AAA),UPPERCASE(bbb),LOWERCASE(CCC))')).toBe('aaaBBBccc')
// );


// QUESTIONS
// need to make sure we are returning the right things when not in map vs string inputs
// should we trim
// will trimming cause a problem with JSON()
// JSON input??
