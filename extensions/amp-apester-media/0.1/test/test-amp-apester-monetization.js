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

import {Services} from '../../../../src/services';
import {handleCompanionAds} from '../monetization/index';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {
  registerServiceBuilderForDoc,
  resetServiceForTesting,
} from '../../../../src/service';
describes.realWin('amp-apester-media-monetization', {}, (env) => {
  let win, doc;
  let baseElement;
  let docInfo;
  const queryAmpAdBladeSelector = (myDoc) =>
    myDoc.querySelector('amp-ad[type=blade]');
  const queryAmpAdDisplaySelector = (myDoc) =>
    myDoc.querySelector('amp-ad[type=doubleclick]');

  beforeEach(() => {
    win = env.win;
    doc = win.document;

    baseElement = doc.createElement('amp-apester-media');

    const mutator = {
      requestChangeSize: () => env.sandbox.stub(),
    };
    env.sandbox.stub(Services, 'mutatorForDoc').returns(mutator);

    doc.body.appendChild(baseElement);
    docInfo = {
      canonicalUrl: 'https://www.example.com/path',
      sourceUrl: 'https://source.example.com/path',
    };
    installDocService(win, /* isSingleDoc */ true);
    resetServiceForTesting(win, 'documentInfo');
    return registerServiceBuilderForDoc(doc, 'documentInfo', function () {
      return {
        get: () => docInfo,
      };
    });
  });

  it('Should show a companion display ad', async () => {
    const media = createCampaignData({display: true});
    await handleCompanionAds(media, baseElement);
    const displayAd = queryAmpAdDisplaySelector(doc);
    expect(displayAd).to.exist;
    expect(baseElement.nextSibling).to.be.equal(displayAd);
  });
  it('Should show an SR companion ad below', async () => {
    const media = createCampaignData({
      display: false,
      srAbove: false,
      srBelow: true,
    });
    await handleCompanionAds(media, baseElement);
    const srAdBelow = queryAmpAdBladeSelector(doc);
    expect(srAdBelow).to.exist;
    expect(baseElement.nextSibling).to.be.equal(srAdBelow);
  });
  it('Should show an SR companion ad above', async () => {
    const media = createCampaignData({
      display: false,
      srAbove: true,
      srBelow: false,
    });
    await handleCompanionAds(media, baseElement);
    const srAboveAd = queryAmpAdBladeSelector(doc);
    expect(srAboveAd).to.exist;
    expect(baseElement.previousSibling).to.be.equal(srAboveAd);
  });
  it('Should show an SR companion above with display companion', async () => {
    const media = createCampaignData({
      display: true,
      srAbove: true,
      srBelow: false,
    });
    await handleCompanionAds(media, baseElement);
    const displayAd = queryAmpAdDisplaySelector(doc);
    expect(displayAd).to.exist;
    expect(baseElement.nextSibling).to.be.equal(displayAd);
    const srAboveAd = queryAmpAdBladeSelector(doc);
    expect(srAboveAd).to.exist;
    expect(baseElement.previousSibling).to.be.equal(srAboveAd);
  });
  it('Should not show ads if disabled amp companion ads', async () => {
    const media = createCampaignData({
      display: true,
      srAbove: true,
      srBelow: false,
      disabledAmpCompanionAds: true,
    });
    await handleCompanionAds(media, baseElement);
    const displayAd = queryAmpAdDisplaySelector(doc);
    expect(displayAd).to.not.exist;
    const srAboveAd = queryAmpAdBladeSelector(doc);
    expect(srAboveAd).to.not.exist;
  });
});

function createCampaignData({
  display,
  srAbove,
  srBelow,
  disabledAmpCompanionAds,
}) {
  const media = {};
  const campaignData = {
    'companionOptions': {
      'settings': {
        'slot': '/57806026/Dev_DT_300x250',
        'options': {
          'refreshOnClick': 'none',
          'lockTime': 5000,
        },
        'bannerAdProvider': 'gdt',
        'bannerSizes': [[300, 250]],
      },
      'enabled': false,
      'video': {
        'videoTag': '5d14c0ded1fb9900016a3118',
        'enabled': false,
        'floating': {
          'enabled': false,
        },
        'companion': {
          'enabled': false,
        },
        'companion_below': {
          'enabled': false,
        },
        'provider': 'sr',
      },
    },
    'companionCampaignOptions': {
      'companionCampaignId': '5d8b267a50bf9482f458d2ca',
    },
  };
  if (display) {
    campaignData.companionOptions.enabled = true;
  }
  if (srAbove) {
    campaignData.companionOptions.video.enabled = true;
    campaignData.companionOptions.video.companion.enabled = true;
  }
  if (srBelow) {
    campaignData.companionOptions.video.enabled = true;
    campaignData.companionOptions.video.companion_below.enabled = true;
  }
  if (disabledAmpCompanionAds) {
    campaignData.disabledAmpCompanionAds = true;
  }
  media.campaignData = campaignData;
  return media;
}
