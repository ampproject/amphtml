/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
  stringToBytes,
  bytesToString,
  getCryptoRandomBytesArray,
  utf8Encode,
  utf8Decode,
} from '../../../src/utils/bytes';

describe('stringToBytes', function() {
  let fakeWin;

  beforeEach(() => {
    fakeWin = {
      crypto: {
        getRandomValues: array => {
          for (let i = 0; i < array.length; i++) {
            array[i] = i + 1;
          }
        },
      },
    };
  });

  it('should map a sample string appropriately', () => {
    const bytes = stringToBytes('abÿ');
    expect(bytes.length).to.equal(3);
    expect(bytes[0]).to.equal(97);
    expect(bytes[1]).to.equal(98);
    expect(bytes[2]).to.equal(255);
  });

  it('should signal an error with a character >255', () => {
    expect(() => {
      return stringToBytes('ab☺');
    }).to.throw();
  });

  it('should convert bytes array to string', () => {
    const str = bytesToString(new Uint8Array([102, 111, 111]));
    expect(str).to.equal('foo');
  });

  it('should generate random bytes array when win.crypto is availble', () => {
    expect(getCryptoRandomBytesArray(fakeWin, 1)).to.deep
      .equal(new Uint8Array([1]));
    expect(getCryptoRandomBytesArray(fakeWin, 2)).to.deep
      .equal(new Uint8Array([1, 2]));
    expect(getCryptoRandomBytesArray(fakeWin, 3)).to.deep
      .equal(new Uint8Array([1, 2, 3]));
  });

  it('should return null when trying to generate random bytes array if ' +
      'win.crypto is not availble', () => {
    fakeWin.crypto = undefined;
    expect(getCryptoRandomBytesArray(fakeWin, 1)).to.be.null;
  });
});

describe('utf8', function() {

  // Examples here courtesy of StackOverflow:
  // http://stackoverflow.com/questions/478201/how-to-test-an-application-for
  // -correct-encoding-e-g-utf-8

  const strings = [
      'ユーザー別サイト',
      '简体中文',
      '크로스플랫폼으로',
      'מדוריםמבוקשים',
      'أفضلالبحوث',
      'Σὲγνωρίζωἀπὸ',
      'ДесятуюМеждународную',
      'แผ่นดินฮั่นเสื่อมโทรมแสนสังเวช'
  ];

  const bytes = [
    ['\u30E6', '\u30FC', '\u30B6', '\u30FC', '\u5225', '\u30B5', '\u30A4',
     '\u30C8'],
    ['\u7B80', '\u4F53', '\u4E2D', '\u6587'],
    ['\uD06C', '\uB85C', '\uC2A4', '\uD50C', '\uB7AB', '\uD3FC', '\uC73C',
     '\uB85C'],
    ['\u05DE', '\u05D3', '\u05D5', '\u05E8', '\u05D9', '\u05DD', '\u05DE',
     '\u05D1', '\u05D5', '\u05E7', '\u05E9', '\u05D9', '\u05DD'],
    ['\u0623', '\u0641', '\u0636', '\u0644', '\u0627', '\u0644', '\u0628',
     '\u062D', '\u0648', '\u062B'],
    ['\u03A3', '\u1F72', '\u03B3', '\u03BD', '\u03C9', '\u03C1', '\u03AF',
     '\u03B6', '\u03C9', '\u1F00', '\u03C0', '\u1F78'],
    ['\u0414', '\u0435', '\u0441', '\u044F', '\u0442', '\u0443', '\u044E',
     '\u041C', '\u0435', '\u0436', '\u0434', '\u0443', '\u043D', '\u0430',
     '\u0440', '\u043E', '\u0434', '\u043D', '\u0443', '\u044E'],
    ['\u0E41', '\u0E1C', '\u0E48', '\u0E19', '\u0E14', '\u0E34', '\u0E19',
     '\u0E2E', '\u0E31', '\u0E48', '\u0E19', '\u0E40', '\u0E2A', '\u0E37',
     '\u0E48', '\u0E2D', '\u0E21', '\u0E42', '\u0E17', '\u0E23', '\u0E21',
     '\u0E41', '\u0E2A', '\u0E19', '\u0E2A', '\u0E31', '\u0E07', '\u0E40',
     '\u0E27', '\u0E0A']
  ];

  function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0; i < str.length; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  it('should encode given string into utf-8 byte array', () => {
    for (let i = 0; i < strings.length; i++) {
      const string = strings[i];
      utf8Encode(string).then(byteArray => expect(byteArray).to.deep.equal(
          new Uint8Array(bytes[i])));
    }
  });

  it('should decode given utf-8 bytes into string', () => {
    for (let i = 0; i < bytes.length; i++) {
      const arrayBuffer = str2ab(bytes[i].join(''));
      utf8Decode(arrayBuffer).then(string => expect(string).to.equal(strings[i]));
    }
  });
});
