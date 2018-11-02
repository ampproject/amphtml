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

/* eslint-disable amphtml-internal/html-template */
/* eslint-disable indent */

'use strict';

const boilerPlate = require('./boilerplate');
const html = require('./html');
const ProxyForm = require('./proxy-form');
const {SettingsModal, SettingsOpenButton} = require('./settings');


const examplesDocumentModes = {
  'standard': '/',
  'a4a': '/a4a/',
  'a4a-3p': '/a4a-3p/',
  'inabox': '/inabox/1/',
};


const headerLinks = [
  {
    'name': 'Developing',
    'href': 'https://' +
      'github.com/ampproject/amphtml/blob/master/contributing/DEVELOPING.md',
  },
  {
    'divider': true,
    'name': 'Contributing',
    'href': 'https://github.com/ampproject/amphtml/blob/master/CONTRIBUTING.md',
  },
  {
    'name': 'Github',
    'href': 'https://github.com/ampproject/amphtml/',
  },
  {
    'name': 'Travis',
    'href': 'https://travis-ci.org/ampproject/amphtml',
  },
  {
    'name': 'Percy',
    'href': 'https://percy.io/ampproject/amphtml/',
  },
];


const requiredExtensions = [
  {name: 'amp-bind'},
  {name: 'amp-form'},
  {name: 'amp-lightbox'},
  {name: 'amp-selector'},
];


const ExtensionScript = ({name, version}) =>
  html`<script
    async
    custom-element="${name}"
    src="https://cdn.ampproject.org/v0/${name}-${version || '0.1'}.js">
  </script>`;


const HeaderLink = ({name, href, divider}) => html`
  <li class="${divider ? 'divider' : ''}">
    <a target="_blank" rel="noopener noreferrer" href="${href}">
      ${name}
    </a>
  </li>`;


const Header = ({isMainPage, links}) => html`
  <header>
    <h1 class="amp-logo">AMP</h1>
    <div class="right-of-logo">
      ${!isMainPage ? HeaderBackToMainLink() : ''}
    </div>
    <ul class="right-nav">
      ${links.map(({name, href, divider}, i) =>
          HeaderLink({
            divider: divider || i == links.length - 1,
            name,
            href,
          })).join('')}
      <li>${SettingsOpenButton()}</li>
    </ul>
  </header>`;


const HeaderBackToMainLink = () => html`<a href="/">← Back to main</a>`;


const ExamplesDocumentModeSelectOption = ({value, name}) => html`
  <option value=${value}>${name}</option>`;


const ExamplesDocumentModeSelect = ({selectModePrefix}) => html`
  <amp-state id="documentMode">
    <script type="application/json">
    ${JSON.stringify({selectModePrefix})}
    </script>
  </amp-state>
  <label for="examples-mode-select">
    Document mode:
    <select id="examples-mode-select"
        on="change:AMP.setState({
          documentMode: {
            selectModePrefix: event.value
          }
        })">
      ${Object.keys(examplesDocumentModes).map(key =>
        ExamplesDocumentModeSelectOption({
          value: examplesDocumentModes[key],
          name: key,
        })).join('')}
    </select>
  </label>`;


const SelectModeOptional = ({basepath, selectModePrefix}) =>
  !/^\/examples/.test(basepath) ? '' : ExamplesDocumentModeSelect({
    selectModePrefix,
  });


const FileListItem = ({name, href, selectModePrefix}) => {
  if (!/^\/examples/.test(href) || !/\.html$/.test(href)) {
    return html`<li>
      <a class="file-link" href="${href}">${name}</a>
    </li>`;
  }

  const hrefSufix = href.replace(/^\//, '');

  return html`<li>
    <a class="file-link"
      [href]="documentMode.selectModePrefix + '${hrefSufix}'"
      href="${selectModePrefix + hrefSufix}">
      ${name}
    </a>
  </li>`;
};


const FileList = ({fileSet, selectModePrefix}) => html`
  <ul class="file-list">
    ${fileSet.map(({name, href}) =>
      FileListItem({name, href, selectModePrefix})).join('')}
  </ul>`;


const getFileSet = ({basepath, fileSet, selectModePrefix}) => {
  // Set at top-level so RegEx is compiled once per call.
  const documentLinkRegex = /\.html$/;
  const examplesLinkRegex = /^\/examples\//;

  return fileSet.map(name => {
    const isExamplesDocument = examplesLinkRegex.test(basepath) &&
      documentLinkRegex.test(name);

    const prefix = isExamplesDocument ?
      basepath.replace(/^\//, selectModePrefix) :
      basepath;

    return {name, href: prefix + name};
  });
};


const ProxyFormOptional = ({isMainPage}) => {
  return isMainPage ? ProxyForm() : '';
};


const selectModePrefix = '/';

const renderTemplate = ({
  basepath,
  css,
  fileSet,
  isMainPage,
  serveMode}) => html`

  <!doctype html>
  <html ⚡>
  <head>
    <title>AMP Dev Server</title>
    <meta charset="utf-8">
    <style amp-custom>
    ${css}
    </style>
    <link rel="canonical" href="${basepath}">
    <meta name="viewport"
      content="width=device-width,minimum-scale=1,initial-scale=1">
    ${boilerPlate}
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    ${requiredExtensions.map(({name, version}) =>
        ExtensionScript({name, version})).join('')}
  </head>
  <body>
    <div class="wrap">
      ${Header({isMainPage, links: headerLinks})}
      ${ProxyFormOptional({isMainPage})}
    </div>
    <div class="file-list-container">
      <div class="wrap">
        <h3 class="code" id="basepath">
          ${basepath}
          <a href="https://github.com/ampproject/amphtml/find/master"
            target="_blank"
            rel="noopener noreferrer"
            class="find-icon icon">
            Find file
          </a>
        </h3>
        <div class="push-right-after-heading">
          ${SelectModeOptional({basepath, selectModePrefix})}
          <a href="/~" class="underlined">List root directory</a>
        </div>
        ${FileList({
          fileSet: getFileSet({
            basepath,
            selectModePrefix,
            fileSet,
          }),
          selectModePrefix,
        })}
      </div>
    </div>
    <div class="center">
      Built with 💙  by
      <a href="https://ampproject.org" class="underlined">the AMP Project</a>.
    </div>
    ${SettingsModal({serveMode})}
  </body>
  </html>`;


module.exports = {renderTemplate};
