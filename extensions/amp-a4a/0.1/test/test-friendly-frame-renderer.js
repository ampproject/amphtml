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

import {FriendlyFrameRenderer} from '../friendly-frame-renderer';

const realWinConfig = {
  amp: {},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('FriendlyFrameRenderer', realWinConfig, env => {

  const minifiedCreative = '<p>Hello, World!</p>';

  let containerElement;
  let context;
  let creativeData;
  let renderer;
  let renderPromise;

  beforeEach(() => {
    context = {
      size: {width: '320', height: '50'},
      requestUrl: 'http://www.google.com',
      ampDoc: env.ampdoc,
      applyFillContent: () => {},
      isInViewport: () => true,
    };
    creativeData = {
      creativeMetaData: {
        minifiedCreative,
        customElementExtensions: [],
        extensions: [],
      },
    };

    renderer = new FriendlyFrameRenderer();
    containerElement = document.createElement('div');
    containerElement.signals = () => ({
      whenSignal: () => Promise.resolve(),
    });
    containerElement.renderStarted = () => {};
    containerElement.getLayoutBox = () => ({
      left: 0, top: 0, width: 0, height: 0,
    });
    document.body.appendChild(containerElement);

    renderPromise = renderer.render(context, containerElement, creativeData);
  });

  afterEach(() => {
    document.body.removeChild(containerElement);
  });

  it('should append iframe child', () => {
    return renderPromise.then(() => {
      const iframe = containerElement.querySelector('iframe');
      expect(iframe).to.be.ok;
      expect(iframe.contentWindow.document.body.innerHTML)
          .to.equal(minifiedCreative);
    });
  });

  it('should set the correct srcdoc on the iframe', () => {
    const srcdoc = '<base href="http://www.google.com">'
        + '<meta http-equiv=Content-Security-Policy content="script-src '
        + '\'none\';object-src \'none\';child-src \'none\'">'
        + '<p>Hello, World!</p>';
    return renderPromise.then(() => {
      const iframe = containerElement.querySelector('iframe');
      expect(iframe).to.be.ok;
      expect(iframe.getAttribute('srcdoc')).to.equal(srcdoc);
    });
  });

  it('should set correct attributes on the iframe', () => {
    return renderPromise.then(() => {
      const iframe = containerElement.querySelector('iframe');
      expect(iframe).to.be.ok;
      expect(iframe.getAttribute('width')).to.equal('320');
      expect(iframe.getAttribute('height')).to.equal('50');
      expect(iframe.getAttribute('frameborder')).to.equal('0');
      expect(iframe.getAttribute('allowfullscreen')).to.equal('');
      expect(iframe.getAttribute('allowtransparency')).to.equal('');
      expect(iframe.getAttribute('scrolling')).to.equal('no');
    });
  });

  it('should style body of iframe document to be visible', () => {
    return renderPromise.then(() => {
      const iframe = containerElement.querySelector('iframe');
      expect(iframe).to.be.ok;
      expect(iframe.contentWindow.document.body.style.visibility)
          .to.equal('visible');
    });
  });
});
