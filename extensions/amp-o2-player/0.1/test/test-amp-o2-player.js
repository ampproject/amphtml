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

import '../amp-o2-player';
import * as iframeHelper from '../../../../src/iframe-helper';
import {CONSENT_POLICY_STATE} from '../../../../src/consent-state';
import {MessageType} from '../../../../src/3p-frame-messaging';

describes.realWin(
  'amp-o2-player',
  {
    amp: {
      extensions: ['amp-o2-player'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getO2player(attributes, opt_responsive, implExtends) {
      const o2 = doc.createElement('amp-o2-player');
      for (const key in attributes) {
        o2.setAttribute(key, attributes[key]);
      }
      o2.setAttribute('width', '111');
      o2.setAttribute('height', '222');
      if (opt_responsive) {
        o2.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(o2);

      if (implExtends) {
        implExtends(o2);
      }
      await o2.build();
      await o2.layoutCallback();
      return o2;
    }

    it('renders', async () => {
      const o2 = await getO2player({
        'data-pid': '123',
        'data-bcid': '456',
      });
      const iframe = o2.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://delivery.vidible.tv/htmlembed/pid=123/456.html'
      );
    });

    it('renders responsively', async () => {
      const o2 = await getO2player(
        {
          'data-pid': '573acb47e4b0564ec2e10011',
          'data-bcid': '50d595ec0364e95588c77bd2',
        },
        true
      );
      const iframe = o2.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('requires data-pid', () => {
      return allowConsoleError(() => {
        return getO2player({
          'data-bcid': '50d595ec0364e95588c77bd2',
        }).should.eventually.be.rejectedWith(
          /data-pid attribute is required for/
        );
      });
    });

    it('requires data-bcid', () => {
      return allowConsoleError(() => {
        return getO2player({
          'data-pid': '573acb47e4b0564ec2e10011',
        }).should.eventually.be.rejectedWith(
          /data-bcid attribute is required for/
        );
      });
    });

    it('requires data-pid && data-bcid', () => {
      return allowConsoleError(() => {
        return getO2player({}).should.eventually.be.rejectedWith(
          /data-pid attribute is required for/
        );
      });
    });

    it('renders with data-vid passed', async () => {
      const o2 = await getO2player({
        'data-pid': '123',
        'data-bcid': '456',
        'data-vid': '789',
        'data-bid': '987',
      });
      const iframe = o2.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://delivery.vidible.tv/htmlembed/pid=123/456.html?bid=987&vid=789'
      );
    });

    it('renders with data-macros passed', async () => {
      const o2 = await getO2player({
        'data-pid': '123',
        'data-bcid': '456',
        'data-macros': 'm.test=test',
      });
      const iframe = o2.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://delivery.vidible.tv/htmlembed/pid=123/456.html?m.test=test'
      );
    });

    it('respects data-env parameter', async () => {
      const o2 = await getO2player({
        'data-pid': '123',
        'data-bcid': '456',
        'data-env': 'stage',
      });
      const iframe = o2.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://delivery.dev.vidible.tv/htmlembed/pid=123/456.html'
      );
    });

    describe('sends a consent-data', () => {
      let sendConsentDataToIframe;
      const resSource = 'my source';
      const resOrigin = 'my origin';
      const resConsentString = 'consent string';
      let consentData = {
        'gdprApplies': true,
        'user_consent': 1,
        'gdprString': resConsentString,
      };
      const resData = {
        sentinel: 'amp',
        type: MessageType.CONSENT_DATA,
      };

      it('sends a consent-data CONSENT_POLICY_STATE.SUFFICIENT message', async function () {
        resData.consentData = consentData;

        const implExtends = function (o2) {
          env.sandbox
            .stub(o2.implementation_, 'getConsentString_')
            .resolves(resConsentString);

          env.sandbox
            .stub(o2.implementation_, 'getConsentPolicyState_')
            .resolves(CONSENT_POLICY_STATE.SUFFICIENT);

          sendConsentDataToIframe = env.sandbox.spy(
            o2.implementation_,
            'sendConsentDataToIframe_'
          );
        };

        env.sandbox
          .stub(iframeHelper, 'listenFor')
          .callsFake((iframe, message, callback) => {
            expect(message).to.equal(MessageType.SEND_CONSENT_DATA);
            callback('', resSource, resOrigin);
          });

        await getO2player(
          {
            'data-pid': '123',
            'data-bcid': '456',
          },
          null,
          implExtends
        );

        expect(sendConsentDataToIframe).to.have.been.calledWith(
          resSource,
          resOrigin,
          resData
        );
      });

      it('sends a consent-data INSUFFICIENT or UNKNOWN message', async function () {
        consentData['user_consent'] = 0;
        resData.consentData = consentData;

        const implExtends = function (o2) {
          env.sandbox
            .stub(o2.implementation_, 'getConsentString_')
            .resolves(resConsentString);

          env.sandbox
            .stub(o2.implementation_, 'getConsentPolicyState_')
            .resolves(CONSENT_POLICY_STATE.INSUFFICIENT);

          sendConsentDataToIframe = env.sandbox.spy(
            o2.implementation_,
            'sendConsentDataToIframe_'
          );
        };

        env.sandbox
          .stub(iframeHelper, 'listenFor')
          .callsFake((iframe, message, callback) => {
            expect(message).to.equal(MessageType.SEND_CONSENT_DATA);
            callback('', resSource, resOrigin);
          });

        await getO2player(
          {
            'data-pid': '123',
            'data-bcid': '456',
          },
          null,
          implExtends
        );

        expect(sendConsentDataToIframe).to.have.been.calledWith(
          resSource,
          resOrigin,
          resData
        );
      });

      it('sends a consent-data UNKNOWN_NOT_REQUIRED or default message', async function () {
        consentData = {
          'gdprApplies': false,
        };

        resData.consentData = consentData;

        const implExtends = function (o2) {
          env.sandbox
            .stub(o2.implementation_, 'getConsentString_')
            .resolves(resConsentString);

          env.sandbox
            .stub(o2.implementation_, 'getConsentPolicyState_')
            .resolves(CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED);

          sendConsentDataToIframe = env.sandbox.spy(
            o2.implementation_,
            'sendConsentDataToIframe_'
          );
        };

        env.sandbox
          .stub(iframeHelper, 'listenFor')
          .callsFake((iframe, message, callback) => {
            expect(message).to.equal(MessageType.SEND_CONSENT_DATA);
            callback('', resSource, resOrigin);
          });

        await getO2player(
          {
            'data-pid': '123',
            'data-bcid': '456',
          },
          null,
          implExtends
        );

        expect(sendConsentDataToIframe).to.have.been.calledWith(
          resSource,
          resOrigin,
          resData
        );
      });
    });
  }
);
