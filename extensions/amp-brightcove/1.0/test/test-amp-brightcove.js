import * as consent from '../../../../src/consent';
import '../amp-brightcove';
import {toggleExperiment} from '#experiments';
import {waitFor} from '#testing/helpers/service';
import {createElementWithAttributes} from '#core/dom';
import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';

describes.realWin(
  'amp-brightcove-v1.0',
  {
    amp: {
      extensions: ['amp-brightcove:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;

    const waitForRender = async (element) => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    async function getBrightcove(attributes) {
      const element = createElementWithAttributes(doc, 'amp-brightcove', {
        width: '200',
        height: '100',
        ...attributes,
      });

      doc.body.appendChild(element);
      await waitForRender(element);
      return element;
    }

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'bento-brightcove', true, true);
    });

    it('should propagate consent state to iframe', async () => {
      env.sandbox
        .stub(consent, 'getConsentPolicyState')
        .resolves(CONSENT_POLICY_STATE.SUFFICIENT);
      env.sandbox
        .stub(consent, 'getConsentPolicySharedData')
        .resolves({a: 1, b: 2});
      env.sandbox.stub(consent, 'getConsentPolicyInfo').resolves('aelement');

      const element = await getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
        'data-block-on-consent': '_till_accepted',
      });
      const iframe = element.shadowRoot.querySelector('iframe');

      expect(iframe.src).to.contain(
        `ampInitialConsentState=${CONSENT_POLICY_STATE.SUFFICIENT}`
      );
      expect(iframe.src).to.contain(
        `ampConsentSharedData=${encodeURIComponent(
          JSON.stringify({a: 1, b: 2})
        )}`
      );
      expect(iframe.src).to.contain('ampInitialConsentValue=aelement');
    });
  }
);
