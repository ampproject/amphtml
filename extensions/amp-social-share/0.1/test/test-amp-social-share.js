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
import {Keys_Enum} from '#core/constants/key-codes';
import {tryFocus} from '#core/dom';

import {Services} from '#service';

const STRINGS = {
  'text': 'Hello world',
  'url': 'https://example.com/',
  'attribution': 'AMPhtml',
  'text-too-long':
    'Hello world, Hello world, Hello world, Hello world, Hello' +
    'world, Hello world, Hello world, Hello world, Hello world, Hello world, ' +
    'Hello world',
};

describes.realWin(
  'amp-social-share',
  {
    amp: {
      extensions: ['amp-social-share'],
      canonicalUrl: 'https://canonicalexample.com/',
    },
  },
  (env) => {
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
      env.sandbox.stub(platform, 'isIos').callsFake(() => isIos);
      env.sandbox.stub(platform, 'isSafari').callsFake(() => isSafari);
      env.sandbox./*OK*/ stub(win, 'open').returns(true);
    });

    function getShare(type, opt_endpoint, opt_params, opt_target) {
      const share = doc.createElement('amp-social-share');
      share.addEventListener = env.sandbox.spy();
      if (opt_endpoint) {
        share.setAttribute('data-share-endpoint', opt_endpoint);
      }

      for (const key in opt_params) {
        share.setAttribute('data-param-' + key, opt_params[key]);
      }

      if (opt_target) {
        share.setAttribute('data-target', opt_target);
      }

      share.setAttribute('type', type);
      share.setAttribute('width', 60);
      share.setAttribute('height', 44);
      doc.body.appendChild(share);
      return loaded(share);
    }

    function loaded(element) {
      return element
        .buildInternal()
        .then(() => element.layoutCallback())
        .then(() => element);
    }

    it('errors if share endpoint is missing', () => {
      const share = doc.createElement('amp-social-share');
      share.setAttribute('type', 'unknown-provider');
      doc.body.appendChild(share);
      return allowConsoleError(() => {
        return expect(loaded(share)).to.eventually.be.rejectedWith(
          /data-share-endpoint attribute is required/
        );
      });
    });

    it('errors if type is missing', () => {
      const share = doc.createElement('amp-social-share');
      doc.body.appendChild(share);
      return allowConsoleError(() => {
        return expect(loaded(share)).to.eventually.be.rejectedWith(
          /type attribute is required/
        );
      });
    });

    it('errors if type has space characters', () => {
      const share = doc.createElement('amp-social-share');
      share.setAttribute('type', 'hello world');
      doc.body.appendChild(share);
      return allowConsoleError(() => {
        return expect(loaded(share)).to.eventually.be.rejectedWith(
          /Space characters are not allowed in type attribute value/
        );
      });
    });

    it('renders unconfigured providers if share endpoint provided', async () => {
      const share = doc.createElement('amp-social-share');

      share.setAttribute('type', 'unknown-provider');
      share.setAttribute(
        'data-share-endpoint',
        'https://exampleprovider.com/share/'
      );
      share.setAttribute('data-param-text', 'check out: CANONICAL_URL');
      doc.body.appendChild(share);
      const el = await loaded(share);
      const impl = await el.getImpl(false);
      expect(impl.params_.text).to.be.equal('check out: CANONICAL_URL');
      expect(impl.href_).to.not.contain(encodeURIComponent('CANONICAL_URL'));
      expect(impl.href_).to.contain(
        encodeURIComponent('https://canonicalexample.com/')
      );
      expect(impl.shareEndpoint_).to.be.equal(
        'https://exampleprovider.com/share/'
      );
    });

    it('does not render obsolete provider', () => {
      getShare('gplus', /* endpoint */ undefined, {}).then((el) => {
        expect(el.style.display).to.be.equal('none');
      });
    });

    it('renders twitter', async () => {
      const params = {
        'url': STRINGS['url'],
        'via': STRINGS['attribution'],
      };
      const el = await getShare('twitter', /* endpoint */ undefined, params);
      const impl = await el.getImpl(false);

      expect(impl.params_.text).to.be.equal('TITLE');
      expect(impl.params_.url).to.be.equal('https://example.com/');
      expect(impl.params_.via).to.be.equal('AMPhtml');
      expect(impl.shareEndpoint_).to.be.equal(
        'https://twitter.com/intent/tweet'
      );

      expect(impl.href_).to.not.contain('TITLE');
      expect(el.addEventListener).to.be.calledTwice;
      expect(el.addEventListener).to.be.calledWith('click');
      expect(el.addEventListener).to.be.calledWith('keydown');
    });

    it('adds a default value for url', async () => {
      const share = doc.createElement('amp-social-share');

      share.setAttribute('type', 'twitter');
      share.setAttribute('width', 60);
      share.setAttribute('height', 44);

      doc.body.appendChild(share);
      const el = await loaded(share);
      const impl = await el.getImpl(false);
      expect(impl.params_.url).to.be.equal('CANONICAL_URL');
      expect(impl.href_).to.not.contain(encodeURIComponent('CANONICAL_URL'));
      expect(impl.href_).to.contain(
        encodeURIComponent('https://canonicalexample.com/')
      );
      expect(impl.shareEndpoint_).to.be.equal(
        'https://twitter.com/intent/tweet'
      );
    });

    it('adds a default value for aria-label', async () => {
      const share = doc.createElement('amp-social-share');

      share.setAttribute('type', 'twitter');
      share.setAttribute('width', 60);
      share.setAttribute('height', 44);

      doc.body.appendChild(share);
      const el = await loaded(share);
      expect(el.getAttribute('aria-label')).to.be.equal('Share by twitter');
    });

    it('overwrites default aria-label value when a non-empty value is provided', async () => {
      const share = doc.createElement('amp-social-share');

      share.setAttribute('type', 'twitter');
      share.setAttribute('width', 60);
      share.setAttribute('height', 44);
      share.setAttribute('aria-label', 'test value');

      doc.body.appendChild(share);
      const el = await loaded(share);
      expect(el.getAttribute('aria-label')).to.be.equal('test value');
    });

    it('opens share window in _blank', async () => {
      const el = await getShare('twitter');
      const impl = await el.getImpl(false);

      impl.handleClick_();
      expect(impl.win.open).to.be.calledOnce;
      expect(impl.win.open).to.be.calledWith(
        'https://twitter.com/intent/tweet?text=doc%20title&' +
          'url=https%3A%2F%2Fcanonicalexample.com%2F',
        '_blank',
        'resizable,scrollbars,width=640,height=480'
      );
    });

    it('opens mailto: window in _self', async () => {
      const params = {
        'recipient': 'sample@xyz.com',
      };
      const el = await getShare('email', undefined, params, '_self');
      const impl = await el.getImpl(false);

      impl.handleClick_();
      expect(impl.win.open).to.be.calledOnce;
      expect(impl.win.open).to.be.calledWith(
        'mailto:sample%40xyz.com?subject=doc%20title&' +
          'body=https%3A%2F%2Fcanonicalexample.com%2F' +
          '&recipient=sample%40xyz.com',
        '_self',
        'resizable,scrollbars,width=640,height=480'
      );
    });

    it('opens mailto: window in _top on iOS Safari with recipient', async () => {
      const params = {
        'recipient': 'sample@xyz.com',
      };
      isIos = true;
      isSafari = true;
      const el = await getShare('email', undefined, params, '_top');
      const impl = await el.getImpl(false);

      impl.handleClick_();
      expect(impl.win.open).to.be.calledOnce;
      expect(impl.win.open).to.be.calledWith(
        'mailto:sample%40xyz.com?subject=doc%20title&' +
          'body=https%3A%2F%2Fcanonicalexample.com%2F' +
          '&recipient=sample%40xyz.com',
        '_top',
        'resizable,scrollbars,width=640,height=480'
      );
    });

    it(
      'opens mailto: window in _top on iOS Safari with recipient even if user ' +
        'attempts to override with `data-target`',
      async () => {
        const params = {
          'recipient': 'sample@xyz.com',
        };
        isIos = true;
        isSafari = true;
        const el = await getShare('email', undefined, params, '_self');
        const impl = await el.getImpl(false);

        impl.handleClick_();
        expect(impl.win.open).to.be.calledOnce;
        expect(impl.win.open).to.be.calledWith(
          'mailto:sample%40xyz.com?subject=doc%20title&' +
            'body=https%3A%2F%2Fcanonicalexample.com%2F' +
            '&recipient=sample%40xyz.com',
          '_top',
          'resizable,scrollbars,width=640,height=480'
        );
      }
    );

    it('opens mailto: window in _top on iOS Safari without recipient', async () => {
      isIos = true;
      isSafari = true;
      const el = await getShare('email');
      const impl = await el.getImpl(false);

      impl.handleClick_();
      expect(impl.win.open).to.be.calledOnce;
      expect(impl.win.open).to.be.calledWith(
        'mailto:?subject=doc%20title&' +
          'body=https%3A%2F%2Fcanonicalexample.com%2F&recipient=',
        '_top',
        'resizable,scrollbars,width=640,height=480'
      );
    });

    it('opens mailto: window in _top on iOS Webview with recipient', async () => {
      const params = {
        'recipient': 'sample@xyz.com',
      };
      isIos = true;
      isSafari = false;
      const el = await getShare('email', undefined, params, '_top');
      const impl = await el.getImpl(false);

      impl.handleClick_();
      expect(impl.win.open).to.be.calledOnce;
      expect(impl.win.open).to.be.calledWith(
        'mailto:sample%40xyz.com?subject=doc%20title&' +
          'body=https%3A%2F%2Fcanonicalexample.com%2F' +
          '&recipient=sample%40xyz.com',
        '_top',
        'resizable,scrollbars,width=640,height=480'
      );
    });

    it('opens sms: window in _top on iOS Safari', async () => {
      isIos = true;
      isSafari = true;
      const el = await getShare('sms');
      const impl = await el.getImpl(false);

      impl.handleClick_();
      expect(impl.win.open).to.be.calledOnce;
      expect(impl.win.open).to.be.calledWith(
        'sms:?&body=doc%20title%20-%20https%3A%2F%2Fcanonicalexample.com%2F',
        '_top',
        'resizable,scrollbars,width=640,height=480'
      );
    });

    it('opens sms: window in _top on iOS Webview', async () => {
      isIos = true;
      isSafari = false;
      const el = await getShare('sms');
      const impl = await el.getImpl(false);

      impl.handleClick_();
      expect(impl.win.open).to.be.calledOnce;
      expect(impl.win.open).to.be.calledWith(
        'sms:?&body=doc%20title%20-%20https%3A%2F%2Fcanonicalexample.com%2F',
        '_top',
        'resizable,scrollbars,width=640,height=480'
      );
    });

    it('should handle key presses', async () => {
      const el = await getShare('twitter');
      const impl = await el.getImpl(false);

      const nonActivationEvent = {
        preventDefault: () => {},
        key: Keys_Enum.RIGHT_ARROW,
      };
      const activationEvent = {
        preventDefault: () => {},
        key: Keys_Enum.SPACE,
      };
      impl.handleKeyPress_(nonActivationEvent);
      expect(impl.win.open).to.not.have.been.called;
      impl.handleKeyPress_(activationEvent);
      expect(impl.win.open).to.be.calledOnce;
      expect(impl.win.open).to.be.calledWith(
        'https://twitter.com/intent/tweet?text=doc%20title&' +
          'url=https%3A%2F%2Fcanonicalexample.com%2F',
        '_blank',
        'resizable,scrollbars,width=640,height=480'
      );
    });

    it('has tabindex set to 0 by default', () => {
      return getShare('twitter').then((el) => {
        expect(el.getAttribute('tabindex')).to.equal('0');
      });
    });

    it('uses custom CSS when element is focused', async () => {
      const share = doc.createElement('amp-social-share');

      share.setAttribute('type', 'twitter');
      share.setAttribute('width', 60);
      share.setAttribute('height', 44);

      doc.body.appendChild(share);

      const el = await loaded(share);
      expect(win.getComputedStyle(el)['outline']).to.equal(
        'rgb(0, 0, 0) none 0px'
      );
      expect(win.getComputedStyle(el)['outline-offset']).to.equal('0px');

      tryFocus(el);
      expect(doc.activeElement).to.equal(el);

      // updated styles after focusing on element
      expect(win.getComputedStyle(el)['outline']).to.equal(
        'rgb(3, 137, 255) solid 2px'
      );
      expect(win.getComputedStyle(el)['outline-offset']).to.equal('2px');
    });

    describe('[type=system]', () => {
      it('should not throw if navigator.share fails', async () => {
        Object.defineProperty(env.win, 'navigator', {
          value: {share: env.sandbox.spy(() => Promise.reject())},
        });
        const element = await getShare('system');
        const implementation = await element.getImpl();
        expect(() => implementation.handleActivation_()).to.not.throw();
        expect(env.win.navigator.share).to.have.been.calledOnce;
      });
    });
  }
);
