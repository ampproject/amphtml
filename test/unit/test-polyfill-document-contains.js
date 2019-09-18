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

import {install} from '../../src/polyfills/document-contains';

describe('HTMLDocument.contains', () => {
  let sandbox;
  let fakeWinWithContains;
  let fakeWinWithoutContains;
  let nativeContains;
  let polyfillContains;
  let connectedElement;
  let connectedChild;
  let disconnectedElement;
  let disconnectedChild;

  beforeEach(() => {
    sandbox = sinon.sandbox;

    fakeWinWithContains = {
      HTMLDocument: class {
        contains() {}
      },
      Object: window.Object,
    };
    nativeContains = fakeWinWithContains.HTMLDocument.prototype.contains;

    fakeWinWithoutContains = {
      HTMLDocument: class {},
      Object: window.Object,
    };
    install(fakeWinWithoutContains);
    polyfillContains = fakeWinWithoutContains.HTMLDocument.prototype.contains;

    connectedElement = document.createElement('div');
    connectedChild = document.createElement('div');
    disconnectedElement = document.createElement('div');
    disconnectedChild = document.createElement('div');

    connectedElement.appendChild(connectedChild);
    disconnectedElement.appendChild(disconnectedChild);
    document.body.appendChild(connectedElement);
  });

  afterEach(() => {
    if (connectedElement.parentNode) {
      connectedElement.parentNode.removeChild(connectedElement);
    }
    sandbox.restore();
  });

  it('should NOT override an existing method', () => {
    install(fakeWinWithContains);
    expect(fakeWinWithContains.HTMLDocument.prototype.contains).to.equal(
      nativeContains
    );
  });

  it('should override a existing method', () => {
    expect(polyfillContains).to.be.ok;
    expect(polyfillContains).to.not.equal(nativeContains);
  });

  it('should polyfill document.contains API', () => {
    expect(polyfillContains.call(document, connectedElement)).to.be.true;
    expect(polyfillContains.call(document, connectedChild)).to.be.true;
    expect(polyfillContains.call(document, disconnectedElement)).to.be.false;
    expect(polyfillContains.call(document, disconnectedChild)).to.be.false;
  });

  it('should allow a null arg', () => {
    expect(document.contains(null)).to.be.false;
    expect(polyfillContains.call(document, null)).to.be.false;
  });

  it('should be inclusionary for documentElement', () => {
    expect(document.contains(document.documentElement)).to.be.true;
    expect(polyfillContains.call(document, document.documentElement)).to.be
      .true;
  });

  it('should be inclusionary for document itself', () => {
    expect(document.contains(document)).to.be.true;
    expect(polyfillContains.call(document, document)).to.be.true;
  });
});
