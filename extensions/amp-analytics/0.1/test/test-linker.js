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
      description: 'encodes URL unsafe chars in values',
      version: '1',
      pairs: {
        cid: '12345',
        ref: 'https://www.example.com',
      },
      output: '1*vz1vnu*cid*MTIzNDU.*ref*aHR0cHM6Ly93d3cuZXhhbXBsZS5jb20.',
    },
    {
      description: 'encodes * in values',
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
    {
      description: 'allows base64 chars in keys',
      version: '1',
      pairs: {
        '0x3': '0x3',
        '_gb': '_gb',
        'g.b': 'g.b',
        'nn-': 'nn-',
      },
      output: '1*10d75fz*0x3*MHgz*_gb*X2di*g.b*Zy5i*nn-*bm4t',
    },
    {
      description: 'ignores invalid keys',
      version: '1',
      pairs: {
        '*invalid': '123',
        'valid': 'abc',
      },
      output: '1*bn7mun*valid*YWJj',
      expectErrors: 1,
    },
    {
      description: 'returns empty string if all keys are invalid',
      version: '1',
      pairs: {
        '*invalid': '123',
        'invalid!': 'abc',
      },
      output: '',
      expectErrors: 2,
    },
    {
      description: 'works for Google Analytics generated Client ID',
      version: '1',
      pairs: {
        '_ga': '1218435055.1536188913',
      },
      output: '1*im1xrd*_ga*MTIxODQzNTA1NS4xNTM2MTg4OTEz',
    },
    {
      description: 'works for AMP CID API generated Client ID',
      version: '1',
      pairs: {
        '_ga': 'amp-' +
          'oRg8vByriPdstwLgkz-UNWbp2P13vNFsnhES5vW8s5WodTOoea0mTiY7X62utLyz',
      },
      output: '1*s5ix2m*_ga*' +
        'YW1wLW9SZzh2QnlyaVBkc3R3TGdrei1VTldicDJQMT' +
        'N2TkZzbmhFUzV2VzhzNVdvZFRPb2VhMG1UaVk3WDYydXRMeXo.',
    },
    {
      description: 'works for AMP Viewer generated Client ID',
      version: '1',
      pairs: {
        '_ga':
            'WgcaAD4XN2lydhQVNFruk6X8zwoUg6K2RnaRlhjs6CXvTv4aJV-3oVLdI1WxxvJb',
      },
      output: '1*m7cqu6*_ga*' +
        'V2djYUFENFhOMmx5ZGhRVk5GcnVrNlg4endvVWc2Sz' +
        'JSbmFSbGhqczZDWHZUdjRhSlYtM29WTGRJMVd4eHZKYg..',
    },
  ];

  tests.forEach(test => {
    it(test.description, () => {
      if (test.expectErrors) {
        expectAsyncConsoleError(/Invalid linker key/, test.expectErrors);
      }
      expect(createLinker(test.version, test.pairs)).to.equal(test.output);
    });
  });
});
