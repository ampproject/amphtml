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

describe('getMode', () => {
  function getWin(url) {
    const win = {
      location: parseUrlDeprecated(url),
    };
    return win;
  }

  it('CDN - lite mode on', () => {
    const url =
      'https://cdn.ampproject.org/v/www.example.com/amp.html?amp_js_v=5&amp_lite#origin=https://www.google.com';
    const mode = getMode(getWin(url));
    expect(mode.lite).to.be.true;
  });

  it('CDN - lite mode off', () => {
    const url =
      'https://cdn.ampproject.org/v/www.example.com/amp.html?amp_js_v=5#origin=https://www.google.com';
    const mode = getMode(getWin(url));
    expect(mode.lite).to.be.false;
  });

  it('Origin - lite mode on', () => {
    const url = 'https://www.example.com/amp.html?amp_lite';
    const mode = getMode(getWin(url));
    expect(mode.lite).to.be.true;
  });

  it('Origin - lite mode off', () => {
    const url = 'https://www.example.com/amp.html';
    const mode = getMode(getWin(url));
    expect(mode.lite).to.be.false;
  });
});

describe('getRtvVersion', () => {
  afterEach(() => {
    resetRtvVersionForTesting();
  });

  function getFreshMode(win) {
    delete win.AMP_MODE;
    return getMode(win);
  }

  it('should default to version', () => {
    // $internalRuntimeVersion$ doesn't get replaced during test
    expect(getRtvVersionForTesting(window, true)).to.equal(
      '$internalRuntimeVersion$'
    );
    expect(getRtvVersionForTesting(window, false)).to.equal(
      '01$internalRuntimeVersion$'
    );
  });

  it('should use window.AMP_CONFIG.v if not in dev mode', () => {
    const win = {
      AMP_CONFIG: {
        v: '12345',
      },
      location: parseUrlDeprecated('https://acme.org/doc1'),
    };
    expect(getRtvVersionForTesting(win, true)).to.equal(
      '$internalRuntimeVersion$'
    );
    expect(getRtvVersionForTesting(win, false)).to.equal('12345');
    expect(getFreshMode(win).version).to.equal('$internalRuntimeVersion$');
    resetRtvVersionForTesting();
    expect(getFreshMode(win).rtvVersion).to.equal('12345');

    delete win.AMP_CONFIG;
    expect(getRtvVersionForTesting(win, false)).to.equal(
      '01$internalRuntimeVersion$'
    );
    expect(getFreshMode(win).version).to.equal('$internalRuntimeVersion$');
    resetRtvVersionForTesting();
    expect(getFreshMode(win).rtvVersion).to.equal('01$internalRuntimeVersion$');
  });
});
