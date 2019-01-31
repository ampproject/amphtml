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
const {
  AmpState,
  addRequiredExtensionsToHead,
  containsExpr,
} = require('./amphtml-helpers');
const {joinFragments} = require('./html-helpers');
const {KeyValueOptions} = require('./form');
const {SettingsModal, SettingsOpenButton} = require('./settings');

const fileListEndpointPrefix = '/dashboard/api/listing';

const examplesPathRegex = /^\/examples\//;
const htmlDocRegex = /\.html$/;

const leadingSlashRegex = /^\//;

const replaceLeadingSlash = (subject, replacement) =>
  subject.replace(leadingSlashRegex, replacement);

const fileListEndpoint = query =>
  fileListEndpointPrefix + '?' +
  Object.keys(query).map(k => `${k}=${query[k]}`).join('&');

const ampStateKey = (...keys) => keys.join('.');

const selectModeStateId = 'documentMode';
const selectModeStateKey = 'selectModePrefix';
const selectModeKey = ampStateKey(selectModeStateId, selectModeStateKey);

const fileListEndpointStateId = 'fileListEndpoint';
const fileListEndpointStateKey = 'src';
const fileListEndpointKey = ampStateKey(
    fileListEndpointStateId, fileListEndpointStateKey);

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
      ${joinFragments(links, ({name, href, divider}, i) =>
          HeaderLink({
            divider: divider || i == links.length - 1,
            name,
            href,
          }))}
      <li>${SettingsOpenButton()}</li>
    </ul>
  </header>`;

const FileListSearchInput = ({basepath}) => html`
  <input type="text"
    class="file-list-search"
    placeholder="Fuzzy Search"
    pattern="[a-zA-Z0-9-]+"
    on="input-debounced: AMP.setState({
      ${fileListEndpointStateId}: {
        ${fileListEndpointStateKey}: '${fileListEndpoint({
          path: basepath,
          search: '',
        })}' + event.value
      }
    })">`;

const HeaderBackToMainLink = () => html`<a href="/">← Back to main</a>`;

const ExamplesDocumentModeSelect = () => html`
  <label for="examples-mode-select">
    Document mode:
    <select id="examples-mode-select"
        on="change:AMP.setState({
          ${selectModeStateId}: {
            ${selectModeStateKey}: event.value
          }
        })">
      ${KeyValueOptions(documentModes)}
    </select>
  </label>`;


const linksToExample = (shouldContainBasepath, opt_name) =>
  examplesPathRegex.test(shouldContainBasepath) &&
    htmlDocRegex.test(opt_name || shouldContainBasepath);


const ExamplesSelectModeOptional = ({basepath, selectModePrefix}) =>
  !examplesPathRegex.test(basepath + '/') ? '' : ExamplesDocumentModeSelect({
    selectModePrefix,
  });


const FileListItem = ({name, href, boundHref}) =>
  html`<div class="file-link-container" role=listitem>
    <a class="file-link"
      ${boundHref ? `[href]="${boundHref}" ` : ''}
      ${href ? `href="${href}" ` : ''}>
      ${name}
    </a>
  </div>`;


const PlaceholderFileListItem = ({name, href, selectModePrefix}) =>
  linksToExample(href) ?
    FileListItem({
      name,
      href: selectModePrefix + replaceLeadingSlash(href, ''),
      boundHref: `(${selectModeKey} || '${selectModePrefix}') + '${
        replaceLeadingSlash(href, '')}'`,
    }) :
    FileListItem({href, name});


const maybePrefixExampleDocHref = (basepath, name, selectModePrefix) =>
  (linksToExample(basepath, name) ?
    replaceLeadingSlash(basepath, selectModePrefix) :
    basepath) +
  name;

const FileList = ({basepath, fileSet, selectModePrefix}) => joinFragments([
  AmpState(fileListEndpointStateId, {
    [fileListEndpointStateKey]: fileListEndpoint({path: basepath}),
  }),

  html`<amp-list [src]="${fileListEndpointKey}"
    src="${fileListEndpoint({path: basepath})}"
    items="."
    layout="fixed-height"
    width="auto"
    height="568px"
    class="file-list custom-loader">

    <div fallback>Failed to load data.</div>

    <div placeholder>
      <div role=list>
        ${joinFragments(fileSet, ({name, href}) =>
          PlaceholderFileListItem({name, href, selectModePrefix}))}
      </div>
    </div>

    <template type="amp-mustache">
      ${FileListItem({
        href: `${basepath}{{.}}`,
        boundHref: containsExpr(
            '\'{{.}}\'',
            '\'.html\'',
            `(${selectModeKey} || '${selectModePrefix}') +` +
                `'${replaceLeadingSlash(basepath, '')}{{.}}'`,
            `'${basepath}{{.}}'`),
        name: '{{.}}',
      })}
    </template>

    <div overflow
      role="button"
      aria-label="Show more"
      class="list-overflow">
      Show more
    </div>
  </amp-list>`,
]);

const ProxyFormOptional = ({isMainPage}) => isMainPage ? ProxyForm() : '';

const selectModePrefix = '/';

const renderTemplate = ({
  basepath,
  css,
  isMainPage,
  fileSet,
  serveMode}) => addRequiredExtensionsToHead(html`

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
          ${FileListSearchInput({basepath})}
          <div class="file-list-right-section">
            ${AmpState(selectModeStateId, {
              [selectModeStateKey]: selectModePrefix,
            })}
            ${ExamplesSelectModeOptional({basepath, selectModePrefix})}
            <a href="/~" class="underlined">List root directory</a>
          </div>
        </div>
        ${FileList({
          basepath,
          selectModePrefix,
          fileSet: fileSet.map(name => ({
            name,
            href: maybePrefixExampleDocHref(basepath, name, selectModePrefix),
          })),
        })}
      </div>
    </div>
    <div class="center">
      Built with 💙  by
      <a href="https://ampproject.org" class="underlined">the AMP Project</a>.
    </div>
    ${SettingsModal({serveMode})}
  </body>
  </html>`);


module.exports = {renderTemplate};
