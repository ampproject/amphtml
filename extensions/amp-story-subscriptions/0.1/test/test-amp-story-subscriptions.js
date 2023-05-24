import * as Preact from '#core/dom/jsx';

import {Services} from '#service';

import {afterRenderPromise, macroTask} from '#testing/helpers';

import {getLocalizationService} from 'extensions/amp-story/1.0/amp-story-localization-service';
import {AdvancementMode} from 'extensions/amp-story/1.0/story-analytics';

import LocalizedStringsEn from '../../../amp-story/1.0/_locales/en.json' assert {type: 'json'}; // lgtm[js/syntax-error]
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

    beforeEach(async () => {
      win = env.win;
      doc = win.document;

      storeService = new AmpStoryStoreService(win);
      env.sandbox
        .stub(Services, 'storyStoreServiceForOrNull')
        .returns(Promise.resolve(storeService));
      env.sandbox.stub(Services, 'storyStoreService').returns(storeService);

      getLocalizationService(doc.body).registerLocalizedStringBundles({
        'en': LocalizedStringsEn,
      });

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
      storyEl.appendChild(subscriptionsEl);

      for (let i = 0; i < 4; i++) {
        storyEl.appendChild(win.document.createElement('amp-story-page'));
      }

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
        storySubscriptions = new AmpStorySubscriptions(subscriptionsEl);
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
        storySubscriptions = new AmpStorySubscriptions(subscriptionsEl);
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

      await macroTask();

      expect(storeService.get(StateProperty.SUBSCRIPTIONS_STATE)).to.equal(
        SubscriptionsState.BLOCKED
      );
    });

    it('should update subscription state to granted once grant status from subscription service resolves to true', async () => {
      env.sandbox
        .stub(subscriptionService, 'getGrantStatus')
        .returns(Promise.resolve(true));

      await macroTask();

      expect(storeService.get(StateProperty.SUBSCRIPTIONS_STATE)).to.equal(
        SubscriptionsState.GRANTED
      );
    });

    describe('skip button behaviors when embedded in a viewer', () => {
      beforeEach(async () => {
        const viewer = Services.viewerForDoc(env.ampdoc);
        env.sandbox.stub(viewer, 'isEmbedded').withArgs().returns(true);
        env.sandbox.stub(Services, 'viewerForDoc').returns(viewer);
        env.sandbox
          .stub(subscriptionService, 'maybeRenderDialogForSelectedPlatform')
          .returns(Promise.resolve(true));
        env.sandbox.stub(window, 'setTimeout').callsFake((fn) => fn());

        storySubscriptions = await subscriptionsEl.getImpl();
        await storySubscriptions.buildCallback();
        storySubscriptions.mutateElement = (fn) => fn();

        const dialog = subscriptionService.getDialog();
        await dialog.open(subscriptionsEl);

        storeService.dispatch(
          Action.TOGGLE_SUBSCRIPTIONS_DIALOG_UI_STATE,
          true
        );
      });

      it('should show skip button after delay', async () => {
        const buttonEl = doc.querySelector(
          'amp-subscriptions-dialog .i-amphtml-story-subscriptions-dialog-banner-button'
        );
        expect(buttonEl).to.have.class(
          'i-amphtml-story-subscriptions-dialog-banner-button-visible'
        );
      });

      it('click on the button element should fire the event to navigate to next story', async () => {
        const handlerSpy = env.sandbox.spy(
          storySubscriptions.viewerMessagingHandler_,
          'send'
        );

        const subscriptionsDialogEl = doc.querySelector(
          'amp-subscriptions-dialog'
        );
        subscriptionsDialogEl.click();
        expect(handlerSpy).to.not.have.been.called;

        const buttonEl = doc.querySelector(
          'amp-subscriptions-dialog .i-amphtml-story-subscriptions-dialog-banner-button-visible'
        );
        buttonEl.click();
        expect(handlerSpy).to.have.been.calledWithExactly('selectDocument', {
          'next': true,
          'advancementMode': AdvancementMode.MANUAL_ADVANCE,
        });
      });
    });

    it('should allow pointer events on swg background to intercept clicks on background', async () => {
      const dialog = subscriptionService.getDialog();
      await dialog.open(subscriptionsEl);

      const buttonEl = doc.querySelector(
        'amp-subscriptions-dialog .i-amphtml-story-subscriptions-google-button'
      );
      buttonEl.click();

      doc.body.appendChild(<swg-popup-background></swg-popup-background>);
      await macroTask();

      const swgPopupBackgroundEl = doc.querySelector('swg-popup-background');
      expect(
        swgPopupBackgroundEl.style.getPropertyValue('pointer-events')
      ).equal('all');
    });
  }
);
