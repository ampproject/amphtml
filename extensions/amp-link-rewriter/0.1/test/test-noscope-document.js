/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {LinkRewriter} from '../link-rewriter';
import helpersMaker from './test-helpers';

describes.fakeWin(
  'amp-link-rewriter',
  {
    win: {
      location: 'http://partnersite.com/123',
    },
    amp: {
      extensions: ['amp-link-rewriter'],
    },
  },
  (env) => {
    let helpers;

    beforeEach(() => {
      helpers = helpersMaker(env);
    });

    afterEach(() => {
      env.sandbox.restore();
    });

    /**
     * @see https://github.com/ampproject/amphtml/issues/33731
     */
    it('Should not rewrite urls if no urls in scope', () => {
      const template = `
        <div id='in-scope'>
            <a rel='mustfail'
                class='sidebar'
                href='https://retailer-example.local/some-path/'
                data-vars-event-id='234'>Should fail by rel attribute</a>
            <a rel='nofollow'
                class='mustfail'
                href='https://retailer-example.local/some-path/'
                data-vars-event-id='234'>Should fail by class attribute</a>
            <a rel='nofollow'
                class='sidebar'
                href='https://other-domain.local/some-path/'>Should fail by href attribute</a>
        </div>
        <div id='out-of-scope'>
            <a rel='nofollow'
                class='sidebar'
                href='https://retailer-example.local/some-path/'
                data-vars-event-id='234'>Should fail by container scope</a>
        </div>
      `;
      const rootNode = env.ampdoc.getRootNode();

      const config = helpers.createConfig({
        'attribute': {
          'rel': 'nofollow',
          'class': 'sidebar',
          'href': '(https:\\/\\/(www\\.)?retailer-example\\.local).*',
        },
      });

      const linkRewriterElement = helpers.createLinkRewriterElement(config);
      rootNode.body.appendChild(linkRewriterElement);
      rootNode.body.insertAdjacentHTML('afterbegin', template);

      const rewriter = new LinkRewriter('', linkRewriterElement, env.ampdoc);

      const links = rootNode.body.querySelectorAll('a');

      expect(links.length).to.equal(4);

      rewriter.handleClick(links[0]);
      expect(links[0].href).to.equal(
        'https://retailer-example.local/some-path/'
      );
      rewriter.handleClick(links[1]);
      expect(links[1].href).to.equal(
        'https://retailer-example.local/some-path/'
      );
      rewriter.handleClick(links[2]);
      expect(links[2].href).to.equal('https://other-domain.local/some-path/');
      rewriter.handleClick(links[3]);
      expect(links[3].href).to.equal(
        'https://retailer-example.local/some-path/'
      );
    });

    it('Should rewrite urls in container scope', () => {
      const template = `
        <div id='in-scope'>
            <a rel='nofollow'
                class='sidebar'
                href='https://www.retailer-example.local/some-path/'
                data-vars-event-id='234'>Should pass</a>
            <a rel='nofollow'
                class='sidebar'
                href='https://retailer-example.local/some-path/'
                data-vars-event-id='234'>Should pass</a>
        </div>
        <div class='out-of-scope'>
            <a rel='nofollow' class='sidebar' href='https://www.retailer-example.local/some-path/'>Should fail by scope</a>
            <a rel='nofollow'
                class='sidebar'
                href='https://retailer-example.local/some-path/'
                data-vars-event-id='234'>Should fail by scope</a>
        </div>
      `;
      const rootNode = env.ampdoc.getRootNode();

      const config = helpers.createConfig();

      const linkRewriterElement = helpers.createLinkRewriterElement(config);
      rootNode.body.appendChild(linkRewriterElement);
      rootNode.body.insertAdjacentHTML('afterbegin', template);

      const rewriter = new LinkRewriter('', linkRewriterElement, env.ampdoc);

      const links = rootNode.body.querySelectorAll('a');

      expect(links.length).to.equal(4);

      rewriter.handleClick(links[0]);
      expect(links[0].href).to.equal(
        'https://visit.foo.net/visit?pid=110&url=https%3A%2F%2Fwww.retailer-example.local%2Fsome-path%2F&cid=12345&ref=&location=http%3A%2F%2Fpartnersite.com%2F123&rel=nofollow&productId=234'
      );
      rewriter.handleClick(links[1]);
      expect(links[1].href).to.equal(
        'https://visit.foo.net/visit?pid=110&url=https%3A%2F%2Fretailer-example.local%2Fsome-path%2F&cid=12345&ref=&location=http%3A%2F%2Fpartnersite.com%2F123&rel=nofollow&productId=234'
      );
      rewriter.handleClick(links[2]);
      expect(links[2].href).to.equal(
        'https://www.retailer-example.local/some-path/'
      );
      rewriter.handleClick(links[3]);
      expect(links[3].href).to.equal(
        'https://retailer-example.local/some-path/'
      );
    });

    it('Should rewrite urls in attribute scope', () => {
      const template = `
        <div id='in-scope'>
            <a rel='nofollow'
                class='sidebar'
                href='https://www.retailer-example.local/some-path/'>Should pass</a>
            <a rel='nofollow'
                class='sidebar'
                href='https://retailer-example.local/some-path/'
                data-vars-event-id='234'>Should pass</a>
            <a rel='mustfail'
                class='sidebar'
                href='https://retailer-example.local/some-path/'
                data-vars-event-id='234'>Should fail by rel attribute</a>
            <a rel='nofollow'
                class='mustfail'
                href='https://retailer-example.local/some-path/'
                data-vars-event-id='234'>Should fail by class attribute</a>
            <a rel='nofollow'
                class='sidebar'
                href='https://other-domain.local/some-path/'
                data-vars-event-id='234'>Should fail by href attribute</a>
        </div>
      `;
      const rootNode = env.ampdoc.getRootNode();

      const config = helpers.createConfig({
        'attribute': {
          'rel': 'nofollow',
          'class': 'sidebar',
          'href': '(https:\\/\\/(www\\.)?retailer-example\\.local).*',
        },
      });

      const linkRewriterElement = helpers.createLinkRewriterElement(config);
      rootNode.body.appendChild(linkRewriterElement);
      rootNode.body.insertAdjacentHTML('afterbegin', template);

      const rewriter = new LinkRewriter('', linkRewriterElement, env.ampdoc);

      const links = rootNode.body.querySelectorAll('a');

      expect(links.length).to.equal(5);

      rewriter.handleClick(links[0]);
      expect(links[0].href).to.equal(
        'https://visit.foo.net/visit?pid=110&url=https%3A%2F%2Fwww.retailer-example.local%2Fsome-path%2F&cid=12345&ref=&location=http%3A%2F%2Fpartnersite.com%2F123&rel=nofollow&productId='
      );
      rewriter.handleClick(links[1]);
      expect(links[1].href).to.equal(
        'https://visit.foo.net/visit?pid=110&url=https%3A%2F%2Fretailer-example.local%2Fsome-path%2F&cid=12345&ref=&location=http%3A%2F%2Fpartnersite.com%2F123&rel=nofollow&productId=234'
      );
      rewriter.handleClick(links[2]);
      expect(links[2].href).to.equal(
        'https://retailer-example.local/some-path/'
      );
      rewriter.handleClick(links[3]);
      expect(links[3].href).to.equal(
        'https://retailer-example.local/some-path/'
      );
      rewriter.handleClick(links[4]);
      expect(links[4].href).to.equal('https://other-domain.local/some-path/');
    });
  }
);
