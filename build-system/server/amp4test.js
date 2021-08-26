'use strict';

const app = require('express').Router();
const cors = require('./amp-cors');
const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));
const path = require('path');
const upload = require('multer')();
const {getServeMode, replaceUrls} = require('./app-utils');
const {renderShadowViewer} = require('./shadow-viewer');

const CUSTOM_TEMPLATES = ['amp-mustache'];
const SERVE_MODE = getServeMode();

/**
 * Logs the given messages to the console when --verbose is specified.
 * @param {*} messages
 */
function log(...messages) {
  if (argv.verbose) {
    console.log.apply(console, messages);
  }
}

app.use('/compose-doc', function (req, res) {
  res.setHeader('X-XSS-Protection', '0');

  const {body, css, experiments, extensions, spec} = req.query;

  const frameHtml =
    SERVE_MODE == 'minified'
      ? 'dist.3p/current-min/frame.html'
      : 'dist.3p/current/frame.max.html';

  let experimentsBlock = '';
  if (experiments) {
    const string = `"${experiments.split(',').join('","')}"`;
    // TODO: Why is setting localDev necessary?
    // `allow-doc-opt-in` enables any experiment to be enabled via doc opt-in.
    experimentsBlock = `<script>
        window.AMP_CONFIG = window.AMP_CONFIG || {"localDev": true};
        window.AMP_CONFIG['allow-doc-opt-in'] = (window.AMP_CONFIG['allow-doc-opt-in'] || []).concat([${string}]);
      </script>
      <meta name="amp-experiments-opt-in" content="${experiments}">`;
  }

  // TODO: Do we need to inject amp-3p-iframe-src for non-ad tests?
  const head = `${experimentsBlock}
    <meta name="amp-3p-iframe-src" content="http://localhost:9876/${frameHtml}">`;

  const doc = composeDocument({
    body,
    css,
    extensions: extensions ? extensions.split(',') : '',
    head,
    spec,
  });
  res.cookie('test-cookie', 'test');
  res.send(doc);
});

app.use('/compose-html', function (req, res) {
  res.setHeader('X-XSS-Protection', '0');
  res.send(`
<!doctype html>
<html>
<head>
  <title>NON-AMP TEST</title>
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
</head>
<body>
${req.query.body}
</body>
</html>
  `);
});

