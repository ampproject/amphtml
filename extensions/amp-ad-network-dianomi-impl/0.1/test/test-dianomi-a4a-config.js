// These two are required for reasons internal to AMP
import '../../../amp-ad/0.1/amp-ad-ui';
import '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {expect} from 'chai';

import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';

import {createElementWithAttributes} from 'src/core/dom';

import {AmpAdNetworkDianomiImpl} from '../amp-ad-network-dianomi-impl';

describes.fakeWin('amp-ad-network-dianomi-impl', {amp: true}, (env) => {
  let win, doc, element, impl;

  beforeEach(() => {
    win = env.win;
    win.__AMP_MODE = {localDev: false};
    doc = win.document;
    element = createElementWithAttributes(doc, 'amp-ad', {
      'type': 'dianomi',
    });
    doc.body.appendChild(element);
    impl = new AmpAdNetworkDianomiImpl(element);
  });

  describe('#getAdUrl', () => {
    it('should be valid', () => {
      const requestParamId = '5519';
      element.setAttribute('data-request-param-id', requestParamId);
      element.setAttribute('data-dianomi-env', 'live');
      element.setAttribute('data-dianomi-type', 'smartads');
      expect(impl.getAdUrl()).to.equal(
        `https://www.dianomi.com/smartads.pl?format=a4a&id=${requestParamId}`
      );
    });

    it('should throw an error when requestParamId is empty', () => {
      element.setAttribute('data-request-param-id', '');
      allowConsoleError(() => {
        expect(() => impl.getAdUrl()).to.throw(
          'The Dianomi request parameter ID provided is invalid'
        );
      });
    });

    it('should throw an error if an incorrect request param id', () => {
      const requestParamId = '145a2';
      element.setAttribute('data-request-param-id', requestParamId);
      allowConsoleError(() => {
        expect(() => impl.getAdUrl()).to.throw(
          'The Dianomi request parameter ID provided is invalid'
        );
      });
    });

    it('should throw an error if provided an incorrect dianomi-type param', () => {
      const requestParamId = '1452';
      element.setAttribute('data-request-param-id', requestParamId);
      element.setAttribute('data-dianomi-type', 'wrongType');
      allowConsoleError(() => {
        expect(() => impl.getAdUrl()).to.throw(
          `The Dianomi type parameter 'wrongtype' is not a valid input`
        );
      });
    });

    it('should throw an error if provided an incorrect dianomi-env param', () => {
      const requestParamId = '1452';
      element.setAttribute('data-request-param-id', requestParamId);
      element.setAttribute('data-dianomi-env', 'wrongEnv');
      allowConsoleError(() => {
        expect(() => impl.getAdUrl()).to.throw(
          `The Dianomi env parameter 'wrongenv' is not a valid input`
        );
      });
    });

    it('should return an empty string if unknown consentState', () => {
      expect(
        impl.getAdUrl({consentState: CONSENT_POLICY_STATE.UNKNOWN})
      ).to.equal('');
    });

    it('should include consentString on URL if provided', () => {
      const requestParamId = '5519';
      element.setAttribute('data-request-param-id', requestParamId);
      expect(impl.getAdUrl({consentString: 'tcstring'})).to.match(
        /(\?|&)consentString=tcstring(&|$)/
      );
    });

    it('should include additionalConsent if available', () => {
      const requestParamId = '5519';
      element.setAttribute('data-request-param-id', requestParamId);
      expect(impl.getAdUrl({additionalConsent: '1234abc'})).to.match(
        /(\?|&)additionalConsent=1234abc(&|$)/
      );
    });
  });
});
