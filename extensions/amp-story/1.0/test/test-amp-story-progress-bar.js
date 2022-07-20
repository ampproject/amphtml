import {expect} from 'chai';

import {forceExperimentBranch} from '#experiments';
import {StoryAdSegmentExp} from '#experiments/story-ad-progress-segment';

import {Services} from '#service';

import {Action, getStoreService} from '../amp-story-store-service';
import {ProgressBar} from '../progress-bar';

describes.realWin('amp-story-progress-bar', {amp: true}, (env) => {
  let win;
  let doc;
  let storeService;
  let progressBar;

  beforeEach(() => {
    win = env.win;
    doc = env.win.document;
    const mutator = Services.mutatorForDoc(env.ampdoc);
    // Sync mutate element.
    env.sandbox.stub(mutator, 'mutateElement').callsFake((el, cb) => {
      cb();
      return Promise.resolve();
    });
    storeService = getStoreService(env.win);
    const storyEl = doc.createElement('amp-story');
    storeService.dispatch(Action.SET_PAGE_IDS, [
      'page-1',
      'page-2',
      'page-3',
      'page-4',
      'page-5',
    ]);
    progressBar = ProgressBar.create(env.win, storyEl);
    doc.body.appendChild(progressBar.build('page-1'));
  });

  describe('story page segment', async () => {
    it('should create progress bar with pages', () => {
      expect(
        doc.querySelectorAll('.i-amphtml-story-page-progress-value')
      ).to.have.length.of(5);
    });
  });

  describe('story ad progress segment', async () => {
    it('should create progress bar with ad pages', () => {
      forceExperimentBranch(
        win,
        StoryAdSegmentExp.ID,
        StoryAdSegmentExp.AUTO_ADVANCE_NEW_CTA
      );
      expect(doc.querySelector('.i-amphtml-story-ad-progress-value')).not.to
        .exist;
      progressBar.activeSegmentId_ = 'page-3';
      storeService.dispatch(Action.SET_PAGE_IDS, [
        'page-1',
        'page-2',
        'page-3',
        'i-amphtml-ad-page-0',
        'page-4',
        'page-5',
      ]);

      expect(
        doc.querySelectorAll('.i-amphtml-story-page-progress-value')
      ).to.have.length.of(6);
      expect(
        doc.querySelectorAll('.i-amphtml-story-ad-progress-value')
      ).to.have.length.of(1);
    });
  });
});
