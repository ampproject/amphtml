'use strict';

/**
 * @fileoverview Creates an http server to handle static
 * files and list directories for use with the amp live server
 */
const argv = require('minimist')(process.argv.slice(2));
const bacon = require('baconipsum');
const bodyParser = require('body-parser');
const cors = require('./amp-cors');
const devDashboard = require('./app-index');
const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const jsdom = require('jsdom');
const path = require('path');
const upload = require('multer')();
const pc = process;
const autocompleteEmailData = require('./autocomplete-test-data');
const header = require('connect-header');
const runVideoTestBench = require('./app-video-testbench');
const {
  getServeMode,
  isRtvMode,
  replaceUrls,
  toInaboxDocument,
} = require('./app-utils');
const {
  getVariableRequest,
  runVariableSubstitution,
  saveVariableRequest,
  saveVariables,
} = require('./variable-substitution');
const {
  recaptchaFrameRequestHandler,
  recaptchaRouter,
} = require('./recaptcha-router');
const {logWithoutTimestamp} = require('../common/logging');
const {log} = require('../common/logging');
const {red} = require('kleur/colors');
const {renderShadowViewer} = require('./shadow-viewer');

/**
 * Respond with content received from a URL when SERVE_MODE is "cdn".
 * @param {express.Response} res
 * @param {string} cdnUrl
 * @return {Promise<boolean>}
 */
async function passthroughServeModeCdn(res, cdnUrl) {
  if (SERVE_MODE !== 'cdn') {
    return false;
  }
  try {
    const response = await fetch(cdnUrl);
    res.status(response.status);
    res.send(await response.text());
  } catch (e) {
    log(red('ERROR:'), e);
    res.status(500);
    res.end();
  }
  return true;
}

const app = express();
const TEST_SERVER_PORT = argv.port || 8000;
let SERVE_MODE = getServeMode();

app.use(bodyParser.json());
app.use(bodyParser.text());

// Middleware is executed in order, so this must be at the top.
// TODO(#24333): Migrate all server URL handlers to new-server/router and
// deprecate app.js.
app.use(require('./new-server/router'));

app.use(require('./routes/a4a-envelopes'));
app.use('/amp4test', require('./amp4test').app);
app.use('/analytics', require('./routes/analytics'));
app.use('/list/', require('./routes/list'));
app.use('/test', require('./routes/test'));
if (argv.coverage) {
  app.use('/coverage', require('istanbul-middleware').createHandler());
}

// Built binaries should be fetchable from other origins, i.e. Storybook.
app.use(header({'Access-Control-Allow-Origin': '*'}));

// Append ?csp=1 to the URL to turn on the CSP header.
// TODO: shall we turn on CSP all the time?
app.use((req, res, next) => {
  if (req.query.csp) {
    res.set({
      'content-security-policy':
        "default-src * blob: data:; script-src https://cdn.ampproject.org/rtv/ https://cdn.ampproject.org/v0.js https://cdn.ampproject.org/v0/ https://cdn.ampproject.org/viewer/ http://localhost:8000 https://localhost:8000; object-src 'none'; style-src 'unsafe-inline' https://cdn.ampproject.org/rtv/ https://cdn.materialdesignicons.com https://cloud.typography.com https://fast.fonts.net https://fonts.googleapis.com https://maxcdn.bootstrapcdn.com https://p.typekit.net https://use.fontawesome.com https://use.typekit.net https://cdnjs.cloudflare.com/ajax/libs/font-awesome/; report-uri https://csp-collector.appspot.com/csp/amp",
    });
  }
  next();
});

/**
 *
 * @param {string} serveMode
 * @return {boolean}
 */
function isValidServeMode(serveMode) {
  return (
    ['default', 'minified', 'cdn', 'esm'].includes(serveMode) ||
    isRtvMode(serveMode)
  );
}

/**
 *
 * @param {string} serveMode
 */
function setServeMode(serveMode) {
  SERVE_MODE = serveMode;
}

app.get('/serve_mode=:mode', (req, res) => {
  const newMode = req.params.mode;
  if (isValidServeMode(newMode)) {
    setServeMode(newMode);
    res.send(`<h2>Serve mode changed to ${newMode}</h2>`);
  } else {
    const info = '<h2>Serve mode ' + newMode + ' is not supported. </h2>';
    res.status(400).send(info);
  }
});

if (argv._.includes('integration') && !argv.nobuild) {
  setServeMode('minified');
}

if (!(argv._.includes('unit') || argv._.includes('integration'))) {
  // Dev dashboard routes break test scaffolding since they're global.
  devDashboard.installExpressMiddleware(app);
}

// Changes the current serve mode via query param
// e.g. /serve_mode_change?mode=(default|minified|cdn|<RTV_NUMBER>)
// (See ./app-index/settings.js)
app.get('/serve_mode_change', (req, res) => {
  const {mode} = req.query;
  if (isValidServeMode(mode)) {
    setServeMode(mode);
    res.json({ok: true});
    return;
  }
  res.status(400).json({ok: false});
});

