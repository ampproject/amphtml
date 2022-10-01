import '../amp-o2-player';
import {MessageType_Enum} from '#core/3p-frame-messaging';
import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';

import * as iframeHelper from '../../../../src/iframe-helper';

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

      const impl = await o2.getImpl(false);

      if (implExtends) {
        implExtends(o2, impl);
      }
      await o2.buildInternal();
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

    it('unlayout and relayout', async () => {
      const o2 = await getO2player({
        'data-pid': '123',
        'data-bcid': '456',
        'data-env': 'stage',
      });
      expect(o2.querySelector('iframe')).to.exist;

      const unlayoutResult = o2.unlayoutCallback();
      expect(unlayoutResult).to.be.true;
      expect(o2.querySelector('iframe')).to.not.exist;

      await o2.layoutCallback();
      expect(o2.querySelector('iframe')).to.exist;
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
        type: MessageType_Enum.CONSENT_DATA,
      };

      it('sends a consent-data CONSENT_POLICY_STATE.SUFFICIENT message', async function () {
        resData.consentData = consentData;

        const implExtends = function (o2, impl) {
          env.sandbox
            .stub(impl, 'getConsentString_')
            .resolves(resConsentString);

          env.sandbox
            .stub(impl, 'getConsentPolicyState_')
            .resolves(CONSENT_POLICY_STATE.SUFFICIENT);

          sendConsentDataToIframe = env.sandbox.spy(
            impl,
            'sendConsentDataToIframe_'
          );
        };

        env.sandbox
          .stub(iframeHelper, 'listenFor')
          .callsFake((iframe, message, callback) => {
            expect(message).to.equal(MessageType_Enum.SEND_CONSENT_DATA);
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

        const implExtends = function (o2, impl) {
          env.sandbox
            .stub(impl, 'getConsentString_')
            .resolves(resConsentString);

          env.sandbox
            .stub(impl, 'getConsentPolicyState_')
            .resolves(CONSENT_POLICY_STATE.INSUFFICIENT);

          sendConsentDataToIframe = env.sandbox.spy(
            impl,
            'sendConsentDataToIframe_'
          );
        };

        env.sandbox
          .stub(iframeHelper, 'listenFor')
          .callsFake((iframe, message, callback) => {
            expect(message).to.equal(MessageType_Enum.SEND_CONSENT_DATA);
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

        const implExtends = function (o2, impl) {
          env.sandbox
            .stub(impl, 'getConsentString_')
            .resolves(resConsentString);

          env.sandbox
            .stub(impl, 'getConsentPolicyState_')
            .resolves(CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED);

          sendConsentDataToIframe = env.sandbox.spy(
            impl,
            'sendConsentDataToIframe_'
          );
        };

        env.sandbox
          .stub(iframeHelper, 'listenFor')
          .callsFake((iframe, message, callback) => {
            expect(message).to.equal(MessageType_Enum.SEND_CONSENT_DATA);
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
