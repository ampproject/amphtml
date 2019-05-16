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
/* eslint-disable indent */

const documentModes = require('./document-modes');
const {AmpState, ampStateKey, containsExpr} = require('./amphtml-helpers');
const {appendQueryParamsToUrl, replaceLeadingSlash} = require('./url');
const {html, joinFragments} = require('./html');
const {KeyValueOptions} = require('./form');

const examplesPathRegex = /^\/examples\//;
const htmlDocRegex = /\.html$/;

const endpoint = q => appendQueryParamsToUrl('/dashboard/api/listing', q);

const selectModeStateId = 'documentMode';
const selectModeStateKey = 'selectModePrefix';
const selectModeKey = ampStateKey(selectModeStateId, selectModeStateKey);

const endpointStateId = 'listingEndpoint';
const endpointStateKey = 'src';
const endpointKey = ampStateKey(endpointStateId, endpointStateKey);

const FileListSearchInput = ({basepath}) => html`
  <input
    type="text"
    class="file-list-search"
    placeholder="Fuzzy Search"
    pattern="[a-zA-Z0-9-]+"
    on="input-debounced: AMP.setState({
      ${endpointStateId}: {
        ${endpointStateKey}: '${endpoint({
      path: basepath,
      search: '',
    })}' + event.value
      }
    })"
  />
`;

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

const ExamplesSelectModeOptional = ({basepath, selectModePrefix}) =>
  !examplesPathRegex.test(basepath + '/')
    ? ''
    : ExamplesDocumentModeSelect({
        selectModePrefix,
      });

const FileListItem = ({name, href, boundHref}) =>
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

const PlaceholderFileListItem = ({name, href, selectModePrefix}) =>
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
`;

const wrapFileList = rendered => html`
  <div class="file-list-container">
    <div class="wrap">
      ${rendered}
    </div>
  </div>
`;

const FileList = ({basepath, fileSet, selectModePrefix}) =>
  wrapFileList(
    joinFragments([
      AmpState(endpointStateId, {
        [endpointStateKey]: endpoint({path: basepath}),
      }),

      FileListHeading({basepath, selectModePrefix}),

      html`
        <amp-list
          [src]="${endpointKey}"
          src="${endpoint({path: basepath})}"
          items="."
          layout="fixed-height"
          width="auto"
          height="568px"
          class="file-list custom-loader"
        >
          <div fallback>Failed to load data.</div>

          <div placeholder>
            <div role="list">
              ${joinFragments(fileSet, name =>
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

          <template type="amp-mustache">
            ${FileListItem({
              href: `${basepath}{{.}}`,
              boundHref: containsExpr(
                "'{{.}}'",
                "'.html'",
                `(${selectModeKey} || '${selectModePrefix}') +` +
                  `'${replaceLeadingSlash(basepath, '')}{{.}}'`,
                `'${basepath}{{.}}'`
              ),
              name: '{{.}}',
            })}
          </template>

          <div
            overflow
            role="button"
            aria-label="Show more"
            class="list-overflow"
          >
            Show more
          </div>
        </amp-list>
      `,
    ])
  );

module.exports = {FileList};
