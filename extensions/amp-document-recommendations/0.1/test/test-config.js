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

import {assertConfig} from '../config';

describe('amp-document-recommendations config', () => {
  describe('assertConfig', () => {
    const host = 'example.com';

    it('allows a valid config', () => {
      const config = {
        recommendations: [{
          ampUrl: 'https://example.com/article1',
          image: 'https://example.com/image.png',
          title: 'Article 1',
        }],
      };
      expect(() => assertConfig(config, host)).to.not.throw();
    });

    it('allows a config with no recommendations', () => {
      const config = {recommendations: []};
      expect(() => assertConfig(config, host)).to.not.throw();
    });

    it('allows recommendations with relative URLs', () => {
      const config = {
        recommendations: [{
          ampUrl: '/article1',
          image: '/image.png',
          title: 'Article 1',
        }],
      };
      expect(() => assertConfig(config, document.location.host)).to.not.throw();
    });

    it('throws on null config', () => {
      allowConsoleError(() => {
        expect(() => assertConfig(null, host)).to.throw(
            'amp-document-recommendations config must be specified');
      });
    });

    it('throws on config with no "recommendations" key', () => {
      const config = {};
      allowConsoleError(() => {
        expect(() => assertConfig(config, host)).to.throw(
            'recommendations must be an array');
      });
    });

    it('throws on config with non-array "recommendations" key', () => {
      const config = {recommendations: {}};
      allowConsoleError(() => {
        expect(() => assertConfig(config, host)).to.throw(
            'recommendations must be an array');
      });
    });

    it('throws on config with missing recommendation title', () => {
      const config = {
        recommendations: [{
          ampUrl: 'https://example.com/article1',
          image: 'https://example.com/image.png',
        }],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(config, host)).to.throw(
            'title must be a string');
      });
    });

    it('throws on config with non-string recommendation title', () => {
      const config = {
        recommendations: [{
          ampUrl: 'https://example.com/article1',
          image: 'https://example.com/image.png',
          title: {},
        }],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(config, host)).to.throw(
            'title must be a string');
      });
    });

    it('throws on config with missing recommendation image', () => {
      const config = {
        recommendations: [{
          ampUrl: 'https://example.com/article1',
          title: 'Article 1',
        }],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(config, host)).to.throw(
            'image must be a string');
      });
    });

    it('throws on config with non-string recommendation image', () => {
      const config = {
        recommendations: [{
          ampUrl: 'https://example.com/article1',
          image: {},
          title: 'Article 1',
        }],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(config, host)).to.throw(
            'image must be a string');
      });
    });

    it('throws on config with recommendations from different domains', () => {
      const config = {
        recommendations: [
          {
            ampUrl: 'https://othersite.com/article1',
            image: 'https://othersite.com/image.png',
            title: 'Article 1',
          },
        ],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(config, host)).to.throw(
            'recommendations must be from the same host as the current' +
            ' document');
      });
    });

    it('throws on config with recommendations from different subdomains',
        () => {
          const config = {
            recommendations: [
              {
                ampUrl: 'https://www.example.com/article1',
                image: 'https://example.com/image.png',
                title: 'Article 1',
              },
            ],
          };
          allowConsoleError(() => {
            expect(() => assertConfig(config, host)).to.throw(
                'recommendations must be from the same host as the current' +
                ' document');
          });
        });

    it('throws on config with recommendations on different ports', () => {
      const config = {
        recommendations: [
          {
            ampUrl: 'https://example.com:8080/article1',
            image: 'https://example.com/image.png',
            title: 'Article 1',
          },
        ],
      };
      allowConsoleError(() => {
        expect(() => assertConfig(config, host)).to.throw(
            'recommendations must be from the same host as the current' +
            ' document');
      });
    });
  });
});
