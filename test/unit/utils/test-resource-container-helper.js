/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
  forAllWithin,
  loadAll,
  pauseAll,
  unmountAll,
} from '../../../src/utils/resource-container-helper';

const INCLUDE_SELF = true;
const DEEP = true;

describes.realWin('resource-container-helper', {}, (env) => {
  let win, doc;
  let tree;
  let ampGrandparent, ampGrandparentSibling;
  let ampParent, ampParentSibling;
  let ampChild1, ampChild2;

  beforeEach(() => {
    win = env.win;
    doc = win.document;

    tree = doc.createElement('div');
    doc.body.appendChild(tree);

    ampGrandparent = createAmpElement({id: 'grandparent', parent: tree});
    ampGrandparentSibling = createAmpElement({
      id: 'grandparent-sibling',
      parent: tree,
    });
    ampParent = createAmpElement({id: 'parent', parent: ampGrandparent});
    ampParentSibling = createAmpElement({
      id: 'parent-sibling',
      parent: ampGrandparent,
    });
    ampChild1 = createAmpElement({id: 'child1', parent: ampParent});
    ampChild2 = createAmpElement({id: 'child2', parent: ampParent});
  });

  function createAmpElement({id, parent, createPlaceholder = true}) {
    const element = doc.createElement('div');
    element.id = id;
    element.classList.add('i-amphtml-element');

    if (createPlaceholder) {
      const placeholder = doc.createElement('div');
      placeholder.setAttribute('placeholder', '');
      element.appendChild(placeholder);
      const placeholderAmpChild = createAmpElement({
        id: `placeholder-${id}`,
        parent: placeholder,
        createPlaceholder: false,
      });
      element.getPlaceholder = () => placeholder;
      element.placeholderAmpChild = placeholderAmpChild;
      element.placeholderAmpGrandchild = createAmpElement({
        id: `placeholder-child-${id}`,
        parent: placeholderAmpChild,
        createPlaceholder: false,
      });
    } else {
      element.getPlaceholder = () => null;
    }

    element.ensureLoaded = env.sandbox.stub();
    element.pause = env.sandbox.stub();
    element.unmount = env.sandbox.stub();

    parent.appendChild(element);
    return element;
  }

  describe('forAllWithin', () => {
    let callback;

    beforeEach(() => {
      callback = env.sandbox.stub();
    });

    it('should include self in shallow mode and include placeholder', () => {
      forAllWithin(ampGrandparent, INCLUDE_SELF, !DEEP, callback);
      expect(callback)
        .to.be.calledTwice.calledWith(ampGrandparent)
        .calledWith(ampGrandparent.placeholderAmpChild);
      // Shouldn't be called for a placeholder grandchild.
      expect(callback).to.not.be.calledWith(
        ampGrandparent.placeholderAmpGrandchild
      );
    });

    it('should only include the nearest first element in includeSelf/shallow mode', () => {
      forAllWithin(tree, INCLUDE_SELF, !DEEP, callback);
      expect(callback)
        .to.be.calledTwice.calledWith(ampGrandparent)
        .calledWith(ampGrandparentSibling);
    });

    it('should only include shallow elements in shallow mode not including self', () => {
      forAllWithin(ampGrandparent, !INCLUDE_SELF, !DEEP, callback);
      expect(callback)
        .to.be.calledThrice.calledWith(ampParent)
        .calledWith(ampParentSibling)
        .calledWith(ampGrandparent.placeholderAmpChild);
    });

    it('should include self in deep mode', () => {
      forAllWithin(ampParent, INCLUDE_SELF, DEEP, callback);
      expect(callback).to.not.be.calledWith(ampGrandparent);
      expect(callback).to.be.calledWith(ampParent);
      expect(callback).to.be.calledWith(ampChild1);
      expect(callback).to.be.calledWith(ampChild2);

      // And placeholders.
      expect(callback).to.be.calledWith(ampParent.placeholderAmpChild);
    });

    it('should include all children in deep/non-includeSelf mode', () => {
      forAllWithin(ampParent, !INCLUDE_SELF, DEEP, callback);
      expect(callback).to.not.be.calledWith(ampParent);
      expect(callback).to.be.calledWith(ampChild1);
      expect(callback).to.be.calledWith(ampChild2);

      // And placeholders.
      expect(callback).to.be.calledWith(ampParent.placeholderAmpChild);
    });

    it('should support array for container', () => {
      forAllWithin([ampChild1, ampChild2], INCLUDE_SELF, DEEP, callback);
      expect(callback).to.be.calledWith(ampChild1);
      expect(callback).to.be.calledWith(ampChild2);
    });
  });

  describe('specific callbacks', () => {
    it('should call loadAll with shallow mode and includeSelf', () => {
      loadAll(ampGrandparent, INCLUDE_SELF);
      expect(ampGrandparent.ensureLoaded).to.be.calledOnce;
      expect(ampGrandparent.placeholderAmpChild.ensureLoaded).to.be.calledOnce;
      expect(ampParent.ensureLoaded).to.not.be.called;
      expect(ampParentSibling.ensureLoaded).to.not.be.called;
      expect(ampGrandparentSibling.ensureLoaded).to.not.be.called;
    });

    it('should call loadAll with shallow mode and not includeSelf', () => {
      loadAll(ampGrandparent, !INCLUDE_SELF);
      expect(ampGrandparent.ensureLoaded).to.not.be.called;
      expect(ampGrandparent.placeholderAmpChild.ensureLoaded).to.be.calledOnce;
      expect(ampParent.ensureLoaded).to.be.calledOnce;
      expect(ampParentSibling.ensureLoaded).to.be.calledOnce;
      expect(ampGrandparentSibling.ensureLoaded).to.not.be.called;
    });

    it('should call pauseAll with deep mode and includeSelf', () => {
      pauseAll(ampGrandparent, INCLUDE_SELF);
      expect(ampGrandparent.pause).to.be.calledOnce;
      expect(ampGrandparent.placeholderAmpChild.pause).to.be.calledOnce;
      expect(ampParent.pause).to.be.calledOnce;
      expect(ampParentSibling.pause).to.be.calledOnce;
      expect(ampChild1.pause).to.be.calledOnce;
      expect(ampChild2.pause).to.be.calledOnce;
      expect(ampGrandparentSibling.pause).to.not.be.called;
    });

    it('should call pauseAll with deep mode and not includeSelf', () => {
      pauseAll(ampGrandparent, !INCLUDE_SELF);
      expect(ampGrandparent.pause).to.not.be.called;
      expect(ampGrandparent.placeholderAmpChild.pause).to.be.calledOnce;
      expect(ampParent.pause).to.be.calledOnce;
      expect(ampParentSibling.pause).to.be.calledOnce;
      expect(ampChild1.pause).to.be.calledOnce;
      expect(ampChild2.pause).to.be.calledOnce;
      expect(ampGrandparentSibling.pause).to.not.be.called;
    });

    it('should call unmountAll with deep mode and includeSelf', () => {
      unmountAll(ampGrandparent, INCLUDE_SELF);
      expect(ampGrandparent.unmount).to.be.calledOnce;
      expect(ampGrandparent.placeholderAmpChild.unmount).to.be.calledOnce;
      expect(ampParent.unmount).to.be.calledOnce;
      expect(ampParentSibling.unmount).to.be.calledOnce;
      expect(ampChild1.unmount).to.be.calledOnce;
      expect(ampChild2.unmount).to.be.calledOnce;
      expect(ampGrandparentSibling.unmount).to.not.be.called;
    });

    it('should call unmountAll with deep mode and not includeSelf', () => {
      unmountAll(ampGrandparent, !INCLUDE_SELF);
      expect(ampGrandparent.unmount).to.not.be.called;
      expect(ampGrandparent.placeholderAmpChild.unmount).to.be.calledOnce;
      expect(ampParent.unmount).to.be.calledOnce;
      expect(ampParentSibling.unmount).to.be.calledOnce;
      expect(ampChild1.unmount).to.be.calledOnce;
      expect(ampChild2.unmount).to.be.calledOnce;
      expect(ampGrandparentSibling.unmount).to.not.be.called;
    });
  });
});
