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

import {
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-graphiq';
import {adopt} from '../../../../src/runtime';
import * as sinon from 'sinon';

adopt(window);

describe('amp-graphiq', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getGraphiq(widgetId, opt_responsive, opt_beforeLayoutCallback) {
    return createIframePromise(true, opt_beforeLayoutCallback).then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const graphiq = iframe.doc.createElement('amp-graphiq');
      graphiq.setAttribute('data-widget-id', widgetId);
      graphiq.setAttribute('width', '600');
      graphiq.setAttribute('height', '512');
      graphiq.setAttribute('alt', 'Testing');
      if (opt_responsive) {
        graphiq.setAttribute('layout', 'responsive');
      }
      // Placeholder
      const img = iframe.doc.createElement('amp-img');
      img.setAttribute('layout', 'fill');
      img.setAttribute('src', 'https://i.ytimg.com/vi/cMcCTVAFBWM/hqdefault.jpg');
      img.setAttribute('placeholder', '');
      graphiq.appendChild(img);

      graphiq.implementation_.getVsync = () => {
        return {
          mutate(cb) { cb(); },
          measure(cb) { cb(); },
          runPromise(task, state = {}) {
            if (task.measure) {
              task.measure(state);
            }
            if (task.mutate) {
              task.mutate(state);
            }
            return Promise.resolve();
          },
        };
      };
      return iframe.addElement(graphiq);
    });
  }

  function testImage(image) {
    expect(image).to.not.be.null;
    expect(image.getAttribute('src')).to.equal(
        'https://i.ytimg.com/vi/cMcCTVAFBWM/hqdefault.jpg');
    expect(image.getAttribute('layout')).to.equal('fill');
    // expect(image.getAttribute('alt')).to.equal('Testing');
    // expect(image.getAttribute('referrerpolicy')).to.equal('origin');
  }

  function testIframe(iframe) {
    expect(iframe).to.not.be.null;
    expect(iframe.src).to.equal('https://w.graphiq.com/w/dUuriXJo2qx' +
      '?data-width=600&data-height=512' +
      '&data-href=https%3A%2F%2Fwww.graphiq.com%2Fvlp%2FdUuriXJo2qx');
    expect(iframe.className).to.match(/i-amphtml-fill-content/);
    expect(iframe.getAttribute('title')).to.equal('Graphiq: Testing');
  }

  it('renders', () => {
    return getGraphiq('dUuriXJo2qx').then(graphiq => {
      testIframe(graphiq.querySelector('iframe'));
      testImage(graphiq.querySelector('amp-img'));
    });
  });

  it('removes iframe after unlayoutCallback', () => {
    return getGraphiq('dUuriXJo2qx').then(graphiq => {
      const placeholder = graphiq.querySelector('[placeholder]');
      testIframe(graphiq.querySelector('iframe'));
      const obj = graphiq.implementation_;
      obj.unlayoutCallback();
      expect(graphiq.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.iframePromise_).to.not.exist;
      expect(placeholder.style.display).to.be.equal('');
    });
  });

  it('renders responsively', () => {
    return getGraphiq('dUuriXJo2qx', true).then(graphiq => {
      expect(graphiq.className).to.match(/i-amphtml-layout-responsive/);
    });
  });

  it('requires data-widget-id', () => {
    expect(getGraphiq('')).to.be.rejectedWith(
        /The data-widget-id attribute is required for/);
  });

  it('resizes in response to messages from Graphiq iframe', () => {
    return getGraphiq('dUuriXJo2qx', true).then(graphiq => {
      const impl = graphiq.implementation_;
      const iframe = graphiq.querySelector('iframe');
      const attemptChangeHeight = sandbox.spy(impl, 'attemptChangeHeight');
      const newHeight = 977;

      expect(iframe).to.not.be.null;

      sendFakeHeightMessage(graphiq, iframe, newHeight);

      expect(attemptChangeHeight).to.be.calledOnce;
      expect(attemptChangeHeight.firstCall.args[0]).to.equal(newHeight);
    });
  });

  function sendFakeHeightMessage(graphiq, iframe, height) {
    graphiq.implementation_.handleGraphiqMessages_({
      origin: 'https://w.graphiq.com',
      source: iframe.contentWindow,
      data: JSON.stringify({
        method: 'resize',
        height,
      }),
    });
  }
});
