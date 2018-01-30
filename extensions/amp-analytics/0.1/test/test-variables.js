
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
  installVariableService,
  variableServiceFor,
} from '../variables';
import {adopt} from '../../../../src/runtime';
import * as sinon from 'sinon';
import {Services} from '../../../../src/services';
import {toggleExperiment} from '../../../../src/experiments';
import {REPLACEMENT_EXP_NAME} from '../../../../src/service/url-replacements-impl';

adopt(window);

describe('amp-analytics.VariableService', function() {
  let variables, sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    installVariableService(window);
    variables = variableServiceFor(window);
  });

  afterEach(() => {
    sandbox.restore();
  });


  it('correctly encodes scalars and arrays', () => {
    expect(variables.encodeVars('v', 'abc %&')).to.equal('abc%20%25%26');
    expect(variables.encodeVars('v', 'SOME_MACRO(abc,123)'))
        .to.equal('SOME_MACRO(abc,123)');

    const array = ['abc %&', 'a b'];
    expect(variables.encodeVars('v', array)).to.equal('abc%20%25%26,a%20b');
    // Test non-inplace semantics by testing again.
    expect(variables.encodeVars('v', array)).to.equal('abc%20%25%26,a%20b');
    expect(variables.encodeVars('v', ['12.3', 'SOME_MACRO(abc,123)', 'ab/c']))
        .to.equal('12.3,SOME_MACRO(abc,123),ab%2Fc');
  });

  describe('expandTemplate', () => {
    const vars = {
      '1': '1${2}', '2': '2${3}', '3': '3${4}', '4': '4${1}', '5': 0,
      'a': '${b}', 'b': '${c}', 'c': 'https://www.google.com/a?b=1&c=2',
    };

    it('expands zeros', () => {
      return variables.expandTemplate('${5}', new ExpansionOptions(vars))
          .then(actual =>
            expect(actual).to.equal('0')
          );
    });

    it('expands nested vars', () => {
      return variables.expandTemplate('${1}', new ExpansionOptions(vars))
          .then(actual =>
            expect(actual).to.equal('123%24%7B4%7D')
          );
    });

    it('expands nested vars (no encode)', () => {
      return variables.expandTemplate('${1}',
          new ExpansionOptions(vars, undefined, true))
          .then(actual =>
            expect(actual).to.equal('123${4}')
          );
    });

    it('expands nested vars without double encoding', () => {
      return expect(variables.expandTemplate('${a}',
          new ExpansionOptions(vars))).to.eventually.equal(
          'https%3A%2F%2Fwww.google.com%2Fa%3Fb%3D1%26c%3D2');
    });

    it('limits the recursion to n', () => {
      return variables.expandTemplate('${1}', new ExpansionOptions(vars, 3))
          .then(actual =>
            expect(actual).to.equal('1234%24%7B1%7D'))
          .then(() =>
            variables.expandTemplate('${1}', new ExpansionOptions(vars, 5))
                .then(actual => expect(actual).to
                    .equal('123412%24%7B3%7D')
                ));
    });

    it('works with complex params (1)', () => {
      const vars = new ExpansionOptions({'fooParam': 'QUERY_PARAM(foo,bar)'});
      return variables.expandTemplate('${fooParam}', vars)
          .then(actual =>
            expect(actual).to.equal('QUERY_PARAM(foo,bar)'));
    });

    it('works with complex params (2)', () => {
      const vars = new ExpansionOptions({'fooParam': 'QUERY_PARAM'});
      return variables.expandTemplate('${fooParam(foo,bar)}', vars)
          .then(actual => expect(actual).to.equal('QUERY_PARAM(foo,bar)'));
    });

    it('respect freeze variables', () => {
      const vars = new ExpansionOptions({'fooParam': 'QUERY_PARAM',
        'freeze': 'error'});
      vars.freezeVar('freeze');
      return variables.expandTemplate(
          '${fooParam(foo,bar)}${nonfreeze}${freeze}', vars)
          .then(actual => expect(actual).to.equal(
              'QUERY_PARAM(foo,bar)${freeze}'));

    });
  });

  describes.fakeWin('macros', {amp: true}, env => {
    let win;
    let ampdoc;
    let urlReplacementService;

    beforeEach(() => {
      ampdoc = env.ampdoc;
      win = env.win;
      toggleExperiment(env.win, REPLACEMENT_EXP_NAME, true);
      installVariableService(win);
      variables = variableServiceFor(win);
      urlReplacementService = Services.urlReplacementsForDoc(ampdoc);
    });

    afterEach(() => {
      toggleExperiment(env.win, REPLACEMENT_EXP_NAME);
    });

    function check(input, output) {
      const macros = variables.getMacros();
      const expanded = urlReplacementService.expandUrlAsync(input, macros);
      return expect(expanded).to.eventually.equal(output);
    }

    it('default works', () => check('DEFAULT(one,two)', 'one'));

    it('default works without first arg', () => check('DEFAULT(,two)', 'two'));

    it('default works without first arg length',
        () => check('DEFAULT(TRIM(), two)', 'two'));

    it('hash works', () => check('HASH(test)',
        'doQSMg97CqWBL85CjcRwazyuUOAqZMqhangiSb_o78S37xzLEmJV0ZYEff7fF6Cp'));

    it('substr works', () => check('SUBSTR(Hello world!, 1, 4)', 'ello'));

    it('trim works', () => check('TRIM(hello      )', 'hello'));

    it('json works', () =>
      check('JSON(Hello world!)', '%22Hello%20world!%22'));

    it('toLowerCase works', () =>
      check('TOLOWERCASE(HeLLO WOrld!)', 'hello%20world!'));

    it('toUpperCase works', () => {
      return check('TOUPPERCASE(HeLLO WOrld!)', 'HELLO%20WORLD!');
    });

    it('not works (truth-y value)', () => check('NOT(hello)', 'false'));

    it('not works (false-y value)', () => check('NOT()', 'true'));

    it('base64 works', () => {
      return check('BASE64(Hello World!)', 'SGVsbG8gV29ybGQh');
    });

    it('if works', () => check('IF(hey, truthy, falsey)', 'truthy'));

    it('chaining works', () => {
      return check('SUBSTR(Hello world!, 6)', 'world!').then(() =>
        check('TOUPPERCASE(SUBSTR(Hello world!, 6))', 'WORLD!')).then(() =>
        check('BASE64(TOUPPERCASE(SUBSTR(Hello world!, 6)))', 'V09STEQh'))
          .then(() =>
            check('HASH(BASE64(TOUPPERCASE(SUBSTR(Hello world!, 6))))',
                'OPTTt2IGW8-R31MrIF_cRUwLTZ9jLDOXEuhNz_Q' +
                'S7Uc5ZmODduHWdplzrZ7Jsnqx')
          );
    });

    it('replaces common use case', () => {
      return check('REPLACE(this-is-a-test, `-`)', 'thisisatest');
    });

    it('replaces three args', () => {
      return check('REPLACE(this-is-a-test, `-`, *)', 'this*is*a*test');
    });

    it('replaces backticks optional', () => {
      return check('REPLACE(this-is-a-test, -, **)', 'this**is**a**test');
    });

    it('replaces not trimming spaces in backticks', () => {
      return check('REPLACE(this-is-a-test, ` -`)', 'this-is-a-test');
    });

    it('replaces respecting space as arg', () => {
      return check('REPLACE(this-is-a-test, `-`, ` `)', 'this%20is%20a%20test');
    });

    it('replaces respecting backticks', () => {
      return check('REPLACE(`this-,is-,a-,test`, `-,`)', 'thisisatest');
    });

    it('replace with no third arg', () => {
      return check('REPLACE(thi@s-is-a-te@st, `-|@`)', 'thisisatest');
    });
  });

  describe('getNameArgs:', () => {

    function check(input, name, argList) {
      it('can parse ' + name, () => {
        expect(variables.getNameArgs_(input)).to.deep.equal({name, argList});
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
