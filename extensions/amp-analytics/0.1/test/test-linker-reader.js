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

import {
  installLinkerReaderService,
  linkerReaderServiceFor,
} from '../linker-reader';
import {mockWindowInterface} from '../../../../testing/test-helper';

describe('LinkerReader', () => {
  let sandbox;
  let linkerReader;
  let mockWin;

  beforeEach(() => {
    // Can not import from test-linker.js because all test in test-liner.js
    // will be run with the test-linker-reader if we do so.
    sandbox = sinon.sandbox;
    sandbox.useFakeTimers(1533329483292);
    sandbox.stub(Date.prototype, 'getTimezoneOffset').returns(420);
    mockWin = mockWindowInterface(sandbox);
    mockWin.getUserAgent.returns(
      'Mozilla/5.0 (X11; Linux x86_64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 ' +
        'Safari/537.36'
    );
    mockWin.getUserLanguage.returns('en-US');
    mockWin.location = {
      href: 'https://example.com?testlinker=1*1f66u1p*key1*dmFsdWUx',
    };
    mockWin.history = {
      replaceState: (unusedVar1, unusedVar2, newHref) => {
        mockWin.location.href = newHref;
      },
    };
    installLinkerReaderService(mockWin);
    linkerReader = linkerReaderServiceFor(mockWin);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('LinkerReader Service', () => {
    it('return null when no params', () => {
      expectAsyncConsoleError(/LINKER_PARAM requires two params, name and id/);
      expect(linkerReader.get('testlinker')).to.be.null;
      expect(mockWin.location.href).to.equal(
        'https://example.com?testlinker=1*1f66u1p*key1*dmFsdWUx'
      );
    });

    it('return null when no linker name', () => {
      expect(linkerReader.get('nolinker', 'id')).to.be.null;
      expect(mockWin.location.href).to.equal(
        'https://example.com?testlinker=1*1f66u1p*key1*dmFsdWUx'
      );
    });

    it('return null when linker name value is invalid', () => {
      expectAsyncConsoleError(/LINKER_PARAM value checksum not valid/);
      mockWin.location.href = 'https://example.com?testlinker=1*123*key*error';
      expect(linkerReader.get('testlinker', 'key')).to.be.null;
      expect(mockWin.location.href).to.equal('https://example.com/');
    });

    it('return null when no linker id value', () => {
      mockWin.location.href =
        'https://example.com?testlinker=1*1f66u1p*key1*dmFsdWUx';
      expect(linkerReader.get('testlinker', 'key2')).to.be.null;
      expect(mockWin.location.href).to.equal('https://example.com/');
    });

    it('remove linker_param from url', () => {
      mockWin.location.href =
        'https://example.com?a=1&b=2&' +
        'testlinker=1*1f66u1p*key1*dmFsdWUx&c&' +
        'testlinker2=1*1f66u1p*key1*dmFsdWUx&d=2#hash';
      linkerReader.get('testlinker', 'id');
      expect(mockWin.location.href).to.equal(
        'https://example.com/?a=1&b=2&c&' +
          'testlinker2=1*1f66u1p*key1*dmFsdWUx&d=2#hash'
      );
      linkerReader.get('testlinker2', 'key1');
      expect(mockWin.location.href).to.equal(
        'https://example.com/?a=1&b=2&c&' + 'd=2#hash'
      );
    });

    it('return correct id value', () => {
      mockWin.location.href =
        'https://example.com?' +
        'test=1*1f66u1p*key1*dmFsdWUx&var=foo&' +
        'test2=1*1m48hbv*cid*MTIzNDU.*ref*aHR0cHM6Ly93d3cuZXhhbXBsZS5jb20.';
      expect(linkerReader.get('test', 'key1')).to.equal('value1');
      expect(linkerReader.get('test2', 'cid')).to.equal('12345');
      expect(linkerReader.get('test2', 'ref')).to.equal(
        'https://www.example.com'
      );
      expect(mockWin.location.href).to.equal('https://example.com/?var=foo');
    });

    it('returns same value when reading the same id', () => {
      mockWin.location.href =
        'https://example.com?' + 'test=1*1f66u1p*key1*dmFsdWUx&var=foo';
      expect(linkerReader.get('test', 'key1')).to.equal('value1');
      expect(linkerReader.get('test', 'key1')).to.equal('value1');
    });
  });
});