// Redirects to a proxied document with optional mode through query params.
//
// Mode can be one of:
//   - '/', empty string, or unset for an unwrapped doc
//   - '/a4a/' for an AMP4ADS wrapper
//   - '/a4a-3p/' for a 3P AMP4ADS wrapper
//   - '/inabox/' for an AMP inabox wrapper
//   - '/shadow/' for a shadow-wrapped document
//
// Examples:
//   - /proxy/?url=hello.com 👉 /proxy/s/hello.com
//   - /proxy/?url=hello.com?mode=/shadow/ 👉 /shadow/proxy/s/hello.com
//   - /proxy/?url=https://hello.com 👉 /proxy/s/hello.com
//   - /proxy/?url=https://www.google.com/amp/s/hello.com 👉 /proxy/s/hello.com
//   - /proxy/?url=hello.com/canonical 👉 /proxy/s/hello.com/amp
//
// This passthrough is useful to generate the URL from <form> values,
// (See ./app-index/proxy-form.js)
app.get('/proxy', async (req, res, next) => {
  const {mode, url} = req.query;
  const urlSuffixClearPrefixReStr =
    '^https?://((www.)?google.(com?|[a-z]{2}|com?.[a-z]{2}|cat)/amp/s/)?';
  const urlSuffix = url.replace(new RegExp(urlSuffixClearPrefixReStr, 'i'), '');

  try {
    const ampdocUrl = await requestAmphtmlDocUrl(urlSuffix);
    const ampdocUrlSuffix = ampdocUrl.replace(/^https?:\/\//, '');
    const modePrefix = (mode || '').replace(/\/$/, '');
    const proxyUrl = `${modePrefix}/proxy/s/${ampdocUrlSuffix}`;
    res.redirect(proxyUrl);
  } catch ({message}) {
    logWithoutTimestamp(`ERROR: ${message}`);
    next();
  }
});

/**
 * Resolves an AMPHTML URL from a canonical URL. If AMPHTML is canonical, same
 * URL is returned.
 * @param {string} urlSuffix URL without protocol or google.com/amp/s/...
 * @param {string=} protocol 'https' or 'http'. 'https' retries using 'http'.
 * @return {!Promise<string>}
 */
async function requestAmphtmlDocUrl(urlSuffix, protocol = 'https') {
  const defaultUrl = `${protocol}://${urlSuffix}`;
  logWithoutTimestamp(`Fetching URL: ${defaultUrl}`);

  const response = await fetch(defaultUrl);
  if (!response.ok) {
    if (protocol == 'https') {
      return requestAmphtmlDocUrl(urlSuffix, 'http');
    }
    throw new Error(`Status: ${response.status}`);
  }

  const {window} = new jsdom.JSDOM(await response.text());
  const linkRelAmphtml = window.document.querySelector('link[rel=amphtml]');
  const amphtmlUrl = linkRelAmphtml && linkRelAmphtml.getAttribute('href');
  return amphtmlUrl || defaultUrl;
}

/*
 * Intercept Recaptcha frame for,
 * integration tests. Using this to mock
 * out the recaptcha api.
 */
app.get('/dist.3p/*/recaptcha.*html', recaptchaFrameRequestHandler);
app.use('/recaptcha', recaptchaRouter);

// Deprecate usage of .min.html/.max.html
app.get(
  [
    '/examples/*.(min|max).html',
    '/test/manual/*.(min|max).html',
    '/test/fixtures/e2e/*/*.(min|max).html',
  ],
  (req, res) => {
    const filePath = req.url;
    res.send(generateInfo(filePath));
  }
);

app.use('/pwa', (req, res) => {
  let file;
  let contentType;
  if (!req.url || req.path == '/') {
    // pwa.html
    contentType = 'text/html';
    file = '/examples/pwa/pwa.html';
  } else if (req.url == '/pwa.js') {
    // pwa.js
    contentType = 'application/javascript';
    file = '/examples/pwa/pwa.js';
  } else if (req.url == '/pwa-sw.js') {
    // pwa.js
    contentType = 'application/javascript';
    file = '/examples/pwa/pwa-sw.js';
  } else if (req.url == '/ampdoc-shell') {
    // pwa-ampdoc-shell.html
    contentType = 'text/html';
    file = '/examples/pwa/pwa-ampdoc-shell.html';
  } else {
    // Redirect to the underlying resource.
    // TODO(dvoytenko): would be nicer to do forward instead of redirect.
    res.writeHead(302, {'Location': req.url});
    res.end();
    return;
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  fs.promises.readFile(pc.cwd() + file).then((file) => {
    res.end(file);
  });
});

app.use('/api/show', (_req, res) => {
  res.json({
    showNotification: true,
  });
});

app.use('/api/dont-show', (_req, res) => {
  res.json({
    showNotification: false,
  });
});

app.use('/api/echo/query', (req, res) => {
  res.json(JSON.parse(req.query.data));
});

app.use('/api/echo/post', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(req.body);
});

app.use('/api/ping', (_req, res) => {
  res.status(204).end();
});

app.use('/form/html/post', (req, res) => {
  cors.assertCors(req, res, ['POST']);

  const form = new formidable.IncomingForm();
  form.parse(req, (_err, fields) => {
    res.setHeader('Content-Type', 'text/html');
    if (fields['email'] == 'already@subscribed.com') {
      res.statusCode = 500;
      res.end(`
        <h1 style="color:red;">Sorry ${fields['name']}!</h1>
        <p>The email ${fields['email']} is already subscribed!</p>
      `);
    } else {
      res.end(`
      <h1>Thanks ${fields['name']}!</h1>
        <p>Please make sure to confirm your email ${fields['email']}</p>
      `);
    }
  });
});

app.use('/form/redirect-to/post', (req, res) => {
  cors.assertCors(req, res, ['POST'], ['AMP-Redirect-To']);
  res.setHeader('AMP-Redirect-To', 'https://google.com');
  res.end('{}');
});

app.use('/form/echo-json/post', (req, res) => {
  cors.assertCors(req, res, ['POST']);
  const form = new formidable.IncomingForm();
  const fields = Object.create(null);
  form.on('field', function (name, value) {
    if (!(name in fields)) {
      fields[name] = value;
      return;
    }

    const realName = name;
    if (realName in fields) {
      if (!Array.isArray(fields[realName])) {
        fields[realName] = [fields[realName]];
      }
    } else {
      fields[realName] = [];
    }
    fields[realName].push(value);
  });
  form.parse(req, () => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (fields['email'] == 'already@subscribed.com') {
      res.statusCode = 500;
    }
    res.end(JSON.stringify(fields));
  });
});

app.use('/form/json/poll1', (req, res) => {
  cors.assertCors(req, res, ['POST']);
  const form = new formidable.IncomingForm();
  form.parse(req, () => {
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        result: [
          {
            answer: 'Penguins',
            percentage: new Array(77),
          },
          {
            answer: 'Ostriches',
            percentage: new Array(8),
          },
          {
            answer: 'Kiwis',
            percentage: new Array(14),
          },
          {
            answer: 'Wekas',
            percentage: new Array(1),
          },
        ],
      })
    );
  });
});

