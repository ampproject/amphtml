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

import {AmpStoryBookend} from '../bookend/amp-story-bookend';
import {AmpStoryRequestService} from '../amp-story-request-service';
import {AmpStoryStoreService} from '../amp-story-store-service';
import {ArticleComponent} from '../bookend/components/article';
import {CtaLinkComponent} from '../bookend/components/cta-link';
import {LandscapeComponent} from '../bookend/components/landscape';
import {LocalizationService} from '../localization';
import {PortraitComponent} from '../bookend/components/portrait';
import {TextBoxComponent} from '../bookend/components/text-box';
import {createElementWithAttributes} from '../../../../src/dom';
import {registerServiceBuilder} from '../../../../src/service';
import {user} from '../../../../src/log';

describes.realWin('amp-story-bookend', {
  amp: {
    runtimeOn: true,
    extensions: ['amp-story:1.0'],
  },
}, env => {
  let win;
  let storyElem;
  let bookend;
  let bookendElem;

  const expectedComponents = [
    {
      'type': 'heading',
      'text': 'My Heading Title!',
    },
    {
      'type': 'small',
      'title': 'This is an example article',
      'domainName': 'example.com',
      'url': 'http://example.com/article.html',
      'image': 'http://placehold.it/256x128',
    },
    {
      'type': 'portrait',
      'title': 'This is an example article',
      'category': 'This is an example article',
      'domainName': 'example.com',
      'url': 'http://example.com/article.html',
      'image': 'http://placehold.it/256x128',
    },
    {
      'type': 'cta-link',
      'links': [
        {
          'text': 'buttonA',
          'url': 'google.com',
        },
        {
          'text': 'buttonB',
          'url': 'google.com',
        },
        {
          'text': 'longtext longtext longtext longtext longtext',
          'url': 'google.com',
        },
      ],
    },
    {
      'type': 'landscape',
      'title': 'TRAPPIST-1 Planets May Still Be Wet Enough for Life',
      'domainName': 'example.com',
      'url': 'http://example.com/article.html',
      'category': 'astronomy',
      'image': 'http://placehold.it/256x128',
    },
    {
      'type': 'textbox',
      'text': [
        'Food by Enrique McPizza',
        'Choreography by Gabriel Filly',
        'Script by Alan Ecma S.',
        'Direction by Jon Tarantino',
      ],
    },
  ];

  const metadata = {
    '@context': 'http://schema.org',
    '@type': 'NewsArticle',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': './bookend.html',
    },
    'headline': 'My Story',
    'image': ['http://placehold.it/420x740'],
    'datePublished': '2018-01-01T00:00:00+00:00',
    'dateModified': '2018-01-01T00:00:00+00:00',
    'author': {
      '@type': 'Organization',
      'name': 'AMP Project',
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'AMP Project',
      'logo': {
        '@type': 'ImageObject',
        'url': 'http://placehold.it/128x128',
      },
    },
    'description': 'My Story',
  };

  beforeEach(() => {
    win = env.win;
    storyElem = win.document.createElement('amp-story');
    storyElem.appendChild(win.document.createElement('amp-story-page'));
    win.document.body.appendChild(storyElem);
    bookendElem = createElementWithAttributes(win.document,
        'amp-story-bookend', {'layout': 'nodisplay'});
    storyElem.appendChild(bookendElem);

    const requestService = new AmpStoryRequestService(win, storyElem);
    registerServiceBuilder(win, 'story-request', () => requestService);

    const storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', () => storeService);

    const localizationService = new LocalizationService(win);
    registerServiceBuilder(win, 'localization', () => localizationService);

    bookend = new AmpStoryBookend(bookendElem);

    // Force sync mutateElement.
    sandbox.stub(bookend, 'mutateElement').callsArg(0);
  });

  it('should build the users json', () => {
    const userJson = {
      'bookend-version': 'v1.0',
      'share-providers': [
        'email',
        {'provider': 'facebook', 'app_id': '254325784911610'},
        'whatsapp',
      ],
      'components': [
        {
          'type': 'heading',
          'text': 'My Heading Title!',
        },
        {
          'type': 'small',
          'title': 'This is an example article',
          'url': 'http://example.com/article.html',
          'image': 'http://placehold.it/256x128',
        },
        {
          'type': 'portrait',
          'title': 'This is an example article',
          'category': 'This is an example article',
          'url': 'http://example.com/article.html',
          'image': 'http://placehold.it/256x128',
        },
        {
          'type': 'cta-link',
          'links': [
            {
              'text': 'buttonA',
              'url': 'google.com',
            },
            {
              'text': 'buttonB',
              'url': 'google.com',
            },
            {
              'text': 'longtext longtext longtext longtext longtext',
              'url': 'google.com',
            },
          ],
        },
        {
          'type': 'landscape',
          'title': 'TRAPPIST-1 Planets May Still Be Wet Enough for Life',
          'url': 'http://example.com/article.html',
          'category': 'astronomy',
          'image': 'http://placehold.it/256x128',
        },
        {
          'type': 'textbox',
          'text': [
            'Food by Enrique McPizza',
            'Choreography by Gabriel Filly',
            'Script by Alan Ecma S.',
            'Direction by Jon Tarantino',
          ],
        },
      ],
    };

    sandbox.stub(bookend, 'getStoryMetadata_').returns(metadata);
    sandbox.stub(bookend.requestService_, 'loadBookendConfig')
        .resolves(userJson);

    bookend.build();
    return bookend.loadConfigAndMaybeRenderBookend().then(config => {
      config.components.forEach((currentComponent, index) => {
        return expect(currentComponent).to.deep
            .equal(expectedComponents[index]);
      });
    });
  });

  it('should build the users json with share-providers alternative', () => {
    const userJson = {
      'bookend-version': 'v1.0',
      'share-providers': [
        'email',
        {'provider': 'facebook', 'app_id': '254325784911610'},
        {'provider': 'whatsapp'},
      ],
      'components': [
        {
          'type': 'heading',
          'text': 'My Heading Title!',
        },
        {
          'type': 'small',
          'title': 'This is an example article',
          'url': 'http://example.com/article.html',
          'image': 'http://placehold.it/256x128',
        },
        {
          'type': 'portrait',
          'title': 'This is an example article',
          'category': 'This is an example article',
          'domainName': 'example.com',
          'url': 'http://example.com/article.html',
          'image': 'http://placehold.it/256x128',
        },
        {
          'type': 'cta-link',
          'links': [
            {
              'text': 'buttonA',
              'url': 'google.com',
            },
            {
              'text': 'buttonB',
              'url': 'google.com',
            },
            {
              'text': 'longtext longtext longtext longtext longtext',
              'url': 'google.com',
            },
          ],
        },
        {
          'type': 'landscape',
          'title': 'TRAPPIST-1 Planets May Still Be Wet Enough for Life',
          'url': 'http://example.com/article.html',
          'category': 'astronomy',
          'image': 'http://placehold.it/256x128',
        },
        {
          'type': 'textbox',
          'text': [
            'Food by Enrique McPizza',
            'Choreography by Gabriel Filly',
            'Script by Alan Ecma S.',
            'Direction by Jon Tarantino',
          ],
        },
      ],
    };

    sandbox.stub(bookend, 'getStoryMetadata_').returns(metadata);
    sandbox.stub(bookend.requestService_, 'loadBookendConfig')
        .resolves(userJson);

    bookend.build();
    return bookend.loadConfigAndMaybeRenderBookend().then(config => {
      config.components.forEach((currentComponent, index) => {
        return expect(currentComponent).to.deep
            .equal(expectedComponents[index]);
      });
    });
  });

  it('should build the users share providers', () => {
    const userJson = {
      'bookend-version': 'v1.0',
      'share-providers': [
        'email',
        {'provider': 'facebook', 'app_id': '254325784911610'},
        {'provider': 'twitter', 'text': 'This is custom share text that I' +
            ' would like for the Twitter platform'},
        'whatsapp',
      ],
      'components': [
        {
          'type': 'heading',
          'text': 'My Heading Title!',
        },
        {
          'type': 'small',
          'title': 'This is an example article',
          'url': 'http://example.com/article.html',
          'image': 'http://placehold.it/256x128',
        },
      ],
    };

    const expectedShareProviders = [
      'email',
      {'provider': 'facebook', 'app_id': '254325784911610'},
      {'provider': 'twitter', 'text': 'This is custom share text that I ' +
          'would like for the Twitter platform'},
      'whatsapp',
    ];

    sandbox.stub(bookend, 'getStoryMetadata_').returns(metadata);
    sandbox.stub(bookend.requestService_, 'loadBookendConfig')
        .resolves(userJson);

    bookend.build();
    return bookend.loadConfigAndMaybeRenderBookend().then(config => {
      config['share-providers'].forEach((currProvider, index) => {
        return expect(currProvider).to.deep
            .equal(expectedShareProviders[index]);
      });
    });
  });

  it('should ignore empty share providers', () => {
    const userJson = {
      'bookend-version': 'v1.0',
      'share-providers': [],
      'components': [
        {
          'type': 'heading',
          'text': 'My Heading Title!',
        },
        {
          'type': 'small',
          'title': 'This is an example article',
          'url': 'http://example.com/article.html',
          'image': 'http://placehold.it/256x128',
        },
      ],
    };

    sandbox.stub(bookend, 'getStoryMetadata_').returns(metadata);
    sandbox.stub(bookend.requestService_, 'loadBookendConfig')
        .resolves(userJson);

    bookend.build();
    return bookend.loadConfigAndMaybeRenderBookend().then(config => {
      return expect(config['share-providers']).to.deep.equal([]);
    });
  });

  it('should warn when trying to use system sharing', () => {
    const userJson = {
      'bookend-version': 'v1.0',
      'share-providers': ['system'],
      'components': [
        {
          'type': 'heading',
          'text': 'My Heading Title!',
        },
        {
          'type': 'small',
          'title': 'This is an example article',
          'url': 'http://example.com/article.html',
          'image': 'http://placehold.it/256x128',
        },
      ],
    };

    const userWarnStub = sandbox.stub(user(), 'warn');

    sandbox.stub(bookend, 'getStoryMetadata_').returns(metadata);
    sandbox.stub(bookend.requestService_, 'loadBookendConfig')
        .resolves(userJson);

    bookend.build();
    return bookend.loadConfigAndMaybeRenderBookend().then(() => {
      expect(userWarnStub).to.be.calledOnce;
      expect(userWarnStub.args[0][1]).to.be.equal('`system` is not a valid ' +
      'share provider type. Native sharing is ' +
      'enabled by default and cannot be turned off.');
    });
  });

  it('should reject invalid user json for article', () => {
    const articleComponent = new ArticleComponent();
    const userJson = {
      'bookend-version': 'v1.0',
      'share-providers': [
        'email',
        {'provider': 'facebook', 'app_id': '254325784911610'},
        'whatsapp',
      ],
      'components': [
        {
          'type': 'heading',
          'title': 'test',
        },
        {
          'type': 'small',
          'url': 'http://example.com/article.html',
          'image': 'http://placehold.it/256x128',
        },
      ],
    };

    allowConsoleError(() => {
      expect(() => articleComponent.assertValidity(userJson)).to.throw(
          'Small article component must contain `title`, `url` fields, ' +
          'skipping invalid.​​​');
    });
  });

  it('should reject invalid user json for portrait article', () => {
    const portraitComponant = new PortraitComponent();
    const userJson = {
      'bookend-version': 'v1.0',
      'share-providers': [
        'email',
        {'provider': 'facebook', 'app_id': '254325784911610'},
        'whatsapp',
      ],
      'components': [
        {
          'type': 'portrait',
          'category': 'sample',
          'url': 'http://example.com/article.html',
          'image': 'http://placehold.it/256x128',
        },
      ],
    };

    allowConsoleError(() => {
      expect(() => portraitComponant.assertValidity(userJson)).to.throw(
          'Portrait component must contain `title`, `image`, ' +
          '`url` fields, skipping invalid.');
    });
  });

  it('should reject invalid user json for the cta links component', () => {
    const ctaLinkComponent = new CtaLinkComponent();
    const userJson = {
      'bookend-version': 'v1.0',
      'share-providers': [
        'email',
        {'provider': 'facebook', 'app_id': '254325784911610'},
        'whatsapp',
      ],
      'components': [
        {
          'type': 'heading',
          'title': 'test',
        },
        {
          'type': 'small',
          'url': 'http://example.com/article.html',
          'image': 'http://placehold.it/256x128',
        },
        {
          'type': 'cta-link',
          'links': [],
        },
      ],
    };

    allowConsoleError(() => {
      expect(() => ctaLinkComponent.assertValidity(userJson)).to.throw(
          'CTA link component must be an array ' +
          'and contain at least one link inside it.');
    });
  });

  it('should reject invalid user json for a landscape component', () => {
    const landscapeComponent = new LandscapeComponent();
    const userJson = {
      'bookend-version': 'v1.0',
      'share-providers': [
        'email',
        {'provider': 'facebook', 'app_id': '254325784911610'},
        'whatsapp',
      ],
      'components': [
        {
          'type': 'heading',
          'title': 'test',
        },
        {
          'type': 'small',
          'url': 'http://example.com/article.html',
          'image': 'http://placehold.it/256x128',
        },
        {
          'type': 'landscape',
          'url': 'http://example.com/article.html',
          'category': 'astronomy',
          'image': 'http://placehold.it/256x128',
        },
      ],
    };

    allowConsoleError(() => {
      expect(() => landscapeComponent.assertValidity(userJson)).to.throw(
          'Landscape component must contain `title`, `image`, ' +
          '`url` fields, skipping invalid.');
    });
  });

  it('should reject invalid user json for a textbox component', () => {
    const textBoxComponent = new TextBoxComponent();
    const userJson = {
      'bookend-version': 'v1.0',
      'share-providers': [
        'email',
        {'provider': 'facebook', 'app-id': '254325784911610'},
        'whatsapp',
      ],
      'components': [
        {
          'type': 'heading',
          'title': 'test',
        },
        {
          'type': 'small',
          'url': 'http://example.com/article.html',
          'image': 'http://placehold.it/256x128',
        },
        {
          'type': 'textbox',
          'text': 'http://example.com/article.html',
        },
      ],
    };

    allowConsoleError(() => {
      expect(() => textBoxComponent.assertValidity(userJson)).to.throw(
          'Textbox component must contain ' +
          '`text` array and at least one element inside it, ' +
          'skipping invalid.');
    });
  });
});
