/* eslint-disable */
'use strict';

const fs = require('fs');
const {JSDOM} = require('jsdom');
const {replaceUrls} = require('./app-utils');
const {getServeMode} = require('./app-utils');


const sourceFile = 'test/manual/amp-video.amp.html';

// These are taken from the respective example or validation files.
/**
 * Please keep these alphabetically sorted.
 */
const requiredAttrs = {
  'amp-3q-player': {
    'data-id': 'c8dbe7f4-7f7f-11e6-a407-0cc47a188158',
  },
  'amp-brid-player': {
    'data-partner': '264',
    'data-player': '4144',
    'data-video': '13663',
  },
  'amp-brightcove': {
    'data-account': '1290862519001',
    'data-video-id': 'ref:amp-docs-sample',
    'data-player-id': 'SyIOV8yWM',
  },
  'amp-dailymotion': {'data-videoid': 'x2m8jpp'},
  'amp-gfycat': {'data-gfyid': 'TautWhoppingCougar'},
  'amp-ima-video': {
    'data-tag': 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=&debug_experiment_id=1269069638',
    'data-poster': '/examples/img/ima-poster.png',
  },
  'amp-mowplayer': {'data-mediaid': 'meeqmaqg5js'},

  // These one seems obsolete, 404'ing with current params.
  // 'amp-nexxtv-player': {
  //   'data-mediaid': '71QQG852413DU7J',
  //   'data-client': '761',
  // },

  'amp-ooyala-player': {
    'data-embedcode': 'xkeHRiMjE6ls2aXoPoiqmPO6IU8HtXsg',
    'data-pcode': '5zb2wxOlZcNCe_HVT3a6cawW298X',
    'data-playerid': '26e2e3c1049c4e70ae08a242638b5c40',
    'data-playerversion': 'v4',
  },
  'amp-video-iframe': {
    'src': '/examples/amp-video-iframe/frame.html',
    'poster': 'https://placekitten.com/g/1600/900',
  },
  'amp-vimeo': {'data-videoid': '27246366'},
  'amp-viqeo-player': {
    'data-profileid': '184',
    'data-videoid': 'b51b70cdbb06248f4438',
  },
  'amp-wistia-player': {'data-media-hashed-id': 'u8p9wq6mq8'},
  'amp-youtube': {'data-videoid': 'mGENRKrdoGY'},
};

/**
 * Please keep these alphabetically sorted.
 */
const requiredInnerHtml = {
  'amp-ima-video': `<source
      src="https://s0.2mdn.net/4253510/google_ddm_animation_480P.mp4"
      type="video/mp4">`,
};

/**
 * Please keep these alphabetically sorted.
 */
const optionalAttrs = [
  'autoplay',
  'controls',
  'rotate-to-fullscreen',
];

/**
 * Please keep these alpahbetically sorted.
 */
const availableExtensions = [
  'amp-3q-player',
  'amp-brid-player',
  'amp-brightcove',
  'amp-dailymotion',
  'amp-gfycat',
  'amp-ima-video',
  'amp-mowplayer',
  'amp-ooyala-player',
  'amp-video',
  'amp-video-iframe',
  'amp-viqeo-player',
  'amp-wistia-player',
  'amp-youtube',

  // TODO(alanorozco): Reenable with valid params, if possible.
  // 'amp-nexxtv-player',
];


const clientScript = `
var urlParams = new URLSearchParams(window.location.search);

function logAnalyticsEvent(url) {
  var urlParams = new URLSearchParams(url.split('?', 2)[1]);
  appendAnalyticsRow(urlParams);
}

function formatNumber(str, sufix) {
  var n = parseFloat(str);
  if (isNaN(n)) {
    return 'N/A';
  }
  var formatted = n.toFixed(2);
  if (formatted % 1 == 0) {
    formatted = n;
  }
  return formatted + (sufix || '');
}

function appendAnalyticsRow(urlParams) {
  var container = document.querySelector('.analytics-events-container');
  var table = document.getElementById('analytics-events');
  table.appendChild(createTableRow([
    '[' + getHoursMinutesSeconds() + ']',
    urlParams.get('autoplay'),
    urlParams.get('type'),
    formatNumber(urlParams.get('time'), 's'),
    formatNumber(urlParams.get('normalizedPercentage'), '%'),
    formatNumber(urlParams.get('total'), 's'),
    formatNumber(urlParams.get('duration'), 's'),
  ]));
  container./*OK*/scrollTop = container./*OK*/scrollHeight;
}

function getHoursMinutesSeconds() {
  var date = new Date();
  return padTo2(date.getHours()) + ':' +
      padTo2(date.getMinutes()) + ':' +
      padTo2(date.getSeconds());
}

function padTo2(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number.toString();
}

function createTableRow(cellsContent) {
  var row = document.createElement('tr');
  for (var i = 0; i < cellsContent.length; i++) {
    row.appendChild(createTableCell(cellsContent[i]));
  }
  return row;
}

function createTableCell(contents) {
  var cell = document.createElement('td');
  cell./*OK*/innerText = contents;
  return cell;
}

function monkeyPatchXhr(xhrPrototype) {
  var defaultOpen = xhrPrototype.open;
  xhrPrototype.open = function(unusedMethod, url) {
    if ((new RegExp('^https://foo\.com/')).test(url)) {
      logAnalyticsEvent(url);
    }
    return defaultOpen.apply(this, arguments);
  };
}

function main() {
  monkeyPatchXhr(XMLHttpRequest.prototype);

  var dropdown = document.querySelector('select');
  dropdown.onchange = function() {
    replaceExtension(urlParams, dropdown.value);
    reloadFrom(urlParams);
  };

  var checkboxes = document.querySelectorAll('.optional-attrs-container input');
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener('change', function(event) {
      urlParams.delete(event.target.value);
      urlParams.set(event.target.value, event.target.checked ? '1' : '0');
      reloadFrom(urlParams);
    });
  }
}

function reloadFrom(params) {
  var baseUrl =
      [location.protocol, '//', location.host, location.pathname].join('');
  window.location = baseUrl + '?' + params;
}

function replaceExtension(params, withExtension) {
  params.delete('extension');
  params.set('extension', withExtension);
}

main();
`;


