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
import '../amp-facebook';
import {adopt} from '../../../../src/runtime';
import {facebook} from '../../../../3p/facebook';
import {setDefaultBootstrapBaseUrlForTesting} from '../../../../src/3p-frame';
import {resetServiceForTesting} from '../../../../src/service';

adopt(window);

describe('amp-facebook', function() {
  this.timeout(5000);

  const fbPostHref = 'https://www.facebook.com/zuck/posts/10102593740125791';
  const fbVideoHref = 'https://www.facebook.com/zuck/videos/10102509264909801/';

  function getAmpFacebook(href, opt_embedAs, opt_noFakeResources) {
    return createIframePromise(/*opt_runtimeOff*/ true).then(iframe => {
      if (!opt_noFakeResources) {
        doNotLoadExternalResourcesInTest(iframe.win);
      }
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', 'https://foo.bar/baz');
      iframe.doc.head.appendChild(link);

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

  it('renders iframe in amp-facebook', () => {
    return getAmpFacebook(fbPostHref).then(ampFB => {
      const iframe = ampFB.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('renders iframe in amp-facebook with video', () => {
    return getAmpFacebook(fbVideoHref, 'video').then(ampFB => {
      const iframe = ampFB.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('adds fb-post element correctly', () => {
    return createIframePromise().then(iframe => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      iframe.doc.body.appendChild(div);
      iframe.win.context = {
        tagName: 'AMP-FACEBOOK',
      };

      facebook(iframe.win, {
        href: fbPostHref,
        width: 111,
        height: 222,
      });
      const fbPost = iframe.doc.body.getElementsByClassName('fb-post')[0];
      expect(fbPost).not.to.be.undefined;
      expect(fbPost.getAttribute('data-href')).to.equal(fbPostHref);
    });
  });

  it('adds fb-video element correctly', () => {
    return createIframePromise().then(iframe => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      iframe.doc.body.appendChild(div);
      iframe.win.context = {
        tagName: 'AMP-FACEBOOK',
      };

      facebook(iframe.win, {
        href: fbVideoHref,
        width: 111,
        height: 222,
        embedAs: 'video',
      });
      const fbVideo = iframe.doc.body.getElementsByClassName('fb-video')[0];
      expect(fbVideo).not.to.be.undefined;
      expect(fbVideo.getAttribute('data-href')).to.equal(fbVideoHref);
    });
  });

  it('resizes facebook posts', () => {
    const iframeSrc = 'http://ads.localhost:' + location.port +
        '/test/fixtures/served/iframe.html';
    resetServiceForTesting(window, 'bootstrapBaseUrl');
    setDefaultBootstrapBaseUrlForTesting(iframeSrc);
    return getAmpFacebook(
        fbPostHref, undefined, /* opt_noFakeResources */ true).then(ampFB => {
          return new Promise((resolve, unusedReject) => {
            const iframe = ampFB.firstChild;
            const impl = ampFB.implementation_;
            impl.changeHeight = newHeight => {
              expect(newHeight).to.equal(666);
              resolve(ampFB);
            };
            const message = {
              type: 'requestHeight',
              is3p: true,
              height: 666,
            };
            message['sentinel'] = iframe.getAttribute(
                'data-amp-3p-sentinel');
            iframe.contentWindow.postMessage(message, '*');
          });
        });
  });

  it('removes iframe after unlayoutCallback', () => {
    return getAmpFacebook(fbPostHref).then(ampFB => {
      const iframe = ampFB.querySelector('iframe');
      expect(iframe).to.not.be.null;
      const obj = ampFB.implementation_;
      obj.unlayoutCallback();
      expect(ampFB.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.unlayoutOnPause()).to.be.true;
    });
  });
});
