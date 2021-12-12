import {ExternalReorderHeadTransformer} from '../external-reorder-head-transformer';

const title = `<title>Hello, world.</title>`;
const styleBoilerplate = `<style amp4ads-boilerplate>body{visibility:hidden}</style>`;
const ampExperiment = `<script async custom-element=amp-experiment src=https://cdn.ampproject.org/v0/amp-experiment-0.1.js></script>`;
const ampAudio = `<script async custom-element=amp-audio src=https://cdn.ampproject.org/v0/amp-audio-0.1.js></script>`;
const noscript = `<noscript><style amp-boilerplate> body{-webkit-animation:none;-moz-animation:none;-ms-animation:none; animation:none}</style></noscript>`;
const ampRuntimeStyle = `<style amp-runtime i-amphtml-version=42></style>`;
const ampRuntimeScript = `<script async src=https://cdn.ampproject.org/amp4ads-v0.js></script>`;
const ampMraid = `<script async host-service=amp-mraid src=https://cdn.ampproject.org/v0/amp-mraid-0.1.js></script>`;
const ampMustache = `<script async custom-template=amp-mustache src=https://cdn.ampproject.org/v0/amp-mustache-0.1.js></script>`;
const fontLink = `<link href=https://fonts.googleapis.com/css?foobar rel=stylesheet type=text/css>`;
const crossorigin = `<link crossorigin href=https://fonts.gstatic.com/ rel="dns-prefetch preconnect">`;
const metaCharset = `<meta charset=utf-8></meta>`;
const metaViewport = `<meta name=viewport content="width=device-width,minimum-scale=1,initial-scale=1"></meta>`;
const ampCustomStyle = `<style amp-custom></style>`;
const linkIcon = `<link href=https://example.test/favicon.ico rel=icon>`;
const ampViewerIntegration = `<script async src=https://cdn.ampproject.org/v0/amp-viewer-integration-0.1.js></script>`;
const ampGmail = `<script async src=https://cdn.ampproject.org/v0/amp-viewer-integration-gmail-0.1.js></script>`;

it('reorders head', () => {
  const input =
    `
        <html>
        <head>` +
    title +
    styleBoilerplate +
    ampExperiment +
    ampAudio +
    noscript +
    ampRuntimeStyle +
    ampRuntimeScript +
    ampMraid +
    ampMustache +
    fontLink +
    crossorigin +
    metaCharset +
    metaViewport +
    ampCustomStyle +
    linkIcon +
    ampViewerIntegration +
    ampGmail +
    `</head><body></body></html>`;
  const expected =
    `
        <html>
        <head>` +
    // (0) <meta charset> tag
    metaCharset +
    // (1) <style amp-runtime>
    ampRuntimeStyle +
    // (2) remaining <meta> tags (those other than <meta charset>)
    metaViewport +
    // (3) AMP runtime .js <script> tag
    ampRuntimeScript +
    // (4) AMP viewer runtime .js <script> tag
    ampViewerIntegration +
    // (5) Gmail AMP viewer runtime .js <script> tag
    ampGmail +
    // (6) <script> tags for render delaying extensions
    ampExperiment +
    // (7) <script> tags for remaining extensions
    ampAudio +
    ampMraid +
    ampMustache +
    // (8) <link> tag for favicon
    linkIcon +
    // (9) <link> tag for resource hints
    crossorigin +
    // (10) <link rel=stylesheet> tags before <style amp-custom>
    fontLink +
    // (11) <style amp-custom>
    ampCustomStyle +
    // (12) any other tags allowed in <head>
    title +
    // (13) amp boilerplate (first style amp-boilerplate, then noscript)
    styleBoilerplate +
    noscript +
    `</head><body></body></html>`;
  const inputHeadDoc = new DOMParser().parseFromString(input, 'text/html');
  const expectedHeadDoc = new DOMParser().parseFromString(
    expected,
    'text/html'
  );
  const transformed = new ExternalReorderHeadTransformer().reorderHead(
    inputHeadDoc.head
  );
  expect(transformed.outerHTML).to.equal(expectedHeadDoc.head.outerHTML);
});

it('reorders head a4a', () => {
  const inputa4a =
    `
        <html amp4ads>
        <head>` +
    title +
    styleBoilerplate +
    ampAudio +
    ampRuntimeScript +
    fontLink +
    crossorigin +
    metaCharset +
    metaViewport +
    ampCustomStyle +
    `</head><body></body></html>`;
  const expecteda4a =
    `
        <html>
        <head>` +
    // (0) <meta charset> tag
    metaCharset +
    // (1) <style amp-runtime>
    // N/A for a4a
    // (2) remaining <meta> tags (those other than <meta charset>)
    metaViewport +
    // (3) AMP runtime .js <script> tag
    ampRuntimeScript +
    // (4) AMP viewer runtime .js <script> tag
    // N/A (no viewer in a4a)
    // (5) Gmail AMP viewer runtime .js <script> tag
    // N/A
    // (6) <script> tags for render delaying extensions
    // N/A (render delaying extensions not allowed in a4a)
    // (7) <script> tags for remaining extensions
    ampAudio +
    // (8) <link> tag for favicon
    // N/A
    // (9) <link> tag for resource hints
    crossorigin +
    // (10) <link rel=stylesheet> tags before <style amp-custom>
    fontLink +
    // (11) <style amp-custom>
    ampCustomStyle +
    // (12) any other tags allowed in <head>
    title +
    // (13) amp boilerplate (first style amp-boilerplate, then noscript)
    styleBoilerplate +
    `</head><body></body></html>`;
  const inputHeadDoc = new DOMParser().parseFromString(inputa4a, 'text/html');
  const expectedHeadDoc = new DOMParser().parseFromString(
    expecteda4a,
    'text/html'
  );
  const transformed = new ExternalReorderHeadTransformer().reorderHead(
    inputHeadDoc.head
  );
  expect(transformed.outerHTML).to.equal(expectedHeadDoc.head.outerHTML);
});
