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

import {AmpPixel} from '../../builtins/amp-pixel';
import {Services} from '../../src/services';
import {createElementWithAttributes} from '../../src/dom';
import {
  depositRequestUrl,
  withdrawRequest,
} from '../../testing/test-helper';

describe.configure().skipIfPropertiesObfuscated().run('amp-pixel', function() {
  this.timeout(15000);

  describes.integration('amp-pixel referrer integration test', {
    body: `<amp-pixel src="${depositRequestUrl('has-referrer')}">`,
  }, env => {
    it('should keep referrer if no referrerpolicy specified', () => {
      return withdrawRequest(env.win, 'has-referrer').then(request => {
        expect(request.headers.referer).to.be.ok;
      });
    });
  });

  describes.integration('amp-pixel macro integration test', {
    body: `<amp-pixel src="${depositRequestUrl(
        'hello-world&title=TITLE&qp=QUERY_PARAM(a)')}">`,
    params: {
      a: 123,
    },
  }, env => {
    it('should expand the TITLE macro', () => {
      return withdrawRequest(env.win, 'hello-world&title=AMP%20TEST&qp=123')
          .then(request => {
            expect(request.headers.host).to.be.ok;
          });
    });
  });

  describes.integration('amp-pixel no-referrer integration test', {
    body: `<amp-pixel src="${depositRequestUrl('no-referrer')}"
             referrerpolicy="no-referrer">`,
  }, env => {
    it('should remove referrer if referrerpolicy=no-referrer', () => {
      return withdrawRequest(env.win, 'no-referrer').then(request => {
        expect(request.headers.referer).to.not.be.ok;
      });
    });
  });
});

describes.fakeWin('amp-pixel with img (inabox)', {amp: true}, env => {
  it('should not write image', () => {
    const src = 'https://foo.com/tracker/foo';
    const pixelElem =
        createElementWithAttributes(env.win.document, 'amp-pixel',
            {src, 'i-amphtml-ssr': ''});
    pixelElem.appendChild(
        createElementWithAttributes(env.win.document, 'img', {src}));
    env.win.document.body.appendChild(pixelElem);
    const viewer = Services.viewerForDoc(env.win.document);
    env.sandbox.stub(viewer, 'whenFirstVisible').callsFake(() => {
      return Promise.resolve();
    });
    const pixel = new AmpPixel(pixelElem);
    pixel.buildCallback();
    expect(pixelElem.querySelectorAll('img').length).to.equal(1);
  });
});
