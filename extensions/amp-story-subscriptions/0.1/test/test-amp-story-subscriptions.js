import '../amp-story-subscriptions';
import * as Preact from '#core/dom/jsx';

import {Services} from '#service';

import {afterRenderPromise} from '#testing/helpers';

import {
  Action,
  AmpStoryStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import {AmpStorySubscriptions} from '../amp-story-subscriptions';

describes.realWin(
  'amp-story-subscriptions-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story:1.0', 'amp-story-subscriptions:0.1'],
    },
  },
  (env) => {
    let win;
    let doc;
    let subscriptionsEl;
    let storeService;
    let storySubscriptions;

    const nextTick = () => new Promise((resolve) => win.setTimeout(resolve, 0));

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      storeService = new AmpStoryStoreService(win);
      env.sandbox
        .stub(Services, 'storyStoreServiceForOrNull')
        .returns(Promise.resolve(storeService));

      subscriptionsEl = (
        <amp-story-subscriptions layout="container"> </amp-story-subscriptions>
      );
      const storyEl = doc.createElement('amp-story');
      storyEl.appendChild(subscriptionsEl);
      doc.body.appendChild(storyEl);

      storySubscriptions = new AmpStorySubscriptions(subscriptionsEl);
    });

    it('should contain amp-subscriptions attributes', async () => {
      await subscriptionsEl.whenBuilt();
      expect(
        subscriptionsEl
          .querySelector('div')
          .hasAttribute('subscriptions-dialog')
      ).to.equal(true);
      expect(
        subscriptionsEl
          .querySelector('div')
          .getAttribute('subscriptions-display')
      ).to.equal('NOT granted');
    });

    it('should display the blocking paywall on state update', async () => {
      await storySubscriptions.buildCallback();
      await nextTick();

      storeService.dispatch(Action.TOGGLE_SUBSCRIPTIONS_DIALOG_UI_STATE, true);

      await afterRenderPromise(win);
      expect(storySubscriptions.element).to.have.class(
        'i-amphtml-story-subscriptions-visible'
      );
    });
  }
);
