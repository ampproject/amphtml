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

import {handleCompanionAds} from '../monetization/index';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {
  registerServiceBuilderForDoc,
  resetServiceForTesting,
} from '../../../../src/service';
describes.realWin('amp-apester-media-monetization', {}, env => {
  let win, doc;
  let baseElement;
  let docInfo;
  let media;
  const queryAmpAdBladeSelector = baseElement =>
    baseElement.parentNode.querySelector('amp-ad[type=blade]');
  const queryAmpAdDisplaySelector = baseElement =>
    baseElement.parentNode.querySelector('amp-ad[type=doubleclick]');

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    media = {};

    baseElement = doc.createElement('amp-apester-media');

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

  it('show display ad', async () => {
    media.campaignData = createCampaignData(true);
    await handleCompanionAds(media, baseElement);
    const displayAd = queryAmpAdDisplaySelector(baseElement);
    expect(displayAd).to.exist;
    expect(baseElement.nextSibling).to.be.equal(displayAd);
  });
  it('show sr ad below', async () => {
    media.campaignData = createCampaignData(false, false, true);
    await handleCompanionAds(media, baseElement);
    const srAdBelow = queryAmpAdBladeSelector(baseElement);
    expect(srAdBelow).to.exist;
    expect(baseElement.nextSibling).to.be.equal(srAdBelow);
  });
  it('show sr ad above', async () => {
    media.campaignData = createCampaignData(false, true, false);
    await handleCompanionAds(media, baseElement)
    const srAboveAd = queryAmpAdBladeSelector(baseElement);
    expect(srAboveAd).to.exist;
    expect(baseElement.previousSibling).to.be.equal(srAboveAd);
  });
  it('show sr above with display', async () => {
    media.campaignData = createCampaignData(true, true, false);
    await handleCompanionAds(media, baseElement);
    const displayAd = queryAmpAdDisplaySelector(baseElement);
    expect(displayAd).to.exist;
    expect(baseElement.nextSibling).to.be.equal(displayAd);
    const srAboveAd = queryAmpAdBladeSelector(baseElement);
    expect(srAboveAd).to.exist;
    expect(baseElement.previousSibling).to.be.equal(srAboveAd);
  });
  it('dont show ad if disabled amp companion ads', async () => {
    media.campaignData = createCampaignData(true, true, false, true);
    await handleCompanionAds(media, baseElement);
    const displayAd = queryAmpAdDisplaySelector(baseElement);
    expect(displayAd).to.not.exist;
    const srAboveAd = queryAmpAdBladeSelector(baseElement);
    expect(srAboveAd).to.not.exist;
  });
});

function createCampaignData(
  display,
  srAbove,
  srBelow,
  disabledAmpCompanionAds
) {
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
  return campaignData;
}
