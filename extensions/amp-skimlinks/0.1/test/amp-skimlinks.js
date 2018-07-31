import {
  getService,
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service';

import {Services} from '../../../../src/services';

import AffiliateLinkResolver, {DOMAIN_RESOLVER_URL, LINK_STATUS__AFFILIATE, LINK_STATUS__NON_AFFILIATE} from '../affiliate-link-resolver';

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

  describe('AffiliateLinkResolver', () => {

    describe('resolveUnknownAnchors', () => {
      let resolver;
      let anchorList;
      let mock;

      describe('Calls "fetchDomainResolverApi" function with correct parameters', () => {
        const alreadyResolvedDomains = {
          'merchant1.com': LINK_STATUS__AFFILIATE,
          'non-merchant.com': LINK_STATUS__NON_AFFILIATE,
          'merchant2.com': LINK_STATUS__AFFILIATE,
        };

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
  });

});
