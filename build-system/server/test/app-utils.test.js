/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

const test = require('ava');
const {replaceUrls} = require('../app-utils');

test('replaceUrls("compiled", ...)', async (t) => {
  const mode = 'compiled';
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/v0.js"></script>'
    ),
    '<script src="/dist/v0.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/shadow-v0.js"></script>'
    ),
    '<script src="/dist/shadow-v0.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/amp4ads-v0.js"></script>'
    ),
    '<script src="/dist/amp4ads-v0.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/video-iframe-integration-v0.js"></script>'
    ),
    '<script src="/dist/video-iframe-integration-v0.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      `
        <head>
          <script src="https://cdn.ampproject.org/v0.js"></script>
          <script src="https://cdn.ampproject.org/v0/amp-foo-0.1.js"></script>
        </head>
      `
    ),
    `
        <head>
          <script src="/dist/v0.js"></script>
          <script src="/dist/v0/amp-foo-0.1.js"></script>
        </head>
      `
  );
});

test('replaceUrls("compiled", ..., hostName)', async (t) => {
  const mode = 'compiled';
  const hostName = 'https://foo.bar';
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/v0.js"></script>',
      hostName
    ),
    '<script src="https://foo.bar/dist/v0.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/shadow-v0.js"></script>',
      hostName
    ),
    '<script src="https://foo.bar/dist/shadow-v0.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/amp4ads-v0.js"></script>',
      hostName
    ),
    '<script src="https://foo.bar/dist/amp4ads-v0.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/video-iframe-integration-v0.js"></script>',
      hostName
    ),
    '<script src="https://foo.bar/dist/video-iframe-integration-v0.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      `
        <head>
          <script src="https://cdn.ampproject.org/v0.js"></script>
          <script src="https://cdn.ampproject.org/v0/amp-foo-0.1.js"></script>
        </head>
      `,
      hostName
    ),
    `
        <head>
          <script src="https://foo.bar/dist/v0.js"></script>
          <script src="https://foo.bar/dist/v0/amp-foo-0.1.js"></script>
        </head>
      `
  );
});

test('replaceUrls("default", ...)', async (t) => {
  const mode = 'default';
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/v0.js"></script>'
    ),
    '<script src="/dist/amp.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/shadow-v0.js"></script>'
    ),
    '<script src="/dist/amp-shadow.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/amp4ads-v0.js"></script>'
    ),
    '<script src="/dist/amp-inabox.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/video-iframe-integration-v0.js"></script>'
    ),
    '<script src="/dist/video-iframe-integration.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      `
        <head>
          <script src="https://cdn.ampproject.org/v0.js"></script>
          <script src="https://cdn.ampproject.org/v0/amp-foo-0.1.js"></script>
        </head>
      `
    ),
    `
        <head>
          <script src="/dist/amp.js"></script>
          <script src="/dist/v0/amp-foo-0.1.max.js"></script>
        </head>
      `
  );
});

test('replaceUrls("default", ..., hostName)', async (t) => {
  const mode = 'default';
  const hostName = 'https://foo.bar';
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/v0.js"></script>',
      hostName
    ),
    '<script src="https://foo.bar/dist/amp.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/shadow-v0.js"></script>',
      hostName
    ),
    '<script src="https://foo.bar/dist/amp-shadow.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/amp4ads-v0.js"></script>',
      hostName
    ),
    '<script src="https://foo.bar/dist/amp-inabox.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/video-iframe-integration-v0.js"></script>',
      hostName
    ),
    '<script src="https://foo.bar/dist/video-iframe-integration.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      `
        <head>
          <script src="https://cdn.ampproject.org/v0.js"></script>
          <script src="https://cdn.ampproject.org/v0/amp-foo-0.1.js"></script>
        </head>
      `,
      hostName
    ),
    `
        <head>
          <script src="https://foo.bar/dist/amp.js"></script>
          <script src="https://foo.bar/dist/v0/amp-foo-0.1.max.js"></script>
        </head>
      `
  );
});

test('replaceUrls(rtv, ...)', async (t) => {
  const mode = '123456789012345';
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/v0.js"></script>'
    ),
    '<script src="https://cdn.ampproject.org/rtv/123456789012345/v0.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/shadow-v0.js"></script>'
    ),
    '<script src="https://cdn.ampproject.org/rtv/123456789012345/shadow-v0.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/amp4ads-v0.js"></script>'
    ),
    '<script src="https://cdn.ampproject.org/rtv/123456789012345/amp4ads-v0.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/video-iframe-integration-v0.js"></script>'
    ),
    '<script src="https://cdn.ampproject.org/rtv/123456789012345/video-iframe-integration-v0.js"></script>'
  );
  t.is(
    replaceUrls(
      mode,
      `
        <head>
          <script src="https://cdn.ampproject.org/v0.js"></script>
          <script src="https://cdn.ampproject.org/v0/amp-foo-0.1.js"></script>
        </head>
      `
    ),
    `
        <head>
          <script src="https://cdn.ampproject.org/rtv/123456789012345/v0.js"></script>
          <script src="https://cdn.ampproject.org/rtv/123456789012345/v0/amp-foo-0.1.js"></script>
        </head>
      `
  );
});

test('replaceUrls("compiled", ..., inabox)', async (t) => {
  const mode = 'compiled';
  const hostName = '';
  const inabox = true;
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/v0.js"></script>',
      hostName,
      inabox
    ),
    '<script src="/dist/amp4ads-v0.js"></script>'
  );
});

test('replaceUrls("default", ..., inabox)', async (t) => {
  const mode = 'default';
  const hostName = '';
  const inabox = true;
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/v0.js"></script>',
      hostName,
      inabox
    ),
    '<script src="/dist/amp-inabox.js"></script>'
  );
});

test('replaceUrls(rtv, ..., inabox)', async (t) => {
  const mode = '123456789012345';
  const hostName = '';
  const inabox = true;
  t.is(
    replaceUrls(
      mode,
      '<script src="https://cdn.ampproject.org/v0.js"></script>',
      hostName,
      inabox
    ),
    '<script src="https://cdn.ampproject.org/rtv/123456789012345/amp4ads-v0.js"></script>'
  );
});
