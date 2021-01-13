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

import {ChildLayoutManager} from '../child-layout-manager';
import {Services} from '../../../../src/services';
import {setInitialDisplay, setStyles} from '../../../../src/style';

/**
 * @return {!Promise<undefined>} A Promise that resolves after the browser has
 *    rendered.
 */
function afterRenderPromise() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve);
    });
  });
}

/**
 * @param {!Element} el
 * @param {!Element} root
 * @return {!Promise<undefined>} A Promise that resolves once the element has
 *    become visibile within the root.
 */
function whenVisiblePromise(el, root) {
  return new Promise((resolve) => {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          resolve();
        }
      },
      {
        root,
      }
    );
    io.observe(el);
  });
}

/**
 * Scrolls an element into view and waits for an intersection observer to
 * trigger.
 * @param {!Element} el
 * @param {!Element} root
 * @return {!Promise<undefined>} A Promise that resolves once the element has
 *    become visibile within the root.
 */
async function afterScrollAndIntersectingPromise(el, root) {
  el.scrollIntoView();
  await whenVisiblePromise(el, root);
  // Wait for one more render, since the order of intersection observers
  // running is  not defined.
  await afterRenderPromise();
}

describes.realWin('child layout manager', {}, (env) => {
  let win;
  let doc;
  let container;
  let ampElementMock;
  let domElementMock;
  let ownersMock;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    env.iframe.width = '1000';
    env.iframe.height = '1000';
    container = doc.createElement('div');
    doc.body.appendChild(container);

    domElementMock = {};
    ampElementMock = {
      win,
      element: domElementMock,
    };
    ownersMock = {
      setOwner: env.sandbox.spy(),
      scheduleLayout: env.sandbox.spy(),
      scheduleUnlayout: env.sandbox.spy(),
      schedulePause: env.sandbox.spy(),
      scheduleResume: env.sandbox.spy(),
      findClosestAmpElements: (element, callback) => {
        const els = element.getElementsByTagName('amp-element');
        for (let i = 0; i < els.length; i++) {
          callback(els[i]);
        }
      },
    };
    env.sandbox.stub(Services, 'ownersForDoc').returns(ownersMock);
  });

  afterEach(() => {
    doc.body.removeChild(container);
  });

  /**
   * @param {number} childCount
   * @param {number=} opt_ampChildCount
   * @param {number=} opt_nestedAmpChildCount
   */
  function createHorizontalScroller(
    childCount,
    opt_ampChildCount,
    opt_nestedAmpChildCount
  ) {
    const el = document.createElement('div');
    setStyles(el, {
      'overflowX': 'auto',
      'width': '200px',
      'height': '200px',
    });
    setInitialDisplay(el, 'flex');
    replaceChildren(el, childCount, opt_ampChildCount, opt_nestedAmpChildCount);

    container.appendChild(el);
    return el;
  }

  /**
   *
   * @param {!Element} el
   * @param {number} childCount
   * @param {number=} opt_ampChildCount
   * @param {number=} opt_nestedAmpChildCount
   */
  function replaceChildren(
    el,
    childCount,
    opt_ampChildCount = 0,
    opt_nestedAmpChildCount = 0
  ) {
    el.innerHTML = '';

    for (
      let i = 0;
      i < childCount + opt_ampChildCount + opt_nestedAmpChildCount;
      i++
    ) {
      const child =
        i < childCount + opt_nestedAmpChildCount
          ? document.createElement('div')
          : document.createElement('amp-element');
      if (i >= childCount && i < childCount + opt_nestedAmpChildCount) {
        const nestedAmpElement = document.createElement('amp-element');
        nestedAmpElement.id = `child${i}`;
        child.append(nestedAmpElement);
      }
      child.id = `child${i}`;
      setStyles(child, {
        'flexShrink': '0',
        'width': '100%',
        'height': '100%',
      });

      el.appendChild(child);
    }

    return el.children;
  }

    /**
   *
   * @param {!Element} el
   * @param {number} childCount
   * @param {number=} opt_ampChildCount
   * @param {number=} opt_nestedAmpChildCount
   * @return {!Array<Element>}
   */
  function getObservedElementsFromChildren(element) {
    const arr = Array.from(element.children);
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      if (
        child.firstElementChild &&
        child.firstElementChild.tagName.toUpperCase() === 'AMP-ELEMENT'
      ) {
        arr.push(child.firstElementChild);
      }
    }
    return arr;
  }

  describe('when not queuing changes', () => {
    it('should just setOwner when not laid out', async () => {
      const el = createHorizontalScroller(5);
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
      });

      clm.updateChildren(el.children);
      await afterRenderPromise();

      expect(ownersMock.setOwner).to.have.callCount(5);
      expect(ownersMock.scheduleLayout).to.have.not.been.called;
    });

    it('should schedule layout for one extra viewport on layout', async () => {
      const el = createHorizontalScroller(5);
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
      });

      clm.updateChildren(el.children);
      clm.wasLaidOut();
      await afterRenderPromise();

      expect(ownersMock.scheduleLayout)
        .to.have.callCount(2)
        .to.have.been.calledWith(domElementMock, el.children[0])
        .to.have.been.calledWith(domElementMock, el.children[1]);
    });

    it('should schedule layout when wasLaidOut is called', async () => {
      const el = createHorizontalScroller(5);
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
      });

      clm.updateChildren(el.children);
      await afterRenderPromise();

      expect(ownersMock.scheduleLayout).to.have.not.been.called;

      clm.wasLaidOut();
      await afterRenderPromise();

      expect(ownersMock.scheduleLayout)
        .to.have.callCount(2)
        .to.have.been.calledWith(domElementMock, el.children[0])
        .to.have.been.calledWith(domElementMock, el.children[1]);
    });

    it('should schedule layout when children change', async () => {
      const el = createHorizontalScroller(5);
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
      });

      clm.updateChildren(el.children);
      clm.wasLaidOut();
      await afterRenderPromise();

      ownersMock.scheduleLayout.resetHistory();
      const newChildren = replaceChildren(el, 3);
      clm.updateChildren(newChildren);
      await afterRenderPromise();

      expect(ownersMock.scheduleLayout)
        .to.have.callCount(2)
        .to.have.been.calledWith(domElementMock, newChildren[0])
        .to.have.been.calledWith(domElementMock, newChildren[1]);
    });

    it('should update viewport visibility', async () => {
      const el = createHorizontalScroller(5);
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
      });

      clm.updateChildren(el.children);
      clm.wasLaidOut();
      await afterRenderPromise();
    });

    it('should call the viewportIntersectionCallback', async () => {
      const viewportIntersectionCallback = env.sandbox.spy();
      const el = createHorizontalScroller(5);
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
        viewportIntersectionCallback,
      });

      clm.updateChildren(el.children);
      clm.wasLaidOut();
      await afterRenderPromise();

      expect(viewportIntersectionCallback)
        .to.have.callCount(5)
        .to.have.been.calledWith(el.children[0], true)
        .to.have.been.calledWith(el.children[1], false)
        .to.have.been.calledWith(el.children[2], false)
        .to.have.been.calledWith(el.children[3], false)
        .to.have.been.calledWith(el.children[4], false);
    });

    it('should scheduleLayout on scroll', async () => {
      const el = createHorizontalScroller(5);
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
      });

      clm.updateChildren(el.children);
      clm.wasLaidOut();
      await afterRenderPromise();

      ownersMock.scheduleLayout.resetHistory();
      await afterScrollAndIntersectingPromise(el.children[1], el);

      expect(ownersMock.scheduleLayout)
        .to.have.callCount(1)
        .to.have.been.calledWith(domElementMock, el.children[2]);
    });

    it('should scheduleUnlayout on scroll', async () => {
      const el = createHorizontalScroller(5);
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
      });

      clm.updateChildren(el.children);
      clm.wasLaidOut();
      await afterRenderPromise();

      ownersMock.scheduleUnlayout.resetHistory();
      await afterScrollAndIntersectingPromise(el.children[3], el);
      await afterRenderPromise();

      // Note, el.children[1] was not unlaidout, even though it is more than one
      // viewport away. The unlayout has an extra buffer space to avoid switching
      // between layout and unlayout at the edge.
      expect(ownersMock.scheduleUnlayout)
        .to.have.callCount(1)
        .to.have.been.calledWith(domElementMock, el.children[0]);
    });

    it('should scheduleUnlayout on wasUnlaidOut', async () => {
      const el = createHorizontalScroller(5);
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
      });

      clm.updateChildren(el.children);
      clm.wasLaidOut();
      await afterRenderPromise();

      ownersMock.scheduleUnlayout.resetHistory();
      clm.wasUnlaidOut();
      await afterRenderPromise();

      expect(ownersMock.scheduleUnlayout)
        .to.have.callCount(5)
        .to.have.been.calledWith(domElementMock, el.children[0])
        .to.have.been.calledWith(domElementMock, el.children[1])
        .to.have.been.calledWith(domElementMock, el.children[2])
        .to.have.been.calledWith(domElementMock, el.children[3])
        .to.have.been.calledWith(domElementMock, el.children[4]);
    });

    it('should observe AMP elements of slides', async () => {
      // 5 divs, 2 amp-elements, 3 nested amp-elements
      const el = createHorizontalScroller(5, 2, 3);
      const observedElements = getObservedElementsFromChildren(el);
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
      });

      const observeElementSpy = env.sandbox.stub(clm, 'observeElement_');

      clm.updateChildren(el.children);
      clm.wasLaidOut();
      await afterRenderPromise();

      console.debug(observeElementSpy.args);
      expect(observeElementSpy.args.length).to.equal(5 + 2 + 3 + 3);

      // Expect first 3 args to be the nested amp-elements
      for (let i = 0; i < 3; i++) {
        expect(observeElementSpy.args[i][0]).to.be.equal(
          observedElements[observedElements.length - 3 + i]
        );
        expect(observeElementSpy.args[i][1]).to.be.false;
      }

      // Expect the rest of the args to be the parent slides
      for (let i = 3; i < observeElementSpy.args.length; i++) {
        expect(observeElementSpy.args[i][0]).to.be.equal(
          observedElements[i - 3]
        );
        expect(observeElementSpy.args[i][1]).to.be.undefined;
      }
    });

    it('changes flag for parent', async () => {
      // 1 div, 1 amp-element, 1 nested amp-element
      const el = createHorizontalScroller(1, 1, 1);
      const observedElements = getObservedElementsFromChildren(el);
      const mockEntries = [
        // Nested amp-element nearing
        {
          isIntersecting: true,
          target: observedElements[observedElements.length - 1],
        },
        // Nested amp-element backing away
        {
          isIntersecting: false,
          target: observedElements[observedElements.length - 1],
        },
      ];
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
      });

      clm.updateChildren(el.children);
      clm.wasLaidOut();
      await afterRenderPromise();

      // These reset the flags.
      clm.flushNearingViewportChanges_ = () => {};
      clm.flushBackingAwayViewportChanges_ = () => {};

      clm.processNearingChanges_(mockEntries);
      expect(clm.children_[1].__AMP_CAROUSEL_NEAR_VIEWPORT).to.equal(0);

      clm.processBackingAwayChanges_(mockEntries);
      expect(clm.children_[1].__AMP_CAROUSEL_NEAR_VIEWPORT).to.equal(1);
    });

    it('should trigger layout based upon child', async () => {
      // 1 div, 1 amp-element, 1 nested amp-element
      const el = createHorizontalScroller(1, 1, 1);
      const observedElements = getObservedElementsFromChildren(el);
      const mockEntries = [
        // Nested amp-element nearing
        {
          isIntersecting: true,
          target: observedElements[observedElements.length - 1],
        },
        // Nested amp-element backing away
        {
          isIntersecting: false,
          target: observedElements[observedElements.length - 1],
        },
      ];
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
      });

      clm.updateChildren(el.children);
      clm.wasLaidOut();
      await afterRenderPromise();

      ownersMock.scheduleLayout.resetHistory();
      ownersMock.scheduleUnlayout.resetHistory();

      clm.processNearingChanges_(mockEntries);
      clm.processBackingAwayChanges_(mockEntries);

      expect(ownersMock.scheduleLayout.args[0][1]).to.equal(
        observedElements[1]
      );
      expect(ownersMock.scheduleLayout).to.have.been.calledOnce;
      expect(ownersMock.scheduleUnlayout.args[0][1]).to.equal(
        observedElements[1]
      );
      expect(ownersMock.scheduleUnlayout).to.have.been.calledOnce;
    });
  });

  describe('queuing changes', () => {
    it('should just setOwner when not laid out', async () => {
      const el = createHorizontalScroller(5);
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
      });

      clm.setQueueChanges(true);
      clm.updateChildren(el.children);
      await afterRenderPromise();

      expect(ownersMock.setOwner).to.have.callCount(5);
      expect(ownersMock.scheduleLayout).to.have.not.been.called;
    });

    it('should queue layout on scroll', async () => {
      const el = createHorizontalScroller(5);
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
      });

      clm.setQueueChanges(true);
      clm.updateChildren(el.children);
      clm.wasLaidOut();
      await afterRenderPromise();

      clm.flushChanges();
      ownersMock.scheduleLayout.resetHistory();
      await afterScrollAndIntersectingPromise(el.children[1], el);

      // Make sure changes are not applied yet.
      expect(ownersMock.scheduleLayout).to.have.not.been.called;
      // Now flush the changes and check that they are applied.
      clm.flushChanges();

      expect(ownersMock.scheduleLayout)
        .to.have.callCount(1)
        .to.have.been.calledWith(domElementMock, el.children[2]);
    });

    it('should queue scheduleUnlayout on scroll', async () => {
      const el = createHorizontalScroller(5);
      const clm = new ChildLayoutManager({
        ampElement: ampElementMock,
        intersectionElement: el,
      });

      clm.setQueueChanges(true);
      clm.updateChildren(el.children);
      clm.wasLaidOut();
      await afterRenderPromise();

      clm.flushChanges();
      ownersMock.scheduleUnlayout.resetHistory();
      await afterScrollAndIntersectingPromise(el.children[3], el);
      await afterRenderPromise();

      // Make sure changes are not applied yet.
      expect(ownersMock.scheduleUnlayout).to.have.not.been.called;
      // Now flush the changes and check that they are applied.
      clm.flushChanges();

      // Note, el.children[1] was not unlaidout, even though it is more than one
      // viewport away. The unlayout has an extra buffer space to avoid switching
      // between layout and unlayout at the edge.
      expect(ownersMock.scheduleUnlayout)
        .to.have.callCount(1)
        .to.have.been.calledWith(domElementMock, el.children[0]);
    });
  });
});
