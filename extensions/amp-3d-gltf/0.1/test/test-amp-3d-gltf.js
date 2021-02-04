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

import '../amp-3d-gltf';
import {createIframeWithMessageStub} from '../../../../testing/iframe';

describes.realWin(
  'amp-3d-gltf',
  {
    amp: {
      extensions: ['amp-3d-gltf'],
    },
    allowExternalResources: true,
  },
  (env) => {
    let win;
    let doc;
    let iframe;
    let testIndex = 0;
    let sendFakeMessage = () => {};

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      testIndex++;
      const sentinel = 'amp3ptest' + testIndex;
      iframe = createIframeWithMessageStub(win);
      iframe.setAttribute('data-amp-3p-sentinel', sentinel);
      iframe.name = 'test_nomaster';

      sendFakeMessage = (type) => {
        return new Promise((resolve) => {
          iframe.postMessageToParent({sentinel, type});
          setTimeout(resolve, 100);
        });
      };
    });

    const createElement = async () => {
      const amp3dGltfEl = doc.createElement('amp-3d-gltf');
      amp3dGltfEl.setAttribute('src', 'https://fake.com/fake.gltf');
      amp3dGltfEl.setAttribute('layout', 'fixed');
      amp3dGltfEl.setAttribute('width', '320');
      amp3dGltfEl.setAttribute('height', '240');

      doc.body.appendChild(amp3dGltfEl);
      await amp3dGltfEl.buildInternal();

      const amp3dGltf = await amp3dGltfEl.getImpl();
      env.sandbox
        .stub(amp3dGltf, 'iframe_')
        .get(() => iframe)
        .set(() => {});

      const willLayout = amp3dGltfEl.layoutCallback();

      await sendFakeMessage('ready');
      await sendFakeMessage('loaded');
      await willLayout;
      return amp3dGltf;
    };

    // TODO (#16080): this test keeps timing out for some reason.
    // Unskip when we figure out root cause.
    it.skip('renders iframe', async () => {
      await createElement();
      expect(!!doc.body.querySelector('amp-3d-gltf > iframe')).to.be.true;
    });

    // TODO (#16080): this test times out on CI. Re-enable when fixed.
    it.skip('sends toggleAmpViewport(false) when exiting viewport', async () => {
      const amp3dGltf = await createElement();

      const postMessageSpy = env.sandbox.spy(amp3dGltf, 'postMessage_');
      await amp3dGltf.viewportCallback(false);
      expect(postMessageSpy.calledOnce).to.be.true;
      expect(postMessageSpy.firstCall.args[0]).to.equal('action');
      expect(postMessageSpy.firstCall.args[1].action).to.equal(
        'toggleAmpViewport'
      );
      expect(postMessageSpy.firstCall.args[1].args).to.be.false;
    });

    // TODO (#16080): this test times out on CI. Re-enable when fixed.
    it.skip('sends toggleAmpViewport(true) when entering viewport', async () => {
      const amp3dGltf = await createElement();
      const postMessageSpy = env.sandbox.spy(amp3dGltf, 'postMessage_');
      await amp3dGltf.viewportCallback(true);
      expect(postMessageSpy.calledOnce).to.be.true;
      expect(postMessageSpy.firstCall.args[0]).to.equal('action');
      expect(postMessageSpy.firstCall.args[1].action).to.equal(
        'toggleAmpViewport'
      );
      expect(postMessageSpy.firstCall.args[1].args).to.be.true;
    });
  }
);
