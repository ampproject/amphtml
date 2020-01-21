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
    env.sandbox.stub(viewport, 'getClientRectAsync').callsFake(() => {
      return Promise.resolve(layoutRectLtwh(0, top, 0, 0));
    });
  });

  async function getElement(height = 200) {
    const element = doc.createElement('div');

    // Ensure element is off screen when it renders.
    setStyle(element, 'marginTop', '1000px');

    setStyle(element, 'height', height + 'px');
    doc.body.appendChild(element);
    return Promise.resolve(element);
  }

  afterEach(() => {
    visibilityObserver.unobserveAll();
  });

  describe('visibility observer', async () => {
    it('initializes correctly', async () => {
      const element = await getElement(200 /** height */);
      const spy = env.sandbox.spy();
      visibilityObserver.observe(element, spy);
      await new Promise(resolve => setTimeout(resolve, 0));
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
      win.dispatchEvent(new Event('scroll'));
      await macroTask();
      expect(spy).to.not.be.called;
      top += 200;
      win.dispatchEvent(new Event('scroll'));
      await macroTask();
      expect(spy).to.be.calledWith(ViewportRelativePos.OUTSIDE_VIEWPORT);
    });

    it("should not issue update if position doesn't change", async () => {
      const element = await getElement(200 /** height */);
      const spy = env.sandbox.spy();
      visibilityObserver.observe(element, spy);
      win.dispatchEvent(new Event('scroll'));
      await macroTask();
      expect(spy).to.not.be.called;
      win.dispatchEvent(new Event('scroll'));
      await macroTask();
      expect(spy).to.not.be.called;
    });

    it('should issue update if element is entering viewport', async () => {
      const element = await getElement(200 /** height */);
      const spy = env.sandbox.spy();
      visibilityObserver.observe(element, spy);
      win.dispatchEvent(new Event('scroll'));
      await macroTask();
      expect(spy).to.not.be.called;
      top += 1100;
      win.dispatchEvent(new Event('scroll'));
      await macroTask();
      expect(spy).to.be.calledWith(ViewportRelativePos.LEAVING_VIEWPORT);
    });

    it('should issue update if element is within viewport (small element)', async () => {
      const element = await getElement(200 /** height */);
      const spy = env.sandbox.spy();
      visibilityObserver.observe(element, spy);
      win.dispatchEvent(new Event('scroll'));
      await macroTask();
      expect(spy).to.not.be.called;
      top += 1400;
      win.dispatchEvent(new Event('scroll'));
      await macroTask();
      expect(spy).to.be.calledWith(ViewportRelativePos.INSIDE_VIEWPORT);
    });

    it('should issue update if element is within viewport (large element)', async () => {
      const element = await getElement(1000 /** height */);
      const spy = env.sandbox.spy();
      visibilityObserver.observe(element, spy);
      win.dispatchEvent(new Event('scroll'));
      await macroTask();
      expect(spy).to.not.be.called;
      top += 1400;
      win.dispatchEvent(new Event('scroll'));
      await macroTask();
      expect(spy).to.be.calledWith(ViewportRelativePos.OUTSIDE_VIEWPORT);
    });

    it('should issue update if element is leaving viewport', async () => {
      const element = await getElement(200 /** height */);
      const spy = env.sandbox.spy();
      visibilityObserver.observe(element, spy);
      win.dispatchEvent(new Event('scroll'));
      await macroTask();
      expect(spy).to.not.be.called;
      top += 1500;
      win.dispatchEvent(new Event('scroll'));
      await macroTask();
      expect(spy).to.be.calledWith(ViewportRelativePos.LEAVING_VIEWPORT);
    });
  });
});
