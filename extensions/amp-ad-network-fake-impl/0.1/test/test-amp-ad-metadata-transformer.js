import {AmpAdMetadataTransformer} from '../amp-ad-metadata-transformer';

const ampRuntimeScript = `<script async src=https://cdn.ampproject.org/amp4ads-v0.js></script>`;
const metaCharset = `<meta charset=utf-8></meta>`;
const metaViewport = `<meta name=viewport content="width=device-width,minimum-scale=1,initial-scale=1"></meta>`;

it('generates extensions metadata', () => {
  const docString = `<html ⚡ lang="en"><head>
    <script custom-element="amp-font"
        src="https://cdn.ampproject.org/v0/amp-font-0.1.js"></script>
    <script custom-element="amp-list"
        src="https://cdn.ampproject.org/v0/amp-list-latest.js"></script>
    <script custom-element="amp-list"
        src="https://cdn.ampproject.org/v0/amp-list-0.1.js"></script>
    </head><body></body></html>`;
  const doc = new DOMParser().parseFromString(docString, 'text/html');
  const metadata = new AmpAdMetadataTransformer().generateMetadata(doc);
  expect(metadata).to.include(
    `"extensions":[{"custom-element":"amp-font","src":"https://cdn.ampproject.org/v0/amp-font-0.1.js"},{"custom-element":"amp-list","src":"https://cdn.ampproject.org/v0/amp-list-latest.js"}]`
  );
});

it('generates runtime offsets', () => {
  const docString =
    `<!doctype html><html amp4ads><head>` +
    metaCharset +
    metaViewport +
    ampRuntimeScript +
    `</head><body>hello world</body></html>`;
  const doc = new DOMParser().parseFromString(docString, 'text/html');
  const metadata = new AmpAdMetadataTransformer().generateMetadata(doc);
  expect(metadata).to.equal(`{"ampRuntimeUtf16CharOffsets":[128,201]}`);
});

it('generates json offsets', () => {
  const docString =
    '<!doctype html><html amp4ads><head>' +
    metaCharset +
    metaViewport +
    ampRuntimeScript +
    '<style amp-custom></style></head><body><amp-analytics><script type=application/json>Iñtërnâtiônàlizætiøn☃💩</script></amp-analytics></body></html>';
  const doc = new DOMParser().parseFromString(docString, 'text/html');
  const metadata = new AmpAdMetadataTransformer().generateMetadata(doc);
  expect(metadata).to.include(
    `"jsonUtf16CharOffsets":{"amp-analytics":[258,322]`
  );
});

it('handles already existing amp-ad-metadata json', () => {
  const docString =
    '<!doctype html><html amp4ads><head>' +
    metaCharset +
    metaViewport +
    ampRuntimeScript +
    '<style amp-custom></style></head><body><script type=application/json amp-ad-metadata>{"diagnosis": "pre-existing condition"}</script></body></html>';
  const doc = new DOMParser().parseFromString(docString, 'text/html');
  const metadata = new AmpAdMetadataTransformer().generateMetadata(doc);
  expect(metadata).to.include(`"diagnosis":"pre-existing condition"`);
});

it('generates image metadata', () => {
  const docString =
    '<!doctype html><html amp4ads><head>' +
    metaCharset +
    metaViewport +
    ampRuntimeScript +
    `<style amp-custom></style></head><body>
           <amp-img notSrc="https://goo.com"></amp-img>
          <amp-img-other src="https://goo.com"></amp-img>
          <Amp-imG src="https://some.image.com?a=b" height=999 width=0></amp-img>
          <div>
            <amp-img src="https://foo.image.com?a=b&c=d" height=1 width=1></amp-img>
          </div>
          <amp-img src="https://test.image.com" height=1 width=5></amp-img>
          <amp-img src="https://foo.image.com?a=b&c=d" height=1 width=2></amp-img>
          <aMp-imG src="https://test.image.com?d=e" height=1 width=3></amp-img>
          <amp-img src="https://test.image.com?f=g" height=4 width=1></amp-img>
          <amp-img src="https://test.image.com?h=i" height=0 width=1999></amp-img>
           </body></html>`;
  const doc = new DOMParser().parseFromString(docString, 'text/html');
  const metadata = new AmpAdMetadataTransformer().generateMetadata(doc);
  expect(metadata).to.include(
    `"images":["https://some.image.com?a=b","https://foo.image.com?a=b&c=d","https://test.image.com","https://foo.image.com?a=b&c=d","https://test.image.com?d=e","https://test.image.com?f=g","https://test.image.com?h=i"]`
  );
});

it('adds the correct metadata for a story ad', () => {
  const storyAd = `
  <html ⚡4ads>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1">
    <style amp4ads-boilerplate>body{visibility:hidden}</style>
    <script async src="https://cdn.ampproject.org/amp4ads-v0.js"></script>
    <meta name="amp-cta-type" content="INSTALL">
    <meta name="amp-cta-url" content="https://www.amp.dev">
  </head>
  <body>Hello, AMP4ADS world.</body>
  </html>
  `;
  const doc = new DOMParser().parseFromString(storyAd, 'text/html');
  const metadata = new AmpAdMetadataTransformer().generateMetadata(doc);
  const parsed = JSON.parse(metadata);
  expect(parsed.ctaType).to.equal('INSTALL');
  expect(parsed.ctaUrl).to.equal('https://www.amp.dev');
});

it('warns user when invalid script is in document', () => {
  const input = `<html ⚡4ads>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1">
    <style amp4ads-boilerplate>body{visibility:hidden}</style>
    <script async src="https://cdn.ampproject.org/amp4ads-v0.js"></script>
  </head>
  <body><script type="bad"></script></body>
  </html>
  `;
  const doc = new DOMParser().parseFromString(input, 'text/html');
  const metadata = new AmpAdMetadataTransformer().generateMetadata(doc);
  //metadata should not include bad script
  expect(metadata).to.equal('{"ampRuntimeUtf16CharOffsets":[191,264]}');
});