app.post('/form/json/upload', upload.fields([{name: 'myFile'}]), (req, res) => {
  cors.assertCors(req, res, ['POST']);

  const myFile = req.files['myFile'];

  if (!myFile) {
    res.json({message: 'No file data received'});
    return;
  }
  const fileData = myFile[0];
  const contents = fileData.buffer.toString();

  res.json({message: contents});
});

app.use('/form/search-html/get', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.end(`
     <h1>Here's results for your search<h1>
     <ul>
      <li>Result 1</li>
      <li>Result 2</li>
      <li>Result 3</li>
     </ul>
  `);
});

app.use('/form/search-json/get', (req, res) => {
  cors.assertCors(req, res, ['GET']);
  res.json({
    term: req.query.term,
    additionalFields: req.query.additionalFields,
    results: [{title: 'Result 1'}, {title: 'Result 2'}, {title: 'Result 3'}],
  });
});

const autocompleteColors = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'black',
  'white',
];

app.use('/form/autocomplete/query', (req, res) => {
  const query = req.query.q;
  if (!query) {
    res.json({items: autocompleteColors});
  } else {
    const lowerCaseQuery = query.toLowerCase();
    const filtered = autocompleteColors.filter((l) =>
      l.toLowerCase().includes(lowerCaseQuery)
    );
    res.json({items: filtered});
  }
});

app.use('/form/autocomplete/error', (_req, res) => {
  res.status(500).end();
});

app.use('/form/mention/query', (req, res) => {
  const query = req.query.q;
  if (!query) {
    res.json({items: autocompleteEmailData});
    return;
  }
  const lowerCaseQuery = query.toLowerCase().trim();
  const filtered = autocompleteEmailData.filter((l) =>
    l.toLowerCase().startsWith(lowerCaseQuery)
  );
  res.json({items: filtered});
});

app.use('/form/verify-search-json/post', (req, res) => {
  cors.assertCors(req, res, ['POST']);
  const form = new formidable.IncomingForm();
  form.parse(req, (_err, fields) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const errors = [];
    if (!fields.phone.match(/^650/)) {
      errors.push({name: 'phone', message: 'Phone must start with 650'});
    }
    if (fields.name !== 'Frank') {
      errors.push({name: 'name', message: 'Please set your name to be Frank'});
    }
    if (fields.error === 'true') {
      errors.push({message: 'You asked for an error, you get an error.'});
    }
    if (fields.city !== 'Mountain View' || fields.zip !== '94043') {
      errors.push({
        name: 'city',
        message: "City doesn't match zip (Mountain View and 94043)",
      });
    }

    if (errors.length === 0) {
      res.end(
        JSON.stringify({
          results: [
            {title: 'Result 1'},
            {title: 'Result 2'},
            {title: 'Result 3'},
          ],
          committed: true,
        })
      );
    } else {
      res.statusCode = 400;
      res.end(JSON.stringify({verifyErrors: errors}));
    }
  });
});

/**
 * Fetches an AMP document from the AMP proxy and replaces JS
 * URLs, so that they point to localhost.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {string} mode
 * @return {Promise<void>}
 */
async function proxyToAmpProxy(req, res, mode) {
  const url =
    'https://cdn.ampproject.org/' +
    (req.query['amp_js_v'] ? 'v' : 'c') +
    req.url;
  logWithoutTimestamp('Fetching URL: ' + url);
  const urlResponse = await fetch(url);
  let body = await urlResponse.text();
  body = body
    // Unversion URLs.
    .replace(
      /https\:\/\/cdn\.ampproject\.org\/rtv\/\d+\//g,
      'https://cdn.ampproject.org/'
    )
    // <base> href pointing to the proxy, so that images, etc. still work.
    .replace('<head>', '<head><base href="https://cdn.ampproject.org/">');
  const inabox = req.query['inabox'];
  const urlPrefix = getUrlPrefix(req);
  if (req.query['mraid']) {
    body = body
      .replace(
        '</head>',
        '<script async host-service="amp-mraid" src="https://cdn.ampproject.org/v0/amp-mraid-0.1.js">' +
          '</script>' +
          '</head>'
      )
      // Change cdnUrl from the default so amp-mraid requests the (mock)
      // mraid.js from the local server. In a real environment this doesn't
      // matter as the local environment would intercept this request.
      .replace(
        '<head>',
        ' <head>' +
          ' <script>' +
          ' window.AMP_CONFIG = {' +
          `   cdnUrl: "${urlPrefix}",` +
          ' };' +
          ' </script>'
      );
  }
  if (inabox) {
    body = toInaboxDocument(body);
    // Allow CORS requests for A4A.
    const origin = req.headers.origin || urlPrefix;
    cors.enableCors(req, res, origin);
  }
  body = replaceUrls(mode, body, urlPrefix);
  res.status(urlResponse.status).send(body);
}

