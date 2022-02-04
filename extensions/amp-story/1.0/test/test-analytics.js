import {installDocService} from '#service/ampdoc-impl';

import {Action, getStoreService} from '../amp-story-store-service';
import {getAnalyticsService} from '../story-analytics';

describes.fakeWin('amp-story analytics', {}, (env) => {
  let analytics;
  let rootEl;
  let storeService;

  beforeEach(() => {
    const {win} = env;

    rootEl = win.document.createElement('div');
    storeService = getStoreService(win);
    analytics = getAnalyticsService(win, rootEl);
    win.document.body.appendChild(rootEl);
    installDocService(win, true);
  });

  it('should trigger `story-page-visible` on change', () => {
    const trigger = env.sandbox.stub(analytics, 'triggerEvent');

    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'test-page',
      index: 1,
    });

    expect(trigger).to.have.been.calledWith('story-page-visible');
  });

  it('should trigger `story-last-page-visible` when last page is visible', () => {
    const trigger = env.sandbox.stub(analytics, 'triggerEvent');

    storeService.dispatch(Action.SET_PAGE_IDS, ['cover', 'page1', 'page2']);
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'page1',
      index: 1,
    });
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'page2',
      index: 2,
    });

    expect(trigger).to.have.been.calledWith('story-last-page-visible');
  });

  it('should not mark an event as repeated the first time it fires', () => {
    const trigger = env.sandbox.spy(analytics, 'triggerEvent');

    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'test-page',
      index: 1,
    });

    expect(trigger).to.have.been.calledOnceWith('story-page-visible');

    const details = analytics.updateDetails('story-page-visible');
    expect(details.eventDetails).to.deep.equal({});
  });

  it('should mark event as repeated when fired more than once', () => {
    const trigger = env.sandbox.spy(analytics, 'triggerEvent');

    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'test-page',
      index: 1,
    });

    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'test-page2',
      index: 2,
    });

    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'test-page',
      index: 1,
    });

    expect(trigger).to.have.been.calledWith('story-page-visible');
    expect(trigger).to.have.been.calledThrice;
    expect(
      analytics.updateDetails('story-page-visible').eventDetails
    ).to.deep.include({
      'repeated': true,
    });
  });
});
