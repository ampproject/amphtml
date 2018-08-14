import {AmpEvents} from '../../src/amp-events';
import {anchorClickActions} from '../../src/service/navigation';
import {createCustomEvent} from '../../src/event-helper';
import LinkRewriterService from '../../src/service/link-rewrite/link-rewrite-service';

describes.fakeWin('Link Rewriter Service', {amp: true}, env => {
  let rootNode, linkRewriterService, win;
  let sendEventHelper, registerLinkRewriterHelper;
  beforeEach(() => {
    win = env.win;
    document = win.document;
    rootNode = env.ampdoc.getRootNode();
    env.sandbox.spy(rootNode, 'addEventListener');
    env.sandbox.spy(rootNode, 'querySelector');

    linkRewriterService = new LinkRewriterService(rootNode);

    // Helper functions
    registerLinkRewriterHelper = vendorName => {
      const linkRewriter = linkRewriterService.registerLinkRewriter(
          vendorName,
          env.sandbox.stub(),
          {}
      );
      env.sandbox.stub(linkRewriter, 'onDomUpdated');

      return linkRewriter;
    };

    sendEventHelper = (eventType, data) => {
      const event = createCustomEvent(win,
          eventType, data, {bubbles: true});
      rootNode.dispatchEvent(event);
    };
  });

  afterEach(() => {
    env.sandbox.restore();
  });

  describe('When starting service', () => {
    it('Should listen for ANCHOR_CLICK', () => {
      const spy = rootNode.addEventListener.withArgs(AmpEvents.ANCHOR_CLICK);
      expect(spy.calledOnce).to.be.true;
    });

    it('Should listen for DOM_UPDATE', () => {
      const spy = rootNode.addEventListener.withArgs(AmpEvents.DOM_UPDATE);
      expect(spy.calledOnce).to.be.true;
    });
  });

  describe('When registering new link rewriter', () => {
    it('Should simply add the link rewriter if no other link rewriter', () => {
      expect(linkRewriterService.linkRewriters_.length).to.equal(0);
      const linkRewriter = registerLinkRewriterHelper('amp-skimlinks');
      expect(linkRewriterService.linkRewriters_).to.deep.equal([linkRewriter]);
    });

    it('Should set the highest priority in the first position', () => {
      linkRewriterService.priorities = ['vendor2', 'vendor1'];

      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');
      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');

      expect(linkRewriterService.linkRewriters_).to.deep.equal(
          [linkRewriterVendor2, linkRewriterVendor1]);
    });

    it('Should set lower priority in the last position', () => {
      linkRewriterService.priorities = ['vendor2', 'vendor1'];
      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');

      expect(linkRewriterService.linkRewriters_).to.deep.equal(
          [linkRewriterVendor2, linkRewriterVendor1]);
    });

    it('Should be insert linkRewriter in the middle', () => {
      linkRewriterService.priorities = ['vendor2', 'vendor1', 'vendor3'];

      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
      const linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');
      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');

      expect(linkRewriterService.linkRewriters_).to.deep.equal(
          [linkRewriterVendor2, linkRewriterVendor1, linkRewriterVendor3]);
    });

    it('Should set link rewriters with no priorities at the end', () => {
      linkRewriterService.priorities = ['vendor2', 'vendor1'];

      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
      const linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');

      expect(linkRewriterService.linkRewriters_).to.deep.equal(
          [linkRewriterVendor2, linkRewriterVendor3]);

      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');

      expect(linkRewriterService.linkRewriters_).to.deep.equal(
          [linkRewriterVendor2, linkRewriterVendor1, linkRewriterVendor3]);
    });
  });

  describe('On dom update', () => {
    it('Should notify all the links rewriter', () => {
      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');
      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
      const linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');

      sendEventHelper(AmpEvents.DOM_UPDATE);

      expect(linkRewriterVendor1.onDomUpdated.calledOnce).to.be.true;
      expect(linkRewriterVendor2.onDomUpdated.calledOnce).to.be.true;
      expect(linkRewriterVendor3.onDomUpdated.calledOnce).to.be.true;
    });
  });

  describe('On click', () => {
    beforeEach(() => {
      env.sandbox.spy(linkRewriterService, 'getSuitableLinkRewritersForLink_');
    });

    describe('Allowed click action types', () => {
      it('Should return if action type not allowed', () => {
        sendEventHelper(AmpEvents.ANCHOR_CLICK, {
          clickActionType: anchorClickActions.NAVIGATE_CUSTOM_PROTOCOL,
        });
        expect(linkRewriterService.getSuitableLinkRewritersForLink_.calledOnce).to.be.false;
      });

      it('Should handle clicks of type "navigate-outbound"', () => {
        sendEventHelper(AmpEvents.ANCHOR_CLICK, {
          clickActionType: anchorClickActions.NAVIGATE_OUTBOUND,
          anchor: document.createElement('a'),
        });
        expect(linkRewriterService.getSuitableLinkRewritersForLink_.calledOnce).to.be.true;
      });

      it('Should support clicks of type "open-context-menu"', () => {
        sendEventHelper(AmpEvents.ANCHOR_CLICK, {
          clickActionType: anchorClickActions.OPEN_CONTEXT_MENU,
          anchor: document.createElement('a'),
        });
        expect(linkRewriterService.getSuitableLinkRewritersForLink_.calledOnce).to.be.true;
      });
    });

    describe('Send click event', () => {
      let linkRewriterVendor1, linkRewriterVendor2, linkRewriterVendor3;

      function getEventData() {
        return linkRewriterVendor1.events.send.firstCall.args[1];
      }

      beforeEach(() => {
        linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');
        linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
        linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');

        env.sandbox.stub(linkRewriterVendor1, 'isWatchingLink').returns(true);
        env.sandbox.stub(linkRewriterVendor1.events, 'send');
        env.sandbox.stub(linkRewriterVendor2, 'isWatchingLink').returns(false);
        env.sandbox.stub(linkRewriterVendor2.events, 'send');
        env.sandbox.stub(linkRewriterVendor3, 'isWatchingLink').returns(true);
        env.sandbox.stub(linkRewriterVendor3.events, 'send');
      });

      it('Should only send click event to suitable link rewriters', () => {
        sendEventHelper(AmpEvents.ANCHOR_CLICK, {
          clickActionType: anchorClickActions.NAVIGATE_OUTBOUND,
          anchor: document.createElement('a'),
        });

        expect(linkRewriterVendor1.events.send.calledOnce).to.be.true;
        expect(linkRewriterVendor2.events.send.calledOnce).to.be.false;
        expect(linkRewriterVendor3.events.send.calledOnce).to.be.true;
      });

      it('Should contain the name of the chosen link rewriter', () => {
        env.sandbox.stub(linkRewriterVendor1, 'rewriteAnchorUrl').returns(true);
        env.sandbox.stub(linkRewriterVendor2, 'rewriteAnchorUrl').returns(true);
        env.sandbox.stub(linkRewriterVendor3, 'rewriteAnchorUrl').returns(true);

        sendEventHelper(AmpEvents.ANCHOR_CLICK, {
          clickActionType: anchorClickActions.NAVIGATE_OUTBOUND,
          anchor: document.createElement('a'),
        });

        expect(getEventData(linkRewriterVendor1).replacedBy).to.equal('vendor1');
        expect(getEventData(linkRewriterVendor2).replacedBy).to.equal('vendor1');
        expect(getEventData(linkRewriterVendor3).replacedBy).to.equal('vendor1');
      });

      it('Should set replacedBy to null when no replacement', () => {
        env.sandbox.stub(linkRewriterVendor1, 'rewriteAnchorUrl').returns(false);
        env.sandbox.stub(linkRewriterVendor2, 'rewriteAnchorUrl').returns(true);
        env.sandbox.stub(linkRewriterVendor3, 'rewriteAnchorUrl').returns(false);

        sendEventHelper(AmpEvents.ANCHOR_CLICK, {
          clickActionType: anchorClickActions.NAVIGATE_OUTBOUND,
          anchor: document.createElement('a'),
        });

        expect(getEventData(linkRewriterVendor1).replacedBy).to.be.null;
        // vendor2 has isWatchingLink to false therefore can not replace.
        expect(getEventData(linkRewriterVendor2).replacedBy).to.be.null;
        expect(getEventData(linkRewriterVendor3).replacedBy).to.be.null;
      });
    });


    describe('Calls rewriteAnchorUrl on the most suitable linkRewriter', () => {
      let linkRewriterVendor1, linkRewriterVendor2, linkRewriterVendor3;

      beforeEach(() => {
        linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');
        linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
        linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');

        env.sandbox.stub(linkRewriterVendor1, 'isWatchingLink').returns(true);
        env.sandbox.stub(linkRewriterVendor1.events, 'send');
        env.sandbox.stub(linkRewriterVendor2, 'isWatchingLink').returns(false);
        env.sandbox.stub(linkRewriterVendor2.events, 'send');
        env.sandbox.stub(linkRewriterVendor3, 'isWatchingLink').returns(true);
        env.sandbox.stub(linkRewriterVendor3.events, 'send');
      });

      it('Should ignore not suitable link rewriter', () => {
        env.sandbox.stub(linkRewriterVendor1, 'rewriteAnchorUrl').returns(true);
        env.sandbox.stub(linkRewriterVendor2, 'rewriteAnchorUrl').returns(false);

        sendEventHelper(AmpEvents.ANCHOR_CLICK, {
          clickActionType: anchorClickActions.NAVIGATE_OUTBOUND,
          anchor: document.createElement('a'),
        });

        expect(linkRewriterVendor1.rewriteAnchorUrl.calledOnce).to.be.true;
        expect(linkRewriterVendor2.rewriteAnchorUrl.calledOnce).to.be.false;
      });


      it.skip('Should respect page level priorities', () => {

      });

      it.skip('Should respect anchor level priorities', () => {

      });

      it('Should try the next one if no replacement', () => {
        env.sandbox.stub(linkRewriterVendor1, 'rewriteAnchorUrl').returns(false);
        env.sandbox.stub(linkRewriterVendor2, 'rewriteAnchorUrl').returns(false);
        env.sandbox.stub(linkRewriterVendor3, 'rewriteAnchorUrl').returns(true);

        sendEventHelper(AmpEvents.ANCHOR_CLICK, {
          clickActionType: anchorClickActions.NAVIGATE_OUTBOUND,
          anchor: document.createElement('a'),
        });

        expect(linkRewriterVendor1.rewriteAnchorUrl.calledOnce).to.be.true;
        expect(linkRewriterVendor2.rewriteAnchorUrl.calledOnce).to.be.false;
        expect(linkRewriterVendor3.rewriteAnchorUrl.calledOnce).to.be.true;
      });
    });

  });
});