let itemCtr = 2;
const doctype = '<!doctype html>\n';
const liveListDocs = Object.create(null);
app.use('/examples/live-list-update(-reverse)?.amp.html', (req, res, next) => {
  const mode = SERVE_MODE;
  let liveListDoc = liveListDocs[req.baseUrl];
  if (mode != 'minified' && mode != 'default') {
    // Only handle compile(prev min)/default (prev max) mode
    next();
    return;
  }
  // When we already have state in memory and user refreshes page, we flush
  // the dom we maintain on the server.
  if (!('amp_latest_update_time' in req.query) && liveListDoc) {
    let outerHTML = liveListDoc.documentElement./*OK*/ outerHTML;
    outerHTML = replaceUrls(mode, outerHTML);
    res.send(`${doctype}${outerHTML}`);
    return;
  }
  if (!liveListDoc) {
    const liveListUpdateFullPath = `${pc.cwd()}${req.baseUrl}`;
    logWithoutTimestamp('liveListUpdateFullPath', liveListUpdateFullPath);
    const liveListFile = fs.readFileSync(liveListUpdateFullPath);
    liveListDoc = liveListDocs[req.baseUrl] = new jsdom.JSDOM(
      liveListFile
    ).window.document;
    liveListDoc.ctr = 0;
  }
  const liveList = liveListDoc.querySelector('#my-live-list');
  const perPage = Number(liveList.getAttribute('data-max-items-per-page'));
  const items = liveList.querySelector('[items]');
  const pagination = liveListDoc.querySelector('#my-live-list [pagination]');
  const item1 = liveList.querySelector('#list-item-1');
  if (liveListDoc.ctr != 0) {
    if (Math.random() < 0.8) {
      // Always run a replace on the first item
      liveListReplace(item1);

      if (Math.random() < 0.5) {
        liveListTombstone(liveList);
      }

      if (Math.random() < 0.8) {
        liveListInsert(liveList, item1);
      }
      pagination.textContent = '';
      const liveChildren = [].slice
        .call(items.children)
        .filter((x) => !x.hasAttribute('data-tombstone'));

      const pageCount = Math.ceil(liveChildren.length / perPage);
      const pageListItems = Array.apply(null, Array(pageCount))
        .map((_, i) => `<li>${i + 1}</li>`)
        .join('');
      const newPagination =
        '<nav aria-label="amp live list pagination">' +
        `<ul class="pagination">${pageListItems}</ul>` +
        '</nav>';
      pagination./*OK*/ innerHTML = newPagination;
    } else {
      // Sometimes we want an empty response to simulate no changes.
      res.send(`${doctype}<html></html>`);
      return;
    }
  }
  let outerHTML = liveListDoc.documentElement./*OK*/ outerHTML;
  outerHTML = replaceUrls(mode, outerHTML);
  liveListDoc.ctr++;
  res.send(`${doctype}${outerHTML}`);
});

/**
 * @param {Element} item
 */
function liveListReplace(item) {
  item.setAttribute('data-update-time', Date.now().toString());
  const itemContents = item.querySelectorAll('.content');
  itemContents[0].textContent = Math.floor(Math.random() * 10).toString();
  itemContents[1].textContent = Math.floor(Math.random() * 10).toString();
}

/**
 * @param {Element} liveList
 * @param {Element} node
 */
function liveListInsert(liveList, node) {
  const iterCount = Math.floor(Math.random() * 2) + 1;
  logWithoutTimestamp(`inserting ${iterCount} item(s)`);
  for (let i = 0; i < iterCount; i++) {
    /**
     * TODO(#28387) this type cast may be hiding a bug.
     * @type {Element}
     */
    const child = /** @type {*} */ (node.cloneNode(true));
    child.setAttribute('id', `list-item-${itemCtr++}`);
    child.setAttribute('data-sort-time', Date.now().toString());
    liveList.querySelector('[items]')?.appendChild(child);
  }
}

/**
 * @param {Element} liveList
 */
function liveListTombstone(liveList) {
  const tombstoneId = Math.floor(Math.random() * itemCtr);
  logWithoutTimestamp(`trying to tombstone #list-item-${tombstoneId}`);
  // We can tombstone any list item except item-1 since we always do a
  // replace example on item-1.
  if (tombstoneId != 1) {
    const item = liveList./*OK*/ querySelector(`#list-item-${tombstoneId}`);
    if (item) {
      item.setAttribute('data-tombstone', '');
    }
  }
}

/**
 * Generate a random number between min and max
 * Value is inclusive of both min and max values.
 *
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function range(min, max) {
  const values = Array.apply(null, new Array(max - min + 1)).map(
    (_, i) => min + i
  );
  return values[Math.round(Math.random() * (max - min))];
}

/**
 * Returns the result of a coin flip, true or false
 *
 * @return {boolean}
 */
function flip() {
  return !!Math.floor(Math.random() * 2);
}

/**
 * @return {string}
 */
function getLiveBlogItem() {
  const now = Date.now();
  // Generate a 3 to 7 worded headline
  const headline = bacon(range(3, 7));
  const numOfParagraphs = range(1, 2);
  const body = Array.apply(null, new Array(numOfParagraphs))
    .map(() => {
      return `<p>${bacon(range(50, 90))}</p>`;
    })
    .join('\n');

  const img = `<amp-img
        src="${
          flip()
            ? 'https://placekitten.com/300/350'
            : 'https://baconmockup.com/300/350'
        }"
        layout="responsive"
         height="300" width="350">
      </amp-img>`;
  return `<!doctype html>
    <html amp><body>
    <amp-live-list id="live-blog-1">
    <div items>
      <div id="live-blog-item-${now}" data-sort-time="${now}">
        <h3 class="headline">
          <a href="#live-blog-item-${now}">${headline}</a>
        </h3>
        <div class="author">
          <div class="byline">
            <p>
              by <span itemscope itemtype="http://schema.org/Person"
              itemprop="author"><b>Lorem Ipsum</b>
              <a class="mailto" href="mailto:lorem.ipsum@">
              lorem.ipsum@</a></span>
            </p>
            <p class="brand">PublisherName News Reporter<p>
            <p><span itemscope itemtype="http://schema.org/Date"
                itemprop="Date">
                ${new Date(now).toString().replace(/ GMT.*$/, '')}
                <span></p>
          </div>
        </div>
        <div class="article-body">${body}</div>
        ${img}
        <div class="social-box">
          <amp-social-share type="facebook"
              data-param-text="Hello world"
              data-param-href="https://example.test/?ref=URL"
              data-param-app_id="145634995501895"></amp-social-share>
          <amp-social-share type="twitter"></amp-social-share>
        </div>
      </div>
    </div>
    </amp-live-list></body></html>`;
}

/**
 * @return {string}
 */
function getLiveBlogItemWithBindAttributes() {
  const now = Date.now();
  // Generate a 3 to 7 worded headline
  const numOfParagraphs = range(1, 2);
  const body = Array.apply(null, new Array(numOfParagraphs))
    .map(() => {
      return `<p>${bacon(range(50, 90))}</p>`;
    })
    .join('\n');

  return `<!doctype html>
    <html amp><body>
    <amp-live-list id="live-blog-1">
    <div items>
      <div id="live-blog-item-${now}" data-sort-time="${now}">
        <div class="article-body">
          ${body}
          <p> As you can see, bacon is far superior to
          <b><span [text]='favoriteFood'>everything!</span></b>!</p>
        </div>
      </div>
    </div>
    </amp-live-list></body></html>`;
}

