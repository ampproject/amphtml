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


import {AdTracker, getExistingAds} from '../ad-tracker';
import {layoutRectLtwh} from '../../../../src/layout-rect';
import {resourcesForDoc} from '../../../../src/resources';
import * as sinon from 'sinon';

describe('ad-tracker', () => {
  let doc;
  let resources;
  let sandbox;
  let container;

  beforeEach(() => {
    doc = window.document;
    sandbox = sinon.sandbox.create();

    resources = resourcesForDoc(doc);
    sandbox.stub(resources, 'getElementLayoutBox', element => {
      return Promise.resolve(element.layoutBox);
    });

    container = doc.createElement('div');
    doc.body.appendChild(container);
  });

  afterEach(() => {
    sandbox.restore();
    doc.body.removeChild(container);
  });

  function addAd(layoutBox) {
    const ad = doc.createElement('amp-ad');
    ad.setAttribute('type', 'adsense');
    ad.setAttribute('layout', 'responsive');
    ad.setAttribute('width', '300');
    ad.setAttribute('height', '100');
    ad.layoutBox = layoutBox;
    container.appendChild(ad);
    return ad;
  }

  it('should return the correct ad count', () => {
    const adTracker = new AdTracker([
      addAd(layoutRectLtwh(0, 0, 300, 50)),
    ], 100);
    expect(adTracker.getAdCount()).to.equal(1);

    adTracker.addAd(addAd(layoutRectLtwh(0, 100, 300, 50)));
    expect(adTracker.getAdCount()).to.equal(2);
  });

  it('should find position is too near when close to ad above', () => {
    const adTracker = new AdTracker([
      addAd(layoutRectLtwh(0, 0, 300, 50)),
    ], 100);
    return adTracker.isTooNearAnAd(149).then(tooNear => {
      expect(tooNear).to.equal(true);
    });
  });

  it('should find position is too near when close to ad below', () => {
    const adTracker = new AdTracker([
      addAd(layoutRectLtwh(0, 100, 300, 50)),
    ], 100);
    return adTracker.isTooNearAnAd(1).then(tooNear => {
      expect(tooNear).to.equal(true);
    });
  });

  it('should find position is too near when inside ad', () => {
    const adTracker = new AdTracker([
      addAd(layoutRectLtwh(0, 0, 300, 50)),
    ], 1);
    return adTracker.isTooNearAnAd(25).then(tooNear => {
      expect(tooNear).to.equal(true);
    });
  });

  it('should find position is not too near an ad', () => {
    const adTracker = new AdTracker([
      addAd(layoutRectLtwh(0, 0, 300, 50)),
      addAd(layoutRectLtwh(0, 250, 300, 50)),
    ], 100);
    return adTracker.isTooNearAnAd(150).then(tooNear => {
      expect(tooNear).to.equal(false);
    });
  });

  it('should add an ad to the tracker', () => {
    const adTracker = new AdTracker([
      addAd(layoutRectLtwh(0, 0, 300, 50)),
    ], 100);
    adTracker.addAd(addAd(layoutRectLtwh(0, 100, 300, 50)));
    return adTracker.isTooNearAnAd(150).then(tooNear => {
      expect(tooNear).to.equal(true);
    });
  });
});

describes.realWin('getExistingAds', {}, env => {
  let win;
  let doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  it('should find all the amp-ads in the DOM', () => {
    const ad1 = doc.createElement('amp-ad');
    doc.body.appendChild(ad1);
    const ad2 = doc.createElement('amp-ad');
    doc.body.appendChild(ad2);
    const ad3 = doc.createElement('amp-a4a');
    doc.body.appendChild(ad3);

    const ads = getExistingAds(win);
    expect(ads).to.have.lengthOf(3);
    expect(ads[0]).to.equal(ad1);
    expect(ads[1]).to.equal(ad2);
    expect(ads[2]).to.equal(ad3);
  });
});
