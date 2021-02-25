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

import * as fakeTimers from '@sinonjs/fake-timers';
import {Builder} from '../../src/service/builder';
import {LayoutPriority} from '../../src/layout';
import {READY_SCAN_SIGNAL} from '../../src/service/resources-interface';
import {createElementWithAttributes} from '../../src/dom';
import {installIntersectionObserverStub} from '../../testing/intersection-observer-stub';

describes.realWin('Builder', {amp: true}, (env) => {
  let win, doc, ampdoc;
  let setAmpdocReady;
  let clock;
  let intersectionObserverStub;
  let builder;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;

    let ampdocReady = false;
    let ampdocReadyResolver;
    const ampdocReadyPromise = new Promise((resolve) => {
      ampdocReadyResolver = resolve;
    });
    setAmpdocReady = () => {
      ampdocReady = true;
      ampdocReadyResolver();
      return ampdocReadyPromise.then(() => {});
    };
    env.sandbox.stub(ampdoc, 'whenReady').returns(ampdocReadyPromise);
    env.sandbox.stub(ampdoc, 'isReady').callsFake(() => ampdocReady);

    delete win.requestIdleCallback;
    clock = fakeTimers.withGlobal(win).install();
    win.requestIdleCallback = (callback) => {
      win.setTimeout(callback, 100);
    };

    intersectionObserverStub = installIntersectionObserverStub(
      env.sandbox,
      win
    );

    builder = new Builder(ampdoc);
  });

  afterEach(() => {
    clock.uninstall();
  });

  function createAmpElement(options = {}) {
    const element = createElementWithAttributes(doc, 'amp-el', {});
    element.deferredBuild = () => options.deferredBuild || false;
    element.prerenderAllowed = () => options.prerenderAllowed || false;
    element.getBuildPriority = () =>
      options.buildPriority || LayoutPriority.CONTENT;
    element.buildInternal = env.sandbox.stub();
    return element;
  }

  describe('schedule', () => {
    it('should schedule a deferredBuild element', () => {
      const element = createAmpElement({deferredBuild: true});
      builder.schedule(element);
      expect(intersectionObserverStub.isObserved(element)).to.be.true;

      builder.unschedule(element);
      expect(intersectionObserverStub.isObserved(element)).to.be.false;
    });

    it('should schedule a non-deferredBuild element', () => {
      const element = createAmpElement({deferredBuild: false});
      builder.schedule(element);
      expect(intersectionObserverStub.isObserved(element)).to.be.false;
    });

    it('should unschedule when built', async () => {
      const element = createAmpElement({deferredBuild: true});
      builder.schedule(element);
      expect(intersectionObserverStub.isObserved(element)).to.be.true;

      await setAmpdocReady();
      intersectionObserverStub.notifySync({
        target: element,
        isIntersecting: true,
      });
      expect(intersectionObserverStub.isObserved(element)).to.be.false;
    });

    it('should NOT signal READY_SCAN_SIGNAL until document is ready', async () => {
      ampdoc.signals().reset(READY_SCAN_SIGNAL);
      const element = createAmpElement({deferredBuild: false});
      builder.schedule(element);
      expect(ampdoc.signals().get(READY_SCAN_SIGNAL)).to.be.null;

      clock.tick(50);
      expect(ampdoc.signals().get(READY_SCAN_SIGNAL)).to.be.null;
    });

    it('should signal READY_SCAN_SIGNAL after document ready', async () => {
      ampdoc.signals().reset(READY_SCAN_SIGNAL);
      await setAmpdocReady();
      clock.tick(50);
      expect(ampdoc.signals().get(READY_SCAN_SIGNAL)).to.exist;
    });
  });

  describe('wait for parsing', () => {
    it('should build when document ready', async () => {
      await setAmpdocReady();
      const element = createAmpElement({deferredBuild: false});
      builder.schedule(element);
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });

    it('should build when document becomes ready', async () => {
      const element = createAmpElement({deferredBuild: false});
      builder.schedule(element);
      clock.tick(1);
      expect(element.buildInternal).to.be.not.called;

      await setAmpdocReady();
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });

    it('should build asap when document ready', async () => {
      await setAmpdocReady();
      const element = createAmpElement({deferredBuild: true});
      builder.scheduleAsap(element);
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });

    it('should build asap when document becomes ready', async () => {
      const element = createAmpElement({deferredBuild: true});
      builder.scheduleAsap(element);
      clock.tick(1);
      expect(element.buildInternal).to.be.not.called;

      await setAmpdocReady();
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });

    it('should build when has next siblings', async () => {
      const element = createAmpElement({deferredBuild: false});
      doc.body.appendChild(element);
      builder.schedule(element);
      clock.tick(1);
      expect(element.buildInternal).to.not.be.called;

      const element2 = createAmpElement({deferredBuild: false});
      doc.body.appendChild(element2);
      builder.schedule(element2);
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
      expect(element2.buildInternal).to.not.be.called;
    });

    it('should build asap when has next siblings', async () => {
      const element = createAmpElement({deferredBuild: false});
      doc.body.appendChild(element);
      builder.scheduleAsap(element);
      clock.tick(1);
      expect(element.buildInternal).to.not.be.called;

      const element2 = createAmpElement({deferredBuild: false});
      doc.body.appendChild(element2);
      builder.scheduleAsap(element2);
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
      expect(element2.buildInternal).to.not.be.called;
    });

    it('should wait the deferred even when parsed', async () => {
      await setAmpdocReady();
      const element = createAmpElement({deferredBuild: true});
      doc.body.appendChild(element);
      builder.schedule(element);
      clock.tick(1);
      expect(element.buildInternal).to.not.be.called;
    });
  });

  describe('wait for document visibility', () => {
    beforeEach(async () => {
      ampdoc.overrideVisibilityState('prerender');
      await setAmpdocReady();
    });

    it('should build if prerenderAllowed', () => {
      const element = createAmpElement({
        deferredBuild: false,
        prerenderAllowed: true,
      });
      builder.schedule(element);
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });

    it('should build asap if prerenderAllowed', () => {
      const element = createAmpElement({
        deferredBuild: true,
        prerenderAllowed: true,
      });
      builder.scheduleAsap(element);
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });

    it('should NOT build if not prerenderAllowed', () => {
      const element = createAmpElement({
        deferredBuild: false,
        prerenderAllowed: false,
      });
      builder.schedule(element);
      clock.tick(1);
      expect(element.buildInternal).to.be.not.called;
    });

    it('should NOT build asap if not prerenderAllowed', () => {
      const element = createAmpElement({
        deferredBuild: true,
        prerenderAllowed: false,
      });
      builder.scheduleAsap(element);
      clock.tick(1);
      expect(element.buildInternal).to.be.not.called;
    });

    it('should build when becomes visible', () => {
      const element = createAmpElement({prerenderAllowed: false});
      builder.schedule(element);
      clock.tick(1);
      expect(element.buildInternal).to.not.be.called;

      ampdoc.overrideVisibilityState('visible');
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });

    it('should build when becomes hidden', () => {
      const element = createAmpElement({prerenderAllowed: false});
      builder.schedule(element);
      clock.tick(1);
      expect(element.buildInternal).to.not.be.called;

      ampdoc.overrideVisibilityState('hidden');
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });

    it('should NOT build when becomes paused or inactive', () => {
      const element = createAmpElement({prerenderAllowed: false});
      builder.schedule(element);
      clock.tick(1);
      expect(element.buildInternal).to.not.be.called;

      ampdoc.overrideVisibilityState('paused');
      clock.tick(1);
      expect(element.buildInternal).to.not.be.called;

      ampdoc.overrideVisibilityState('inactive');
      clock.tick(1);
      expect(element.buildInternal).to.not.be.called;
    });

    it('should NOT build when scheduled in paused', () => {
      ampdoc.overrideVisibilityState('paused');

      const element = createAmpElement({prerenderAllowed: false});
      builder.schedule(element);
      clock.tick(1);
      expect(element.buildInternal).to.not.be.called;

      ampdoc.overrideVisibilityState('visible');
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });

    it('should NOT build when scheduled in inactive', () => {
      ampdoc.overrideVisibilityState('inactive');

      const element = createAmpElement({prerenderAllowed: false});
      builder.schedule(element);
      clock.tick(1);
      expect(element.buildInternal).to.not.be.called;

      ampdoc.overrideVisibilityState('visible');
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });
  });

  describe('wait for intersection', () => {
    beforeEach(async () => {
      await setAmpdocReady();
    });

    it('should wait for intersection when deferred', () => {
      const element = createAmpElement({deferredBuild: true});
      builder.schedule(element);
      expect(intersectionObserverStub.isObserved(element)).to.be.true;
      clock.tick(1);
      expect(element.buildInternal).to.not.be.called;

      intersectionObserverStub.notifySync({
        target: element,
        isIntersecting: false,
      });
      clock.tick(1);
      expect(element.buildInternal).to.not.be.called;

      intersectionObserverStub.notifySync({
        target: element,
        isIntersecting: true,
      });
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });

    it('should not wait for intersection when not deferred', () => {
      const element = createAmpElement({deferredBuild: false});
      builder.schedule(element);
      expect(intersectionObserverStub.isObserved(element)).to.be.false;
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });

    it('should not wait for intersection when asap', () => {
      const element = createAmpElement({deferredBuild: true});
      builder.scheduleAsap(element);
      expect(intersectionObserverStub.isObserved(element)).to.be.false;
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });
  });

  describe('priority', () => {
    beforeEach(async () => {
      await setAmpdocReady();
    });

    it('should run deferred CONTENT at high priority', () => {
      const element = createAmpElement({deferredBuild: true});
      builder.schedule(element);
      intersectionObserverStub.notifySync({
        target: element,
        isIntersecting: true,
      });
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });

    it('should run deferred METADATA at low priority', () => {
      const element = createAmpElement({
        deferredBuild: true,
        buildPriority: LayoutPriority.METADATA,
      });
      builder.schedule(element);
      intersectionObserverStub.notifySync({
        target: element,
        isIntersecting: true,
      });
      clock.tick(1);
      expect(element.buildInternal).to.not.be.called;

      clock.tick(100);
      expect(element.buildInternal).to.be.calledOnce;
    });

    it('should run non-deferred METADATA at low priority', () => {
      const element = createAmpElement({
        deferredBuild: false,
        buildPriority: LayoutPriority.METADATA,
      });
      builder.schedule(element);
      clock.tick(1);
      expect(element.buildInternal).to.not.be.called;

      clock.tick(100);
      expect(element.buildInternal).to.be.calledOnce;
    });

    it('should run asap METADATA at high priority', () => {
      const element = createAmpElement({
        deferredBuild: false,
        buildPriority: LayoutPriority.METADATA,
      });
      builder.scheduleAsap(element);
      clock.tick(1);
      expect(element.buildInternal).to.be.calledOnce;
    });
  });
});
