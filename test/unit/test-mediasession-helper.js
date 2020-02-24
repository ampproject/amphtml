/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../src/services';
import {createIframePromise} from '../../testing/iframe';
import {installDocService} from '../../src/service/ampdoc-impl';
import {installDocumentInfoServiceForDoc} from '../../src/service/document-info-impl';

import {isProtocolValid} from '../../src/url';
import {
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
  setMediaSession,
} from '../../src/mediasession-helper';

const SCHEMA_TEMPLATE = `
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

describe
  .configure()
  .skipFirefox()
  .run('MediaSessionAPI Helper Functions', () => {
    let element;
    let favicon;
    let schema;
    let ogImage;
    let head;

    function getWin() {
      return createIframePromise().then(iframe => {
        window.sandbox
          .stub(Services, 'urlForDoc')
          .withArgs(element)
          .returns({isProtocolValid});

        head = iframe.doc.head;
        // Favicon
        favicon = iframe.doc.createElement('link');
        favicon.setAttribute('rel', 'icon');
        favicon.setAttribute('href', 'http://example.com/favicon.ico');
        head.appendChild(favicon);
        // Schema
        schema = iframe.doc.createElement('script');
        schema.setAttribute('type', 'application/ld+json');
        schema.innerHTML = SCHEMA_TEMPLATE;
        head.appendChild(schema);
        // og-image
        ogImage = iframe.doc.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        ogImage.setAttribute('content', 'http://example.com/og-image.png');
        head.appendChild(ogImage);

        const {win} = iframe;
        installDocService(win, /* isSingleDoc */ true);
        win.__AMP_SERVICES.documentInfo = null;
        win.MediaMetadata = window.MediaMetadata;
        installDocumentInfoServiceForDoc(win.document);
        return iframe.win;
      });
    }

    it('should parse the schema and find the image', () => {
      return getWin().then(win => {
        expect(parseSchemaImage(win.document)).to.equal(
          'http://example.com/image.png'
        );
      });
    });

    it('should parse the og-image', () => {
      return getWin().then(win => {
        expect(parseOgImage(win.document)).to.equal(
          'http://example.com/og-image.png'
        );
      });
    });

    it('should parse the favicon', () => {
      return getWin().then(win => {
        expect(parseFavicon(win.document)).to.equal(
          'http://example.com/favicon.ico'
        );
      });
    });

    it('should set the media session', () => {
      return getWin().then(win => {
        expect(win.navigator.mediaSession.metadata).to.equal(null);
        const fakeMetaData = {
          'artist': 'Some artist',
          'album': 'Some album',
          'artwork': [{'src': 'http://example.com/image.png'}],
          'title': 'Some title',
        };
        setMediaSession(element, win, fakeMetaData);
        const newMetaData = win.navigator.mediaSession.metadata;
        expect(newMetaData).to.deep.equal(new win.MediaMetadata(fakeMetaData));
      });
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
      return getWin().then(win => {
        return allowConsoleError(() => {
          expect(() => {
            setMediaSession(element, win, fakeMetaData);
          }).to.throw();
        });
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
      return getWin().then(win => {
        return allowConsoleError(() => {
          expect(() => {
            setMediaSession(element, win, fakeMetaData);
          }).to.throw();
        });
      });
    });

    it('should throw if artwork is not array', () => {
      const fakeMetaData = {
        'artist': '',
        'album': '',
        'artwork': 'https://NotArray',
        'title': '',
      };
      return getWin().then(win => {
        return allowConsoleError(() => {
          expect(() => {
            setMediaSession(element, win, fakeMetaData);
          }).to.throw();
        });
      });
    });
  });
