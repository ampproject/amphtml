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
  getMode,
  getRtvVersionForTesting,
  resetRtvVersionForTesting,
} from '../../src/mode';
import {parseUrlDeprecated} from '../../src/url';

describes.sandboxed('getMode', {}, () => {
  function getWin(url) {
    const win = {
      location: parseUrlDeprecated(url),
    };
    return win;
  }

  it('should support different html formats for development', () => {
    let url = 'https://www.amp-site.org#development=1';
    expect(getMode(getWin(url)).development).to.be.true;

    url = 'https://www.amp-site.org#development=amp';
    expect(getMode(getWin(url)).development).to.be.true;

    url = 'https://www.amp-site.org#development=amp4email';
    expect(getMode(getWin(url)).development).to.be.true;

    url = 'https://www.amp-site.org#development=amp4ads';
    expect(getMode(getWin(url)).development).to.be.true;

    url = 'https://www.amp-site.org#development=actions';
    expect(getMode(getWin(url)).development).to.be.true;
  });

  it('should not support invalid format for development', () => {
    const url = 'https://www.amp-site.org#development=amp4invalid';
    expect(getMode(getWin(url)).development).to.be.false;
  });
});

describes.sandboxed('getRtvVersion', {}, () => {
  afterEach(() => {
    resetRtvVersionForTesting();
  });

  it('should default to version', () => {
    // $internalRuntimeVersion$ doesn't get replaced during test
    expect(getRtvVersionForTesting(window)).to.equal(
      '01$internalRuntimeVersion$'
    );
  });

  it('should use window.AMP_CONFIG.v', () => {
    const win = {
      AMP_CONFIG: {
        v: '12345',
      },
      location: parseUrlDeprecated('https://acme.org/doc1'),
    };
    expect(getRtvVersionForTesting(win)).to.equal('12345');
  });
});
