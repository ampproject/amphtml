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

import {KeyCodes} from '../../../../src/utils/key-codes';
import {adopt} from '../../../../src/runtime';
import {createIframePromise} from '../../../../testing/iframe';
import * as sinon from 'sinon';
import '../amp-social-share';
import {platformFor} from '../../../../src/services';

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

  let sandbox;
  let platform;
  let isIos = false;
  let isSafari = false;

  function getShare(type, opt_endpoint, opt_params) {
    return getCustomShare(iframe => {
      sandbox./*OK*/stub(iframe.win, 'open').returns(true);
      const share = iframe.doc.createElement('amp-social-share');
      share.addEventListener = sandbox.spy();
      if (opt_endpoint) {
        share.setAttribute('data-share-endpoint', opt_endpoint);
      }

      for (const key in opt_params) {
        share.setAttribute('data-param-' + key, opt_params[key]);
      }

      share.setAttribute('type', type);
      share.setAttribute('width', 60);
      share.setAttribute('height', 44);
      return share;
    });
  }

  function getCustomShare(modifier) {
    return createIframePromise().then(iframe => {
      platform = platformFor(iframe.win);
      sandbox.stub(platform, 'isIos', () => isIos);
      sandbox.stub(platform, 'isSafari', () => isSafari);
      const canonical = iframe.doc.createElement('link');

      iframe.doc.title = 'doc title';
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', 'https://canonicalexample.com/');
      iframe.addElement(canonical);

      return iframe.addElement(modifier(iframe));
    });
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    isIos = false;
    isSafari = false;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('errors if share endpoint is missing', () => {
    return createIframePromise().then(iframe => {
      const share = iframe.doc.createElement('amp-social-share');
      share.setAttribute('type', 'unknown-provider');
      iframe.doc.body.appendChild(share);
      return expect(share.whenBuilt())
          .to.be.eventually.rejectedWith(
            /data-share-endpoint attribute is required/
          );
    });
  });

  it('errors if type is missing', () => {
    return createIframePromise().then(iframe => {
      const share = iframe.doc.createElement('amp-social-share');
      iframe.doc.body.appendChild(share);
      return expect(share.whenBuilt())
          .to.be.eventually.rejectedWith(/type attribute is required/);
    });
  });

  it('errors if type has space characters', () => {
    return createIframePromise().then(iframe => {
      const share = iframe.doc.createElement('amp-social-share');
      share.setAttribute('type', 'hello world');
      iframe.doc.body.appendChild(share);
      return expect(share.whenBuilt())
          .to.be.eventually.rejectedWith(
            /Space characters are not allowed in type attribute value/
          );
    });
  });

  it('renders unconfigured providers if share endpoint provided', () => {
    return getCustomShare(iframe => {
      const share = iframe.doc.createElement('amp-social-share');

      share.setAttribute('type', 'unknown-provider');
      share.setAttribute('data-share-endpoint',
          'https://exampleprovider.com/share/');
      share.setAttribute('data-param-text', 'check out: CANONICAL_URL');
      return share;
    }).then(el => {
      expect(el.implementation_.params_.text).to.be.equal(
          'check out: CANONICAL_URL');
      expect(el.implementation_.href_).to.not.contain(
          encodeURIComponent('CANONICAL_URL'));
      expect(el.implementation_.href_).to.contain(
          encodeURIComponent('https://canonicalexample.com/'));
      expect(el.implementation_.shareEndpoint_).to.be.equal(
          'https://exampleprovider.com/share/');
    });
  });

  it('renders twitter', () => {
    const params = {
      'url': STRINGS['url'],
      'via': STRINGS['attribution'],
    };
    return getShare('twitter', /* endpoint */ undefined, params).then(el => {
      expect(el.implementation_.params_.text).to.be.equal('TITLE');
      expect(el.implementation_.params_.url).to.be.equal('https://example.com/');
      expect(el.implementation_.params_.via).to.be.equal('AMPhtml');
      expect(el.implementation_.shareEndpoint_).to.be.equal(
          'https://twitter.com/intent/tweet');

      expect(el.implementation_.href_).to.not.contain('TITLE');
      expect(el.addEventListener).to.be.calledTwice;
      expect(el.addEventListener).to.be.calledWith('click');
      expect(el.addEventListener).to.be.calledWith('keydown');
    });
  });

  it('adds a default value for url', () => {
    return getCustomShare(iframe => {
      const share = iframe.doc.createElement('amp-social-share');

      share.setAttribute('type', 'twitter');
      share.setAttribute('width', 60);
      share.setAttribute('height', 44);

      return share;
    }).then(el => {
      expect(el.implementation_.params_.url).to.be.equal('CANONICAL_URL');
      expect(el.implementation_.href_).to.not.contain(
          encodeURIComponent('CANONICAL_URL'));
      expect(el.implementation_.href_).to.contain(
          encodeURIComponent('https://canonicalexample.com/'));
      expect(el.implementation_.shareEndpoint_).to.be.equal(
          'https://twitter.com/intent/tweet');
    });
  });

  it('opens share window in _blank', () => {
    return getShare('twitter').then(el => {
      el.implementation_.handleClick_();
      expect(el.implementation_.win.open).to.be.calledOnce;
      expect(el.implementation_.win.open).to.be.calledWith(
        'https://twitter.com/intent/tweet?text=doc%20title&' +
          'url=https%3A%2F%2Fcanonicalexample.com%2F',
          '_blank', 'resizable,scrollbars,width=640,height=480'
      );
    });
  });

  it('opens mailto: window in _top on iOS Safari', () => {
    isIos = true;
    isSafari = true;
    return getShare('email').then(el => {
      el.implementation_.handleClick_();
      expect(el.implementation_.win.open).to.be.calledOnce;
      expect(el.implementation_.win.open).to.be.calledWith(
          'mailto:?subject=doc%20title&' +
            'body=https%3A%2F%2Fcanonicalexample.com%2F',
          '_top', 'resizable,scrollbars,width=640,height=480'
      );
    });
  });

  it('should handle key presses', () => {
    return getShare('twitter').then(el => {
      const nonActivationEvent = {
        preventDefault: () => {},
        keyCode: KeyCodes.RIGHT_ARROW,
      };
      const activationEvent = {
        preventDefault: () => {},
        keyCode: KeyCodes.SPACE,
      };
      el.implementation_.handleKeyPress_(nonActivationEvent);
      expect(el.implementation_.win.open).to.not.have.been.called;
      el.implementation_.handleKeyPress_(activationEvent);
      expect(el.implementation_.win.open).to.be.calledOnce;
      expect(el.implementation_.win.open).to.be.calledWith(
        'https://twitter.com/intent/tweet?text=doc%20title&' +
          'url=https%3A%2F%2Fcanonicalexample.com%2F',
          '_blank', 'resizable,scrollbars,width=640,height=480'
      );
    });
  });

  it('has tabindex set to 0 by default', () => {
    return getShare('twitter').then(el => {
      expect(el.getAttribute('tabindex')).to.equal('0');
    });
  });

});
