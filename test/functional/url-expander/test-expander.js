/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Expander} from '../../../src/service/url-expander/expander';
import {GlobalVariableSource} from '../../../src/service/url-replacements-impl';
import {createElementWithAttributes} from '../../../src/dom';

describes.realWin('Expander', {
  amp: {
    ampdoc: 'single',
  },
}, env => {

  let expander;
  let variableSource;

  beforeEach(() => {
    variableSource = new GlobalVariableSource(env.ampdoc);
    expander = new Expander(variableSource);
  });


  describe('#eliminateOverlaps', () => {
    const mockBindings = {
      RANDOM: () => 0.1234,
      ABC: () => 'three',
      ABCD: () => 'four',
      BCDEF: () => 'five',
      ABCDEFGHIJ: () => 'ten',
      JKLMNOPQRS: () => 'ten',
      DEFGHIJKLMNOP: () => 'thirteen',
    };

    it('should handle empty', () => {
      const url = 'http://www.google.com/?test=FAKE(__ga)';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal(url);
    });

    it('should return single item', () => {
      const url = 'http://www.google.com/?test=RANDOM';
      const expected = 'http://www.google.com/?test=0.1234';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal(expected);
    });


    it('should sort basic case', () => {
      const url = 'http://www.google.com/?test=ABCD&BAR&foo=RANDOM';
      const expected = 'http://www.google.com/?test=four&BAR&foo=0.1234';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal(expected);
    });

    it('will always prefer the first match in overlap', () => {
      const url = 'http://www.google.com/?test=ABCDEFGHIJKLMNOPQRS';
      const expected = 'http://www.google.com/?test=tenKLMNOPQRS';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal(expected);
    });

    it('will prefer longer match if same start index', () => {
      const url = 'http://www.google.com/?test=ABCD';
      const expected = 'http://www.google.com/?test=four';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal(expected);
    });

    it('should handle keywords next to each other', () => {
      const url = 'http://www.google.com/?test=ABCDRANDOM';
      const expected = 'http://www.google.com/?test=four0.1234';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal(expected);
    });
  });

  describe('Whitelist of variables', () => {
    let variableSource;
    let expander;

    const mockBindings = {
      RANDOM: () => 0.1234,
      ABC: () => 'three',
      ABCD: () => 'four',
    };
    beforeEach(() => {
      env.win.document.head.appendChild(
          createElementWithAttributes(env.win.document, 'meta', {
            name: 'amp-allowed-url-macros',
            content: 'ABC,ABCD,CANONICAL',
          }));

      variableSource = new GlobalVariableSource(env.ampdoc);
      expander = new Expander(variableSource);
    });

    it('should not replace unwhitelisted RANDOM', () => {
      const url = 'http://www.google.com/?test=RANDOM';
      const expected = 'http://www.google.com/?test=RANDOM';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal(expected);
    });

    it('should replace whitelisted ABCD', () => {
      const url = 'http://www.google.com/?test=ABCD';
      const expected = 'http://www.google.com/?test=four';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal(expected);
    });
  });

  describe('#expand', () => {
    function mockClientIdFn(str) {
      if (str === '__ga') {
        return Promise.resolve('amp-GA12345');
      }
      return Promise.resolve('amp-987654321');
    }

    // making sure to include resolutions of different types
    const mockBindings = {
      CLIENT_ID: mockClientIdFn, // fn resolving to promise
      CANONICAL_URL: 'www.google.com', // string
      RANDOM: () => 123456, // number
      TRIM: str => str.trim(), // fn
      UPPERCASE: str => str.toUpperCase(),
      LOWERCASE: str => str.toLowerCase(),
      CONCAT: (a, b) => a + b,
      CAT_THREE: (a, b, c) => a + b + c,
      ASYNC: Promise.resolve('hello'),
      ASYNCFN: arg => Promise.resolve(arg),
    };

    describe('async', () => {
      it('should handle empty urls', () =>
        expect(expander.expand('', mockBindings)).to.eventually.equal('')
      );

      it('parses one function, one argument', () =>
        expect(expander.expand('TRIM(aaaaa    )', mockBindings))
            .to.eventually.equal('aaaaa')
      );

      it('parses nested function one level', () =>
        expect(expander.expand('UPPERCASE(TRIM(aaaaa    ))', mockBindings))
            .to.eventually.equal('AAAAA')
      );

      it('parses nested function two levels', () =>
        expect(expander.expand('LOWERCASE(UPPERCASE(TRIM(aAaA    )))',
            mockBindings)).to.eventually.equal('aaaa')
      );

      it('parses one function, two string arguments', () =>
        expect(expander.expand('CONCAT(aaa,bbb)', mockBindings))
            .to.eventually.equal('aaabbb')
      );

      it('parses one function, two string arguments with space', () =>
        expect(expander.expand('CONCAT(aaa , bbb)', mockBindings))
            .to.eventually.equal('aaabbb')
      );

      it('parses function with func then string as args', () =>
        expect(expander.expand('CONCAT(UPPERCASE(aaa),bbb)', mockBindings))
            .to.eventually.equal('AAAbbb')
      );

      it('parses function with macro then string as args', () =>
        expect(expander.expand('CONCAT(CANONICAL_URL,bbb)', mockBindings))
            .to.eventually.equal('www.google.combbb')
      );

      it('parses function with string then func as args', () =>
        expect(expander.expand('CONCAT(aaa, UPPERCASE(bbb))', mockBindings))
            .to.eventually.equal('aaaBBB')
      );

      it('parses function with two funcs as args', () => {
        const url = 'CONCAT(LOWERCASE(AAA),UPPERCASE(bbb)';
        return expect(expander.expand(url, mockBindings))
            .to.eventually.equal('aaaBBB');
      });

      it('parses function with three funcs as args', () => {
        const url = 'CAT_THREE(LOWERCASE(AAA),UPPERCASE(bbb),LOWERCASE(CCC))';
        return expect(expander.expand(url, mockBindings))
            .to.eventually.equal('aaaBBBccc');
      });

      it('should handle real urls', () => {
        const url = 'http://www.amp.google.com/?client=CLIENT_ID(__ga)&canon=CANONICAL_URL&random=RANDOM';
        const expected = 'http://www.amp.google.com/?client=amp-GA12345&canon=www.google.com&random=123456';
        return expect(expander.expand(url, mockBindings))
            .to.eventually.equal(expected);
      });

      it('should treat unrecognized keywords as normal strings', () => {
        return expect(expander.expand('TRIM(FAKE(aaaaa))', mockBindings))
            .to.eventually.equal('');
      });

      it('ignores commas within backticks', () => {
        const url = 'CONCAT(`he,llo`,UPPERCASE(world)';
        return expect(expander.expand(url, mockBindings))
            .to.eventually.equal('he,lloWORLD');
      });

      it('ignores left parentheses within backticks', () => {
        const url = 'CONCAT(hello, `wo((rld`)';
        return expect(expander.expand(url, mockBindings))
            .to.eventually.equal('hellowo((rld');
      });

      it('ignores right parentheses within backticks', () => {
        const url = 'CONCAT(`hello)`,UPPERCASE(world)';
        return expect(expander.expand(url, mockBindings))
            .to.eventually.equal('hello)WORLD');
      });

      it('throws on bad input with back ticks', () => {
        const url = 'CONCAT(bad`hello`, world)';
        allowConsoleError(() => { expect(() => {
          expander.expand(url, mockBindings);
        }).to.throw(/bad/); });
      });

      it('should handle tokens with parenthesis next to each other', () => {
        const url = 'http://www.google.com/?test=RANDOMCLIENT_ID(__ga)UPPERCASE(foo)';
        const expected = 'http://www.google.com/?test=123456amp-GA12345FOO';
        return expect(expander.expand(url, mockBindings))
            .to.eventually.equal(expected);
      });
    });

    describe('#expand sync', () => {

      it('should handle empty urls', () =>
        expect(expander.expand('', mockBindings, /*opt_sync*/ true))
            .to.equal('')
      );

      it('parses one function, one argument', () =>
        expect(expander.expand('TRIM(aaaaa    )', mockBindings,
            /*opt_sync*/ true)).to.equal('aaaaa')
      );

      it('parses nested function one level', () =>
        expect(expander.expand('UPPERCASE(TRIM(aaaaa    ))', mockBindings,
            /*opt_sync*/ true)).to.equal('AAAAA')
      );

      it('parses nested function two levels', () =>
        expect(expander.expand('LOWERCASE(UPPERCASE(TRIM(aAaA    )))',
            mockBindings, /*opt_sync*/ true))
            .to.equal('aaaa')
      );

      it('parses one function, two string arguments', () =>
        expect(expander.expand('CONCAT(aaa,bbb)', mockBindings,
            /*opt_sync*/ true)).to.equal('aaabbb')
      );

      it('parses one function, two string arguments with space', () =>
        expect(expander.expand('CONCAT(aaa , bbb)', mockBindings,
            /*opt_sync*/ true)).to.equal('aaabbb')
      );

      it('parses function with func then string as args', () =>
        expect(expander.expand('CONCAT(UPPERCASE(aaa),bbb)', mockBindings,
            /*opt_sync*/ true)).to.equal('AAAbbb')
      );

      it('parses function with macro then string as args', () =>
        expect(expander.expand('CONCAT(CANONICAL_URL,bbb)', mockBindings,
            /*opt_sync*/ true)).to.equal('www.google.combbb')
      );

      it('parses function with string then func as args', () =>
        expect(expander.expand('CONCAT(aaa,UPPERCASE(bbb))', mockBindings,
            /*opt_sync*/ true)).to.equal('aaaBBB')
      );

      it('parses function with two funcs as args', () => {
        const url = 'CONCAT(LOWERCASE(AAA),UPPERCASE(bbb)';
        return expect(expander.expand(url, mockBindings,
            /*opt_sync*/ true)).to.equal('aaaBBB');
      });

      it('parses function with three funcs as args', () => {
        const url = 'CAT_THREE(LOWERCASE(AAA),UPPERCASE(bbb),LOWERCASE(CCC))';
        return expect(expander.expand(url, mockBindings, /*opt_sync*/ true))
            .to.equal('aaaBBBccc')
      });

      it('should treat unrecognized keywords as normal strings', () => {
        return expect(expander.expand('TRIM(FAKE(aaaaa))', mockBindings,
            /*opt_sync*/ true)).to.equal('');
      });

      it('ignores commas within backticks', () => {
        const url = 'CONCAT(`he,llo`,UPPERCASE(world)';
        return expect(expander.expand(url, mockBindings, /*opt_sync*/ true))
            .to.equal('he,lloWORLD');
      });

      it('ignores left parentheses within backticks', () => {
        const url = 'CONCAT(hello, `wo((rld`)';
        return expect(expander.expand(url, mockBindings, /*opt_sync*/ true))
            .to.equal('hellowo((rld');
      });

      it('ignores right parentheses within backticks', () => {
        const url = 'CONCAT(`hello)`,UPPERCASE(world)';
        return expect(expander.expand(url, mockBindings, /*opt_sync*/ true))
            .to.equal('hello)WORLD');
      });

      it('throws on bad input with back ticks', () => {
        const url = 'CONCAT(bad`hello`, world)';
        allowConsoleError(() => { expect(() => {
          expander.expand(url, mockBindings, /*opt_sync*/ true);
        }).to.throw(/bad/); });
      });

      // Console errors allowed for these tests because anytime an async
      // function is called with the sync flag we user.error()
      it('should resolve promise to empty string', () => {
        const url = 'ASYNC';
        const expected = '';
        allowConsoleError(() => {
          expect(expander.expand(url, mockBindings, /*opt_sync*/ true))
              .to.equal(expected);
        });
      });

      it('should resolve asyncronous function to empty string', () => {
        const url = 'ASYNCFN';
        const expected = '';
        allowConsoleError(() => {
          expect(expander.expand(url, mockBindings, /*opt_sync*/ true))
              .to.equal(expected);
        });
      });

      it('should resolve asyncronous function to empty string', () => {
        const url = 'ASYNCFN(foo)';
        const expected = '';
        allowConsoleError(() => {
          expect(expander.expand(url, mockBindings, /*opt_sync*/ true))
              .to.equal(expected);
        });
      });

      it('dismiss async in real urls', () => {
        const url = 'http://www.google.com/?test=RANDOMASYNCFN(foo)UPPERCASE(foo)';
        const expected = 'http://www.google.com/?test=123456FOO';
        allowConsoleError(() => {
          expect(expander.expand(url, mockBindings, /*opt_sync*/ true))
              .to.equal(expected);
        });
      });

      it('dismiss async in nested calls', () => {
        const url = 'CONCAT(foo, ASYNCFN(bar))UPPERCASE(foo)';
        const expected = 'fooFOO';
        allowConsoleError(() => {
          expect(expander.expand(url, mockBindings, /*opt_sync*/ true))
              .to.equal(expected);
        });
      });
    });
  });
});
