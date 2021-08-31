// These two are required for reasons internal to AMP
import '../../../amp-ad/0.1/amp-ad-ui';
import '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {createElementWithAttributes} from 'src/core/dom';

import {AmpAdNetworkDianomiImpl} from '../amp-ad-network-dianomi-impl';

describes.fakeWin('amp-ad-network-dianomi-impl', {amp: true}, (env) => {
  let win, doc, element, impl;

  beforeEach(() => {
    win = env.win;
    win.__AMP_MODE = {test: false};
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
  });
});