app.use(
  '/examples/live-blog(-non-floating-button)?.amp.html',
  (req, res, next) => {
    if ('amp_latest_update_time' in req.query) {
      res.setHeader('Content-Type', 'text/html');
      res.end(getLiveBlogItem());
      return;
    }
    next();
  }
);

app.use('/examples/bind/live-list.amp.html', (req, res, next) => {
  if ('amp_latest_update_time' in req.query) {
    res.setHeader('Content-Type', 'text/html');
    res.end(getLiveBlogItemWithBindAttributes());
    return;
  }
  next();
});

app.use('/impression-proxy/', (req, res) => {
  cors.assertCors(req, res, ['GET']);
  // Fake response with the following optional fields:
  // location: The Url the that server would have sent redirect to w/o ALP
  // tracking_url: URL that should be requested to track click
  // gclid: The conversion tracking value
  const body = {
    'location': 'localhost:8000/examples/?gclid=1234&foo=bar&example=123',
    'tracking_url': 'tracking_url',
    'gclid': '1234',
  };
  res.send(body);

  // Or fake response with status 204 if viewer replaceUrl is provided
});

/**
 * Acts in a similar fashion to /serve_mode_change. Saves
 * analytics requests via /run-variable-substitution, and
 * then returns the encoded/substituted/replaced request
 * via /get-variable-request.
 */

// Saves the variables input to be used in run-variable-substitution
app.get('/save-variables', saveVariables);

// Creates an iframe with amp-analytics. Analytics request
// uses save-variable-request as its endpoint.
app.get('/run-variable-substitution', runVariableSubstitution);

// Saves the analytics request to the dev server.
app.get('/save-variable-request', saveVariableRequest);

// Returns the saved analytics request.
app.get('/get-variable-request', getVariableRequest);

let forcePromptOnNext = false;
app.post('/get-consent-v1/', (req, res) => {
  cors.assertCors(req, res, ['POST']);
  const body = {
    'promptIfUnknown': true,
    'purposeConsentRequired': ['purpose-foo', 'purpose-bar'],
    'forcePromptOnNext': forcePromptOnNext,
    'sharedData': {
      'tfua': true,
      'coppa': true,
    },
  };
  res.json(body);
});

app.get('/get-consent-v1-set/', (req, res) => {
  cors.assertCors(req, res, ['GET']);
  const value = req.query['forcePromptOnNext'];
  if (value == 'false' || value == '0') {
    forcePromptOnNext = false;
  } else {
    forcePromptOnNext = true;
  }
  res.json({});
  res.end();
});

app.post('/get-consent-no-prompt/', (req, res) => {
  cors.assertCors(req, res, ['POST']);
  const body = {};
  res.json(body);
});

app.post('/check-consent', (req, res) => {
  cors.assertCors(req, res, ['POST']);
  const response = {
    'consentRequired': req.query.consentRequired === 'true',
    'consentStateValue': req.query.consentStateValue,
    'consentString': req.query.consentString,
    'expireCache': req.query.expireCache === 'true',
  };
  if (req.query.consentMetadata) {
    response['consentMetadata'] = JSON.parse(
      req.query.consentMetadata.replace(/'/g, '"')
    );
  }
  res.json(response);
});

// Proxy with local JS.
// Example:
// http://localhost:8000/proxy/s/www.washingtonpost.com/amphtml/news/post-politics/wp/2016/02/21/bernie-sanders-says-lower-turnout-contributed-to-his-nevada-loss-to-hillary-clinton/
app.use('/proxy/', (req, res) => proxyToAmpProxy(req, res, SERVE_MODE));

// Nest the response in an iframe.
// Example:
// http://localhost:8000/iframe/examples/ads.amp.html
app.get('/iframe/*', (req, res) => {
  // Returns an html blob with an iframe pointing to the url after /iframe/.
  res.send(`<!doctype html>
          <html style="width:100%; height:100%;">
            <body style="width:98%; height:98%;">
              <iframe src="${req.url.substr(7)}"
                  style="width:100%; height:100%;">
              </iframe>
            </body>
          </html>`);
});

app.get('/a4a_template/*', (req, res) => {
  cors.assertCors(req, res, ['GET']);
  const match = /^\/a4a_template\/([a-z-]+)\/(\d+)$/.exec(req.path);
  if (!match) {
    res.status(404);
    res.end('Invalid path: ' + req.path);
    return;
  }
  const filePath =
    `${pc.cwd()}/extensions/amp-ad-network-${match[1]}-impl/` +
    `0.1/data/${match[2]}.template`;
  fs.promises
    .readFile(filePath)
    .then((file) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('AMP-template-amp-creative', 'amp-mustache');
      res.end(file);
    })
    .catch(() => {
      res.status(404);
      res.end('Not found: ' + filePath);
    });
});

// Returns a document that echoes any post messages received from parent.
// An optional `message` query param can be appended for an initial post
// message sent on document load.
// Example:
// http://localhost:8000/iframe-echo-message?message=${payload}
app.get('/iframe-echo-message', (req, res) => {
  const {message} = req.query;
  res.send(
    `<!doctype html>
        <body style="background-color: yellow">
        <script>
        if (${message}) {
          echoMessage(${message});
        }
        window.addEventListener('message', function(event) {
          echoMessage(event.data);
        });
        function echoMessage(message) {
          parent.postMessage(message, '*');
        }
        </script>
        </body>
      </html>`
  );
});

/**
 * Append ?sleep=5 to any included JS file in examples to emulate delay in
 * loading that file. This allows you to test issues with your extension being
 * late to load and testing user interaction with your element before your code
 * loads.
 *
 * Example delay loading amp-form script by 5 seconds:
 * <script async custom-element="amp-form"
 *    src="https://cdn.ampproject.org/v0/amp-form-0.1.js?sleep=5"></script>
 */
app.use(['/dist/v0/amp-*.(m?js)', '/dist/amp*.(m?js)'], (req, _res, next) => {
  const sleep = parseInt(req.query.sleep || 0, 10) * 1000;
  setTimeout(next, sleep);
});

/**
 * Disable caching for extensions if the --no_caching_extensions flag is used.
 */
