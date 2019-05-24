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

const headerLinks = require('./header-links');
const ProxyForm = require('./proxy-form');
const {AmpDoc, addRequiredExtensionsToHead} = require('./amphtml-helpers');
const {FileList} = require('./file-list');
const {html, joinFragments} = require('./html');
const {SettingsModal, SettingsOpenButton} = require('./settings');

const HeaderLink = ({name, href, divider}) => html`
  <li class="${divider ? 'divider' : ''}">
    <a target="_blank" rel="noopener noreferrer" href="${href}">
      ${name}
    </a>
  </li>
`;

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
        })
      )}
      <li>${SettingsOpenButton()}</li>
    </ul>
  </header>
`;

const HeaderBackToMainLink = () =>
  html`
    <a href="/">← Back to main</a>
  `;

const ProxyFormOptional = ({isMainPage}) => (isMainPage ? ProxyForm() : '');

function renderTemplate(opt_params) {
  const {basepath, css, isMainPage, fileSet, serveMode, selectModePrefix} = {
    basepath: '/',
    isMainPage: false,
    fileSet: [],
    serveMode: 'default',
    selectModePrefix: '/',
    ...(opt_params || {}),
  };

  const body = joinFragments([
    html`
      <div class="wrap">
        ${Header({isMainPage, links: headerLinks})}
        ${ProxyFormOptional({isMainPage})}
      </div>
    `,

    FileList({basepath, selectModePrefix, fileSet}),

    html`
      <div class="center">
        Built with 💙 by
        <a href="https://ampproject.org" class="underlined">the AMP Project</a>.
      </div>
    `,

    SettingsModal({serveMode}),
  ]);

  const docWithoutExtensions = AmpDoc({canonical: basepath, css, body});

  return addRequiredExtensionsToHead(docWithoutExtensions);
}

module.exports = {renderTemplate};