app.use('/compose-shadow', function (req, res) {
  const {docUrl} = req.query;
  const viewerHtml = renderShadowViewer({
    src: docUrl.replace(/^\//, ''),
    baseHref: path.dirname(req.url),
  });
  res.send(replaceUrls(SERVE_MODE, viewerHtml));
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
app.use('/request-bank/:bid/deposit/:id/', upload.array(), (req, res) => {
  cors.enableCors(req, res);
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
  cors.enableCors(req, res);
  if (!bank[req.params.bid]) {
    bank[req.params.bid] = {};
  }
  const key = req.params.id;
  log('SERVER-LOG [WITHDRAW]: ' + key);
  const result = bank[req.params.bid][key];
  if (typeof result === 'function') {
    return res
      .status(500)
      .send(`another client is withdrawing this ID [${key}]`);
  }
  const callback = function (result) {
    if (result === undefined) {
      // This happens when tearDown is called but no request
      // of given ID has been received yet.
      res.status(404).send(`Request of given ID not found: [${key}]`);
    } else {
      res.json({
        headers: result.headers,
        body: result.body,
        url: result.url,
      });
    }
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
  log('SERVER-LOG [TEARDOWN]');
  const b = bank[req.params.bid];
  for (const id in b) {
    const callback = b[id];
    if (typeof callback === 'function') {
      // Respond 404 to pending request.
      callback();
    }
    delete b[id];
  }
  res.end();
});

/**
 * Serves a fake ad for test-amp-ad-fake.js
 */
app.get('/a4a/:bid', (req, res) => {
  cors.enableCors(req, res);
  const {bid} = req.params;
  const body = `
  <a href=https://amp.dev target=_blank>
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
            "timestamp": "\${timestamp}",
            "title": "\${title}",
            "ampdocUrl": "\${ampdocUrl}",
            "canonicalUrl": "\${canonicalUrl}",
            "cid": "\${clientId(a)}",
            "img": "\${htmlAttr(amp-img,src)}",
            "navTiming": "\${navTiming(requestStart,requestStart)}",
            "navType": "\${navType}",
            "navRedirectCount": "\${navRedirectCount}",
            "sourceUrl": "\${sourceUrl}",
            "cookie": "\${cookie(test-cookie)}"
          }
        }
      }
    }
    </script>
  </amp-analytics>`;

  const doc = composeDocument({
    spec: 'amp4ads',
    body,
    css: 'body { background-color: #f4f4f4; }',
    extensions: ['amp-analytics'],
  });
  res.cookie('test-cookie', 'test');
  res.send(doc);
});

/**
 * @param {{body: string, css?: string|undefined, extensions: Array<string>|undefined, head?: string|undefined, spec?: string|undefined, mode?: string|undefined}} config
 * @return {string}
 */
function composeDocument(config) {
  const {body, css, extensions, head, mode, spec} = config;

  const m = mode || SERVE_MODE;
  const cdn = m === 'cdn';
  const minified = m === 'minified';

  const cssTag = css ? `<style amp-custom>${css}</style>` : '';

  // Set link[rel=canonical], CSS boilerplate and runtime <script> depending
  // on the AMP spec.
  let canonical, boilerplate, runtime;
  const amp = spec || 'amp';
  switch (amp) {
    case 'amp':
      canonical = '<link rel="canonical" href="http://nonblocking.io" />';
      boilerplate =
        '<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>';
      runtime = cdn
        ? 'https://cdn.ampproject.org/v0.js'
        : `/dist/${minified ? 'v0' : 'amp'}.js`;
      break;
    case 'amp4ads':
      canonical = '';
      boilerplate =
        '<style amp4ads-boilerplate>body{visibility:hidden}</style>';
      runtime = cdn
        ? 'https://cdn.ampproject.org/amp4ads-v0.js'
        : `/dist/${minified ? 'amp4ads-v0' : 'amp-inabox'}.js`;
      break;
    case 'amp4email':
      canonical = '';
      boilerplate =
        '<style amp4email-boilerplate>body{visibility:hidden}</style>';
      runtime = cdn
        ? 'https://cdn.ampproject.org/v0.js'
        : `/dist/${minified ? 'v0' : 'amp'}.js`;
      break;
    default:
      throw new Error('Unrecognized AMP spec: ' + spec);
  }
  const runtimeScript = `<script async src="${runtime}"></script>`;

  // Generate extension <script> markup.
  let extensionScripts = '';
  if (extensions) {
    extensionScripts = extensions
      .map((extension) => {
        const tuple = extension.split(':');
        const name = tuple[0];
        const version = tuple[1] || '0.1';
        const src = cdn
          ? `https://cdn.ampproject.org/v0/${name}-${version}.js`
          : `/dist/v0/${name}-${version}.${minified ? '' : 'max.'}js`;
        const type = CUSTOM_TEMPLATES.includes(name)
          ? 'custom-template'
          : 'custom-element';
        return `<script async ${type}="${name}" src="${src}"></script>`;
      })
      .join('\n');
  }

  const topHalfOfHtml = `<!doctype html>
    <html ${amp}>
    <head>
      <title>AMP TEST</title>
      <meta charset="utf-8">
      ${canonical}
      <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
      ${head || ''}
      ${boilerplate}
      ${runtimeScript}
      ${extensionScripts}
      ${cssTag}
    </head>`;

  // To enable A4A FIE, a <script amp-ad-metadata> tag must exist.
  let ampAdMeta = '';
  if (amp === 'amp4ads') {
    // `ampRuntimeUtf16CharOffsets` is used to cut out all runtime scripts,
    // which are not needed in FIE mode.
    const start = topHalfOfHtml.indexOf(runtimeScript);
    let end = start + runtimeScript.length;

    let customElements = [],
      extensionsMap = [];
    if (extensions) {
      end = topHalfOfHtml.indexOf(extensionScripts) + extensionScripts.length;
      // Filter out extensions that are not custom elements, e.g. amp-mustache.
      customElements = extensions.filter((e) => !CUSTOM_TEMPLATES.includes(e));
      extensionsMap = customElements.map((ce) => {
        return {
          'custom-element': ce,
          // TODO: Should this be a local URL i.e. /dist/v0/...?
          'src': `https://cdn.ampproject.org/v0/${ce}-0.1.js`,
        };
      });
    }
    ampAdMeta = `<script amp-ad-metadata type=application/json>
      {
        "ampRuntimeUtf16CharOffsets": [ ${start}, ${end} ],
        "customElementExtensions": ${JSON.stringify(customElements)},
        "extensions": ${JSON.stringify(extensionsMap)}
      }
      </script>`;
  }

  return `${topHalfOfHtml}
    <body>
    ${body}
    ${ampAdMeta}
    </body>
    </html>`;
}

module.exports = {
  app,
  log,
};
