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

import {AmpDocShadow} from '../../src/service/ampdoc-impl';
import {ampdocFor} from '../../src/ampdoc';
import {createShadowEmbedRoot} from '../../src/shadow-embed';
import {extensionsFor} from '../../src/extensions';
import * as sinon from 'sinon';


describe('createShadowEmbedRoot', () => {
  let sandbox;
  let extensionsMock;
  let hostElement;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const extensions = extensionsFor(window);
    extensionsMock = sandbox.mock(extensions);

    hostElement = document.createElement('div');
    if (!hostElement.createShadowRoot) {
      hostElement.createShadowRoot = () => {
        const shadowRoot = document.createElement('shadow');
        hostElement.appendChild(shadowRoot);
        hostElement.shadowRoot = shadowRoot;
        shadowRoot.host = hostElement;
      };
    }

    const root = document.createElement('div');
    const style = document.createElement('style');
    style.setAttribute('amp-runtime', '');
    root.appendChild(style);
    const ampdoc = new AmpDocShadow(window, root);
    const ampdocService = ampdocFor(window);
    sandbox.stub(ampdocService, 'getAmpDoc', () => ampdoc);
  });

  afterEach(() => {
    extensionsMock.verify();
    sandbox.restore();
  });

  it('should clear duplicate root', () => {
    const shadowRoot1 = createShadowEmbedRoot(hostElement, []);
    const span = document.createElement('span');
    shadowRoot1.appendChild(span);
    expect(shadowRoot1.contains(span)).to.be.true;

    const shadowRoot2 = createShadowEmbedRoot(hostElement, []);
    expect(shadowRoot2).to.equal(shadowRoot1);
    expect(shadowRoot2.contains(span)).to.be.false;
  });

  it('should create shadow root and context', () => {
    const shadowRoot = createShadowEmbedRoot(hostElement, []);
    expect(shadowRoot).to.exist;
    expect(shadowRoot.AMP).to.exist;
  });

  it('should install runtime styles', () => {
    const shadowRoot = createShadowEmbedRoot(hostElement, []);
    expect(shadowRoot.querySelector('style[amp-runtime]')).to.exist;
  });

  it('should install extensions', () => {
    extensionsMock.expects('loadExtension')
        .withExactArgs('amp-ext1')
        .returns(Promise.resolve({}))
        .once();
    let savedShadowRoot;
    extensionsMock.expects('installFactoriesInShadowRoot')
        .withExactArgs(sinon.match(arg => {
          savedShadowRoot = arg;
          return true;
        }), ['amp-ext1'])
        .returns(Promise.resolve())
        .once();
    const shadowRoot = createShadowEmbedRoot(hostElement, ['amp-ext1']);
    expect(savedShadowRoot).to.equal(shadowRoot);
  });
});
