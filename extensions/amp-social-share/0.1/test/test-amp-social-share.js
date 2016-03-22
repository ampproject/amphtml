/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {adopt} from '../../../../src/runtime';
import {createIframePromise} from '../../../../testing/iframe';
import {toggleExperiment} from '../../../../src/experiments';
import '../amp-social-share';

adopt(window);

const STRINGS = {
  'text': 'Hello world',
  'url': 'https://example.com/',
  'attribution': 'AMPhtml',
  'text-too-long': 'Hello world, Hello world, Hello world, Hello world, Hello' +
    'world, Hello world, Hello world, Hello world, Hello world, Hello world, ' +
    'Hello world',
};

describe('amp-social-share', () => {

  function getShare(type, config) {
    return getCustomShare(iframe => {
      toggleExperiment(iframe.win, 'amp-social-share', true);
      const share = iframe.doc.createElement('amp-social-share');
      const script = iframe.doc.createElement('script');

      script.setAttribute('type', 'application/json');
      script.textContent = JSON.stringify(config);;

      share.setAttribute('type', type);
      share.setAttribute('width', 60);
      share.setAttribute('height', 44);
      share.appendChild(script);
      return share;
    });
  }

  function getCustomShare(modifier) {
    return createIframePromise().then(iframe => {
      const canonical = iframe.doc.createElement('link');

      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', STRINGS['url']);

      iframe.addElement(canonical);

      return iframe.addElement(modifier(iframe));
    });
  }

  it('renders twitter', () => {
    const conf = {
      'text': STRINGS['text'],
      'url': STRINGS['url'],
      'attribution': STRINGS['attribution'],
    };
    return getShare('twitter', conf).then(ins => {
      const tShare = ins.getElementsByTagName('span')[0];
      expect(tShare).to.not.be.null;
      expect(tShare.firstChild).to.not.be.null;
      const shareAnchor = tShare.firstChild;
      expect(shareAnchor.tagName).to.equal('A');

      const shareHref = shareAnchor.getAttribute('href');
      expect(shareHref).to.contain(encodeURIComponent(STRINGS['text']));
      expect(shareHref).to.contain(encodeURIComponent(STRINGS['url']));
      expect(shareHref).to.contain(encodeURIComponent(STRINGS['attribution']));
    });
  });

  it('renders a custom element', () => {
    return getCustomShare(iframe => {
      const share = iframe.doc.createElement('amp-social-share');
      const script = iframe.doc.createElement('script');
      const container = iframe.doc.createElement('span');
      const link = iframe.doc.createElement('a');

      script.setAttribute('type', 'application/json');
      script.textContent = JSON.stringify({
        'text': STRINGS['text'],
        'url': STRINGS['url'],
        'attribution': STRINGS['attribution'],
      });;

      share.setAttribute('type', 'twitter');
      share.setAttribute('width', 60);
      share.setAttribute('height', 44);
      share.appendChild(script);

      container.classList.add('amp-social-share-test');
      container.appendChild(link);

      link.classList.add('amp-social-share-test');

      return share;
    }).then(ins => {
      const tShare = ins.getElementsByTagName('span')[0];
      expect(tShare).to.not.be.null;
      expect(tShare.firstChild).to.not.be.null;
      const shareAnchor = tShare.firstChild;
      expect(shareAnchor.tagName).to.equal('A');

      const shareHref = shareAnchor.getAttribute('href');
      expect(shareHref).to.contain(encodeURIComponent(STRINGS['text']));
      expect(shareHref).to.contain(encodeURIComponent(STRINGS['url']));
      expect(shareHref).to.contain(encodeURIComponent(STRINGS['attribution']));
    });
  });

  it('renders a custom element with attribute config', () => {
    return getCustomShare(iframe => {
      const share = iframe.doc.createElement('amp-social-share');
      const container = iframe.doc.createElement('span');
      const link = iframe.doc.createElement('a');

      share.setAttribute('type', 'twitter');
      share.setAttribute('width', 60);
      share.setAttribute('height', 44);

      // Set data
      share.setAttribute('data-text', STRINGS['text']);
      share.setAttribute('data-url', STRINGS['url']);
      share.setAttribute('data-attribution', STRINGS['attribution']);

      container.classList.add('amp-social-share-test');
      container.appendChild(link);

      link.classList.add('amp-social-share-test');

      return share;
    }).then(ins => {
      const tShare = ins.getElementsByTagName('span')[0];
      expect(tShare).to.not.be.null;
      expect(tShare.firstChild).to.not.be.null;
      const shareAnchor = tShare.firstChild;
      expect(shareAnchor.tagName).to.equal('A');

      const shareHref = shareAnchor.getAttribute('href');
      expect(shareHref).to.contain(encodeURIComponent(STRINGS['text']));
      expect(shareHref).to.contain(encodeURIComponent(STRINGS['url']));
      expect(shareHref).to.contain(encodeURIComponent(STRINGS['attribution']));
    });
  });

  it('adds a default value for url', () => {
    return getCustomShare(iframe => {
      const share = iframe.doc.createElement('amp-social-share');

      share.setAttribute('type', 'twitter');
      share.setAttribute('width', 60);
      share.setAttribute('height', 44);

      return share;
    }).then(ins => {
      const tShare = ins.getElementsByTagName('span')[0];
      expect(tShare).to.not.be.null;
      expect(tShare.firstChild).to.not.be.null;
      const shareAnchor = tShare.firstChild;
      expect(shareAnchor.tagName).to.equal('A');

      const shareHref = shareAnchor.getAttribute('href');
      expect(shareHref).to.contain(encodeURIComponent('url'));
    });
  });

  it('adds a default value for text', () => {
    return getCustomShare(iframe => {
      const share = iframe.doc.createElement('amp-social-share');

      share.setAttribute('type', 'twitter');
      share.setAttribute('width', 60);
      share.setAttribute('height', 44);

      return share;
    }).then(ins => {
      const tShare = ins.getElementsByTagName('span')[0];
      expect(tShare).to.not.be.null;
      expect(tShare.firstChild).to.not.be.null;
      const shareAnchor = tShare.firstChild;
      expect(shareAnchor.tagName).to.equal('A');

      const shareHref = shareAnchor.getAttribute('href');
      expect(shareHref).to.contain(encodeURIComponent('text'));
    });
  });

  it('throws error with too long text', () => {
    return createIframePromise().then(iframe => {
      const share = iframe.doc.createElement('amp-social-share');
      const script = iframe.doc.createElement('script');

      script.setAttribute('type', 'application/json');
      script.textContent = JSON.stringify({
        'text': STRINGS['text-too-long'],
        'url': STRINGS['url'],
        'attribution': STRINGS['attribution'],
      });;

      share.setAttribute('type', 'twitter');
      share.setAttribute('width', 60);
      share.setAttribute('height', 44);
      share.appendChild(script);

      expect(() => {
        share.build(true);
      }).to.throw('text cannot exceed');
    });
  });

  it('throws error with missing required field', () => {
    return createIframePromise().then(iframe => {
      const share = iframe.doc.createElement('amp-social-share');
      const script = iframe.doc.createElement('script');

      script.setAttribute('type', 'application/json');
      script.textContent = JSON.stringify({
        'url': STRINGS['url'],
      });;

      share.setAttribute('type', 'facebook');
      share.setAttribute('width', 60);
      share.setAttribute('height', 44);
      share.appendChild(script);

      expect(() => {
        share.build(true);
      }).to.throw('attribution is a required attribute for facebook');
    });
  });
});
