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

import '../amp-facebook';
import {facebook} from '../../../../3p/facebook';
import {resetServiceForTesting} from '../../../../src/service';
import {setDefaultBootstrapBaseUrlForTesting} from '../../../../src/3p-frame';


describes.realWin('amp-facebook', {
  amp: {
    extensions: ['amp-facebook'],
    canonicalUrl: 'https://foo.bar/baz',
  },
}, function(env) {
  this.timeout(5000);

  const fbPostHref = 'https://www.facebook.com/zuck/posts/10102593740125791';
  const fbVideoHref = 'https://www.facebook.com/zuck/videos/10102509264909801/';
  const fbPageHref = 'https://www.facebook.com/itsdougthepug';
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getAmpFacebook(href, opt_embedAs, opt_locale) {
    const ampFB = doc.createElement('amp-facebook');
    ampFB.setAttribute('data-href', href);
    ampFB.setAttribute('width', '111');
    ampFB.setAttribute('height', '222');
    if (opt_embedAs) {
      ampFB.setAttribute('data-embed-as', opt_embedAs);
    }
    if (opt_locale) {
      ampFB.setAttribute('data-locale', opt_locale);
    } else {
      ampFB.setAttribute('data-locale', 'en_US');
    }
    doc.body.appendChild(ampFB);
    return ampFB.build().then(() => {
      return ampFB.layoutCallback();
    }).then(() => ampFB);
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

  it('renders amp-facebook with detected locale', () => {
    return getAmpFacebook(fbVideoHref, 'post').then(ampFB => {
      expect(ampFB).not.to.be.undefined;
      expect(ampFB.getAttribute('data-locale')).to.equal('en_US');
    });
  });

  it('renders amp-facebook with specified locale', () => {
    return getAmpFacebook(fbVideoHref, 'post', 'fr_FR').then(ampFB => {
      expect(ampFB).not.to.be.undefined;
      expect(ampFB.getAttribute('data-locale')).to.equal('fr_FR');
    });
  });

  it('adds loading element correctly', () => {
    return getAmpFacebook(fbVideoHref, 'post').then(ampFB => {
      expect(ampFB.implementation_.toggleLoadingCounter_).to.equal(1);
    });
  });

  it('adds fb-post element correctly', () => {
    const div = document.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);
    win.context = {
      tagName: 'AMP-FACEBOOK',
    };

    facebook(win, {
      href: fbPostHref,
      width: 111,
      height: 222,
    });
    const fbPost = doc.body.getElementsByClassName('fb-post')[0];
    expect(fbPost).not.to.be.undefined;
    expect(fbPost.getAttribute('data-href')).to.equal(fbPostHref);
  });

  it('adds fb-video element correctly', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);
    win.context = {
      tagName: 'AMP-FACEBOOK',
    };

    facebook(win, {
      href: fbVideoHref,
      width: 111,
      height: 222,
      embedAs: 'video',
    });
    const fbVideo = doc.body.getElementsByClassName('fb-video')[0];
    expect(fbVideo).not.to.be.undefined;
    expect(fbVideo.getAttribute('data-href')).to.equal(fbVideoHref);
  });

  it('adds fb-video element with `data-embed-as` and `data-show-text` ' +
    'attributes set correctly', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);
    win.context = {
      tagName: 'AMP-FACEBOOK',
    };

    facebook(win, {
      href: fbVideoHref,
      width: 111,
      height: 222,
    });
    const fbVideo = doc.body.getElementsByClassName('fb-video')[0];
    expect(fbVideo).not.to.be.undefined;
    expect(fbVideo.classList.contains('fb-video')).to.be.true;
    expect(fbVideo.getAttribute('data-embed-as')).to.equal('video');
    expect(fbVideo.getAttribute('data-show-text')).to.equal('true');
  });

  it('retains fb-video element with `data-embed-as=\'video\'`', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);
    win.context = {
      tagName: 'AMP-FACEBOOK',
    };

    facebook(win, {
      embedAs: 'video',
      href: fbVideoHref,
      width: 111,
      height: 222,
    });
    const fbVideo = doc.body.getElementsByClassName('fb-video')[0];
    expect(fbVideo).not.to.be.undefined;
    expect(fbVideo.classList.contains('fb-video')).to.be.true;
  });

  it('retains fb-video element with `data-embed-as=\'post\'`', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);
    win.context = {
      tagName: 'AMP-FACEBOOK',
    };

    facebook(win, {
      embedAs: 'post',
      href: fbVideoHref,
      width: 111,
      height: 222,
    });
    const fbVideo = doc.body.getElementsByClassName('fb-post')[0];
    expect(fbVideo).not.to.be.undefined;
    expect(fbVideo.classList.contains('fb-post')).to.be.true;
  });

  it('check that fb-page element correctly sets `data-adapt-container-width` ' +
    'attribute to \'true\'', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);
    win.context = {
      tagName: 'AMP-FACEBOOK-PAGE',
    };

    facebook(win, {
      href: fbPageHref,
      width: 200,
      height: 200,
    });
    const fbPage = doc.body.getElementsByClassName('fb-page')[0];
    expect(fbPage).not.to.be.undefined;
    expect(fbPage.getAttribute('data-adapt-container-width')).to.equal('true');
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

  describes.realWin('resize', {
    amp: {
      extensions: ['amp-facebook'],
      canonicalUrl: 'https://foo.bar/baz',
    },
    allowExternalResources: true,
  }, function(env) {
    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    it('resizes facebook posts', () => {
      const iframeSrc = 'http://ads.localhost:' + location.port +
          '/test/fixtures/served/iframe.html';
      resetServiceForTesting(win, 'bootstrapBaseUrl');
      setDefaultBootstrapBaseUrlForTesting(iframeSrc);
      return getAmpFacebook(fbPostHref).then(ampFB => {
        return new Promise((resolve, unusedReject) => {
          const {firstChild: iframe, implementation_: impl} = ampFB;
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
  });
});
