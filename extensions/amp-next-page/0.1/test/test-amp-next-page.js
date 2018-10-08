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
import * as DocFetcher from '../../../../src/document-fetcher';
import {AmpNextPage} from '../amp-next-page';
import {Services} from '../../../../src/services';
import {getServicePromiseForDoc} from '../../../../src/service';
import {layoutRectLtwh} from '../../../../src/layout-rect';
import {macroTask} from '../../../../testing/yield';
import {setStyle} from '../../../../src/style';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('amp-next-page component', {
  amp: {
    extensions: ['amp-next-page'],
  },
},
env => {
  let win, doc, ampdoc;
  let element;
  let nextPage;
  let xhrMock;
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
    element.getResources = () => win.services.resources.obj;

    doc.body.appendChild(element);
    nextPage = new AmpNextPage(element);

    ampdoc.getUrl = () => document.location.href;

    xhrMock = sandbox.mock(Services.xhrFor(win));
    fetchDocumentMock = sandbox.mock(DocFetcher);
    sandbox.stub(Services.resourcesForDoc(ampdoc), 'mutateElement')
        .callsFake((unused, mutator) => {
          mutator();
          return Promise.resolve();
        });
    sandbox.stub(nextPage, 'mutateElement').callsFake(mutator => {
      mutator();
      return Promise.resolve();
    });
  });

  afterEach(() => {
    xhrMock.verify();
    fetchDocumentMock.verify();
    toggleExperiment(win, 'amp-next-page', false);
  });

  describe('valid inline config', () => {
    beforeEach(done => {
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

    it('does not fetch the next document before 3 viewports away',
        function* () {
          fetchDocumentMock.expects('fetchDocument').never();
          sandbox.stub(viewport, 'getClientRectAsync').callsFake(() => {
            // 4x viewports away
            return Promise.resolve(
                layoutRectLtwh(0, 0, sizes.width, sizes.height * 5));
          });

          win.dispatchEvent(new Event('scroll'));
          yield macroTask();
        });

    it('fetches the next document within 3 viewports away', function* () {
      fetchDocumentMock.expects('fetchDocument').returns(Promise.resolve());

      sandbox.stub(viewport, 'getClientRectAsync').callsFake(() => {
        // 1x viewport away
        return Promise.resolve(
            layoutRectLtwh(0, 0, sizes.width, sizes.height * 2));
      });

      win.dispatchEvent(new Event('scroll'));
      yield macroTask();
    });

    it('only fetches the next document once', function*() {
      fetchDocumentMock.expects('fetchDocument')
          // Promise which is never resolved.
          .returns(new Promise(() => {}))
          .once();

      sandbox.stub(viewport, 'getClientRectAsync').callsFake(() => {
        // 1x viewport away
        return Promise.resolve(
            layoutRectLtwh(0, 0, sizes.width, sizes.height * 2));
      });

      win.dispatchEvent(new Event('scroll'));
      yield macroTask();
      win.dispatchEvent(new Event('scroll'));
      yield macroTask();
    });

    it('adds the hidden class to hideSelector elements', function* () {
      const exampleDoc = createExampleDocument(doc);
      fetchDocumentMock.expects('fetchDocument')
          .returns(Promise.resolve(exampleDoc))
          .once();

      const nextPageService =
          yield getServicePromiseForDoc(ampdoc, 'next-page');
      const attachShadowDocSpy =
          sandbox.spy(nextPageService.multidocManager_, 'attachShadowDoc');

      sandbox.stub(viewport, 'getClientRectAsync')
          .onFirstCall().callsFake(() => {
            // 1x viewport away
            return Promise.resolve(
                layoutRectLtwh(0, 0, sizes.width, sizes.height * 2));
          });

      win.dispatchEvent(new Event('scroll'));
      yield macroTask();

      const shadowDoc = attachShadowDocSpy.firstCall.returnValue.ampdoc;
      yield shadowDoc.whenReady();

      const shadowRoot = shadowDoc.getRootNode();

      expect(shadowRoot.querySelector('header'))
          .to.have.class('i-amphtml-next-page-hidden');

      expect(shadowRoot.querySelector('footer'))
          .to.have.class('i-amphtml-next-page-hidden');
    });

    it('removes amp-analytics tags from child documents', function* () {
      const exampleDoc = createExampleDocument(doc);
      exampleDoc.body.innerHTML +=
          '<amp-analytics id="analytics1"></amp-analytics>';
      exampleDoc.body.innerHTML +=
          '<amp-analytics id="analytics2"></amp-analytics>';
      fetchDocumentMock.expects('fetchDocument')
          .returns(Promise.resolve(exampleDoc))
          .once();
      const nextPageService =
          yield getServicePromiseForDoc(ampdoc, 'next-page');
      const attachShadowDocSpy =
          sandbox.spy(nextPageService.multidocManager_, 'attachShadowDoc');
      sandbox.stub(viewport, 'getClientRectAsync')
          .onFirstCall().callsFake(() => {
            // 1x viewport away
            return Promise.resolve(
                layoutRectLtwh(0, 0, sizes.width, sizes.height * 2));
          });
      win.dispatchEvent(new Event('scroll'));
      yield macroTask();
      const shadowDoc = attachShadowDocSpy.firstCall.returnValue.ampdoc;
      yield shadowDoc.whenReady();
      const shadowRoot = shadowDoc.getRootNode();
      expect(shadowRoot.getElementById('analytics1')).to.be.null;
      expect(shadowRoot.getElementById('analytics2')).to.be.null;
    });
  });

  describe('remote config', () => {
    it('errors when no config specified', () => {
      return nextPage.buildCallback().should.be.rejectedWith(
          'amp-next-page should contain only one <script> child, or a URL '
          + 'specified in [src]​​​');
    });

    it('fetches remote config when specified in src', function* () {
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

      const fetchJsonStub =
          sandbox.stub(Services.batchedXhrFor(win), 'fetchJson')
              .resolves({
                ok: true,
                json() {
                  return Promise.resolve(config);
                },
              });
      const nextPageService =
          yield getServicePromiseForDoc(ampdoc, 'next-page');
      const registerSpy = sandbox.spy(nextPageService, 'register');

      yield nextPage.buildCallback();
      yield macroTask();

      expect(fetchJsonStub.calledWithExactly(
          srcUrl, {requireAmpResponseSourceOrigin: false})).to.be.true;
      expect(registerSpy.calledWith(element, config)).to.be.true;
    });
  });
});

/**
 * Creates an example document as a child of {@code doc} to be embedded as a
 * shadow document.
 * @param {!Document} doc Parent document to use to create new elements.
 * @return {!Document} New {@code DocumentFragment} with example content.
 */
function createExampleDocument(doc) {
  const childDoc = doc.createDocumentFragment();
  const head = doc.createElement('head');
  const body = doc.createElement('body');
  childDoc.appendChild(head);
  childDoc.appendChild(body);
  childDoc.head = head;
  childDoc.body = body;

  childDoc.body.innerHTML = `
      <header>Header</header>
      <div style="height:1000px"></div>
      <footer>Footer</footer>`;
  return childDoc;
}
