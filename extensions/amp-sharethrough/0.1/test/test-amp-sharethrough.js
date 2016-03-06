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

import {
  AmpSharethrough,
} from '../../../../build/all/v0/amp-sharethrough-0.1.max';
import {getService} from '../../../../src/service';
import {createIframePromise} from '../../../../testing/iframe';
import {markElementScheduledForTesting} from '../../../../src/custom-element';
import * as sinon from 'sinon';

describe('amp-sharethrough', () => {

  let sandbox;
  let windowApi;

  const jsonMockResponse =
    {
      'placement': {
        'articlesBeforeFirstAd': null,
        'placementAttributes': {
          'dfp_path': '',
          'promoted_by_text': 'Ad By',
          'site_key': '2f8c514c7085b6672acd0df4',
          'featuredContent': null,
          'third_party_partners': [],
          'template': '&lt;div class=&quot;{{action}} str-collapsed&quot; styl'
            + 'e=&quot;background-color:  #f6f6f6 ; overflow: hidden; height: '
            + 'auto; clear: both;cursor: pointer;&quot;&gt; &lt;div class=&quo'
            + 't;str-thumbnail&quot; style=&quot;width: 90px; height: 90px; fl'
            + 'oat: left;margin-right: 8px;&quot;&gt; &lt;amp-img src=&quot;{{'
            + '{thumbnail_url}}}&quot; layout=&quot;fixed&quot; height=&quot;8'
            + '0&quot; width=&quot;80&quot; class=&quot;str-thumbnail&quot;&gt'
            + ';&lt;/amp-img&gt; &lt;/div&gt; &lt;div class=&quot;str-title&qu'
            + 'ot; style=&quot;margin:  0;padding:  2px 3px 0 0;font-weight: b'
            + 'old;line-height: normal;&quot;&gt;{{title}}&lt;/div&gt; &lt;div'
            + 'class=&quot;str-description&quot; style=&quot;margin:  0;paddin'
            + 'g:  2px 3px 0 0;line-height: normal;&quot;&gt;{{description}}&l'
            + 't;/div&gt; &lt;div class=&quot;str-advertiser&quot; style=&quot'
            + ';margin: 0; padding 4px 3px 4px 0;font-size:  .8em;padding:  4p'
            + 'x 4px 4px 0;&quot;&gt;Ad by {{advertiser}} &lt;div class=&quot;'
            + 'str-brand-logo&quot; style=&quot;display:  inline-block;width: '
            + '16px; height: 16px; max-width:  16px; max-height:  16px;margin-'
            + 'left:  6px;&quot;&gt; &lt;amp-img src=&quot;{{{brand_logo_url}}'
            + '}&quot; layout=&quot;fixed&quot; height=&quot;16&quot; width=&q'
            + 'uot;16&quot;&gt;&lt;/amp-img&gt; &lt;/div&gt; &lt;/div&gt; &lt;'
            + '/div&gt;',
          'backfillTag': '',
          'publisher_key': '834589ed'},
        'allowInstantPlay': false,
        'status': 'pre-live',
        'metadata': {
          'strOptOutIcon': true,
          'experiment': {
            'script_url': '',
            'block_rendering': false}},
        'layout': 'single',
        'articlesBetweenAds': null},
      'creatives': [
        {
          'price': 0,
          'signature': '8efdd1134d0d5ca4da36ace4c03f5f271aaa9daa9d274c3c9a19e2'
            + '383ce5ab23',
          'creative': {
            'advertiser_key': '',
            'force_click_to_play': false,
            'creative_key': 'sam-6d9ace29',
            'campaign_key': 'a1aca5e80f272d9a9be1b810',
            'description': 'To maintain a free, ad-funded Internet, brands'
              + 'need to start focusing on metrics that go beyond the click.',
            'media_url': 'http: //nativeadvertising.com/the-ethics-of-'
              + 'attention-and-the-inevitable-future-of-digital-advertising/',
            'instant_play_mobile_count': null,
            'share_url': 'http: //nativeadvertising.com/the-ethics-of-'
              + 'attention-and-the-inevitable-future-of-digital-advertising/',
            'variant_key': '124493',
            'instant_play_mobile_url': null,
            'advertiser': 'Sharethrough',
            'beacons': {
              'visible': [],
              'play': [],
              'completed_silent_play': [],
              'thirty_second_silent_play': [],
              'silent_play': [],
              'fifteen_second_silent_play': [],
              'click': [],
              'ten_second_silent_play': [],
              'impression': []},
            'custom_engagement_url': '',
            'thumbnail_url': '//static.sharethrough.com/m/creative_thumbnails/'
              + '68965/images/thumb_320/time-square.jpg',
            'brand_logo_url': '//static.sharethrough.com/m/campaigns/8496/'
              + 'brand_logos/mobile/sharethrough-mark.png',
            'title': 'The Ethics of Attention And The Inevitable Future Of '
              + 'Digital Advertising',
            'custom_engagement_label': '',
            'thumbnail_styles': ['thumb_320','thumb_1000','original'],
            'action': 'clickout'},
          'priceType': 'vCPM',
          'version': 1,
          'auctionWinId': '18b4395f-cc1a-468e-bea3-d14eec382081'}],
      'adserverRequestId': '8803e6e7-4ee3-4977-a0bb-d8b9b83dd7a8'};

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    return createIframePromise().then(iframe => {
      iframe.doc.title = 'Test Sharethrough Title';
      markElementScheduledForTesting(iframe.win, 'amp-sharethrough');
      getService(iframe.win, 'xhr', () => {
        return {fetchJson: () => {
          return Promise.resolve(jsonMockResponse);
        }};
      });
      windowApi = iframe.win;
    });
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = null;
    windowApi = null;
  });

  function getSharethroughTag() {
    const el = windowApi.document.createElement('amp-sharethrough');
    const sharethrough = new AmpSharethrough(el);
    return sharethrough;
  };

  describe('layoutCallback', () => {
    it('asserts that a native key is present', () => {
      const sharethrough = getSharethroughTag();
      expect(() => { sharethrough.layoutCallback(); }).throws();
    });

    it('makes an xhr request to the exchange', () => {
      const sharethrough = getSharethroughTag();
      sharethrough.element.setAttribute('data-native-key', 'abcd1234');
      sharethrough.layoutCallback().then(() => {
        expect(sharethrough.element.childNodes.length).to.equal(1);
      });
    });
  });

  describe('#unencodedHTML', () => {
    it('unencodes HTML', () => {
      const sharethrough = getSharethroughTag();
      const encodedHTML = '&lt;div class=&quot;{{action}}str-collapsed&quot; '
        + 'style=&quot;background-color: #f6f6f6 ; overflow:hidden; '
        + 'height:auto; clear:both;cursor:pointer;&quot;&gt; &lt;a '
        + 'href=&quot;{{{media_url}}}&quot;&gt; &lt;div class=&quot;'
        + 'str-thumbnail&quot; style=&quot;width:90px; height:90px; '
        + 'float:left;margin-right:8px;&quot;&gt; &lt;amp-img src=&quot;'
        + '{{{thumbnail_url}}}&quot; layout=&quot;fixed&quot; height=&quot;'
        + '80&quot; width=&quot;80&quot; class=&quot;str-thumbnail&quot;'
        + '&gt;&lt;/amp-img&gt; &lt;/div&gt;&lt;h3 class=&quot;str-title&quot;'
        + ' style=&quot;margin: 0;padding: 2px 3px 0 0;font-weight:bold;'
        + 'line-height:normal;&quot;&gt;{{title}}&lt;/h3&gt; &lt;div '
        + 'class=&quot;str-advertiser&quot; style=&quot;margin:0; padding '
        + '4px 3px 4px 0;font-size: .8em;padding: 4px 4px 4px 0;&quot;&gt;Ad '
        + 'by{{advertiser}}&lt;amp-img src=&quot;{{{brand_logo_url}}}&quot; '
        + 'layout=&quot;fixed&quot; height=&quot;16&quot; width=&quot;16&quot;'
        + '&gt;&lt;/amp-img&gt; &lt;/div&gt;&lt;/a&gt;&lt;/div&gt;';
      const unencodedHTML = '<div class="{{action}}str-collapsed" style="backg'
        + 'round-color: #f6f6f6 ; overflow:hidden; height:auto; clear:both;cur'
        + 'sor:pointer;"> <a href="{{{media_url}}}"> <div class="str-thumbnail'
        + '" style="width:90px; height:90px; float:left;margin-right:8px;"> <a'
        + 'mp-img src="{{{thumbnail_url}}}" layout="fixed" height="80" width="'
        + '80" class="str-thumbnail"></amp-img> </div><h3 class="str-title" st'
        + 'yle="margin: 0;padding: 2px 3px 0 0;font-weight:bold;line-height:no'
        + 'rmal;">{{title}}</h3> <div class="str-advertiser" style="margin:0; '
        + 'padding 4px 3px 4px 0;font-size: .8em;padding: 4px 4px 4px 0;">Ad b'
        + 'y{{advertiser}}<amp-img src="{{{brand_logo_url}}}" layout="fixed" h'
        + 'eight="16" width="16"></amp-img> </div></a></div>';
      expect(sharethrough.unencodeHTML(encodedHTML)).to.equal(unencodedHTML);
    });
  });

  describe('#analyticsHTML', () => {
    it('returns an amp-analytics element with the ckey and pkey set', () => {
      const sharethrough = getSharethroughTag();
      const pixelElement = sharethrough.analyticsHTML('fake-sharethrough-id');
      expect(pixelElement.tagName).to.equal('AMP-ANALYTICS');
      expect(pixelElement.childNodes.length).to.equal(1);
      const scriptElement = pixelElement.childNodes[0];
      expect(scriptElement.tagName).to.equal('SCRIPT');
      expect(scriptElement.getAttribute('type')).to.equal('application/json');
    });
  });

  describe('#pixleHTML', () => {
    it('returns an amp-pixel element with the ckey and pkey set', () => {
      const sharethrough = getSharethroughTag();
      const pixelElement = sharethrough.pixelHTML('fake-ckey', 'fake-pkey');
      expect(pixelElement.tagName).to.equal('AMP-PIXEL');
      expect(pixelElement.getAttribute('src')).to.equal('https://b.sharethrough.com/?ckey=fake-ckey&pkey=fake-pkey&type=rendered');
    });
  });
});
