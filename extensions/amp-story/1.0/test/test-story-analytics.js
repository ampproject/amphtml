import * as analytics from '#utils/analytics';

import {getAmpdoc} from 'src/service-helpers';

import {Action, getStoreService} from '../amp-story-store-service';
import {getAnalyticsService} from '../story-analytics';

describes.realWin('amp-story-analytics', {amp: true}, (env) => {
  let el;
  let storeService;

  beforeEach(() => {
    const {win} = env;
    el = win.document.createElement('amp-story');
    win.document.body.appendChild(el);
    storeService = getStoreService(win);
    getAnalyticsService(win, el);
  });

  it('sends story-page-visible on current page change', async () => {
    const triggerAnalyticsStub = env.sandbox.stub(
      analytics,
      'triggerAnalyticsEvent'
    );
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'page-1',
      index: 0,
    });

    await getAmpdoc(env.win.document).whenFirstVisible();

    expect(triggerAnalyticsStub).to.have.been.calledOnceWithExactly(
      el,
      'story-page-visible',
      env.sandbox.match({storyPageIndex: 0, storyPageId: 'page-1'})
    );
  });

  it('does not send story-page-visible on ad page', () => {
    const triggerAnalyticsStub = env.sandbox.stub(
      analytics,
      'triggerAnalyticsEvent'
    );
    storeService.dispatch(Action.TOGGLE_AD, true);
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'ad-page-1',
      index: 1,
    });
    expect(triggerAnalyticsStub).not.to.be.called;
  });

  it('does not send story-page-visible before document becomes visible', async () => {
    const triggerAnalyticsStub = env.sandbox.stub(
      analytics,
      'triggerAnalyticsEvent'
    );
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'page-1',
      index: 0,
    });
    expect(triggerAnalyticsStub).not.to.be.called;

    await getAmpdoc(env.win.document).whenFirstVisible();

    expect(triggerAnalyticsStub).to.have.been.calledOnceWithExactly(
      el,
      'story-page-visible',
      env.sandbox.match({storyPageIndex: 0, storyPageId: 'page-1'})
    );
  });

  it('sends story-page-visible on content page after ad page', async () => {
    const triggerAnalyticsStub = env.sandbox.stub(
      analytics,
      'triggerAnalyticsEvent'
    );
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'page-1',
      index: 0,
    });

    await getAmpdoc(env.win.document).whenFirstVisible();

    expect(triggerAnalyticsStub).to.have.been.calledOnceWithExactly(
      el,
      'story-page-visible',
      env.sandbox.match({storyPageIndex: 0, storyPageId: 'page-1'})
    );
    storeService.dispatch(Action.TOGGLE_AD, true);
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'ad-page-1',
      index: 1,
    });
    expect(triggerAnalyticsStub).to.have.been.calledOnce;
    storeService.dispatch(Action.TOGGLE_AD, false);
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'page-2',
      index: 2,
    });

    await getAmpdoc(env.win.document).whenFirstVisible();

    expect(triggerAnalyticsStub).to.have.been.calledTwice;
    expect(triggerAnalyticsStub.secondCall).to.have.been.calledWithExactly(
      el,
      'story-page-visible',
      env.sandbox.match({storyPageIndex: 2, storyPageId: 'page-2'})
    );
  });
});
