const test = require('ava');
const {replaceUrls, toInaboxDocument} = require('../app-utils');

test('replaceUrls("minified", ...)', async (t) => {
  const mode = 'minified';
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
      '<link rel="stylesheet" href="https://cdn.ampproject.org/v0/amp-whatever-1.0.css" />'
    ),
    '<link rel="stylesheet" href="/dist/v0/amp-whatever-1.0.css" />'
  );
  t.is(
    replaceUrls(
      mode,
      `
        <head>
          <script src="https://cdn.ampproject.org/v0.js"></script>
          <script src="https://cdn.ampproject.org/v0/amp-foo-0.1.js"></script>
          <link rel="stylesheet" href="https://cdn.ampproject.org/v0/amp-foo-1.0.css" />
        </head>
      `
    ),
    `
        <head>
          <script src="/dist/v0.js"></script>
          <script src="/dist/v0/amp-foo-0.1.js"></script>
          <link rel="stylesheet" href="/dist/v0/amp-foo-1.0.css" />
        </head>
      `
  );
});

test('replaceUrls("minified", ..., hostName)', async (t) => {
  const mode = 'minified';
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
      '<link rel="stylesheet" href="https://cdn.ampproject.org/v0/amp-whatever-1.0.css" />',
      hostName
    ),
    '<link rel="stylesheet" href="https://foo.bar/dist/v0/amp-whatever-1.0.css" />'
  );
  t.is(
    replaceUrls(
      mode,
      `
        <head>
          <script src="https://cdn.ampproject.org/v0.js"></script>
          <script src="https://cdn.ampproject.org/v0/amp-foo-0.1.js"></script>
          <link rel="stylesheet" href="https://cdn.ampproject.org/v0/amp-foo-1.0.css" />
        </head>
      `,
      hostName
    ),
    `
        <head>
          <script src="https://foo.bar/dist/v0.js"></script>
          <script src="https://foo.bar/dist/v0/amp-foo-0.1.js"></script>
          <link rel="stylesheet" href="https://foo.bar/dist/v0/amp-foo-1.0.css" />
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
      '<link rel="stylesheet" href="https://cdn.ampproject.org/v0/amp-whatever-1.0.css" />'
    ),
    '<link rel="stylesheet" href="/dist/v0/amp-whatever-1.0.css" />'
  );
  t.is(
    replaceUrls(
      mode,
      `
        <head>
          <script src="https://cdn.ampproject.org/v0.js"></script>
          <script src="https://cdn.ampproject.org/v0/amp-foo-0.1.js"></script>
          <link rel="stylesheet" href="https://cdn.ampproject.org/v0/amp-foo-1.0.css" />
        </head>
      `
    ),
    `
        <head>
          <script src="/dist/amp.js"></script>
          <script src="/dist/v0/amp-foo-0.1.max.js"></script>
          <link rel="stylesheet" href="/dist/v0/amp-foo-1.0.css" />
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
      '<link rel="stylesheet" href="https://cdn.ampproject.org/v0/amp-whatever-1.0.css" />',
      hostName
    ),
    '<link rel="stylesheet" href="https://foo.bar/dist/v0/amp-whatever-1.0.css" />'
  );
  t.is(
    replaceUrls(
      mode,
      `
        <head>
          <script src="https://cdn.ampproject.org/v0.js"></script>
          <script src="https://cdn.ampproject.org/v0/amp-foo-0.1.js"></script>
          <link rel="stylesheet" href="https://cdn.ampproject.org/v0/amp-foo-1.0.css" />
        </head>
      `,
      hostName
    ),
    `
        <head>
          <script src="https://foo.bar/dist/amp.js"></script>
          <script src="https://foo.bar/dist/v0/amp-foo-0.1.max.js"></script>
          <link rel="stylesheet" href="https://foo.bar/dist/v0/amp-foo-1.0.css" />
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
      '<link rel="stylesheet" href="https://cdn.ampproject.org/v0/amp-whatever-1.0.css" />'
    ),
    '<link rel="stylesheet" href="https://cdn.ampproject.org/rtv/123456789012345/v0/amp-whatever-1.0.css" />'
  );
  t.is(
    replaceUrls(
      mode,
      `
        <head>
          <script src="https://cdn.ampproject.org/v0.js"></script>
          <script src="https://cdn.ampproject.org/v0/amp-foo-0.1.js"></script>
          <link rel="stylesheet" href="https://cdn.ampproject.org/v0/amp-foo-1.0.css" />
        </head>
      `
    ),
    `
        <head>
          <script src="https://cdn.ampproject.org/rtv/123456789012345/v0.js"></script>
          <script src="https://cdn.ampproject.org/rtv/123456789012345/v0/amp-foo-0.1.js"></script>
          <link rel="stylesheet" href="https://cdn.ampproject.org/rtv/123456789012345/v0/amp-foo-1.0.css" />
        </head>
      `
  );
});

test('toInaboxDocument(...)', async (t) => {
  t.is(
    toInaboxDocument(
      `<html amp>
        <head>
          <script src="https://cdn.ampproject.org/v0.js"></script>
          <script src="https://cdn.ampproject.org/v0/amp-video-0.1.js"></script>
        </head>
      </html>`
    ),
    `<html amp4ads>
        <head>
          <script src="https://cdn.ampproject.org/amp4ads-v0.js"></script>
          <script src="https://cdn.ampproject.org/v0/amp-video-0.1.js"></script>
        </head>
      </html>`
  );
});

test('replaceUrls("minified", toInaboxDocument(...))', async (t) => {
  const mode = 'minified';
  const hostName = '';
  t.is(
    replaceUrls(
      mode,
      toInaboxDocument(
        '<script src="https://cdn.ampproject.org/v0.js"></script>'
      ),
      hostName
    ),
    '<script src="/dist/amp4ads-v0.js"></script>'
  );
});

test('replaceUrls("default", toInaboxDocument(...))', async (t) => {
  const mode = 'default';
  const hostName = '';
  t.is(
    replaceUrls(
      mode,
      toInaboxDocument(
        '<script src="https://cdn.ampproject.org/v0.js"></script>'
      ),
      hostName
    ),
    '<script src="/dist/amp-inabox.js"></script>'
  );
});

test('replaceUrls(rtv, toInaboxDocument(...))', async (t) => {
  const mode = '123456789012345';
  const hostName = '';
  t.is(
    replaceUrls(
      mode,
      toInaboxDocument(
        '<script src="https://cdn.ampproject.org/v0.js"></script>'
      ),
      hostName
    ),
    '<script src="https://cdn.ampproject.org/rtv/123456789012345/amp4ads-v0.js"></script>'
  );
});
