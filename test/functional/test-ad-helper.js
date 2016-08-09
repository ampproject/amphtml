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

import {isAdPositionAllowed} from '../../src/ad-helper';
import {createIframePromise} from '../../testing/iframe';

describe('ad-helper', () => {
  it('should allow position fixed element that is whitelisted element', () => {
    return createIframePromise().then(iframe => {
      const whitelistedElement = iframe.doc.createElement('amp-lightbox');
      whitelistedElement.style.position = 'fixed';
      iframe.doc.body.appendChild(whitelistedElement);
      expect(isAdPositionAllowed(whitelistedElement, iframe.win)).to.be.true;
    });
  });

  it('should allow position fixed element inside whitelisted element', () => {
    return createIframePromise().then(iframe => {
      const whitelistedElement = iframe.doc.createElement('amp-lightbox');
      whitelistedElement.style.position = 'fixed';
      const childElement = iframe.doc.createElement('div');
      const childChildElement = iframe.doc.createElement('div');
      childElement.appendChild(childChildElement);
      whitelistedElement.appendChild(childElement);
      iframe.doc.body.appendChild(whitelistedElement);
      expect(isAdPositionAllowed(childChildElement, iframe.win)).to.be.true;
    });
  });

  it('should not allow position fixed element that is non-whitelisted ' +
      'element', () => {
    return createIframePromise().then(iframe => {
      const nonWhitelistedElement = iframe.doc.createElement('foo-bar');
      nonWhitelistedElement.style.position = 'fixed';
      iframe.doc.body.appendChild(nonWhitelistedElement);
      expect(isAdPositionAllowed(nonWhitelistedElement, iframe.win))
          .to.be.false;
    });
  });

  it('should not allow position fixed element inside non-whitelisted ' +
      'element', () => {
    return createIframePromise().then(iframe => {
      const nonWhitelistedElement = iframe.doc.createElement('foo-bar');
      nonWhitelistedElement.style.position = 'fixed';
      const childElement = iframe.doc.createElement('div');
      const childChildElement = iframe.doc.createElement('div');
      childElement.appendChild(childChildElement);
      nonWhitelistedElement.appendChild(childElement);
      iframe.doc.body.appendChild(nonWhitelistedElement);
      expect(isAdPositionAllowed(childChildElement, iframe.win)).to.be.false;
    });
  });

});
