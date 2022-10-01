import {PageConfig} from '#third_party/subscriptions-project/config';

import {SubscriptionService} from '../amp-subscriptions';
import {ServiceAdapter} from '../service-adapter';

describes.realWin(
  'service adapter',
  {
    amp: true,
  },
  (env) => {
    let win;
    let ampdoc;
    let subscriptionService;
    let serviceAdapter;
    let pageConfig;
    const serviceConfig = {
      services: [
        {
          authorizationUrl: 'https://lipsum.com/authorize',
          actions: {
            subscribe: 'https://lipsum.com/subscribe',
            login: 'https://lipsum.com/login',
          },
          enableMetering: true,
        },
      ],
    };
    beforeEach(async () => {
      pageConfig = new PageConfig('example.org:basic', true);
      ampdoc = env.ampdoc;
      win = env.win;
      ampdoc = env.ampdoc;

      // Platform config.
      const platformConfigElement = win.document.createElement('script');
      platformConfigElement.id = 'amp-subscriptions';
      platformConfigElement.setAttribute('type', 'json');
      platformConfigElement.innerHTML = JSON.stringify(serviceConfig);
      win.document.body.appendChild(platformConfigElement);

      // Page config.
      const pageConfigElement = win.document.createElement('script');
      pageConfigElement.type = 'application/ld+json';
      pageConfigElement.innerHTML = `
      {
        "@context": "http://schema.org",
        "@type": "NewsArticle",
        "isAccessibleForFree": "False",
        "isPartOf": {
          "@type": ["CreativeWork", "Product"],
          "name": "Scenic News",
          "productID": "scenic-2017.appspot.com:news"
        }
      }
      `;
      win.document.body.appendChild(pageConfigElement);

      subscriptionService = new SubscriptionService(ampdoc);
      await subscriptionService.initialize_();

      serviceAdapter = new ServiceAdapter(subscriptionService);
    });

    describe('getEncryptedDocumentKey', () => {
      it('should call getEncryptedDocumentKey of subscription service', () => {
        const stub = env.sandbox.stub(
          subscriptionService,
          'getEncryptedDocumentKey'
        );
        serviceAdapter.getEncryptedDocumentKey('platformKey');
        expect(stub).to.be.calledOnce;
        expect(stub).to.be.calledWith('platformKey');
      });
    });

    describe('getPageConfig', () => {
      it('should call getPageConfig of subscription service', () => {
        const stub = env.sandbox
          .stub(subscriptionService, 'getPageConfig')
          .callsFake(() => pageConfig);
        serviceAdapter.getPageConfig();
        expect(stub).to.be.calledOnce;
      });
    });

    describe('delegateAction', () => {
      it('should call delegateActionToLocal of subscription service', () => {
        const p = Promise.resolve();
        const stub = env.sandbox
          .stub(serviceAdapter, 'delegateActionToService')
          .callsFake(() => p);
        const action = 'action';
        const result = serviceAdapter.delegateActionToLocal(action);
        expect(stub).to.be.calledWith(action, 'local');
        expect(result).to.equal(p);
      });

      it('should call delegateActionToService of subscription service', () => {
        const p = Promise.resolve();
        const stub = env.sandbox
          .stub(subscriptionService, 'delegateActionToService')
          .callsFake(() => p);
        const action = 'action';
        const result = serviceAdapter.delegateActionToLocal(action);
        expect(stub).to.be.calledWith(action);
        expect(result).to.equal(p);
      });
    });

    describe('resetPlatforms', () => {
      it('should call initializePlatformStore_', () => {
        const stub = env.sandbox.stub(subscriptionService, 'resetPlatforms');
        serviceAdapter.resetPlatforms();
        expect(stub).to.be.calledOnce;
      });
    });

    describe('getDialog', () => {
      it('should call getDialog of subscription service', () => {
        const stub = env.sandbox.stub(subscriptionService, 'getDialog');
        serviceAdapter.getDialog();
        expect(stub).to.be.calledOnce;
      });
    });

    describe('decorateServiceAction', () => {
      it('should call decorateServiceAction of subscription service', () => {
        const element = win.document.createElement('div');
        const platformKey = 'local';
        const stub = env.sandbox.stub(
          subscriptionService,
          'decorateServiceAction'
        );
        serviceAdapter.decorateServiceAction(element, platformKey, 'action');
        expect(stub).to.be.calledWith(element, platformKey, 'action');
      });
    });

    describe('getReaderId', () => {
      it('should delegate call to getReaderId', () => {
        const readerIdPromise = Promise.resolve();
        const stub = env.sandbox
          .stub(subscriptionService, 'getReaderId')
          .returns(readerIdPromise);
        const promise = serviceAdapter.getReaderId('service1');
        expect(stub).to.be.calledOnce.calledWith('service1');
        expect(promise).to.equal(readerIdPromise);
      });
    });

    describe('loadMeteringState', () => {
      it('should return metering state, if metering is enabled', async () => {
        const meteringState = {};
        const stub = env.sandbox
          .stub(subscriptionService.metering_, 'loadMeteringState')
          .returns(meteringState);
        expect(await serviceAdapter.loadMeteringState()).to.equal(
          meteringState
        );
        expect(stub).to.be.calledOnce;
      });

      it('should handle metering being disabled', async () => {
        delete subscriptionService.metering_;
        expect(await serviceAdapter.loadMeteringState()).to.equal(null);
      });
    });

    describe('saveMeteringState', () => {
      it('should return promise, if metering is enabled', async () => {
        const stub = env.sandbox.stub(
          subscriptionService.metering_,
          'saveMeteringState'
        );
        expect(await serviceAdapter.saveMeteringState()).to.equal(undefined);
        expect(stub).to.be.calledOnce;
      });

      it('should handle metering being disabled', async () => {
        delete subscriptionService.metering_;
        expect(await serviceAdapter.saveMeteringState()).to.equal(undefined);
      });
    });

    describe('rememberMeteringEntitlementsWereFetched', () => {
      it('should update flag', async () => {
        expect(
          subscriptionService.metering_
            .entitlementsWereFetchedWithCurrentMeteringState
        ).to.be.false;

        serviceAdapter.rememberMeteringEntitlementsWereFetched();

        expect(
          subscriptionService.metering_
            .entitlementsWereFetchedWithCurrentMeteringState
        ).to.be.true;
      });

      it('should handle metering being disabled', async () => {
        delete subscriptionService.metering_;

        expect(() =>
          serviceAdapter.rememberMeteringEntitlementsWereFetched()
        ).to.not.throw();
      });
    });
  }
);
