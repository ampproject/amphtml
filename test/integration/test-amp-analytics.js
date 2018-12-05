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

import {RequestBank} from '../../testing/test-helper';
import {parseQueryString} from '../../src/url';

describe.configure().skipIfPropertiesObfuscated().run('amp' +
    '-analytics', function() {
  this.timeout(15000);

  describes.integration('amp-analytics basic request', {
    body:
      `<amp-analytics>
        <script type="application/json">
        {
          "requests": {
            "endpoint": "${RequestBank.getUrl()}"
          },
          "triggers": {
            "pageview": {
              "on": "visible",
              "request": "endpoint",
              "extraUrlParams": {
                "a": 2
              }
            }
          },
          "extraUrlParams": {
            "a": 1,
            "b": "\${title}"
          }
        }
        </script>
      </amp-analytics>`,
    extensions: ['amp-analytics'],
  }, () => {
    it('should send request', () => {
      return RequestBank.withdraw().then(req => {
        expect(req.url).to.equal('/?a=2&b=AMP%20TEST');
        expect(req.headers.referer,
            'should keep referrer if no referrerpolicy specified').to.be.ok;
      });
    });
  });

  describes.integration('amp-analytics batch', {
    body:
      `<amp-analytics>
        <script type="application/json">
        {
          "requests": {
            "endpoint": {
              "baseUrl": "${RequestBank.getUrl()}",
              "batchInterval": 1
            }
          },
          "triggers": {
            "pageview1": {
              "on": "visible",
              "request": "endpoint",
              "extraUrlParams": {
                "a": 1,
                "b": "\${title}"
              }
            },
            "pageview2": {
              "on": "visible",
              "request": "endpoint",
              "extraUrlParams": {
                "a": 1,
                "b": "\${title}"
              }
            }
          },
          "transport": {
            "beacon": false,
            "xhrpost": true
          }
        }
        </script>
      </amp-analytics>`,
    extensions: ['amp-analytics'],
  }, () => {
    it('should send request in batch', () => {
      return RequestBank.withdraw().then(req => {
        expect(req.url).to.equal('/?a=1&b=AMP%20TEST&a=1&b=AMP%20TEST');
      });
    });
  });

  describes.integration('amp-analytics useBody', {
    body:
      `<amp-analytics>
        <script type="application/json">
        {
          "requests": {
            "endpoint": "${RequestBank.getUrl()}"
          },
          "triggers": {
            "pageview": {
              "on": "visible",
              "request": "endpoint",
              "extraUrlParams": {
                "a": 2
              }
            }
          },
          "transport": {
            "beacon": false,
            "xhrpost": true,
            "useBody": true
          },
          "extraUrlParams": {
            "a": 1,
            "b": "\${title}"
          }
        }
        </script>
      </amp-analytics>`,
    extensions: ['amp-analytics'],
  }, () => {
    it('should send request use POST body payload', () => {
      return RequestBank.withdraw().then(req => {
        expect(req.url).to.equal('/');
        expect(JSON.parse(req.body)).to.deep.equal({a: 2, b: 'AMP TEST'});
      });
    });
  });

  describes.integration('amp-analytics batch useBody', {
    body:
      `<amp-analytics>
        <script type="application/json">
        {
          "requests": {
            "endpoint": {
              "baseUrl": "${RequestBank.getUrl()}",
              "batchInterval": 1
            }
          },
          "triggers": {
            "pageview1": {
              "on": "visible",
              "request": "endpoint",
              "extraUrlParams": {
                "a": 1,
                "b": "\${title}"
              }
            },
            "pageview2": {
              "on": "visible",
              "request": "endpoint",
              "extraUrlParams": {
                "a": 1,
                "b": "\${title}"
              }
            }
          },
          "transport": {
            "beacon": false,
            "xhrpost": true,
            "useBody": true
          }
        }
        </script>
      </amp-analytics>`,
    extensions: ['amp-analytics'],
  }, () => {
    it('should send batch request use POST body payload', () => {
      return RequestBank.withdraw().then(req => {
        expect(req.url).to.equal('/');
        expect(JSON.parse(req.body)).to.deep.equal([{
          a: 1, b: 'AMP TEST',
        }, {
          a: 1, b: 'AMP TEST',
        }]);
      });
    });
  });

  describes.integration('amp-analytics type=googleanalytics', {
    body: `
      <script>
        // initialize with a valid _ga cookie
        document.cookie='_ga=GA1.2.1427830804.1524174812';
      </script>
      <amp-analytics type="googleanalytics">
        <script type="application/json">
        {
          "vars": {
            "account": "UA-67833617-1"
          },
          "requests": {
            "host": "${RequestBank.getUrl()}"
          },
          "triggers": {
            "pageview": {
              "on": "visible",
              "request": "pageview"
            },
            "performanceTiming": {
              "enabled": false
            },
            "adwordsTiming": {
              "enabled": false
            }
          }
        }
        </script>
      </amp-analytics>`,
    extensions: ['amp-analytics'],
  }, () => {
    afterEach(() => {
      // clean up written _ga cookie
      document.cookie = '_ga=;expires=' + new Date(0).toUTCString();
    });

    it('should send request', () => {
      return RequestBank.withdraw().then(req => {
        expect(req.url).to.match(/^\/r\/collect\?/);
        const queries = parseQueryString(req.url.substr('/r/collect'.length));
        // see vendors/googleanalytics.js "pageview" request for config
        expect(queries).to.include({
          _v: 'a1',
          _r: '1',
          v: '1',
          cid: '1427830804.1524174812',
          dr: '',
          ds: 'AMP',
          dt: 'AMP TEST',
          tid: 'UA-67833617-1',
          t: 'pageview',
        });
        const isNumber = /^\d+$/;
        const isRandomNumber = /^0\.\d+$/;
        expect(queries['dl']).to.contain('/amp4test/compose-doc?'); // ${documentLocation}
        expect(queries['_s']).to.match(isNumber); // ${requestCount}
        expect(queries['_utmht']).to.match(isNumber); // ${timestamp}
        expect(queries['sr']).to.match(/^\d+x\d+$/); // ${screenWidth}x${screenHeight}
        expect(queries['sd']).to.match(isNumber); // ${screenColorDepth}
        expect(queries['ul']).to.be.ok; // ${browserLanguage}
        expect(queries['de']).to.be.ok; // ${documentCharset}
        expect(queries['jid']).to.match(isRandomNumber); // ${random}
        expect(queries['a']).to.match(isNumber); // ${pageViewId}
        expect(queries['z']).to.match(isRandomNumber); // ${random}
      });
    });
  });

  describes.integration('amp-analytics type=googleanalytics new user', {
    body: `
      <script>
        // expires existing _ga cookie if any
        document.cookie='_ga=;expires=' + new Date(0).toUTCString();
      </script>
      <amp-analytics type="googleanalytics">
        <script type="application/json">
        {
          "vars": {
            "account": "UA-67833617-1"
          },
          "requests": {
            "host": "${RequestBank.getUrl(1)}"
          },
          "triggers": {
            "pageview": {
              "on": "visible",
              "request": "pageview"
            },
            "performanceTiming": {
              "enabled": false
            },
            "adwordsTiming": {
              "enabled": false
            }
          }
        }
        </script>
      </amp-analytics>
      <amp-analytics type="googleanalytics">
        <script type="application/json">
        {
          "vars": {
            "account": "UA-67833617-1"
          },
          "requests": {
            "host": "${RequestBank.getUrl(2)}"
          },
          "triggers": {
            "pageview": {
              "on": "visible",
              "request": "pageview"
            },
            "performanceTiming": {
              "enabled": false
            },
            "adwordsTiming": {
              "enabled": false
            }
          }
        }
        </script>
      </amp-analytics>
      `,
    extensions: ['amp-analytics'],
  }, () => {
    afterEach(() => {
      // clean up written _ga cookie
      document.cookie = '_ga=;expires=' + new Date(0).toUTCString();
    });

    it('should assign new cid', () => {
      return Promise.all([
        RequestBank.withdraw(1),
        RequestBank.withdraw(2),
      ]).then(reqs => {
        const req1 = reqs[0];
        const req2 = reqs[1];
        expect(req1.url).to.match(/^\/r\/collect\?/);
        expect(req2.url).to.match(/^\/r\/collect\?/);
        const queries1 = parseQueryString(req1.url.substr('/r/collect'.length));
        const queries2 = parseQueryString(req2.url.substr('/r/collect'.length));
        expect(queries1['cid']).to.match(/^amp-/);
        expect(queries1['cid']).to.equal(queries2['cid']);
        expect(document.cookie).to.contain('ga=' + queries1['cid']);
      });
    });
  });

  describes.integration('amp-analytics referrerPolicy', {
    body:
      `<amp-analytics>
          <script type="application/json">
          {
            "requests": {
              "endpoint": "${RequestBank.getUrl()}"
            },
            "triggers": {
              "pageview": {
                "on": "visible",
                "request": "endpoint"
              }
            },
            "transport": {
              "referrerPolicy": "no-referrer"
            }
          }
          </script>
      </amp-analytics>`,
    extensions: ['amp-analytics'],
  }, () => {
    it('should remove referrer if referrerpolicy=no-referrer', () => {
      return RequestBank.withdraw().then(req => {
        expect(req.url).to.equal('/');
        expect(req.headers.referer).to.not.be.ok;
      });
    });
  });
});
