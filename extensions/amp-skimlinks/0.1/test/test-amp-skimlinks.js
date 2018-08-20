import * as DocumentReady from '../../../../src/document-ready';
import * as SkimOptionsModule from '../skim-options';
import {SKIMLINKS_REWRITER_ID} from '../constants';
import {EVENTS as linkRewriterEvents} from '../../../../src/service/link-rewrite/constants';
import LinkRewriterService from '../../../../src/service/link-rewrite/link-rewrite-service';
import helpersFactory from './helpers';


describes.fakeWin('amp-skimlinks', {
  amp: {
    extensions: ['amp-skimlinks'],
  },
}, env => {
  let iframeDoc, ampSkimlinks, helpers;


  beforeEach(() => {
    helpers = helpersFactory(env);
    iframeDoc = env.ampdoc.getRootNode();
    ampSkimlinks = helpers.createAmpSkimlinks({
      'publisher-code': 'pubIdXdomainId',
    });
  });

  afterEach(() => {
    env.sandbox.restore();
  });

  describe('skimOptions', () => {
    it('Should raise an error if publisher-code is missing', () => {
      ampSkimlinks = helpers.createAmpSkimlinks();
      // Use allowConsoleError to avoid other test failling because this one throws an error.
      allowConsoleError(() => expect(() => {
        ampSkimlinks.buildCallback();
      }).to.throw());
    });

    it('Should not raise any error when specifying publisher-code option', () => {
      ampSkimlinks = helpers.createAmpSkimlinks({
        'publisher-code': 'pubIdXdomainId',
      });
      env.sandbox.stub(DocumentReady, 'whenDocumentReady').returns(Promise.reject());
      expect(() => {
        ampSkimlinks.buildCallback();
      }).to.not.throw();
    });
  });

  describe('When loading the amp-skimlinks extension', () => {
    it('Should start skimcore on buildCallback', () => {
      env.sandbox.stub(DocumentReady, 'whenDocumentReady').returns(Promise.resolve());
      env.sandbox.stub(ampSkimlinks, 'startSkimcore_');
      return ampSkimlinks.buildCallback().then(() => {
        expect(ampSkimlinks.startSkimcore_.calledOnce).to.be.true;
      });
    });

    it('Should parse options', () => {
      env.sandbox.stub(DocumentReady, 'whenDocumentReady').returns(Promise.resolve());
      env.sandbox.spy(SkimOptionsModule, 'getAmpSkimlinksOptions');
      const options = {
        'publisher-code': '666X666',
        'excluded-domains': 'amazon.com,amazon.fr',
        'tracking': false,
        'custom-tracking-id': 'campaignX',
        'link-selector': '.content a',
      };
      ampSkimlinks = helpers.createAmpSkimlinks(options);
      env.sandbox.stub(ampSkimlinks, 'startSkimcore_');

      return ampSkimlinks.buildCallback().then(() => {
        expect(SkimOptionsModule.getAmpSkimlinksOptions.calledOnce).to.be.true;
        expect(ampSkimlinks.skimOptions_).to.deep.equal({
          pubcode: options['publisher-code'],
          excludedDomains: options['excluded-domains'].split(','),
          tracking: options['tracking'],
          customTrackingId: options['custom-tracking-id'],
          linkSelector: options['link-selector'],
        });
      });
    });

    describe('initSkimlinksLinkRewriter', () => {
      let resolveFunction, linkRewriter;

      beforeEach(() => {
        ampSkimlinks.skimOptions_ = {
          linkSelector: '.article a',
        };
        ampSkimlinks.linkRewriterService = new LinkRewriterService(iframeDoc);
        env.sandbox.spy(
            ampSkimlinks.linkRewriterService,
            'registerLinkRewriter'
        );
        ampSkimlinks.trackingService = {
          sendNaClickTracking: env.sandbox.stub(),
        };
        resolveFunction = env.sandbox.stub();
        env.sandbox.stub(ampSkimlinks, 'getResolveUnkownLinksFunction_').returns(resolveFunction);

        env.sandbox.stub(ampSkimlinks, 'onClick_');
        linkRewriter = ampSkimlinks.initSkimlinksLinkRewriter();
      });

      it('Should register Skimlinks link rewriter', () => {
        expect(ampSkimlinks.linkRewriterService.registerLinkRewriter.calledOnce).to.be.true;
        const args = ampSkimlinks.linkRewriterService.registerLinkRewriter.args[0];

        expect(args[0]).to.equal(SKIMLINKS_REWRITER_ID);
        expect(args[1]).to.equal(resolveFunction);
        expect(args[2].linkSelector).to.equal(ampSkimlinks.skimOptions_.linkSelector);
      });

      it('Should setup click callback', () => {
        const data = {};
        // Send fake click.
        linkRewriter.events.send(linkRewriterEvents.CLICK, data);

        expect(ampSkimlinks.onClick_.withArgs(data).calledOnce).to.be.true;
      });
    });
  });

  describe('On click callback', () => {
    let stub;

    beforeEach(() => {
      ampSkimlinks.trackingService = {sendNaClickTracking: env.sandbox.stub()};
      stub = ampSkimlinks.trackingService.sendNaClickTracking;
    });

    it('Should send NA click tracking if an other linkRewriter has replaced the link', () => {
      ampSkimlinks.onClick_({
        replacedBy: 'vendorX',
      });

      expect(stub.calledOnce).to.be.true;
    });

    // TODO, confirm the logic
    it('Should send NA click tracking if other vendor has not replaced the link', () => {
      ampSkimlinks.onClick_({
        replacedBy: 'vendorX',
      });

      expect(stub.calledOnce).to.be.true;
    });

    it('Should send NA click tracking if skimlinks has not replaced the link', () => {
      ampSkimlinks.onClick_({
        replacedBy: 'vendorX',
      });

      expect(stub.calledOnce).to.be.true;
    });

    it('Should send NA click tracking if no one has replaced the link', () => {
      ampSkimlinks.onClick_({
        replacedBy: null,
      });

      expect(stub.calledOnce).to.be.true;
    });

    it('Should not send NA click tracking if skimlinks has replaced the link', () => {
      ampSkimlinks.onClick_({
        replacedBy: SKIMLINKS_REWRITER_ID,
      });

      expect(stub.called).to.be.false;
    });
  });

  describe('getResolveUnkownLinksFunction_ returned function', () => {
    let resolveFunction;

    beforeEach(() => {
      env.sandbox.stub(ampSkimlinks, 'initBeaconCallbackHook_');
      resolveFunction = ampSkimlinks.getResolveUnkownLinksFunction_();

      ampSkimlinks.domainResolverService = {
        resolveUnknownAnchors: env.sandbox.stub(),
      };
    });

    it('Should always call domainResolverService.resolveUnknownAnchors', () => {
      const anchorsList = ['a', 'b'];
      resolveFunction.call(ampSkimlinks, anchorsList);
      resolveFunction.call(ampSkimlinks, anchorsList);
      const stub = ampSkimlinks.domainResolverService.resolveUnknownAnchors;
      expect(stub.withArgs(anchorsList).callCount).to.equal(2);
    });

    it('Should return results of domainResolverService.resolveUnknownAnchors', () => {
      const res = ['a', 'b'];
      ampSkimlinks.domainResolverService.resolveUnknownAnchors.returns(res);
      expect(resolveFunction.call(ampSkimlinks)).to.equal(res);
    });

    it('Should call initBeaconCallbackHook_ only once', () => {
      resolveFunction.call(ampSkimlinks);
      expect(ampSkimlinks.initBeaconCallbackHook_.calledOnce).to.be.true;
      resolveFunction.call(ampSkimlinks);
      expect(ampSkimlinks.initBeaconCallbackHook_.calledOnce).to.be.true;
    });
  });

  describe('initBeaconCallbackHook_', () => {
    const promise = Promise.resolve({});
    beforeEach(() => {
      ampSkimlinks.domainResolverService = {
        fetchDomainResolverApi: env.sandbox.stub().returns(Promise.resolve({})),
      };
      env.sandbox.stub(ampSkimlinks, 'sendImpressionTracking_');
    });

    it('Should call fetchDomainResolverApi if no asyncResponse', () => {
      ampSkimlinks.initBeaconCallbackHook_({asyncResponse: undefined});
      const stub = ampSkimlinks.domainResolverService.fetchDomainResolverApi;
      expect(stub.calledOnce).to.be.true;
    });

    it('Should not call fetchDomainResolverApi if asyncResponse', () => {
      ampSkimlinks.initBeaconCallbackHook_({asyncResponse: promise});
      const stub = ampSkimlinks.domainResolverService.fetchDomainResolverApi;
      expect(stub.called).to.be.false;
    });

    it('Should call sendImpressionTracking_ when asyncResponse is resolved', () => {
      return ampSkimlinks.initBeaconCallbackHook_({asyncResponse: promise}).then(() => {
        expect(ampSkimlinks.sendImpressionTracking_.calledOnce).to.be.true;
      });
    });

    it('Should call sendImpressionTracking_ when fetchDomainResolverApi is resolved', () => {
      return ampSkimlinks.initBeaconCallbackHook_({asyncResponse: null}).then(() => {
        expect(ampSkimlinks.sendImpressionTracking_.calledOnce).to.be.true;
      });
    });

    it('Should chain to the asyncResponse promise asynchronously', done => {
      const fakePromise = {
        then: env.sandbox.stub(),
      };
      ampSkimlinks.initBeaconCallbackHook_({asyncResponse: fakePromise});
      expect(fakePromise.then.called).to.be.false;
      setTimeout(() => {
        expect(fakePromise.then.calledOnce).to.be.true;
        done();
      }, 1);
    });

  });
});
