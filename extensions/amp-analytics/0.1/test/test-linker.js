import {mockWindowInterface} from '#testing/helpers/service';

import {createLinker, parseLinker} from '../linker';

const TAG = '[amp-analytics/linker]';

const BASE_TIME = 1533329483292;

const parseLinkerTests = [
  {
    description: 'invalid value miss component',
    value: '1*key*123',
    output: null,
    errorMsg: 'Invalid linker_param value 1*key*123',
  },
  {
    description: 'invalid value miss value',
    value: '1*1*key1*123*key2',
    output: null,
    errorMsg: 'Invalid linker_param value 1*1*key1*123*key2',
  },
  {
    description: 'invalid value unsupported version number',
    value: '2*1*key1*123',
    output: null,
    errorMsg: 'Invalid version number 2',
  },
  {
    description: 'invalid keys value',
    value: '1*15qclke*~key1*123',
    output: {},
    errorMsg: 'Invalid linker key ~key1, value ignored',
  },
  {
    description: 'invalid value checksum not correct',
    currentTime: BASE_TIME + 2 * 60000,
    value: '1*1f66u1p*key1*dmFsdWUx',
    output: null,
    errorMsg: 'LINKER_PARAM value checksum not valid',
  },
  {
    description: 'tolerate checksum with one minute offset',
    currentTime: BASE_TIME + 60000,
    value: '1*1f66u1p*key1*dmFsdWUx',
    output: {
      'key1': 'value1',
    },
  },
  {
    description: 'works with multiple key value pairs',
    value: '1*6orwo8*key1*dmFsdWUx*name*Ym9i*color*Z3JlZW4.*car*dGVzbGE.',
    output: {
      'key1': 'value1',
      'name': 'bob',
      'color': 'green',
      'car': 'tesla',
    },
  },
  {
    description: 'decode URL correctly',
    value: '1*1m48hbv*cid*MTIzNDU.*ref*aHR0cHM6Ly93d3cuZXhhbXBsZS5jb20.',
    output: {
      cid: '12345',
      ref: 'https://www.example.com',
    },
  },
  {
    description: 'decodes * in values',
    value: '1*1fo13qb*key*KmhpKg..*key2*Kioq',
    output: {
      'key': '*hi*',
      'key2': '***',
    },
  },
  {
    description: 'decodes unicode in values',
    value: '1*bgtsvu*key*5Lit5paH*key2*z4A.',
    output: {
      'key': '中文',
      'key2': 'π',
    },
  },
  {
    description: 'decodes base64 chars in keys',
    value: '1*uidf2s*0x3*MHgz*_gb*X2di*g.b*Zy5i*nn-*bm4t',
    output: {
      '0x3': '0x3',
      '_gb': '_gb',
      'g.b': 'g.b',
      'nn-': 'nn-',
    },
  },
];

const createLinkerTests = [
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
    output: '1*14cn7x*foo*MTIz',
  },
  {
    description: 'appends one key value pair',
    version: '1',
    pairs: {
      key1: 'value1',
    },
    output: '1*1f66u1p*key1*dmFsdWUx',
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
    output: '1*6orwo8*key1*dmFsdWUx*name*Ym9i*color*Z3JlZW4.*car*dGVzbGE.',
  },
  {
    description: 'encodes URL unsafe chars in values',
    version: '1',
    pairs: {
      cid: '12345',
      ref: 'https://www.example.com',
    },
    output: '1*1m48hbv*cid*MTIzNDU.*ref*aHR0cHM6Ly93d3cuZXhhbXBsZS5jb20.',
  },
  {
    description: 'encodes * in values',
    version: '1',
    pairs: {
      'key': '*hi*',
      'key2': '***',
    },
    output: '1*1fo13qb*key*KmhpKg..*key2*Kioq',
  },
  {
    description: 'encodes unicode in values',
    version: '1',
    pairs: {
      'key': '中文',
      'key2': 'π',
    },
    output: '1*bgtsvu*key*5Lit5paH*key2*z4A.',
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
    output: '1*uidf2s*0x3*MHgz*_gb*X2di*g.b*Zy5i*nn-*bm4t',
  },
  {
    description: 'ignores invalid keys',
    version: '1',
    pairs: {
      '*invalid': '123',
      'valid': 'abc',
    },
    output: '1*m20mv5*valid*YWJj',
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
    output: '1*5x9ojm*_ga*MTIxODQzNTA1NS4xNTM2MTg4OTEz',
  },
  {
    description: 'works for AMP CID API generated Client ID',
    version: '1',
    pairs: {
      '_ga':
        'amp-' +
        'oRg8vByriPdstwLgkz-UNWbp2P13vNFsnhES5vW8s5WodTOoea0mTiY7X62utLyz',
    },
    output:
      '1*1fkd1zz*_ga*' +
      'YW1wLW9SZzh2QnlyaVBkc3R3TGdrei1VTldicDJQMT' +
      'N2TkZzbmhFUzV2VzhzNVdvZFRPb2VhMG1UaVk3WDYydXRMeXo.',
  },
  {
    description: 'works for AMP Viewer generated Client ID',
    version: '1',
    pairs: {
      '_ga': 'WgcaAD4XN2lydhQVNFruk6X8zwoUg6K2RnaRlhjs6CXvTv4aJV-3oVLdI1WxxvJb',
    },
    output:
      '1*19eaxqc*_ga*' +
      'V2djYUFENFhOMmx5ZGhRVk5GcnVrNlg4endvVWc2Sz' +
      'JSbmFSbGhqczZDWHZUdjRhSlYtM29WTGRJMVd4eHZKYg..',
  },
];

describes.sandboxed('Linker', {}, (env) => {
  let mockWin;
  beforeEach(() => {
    // Linker uses a timestamp value to generate checksum.
    env.sandbox.useFakeTimers(BASE_TIME);
    env.sandbox.stub(Date.prototype, 'getTimezoneOffset').returns(420);
    mockWin = mockWindowInterface(env.sandbox);
    mockWin.getUserAgent.returns(
      'Mozilla/5.0 (X11; Linux x86_64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 ' +
        'Safari/537.36'
    );
    mockWin.getUserLanguage.returns('en-US');
  });

  describe('createLinker', () => {
    createLinkerTests.forEach((test) => {
      it(test.description, () => {
        if (test.expectErrors) {
          expectAsyncConsoleError(/Invalid linker key/, test.expectErrors);
        }
        expect(createLinker(test.version, test.pairs)).to.equal(test.output);
      });
    });
  });

  describe('parseLinker', () => {
    parseLinkerTests.forEach((test) => {
      it(test.description, () => {
        if (test.errorMsg) {
          expectAsyncConsoleError(TAG + ' ' + test.errorMsg);
        }
        if (test.currentTime) {
          env.sandbox.useFakeTimers(test.currentTime);
        }
        expect(parseLinker(test.value)).to.deep.equal(test.output);
      });
    });
  });
});
