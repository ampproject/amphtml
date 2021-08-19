import {buildUrl} from '#ads/google/a4a/shared/url-builder';

describes.sandboxed('buildUrl', {}, () => {
  it('should build a simple URL', () => {
    expect(
      buildUrl('https://example.test', {'key': 'value'}, Infinity)
    ).to.equal('https://example.test?key=value');
  });
});
