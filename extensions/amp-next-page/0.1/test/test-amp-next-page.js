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

import {AmpNextPage} from '../amp-next-page';
import {Services} from '../../../../src/services';
import {getService} from '../../../../src/service';
import {layoutRectLtwh} from '../../../../src/layout-rect';
import {macroTask} from '../../../../testing/yield';
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
  let viewport;
  let sizes;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    viewport = Services.viewportForDoc(ampdoc);
    sizes = viewport.getSize();

    toggleExperiment(win, 'amp-next-page', true);

    element = doc.createElement('div');
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
    element.getAmpDoc = () => ampdoc;
    element.getFallback = () => null;
    element.getResources = () => win.services.resources.obj;

    nextPage = new AmpNextPage(element);
    doc.body.appendChild(element);

    // sourceUrl is set to about:srcdoc, which has no host.
    sandbox.stub(Services.documentInfoForDoc(element), 'sourceUrl').value('/');
    nextPage.buildCallback();

    xhrMock = sandbox.mock(Services.xhrFor(win));

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
  });

  afterEach(() => {
    toggleExperiment(win, 'amp-next-page', false);
  });

  it('does not fetch the next document before 3 viewports away', function* () {
    xhrMock.expects('fetchDocument').never();
    sandbox.stub(viewport, 'getClientRectAsync').callsFake(() => {
      // 4x viewports away
      return Promise.resolve(
          layoutRectLtwh(0, 0, sizes.width, sizes.height * 5));
    });

    win.dispatchEvent(new Event('scroll'));
    yield macroTask();
  });

  it('fetches the next document within 3 viewports away', function* () {
    xhrMock.expects('fetchDocument').returns(Promise.resolve());

    sandbox.stub(viewport, 'getClientRectAsync').callsFake(() => {
      // 1x viewport away
      return Promise.resolve(
          layoutRectLtwh(0, 0, sizes.width, sizes.height * 2));
    });

    win.dispatchEvent(new Event('scroll'));
    yield macroTask();
  });

  it('only fetches the next document once', function*() {
    xhrMock.expects('fetchDocument')
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
    xhrMock.expects('fetchDocument')
        .returns(Promise.resolve(exampleDoc))
        .once();

    const nextPageService = getService(win, 'next-page');
    const attachShadowDocSpy =
        sandbox.spy(nextPageService.multidocManager_, 'attachShadowDoc');

    sandbox.stub(viewport, 'getClientRectAsync').callsFake(() => {
      // 1x viewport away
      return Promise.resolve(
          layoutRectLtwh(0, 0, sizes.width, sizes.height * 2));
    });

    win.dispatchEvent(new Event('scroll'));
    yield macroTask();

    const shadowDoc = attachShadowDocSpy.firstCall.returnValue.ampdoc;
    yield shadowDoc.whenReady();

    const shadowRoot = shadowDoc.getRootNode();

    expect(
        shadowRoot.querySelector('header').classList.contains(
            'i-amphtml-next-page-hidden'))
        .to.be.true;
    expect(
        shadowRoot.querySelector('footer').classList.contains(
            'i-amphtml-next-page-hidden'))
        .to.be.true;
  });
});

/**
 * Creates an example document as a child of {@code doc} to be embedded as a
 * shadow document.
 * @param {!Document} doc Parent document to use to create new elements.
 * @returns {!Document} New {@code DocumentFragment} with example content.
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
