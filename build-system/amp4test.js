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
'use strict';

const app = module.exports = require('express').Router();

/*eslint "max-len": 0*/

/**
 * Logs the given messages to the console in local dev mode, but not while
 * running automated tests.
 * @param {*} messages
 */
function log(...messages) {
  if (!process.env.AMP_TEST) {
    console.log(messages);
  }
}

app.use('/compose-doc', function(req, res) {
  res.setHeader('X-XSS-Protection', '0');
  const mode = process.env.SERVE_MODE == 'compiled' ? '' : 'max.';
  const frameHtml = process.env.SERVE_MODE == 'compiled'
    ? 'dist.3p/current-min/frame.html'
    : 'dist.3p/current/frame.max.html';
  const {extensions} = req.query;
  let extensionScripts = '';
  if (!!extensions) {
    extensionScripts = extensions.split(',').map(function(extension) {
      return '<script async custom-element="'
              + extension + '" src=/dist/v0/'
              + extension + '-0.1.' + mode + 'js></script>';
    }).join('\n');
  }

  const {experiments} = req.query;
  let metaTag = '';
  let experimentString = '';
  if (experiments) {
    metaTag = '<meta name="amp-experiments-opt-in" content="' +
      experiments + '">';
    experimentString = '"' + experiments.split(',').join('","') + '"';
  }
  const {css} = req.query;
  const cssTag = css ? `<style amp-custom>${css}</style>` : '';

  res.send(`
<!doctype html>
<html ⚡>
<head>
  <meta charset="utf-8">
  <link rel="canonical" href="http://nonblocking.io/" >
  <title>AMP TEST</title>
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  ${metaTag}
  <script>
    window.AMP_CONFIG = window.AMP_CONFIG || {
      "localDev": true
    };
    window.AMP_CONFIG['allow-doc-opt-in'] =
    (window.AMP_CONFIG['allow-doc-opt-in'] || []).concat([${experimentString}]);
  </script>
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <script async src="/dist/${process.env.SERVE_MODE == 'compiled' ? 'v0' : 'amp'}.js"></script>
  <meta name="amp-3p-iframe-src" content="http://localhost:9876/${frameHtml}">
  ${extensionScripts}
  ${cssTag}
</head>
<body>
${req.query.body}
</body>
</html>
`);
});

/**
 * A server side temporary request storage which is useful for testing
 * browser sent HTTP requests.
 */
const bank = {};

/**
 * Deposit a request. An ID has to be specified. Will override previous request
 * if the same ID already exists.
 */
app.use('/request-bank/:bid/deposit/:id/', (req, res) => {
  if (!bank[req.params.bid]) {
    bank[req.params.bid] = {};
  }
  const key = req.params.id;
  log('SERVER-LOG [DEPOSIT]: ', key);
  if (typeof bank[req.params.bid][key] === 'function') {
    bank[req.params.bid][key](req);
  } else {
    bank[req.params.bid][key] = req;
  }
  res.end();
});

/**
 * Withdraw a request. If the request of the given ID is already in the bank,
 * return it immediately. Otherwise wait until it gets deposited
 * The same request cannot be withdrawn twice at the same time.
 */
app.use('/request-bank/:bid/withdraw/:id/', (req, res) => {
  if (!bank[req.params.bid]) {
    bank[req.params.bid] = {};
  }
  const key = req.params.id;
  log('SERVER-LOG [WITHDRAW]: ' + key);
  const result = bank[req.params.bid][key];
  if (typeof result === 'function') {
    return res.status(500).send('another client is withdrawing this ID');
  }
  const callback = function(result) {
    res.json({
      headers: result.headers,
      body: result.body,
      url: result.url,
    });
    delete bank[req.params.bid][key];
  };
  if (result) {
    callback(result);
  } else {
    bank[req.params.bid][key] = callback;
  }
});

/**
 * Clean up all pending withdraw & deposit requests.
 */
app.use('/request-bank/:bid/teardown/', (req, res) => {
  bank[req.params.bid] = {};
  log('SERVER-LOG [TEARDOWN]');
  res.end();
});

/**
 * Serves a fake ad for test-amp-ad-fake.js
 */
app.get('/a4a/:bid', (req, res) => {
  const sourceOrigin = req.query['__amp_source_origin'];
  if (sourceOrigin) {
    res.setHeader('AMP-Access-Control-Allow-Source-Origin', sourceOrigin);
  }
  const {bid} = req.params;
  res.send(`
<!doctype html><html amp4ads><head><meta charset=utf-8><meta content=width=device-width,minimum-scale=1,initial-scale=1 name=viewport><script async src=https://cdn.ampproject.org/amp4ads-v0.js></script><script async custom-element=amp-accordion src=https://cdn.ampproject.org/v0/amp-accordion-0.1.js></script><script async custom-element=amp-analytics src=https://cdn.ampproject.org/v0/amp-analytics-0.1.js></script><script async custom-element=amp-anim src=https://cdn.ampproject.org/v0/amp-anim-0.1.js></script><script async custom-element=amp-audio src=https://cdn.ampproject.org/v0/amp-audio-0.1.js></script><script async custom-element=amp-carousel src=https://cdn.ampproject.org/v0/amp-carousel-0.1.js></script><script async custom-element=amp-fit-text src=https://cdn.ampproject.org/v0/amp-fit-text-0.1.js></script><script async custom-element=amp-font src=https://cdn.ampproject.org/v0/amp-font-0.1.js></script><script async custom-element=amp-form src=https://cdn.ampproject.org/v0/amp-form-0.1.js></script><script async custom-element=amp-social-share src=https://cdn.ampproject.org/v0/amp-social-share-0.1.js></script><style amp-custom>body {
  background-color: #f4f4f4;
}
</style><style amp4ads-boilerplate>body{visibility:hidden}</style></head>
<body>
  <a href=https://ampbyexample.com target=_blank>
    <amp-img alt="AMP Ad" height=250 src=//localhost:9876/amp4test/request-bank/${bid}/deposit/image width=300></amp-img>
  </a>
  <amp-pixel src="//localhost:9876/amp4test/request-bank/${bid}/deposit/pixel/foo?cid=CLIENT_ID(a)"></amp-pixel>
  <amp-analytics>
    <script type="application/json">
    {
      "requests": {
        "pageview": "//localhost:9876/amp4test/request-bank/${bid}/deposit/analytics/bar"
      },
      "triggers": {
        "pageview": {
          "on": "visible",
          "request": "pageview",
          "extraUrlParams": {
            "title": "\${title}",
            "ampdocUrl": "\${ampdocUrl}",
            "canonicalUrl": "\${canonicalUrl}",
            "cid": "\${clientId(a)}",
            "img": "\${htmlAttr(amp-img,src)}",
            "adNavTiming": "\${adNavTiming(requestStart,requestStart)}",
            "adNavType": "\${adNavType}",
            "adRedirectCount": "\${adRedirectCount}"
          }
        }
      }
    }
    </script>
  </amp-analytics>
  <script amp-ad-metadata type=application/json>
  {
     "ampRuntimeUtf16CharOffsets" : [ 134, 1129 ],
     "customElementExtensions" : [
       "amp-analytics"
     ],
     "extensions" : [
        {
           "custom-element" : "amp-analytics",
           "src" : "https://cdn.ampproject.org/v0/amp-analytics-0.1.js"
        }
     ]
  }
  </script>
</body>
</html>
`);
});