app.get(['/dist/v0/amp-*.(m?js)'], (_req, res, next) => {
  if (argv.no_caching_extensions) {
    res.header('Cache-Control', 'no-store');
  }
  next();
});

/**
 * Video testbench endpoint
 */
app.get('/test/manual/amp-video.amp.html', runVideoTestBench);

app.get(
  [
    '/examples/(**/)?*.html',
    '/test/manual/(**/)?*.html',
    '/test/fixtures/e2e/(**/)?*.html',
    '/test/fixtures/performance/(**/)?*.html',
  ],
  (req, res, next) => {
    const filePath = req.path;
    const mode = SERVE_MODE;
    const inabox = req.query['inabox'];
    const stream = Number(req.query['stream']);
    const componentVersion = req.query['componentVersion'];
    const urlPrefix = getUrlPrefix(req);
    fs.promises
      .readFile(pc.cwd() + filePath, 'utf8')
      .then((file) => {
        if (req.query['amp_js_v']) {
          file = addViewerIntegrationScript(req.query['amp_js_v'], file);
        }
        if (req.query['mraid']) {
          file = file
            .replace(
              '</head>',
              '<script async host-service="amp-mraid" src="https://cdn.ampproject.org/v0/amp-mraid-0.1.js">' +
                '</script>' +
                '</head>'
            )
            .replace(
              '<head>',
              ' <head>' +
                ' <script>' +
                ' window.AMP_CONFIG = {' +
                `   cdnUrl: "${urlPrefix}",` +
                ' };' +
                ' </script>'
            );
        }
        file = file.replace(/__TEST_SERVER_PORT__/g, TEST_SERVER_PORT);
        if (componentVersion) {
          file = file.replace(/-latest.js/g, `-${componentVersion}.js`);
        }

        if (inabox) {
          file = toInaboxDocument(file);
          // Allow CORS requests for A4A.
          if (req.headers.origin) {
            cors.enableCors(req, res, req.headers.origin);
          }
        }

        file = replaceUrls(mode, file);

        const ampExperimentsOptIn = req.query['exp'];
        if (ampExperimentsOptIn) {
          file = file.replace(
            '<head>',
            `<head><meta name="amp-experiments-opt-in" content="${ampExperimentsOptIn}">`
          );
        }

        // Extract amp-ad for the given 'type' specified in URL query.
        if (req.path.indexOf('/examples/ads.amp.html') == 0 && req.query.type) {
          const ads =
            file.match(
              elementExtractor('(amp-ad|amp-embed)', req.query.type)
            ) ?? [];
          file = file.replace(
            /<body>[\s\S]+<\/body>/m,
            '<body>' + ads.join('') + '</body>'
          );
        }

        // Extract amp-analytics for the given 'type' specified in URL query.
        if (
          req.path.indexOf('/examples/analytics-vendors.amp.html') == 0 &&
          req.query.type
        ) {
          const analytics =
            file.match(elementExtractor('amp-analytics', req.query.type)) ?? [];
          file = file.replace(
            /<div id="container">[\s\S]+<\/div>/m,
            '<div id="container">' + analytics.join('') + '</div>'
          );
        }

        // Extract amp-consent for the given 'type' specified in URL query.
        if (
          req.path.indexOf('/examples/amp-consent/cmp-vendors.amp.html') == 0 &&
          req.query.type
        ) {
          const consent =
            file.match(elementExtractor('amp-consent', req.query.type)) ?? [];
          file = file.replace(
            /<div id="container">[\s\S]+<\/div>/m,
            '<div id="container">' + consent.join('') + '</div>'
          );
        }

        if (stream > 0) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          let pos = 0;
          const writeChunk = function () {
            const chunk = file.substring(
              pos,
              Math.min(pos + stream, file.length)
            );
            res.write(chunk);
            pos += stream;
            if (pos < file.length) {
              setTimeout(writeChunk, 500);
            } else {
              res.end();
            }
          };
          writeChunk();
        } else {
          res.send(file);
        }
      })
      .catch(() => {
        next();
      });
  }
);

/**
 * @param {string} string
 * @return {string}
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {string} tagName
 * @param {string} type
 * @return {RegExp}
 */
function elementExtractor(tagName, type) {
  type = escapeRegExp(type);
  return new RegExp(
    `<${tagName}[\\s][^>]*['"]${type}['"][^>]*>([\\s\\S]+?)</${tagName}>`,
    'gm'
  );
}

// Data for example: http://localhost:8000/examples/bind/xhr.amp.html
app.use('/bind/form/get', (req, res) => {
  cors.assertCors(req, res, ['GET']);
  res.json({
    bindXhrResult: 'I was fetched from the server!',
  });
});

// Data for example: http://localhost:8000/examples/bind/ecommerce.amp.html
app.use('/bind/ecommerce/sizes', (req, res) => {
  cors.assertCors(req, res, ['GET']);
  setTimeout(() => {
    const prices = {
      '0': {
        'sizes': {
          'XS': 8.99,
          'S': 9.99,
        },
      },
      '1': {
        'sizes': {
          'S': 10.99,
          'M': 12.99,
          'L': 14.99,
        },
      },
      '2': {
        'sizes': {
          'L': 11.99,
          'XL': 13.99,
        },
      },
      '3': {
        'sizes': {
          'M': 7.99,
          'L': 9.99,
          'XL': 11.99,
        },
      },
      '4': {
        'sizes': {
          'XS': 8.99,
          'S': 10.99,
          'L': 15.99,
        },
      },
      '5': {
        'sizes': {
          'S': 8.99,
          'L': 14.99,
          'XL': 11.99,
        },
      },
      '6': {
        'sizes': {
          'XS': 8.99,
          'S': 9.99,
          'M': 12.99,
        },
      },
      '7': {
        'sizes': {
          'M': 10.99,
          'L': 11.99,
        },
      },
    };
    const object = {};
    object[req.query.shirt] = prices[req.query.shirt];
    res.json(object);
  }, 1000); // Simulate network delay.
});

/**
 * Simulates a publisher's metering state store.
 * (amp-subscriptions)
 * @type {{[ampReaderId: string]: {}}}
 */
const meteringStateStore = {};

