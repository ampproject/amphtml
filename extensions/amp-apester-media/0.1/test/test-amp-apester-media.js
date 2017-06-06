/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-apester-media';
import {adopt} from '../../../../src/runtime';
import {xhrFor} from '../../../../src/services';
import * as sinon from 'sinon';

adopt(window);

describe('amp-apester-media', () => {
  let sandbox;
  let xhrMock;
  let changeSizeSpy;
  let attemptChangeSizeSpy;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

  });

  afterEach(() => {
    if (xhrMock) {
      xhrMock.verify();
    }
    sandbox.restore();
  });

  function getApester(attributes, opt_responsive, opt_beforeLayoutCallback) {
    return createIframePromise(true, opt_beforeLayoutCallback).then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const media = iframe.doc.createElement('amp-apester-media');
      const response = {
        'code': 200,
        'message': 'ok',
        'payload': {
          'interactionId': '57a336dba187a2ca3005e826',
          'data': {
            'size': {'width': '600', 'height': '404'},
          },
          'layout': {
            'id': '557d52c059081084b94845c3',
            'name': 'multi poll two',
            'directive': 'multi-poll-two',
          },
          'language': 'en',
        },
      };
      changeSizeSpy = sandbox.spy(
          media.implementation_, 'changeHeight');
      attemptChangeSizeSpy = sandbox.spy(
          media.implementation_, 'attemptChangeHeight');
      xhrMock = sandbox.mock(xhrFor(iframe.win));
      xhrMock.expects('fetchJson').returns(Promise.resolve({
        json() {
          return Promise.resolve(response);
        },
      }));
      for (const key in attributes) {
        media.setAttribute(key, attributes[key]);

      }
      media.setAttribute('width', '600');
      media.setAttribute('height', '390');
      //todo test width?
      if (opt_responsive) {
        media.setAttribute('layout', 'responsive');
      }
      return iframe.addElement(media);
    });
  }

  it('renders', () => {
    return getApester({
      'data-apester-media-id': '57a336dba187a2ca3005e826',
    }).then(ape => {
      const iframe = ape.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
          'https://renderer.qmerce.com/interaction/57a336dba187a2ca3005e826');
      expect(changeSizeSpy).to.be.calledOnce;
      expect(changeSizeSpy.args[0][0]).to.equal('404');
    });
  });

  it('render playlist', () => {
    return getApester({
      'data-apester-channel-token': '57a36e1e96cd505a7f01ed12',
    }).then(ape => {
      const iframe = ape.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
          'https://renderer.qmerce.com/interaction/57a336dba187a2ca3005e826');
      expect(attemptChangeSizeSpy).to.be.calledOnce;
      expect(attemptChangeSizeSpy.args[0][0]).to.equal('404');
    });
  });

//todo responsive layout isn't fully supported yet, just a stub
  it('renders responsively', () => {
    return getApester({
      'data-apester-media-id': '57a336dba187a2ca3005e826',
      'width': '500',
    }, true).then(ape => {
      const iframe = ape.querySelector('iframe');
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('removes iframe after unlayoutCallback', () => {
    return getApester({
      'data-apester-media-id': '57a336dba187a2ca3005e826',
    }).then(ape => {
      const iframe = ape.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
          'https://renderer.qmerce.com/interaction/57a336dba187a2ca3005e826');
      const tag = ape.implementation_;
      tag.unlayoutCallback();
      expect(ape.querySelector('iframe')).to.be.null;
      expect(tag.iframe_).to.be.null;
    });
  });

  it('requires media-id or channel-token', () => {
    expect(getApester()).to.be.rejectedWith(
        /The media-id attribute is required for/);
  });
});

