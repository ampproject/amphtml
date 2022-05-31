import {Services} from '#service';

import {
  extractArticleTags,
  extractElementTags,
  extractTags,
  extractTitle,
} from '../utils';

describes.realWin('amp-apester-media-utils', {amp: true}, (env) => {
  let window, document;

  beforeEach(() => {
    window = env.win;
    document = window.document;
    document.body.textContent = '';
    document.head.textContent = '';
  });
  afterEach(() => {
    // Clear cached AmpDoc meta since document is reused in each test
    Services.ampdoc(document).meta_ = null;
  });

  it('Extract element tags as empty array when there is no element', () => {
    const expected = [];
    const tags = extractElementTags();
    expect(tags).to.deep.equal(expected);
  });

  it('Extract element tags when tags are defined', () => {
    const expected = ['word1', 'word2', 'word3', 'word4'];
    const element = document.createElement('amp-apester-media');
    element.setAttribute('data-apester-tags', expected.join(','));
    const tags = extractElementTags(element);
    expect(tags).to.deep.equal(expected);
  });

  it('Extract element tags when tags are defined', () => {
    const expected = ['word1', 'word2', 'word3', 'word4'];
    const element = document.createElement('amp-apester-media');
    element.setAttribute('data-apester-tags', expected.join(','));
    const tags = extractElementTags(element);
    expect(tags).to.deep.equal(expected);
  });

  it('Extract title works well with no dl json', () => {
    const expected = [];
    const tags = extractTitle(document);
    expect(tags).to.deep.equal(expected);
  });

  it('Extract title works well with dl json', () => {
    const expected = ['Test', 'Apester', 'Units', 'here'];
    const element = document.createElement('script');
    element.setAttribute('type', 'application/ld+json');
    const jsonLd = `{
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "author": {
        "@type": "Person",
        "name": "Bla Bla"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Apester"
      },
      "headline": "Test Apester Units is nt here",
      "datePublished": "2018-03-28T19:24:00+02:00",
      "dateModified": "2018-03-28T19:24:00+02:00"
    }`;
    element.text = jsonLd;
    document.body.appendChild(element);
    const tags = extractTitle(document);
    expect(tags).to.deep.equal(expected);
  });

  it('Extract title cuts', () => {
    const expected = ['Test', 'Apester', 'Units', 'here', 'this'];
    const element = document.createElement('script');
    element.setAttribute('type', 'application/ld+json');
    const jsonLd = `{
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "author": {
        "@type": "Person",
        "name": "Bla Bla"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Apester"
      },
      "headline": "Test Apester Units is nt here this not visable ",
      "datePublished": "2018-03-28T19:24:00+02:00",
      "dateModified": "2018-03-28T19:24:00+02:00"
    }`;
    element.text = jsonLd;
    document.body.appendChild(element);
    const tags = extractTitle(document);
    expect(tags).to.deep.equal(expected);
  });

  it('Extract title works with few jsonLd', () => {
    const expected = ['Tag0', 'Tag1', 'Tag2'];
    for (let i = 0; i < 3; i++) {
      const element = document.createElement('script');
      element.setAttribute('type', 'application/ld+json');
      const jsonLd = `{
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "author": {
          "@type": "Person",
          "name": "Bla Bla"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Apester"
        },
        "headline": "Tag${i} ",
        "datePublished": "2018-03-28T19:24:00+02:00",
        "dateModified": "2018-03-28T19:24:00+02:00"
      }`;
      element.text = jsonLd;
      document.body.appendChild(element);
    }

    const tags = extractTitle(document);
    expect(tags).to.deep.equal(expected);
  });

  it('Should return empty array if there is no meta tags', () => {
    const expected = [];
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'keywords');
    meta.setAttribute('content', '');
    document.head.appendChild(meta);
    const ampdoc = Services.ampdoc(document);
    const tags = extractArticleTags(ampdoc);
    expect(tags).to.deep.equal(expected);
  });

  it('Should not return array with meta tags', () => {
    const expected = [];
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'keywords');
    meta.setAttribute('content', '');
    document.head.appendChild(meta);
    const ampdoc = Services.ampdoc(document);
    const tags = extractArticleTags(ampdoc);
    expect(tags).to.deep.equal(expected);
  });

  it('Should return array with meta tags', () => {
    const expected = ['this is', 'the', 'tag'];
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'keywords');
    meta.setAttribute('content', 'this is, the, tag');
    document.head.appendChild(meta);
    const ampdoc = Services.ampdoc(document);
    const tags = extractArticleTags(ampdoc);
    expect(tags).to.deep.equal(expected);
  });

  it('Should not extract title when there is meta keywords', () => {
    const expected = [
      'sport',
      'eddie jones',
      'england rugby union team',
      'argentina rugby union team',
      'rugby union',
    ];
    const element = document.createElement('amp-apester-media');
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'keywords');
    meta.setAttribute(
      'content',
      'sport,Eddie Jones,England Rugby Union Team,' +
        'Argentina Rugby Union Team,Rugby Union'
    );
    document.head.appendChild(meta);

    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('type', 'application/ld+json');
    const jsonLd = `{
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "author": {
        "@type": "Person",
        "name": "Bla Bla"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Apester"
      },
      "headline": "Test Apester Units is nt here this not visable ",
      "datePublished": "2018-03-28T19:24:00+02:00",
      "dateModified": "2018-03-28T19:24:00+02:00"
    }`;
    scriptElement.text = jsonLd;
    document.body.appendChild(scriptElement);

    const ampdoc = Services.ampdoc(document);
    const tags = extractTags(ampdoc, element);
    expect(tags).to.deep.equal(expected);
  });

  it('Should extract title when there is no meta keywords', () => {
    const expected = ['test', 'apester', 'units'];
    const element = document.createElement('amp-apester-media');
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'keywords');
    meta.setAttribute('content', '');
    document.head.appendChild(meta);

    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('type', 'application/ld+json');
    const jsonLd = `{
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "author": {
        "@type": "Person",
        "name": "Bla Bla"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Apester"
      },
      "headline": "Test Apester Units ",
      "datePublished": "2018-03-28T19:24:00+02:00",
      "dateModified": "2018-03-28T19:24:00+02:00"
    }`;
    scriptElement.text = jsonLd;
    document.body.appendChild(scriptElement);

    const ampdoc = Services.ampdoc(document);
    const tags = extractTags(ampdoc, element);
    expect(tags).to.deep.equal(expected);
  });
});
