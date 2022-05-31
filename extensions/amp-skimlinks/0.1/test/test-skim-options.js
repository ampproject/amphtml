import helpersFactory from './helpers';

import {WAYPOINT_BASE_URL} from '../constants';
import {getAmpSkimlinksOptions} from '../skim-options';

describes.fakeWin(
  'Skim Options',
  {
    amp: {
      extensions: ['amp-skimlinks'],
    },
  },
  (env) => {
    let helpers;
    let docInfo;
    beforeEach(() => {
      helpers = helpersFactory(env);
    });

    beforeEach(() => {
      docInfo = {
        canonicalUrl: 'https://mydomain.com/test',
        sourceUrl: 'https://www.google.co.uk',
      };
    });

    afterEach(() => {
      env.sandbox.restore();
    });

    describe('excluded-domains', () => {
      it('Should exclude domains specified in the option', () => {
        const element = helpers.createAmpSkimlinksElement({
          'publisher-code': '123X123',
          'excluded-domains': ' www.merchant1.com   merchant2.com  ',
        });
        const options = getAmpSkimlinksOptions(element, docInfo);

        expect(options.excludedDomains).to.include.members([
          'merchant1.com',
          'merchant2.com',
        ]);
      });

      it('Should exclude internal domains', () => {
        const element = helpers.createAmpSkimlinksElement({
          'publisher-code': '123X123',
        });
        const options = getAmpSkimlinksOptions(element, docInfo);

        expect(options.excludedDomains).to.include.members([
          'mydomain.com',
          'google.co.uk',
        ]);
      });

      it('Should exclude global domain denylist', () => {
        const element = helpers.createAmpSkimlinksElement({
          'publisher-code': '123X123',
        });
        const options = getAmpSkimlinksOptions(element, docInfo);
        expect(options.excludedDomains).to.include.members([
          'go.redirectingat.com',
          'go.skimresources.com',
        ]);
      });

      it('Should not overwrite internal & global denylist when using option', () => {
        const element = helpers.createAmpSkimlinksElement({
          'publisher-code': '123X123',
          'excluded-domains': 'www.merchant1.com',
        });
        const options = getAmpSkimlinksOptions(element, docInfo);
        expect(options.excludedDomains).to.include.members([
          'merchant1.com', // from skim-option
          'mydomain.com', // from internal domains
          'go.redirectingat.com', // from global denylist
        ]);
      });
    });

    describe('custom-redirect-domain', () => {
      const cname = 'go.publisher.com';

      it('Should return normal waypoint base url if not defined', () => {
        const element = helpers.createAmpSkimlinksElement({
          'publisher-code': '123X123',
        });
        const options = getAmpSkimlinksOptions(element, docInfo);
        expect(options.waypointBaseUrl).to.equal(WAYPOINT_BASE_URL);
      });

      it('Should overwrite waypoint base url if defined', () => {
        const element = helpers.createAmpSkimlinksElement({
          'publisher-code': '123X123',
          'custom-redirect-domain': cname,
        });
        const options = getAmpSkimlinksOptions(element, docInfo);
        expect(options.waypointBaseUrl).to.equal(`http://${cname}`);
      });

      it('Should accept redirect domain containing the protocol', () => {
        const element = helpers.createAmpSkimlinksElement({
          'publisher-code': '123X123',
          'custom-redirect-domain': `http://${cname}`,
        });
        const options = getAmpSkimlinksOptions(element, docInfo);
        expect(options.waypointBaseUrl).to.equal(`http://${cname}`);
      });

      it('Should force custom redirect base url to use http', () => {
        const element = helpers.createAmpSkimlinksElement({
          'publisher-code': '123X123',
          'custom-redirect-domain': `https://${cname}`,
        });
        const options = getAmpSkimlinksOptions(element, docInfo);
        expect(options.waypointBaseUrl).to.equal(`http://${cname}`);
      });

      it('Should remove trailing slash', () => {
        const element = helpers.createAmpSkimlinksElement({
          'publisher-code': '123X123',
          'custom-redirect-domain': `https://${cname}/`,
        });
        const options = getAmpSkimlinksOptions(element, docInfo);
        expect(options.waypointBaseUrl).to.equal(`http://${cname}`);
      });
    });
  }
);
