/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {ANALYTICS_CONFIG} from '../vendors';
import {AmpAnalytics} from '../amp-analytics';
import {IFRAME_TRANSPORTS} from '../iframe-transport-vendors';
import {Services} from '../../../../src/services';
import {Transport} from '../transport';
import {hasOwn} from '../../../../src/utils/object';
import {macroTask} from '../../../../testing/yield';
import {variableServiceFor} from '../variables';

/* global require: false */
const VENDOR_REQUESTS = require('./vendor-requests.json');

describe('iframe transport', () => {

  it('Should not contain iframe transport if not whitelisted', () => {
    for (const vendor in ANALYTICS_CONFIG) {
      const vendorEntry = ANALYTICS_CONFIG[vendor];
      if (hasOwn(vendorEntry, 'transport') &&
          hasOwn(vendorEntry.transport, 'iframe')) {
        expect(vendorEntry['transport']['iframe'])
            .to.equal(IFRAME_TRANSPORTS[vendor]);
      }
    }
  });
});

describes.realWin('amp-analytics', {
  amp: {
    extensions: ['amp-analytics'],
  },
}, function(env) {
  let win, doc;
  let sendRequestSpy;
  let ampdoc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
  });


  function getAnalyticsTag(config, attrs) {
    config = JSON.stringify(config);
    const el = doc.createElement('amp-analytics');
    const script = doc.createElement('script');
    script.textContent = config;
    script.setAttribute('type', 'application/json');
    el.appendChild(script);
    for (const k in attrs) {
      el.setAttribute(k, attrs[k]);
    }

    doc.body.appendChild(el);

    el.connectedCallback();
    const analytics = new AmpAnalytics(el);
    analytics.createdCallback();
    analytics.buildCallback();
    sendRequestSpy = sandbox.stub(Transport.prototype, 'sendRequest');
    return analytics;
  }

  /**
   * Clears the properties in the config that should only be used in vendor
   * configs. This is needed because we pass in all the vendor requests as
   * inline config and iframePings/optout are not allowed to be used without
   * AMP team's approval.
   *
   * @param {!JsonObject} config The inline config to update.
   * @return {!JsonObject}
   */
  function clearVendorOnlyConfig(config) {
    for (const t in config.triggers) {
      if (config.triggers[t].iframePing) {
        config.triggers[t].iframePing = undefined;
      }
    }
    if (config.optout) {
      config.optout = undefined;
    }
    return config;
  }

  describe('vendor request tests', () => {
    const actualResults = {};
    for (const vendor in ANALYTICS_CONFIG) {
      const config = ANALYTICS_CONFIG[vendor];
      if (!config.requests) {
        continue;
      }
      actualResults[vendor] = {};
      describe('analytics vendor: ' + vendor, function() {
        beforeEach(() => {
          // Remove all the triggers to prevent unwanted requests, for instance
          // one from a "visible" trigger. Those unwanted requests are a source
          // of test flakiness. Especially they will alternate value of var
          // $requestCount.
          config.triggers = {};
        });

        for (const name in config.requests) {
          it('should produce request: ' + name +
              '. If this test fails update vendor-requests.json', function* () {
            const urlReplacements =
                Services.urlReplacementsForDoc(ampdoc);
            const analytics = getAnalyticsTag(clearVendorOnlyConfig(config));
            sandbox.stub(urlReplacements.getVariableSource(), 'get').callsFake(
                function(name) {
                  expect(this.replacements_).to.have.property(name);

                  const defaultValue = `_${name.toLowerCase()}_`;
                  const extraMapping = VENDOR_REQUESTS[vendor][name];
                  return {
                    sync: paramName => {
                      if (!extraMapping ||
                          extraMapping[paramName] === undefined) {
                        return defaultValue;
                      }
                      return extraMapping[paramName];
                    },
                  };
                });

            const variables = variableServiceFor(ampdoc.win);
            const {encodeVars} = variables;
            sandbox.stub(variables, 'encodeVars').callsFake(
                function(name, val) {
                  val = encodeVars.call(this, name, val);
                  if (val == '') {
                    return '$' + name;
                  }
                  return val;
                });
            analytics.createdCallback();
            analytics.buildCallback();
            yield analytics.layoutCallback();

            // Wait for event queue to clear and reset sendRequestSpy
            // to avoid pageView pings.
            yield macroTask();
            sendRequestSpy.resetHistory();

            analytics.handleEvent_({
              request: name,
            }, {
              vars: Object.create(null),
            });
            yield macroTask();
            expect(sendRequestSpy).to.be.calledOnce;
            const url = sendRequestSpy.args[0][0];

            expect(sendRequestSpy).to.be.calledOnce;
            const vendorData = VENDOR_REQUESTS[vendor];
            if (!vendorData) {
              throw new Error('Add vendor ' + vendor +
                  ' to vendor-requests.json');
            }
            const val = vendorData[name];
            if (val == '<ignore for test>') {
              return;
            }
            if (val == null) {
              throw new Error('Define ' + vendor + '.' + name +
                  ' in vendor-requests.json. Expected value: ' + url);
            }
            actualResults[vendor][name] = url;
            // Write this out for easy copy pasting.
            // top.document.documentElement.setAttribute('json',
            //     JSON.stringify(actualResults, null, '  '));
            expect(url).to.equal(val);
          });
        }
      });
    }
  });
});
