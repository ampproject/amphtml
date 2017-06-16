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
import {DOMRectLtwh} from '../../../../src/dom-rect';
import {resourcesForDoc} from '../../../../src/services';
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

  function checkMinSpacing(adTracker, tooNearPos, okPos) {
    return adTracker.isTooNearAnAd(tooNearPos).then(tooNear => {
      expect(tooNear).to.equal(true);
      return adTracker.isTooNearAnAd(okPos).then(tooNear => {
        expect(tooNear).to.equal(false);
      });
    });
  }

  it('should return the correct ad count', () => {
    const adConstraints = {
      initialMinSpacing: 100,
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker([
      addAd(DOMRectLtwh(0, 0, 300, 50)),
    ], adConstraints);
    expect(adTracker.getAdCount()).to.equal(1);

    adTracker.addAd(addAd(DOMRectLtwh(0, 100, 300, 50)));
    expect(adTracker.getAdCount()).to.equal(2);
  });

  it('should find position is too near when close to ad above', () => {
    const adConstraints = {
      initialMinSpacing: 100,
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker([
      addAd(DOMRectLtwh(0, 0, 300, 50)),
    ], adConstraints);
    return adTracker.isTooNearAnAd(149).then(tooNear => {
      expect(tooNear).to.equal(true);
    });
  });

  it('should find position is too near when close to ad below', () => {
    const adConstraints = {
      initialMinSpacing: 100,
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker([
      addAd(DOMRectLtwh(0, 100, 300, 50)),
    ], adConstraints);
    return adTracker.isTooNearAnAd(1).then(tooNear => {
      expect(tooNear).to.equal(true);
    });
  });

  it('should find position is too near when inside ad', () => {
    const adConstraints = {
      initialMinSpacing: 100,
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker([
      addAd(DOMRectLtwh(0, 0, 300, 50)),
    ], adConstraints);
    return adTracker.isTooNearAnAd(25).then(tooNear => {
      expect(tooNear).to.equal(true);
    });
  });

  it('should find position is not too near an ad', () => {
    const adConstraints = {
      initialMinSpacing: 100,
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker([
      addAd(DOMRectLtwh(0, 0, 300, 50)),
      addAd(DOMRectLtwh(0, 250, 300, 50)),
    ], adConstraints);
    return adTracker.isTooNearAnAd(150).then(tooNear => {
      expect(tooNear).to.equal(false);
    });
  });

  it('should use the initial min ad spacing', () => {
    const adConstraints = {
      initialMinSpacing: 500,
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker([
      addAd(DOMRectLtwh(0, 0, 300, 50)),
    ], adConstraints);
    return checkMinSpacing(adTracker, 549, 550);
  });

  it('should use a subsequent ad spacing when an existing ad present', () => {
    const adConstraints = {
      initialMinSpacing: 500,
      subsequentMinSpacing: [
        {adCount: 1, spacing: 600},
      ],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker([
      addAd(DOMRectLtwh(0, 0, 300, 50)),
    ], adConstraints);
    return checkMinSpacing(adTracker, 649, 650);
  });

  it('should use a subsequent ad spacing when two existing ads present', () => {
    const adConstraints = {
      initialMinSpacing: 500,
      subsequentMinSpacing: [
        {adCount: 1, spacing: 600},
        {adCount: 2, spacing: 700},
      ],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker([
      addAd(DOMRectLtwh(0, 0, 300, 50)),
      addAd(DOMRectLtwh(0, 0, 300, 50)),
    ], adConstraints);
    return checkMinSpacing(adTracker, 749, 750);
  });

  it('should change min spacing as ads added', () => {
    const adConstraints = {
      initialMinSpacing: 500,
      subsequentMinSpacing: [
        {adCount: 1, spacing: 600},
        {adCount: 3, spacing: 700},
        {adCount: 4, spacing: 800},
      ],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker([
      addAd(DOMRectLtwh(0, 0, 300, 50)),
    ], adConstraints);
    return checkMinSpacing(adTracker, 649, 650).then(() => {
      adTracker.addAd(addAd(DOMRectLtwh(0, 0, 300, 50)));
      return checkMinSpacing(adTracker, 649, 650).then(() => {
        adTracker.addAd(addAd(DOMRectLtwh(0, 0, 300, 50)));
        return checkMinSpacing(adTracker, 749, 750).then(() => {
          adTracker.addAd(addAd(DOMRectLtwh(0, 0, 300, 50)));
          return checkMinSpacing(adTracker, 849, 850);
        });
      });
    });
  });

  it('should add an ad to the tracker', () => {
    const adConstraints = {
      initialMinSpacing: 100,
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker([
      addAd(DOMRectLtwh(0, 0, 300, 50)),
    ], adConstraints);
    adTracker.addAd(addAd(DOMRectLtwh(0, 100, 300, 50)));
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
