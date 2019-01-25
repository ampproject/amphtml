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

import {LinkShifter} from '../link-shifter';
import {getConfigOpts} from '../config-options';
import {getScopeElements} from '../helper';
import helpersMaker from './test-helpers';

describes.fakeWin('amp-digidip', {
  amp: {
    extensions: ['amp-digidip'],
  },
}, env => {

  let config, pageAttributes, helpers, mockedHtml;

  beforeEach(() => {

    helpers = helpersMaker(env);

    config = {
      'output': 'https://visit.digidip.net?pid=110&url=${href}&cid=${customerId}&ref=${referrer}&location=${location}&rel=${rel}&usr=${data.customerId}&productId=${data.eventId}',
      'section': [
        '#track-section',
      ],
      'attribute': {
        'class': 'sidebar',
        'href': '^((?!\\bgmail\\.com\\b).)*$',
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

    pageAttributes = {
      referrer: 'http://mydealz.com',
      location: 'http://mydealz.com/123',
    };

  });

  afterEach(() => {
    env.sandbox.restore();
  });

  it('Should match the built url', () => {

    const ampDigidip = helpers.createAmpDigidip(config);

    const shifter = new LinkShifter(ampDigidip, null, null);
    const anchorElement = document.createElement('a');

    anchorElement.href = 'http://example.com';
    anchorElement.rel = '235';
    anchorElement.setAttribute('data-vars-event-id', '567');

    expect(shifter.replacePlaceHolders(anchorElement, pageAttributes))
        .to.equal('https://visit.digidip.net?pid=110&url=http%3A%2F%2Fexample.com&cid=&ref=http%3A%2F%2Fmydealz.com&location=http%3A%2F%2Fmydealz.com%2F123&rel=235&usr=12345&productId=567');
  });

  it('Should return the number of anchors that match the config', () => {

    const ampDigidip = helpers.createAmpDigidip(config);

    const doc = document.implementation.createHTMLDocument('test document');
    doc.body.appendChild(ampDigidip);
    doc.body.insertAdjacentHTML('afterbegin', mockedHtml);

    const configOpts_ = getConfigOpts(ampDigidip);

    const list = getScopeElements(doc, configOpts_);

    expect(list.length).to.equal(1);
  });



});
