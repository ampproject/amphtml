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
const documentModes = require('./document-modes');
const html = require('./html');
const ProxyForm = require('./proxy-form');
const {KeyValueOptions} = require('./form');
const {SettingsModal, SettingsOpenButton} = require('./settings');


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
    'name': 'Find File',
    'href': 'https://github.com/ampproject/amphtml/find/master',
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
  {name: 'amp-mustache', version: '0.2'},
  {name: 'amp-list'},
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

const FileListSearch = ({basepath}) =>
  html`<input type="text"
    class="file-list-search"
    placeholder="Fuzzy Search"
    pattern="[a-zA-Z0-9-]+"
    on="input-debounced: AMP.setState({
      fileListState: {
        src: '/dashboard/api/listing?path=${basepath}&search=' + event.value
      }
    })">`;

const HeaderBackToMainLink = () => html`<a href="/">← Back to main</a>`;

const ExamplesDocumentModeSelect = () => html`
  <label for="examples-mode-select">
    Document mode:
    <select id="examples-mode-select"
        on="change:AMP.setState({
          documentMode: {
            selectModePrefix: event.value
          }
        })">
      ${KeyValueOptions(documentModes)}
    </select>
  </label>`;


const ExamplesSelectModeOptional = ({basepath, selectModePrefix}) =>
  !/^\/examples/.test(basepath) ? '' : ExamplesDocumentModeSelect({
    selectModePrefix,
  });

const FileList = ({basepath}) =>
  html`<amp-state id="fileListState">
    <script type="application/json">
      {"src": "/dashboard/api/listing?path=${basepath}"}
    </script>
  </amp-state>
  <amp-list [src]="fileListState.src"
    src="/dashboard/api/listing?path=${basepath}"
    items="."
    layout="fixed-height"
    width="auto"
    height="568px"
    class="file-list custom-loader">

    <div fallback>Failed to load data.</div>

    <template type="amp-mustache">
      <div class="file-link-container">
        <a class="file-link"
          [href]="(documentMode.selectModePrefix || '') +
          '${basepath.substring(1)}{{.}}'">
          {{.}}
        </a>
      </div>
    </template>

    <div overflow
      role="button"
      aria-label="Show more"
      class="list-overflow">
      Show more
    </div>

    <div placeholder>Loading...</div>
  </amp-list>`;

const ProxyFormOptional = ({isMainPage}) => {
  return isMainPage ? ProxyForm() : '';
};

const selectModePrefix = '/';

const renderTemplate = ({
  basepath,
  css,
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
        <div class="file-list-heading">
          <h3 class="code" id="basepath">
            ${basepath}
          </h3>
          ${FileListSearch({basepath})}
          <div class="file-list-right-section">
            <amp-state id="documentMode">
              <script type="application/json">
              ${JSON.stringify({selectModePrefix})}
              </script>
            </amp-state>
            ${ExamplesSelectModeOptional({basepath, selectModePrefix})}
            <a href="/~" class="underlined">List root directory</a>
          </div>
        </div>
        ${FileList({basepath})}
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
