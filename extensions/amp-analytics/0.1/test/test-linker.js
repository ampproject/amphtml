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

import {createLinker} from '../linker';
import {mockWindowInterface} from '../../../../testing/test-helper';

describe('Linker', () => {
  let sandbox;

  beforeEach(() => {
    // Linker uses a timestamp value to generate checksum.
    sandbox = sinon.sandbox;
    sandbox.useFakeTimers();
    sandbox.stub(Date.prototype, 'getTimezoneOffset').returns(400);

    const mockWin = mockWindowInterface(sandbox);
    mockWin.getUserAgent.returns('Chrome 70');
    mockWin.getUserLanguage.returns('en-US');
  });

  afterEach(() => {
    sandbox.restore();
  });

  const tests = [
    {
      description: 'returns empty string if no pairs given',
      version: '1',
      pairs: {},
      output: '',
    },
    {
      description: 'generates param with checksum and version',
      version: '1',
      pairs: {
        foo: '123',
      },
      output: '1~1eum8hq~foo~123',
    },
    {
      description: 'appends one key value pair',
      version: '1',
      pairs: {
        key1: 'value1',
      },
      output: '1~q74iie~key1~value1',
    },
    {
      description: 'appends many key value pairs',
      version: '1',
      pairs: {
        key1: 'value1',
        name: 'bob',
        color: 'green',
        car: 'tesla',
      },
      output: '1~1eit8v3~key1~value1~name~bob~color~green~car~tesla',
    },
    {
      description: 'fake macros',
      version: '1',
      pairs: {
        cid: '12345',
        ref: 'https://www.example.com',
      },
      output: '1~s21iu~cid~12345~ref~https%3A%2F%2Fwww.example.com',
    },
    {
      description: 'encodes url safe keys and values',
      version: '1',
      pairs: {
        '<unsafe>': '//foo@bar',
      },
      output: '1~1gbjnst~%3Cunsafe%3E~%2F%2Ffoo%40bar',
    },
    {
      description: 'encodes tilde in key value pairs',
      version: '1',
      pairs: {
        '~key~': 'hi',
        'key2': '~hi~',
      },
      output: '1~1wqggkq~%7Ekey%7E~hi~key2~%7Ehi%7E',
    },
  ];

  tests.forEach(test => {
    it(test.description, () => {
      const result = createLinker(test.version, test.pairs);
      return expect(result).to.equal(test.output);
    });
  });
});
