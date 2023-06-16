import {setInitialDisplay, setStyles} from '#core/dom/style';

import {Services} from '#service';

import {macroTask} from '#testing/helpers';

import {ChildLayoutManager} from '../child-layout-manager';

/**
 * @return {!Promise<undefined>} A Promise that resolves after the browser has
 *    rendered.
 */
async function afterRenderPromise() {
  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve);
    });
  });
  return macroTask();
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
    };
    env.sandbox.stub(Services, 'ownersForDoc').returns(ownersMock);
  });

  afterEach(() => {
    doc.body.removeChild(container);
  });

  /**
   * @param {number} childCount
   */
  function createHorizontalScroller(childCount) {
    const el = document.createElement('div');
    setStyles(el, {
      'overflowX': 'auto',
      'width': '200px',
      'height': '200px',
    });
    setInitialDisplay(el, 'flex');
    replaceChildren(el, childCount);

    container.appendChild(el);
    return el;
  }

  /**
   *
   * @param {!Element} el
   * @param {number} childCount
   */
  function replaceChildren(el, childCount) {
    el.innerHTML = '';

    for (let i = 0; i < childCount; i++) {
      const child = document.createElement('div');
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
        .to.have.callCount(3)
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
        .to.have.callCount(3)
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
        .to.have.callCount(3)
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
        .to.have.callCount(2)
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
        .to.have.callCount(2)
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
