/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-social-share';
import {toggleExperiment} from '../../../../src/experiments';
import {
  waitForChildPromise,
  whenUpgradedToCustomElement,
} from '../../../../src/dom';
import {whenCalled} from '../../../../testing/test-helper.js';

const BUTTON_SELECTOR = 'div[role="button"]';
const WINDOW_FEATURES = 'resizable,scrollbars,width=640,height=480';

describes.realWin(
  'amp-social-share-v1.0',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-social-share:1.0'],
      canonicalUrl: 'https://canonicalexample.com/',
    },
  },
  (env) => {
    let win, doc;
    let element;

    const waitForRender = async () => {
      await whenCalled(env.sandbox.spy(element, 'attachShadow'));
      const shadow = element.shadowRoot;
      await waitForChildPromise(shadow, (shadow) => {
        return shadow.querySelector(BUTTON_SELECTOR);
      });
    };

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      doc.title = 'Test Title';
      toggleExperiment(win, 'amp-social-share-bento', true);
    });

    it('throws an error when type is not provided', async () => {
      expectAsyncConsoleError(/The type attribute is required./, 2);
      element = win.document.createElement('amp-social-share');
      win.document.body.appendChild(element);
      // Test seems to always pass, but does throw an error if the required error is not thrown
    });

    it('custom endpoint must be provided when not using a pre-configured type', async () => {
      //expectAsyncConsoleError(/An endpoint/, 1);
      element = win.document.createElement('amp-social-share');
      element.setAttribute('type', 'unknown-provider');
      //win.document.body.appendChild(element);
      await whenUpgradedToCustomElement(element);
      await allowConsoleError(() =>
        element.build().catch((err) => {
          expect(err.message).to.include('blah!');
        })
      );
    });

    //in progress
    it('blah test', async () => {
      const share = doc.createElement('amp-social-share');
      share.setAttribute('type', 'unknown-provider');
      doc.body.appendChild(share);
      //return allowConsoleError(() => {});

      return allowConsoleError(() => {
        return expect(share).to.eventually.be.rejectedWith(
          /data-share-endpoint attribute is required/
        );
      });
    });

    it('renders custom endpoint when not using a pre-configured type', async () => {
      element = win.document.createElement('amp-social-share');
      element.setAttribute('type', 'unknown-provider');
      element.setAttribute('data-share-endpoint', 'cats.com');
      win.document.body.appendChild(element);
      await waitForRender();

      // when using a type that is not pre-configured, verify that the custom
      // endpoint is used (in this case cats.com)
      const openWindowDialogStub = env.sandbox.stub(window, 'open');
      element.shadowRoot.querySelector(BUTTON_SELECTOR).click();
      expect(openWindowDialogStub).to.be.calledWithExactly(
        'cats.com',
        '_blank',
        WINDOW_FEATURES
      );
    });

    it('allows configuration of the target attribute', async () => {
      element = win.document.createElement('amp-social-share');
      element.setAttribute('type', 'unknown-provider');
      element.setAttribute('data-share-endpoint', 'cats.com');
      element.setAttribute('data-target', 'target value');
      win.document.body.appendChild(element);
      await waitForRender();

      const openWindowDialogStub = env.sandbox.stub(window, 'open');
      element.shadowRoot.querySelector(BUTTON_SELECTOR).click();

      // verify that the target value can be set via data-target
      expect(openWindowDialogStub).to.be.calledWithExactly(
        'cats.com',
        'target value',
        WINDOW_FEATURES
      );
    });

    it('updates target when using an iOS device for email or sms', async () => {
      env.sandbox.stub(window.navigator, 'userAgent').value('ipad');

      element = win.document.createElement('amp-social-share');
      element.setAttribute('type', 'unknown-provider');
      element.setAttribute('data-share-endpoint', 'mailto:cats.com');
      win.document.body.appendChild(element);
      await waitForRender();

      const openWindowDialogStub = env.sandbox.stub(window, 'open');
      element.shadowRoot.querySelector(BUTTON_SELECTOR).click();

      // when window.navigator.userAgent indicates an iOS device
      // the target is updated to _top for email and sms
      expect(openWindowDialogStub).to.be.calledWithExactly(
        'mailto:cats.com',
        '_top',
        WINDOW_FEATURES
      );
    });

    it('accepts additional user-specified search parameters', async () => {
      element = win.document.createElement('amp-social-share');
      element.setAttribute('type', 'unknown-provider');
      element.setAttribute('data-share-endpoint', 'cats.com');
      element.setAttribute('data-param-test', 'test-value');
      element.setAttribute('data-param-test2', 'test-value2');
      win.document.body.appendChild(element);
      await waitForRender();

      const openWindowDialogStub = env.sandbox.stub(window, 'open');
      element.shadowRoot.querySelector(BUTTON_SELECTOR).click();

      // additional params, test and test2 are included in the url
      expect(openWindowDialogStub).to.be.calledWithExactly(
        'cats.com?test=test-value&test2=test-value2',
        '_blank',
        WINDOW_FEATURES
      );
    });

    it('properly resolves bindings from amp environment', async () => {
      element = win.document.createElement('amp-social-share');
      element.setAttribute('type', 'twitter');
      win.document.body.appendChild(element);
      await waitForRender();

      const openWindowDialogStub = env.sandbox.stub(window, 'open');
      element.shadowRoot.querySelector(BUTTON_SELECTOR).click();

      // verify that TITLE and CANONICAL_URL (default parameters from Twitter
      // config are properly resolved).  These are set in doc.title and
      // canonicalUrl of the ampdoc info respectively
      expect(openWindowDialogStub).to.be.calledWithExactly(
        'https://twitter.com/intent/tweet?text=Test%20Title&' +
          'url=https%3A%2F%2Fcanonicalexample.com%2F',
        '_blank',
        WINDOW_FEATURES
      );
    });

    it('renders children and hides default icon when children are provided', async () => {
      element = win.document.createElement('amp-social-share');
      element.setAttribute('type', 'sms');
      const child = win.document.createElement('div');
      child.textContent = 'child';
      element.appendChild(child);
      win.document.body.appendChild(element);
      await waitForRender();

      // verify that the unnamed slot is in the shadowroot and the svg is not
      // when a child is included in the amp-social-share element
      expect(
        element.shadowRoot.querySelector(BUTTON_SELECTOR).querySelector('slot')
      ).to.not.be.null;
      expect(element.shadowRoot.querySelector('svg')).to.be.null;
    });

    it('allows color and background to be inherited from parent', async () => {
      element = win.document.createElement('amp-social-share');
      element.setAttribute('type', 'email');
      win.document.body.appendChild(element);
      await waitForRender();

      // verify that color and background color are inherited
      expect(element.shadowRoot.querySelector('svg').style.color).to.be.equal(
        'currentcolor'
      );
      expect(
        element.shadowRoot.querySelector('svg').style.backgroundColor
      ).to.be.equal('inherit');
    });
  }
);
