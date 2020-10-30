/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import '../amp-next-page';
import {PageState} from '../page';
import {ScrollDirection, ViewportRelativePos} from '../visibility-observer';
import {Services} from '../../../../src/services';
import {VisibilityState} from '../../../../src/visibility-state';
import {htmlFor} from '../../../../src/static-template';
import {setStyle} from '../../../../src/style';

const MOCK_NEXT_PAGE = `<header>Header</header>
    <div style="height:1000px"></div>
    <footer>Footer</footer>`;
const MOCK_NEXT_PAGE_WITH_RECOMMENDATIONS = `<header>Header</header>
    <div style="height:1000px"></div>
    <amp-next-page>
        <script type="application/json">
        [
          {
            "image": "/examples/img/hero@1x.jpg",
            "title": "Title 3",
            "url": "./document3"
          },
          {
            "image": "/examples/img/hero@1x.jpg",
            "title": "Title 4",
            "url": "./document4"
          },
          {
            "image": "/examples/img/hero@1x.jpg",
            "title": "Title 2",
            "url": "./document2"
          }
        ]
      </script>
    </amp-next-page>
    <footer>Footer</footer>`;
const VALID_CONFIG = [
  {
    'image': '/examples/img/hero@1x.jpg',
    'title': 'Title 1',
    'url': '/document1',
  },
  {
    'image': '/examples/img/hero@1x.jpg',
    'title': 'Title 2',
    'url': '/document2',
  },
];

