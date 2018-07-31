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

  it('generates param with checksum and version', () => {
    const config = {
      url: 'https://www.google.com',
      key: '_foo',
      version: '1',
    };

    const result = linker.create(config);
    const expected = 'https://www.google.com?_foo=' +
      '1~MTAwMTc5NzYxMQ%3D%3D';
    return expect(result).to.eventually.equal(expected);
  });

  it('uses the correct urls', () => {
    const config = {
      url: 'https://www.example.com',
      key: '_foo',
      version: '1',
    };

    const result = linker.create(config);
    const expected = 'https://www.example.com?_foo=' +
      '1~MTAwMTc5NzYxMQ%3D%3D';
    return expect(result).to.eventually.equal(expected);
  });

  it('uses the correct queryparam name', () => {
    const config = {
      url: 'https://www.example.com',
      key: 'cool',
      version: '1',
    };

    const result = linker.create(config);
    const expected = 'https://www.example.com?cool=' +
      '1~MTAwMTc5NzYxMQ%3D%3D';
    return expect(result).to.eventually.equal(expected);
  });

  it('appends one key value pair', () => {
    const config = {
      url: 'https://www.google.com',
      key: '_foo',
      version: '1',
      pairs: {
        key1: 'value1',
      },
    };

    const result = linker.create(config);
    const expected = 'https://www.google.com?_foo=' +
      '1~LTE2NzczNTE4ODE%3D~a2V5MQ%3D%3D~W29iamVjdCBQcm9taXNlXQ%3D%3D';
    return expect(result).to.eventually.equal(expected);
  });

  it('appends many key value pairs', () => {
    const config = {
      url: 'https://www.google.com',
      key: '_foo',
      version: '1',
      pairs: {
        key1: 'value1',
        name: 'bob',
        color: 'green',
        car: 'honda',
      },
    };

    const result = linker.create(config);
    const expected = 'https://www.google.com?_foo=1~MjE0NTkzMTc5Nw%3D%3D~' +
    'a2V5MQ%3D%3D~W29iamVjdCBQcm9taXNlXQ%3D%3DbmFtZQ%3D%3D~' +
    'W29iamVjdCBQcm9taXNlXQ%3D%3DY29sb3I%3D~W29iamVjdCBQcm9taXNlXQ%3D%3DY2Fy' +
    '~W29iamVjdCBQcm9taXNlXQ%3D%3D';
    return expect(result).to.eventually.equal(expected);
  });

  it('resolves macros', () => {
    const config = {
      url: 'https://www.google.com',
      key: '_foo',
      version: '1',
      pairs: {
        cid: 'CLIENT_ID(_ga)',
        referrer: 'DOCUMENT_REFERRER',
      },
    };

    const urlService = linker.urlReplacementService_;
    const expandStub = sandbox.stub(urlService, 'expandStringAsync');

    expandStub.withArgs('CLIENT_ID(_ga)').resolves('12345');
    expandStub.withArgs('DOCUMENT_REFERRER').resolves('https://www.example.com');

    const result = linker.create(config);
    const expected = 'https://www.google.com?_foo=1~LTE5MTczMjU1NjU%3D~' +
    'Y2lk~W29iamVjdCBQcm9taXNlXQ%3D%3DcmVmZXJyZXI%3D~' +
    'W29iamVjdCBQcm9taXNlXQ%3D%3D';
    return expect(result).to.eventually.equal(expected);
  });
});
