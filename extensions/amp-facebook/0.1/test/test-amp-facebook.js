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

import {createIframePromise} from '../../../../testing/iframe';
require('../amp-facebook');
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-facebook', () => {

  function getFBPost(href, opt_embedAs) {
    return createIframePromise().then(iframe => {
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
    return getFBPost('https://www.facebook.com/zuck/posts/10102593740125791').then(ampFB => {
      const iframe = ampFB.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.getAttribute('width')).to.equal('111');
      expect(iframe.getAttribute('height')).to.equal('222');

      const fbPost = iframe.getElementsByClassName('fb-post')[0];
      expect(fbPost).not.to.be.null;
    });
  });

  it('renders fb-post', () => {
    return getFBPost('https://www.facebook.com/zuck/videos/10102509264909801/', 'video').then(ampFB => {
      const iframe = ampFB.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.getAttribute('width')).to.equal('111');
      expect(iframe.getAttribute('height')).to.equal('222');

      const fbVideo = iframe.getElementsByClassName('fb-video')[0];
      expect(fbVideo).not.to.be.null;
    });
  });

});
