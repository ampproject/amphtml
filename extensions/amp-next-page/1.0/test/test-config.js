import {Page} from '../page';
import {validatePage} from '../utils';

describes.sandboxed('amp-next-page config', {}, () => {
  const documentUrl = 'https://example.com/parent';
  const documentUrlCdn =
    'https://example-com.cdn.ampproject.org/c/s/example.com/parent';

  it('rewrites relative URLs to absolute', () => {
    const page = new Page(null, {
      url: '/article1',
      image: '/image.png',
      title: 'Article 1',
    });
    expect(() => validatePage(page, documentUrl)).to.not.throw();
    expect(page.url).to.equal('https://example.com/article1');
  });

  it('rewrites relative URLs when served from the cache', () => {
    const page = new Page(null, {
      url: '/article1',
      image: '/image.png',
      title: 'Article 1',
    });
    expect(() => validatePage(page, documentUrlCdn)).to.not.throw();
    expect(page.url).to.equal(
      'https://example-com.cdn.ampproject.org/c/s/example.com/article1'
    );
  });

  it('rewrites canonical URLs when served from the cache', () => {
    const page = new Page(null, {
      url: 'https://example.com/art2?x=1',
      image: '/image.png',
      title: 'Article 1',
    });
    expect(() => validatePage(page, documentUrlCdn)).to.not.throw();
    expect(page.url).to.equal(
      'https://example-com.cdn.ampproject.org/c/s/example.com/art2?x=1'
    );

    const pageWithCdn = new Page(null, {
      url: 'https://example-com.cdn.ampproject.org/c/s/example.com/art1',
      image: '/image.png',
      title: 'Article 1',
    });
    expect(() => validatePage(pageWithCdn, documentUrlCdn)).to.not.throw();
    expect(pageWithCdn.url).to.equal(
      'https://example-com.cdn.ampproject.org/c/s/example.com/art1'
    );
  });

  it('rewrites non-HTTPS canonical URLs when served from the cache', () => {
    const url = documentUrlCdn.replace('/s/', '/');

    const page = new Page(null, {
      url: 'http://example.com/art2?x=1',
      image: '/image.png',
      title: 'Article 1',
    });
    expect(() => validatePage(page, url)).to.not.throw();
    expect(page.url).to.equal(
      'https://example-com.cdn.ampproject.org/c/example.com/art2?x=1'
    );
  });

  it("doesn't rewrite URLs if sourceOrigin and origin match", () => {
    const page = new Page(null, {
      url: 'https://example.com/article',
      image: '/image.png',
      title: 'Article 1',
    });
    expect(() => validatePage(page, documentUrl)).to.not.throw();
    expect(page.url).to.equal('https://example.com/article');
  });

  it('throws on config with missing page title', () => {
    const page = new Page(null, {
      url: 'https://example.com/article',
      image: '/image.png',
    });

    allowConsoleError(() => {
      expect(() => validatePage(page, documentUrl)).to.throw(
        'title must be a string'
      );
    });
  });

  it('throws on config with non-string page title', () => {
    const page = new Page(null, {
      url: 'https://example.com/article',
      image: '/image.png',
      title: {},
    });

    allowConsoleError(() => {
      expect(() => validatePage(page, documentUrl)).to.throw(
        'title must be a string'
      );
    });
  });

  it('throws on config with missing page image', () => {
    const page = new Page(null, {
      url: 'https://example.com/article',
      title: 'Article 1',
    });

    allowConsoleError(() => {
      expect(() => validatePage(page, documentUrl)).to.throw(
        'image must be a string'
      );
    });
  });

  it('throws on config with non-string recommendation image', () => {
    const page = new Page(null, {
      url: 'https://example.com/article',
      image: {},
      title: 'Article 1',
    });

    allowConsoleError(() => {
      expect(() => validatePage(page, documentUrl)).to.throw(
        'image must be a string'
      );
    });
  });

  it('throws on config with pages from different domains', () => {
    const page = new Page(null, {
      url: 'https://othersite.com/article1',
      image: 'https://othersite.com/image.png',
      title: 'Article 1',
    });

    allowConsoleError(() => {
      expect(() => validatePage(page, documentUrl)).to.throw(
        'pages must be from the same origin as the current document'
      );
    });
  });

  it('throws on config with pages from different subdomains', () => {
    const page = new Page(null, {
      url: 'https://www.example.com/article1',
      image: 'https://example.com/image.png',
      title: 'Article 1',
    });

    allowConsoleError(() => {
      expect(() => validatePage(page, documentUrl)).to.throw(
        'pages must be from the same origin as the current document'
      );
    });
  });

  it('throws on config with pages on different ports', () => {
    const page = new Page(null, {
      url: 'https://example.com:8080/article1',
      image: 'https://example.com/image.png',
      title: 'Article 1',
    });

    allowConsoleError(() => {
      expect(() => validatePage(page, documentUrl)).to.throw(
        'pages must be from the same origin as the current document'
      );
    });
  });
});
