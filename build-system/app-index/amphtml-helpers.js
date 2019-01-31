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

const html = require('./html');
const {joinFragments} = require('./html-helpers');


const componentTagNameRegex = /\<(amp-[^\s\>]+)/g;
const templateTagTypeRegex = /\<template[^\>]+type="?([^\s"\>]+)/g;

// TODO(alanorozco): Expand
const formTypes = ['input', 'select', 'form'];


const forEachMatch = (regex, subject, callback) => {
  let match = regex.exec(subject);
  while (match != null) {
    callback(match);
    match = regex.exec(subject);
  }
};


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
    if (docStr.search(new RegExp(`\<${tagName}(\s|\>)`))) {
      addExtension('amp-form');
      break;
    }
  }

  return docStr.replace(/(\<\/head\>)/i, (_, headClosingTag) =>
    joinFragments(Object.values(extensions), ExtensionScript) + headClosingTag);
};


module.exports = {
  AmpState,
  addRequiredExtensionsToHead,
  containsExpr,
  ternaryExpr,
};
