import {Services} from '#service';

import {
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
  setMediaSession,
  validateMediaMetadata,
} from '../../src/mediasession-helper';
import {isProtocolValid} from '../../src/url';

const schemaTemplate = `
{
  "@context": "http://schema.org",
  "@type": "NewsArticle",
  "mainEntityOfPage": "something",
  "headline": "Something Happened",
  "datePublished": "Fri Jul 28 12:45:00 EDT 2017",
  "dateModified": "Fri Jul 28 12:45:00 EDT 2017",
  "description": "Appearantly, yesterday something happened",
  "author": {
    "@type": "Person",
    "name": "Awesome Author"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Aperture Science",
    "logo": {
      "@type": "ImageObject",
      "url": "logo-url",
      "width": 133,
      "height": 60
    }
  },
  "image": {
    "@type": "ImageObject",
    "url": "http://example.com/image.png",
    "height": 392,
    "width": 696
  }
}
`;

describes.sandboxed('MediaSessionAPI Helper Functions', {}, (env) => {
  let element;
  let ampdoc;
  let favicon;
  let schema;
  let ogImage;
  let head;

  beforeEach(() => {
    element = {};
    env.sandbox
      .stub(Services, 'urlForDoc')
      .withArgs(element)
      .returns({isProtocolValid});

    head = document.querySelector('head');
    // Favicon
    favicon = document.createElement('link');
    favicon.setAttribute('rel', 'icon');
    favicon.setAttribute('href', 'http://example.com/favicon.ico');
    head.appendChild(favicon);
    // Schema
    schema = document.createElement('script');
    schema.setAttribute('type', 'application/ld+json');
    schema.innerHTML = schemaTemplate;
    head.appendChild(schema);
    // og-image
    ogImage = document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    ogImage.setAttribute('content', 'http://example.com/og-image.png');
    head.appendChild(ogImage);
    ampdoc = {
      win: {
        'document': document,
        'navigator': {
          'mediaSession': {
            'metadata': {
              'artist': '',
              'album': '',
              'artwork': [],
              'title': '',
            },
            'setActionHandler': () => {},
          },
        },
        'MediaMetadata': Object,
      },
    };
  });

  afterEach(() => {
    head.removeChild(favicon);
    head.removeChild(schema);
    head.removeChild(ogImage);
  });

  it('should parse the schema and find the image', () => {
    expect(parseSchemaImage(ampdoc.win.document)).to.equal(
      'http://example.com/image.png'
    );
  });

  it('should parse the og-image', () => {
    expect(parseOgImage(ampdoc.win.document)).to.equal(
      'http://example.com/og-image.png'
    );
  });

  it('should parse the favicon', () => {
    expect(parseFavicon(ampdoc.win.document)).to.equal(
      'http://example.com/favicon.ico'
    );
  });

  it('should set the media session', () => {
    expect(ampdoc.win.navigator.mediaSession.metadata).to.deep.equal({
      'artist': '',
      'album': '',
      'artwork': [],
      'title': '',
    });
    const fakeMetaData = {
      'artist': 'Some artist',
      'album': 'Some album',
      'artwork': ['http://example.com/image.png'],
      'title': 'Some title',
    };
    setMediaSession(ampdoc.win, fakeMetaData);
    const newMetaData = ampdoc.win.navigator.mediaSession.metadata;
    expect(newMetaData).to.deep.equal(fakeMetaData);
  });

  it('validate correct metadata', () => {
    expect(() =>
      validateMediaMetadata(element, {
        'artist': 'Some artist',
        'album': 'Some album',
        'artwork': ['http://example.com/image.png'],
        'title': 'Some title',
      })
    ).to.not.throw();
  });

  it('should throw if artwork src is invalid - object', () => {
    const fakeMetaData = {
      'artist': '',
      'album': '',
      'artwork': [
        /*eslint no-script-url: 0*/
        {'src': 'javascript://alert(1)'},
      ],
      'title': '',
    };
    return allowConsoleError(() => {
      expect(() => {
        validateMediaMetadata(element, fakeMetaData);
      }).to.throw();
    });
  });

  it('should throw if artwork src is invalid - string', () => {
    const fakeMetaData = {
      'artist': '',
      'album': '',
      'artwork': [
        /*eslint no-script-url: 0*/
        'javascript://alert(1)',
      ],
      'title': '',
    };
    return allowConsoleError(() => {
      expect(() => {
        validateMediaMetadata(element, fakeMetaData);
      }).to.throw();
    });
  });

  it('should throw if artwork is not array', () => {
    const fakeMetaData = {
      'artist': '',
      'album': '',
      'artwork': 'https://NotArray',
      'title': '',
    };
    return allowConsoleError(() => {
      expect(() => {
        validateMediaMetadata(element, fakeMetaData);
      }).to.throw();
    });
  });
});
