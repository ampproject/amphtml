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
    body: `
      <script>
        // initialize _cid cookie with a CLIENT_ID
        document.cookie='_cid=amp-12345';
      </script>
      <amp-analytics>
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
            "b": "\${title}",
            "cid": "\${clientId(_cid)}"
          }
        }
        </script>
      </amp-analytics>`,
    extensions: ['amp-analytics'],
  }, () => {
    afterEach(() => {
      // clean up written _cid cookie
      document.cookie = '_cid=;expires=' + new Date(0).toUTCString();
    });

    it('should send request', () => {
      return RequestBank.withdraw().then(req => {
        expect(req.url).to.equal('/?a=2&b=AMP%20TEST&cid=amp-12345');
        expect(req.headers.referer,
            'should keep referrer if no referrerpolicy specified').to.be.ok;
      });
    });
  });

  describes.integration('amp-analytics CLIENT_ID new user', {
    body: `
      <script>
        // expires existing _cid cookie if any
        document.cookie='_cid=;expires=' + new Date(0).toUTCString();
      </script>
      <amp-analytics>
        <script type="application/json">
        {
          "requests": {
            "pageview": "${RequestBank.getUrl(1)}?cid=CLIENT_ID(_cid)"
          },
          "triggers": {
            "pageview": {
              "on": "visible",
              "request": "pageview"
            }
          }
        }
        </script>
      </amp-analytics>
      <amp-analytics>
        <script type="application/json">
        {
          "requests": {
            "pageview": "${RequestBank.getUrl(2)}?cid=CLIENT_ID(_cid)"
          },
          "triggers": {
            "pageview": {
              "on": "visible",
              "request": "pageview"
            }
          }
        }
        </script>
      </amp-analytics>
      `,
    extensions: ['amp-analytics'],
  }, () => {
    afterEach(() => {
      // clean up written _cid cookie
      document.cookie = '_cid=;expires=' + new Date(0).toUTCString();
    });

    it('should assign new cid', () => {
      return Promise.all([
        RequestBank.withdraw(1),
        RequestBank.withdraw(2),
      ]).then(reqs => {
        const req1 = reqs[0];
        const req2 = reqs[1];
        expect(req1.url).to.match(/^\/\?cid=/);
        expect(req2.url).to.match(/^\/\?cid=/);
        const cid1 = req1.url.substr('/?cid='.length);
        const cid2 = req2.url.substr('/?cid='.length);
        expect(cid1).to.match(/^amp-/);
        expect(cid2).to.equal(cid1);
        expect(document.cookie).to.contain('_cid=' + cid1);
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
            "b": "\${title}",
            "c": {
              "d": "\${title}",
              "e": {
                "f": ["\${title}", "\${title}"]
              }
            },
            "g": ["\${title}", "\${title}"]
          }
        }
        </script>
      </amp-analytics>`,
    extensions: ['amp-analytics'],
  }, () => {
    it('should send request use POST body payload', () => {
      return RequestBank.withdraw().then(req => {
        expect(req.url).to.equal('/');
        expect(req.body).to.equal(
            '{"a":2,"b":"AMP TEST","c":{"d":"AMP TEST",' +
        '"e":{"f":["AMP TEST","AMP TEST"]}},"g":["AMP TEST","AMP TEST"]}'
        );
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

  describes.integration('amp-analytics useBody with extraUrlParamsReplaceMap', {
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
                "context.a": 2
              }
            }
          },
          "transport": {
            "beacon": false,
            "xhrpost": true,
            "useBody": true
          },
          "extraUrlParamsReplaceMap": {
            "context.": "_c_"
          },
          "extraUrlParams": {
            "context.a": 1,
            "context.b": {
              "context.c": "\${title}",
              "context.d": {
                "context.e": ["\${title}", "\${title}"]
              }
            }
          }
        }
        </script>
      </amp-analytics>`,
    extensions: ['amp-analytics'],
  }, () => {
    it('should only replace params for top-level keys', () => {
      return RequestBank.withdraw().then(req => {
        expect(req.url).to.equal('/');
        expect(req.body).to.equal(
            '{"_c_a":2,"_c_b":{"context.c":"AMP TEST",' +
        '"context.d":{"context.e":["AMP TEST","AMP TEST"]}}}'
        );
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
});
