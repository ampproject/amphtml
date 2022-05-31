import {forceExperimentBranch} from '#experiments';

import {Services} from '#service';

import {
  installLinkerReaderService,
  linkerReaderServiceFor,
} from '../linker-reader';
import {installSessionServiceForTesting} from '../session-manager';
import {
  ExpansionOptions,
  VariableService,
  encodeVars,
  getNameArgsForTesting,
  installVariableServiceForTesting,
  variableServiceForDoc,
} from '../variables';

describes.fakeWin('amp-analytics.VariableService', {amp: true}, (env) => {
  let fakeElement;
  let variables;

  beforeEach(() => {
    fakeElement = env.win.document.documentElement;
    installLinkerReaderService(env.win);
    installSessionServiceForTesting(env.ampdoc);
    variables = new VariableService(env.ampdoc);
  });

  describe('encodeVars', () => {
    it('correctly encodes scalars and arrays', () => {
      expect(encodeVars('abc %&')).to.equal('abc%20%25%26');
      expect(encodeVars('SOME_MACRO(abc,123)')).to.equal('SOME_MACRO(abc,123)');

      const array = ['abc %&', 'a b'];
      expect(encodeVars(array)).to.equal('abc%20%25%26,a%20b');
      // Test non-inplace semantics by testing again.
      expect(encodeVars(array)).to.equal('abc%20%25%26,a%20b');
      expect(encodeVars(['12.3', 'SOME_MACRO(abc,123)', 'ab/c'])).to.equal(
        '12.3,SOME_MACRO(abc,123),ab%2Fc'
      );
    });
  });

  describe('expand', () => {
    const vars = {
      'a': '${b}',
      'b': '${c}',
      'c': 'https://www.google.com/a?b=1&c=2',
    };

    function check(template, expected, vars, opt_freeze) {
      const expansion = new ExpansionOptions(vars);
      if (opt_freeze) {
        expansion.freezeVar(opt_freeze);
      }
      const actual = variables.expandTemplate(template, expansion, fakeElement);
      return expect(actual).to.eventually.equal(expected);
    }

    it('expands nested vars (encode once)', () => {
      return check(
        '${a}',
        'https%3A%2F%2Fwww.google.com%2Fa%3Fb%3D1%26c%3D2',
        vars
      );
    });

    it('expands nested vars (no encode)', () => {
      const actual = variables.expandTemplate(
        '${a}',
        new ExpansionOptions(vars, undefined, true),
        fakeElement
      );
      expect(actual).to.eventually.equal('https://www.google.com/a?b=1&c=2');
    });

    it('expands complicated string', () => {
      return check('${foo}', 'HELLO%2FWORLD%2BWORLD%2BHELLO%2BHELLO', {
        'foo': '${a}+${b}+${c}+${hello}',
        'a': '${hello}/${world}',
        'b': '${world}',
        'c': '${hello}',
        'hello': 'HELLO',
        'world': 'WORLD',
      });
    });

    it('expands zeros', () => {
      return check('${zero}', '0', {'zero': 0});
    });

    it('drops unknown vars', () => {
      return check('a=${known}&b=${unknown}', 'a=KNOWN&b=', {'known': 'KNOWN'});
    });

    it('does not expand macros', () => {
      return check('MACRO(a,b)', 'MACRO(a,b)', {});
    });

    it('does not handle nested macros using ${} syntax', () => {
      // VariableService.expandTemplate's regex cannot parse outer ${}.
      return check('${a${b}}', '${atwo}', {
        'a': 'one',
        'b': 'two',
      });
    });

    it('supports macro args', () =>
      check('${foo}', 'AAA(BBB(1))', {
        'foo': 'AAA(BBB(1))',
      })
        .then(() =>
          // This is a result of `getNameArgs` strange behavior. Leaving here as
          // pseudo documentation. We mostly avoid this problem, as now we expand any
          // valid macros when they are seen in `Variables#expandTemplate`.
          check('${foo}', 'AAA(BBB(1%2C2))', {
            'foo': 'AAA(BBB(1,2))',
          })
        )
        .then(() =>
          check('${foo}', 'true', {
            'foo': '$EQUALS($SUBSTR(zyxabc,3),abc)',
          })
        )
        .then(() => {
          env.sandbox.useFakeTimers(123456789);

          // Arguments (3,4) and (5,TIMESTAMP) do not include parenthesis,
          // so they are parsed and encoded correctly when sent to urlReplacements
          return check(
            '${foo}&${bar(3,4)}&${bar(5,TIMESTAMP)}',
            'FOO(1,2)&4&123456789',
            {
              'foo': 'FOO(1,2)',
              'bar': 'QUERY_PARAM',
            }
          );
        })
        .then(() =>
          // Macros that take additonal arugments in the arglist (after expansion),
          // and getNameArgs doesn't handle them
          check(
            '${foo}&${bar(2,$TOUPPERCASE(lowercase)}&${bar(5,QUERY_PARAM(6,7))}&${baz($NOT(true))}',
            'FOO(3,4)&(lowercase)(lowercase)&&',
            {
              'foo': 'FOO(3,4)',
              'bar': 'QUERY_PARAM',
              'baz': '$TOUPPERCASE',
            }
          )
        )
        .then(() =>
          // See comment about getNameArgs above.
          check('${all}', '2%264', {
            'a': 'QUERY_PARAM',
            'b': 'QUERY_PARAM(3,4)',
            'all': '${a(1,2)}&${b}',
          })
        )
        .then(() =>
          check('${all}&${c}&${d}', 'CCC(5%2C6)%26DDD(7,8)&CCC(5,6)&DDD(7,8)', {
            'c': 'CCC(5,6)',
            'd': 'DDD(7,8)',
            'all': '${c}&${d}',
          })
        )
        .then(() =>
          check('${nested}', 'default', {
            'nested': '${deeper}',
            'deeper': '$IF(true, QUERY_PARAM(foo, default), never)',
          })
        ));

    it('respect freeze variables', () => {
      return check(
        '${fooParam(foo,bar)}${nonfreeze}${freeze}',
        'bar${freeze}',
        {
          'fooParam': 'QUERY_PARAM',
          'freeze': 'error',
        },
        'freeze'
      );
    });

    it('expands array vars', () => {
      return check(
        '${array}',
        '123,xy%26x,MACRO(abc,def),MACRO(abc%2Cdef)%26123,bar,',
        {
          'foo': 'bar',
          'array': [
            123,
            'xy&x', // special chars should be encoded
            'MACRO(abc,def)', // do not encode macro
            'MACRO(abc,def)&123', // this is not a macro
            '${foo}', // vars in array should be expanded
            '${bar}', // undefined vars should be empty
          ],
        }
      );
    });

    it('handles array with no vars', () => {
      return check('${array}', 'foo,bar,3', {
        'array': ['foo', 'bar', 3],
      });
    });

    it('handles empty var name', () => {
      return check('${}', '', {});
    });

    it('handles null and undefined vars', () => {
      return check('${arr}', ',,notNull', {
        'arr': [null, undefined, 'notNull'],
      });
    });

    describe('should handle recursive vars', () => {
      const recursiveVars = {
        '1': '1${2}',
        '2': '2${3}',
        '3': '3${4}',
        '4': '4${1}',
      };

      it('default to 2 recursions', () => {
        expectAsyncConsoleError(
          /Maximum depth reached while expanding variables/
        );
        return check('${1}', '123%24%7B4%7D', recursiveVars);
      });

      it('customize recursions to 5', () => {
        expectAsyncConsoleError(
          /Maximum depth reached while expanding variables/
        );
        const actual = variables.expandTemplate(
          '${1}',
          new ExpansionOptions(recursiveVars, 5),
          fakeElement
        );
        return expect(actual).to.eventually.equal('123412%24%7B3%7D');
      });
    });
  });

  describes.fakeWin('macros', {amp: true}, (env) => {
    let doc;
    let win;
    let urlReplacementService;
    let analyticsElement;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      installLinkerReaderService(win);
      installSessionServiceForTesting(doc);
      installVariableServiceForTesting(doc);
      variables = variableServiceForDoc(doc);
      const {documentElement} = win.document;
      urlReplacementService = Services.urlReplacementsForDoc(documentElement);
      analyticsElement = doc.createElement('amp-analytics');
      doc.body.appendChild(analyticsElement);
      env.sandbox.stub(Services, 'performanceFor').returns({
        getMetric(unused) {
          return Promise.resolve(1);
        },
      });
    });

    function check(input, output, opt_bindings) {
      const macros = Object.assign(
        variables.getMacros(analyticsElement),
        opt_bindings
      );
      const expanded = urlReplacementService.expandUrlAsync(input, macros);
      return expect(expanded).to.eventually.equal(output);
    }

    it('handles consecutive macros in inner arguments', () => {
      env.sandbox.useFakeTimers(123456789);
      win.location.href = 'https://example.test/?test=yes';
      return check(
        '$IF(QUERY_PARAM(test), 1.$SUBSTR(TIMESTAMP, 0, 10)QUERY_PARAM(test), ``)',
        '1.123456789yes'
      );
    });

    it('handles consecutive macros w/o parens in inner arguments', () => {
      env.sandbox.useFakeTimers(123456789);
      win.location.href = 'https://example.test/?test=yes';
      return check('$IF(QUERY_PARAM(test), 1.TIMESTAMP, ``)', '1.123456789');
    });

    it('handles string + macro as inner argument', () =>
      check('$REPLACE(testCLIENT_ID(scope), amp-, ``)', 'test12345', {
        CLIENT_ID: 'amp-12345',
      }));

    it('should not trim right of string before macro', () => {
      env.sandbox.useFakeTimers(123456789);
      win.location.href = 'https://example.test/?test=yes';
      return check(
        '$IF(QUERY_PARAM(test), foo TIMESTAMP, ``)',
        'foo%20123456789'
      );
    });

    it('default works without first arg', () => check('$DEFAULT(,two)', 'two'));

    it('default works without first arg length', () =>
      check('$DEFAULT($TRIM(), two)', 'two'));

    it('hash works', () =>
      check(
        '$HASH(test)',
        'doQSMg97CqWBL85CjcRwazyuUOAqZMqhangiSb_o78S37xzLEmJV0ZYEff7fF6Cp'
      ));

    it('substr works', () => check('$SUBSTR(Hello world!, 1, 4)', 'ello'));

    it('substr works with number as input', () =>
      check('$SUBSTR(NUM, 2, 5)', '3456', {NUM: 123456}));

    it('trim works', () => check('$TRIM(hello      )', 'hello'));

    it('toLowerCase works', () =>
      check('$TOLOWERCASE(HeLLO WOrld!)', 'hello%20world!'));

    it('toUpperCase works', () => {
      return check('$TOUPPERCASE(HeLLO WOrld!)', 'HELLO%20WORLD!');
    });

    it('not works (truth-y value)', () => check('$NOT(hello)', 'false'));

    it('not works (false-y value)', () => check('$NOT()', 'true'));

    it('base64 works', () => {
      return check('$BASE64(Hello World!)', 'SGVsbG8gV29ybGQh');
    });

    describe('$CALC', () => {
      it('calc addition works', () => check('$CALC(1, 2, add)', '3'));

      it('calc addition works with rounding flag', () =>
        check('$CALC(1, 2, add, true)', '3'));

      it('calc subtraction works', () =>
        check('$CALC(1, 2, subtract, true)', '-1'));

      it('calc multiplication works', () =>
        check('$CALC(1, 2, multiply, true)', '2'));

      it('calc division works', () =>
        check('$CALC(1, 2, divide, false)', '0.5'));

      it('calc division should round 2/3 to 1', () =>
        check('$CALC(2, 3, divide, true)', '1'));

      it('calc division should round 1/3 to 0', () =>
        check('$CALC(1, 3, divide, true)', '0'));

      it('calc division should round 1/2 to 1', () =>
        check('$CALC(1, 2, divide, true)', '1'));

      it('calc with unknown operation defaults to zero', () =>
        check('$CALC(1, 2, somethingelse, true)', '0'));

      it('calc with nested macro works', () =>
        check('$CALC($SUBSTR(123456, 2, 5), 10, multiply, false)', '34560'));

      it('calc should replace CUMULATIVE_LAYOUT_SHIFT with 1', () =>
        check('$CALC(CUMULATIVE_LAYOUT_SHIFT, 10, multiply, true)', '10'));
    });

    it('if works with true', () =>
      check('$IF(true, truthy, falsey)', 'truthy'));

    it('if works with other string', () =>
      check('$IF(test, truthy, falsey)', 'truthy'));

    it('if works with false', () =>
      check('$IF(false, truthy, falsey)', 'falsey'));

    it('if works with empty string', () =>
      check('$IF(, truthy, falsey)', 'falsey'));

    it('if works with null', () =>
      check('$IF(null, truthy, falsey)', 'falsey'));

    it('if works with undefined', () =>
      check('$IF(undefined, truthy, falsey)', 'falsey'));

    it('equals works (truth-y test)', () => {
      return check('$EQUALS(testValue, testValue)', 'true');
    });

    it('equals works (false-y test)', () => {
      return check('$EQUALS(testValue, otherValue)', 'false');
    });

    it('equals works with if (truth-y test)', () => {
      return check('$IF($EQUALS(A, A), truthy, falsey)', 'truthy');
    });

    it('equals works with if (false-y test)', () => {
      return check('$IF($EQUALS(A, B), truthy, falsey)', 'falsey');
    });

    it('chaining works', () => {
      return check('$SUBSTR(Hello world!, 6)', 'world!')
        .then(() => check('$TOUPPERCASE($SUBSTR(Hello world!, 6))', 'WORLD!'))
        .then(() =>
          check('$BASE64($TOUPPERCASE($SUBSTR(Hello world!, 6)))', 'V09STEQh')
        )
        .then(() =>
          check(
            '$HASH($BASE64($TOUPPERCASE($SUBSTR(Hello world!, 6))))',
            'OPTTt2IGW8-R31MrIF_cRUwLTZ9jLDOXEuhNz_Q' +
              'S7Uc5ZmODduHWdplzrZ7Jsnqx'
          )
        );
    });

    it('replaces common use case', () => {
      return check('$REPLACE(this-is-a-test, `-`)', 'thisisatest');
    });

    it('replaces three args', () => {
      return check('$REPLACE(this-is-a-test, `-`, *)', 'this*is*a*test');
    });

    it('replaces backticks optional', () => {
      return check('$REPLACE(this-is-a-test, -, **)', 'this**is**a**test');
    });

    it('replaces not trimming spaces in backticks', () => {
      return check('$REPLACE(this-is-a-test, ` -`)', 'this-is-a-test');
    });

    it('replaces respecting space as arg', () => {
      return check(
        '$REPLACE(this-is-a-test, `-`, ` `)',
        'this%20is%20a%20test'
      );
    });

    it('replaces respecting backticks', () => {
      return check('$REPLACE(`this-,is-,a-,test`, `-,`)', 'thisisatest');
    });

    it('replace with no third arg', () => {
      return check('$REPLACE(thi@s-is-a-te@st, `-|@`)', 'thisisatest');
    });

    it('replaces LINKER_PARAM', () => {
      const linkerReader = linkerReaderServiceFor(win);
      const linkerReaderStub = env.sandbox.stub(linkerReader, 'get');
      linkerReaderStub.withArgs('gl', 'cid').returns('a1b2c3');
      linkerReaderStub.withArgs('gl', 'gclid').returns(123);
      return check(
        'LINKER_PARAM(gl, cid)&LINKER_PARAM(gl, gclid)',
        'a1b2c3&123'
      );
    });

    it('replaces CONSENT_METADATA', () => {
      env.sandbox.stub(Services, 'consentPolicyServiceForDocOrNull').returns(
        Promise.resolve({
          getConsentMetadataInfo: () => {
            return Promise.resolve({
              'gdprApplies': true,
              'additionalConsent': 'abc123',
              'consentStringType': 1,
            });
          },
        })
      );

      return check(
        'CONSENT_METADATA(gdprApplies)&CONSENT_METADATA(additionalConsent)&CONSENT_METADATA(consentStringType)&CONSENT_METADATA(invalid_key)',
        'true&abc123&1&'
      );
    });

    it('replaces CONSENT_STRING', () => {
      env.sandbox.stub(Services, 'consentPolicyServiceForDocOrNull').returns(
        Promise.resolve({
          getConsentStringInfo: () => {
            return Promise.resolve('userConsentString');
          },
        })
      );

      return check('a=CONSENT_STRING', 'a=userConsentString');
    });

    it('"COOKIE" resolves cookie value', async () => {
      doc.cookie = 'test=123';
      await check('COOKIE(test)', '123');
      doc.cookie = '';
    });

    it('COOKIE resolves to empty string in FIE', async () => {
      doc.cookie = 'test=123';
      const fakeFie = doc.createElement('div');
      fakeFie.classList.add('i-amphtml-fie');
      doc.body.appendChild(fakeFie);
      fakeFie.appendChild(analyticsElement);
      await check('COOKIE(test)', '');
      doc.cookie = '';
    });

    it('COOKIE resolves to empty string when inabox', async () => {
      doc.cookie = 'test=123';
      env.win.__AMP_MODE.runtime = 'inabox';
      await check('COOKIE(test)', '');
      doc.cookie = '';
    });

    it('COOKIE resolves to empty string on cache', async () => {
      win.location = 'https://www-example-com.cdn.ampproject.org';
      doc.cookie = 'test=123';
      await check('COOKIE(test)', '');
      doc.cookie = '';
    });

    it('should replace FIRST_CONTENTFUL_PAINT', () => {
      return check('FIRST_CONTENTFUL_PAINT', '1');
    });

    it('should replace FIRST_VIEWPORT_READY', () => {
      return check('FIRST_VIEWPORT_READY', '1');
    });

    it('should replace MAKE_BODY_VISIBLE', () => {
      return check('MAKE_BODY_VISIBLE', '1');
    });

    it('should replace LARGEST_CONTENTFUL_PAINT', () => {
      return check('LARGEST_CONTENTFUL_PAINT', '1');
    });

    it('should replace FIRST_INPUT_DELAY', () => {
      return check('FIRST_INPUT_DELAY', '1');
    });

    it('should replace CUMULATIVE_LAYOUT_SHIFT', () => {
      return check('CUMULATIVE_LAYOUT_SHIFT', '1');
    });

    it('should expand EXPERIMENT_BRANCHES to name:value comma separated list', () => {
      forceExperimentBranch(env.win, 'exp1', '1234');
      forceExperimentBranch(env.win, 'exp2', '5678');
      return check('EXPERIMENT_BRANCHES', 'exp1%3A1234%2Cexp2%3A5678');
    });

    it('EXPERIMENT_BRANCHES should be empty string if no branches', () => {
      return check('EXPERIMENT_BRANCHES', '');
    });

    it('should expand EXPERIMENT_BRANCHES(expName) to experiment value', () => {
      forceExperimentBranch(env.win, 'exp1', '1234');
      return check('EXPERIMENT_BRANCHES(exp1)', '1234');
    });

    it('EXPERIMENT_BRANCHES(expName) should be empty string if not set', () => {
      return check('EXPERIMENT_BRANCHES(exp1)', '');
    });

    describe('$MATCH', () => {
      it('handles default index', () => {
        return check('$MATCH(thisisatest, thisisatest)', 'thisisatest');
      });

      it('matches full match', () => {
        return check('$MATCH(thisisatest, thisisatest, 0)', 'thisisatest');
      });

      it('matches partial match', () => {
        return check('$MATCH(thisisatest, test, 0)', 'test');
      });

      it('matches 1st group match', () => {
        return check('$MATCH(thisisatest, `thisisa(test)`, 1)', 'test');
      });

      it('matches 2nd group match', () => {
        return check('$MATCH(thisisatest, `this(is)a(test)`, 2)', 'test');
      });

      it('does not match non-matching group', () => {
        return check('$MATCH(thisisatest, `thisisa(?:test)`, 1)', '');
      });

      it('handles escaped regex chars', () => {
        return check('$MATCH(1, \\d, 0)', '1');
      });

      it('handles no full match', () => {
        return check('$MATCH(invalid, thisisatest, 0)', '');
      });

      it('handles no group match', () => {
        return check('$MATCH(thisisatest, `thisisa(\\d+)?test`, 1)', '');
      });

      it('handles large index', () => {
        return check('$MATCH(thisisatest, thisisatest, 100)', '');
      });

      it('handles negative index', () => {
        expectAsyncConsoleError(
          /Third argument in MATCH macro must be a number >= 0/
        );
        return check('$MATCH(thisisatest, thisisatest, -1)', 'thisisatest');
      });

      it('handles NaN index', () => {
        expectAsyncConsoleError(
          /Third argument in MATCH macro must be a number >= 0/
        );
        return check('$MATCH(thisisatest, thisisatest, test)', 'thisisatest');
      });
    });

    it('SCROLL_TOP round to integer', async () => {
      let scrollTopValue = 100;
      env.sandbox.stub(Services, 'viewportForDoc').callsFake(() => {
        return {
          getScrollTop: () => scrollTopValue,
        };
      });
      await check('SCROLL_TOP', '100');
      scrollTopValue = 99.4;
      await check('SCROLL_TOP', '99');
      scrollTopValue = 99.5;
      await check('SCROLL_TOP', '100');
    });

    describe('AMPDOC_META', () => {
      it('should replace with meta tag content', () => {
        env.sandbox.stub(env.ampdoc, 'getMeta').returns({
          'foo': 'bar',
        });
        return check('AMPDOC_META(foo)', 'bar');
      });

      it('should replace with "" when no meta tag', () => {
        env.sandbox.stub(env.ampdoc, 'getMeta').returns({});
        return check('AMPDOC_META(foo)', '');
      });

      it('should replace with default_value when no meta tag', () => {
        env.sandbox.stub(env.ampdoc, 'getMeta').returns({});
        return check('AMPDOC_META(foo, default_value)', 'default_value');
      });

      it('should prefer empty meta tag over default_value', () => {
        env.sandbox.stub(env.ampdoc, 'getMeta').returns({
          'foo': '',
        });
        return check('AMPDOC_META(foo, default_value)', '');
      });
    });
  });

  describe('getNameArgs:', () => {
    function check(input, name, argList) {
      it('can parse ' + name, () => {
        expect(getNameArgsForTesting(input)).to.deep.equal({name, argList});
      });
    }

    check('abc', 'abc', '');
    check('client id', 'client id', '');
    check('client id()', 'client id()', '');
    check('client id (abc)', 'client id (abc)', '');
    check('client id\nand something', 'client id\nand something', '');
    check('client id\nclientId()', 'client id\nclientId()', '');

    check('clientId()', 'clientId', '()');
    check('clientId(abc)', 'clientId', '(abc)');
    check('clientId(abc,def)', 'clientId', '(abc,def)');
    check('clientId(abc, def)', 'clientId', '(abc, def)');
  });
});
