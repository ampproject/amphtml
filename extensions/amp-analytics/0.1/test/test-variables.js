/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {
  ExpansionOptions,
  VariableService,
  encodeVars,
  getNameArgsForTesting,
  installVariableServiceForTesting,
  variableServiceForDoc,
} from '../variables';
import {Services} from '../../../../src/services';
import {
  installLinkerReaderService,
  linkerReaderServiceFor,
} from '../linker-reader';

describes.fakeWin('amp-analytics.VariableService', {amp: true}, env => {
  let variables;

  beforeEach(() => {
    installLinkerReaderService(env.win);
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

    function check(template, expected, vars) {
      const actual = variables.expandTemplateSync(
        template,
        new ExpansionOptions(vars)
      );
      expect(actual).to.equal(expected);
    }

    it('expands nested vars (encode once)', () => {
      check('${a}', 'https%3A%2F%2Fwww.google.com%2Fa%3Fb%3D1%26c%3D2', vars);
    });

    it('expands nested vars (no encode)', () => {
      const actual = variables.expandTemplateSync(
        '${a}',
        new ExpansionOptions(vars, undefined, true)
      );
      expect(actual).to.equal('https://www.google.com/a?b=1&c=2');
    });

    it('expands complicated string', () => {
      check('${foo}', 'HELLO%2FWORLD%2BWORLD%2BHELLO%2BHELLO', {
        'foo': '${a}+${b}+${c}+${hello}',
        'a': '${hello}/${world}',
        'b': '${world}',
        'c': '${hello}',
        'hello': 'HELLO',
        'world': 'WORLD',
      });
    });

    it('expands zeros', () => {
      check('${zero}', '0', {'zero': 0});
    });

    it('drops unknown vars', () => {
      check('a=${known}&b=${unknown}', 'a=KNOWN&b=', {'known': 'KNOWN'});
    });

    it('does not expand macros', () => {
      check('MACRO(a,b)', 'MACRO(a,b)', {});
    });

    it('supports macro args', () => {
      check('${foo}', 'AAA(BBB(1))', {
        'foo': 'AAA(BBB(1))',
      });

      // TODO: fix this, should be 'AAA(BBB(1,2))'
      check('${foo}', 'AAA(BBB(1%2C2))', {
        'foo': 'AAA(BBB(1,2))',
      });

      check('${foo}&${bar(3,4)}', 'FOO(1,2)&BAR(3,4)', {
        'foo': 'FOO(1,2)',
        'bar': 'BAR',
      });

      // TODO: fix this, should be 'AAA(1,2)%26BBB(3,4)%26CCC(5,6)%26DDD(7,8)'
      check('${all}', 'AAA(1%2C2)%26BBB(3%2C4)%26CCC(5%2C6)%26DDD(7,8)', {
        'a': 'AAA',
        'b': 'BBB',
        'c': 'CCC(5,6)',
        'd': 'DDD(7,8)',
        'all': '${a(1,2)}&${b(3,4)}&${c}&${d}',
      });
    });

    it('respect freeze variables', () => {
      const vars = new ExpansionOptions({
        'fooParam': 'QUERY_PARAM',
        'freeze': 'error',
      });
      vars.freezeVar('freeze');
      const actual = variables.expandTemplateSync(
        '${fooParam(foo,bar)}${nonfreeze}${freeze}',
        vars
      );
      expect(actual).to.equal('QUERY_PARAM(foo,bar)${freeze}');
    });

    it('expands array vars', () => {
      check(
        '${array}',
        'xy%26x,MACRO(abc,def),MACRO(abc%2Cdef)%26123,%24%7Bfoo%7D',
        {
          'foo': 'bar',
          'array': [
            'xy&x', // special chars should be encoded
            'MACRO(abc,def)', // do not encode macro
            'MACRO(abc,def)&123', // this is not a macro
            '${foo}', // vars in array is not expanded
          ],
        }
      );
    });

    it('handles empty var name', () => {
      check('${}', '', {});
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
        check('${1}', '123%24%7B4%7D', recursiveVars);
      });

      it('customize recursions to 5', () => {
        expectAsyncConsoleError(
          /Maximum depth reached while expanding variables/
        );
        const actual = variables.expandTemplateSync(
          '${1}',
          new ExpansionOptions(recursiveVars, 5)
        );
        expect(actual).to.equal('123412%24%7B3%7D');
      });
    });
  });

  describes.fakeWin('macros', {amp: true}, env => {
    let doc;
    let win;
    let urlReplacementService;
    let sandbox;

    beforeEach(() => {
      sandbox = env.sandbox;
      win = env.win;
      doc = win.document;
      installLinkerReaderService(win);
      installVariableServiceForTesting(doc);
      variables = variableServiceForDoc(doc);
      const {documentElement} = win.document;
      urlReplacementService = Services.urlReplacementsForDoc(documentElement);
    });

    function check(input, output, opt_bindings) {
      const macros = Object.assign(variables.getMacros(), opt_bindings);
      const expanded = urlReplacementService.expandUrlAsync(input, macros);
      return expect(expanded).to.eventually.equal(output);
    }

    it('handles consecutive macros in inner arguments', () => {
      sandbox.useFakeTimers(123456789);
      win.location.href = 'https://example.com/?test=yes';
      return check(
        '$IF(QUERY_PARAM(test), 1.$SUBSTR(TIMESTAMP, 0, 10)QUERY_PARAM(test), ``)',
        '%201.123456789yes'
      );
    });

    it('handles string + macro as inner argument', () =>
      check('$REPLACE(testCLIENT_ID(scope), amp-, ``)', 'test12345', {
        CLIENT_ID: 'amp-12345',
      }));

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

    it('if works', () => check('$IF(hey, truthy, falsey)', 'truthy'));

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
      const linkerReaderStub = sandbox.stub(linkerReader, 'get');
      linkerReaderStub.withArgs('gl', 'cid').returns('a1b2c3');
      linkerReaderStub.withArgs('gl', 'gclid').returns(123);
      return check(
        'LINKER_PARAM(gl, cid)&LINKER_PARAM(gl, gclid)',
        'a1b2c3&123'
      );
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