describes.realWin(
  'amp-next-page component',
  {
    amp: {
      extensions: ['amp-next-page:1.0'],
    },
    'with script[type=text/plain][template=amp-mustache]': {
      templateType: 'script',
    },
    'with template[type=amp-mustache]': {templateType: 'template'},
  },
  (env) => {
    let win, doc, ampdoc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;

      // Mocks
      ampdoc.getUrl = () => document.location.href;
      win.document.title = 'Host page';
    });

    async function getAmpNextPage(options, waitForLayout = true) {
      options = options || {};

      const element = doc.createElement('amp-next-page');

      // Ensure element is off screen when it renders.
      setStyle(element, 'marginTop', '10000px');

      // Add inline config if specified
      if (options.inlineConfig) {
        const configElement = document.createElement('script');
        configElement.setAttribute('id', 'next-page');
        configElement.setAttribute('type', 'application/json');
        configElement.textContent = JSON.stringify(options.inlineConfig);
        element.appendChild(configElement);
      }

      if (options.separator) {
        element.appendChild(options.separator);
      }

      if (options.src) {
        element.setAttribute('src', options.src);
      }

      if (options.maxPages) {
        element.setAttribute('max-pages', options.maxPages);
      }

      doc.body.appendChild(element);
      // With this the document will start fetching more ASAP.
      doc.scrollingElement.scrollTop =
        options.scrollTop != undefined ? options.scrollTop : 1;

      if (waitForLayout) {
        await element.build();
        await element.layoutCallback();
      }

      return element;
    }

    async function fetchDocuments(
      service,
      result = MOCK_NEXT_PAGE,
      urlOrNumber = 1
    ) {
      const numPages = typeof urlOrNumber === 'string' ? 1 : urlOrNumber;
      // Set up the mock request
      if (typeof urlOrNumber === 'string') {
        env.fetchMock.get(new RegExp(urlOrNumber, 'g'), result);
      } else {
        for (let i = 1; i <= numPages; i++) {
          env.fetchMock.get(new RegExp(`/document${i}`, 'g'), result);
        }
      }
      // Ask the next page service to fetch the documents
      for (let i = 1; i <= numPages; i++) {
        await service.maybeFetchNext();
      }
    }

    describe('inline config', () => {
      it('builds with valid inline config', async () => {
        await getAmpNextPage({
          inlineConfig: VALID_CONFIG,
        });
      });

      it('errors on invalid inline config (object instead of array)', async () => {
        const element = await getAmpNextPage(
          {
            inlineConfig: {
              pages: [
                {
                  'image': '/examples/img/hero@1x.jpg',
                  'title': 'Title 1',
                  'ampUrl': '/document1',
                },
                {
                  'image': '/examples/img/hero@1x.jpg',
                  'title': 'Title 2',
                  'ampUrl': '/document2',
                },
              ],
            },
          },
          false /** waitForLayout */
        );
        await allowConsoleError(() =>
          element.build().catch((err) => {
            expect(err.message).to.include(
              'amp-next-page Page list expected an array, found: object: [object Object]'
            );
            element.parentNode.removeChild(element);
          })
        );
      });

      it('errors on invalid inline config (ampUrl instead of url)', () => {
        expectAsyncConsoleError(/page url must be a string/, 1);

        getAmpNextPage({
          inlineConfig: [
            {
              'image': '/examples/img/hero@1x.jpg',
              'title': 'Title 1',
              'ampUrl': '/document1',
            },
            {
              'image': '/examples/img/hero@1x.jpg',
              'title': 'Title 2',
              'ampUrl': '/document2',
            },
          ],
        });
      });
    });

    describe('remote config', () => {
      it('errors when no config specified', async () => {
        expectAsyncConsoleError(
          /amp-next-page should contain a <script> child or a URL specified/,
          1
        );
        getAmpNextPage({});
      });

      it('builds with valid remote config (without inline config)', async () => {
        const element = await getAmpNextPage({
          src: 'https://example.com/config.json',
        });
        element.parentNode.removeChild(element);
      });

      it('fetches remote config when specified in src', async () => {
        const element = await getAmpNextPage(
          {
            src: 'https://example.com/config.json',
          },
          false /** waitForLayout */
        );

        const config = {
          pages: [
            {
              image: '/examples/img/hero@1x.jpg',
              title: 'Remote config',
              url: '/document1',
            },
          ],
        };

        const fetchJsonStub = env.sandbox
          .stub(Services.batchedXhrFor(win), 'fetchJson')
          .resolves({
            ok: true,
            json() {
              return Promise.resolve(config);
            },
          });
        const service = Services.nextPageServiceForDoc(doc);

        await element.build();
        await element.layoutCallback();

        expect(
          fetchJsonStub.calledWithExactly('https://example.com/config.json', {})
        ).to.be.true;

        await service.readyPromise_;
        // Page 1
        expect(service.pages_[1].title).to.equal('Remote config');
        expect(service.pages_[1].url).to.include('/document1');
        expect(service.pages_[1].image).to.equal('/examples/img/hero@1x.jpg');

        element.parentNode.removeChild(element);
      });

      it('errors on invalid remote config (ampUrl instead of url)', async () => {
        expectAsyncConsoleError(/page url must be a string/, 1);

        const config = {
          pages: [
            {
              image: '/examples/img/hero@1x.jpg',
              title: 'Remote config',
              ampUrl: '/document1',
            },
          ],
        };

        env.sandbox.stub(Services.batchedXhrFor(win), 'fetchJson').resolves({
          ok: true,
          json() {
            return Promise.resolve(config);
          },
        });

        const element = await getAmpNextPage({
          src: 'https://example.com/config.json',
        });

        element.parentNode.removeChild(element);
      });
    });

    describe('basic functionality', () => {
      let element;
      let service;

      beforeEach(async () => {
        element = await getAmpNextPage({
          inlineConfig: VALID_CONFIG,
        });

        service = Services.nextPageServiceForDoc(doc);
        env.sandbox.stub(service, 'getViewportsAway_').returns(2);
      });

      afterEach(async () => {
        element.parentNode.removeChild(element);
      });

      it('should register pages from the given config', async () => {
        // Page 1
        expect(service.pages_[1].title).to.equal('Title 1');
        expect(service.pages_[1].url).to.include('/document1');
        expect(service.pages_[1].image).to.equal('/examples/img/hero@1x.jpg');
        // Page 2
        expect(service.pages_[2].title).to.equal('Title 2');
        expect(service.pages_[2].url).to.include('/document2');
        expect(service.pages_[2].image).to.equal('/examples/img/hero@1x.jpg');
      });

      it('should internally register the host page', async () => {
        expect(service.pages_[0].title).to.equal('Host page');
        expect(service.pages_[0].url).to.include('about:srcdoc');
        expect(service.pages_[0].state_).to.equal(PageState.INSERTED);
        expect(service.pages_[0].visibilityState_).to.equal(
          VisibilityState.VISIBLE
        );
      });

      it('should not fetch the next document before scrolling', async () => {
        [1, 2].forEach((i) => {
          expect(service.pages_[i].state_).to.equal(PageState.QUEUED);
          expect(service.pages_[i].visibilityState_).to.equal(
            VisibilityState.PRERENDER
          );
        });
      });

      it('fetches the next document on scroll', async () => {
        const firstPageFetchSpy = env.sandbox.spy(service.pages_[1], 'fetch');
        const secondPageFetchSpy = env.sandbox.spy(service.pages_[2], 'fetch');

        await fetchDocuments(service);

        expect(firstPageFetchSpy).to.be.calledOnce;
        expect(service.pages_[1].state_).to.equal(PageState.INSERTED);
        expect(service.pages_[1].visibilityState_).to.equal(
          VisibilityState.PRERENDER
        );

        expect(secondPageFetchSpy).to.not.be.called;
        expect(service.pages_[2].state_).to.equal(PageState.QUEUED);
        expect(service.pages_[2].visibilityState_).to.equal(
          VisibilityState.PRERENDER
        );
      });

      it('fetches the second document on scroll', async () => {
        const firstPageFetchSpy = env.sandbox.spy(service.pages_[1], 'fetch');
        const secondPageFetchSpy = env.sandbox.spy(service.pages_[2], 'fetch');

        await fetchDocuments(service, MOCK_NEXT_PAGE, 2);

        expect(firstPageFetchSpy).to.be.calledOnce;
        expect(service.pages_[1].state_).to.equal(PageState.INSERTED);
        expect(service.pages_[1].visibilityState_).to.equal(
          VisibilityState.PRERENDER
        );

        expect(secondPageFetchSpy).to.be.calledOnce;
        expect(service.pages_[2].state_).to.equal(PageState.INSERTED);
        expect(service.pages_[2].visibilityState_).to.equal(
          VisibilityState.PRERENDER
        );
      });

      it('blocks documents which resolve to a different origin when fetched ', async () => {
        expectAsyncConsoleError(
          /Invalid page URL supplied to amp-next-page, pages must be from the same origin as the current document/,
          2
        );

        env.fetchMock.get(/\/document1/, {
          redirectUrl: 'https://othersite.com/article',
          body: MOCK_NEXT_PAGE,
        });

        await service.maybeFetchNext();

        expect(service.pages_[1].state_).to.equal(PageState.FAILED);
        expect(service.pages_[1].visibilityState_).to.equal(
          VisibilityState.PRERENDER
        );
      });

      it('adds the hidden class to elements that should be hidden', async () => {
        await fetchDocuments(
          service,
          `${MOCK_NEXT_PAGE} <div next-page-hide id="hidden" />`
        );

        expect(
          service.pages_[1].document.getElementById('hidden')
        ).to.have.attribute('hidden');
      });

      it('replaces elements with their most recent instance', async () => {
        await fetchDocuments(
          service,
          `${MOCK_NEXT_PAGE} <div next-page-replace="replace-me" instance="1" />`,
          '/document1'
        );
        service.pages_[1].setVisibility(VisibilityState.VISIBLE);

        await fetchDocuments(
          service,
          `${MOCK_NEXT_PAGE} <div next-page-replace="replace-me" instance="2" />`,
          '/document2'
        );
        service.pages_[1].relativePos = ViewportRelativePos.INSIDE_VIEWPORT;
        service.updateVisibility();
        service.pages_[1].relativePos = ViewportRelativePos.OUTSIDE_VIEWPORT;
        service.pages_[2].relativePos = ViewportRelativePos.INSIDE_VIEWPORT;
        service.updateVisibility();

        expect(service.pages_[1].document.querySelector('[instance="1"]')).to.be
          .ok;
        expect(
          service.pages_[1].document.querySelector('[instance="1"]')
        ).to.have.attribute('hidden');
        expect(service.pages_[2].document.querySelector('[instance="1"]')).to
          .not.be.ok;
      });
    });

    describe('initial behavior', () => {
      let element;
      let service;

      beforeEach(async () => {
        element = await getAmpNextPage(
          {
            inlineConfig: VALID_CONFIG,
            scrollTop: 0,
          },
          /* no awaiting */ false
        );

        service = Services.nextPageServiceForDoc(doc);
        env.sandbox.stub(service, 'getViewportsAway_').returns(2);
      });

      afterEach(async () => {
        element.parentNode.removeChild(element);
      });

      it('awaits first scroll', async () => {
        element.build();
        await Promise.resolve();
        expect(service.pages_.length).to.equal(1);
        win.dispatchEvent(new Event('scroll'));
        await Promise.resolve();
        expect(service.pages_.length).to.equal(3);
      });
    });

    describe('infinite loading', () => {
      let element;
      let service;

      beforeEach(async () => {
        element = await getAmpNextPage({
          inlineConfig: VALID_CONFIG,
        });

        service = Services.nextPageServiceForDoc(doc);
        env.sandbox.stub(service, 'getViewportsAway_').returns(2);
      });

      afterEach(async () => {
        element.parentNode.removeChild(element);
      });

      it('recursively parses pages and avoids loops', async () => {
        expect(service.pages_.length).to.equal(3);

        await fetchDocuments(service, MOCK_NEXT_PAGE_WITH_RECOMMENDATIONS);

        // Adds the two documents coming from Document 1's recommendations
        expect(service.pages_.length).to.equal(5);
        expect(service.pages_.some((page) => page.title == 'Title 3')).to.be
          .true;
        expect(service.pages_.some((page) => page.title == 'Title 4')).to.be
          .true;
        // Avoids loops (ignores previously inserted page)
        expect(
          service.pages_.filter((page) => page.title == 'Title 2').length
        ).to.equal(1);

        expect(
          element.querySelectorAll('.i-amphtml-next-page-document-container')
            .length
        ).to.equal(1);
      });

      it('unloads pages and replaces them with a placeholder', async () => {
        const secondPagePauseSpy = env.sandbox.spy(service.pages_[2], 'pause');

        await fetchDocuments(service, MOCK_NEXT_PAGE, 2);

        const {container} = service.pages_[2];
        expect(container).to.be.ok;
        expect(container.querySelector('.i-amphtml-next-page-placeholder')).to
          .not.be.ok;
        expect(container.querySelector('.i-amphtml-next-page-shadow-root')).to
          .be.ok;

        service.pages_[2].visibilityState_ = VisibilityState.VISIBLE;
        service.visibilityObserver_.scrollDirection_ = ScrollDirection.UP;

        await service.hidePreviousPages_(
          0 /** index */,
          0 /** pausePageCountForTesting */
        );

        // Internally changes the state to paused
        expect(secondPagePauseSpy).to.be.calledOnce;
        expect(service.pages_[2].state_).to.equal(PageState.PAUSED);
        expect(service.pages_[2].visibilityState_).to.equal(
          VisibilityState.HIDDEN
        );

        // Replaces the inserted shadow doc with a placeholder of equal height
        expect(container.querySelector('.i-amphtml-next-page-placeholder')).to
          .be.ok;
        expect(container.querySelector('.i-amphtml-next-page-shadow-root')).to
          .not.be.ok;
        expect(
          win.getComputedStyle(
            container.querySelector('.i-amphtml-next-page-placeholder')
          ).height
        ).to.equal('1036px');
      });

      it('reloads pages and removes the placeholder', async () => {
        const secondPageResumeSpy = env.sandbox.spy(
          service.pages_[2],
          'resume'
        );

        await fetchDocuments(service, MOCK_NEXT_PAGE, 2);

        const {container} = service.pages_[2];
        expect(container).to.be.ok;
        service.pages_[2].visibilityState_ = VisibilityState.VISIBLE;
        service.visibilityObserver_.scrollDirection_ = ScrollDirection.UP;
        await service.hidePreviousPages_(
          0 /** index */,
          0 /** pausePageCountForTesting */
        );
        expect(service.pages_[2].state_).to.equal(PageState.PAUSED);
        expect(service.pages_[2].visibilityState_).to.equal(
          VisibilityState.HIDDEN
        );

        service.visibilityObserver_.scrollDirection_ = ScrollDirection.DOWN;
        await service.resumePausedPages_(
          1 /** index */,
          0 /** pausePageCountForTesting */
        );

        // Replaces the inserted placeholder with the page's content
        expect(secondPageResumeSpy).to.be.calledOnce;
        expect(container.querySelector('.i-amphtml-next-page-placeholder')).to
          .not.be.ok;
        expect(container.querySelector('.i-amphtml-next-page-shadow-root')).to
          .be.ok;
        expect(
          win.getComputedStyle(
            container.querySelector('.i-amphtml-next-page-shadow-root')
          ).height
        ).to.equal('1036px');
      });
    });

    describe('default separators & footers', () => {
      let element;
      let service;

      beforeEach(async () => {
        element = await getAmpNextPage({
          inlineConfig: VALID_CONFIG,
        });

        service = Services.nextPageServiceForDoc(doc);
        env.sandbox.stub(service, 'getViewportsAway_').returns(2);
      });

      afterEach(async () => {
        element.parentNode.removeChild(element);
      });

      it('adds a default separator to the host page', async () => {
        await fetchDocuments(service, MOCK_NEXT_PAGE_WITH_RECOMMENDATIONS);

        expect(service.pages_[1].container.firstElementChild).to.have.class(
          'amp-next-page-separator'
        );
      });

      it('adds a default separator between embedded pages', async () => {
        await fetchDocuments(service, MOCK_NEXT_PAGE, 2);

        expect(service.pages_[2].container.firstElementChild).to.have.class(
          'amp-next-page-separator'
        );
      });

      it('adds a default recommendation box to the host page', async () => {
        await fetchDocuments(service, MOCK_NEXT_PAGE_WITH_RECOMMENDATIONS);

        expect(element.lastElementChild).to.have.class('amp-next-page-links');
      });
    });

    describe('custom and templated separators & recommendation box', () => {
      let element;
      let service;
      let html;

      beforeEach(() => {
        html = htmlFor(doc);
      });

      afterEach(async () => {
        element.parentNode.removeChild(element);
      });

      it('renders a custom separator correctly', async () => {
        const separator = html` <div separator>Custom separator</div> `;

        element = await getAmpNextPage({
          inlineConfig: VALID_CONFIG,
          separator,
        });

        service = Services.nextPageServiceForDoc(doc);
        env.sandbox.stub(service, 'getViewportsAway_').returns(2);
        await fetchDocuments(service, MOCK_NEXT_PAGE, 2);

        expect(
          service.pages_[1].container.firstElementChild.innerText
        ).to.equal('Custom separator');
        expect(
          service.pages_[2].container.firstElementChild.innerText
        ).to.equal('Custom separator');
      });

      it('correctly renders a templated separator', async () => {
        const separator = html`
          <div separator>
            <template type="amp-mustache">
              <div class="separator-content">
                <span class="title">{{title}}</span>
                <span class="url">{{url}}</span>
                <span class="image">{{image}}</span>
              </div>
            </template>
          </div>
        `;

        element = await getAmpNextPage({
          inlineConfig: VALID_CONFIG,
          separator,
        });

        service = Services.nextPageServiceForDoc(doc);
        env.sandbox.stub(service, 'getViewportsAway_').returns(2);
        const templateRenderStub = env.sandbox
          .stub(service.templates_, 'findAndRenderTemplate')
          .onFirstCall()
          .resolves(html` <span>Rendered 1</span> `)
          .onSecondCall()
          .resolves(html` <span>Rendered 2</span> `);

        await fetchDocuments(service, MOCK_NEXT_PAGE, '1');
        expect(templateRenderStub).to.have.been.calledWith(
          env.sandbox.match.any,
          {
            title: 'Title 1',
            url: '',
            image: '/examples/img/hero@1x.jpg',
          }
        );
        await fetchDocuments(service, MOCK_NEXT_PAGE, '2');
        expect(templateRenderStub).to.have.been.calledWith(
          env.sandbox.match.any,
          {
            title: 'Title 2',
            url: '',
            image: '/examples/img/hero@1x.jpg',
          }
        );

        const template1 = service.pages_[1].container.querySelector(
          '[separator]'
        );
        const template2 = service.pages_[2].container.querySelector(
          '[separator]'
        );

        expect(template1.innerText).to.equal('Rendered 1');
        expect(template2.innerText).to.equal('Rendered 2');
      });

      it('correctly renders a templated recommendation-box', async () => {
        const separator = html`
          <div recommendation-box>
            <template type="amp-mustache">
              <div class="recommendation-box-content">
                {{#pages}}
                <span class="title">{{title}}</span>
                <span class="url">{{url}}</span>
                <span class="image">{{image}}</span>
                {{/pages}}
              </div>
            </template>
          </div>
        `;

        element = await getAmpNextPage({
          inlineConfig: VALID_CONFIG,
          separator,
        });

        service = Services.nextPageServiceForDoc(doc);
        env.sandbox.stub(service, 'getViewportsAway_').returns(0);
        const templateRenderStub = env.sandbox
          .stub(service.templates_, 'findAndRenderTemplate')
          .resolves(html` <span>Rendered</span> `);

        await fetchDocuments(service, MOCK_NEXT_PAGE, '1');
        expect(templateRenderStub).to.have.been.calledWith(
          env.sandbox.match.any,
          {
            pages: [
              {
                title: 'Title 1',
                url: '',
                image: '/examples/img/hero@1x.jpg',
              },
              {
                title: 'Title 2',
                url: 'http://localhost:9876/document2',
                image: '/examples/img/hero@1x.jpg',
              },
            ],
          }
        );
        expect(element.lastElementChild.innerText).to.equal('Rendered');
      });
    });

    describe('page suggestion limiting', () => {
      it('should register all pages if a limit is not specified', async () => {
        const element = await getAmpNextPage({
          inlineConfig: VALID_CONFIG,
        });

        const service = Services.nextPageServiceForDoc(doc);
        env.sandbox.stub(service, 'getViewportsAway_').returns(2);

        expect(service.pages_.length).to.equal(3);
        element.parentNode.removeChild(element);
      });

      it('should only fetch pages up to the given limit', async () => {
        const element = await getAmpNextPage({
          inlineConfig: VALID_CONFIG,
          maxPages: 1,
        });

        const service = Services.nextPageServiceForDoc(doc);
        env.sandbox.stub(service, 'getViewportsAway_').returns(2);

        // Try to fetch more pages than necessary to make sure
        // pages above the maximum are not fetched
        await fetchDocuments(service, MOCK_NEXT_PAGE, 3);

        expect(
          service.pages_.filter((page) => !page.isLoaded()).length
        ).to.equal(1);
        element.parentNode.removeChild(element);
      });
    });
  }
);
