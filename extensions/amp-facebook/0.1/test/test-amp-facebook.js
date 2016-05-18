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

import {
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
require('../amp-facebook');
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-facebook', function() {
  this.timeout(5000);

  const fbPostHref = 'https://www.facebook.com/zuck/posts/10102593740125791';
  const fbVideoHref = 'https://www.facebook.com/zuck/videos/10102509264909801/';

  function getFBPost(href, opt_embedAs, opt_noFakeResources) {
    return createIframePromise().then(iframe => {
      if (!opt_noFakeResources) {
        doNotLoadExternalResourcesInTest(iframe.win);
      }
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', 'https://foo.bar/baz');
      iframe.addElement(link);

      const ampFB = iframe.doc.createElement('amp-facebook');
      ampFB.setAttribute('data-href', href);
      ampFB.setAttribute('width', '111');
      ampFB.setAttribute('height', '222');
      if (opt_embedAs) {
        ampFB.setAttribute('data-embed-as', opt_embedAs);
      }
      return iframe.addElement(ampFB);
    });
  }

  it('renders fb-post', () => {
    return getFBPost(fbPostHref).then(ampFB => {
      const iframe = ampFB.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.getAttribute('width')).to.equal('111');
      expect(iframe.getAttribute('height')).to.equal('222');
      iframe.triggerLoad();

      const fbPost = iframe.getElementsByClassName('fb-post')[0];
      expect(fbPost).not.to.be.null;
    });
  });

  it('renders fb-post as video', () => {
    return getFBPost(fbVideoHref, 'video').then(ampFB => {
      const iframe = ampFB.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.getAttribute('width')).to.equal('111');
      expect(iframe.getAttribute('height')).to.equal('222');
      iframe.triggerLoad();

      const fbVideo = iframe.getElementsByClassName('fb-video')[0];
      expect(fbVideo).not.to.be.null;
    });
  });

  it('resizes facebook posts', () => {
    const iframeSrc = 'http://ads.localhost:' + location.port +
        '/base/test/fixtures/served/iframe.html';
    return getFBPost(fbPostHref, undefined,
        /* opt_noFakeResources */ true).then(ampFB => {
          return new Promise((resolve, unusedReject) => {
            const iframe = ampFB.firstChild;
            impl = ampFB.implementation_;
            impl.layoutCallback();
            impl.changeHeight = newHeight => {
              expect(newHeight).to.equal(666);
              resolve(iframe);
            };
            iframe.onload = function() {
              iframe.contentWindow.postMessage({
                sentinel: 'amp-test',
                type: 'requestHeight',
                is3p: true,
                height: 666,
              }, '*');
            };
            iframe.src = iframeSrc;
          });
        }).then(iframe => {
          expect(iframe.height).to.equal('666');
        });
  });
});
