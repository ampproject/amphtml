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

/* eslint-disable max-len */

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
  const {body, css, experiments, extensions} = req.query;

  const compiled = process.env.SERVE_MODE == 'compiled';
  const frameHtml = (compiled)
    ? 'dist.3p/current-min/frame.html'
    : 'dist.3p/current/frame.max.html';

  let metaExperiments = '', experimentString = '';
  if (experiments) {
    metaExperiments = `<meta name="amp-experiments-opt-in" content="${experiments}">`;
    experimentString = `"${experiments.split(',').join('","')}"`;
  }

  const head = `
  <script>
    window.AMP_CONFIG = window.AMP_CONFIG || {"localDev": true};
    window.AMP_CONFIG['allow-doc-opt-in'] = (window.AMP_CONFIG['allow-doc-opt-in'] || []).concat([${experimentString}]);
  </script>
  ${metaExperiments}
  <meta name="amp-3p-iframe-src" content="http://localhost:9876/${frameHtml}">
  `;

  const doc = composeDocument({
    body,
    css,
    extensions: extensions.split(','),
    head,
  });
  res.send(doc);
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

  const extensions = [
    'amp-accordion',
    'amp-analytics',
    'amp-anim',
    'amp-audio',
    'amp-carousel',
    'amp-fit-text',
    'amp-font',
    'amp-form',
    'amp-social-share',
  ];

  const css = 'body { background-color: #f4f4f4; }';

  const body = `
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
  `;

  const doc = composeDocument({
    spec: 'amp4ads',
    body,
    css,
    extensions,
    mode: 'cdn',
  });
  res.send(doc);
});

/**
 * @param {{body: string, css: string|undefined, extensions: Array<string>|undefined, head: string|undefined, spec: string|undefined}} config
 */
function composeDocument(config) {
  const {body, css, extensions, head, spec, mode} = config;

  const m = (mode || process.env.SERVE_MODE);
  const cdn = (m === 'cdn');
  const compiled = (m === 'compiled');

  const cssTag = css ? `<style amp-custom>${css}</style>` : '';

  let extensionScripts = '';
  if (extensions) {
    extensionScripts = extensions.map(extension => {
      // TODO: Use '-latest'?
      const src = (cdn)
        ? `https://cdn.ampproject.org/v0/${extension}-0.1.js`
        : `/dist/v0/${extension}-0.1.${compiled ? '' : 'max.'}js`;
      return `<script async custom-element="${extension}" + src="${src}"></script>`;
    }).join('\n');
  }

  let canonical, boilerplate, runtime;
  const amp = spec || 'amp';
  switch (amp) {
    case 'amp':
      canonical = '<link rel="canonical" href="http://nonblocking.io" />';
      boilerplate = '<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>';
      runtime = (cdn)
        ? 'https://cdn.ampproject.org/v0.js'
        : `/dist/${compiled ? 'v0' : 'amp'}.js`;
      break;
    case 'amp4ads':
      canonical = '';
      boilerplate = '<style amp4ads-boilerplate>body{visibility:hidden}</style>';
      runtime = (cdn)
        ? 'https://cdn.ampproject.org/amp4ads-v0.js'
        : `/dist/${compiled ? 'amp4ads-v0' : 'amp-inabox'}.js`;
      break;
    case 'amp4email':
      canonical = '';
      boilerplate = '<style amp4email-boilerplate>body{visibility:hidden}</style>';
      runtime = (cdn)
        ? 'https://cdn.ampproject.org/v0.js'
        : `/dist/${compiled ? 'v0' : 'amp'}.js`;
      break;
    default:
      throw new Error('Unrecognized AMP spec: ' + spec);
  }

  return `
<!doctype html>
<html ${amp}>
<head>
  <title>AMP TEST</title>
  <meta charset="utf-8">
  ${canonical}
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  ${head || ''}
  ${boilerplate}
  <script async src="${runtime}"></script>
  ${extensionScripts}
  ${cssTag}
</head>
<body>
${body}
</body>
</html>`;
}
