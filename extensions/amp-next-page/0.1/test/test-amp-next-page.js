import {expect} from 'chai';

import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import {setStyle} from '#core/dom/style';

import {toggleExperiment} from '#experiments';

import {Services} from '#service';

import {macroTask, sleep} from '#testing/helpers';

import * as DocFetcher from '../../../../src/document-fetcher';
import {getServicePromiseForDoc} from '../../../../src/service-helpers';
import {AmpNextPage} from '../amp-next-page';

const EXAMPLE_PAGE = `
    <header>Header</header>
    <div style="height:1000px"></div>
    <footer>Footer</footer>`;

describes.realWin(
  'amp-next-page component',
  {
    amp: {
      extensions: ['amp-next-page'],
    },
  },
  (env) => {
    let win, doc, ampdoc;
    let element;
    let nextPage;
    let fetchDocumentMock;
    let viewport;
    let sizes;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;
      viewport = Services.viewportForDoc(ampdoc);
      sizes = viewport.getSize();
      element = doc.createElement('div');

      toggleExperiment(win, 'amp-next-page', true);

      // Ensure element is off screen when it renders.
      setStyle(element, 'marginTop', '10000px');
      element.getAmpDoc = () => ampdoc;
      element.getFallback = () => null;
      element.getResources = () => win.__AMP_SERVICES.resources.obj;

      doc.body.appendChild(element);
      nextPage = new AmpNextPage(element);

      ampdoc.getUrl = () => document.location.href;

      fetchDocumentMock = env.sandbox.mock(DocFetcher);
      env.sandbox
        .stub(Services.mutatorForDoc(ampdoc), 'mutateElement')
        .callsFake((unused, mutator) => {
          mutator();
          return Promise.resolve();
        });
      env.sandbox.stub(nextPage, 'mutateElement').callsFake((mutator) => {
        mutator();
        return Promise.resolve();
      });
    });

    afterEach(() => {
      fetchDocumentMock.verify();
      toggleExperiment(win, 'amp-next-page', false);
    });

    describe('valid inline config', () => {
      beforeEach((done) => {
        element.innerHTML = `
          <script type="application/json">
            {
              "pages": [
                {
                  "image": "/examples/img/hero@1x.jpg",
                  "title": "Title 1",
                  "ampUrl": "/document1"
                },
                {
                  "image": "/examples/img/hero@1x.jpg",
                  "title": "Title 2",
                  "ampUrl": "/document2"
                }
              ],
              "hideSelectors": [
                "header",
                "footer"
              ]
            }
          </script>`;
        nextPage.buildCallback().then(done);
      });

      it('does not fetch the next document before 3 viewports away', async () => {
        const xhrMock = env.sandbox.mock(Services.xhrFor(win));
        xhrMock.expects('fetch').never();
        env.sandbox
          .stub(viewport, 'getClientRectAsync')
          // 4x viewports away
          .resolves(layoutRectLtwh(0, 0, sizes.width, sizes.height * 5));

        win.dispatchEvent(new Event('scroll'));
        await sleep(10);

        xhrMock.verify();
      });

      it('fetches the next document within 3 viewports away', async () => {
        env.fetchMock.get('*', EXAMPLE_PAGE);
        env.sandbox
          .stub(viewport, 'getClientRectAsync')
          // 1x viewport away
          .resolves(layoutRectLtwh(0, 0, sizes.width, sizes.height * 2));

        win.dispatchEvent(new Event('scroll'));
        await sleep(10);

        expect(env.fetchMock.done(/\/document1/)).to.be.true;
      });

      it('only fetches the next document once', async () => {
        const xhrMock = env.sandbox.mock(Services.xhrFor(win));
        // Promise which is never resolved.
        xhrMock
          .expects('fetch')
          .returns(new Promise(() => {}))
          .once();

        env.sandbox
          .stub(viewport, 'getClientRectAsync')
          // 1x viewport away
          .resolves(layoutRectLtwh(0, 0, sizes.width, sizes.height * 2));

        win.dispatchEvent(new Event('scroll'));
        await sleep(10);
        win.dispatchEvent(new Event('scroll'));
        await sleep(10);
        xhrMock.verify();
      });

      it('adds the hidden class to hideSelector elements', async () => {
        env.fetchMock.get('*', EXAMPLE_PAGE);

        const nextPageService = await getServicePromiseForDoc(
          ampdoc,
          'next-page'
        );
        const attachShadowDocSpy = env.sandbox.spy(
          nextPageService.multidocManager_,
          'attachShadowDoc'
        );

        env.sandbox
          .stub(viewport, 'getClientRectAsync')
          .onFirstCall()
          // 1x viewport away
          .resolves(layoutRectLtwh(0, 0, sizes.width, sizes.height * 2));

        win.dispatchEvent(new Event('scroll'));
        await sleep(10);

        const shadowDoc = attachShadowDocSpy.firstCall.returnValue.ampdoc;
        await shadowDoc.whenReady();

        const shadowRoot = shadowDoc.getRootNode();

        expect(shadowRoot.querySelector('header')).to.have.class(
          'i-amphtml-next-page-hidden'
        );

        expect(shadowRoot.querySelector('footer')).to.have.class(
          'i-amphtml-next-page-hidden'
        );
      });

      it('removes amp-analytics tags from child documents', async () => {
        const examplePage = `${EXAMPLE_PAGE}
          <amp-analytics id="analytics1"></amp-analytics>
          <amp-analytics id="analytics2"></amp-analytics>`;
        env.fetchMock.get('*', examplePage);

        const nextPageService = await getServicePromiseForDoc(
          ampdoc,
          'next-page'
        );
        const attachShadowDocSpy = env.sandbox.spy(
          nextPageService.multidocManager_,
          'attachShadowDoc'
        );
        env.sandbox
          .stub(viewport, 'getClientRectAsync')
          .onFirstCall()
          // 1x viewport away
          .resolves(layoutRectLtwh(0, 0, sizes.width, sizes.height * 2));
        win.dispatchEvent(new Event('scroll'));
        await sleep(10);
        const shadowDoc = attachShadowDocSpy.firstCall.returnValue.ampdoc;
        await shadowDoc.whenReady();
        const shadowRoot = shadowDoc.getRootNode();
        expect(shadowRoot.getElementById('analytics1')).to.be.null;
        expect(shadowRoot.getElementById('analytics2')).to.be.null;
      });

      it('blocks documents which resolve to a different origin when fetched', async () => {
        expectAsyncConsoleError(/ampUrl resolved to a different origin/, 2);
        env.fetchMock.get(/\/document1/, {
          redirectUrl: 'https://othersite.com/article',
          body: EXAMPLE_PAGE,
        });

        const nextPageService = await getServicePromiseForDoc(
          ampdoc,
          'next-page'
        );
        const attachShadowDocSpy = env.sandbox.spy(
          nextPageService.multidocManager_,
          'attachShadowDoc'
        );
        env.sandbox
          .stub(viewport, 'getClientRectAsync')
          .onFirstCall()
          // 1x viewport away
          .resolves(layoutRectLtwh(0, 0, sizes.width, sizes.height * 2));
        win.dispatchEvent(new Event('scroll'));
        await sleep(10);

        expect(env.fetchMock.done()).to.be.true;
        expect(attachShadowDocSpy.notCalled).to.be.true;
      });
    });

    describe('remote config', () => {
      it('errors when no config specified', () => {
        const error =
          'amp-next-page should contain a <script> child, a URL specified in ' +
          '[src], or a [type]';
        expectAsyncConsoleError(error);
        return nextPage.buildCallback().should.be.rejectedWith(error);
      });

      it('fetches remote config when specified in src', async () => {
        const config = {
          pages: [
            {
              image: '/examples/img/hero@1x.jpg',
              title: 'Remote config',
              ampUrl: '/document1',
            },
          ],
        };
        const srcUrl = 'https://example.com/config.json';
        element.setAttribute('src', srcUrl);

        const fetchJsonStub = env.sandbox
          .stub(Services.batchedXhrFor(win), 'fetchJson')
          .resolves({
            ok: true,
            json() {
              return Promise.resolve(config);
            },
          });
        const nextPageService = await getServicePromiseForDoc(
          ampdoc,
          'next-page'
        );
        const registerSpy = env.sandbox.spy(nextPageService, 'register');

        await nextPage.buildCallback();
        await macroTask();

        expect(fetchJsonStub.calledWithExactly(srcUrl, {})).to.be.true;
        expect(registerSpy.calledWith(element, config)).to.be.true;
      });
    });

    describe('AdSense config', () => {
      it('errors without client', () => {
        const error =
          'amp-next-page AdSense client should be of the format ' +
          "'ca-pub-123456'";
        expectAsyncConsoleError(error);
        element.setAttribute('type', 'adsense');
        element.setAttribute('data-slot', '12345');
        return nextPage.buildCallback().should.be.rejectedWith(error);
      });

      it('errors without slot', () => {
        const error = 'amp-next-page AdSense slot should be a number';
        expectAsyncConsoleError(error);
        element.setAttribute('type', 'adsense');
        element.setAttribute('data-client', 'ca-pub-12345');
        return nextPage.buildCallback().should.be.rejectedWith(error);
      });

      it('errors for invalid client format', () => {
        const error =
          'amp-next-page AdSense client should be of the format ' +
          "'ca-pub-123456'";
        expectAsyncConsoleError(error);
        element.setAttribute('type', 'adsense');
        element.setAttribute('data-client', 'doggos');
        element.setAttribute('data-slot', '12345');
        return nextPage.buildCallback().should.be.rejectedWith(error);
      });

      it('errors for invalid slot format', () => {
        const error = 'amp-next-page AdSense slot should be a number';
        expectAsyncConsoleError(error);
        element.setAttribute('type', 'adsense');
        element.setAttribute('data-client', 'ca-pub-12345');
        element.setAttribute('data-slot', 'doggos');
        return nextPage.buildCallback().should.be.rejectedWith(error);
      });
    });

    describe('valid AdSense config', () => {
      const client = 'ca-pub-12345';
      const slot = '12345';
      let url;

      beforeEach(() => {
        ampdoc.getUrl = () => 'https://example.com/parent';
        element.setAttribute('type', 'adsense');
        element.setAttribute('data-client', client);
        element.setAttribute('data-slot', slot);

        url =
          'https://googleads.g.doubleclick.net/pagead/ads?' +
          `client=${client}&slotname=${slot}` +
          `&url=${encodeURIComponent(ampdoc.getUrl())}` +
          '&ecr=1&crui=title&is_amp=3&output=xml';
      });

      it('fetches recommendations from AdSense', async () => {
        fetchDocumentMock
          .expects('fetchDocument')
          .withExactArgs(win, url, {credentials: 'include'})
          .returns(
            Promise.resolve(
              createXmlDoc(`
<GSP VER="3.2">
  <ADS>
    <AD n="1" type="text/narrow"
        url="https://googleads.g.doubleclick.net/aclk?adurl=https://example.com/article"
        visible_url="https://example.com/article">
    <LINE1>
      Page title
    </LINE1>
    <LINE2/>
    <LINE3/>
    <BIDTYPE>CPM</BIDTYPE>
    <MEDIA_TEMPLATE_DATA>
    [ { "core_image_url" : "https://example.com/image.png" } ];
    </MEDIA_TEMPLATE_DATA>
    </AD>
  </ADS>
</GSP>`)
            )
          );

        const config = {
          pages: [
            {
              ampUrl:
                'https://googleads.g.doubleclick.net/aclk?adurl=https://example.com/article',
              title: 'Page title',
              image: 'https://example.com/image.png',
            },
          ],
        };

        const nextPageService = await getServicePromiseForDoc(
          ampdoc,
          'next-page'
        );
        const registerSpy = env.sandbox.spy(nextPageService, 'register');

        await nextPage.buildCallback();
        await macroTask();

        expect(registerSpy.calledWith(element, config)).to.be.true;
      });

      it('makes an unpersonalized request if missing consent', async () => {
        fetchDocumentMock
          .expects('fetchDocument')
          .withExactArgs(win, url, {credentials: 'omit'})
          .returns(Promise.resolve());
        element.setAttribute('data-block-on-consent', true);
        await nextPage.buildCallback();
      });

      it('filters pages with visible_urls from different origins', async () => {
        fetchDocumentMock
          .expects('fetchDocument')
          .withExactArgs(win, url, {credentials: 'include'})
          .returns(
            Promise.resolve(
              createXmlDoc(`
<GSP VER="3.2">
  <ADS>
    <AD n="1" type="text/narrow"
        url="https://googleads.g.doubleclick.net/aclk?adurl=https://other.com/article"
        visible_url="https://other.com/article">
    <LINE1>
      Other 1
    </LINE1>
    <LINE2/>
    <LINE3/>
    <BIDTYPE>CPM</BIDTYPE>
    <MEDIA_TEMPLATE_DATA>
    [ { "core_image_url" : "https://other.com/image1.png" } ];
    </MEDIA_TEMPLATE_DATA>
    </AD>
    <AD n="2" type="text/narrow"
        url="https://googleads.g.doubleclick.net/aclk?adurl=https://example.com/article"
        visible_url="https://example.com/article">
    <LINE1>
      Example 1
    </LINE1>
    <LINE2/>
    <LINE3/>
    <BIDTYPE>CPM</BIDTYPE>
    <MEDIA_TEMPLATE_DATA>
    [ { "core_image_url" : "https://example.com/image2.png" } ];
    </MEDIA_TEMPLATE_DATA>
    </AD>
    <AD n="3" type="text/narrow"
        url="https://googleads.g.doubleclick.net/aclk?adurl=https://other2.com/article"
        visible_url="https://other2.com/article">
    <LINE1>
      Other 2
    </LINE1>
    <LINE2/>
    <LINE3/>
    <BIDTYPE>CPM</BIDTYPE>
    <MEDIA_TEMPLATE_DATA>
    [ { "core_image_url" : "https://other2.com/image3.png" } ];
    </MEDIA_TEMPLATE_DATA>
    </AD>
  </ADS>
</GSP>`)
            )
          );

        const config = {
          pages: [
            {
              ampUrl:
                'https://googleads.g.doubleclick.net/aclk?adurl=https://example.com/article',
              title: 'Example 1',
              image: 'https://example.com/image2.png',
            },
          ],
        };

        const nextPageService = await getServicePromiseForDoc(
          ampdoc,
          'next-page'
        );
        const registerSpy = env.sandbox.spy(nextPageService, 'register');

        await nextPage.buildCallback();
        await macroTask();

        expect(registerSpy.calledWith(element, config)).to.be.true;
      });

      it('falls back to inline config pages if the AdSense request fails', async () => {
        const config = {
          pages: [
            {
              ampUrl: 'https://example.com/fallback',
              title: 'Fallback article',
              image: 'https://example.com/fallback.png',
            },
          ],
        };
        env.fetchMock.get('*', 404);

        element.innerHTML = `<script type="application/json">
                                 ${JSON.stringify(config)}
                               </script>`;

        const nextPageService = await getServicePromiseForDoc(
          ampdoc,
          'next-page'
        );
        const registerSpy = env.sandbox.spy(nextPageService, 'register');

        await nextPage.buildCallback();
        await macroTask();

        expect(registerSpy.calledWith(element, config)).to.be.true;
      });
    });

    describe('manual visibility management', () => {
      beforeEach((done) => {
        element.innerHTML = `
          <script type="application/json">
            {
              "pages": [
                {
                  "image": "/examples/img/hero@1x.jpg",
                  "title": "Title 1",
                  "ampUrl": "/document1"
                },
                {
                  "image": "/examples/img/hero@1x.jpg",
                  "title": "Title 2",
                  "ampUrl": "/document2"
                }
              ],
              "hideSelectors": [
                "header",
                "footer"
              ]
            }
          </script>`;
        nextPage.buildCallback().then(done);
      });

      it('defaults to the prerender visibility state for the next document', async () => {
        env.fetchMock.get('*', EXAMPLE_PAGE);

        const nextPageService = await getServicePromiseForDoc(
          ampdoc,
          'next-page'
        );
        const attachShadowDocSpy = env.sandbox.spy(
          nextPageService.multidocManager_,
          'attachShadowDoc'
        );

        env.sandbox
          .stub(viewport, 'getClientRectAsync')
          .onFirstCall()
          // 1x viewport away
          .resolves(layoutRectLtwh(0, 0, sizes.width, sizes.height * 2));

        win.dispatchEvent(new Event('scroll'));
        await sleep(10);

        const shadowDoc = attachShadowDocSpy.firstCall.returnValue.ampdoc;
        await shadowDoc.whenReady();

        expect(shadowDoc.getVisibilityState()).to.equal(
          VisibilityState_Enum.PRERENDER
        );
      });
    });
  }
);

/**
 * Creates a new XML document from the specified XML text.
 * @param {string} text XML document text.
 * @return {!Document} New XML document.
 */
function createXmlDoc(text) {
  const parser = new DOMParser();
  return parser.parseFromString(text, 'text/xml');
}
