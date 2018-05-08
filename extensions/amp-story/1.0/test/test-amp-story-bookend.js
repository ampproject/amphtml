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

import {AmpStory} from '../amp-story';
import {ArticleComponent} from '../bookend/components/article';
import {Bookend} from '../bookend/amp-story-bookend';
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
  let story;

  const expectedComponents = [
    {
      'type': 'article-set-title',
      'heading': 'test',
    },
    {
      'type': 'small',
      'title': 'This is an example article',
      'domainName': 'example.com',
      'url': 'http://example.com/article.html',
      'image': 'http://placehold.it/256x128',
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
    story = new AmpStory(storyElem);
    bookend = new Bookend(win, story.element);
  });

  it('should build the users json', () => {
    const userJson = {
      'bookend-version': 'v1.0',
      'share-providers': [
        'email',
        {'provider': 'facebook', 'app-id': '254325784911610'},
        'whatsapp',
      ],
      'components': [
        {
          'type': 'article-set-title',
          'title': 'test',
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
    return bookend.loadConfig().then(config => {
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
        {'provider': 'facebook', 'app-id': '254325784911610'},
        {'provider': 'whatsapp'},
      ],
      'components': [
        {
          'type': 'article-set-title',
          'title': 'test',
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
    return bookend.loadConfig().then(config => {
      config.components.forEach((currentComponent, index) => {
        return expect(currentComponent).to.deep
            .equal(expectedComponents[index]);
      });
    });
  });

  it('should reject invalid user json for article', () => {
    const articleComponent = new ArticleComponent();
    const userJson = {
      'bookend-version': 'v1.0',
      'share-providers': [
        'email',
        {'provider': 'facebook', 'app-id': '254325784911610'},
        'whatsapp',
      ],
      'components': [
        {
          'type': 'article-set-title',
          'title': 'test',
        },
        {
          'type': 'small',
          'url': 'http://example.com/article.html',
          'image': 'http://placehold.it/256x128',
        },
      ],
    };

    const userErrLogSpy = sandbox.spy(user(), 'error');

    allowConsoleError(() => {
      articleComponent.assertValidity(userJson);
      expect(userErrLogSpy).to.be.calledOnce;
      expect(userErrLogSpy.getCall(0).args[1]).to.have.string(
          'Articles must contain `title` and `url` fields, skipping invalid.');
    });
  });
});
