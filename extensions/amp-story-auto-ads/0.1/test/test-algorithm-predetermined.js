import {StoryAdPlacements} from '#experiments/story-ad-placements';

import {Services} from '#service';

import {AmpStory} from '../../../amp-story/1.0/amp-story';
import {
  Action,
  getStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import {
  PredeterminedPositionAlgorithm,
  getAdPositions,
  getNumberOfAds,
} from '../algorithm-predetermined';
import {StoryAdPageManager} from '../story-ad-page-manager';

describes.realWin('PredeterminedPositionAlgorithm', {amp: true}, (env) => {
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

  describe('PredeterminedPositionAlgorithm implementation', () => {
    describe('#isStoryEligible', () => {
      it('returns false for stories < 5 pages', () => {
        const pageIds = ['1', '2', '3', '4'];
        storeService.dispatch(Action.SET_PAGE_IDS, pageIds);
        const algo = new PredeterminedPositionAlgorithm(
          storeService,
          pageManager,
          StoryAdPlacements.PREDETERMINED_EIGHT
        );
        expect(algo.isStoryEligible()).to.be.false;
      });

      it('returns true for stories >= 5 pages', () => {
        const pageIds = ['1', '2', '3', '4', '5'];
        storeService.dispatch(Action.SET_PAGE_IDS, pageIds);
        const algo = new PredeterminedPositionAlgorithm(
          storeService,
          pageManager,
          StoryAdPlacements.PREDETERMINED_EIGHT
        );
        expect(algo.isStoryEligible()).to.be.true;
      });
    });

    describe('#initializePages', () => {
      it('should create and insert a single page', () => {
        const pageIds = ['1', '2', '3', '4', '5', '6', '7', '8'];
        storeService.dispatch(Action.SET_PAGE_IDS, pageIds);
        const mockPage = {registerLoadCallback: env.sandbox.stub().callsArg(0)};
        const createPageStub = env.sandbox
          .stub(pageManager, 'createAdPage')
          .returns(mockPage);
        const insertPageStub = env.sandbox.stub(
          pageManager,
          'maybeInsertPageAfter'
        );
        const algo = new PredeterminedPositionAlgorithm(
          storeService,
          pageManager,
          StoryAdPlacements.PREDETERMINED_EIGHT
        );
        const pages = algo.initializePages();
        expect(pages[0]).to.equal(mockPage);
        expect(createPageStub).to.be.calledOnce;
        expect(insertPageStub).to.be.calledWithExactly('4', mockPage);
      });

      it('does not create a page when num ads == 0 ', () => {
        env.sandbox.stub(Math, 'random').returns(6 / 8);
        const pageIds = ['1', '2', '3', '4', '5'];
        storeService.dispatch(Action.SET_PAGE_IDS, pageIds);
        const mockPage = {registerLoadCallback: env.sandbox.stub().callsArg(0)};
        const createPageStub = env.sandbox
          .stub(pageManager, 'createAdPage')
          .returns(mockPage);
        const insertPageStub = env.sandbox.stub(
          pageManager,
          'maybeInsertPageAfter'
        );
        const algo = new PredeterminedPositionAlgorithm(
          storeService,
          pageManager,
          StoryAdPlacements.PREDETERMINED_EIGHT
        );
        const pages = algo.initializePages();
        expect(pages[0]).not.to.exist;
        expect(createPageStub).not.to.be.called;
        expect(insertPageStub).not.to.be.called;
      });
    });

    describe('#onNewAdView', () => {
      it('should create and insert the next ad page', () => {
        // ['1' ... '16']
        const pageIds = new Array(16).fill(0).map((_, i) => (i + 1).toString());
        storeService.dispatch(Action.SET_PAGE_IDS, pageIds);
        const mockPage = {registerLoadCallback: env.sandbox.stub().callsArg(0)};
        const createPageStub = env.sandbox
          .stub(pageManager, 'createAdPage')
          .returns(mockPage);
        const insertPageStub = env.sandbox.stub(
          pageManager,
          'maybeInsertPageAfter'
        );
        const algo = new PredeterminedPositionAlgorithm(
          storeService,
          pageManager,
          StoryAdPlacements.PREDETERMINED_EIGHT
        );
        algo.initializePages();
        algo.onNewAdView();
        expect(createPageStub).to.be.calledTwice;
        expect(insertPageStub).to.be.calledWithExactly('6', mockPage);
        expect(insertPageStub).to.be.calledWithExactly('11', mockPage);
      });
    });
  });

  describe('helpers', () => {
    describe('getAdPositions', () => {
      it('should pick the right position for short stories', () => {
        expect(getAdPositions(0, 0)).to.eql([]);
        expect(getAdPositions(5, 0)).to.eql([]);
        expect(getAdPositions(10, 0)).to.eql([]);
        expect(getAdPositions(5, 1)).to.eql([3]);
        expect(getAdPositions(6, 1)).to.eql([3]);
        expect(getAdPositions(7, 1)).to.eql([4]);
        expect(getAdPositions(8, 1)).to.eql([4]);
        expect(getAdPositions(9, 1)).to.eql([5]);
        expect(getAdPositions(10, 1)).to.eql([5]);
        expect(getAdPositions(12, 1)).to.eql([6]);
        expect(getAdPositions(13, 1)).to.eql([7]);
        expect(getAdPositions(8, 2)).to.eql([3, 6]);
        expect(getAdPositions(9, 2)).to.eql([3, 6]);
        expect(getAdPositions(10, 2)).to.eql([4, 7]);
        expect(getAdPositions(11, 2)).to.eql([4, 8]);
        expect(getAdPositions(12, 2)).to.eql([4, 8]);
        expect(getAdPositions(13, 2)).to.eql([5, 9]);
        expect(getAdPositions(14, 2)).to.eql([5, 10]);
        expect(getAdPositions(20, 3)).to.eql([5, 10, 15]);
      });
    });

    describe('getNumberOfAds', () => {
      it('should choose exact number if multipe of interval', () => {
        expect(getNumberOfAds(8, 8)).to.equal(1);
        expect(getNumberOfAds(16, 8)).to.equal(2);
      });

      it('should add extra ad if dice roll is < remainder / interval', () => {
        env.sandbox.stub(Math, 'random').returns(4 / 8);
        expect(getNumberOfAds(5, 8)).to.equal(1);
        expect(getNumberOfAds(13, 8)).to.equal(2);
      });

      it('should not add extra ad if if dice roll is > remainder / interval', () => {
        env.sandbox.stub(Math, 'random').returns(4 / 8);
        expect(getNumberOfAds(3, 8)).to.equal(0);
        expect(getNumberOfAds(11, 8)).to.equal(1);
      });
    });
  });
});
