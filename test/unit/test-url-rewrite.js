import {
  resolveUrlAttr,
  rewriteAttributesForElement,
} from '../../src/url-rewrite';

describes.sandboxed('resolveUrlAttr', {}, () => {
  it('should throw if __amp_source_origin is set', () => {
    allowConsoleError(() => {
      expect(() =>
        resolveUrlAttr(
          'a',
          'href',
          '/doc2?__amp_source_origin=https://google.com',
          'http://acme.org/doc1'
        )
      ).to.throw(/Source origin is not allowed/);
    });
  });

  it('should resolve non-hash href', () => {
    expect(
      resolveUrlAttr('a', 'href', '/doc2', 'http://acme.org/doc1')
    ).to.equal('http://acme.org/doc2');
    expect(
      resolveUrlAttr(
        'a',
        'href',
        '/doc2',
        'https://cdn.ampproject.org/c/acme.org/doc1'
      )
    ).to.equal('http://acme.org/doc2');
    expect(
      resolveUrlAttr(
        'a',
        'href',
        'http://non-acme.org/doc2',
        'http://acme.org/doc1'
      )
    ).to.equal('http://non-acme.org/doc2');
  });

  it('should ignore hash URLs', () => {
    expect(
      resolveUrlAttr('a', 'href', '#hash1', 'http://acme.org/doc1')
    ).to.equal('#hash1');
  });

  it('should resolve src', () => {
    expect(
      resolveUrlAttr('amp-video', 'src', '/video1', 'http://acme.org/doc1')
    ).to.equal('http://acme.org/video1');
    expect(
      resolveUrlAttr(
        'amp-video',
        'src',
        '/video1',
        'https://cdn.ampproject.org/c/acme.org/doc1'
      )
    ).to.equal('http://acme.org/video1');
    expect(
      resolveUrlAttr(
        'amp-video',
        'src',
        'http://non-acme.org/video1',
        'http://acme.org/doc1'
      )
    ).to.equal('http://non-acme.org/video1');
  });

  it('should rewrite image http(s) src', () => {
    expect(
      resolveUrlAttr(
        'amp-img',
        'src',
        '/image1?a=b#h1',
        'https://cdn.ampproject.org/c/acme.org/doc1'
      )
    ).to.equal('https://cdn.ampproject.org/i/acme.org/image1?a=b#h1');
    expect(
      resolveUrlAttr(
        'amp-img',
        'src',
        'https://acme.org/image1?a=b#h1',
        'https://cdn.ampproject.org/c/acme.org/doc1'
      )
    ).to.equal('https://cdn.ampproject.org/i/s/acme.org/image1?a=b#h1');
  });

  it('should rewrite image http(s) srcset', () => {
    expect(
      resolveUrlAttr(
        'amp-img',
        'srcset',
        '/image2?a=b#h1 2x, /image1?a=b#h1 1x',
        'https://cdn.ampproject.org/c/acme.org/doc1'
      )
    ).to.equal(
      'https://cdn.ampproject.org/i/acme.org/image1?a=b#h1 1x, ' +
        'https://cdn.ampproject.org/i/acme.org/image2?a=b#h1 2x'
    );
    expect(
      resolveUrlAttr(
        'amp-img',
        'srcset',
        'https://acme.org/image2?a=b#h1 2x, /image1?a=b#h1 1x',
        'https://cdn.ampproject.org/c/acme.org/doc1'
      )
    ).to.equal(
      'https://cdn.ampproject.org/i/acme.org/image1?a=b#h1 1x, ' +
        'https://cdn.ampproject.org/i/s/acme.org/image2?a=b#h1 2x'
    );
  });

  it('should NOT rewrite image http(s) src when not on proxy', () => {
    expect(
      resolveUrlAttr('amp-img', 'src', '/image1', 'http://acme.org/doc1')
    ).to.equal('http://acme.org/image1');
  });

  it('should NOT rewrite image data src', () => {
    expect(
      resolveUrlAttr(
        'amp-img',
        'src',
        'data:12345',
        'https://cdn.ampproject.org/c/acme.org/doc1'
      )
    ).to.equal('data:12345');
  });
});

describes.sandboxed('rewriteAttributesForElement', {}, () => {
  let location = 'https://pub.com/';
  it('should not modify `target` on publisher origin', () => {
    const element = document.createElement('a');
    element.setAttribute('href', '#hash');

    rewriteAttributesForElement(element, 'href', 'https://not.hash/', location);

    expect(element.getAttribute('href')).to.equal('https://not.hash/');
    expect(element.hasAttribute('target')).to.equal(false);
  });

  describe('on CDN origin', () => {
    beforeEach(() => {
      location = 'https://cdn.ampproject.org';
    });

    it('should set `target` when rewrite <a> from hash to non-hash', () => {
      const element = document.createElement('a');
      element.setAttribute('href', '#hash');

      rewriteAttributesForElement(
        element,
        'href',
        'https://not.hash/',
        location
      );

      expect(element.getAttribute('href')).to.equal('https://not.hash/');
      expect(element.getAttribute('target')).to.equal('_top');
    });

    it('should remove `target` when rewrite <a> from non-hash to hash', () => {
      const element = document.createElement('a');
      element.setAttribute('href', 'https://not.hash/');

      rewriteAttributesForElement(element, 'href', '#hash', location);

      expect(element.getAttribute('href')).to.equal('#hash');
      expect(element.hasAttribute('target')).to.equal(false);
    });
  });
});
