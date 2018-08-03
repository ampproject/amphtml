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
      description: 'generates param with checksum and version',
      version: '1',
      pairs: {},
      output: '1~7raowy',
    },
    {
      description: 'appends one key value pair',
      version: '1',
      pairs: {
        key1: 'value1',
      },
      output: '1~13jbg4c~key1~dmFsdWUx',
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
      output: '1~193jzt~key1~dmFsdWUx~name~Ym9i~color~Z3JlZW4.~car~aG9uZGE.',
    },
  ];

  tests.forEach(test => {
    it(test.description, () => {
      const result = linker.create(test.version, test.pairs);
      return expect(result).to.eventually.equal(test.output);
    });
  });

  it('resolves macros', () => {
    const test = {
      description: 'resolves macros',
      version: '1',
      pairs: {
        cid: 'CLIENT_ID(_ga)',
        referrer: 'DOCUMENT_REFERRER',
      },
      output: '',
    };

    const urlService = linker.urlReplacementService_;
    const expandStub = sandbox.stub(urlService, 'expandStringAsync');

    expandStub.withArgs('CLIENT_ID(_ga)').resolves('12345');
    expandStub.withArgs('DOCUMENT_REFERRER').resolves('https://www.example.com');

    const result = linker.create(test.version, test.pairs);
    return expect(result).to.eventually.equal(test.output);
  });
});
