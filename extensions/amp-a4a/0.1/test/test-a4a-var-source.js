import {installDocumentInfoServiceForDoc} from '#service/document-info-impl';

import {createIframePromise} from '#testing/iframe';

import {A4AVariableSource} from '../a4a-variable-source';

describes.sandboxed('A4AVariableSource', {}, () => {
  let varSource;

  beforeEach(async () => {
    const iframe = await createIframePromise();
    iframe.doc.title = 'Pixel Test';
    const link = iframe.doc.createElement('link');
    link.setAttribute('href', 'https://pinterest.com:8080/pin1');
    link.setAttribute('rel', 'canonical');
    iframe.doc.head.appendChild(link);
    iframe.win.__AMP_SERVICES.documentInfo = null;
    installDocumentInfoServiceForDoc(iframe.ampdoc);
    varSource = new A4AVariableSource(iframe.ampdoc, iframe.win);
  });

  function expandAsync(varName, opt_params) {
    return varSource.get(varName).async.apply(null, opt_params);
  }

  function expandSync(varName, opt_params) {
    return varSource.get(varName).sync.apply(null, opt_params);
  }

  it('should replace RANDOM', () => {
    expect(expandSync('RANDOM')).to.match(/(\d+(\.\d+)?)$/);
  });

  it('should replace CANONICAL_URL', () => {
    expect(expandSync('CANONICAL_URL')).to.equal(
      'https://pinterest.com:8080/pin1'
    );
  });

  it('should replace NAV_TIMING', async () => {
    expect(expandSync('NAV_TIMING', ['navigationStart'])).to.match(/\d+/);
    const val = await expandAsync('NAV_TIMING', ['navigationStart']);
    return expect(val).to.match(/\d+/);
  });

  it('should replace NAV_TYPE', () => {
    expect(expandSync('NAV_TYPE')).to.match(/\d/);
  });

  it('should replace NAV_REDIRECT_COUNT', () => {
    expect(expandSync('NAV_REDIRECT_COUNT')).to.match(/\d/);
  });

  it('should replace HTML_ATTR', () => {
    expect(expandSync('HTML_ATTR', ['div', 'id'])).to.equal(
      '[{"id":"parent"}]'
    );
  });

  it('should replace CLIENT_ID with null', () => {
    return expect(expandSync('CLIENT_ID', ['a'])).to.be.null;
  });

  function undefinedVariable(varName) {
    it('should not replace ' + varName, () => {
      expect(varSource.get(varName)).to.be.undefined;
    });
  }

  // Performance timing info.
  undefinedVariable('PAGE_LOAD_TIME');
  undefinedVariable('DOMAIN_LOOKUP_TIME');
  undefinedVariable('TCP_CONNECT_TIME');
  undefinedVariable('SERVER_RESPONSE_TIME');
  undefinedVariable('PAGE_DOWNLOAD_TIME');
  undefinedVariable('REDIRECT_TIME');
  undefinedVariable('DOM_INTERACTIVE_TIME');
  undefinedVariable('CONTENT_LOAD_TIME');

  // Access data.
  undefinedVariable('ACCESS_READER_ID');
  undefinedVariable('AUTHDATA');

  // amp-bind state.
  // AMP_STATE() is not scoped to the FIE so this cannot be safely removed
  // without refactoring the implementation in url-replacements-impl.js.
  undefinedVariable('AMP_STATE');
});
