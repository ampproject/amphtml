/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {AmpAd3PImpl} from '../../../extensions/amp-ad/0.1/amp-ad-3p-impl';
import {createIframePromise} from '../../../testing/iframe';
import {stubService} from '../../../testing/test-helper';
import {createElementWithAttributes} from '../../../src/dom';
import * as adCid from '../../../src/ad-cid';
import '../../../extensions/amp-ad/0.1/amp-ad';
import '../../../extensions/amp-sticky-ad/0.1/amp-sticky-ad';
import * as lolex from 'lolex';
import * as sinon from 'sinon';

function createAmpAd(win) {
  const ampAdElement = createElementWithAttributes(win.document, 'amp-ad', {
    'type': 'csa',
    'height': 250,
    'data-afs-page-options': '{"pubId": "gtech-codegen", "query": "googletestad"}',
    'data-afs-adblock-options': '{"width": "auto"}'
  });

  return new AmpAd3PImpl(ampAdElement);
}

describe('amp-ad-csa-impl', () => {
  let sandbox;
  let ad3p;
  let win;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    return createIframePromise(true).then(iframe => {
      win = iframe.win;
      win.document.head.appendChild(
          createElementWithAttributes(win.document, 'link', {
            rel: 'canonical',
            href: 'https://canonical.url',
          }));
      ad3p = createAmpAd(win);
      win.document.body.appendChild(ad3p.element);
      ad3p.buildCallback();
      // Turn the doc to visible so prefetch will be proceeded.
      stubService(sandbox, win, 'viewer', 'whenFirstVisible')
          .returns(Promise.resolve());
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('layoutCallback', () => {

    it('should create iframe and pass data via URL fragment', () => {
      return ad3p.layoutCallback().then(() => {
        const ampElement = ad3p.element;
        expect(ampElement.tagName).to.equal('AMP-AD');

        const iframe = ampElement.firstChild;
        expect(iframe.tagName).to.equal('IFRAME');
        const url = iframe.getAttribute('src');
        expect(url).to.match(/^http:\/\/ads.localhost:/);
        expect(url).to.match(/frame(.max)?.html#{/);
        expect(iframe.style.display).to.equal('');

        const data = JSON.parse(url.substr(url.indexOf('#') + 1));
        expect(data).to.have.property('type', 'csa');
        expect(data).to.have.property('height', 250);
        expect(data).to.have.property('afsPageOptions', '{"pubId": "gtech-codegen", "query": "googletestad"}');
        expect(data).to.have.property('afsAdblockOptions', '{"width": "auto"}');

      });
    });
  });
});
