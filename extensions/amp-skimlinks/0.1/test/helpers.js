import {CustomEventReporterBuilder} from '../../../../src/extension-analytics';
import {pubcode} from './constants';
import Tracking from '../tracking';

const helpersFactory = env => {
  const {win} = env;

  return {
    createAnchor(href) {
      const anchor = win.document.createElement('a');
      anchor.href = href;

      return anchor;
    },

    createStubXhr(data) {
      const response = {
        json: () => { return Promise.resolve(data); },
      };

      return {
        fetchJson: env.sandbox.stub().returns(Promise.resolve(response)),
      };
    },

    createGetTrackingInfoStub(data) {
      return () => {
        return Object.assign({
          pubcode,
          // https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md
          referrer: 'referrer',
          externalReferrer: 'external_referrer',
          timezone: 'timezone',
          pageImpressionId: 'page_impression_id',
          customTrackingId: null,
          guid: 'user_guid',
        }, data);
      };
    },

    createTrackingWithStubAnalytics(skimOptions) {
      skimOptions = Object.assign({
        tracking: true,
        pubcode,
      }, skimOptions);

      // anchorTrackingInfoResponse = Object.assign({

      // });

      // class CustomEventReporterBuilderStub() {
      //   constructor() {
      //     this.track = env.sandbox.stub();
      //     this.build = env.sandbox.stub();
      //     this.trigger = env.sandbox.stub();
      //   }
      // }
      env.sandbox.stub(CustomEventReporterBuilder.prototype, 'track');
      env.sandbox.stub(CustomEventReporterBuilder.prototype, 'build').returns({
        trigger: env.sandbox.stub(),
      });
      // env.sandbox.stub(CustomEventReporterBuilder.prototype, 'trigger');

      // class StubTracking extends Tracking {
      //   setupAnalytics_() {
      //     return {
      //       trigger: env.sandbox.stub(),
      //     };
      //   }
      // }

      // return new StubTracking(env, skimOptions);

      return new Tracking(env, skimOptions);
    },

    getAnalyticsUrlVars(trackingService, eventName) {
      const stub = trackingService.analytics_.trigger;
      expect(stub.withArgs(eventName).calledOnce).to.be.true;
      const analyticsData = stub.withArgs(eventName).args[0][1];
      expect(analyticsData).to.be.an('object');

      return analyticsData;
    },
  };
};

export default helpersFactory;
