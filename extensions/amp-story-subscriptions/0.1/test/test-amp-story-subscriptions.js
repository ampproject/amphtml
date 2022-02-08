import '../amp-story-subscriptions';
import {expect} from 'chai';

import * as Preact from '#core/dom/jsx';

import {toggleExperiment} from '#experiments';

import {Services} from '#service';

import {afterRenderPromise} from '#testing/helpers';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {AmpStory} from '../../../amp-story/1.0/amp-story';
import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../../../amp-story/1.0/amp-story-store-service';
import {SubscriptionService} from '../../../amp-subscriptions/0.1/amp-subscriptions';
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
    let storyEl;
    let story;
    let subscriptionsEl;
    let storeService;
    let storySubscriptions;
    let subscriptionService;

    /**
     * @param {number} count
     * @param {Array<string>=} ids
     * @return {!Array<!Element>}
     */
    async function createStoryWithPages(count, ids = [], autoAdvance = false) {
      const pageArray = Array(count)
        .fill(undefined)
        .map((unused, i) => {
          const page = doc.createElement('amp-story-page');
          if (autoAdvance) {
            page.setAttribute('auto-advance-after', '2s');
          }
          page.id = ids && ids[i] ? ids[i] : `-page-${i}`;
          storyEl.appendChild(page);
          return page;
        });
      story = await storyEl.getImpl();

      return pageArray;
    }

    beforeEach(async () => {
      win = env.win;
      doc = win.document;

      toggleExperiment(win, 'amp-story-paywall-exp', true);

      storeService = new AmpStoryStoreService(win);
      env.sandbox
        .stub(Services, 'storyStoreServiceForOrNull')
        .returns(Promise.resolve(storeService));
      env.sandbox.stub(Services, 'storyStoreService').returns(storeService);

      // Stub out functions not needed for the tests.
      env.sandbox.stub(win.history, 'replaceState');
      registerServiceBuilder(win, 'performance', function () {
        return {
          isPerformanceTrackingOn: () => false,
        };
      });

      subscriptionsEl = doc.createElement('amp-story-subscriptions');
      storyEl = doc.createElement('amp-story');
      storyEl.appendChild(subscriptionsEl);
      doc.body.appendChild(storyEl);

      storySubscriptions = new AmpStorySubscriptions(subscriptionsEl);

      const subscriptionServiceConfigEl = (
        <script type="application/json" id="amp-subscriptions"></script>
      );
      const platformConfig = {
        'services': [
          {
            'authorizationUrl':
              'https://scenic-2017.appspot.com/amp-entitlements?pubid=scenic-2017.appspot.com&meter=1&rid=READER_ID',
            'pingbackUrl':
              'https://scenic-2017.appspot.com/amp-pingback?pubid=scenic-2017.appspot.com',
            'actions': {
              'login': 'https://scenic-2017.appspot.com/signin?rid=READER_ID',
              'subscribe': 'https://scenic-2017.appspot.com/subscribe',
            },
          },
          {
            'serviceId': 'subscribe.google.com',
          },
        ],
      };
      subscriptionServiceConfigEl.innerHTML = JSON.stringify(platformConfig);
      doc.head.appendChild(subscriptionServiceConfigEl);

      const pageConfigEl = <script type="application/ld+json"></script>;
      const pageConfig = {
        '@context': 'http://schema.org',
        '@type': 'NewsArticle',
        'isAccessibleForFree': 'False',
        'isPartOf': {
          '@type': ['CreativeWork', 'Product'],
          'name': 'Product A',
          'productID': 'scenic-2017.appspot.com:news',
        },
      };
      pageConfigEl.innerHTML = JSON.stringify(pageConfig);
      doc.head.appendChild(pageConfigEl);

      subscriptionService = new SubscriptionService(env.ampdoc);
      subscriptionService.start();
      env.sandbox
        .stub(subscriptionService, 'getGrantStatus')
        .returns(Promise.resolve(false));
      env.sandbox
        .stub(Services, 'subscriptionsServiceForDoc')
        .returns(Promise.resolve(subscriptionService));

      await createStoryWithPages(4, ['cover', 'page-1', 'page-2', 'page-3']);
      await story.layoutCallback();
    });

    it('should contain amp-subscriptions attributes', async () => {
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
      storeService.dispatch(Action.TOGGLE_SUBSCRIPTIONS_DIALOG, true);

      await afterRenderPromise(win);
      expect(storySubscriptions.element).to.have.class(
        'i-amphtml-story-subscriptions-visible'
      );
    });

    it('should display the blocking paywall when switching to a paywall protected page', async () => {
      await story.switchTo_('page-1');

      env.sandbox
        .stub(storeService, 'get')
        .withArgs(StateProperty.SUBSCRIPTIONS_DIALOG_STATE)
        .returns(false);

      await story.switchTo_('page-2');

      await afterRenderPromise(win);
      expect(storySubscriptions.element).to.have.class(
        'i-amphtml-story-subscriptions-visible'
      );
    });
  }
);