// Simulate a publisher's entitlements API.
// (amp-subscriptions)
app.use('/subscription/:id/entitlements', (req, res) => {
  cors.assertCors(req, res, ['GET']);

  // Create entitlements response.
  const source = 'local' + req.params.id;
  const granted = req.params.id > 0;
  const grantReason = granted ? 'SUBSCRIBER' : 'NOT_SUBSCRIBER';
  const decryptedDocumentKey = decryptDocumentKey(req.query.crypt);
  const response = {
    source,
    granted,
    grantReason,
    data: {
      login: true,
    },
    decryptedDocumentKey,
  };

  // Store metering state, if possible.
  const ampReaderId = req.query.rid;
  if (ampReaderId && req.query.meteringState) {
    // Parse metering state from encoded Base64 string.
    const encodedMeteringState = req.query.meteringState;
    const decodedMeteringState = Buffer.from(
      encodedMeteringState,
      'base64'
    ).toString();
    const meteringState = JSON.parse(decodedMeteringState);

    // Store metering state.
    meteringStateStore[ampReaderId] = meteringState;
  }

  // Add metering state to response, if possible.
  if (meteringStateStore[ampReaderId]) {
    response.metering = {
      state: meteringStateStore[ampReaderId],
    };
  }

  res.json(response);
});

// Simulate a publisher's SKU map API.
// (amp-subscriptions)
app.use('/subscriptions/skumap', (req, res) => {
  cors.assertCors(req, res, ['GET']);
  res.json({
    'subscribe.google.com': {
      'subscribeButtonSimple': {
        'sku': 'basic',
      },
      'subscribeButtonCarousel': {
        'carouselOptions': {
          'skus': ['basic', 'premium_monthly'],
        },
      },
    },
  });
});

// Simulate a publisher's pingback API.
// (amp-subscriptions)
app.use('/subscription/pingback', (req, res) => {
  cors.assertCors(req, res, ['POST']);
  res.json({
    done: true,
  });
});

/*
  Simulate a publisher's account registration API.

  The `amp-subscriptions-google` extension sends this API a POST request.
  The request body looks like:

  {
    "googleSignInDetails": {
      // This signed JWT contains information from Google Sign-In
      "idToken": "...JWT from Google Sign-In...",
      // Some useful fields from the `idToken`, pre-parsed for convenience
      "name": "Jane Smith",
      "givenName": "Jane",
      "familyName": "Smith",
      "imageUrl": "https://imageurl",
      "email": "janesmith@example.com"
    },
    // Associate this ID with the registration. Use it to look up metering state
    // for future entitlements requests
    // https://github.com/ampproject/amphtml/blob/main/extensions/amp-subscriptions/amp-subscriptions.md#combining-the-amp-reader-id-with-publisher-cookies
    "ampReaderId": "amp-s0m31d3nt1f13r"
  }

  (amp-subscriptions-google)
*/
app.use('/subscription/register', (req, res) => {
  cors.assertCors(req, res, ['POST']);

  // Generate a new ID for this metering state.
  const meteringStateId = 'ppid' + Math.round(Math.random() * 99999999);

  // Define registration timestamp.
  //
  // For demo purposes, set timestamp to 30 seconds ago.
  // This causes Metering Toast to show immediately,
  // which helps engineers test metering.
  const registrationTimestamp = Math.round(Date.now() / 1000) - 30000;

  // Store metering state.
  //
  // For demo purposes, just save this in memory.
  // Production systems should persist this.
  meteringStateStore[req.body.ampReaderId] = {
    id: meteringStateId,
    standardAttributes: {
      // eslint-disable-next-line local/camelcase
      registered_user: {
        timestamp: registrationTimestamp, // In seconds.
      },
    },
  };

  res.json({
    metering: {
      state: meteringStateStore[req.body.ampReaderId],
    },
  });
});

// Simulated adzerk ad server and AMP cache CDN.
app.get('/adzerk/*', (req, res) => {
  cors.assertCors(req, res, ['GET'], ['AMP-template-amp-creative']);
  const match = /\/(\d+)/.exec(req.path);
  if (!match || !match[1]) {
    res.status(404);
    res.end('Invalid path: ' + req.path);
    return;
  }
  const filePath =
    pc.cwd() + '/extensions/amp-ad-network-adzerk-impl/0.1/data/' + match[1];
  fs.promises
    .readFile(filePath)
    .then((file) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('AMP-Ad-Template-Extension', 'amp-mustache');
      res.setHeader('AMP-Ad-Response-Type', 'template');
      res.end(file);
    })
    .catch(() => {
      res.status(404);
      res.end('Not found: ' + filePath);
    });
});

app.get('/dist/*.mjs', (req, res, next) => {
  // Allow CORS access control explicitly for mjs files
  cors.enableCors(req, res);
  next();
});

/*
 * Serve extension scripts and their source maps.
 */
app.get(
  ['/dist/rtv/*/v0/*.(m?js)', '/dist/rtv/*/v0/*.(m?js).map'],
  async (req, res, next) => {
    const mode = SERVE_MODE;
    const fileName = path.basename(req.path).replace('.max.', '.');
    let filePath = 'https://cdn.ampproject.org/v0/' + fileName;
    if (await passthroughServeModeCdn(res, filePath)) {
      return;
    }
    const isJsMap = filePath.endsWith('.map');
    if (isJsMap) {
      filePath = filePath.replace(/\.(m?js)\.map$/, '.$1');
    }
    filePath = replaceUrls(mode, filePath);
    req.url = filePath + (isJsMap ? '.map' : '');
    next();
  }
);

/**
 * Handle amp-story translation file requests with an rtv path.
 * We need to make sure we only handle the amp-story requests since this
 * can affect other tests with json requests.
 */
app.get('/dist/rtv/*/v0/amp-story*.json', async (req, _res, next) => {
  const fileName = path.basename(req.path);
  let filePath = 'https://cdn.ampproject.org/v0/' + fileName;
  filePath = replaceUrls(SERVE_MODE, filePath);
  req.url = filePath;
  next();
});

