/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
