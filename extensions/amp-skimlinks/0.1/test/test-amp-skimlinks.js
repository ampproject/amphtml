import {Deferred} from '#core/data-structures/promise';
import * as DocumentReady from '#core/document/ready';

import helpersFactory from './helpers';

import * as chunkModule from '../../../../src/chunk';
import {SKIMLINKS_REWRITER_ID} from '../constants';
import {EVENTS as linkRewriterEvents} from '../link-rewriter/constants';
import {LinkRewriterManager} from '../link-rewriter/link-rewriter-manager';
import * as SkimOptionsModule from '../skim-options';

describes.fakeWin(
  'amp-skimlinks',
  {
    amp: {
      extensions: ['amp-skimlinks'],
    },
  },
  (env) => {
    let ampSkimlinks, helpers, ampdoc;

    beforeEach(() => {
      ampdoc = env.ampdoc;
      helpers = helpersFactory(env);
      ampSkimlinks = helpers.createAmpSkimlinks({
        'publisher-code': 'pubIdXdomainId',
      });
    });

    afterEach(() => {
      env.sandbox.restore();
    });

    function nextMicroTask() {
      return Promise.resolve().then(() => Promise.resolve());
    }

    describe('skimOptions', () => {
      it('Should raise an error if publisher-code is missing', () => {
        ampSkimlinks = helpers.createAmpSkimlinks();
        // Use allowConsoleError to avoid other test failling because this
        // one throws an error.
        allowConsoleError(() =>
          expect(() => {
            ampSkimlinks.buildCallback();
          }).to.throw()
        );
      });

      it('Should not raise any error when specifying publisher-code', () => {
        ampSkimlinks = helpers.createAmpSkimlinks({
          'publisher-code': 'pubIdXdomainId',
        });
        env.sandbox
          .stub(DocumentReady, 'whenDocumentReady')
          .returns(Promise.reject());
        expect(() => {
          ampSkimlinks.buildCallback();
        }).to.not.throw();
      });
    });

    describe('When loading the amp-skimlinks extension', () => {
      it('Should start skimcore on buildCallback', () => {
        env.sandbox
          .stub(DocumentReady, 'whenDocumentReady')
          .returns(Promise.resolve());
        env.sandbox.stub(ampSkimlinks, 'startSkimcore_');
        return ampSkimlinks.buildCallback().then(() => {
          expect(ampSkimlinks.startSkimcore_.calledOnce).to.be.true;
        });
      });

      it('Should parse options', () => {
        env.sandbox
          .stub(DocumentReady, 'whenDocumentReady')
          .returns(Promise.resolve());
        env.sandbox.spy(SkimOptionsModule, 'getAmpSkimlinksOptions');
        const options = {
          'publisher-code': '666X666',
          'excluded-domains': 'amazon.com  amazon.fr ',
          tracking: false,
          'custom-tracking-id': 'campaignX',
          'link-selector': '.content a',
        };
        ampSkimlinks = helpers.createAmpSkimlinks(options);
        env.sandbox.stub(ampSkimlinks, 'startSkimcore_');

        return ampSkimlinks.buildCallback().then(() => {
          expect(SkimOptionsModule.getAmpSkimlinksOptions.calledOnce).to.be
            .true;
          expect(ampSkimlinks.skimOptions_).to.deep.include({
            pubcode: options['publisher-code'],
            tracking: options['tracking'],
            customTrackingId: options['custom-tracking-id'],
            linkSelector: options['link-selector'],
          });
          expect(ampSkimlinks.skimOptions_.excludedDomains).to.include.members([
            'amazon.com',
            'amazon.fr',
          ]);
        });
      });

      describe('initSkimlinksLinkRewriter_', () => {
        let linkRewriter;

        beforeEach(() => {
          ampSkimlinks.skimOptions_ = {
            linkSelector: '.article a',
          };
          ampSkimlinks.linkRewriterService_ = new LinkRewriterManager(
            env.ampdoc
          );
          env.sandbox.spy(
            ampSkimlinks.linkRewriterService_,
            'registerLinkRewriter'
          );
          ampSkimlinks.trackingService_ = {
            sendNaClickTracking: env.sandbox.stub(),
          };
          env.sandbox.stub(ampSkimlinks, 'onClick_');
          env.sandbox.stub(ampSkimlinks, 'onPageScanned_');
          // Chunk executes the provided task when the browser is Idle. We can
          // execute the task straight away for the purpose of the test.
          env.sandbox.stub(chunkModule, 'chunk').callsFake((node, task) => {
            task();
          });
          linkRewriter = ampSkimlinks.initSkimlinksLinkRewriter_();
        });

        it('Should register Skimlinks link rewriter', () => {
          expect(ampSkimlinks.linkRewriterService_.registerLinkRewriter).to.be
            .calledOnce;
          const args =
            ampSkimlinks.linkRewriterService_.registerLinkRewriter.args[0];

          expect(args[0]).to.equal(SKIMLINKS_REWRITER_ID);
          expect(args[1]).to.be.a('function');
          expect(args[2].linkSelector).to.equal(
            ampSkimlinks.skimOptions_.linkSelector
          );
        });

        it('Should setup click callback', () => {
          const eventData = {};
          // Send fake click.
          const event = {
            type: linkRewriterEvents.CLICK,
            eventData,
          };
          linkRewriter.events.fire(event);

          expect(ampSkimlinks.onClick_.withArgs(eventData).calledOnce).to.be
            .true;
        });

        it("Should call 'onPageScanned_' callback just once", () => {
          const eventData = {};
          const event = {
            type: linkRewriterEvents.PAGE_SCANNED,
            eventData,
          };
          linkRewriter.events.fire(event);
          linkRewriter.events.fire(event);
          expect(ampSkimlinks.onPageScanned_.calledOnce).to.be.true;
        });
      });
    });

    describe('Na click tracking on click callback', () => {
      let stub;

      beforeEach(() => {
        ampSkimlinks.trackingService_ = {
          sendNaClickTracking: env.sandbox.stub(),
        };
        stub = ampSkimlinks.trackingService_.sendNaClickTracking;
      });

      it(`Should send NA click if an other
            linkRewriter has replaced the link`, () => {
        ampSkimlinks.onClick_({
          linkRewriterId: 'vendorX',
        });

        expect(stub.calledOnce).to.be.true;
      });

      it('Should send NA click if other vendor has replaced the link', () => {
        ampSkimlinks.onClick_({
          linkRewriterId: 'vendorX',
        });

        expect(stub.calledOnce).to.be.true;
      });

      it('Should send NA click if skimlinks has not replaced the link', () => {
        ampSkimlinks.onClick_({
          linkRewriterId: 'vendorX',
        });

        expect(stub.calledOnce).to.be.true;
      });

      it('Should send NA click if no one has replaced the link', () => {
        ampSkimlinks.onClick_({
          linkRewriterId: null,
        });

        expect(stub.calledOnce).to.be.true;
      });

      it('Should not send NA click if skimlinks has replaced the link', () => {
        ampSkimlinks.onClick_({
          linkRewriterId: SKIMLINKS_REWRITER_ID,
        });

        expect(stub.called).to.be.false;
      });

      describe('Based on clickType', () => {
        it('Should send the NA click if clickType is "click"', () => {
          ampSkimlinks.onClick_({
            linkRewriterId: null,
            clickType: 'click',
          });

          expect(stub.calledOnce).to.be.true;
        });

        it('Should not send the NA click if clickType is "contextmenu"', () => {
          ampSkimlinks.onClick_({
            linkRewriterId: null,
            clickType: 'contextmenu',
          });

          expect(stub.called).to.be.false;
        });

        it('Should send the NA click if clickType is something else', () => {
          ampSkimlinks.onClick_({
            linkRewriterId: null,
            clickType: 'mouseup',
          });

          expect(stub.calledOnce).to.be.true;
        });
      });
    });

    describe('On page scan callback', () => {
      const guid = 'my-guid';
      const beaconResponse = Promise.resolve({guid});
      beforeEach(() => {
        ampSkimlinks.affiliateLinkResolver_ = {
          fetchDomainResolverApi: env.sandbox.stub().returns(beaconResponse),
        };
        ampSkimlinks.trackingService_ = {
          setTrackingInfo: env.sandbox.stub(),
          sendImpressionTracking: env.sandbox.stub(),
        };
        ampSkimlinks.skimlinksLinkRewriter_ = {
          getAnchorReplacementList: env.sandbox.stub(),
        };
        ampSkimlinks.ampDoc_ = ampSkimlinks.getAmpDoc();
      });

      describe('When beacon call has not been made yet', () => {
        beforeEach(() => {
          ampSkimlinks.affiliateLinkResolver_.firstRequest = null;
        });

        it('Should make the fallback call', () => {
          ampSkimlinks.sendImpressionTracking_ = env.sandbox
            .stub()
            .returns(Promise.resolve());

          return ampSkimlinks.onPageScanned_().then(() => {
            const stub =
              ampSkimlinks.affiliateLinkResolver_.fetchDomainResolverApi;
            expect(stub.calledOnce).to.be.true;
          });
        });

        it('Should send the impression tracking if visible', () => {
          return ampSkimlinks
            .onPageScanned_()
            .then(nextMicroTask)
            .then(() => {
              const stub = ampSkimlinks.trackingService_.sendImpressionTracking;
              expect(stub.calledOnce).to.be.true;
            });
        });

        it('Should wait until visible to send the impression tracking', () => {
          const isVisibleDefer = new Deferred();
          env.sandbox
            .stub(ampdoc, 'whenFirstVisible')
            .returns(isVisibleDefer.promise);

          return ampSkimlinks
            .onPageScanned_()
            .then(nextMicroTask)
            .then(() => {
              const stub = ampSkimlinks.trackingService_.sendImpressionTracking;
              expect(stub.called).to.be.false;
              isVisibleDefer.resolve();
              return isVisibleDefer.promise.then(() => {
                expect(stub.calledOnce).to.be.true;
              });
            });
        });

        it('Should update tracking info with the guid', () => {
          return ampSkimlinks.onPageScanned_().then(() => {
            const {
              sendImpressionTracking: sendImpressionTrackingStub,
              setTrackingInfo: setTrackingInfoStub,
            } = ampSkimlinks.trackingService_;
            expect(setTrackingInfoStub.withArgs({guid}).calledOnce).to.be.true;
            expect(setTrackingInfoStub.calledBefore(sendImpressionTrackingStub))
              .to.be.true;
          });
        });
      });

      describe('When beacon call has already been made', () => {
        beforeEach(() => {
          ampSkimlinks.affiliateLinkResolver_.firstRequest =
            Promise.resolve(beaconResponse);
        });

        it('Should not make the fallback call', () => {
          ampSkimlinks.sendImpressionTracking_ = env.sandbox
            .stub()
            .returns(Promise.resolve());
          return ampSkimlinks.onPageScanned_().then(() => {
            const stub =
              ampSkimlinks.affiliateLinkResolver_.fetchDomainResolverApi;
            expect(stub.called).to.be.false;
          });
        });

        it('Should send the impression tracking if visible', () => {
          return ampSkimlinks
            .onPageScanned_()
            .then(nextMicroTask)
            .then(() => {
              const stub = ampSkimlinks.trackingService_.sendImpressionTracking;
              expect(stub.calledOnce).to.be.true;
            });
        });

        it('Should wait until visible to send the impression tracking', () => {
          const isVisibleDefer = new Deferred();
          env.sandbox
            .stub(ampdoc, 'whenFirstVisible')
            .returns(isVisibleDefer.promise);

          return ampSkimlinks.onPageScanned_().then(() => {
            const stub = ampSkimlinks.trackingService_.sendImpressionTracking;
            expect(stub.called).to.be.false;
            isVisibleDefer.resolve();
            return isVisibleDefer.promise.then(() => {
              expect(stub.calledOnce).to.be.true;
            });
          });
        });

        it('Should update tracking info with the guid', () => {
          return ampSkimlinks.onPageScanned_().then(() => {
            const {
              sendImpressionTracking: sendImpressionTrackingStub,
              setTrackingInfo: setTrackingInfoStub,
            } = ampSkimlinks.trackingService_;
            expect(setTrackingInfoStub.withArgs({guid}).calledOnce).to.be.true;
            expect(setTrackingInfoStub.calledBefore(sendImpressionTrackingStub))
              .to.be.true;
          });
        });
      });
    });
  }
);
