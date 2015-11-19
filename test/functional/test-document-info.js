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

import {createIframePromise} from '../../testing/iframe';
import {documentInfoFor} from '../../src/document-info';

describe('document-info', () => {
  function getWin(canonical) {
    return createIframePromise().then(iframe => {
      if (canonical) {
        const link = iframe.doc.createElement('link');
        link.setAttribute('href', canonical);
        link.setAttribute('rel', 'canonical');
        iframe.doc.head.appendChild(link);
      }
      return iframe.win;
    });
  }

  it('should provide the canonicalUrl', () => {
    return getWin('https://twitter.com/').then(win => {
      expect(documentInfoFor(win).canonicalUrl).to.equal(
          'https://twitter.com/');
    });
  });

  it('should provide the relative canonicalUrl as absolute', () => {
    return getWin('./foo.html').then(win => {
      expect(documentInfoFor(win).canonicalUrl).to.equal(
          'http://localhost:' + location.port + '/foo.html');
    });
  });

  it('should throw if no canonical is available.', () => {
    return getWin(null).then(win => {
      expect(() => {
        documentInfoFor(win).canonicalUrl;
      }).to.throw(/AMP files are required to have a/);
    });
  });
});
