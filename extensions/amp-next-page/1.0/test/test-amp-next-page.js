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
import {Services} from '../../../../src/services';
import {ViewportRelativePos} from '../visibility-observer';
import {VisibilityState} from '../../../../src/visibility-state';
import {setStyle} from '../../../../src/style';
import {toggleExperiment} from '../../../../src/experiments';

const MOCK_NEXT_PAGE = `<header>Header</header>
    <div style="height:1000px"></div>
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
  },
  env => {
    let win, doc, ampdoc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;

      toggleExperiment(win, 'amp-next-page-v2', true);

      // Mocks
      ampdoc.getUrl = () => document.location.href;
      win.document.title = 'Host page';
    });

    async function getAMPNextPage(options) {
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

      if (options.src) {
        element.setAttribute('src', options.src);
      }

      doc.body.appendChild(element);

      return element;
    }

    afterEach(() => {
      toggleExperiment(win, 'amp-next-page-v2', false);
    });

    describe('inline config', () => {
      it('builds with valid inline config', async () => {
        const element = await getAMPNextPage({
          inlineConfig: VALID_CONFIG,
        });

        await element.build();
        await element.layoutCallback();
      });

      it('errors on invalid inline config (object instead of array)', async () => {
        const element = await getAMPNextPage({
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
        });

        await allowConsoleError(() =>
          element.build().catch(err => {
            expect(err.message).to.include(
              'amp-next-page page list should be an array'
            );
          })
        );
      });

      it('errors on invalid inline config (ampUrl instead of url)', async () => {
        const element = await getAMPNextPage({
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

        await allowConsoleError(() =>
          element.build().catch(err => {
            expect(err.message).to.include('page url must be a string');
          })
        );
      });

      it('builds with valid inline config', async () => {
        const element = await getAMPNextPage({
          inlineConfig: VALID_CONFIG,
        });

        await element.build();
        await element.layoutCallback();
      });
    });

    describe('basic functionality', () => {
      let element;
      let service;

      beforeEach(async () => {
        element = await getAMPNextPage({
          inlineConfig: VALID_CONFIG,
        });

        await element.build();
        await element.layoutCallback();

        service = Services.nextPageServiceForDoc(doc);
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
        [1, 2].forEach(i => {
          expect(service.pages_[i].state_).to.equal(PageState.QUEUED);
          expect(service.pages_[i].visibilityState_).to.equal(
            VisibilityState.PRERENDER
          );
        });
      });

      it('fetches the next document on scroll', async () => {
        env.sandbox.stub(service, 'getViewportsAway_').returns(2);
        const firstPageFetchSpy = env.sandbox.spy(service.pages_[1], 'fetch');
        const secondPageFetchSpy = env.sandbox.spy(service.pages_[2], 'fetch');

        env.fetchMock.get(/\/document1/, MOCK_NEXT_PAGE);
        await service.maybeFetchNext();

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
        env.sandbox.stub(service, 'getViewportsAway_').returns(2);
        const firstPageFetchSpy = env.sandbox.spy(service.pages_[1], 'fetch');
        const secondPageFetchSpy = env.sandbox.spy(service.pages_[2], 'fetch');

        env.fetchMock.get(/\/document1/, MOCK_NEXT_PAGE);
        env.fetchMock.get(/\/document2/, MOCK_NEXT_PAGE);
        await service.maybeFetchNext();
        await service.maybeFetchNext();

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
        env.sandbox.stub(service, 'getViewportsAway_').returns(2);

        await service.maybeFetchNext();

        expect(service.pages_[1].state_).to.equal(PageState.FAILED);
        expect(service.pages_[1].visibilityState_).to.equal(
          VisibilityState.PRERENDER
        );
      });

      it('adds the hidden class to elements that should be hidden', async () => {
        env.sandbox.stub(service, 'getViewportsAway_').returns(2);

        env.fetchMock.get(
          /\/document1/,
          `${MOCK_NEXT_PAGE} <div amp-next-page-hide id="hidden" />`
        );
        await service.maybeFetchNext();

        expect(
          service.pages_[1].document.getElementById('hidden')
        ).to.have.attribute('hidden');
      });

      it('replaces elements with their most recent instance', async () => {
        env.sandbox.stub(service, 'getViewportsAway_').returns(2);

        env.fetchMock.get(
          /\/document1/,
          `${MOCK_NEXT_PAGE} <div amp-next-page-replace="replace-me" instance="1" />`
        );
        await service.maybeFetchNext();
        service.pages_[1].setVisibility(VisibilityState.VISIBLE);

        env.fetchMock.get(
          /\/document2/,
          `${MOCK_NEXT_PAGE} <div amp-next-page-replace="replace-me" instance="2" />`
        );
        await service.maybeFetchNext();
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

      it('removes amp-analytics tags from child documents', async () => {
        env.sandbox.stub(service, 'getViewportsAway_').returns(2);

        env.fetchMock.get(
          /\/document1/,
          `${MOCK_NEXT_PAGE} <amp-analytics id="analytics1"></amp-analytics>`
        );
        await service.maybeFetchNext();

        expect(service.pages_[1].document.getElementById('analytics1')).to.be
          .null;
      });
    });

    describe('remote config', () => {
      // TODO (wassgha): Implement once remote config is implemented
    });
  }
);
