/* eslint-disable local/html-template */

'use strict';

const headerLinks = require('./header-links');
const ProxyForm = require('./proxy-form');
const {AmpDoc, addRequiredExtensionsToHead} = require('./amphtml-helpers');
const {FileList} = require('./file-list');
const {html, joinFragments} = require('./html');
const {SettingsPanelButtons} = require('./settings');

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

const TopLevelWrap = (content) => html`
  <div style="border-bottom: 1px solid #ddd">
    <div class="wrap">${content}</div>
  </div>
`;

const Header = ({htmlEnvelopePrefix, jsMode, links}) => html`
  <header>
    <h1 class="amp-logo">${ampLogoSvg}</h1>
    ${SettingsPanelButtons({htmlEnvelopePrefix, jsMode})}
    <ul class="right-nav">
      ${joinFragments(
        links,
        ({href, name}) => html`
          <li>
            <a target="_blank" rel="noopener noreferrer" href="${href}">
              ${name}
            </a>
          </li>
        `
      )}
    </ul>
  </header>
`;

/**
 * @param {{
 *  basepath?: string,
 *  css?: string
 *  fileSet?: Array,
 *  serveMode?: string,
 *  htmlEnvelopePrefix?: string,
 * }=} opt_params
 * @return {string}
 */
function renderTemplate(opt_params = {}) {
  const {
    basepath = '/',
    css,
    fileSet = [],
    htmlEnvelopePrefix = '/',
    serveMode = 'default',
  } = opt_params;

  const body = joinFragments([
    TopLevelWrap(
      Header({htmlEnvelopePrefix, jsMode: serveMode, links: headerLinks})
    ),
    TopLevelWrap(ProxyForm({htmlEnvelopePrefix})),
    TopLevelWrap(FileList({basepath, htmlEnvelopePrefix, fileSet})),

    html`
      <div class="center">
        Built with 💙 by
        <a href="https://ampproject.org" class="underlined">the AMP Project</a>.
      </div>
    `,
  ]);

  const docWithoutExtensions = AmpDoc({canonical: basepath, css, body});

  return addRequiredExtensionsToHead(docWithoutExtensions);
}

module.exports = {renderTemplate};
