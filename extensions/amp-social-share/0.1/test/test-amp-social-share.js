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

import '../amp-social-share';
import {KeyCodes} from '../../../../src/utils/key-codes';
import {Services} from '../../../../src/services';

const STRINGS = {
  'text': 'Hello world',
  'url': 'https://example.com/',
  'attribution': 'AMPhtml',
  'text-too-long': 'Hello world, Hello world, Hello world, Hello world, Hello' +
    'world, Hello world, Hello world, Hello world, Hello world, Hello world, ' +
    'Hello world',
};


describes.realWin('amp-social-share', {
  amp: {
    extensions: ['amp-social-share'],
    canonicalUrl: 'https://canonicalexample.com/',
  },
}, env => {
  let win, doc;
  let platform;
  let isIos = false;
  let isSafari = false;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    doc.title = 'doc title';
    isIos = false;
    isSafari = false;
    platform = Services.platformFor(win);
    sandbox.stub(platform, 'isIos').callsFake(() => isIos);
    sandbox.stub(platform, 'isSafari').callsFake(() => isSafari);
    sandbox./*OK*/stub(win, 'open').returns(true);
  });

  function getShare(type, opt_endpoint, opt_params) {
    const share = doc.createElement('amp-social-share');
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
    doc.body.appendChild(share);
    return loaded(share);
  }

  function loaded(element) {
    return element.build()
        .then(() => element.layoutCallback())
        .then(() => element);
  }

  it('errors if share endpoint is missing', () => {
    const share = doc.createElement('amp-social-share');
    share.setAttribute('type', 'unknown-provider');
    doc.body.appendChild(share);
    return expect(loaded(share)).to.be.eventually.rejectedWith(
        /data-share-endpoint attribute is required/);
  });

  it('errors if type is missing', () => {
    const share = doc.createElement('amp-social-share');
    doc.body.appendChild(share);
    return expect(loaded(share)).to.be.eventually.rejectedWith(
        /type attribute is required/);
  });

  it('errors if type has space characters', () => {
    const share = doc.createElement('amp-social-share');
    share.setAttribute('type', 'hello world');
    doc.body.appendChild(share);
    return expect(loaded(share)).to.be.eventually.rejectedWith(
        /Space characters are not allowed in type attribute value/);
  });

  it('renders unconfigured providers if share endpoint provided', () => {
    const share = doc.createElement('amp-social-share');

    share.setAttribute('type', 'unknown-provider');
    share.setAttribute('data-share-endpoint',
        'https://exampleprovider.com/share/');
    share.setAttribute('data-param-text', 'check out: CANONICAL_URL');
    doc.body.appendChild(share);
    return loaded(share).then(el => {
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
    const share = doc.createElement('amp-social-share');

    share.setAttribute('type', 'twitter');
    share.setAttribute('width', 60);
    share.setAttribute('height', 44);

    doc.body.appendChild(share);
    return loaded(share).then(el => {
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

  it('opens mailto: window in _top on iOS Safari with recipient', () => {
    const params = {
      'recipient': 'sample@xyz.com',
    };
    isIos = true;
    isSafari = true;
    return getShare('email', undefined, params).then(el => {
      el.implementation_.handleClick_();
      expect(el.implementation_.win.open).to.be.calledOnce;
      expect(el.implementation_.win.open).to.be.calledWith(
          'mailto:sample%40xyz.com?subject=doc%20title&' +
            'body=https%3A%2F%2Fcanonicalexample.com%2F' +
            '&recipient=sample%40xyz.com',
          '_top', 'resizable,scrollbars,width=640,height=480'
      );
    });
  });

  it('opens mailto: window in _top on iOS Safari without recipient', () => {
    isIos = true;
    isSafari = true;
    return getShare('email').then(el => {
      el.implementation_.handleClick_();
      expect(el.implementation_.win.open).to.be.calledOnce;
      expect(el.implementation_.win.open).to.be.calledWith(
          'mailto:?subject=doc%20title&' +
            'body=https%3A%2F%2Fcanonicalexample.com%2F&recipient=',
          '_top', 'resizable,scrollbars,width=640,height=480'
      );
    });
  });

  it('opens sms: window in _top on iOS Safari', () => {
    isIos = true;
    isSafari = true;
    return getShare('sms').then(el => {
      el.implementation_.handleClick_();
      expect(el.implementation_.win.open).to.be.calledOnce;
      expect(el.implementation_.win.open).to.be.calledWith(
          'sms:?&body=doc%20title%20-%20https%3A%2F%2Fcanonicalexample.com%2F',
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
