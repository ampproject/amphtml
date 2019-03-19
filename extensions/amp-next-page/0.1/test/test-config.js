/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from '../../../../src/services';
import {assertConfig} from '../config';
import {parseUrlDeprecated} from '../../../../src/url-utils';

describe('amp-next-page config', () => {

  describes.sandboxed('assertConfig', {}, env => {
    const documentUrl = 'https://example.com/parent';
    const documentUrlCdn = 'https://example-com.cdn.ampproject.org/c/s/example.com/parent';

    beforeEach(() => {
      env.sandbox.stub(Services, 'urlForDoc').returns({
        parse: parseUrlDeprecated,
      });
    });

    it('allows a valid config', () => {
      const config = {
        pages: [{
          ampUrl: 'https://example.com/article1',
          image: 'https://example.com/image.png',
          title: 'Article 1',
        }],
        hideSelectors: [
          '.header',
          'footer',
        ],
      };
      expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
          .to.not.throw();
    });

    it('allows a config with no pages', () => {
      const config = {pages: []};
      expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
          .to.not.throw();
    });

    it('rewrites relative URLs to absolute', () => {
      const config = {
        pages: [{
          ampUrl: '/article1',
          image: '/image.png',
          title: 'Article 1',
        }],
      };
      expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
          .to.not.throw();
      expect(config.pages[0].ampUrl).to.equal(
          'https://example.com/article1');
    });

    it('rewrites relative URLs when served from the cache', () => {
      const config = {
        pages: [{
          ampUrl: '/article1',
          image: '/image.png',
          title: 'Article 1',
        }],
      };
      expect(() => assertConfig(/*ctx*/ null, config, documentUrlCdn))
          .to.not.throw();
      expect(config.pages[0].ampUrl).to.equal(
          'https://example-com.cdn.ampproject.org/c/s/example.com/article1');
    });

    it('rewrites canonical URLs when served from the cache', () => {
      const config = {
        pages: [
          {
            ampUrl: 'https://example-com.cdn.ampproject.org/c/s/example.com/art1',
            image: 'https://example.com/image.png',
            title: 'Article 1',
          },
          {
            ampUrl: 'https://example.com/art2?x=1',
            image: 'https://example.com/image.png',
            title: 'Article 1',
          },
        ],
      };
      expect(() => assertConfig(/*ctx*/ null, config, documentUrlCdn))
          .to.not.throw();
      expect(config.pages[0].ampUrl).to.equal(
          'https://example-com.cdn.ampproject.org/c/s/example.com/art1');
      expect(config.pages[1].ampUrl).to.equal(
          'https://example-com.cdn.ampproject.org/c/s/example.com/art2?x=1');
    });

    it('rewrites non-HTTPS canonical URLs when served from the cache', () => {
      const url = documentUrlCdn.replace('/s/', '/');
      const config = {
        pages: [
          {
            ampUrl: 'http://example.com/art2?x=1',
            image: 'http://example.com/image.png',
            title: 'Article 1',
          },
        ],
      };

      expect(() => assertConfig(/*ctx*/ null, config, url)).to.not.throw();

      expect(config.pages[0].ampUrl).to.equal(
          'https://example-com.cdn.ampproject.org/c/example.com/art2?x=1');
    });

    it('doesn\'t rewrite URLs if sourceOrigin and origin match', () => {
      const config = {
        pages: [
          {
            ampUrl: 'https://example.com/article',
            image: 'https://example.com/image.png',
            title: 'Article 1',
          },
        ],
      };
      expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
          .to.not.throw();
      expect(config.pages[0].ampUrl).to.equal('https://example.com/article');
    });

    it('throws on null config', () => {
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, null, documentUrl))
            .to.throw('amp-next-page config must be specified');
      });
    });

    it('throws on config with no "pages" key', () => {
      const config = {};
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
            .to.throw('pages must be an array');
      });
    });

    it('throws on config with non-array "pages" key', () => {
      const config = {pages: {}};
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
            .to.throw('pages must be an array');
      });
    });

    it('throws on config with missing recommendation title', () => {
      const config = {
        pages: [{
          ampUrl: 'https://example.com/article1',
          image: 'https://example.com/image.png',
        }],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
            .to.throw('title must be a string');
      });
    });

    it('throws on config with non-string recommendation title', () => {
      const config = {
        pages: [{
          ampUrl: 'https://example.com/article1',
          image: 'https://example.com/image.png',
          title: {},
        }],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
            .to.throw('title must be a string');
      });
    });

    it('throws on config with missing recommendation image', () => {
      const config = {
        pages: [{
          ampUrl: 'https://example.com/article1',
          title: 'Article 1',
        }],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
            .to.throw('image must be a string');
      });
    });

    it('throws on config with non-string recommendation image', () => {
      const config = {
        pages: [{
          ampUrl: 'https://example.com/article1',
          image: {},
          title: 'Article 1',
        }],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
            .to.throw('image must be a string');
      });
    });

    it('throws on config with pages from different domains', () => {
      const config = {
        pages: [
          {
            ampUrl: 'https://othersite.com/article1',
            image: 'https://othersite.com/image.png',
            title: 'Article 1',
          },
        ],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
            .to.throw(
                'pages must be from the same origin as the current document');
      });
    });

    it('throws on config with pages from different subdomains', () => {
      const config = {
        pages: [
          {
            ampUrl: 'https://www.example.com/article1',
            image: 'https://example.com/image.png',
            title: 'Article 1',
          },
        ],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
            .to.throw(
                'pages must be from the same origin as the current document');
      });
    });

    it('throws on config with pages on different ports', () => {
      const config = {
        pages: [
          {
            ampUrl: 'https://example.com:8080/article1',
            image: 'https://example.com/image.png',
            title: 'Article 1',
          },
        ],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
            .to.throw(
                'pages must be from the same origin as the current document');
      });
    });

    it('throws on config with non-array "hideSelectors" key', () => {
      const config = {
        pages: [],
        hideSelectors: {},
      };
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
            .to.throw('amp-next-page hideSelectors should be an array');
      });
    });

    it('throws for non-string hideSelector values', () => {
      const config = {
        pages: [],
        hideSelectors: ['a', 2],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
            .to.throw('amp-next-page hideSelector value should be a string: 2');
      });
    });

    it('throws for hideSelector values for i-amphtml selectors', () => {
      const config = {
        pages: [],
        hideSelectors: ['   .i-amphtml-something'],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
            .to.throw(/amp-next-page hideSelector .+ not allowed/);
      });
    });

    it('allows AdSense URLs which target the same origin', () => {
      const config = {
        pages: [{
          ampUrl: 'https://googleads.g.doubleclick.net/aclk?adurl=https://example.com/article',
          image: 'https://example.com/image.png',
          title: 'Article 1',
        }],
      };
      expect(() => assertConfig(/*ctx*/ null, config, documentUrl))
          .to.not.throw();
    });

    it('allows AdSense URLs which target the same CDN origin', () => {
      const config = {
        pages: [{
          ampUrl: 'https://googleads.g.doubleclick.net/aclk?adurl=https://example-com.cdn.ampproject.org/c/s/example.com/article',
          image: 'https://example.com/image.png',
          title: 'Article 1',
        }],
      };
      expect(() => assertConfig(/*ctx*/ null, config, documentUrlCdn))
          .to.not.throw();
    });

    it('throws for AdSense URLs which target different origins', () => {

      const config1 = {
        pages: [{
          ampUrl: 'https://googleads.g.doubleclick.net/aclk?adurl=https://other.com/article',
          image: 'https://example.com/image.png',
          title: 'Article 1',
        }],
      };
      const config2 = {
        pages: [{
          ampUrl: 'https://googleads.g.doubleclick.net/aclk?adurl=https://other-com.cdn.ampproject.org/c/s/example.com/article',
          image: 'https://example.com/image.png',
          title: 'Article 1',
        }],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, config1, documentUrl))
            .to.throw(
                'pages must be from the same origin as the current document');
      });
      allowConsoleError(() => {
        expect(() => assertConfig(/*ctx*/ null, config2, documentUrlCdn))
            .to.throw(
                'pages must be from the same origin as the current document');
      });
    });
  });
});
