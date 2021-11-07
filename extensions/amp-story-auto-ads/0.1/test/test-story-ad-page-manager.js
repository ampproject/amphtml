import {macroTask} from '#testing/helpers';

import {AmpStory} from '../../../amp-story/1.0/amp-story';
import {StoryAdPage} from '../story-ad-page';
import {InsertionState, StoryAdPageManager} from '../story-ad-page-manager';

// TODO(ccordry): add tests for analytics events.
describes.realWin('StoryAdPageManager', {amp: true}, (env) => {
  let doc;
  let ampStory;
  let mockConfig;
  let buildPageStub;
  let mockStoryPage;

  beforeEach(() => {
    doc = env.win.document;
    const storyElement = doc.createElement('amp-story');
    doc.body.appendChild(storyElement);
    ampStory = new AmpStory(storyElement);
    env.sandbox.stub(ampStory, 'getAmpDoc').returns(env.ampdoc);
    const storyAdPageEl = doc.createElement('amp-story-page');
    mockStoryPage = {isAd: () => true};
    storyAdPageEl.getImpl = () => Promise.resolve(mockStoryPage);
    buildPageStub = env.sandbox
      .stub(StoryAdPage.prototype, 'build')
      .returns(storyAdPageEl);
    mockConfig = {};
  });

  describe('#hasUnusedAdPage', () => {
    it('returns false when no ads have been created', () => {
      const pageManager = new StoryAdPageManager(ampStory, mockConfig);
      expect(pageManager.hasUnusedAdPage()).to.be.false;
    });

    it('returns true after ad creation', () => {
      const pageManager = new StoryAdPageManager(ampStory, mockConfig);
      pageManager.createAdPage();
      expect(pageManager.hasUnusedAdPage()).to.be.true;
    });
  });

  describe('#getUnusedAdPage', () => {
    it('throws when no ads available', () => {
      const pageManager = new StoryAdPageManager(ampStory, mockConfig);
      allowConsoleError(() => {
        expect(() => pageManager.getUnusedAdPage()).to.throw(
          'amp-story-auto-ads:page-manager all created ads consumed.'
        );
      });
    });

    it('returns an ad page', () => {
      const pageManager = new StoryAdPageManager(ampStory, mockConfig);
      pageManager.createAdPage();
      const page = pageManager.getUnusedAdPage();
      expect(page).to.exist;
      expect(page).is.instanceOf(StoryAdPage);
    });
  });

  describe('#discardCurrentAd', () => {
    it('marks pages as unavailable', () => {
      const pageManager = new StoryAdPageManager(ampStory, mockConfig);
      pageManager.createAdPage();
      expect(pageManager.hasUnusedAdPage()).to.be.true;
      pageManager.discardCurrentAd();
      expect(pageManager.hasUnusedAdPage()).to.be.false;
    });
  });

  describe('#numberOfAdsCreated', () => {
    it('keeps track of creations', () => {
      const pageManager = new StoryAdPageManager(ampStory, mockConfig);
      expect(pageManager.numberOfAdsCreated()).to.equal(0);
      pageManager.createAdPage();
      expect(pageManager.numberOfAdsCreated()).to.equal(1);
      pageManager.createAdPage();
      expect(pageManager.numberOfAdsCreated()).to.equal(2);
      pageManager.createAdPage();
      expect(pageManager.numberOfAdsCreated()).to.equal(3);
    });
  });

  describe('#createAdPage', () => {
    it('creates page, adds to dom, and adds to parent story impl', async () => {
      const addPageSpy = env.sandbox.spy(ampStory, 'addPage');
      const pageManager = new StoryAdPageManager(ampStory, mockConfig);
      pageManager.createAdPage();
      expect(buildPageStub).to.be.calledOnce;
      const storyPage = doc.querySelector('amp-story-page');
      expect(storyPage).to.exist;
      await macroTask();
      expect(addPageSpy).to.be.calledWithExactly(mockStoryPage);
    });
  });

  describe('#hasId', () => {
    it('keeps track of ids', () => {
      const pageManager = new StoryAdPageManager(ampStory, mockConfig);
      expect(pageManager.hasId('i-amphtml-ad-page-1')).to.be.false;
      expect(pageManager.hasId('i-amphtml-ad-page-2')).to.be.false;
      pageManager.createAdPage();
      expect(pageManager.hasId('i-amphtml-ad-page-1')).to.be.true;
      expect(pageManager.hasId('i-amphtml-ad-page-2')).to.be.false;
      pageManager.createAdPage();
      expect(pageManager.hasId('i-amphtml-ad-page-2')).to.be.true;
    });
  });

  describe('#getAdPageById', () => {
    it('returns an ad page', () => {
      const pageManager = new StoryAdPageManager(ampStory, mockConfig);
      const page0 = pageManager.getAdPageById('i-amphtml-ad-page-1');
      pageManager.createAdPage();
      expect(page0).not.to.exist;
      const page1 = pageManager.getAdPageById('i-amphtml-ad-page-1');
      expect(page1).to.exist;
      expect(page1).is.instanceOf(StoryAdPage);
    });
  });

  describe('#getIndexById', () => {
    it('keeps track of indicies', () => {
      const pageManager = new StoryAdPageManager(ampStory, mockConfig);
      pageManager.createAdPage();
      pageManager.createAdPage();
      expect(pageManager.getIndexById('i-amphtml-ad-page-1')).to.equal(1);
      expect(pageManager.getIndexById('i-amphtml-ad-page-2')).to.equal(2);
    });
  });

  describe('#maybeInsertPageAfter', () => {
    it('returns delayed status if no page after ad', async () => {
      const pageBeforeElement = {hasAttribute: () => false};
      const mockPageBefore = {element: pageBeforeElement, isAd: () => true};
      const mockPageAfter = {isAd: () => false};
      env.sandbox.stub(ampStory, 'getPageById').returns(mockPageBefore);
      env.sandbox.stub(ampStory, 'getNextPage').returns(mockPageAfter);
      env.sandbox.stub(ampStory, 'getPageIndexById').returns(0);

      const pageManager = new StoryAdPageManager(ampStory, mockConfig);
      pageManager.createAdPage();
      const nextAdPage = pageManager.getUnusedAdPage();
      const result = await pageManager.maybeInsertPageAfter('one', nextAdPage);
      expect(result).to.equal(InsertionState.DELAYED);
    });

    it('returns delayed status if next-page-no-ad attr', async () => {
      const pageBeforeElement = {
        hasAttribute: (name) => name === 'next-page-no-ad',
      };
      const mockPageBefore = {element: pageBeforeElement, isAd: () => false};
      const mockPageAfter = {isAd: () => false};
      env.sandbox.stub(ampStory, 'getPageById').returns(mockPageBefore);
      env.sandbox.stub(ampStory, 'getNextPage').returns(mockPageAfter);
      env.sandbox.stub(ampStory, 'getPageIndexById').returns(0);

      const pageManager = new StoryAdPageManager(ampStory, mockConfig);
      pageManager.createAdPage();
      const nextAdPage = pageManager.getUnusedAdPage();
      const result = await pageManager.maybeInsertPageAfter('one', nextAdPage);
      expect(result).to.equal(InsertionState.DELAYED);
    });

    it('fails if cta is not created', async () => {
      const pageBeforeElement = {hasAttribute: () => false};
      const mockPageBefore = {element: pageBeforeElement, isAd: () => false};
      const mockPageAfter = {isAd: () => false};
      env.sandbox.stub(ampStory, 'getPageById').returns(mockPageBefore);
      env.sandbox.stub(ampStory, 'getNextPage').returns(mockPageAfter);
      env.sandbox.stub(ampStory, 'getPageIndexById').returns(0);

      const pageManager = new StoryAdPageManager(ampStory, mockConfig);
      pageManager.createAdPage();
      const nextAdPage = pageManager.getUnusedAdPage();
      env.sandbox.stub(nextAdPage, 'maybeCreateCta').resolves(false);
      const result = await pageManager.maybeInsertPageAfter('one', nextAdPage);
      expect(result).to.equal(InsertionState.FAILURE);
    });

    it('successfully inserts and marks as used', async () => {
      const pageBeforeElement = {hasAttribute: () => false};
      const mockPageBefore = {element: pageBeforeElement, isAd: () => false};
      const mockPageAfter = {isAd: () => false};
      env.sandbox.stub(ampStory, 'getPageById').returns(mockPageBefore);
      env.sandbox.stub(ampStory, 'getNextPage').returns(mockPageAfter);
      const insertStub = env.sandbox.stub(ampStory, 'insertPage').returns(true);
      env.sandbox.stub(ampStory, 'getPageIndexById').returns(0);

      const pageManager = new StoryAdPageManager(ampStory, mockConfig);
      pageManager.createAdPage();
      const nextAdPage = pageManager.getUnusedAdPage();
      env.sandbox.stub(nextAdPage, 'maybeCreateCta').resolves(true);
      expect(pageManager.hasUnusedAdPage()).to.be.true;
      const result = await pageManager.maybeInsertPageAfter('one', nextAdPage);
      expect(insertStub).to.be.calledWith('one', 'i-amphtml-ad-page-1');
      expect(pageManager.hasUnusedAdPage()).to.be.false;
      expect(result).to.equal(InsertionState.SUCCESS);
    });
  });
});
