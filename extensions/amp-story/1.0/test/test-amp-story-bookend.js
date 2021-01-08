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

import {Action} from '../amp-story-store-service';
import {AmpStoryBookend} from '../bookend/amp-story-bookend';
import {AmpStoryRequestService} from '../amp-story-request-service';
import {AnalyticsVariable, getVariableService} from '../variable-service';
import {ArticleComponent} from '../bookend/components/article';
import {CtaLinkComponent} from '../bookend/components/cta-link';
import {LandscapeComponent} from '../bookend/components/landscape';
import {LocalizationService} from '../../../../src/service/localization';
import {PortraitComponent} from '../bookend/components/portrait';
import {Services} from '../../../../src/services';
import {StoryAnalyticsEvent, getAnalyticsService} from '../story-analytics';
import {TextBoxComponent} from '../bookend/components/text-box';
import {createElementWithAttributes} from '../../../../src/dom';
import {user} from '../../../../src/log';

const location =
  'https://www.testorigin.com/amp-stories/example/path/google.com';

describes.fakeWin('amp-story-bookend', {win: {location}, amp: true}, (env) => {
  let win;
  let doc;
  let storyElem;
  let bookend;
  let bookendElem;
  let requestService;
  let analytics;
  let analyticsVariables;

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
    doc = win.document;
    const localizationService = new LocalizationService(win.document.body);
    env.sandbox
      .stub(Services, 'localizationForDoc')
      .returns(localizationService);
    storyElem = doc.createElement('amp-story');
    storyElem.appendChild(doc.createElement('amp-story-page'));
    doc.body.appendChild(storyElem);
    bookendElem = createElementWithAttributes(doc, 'amp-story-bookend', {
      'layout': 'nodisplay',
    });
    storyElem.appendChild(bookendElem);

    requestService = new AmpStoryRequestService(win, storyElem);
    env.sandbox.stub(Services, 'storyRequestService').returns(requestService);

    bookend = new AmpStoryBookend(bookendElem);
    bookend.buildCallback();

    analytics = getAnalyticsService(win);
    analyticsVariables = getVariableService(win);

    // Force sync mutateElement.
    env.sandbox.stub(bookend, 'mutateElement').callsArg(0);
    env.sandbox.stub(bookend, 'getStoryMetadata_').returns(metadata);
  });

  it('should build the users json', async () => {
    const userJson = {
      'bookendVersion': 'v1.0',
      'shareProviders': [
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

    env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

    bookend.build();
    const config = await bookend.loadConfigAndMaybeRenderBookend();
    config.components.forEach((currentComponent, index) => {
      expect(currentComponent).to.deep.equal(expectedComponents[index]);
    });
  });

  it('should build the users json with share providers alternative', async () => {
    const userJson = {
      'bookendVersion': 'v1.0',
      'shareProviders': [
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

    env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

    bookend.build();
    const config = await bookend.loadConfigAndMaybeRenderBookend();
    config.components.forEach((currentComponent, index) => {
      expect(currentComponent).to.deep.equal(expectedComponents[index]);
    });
  });

  it('should build the users share providers', async () => {
    const userJson = {
      'bookendVersion': 'v1.0',
      'shareProviders': [
        'email',
        {'provider': 'facebook', 'app_id': '254325784911610'},
        {
          'provider': 'twitter',
          'text':
            'This is custom share text that I' +
            ' would like for the Twitter platform',
        },
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
      {
        'provider': 'twitter',
        'text':
          'This is custom share text that I ' +
          'would like for the Twitter platform',
      },
      'whatsapp',
    ];

    env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

    bookend.build();
    const config = await bookend.loadConfigAndMaybeRenderBookend();
    config['shareProviders'].forEach((currProvider, index) => {
      expect(currProvider).to.deep.equal(expectedShareProviders[index]);
    });
  });

  it('should ignore empty share providers', async () => {
    const userJson = {
      'bookendVersion': 'v1.0',
      'shareProviders': [],
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

    env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

    bookend.build();
    const config = await bookend.loadConfigAndMaybeRenderBookend();
    expect(config['shareProviders']).to.deep.equal([]);
  });

  it('should warn when trying to use system sharing', async () => {
    const userJson = {
      'bookendVersion': 'v1.0',
      'shareProviders': ['system'],
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

    const userWarnStub = env.sandbox.stub(user(), 'warn');

    env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

    bookend.build();
    await bookend.loadConfigAndMaybeRenderBookend();
    expect(userWarnStub).to.be.calledOnce;
    expect(userWarnStub.args[0][1]).to.be.equal(
      '`system` is not a valid ' +
        'share provider type. Native sharing is ' +
        'enabled by default and cannot be turned off.'
    );
  });

  it('should reject invalid user json for a textbox component', () => {
    const textBoxComponent = new TextBoxComponent();
    const userJson = {
      'bookendVersion': 'v1.0',
      'shareProviders': [
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
          'skipping invalid.'
      );
    });
  });

  it('should have a button to re-prompt the consent if story has one', () => {
    const consentId = 'CONSENT_ID';
    bookend.storeService_.dispatch(Action.SET_CONSENT_ID, consentId);

    bookend.build();

    const promptButtonEl = bookend
      .getShadowRoot()
      .querySelector(`[on="tap:${consentId}.prompt"]`);

    expect(promptButtonEl).to.exist;
  });

  it('should not have a button to re-prompt the consent by default', () => {
    bookend.build();

    // No element with an "on" attribute ending with ".prompt".
    const promptButtonEl = bookend
      .getShadowRoot()
      .querySelector('[on$=".prompt"]');

    expect(promptButtonEl).to.be.null;
  });

  it('should skip invalid component name and continue building', async () => {
    const userJson = {
      'bookendVersion': 'v1.0',
      'shareProviders': [
        'email',
        {'provider': 'facebook', 'app-id': '254325784911610'},
        'whatsapp',
      ],
      'components': [
        {
          'type': 'invalid-type',
          'title': 'test',
        },
        {
          'type': 'small',
          'title': 'This is an example article',
          'domainName': 'example.com',
          'url': 'http://example.com/article.html',
          'image': 'http://placehold.it/256x128',
        },
      ],
    };

    env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

    bookend.build();
    expectAsyncConsoleError(
      /[Component `invalid-type` is not supported. Skipping invalid]/
    );

    const config = await bookend.loadConfigAndMaybeRenderBookend();
    // Still builds rest of valid components.

    // We use config.components[1] because config.components[0] is a heading
    // that we prepend when there is no heading present in the user config.
    expect(config.components[1]).to.deep.equal(userJson.components[1]);
  });

  it('should not add a heading component when there are no components', async () => {
    const userJson = {
      'bookendVersion': 'v1.0',
      'shareProviders': [
        'email',
        {'provider': 'facebook', 'app_id': '254325784911610'},
        'whatsapp',
      ],
      'components': [],
    };

    env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

    bookend.build();
    const config = await bookend.loadConfigAndMaybeRenderBookend();
    expect(config.components.length).to.equal(0);
  });

  describe('analytics', () => {
    it('should fire analytics event when clicking on a link', async () => {
      const userJson = {
        'bookendVersion': 'v1.0',
        'shareProviders': [
          'email',
          {'provider': 'facebook', 'app_id': '254325784911610'},
          'whatsapp',
        ],
        'components': [
          {
            'type': 'cta-link',
            'links': [
              {
                'text': 'buttonA',
                'url': 'google.com',
                'amphtml': true,
              },
            ],
          },
        ],
      };

      env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);
      const analyticsSpy = env.sandbox.spy(analytics, 'triggerEvent');

      bookend.build();
      await bookend.loadConfigAndMaybeRenderBookend();
      const ctaLinks = bookend.bookendEl_.querySelector(
        '.i-amphtml-story-bookend-cta-link-wrapper'
      );
      ctaLinks.children[0].onclick = function (e) {
        e.preventDefault(); // Make the test not actually navigate.
      };
      ctaLinks.children[0].click();

      expect(analyticsSpy).to.have.been.calledWith(
        StoryAnalyticsEvent.BOOKEND_CLICK
      );
      expect(
        analyticsVariables.get()[AnalyticsVariable.BOOKEND_TARGET_HREF]
      ).to.equal(
        'https://www.testorigin.com/amp-stories/example/path/google.com'
      );
      expect(
        analyticsVariables.get()[AnalyticsVariable.BOOKEND_COMPONENT_TYPE]
      ).to.equal('cta-link');
      expect(
        analyticsVariables.get()[AnalyticsVariable.BOOKEND_COMPONENT_POSITION]
      ).to.equal(1);
    });

    it('should not fire analytics event when clicking non-clickable components', async () => {
      const userJson = {
        'bookendVersion': 'v1.0',
        'shareProviders': [
          'email',
          {'provider': 'facebook', 'app_id': '254325784911610'},
          'whatsapp',
        ],
        'components': [
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

      env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);
      const analyticsSpy = env.sandbox.spy(analytics, 'triggerEvent');

      bookend.build();
      await bookend.loadConfigAndMaybeRenderBookend();
      const textEl = bookend.bookendEl_.querySelector(
        '.i-amphtml-story-bookend-text'
      );

      textEl.click();

      expect(analyticsSpy).to.not.have.been.called;
    });

    it('should forward the correct target when clicking on an element', async () => {
      const userJson = {
        'bookendVersion': 'v1.0',
        'shareProviders': [
          'email',
          {'provider': 'facebook', 'app_id': '254325784911610'},
          'whatsapp',
        ],
        'components': [
          {
            'type': 'cta-link',
            'links': [
              {
                'text': 'buttonA',
                'url': 'google.com',
                'amphtml': true,
              },
            ],
          },
        ],
      };

      env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);
      const clickSpy = env.sandbox.spy();
      doc.addEventListener('click', clickSpy);

      bookend.build();
      await bookend.loadConfigAndMaybeRenderBookend();
      const ctaLinks = bookend.bookendEl_.querySelector(
        '.i-amphtml-story-bookend-cta-link-wrapper'
      );
      ctaLinks.children[0].onclick = function (e) {
        e.preventDefault(); // Make the test not actually navigate.
      };
      ctaLinks.children[0].click();

      expect(clickSpy.getCall(0).args[0]).to.contain({
        '__AMP_CUSTOM_LINKER_TARGET__': ctaLinks.children[0],
      });
    });
  });

  describe('cta links component', () => {
    it('should reject invalid user json', () => {
      const ctaLinkComponent = new CtaLinkComponent();
      const userJson = {
        'bookendVersion': 'v1.0',
        'shareProviders': [
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
            'and contain at least one link inside it.'
        );
      });
    });

    it(
      'should add amp-to-amp linking to individual cta links when ' +
        'specified in the JSON config',
      async () => {
        const userJson = {
          'bookendVersion': 'v1.0',
          'shareProviders': [
            'email',
            {'provider': 'facebook', 'app_id': '254325784911610'},
            'whatsapp',
          ],
          'components': [
            {
              'type': 'cta-link',
              'links': [
                {
                  'text': 'buttonA',
                  'url': 'google.com',
                  'amphtml': true,
                },
              ],
            },
          ],
        };

        env.sandbox
          .stub(requestService, 'loadBookendConfig')
          .resolves(userJson);

        bookend.build();
        await bookend.loadConfigAndMaybeRenderBookend();
        const ctaLinks = bookend.bookendEl_.querySelector(
          '.i-amphtml-story-bookend-cta-link-wrapper'
        );
        expect(ctaLinks.children[0]).to.have.attribute('rel');
        expect(ctaLinks.children[0].getAttribute('rel')).to.equal('amphtml');
      }
    );

    it(
      'should not add amp-to-amp linking to cta links when not ' +
        'specified in the JSON config',
      async () => {
        const userJson = {
          'bookendVersion': 'v1.0',
          'shareProviders': [
            'email',
            {'provider': 'facebook', 'app_id': '254325784911610'},
            'whatsapp',
          ],
          'components': [
            {
              'type': 'cta-link',
              'links': [
                {
                  'text': 'buttonB',
                  'url': 'google.com',
                  'amphtml': '',
                },
                {
                  'text': 'longtext longtext longtext longtext longtext',
                  'url': 'google.com',
                  'amphtml': false,
                },
              ],
            },
          ],
        };

        env.sandbox
          .stub(requestService, 'loadBookendConfig')
          .resolves(userJson);

        bookend.build();
        await bookend.loadConfigAndMaybeRenderBookend();
        const ctaLinks = bookend.bookendEl_.querySelector(
          '.i-amphtml-story-bookend-cta-link-wrapper'
        );
        expect(ctaLinks.children[0]).to.not.have.attribute('rel');
        expect(ctaLinks.children[1]).to.not.have.attribute('rel');
      }
    );
  });

  describe('small article component', () => {
    it('should reject invalid user json', () => {
      const articleComponent = new ArticleComponent();
      const userJson = {
        'bookendVersion': 'v1.0',
        'shareProviders': [
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
            'skipping invalid.​​​'
        );
      });
    });

    it('should add amp-to-amp linking when specified in the JSON config', async () => {
      const userJson = {
        'bookendVersion': 'v1.0',
        'shareProviders': [
          'email',
          {'provider': 'facebook', 'app_id': '254325784911610'},
          'whatsapp',
        ],
        'components': [
          {
            'type': 'small',
            'title': 'This is an example article!',
            'url': 'http://example.com/article.html',
            'image': 'http://placehold.it/256x128',
            'amphtml': true,
          },
        ],
      };

      env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

      bookend.build();
      await bookend.loadConfigAndMaybeRenderBookend();
      const articles = bookend.bookendEl_.querySelectorAll(
        '.i-amphtml-story-bookend-article'
      );
      expect(articles[0]).to.have.attribute('rel');
      expect(articles[0].getAttribute('rel')).to.equal('amphtml');
    });

    it('should not add amp-to-amp linking when not specified in the JSON config', async () => {
      const userJson = {
        'bookendVersion': 'v1.0',
        'shareProviders': [
          'email',
          {'provider': 'facebook', 'app_id': '254325784911610'},
          'whatsapp',
        ],
        'components': [
          {
            'type': 'small',
            'title': 'This is an example article!',
            'url': 'http://example.com/article.html',
            'image': 'http://placehold.it/256x128',
          },
          {
            'type': 'small',
            'title': 'This is an example article!',
            'url': 'http://example.com/article.html',
            'image': 'http://placehold.it/256x128',
            'amphtml': 'true',
          },
        ],
      };

      env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

      bookend.build();
      await bookend.loadConfigAndMaybeRenderBookend();
      const articles = bookend.bookendEl_.querySelectorAll(
        '.i-amphtml-story-bookend-article'
      );
      expect(articles[0]).to.not.have.attribute('rel');
      expect(articles[1]).to.not.have.attribute('rel');
    });

    it('should resolve relative url for origin url when served from the cache', () => {
      const component = {
        url: './other-article.html',
        domainName: 'example.com',
        type: 'small',
        title: 'This is an example article',
        image: '../../assets/01-iconic-american-destinations.jpg',
      };

      win.location.resetHref(
        'https://www-nationalgeographic-com.cdn.ampproject.org/c/s/www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );

      const article = new ArticleComponent();
      const el = article.buildElement(component, win, {position: 0});
      expect(el.href).to.equal(
        'https://www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/other-article.html'
      );
    });

    it('should respect specified absolute URL', () => {
      const component = {
        url: 'https://www.anothersite.com/article.html',
        domainName: 'example.com',
        type: 'small',
        title: 'This is an example article',
        image: '../../assets/01-iconic-american-destinations.jpg',
      };

      win.location.resetHref(
        'https://www-nationalgeographic-com.cdn.ampproject.org/c/s/www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );

      const article = new ArticleComponent();
      const el = article.buildElement(component, win, {position: 0});
      expect(el.href).to.equal('https://www.anothersite.com/article.html');
    });

    it('should rewrite thumbnail image url for cached version', () => {
      const component = {
        url: 'http://example.com/article.html',
        domainName: 'example.com',
        type: 'small',
        title: 'This is an example article',
        image: '../../assets/01-iconic-american-destinations.jpg',
      };

      win.location.resetHref(
        'https://www-nationalgeographic-com.cdn.ampproject.org/c/s/www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );

      const article = new ArticleComponent();
      const el = article.buildElement(component, win, {position: 0});
      expect(el.querySelector('img').src).to.equal(
        'https://www-nationalgeographic-com.cdn.ampproject.org/i/s/www.nationalgeographic.com/amp-stories/assets/01-iconic-american-destinations.jpg'
      );
    });

    it('should not rewrite thumbnail image url when using absolute url', () => {
      const component = {
        url: 'http://example.com/small.html',
        domainName: 'example.com',
        type: 'small',
        title: 'This is an example small',
        image: 'http://placehold.it/256x128',
      };

      win.location.resetHref(
        'https://www-nationalgeographic-com.cdn.ampproject.org/c/s/www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );
      const small = new ArticleComponent();
      const el = small.buildElement(component, win, {position: 0});
      expect(el.querySelector('img').src).to.equal(
        'http://placehold.it/256x128'
      );
    });

    it('should not rewrite thumbnail image for origin documents', () => {
      const component = {
        url: 'http://example.com/small.html',
        domainName: 'example.com',
        type: 'small',
        title: 'This is an example small',
        image: '../../assets/01-iconic-american-destinations.jpg',
      };

      win.location.resetHref(
        'https://www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );
      const small = new ArticleComponent();
      const el = small.buildElement(component, win, {position: 0});
      expect(el.querySelector('img').src).to.equal(
        'https://www.nationalgeographic.com/amp-stories/assets/01-iconic-american-destinations.jpg'
      );
    });
  });

  describe('landscape component', () => {
    it('should reject invalid user json', () => {
      const landscapeComponent = new LandscapeComponent();
      const userJson = {
        'bookendVersion': 'v1.0',
        'shareProviders': [
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
            '`url` fields, skipping invalid.'
        );
      });
    });

    it('should add amp-to-amp linking when specified in the JSON config', async () => {
      const userJson = {
        'bookendVersion': 'v1.0',
        'shareProviders': [
          'email',
          {'provider': 'facebook', 'app_id': '254325784911610'},
          'whatsapp',
        ],
        'components': [
          {
            'type': 'landscape',
            'category': 'example category',
            'title': 'example title',
            'url': 'http://example.com/article.html',
            'image': 'http://placehold.it/256x128',
            'amphtml': true,
          },
        ],
      };

      env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

      bookend.build();
      await bookend.loadConfigAndMaybeRenderBookend();
      const articles = bookend.bookendEl_.querySelectorAll(
        '.i-amphtml-story-bookend-landscape'
      );
      expect(articles[0]).to.have.attribute('rel');
      expect(articles[0].getAttribute('rel')).to.equal('amphtml');
    });

    it('should not add amp-to-amp linking when not specified in the JSON config', async () => {
      const userJson = {
        'bookendVersion': 'v1.0',
        'shareProviders': [
          'email',
          {'provider': 'facebook', 'app_id': '254325784911610'},
          'whatsapp',
        ],
        'components': [
          {
            'type': 'landscape',
            'category': 'example category',
            'title': 'example title',
            'url': 'http://example.com/article.html',
            'image': 'http://placehold.it/256x128',
          },
          {
            'type': 'landscape',
            'category': 'example category',
            'title': 'example title',
            'url': 'http://example.com/article.html',
            'image': 'http://placehold.it/256x128',
            'amphtml': 'true',
          },
        ],
      };

      env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

      bookend.build();
      await bookend.loadConfigAndMaybeRenderBookend();
      const articles = bookend.bookendEl_.querySelectorAll(
        '.i-amphtml-story-bookend-landscape'
      );
      expect(articles[0]).to.not.have.attribute('rel');
      expect(articles[1]).to.not.have.attribute('rel');
    });

    it('should resolve relative url for origin url when served from the cache', () => {
      const component = {
        url: './other-article.html',
        domainName: 'example.com',
        type: 'landscape',
        title: 'This is an example landscape article',
        image: '../../assets/01-iconic-american-destinations.jpg',
      };

      win.location.resetHref(
        'https://www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );

      const landscape = new LandscapeComponent();

      const el = landscape.buildElement(component, win, {position: 0});
      expect(el.href).to.equal(
        'https://www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/other-article.html'
      );
    });

    it('should respect specified absolute URL', () => {
      const component = {
        url: 'https://www.anothersite.com/article.html',
        domainName: 'example.com',
        type: 'landscape',
        title: 'This is an example landscape article',
        image: '../../assets/01-iconic-american-destinations.jpg',
      };

      win.location.resetHref(
        'https://www-nationalgeographic-com.cdn.ampproject.org/c/s/www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );
      const landscape = new LandscapeComponent();
      const el = landscape.buildElement(component, win, {position: 0});
      expect(el.href).to.equal('https://www.anothersite.com/article.html');
    });

    it('should rewrite landscape thumbnail image url for cached version', () => {
      const component = {
        url: 'http://example.com/landscape.html',
        domainName: 'example.com',
        type: 'landscape',
        title: 'This is an example landscape',
        image: './assets/01-iconic-american-destinations.jpg',
      };

      win.location.resetHref(
        'https://www-nationalgeographic-com.cdn.ampproject.org/c/s/www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );

      const landscape = new LandscapeComponent();
      const el = landscape.buildElement(component, win, {position: 0});
      expect(el.querySelector('img').src).to.equal(
        'https://www-nationalgeographic-com.cdn.ampproject.org/i/s/www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/assets/01-iconic-american-destinations.jpg'
      );
    });

    it('should not rewrite thumbnail image url when using absolute url', () => {
      const component = {
        url: 'http://example.com/landscape.html',
        domainName: 'example.com',
        type: 'landscape',
        title: 'This is an example landscape',
        image: 'http://placehold.it/256x128',
      };

      win.location.resetHref(
        'https://www-nationalgeographic-com.cdn.ampproject.org/c/s/www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );
      const landscape = new LandscapeComponent();
      const el = landscape.buildElement(component, win, {position: 0});
      expect(el.querySelector('img').src).to.equal(
        'http://placehold.it/256x128'
      );
    });

    it('should not rewrite thumbnail image for origin documents', () => {
      const component = {
        url: 'http://example.com/landscape.html',
        domainName: 'example.com',
        type: 'small',
        title: 'This is an example landscape',
        image: '../../assets/01-iconic-american-destinations.jpg',
      };

      win.location.resetHref(
        'https://www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );
      const landscape = new LandscapeComponent();
      const el = landscape.buildElement(component, win, {position: 0});
      expect(el.querySelector('img').src).to.equal(
        'https://www.nationalgeographic.com/amp-stories/assets/01-iconic-american-destinations.jpg'
      );
    });
  });

  describe('portrait component', () => {
    it('should reject invalid user json', () => {
      const portraitComponant = new PortraitComponent();
      const userJson = {
        'bookendVersion': 'v1.0',
        'shareProviders': [
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
            '`url` fields, skipping invalid.'
        );
      });
    });

    it('should add amp-to-amp linking when specified in the JSON config', async () => {
      const userJson = {
        'bookendVersion': 'v1.0',
        'shareProviders': [
          'email',
          {'provider': 'facebook', 'app_id': '254325784911610'},
          'whatsapp',
        ],
        'components': [
          {
            'type': 'portrait',
            'title': 'example title',
            'category': 'example category',
            'url': 'http://example.com/article.html',
            'image': 'http://placehold.it/256x128',
            'amphtml': true,
          },
        ],
      };

      env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

      bookend.build();
      await bookend.loadConfigAndMaybeRenderBookend();
      const articles = bookend.bookendEl_.querySelectorAll(
        '.i-amphtml-story-bookend-portrait'
      );
      expect(articles[0]).to.have.attribute('rel');
      expect(articles[0].getAttribute('rel')).to.equal('amphtml');
    });

    it('should not add amp-to-amp linking when not specified in the JSON config', async () => {
      const userJson = {
        'bookendVersion': 'v1.0',
        'shareProviders': [
          'email',
          {'provider': 'facebook', 'app_id': '254325784911610'},
          'whatsapp',
        ],
        'components': [
          {
            'type': 'portrait',
            'title': 'example title',
            'category': 'example category',
            'url': 'http://example.com/article.html',
            'image': 'http://placehold.it/256x128',
          },
          {
            'type': 'portrait',
            'title': 'example title',
            'category': 'example category',
            'url': 'http://example.com/article.html',
            'image': 'http://placehold.it/256x128',
            'amphtml': 'true',
          },
        ],
      };

      env.sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

      bookend.build();
      await bookend.loadConfigAndMaybeRenderBookend();
      const articles = bookend.bookendEl_.querySelectorAll(
        '.i-amphtml-story-bookend-portrait'
      );
      expect(articles[0]).to.not.have.attribute('rel');
      expect(articles[1]).to.not.have.attribute('rel');
    });

    it('should resolve relative url for origin url when served from the cache', () => {
      const component = {
        url: './other-article.html',
        domainName: 'example.com',
        type: 'portrait',
        title: 'This is an example portrait article',
        image: '../../assets/01-iconic-american-destinations.jpg',
      };

      win.location.resetHref(
        'https://www-nationalgeographic-com.cdn.ampproject.org/c/s/www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );

      const portrait = new PortraitComponent();
      const el = portrait.buildElement(component, win, {position: 0});
      expect(el.href).to.equal(
        'https://www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/other-article.html'
      );
    });

    it('should respect specified absolute URL', () => {
      const component = {
        url: 'https://www.anothersite.com/article.html',
        domainName: 'example.com',
        type: 'portrait',
        title: 'This is an example portrait article',
        image: '../../assets/01-iconic-american-destinations.jpg',
      };

      win.location.resetHref(
        'https://www-nationalgeographic-com.cdn.ampproject.org/c/s/www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );

      const portrait = new PortraitComponent();
      const el = portrait.buildElement(component, win, {position: 0});
      expect(el.href).to.equal('https://www.anothersite.com/article.html');
    });

    it('should rewrite thumbnail image url for cached version', () => {
      const component = {
        url: 'http://example.com/portrait.html',
        domainName: 'example.com',
        type: 'portrait',
        title: 'This is an example portrait',
        image: 'assets/01-iconic-american-destinations.jpg',
      };

      win.location.resetHref(
        'https://www-nationalgeographic-com.cdn.ampproject.org/c/s/www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );
      const portrait = new PortraitComponent();
      const el = portrait.buildElement(component, win, {position: 0});
      expect(el.querySelector('img').src).to.equal(
        'https://www-nationalgeographic-com.cdn.ampproject.org/i/s/www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/assets/01-iconic-american-destinations.jpg'
      );
    });

    it('should not rewrite thumbnail image url when using absolute url', () => {
      const component = {
        url: 'http://example.com/portrait.html',
        domainName: 'example.com',
        type: 'portrait',
        title: 'This is an example portrait',
        image: 'http://placehold.it/256x128',
      };

      win.location.resetHref(
        'https://www-nationalgeographic-com.cdn.ampproject.org/c/s/www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );
      const portrait = new PortraitComponent();
      const el = portrait.buildElement(component, win, {position: 0});
      expect(el.querySelector('img').src).to.equal(
        'http://placehold.it/256x128'
      );
    });

    it('should not rewrite thumbnail image for origin documents', () => {
      const component = {
        url: 'http://example.com/portrait.html',
        domainName: 'example.com',
        type: 'small',
        title: 'This is an example portrait',
        image: '../../assets/01-iconic-american-destinations.jpg',
      };

      win.location.resetHref(
        'https://www.nationalgeographic.com/amp-stories/travel/10-iconic-places-to-photograph/'
      );
      const portrait = new PortraitComponent();
      const el = portrait.buildElement(component, win, {position: 0});
      expect(el.querySelector('img').src).to.equal(
        'https://www.nationalgeographic.com/amp-stories/assets/01-iconic-american-destinations.jpg'
      );
    });
  });
});
