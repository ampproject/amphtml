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
import {ArticleComponent} from '../bookend/components/article';
import {CtaLinkComponent} from '../bookend/components/cta-link';
import {LandscapeComponent} from '../bookend/components/landscape';
import {LocalizationService} from '../../../../src/service/localization';
import {PortraitComponent} from '../bookend/components/portrait';
import {Services} from '../../../../src/services';
import {TextBoxComponent} from '../bookend/components/text-box';
import {createElementWithAttributes} from '../../../../src/dom';
import {registerServiceBuilder} from '../../../../src/service';
import {user} from '../../../../src/log';

describes.realWin('amp-story-bookend', {amp: true}, env => {
  let win;
  let storyElem;
  let bookend;
  let bookendElem;
  let requestService;

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
    bookendElem = createElementWithAttributes(
      win.document,
      'amp-story-bookend',
      {'layout': 'nodisplay'}
    );
    storyElem.appendChild(bookendElem);

    requestService = new AmpStoryRequestService(win, storyElem);
    sandbox.stub(Services, 'storyRequestService').returns(requestService);

    const localizationService = new LocalizationService(win);
    registerServiceBuilder(win, 'localization', () => localizationService);

    bookend = new AmpStoryBookend(bookendElem);

    // Force sync mutateElement.
    sandbox.stub(bookend, 'mutateElement').callsArg(0);
    sandbox.stub(bookend, 'getStoryMetadata_').returns(metadata);
  });

  it('should build the users json', () => {
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

    sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

    bookend.build();
    return bookend.loadConfigAndMaybeRenderBookend().then(config => {
      config.components.forEach((currentComponent, index) => {
        return expect(currentComponent).to.deep.equal(
          expectedComponents[index]
        );
      });
    });
  });

  it('should build the users json with share providers alternative', () => {
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

    sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

    bookend.build();
    return bookend.loadConfigAndMaybeRenderBookend().then(config => {
      config.components.forEach((currentComponent, index) => {
        return expect(currentComponent).to.deep.equal(
          expectedComponents[index]
        );
      });
    });
  });

  it(
    'should add amp-to-amp linking to individual cta links when ' +
      'specified in the JSON config',
    () => {
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

      sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

      bookend.build();
      return bookend.loadConfigAndMaybeRenderBookend().then(() => {
        const ctaLinks = bookend.bookendEl_.querySelector(
          '.i-amphtml-story-bookend-cta-link-wrapper'
        );
        expect(ctaLinks.children[0]).to.have.attribute('rel');
        expect(ctaLinks.children[0].getAttribute('rel')).to.equal('amphtml');
      });
    }
  );

  it(
    'should not add amp-to-amp linking to cta links when not ' +
      'specified in the JSON config',
    () => {
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

      sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

      bookend.build();
      return bookend.loadConfigAndMaybeRenderBookend().then(() => {
        const ctaLinks = bookend.bookendEl_.querySelector(
          '.i-amphtml-story-bookend-cta-link-wrapper'
        );
        expect(ctaLinks.children[0]).to.not.have.attribute('rel');
        expect(ctaLinks.children[1]).to.not.have.attribute('rel');
      });
    }
  );

  it(
    'should add amp-to-amp linking to small articles when specified ' +
      'in the JSON config',
    () => {
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

      sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

      bookend.build();
      return bookend.loadConfigAndMaybeRenderBookend().then(() => {
        const articles = bookend.bookendEl_.querySelectorAll(
          '.i-amphtml-story-bookend-article'
        );
        expect(articles[0]).to.have.attribute('rel');
        expect(articles[0].getAttribute('rel')).to.equal('amphtml');
      });
    }
  );

  it(
    'should not add amp-to-amp linking to small articles when not ' +
      'specified in the JSON config',
    () => {
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

      sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

      bookend.build();
      return bookend.loadConfigAndMaybeRenderBookend().then(() => {
        const articles = bookend.bookendEl_.querySelectorAll(
          '.i-amphtml-story-bookend-article'
        );
        expect(articles[0]).to.not.have.attribute('rel');
        expect(articles[1]).to.not.have.attribute('rel');
      });
    }
  );

  it(
    'should add amp-to-amp linking to portrait articles when specified ' +
      'in the JSON config',
    () => {
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

      sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

      bookend.build();
      return bookend.loadConfigAndMaybeRenderBookend().then(() => {
        const articles = bookend.bookendEl_.querySelectorAll(
          '.i-amphtml-story-bookend-portrait'
        );
        expect(articles[0]).to.have.attribute('rel');
        expect(articles[0].getAttribute('rel')).to.equal('amphtml');
      });
    }
  );

  it(
    'should not add amp-to-amp linking to portrait articles when not ' +
      'specified in the JSON config',
    () => {
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

      sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

      bookend.build();
      return bookend.loadConfigAndMaybeRenderBookend().then(() => {
        const articles = bookend.bookendEl_.querySelectorAll(
          '.i-amphtml-story-bookend-portrait'
        );
        expect(articles[0]).to.not.have.attribute('rel');
        expect(articles[1]).to.not.have.attribute('rel');
      });
    }
  );

  it(
    'should add amp-to-amp linking to landscape articles when ' +
      'specified in the JSON config',
    () => {
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

      sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

      bookend.build();
      return bookend.loadConfigAndMaybeRenderBookend().then(() => {
        const articles = bookend.bookendEl_.querySelectorAll(
          '.i-amphtml-story-bookend-landscape'
        );
        expect(articles[0]).to.have.attribute('rel');
        expect(articles[0].getAttribute('rel')).to.equal('amphtml');
      });
    }
  );

  it(
    'should not add amp-to-amp linking to landscape articles when not' +
      ' specified in the JSON config',
    () => {
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

      sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

      bookend.build();
      return bookend.loadConfigAndMaybeRenderBookend().then(() => {
        const articles = bookend.bookendEl_.querySelectorAll(
          '.i-amphtml-story-bookend-landscape'
        );
        expect(articles[0]).to.not.have.attribute('rel');
        expect(articles[1]).to.not.have.attribute('rel');
      });
    }
  );

  it('should build the users share providers', () => {
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

    sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

    bookend.build();
    return bookend.loadConfigAndMaybeRenderBookend().then(config => {
      config['shareProviders'].forEach((currProvider, index) => {
        return expect(currProvider).to.deep.equal(
          expectedShareProviders[index]
        );
      });
    });
  });

  it('should ignore empty share providers', () => {
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

    sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

    bookend.build();
    return bookend.loadConfigAndMaybeRenderBookend().then(config => {
      return expect(config['shareProviders']).to.deep.equal([]);
    });
  });

  it('should warn when trying to use system sharing', () => {
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

    const userWarnStub = sandbox.stub(user(), 'warn');

    sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

    bookend.build();
    return bookend.loadConfigAndMaybeRenderBookend().then(() => {
      expect(userWarnStub).to.be.calledOnce;
      expect(userWarnStub.args[0][1]).to.be.equal(
        '`system` is not a valid ' +
          'share provider type. Native sharing is ' +
          'enabled by default and cannot be turned off.'
      );
    });
  });

  it('should reject invalid user json for article', () => {
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

  it('should reject invalid user json for portrait article', () => {
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

  it('should reject invalid user json for the cta links component', () => {
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

  it('should reject invalid user json for a landscape component', () => {
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

  it('should skip invalid component name and continue building', () => {
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

    sandbox.stub(requestService, 'loadBookendConfig').resolves(userJson);

    bookend.build();
    expectAsyncConsoleError(
      /[Component `invalid-type` is not supported. Skipping invalid]/
    );

    return bookend.loadConfigAndMaybeRenderBookend().then(config => {
      // Still builds rest of valid components.

      // We use config.components[1] because config.components[0] is a heading
      // that we prepend when there is no heading present in the user config.
      expect(config.components[1]).to.deep.equal(userJson.components[1]);
    });
  });
});
