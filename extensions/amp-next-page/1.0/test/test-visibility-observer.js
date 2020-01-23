/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import '../amp-next-page';
import * as lolex from 'lolex';
import {Services} from '../../../../src/services';
import {layoutRectLtwh} from '../../../../src/layout-rect';
import {macroTask} from '../../../../testing/yield';
import {setStyle} from '../../../../src/style';
import VisibilityObserver, {ViewportRelativePos} from '../visibility-observer';

describes.realWin('amp-next-page visibility observer', {amp: 1}, env => {
  let win, doc, ampdoc, viewport, visibilityObserver, top;
  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    viewport = Services.viewportForDoc(ampdoc);
    top = 0;
    visibilityObserver = new VisibilityObserver(ampdoc);
    env.sandbox
      .stub(
        visibilityObserver.getPositionObserver().viewport_,
        'getClientRectAsync'
      )
      .callsFake(() => {
        return Promise.resolve(layoutRectLtwh(2, top, 20, 10));
      });
    env.sandbox
      .stub(visibilityObserver.getPositionObserver().vsync_, 'measure')
      .callsFake(callback => {
        win.setTimeout(callback, 1);
      });
  });

  async function getElement(height = 200) {
    const element = doc.createElement('div');
    setStyle(element, 'height', height + 'px');

    // Ensure element is off screen when it renders.
    const elementSibling = doc.createElement('div');
    setStyle(elementSibling, 'height', '1000px');
    doc.body.appendChild(elementSibling);

    doc.body.appendChild(element);
    return Promise.resolve(element);
  }

  async function scroll(pixels = 0) {
    if (pixels) {
      top += pixels;
      win.dispatchEvent(new Event('scroll'));
    }
    visibilityObserver.getPositionObserver().updateAllEntries();
    await macroTask();
  }

  afterEach(() => {
    // visibilityObserver.unobserveAll();
  });

  describe('visibility observer', async () => {
    it('initializes correctly', async () => {
      const element = await getElement(200 /** height */);
      visibilityObserver.observe(element, () => {});
      await scroll();
      expect(
        doc.body.querySelector('.i-amphtml-visibilty-observer-top-sentinel')
      ).to.be.ok;
      expect(
        doc.body.querySelector('.i-amphtml-visibilty-observer-bottom-sentinel')
      ).to.be.ok;
    });

    it('should issue update if element position changes while out of viewport', async () => {
      const element = await getElement(200 /** height */);
      const spy = env.sandbox.spy();
      visibilityObserver.observe(element, spy);
      await scroll();
      spy.should.not.have.been.called;
      spy.resetHistory();
      await scroll(200);
      spy.should.have.been.calledWith(ViewportRelativePos.OUTSIDE_VIEWPORT);
    });

    it("should not issue update if position doesn't change", async () => {
      const element = await getElement(200 /** height */);
      const spy = env.sandbox.spy();
      visibilityObserver.observe(element, spy);
      await scroll();
      spy.should.not.have.been.called;
      spy.resetHistory();
      await scroll();
      spy.should.not.have.been.called;
    });

    it('should issue update if element is entering viewport', async () => {
      const element = await getElement(200 /** height */);
      const spy = env.sandbox.spy();
      visibilityObserver.observe(element, spy);
      await scroll();
      spy.should.not.have.been.called;
      spy.resetHistory();
      await scroll(1100);
      spy.should.have.been.calledWith(ViewportRelativePos.LEAVING_VIEWPORT);
    });

    it('should issue update if element is within viewport (small element)', async () => {
      const element = await getElement(200 /** height */);
      const spy = env.sandbox.spy();
      visibilityObserver.observe(element, spy);
      await scroll();
      spy.should.not.have.been.called;
      spy.resetHistory();
      await scroll(1400);
      spy.should.have.been.calledWith(ViewportRelativePos.INSIDE_VIEWPORT);
    });

    it('should issue update if element is within viewport (large element)', async () => {
      const element = await getElement(1000 /** height */);
      const spy = env.sandbox.spy();
      visibilityObserver.observe(element, spy);
      await scroll();
      spy.should.not.have.been.called;
      spy.resetHistory();
      await scroll(1400);
      spy.should.have.been.calledWith(ViewportRelativePos.CONTAINS_VIEWPORT);
    });

    it('should issue update if element is leaving viewport', async () => {
      const element = await getElement(200 /** height */);
      const spy = env.sandbox.spy();
      visibilityObserver.observe(element, spy);
      await scroll();
      spy.should.not.have.been.called;
      spy.resetHistory();
      await scroll(1500);
      spy.should.have.been.calledWith(ViewportRelativePos.LEAVING_VIEWPORT);
    });
  });
});
