import {getAmpSkimlinksOptions} from '../skim-options';
import helpersFactory from './helpers';

describes.fakeWin(
    'Skim Options',
    {
      amp: {
        extensions: ['amp-skimlinks'],
      },
    },
    env => {
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

          expect(options.excludedDomains).to.include
              .members(['merchant1.com', 'merchant2.com']);
        });

        it('Should exclude internal domains', () => {
          const element = helpers.createAmpSkimlinksElement({
            'publisher-code': '123X123',
          });
          const options = getAmpSkimlinksOptions(element, docInfo);

          expect(options.excludedDomains).to.include.members(
              ['mydomain.com', 'google.co.uk']
          );
        });

        it('Should exclude global domain blacklist', () => {
          const element = helpers.createAmpSkimlinksElement({
            'publisher-code': '123X123',
          });
          const options = getAmpSkimlinksOptions(element, docInfo);
          expect(options.excludedDomains).to.include
              .members(['go.redirectingat.com', 'go.skimresources.com']);
        });


        it('Should not overwrite internal & global blacklist when using option',
            () => {
              const element = helpers.createAmpSkimlinksElement({
                'publisher-code': '123X123',
                'excluded-domains': 'www.merchant1.com',
              });
              const options = getAmpSkimlinksOptions(element, docInfo);
              expect(options.excludedDomains).to.include.members([
                'merchant1.com', // from skim-option
                'mydomain.com', // from internal domains
                'go.redirectingat.com', // from global blacklist
              ]);
            }
        );
      });
    }
);
