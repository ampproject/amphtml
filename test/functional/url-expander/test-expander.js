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
import {macroTask} from '../../../testing/yield';

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
    const mockBindings = {
      RANDOM: () => 0.1234,
      ABC: () => 'three',
      ABCD: () => 'four',
    };

    function createExpanderWithWhitelist(whitelist) {
      env.win.document.head.appendChild(
          createElementWithAttributes(env.win.document, 'meta', {
            name: 'amp-allowed-url-macros',
            content: whitelist,
          }));

      variableSource = new GlobalVariableSource(env.ampdoc);
      return new Expander(variableSource);
    }

    it('should not replace unwhitelisted RANDOM', () => {
      const expander = createExpanderWithWhitelist('ABC,ABCD,CANONICAL');
      const url = 'http://www.google.com/?test=RANDOM';
      const expected = 'http://www.google.com/?test=RANDOM';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal(expected);
    });

    it('should replace whitelisted ABCD', () => {
      const expander = createExpanderWithWhitelist('ABC,ABCD,CANONICAL');
      const url = 'http://www.google.com/?test=ABCD';
      const expected = 'http://www.google.com/?test=four';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal(expected);
    });

    it('should not replace anything with empty whitelist', () => {
      const expander = createExpanderWithWhitelist('');
      const url = 'http://www.google.com/?test=ABCD';
      const expected = 'http://www.google.com/?test=ABCD';
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
      CONCAT: (a, b) => a + '-' + b,
      CAT_THREE: (a, b, c) => a + b + c,
      ASYNC: Promise.resolve('hello'),
      ASYNCFN: arg => Promise.resolve(arg),
      BROKEN: () => undefined,
      ANCESTOR_ORIGIN: () => Promise.resolve('https://www.google.com@foo'),
    };

    const sharedTestCases = [
      {
        description: 'should handle empty urls',
        input: '',
        output: '',
      },
      {
        description: 'parses one function, one argument',
        input: 'TRIM(aaaaa    )',
        output: 'aaaaa',
      },
      {
        description: 'parses nested function one level',
        input: 'UPPERCASE(TRIM(aaaaa    ))',
        output: 'AAAAA',
      },
      {
        description: 'parses nested function two levels',
        input: 'LOWERCASE(UPPERCASE(TRIM(aAaA    )))',
        output: 'aaaa',
      },
      {
        description: 'parses one function, two string arguments',
        input: 'CONCAT(aaa,bbb)',
        output: 'aaa-bbb',
      },
      {
        description: 'parses one function, two string arguments with space',
        input: 'CONCAT(aaa , bbb)',
        output: 'aaa-bbb',
      },
      {
        description: 'parses function with func then string as args',
        input: 'CONCAT(UPPERCASE(aaa),bbb)',
        output: 'AAA-bbb',
      },
      {
        description: 'parses function with macro then string as args',
        input: 'CONCAT(CANONICAL_URL,bbb)',
        output: 'www.google.com-bbb',
      },
      {
        description: 'parses function with string then func as args',
        input: 'CONCAT(aaa,UPPERCASE(bbb))',
        output: 'aaa-BBB',
      },
      {
        description: 'parses function with two funcs as args',
        input: 'CONCAT(LOWERCASE(AAA),UPPERCASE(bbb))',
        output: 'aaa-BBB',
      },
      {
        description: 'parses function with three funcs as args',
        input: 'CAT_THREE(LOWERCASE(AAA),UPPERCASE(bbb),LOWERCASE(CCC))',
        output: 'aaaBBBccc',
      },
      {
        description: 'should treat unrecognized keywords as normal strings',
        input: 'TRIM(FAKE(aaaaa))',
        output: 'FAKE(aaaaa)',
      },
      {
        description: 'ignores commas within backticks',
        input: 'CONCAT(`he,llo`,UPPERCASE(world))',
        output: 'he%2Cllo-WORLD',
      },
      {
        description: 'ignores left parentheses within backticks',
        input: 'CONCAT(hello, `wo((rld`)',
        output: 'hello-wo((rld',
      },
      {
        description: 'ignores right parentheses within backticks',
        input: 'CONCAT(`hello)`,UPPERCASE(world))',
        output: 'hello)-WORLD',
      },
      {
        description: 'trims with the wrong number of parens',
        input: 'TRIM(FAKE(aaa)',
        output: 'FAKE(aaa',
      },
      {
        description: 'passes undefined for omitted args',
        input: 'CONCAT(foo)',
        output: 'foo-undefined',
      },
    ];

    describe('called asyncronously', () => {
      sharedTestCases.forEach(test => {
        const {description, input, output} = test;
        it(description, () =>
          expect(expander.expand(input, mockBindings))
              .to.eventually.equal(output)
        );
      });

      describe('unique cases', () => {
        it('should handle real urls', () => {
          const url = 'http://www.amp.google.com/?client=CLIENT_ID(__ga)&canon=CANONICAL_URL&random=RANDOM';
          const expected = 'http://www.amp.google.com/?client=amp-GA12345&canon=www.google.com&random=123456';
          return expect(expander.expand(url, mockBindings))
              .to.eventually.equal(expected);
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

        it('should not encode NOENCODE_WHITELIST', () => {
          const url = 'ANCESTOR_ORIGIN';
          const expected = 'https://www.google.com@foo';
          return expect(expander.expand(url, mockBindings))
              .to.eventually.equal(expected);
        });
      });
    });

    describe('called synchronously', () => {
      sharedTestCases.forEach(test => {
        const {description, input, output} = test;
        it(description, () =>
          expect(expander.expand(input, mockBindings,
              /* opt_collectVars */ undefined, /* opt_sync */ true))
              .to.equal(output)
        );
      });

      describe('unique cases', () => {
        it('throws on bad input with back ticks', () => {
          const url = 'CONCAT(bad`hello`, world)';
          allowConsoleError(() => { expect(() => {
            expander.expand(url, mockBindings, /* opt_collectVars */ undefined,
                /* opt_sync */ true);
          }).to.throw(/bad/); });
        });

        // Console errors allowed for these tests because anytime an async
        // function is called with the sync flag we user.error()
        it('should resolve promise to empty string', () => {
          const url = 'ASYNC';
          const expected = '';
          allowConsoleError(() => {
            expect(expander.expand(url, mockBindings,
                /* opt_collectVars */ undefined, /* opt_sync */ true))
                .to.equal(expected);
          });
        });

        it('should resolve asyncronous function to empty string', () => {
          const url = 'ASYNCFN';
          const expected = '';
          allowConsoleError(() => {
            expect(expander.expand(url, mockBindings,
                /* opt_collectVars */ undefined, /* opt_sync */ true))
                .to.equal(expected);
          });
        });

        it('should resolve asyncronous function to empty string', () => {
          const url = 'ASYNCFN(foo)';
          const expected = '';
          allowConsoleError(() => {
            expect(expander.expand(url, mockBindings,
                /* opt_collectVars */ undefined, /* opt_sync */ true))
                .to.equal(expected);
          });
        });

        it('dismiss async in real urls', () => {
          const url = 'http://www.google.com/?test=RANDOMASYNCFN(foo)UPPERCASE(foo)';
          const expected = 'http://www.google.com/?test=123456FOO';
          allowConsoleError(() => {
            expect(expander.expand(url, mockBindings,
                /* opt_collectVars */ undefined, /* opt_sync */ true))
                .to.equal(expected);
          });
        });

        it('dismiss async in nested calls', () => {
          const url = 'CONCAT(foo, ASYNCFN(bar))UPPERCASE(foo)';
          const expected = 'foo-FOO';
          allowConsoleError(() => {
            expect(expander.expand(url, mockBindings,
                /* opt_collectVars */ undefined, /* opt_sync */ true))
                .to.equal(expected);
          });
        });
      });
    });

    describe('collectVars', () => {
      const tests = [
        {
          description: 'sibling macros',
          input: 'UPPERCASE(aaaa)LOWERCASE(BBB)',
          output: {
            both: {
              'UPPERCASE(aaaa)': 'AAAA',
              'LOWERCASE(BBB)': 'bbb',
            },
          },
        },
        {
          description: 'nested macros',
          input: 'LOWERCASE(UPPERCASE(TRIM(aAaA    )))',
          output: {
            sync: {
              'TRIM(aAaA)': 'aAaA',
              'UPPERCASE(aAaA)': 'AAAA',
              'LOWERCASE(AAAA)': 'aaaa',
            },
            async: {
              'TRIM(aAaA)': 'aAaA',
              'UPPERCASE([object Promise])': 'AAAA',
              'LOWERCASE([object Promise])': 'aaaa',
            },
          },
        },
        {
          description: 'macros that resolve undefined should be empty string',
          input: 'UPPERCASE(foo)BROKEN',
          output: {
            both: {
              'UPPERCASE(foo)': 'FOO',
              BROKEN: '',
            },
          },
        },
      ];

      describe('called asyncronously', () => {
        tests.forEach(test => {
          const {description, input, output} = test;
          it(description, function*() {
            const vars = {};
            expander.expand(input, mockBindings, /* opt_collectVars */ vars);
            yield macroTask();
            const expected = output.both || output.async;
            expect(vars).to.deep.equal(expected);
          });
        });

        it('should handle async functions', function*() {
          const vars = {};
          const input = 'CLIENT_ID(__ga)UPPERCASE(foo)';
          expander.expand(input, mockBindings, /* opt_collectVars */ vars);
          yield macroTask();
          expect(vars).to.deep.equal({
            'CLIENT_ID(__ga)': 'amp-GA12345',
            'UPPERCASE(foo)': 'FOO',
          });
        });
      });

      describe('called syncronously', () => {
        tests.forEach(test => {
          const {description, input, output} = test;
          it(description, () => {
            const vars = {};
            expander.expand(input, mockBindings, /* opt_collectVars */ vars,
                /* opt_sync */ true);
            const expected = output.both || output.sync;
            expect(vars).to.deep.equal(expected);
          });
        });

        it('should discard async functions when called synchronously', () => {
          const vars = {};
          const input = 'CLIENT_ID(__ga)UPPERCASE(foo)';
          allowConsoleError(() => {
            expander.expand(input, mockBindings, /* opt_collectVars */ vars,
                /* opt_sync */ true);
          });
          expect(vars).to.deep.equal({
            'UPPERCASE(foo)': 'FOO',
          });
        });
      });
    });

    describe('opt_whiteList', () => {
      it('should only resolve values in the whitelist', () => {
        const url = 'UPPERCASE(foo)RANDOMLOWERCASE(BAR)';
        const whitelist = {RANDOM: true};
        return expect(expander.expand(url, mockBindings,
            /* opt_collectVars */ undefined,
            /* opt_sync */ false,
            /* opt_whiteList */ whitelist
        )).to.eventually.equal('UPPERCASE(foo)123456LOWERCASE(BAR)');
      });
    });
  });
});
