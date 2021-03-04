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
  calculateEntryPointScriptUrl,
  calculateExtensionScriptUrl,
  getExtensionScripts,
  parseExtensionUrl,
} from '../../src/service/extension-script';
import {createElementWithAttributes} from '../../src/dom';
import {initLogConstructor, resetLogConstructorForTesting} from '../../src/log';

describes.sandboxed('Extension Location', {}, () => {
  describe('get correct script source', () => {
    beforeEach(() => {
      // These functions must not rely on log for cases in SW.
      resetLogConstructorForTesting();
    });

    afterEach(() => {
      initLogConstructor();
      window.__AMP_MODE = {};
    });

    it('with local mode', () => {
      window.__AMP_MODE = {rtvVersion: '123'};
      const script = calculateExtensionScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'amp-ad',
        '0.1',
        true
      );
      expect(script).to.equal(
        'http://localhost:8000/dist/rtv/123/v0/amp-ad-0.1.js'
      );
    });

    it('with remote mode', () => {
      window.__AMP_MODE = {rtvVersion: '123'};
      const script = calculateExtensionScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'amp-ad',
        '1.0',
        false
      );
      expect(script).to.equal(
        'https://cdn.ampproject.org/rtv/123/v0/amp-ad-1.0.js'
      );
    });

    it('should allow no versions', () => {
      window.__AMP_MODE = {rtvVersion: '123'};
      const script = calculateExtensionScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'no-version',
        /* version is empty but defined */ '',
        true
      );
      expect(script).to.equal(
        'http://localhost:8000/dist/rtv/123/v0/no-version.js'
      );
    });
  });

  describe('get correct entry point source', () => {
    beforeEach(() => {
      // These functions must not rely on log for cases in SW.
      resetLogConstructorForTesting();
    });

    afterEach(() => {
      initLogConstructor();
    });

    it('with local mode', () => {
      const script = calculateEntryPointScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'sw',
        true
      );
      expect(script).to.equal('http://localhost:8000/dist/sw.js');
    });

    it('with remote mode', () => {
      window.__AMP_MODE = {rtvVersion: '123'};
      const script = calculateEntryPointScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'sw',
        /* isLocalDev */ false
      );
      expect(script).to.equal('https://cdn.ampproject.org/sw.js');
    });

    it('with remote mode & rtv', () => {
      window.__AMP_MODE = {rtvVersion: '123'};
      const script = calculateEntryPointScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'ww',
        /* isLocalDev */ false,
        /* opt_rtv */ true
      );
      expect(script).to.equal('https://cdn.ampproject.org/rtv/123/ww.js');
    });
  });

  describe('get correct URL parts', () => {
    it('non-RTV urls', () => {
      const urlParts = parseExtensionUrl(
        'https://cdn.ampproject.org/v0/amp-ad-1.0.js'
      );
      expect(urlParts.extensionId).to.equal('amp-ad');
      expect(urlParts.extensionVersion).to.equal('1.0');
    });

    it('RTV urls', () => {
      const urlParts = parseExtensionUrl(
        'https://cdn.ampproject.org/rtv/123/v0/amp-ad-0.1.js'
      );
      expect(urlParts.extensionId).to.equal('amp-ad');
      expect(urlParts.extensionVersion).to.equal('0.1');
    });

    it('extensions with "latest" version', () => {
      const urlParts = parseExtensionUrl(
        'https://cdn.ampproject.org/v0/amp-ad-latest.js'
      );
      expect(urlParts.extensionId).to.equal('amp-ad');
      expect(urlParts.extensionVersion).to.equal('latest');
    });

    it('extensions with .max suffix', () => {
      const urlParts = parseExtensionUrl(
        'https://cdn.ampproject.org/v0/amp-ad-latest.max.js'
      );
      expect(urlParts.extensionId).to.equal('amp-ad');
      expect(urlParts.extensionVersion).to.equal('latest');
    });

    it('returns null for non-extensions', () => {
      const urlParts = parseExtensionUrl('https://cdn.ampproject.org/v0.js');
      expect(urlParts).to.be.null;
    });
  });
});

