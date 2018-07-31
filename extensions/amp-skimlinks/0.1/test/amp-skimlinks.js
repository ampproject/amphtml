
import {Services} from '../../../../src/services';

import {AnchorRewriteDataResponse,createAnchorReplacementTuple} from '../../../../src/service/link-rewrite/link-rewrite-classes';
import AffiliateLinkResolver, {DOMAIN_RESOLVER_URL, LINK_STATUS__AFFILIATE, LINK_STATUS__NON_AFFILIATE, LINK_STATUS__UNKNOWN} from '../affiliate-link-resolver';

describes.realWin('amp-skimlinks', {
  amp: {
    extensions: ['amp-skimlinks'],
  },
}, env => {
  let win, ampdoc, document, xhr;
  // let xhrMock;

  function createAnchor(href) {
    const anchor = document.createElement('a');
    anchor.href = href;

    return anchor;
  }


  beforeEach(() => {
    win = env.win;
    document = win.document;
    ampdoc = env.ampdoc;
    xhr = Services.xhrFor(win);
  });

  afterEach(() => {
    env.sandbox.restore();
  });


  // it('Runs one test', () => {
  //   expect(true).to.be.true;
  // });

  // function mockXhrResponse(url, response) {
  //   xhrMock
  //     .expects('fetchJson')
  //     .returns(Promise.resolve({
  //       json() {
  //         return Promise.resolve(response);
  //       },
  //     }));
  // }

  function createStubXhr(xhr, data) {
    const response = {
      json: () => {return Promise.resolve(data);},
    };

    return {
      fetchJson: env.sandbox.stub().returns(Promise.resolve(response)),
    };
  }

  describe('skimOptions', () => {
    it('Should always exclude internal domains', () => {

    });
  });

  describe('AffiliateLinkResolver', () => {

    describe('resolveUnknownAnchors', () => {
      const alreadyResolvedDomains = {
        'merchant1.com': LINK_STATUS__AFFILIATE,
        'non-merchant.com': LINK_STATUS__NON_AFFILIATE,
        'merchant2.com': LINK_STATUS__AFFILIATE,
      };
      let resolver;
      let anchorList;
      let mock;

      beforeEach(() => {
        anchorList = [
          'http://merchant1.com',
          'http://non-merchant.com',
          'https://merchant2.com',
        ].map(createAnchor);
      });


      describe('Calls "fetchDomainResolverApi" function with the right domains', () => {
        beforeEach(() => {
          resolver = new AffiliateLinkResolver({}, {
            excludedDomains: ['excluded-merchant.com'],
          }, () => {});

          anchorList = [
            'http://merchant1.com',
            'http://non-merchant.com',
            'https://merchant2.com',
          ].map(createAnchor);
          mock = env.sandbox.mock(resolver);
        });

        afterEach(() => {
          mock.verify();
        });

        it('Should ask for all the domains the first time.', () => {
          mock.expects('fetchDomainResolverApi').once().withArgs([
            'merchant1.com',
            'non-merchant.com',
            'merchant2.com',
          ]).returns(Promise.resolve({}));

          resolver.resolveUnknownAnchors(anchorList);
        });

        it('Should make the list of requested domains unique', () => {
          anchorList = [createAnchor('https://merchant1.com')].concat(anchorList);
          mock.expects('fetchDomainResolverApi').once().withArgs([
            'merchant1.com',
            'non-merchant.com',
            'merchant2.com',
          ]).returns(Promise.resolve({}));


          resolver.resolveUnknownAnchors(anchorList);
        });

        it('Should only ask for new domains the next times', () => {
          // Set the domains like if we had already done a call to the API.
          resolver.domains_ = alreadyResolvedDomains;

          mock.expects('fetchDomainResolverApi').once().withArgs([
            'non-merchant-new.com',
            'merchant-new',
          ]).returns(Promise.resolve({}));

          resolver.resolveUnknownAnchors([
            createAnchor('http://non-merchant-new.com'),
            createAnchor('//merchant-new'),
          ].concat(anchorList));
        });


        it('Should not ask for any domains if there are no new domains', () => {
          // Set the domains like if we had already done a call to the API.
          resolver.domains_ = alreadyResolvedDomains;

          mock.expects('fetchDomainResolverApi').never();

          resolver.resolveUnknownAnchors(anchorList);
        });

        it('Should not ask for domains if there are no links on the page', () => {
          mock.expects('fetchDomainResolverApi').never();

          resolver.resolveUnknownAnchors([]);
        });

        it('Should not send excluded domains', () => {
          mock.expects('fetchDomainResolverApi').once().withArgs([
            'merchant1.com',
            'non-merchant.com',
            'merchant2.com',
          ]).returns(Promise.resolve({}));

          resolver.resolveUnknownAnchors([
            createAnchor('https://www.excluded-merchant.com'),
          ].concat(anchorList));
        });

        it('Should not send already requested domains when the request is still flying', () => {
          // Simulate pending request with unresolved Promise.
          // fetch should be called only once!
          mock.expects('fetchDomainResolverApi').once().returns(new Promise((() => {})));
          const response = resolver.resolveUnknownAnchors(anchorList);

          let requestIsPending = true;

          // First request
          response.asyncData.then(() => {
            requestIsPending = false;
          });

          expect(requestIsPending).to.be.true;
          // Second request, first request should still be pending.
          resolver.resolveUnknownAnchors(anchorList);
          expect(requestIsPending).to.be.true;
          expect(resolver.domains_).to.deep.equal({
            'merchant1.com': LINK_STATUS__UNKNOWN,
            'non-merchant.com': LINK_STATUS__UNKNOWN,
            'merchant2.com': LINK_STATUS__UNKNOWN,
          });
        });
      });



      describe('Does correct request to domain resolver API', () => {
        const pubCode = 'pubXcode';

        beforeEach(() => {
          mock = env.sandbox.mock(xhr);
          resolver = new AffiliateLinkResolver(xhr, {
            pubcode: pubCode,
          }, () => {});
        });

        afterEach(() => {
          mock.verify();
        });

        it('Should call the correct url', () => {
          const domains = ['domain1.com', 'domain2.com'];
          const expectedData = {
            pubcode: pubCode,
            page: '',
            domains,
          };

          const url = `${DOMAIN_RESOLVER_URL}?data=${JSON.stringify(expectedData)}`;
          const response = {
            json: () => (Promise.resolve({})),
          };

          mock.expects('fetchJson')
              .once()
              .withArgs(url)
              .returns(Promise.resolve(response));

          resolver.fetchDomainResolverApi(domains);
        });

        it('Should use the corret fetch options', () => {
          const domains = ['domain1.com', 'domain2.com'];
          const expectedData = {
            pubcode: pubCode,
            page: '',
            domains,
          };

          const url = `${DOMAIN_RESOLVER_URL}?data=${JSON.stringify(expectedData)}`;
          const fetchOptions = {
            method: 'GET',
            // Disabled AMP CORS
            requireAmpResponseSourceOrigin: false,
            ampCors: false,
            // Allow beacon API to set cookies
            credentials: 'include',
          };
          const response = {
            json: () => (Promise.resolve({})),
          };

          mock.expects('fetchJson')
              .once()
          // Ideally only focused on fetchOptions but using sinon.match.any
          // as the first arg makes the test fail for some reasons.
              .withArgs(url, fetchOptions)
              .returns(Promise.resolve(response));

          resolver.fetchDomainResolverApi(domains);
        });
      });


      describe('Calls the beacon callback', () => {
        beforeEach(() => {

        });
      });



      describe('Returns the correct data', () => {
        beforeEach(() => {
          const stubXhr = createStubXhr(xhr, {
            'merchant_domains': ['merchant1.com', 'merchant2.com'],
          });
          resolver = new AffiliateLinkResolver(stubXhr, {
            excludedDomains: ['excluded-merchant.com'],
          }, () => { });
        });

        it('Should return an AnchorRewriteDataResponse instance', () => {
          const response = resolver.resolveUnknownAnchors([]);
          expect(response).to.be.an.instanceof(AnchorRewriteDataResponse);
        });

        it('Should affiliate unknown links by default until the API gives an answer', () => {
          const response = resolver.resolveUnknownAnchors(anchorList);
          // Replace all the unknown in the synchronous reponse,
          // asynchronous response will then overwrite it later.
          const expectedSyncData = anchorList.map(a => {
            return createAnchorReplacementTuple(a, resolver.getWaypointUrl_(a));
          });

          expect(response.syncData).to.deep.equal(expectedSyncData);
        });

        it('Should set "asyncData" field in the returned object when only unknown domains', () => {
          const response = resolver.resolveUnknownAnchors(anchorList);
          const expectedAsyncData = [
            createAnchorReplacementTuple(anchorList[0], resolver.getWaypointUrl_(anchorList[0])),
            createAnchorReplacementTuple(anchorList[1], null),
            createAnchorReplacementTuple(anchorList[2], resolver.getWaypointUrl_(anchorList[2])),
          ];

          expect(response.asyncData).to.be.an.instanceof(Promise);
          return response.asyncData.then(anchorReplacementTuple => {
            expect(anchorReplacementTuple).to.deep.equal(expectedAsyncData);
          });
        });

        it('Should only set the "syncData" field in the returned object when no new domains', () => {
          resolver.domains_ = alreadyResolvedDomains;
          const response = resolver.resolveUnknownAnchors(anchorList);
          const expectedSyncData = [
            createAnchorReplacementTuple(anchorList[0], resolver.getWaypointUrl_(anchorList[0])),
            createAnchorReplacementTuple(anchorList[1], null),
            createAnchorReplacementTuple(anchorList[2], resolver.getWaypointUrl_(anchorList[2])),
          ];
          expect(response.syncData).to.deep.equal(expectedSyncData);
          expect(response.asyncData).to.be.null;
        });

        it('Should not replace excluded domains', () => {
          const excludedAnchor = createAnchor('https://www.excluded-merchant.com');
          const response = resolver.resolveUnknownAnchors([excludedAnchor]);

          const expectedSyncData = [
            createAnchorReplacementTuple(excludedAnchor, null),
          ];

          expect(response.syncData).to.deep.equal(expectedSyncData);
          expect(response.asyncData).to.be.null;
        });

        it('Should only return the "pending" anchors in the asyncData', () => {
          const initialAnchor = createAnchor('https://initial-merchant.com');
          resolver.domains_ = {
            'initial-merchant.com': LINK_STATUS__AFFILIATE,
          };
          // Initial anchor should not be in the asyncData list
          const expectedAsyncData = [
            createAnchorReplacementTuple(anchorList[0], resolver.getWaypointUrl_(anchorList[0])),
            createAnchorReplacementTuple(anchorList[1], null),
            createAnchorReplacementTuple(anchorList[2], resolver.getWaypointUrl_(anchorList[2])),
          ];

          const response = resolver.resolveUnknownAnchors(
              [initialAnchor].concat(anchorList)
          );

          expect(response.syncData.length).to.equal(4);
          expect(response.syncData).to.deep.include(
              createAnchorReplacementTuple(initialAnchor, resolver.getWaypointUrl_(initialAnchor)),
          );
          expect(response.asyncData).to.be.an.instanceof(Promise);
          return response.asyncData.then(anchorReplacementTuple => {
            expect(anchorReplacementTuple).to.deep.equal(expectedAsyncData);
          });
        });

      });
    });



    describe('getLinkDomain_', () => {
      const resolver = new AffiliateLinkResolver({}, {}, () => { });

      beforeEach(() => {

      });

      it('Removes  http protocol', () => {
        const anchor = createAnchor('http://test.com');
        expect(resolver.getLinkDomain(anchor)).to.equal('test.com');
      });

      it('removes // protocol', () => {
        const anchor = createAnchor('//test.com/');
        expect(resolver.getLinkDomain(anchor)).to.equal('test.com');
      });

      it('Removes www.', () => {
        const anchor = createAnchor('http://www.test.com');
        expect(resolver.getLinkDomain(anchor)).to.equal('test.com');
      });

      it('Removes the path and query params', () => {
        const anchor = createAnchor('http://www.test.com/hello-word?test=1');
        expect(resolver.getLinkDomain(anchor)).to.equal('test.com');
      });
    });



    describe('getWaypointUrl_', () => {

    });
  });

});