function getSubstitutable(doc) {
  return doc.querySelector('[data-substitutable]');
}


function renderExtensionDropdown(doc, opt_extension) {
  const select = doc.createElement('select');

  const usedExtension =
      opt_extension || getSubstitutable(doc).tagName.toLowerCase();

  availableExtensions.forEach(extension => {
    const option = doc.createElement('option');
    option.setAttribute('value', extension);
    option./*OK*/innerHTML = extension;

    if (extension == usedExtension) {
      option.setAttribute('selected', '');
    }

    select.appendChild(option);
  });

  return select;
}


function renderOptionalAttrsCheckboxes(doc) {
  const fragment = doc.createDocumentFragment();
  const substitutable = getSubstitutable(doc);

  optionalAttrs.forEach(attr => {
    const id = `optional-attr-${attr}`;
    const label = doc.createElement('label');
    const input = doc.createElement('input');

    label.setAttribute('for', id);

    input.id = id;
    input.setAttribute('type', 'checkbox');
    input.value = attr;

    if (substitutable.hasAttribute(attr)) {
      input.setAttribute('checked', '');
    }

    label.appendChild(input);
    label./*OK*/innerHTML += ` ${attr}`;

    fragment.appendChild(label);
  });

  return fragment;
}


function replaceTagName(node, withTagName) {
  const {tagName} = node;

  node./*OK*/outerHTML =
      node./*OK*/outerHTML
          .replace(new RegExp(`^\<${tagName}`, 'i'), `<${withTagName}`)
          .replace(new RegExp(`\</${tagName}\>$`, 'i'), `</${withTagName}>`);
}


function replaceCustomElementScript(
  doc, fromExtension, toExtension, version = '0.1') {

  const selector = `script[custom-element=${fromExtension}]`;
  const script = doc.querySelector(selector);

  script.setAttribute('custom-element', toExtension);

  // TODO(alanorozco): Use config.urls.cdn value. This file is not available
  // under the Node.JS context.
  script.setAttribute('src',
      `https://cdn.ampproject.org/v0/${toExtension}-${version}.js`);
}


function removeAttrs(node) {
  node.getAttribute('data-removable-attrs').split(',').forEach(attr => {
    node.removeAttribute(attr);
  });
}


function replaceExtension(doc, toExtension) {
  const substitutable = getSubstitutable(doc);

  const substitutableTagNameLowerCase = substitutable.tagName.toLowerCase();
  const toExtensionLowerCase = toExtension.toLowerCase();

  if (substitutableTagNameLowerCase == toExtensionLowerCase) {
    return;
  }

  replaceCustomElementScript(doc, substitutableTagNameLowerCase, toExtension);
  removeAttrs(substitutable);

  if (requiredAttrs[toExtensionLowerCase]) {
    const attrs = requiredAttrs[toExtensionLowerCase];
    Object.keys(attrs).forEach(attr => {
      substitutable.setAttribute(attr, attrs[attr]);
    });
  }

  substitutable./*OK*/innerHTML = requiredInnerHtml[toExtensionLowerCase] || '';

  // `replaceTagName` has to run at the end since it manipulates `outerHTML`.
  replaceTagName(substitutable, toExtension);
}


function setOptionalAttrs(req, doc) {
  const substitutable = getSubstitutable(doc);

  optionalAttrs.forEach(attr => {
    if (!req.query[attr]) {
      return;
    }
    if (req.query[attr] == '1') {
      substitutable.setAttribute(attr, '');
    } else {
      substitutable.removeAttribute(attr);
    }
  });
}


function appendClientScript(doc) {
  const script = doc.createElement('script');
  script./*OK*/innerHTML = clientScript;
  doc.body.appendChild(script);
}


function isValidExtension(extension) {
  return availableExtensions.includes(extension);
}


function runVideoTestBench(req, res, next) {
  fs.promises.readFile(sourceFile).then(contents => {
    const dom = new JSDOM(contents);
    const {window} = dom;
    const doc = window.document;

    const {extension} = req.query;

    setOptionalAttrs(req, doc);

    if (extension) {
      if (!isValidExtension(extension)) {
        res.status(403);
        res.end('Invalid extension parameter.');
        return;
      }
      replaceExtension(doc, extension);
    }

    const dropdownContainer = doc.querySelector('.dropdown-container');
    dropdownContainer.appendChild(renderExtensionDropdown(doc), extension);

    const optionalAttrsContainer =
        doc.querySelector('.optional-attrs-container');
    optionalAttrsContainer.appendChild(renderOptionalAttrsCheckboxes(doc));

    appendClientScript(doc);

    return res.end(replaceUrls(getServeMode(), dom.serialize()));
  }).catch(() => {
    next();
  });
}


module.exports = runVideoTestBench;
