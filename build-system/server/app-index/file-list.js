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

/* eslint-disable local/html-template */

const documentModes = require('./document-modes');
const {AmpState, ampStateKey} = require('./amphtml-helpers');
const {html, joinFragments} = require('./html');
const {KeyValueOptions} = require('./form');
const {replaceLeadingSlash} = require('./url');

const examplesPathRegex = /^\/examples\//;
const htmlDocRegex = /\.html$/;

const selectModeStateId = 'documentMode';
const selectModeStateKey = 'selectModePrefix';
const selectModeKey = ampStateKey(selectModeStateId, selectModeStateKey);

const ExamplesDocumentModeSelect = () => html`
  <label for="examples-mode-select">
    Document mode:
    <select
      id="examples-mode-select"
      on="change:AMP.setState({
          ${selectModeStateId}: {
            ${selectModeStateKey}: event.value
          }
        })"
    >
      ${KeyValueOptions(documentModes)}
    </select>
  </label>
`;

const linksToExample = (shouldContainBasepath, opt_name) =>
  examplesPathRegex.test(shouldContainBasepath) &&
  htmlDocRegex.test(opt_name || shouldContainBasepath);

const ExamplesSelectModeOptional = ({basepath}) =>
  !examplesPathRegex.test(basepath + '/') ? '' : ExamplesDocumentModeSelect();

/**
 * @param {{ name: string, href: string, boundHref?: string|undefined }} config
 * @return {string}
 */
const FileListItem = ({boundHref, href, name}) =>
  html`
    <div class="file-link-container" role="listitem">
      <a
        class="file-link"
        ${boundHref ? `[href]="${boundHref}" ` : ''}
        ${href ? `href="${href}" ` : ''}
      >
        ${name}
      </a>
    </div>
  `;

const PlaceholderFileListItem = ({href, name, selectModePrefix}) =>
  linksToExample(href)
    ? FileListItem({
        name,
        href: selectModePrefix + replaceLeadingSlash(href, ''),
        boundHref: `(${selectModeKey} || '${selectModePrefix}') + '${replaceLeadingSlash(
          href,
          ''
        )}'`,
      })
    : FileListItem({href, name});

const maybePrefixExampleDocHref = (basepath, name, selectModePrefix) =>
  (linksToExample(basepath, name)
    ? replaceLeadingSlash(basepath, selectModePrefix)
    : basepath) + name;

const FileListHeading = ({basepath, selectModePrefix}) => html`
  <div class="file-list-heading">
    <h3 class="code" id="basepath">${basepath}</h3>
    <div class="file-list-right-section">
      ${AmpState(selectModeStateId, {
        [selectModeStateKey]: selectModePrefix,
      })}
      ${ExamplesSelectModeOptional({basepath})}
      <a href="/~" class="underlined">List root directory</a>
    </div>
  </div>
`;

const wrapFileList = (rendered) => html`
  <div class="file-list-container">
    <div class="wrap">${rendered}</div>
  </div>
`;

const FileList = ({basepath, fileSet, selectModePrefix}) =>
  wrapFileList(
    joinFragments([
      FileListHeading({basepath, selectModePrefix}),
      html`
        <div class="file-list">
          <div role="list">
            ${joinFragments(fileSet, (name) =>
              PlaceholderFileListItem({
                name,
                href: maybePrefixExampleDocHref(
                  basepath,
                  name,
                  selectModePrefix
                ),
                selectModePrefix,
              })
            )}
          </div>
        </div>
      `,
    ])
  );

module.exports = {FileList};
