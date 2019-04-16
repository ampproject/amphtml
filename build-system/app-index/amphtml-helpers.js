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

const {html, joinFragments} = require('./html');
const {matchIterator} = require('./regex');


const componentTagNameRegex = /\<(amp-[^\s\>]+)/g;
const templateTagTypeRegex = /\<template[^\>]+type="?([^\s"\>]+)/g;

const containsTagRegex = tagName => new RegExp(`\\<${tagName}[\\s\\>]`);

const containsByRegex = (str, re) => str.search(re) > -1;

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
      <link rel="canonical" href="${canonical}">
      ${boilerPlate}
      <script async src="https://cdn.ampproject.org/v0.js"></script>
      ${head || ''}
    </head>
    <body>
      ${body}
    </body>
    </html>`;
};


const componentExtensionNameMapping = {
  'amp-state': 'amp-bind',
};

const componentExtensionName = tagName =>
  componentExtensionNameMapping[tagName] || tagName;


const addRequiredExtensionsToHead = (docStr, extensionConf = {
  'amp-mustache': {version: '0.2'},
}) => {
  const extensions = {};

  const addExtension = (name, defaultConf = {}) =>
    extensions[name] = {name, ...defaultConf, ...(extensionConf[name] || {})};

  const addTemplate = (name, defaultConf = {}) =>
    addExtension(name, {isTemplate: true, ...defaultConf});

  Array.from(matchIterator(componentTagNameRegex, docStr))
      .map(([unusedFullMatch, tagName]) => componentExtensionName(tagName))
      .forEach(addExtension);

  Array.from(matchIterator(templateTagTypeRegex, docStr))
      .map(([unusedFullMatch, type]) => type)
      .forEach(addTemplate);

  // TODO(alanorozco): Too greedy. Parse "on" attributes instead.
  if (docStr.indexOf('AMP.setState') >= 0) {
    addExtension('amp-bind');
  }

  if (formTypes.some(t => containsByRegex(docStr, containsTagRegex(t)))) {
    addExtension('amp-form');
  }

  return docStr.replace(/\<\/head\>/i, headClosingTag =>
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
