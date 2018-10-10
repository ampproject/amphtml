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
/* eslint-disable */
'use strict';

const BBPromise = require('bluebird');
const fs = BBPromise.promisifyAll(require('fs'));
const {JSDOM} = require('jsdom');

const sourceFile = 'test/manual/amp-video.amp.html';

// These are taken from the respective example files.
const requiredAttrs = {
  'amp-brid-player': {
    'data-partner': '264',
    'data-player': '4144',
    'data-video': '13663',
  },
  'amp-dailymotion': {'data-videoid': 'x2m8jpp'},
  'amp-youtube': {'data-videoid': 'mGENRKrdoGY'},
};

const optionalAttrs = [
  'autoplay',
  'controls',
  'rotate-to-fullscreen',
];

const availableExtensions = [
  'amp-video',
  'amp-youtube',
  'amp-dailymotion',

  // TODO(alanorozco): Enable the following once they have their `requiredAttrs`
  // 'amp-viqeo-player',
  // 'amp-mowplayer',
  // 'amp-mowplayer',
  // 'amp-brid-player',
  // 'amp-brightcove',
  // 'amp-kaltura-player',
  // 'amp-nexxtv-player',
  // 'amp-o2-player',
  // 'amp-ooyala-player',
];


const clientScript = `
var urlParams = new URLSearchParams(window.location.search);

function main() {
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
      opt_extension ?
        opt_extension :
        getSubstitutable(doc).tagName.toLowerCase();

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
  if (!availableExtensions.includes(toExtension)) {
    throw 'Invalid extension';
  }

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


function runVideoTestBench(req, res) {
  fs.readFileAsync(sourceFile).then(contents => {
    const dom = new JSDOM(contents);
    const {window} = dom;
    const doc = window.document;

    const {extension} = req.query;

    setOptionalAttrs(req, doc);

    if (extension) {
      replaceExtension(doc, extension);
    }

    const dropdownContainer = doc.querySelector('.dropdown-container');
    dropdownContainer.appendChild(renderExtensionDropdown(doc), extension);

    const optionalAttrsContainer =
        doc.querySelector('.optional-attrs-container');
    optionalAttrsContainer.appendChild(renderOptionalAttrsCheckboxes(doc));

    appendClientScript(doc);

    return res.end(dom.serialize());
  }).error(() => {
    res.status(404);
    res.end('Not found: ' + sourceFile);
  });
}


module.exports = runVideoTestBench;
