import {hasOwn} from '#core/types/object';

import {Services} from '#service';

import {macroTask} from '#testing/helpers';
import {
  ImagePixelVerifier,
  mockWindowInterface,
} from '#testing/helpers/service';

import VENDOR_REQUESTS from './vendor-requests.json' assert {type: 'json'}; // lgtm[js/syntax-error]

import {AmpAnalytics} from '../amp-analytics';
import {AnalyticsConfig} from '../config';
import {IFRAME_TRANSPORTS} from '../iframe-transport-vendors';
import {ExpansionOptions, variableServiceForDoc} from '../variables';

describes.realWin(
  'amp-analytics',
  {
    amp: {
      extensions: ['amp-analytics'],
    },
    mockFetch: false,
  },
  function (env) {
    let win, doc;
    let requestVerifier;
    let elementMacros;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      const wi = mockWindowInterface(env.sandbox);
      wi.getLocation.returns(win.location);
      requestVerifier = new ImagePixelVerifier(wi);
      elementMacros = {
        'COOKIE': null,
        'CONSENT_STATE': null,
        'CONSENT_STRING': null,
        'CONSENT_METADATA': null,
      };
    });

    describe('Should not contain iframe transport if not allowlisted', () => {
      for (const vendor in VENDOR_REQUESTS) {
        it('test vendor: ' + vendor, () => {
          const el = doc.createElement('amp-analytics');
          el.setAttribute('type', vendor);
          doc.body.appendChild(el);
          const analyticsConfig = new AnalyticsConfig(el);
          return analyticsConfig.loadConfig().then((config) => {
            if (
              hasOwn(config, 'transport') &&
              hasOwn(config.transport, 'iframe')
            ) {
              expect(config['transport']['iframe']).to.equal(
                IFRAME_TRANSPORTS[vendor]
              );
            }
          });
        });
      }
    });

    describe('vendor request tests', () => {
      for (const vendor in VENDOR_REQUESTS) {
        describe('analytics vendor: ' + vendor, function () {
          let config;
          let analytics;
          beforeEach((done) => {
            const urlReplacements = Services.urlReplacementsForDoc(
              doc.documentElement
            );
            env.sandbox
              .stub(urlReplacements.getVariableSource(), 'get')
              .callsFake(function (name) {
                expect(this.replacements_).to.have.property(name);
                return {
                  sync: (...args) => mockMacrosBinding(name, args),
                };
              });

            env.sandbox
              .stub(ExpansionOptions.prototype, 'getVar')
              .callsFake(function (name) {
                let val = this.vars[name];
                if (val == null || val == '') {
                  val = '!' + name;
                }
                return val;
              });

            analytics = getAnalyticsTag(doc, vendor);
            analytics.layoutCallback().then(() => {
              config = analytics.config_;
              done();
            });

            // Have to get service after analytics element is created
            const variableService = variableServiceForDoc(doc);

            env.sandbox
              .stub(variableService, 'getMacros')
              .callsFake(function () {
                // Add all the macros in amp-analytics
                const merged = {...this.macros_, ...elementMacros};

                // Change the resolving function
                const keys = Object.keys(merged);
                for (let i = 0; i < keys.length; i++) {
                  const key = keys[i];
                  merged[key] = (...args) => mockMacrosBinding(key, args);
                }
                return /** @type {!JsonObject} */ (merged);
              });
          });

          it('test requests', function* () {
            const outputConfig = {};
            if (!config.requests) {
              throw new Error(
                'Request for ' +
                  vendor +
                  ' not found. Please make sure you run ' +
                  '"amp analytics-vendor-configs" or build amp-analytics ' +
                  'before running the test'
              );
            }
            for (const name in config.requests) {
              // Wait for event queue to clear.
              // To prevent default triggers
              yield macroTask();
              analytics.handleEvent_(
                {
                  request: name,
                },
                {
                  vars: Object.create(null),
                }
              );

              // Reset $requestCount value after each
              analytics.config_['vars']['requestCount'] = 0;

              yield macroTask();
              expect(requestVerifier.hasRequestSent()).to.be.true;
              const lastUrl = requestVerifier.getLastRequestUrl();
              const vendorData = VENDOR_REQUESTS[vendor];
              if (!vendorData) {
                throw new Error(
                  'Add vendor ' + vendor + ' to vendor-requests.json'
                );
              }
              const val = vendorData[name];
              if (val == '<ignore for test>') {
                continue;
              }
              if (val == null) {
                throw new Error(
                  'Define ' +
                    vendor +
                    '.' +
                    name +
                    ' in vendor-requests.json. Last sent out value is: ' +
                    lastUrl
                );
              }
              outputConfig[name] = lastUrl;
              // Write this out for easy copy pasting.
              if (!requestVerifier.verifyAndRemoveRequestUrl(val)) {
                throw new Error(
                  `Vendor ${vendor}, request ${name} doesn't match. ` +
                    `Expected value ${val}, last sent out value is ${lastUrl}.`
                );
              }
            }
            writeOutput(vendor, outputConfig);
          });
        });
      }
    });
  }
);

/**
 * Get the AmpAnalytics instance
 * @param {string} vendor
 */
function getAnalyticsTag(doc, vendor) {
  const el = doc.createElement('amp-analytics');
  el.setAttribute('type', vendor);

  // Overwrite transport method to use image
  expectAsyncConsoleError(/should not overwrite vendor transport/);
  const script = doc.createElement('script');
  script.setAttribute('type', 'application/json');
  script.textContent = JSON.stringify({
    'transport': {
      'iframe': false,
      'image': true,
    },
  });
  el.appendChild(script);

  doc.body.appendChild(el);
  el.connectedCallback();
  const analytics = new AmpAnalytics(el);
  analytics.buildCallback();
  return analytics;
}

let outputBox;

function writeOutput(vendor, output) {
  if (!outputBox) {
    outputBox = top.document.createElement('div');
    top.document.body.appendChild(outputBox);
  }
  const vendorDiv = top.document.createElement('h3');
  vendorDiv.textContent = vendor;
  outputBox.appendChild(vendorDiv);

  const out = top.document.createElement('div');
  out.textContent = JSON.stringify(output, null, '  ');
  outputBox.appendChild(out);
}

/**
 * CLIENT_ID(_ga) -> _client_id(_ga)_
 * $NOT(true) -> _not(true)_
 * @param {string} macroName
 * @param {!Array<string>} argumentsList
 */
function mockMacrosBinding(macroName, argumentsList) {
  let params = argumentsList.filter((val) => val !== undefined).join(',');
  if (params) {
    params = '(' + params + ')';
  }
  return `_${macroName.replace('$', '').toLowerCase()}${params}_`;
}
