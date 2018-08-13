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

import {Linker} from '../linker';

describes.realWin('Linker', {
  amp: true,
}, env => {
  let ampdoc;
  let linker;
  let sandbox;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    sandbox = env.sandbox;
    linker = new Linker(ampdoc);
    // Linker uses a timestamp value to generate checksum.
    sandbox.useFakeTimers();
  });

  const tests = [
    {
      description: 'returns empty string if no pairs given',
      version: '1',
      pairs: {
      },
      output: '',
    },
    {
      description: 'generates param with checksum and version',
      version: '1',
      pairs: {
        foo: '123',
      },
      output: '1~mf9onh~foo~MTIz',
    },
    {
      description: 'appends one key value pair',
      version: '1',
      pairs: {
        key1: 'value1',
      },
      output: '1~1pinp2k~key1~dmFsdWUx',
    },
    {
      description: 'appends many key value pairs',
      version: '1',
      pairs: {
        key1: 'value1',
        name: 'bob',
        color: 'green',
        car: 'honda',
      },
      output: '1~fgkeaa~key1~dmFsdWUx~name~Ym9i~color~Z3JlZW4.~car~aG9uZGE.',
    },
    {
      description: 'fake macros',
      version: '1',
      pairs: {
        cid: '12345',
        ref: 'https://www.example.com',
      },
      output: '1~wqs6ww~cid~MTIzNDU.~ref~aHR0cHM6Ly93d3cuZXhhbXBsZS5jb20.',
    },
  ];

  tests.forEach(test => {
    it(test.description, () => {
      const result = linker.create(test.version, test.pairs);
      return expect(result).to.equal(test.output);
    });
  });
});
