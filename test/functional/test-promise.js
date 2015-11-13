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

import * as promise from '../../src/promise';

describe('promise', () => {

  it('should immediately yield when empty', () => {
    return promise.all([]).then(results => {
      expect(results).to.have.length.of(0);
    });
  });

  it('should yield with multiple promises', () => {
    const promises = [
      Promise.resolve('A'),
      Promise.resolve('B'),
      Promise.resolve('C')
    ];
    return promise.all(promises).then(results => {
      expect(results).to.have.length.of(3);
      expect(results[0]).to.equal('A');
      expect(results[1]).to.equal('B');
      expect(results[2]).to.equal('C');
    });
  });

  it('should yield with multiple promises and random yielding', () => {
    let resolverB;
    let resolverC;
    const promises = [
      Promise.resolve('A'),
      new Promise(resolve => resolverB = resolve),
      new Promise(resolve => resolverC = resolve)
    ];

    // Resolve C first and then B
    resolverC('C');
    resolverB('B');

    return promise.all(promises).then(results => {
      expect(results).to.have.length.of(3);
      expect(results[0]).to.equal('A');
      expect(results[1]).to.equal('B');
      expect(results[2]).to.equal('C');
    });
  });

  it('should fail as soon as one fails', () => {
    const promises = [
      Promise.resolve('A'),
      Promise.reject('ERROR1'),
      new Promise(resolve => {})  // Will never yield.
    ];
    return promise.all(promises).then(results => {
      return 'SUCCESS';
    }, error => {
      return error;
    }).then(successOrFailure => {
      expect(successOrFailure).to.equal('ERROR1');
    });
  });
});
