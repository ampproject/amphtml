import * as Preact from '#core/dom/jsx';

import {Services} from '#service';
import {LocalizationService} from '#service/localization';

import {afterRenderPromise} from '#testing/helpers';

import {
  Action,
  AmpStoryStoreService,
  StateProperty,
  SubscriptionsState,
} from '../../../amp-story/1.0/amp-story-store-service';
import {SubscriptionService} from '../../../amp-subscriptions/0.1/amp-subscriptions';
import {Dialog} from '../../../amp-subscriptions/0.1/dialog';
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

      storeService = new AmpStoryStoreService(win);
      env.sandbox
        .stub(Services, 'storyStoreServiceForOrNull')
        .returns(Promise.resolve(storeService));
      env.sandbox.stub(Services, 'storyStoreService').returns(storeService);

      const localizationService = new LocalizationService(doc.body);
      env.sandbox
        .stub(Services, 'localizationServiceForOrNull')
        .returns(Promise.resolve(localizationService));

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
      doc.head.appendChild(
        <script type="application/json" id="amp-subscriptions">
          {JSON.stringify(platformConfig)}
        </script>
      );

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
      doc.head.appendChild(
        <script type="application/ld+json">{JSON.stringify(pageConfig)}</script>
      );

      subscriptionService = new SubscriptionService(env.ampdoc);
      subscriptionService.start();
      env.sandbox
        .stub(Services, 'subscriptionsServiceForDoc')
        .returns(Promise.resolve(subscriptionService));

      const storyEl = doc.createElement('amp-story');
      subscriptionsEl = (
        <amp-story-subscriptions layout="container"> </amp-story-subscriptions>
      );
      storySubscriptions = new AmpStorySubscriptions(subscriptionsEl);
      storyEl.appendChild(subscriptionsEl);
      win.document.body.appendChild(storyEl);
      await subscriptionsEl.whenBuilt();
    });

    it('should contain amp-subscriptions attributes: subscriptions-dialog', async () => {
      expect(
        subscriptionsEl
          .querySelector('div')
          .hasAttribute('subscriptions-dialog')
      ).to.equal(true);
    });

    it('should contain amp-subscriptions attributes: subscriptions-display', async () => {
      expect(
        subscriptionsEl
          .querySelector('div')
          .getAttribute('subscriptions-display')
      ).to.equal('NOT granted');
    });

    describe('should activate subscription platform and show paywall on dialog UI state update to true', async () => {
      let maybeRenderDialogForSelectedPlatformSpy;

      beforeEach(() => {
        maybeRenderDialogForSelectedPlatformSpy = env.sandbox.spy(
          subscriptionService,
          'maybeRenderDialogForSelectedPlatform'
        );
        storeService.dispatch(
          Action.TOGGLE_SUBSCRIPTIONS_DIALOG_UI_STATE,
          false
        );
      });

      it('paywall element should have visible class', async () => {
        storeService.dispatch(
          Action.TOGGLE_SUBSCRIPTIONS_DIALOG_UI_STATE,
          true
        );
        await afterRenderPromise(win);

        expect(storySubscriptions.element).to.have.class(
          'i-amphtml-story-subscriptions-visible'
        );
      });

      it('should render paywall element', async () => {
        storeService.dispatch(
          Action.TOGGLE_SUBSCRIPTIONS_DIALOG_UI_STATE,
          true
        );
        await afterRenderPromise(win);

        expect(maybeRenderDialogForSelectedPlatformSpy).to.be.calledOnce;
      });
    });

    describe('should hide the paywall on dialog UI state update to false', async () => {
      let dialogCloseSpy;

      beforeEach(() => {
        const dialog = new Dialog(env.ampdoc);
        dialogCloseSpy = env.sandbox.spy(dialog, 'close');
        env.sandbox.stub(subscriptionService, 'getDialog').returns(dialog);
        storeService.dispatch(
          Action.TOGGLE_SUBSCRIPTIONS_DIALOG_UI_STATE,
          true
        );
      });

      it('paywall element should not have visible class', async () => {
        storeService.dispatch(
          Action.TOGGLE_SUBSCRIPTIONS_DIALOG_UI_STATE,
          false
        );
        await afterRenderPromise(win);

        expect(storySubscriptions.element).to.not.have.class(
          'i-amphtml-story-subscriptions-visible'
        );
      });

      it('should hide paywall element', async () => {
        storeService.dispatch(
          Action.TOGGLE_SUBSCRIPTIONS_DIALOG_UI_STATE,
          false
        );
        await afterRenderPromise(win);

        expect(dialogCloseSpy).to.be.calledOnce;
      });
    });

    it('should update subscription state to blocked once grant status from subscription service resolves to false', async () => {
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
