import * as Preact from '#core/dom/jsx';

import {toggleExperiment} from '#experiments';

import {Services} from '#service';

import {afterRenderPromise} from '#testing/helpers';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {
  Action,
  AmpStoryStoreService,
  StateProperty,
  SubscriptionsState,
} from '../../../amp-story/1.0/amp-story-store-service';
import {SubscriptionService} from '../../../amp-subscriptions/0.1/amp-subscriptions';
import {Dialog} from '../../../amp-subscriptions/0.1/dialog';
import {Entitlement} from '../../../amp-subscriptions/0.1/entitlement';
import {AmpStorySubscriptions} from '../amp-story-subscriptions';

describes.realWin(
  'amp-story-subscriptions-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-subscriptions:0.1'],
    },
  },
  (env) => {
    let win;
    let doc;
    let subscriptionsEl;
    let storeService;
    let storySubscriptions;
    let subscriptionService;

    const nextTick = () => new Promise((resolve) => win.setTimeout(resolve, 0));

    beforeEach(async () => {
      win = env.win;
      doc = win.document;

      toggleExperiment(win, 'amp-story-subscriptions', true);

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

      // Specify platfrom config
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

      // Specify page config
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
        .stub(Services, 'subscriptionsServiceForDoc')
        .returns(Promise.resolve(subscriptionService));

      const storyEl = doc.createElement('amp-story');
      subscriptionsEl = (
        <amp-story-subscriptions layout="container"> </amp-story-subscriptions>
      );
      storyEl.appendChild(subscriptionsEl);
      win.document.body.appendChild(storyEl);
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

    it('should activate subscription platform and display the blocking paywall on dialog UI state update', async () => {
      const maybeRenderDialogForSelectedPlatformSpy = env.sandbox.spy(
        subscriptionService,
        'maybeRenderDialogForSelectedPlatform'
      );

      storySubscriptions = new AmpStorySubscriptions(subscriptionsEl);
      await nextTick(); // wait to make sure AmpStorySubscriptions is built.

      storeService.dispatch(Action.TOGGLE_SUBSCRIPTIONS_DIALOG_UI_STATE, true);

      await afterRenderPromise(win);
      expect(storySubscriptions.element).to.have.class(
        'i-amphtml-story-subscriptions-visible'
      );
      expect(maybeRenderDialogForSelectedPlatformSpy).to.be.calledOnce;
    });

    it('should update subscription state to blocked once grant status from subscription service resolves to false', async () => {
      expect(storeService.get(StateProperty.SUBSCRIPTIONS_STATE)).to.equal(
        SubscriptionsState.UNKNOWN
      );
      env.sandbox
        .stub(subscriptionService, 'getGrantStatus')
        .returns(Promise.resolve(false));

      storySubscriptions = new AmpStorySubscriptions(subscriptionsEl);
      await nextTick();
      expect(storeService.get(StateProperty.SUBSCRIPTIONS_STATE)).to.equal(
        SubscriptionsState.BLOCKED
      );
    });

    it('should update subscription state to granted once grant status from subscription service resolves to true', async () => {
      expect(storeService.get(StateProperty.SUBSCRIPTIONS_STATE)).to.equal(
        SubscriptionsState.UNKNOWN
      );
      env.sandbox
        .stub(subscriptionService, 'getGrantStatus')
        .returns(Promise.resolve(true));

      storySubscriptions = new AmpStorySubscriptions(subscriptionsEl);
      await nextTick();
      expect(storeService.get(StateProperty.SUBSCRIPTIONS_STATE)).to.equal(
        SubscriptionsState.GRANTED
      );
    });
  }
);
