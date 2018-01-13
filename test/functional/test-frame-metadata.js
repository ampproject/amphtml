/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
  getContextState,
} from '../../3p/frame-metadata';

const realWinConfigAmpAd = {
  amp: {ampdoc: 'amp-ad'},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('frame-metadata', realWinConfigAmpAd, env => {
  let context;
  let name;
  let win;

  beforeEach(() => {
    win = env.win;
    context = {
      referrer: 'http://acme.org/',
      ampcontextVersion: '$internalRuntimeVersion$',
      ampcontextFilepath: 'https://3p.ampproject.net' +
        '/$internalRuntimeVersion$/ampcontext-v0.js',
      canonicalUrl: 'https://foo.com',
      sourceUrl: 'https://foo.bar.com',
      pageViewId: '1234',
      clientId: '5678',
      mode: {'localDev': true,'development': false,'minified': false,
        'test': false,'version': '$internalRuntimeVersion$'},
      canary: true,
      hidden: false,
      // Note that DOM fingerprint will change if the document DOM changes
      // Note also that running it using --files uses different DOM.
      domFingerprint: '1725030182',
      startTime: 1234567888,
      sentinel: '010101010',
      container: undefined,
      initialIntersection: undefined,
      initialLayoutRect: undefined,
      tagName: undefined,
    };
    name = {
      attributes: {
        _context: context,
      }};
    window.name = JSON.stringify(name);
  });

  afterEach(() => {
    window.name = undefined;
  });

  describe('getContextState', () => {
    it('should return context with usdrd', () => {
      name.attributes['useSameDomainRenderingUntilDeprecated'] = '1';
      win.name = JSON.stringify(name);
      const contextState = getContextState(win);
      context['useSameDomainRenderingUntilDeprecated'] = '1';
      expect(contextState).to.deep.equal(context);
    });
  });


});
