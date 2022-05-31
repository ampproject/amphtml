import {Services} from '#service';
import {installDocService} from '#service/ampdoc-impl';

import {
  registerServiceBuilderForDoc,
  resetServiceForTesting,
} from '../../../../src/service-helpers';
import {handleCompanionAds} from '../monetization';

describes.realWin(
  'amp-apester-media-monetization',
  {
    amp: {
      extensions: ['amp-apester-media'],
    },
  },
  (env) => {
    let win, doc;
    let baseElement;
    let docInfo;
    const queryAmpAdBladeSelector = (myDoc) =>
      myDoc.querySelector('amp-ad[type=blade]');
    const queryAmpAdAniviewSelector = (myDoc) =>
      myDoc.querySelector('amp-ad[type=aniview]');
    const queryAmpAdDisplaySelector = (myDoc) =>
      myDoc.querySelector('amp-ad[type=doubleclick]');

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      baseElement = doc.createElement('amp-apester-media');
      baseElement.setAttribute('layout', 'fixed-height');

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
    it('Should show a companion bottom ad', async () => {
      const media = createCampaignData({display: false, bottomAd: true});
      await handleCompanionAds(media, baseElement);
      const bottomAd = queryAmpAdDisplaySelector(doc);
      expect(bottomAd).to.exist;
      expect(baseElement.lastChild).to.be.equal(bottomAd);
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
    it('Should show an Aniview companion ad below', async () => {
      const media = createCampaignData({
        display: false,
        avAbove: false,
        avBelow: true,
      });
      await handleCompanionAds(media, baseElement);
      const avAdBelow = queryAmpAdAniviewSelector(doc);
      expect(avAdBelow).to.exist;
      expect(baseElement.nextSibling).to.be.equal(avAdBelow);
    });
    it('Should show an Aniview companion ad above', async () => {
      const media = createCampaignData({
        display: false,
        avAbove: true,
        avBelow: false,
      });
      await handleCompanionAds(media, baseElement);
      const avAboveAd = queryAmpAdAniviewSelector(doc);
      expect(avAboveAd).to.exist;
      expect(baseElement.previousSibling).to.be.equal(avAboveAd);
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
        bottomAd: true,
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
    it('Should not show bottom ad if there no bottomAdOptions', async () => {
      const media = createCampaignData({
        bottomAd: true,
      });
      delete media.campaignData.bottomAdOptions;
      await handleCompanionAds(media, baseElement);
      const bottomAd = queryAmpAdDisplaySelector(doc);
      expect(bottomAd).to.not.exist;
    });
  }
);

function createCampaignData({
  avAbove,
  avBelow,
  bottomAd,
  disabledAmpCompanionAds,
  display,
  srAbove,
  srBelow,
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
        'playerOptions': {
          'aniviewChannelId': '5fad4ac42cd6d91dcb6e50e9',
        },
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
    'bottomAdOptions': {
      'idleAds': {
        'timeout': null,
      },
      'enabled': false,
      'videoPlayer': 'gpt',
      'tag': '/6355419/Travel/Europe/France/Paris',
      'playerProps': {
        'auctionCode': 'aR1s',
        'dfp': true,
      },
    },
    'companionCampaignOptions': {
      'companionCampaignId': '5d8b267a50bf9482f458d2ca',
    },
  };
  if (display) {
    campaignData.companionOptions.enabled = true;
  }
  if (bottomAd) {
    campaignData.bottomAdOptions.enabled = true;
  }
  if (srAbove) {
    campaignData.companionOptions.video.enabled = true;
    campaignData.companionOptions.video.provider = 'sr';
    campaignData.companionOptions.video.companion.enabled = true;
  }
  if (srBelow) {
    campaignData.companionOptions.video.enabled = true;
    campaignData.companionOptions.video.provider = 'sr';
    campaignData.companionOptions.video.companion_below.enabled = true;
  }
  if (avAbove) {
    campaignData.companionOptions.video.enabled = true;
    campaignData.companionOptions.video.provider = 'aniview';
    campaignData.companionOptions.video.companion.enabled = true;
  }
  if (avBelow) {
    campaignData.companionOptions.video.enabled = true;
    campaignData.companionOptions.video.provider = 'aniview';
    campaignData.companionOptions.video.companion_below.enabled = true;
  }
  if (disabledAmpCompanionAds) {
    campaignData.disabledAmpCompanionAds = true;
  }
  media.campaignData = campaignData;
  return media;
}
