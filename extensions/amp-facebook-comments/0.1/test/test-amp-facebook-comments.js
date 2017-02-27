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
import '../amp-facebook-comments';
import {adopt} from '../../../../src/runtime';
import {facebook} from '../../../../3p/facebook';
import {setDefaultBootstrapBaseUrlForTesting} from '../../../../src/3p-frame';
import {resetServiceForTesting} from '../../../../src/service';
import {toggleExperiment} from '../../../../src/experiments';

adopt(window);

const scenarios = ['sentinel', 'amp3pSentinel'];

describe('amp-facebook-comments', function() {
  this.timeout(5000);

  const fbCommentsHref =
    'http://www.directlyrics.com/adele-25-complete-album-lyrics-news.html';

  function getAmpFacebook(href, opt_numposts, opt_noFakeResources) {
    return createIframePromise(/*opt_runtimeOff*/ true).then(iframe => {
      if (!opt_noFakeResources) {
        doNotLoadExternalResourcesInTest(iframe.win);
      }

      const ampFB = iframe.doc.createElement('amp-facebook-comments');
      ampFB.setAttribute('data-href', href);
      ampFB.setAttribute('width', '111');
      ampFB.setAttribute('height', '222');
      if (opt_numposts) {
        ampFB.setAttribute('data-numposts', opt_numposts);
      }
      return iframe.addElement(ampFB);
    });
  }

  afterEach(() => {
    toggleExperiment(window, 'sentinel-name-change', false);
  });

  it('renders iframe in amp-facebook-comments', () => {
    return getAmpFacebook(fbCommentsHref).then(ampFB => {
      const iframe = ampFB.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('adds fb-comments element correctly', () => {
    return createIframePromise().then(iframe => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      iframe.doc.body.appendChild(div);
      iframe.win.context = {
        tagName: 'AMP-FACEBOOK-COMMENTS',
      };

      facebook(iframe.win, {
        href: fbCommentsHref,
        width: 111,
        height: 222,
        numposts: 5,
      });
      const fbComments = iframe.doc.body
        .getElementsByClassName('fb-comments')[0];
      expect(fbComments).not.to.be.undefined;
      expect(fbComments.getAttribute('data-href')).to.equal(fbCommentsHref);
    });
  });

  scenarios.forEach(sentinelName => {
    it('resizes facebook posts', () => {
      if (sentinelName == 'sentinel') {
        toggleExperiment(window, 'sentinel-name-change', true);
      }
      const iframeSrc = 'http://ads.localhost:' + location.port +
        '/test/fixtures/served/iframe.html';
      resetServiceForTesting(window, 'bootstrapBaseUrl');
      setDefaultBootstrapBaseUrlForTesting(iframeSrc);
      return getAmpFacebook(
        fbCommentsHref, undefined, /* opt_noFakeResources */ true)
          .then(ampFB => {
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
              message[sentinelName] = iframe.getAttribute(
                  'data-amp-3p-sentinel');
              iframe.contentWindow.postMessage(message, '*');
            });
          });
    });
  });

  it('removes iframe after unlayoutCallback', () => {
    return getAmpFacebook(fbCommentsHref).then(ampFB => {
      const iframe = ampFB.querySelector('iframe');
      expect(iframe).to.not.be.null;
      const obj = ampFB.implementation_;
      obj.unlayoutCallback();
      expect(ampFB.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.unlayoutOnPause()).to.be.false;
    });
  });
});