if (argv.coverage === 'live') {
  app.get('/dist/amp.js', async (req, res) => {
    const ampJs = await fs.promises.readFile(`${pc.cwd()}${req.path}`);
    res.setHeader('Content-Type', 'text/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Append an unload handler that reports coverage information each time you
    // leave a page.
    res.end(`${ampJs};
window.addEventListener('beforeunload', (evt) => {
  const COV_REPORT_URL = 'http://localhost:${TEST_SERVER_PORT}/coverage/client';
  console.info('POSTing code coverage to', COV_REPORT_URL);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', COV_REPORT_URL, true);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(JSON.stringify(window.__coverage__));

  // Required by Chrome
  evt.returnValue = '';
  return null;
});`);
  });
}

app.get('/dist/ww.(m?js)', async (req, res, next) => {
  // Special case for entry point script url. Use minified for testing
  const mode = SERVE_MODE;
  const fileName = path.basename(req.path);
  if (await passthroughServeModeCdn(res, fileName)) {
    return;
  }
  if (mode == 'default') {
    req.url = req.url.replace(/\.(m?js)$/, '.max.$1');
  }
  next();
});

app.get('/dist/iframe-transport-client-lib.(m?js)', (req, _res, next) => {
  req.url = req.url.replace(/dist/, 'dist.3p/current');
  next();
});

app.get('/dist/amp-inabox-host.(m?js)', (req, _res, next) => {
  const mode = SERVE_MODE;
  if (mode != 'default') {
    req.url = req.url.replace('amp-inabox-host', 'amp4ads-host-v0');
  }
  next();
});

app.get('/mraid.js', (req, _res, next) => {
  req.url = req.url.replace('mraid.js', 'examples/mraid/mraid.js');
  next();
});

/**
 * Shadow viewer. Fetches shadow runtime from cdn by default.
 * Setting the param useLocal=1 will load the runtime from the local build.
 */
app.use('/shadow/', (req, res) => {
  const {url} = req;
  const isProxyUrl = /^\/proxy\//.test(url);

  const baseHref = isProxyUrl
    ? 'https://cdn.ampproject.org/'
    : `${path.dirname(url)}/`;

  const viewerHtml = renderShadowViewer({
    src: '//' + req.hostname + '/' + req.url.replace(/^\//, ''),
    baseHref,
  });

  if (!req.query.useLocal) {
    res.end(viewerHtml);
    return;
  }
  res.end(replaceUrls(SERVE_MODE, viewerHtml));
});

app.use('/mraid/', (req, res) => {
  res.redirect(req.url + '?inabox=1&mraid=1');
});

/**
 * @param {string} ampJsVersionString
 * @param {string} file
 * @return {string}
 */
function addViewerIntegrationScript(ampJsVersionString, file) {
  const ampJsVersion = parseFloat(ampJsVersionString);
  if (!ampJsVersion) {
    return file;
  }
  let viewerScript;
  // eslint-disable-next-line local/no-es2015-number-props
  if (Number.isInteger(ampJsVersion)) {
    // Viewer integration script from gws, such as
    // https://cdn.ampproject.org/viewer/google/v7.js
    viewerScript =
      '<script async src="https://cdn.ampproject.org/viewer/google/v' +
      ampJsVersion +
      '.js"></script>';
  } else {
    // Viewer integration script from runtime, such as
    // https://cdn.ampproject.org/v0/amp-viewer-integration-0.1.js
    viewerScript =
      '<script async ' +
      'src="https://cdn.ampproject.org/v0/amp-viewer-integration-' +
      ampJsVersion +
      '.js" data-amp-report-test="viewer-integr.js"></script>';
  }
  file = file.replace('</head>', viewerScript + '</head>');
  return file;
}

/**
 * @param {express.Request} req
 * @return {string}
 */
function getUrlPrefix(req) {
  return req.protocol + '://' + req.headers.host;
}

/**
 * @param {string} filePath
 * @return {string}
 */
function generateInfo(filePath) {
  const mode = SERVE_MODE;
  filePath = filePath.substr(0, filePath.length - 9) + '.html';

  return (
    '<h2>Please note that .min/.max is no longer supported</h2>' +
    '<h3>Current serving mode is ' +
    mode +
    '</h3>' +
    '<h3>Please go to <a href= ' +
    filePath +
    '>Unversioned Link</a> to view the page<h3>' +
    '<h3></h3>' +
    '<h3><a href = /serve_mode=default>' +
    'Change to DEFAULT mode (unminified JS)</a></h3>' +
    '<h3><a href = /serve_mode=minified>' +
    'Change to COMPILED mode (minified JS)</a></h3>' +
    '<h3><a href = /serve_mode=cdn>' +
    'Change to CDN mode (prod JS)</a></h3>'
  );
}

/**
 * @param {string} encryptedDocumentKey
 * @return {?string}
 */
function decryptDocumentKey(encryptedDocumentKey) {
  if (!encryptedDocumentKey) {
    return null;
  }
  const cryptoStart = 'ENCRYPT(';
  if (!encryptedDocumentKey.includes(cryptoStart, 0)) {
    return null;
  }
  let jsonString = encryptedDocumentKey.replace(cryptoStart, '');
  jsonString = jsonString.substring(0, jsonString.length - 1);
  const parsedJson = JSON.parse(jsonString);
  if (!parsedJson) {
    return null;
  }
  return parsedJson.key;
}

// serve local vendor config JSON files
app.use(
  '(/dist)?/rtv/*/v0/analytics-vendors/:vendor.json',
  async (req, res) => {
    const {vendor} = req.params;
    const serveMode = SERVE_MODE;

    const cdnUrl = `https://cdn.ampproject.org/v0/analytics-vendors/${vendor}.json`;
    if (await passthroughServeModeCdn(res, cdnUrl)) {
      return;
    }

    const max = serveMode === 'default' ? '.max' : '';
    const localPath = `${pc.cwd()}/dist/v0/analytics-vendors/${vendor}${max}.json`;

    try {
      const file = await fs.promises.readFile(localPath);
      res.setHeader('Content-Type', 'application/json');
      res.end(file);
    } catch (_) {
      res.status(404);
      res.end('Not found: ' + localPath);
    }
  }
);

module.exports = app;
