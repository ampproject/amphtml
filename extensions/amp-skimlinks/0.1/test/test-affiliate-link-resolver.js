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

import {
  AFFILIATE_STATUS,
  AffiliateLinkResolver,
} from '../affiliate-link-resolver';
import {DEFAULT_CONFIG} from '../constants';
import {DEFAULT_SKIM_OPTIONS, pubcode} from './constants';
import {Services} from '../../../../src/services';
import {Waypoint} from '../waypoint';
import helpersFactory from './helpers';

const DOMAIN_RESOLVER_API_URL = DEFAULT_CONFIG.beaconUrl;

describes.fakeWin(
    'AffiliateLinkResolver',
    {
      amp: {
        extensions: ['amp-skimlinks'],
      },
    },
    env => {
      let win;
      let xhr;
      let helpers;
      let trackingService;
      let waypoint;

      beforeEach(() => {
        win = env.win;
        xhr = Services.xhrFor(win);
        helpers = helpersFactory(env);
      });

      beforeEach(() => {
        trackingService = helpers.createTrackingWithStubAnalytics();
        waypoint = new Waypoint(
            env.ampdoc,
            DEFAULT_SKIM_OPTIONS,
            trackingService,
            'referrer'
        );
      });

      afterEach(() => {
        env.sandbox.restore();
      });

      describe('resolveUnknownAnchors', () => {
        const alreadyResolvedDomains = {
          'merchant1.com': AFFILIATE_STATUS.AFFILIATE,
          'non-merchant.com': AFFILIATE_STATUS.NON_AFFILIATE,
          'merchant2.com': AFFILIATE_STATUS.AFFILIATE,
        };
        let resolver;
        let anchorList;
        let mock;

        beforeEach(() => {
          anchorList = [
            'http://merchant1.com',
            'http://non-merchant.com',
            'https://merchant2.com',
          ].map(helpers.createAnchor);
        });

        describe('When calling "fetchDomainResolverApi"', () => {
          beforeEach(() => {
            resolver = new AffiliateLinkResolver(
                {},
                {excludedDomains: ['excluded-merchant.com']},
                waypoint
            );

            anchorList = [
              'http://merchant1.com',
              'http://non-merchant.com',
              'https://merchant2.com',
            ].map(helpers.createAnchor);
            mock = env.sandbox.mock(resolver);
          });

          afterEach(() => {
            mock.verify();
          });

          it('Should ask for all the domains the first time.', () => {
            mock
                .expects('fetchDomainResolverApi')
                .once()
                .withArgs(
                    ['merchant1.com', 'non-merchant.com', 'merchant2.com']
                )
                .returns(Promise.resolve({}));

            resolver.resolveUnknownAnchors(anchorList);
          });

          it('Should make the list of requested domains unique', () => {
            anchorList = [helpers.createAnchor('https://merchant1.com')].concat(
                anchorList
            );
            mock
                .expects('fetchDomainResolverApi')
                .once()
                .withArgs(
                    ['merchant1.com', 'non-merchant.com', 'merchant2.com']
                )
                .returns(Promise.resolve({}));

            resolver.resolveUnknownAnchors(anchorList);
          });

          it('Should only ask for new domains the next times', () => {
          // Set the domains like if we had already done a call to the API.
            resolver.domains_ = alreadyResolvedDomains;

            mock
                .expects('fetchDomainResolverApi')
                .once()
                .withArgs(['non-merchant-new.com', 'merchant-new'])
                .returns(Promise.resolve({}));

            resolver.resolveUnknownAnchors(
                [
                  helpers.createAnchor('http://non-merchant-new.com'),
                  helpers.createAnchor('//merchant-new'),
                ].concat(anchorList)
            );
          });

          it('Should not ask for any domains when no new domains', () => {
          // Set the domains like if we had already done a call to the API.
            resolver.domains_ = alreadyResolvedDomains;

            mock.expects('fetchDomainResolverApi').never();

            resolver.resolveUnknownAnchors(anchorList);
          });

          it('Should not ask for domains when no links on the page', () => {
            mock.expects('fetchDomainResolverApi').never();

            resolver.resolveUnknownAnchors([]);
          });

          it('Should not send excluded domains', () => {
            mock
                .expects('fetchDomainResolverApi')
                .once()
                .withArgs(
                    ['merchant1.com', 'non-merchant.com', 'merchant2.com']
                )
                .returns(Promise.resolve({}));

            resolver.resolveUnknownAnchors(
                [helpers.createAnchor('https://www.excluded-merchant.com')].concat(
                    anchorList
                )
            );
          });

          it('Should not send already requested domains when pending request',
              () => {
                // Simulate pending request with unresolved Promise.
                // fetch should be called only once!
                mock
                    .expects('fetchDomainResolverApi')
                    .once()
                    .returns(new Promise(() => {}));
                const response = resolver.resolveUnknownAnchors(anchorList);

                let requestIsPending = true;

                // First request
                response.asyncResponse.then(() => {
                  requestIsPending = false;
                });

                expect(requestIsPending).to.be.true;
                // Second request, first request should still be pending.
                resolver.resolveUnknownAnchors(anchorList);
                expect(requestIsPending).to.be.true;
                expect(resolver.domains_).to.deep.equal({
                  'merchant1.com': AFFILIATE_STATUS.UNKNOWN,
                  'non-merchant.com': AFFILIATE_STATUS.UNKNOWN,
                  'merchant2.com': AFFILIATE_STATUS.UNKNOWN,
                });
              });
        });

        describe('Does correct request to domain resolver API', () => {
          beforeEach(() => {
            mock = env.sandbox.mock(xhr);
            resolver = new AffiliateLinkResolver(
                xhr,
                DEFAULT_SKIM_OPTIONS,
                waypoint
            );
          });

          afterEach(() => {
            mock.verify();
          });

          it('Should call the correct url', () => {
            const domains = ['domain1.com', 'domain2.com'];
            const expectedData = {
              pubcode,
              page: '',
              domains,
            };

            const url = `${DOMAIN_RESOLVER_API_URL}?data=${JSON.stringify(
                expectedData
            )}`;
            const response = {
              json: () => Promise.resolve({}),
            };

            mock
                .expects('fetchJson')
                .once()
                .withArgs(url)
                .returns(Promise.resolve(response));

            resolver.fetchDomainResolverApi(domains);
          });

          it('Should use the corret fetch options', () => {
            const domains = ['domain1.com', 'domain2.com'];
            const expectedData = {
              pubcode,
              page: '',
              domains,
            };

            const url = `${DOMAIN_RESOLVER_API_URL}?data=${JSON.stringify(
                expectedData
            )}`;
            const fetchOptions = {
              method: 'GET',
              // Disabled AMP CORS
              ampCors: false,
              // Allow beacon API to set cookies
              credentials: 'include',
            };
            const response = {
              json: () => Promise.resolve({}),
            };

            mock
                .expects('fetchJson')
                .once()
            // Ideally only focused on fetchOptions but using sinon.match.any
            // as the first arg makes the test fail for some reasons.
                .withArgs(url, fetchOptions)
                .returns(Promise.resolve(response));

            resolver.fetchDomainResolverApi(domains);
          });
        });

        describe('Returns the correct data', () => {
          function createAnchorReplacementObject(anchor, replacementUrl) {
            return {anchor, replacementUrl};
          }

          beforeEach(() => {
            const stubXhr = helpers.createStubXhr({
              'merchant_domains': ['merchant1.com', 'merchant2.com'],
            });
            const skimOptions = Object.assign({},
                DEFAULT_SKIM_OPTIONS,
                {excludedDomains: ['excluded-merchant.com']}
            );

            resolver = new AffiliateLinkResolver(
                stubXhr,
                skimOptions,
                waypoint
            );
          });

          it('Should return an object with sync and async response', () => {
            const twoStepsResponse = resolver.resolveUnknownAnchors([]);
            expect(twoStepsResponse).to.have.all.keys(
                'syncResponse',
                'asyncResponse'
            );
          });

          it('Should affiliate unknown links until the API gives an answer',
              () => {
                const twoStepsResponse = resolver.resolveUnknownAnchors(
                    anchorList);
                // Replace all the unknown in the synchronous reponse,
                // asynchronous response will then overwrite it later.
                const expectedSyncData = anchorList.map(a => {
                  return createAnchorReplacementObject(
                      a,
                      waypoint.getAffiliateUrl(a)
                  );
                });

                expect(twoStepsResponse.syncResponse).to.deep.equal(
                    expectedSyncData
                );
              }
          );

          it('Should set "asyncResponse" field when only unknown domains',
              () => {
                const response = resolver.resolveUnknownAnchors(anchorList);
                const expectedAsyncData = [
                  createAnchorReplacementObject(
                      anchorList[0],
                      waypoint.getAffiliateUrl(anchorList[0])
                  ),
                  createAnchorReplacementObject(anchorList[1], null),
                  createAnchorReplacementObject(
                      anchorList[2],
                      waypoint.getAffiliateUrl(anchorList[2])
                  ),
                ];

                expect(response.asyncResponse).to.be.an.instanceof(Promise);
                return response.asyncResponse.then(anchorReplacementTuple => {
                  expect(anchorReplacementTuple).to.deep.equal(
                      expectedAsyncData);
                });
              }
          );

          it('Should only set the "asyncResponse" field when no new domains',
              () => {
                resolver.domains_ = alreadyResolvedDomains;
                const response = resolver.resolveUnknownAnchors(anchorList);
                const expectedSyncData = [
                  createAnchorReplacementObject(
                      anchorList[0],
                      waypoint.getAffiliateUrl(anchorList[0])
                  ),
                  createAnchorReplacementObject(anchorList[1], null),
                  createAnchorReplacementObject(
                      anchorList[2],
                      waypoint.getAffiliateUrl(anchorList[2])
                  ),
                ];
                expect(response.syncResponse).to.deep.equal(expectedSyncData);
                expect(response.asyncResponse).to.be.null;
              }
          );

          it('Should not replace excluded domains', () => {
            const excludedAnchor = helpers.createAnchor(
                'https://www.excluded-merchant.com'
            );
            const response = resolver.resolveUnknownAnchors([excludedAnchor]);

            const expectedSyncData = [
              createAnchorReplacementObject(excludedAnchor, null),
            ];

            expect(response.syncResponse).to.deep.equal(expectedSyncData);
            expect(response.asyncResponse).to.be.null;
          });

          it('Should only return the "pending" anchors in the asyncResponse',
              () => {
                const initialAnchor = helpers.createAnchor(
                    'https://initial-merchant.com'
                );
                resolver.domains_ = {
                  'initial-merchant.com': AFFILIATE_STATUS.AFFILIATE,
                };
                // Initial anchor should not be in the asyncResponse list
                const expectedAsyncData = [
                  createAnchorReplacementObject(
                      anchorList[0],
                      waypoint.getAffiliateUrl(anchorList[0])
                  ),
                  createAnchorReplacementObject(anchorList[1], null),
                  createAnchorReplacementObject(
                      anchorList[2],
                      waypoint.getAffiliateUrl(anchorList[2])
                  ),
                ];

                const response = resolver.resolveUnknownAnchors(
                    [initialAnchor].concat(anchorList)
                );

                expect(response.syncResponse.length).to.equal(4);
                expect(response.syncResponse).to.deep.include(
                    createAnchorReplacementObject(
                        initialAnchor,
                        waypoint.getAffiliateUrl(initialAnchor)
                    )
                );
                expect(response.asyncResponse).to.be.an.instanceof(Promise);
                return response.asyncResponse.then(anchorReplacementTuple => {
                  expect(anchorReplacementTuple).to.deep.equal(
                      expectedAsyncData);
                });
              }
          );
        });

        describe('getAnchorDomain_', () => {
          const resolver = new AffiliateLinkResolver(
              {},
              DEFAULT_SKIM_OPTIONS,
              waypoint
          );

          it('Removes  http protocol', () => {
            const anchor = helpers.createAnchor('http://test.com');
            expect(resolver.getAnchorDomain_(anchor)).to.equal('test.com');
          });

          it('removes // protocol', () => {
            const anchor = helpers.createAnchor('//test.com/');
            expect(resolver.getAnchorDomain_(anchor)).to.equal('test.com');
          });

          it('Removes www.', () => {
            const anchor = helpers.createAnchor('http://www.test.com');
            expect(resolver.getAnchorDomain_(anchor)).to.equal('test.com');
          });

          it('Removes the path and query params', () => {
            const anchor = helpers.createAnchor(
                'http://www.test.com/hello-word?test=1'
            );
            expect(resolver.getAnchorDomain_(anchor)).to.equal('test.com');
          });
        });
      });
    }
);
