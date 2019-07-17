/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

// import {parseQueryString} from '../../src/url';

describes.endtoend(
  'A4A',
  {
    testUrl: 'http://localhost:8000/test/fixtures/e2e/amp-ad/fake.html',
    environments: ['single'],
  },
  async env => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    describe('AMPHTML ads rendered on AMP page', () => {
      it('should layout amp-img, amp-pixel, amp-analytics', async () => {
        // See amp4test.js for creative content
        // const imageReq = await controller.getNetworkRequest('image');
        // const pixelReq = await controller.getNetworkRequest('pixel');
        // const analyticsReq = await controller.getNetworkRequest('analytics');
        await expect(controller.getNetworkRequest('image', 'url')).to.equal(
          '/'
        );
        await expect(controller.getNetworkRequest('pixel', 'url')).to.include(
          '/foo?cid='
        );
        // await expect(analyticsReq.url).to.match(/^\/bar\?/);
        console.log(await controller.getNetworkRequest('analytics'));

        await expect(controller.getNetworkRequest('analytics')).to.include({
          title: 'AMP TEST', // ${title},
          cid: '', // ${clientId(a)}
          navTiming: '0', // ${navTiming(requestStart,requestStart)}
          navType: '0', // ${navType}
          navRedirectCount: '0', // ${navRedirectCount}
        });
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
    });

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
  }
);
