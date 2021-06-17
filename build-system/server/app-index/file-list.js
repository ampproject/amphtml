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
const {html, joinFragments} = require('./html');
const {htmlEnvelopePrefixKey} = require('./settings');
const {replaceLeadingSlash} = require('./url');

const examplesPathRegex = /^\/examples\//;
const htmlDocRegex = /\.html$/;

const linksToExample = (shouldContainBasepath, opt_name) =>
  examplesPathRegex.test(shouldContainBasepath) &&
  htmlDocRegex.test(opt_name || shouldContainBasepath);

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

const FileListItemBound = ({href, htmlEnvelopePrefix, name}) =>
  linksToExample(href)
    ? FileListItem({
        name,
        href: htmlEnvelopePrefix + replaceLeadingSlash(href, ''),
        boundHref: `(${htmlEnvelopePrefixKey} || '${htmlEnvelopePrefix}') + '${replaceLeadingSlash(
          href,
          ''
        )}'`,
      })
    : FileListItem({href, name});

const maybePrefixExampleDocHref = (basepath, name, htmlEnvelopePrefix) =>
  (linksToExample(basepath, name)
    ? replaceLeadingSlash(basepath, htmlEnvelopePrefix)
    : basepath) + name;

const FileListHeading = ({basepath}) => html`
  <div class="file-list-heading">
    <h3 class="code" id="basepath">${basepath}</h3>
    <div class="file-list-right-section">
      <a href="/~" class="underlined">List root directory</a>
    </div>
  </div>
`;

const FileList = ({basepath, fileSet, htmlEnvelopePrefix}) =>
  joinFragments([
    FileListHeading({basepath}),
    html`
      <div class="file-list">
        <div role="list">
          ${joinFragments(fileSet, (name) =>
            FileListItemBound({
              name,
              href: maybePrefixExampleDocHref(
                basepath,
                name,
                htmlEnvelopePrefix
              ),
              htmlEnvelopePrefix,
            })
          )}
        </div>
      </div>
    `,
  ]);

module.exports = {
  FileList,
};