describes.sandboxed('Module Extension Location', {}, () => {
  describe('get correct script source', () => {
    beforeEach(() => {
      // These functions must not rely on log for cases in SW.
      resetLogConstructorForTesting();
    });

    afterEach(() => {
      initLogConstructor();
      window.__AMP_MODE = {};
    });

    it('with local mode', () => {
      window.__AMP_MODE = {rtvVersion: '123', esm: 1};
      const script = calculateExtensionScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'amp-ad',
        '1.0',
        true
      );
      expect(script).to.equal(
        'http://localhost:8000/dist/rtv/123/v0/amp-ad-1.0.mjs'
      );
    });

    it('with remote mode', () => {
      window.__AMP_MODE = {rtvVersion: '123', esm: 1};
      const script = calculateExtensionScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'amp-ad',
        '0.1',
        false
      );
      expect(script).to.equal(
        'https://cdn.ampproject.org/rtv/123/v0/amp-ad-0.1.mjs'
      );
    });

    it('should allow no versions', () => {
      window.__AMP_MODE = {rtvVersion: '123', esm: 1};
      const script = calculateExtensionScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'no-version',
        /* version is empty but defined */ '',
        true
      );
      expect(script).to.equal(
        'http://localhost:8000/dist/rtv/123/v0/no-version.mjs'
      );
    });
  });

  describe('get correct entry point source', () => {
    beforeEach(() => {
      // These functions must not rely on log for cases in SW.
      resetLogConstructorForTesting();
    });

    afterEach(() => {
      initLogConstructor();
    });

    it('with local mode', () => {
      window.__AMP_MODE = {esm: 1};
      const script = calculateEntryPointScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'sw',
        true
      );
      expect(script).to.equal('http://localhost:8000/dist/sw.mjs');
    });

    it('with remote mode', () => {
      window.__AMP_MODE = {rtvVersion: '123', esm: 1};
      const script = calculateEntryPointScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'sw',
        /* isLocalDev */ false
      );
      expect(script).to.equal('https://cdn.ampproject.org/sw.mjs');
    });

    it('with remote mode & rtv', () => {
      window.__AMP_MODE = {rtvVersion: '123', esm: 1};
      const script = calculateEntryPointScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'ww',
        /* isLocalDev */ false,
        /* opt_rtv */ true
      );
      expect(script).to.equal('https://cdn.ampproject.org/rtv/123/ww.mjs');
    });
  });

  describe('get correct URL parts', () => {
    it('non-RTV urls', () => {
      window.__AMP_MODE = {esm: 1};
      const urlParts = parseExtensionUrl(
        'https://cdn.ampproject.org/v0/amp-ad-1.0.mjs'
      );
      expect(urlParts.extensionId).to.equal('amp-ad');
      expect(urlParts.extensionVersion).to.equal('1.0');
    });

    it('RTV urls', () => {
      window.__AMP_MODE = {esm: 1};
      const urlParts = parseExtensionUrl(
        'https://cdn.ampproject.org/rtv/123/v0/amp-ad-0.1.mjs'
      );
      expect(urlParts.extensionId).to.equal('amp-ad');
      expect(urlParts.extensionVersion).to.equal('0.1');
    });

    it('extensions with "latest" version', () => {
      window.__AMP_MODE = {esm: 1};
      const urlParts = parseExtensionUrl(
        'https://cdn.ampproject.org/v0/amp-ad-latest.mjs'
      );
      expect(urlParts.extensionId).to.equal('amp-ad');
      expect(urlParts.extensionVersion).to.equal('latest');
    });

    it('extensions with .max suffix', () => {
      window.__AMP_MODE = {esm: 1};
      const urlParts = parseExtensionUrl(
        'https://cdn.ampproject.org/v0/amp-ad-latest.max.mjs'
      );
      expect(urlParts.extensionId).to.equal('amp-ad');
      expect(urlParts.extensionVersion).to.equal('latest');
    });
  });
});

describes.fakeWin('getExtensionScripts', {}, (env) => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;

    doc.head.appendChild(
      createElementWithAttributes(doc, 'script', {
        'id': 'amp-ext1-0_1-new-version',
        'i-amphtml-loaded-new-version': '',
        'custom-element': 'amp-ext1',
        'src': 'https://cdn.ampproject.org/v0/amp-ext1-0.1.js',
      })
    );
    doc.head.appendChild(
      createElementWithAttributes(doc, 'script', {
        'id': 'amp-ext1-0_1',
        'custom-element': 'amp-ext1',
        'src': 'https://cdn.ampproject.org/v0/amp-ext1-0.1.js',
      })
    );
    doc.head.appendChild(
      createElementWithAttributes(doc, 'script', {
        'id': 'amp-ext1-latest',
        'i-amphtml-inserted': '',
        'custom-element': 'amp-ext1',
        'src': 'https://cdn.ampproject.org/v0/amp-ext1-latest.js',
      })
    );

    doc.head.appendChild(
      createElementWithAttributes(doc, 'script', {
        'id': 'amp-ext1-0_2',
        'custom-element': 'amp-ext1',
        'src': 'https://cdn.ampproject.org/v0/amp-ext1-0.2.js',
      })
    );

    doc.head.appendChild(
      createElementWithAttributes(doc, 'script', {
        'id': 'amp-ext2-latest',
        'custom-element': 'amp-ext2',
        'src': 'https://cdn.ampproject.org/v0/amp-ext2-latest.js',
      })
    );

    doc.head.appendChild(
      createElementWithAttributes(doc, 'script', {
        'id': 'intermediate1',
        'src': 'https://cdn.ampproject.org/v0/_intermediate-latest.js',
      })
    );
  });

  function ids(array) {
    return array.map((a) => a.id);
  }

  it('should find a specific version', () => {
    expect(
      ids(getExtensionScripts(win, 'amp-ext1', '0.1', false))
    ).to.deep.equal(['amp-ext1-0_1']);
    expect(
      ids(getExtensionScripts(win, 'amp-ext1', '0.2', false))
    ).to.deep.equal(['amp-ext1-0_2']);
    expect(
      ids(getExtensionScripts(win, 'amp-ext2', '0.1', false))
    ).to.deep.equal([]);
  });

  it('should find a specific version with latest', () => {
    expect(
      ids(getExtensionScripts(win, 'amp-ext1', '0.1', true))
    ).to.deep.equal(['amp-ext1-0_1', 'amp-ext1-latest']);
    expect(
      ids(getExtensionScripts(win, 'amp-ext1', '0.2', true))
    ).to.deep.equal(['amp-ext1-latest', 'amp-ext1-0_2']);
    expect(
      ids(getExtensionScripts(win, 'amp-ext2', '0.1', true))
    ).to.deep.equal(['amp-ext2-latest']);
  });

  it('should find an intermediate extension', () => {
    expect(
      ids(getExtensionScripts(win, '_intermediate', '', false))
    ).to.deep.equal(['intermediate1']);
  });

  it('should ignore an inserted script', () => {
    expect(
      ids(
        getExtensionScripts(
          win,
          'amp-ext1',
          '0.1',
          true,
          /* includeInserted */ false
        )
      )
    ).to.deep.equal(['amp-ext1-0_1']);
  });
});
