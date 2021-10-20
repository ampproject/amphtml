import {Action, getStoreService} from '../amp-story-store-service';
import {ProgressBar} from '../progress-bar';
import {Services} from '#service';
import {StoryAdSegmentExp} from '#experiments/story-ad-progress-segment';
import {expect} from 'chai';
import {forceExperimentBranch} from '#experiments';

describes.realWin('amp-story-progress-bar', {amp: true}, (env) => {
  let win;
  let doc;
  let storeService;

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
    const progressBar = ProgressBar.create(env.win, storyEl).build('page-1');
    doc.body.appendChild(progressBar);
  });

  describe('story ad progress segment', async () => {
    it('should create/remove ad segment based on ad visibility', () => {
      forceExperimentBranch(
        win,
        StoryAdSegmentExp.ID,
        StoryAdSegmentExp.EIGHT_SECONDS
      );
      expect(doc.querySelector('.i-amphtml-story-ad-progress-value')).not.to
        .exist;
      storeService.dispatch(Action.TOGGLE_AD, true);
      expect(doc.querySelector('.i-amphtml-story-ad-progress-value')).to.exist;
      storeService.dispatch(Action.TOGGLE_AD, false);
      expect(doc.querySelector('.i-amphtml-story-ad-progress-value')).not.to
        .exist;
    });
  });
});
