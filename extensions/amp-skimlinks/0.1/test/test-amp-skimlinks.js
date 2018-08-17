import * as DocumentReady from '../../../../src/document-ready';
import {SKIMLINKS_REWRITER_ID} from '../constants';
import {EVENTS as linkRewriterEvents} from '../../../../src/service/link-rewrite/constants';
import LinkRewriterService from '../../../../src/service/link-rewrite/link-rewrite-service';
import helpersFactory from './helpers';
import * as SkimOptionsModule from '../skim-options';


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
          excludedDomains: options['excluded-domains'].split(',').concat(['localhost']),
          tracking: options['tracking'],
          customTrackingId: options['custom-tracking-id'],
          linkSelector: options['link-selector'],
        });
      });
    });

    describe('initSkimlinksLinkRewriter', () => {
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
        ampSkimlinks.domainResolverService = {
          resolveUnknownAnchors: env.sandbox.stub(),
        };
        env.sandbox.stub(ampSkimlinks, 'onClick_');
        env.sandbox.stub(ampSkimlinks, 'callBeaconIfNotAlreadyDone_');
        ampSkimlinks.initSkimlinksLinkRewriter();
      });

      it('Should register Skimlinks link rewriter', () => {
        expect(ampSkimlinks.linkRewriterService.registerLinkRewriter.calledOnce).to.be.true;
        const args = ampSkimlinks.linkRewriterService.registerLinkRewriter.args[0];

        expect(args[0]).to.equal(SKIMLINKS_REWRITER_ID);
        expect(args[1]).to.be.a('function');
        expect(args[2].linkSelector).to.equal(ampSkimlinks.skimOptions_.linkSelector);
      });

      it('Should setup click callback', () => {
        const data = {};
        // Send fake click.
        ampSkimlinks.skimlinksLinkRewriter.events.send(linkRewriterEvents.CLICK, data);

        expect(ampSkimlinks.onClick_.withArgs(data).calledOnce).to.be.true;
      });

      it('Should setup page scanned callback', () => {
        const data = {};
        // Send fake click.
        ampSkimlinks.skimlinksLinkRewriter.events.send(linkRewriterEvents.PAGE_SCANNED, data);

        expect(ampSkimlinks.callBeaconIfNotAlreadyDone_.withArgs(data).calledOnce).to.be.true;
      });
    });
  });

  describe('On beacon callback', () => {
    beforeEach(() => {
      helpers.stubCustomEventReporterBuilder();
      env.sandbox.stub(DocumentReady, 'whenDocumentReady').returns(Promise.resolve());
      return ampSkimlinks.buildCallback().then(() => {
        env.sandbox.stub(ampSkimlinks.trackingService, 'sendImpressionTracking');
      });
    });

    it('Should set hasCalledBeacon to true', () => {
      expect(ampSkimlinks.hasCalledBeacon).to.be.false;
      ampSkimlinks.onBeaconCallbackONCE_({});
      expect(ampSkimlinks.hasCalledBeacon).to.be.true;
    });

    it('Should call sendImpressionTracking', done => {
      expect(ampSkimlinks.trackingService.sendImpressionTracking.called).to.be.false;
      ampSkimlinks.onBeaconCallbackONCE_({});
      // Wait for next tick
      setTimeout(() => {
        expect(ampSkimlinks.trackingService.sendImpressionTracking.calledOnce).to.be.true;
        done();
      }, 0);
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
        hasReplaced: true,
      });

      expect(stub.calledOnce).to.be.true;
    });

    // TODO, confirm the logic
    it('Should send NA click tracking if other vendor has not replaced the link', () => {
      ampSkimlinks.onClick_({
        replacedBy: 'vendorX',
        hasReplaced: false,
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


  describe('on page scanned callback', () => {
    let stub;
    beforeEach(() => {
      stub = env.sandbox.stub().returns(Promise.resolve({}));
      ampSkimlinks.domainResolverService = {
        fetchDomainResolverApi: stub,
      };
    });

    it('Does not call beacon API if a request was already made', () => {
      ampSkimlinks.hasCalledBeacon = true;
      ampSkimlinks.callBeaconIfNotAlreadyDone_();
      expect(stub.called).to.be.false;
    });

    it('Calls beacon API if no requests were previously made', () => {
      ampSkimlinks.hasCalledBeacon = false;
      ampSkimlinks.callBeaconIfNotAlreadyDone_();
      expect(stub.calledOnce).to.be.true;
    });
  });
});
