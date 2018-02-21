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

import * as sinon from 'sinon';
import {AmpAdCustom} from '../amp-ad-custom';
import {createElementWithAttributes} from '../../../../src/dom';

describe('Amp custom ad', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  /**
   * Get a custom amp-ad element
   * @param {string} url The url of the ad server
   * @param {string} slot The alphanumeric slot Id (optional)
   * @returns {Element} The completed amp-ad element, which has been added to
   *    the current document body.
   */
  function getCustomAd(url, slot, body = document.body) {
    const ampAdElement = createElementWithAttributes(document, 'amp-ad', {
      type: 'custom',
      width: '500',
      height: '60',
      'data-url': url,
    });
    if (slot) {
      ampAdElement.setAttribute('data-slot', slot);
    }
    const template = document.createElement('template');
    ampAdElement.appendChild(template);
    body.appendChild(ampAdElement);
    return ampAdElement;
  }

  it('should get the correct full URLs', () => {
    // Create all the ads *before* calling getFullUrl_() - otherwise, the
    // ads after the first getFullUrl_() call will not be in the cache.

    // Single ad with no slot
    const urlBase1 = '/examples/custom.ad.example.single.json';
    const elem1 = getCustomAd(urlBase1);
    const ad1 = new AmpAdCustom(elem1);
    sandbox.stub(ad1, 'getFallback').callsFake(() => {return null;});
    ad1.buildCallback();

    // Single ad with a slot
    const urlBase2 = '/examples/custom.ad.example.single.json?x=y';
    const slot = 'myslot2';
    const elem2 = getCustomAd(urlBase2, slot);
    const ad2 = new AmpAdCustom(elem2);
    sandbox.stub(ad2, 'getFallback').callsFake(() => {return null;});
    ad2.buildCallback();
    const expected2 = urlBase2 + '&ampslots=' + slot;

    // Pair of ads with the same url but different slots
    const urlBase34 = '/examples/custom.ad.example.json';
    const slot3 = 'myslot3';
    const elem3 = getCustomAd(urlBase34, slot3);
    const ad3 = new AmpAdCustom(elem3);
    sandbox.stub(ad3, 'getFallback').callsFake(() => {return null;});
    ad3.buildCallback();

    const slot4 = 'myslot4';
    const elem4 = getCustomAd(urlBase34, slot4);
    const ad4 = new AmpAdCustom(elem4);
    sandbox.stub(ad4, 'getFallback').callsFake(() => {return null;});
    ad4.buildCallback();

    const expected34 = urlBase34 + '?ampslots=' + slot3 + '%2C' + slot4;

    // Now we can get the URLs
    expect(ad1.getFullUrl_()).to.equal(urlBase1);
    expect(ad2.getFullUrl_()).to.equal(expected2);
    expect(ad3.getFullUrl_()).to.equal(expected34);
    expect(ad4.getFullUrl_()).to.equal(expected34);
  });

  describe('#getPriority', () => {
    const url = '/examples/custom.ad.example.json';
    const slot = 'myslot';

    describes.realWin('with shadow AmpDoc', {
      amp: {
        ampdoc: 'shadow',
      },
    }, env => {
      it('should return priority of 1', () => {
        const adElement = getCustomAd(url, slot, /*body*/env.ampdoc.getBody());
        const customAd = new AmpAdCustom(adElement);
        expect(customAd.getPriority()).to.equal(1);
      });
    });

    describes.realWin('with single AmpDoc', {
      amp: {
        ampdoc: 'single',
      },
    }, env => {
      it('should return priority of 2', () => {
        const adElement = getCustomAd(url, slot, /*body*/env.ampdoc.getBody());
        const customAd = new AmpAdCustom(adElement);
        expect(customAd.getPriority()).to.equal(2);
      });
    });
  });

  describe('TemplateData', () => {
    it('templateData w/o data object', () => {
      const elem = getCustomAd('fake.json');
      const ad = new AmpAdCustom(elem);
      ad.handleTemplateData_({
        'a': '1',
        'b': '2',
      });
      expect(elem.getAttribute('template')).to.be.null;
    });

    it('templateData with non object data', () => {
      const elem = getCustomAd('fake.json');
      const ad = new AmpAdCustom(elem);
      ad.handleTemplateData_({
        'a': '1',
        'b': '2',
        'data': '3',
      });
      expect(elem.getAttribute('template')).to.be.null;
    });

    it('templateData with data object', () => {
      const elem = getCustomAd('fake.json');
      const ad = new AmpAdCustom(elem);
      ad.handleTemplateData_({
        'data': {
          'a': '1',
          'b': '2',
        },
        'templateId': '123',
        'vars': {
          'abc': '456',
        },
      });
      expect(elem.getAttribute('template')).to.equal('123');
      expect(elem.getAttribute('data-vars-abc')).to.equal('456');
    });
  });
});

