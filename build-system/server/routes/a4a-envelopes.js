const express = require('express');
const fs = require('fs');
const {getServeMode, replaceUrls} = require('../app-utils');
const {log} = require('../../common/logging');
const {red} = require('kleur/colors');

const app = express.Router();

// In-a-box envelope.
// Examples:
// http://localhost:8000/inabox/examples/animations.amp.html
// http://localhost:8000/inabox/proxy/s/www.washingtonpost.com/amphtml/news/post-politics/wp/2016/02/21/bernie-sanders-says-lower-turnout-contributed-to-his-nevada-loss-to-hillary-clinton/
app.use(['/inabox', '/inabox-mraid'], async (req, res) => {
  const templatePath =
    process.cwd() + '/build-system/server/server-inabox-template.html';
  let template = await fs.promises.readFile(templatePath, 'utf8');
  template = template.replace(/SOURCE/g, 'AD_URL');
  if (req.baseUrl == '/inabox-mraid') {
    // MRAID does not load amp4ads-host-v0.js
    template = template.replace('INABOX_ADS_TAG_INTEGRATION', '');
  }
  const url = getInaboxUrl(req);
  res.end(fillTemplate(template, url.href, req.query));
});

// In-a-box friendly iframe and safeframe envelope.
// Examples:
// http://localhost:8000/inabox-friendly/examples/animations.amp.html
// http://localhost:8000/inabox-friendly/proxy/s/www.washingtonpost.com/amphtml/news/post-politics/wp/2016/02/21/bernie-sanders-says-lower-turnout-contributed-to-his-nevada-loss-to-hillary-clinton/
app.use('/inabox-(friendly|safeframe)', async (req, res) => {
  const templatePath = '/build-system/server/server-inabox-template.html';
  try {
    let template = await fs.promises.readFile(
      process.cwd() + templatePath,
      'utf8'
    );

    const url = getInaboxUrl(req);
    if (req.baseUrl == '/inabox-friendly') {
      template = template
        .replace('SRCDOC_ATTRIBUTE', 'srcdoc="BODY"')
        .replace('INABOX_ADS_TAG_INTEGRATION', '');
    } else {
      template = template
        .replace(
          /NAME/g,
          '1-0-31;LENGTH;BODY{&quot;uid&quot;:&quot;test&quot;}'
        )
        .replace(
          /SOURCE/g,
          url.origin + '/test/fixtures/served/iframe-safeframe.html'
        );
    }
    const result = await requestFromUrl(template, url.href, req.query);
    res.end(result);
  } catch (err) {
    log(red('Error:'), err);
    res.status(500);
    res.end();
  }
});

// A4A envelope.
// Examples:
// http://localhost:8000/a4a[-3p]/examples/animations.amp.html
// http://localhost:8000/a4a[-3p]/proxy/s/www.washingtonpost.com/amphtml/news/post-politics/wp/2016/02/21/bernie-sanders-says-lower-turnout-contributed-to-his-nevada-loss-to-hillary-clinton/
app.use('/a4a(|-3p)/', async (req, res) => {
  const force3p = req.baseUrl.startsWith('/a4a-3p');
  const templatePath = '/build-system/server/server-a4a-template.html';
  const url = getInaboxUrl(req);
  const template = await fs.promises.readFile(
    process.cwd() + templatePath,
    'utf8'
  );
  const branchLevelExperiments = req.query.eid;

  const content = fillTemplate(template, url.href, req.query)
    .replace(/CHECKSIG/g, force3p || '')
    .replace(/DATAEXPERIMENTIDS/, branchLevelExperiments || '')
    .replace(/DISABLE3PFALLBACK/g, (!force3p).toString());
  res.end(replaceUrls(getServeMode(), content));
});

/**
 * @param {express.Request} req
 * @param {string=} extraExperiment
 * @return {!URL}
 */
function getInaboxUrl(req, extraExperiment) {
  const urlStr = req.protocol + '://' + req.get('host') + req.url;
  const url = new URL(urlStr);
  // make it a cross domain URL
  if (url.hostname === 'localhost') {
    url.hostname = 'ads.localhost';
  }
  // this tells local server to convert the AMP document to AMP4ADS spec
  url.searchParams.set('inabox', '1');
  if (req.baseUrl == '/inabox-mraid') {
    url.searchParams.set('mraid', '1');
  }
  // turn on more logs if requested
  const logLevel = url.searchParams.get('log');
  if (logLevel) {
    url.searchParams.delete('log');
    url.hash = '#log=' + logLevel;
  }

  // turn on extra experiment
  if (extraExperiment) {
    const exp = url.searchParams.get('exp');
    if (exp) {
      extraExperiment += ',' + exp;
    }
    url.searchParams.set('exp', extraExperiment);
  }
  return url;
}

/**
 * Fetch a page from the target URL and fill its content into the template.
 * If the URL does not return text, returns null.
 * @param {string} template
 * @param {string} url
 * @param {object} query
 * @return {!Promise<?string>}
 */
async function requestFromUrl(template, url, query) {
  const response = await fetch(url);
  if (
    !response.headers.has('Content-Type') ||
    response.headers.get('Content-Type')?.startsWith('text/html')
  ) {
    return fillTemplate(template, url, query, await response.text());
  }
  return null;
}

/**
 * Fill out a template with some common variables.
 * @param {string} template
 * @param {string} url
 * @param {object} query
 * @param {string=} body
 * @return {string}
 */
function fillTemplate(template, url, query, body) {
  let newBody;
  let length;
  if (body) {
    newBody = body
      .replace(/&/g, '&amp;')
      .replace(/'/g, '&apos;')
      .replace(/"/g, '&quot;');
    length = body.length;
  } else {
    length = 0;
  }
  return (
    template
      .replace(/BODY/g, newBody ?? '')
      .replace(/LENGTH/g, length.toString())
      .replace(/AD_URL/g, url)
      .replace(/OFFSET/g, query.offset || '0px')
      .replace(/AD_WIDTH/g, query.width || '300')
      .replace(/AD_HEIGHT/g, query.height || '250')
      .replace(
        'INABOX_ADS_TAG_INTEGRATION',
        '<script src="/examples/amphtml-ads/ads-tag-integration.js"></script>'
      )
      // Clear out variables that are not already replaced beforehand.
      .replace(/NAME/g, 'inabox')
      .replace(/SOURCE/g, '')
      .replace('SRCDOC_ATTRIBUTE', '')
  );
}

module.exports = app;
