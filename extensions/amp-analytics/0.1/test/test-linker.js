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
      description: 'returns empty string if pairs=null',
      version: '1',
      pairs: null,
      output: '',
    },
    {
      description: 'returns empty string if pairs=undefined',
      version: '1',
      pairs: undefined,
      output: '',
    },
    {
      description: 'generates param with checksum and version',
      version: '1',
      pairs: {
        foo: '123',
      },
      output: '1*1mkbmc3*foo*MTIz',
    },
    {
      description: 'appends one key value pair',
      version: '1',
      pairs: {
        key1: 'value1',
      },
      output: '1*h9i6qb*key1*dmFsdWUx',
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
      output: '1*efercj*key1*dmFsdWUx*name*Ym9i*color*Z3JlZW4.*car*dGVzbGE.',
    },
    {
      description: 'value contains URL unsafe chars',
      version: '1',
      pairs: {
        cid: '12345',
        ref: 'https://www.example.com',
      },
      output: '1*vz1vnu*cid*MTIzNDU.*ref*aHR0cHM6Ly93d3cuZXhhbXBsZS5jb20.',
    },
    {
      description: 'works if value has *',
      version: '1',
      pairs: {
        'key': '*hi*',
        'key2': '***',
      },
      output: '1*lpias9*key*KmhpKg..*key2*Kioq',
    },
    {
      description: 'encodes unicode in values',
      version: '1',
      pairs: {
        'key': '中文',
        'key2': 'π',
      },
      output: '1*1pf8zsw*key*5Lit5paH*key2*z4A.',
    },
  ];

  tests.forEach(test => {
    it(test.description, () => {
      expect(createLinker(test.version, test.pairs)).to.equal(test.output);
    });
  });

  const testsWithInvalidKeys = [
    {
      description: 'ignore invalid keys',
      version: '1',
      pairs: {
        '*invalid': '123',
        'valid': 'abc',
      },
      output: '1*bn7mun*valid*YWJj',
    },
    {
      description: 'return empty string if all keys are invalid',
      version: '1',
      pairs: {
        '*invalid': '123',
        'invalid!': 'abc',
      },
      output: '',
    },
  ];

  testsWithInvalidKeys.forEach(test => {
    it(test.description, () => {
      allowConsoleError(() => {
        expect(createLinker(test.version, test.pairs)).to.equal(test.output);
      });
    });
  });
});
