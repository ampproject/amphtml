/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {AmpSkimlinks} from '../amp-skimlinks';
import {CustomEventReporterBuilder} from '../../../../src/extension-analytics';
import {DEFAULT_SKIM_OPTIONS} from './constants';
import {Services} from '../../../../src/services';
import {Tracking} from '../tracking';

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
      skimOptions = Object.assign({}, DEFAULT_SKIM_OPTIONS, skimOptions);
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
