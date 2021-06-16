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

/* eslint-disable local/html-template */

'use strict';

const headerLinks = require('./header-links');
const ProxyForm = require('./proxy-form');
const {AmpDoc, addRequiredExtensionsToHead} = require('./amphtml-helpers');
const {FileList} = require('./file-list');
const {html, joinFragments} = require('./html');
const {SettingsModal, SettingsOpenButton} = require('./settings');

const ampLogoSvg = html`<svg
  id="logo"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 30 30"
>
  <g fill="none" fill-rule="evenodd">
    <path
      fill="#FFF"
      d="M0 15c0 8.284 6.716 15 15 15 8.285 0 15-6.716 15-15 0-8.284-6.715-15-15-15C6.716 0 0 6.716 0 15z"
    ></path>
    <path
      fill="#005AF0"
      fill-rule="nonzero"
      d="M13.85 24.098h-1.14l1.128-6.823-3.49.005h-.05a.57.57 0 0 1-.568-.569c0-.135.125-.363.125-.363l6.272-10.46 1.16.005-1.156 6.834 3.508-.004h.056c.314 0 .569.254.569.568 0 .128-.05.24-.121.335L13.85 24.098zM15 0C6.716 0 0 6.716 0 15c0 8.284 6.716 15 15 15 8.285 0 15-6.716 15-15 0-8.284-6.715-15-15-15z"
    ></path>
  </g>
</svg>`;

const HeaderLink = ({divider, href, name}) => html`
  <li class="${divider ? 'divider' : ''}">
    <a target="_blank" rel="noopener noreferrer" href="${href}"> ${name} </a>
  </li>
`;

const Header = ({isMainPage, links}) => html`
  <header>
    <h1 class="amp-logo">${ampLogoSvg} AMP</h1>
    <div class="right-of-logo">
      ${!isMainPage ? HeaderBackToMainLink() : ''}
    </div>
    <ul class="right-nav">
      ${joinFragments(links, ({divider, href, name}, i) =>
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

const HeaderBackToMainLink = () => html` <a href="/">← Back to main</a> `;

const ProxyFormOptional = ({isMainPage}) => (isMainPage ? ProxyForm() : '');

/**
 * @param {{
 *  basepath?: string,
 *  css?: string
 *  isMainPage?: boolean,
 *  fileSet?: Array,
 *  serveMode?: string,
 *  selectModePrefix?: string,
 * }=} opt_params
 * @return {string}
 */
function renderTemplate(opt_params = {}) {
  const {
    basepath = '/',
    css,
    isMainPage = false,
    fileSet = [],
    serveMode = 'default',
    selectModePrefix = '/',
  } = opt_params;

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
