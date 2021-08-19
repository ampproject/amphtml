import {Expander} from '#service/url-expander/expander';
import {GlobalVariableSource} from '#service/url-replacements-impl';

import {macroTask} from '#testing/helpers';

describes.realWin(
  'Expander',
  {
    amp: {
      ampdoc: 'single',
    },
  },
  (env) => {
    let variableSource;

    beforeEach(() => {
      variableSource = new GlobalVariableSource(env.ampdoc);
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
        return expect(
          new Expander(variableSource, mockBindings).expand(url)
        ).to.eventually.equal(url);
      });

      it('should return single item', () => {
        const url = 'http://www.google.com/?test=RANDOM';
        const expected = 'http://www.google.com/?test=0.1234';
        return expect(
          new Expander(variableSource, mockBindings).expand(url)
        ).to.eventually.equal(expected);
      });

      it('should sort basic case', () => {
        const url = 'http://www.google.com/?test=ABCD&BAR&foo=RANDOM';
        const expected = 'http://www.google.com/?test=four&BAR&foo=0.1234';
        return expect(
          new Expander(variableSource, mockBindings).expand(url)
        ).to.eventually.equal(expected);
      });

      it('will always prefer the first match in overlap', () => {
        const url = 'http://www.google.com/?test=ABCDEFGHIJKLMNOPQRS';
        const expected = 'http://www.google.com/?test=tenKLMNOPQRS';
        return expect(
          new Expander(variableSource, mockBindings).expand(url)
        ).to.eventually.equal(expected);
      });

      it('will prefer longer match if same start index', () => {
        const url = 'http://www.google.com/?test=ABCD';
        const expected = 'http://www.google.com/?test=four';
        return expect(
          new Expander(variableSource, mockBindings).expand(url)
        ).to.eventually.equal(expected);
      });

      it('should handle keywords next to each other', () => {
        const url = 'http://www.google.com/?test=ABCDRANDOM';
        const expected = 'http://www.google.com/?test=four0.1234';
        return expect(
          new Expander(variableSource, mockBindings).expand(url)
        ).to.eventually.equal(expected);
      });
    });

    describe('Allowlist of variables', () => {
      const mockBindings = {
        RANDOM: () => 0.1234,
        ABC: () => 'three',
        ABCD: () => 'four',
      };

      function createExpanderWithAllowlist(allowlist, mockBindings) {
        variableSource = new GlobalVariableSource(env.ampdoc);
        variableSource.variableAllowlist_ = allowlist;
        return new Expander(variableSource, mockBindings);
      }

      it('should not replace unallowlisted RANDOM', () => {
        const expander = createExpanderWithAllowlist(
          ['ABC', 'ABCD', 'CANONICAL'],
          mockBindings
        );
        const url = 'http://www.google.com/?test=RANDOM';
        const expected = 'http://www.google.com/?test=RANDOM';
        return expect(expander.expand(url)).to.eventually.equal(expected);
      });

      it('should replace allowlisted ABCD', () => {
        const expander = createExpanderWithAllowlist(
          ['ABC', 'ABCD', 'CANONICAL'],
          mockBindings
        );
        const url = 'http://www.google.com/?test=ABCD';
        const expected = 'http://www.google.com/?test=four';
        return expect(expander.expand(url)).to.eventually.equal(expected);
      });

      it('should not replace anything with empty allowlist', () => {
        const expander = createExpanderWithAllowlist([''], mockBindings);
        const url = 'http://www.google.com/?test=ABCD';
        const expected = 'http://www.google.com/?test=ABCD';
        return expect(expander.expand(url)).to.eventually.equal(expected);
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
        TRIM: (str) => str.trim(), // fn
        UPPERCASE: (str) => str.toUpperCase(),
        LOWERCASE: (str) => str.toLowerCase(),
        CONCAT: (a, b) => a + '-' + b,
        CAT_THREE: (a, b, c) => a + b + c,
        ASYNC: Promise.resolve('hello'),
        ASYNCFN: (arg) => Promise.resolve(arg),
        BROKEN: () => undefined,
        TITLE: 'hello world ',
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
        {
          description: 'should not double encode nested macros',
          input: 'title=TRIM(TITLE)',
          output: 'title=hello%20world',
        },
        {
          description: 'should handle backticks inside args',
          input: 'CONCAT(he`llo`, world)',
          output: 'hello-world',
        },
        {
          description: 'should handle backticks inside args w/ macros',
          input: 'TRIM(CANONICAL_URL` `CANONICAL_URL)',
          output: 'www.google.com%20www.google.com',
        },
      ];

      describe('called asyncronously', () => {
        sharedTestCases.forEach((test) => {
          const {description, input, output} = test;
          it(description, () =>
            expect(
              new Expander(variableSource, mockBindings).expand(input)
            ).to.eventually.equal(output)
          );
        });

        describe('unique cases', () => {
          it('should handle real urls', () => {
            const url =
              'http://www.amp.google.com/?client=CLIENT_ID(__ga)&canon=CANONICAL_URL&random=RANDOM';
            const expected =
              'http://www.amp.google.com/?client=amp-GA12345&canon=www.google.com&random=123456';
            return expect(
              new Expander(variableSource, mockBindings).expand(url)
            ).to.eventually.equal(expected);
          });

          it('should handle tokens with parenthesis next to each other', () => {
            const url =
              'http://www.google.com/?test=RANDOMCLIENT_ID(__ga)UPPERCASE(foo)';
            const expected = 'http://www.google.com/?test=123456amp-GA12345FOO';
            return expect(
              new Expander(variableSource, mockBindings).expand(url)
            ).to.eventually.equal(expected);
          });
        });
      });

      describe('called synchronously', () => {
        sharedTestCases.forEach((test) => {
          const {description, input, output} = test;
          it(description, () =>
            expect(
              new Expander(
                variableSource,
                mockBindings,
                /* opt_collectVars */ undefined,
                /* opt_sync */ true
              ).expand(input)
            ).to.equal(output)
          );
        });

        describe('unique cases', () => {
          // Console errors allowed for these tests because anytime an async
          // function is called with the sync flag we user.error()
          it('should resolve promise to empty string', () => {
            const url = 'ASYNC';
            const expected = '';
            allowConsoleError(() => {
              expect(
                new Expander(
                  variableSource,
                  mockBindings,
                  /* opt_collectVars */ undefined,
                  /* opt_sync */ true
                ).expand(url)
              ).to.equal(expected);
            });
          });

          it('should resolve asyncronous function to empty string', () => {
            const url = 'ASYNCFN';
            const expected = '';
            allowConsoleError(() => {
              expect(
                new Expander(
                  variableSource,
                  mockBindings,
                  /* opt_collectVars */ undefined,
                  /* opt_sync */ true
                ).expand(url)
              ).to.equal(expected);
            });
          });

          it('should resolve asyncronous function to empty string', () => {
            const url = 'ASYNCFN(foo)';
            const expected = '';
            allowConsoleError(() => {
              expect(
                new Expander(
                  variableSource,
                  mockBindings,
                  /* opt_collectVars */ undefined,
                  /* opt_sync */ true
                ).expand(url)
              ).to.equal(expected);
            });
          });

          it('dismiss async in real urls', () => {
            const url =
              'http://www.google.com/?test=RANDOMASYNCFN(foo)UPPERCASE(foo)';
            const expected = 'http://www.google.com/?test=123456FOO';
            allowConsoleError(() => {
              expect(
                new Expander(
                  variableSource,
                  mockBindings,
                  /* opt_collectVars */ undefined,
                  /* opt_sync */ true
                ).expand(url)
              ).to.equal(expected);
            });
          });

          it('dismiss async in nested calls', () => {
            const url = 'CONCAT(foo, ASYNCFN(bar))UPPERCASE(foo)';
            const expected = 'foo-FOO';
            allowConsoleError(() => {
              expect(
                new Expander(
                  variableSource,
                  mockBindings,
                  /* opt_collectVars */ undefined,
                  /* opt_sync */ true
                ).expand(url)
              ).to.equal(expected);
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
          tests.forEach((test) => {
            const {description, input, output} = test;
            it(description, function* () {
              const vars = {};
              new Expander(
                variableSource,
                mockBindings,
                /* opt_collectVars */ vars
              ).expand(input);
              yield macroTask();
              const expected = output.both || output.async;
              expect(vars).to.deep.equal(expected);
            });
          });

          it('should handle async functions', function* () {
            const vars = {};
            const input = 'CLIENT_ID(__ga)UPPERCASE(foo)';
            new Expander(
              variableSource,
              mockBindings,
              /* opt_collectVars */ vars
            ).expand(input);
            yield macroTask();
            expect(vars).to.deep.equal({
              'CLIENT_ID(__ga)': 'amp-GA12345',
              'UPPERCASE(foo)': 'FOO',
            });
          });
        });

        describe('called syncronously', () => {
          tests.forEach((test) => {
            const {description, input, output} = test;
            it(description, () => {
              const vars = {};
              new Expander(
                variableSource,
                mockBindings,
                /* opt_collectVars */ vars,
                /* opt_sync */ true
              ).expand(input);
              const expected = output.both || output.sync;
              expect(vars).to.deep.equal(expected);
            });
          });

          it('should discard async functions when called synchronously', () => {
            const vars = {};
            const input = 'CLIENT_ID(__ga)UPPERCASE(foo)';
            allowConsoleError(() => {
              new Expander(
                variableSource,
                mockBindings,
                /* opt_collectVars */ vars,
                /* opt_sync */ true
              ).expand(input);
            });
            expect(vars).to.deep.equal({
              'UPPERCASE(foo)': 'FOO',
            });
          });
        });
      });

      describe('opt_allowlist', () => {
        it('should only resolve values in the allowlist', () => {
          const url = 'UPPERCASE(foo)RANDOMLOWERCASE(BAR)';
          const allowlist = {RANDOM: true};
          return expect(
            new Expander(
              variableSource,
              mockBindings,
              /* opt_collectVars */ undefined,
              /* opt_sync */ false,
              /* opt_allowlist */ allowlist
            ).expand(url)
          ).to.eventually.equal('UPPERCASE(foo)123456LOWERCASE(BAR)');
        });
      });
    });

    describe('getMacroNames', () => {
      it('should handle no names found', () => {
        const url = 'https://www.example.com/foo/bar?a=1&b=hello';
        expect(new Expander(variableSource).getMacroNames(url)).to.eql([]);
      });

      it('should find the correct names', () => {
        const url = 'https://www.example.com?a=1&t=TITLE&c=CLIENT_ID(foo)';
        expect(new Expander(variableSource).getMacroNames(url)).to.eql([
          'TITLE',
          'CLIENT_ID',
        ]);
      });

      it('should find the nested names', () => {
        const url =
          'https://www.example.com?a=1&t=TITLE&c=CLIENT_ID(QUERY_PARAM(foo))';
        expect(new Expander(variableSource).getMacroNames(url)).to.eql([
          'TITLE',
          'CLIENT_ID',
          'QUERY_PARAM',
        ]);
      });
    });
  }
);
