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

describes.sandboxed('document-visibility', {}, (env) => {
  let doc;

  beforeEach(() => {
    doc = {
      addEventListener: env.sandbox.spy(),
      removeEventListener: env.sandbox.spy(),
    };
  });

  function overridePropertyForDoc(name, value) {
    env.sandbox.defineProperty(doc, name, {value});
  }

  it('should be visible when no properties defined', () => {
    expect(isDocumentHidden(doc)).to.be.false;
    expect(getDocumentVisibilityState(doc)).to.equal('visible');
  });

  it('should resolve non-vendor hidden property', () => {
    overridePropertyForDoc('hidden', true);
    expect(isDocumentHidden(doc)).to.be.true;
    expect(getDocumentVisibilityState(doc)).to.equal('hidden');
  });

  it('should resolve non-vendor visibilityState property', () => {
    overridePropertyForDoc('visibilityState', 'hidden');
    expect(isDocumentHidden(doc)).to.be.true;
    expect(getDocumentVisibilityState(doc)).to.equal('hidden');
  });

  it('should prefer visibilityState property to hidden', () => {
    overridePropertyForDoc('hidden', true);
    overridePropertyForDoc('visibilityState', 'visible');
    expect(isDocumentHidden(doc)).to.be.false;
    expect(getDocumentVisibilityState(doc)).to.equal('visible');
  });

  it('should consider prerender as visible', () => {
    overridePropertyForDoc('visibilityState', 'prerender');
    expect(isDocumentHidden(doc)).to.be.true;
    expect(getDocumentVisibilityState(doc)).to.equal('prerender');
  });

  it('should resolve non-vendor visibilitychange event', () => {
    function handler() {}
    overridePropertyForDoc('onvisibilitychange', null);

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
    overridePropertyForDoc('webkitHidden', true);
    expect(isDocumentHidden(doc)).to.be.true;
    expect(getDocumentVisibilityState(doc)).to.equal('hidden');
  });

  it('should resolve vendor visibilityState property', () => {
    overridePropertyForDoc('webkitVisibilityState', 'prerender');
    expect(isDocumentHidden(doc)).to.be.true;
    expect(getDocumentVisibilityState(doc)).to.equal('prerender');
  });

  it('should resolve vendor visibilitychange event', () => {
    function handler() {}
    overridePropertyForDoc('webkitHidden', true);
    overridePropertyForDoc('onwebkitvisibilitychange', null);

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
