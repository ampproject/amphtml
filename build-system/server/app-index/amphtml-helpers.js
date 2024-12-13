/* eslint-disable local/html-template */

const assert = require('assert');
const boilerPlate = require('./boilerplate');

const {html, joinFragments} = require('./html');
const {matchIterator} = require('./regex');

const componentTagNameRegex = /\<(amp-[^\s\>]+)/g;
const templateTagTypeRegex = /\<template[^\>]+type="?([^\s"\>]+)/g;

const containsTagRegex = (tagName) => new RegExp(`\\<${tagName}[\\s\\>]`);

const containsByRegex = (str, re) => str.search(re) > -1;

// TODO(alanorozco): Expand
const formTypes = ['input', 'select', 'form'];

const ExtensionScript = ({isTemplate, name, version}) => html`
  <script
    async
    ${isTemplate ? 'custom-template' : 'custom-element'}="${name}"
    src="https://cdn.ampproject.org/v0/${name}-${version || '0.1'}.js"
  ></script>
`;

const AmpState = (id, state) => html`
  <amp-state id="${id}">
    <script type="application/json">
      ${JSON.stringify(state)}
    </script>
  </amp-state>
`;

const ampStateKey = (...keys) => keys.join('.');

/**
 *
 * @param {{
 *  body: string,
 *  canonical: string,
 *  css?: string,
 *  head?: string,
 * }} param0
 * @return {string}
 */
const AmpDoc = ({body, canonical, css, head}) => {
  assert(canonical);
  return html`
    <!doctype html>
    <html ⚡ lang="en">
      <head>
        <title>AMP Dev Server</title>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,minimum-scale=1,initial-scale=1"
        />
        ${css
          ? html`
              <style amp-custom>
                ${css}
              </style>
            `
          : ''}
        <link rel="canonical" href="${canonical}" />
        ${boilerPlate}
        <script async src="https://cdn.ampproject.org/v0.js"></script>
        ${head || ''}
      </head>
      <body>
        ${body}
      </body>
    </html>
  `;
};

const componentExtensionNameMapping = {
  'amp-state': 'amp-bind',
};

const componentExtensionName = (tagName) =>
  componentExtensionNameMapping[tagName] || tagName;

/**
 *
 * @param {string} docStr
 * @param {{
 *  'amp-mustache': {version: string}
 * }=} extensionConf
 * @return {string}
 */
const addRequiredExtensionsToHead = (
  docStr,
  extensionConf = {
    'amp-mustache': {version: '0.2'},
  }
) => {
  const extensions = {};

  const addExtension = (name, defaultConf = {}) =>
    (extensions[name] = {name, ...defaultConf, ...(extensionConf[name] || {})});

  const addTemplate = (name, defaultConf = {}) =>
    addExtension(name, {isTemplate: true, ...defaultConf});

  Array.from(matchIterator(componentTagNameRegex, docStr))
    .map(([, tagName]) => componentExtensionName(tagName))
    .forEach(addExtension);

  Array.from(matchIterator(templateTagTypeRegex, docStr))
    .map(([, type]) => type)
    .forEach(addTemplate);

  // TODO(alanorozco): Too greedy. Parse "on" attributes instead.
  if (docStr.indexOf('AMP.setState') >= 0) {
    addExtension('amp-bind');
  }

  if (formTypes.some((t) => containsByRegex(docStr, containsTagRegex(t)))) {
    addExtension('amp-form');
  }

  return docStr.replace(
    /\<\/head\>/i,
    (headClosingTag) =>
      joinFragments(Object.values(extensions), ExtensionScript) + headClosingTag
  );
};

module.exports = {
  AmpDoc,
  AmpState,
  addRequiredExtensionsToHead,
  ampStateKey,
};
