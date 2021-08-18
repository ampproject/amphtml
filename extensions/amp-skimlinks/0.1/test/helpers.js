import {Services} from '#service';

import {DEFAULT_SKIM_OPTIONS} from './constants';

import {CustomEventReporterBuilder} from '../../../../src/extension-analytics';
import {AmpSkimlinks} from '../amp-skimlinks';
import {Tracking} from '../tracking';

const helpersFactory = (env) => {
  const {win} = env;

  return {
    createAnchor(href) {
      const anchor = win.document.createElement('a');
      anchor.href = href;

      return anchor;
    },

    createStubXhr(data) {
      const response = {
        json: () => {
          return Promise.resolve(data);
        },
      };

      return {
        fetchJson: env.sandbox.stub().returns(Promise.resolve(response)),
      };
    },

    mockServiceGetter(getterName, returnValue) {
      env.sandbox.stub(Services, getterName);
      Services[getterName].returns(returnValue);
    },

    stubCustomEventReporterBuilder() {
      env.sandbox.stub(CustomEventReporterBuilder.prototype, 'track');
      env.sandbox.stub(CustomEventReporterBuilder.prototype, 'build').returns({
        trigger: env.sandbox.stub(),
        config_: {},
      });
    },

    createTrackingWithStubAnalytics(skimOptions) {
      skimOptions = {...DEFAULT_SKIM_OPTIONS, ...skimOptions};
      this.stubCustomEventReporterBuilder();

      return new Tracking(env, skimOptions, 'my-page-referrer');
    },

    getAnalyticsUrlVars(trackingService, eventName) {
      const stub = trackingService.analytics_.trigger;
      expect(stub.withArgs(eventName).calledOnce).to.be.true;
      const analyticsData = stub.withArgs(eventName).args[0][1];
      expect(analyticsData).to.be.an('object');

      return analyticsData;
    },

    createAmpSkimlinks(extensionAttrs) {
      const el = this.createAmpSkimlinksElement(extensionAttrs);
      el.getAmpDoc = () => env.ampdoc;

      return new AmpSkimlinks(el);
    },

    createAmpSkimlinksElement(extensionAttrs) {
      const el = document.createElement('amp-skimlinks');
      for (const k in extensionAttrs) {
        el.setAttribute(k, extensionAttrs[k]);
      }

      return el;
    },
  };
};

export default helpersFactory;
