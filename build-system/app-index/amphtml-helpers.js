/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/* eslint-disable amphtml-internal/html-template */

const assert = require('assert');
const boilerPlate = require('./boilerplate');

const {forEachMatch} = require('./regex');
const {html, joinFragments} = require('./html');


const componentTagNameRegex = /\<(amp-[^\s\>]+)/g;
const templateTagTypeRegex = /\<template[^\>]+type="?([^\s"\>]+)/g;

// TODO(alanorozco): Expand
const formTypes = ['input', 'select', 'form'];


const ExtensionScript = ({name, version, isTemplate}) =>
  html`<script
    async
    ${isTemplate ? 'custom-template' : 'custom-element'}="${name}"
    src="https://cdn.ampproject.org/v0/${name}-${version || '0.1'}.js">
  </script>`;


const AmpState = (id, state) => html`
  <amp-state id="${id}">
    <script type="application/json">
      ${JSON.stringify(state)}
    </script>
  </amp-state>`;


const ternaryExpr = (condition, onTrue, onFalse) =>
  `${condition} ? ${onTrue} : ${onFalse}`;


const containsExpr = (haystack, needle, onTrue, onFalse) =>
  ternaryExpr(`${haystack}.indexOf(${needle}) > -1`, onTrue, onFalse);


const ampStateKey = (...keys) => keys.join('.');


const AmpDoc = ({body, css, head, canonical}) => {
  assert(canonical);
  return html`
    <!doctype html>
    <html ⚡>
    <head>
      <title>AMP Dev Server</title>
      <meta charset="utf-8">
      <meta name="viewport"
          content="width=device-width,minimum-scale=1,initial-scale=1">
      ${css ? html`<style amp-custom>${css}</style>` : ''}
      ${canonical ? html`<link rel="canonical" href="${canonical}">` : ''}
      ${boilerPlate}
      <script async src="https://cdn.ampproject.org/v0.js"></script>
      ${head || ''}
    </head>
    <body>
      ${body}
    </body>
    </html>`;
};


const addRequiredExtensionsToHead = (docStr, extensionConf = {
  'amp-mustache': {version: '0.2'},
}) => {
  const extensions = {};

  const addExtension = (name, defaultConf = {}) =>
    extensions[name] = {name, ...defaultConf, ...(extensionConf[name] || {})};

  forEachMatch(componentTagNameRegex, docStr, ([unusedFullMatch, tagName]) => {
    if (tagName == 'amp-state') {
      addExtension('amp-bind');
      return;
    }
    addExtension(tagName);
  });

  forEachMatch(templateTagTypeRegex, docStr, ([unusedFullMatch, type]) => {
    addExtension(type, {isTemplate: true});
  });

  // TODO(alanorozco): Too greedy. Parse "on" attributes instead.
  if (docStr.indexOf('AMP.setState') >= 0) {
    addExtension('amp-bind');
  }

  for (let i = 0; i < formTypes.length; i++) {
    const tagName = formTypes[i];
    if (docStr.search(new RegExp(`\\<${tagName}(\\s|\\>)`, 'g')) > -1) {
      addExtension('amp-form');
      break;
    }
  }

  return docStr.replace(/(\<\/head\>)/i, (_, headClosingTag) =>
    joinFragments(Object.values(extensions), ExtensionScript) + headClosingTag);
};


module.exports = {
  AmpDoc,
  AmpState,
  addRequiredExtensionsToHead,
  ampStateKey,
  containsExpr,
  ternaryExpr,
};
