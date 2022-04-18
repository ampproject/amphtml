import {Services} from '#service';

import {macroTask} from '#testing/helpers';

import {AmpStory} from '../../../amp-story/1.0/amp-story';
import {
  Action,
  getStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import {CountPagesAlgorithm} from '../algorithm-count-pages';
import {InsertionState, StoryAdPageManager} from '../story-ad-page-manager';

describes.realWin('CountPagesAlgorithm', {amp: true}, (env) => {
  let storeService;
  let pageManager;

  beforeEach(() => {
    const ampdocService = Services.ampdocServiceFor(env.win);
    env.sandbox.stub(ampdocService, 'getAmpDoc').returns(env.ampdoc);
    storeService = getStoreService(env.win);
    const storyElement = env.win.document.createElement('amp-story');
    const ampStory = new AmpStory(storyElement);
    env.sandbox.stub(ampStory, 'getAmpDoc').returns(env.ampdoc);
    pageManager = new StoryAdPageManager(ampStory, {} /* config */);
  });

  describe('#isStoryEligible', () => {
    it('returns false for stories < eight pages', () => {
      const pageIds = ['1', '2', '3', '4', '5', '6', '7'];
      storeService.dispatch(Action.SET_PAGE_IDS, pageIds);
      const algo = new CountPagesAlgorithm(storeService, pageManager);
      expect(algo.isStoryEligible()).to.be.false;
    });

    it('returns false for stories >= eight pages', () => {
      const pageIds = ['1', '2', '3', '4', '5', '6', '7', '8'];
      storeService.dispatch(Action.SET_PAGE_IDS, pageIds);
      const algo = new CountPagesAlgorithm(storeService, pageManager);
      expect(algo.isStoryEligible()).to.be.true;
    });
  });

  describe('#initializePages', () => {
    it('should create a single page upon initialization', () => {
      const mockPage = {};
      const createPageStub = env.sandbox
        .stub(pageManager, 'createAdPage')
        .returns(mockPage);
      const algo = new CountPagesAlgorithm(storeService, pageManager);
      const pages = algo.initializePages();
      expect(pages[0]).to.equal(mockPage);
      expect(createPageStub).to.be.calledOnce;
    });
  });

  describe('#onPageChange', () => {
    it('places ad if enough pages seen & ad loaded', () => {
      env.sandbox.stub(pageManager, 'hasUnusedAdPage').returns(true);
      env.sandbox
        .stub(pageManager, 'getUnusedAdPage')
        .returns({isLoaded: () => true, hasTimedOut: () => false});
      const insertionStub = env.sandbox
        .stub(pageManager, 'maybeInsertPageAfter')
        .resolves(InsertionState.SUCCESS);
      const algo = new CountPagesAlgorithm(storeService, pageManager);
      // We do not get page change signal for page one.
      algo.onPageChange('2');
      algo.onPageChange('3');
      algo.onPageChange('4');
      algo.onPageChange('5');
      algo.onPageChange('6');
      expect(insertionStub).not.to.be.called;
      algo.onPageChange('7');
      expect(insertionStub).calledOnce;
    });

    it('does not place if ad is not loaded', () => {
      env.sandbox.stub(pageManager, 'hasUnusedAdPage').returns(true);
      env.sandbox
        .stub(pageManager, 'getUnusedAdPage')
        .returns({isLoaded: () => false, hasTimedOut: () => false});
      const insertionStub = env.sandbox
        .stub(pageManager, 'maybeInsertPageAfter')
        .resolves();
      const algo = new CountPagesAlgorithm(storeService, pageManager);
      // We do not get page change signal for page one.
      algo.onPageChange('2');
      algo.onPageChange('3');
      algo.onPageChange('4');
      algo.onPageChange('5');
      algo.onPageChange('6');
      algo.onPageChange('7');
      expect(insertionStub).not.to.be.called;
    });

    it('does not place ad if all ads used', () => {
      env.sandbox.stub(pageManager, 'hasUnusedAdPage').returns(false);
      env.sandbox
        .stub(pageManager, 'getUnusedAdPage')
        .returns({isLoaded: () => true, hasTimedOut: () => false});
      const insertionStub = env.sandbox
        .stub(pageManager, 'maybeInsertPageAfter')
        .resolves();
      const algo = new CountPagesAlgorithm(storeService, pageManager);
      // We do not get page change signal for page one.
      algo.onPageChange('2');
      algo.onPageChange('3');
      algo.onPageChange('4');
      algo.onPageChange('5');
      algo.onPageChange('6');
      algo.onPageChange('7');
      expect(insertionStub).not.to.be.called;
    });

    it('does not place ad if ad is loading', () => {
      env.sandbox.stub(pageManager, 'hasUnusedAdPage').returns(false);
      env.sandbox
        .stub(pageManager, 'getUnusedAdPage')
        .returns({isLoaded: () => false, hasTimedOut: () => false});
      const insertionStub = env.sandbox
        .stub(pageManager, 'maybeInsertPageAfter')
        .resolves();
      const algo = new CountPagesAlgorithm(storeService, pageManager);
      // We do not get page change signal for page one.
      algo.onPageChange('2');
      algo.onPageChange('3');
      algo.onPageChange('4');
      algo.onPageChange('5');
      algo.onPageChange('6');
      algo.onPageChange('7');
      expect(insertionStub).not.to.be.called;
    });

    it('discards ad on timeout', () => {
      env.sandbox.stub(pageManager, 'hasUnusedAdPage').returns(true);
      env.sandbox
        .stub(pageManager, 'getUnusedAdPage')
        .returns({isLoaded: () => false, hasTimedOut: () => true});
      env.sandbox.stub(pageManager, 'maybeInsertPageAfter').resolves();
      const discardStub = env.sandbox.stub(pageManager, 'discardCurrentAd');
      const algo = new CountPagesAlgorithm(storeService, pageManager);
      // We do not get page change signal for page one.
      algo.onPageChange('2');
      algo.onPageChange('3');
      algo.onPageChange('4');
      algo.onPageChange('5');
      algo.onPageChange('6');
      algo.onPageChange('7');
      expect(discardStub).to.be.called;
    });

    it('will place another ad after first view and 7 pages seen', async () => {
      const pageIds = new Array(15).fill(0).map((_, i) => (i + 1).toString());
      storeService.dispatch(Action.SET_PAGE_IDS, pageIds);
      env.sandbox.stub(pageManager, 'hasUnusedAdPage').returns(true);
      env.sandbox
        .stub(pageManager, 'getUnusedAdPage')
        .returns({isLoaded: () => true, hasTimedOut: () => false});
      const insertionStub = env.sandbox
        .stub(pageManager, 'maybeInsertPageAfter')
        .resolves(InsertionState.SUCCESS);
      const createPageStub = env.sandbox.stub(pageManager, 'createAdPage');
      const algo = new CountPagesAlgorithm(storeService, pageManager);
      // We do not get page change signal for page one.
      algo.onPageChange('2');
      algo.onPageChange('3');
      algo.onPageChange('4');
      algo.onPageChange('5');
      algo.onPageChange('6');
      expect(insertionStub).not.to.be.called;
      algo.onPageChange('7');
      expect(insertionStub).calledOnce;
      expect(createPageStub).not.to.be.called;
      await macroTask();
      algo.onNewAdView(7 /* index */);
      expect(createPageStub).to.be.called;
      algo.onPageChange('8');
      algo.onPageChange('9');
      algo.onPageChange('10');
      algo.onPageChange('11');
      algo.onPageChange('12');
      algo.onPageChange('13');
      algo.onPageChange('14');
      expect(insertionStub).calledTwice;
    });

    it('does not place another ad if there is a pending ad view', () => {
      env.sandbox.stub(pageManager, 'hasUnusedAdPage').returns(true);
      env.sandbox
        .stub(pageManager, 'getUnusedAdPage')
        .returns({isLoaded: () => true, hasTimedOut: () => false});
      const insertionStub = env.sandbox
        .stub(pageManager, 'maybeInsertPageAfter')
        .resolves(InsertionState.SUCCESS);
      const algo = new CountPagesAlgorithm(storeService, pageManager);
      // We do not get page change signal for page one.
      algo.onPageChange('2');
      algo.onPageChange('3');
      algo.onPageChange('4');
      algo.onPageChange('5');
      algo.onPageChange('6');
      expect(insertionStub).not.to.be.called;
      algo.onPageChange('7');
      expect(insertionStub).calledOnce;
      algo.onPageChange('8');
      algo.onPageChange('9');
      algo.onPageChange('10');
      algo.onPageChange('11');
      algo.onPageChange('12');
      algo.onPageChange('13');
      algo.onPageChange('14');
      expect(insertionStub).calledOnce;
    });

    it('does not place another ad if there is a pending insertion', () => {
      env.sandbox.stub(pageManager, 'hasUnusedAdPage').returns(true);
      env.sandbox
        .stub(pageManager, 'getUnusedAdPage')
        .returns({isLoaded: () => true, hasTimedOut: () => false});
      const insertionStub = env.sandbox
        .stub(pageManager, 'maybeInsertPageAfter')
        .returns(new Promise(() => {}));
      const algo = new CountPagesAlgorithm(storeService, pageManager);
      // We do not get page change signal for page one.
      algo.onPageChange('2');
      algo.onPageChange('3');
      algo.onPageChange('4');
      algo.onPageChange('5');
      algo.onPageChange('6');
      expect(insertionStub).not.to.be.called;
      algo.onPageChange('7');
      expect(insertionStub).calledOnce;
      algo.onPageChange('8');
      algo.onPageChange('9');
      algo.onPageChange('10');
      algo.onPageChange('11');
      algo.onPageChange('12');
      algo.onPageChange('13');
      algo.onPageChange('14');
      expect(insertionStub).calledOnce;
    });
  });

  describe('#onNewAdView', () => {
    it('should call to create next ad if > 7 pages left', () => {
      const pageIds = ['1', '2', '3', '4', '5', '6', '7', '8'];
      storeService.dispatch(Action.SET_PAGE_IDS, pageIds);
      const createPageStub = env.sandbox.stub(pageManager, 'createAdPage');
      const algo = new CountPagesAlgorithm(storeService, pageManager);
      algo.onNewAdView(0);
      expect(createPageStub).to.be.called;
    });

    it('should not call to create next ad if < 7 pages left', () => {
      const pageIds = ['1', '2', '3', '4', '5', '6', '7', '8'];
      storeService.dispatch(Action.SET_PAGE_IDS, pageIds);
      const createPageStub = env.sandbox.stub(pageManager, 'createAdPage');
      const algo = new CountPagesAlgorithm(storeService, pageManager);
      algo.onNewAdView(1);
      expect(createPageStub).not.to.be.called;
    });
  });
});
