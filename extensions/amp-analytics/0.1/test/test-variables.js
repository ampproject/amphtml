
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
    expect(variables.encodeVars('abc %&')).to.equal('abc%20%25%26');
    const array = ['abc %&', 'a b'];
    expect(variables.encodeVars(array)).to.equal('abc%20%25%26,a%20b');
    // Test non-inplace semantics by testing again.
    expect(variables.encodeVars(array)).to.equal('abc%20%25%26,a%20b');
  });

  describe('expandTemplate', () => {
    const vars = {
      '1': '1${2}', '2': '2${3}', '3': '3${4}', '4': '4${1}', '5': 0};

    it('expands zeros', () => {
      return variables.expandTemplate('${5}', new ExpansionOptions(vars))
          .then(actual =>
          expect(actual).to.equal('0')
      );
    });

    it('expands nested vars', () => {
      return variables.expandTemplate('${1}', new ExpansionOptions(vars))
          .then(actual =>
          expect(actual).to.equal('123%252524%25257B4%25257D')
      );
    });

    it('expands nested vars (no encode)', () => {
      return variables.expandTemplate('${1}',
          new ExpansionOptions(vars, undefined, true))
          .then(actual =>
          expect(actual).to.equal('123${4}')
        );
    });

    it('limits the recursion to n', () => {
      return variables.expandTemplate('${1}', new ExpansionOptions(vars, 3))
          .then(actual =>
          expect(actual).to.equal('1234%25252524%2525257B1%2525257D'))
          .then(() =>
          variables.expandTemplate('${1}', new ExpansionOptions(vars, 5))
              .then(actual => expect(actual).to
                  .equal('123412%252525252524%25252525257B3%25252525257D')
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
  });

  it('default filterdoesn\'t work when experiment is off' , () =>
      variables.expandTemplate('${bar|default:baz}',
          new ExpansionOptions({'foo': ' Hello world! '}))
          .then(actual => expect(actual).to.equal('')));

  describe('filter:', () => {
    const vars = new ExpansionOptions({'foo': ' Hello world! '});

    beforeEach(() => {
      sandbox.stub(variables, 'isFilterExperimentOn_', () => true);
    });

    function check(input, output) {
      return variables.expandTemplate(input, vars).then(actual =>
          expect(actual).to.equal(output));
    }

    it('default works', () => check('${bar|default:baz}', 'baz'));

    it('hash works', () => check('${foo|hash}',
        '8R9LfzzIKtjQOwqNEUN5Tw3-oUTgU2UvtufGxDh4wRiiacsW5yga9nqHSYBoBkkp'));

    it('substr works', () => check('${foo|substr:2:4}', 'ello'));

    it('trim works', () => check('${foo|trim}', 'Hello%20world!'));

    it('json works', () =>
      // " Hello world! "
      check('${foo|json}', '%22%20Hello%20world!%20%22'));

    it('toLowerCase works', () =>
        check('${foo|toLowerCase}', '%20hello%20world!%20'));

    it('toUpperCase works', () => {
      return check('${foo|toUpperCase}', '%20HELLO%20WORLD!%20');
    });

    it('not works (truth-y value)', () => check('${foo|not}', 'false'));

    it('not works (false-y value)', () => check('${bar|not}', 'true'));

    it('base64 works', () => {
      return check('${foo|base64}', 'IEhlbGxvIHdvcmxkISA%3D');
    });

    it('if works', () => check('${foo|if:yey:boo}', 'yey'));

    it('chaining works', () => {
      return check('${foo|substr:6}', '%20world!%20').then(() =>
        check('${foo|substr:6|trim}', 'world!')).then(() =>
        check('${foo|substr:6|trim|toUpperCase}', 'WORLD!')).then(() =>
        check('${foo|substr:6|trim|toUpperCase|base64}', 'V09STEQh')).then(() =>
        check('${foo|substr:6|trim|toUpperCase|base64|hash}',
            'OPTTt2IGW8-R31MrIF_cRUwLTZ9jLDOXEuhNz_QS7Uc5ZmODduHWdplzrZ7Jsnqx')
        );
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
