/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {EVENTS} from '../../../amp-skimlinks/0.1/link-rewriter/constants';
import {LinkRewriter} from '../link-rewriter';
import {getConfigOpts} from '../config-options';
import {getScopeElements} from '../scope';
import helpersMaker from './test-helpers';

describes.fakeWin('amp-link-rewriter', {
  win: {
    location: 'http://mydealz.com/123',
  },
  amp: {
    extensions: ['amp-link-rewriter'],
  },
}, env => {

  let config, helpers, mockedHtml;

  beforeEach(() => {

    helpers = helpersMaker(env);

    config = {
      'output': 'https://visit.digidip.net/visit?pid=110&url=${href}&cid=${customerId}&ref=DOCUMENT_REFERRER&location=SOURCE_URL&rel=${rel}&productId=${eventId}',
      'section': [
        '#track-section',
      ],
      'attribute': {
        'class': 'sidebar',
        'href': '((?!\\bgmail\\.com\\b).)*',
      },
      'vars': {
        'customerId': '12345',
      },
    };

    mockedHtml = '<div>' +
      '<a class="sidebar" href="http://youtube.com">you tube</a>' +
      '</div>' +
      '<div id="track-section">' +
      '<a class="sidebar" href="http://vendor.com">Vendor1</a>' +
      '<a class="sidebar" href="https://gmail.com">Vendor2</a>' +
      '</div>';
  });

  afterEach(() => {
    env.sandbox.restore();
  });

  it('Should match the built url', () => {
    const linkRewriterElement = helpers.createLinkRewriterElement(config);
    env.ampdoc.getRootNode().body.appendChild(linkRewriterElement);

    const rewriter = new LinkRewriter(linkRewriterElement, env.ampdoc);

    const anchorElement = document.createElement('a');

    anchorElement.href = 'http://example.com';
    anchorElement.rel = '235';
    anchorElement.setAttribute('data-vars-event-id', '567');

    rewriter.event_ = {
      type: EVENTS.CLICK,
    };

    rewriter.setRedirectUrl_(anchorElement);
    expect(anchorElement.href)
        .to.equal('https://visit.digidip.net/visit?pid=110&url=http%3A%2F%2Fexample.com&cid=12345&ref=&location=http%3A%2F%2Fmydealz.com%2F123&rel=235&productId=567');
  });

  it('Should return the number of anchors that match the config', () => {

    const linkRewriterElement = helpers.createLinkRewriterElement(config);

    const doc = document.implementation.createHTMLDocument('test document');
    doc.body.appendChild(linkRewriterElement);
    doc.body.insertAdjacentHTML('afterbegin', mockedHtml);

    const configOpts_ = getConfigOpts(linkRewriterElement);

    const list = getScopeElements(doc, configOpts_);

    expect(list.length).to.equal(1);
  });

});
