/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {CONSENT_POLICY_STATE} from '../../../src/consent-state';
import {adsense} from '../adsense';

describes.realWin('adsenseDelayedFetch', {}, env => {
  let containerElem, data;
  const canonicalUrl = 'https://foo.com?some=page';
  const clientId = 'some_clientId';
  const pageViewId = 'some_pageViewId';
  const elementAttributes = {
    'adChannel': 'data-ad-channel',
    'adClient': 'data-ad-client',
    'adSlot': 'data-ad-slot',
    'adHost': 'data-ad-host',
    'adtest': 'data-adtest',
    'tagOrigin': 'data-tag-origin',
    'package': 'data-package',
    'matchedContentUiType': 'data-matched-content-ui-type',
    'matchedContentRowsNum': 'data-matched-content-rows-num',
    'matchedContentColumnsNum': 'data-matched-content-columns-num',
  };

  beforeEach(() => {
    containerElem = env.win.document.createElement('div');
    containerElem.setAttribute('id', 'c');
    env.win.document.body.appendChild(containerElem);
    env.win.context = {canonicalUrl, clientId, pageViewId};
    data = {};
    Object.keys(elementAttributes).forEach(
      attr => (data[attr] = `some-${attr}`)
    );
    data['experimentId'] = '1234,567,890';
  });

  it('should create script/ins and call adsbygoogle push', () => {
    let pushArg;
    env.win.adsbygoogle = {
      push: arg => {
        expect(pushArg).to.not.be.ok;
        pushArg = arg;
      },
    };
    adsense(env.win, data);
    expect(
      env.win.document.querySelector(
        'script[src=' +
          '"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
      )
    ).to.be.ok;
    const insElement = env.win.document.querySelector('ins.adsbygoogle');
    expect(insElement).to.be.ok;
    expect(insElement.getAttribute('data-page-url')).to.equal(canonicalUrl);
    Object.keys(elementAttributes).forEach(attr =>
      expect(insElement.getAttribute(elementAttributes[attr])).to.equal(
        `some-${attr}`
      )
    );
    expect(pushArg).to.be.ok;
    expect(pushArg).to.jsonEqual({
      params: {
        'google_ad_modifications': {
          eids: ['1234', '567', '890'],
        },
      },
    });
    expect(env.win.gaGlobal).to.jsonEqual({
      cid: clientId,
      hid: pageViewId,
    });
  });

  it('should not throw for valid responsive ad unit height', () => {
    data['fullWidth'] = 'true';
    data['autoFormat'] = 'rspv';
    data['height'] = '320';
    expect(() => adsense(env.win, data)).to.not.throw();
  });

  it('should throw on invalid responsive ad unit height', () => {
    data['fullWidth'] = 'true';
    data['autoFormat'] = 'rspv';
    data['height'] = '666';
    allowConsoleError(() => {
      expect(() => adsense(env.win, data)).to.throw(
        /Specified height 666 in <amp-ad> tag is not equal to the required/
      );
    });
  });

  it('should throw on missing fullWidth field for responsive ad unit', () => {
    data['autoFormat'] = 'rspv';
    data['height'] = '320';
    allowConsoleError(() => {
      expect(() => adsense(env.win, data)).to.throw(
        /Responsive AdSense ad units require the attribute data-full-width.​/
      );
    });
  });

  describe('amp-consent integration', () => {
    let pushCount = 0;
    beforeEach(() => {
      pushCount = 0;
      env.win.adsbygoogle = {
        push: () => pushCount++,
      };
    });

    it('should handle missing consentState', () => {
      adsense(env.win, data);
      expect(env.win.document.querySelector('ins.adsbygoogle')).to.be.ok;
      expect(pushCount).to.equal(1);
      expect(env.win.adsbygoogle['requestNonPersonalizedAds']).to.be.undefined;
    });

    it('should npa for unknown with npaOnUnknownConsent', () => {
      env.win.context.initialConsentState = CONSENT_POLICY_STATE.UNKNOWN;
      data['npaOnUnknownConsent'] = 'true';
      adsense(env.win, data);
      expect(env.win.document.querySelector('ins.adsbygoogle')).to.be.ok;
      expect(pushCount).to.equal(1);
      expect(env.win.adsbygoogle).to.be.ok;
      expect(env.win.adsbygoogle['requestNonPersonalizedAds']).to.be.true;
    });

    it('should not request for unknown q/ invalid npaOnUnknownConsent', () => {
      env.win.context.initialConsentState = CONSENT_POLICY_STATE.UNKNOWN;
      data['npaOnUnknownConsent'] = 'blah';
      adsense(env.win, data);
      expect(env.win.document.querySelector('ins.adsbygoogle')).to.not.be.ok;
      expect(pushCount).to.equal(0);
      expect(env.win.adsbygoogle['requestNonPersonalizedAds']).to.be.undefined;
    });

    /**
     * Possible consent policy state to proceed with.
     * @enum {string}
     */
    const RESULT_STATE = {
      NO_EFFECT: 'no effect',
      NPA: 'npa',
      NO_REQUEST: 'no request',
    };
    for (const policy in CONSENT_POLICY_STATE) {
      let result;
      switch (CONSENT_POLICY_STATE[policy]) {
        case CONSENT_POLICY_STATE.UNKNOWN:
          result = RESULT_STATE.NO_REQUEST;
          break;
        case CONSENT_POLICY_STATE.SUFFICIENT:
          result = RESULT_STATE.NO_EFFECT;
          break;
        case CONSENT_POLICY_STATE.INSUFFICIENT:
          result = RESULT_STATE.NPA;
          break;
        case CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED:
          result = RESULT_STATE.NO_EFFECT;
          break;
        default:
          throw new Error(`Unknown policy: ${policy}`);
      }
      it(`should ${result} when ${policy}`, () => {
        env.win.context.initialConsentState = CONSENT_POLICY_STATE[policy];
        adsense(env.win, data);
        const insElement = env.win.document.querySelector('ins.adsbygoogle');
        if (result == RESULT_STATE.NO_REQUEST) {
          expect(insElement).to.not.be.ok;
          expect(pushCount).to.equal(0);
          expect(env.win.adsbygoogle['requestNonPersonalizedAds']).to.be
            .undefined;
        } else {
          expect(insElement).to.be.ok;
          expect(pushCount).to.equal(1);
          expect(env.win.adsbygoogle).to.be.ok;
          expect(env.win.adsbygoogle['requestNonPersonalizedAds']).to.equal(
            result == RESULT_STATE.NPA ? true : undefined
          );
        }
      });
    }
  });
});
