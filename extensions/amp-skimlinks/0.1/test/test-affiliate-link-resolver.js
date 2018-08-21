
import {createAnchorReplacementTuple} from '../../../../src/service/link-rewrite/link-rewrite-classes';
import {Services} from '../../../../src/services';
import {XCUST_ATTRIBUTE_NAME} from '../constants';
import {parseQueryString, parseUrlDeprecated} from '../../../../src/url';
import {pubcode} from './constants';
import AffiliateLinkResolver, {DOMAIN_RESOLVER_URL, LINK_STATUS__AFFILIATE, LINK_STATUS__NON_AFFILIATE, LINK_STATUS__UNKNOWN} from '../affiliate-link-resolver';

import helpersFactory from './helpers';


describes.fakeWin('domain-resolver', {
  amp: {
    extensions: ['amp-skimlinks'],
  },
}, env => {
  let getTrackingInfo;
  let win;
  let xhr;
  let helpers;

  beforeEach(() => {
    win = env.win;
    xhr = Services.xhrFor(win);
    helpers = helpersFactory(env);
  });

  beforeEach(() => {
    getTrackingInfo = helpers.createGetTrackingInfoStub();
  });

  afterEach(() => {
    env.sandbox.restore();
  });

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
      ].map(helpers.createAnchor);
    });


    describe('Calls "fetchDomainResolverApi" function with the right domains', () => {
      beforeEach(() => {
        resolver = new AffiliateLinkResolver(
            {},
            {excludedDomains: ['excluded-merchant.com']},
            getTrackingInfo,
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
        mock.expects('fetchDomainResolverApi').once().withArgs([
          'merchant1.com',
          'non-merchant.com',
          'merchant2.com',
        ]).returns(Promise.resolve({}));

        resolver.resolveUnknownAnchors(anchorList);
      });

      it('Should make the list of requested domains unique', () => {
        anchorList = [helpers.createAnchor('https://merchant1.com')].concat(anchorList);
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
          helpers.createAnchor('http://non-merchant-new.com'),
          helpers.createAnchor('//merchant-new'),
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
          helpers.createAnchor('https://www.excluded-merchant.com'),
        ].concat(anchorList));
      });

      it('Should not send already requested domains when the request is still flying', () => {
        // Simulate pending request with unresolved Promise.
        // fetch should be called only once!
        mock.expects('fetchDomainResolverApi').once().returns(new Promise((() => { })));
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
          'merchant1.com': LINK_STATUS__UNKNOWN,
          'non-merchant.com': LINK_STATUS__UNKNOWN,
          'merchant2.com': LINK_STATUS__UNKNOWN,
        });
      });
    });



    describe('Does correct request to domain resolver API', () => {
      beforeEach(() => {
        mock = env.sandbox.mock(xhr);
        resolver = new AffiliateLinkResolver(
            xhr,
            {pubcode},
            getTrackingInfo,
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
          pubcode,
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


    describe('Returns the correct data', () => {
      beforeEach(() => {
        const stubXhr = helpers.createStubXhr({
          'merchant_domains': ['merchant1.com', 'merchant2.com'],
        });
        resolver = new AffiliateLinkResolver(
            stubXhr,
            {excludedDomains: ['excluded-merchant.com']},
            getTrackingInfo,
        );
      });

      it('Should return an object with sync and async response', () => {
        const twoStepsResponse = resolver.resolveUnknownAnchors([]);
        expect(twoStepsResponse).to.have.all.keys('syncResponse', 'asyncResponse');
      });

      it('Should affiliate unknown links by default until the API gives an answer', () => {
        const twoStepsResponse = resolver.resolveUnknownAnchors(anchorList);
        // Replace all the unknown in the synchronous reponse,
        // asynchronous response will then overwrite it later.
        const expectedSyncData = anchorList.map(a => {
          return createAnchorReplacementTuple(a, resolver.getWaypointUrl_(a));
        });

        expect(twoStepsResponse.syncResponse).to.deep.equal(expectedSyncData);
      });

      it('Should set "asyncResponse" field in the returned object when only unknown domains', () => {
        const response = resolver.resolveUnknownAnchors(anchorList);
        const expectedAsyncData = [
          createAnchorReplacementTuple(anchorList[0], resolver.getWaypointUrl_(anchorList[0])),
          createAnchorReplacementTuple(anchorList[1], null),
          createAnchorReplacementTuple(anchorList[2], resolver.getWaypointUrl_(anchorList[2])),
        ];

        expect(response.asyncResponse).to.be.an.instanceof(Promise);
        return response.asyncResponse.then(anchorReplacementTuple => {
          expect(anchorReplacementTuple).to.deep.equal(expectedAsyncData);
        });
      });

      it('Should only set the "asyncResponse" field in the returned object when no new domains', () => {
        resolver.domains_ = alreadyResolvedDomains;
        const response = resolver.resolveUnknownAnchors(anchorList);
        const expectedSyncData = [
          createAnchorReplacementTuple(anchorList[0], resolver.getWaypointUrl_(anchorList[0])),
          createAnchorReplacementTuple(anchorList[1], null),
          createAnchorReplacementTuple(anchorList[2], resolver.getWaypointUrl_(anchorList[2])),
        ];
        expect(response.syncResponse).to.deep.equal(expectedSyncData);
        expect(response.asyncResponse).to.be.null;
      });

      it('Should not replace excluded domains', () => {
        const excludedAnchor = helpers.createAnchor('https://www.excluded-merchant.com');
        const response = resolver.resolveUnknownAnchors([excludedAnchor]);

        const expectedSyncData = [
          createAnchorReplacementTuple(excludedAnchor, null),
        ];

        expect(response.syncResponse).to.deep.equal(expectedSyncData);
        expect(response.asyncResponse).to.be.null;
      });

      it('Should only return the "pending" anchors in the asyncResponse', () => {
        const initialAnchor = helpers.createAnchor('https://initial-merchant.com');
        resolver.domains_ = {
          'initial-merchant.com': LINK_STATUS__AFFILIATE,
        };
        // Initial anchor should not be in the asyncResponse list
        const expectedAsyncData = [
          createAnchorReplacementTuple(anchorList[0], resolver.getWaypointUrl_(anchorList[0])),
          createAnchorReplacementTuple(anchorList[1], null),
          createAnchorReplacementTuple(anchorList[2], resolver.getWaypointUrl_(anchorList[2])),
        ];

        const response = resolver.resolveUnknownAnchors(
            [initialAnchor].concat(anchorList)
        );

        expect(response.syncResponse.length).to.equal(4);
        expect(response.syncResponse).to.deep.include(
            createAnchorReplacementTuple(initialAnchor, resolver.getWaypointUrl_(initialAnchor)),
        );
        expect(response.asyncResponse).to.be.an.instanceof(Promise);
        return response.asyncResponse.then(anchorReplacementTuple => {
          expect(anchorReplacementTuple).to.deep.equal(expectedAsyncData);
        });
      });

    });



    describe('getLinkDomain_', () => {
      const resolver = new AffiliateLinkResolver({}, {}, getTrackingInfo);

      it('Removes  http protocol', () => {
        const anchor = helpers.createAnchor('http://test.com');
        expect(resolver.getLinkDomain(anchor)).to.equal('test.com');
      });

      it('removes // protocol', () => {
        const anchor = helpers.createAnchor('//test.com/');
        expect(resolver.getLinkDomain(anchor)).to.equal('test.com');
      });

      it('Removes www.', () => {
        const anchor = helpers.createAnchor('http://www.test.com');
        expect(resolver.getLinkDomain(anchor)).to.equal('test.com');
      });

      it('Removes the path and query params', () => {
        const anchor = helpers.createAnchor('http://www.test.com/hello-word?test=1');
        expect(resolver.getLinkDomain(anchor)).to.equal('test.com');
      });
    });



    describe('getWaypointUrl_', () => {
      let replacementUrl;
      let queryParams;
      let anchor;
      const destinationUrl = 'https://test.com/path/to?isAdmin=true';

      function getQueryParams(url) {
        return parseQueryString(
            parseUrlDeprecated(url).search
        );
      }

      function generateWaypointUrl(anchor, customTrackingId) {
        const resolver = new AffiliateLinkResolver(
            {},
            {},
            helpers.createGetTrackingInfoStub({customTrackingId}),
        );
        return resolver.getWaypointUrl_(anchor);
      }

      beforeEach(() => {
        anchor = helpers.createAnchor(destinationUrl);
        replacementUrl = generateWaypointUrl(anchor);
        queryParams = getQueryParams(replacementUrl);
      });

      it('Sends the pubcode', () => {
        expect(queryParams.id).to.equal(pubcode);
      });
      it('Sends the destination url', () => {
        expect(queryParams.url).to.equal(destinationUrl);
      });

      it('Sends the sref', () => {
        expect(queryParams.sref).to.equal('referrer');
      });

      it('Sends the pref', () => {
        expect(queryParams.pref).to.equal('external_referrer');
      });

      it('Sends the xguid (GUID)', () => {
        expect(queryParams.xguid).to.equal('user_guid');
      });

      it('Sends the xuuid (impression id)', () => {
        expect(queryParams.xuuid).to.equal('page_impression_id');
      });

      it('Sends the xtz (timezone)', () => {
        expect(queryParams.xtz).to.equal('timezone');
      });

      it('Sends xs (source app)', () => {
        expect(queryParams.xs).to.equal('1');
      });

      describe('custom-tracking-id', () => {
        it('Does not send the xcust (custom tracking id) if not provided as skimOption', () => {
          expect(queryParams.xcust).to.be.undefined;
        });

        it('Sends the xcust (custom tracking id) if provided on the link', () => {
          anchor.setAttribute(XCUST_ATTRIBUTE_NAME, 'linkTrackingId');
          replacementUrl = generateWaypointUrl(anchor);
          queryParams = getQueryParams(replacementUrl);
          expect(queryParams.xcust).to.be.equal('linkTrackingId');
        });

        it('Sends the xcust (custom tracking id) if provided as skimOption', () => {
          replacementUrl = generateWaypointUrl(anchor, 'globalTrackingId');
          queryParams = getQueryParams(replacementUrl);
          expect(queryParams.xcust).to.be.equal('globalTrackingId');
        });


        it('Sends the xcust (custom tracking id) if provided on the link and as skimOption', () => {
          anchor.setAttribute(XCUST_ATTRIBUTE_NAME, 'linkTrackingId');
          replacementUrl = generateWaypointUrl(anchor, 'globalTrackingId');
          queryParams = getQueryParams(replacementUrl);
          expect(queryParams.xcust).to.be.equal('linkTrackingId');
        });

      });
    });
  });
});
