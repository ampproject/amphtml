import {
  CONSENT_POLICY_STATE,
  CONSENT_STRING_TYPE,
} from '#core/constants/consent-state';

import {Services} from '#service';

import {AmpAd} from '../../../amp-ad/0.1/amp-ad'; // eslint-disable-line @typescript-eslint/no-unused-vars
import {AmpAdNetworkMgidImpl} from '../amp-ad-network-mgid-impl';

describes.realWin(
  'amp-ad-network-mgid-impl',
  {
    amp: {
      extensions: ['amp-ad', 'amp-ad-network-mgid-impl'],
    },
  },
  (env) => {
    let doc;
    let win;
    let mgidImplElem;
    beforeEach(() => {
      win = env.win;
      doc = win.document;
      mgidImplElem = doc.createElement('amp-ad');
      mgidImplElem.setAttribute('type', 'mgid');
      mgidImplElem.setAttribute('layout', 'fixed');
      mgidImplElem.setAttribute('width', '300');
      mgidImplElem.setAttribute('height', '250');

      env.win.document.body.appendChild(mgidImplElem);
    });

    it('should check for data-widget attribute', () => {
      const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
      expect(mgidImpl.isValidElement()).to.be.false;

      mgidImplElem.setAttribute('data-widget', '100');
      const mgidImpl2 = new AmpAdNetworkMgidImpl(mgidImplElem);
      expect(mgidImpl2.isValidElement()).to.be.true;
    });

    it('generates correct adUrl', () => {
      mgidImplElem.setAttribute('data-widget', '100');

      const viewer = Services.viewerForDoc(mgidImplElem);
      env.sandbox
        .stub(viewer, 'getReferrerUrl')
        .returns(Promise.resolve('http://fake.example/?foo=bar'));

      const documentInfo = Services.documentInfoForDoc(mgidImplElem);
      documentInfo.canonicalUrl = 'http://canonical.example/?abc=xyz';

      const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);

      return mgidImpl.getAdUrl().then((url) => {
        [
          /^https:\/\/servicer\.mgid\.com\/100\/1/,
          /(\?|&)niet=(slow-2g|2g|3g|4g)(&|$)/,
          /(\?|&)nisd=(0|1)(&|$)/,
          /(\?|&)cbuster=\d+(&|$)/,
          /(\?|&)dpr=\d+(&|$)/,
          /(\?|&)cxurl=http%3A%2F%2Fcanonical.example%2F%3Fabc%3Dxyz(&|$)/,
          /(\?|&)pr=fake.example(&|$)/,
          /(\?|&)pvid=[a-zA-Z0-9\-_]+(&|$)/,
          /(\?|&)muid=amp-[a-zA-Z0-9\-_]+(&|$)/,
          /(\?|&)implVersion=15(&|$)/,
        ].forEach((regexp) => {
          expect(url).to.match(regexp);
        });
      });
    });

    describe('consent handling', () => {
      let setupMocks;

      beforeEach(() => {
        mgidImplElem.setAttribute('data-widget', '100');
        setupMocks = () => {
          const viewer = Services.viewerForDoc(mgidImplElem);
          env.sandbox
            .stub(viewer, 'getReferrerUrl')
            .returns(Promise.resolve('http://fake.example/?foo=bar'));

          const documentInfo = Services.documentInfoForDoc(mgidImplElem);
          documentInfo.canonicalUrl = 'http://canonical.example/?abc=xyz';
          env.sandbox
            .stub(documentInfo, 'pageViewId64')
            .returns(Promise.resolve('test-pvid-123'));
        };
      });

      it('should not add consent params when consentTuple is undefined', () => {
        setupMocks();
        const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);

        return mgidImpl.getAdUrl().then((url) => {
          expect(url).to.not.match(/gdpr=/);
          expect(url).to.not.match(/gdpr_consent=/);
          expect(url).to.not.match(/us_privacy=/);
          expect(url).to.not.match(/gpp=/);
        });
      });

      it('should not add consent params when consentTuple is null', () => {
        setupMocks();
        const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);

        return mgidImpl.getAdUrl(null).then((url) => {
          expect(url).to.not.match(/gdpr=/);
          expect(url).to.not.match(/gdpr_consent=/);
          expect(url).to.not.match(/us_privacy=/);
          expect(url).to.not.match(/gpp=/);
        });
      });

      describe('TCF_V1 consent', () => {
        it('should add gdpr=1 and gdpr_consent when gdprApplies is true', () => {
          setupMocks();
          const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
          const consentTuple = {
            consentState: CONSENT_POLICY_STATE.SUFFICIENT,
            consentString: 'test-consent-string-v1',
            consentStringType: CONSENT_STRING_TYPE.TCF_V1,
            gdprApplies: true,
          };

          return mgidImpl.getAdUrl(consentTuple).then((url) => {
            expect(url).to.match(/(\?|&)gdpr=1(&|$)/);
            expect(url).to.match(
              /(\?|&)gdpr_consent=test-consent-string-v1(&|$)/
            );
          });
        });

        it('should add gdpr=0 and gdpr_consent when gdprApplies is false', () => {
          setupMocks();
          const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
          const consentTuple = {
            consentState: CONSENT_POLICY_STATE.SUFFICIENT,
            consentString: 'test-consent-string-v1',
            consentStringType: CONSENT_STRING_TYPE.TCF_V1,
            gdprApplies: false,
          };

          return mgidImpl.getAdUrl(consentTuple).then((url) => {
            expect(url).to.match(/(\?|&)gdpr=0(&|$)/);
            expect(url).to.match(
              /(\?|&)gdpr_consent=test-consent-string-v1(&|$)/
            );
          });
        });

        it('should add gdpr but not gdpr_consent when consentString is missing', () => {
          setupMocks();
          const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
          const consentTuple = {
            consentState: CONSENT_POLICY_STATE.SUFFICIENT,
            consentStringType: CONSENT_STRING_TYPE.TCF_V1,
            gdprApplies: true,
          };

          return mgidImpl.getAdUrl(consentTuple).then((url) => {
            expect(url).to.match(/(\?|&)gdpr=1(&|$)/);
            expect(url).to.not.match(/gdpr_consent=/);
          });
        });
      });

      describe('TCF_V2 consent', () => {
        it('should add gdpr=1 and gdpr_consent when gdprApplies is true', () => {
          setupMocks();
          const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
          const consentTuple = {
            consentState: CONSENT_POLICY_STATE.SUFFICIENT,
            consentString: 'test-consent-string-v2',
            consentStringType: CONSENT_STRING_TYPE.TCF_V2,
            gdprApplies: true,
          };

          return mgidImpl.getAdUrl(consentTuple).then((url) => {
            expect(url).to.match(/(\?|&)gdpr=1(&|$)/);
            expect(url).to.match(
              /(\?|&)gdpr_consent=test-consent-string-v2(&|$)/
            );
          });
        });

        it('should add gdpr=0 and gdpr_consent when gdprApplies is false', () => {
          setupMocks();
          const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
          const consentTuple = {
            consentState: CONSENT_POLICY_STATE.SUFFICIENT,
            consentString: 'test-consent-string-v2',
            consentStringType: CONSENT_STRING_TYPE.TCF_V2,
            gdprApplies: false,
          };

          return mgidImpl.getAdUrl(consentTuple).then((url) => {
            expect(url).to.match(/(\?|&)gdpr=0(&|$)/);
            expect(url).to.match(
              /(\?|&)gdpr_consent=test-consent-string-v2(&|$)/
            );
          });
        });
      });

      describe('US_PRIVACY_STRING consent', () => {
        it('should add us_privacy parameter when consentString is present', () => {
          setupMocks();
          const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
          const consentTuple = {
            consentState: CONSENT_POLICY_STATE.SUFFICIENT,
            consentString: '1YNN',
            consentStringType: CONSENT_STRING_TYPE.US_PRIVACY_STRING,
          };

          return mgidImpl.getAdUrl(consentTuple).then((url) => {
            expect(url).to.match(/(\?|&)us_privacy=1YNN(&|$)/);
          });
        });

        it('should not add us_privacy parameter when consentString is missing', () => {
          setupMocks();
          const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
          const consentTuple = {
            consentState: CONSENT_POLICY_STATE.SUFFICIENT,
            consentStringType: CONSENT_STRING_TYPE.US_PRIVACY_STRING,
          };

          return mgidImpl.getAdUrl(consentTuple).then((url) => {
            expect(url).to.not.match(/us_privacy=/);
          });
        });
      });

      describe('GLOBAL_PRIVACY_PLATFORM consent', () => {
        it('should add gpp and gpp_sid parameters when consentString is present', () => {
          setupMocks();
          const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
          const consentTuple = {
            consentState: CONSENT_POLICY_STATE.SUFFICIENT,
            consentString: 'test-gpp-string',
            consentStringType: CONSENT_STRING_TYPE.GLOBAL_PRIVACY_PLATFORM,
            gppSectionId: '2',
          };

          return mgidImpl.getAdUrl(consentTuple).then((url) => {
            expect(url).to.match(/(\?|&)gpp=test-gpp-string(&|$)/);
            expect(url).to.match(/(\?|&)gpp_sid=2(&|$)/);
          });
        });

        it('should not add gpp parameters when consentString is missing', () => {
          setupMocks();
          const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
          const consentTuple = {
            consentState: CONSENT_POLICY_STATE.SUFFICIENT,
            consentStringType: CONSENT_STRING_TYPE.GLOBAL_PRIVACY_PLATFORM,
            gppSectionId: '2',
          };

          return mgidImpl.getAdUrl(consentTuple).then((url) => {
            expect(url).to.not.match(/gpp=/);
            expect(url).to.not.match(/gpp_sid=/);
          });
        });
      });

      describe('UNKNOWN consent state', () => {
        it('should not add consent params when state is UNKNOWN and data-npa-on-unknown-consent is not set', () => {
          setupMocks();
          const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
          const consentTuple = {
            consentState: CONSENT_POLICY_STATE.UNKNOWN,
            consentString: 'test-consent-string',
            consentStringType: CONSENT_STRING_TYPE.TCF_V2,
            gdprApplies: true,
          };

          return mgidImpl.getAdUrl(consentTuple).then((url) => {
            expect(url).to.not.match(/gdpr=/);
            expect(url).to.not.match(/gdpr_consent=/);
          });
        });

        it('should add consent params when state is UNKNOWN and data-npa-on-unknown-consent is true', () => {
          mgidImplElem.setAttribute('data-npa-on-unknown-consent', 'true');
          setupMocks();
          const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
          const consentTuple = {
            consentState: CONSENT_POLICY_STATE.UNKNOWN,
            consentString: 'test-consent-string',
            consentStringType: CONSENT_STRING_TYPE.TCF_V2,
            gdprApplies: true,
          };

          return mgidImpl.getAdUrl(consentTuple).then((url) => {
            expect(url).to.match(/(\?|&)gdpr=1(&|$)/);
            expect(url).to.match(/(\?|&)gdpr_consent=test-consent-string(&|$)/);
          });
        });
      });

      describe('SUFFICIENT consent state', () => {
        it('should add consent params for SUFFICIENT state', () => {
          setupMocks();
          const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
          const consentTuple = {
            consentState: CONSENT_POLICY_STATE.SUFFICIENT,
            consentString: 'test-consent-string',
            consentStringType: CONSENT_STRING_TYPE.TCF_V2,
            gdprApplies: true,
          };

          return mgidImpl.getAdUrl(consentTuple).then((url) => {
            expect(url).to.match(/(\?|&)gdpr=1(&|$)/);
            expect(url).to.match(/(\?|&)gdpr_consent=test-consent-string(&|$)/);
          });
        });
      });
    });
  }
);
