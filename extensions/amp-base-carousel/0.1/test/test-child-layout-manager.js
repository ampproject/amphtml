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
import {setInitialDisplay, setStyles} from '../../../../src/style';

/**
 * @return {!Promise} A Promise that resolves after the browser has
 *    rendered.
 */
function afterRenderPromise() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      setTimeout(resolve);
    });
  });
}

describes.realWin('child layout manager', {}, env => {
  let win;
  let doc;
  let container;
  let ampElementMock;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    env.iframe.width = '1000';
    env.iframe.height = '1000';
    container = doc.createElement('div');
    doc.body.appendChild(container);

    ampElementMock = {
      setAsOwner: sinon.spy(),
      scheduleLayout: sinon.spy(),
      scheduleUnlayout: sinon.spy(),
      schedulePause: sinon.spy(),
      scheduleResume: sinon.spy(),
      updateInViewport: sinon.spy(),
      win,
    };
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
      setStyles(child, {
        'flexShrink': '0',
        'width': '100%',
        'height': '100%',
      });

      el.appendChild(child);
    }

    return el.children;
  }

  it('should just setAsOwner when not laid out', async () => {
    const el = createHorizontalScroller(5);
    const clm = new ChildLayoutManager({
      ampElement: ampElementMock,
      intersectionElement: el,
    });

    clm.updateChildren(el.children);
    await afterRenderPromise();

    expect(ampElementMock.setAsOwner).to.have.callCount(5);
    expect(ampElementMock.scheduleLayout).to.have.not.been.called;
  });

  it('should schedule layout for one extra viewport', async () => {
    const el = createHorizontalScroller(5);
    const clm = new ChildLayoutManager({
      ampElement: ampElementMock,
      intersectionElement: el,
    });

    clm.updateChildren(el.children);
    clm.wasLaidOut();
    await afterRenderPromise();

    expect(ampElementMock.scheduleLayout)
      .to.have.callCount(2)
      .to.have.been.calledWith(el.children[0])
      .to.have.been.calledWith(el.children[1]);
  });

  it('should schedule layout when wasLaidOut is called', async () => {
    const el = createHorizontalScroller(5);
    const clm = new ChildLayoutManager({
      ampElement: ampElementMock,
      intersectionElement: el,
    });

    clm.updateChildren(el.children);
    await afterRenderPromise();
    clm.wasLaidOut();
    await afterRenderPromise();

    expect(ampElementMock.scheduleLayout)
      .to.have.callCount(2)
      .to.have.been.calledWith(el.children[0])
      .to.have.been.calledWith(el.children[1]);
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

    ampElementMock.scheduleLayout.resetHistory();
    const newChildren = replaceChildren(el, 3);
    clm.updateChildren(newChildren);
    await afterRenderPromise();

    expect(ampElementMock.scheduleLayout)
      .to.have.callCount(2)
      .to.have.been.calledWith(newChildren[0])
      .to.have.been.calledWith(newChildren[1]);
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

    expect(ampElementMock.updateInViewport)
      .to.have.callCount(5)
      .to.have.been.calledWith(el.children[0], true)
      .to.have.been.calledWith(el.children[1], false)
      .to.have.been.calledWith(el.children[2], false)
      .to.have.been.calledWith(el.children[3], false)
      .to.have.been.calledWith(el.children[4], false);
  });

  it('should call the viewportIntersectionCallback', async () => {
    const viewportIntersectionCallback = sinon.spy();
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

    ampElementMock.scheduleLayout.resetHistory();
    el.children[1].scrollIntoView();
    await afterRenderPromise();

    expect(ampElementMock.scheduleLayout)
      .to.have.callCount(1)
      .to.have.been.calledWith(el.children[2]);
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

    ampElementMock.scheduleUnlayout.resetHistory();
    el.children[2].scrollIntoView();
    await afterRenderPromise();

    expect(ampElementMock.scheduleUnlayout)
      .to.have.callCount(1)
      .to.have.been.calledWith(el.children[0]);
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

    ampElementMock.scheduleUnlayout.resetHistory();
    clm.wasUnlaidOut();
    await afterRenderPromise();

    expect(ampElementMock.scheduleUnlayout)
      .to.have.callCount(5)
      .to.have.been.calledWith(el.children[0])
      .to.have.been.calledWith(el.children[1])
      .to.have.been.calledWith(el.children[2])
      .to.have.been.calledWith(el.children[3])
      .to.have.been.calledWith(el.children[4]);
  });

  it('should updateInViewport on scroll', async () => {
    const el = createHorizontalScroller(5);
    const clm = new ChildLayoutManager({
      ampElement: ampElementMock,
      intersectionElement: el,
    });

    clm.updateChildren(el.children);
    clm.wasLaidOut();
    await afterRenderPromise();

    ampElementMock.updateInViewport.resetHistory();
    el.children[1].scrollIntoView();
    await afterRenderPromise();

    expect(ampElementMock.updateInViewport)
      .to.have.callCount(2)
      .to.have.been.calledWith(el.children[0], false)
      .to.have.been.calledWith(el.children[1], true);
  });
});
