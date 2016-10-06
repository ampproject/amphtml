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
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-twitter';
import {adopt} from '../../../../src/runtime';
import {twitter} from '../../../../3p/twitter';

adopt(window);

describe('amp-twitter', () => {
  const tweetId = '585110598171631616';

  function getAmpTwitter(tweetid) {
    return createIframePromise(/*opt_runtimeOff*/ true).then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', 'https://foo.bar/baz');
      iframe.doc.head.appendChild(link);

      const ampTwitter = iframe.doc.createElement('amp-twitter');
      ampTwitter.setAttribute('data-tweetid', tweetid);
      ampTwitter.setAttribute('width', '111');
      ampTwitter.setAttribute('height', '222');
      return iframe.addElement(ampTwitter);
    });
  }

  it('renders iframe in amp-twitter', () => {
    return getAmpTwitter(tweetId).then(ampTwitter => {
      const iframe = ampTwitter.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.getAttribute('width')).to.equal('111');
      expect(iframe.getAttribute('height')).to.equal('222');
    });
  });

  it('adds tweet element correctly', () => {
    return createIframePromise().then(iframe => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      iframe.doc.body.appendChild(div);

      twitter(iframe.win, {
        tweetid: tweetId,
        width: 111,
        height: 222,
      });
      const tweet = iframe.doc.body.querySelector('#tweet');
      expect(tweet).not.to.be.undefined;
    });
  });

  it('removes iframe after unlayoutCallback', () => {
    return getAmpTwitter(tweetId).then(ampTwitter => {
      const iframe = ampTwitter.querySelector('iframe');
      expect(iframe).to.not.be.null;
      const obj = ampTwitter.implementation_;
      obj.unlayoutCallback();
      expect(ampTwitter.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.unlayoutOnPause()).to.be.true;
    });
  });
});
