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

import {
  addDocumentVisibilityChangeListener,
  getDocumentVisibilityState,
  isDocumentHidden,
  removeDocumentVisibilityChangeListener,
} from '../../../src/utils/document-visibility';

describes.sandboxed('document-visibility', {}, () => {
  let doc;

  beforeEach(() => {
    doc = {
      addEventListener: sandbox.spy(),
      removeEventListener: sandbox.spy(),
    };
  });

  function prop(name, value) {
    Object.defineProperty(doc, name, {value});
  }

  it('should be visible when no properties defined', () => {
    expect(isDocumentHidden(doc)).to.be.false;
    expect(getDocumentVisibilityState(doc)).to.equal('visible');
  });

  it('should resolve non-vendor hidden property', () => {
    prop('hidden', true);
    expect(isDocumentHidden(doc)).to.be.true;
    expect(getDocumentVisibilityState(doc)).to.equal('hidden');
  });

  it('should resolve non-vendor visibilityState property', () => {
    prop('visibilityState', 'hidden');
    expect(isDocumentHidden(doc)).to.be.true;
    expect(getDocumentVisibilityState(doc)).to.equal('hidden');
  });

  it('should prefer visibilityState property to hidden', () => {
    prop('hidden', true);
    prop('visibilityState', 'visible');
    expect(isDocumentHidden(doc)).to.be.false;
    expect(getDocumentVisibilityState(doc)).to.equal('visible');
  });

  it('should consider prerender as visible', () => {
    prop('visibilityState', 'prerender');
    expect(isDocumentHidden(doc)).to.be.true;
    expect(getDocumentVisibilityState(doc)).to.equal('prerender');
  });

  it('should resolve non-vendor visibilitychange event', () => {
    function handler() {}
    prop('onvisibilitychange', null);

    addDocumentVisibilityChangeListener(doc, handler);
    expect(doc.addEventListener).to.be.calledOnce.calledWith(
      'visibilitychange',
      handler
    );

    removeDocumentVisibilityChangeListener(doc, handler);
    expect(doc.removeEventListener).to.be.calledOnce.calledWith(
      'visibilitychange',
      handler
    );
  });

  it('should resolve vendor hidden property', () => {
    prop('webkitHidden', true);
    expect(isDocumentHidden(doc)).to.be.true;
    expect(getDocumentVisibilityState(doc)).to.equal('hidden');
  });

  it('should resolve vendor visibilityState property', () => {
    prop('webkitVisibilityState', 'prerender');
    expect(isDocumentHidden(doc)).to.be.true;
    expect(getDocumentVisibilityState(doc)).to.equal('prerender');
  });

  it('should resolve vendor visibilitychange event', () => {
    function handler() {}
    prop('webkitHidden', true);
    prop('onwebkitvisibilitychange', null);

    addDocumentVisibilityChangeListener(doc, handler);
    expect(doc.addEventListener).to.be.calledOnce.calledWith(
      'webkitVisibilitychange',
      handler
    );

    removeDocumentVisibilityChangeListener(doc, handler);
    expect(doc.removeEventListener).to.be.calledOnce.calledWith(
      'webkitVisibilitychange',
      handler
    );
  });
});
