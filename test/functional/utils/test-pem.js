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
  pemToBytes,
} from '../../../src/utils/pem';

describe('pemToBytes', () => {
  const PLAIN_TEXT =
        'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdlatRjRjogo3WojgGHFHYLugd'
        + 'UWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQs'
        + 'HUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5D'
        + 'o2kQ+X5xK9cipRgEKwIDAQAB';
  const PEM = '-----BEGIN PUBLIC KEY-----\n'
        + 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdlatRjRjogo3WojgGHFHYLugd\n'
        + 'UWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQs\n'
        + 'HUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5D\n'
        + 'o2kQ+X5xK9cipRgEKwIDAQAB\n'
        + '-----END PUBLIC KEY-----';

  it('should convert a valid key', () => {
    const binary = pemToBytes(PEM);
    const plain = atob(PLAIN_TEXT);
    const len = plain.length;
    expect(binary.byteLength).to.equal(len);
    expect(binary[0]).to.equal(plain.charCodeAt(0));
    expect(binary[1]).to.equal(plain.charCodeAt(1));
    expect(binary[len - 1]).to.equal(plain.charCodeAt(len - 1));
    expect(binary[len - 2]).to.equal(plain.charCodeAt(len - 2));
  });

  it('should convert without headers, footers, line breaks', () => {
    const binary = pemToBytes(PLAIN_TEXT);
    const plain = atob(PLAIN_TEXT);
    const len = plain.length;
    expect(binary.byteLength).to.equal(len);
    expect(binary[0]).to.equal(plain.charCodeAt(0));
    expect(binary[1]).to.equal(plain.charCodeAt(1));
    expect(binary[len - 1]).to.equal(plain.charCodeAt(len - 1));
    expect(binary[len - 2]).to.equal(plain.charCodeAt(len - 2));
  });

  it('should convert without line breaks', () => {
    const binary = pemToBytes('-----BEGIN PUBLIC KEY-----' + PLAIN_TEXT
                              + '-----END PUBLIC KEY-----');
    const plain = atob(PLAIN_TEXT);
    const len = plain.length;
    expect(binary.byteLength).to.equal(len);
    expect(binary[0]).to.equal(plain.charCodeAt(0));
    expect(binary[1]).to.equal(plain.charCodeAt(1));
    expect(binary[len - 1]).to.equal(plain.charCodeAt(len - 1));
    expect(binary[len - 2]).to.equal(plain.charCodeAt(len - 2));
  });

  it('should convert without header', () => {
    const binary = pemToBytes(PLAIN_TEXT + '-----END PUBLIC KEY-----');
    const plain = atob(PLAIN_TEXT);
    const len = plain.length;
    expect(binary.byteLength).to.equal(len);
    expect(binary[0]).to.equal(plain.charCodeAt(0));
    expect(binary[1]).to.equal(plain.charCodeAt(1));
    expect(binary[len - 1]).to.equal(plain.charCodeAt(len - 1));
    expect(binary[len - 2]).to.equal(plain.charCodeAt(len - 2));
  });

  it('should convert without footer', () => {
    const binary = pemToBytes('-----BEGIN PUBLIC KEY-----' + PLAIN_TEXT);
    const plain = atob(PLAIN_TEXT);
    const len = plain.length;
    expect(binary.byteLength).to.equal(len);
    expect(binary[0]).to.equal(plain.charCodeAt(0));
    expect(binary[1]).to.equal(plain.charCodeAt(1));
    expect(binary[len - 1]).to.equal(plain.charCodeAt(len - 1));
    expect(binary[len - 2]).to.equal(plain.charCodeAt(len - 2));
  });
});
