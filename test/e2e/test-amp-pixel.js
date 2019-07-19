/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

describes.endtoend(
  'amp-pixel',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-pixel/pixel.html?a=123',
    environments: ['single'],
  },
  async env => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    describe('amp-pixel macro integration test', () => {
      it('should expand the TITLE macro', async () => {
        await expect(controller.getNetworkRequest('hello-world')).to.include({
          path: '/hello-world?title=AMP%20TEST&qp=123',
        });
        // expect(req.headers.host).to.be.ok;
      });

      // await expect(controller.getNetworkRequest('pixel')).to.include({
      //   url: '/foo?cid=',
      // });
      // await expect(analyticsReq.url).to.match(/^\/bar\?/);

      // const queries = parseQueryString(
      //   analyticsReq.url.substr('/bar'.length)
      // );
      // await expect(queries).to.include({
      //   title: 'AMP TEST', // ${title},
      //   cid: '', // ${clientId(a)}
      //   navTiming: '0', // ${navTiming(requestStart,requestStart)}
      //   navType: '0', // ${navType}
      //   navRedirectCount: '0', // ${navRedirectCount}
      // });
      // await expect(queries['ampdocUrl']).to.contain(
      //   'http://localhost:9876/amp4test/compose-doc?'
      // );
      // await expect(queries['canonicalUrl']).to.equal(
      //   'http://nonblocking.io/'
      // );
      // await expect(queries['img']).to.contain('/deposit/image'); // ${htmlAttr(amp-img,src)}
    });
  }
);

// describe('amp-bind in A4A', env => {
//   it('p[text]', async () => {
//     // Wait for the amp-ad to construct its child iframe.
//     const ad = env.win.document.getElementById('i-amphtml-demo-id');
//     yield poll('amp-ad > iframe', () => ad.querySelector('iframe'));

//     // Wait for the iframe contents to load.
//     const fie = ad.querySelector('iframe').contentWindow;
//     yield poll('iframe > button', () =>
//       fie.document.querySelector('button')
//     );

//     const text = fie.document.querySelector('p');
//     expect(text.textContent).to.equal('123');

//     const button = fie.document.querySelector('button');
//     return poll(
//       '[text]',
//       () => {
//         // We click this too many times but there's no good way to tell whether
//         // amp-bind is initialized yet.
//         button.click();
//         return text.textContent === '456';
//       },
//       /* onError */ undefined,
//       5000
//     );
//   });
// });

// import {AmpPixel} from '../../builtins/amp-pixel';
// import {BrowserController, RequestBank} from '../../testing/test-helper';
// import {Services} from '../../src/services';
// import {createElementWithAttributes} from '../../src/dom';

// describe.configure().run('amp-pixel', function() {
//   describes.integration(
//     'amp-pixel macro integration test',
//     {
//       body: `<amp-pixel
//     src="${RequestBank.getUrl()}hello-world?title=TITLE&qp=QUERY_PARAM(a)">`,
//       params: {
//         a: 123,
//       },
//     },
//     env => {
//       beforeEach(() => {
//         const browser = new BrowserController(env.win);
//         return browser.waitForElementBuild('amp-pixel');
//       });

//       it('should expand the TITLE macro', () => {
//         return RequestBank.withdraw().then(req => {
//           expect(req.url).to.equal('/hello-world?title=AMP%20TEST&qp=123');
//           expect(req.headers.host).to.be.ok;
//         });
//       });
//     }
//   );

//   describes.integration(
//     'amp-pixel referrer integration test',
//     {
//       body: `<amp-pixel src="${RequestBank.getUrl()}">`,
//     },
//     env => {
//       beforeEach(() => {
//         const browser = new BrowserController(env.win);
//         return browser.waitForElementBuild('amp-pixel');
//       });

//       it('should keep referrer if no referrerpolicy specified', () => {
//         return RequestBank.withdraw().then(req => {
//           expect(req.url).to.equal('/');
//           expect(req.headers.referer).to.be.ok;
//         });
//       });
//     }
//   );

//   describes.integration(
//     'amp-pixel no-referrer integration test',
//     {
//       body: `<amp-pixel src="${RequestBank.getUrl()}"
//              referrerpolicy="no-referrer">`,
//     },
//     env => {
//       beforeEach(() => {
//         const browser = new BrowserController(env.win);
//         return browser.waitForElementBuild('amp-pixel');
//       });

//       it('should remove referrer if referrerpolicy=no-referrer', () => {
//         return RequestBank.withdraw().then(req => {
//           expect(req.url).to.equal('/');
//           expect(req.headers.referer).to.not.be.ok;
//         });
//       });
//     }
//   );
// });

// describes.fakeWin('amp-pixel with img (inabox)', {amp: true}, env => {
//   it('should not write image', () => {
//     const src = 'https://foo.com/tracker/foo';
//     const pixelElem = createElementWithAttributes(
//       env.win.document,
//       'amp-pixel',
//       {src, 'i-amphtml-ssr': ''}
//     );
//     pixelElem.appendChild(
//       createElementWithAttributes(env.win.document, 'img', {src})
//     );
//     env.win.document.body.appendChild(pixelElem);
//     const viewer = Services.viewerForDoc(env.win.document);
//     env.sandbox.stub(viewer, 'whenFirstVisible').callsFake(() => {
//       return Promise.resolve();
//     });
//     const pixel = new AmpPixel(pixelElem);
//     pixel.buildCallback();
//     expect(pixelElem.querySelectorAll('img').length).to.equal(1);
//   });
// });
