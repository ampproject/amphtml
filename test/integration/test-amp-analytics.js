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

import {BrowserController, RequestBank} from '../../testing/test-helper';

describe.configure().skipIfPropertiesObfuscated().run('amp' +
    '-analytics', function() {
  this.timeout(15000);

  describes.integration('basic pageview', {
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

  describes.integration('click trigger', {
    body: `
      <a href="javascript:;"
          data-vars-foo-bar="hello world"
          data-vars-bar-foo="2">
        Anchor
      </a>
      <amp-analytics>
        <script type="application/json">
        {
          "requests": {
            "endpoint": "${RequestBank.getUrl()}"
          },
          "triggers": {
            "click": {
              "on": "click",
              "selector": "a",
              "request": "endpoint",
              "extraUrlParams": {
                "f": "\${fooBar}",
                "b": "\${barFoo}"
              }
            }
          },
          "vars": {
            "barFoo": 1
          }
        }
        </script>
      </amp-analytics>
      `,
    extensions: ['amp-analytics'],
  }, env => {
    let browser;

    beforeEach(() => {
      browser = new BrowserController(env.win);
    });

    it('should send request', () => {
      const reqPromise = RequestBank.withdraw().then(req => {
        expect(req.url).to.equal('/?f=hello%20world&b=2');
      });
      browser.click('a');
      return reqPromise;
    });
  });

  describes.integration('scroll trigger', {
    body: `
      <amp-analytics>
        <script type="application/json">
        {
          "requests": {
            "endpoint": "${RequestBank.getUrl()}"
          },
          "triggers": {
            "scroll": {
              "on": "scroll",
              "request": "endpoint",
              "scrollSpec": {
                "verticalBoundaries": [70]
              },
              "extraUrlParams": {
                "scrollTop": "\${scrollTop}",
                "scrollHeight": "\${scrollHeight}"
              }
            }
          }
        }
        </script>
      </amp-analytics>
      <div class="block" style="height: 100vh; background: red">
        1st viewport
      </div>
      <div class="block" style="height: 100vh; background: blue">
        2nd viewport
      </div>
      `,
    extensions: ['amp-analytics'],
  }, env => {
    let browser;

    beforeEach(() => {
      browser = new BrowserController(env.win);
    });

    it('should trigger on scroll', () => {
      const reqPromise = RequestBank.withdraw().then(req => {
        expect(req.url).to.equal('/?scrollTop=75&scrollHeight=300');
      });
      // verticalBoundaries is set to 70%
      // (windowHeight + scrollTop) / scrollHeight = (150 + 75) / 300 = 75%
      // so scrolling 75px guarantees a triggering
      browser.scroll(75);
      return reqPromise;
    });
  });

  describes.integration('element visible trigger', {
    body: `
      <amp-analytics>
        <script type="application/json">
        {
          "requests": {
            "endpoint": "${RequestBank.getUrl()}"
          },
          "triggers": {
            "visible": {
              "on": "visible",
              "request": "endpoint",
              "visibilitySpec": {
                "selector": "amp-img",
                "selectionMethod": "scope",
                "visiblePercentageMin": 10
              },
              "extraUrlParams": {
                "timestamp": "\${timestamp}",
                "loadTimeVisibility": "\${loadTimeVisibility}",
                "maxVisiblePercentage": "\${maxVisiblePercentage}",
                "totalVisibleTime": "\${totalVisibleTime}"
              }
            }
          }
        }
        </script>
      </amp-analytics>
      <div class="block" style="height: 100vh; background: red">
        1st viewport
      </div>
      <amp-img layout="fixed" width="300" height="500"
          src="/examples/img/bigbuckbunny.jpg"></amp-img>
      `,
    extensions: ['amp-analytics'],
  }, env => {
    let browser;

    beforeEach(() => {
      browser = new BrowserController(env.win);
    });

    it('should trigger when image visible', () => {
      let scrollTime = Infinity;
      const reqPromise = RequestBank.withdraw().then(req => {
        expect(Date.now()).to.be.not.below(scrollTime);
        expect(req.url).to.equal('/?scrollTop=75&scrollHeight=300');
      });
      browser.wait(1000)
          .then(() => {
            browser.scroll(40);
          }).then(() => browser.wait(1000))
          .then(() => {
            scrollTime = Date.now();
            browser.scroll(50);
          });
      return reqPromise;
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
