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

import {BaseElement} from '../../src/base-element';
import {CommonSignals} from '../../src/common-signals';
import {ElementStub} from '../../src/element-stub';
import {LayoutPriority} from '../../src/layout';
import {Services} from '../../src/services';
import {chunkInstanceForTesting} from '../../src/chunk';
import {
  createAmpElementForTesting,
  getActionQueueForTesting,
  getImplClassSyncForTesting,
  getImplSyncForTesting,
} from '../../src/custom-element';
import {getBuilderForDoc} from '../../src/service/builder';

describes.realWin('CustomElement V1', {amp: true}, (env) => {
  let win, doc, ampdoc;
  let resources, resourcesMock;
  let builder, builderMock;
  let ElementClass, StubElementClass;
  let chunks;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    chunks = chunkInstanceForTesting(ampdoc);

    ElementClass = createAmpElementForTesting(win, TestElement);
    StubElementClass = createAmpElementForTesting(win, ElementStub);
    win.customElements.define('amp-test', ElementClass);
    win.customElements.define('amp-stub', StubElementClass);
    win.__AMP_EXTENDED_ELEMENTS['amp-test'] = TestElement;
    win.__AMP_EXTENDED_ELEMENTS['amp-stub'] = ElementStub;
    ampdoc.declareExtension('amp-stub');
    ElementClass.prototype.inspect = function () {
      return this.tagName;
    };
    StubElementClass.prototype.inspect = function () {
      return this.tagName;
    };

    resources = Services.resourcesForDoc(ampdoc);
    resourcesMock = env.sandbox.mock(resources);
    resourcesMock.expects('upgraded').never();

    builder = getBuilderForDoc(ampdoc);
    builderMock = env.sandbox.mock(builder);
  });

  afterEach(() => {
    resourcesMock.verify();
    builderMock.verify();
  });

  class TestElement extends BaseElement {
    static V1() {
      return true;
    }

    constructor(element, source) {
      super(element);
      this.source = source;
    }

    isLayoutSupported() {
      return true;
    }
  }

  describe('upgrade', () => {
    it('should not create impl immediately when attached', () => {
      const element = new ElementClass();

      builderMock.expects('schedule').withExactArgs(element).once();

      expect(element.isUpgraded()).to.be.false;
      expect(getImplClassSyncForTesting(element)).to.equal(TestElement);
      expect(getImplSyncForTesting(element)).to.be.null;
      expect(element.getBuildPriority()).equal(LayoutPriority.CONTENT);

      doc.body.appendChild(element);

      expect(getImplClassSyncForTesting(element)).to.equal(TestElement);
      expect(getImplSyncForTesting(element)).to.be.null;
      expect(element.isUpgraded()).to.be.false;
      expect(element.readyState).to.equal('building');
      expect(element.isBuilt()).to.be.false;
      expect(element.getBuildPriority()).equal(LayoutPriority.CONTENT);
    });

    it('should not upgrade immediately when attached', () => {
      const element = new StubElementClass();

      builderMock.expects('schedule').withExactArgs(element).once();

      expect(element.isUpgraded()).to.be.false;
      expect(getImplClassSyncForTesting(element)).to.be.null;
      expect(getImplSyncForTesting(element)).to.be.null;
      expect(element.getBuildPriority()).equal(LayoutPriority.BACKGROUND);

      doc.body.appendChild(element);
      element.upgrade(TestElement);

      expect(getImplClassSyncForTesting(element)).to.equal(TestElement);
      expect(getImplSyncForTesting(element)).to.be.null;
      expect(element.isUpgraded()).to.be.false;
      expect(element.readyState).to.equal('building');
      expect(element.isBuilt()).to.be.false;
      expect(element.getBuildPriority()).equal(LayoutPriority.CONTENT);
    });

    it('should reschedule build when re-attached', () => {
      const element = new ElementClass();

      builderMock.expects('schedule').withExactArgs(element).twice();
      builderMock.expects('unschedule').withExactArgs(element).once();

      doc.body.appendChild(element);
      expect(element.readyState).to.equal('building');

      doc.body.removeChild(element);
      expect(element.readyState).to.equal('building');

      doc.body.appendChild(element);
      expect(element.readyState).to.equal('building');
    });
  });

  describe('preconnect', () => {
    let preconnectMock;
    let chunkStub;

    beforeEach(() => {
      chunkStub = env.sandbox.stub(chunks, 'runForStartup');
      builderMock.expects('schedule').once();

      const preconnect = Services.preconnectFor(win);
      preconnectMock = env.sandbox.mock(preconnect);
    });

    afterEach(() => {
      preconnectMock.verify();
    });

    it('should preconnect on upgrade', () => {
      env.sandbox.stub(TestElement, 'getPreconnects').returns(['url1', 'url2']);
      preconnectMock.expects('url').withExactArgs(ampdoc, 'url1', false).once();
      preconnectMock.expects('url').withExactArgs(ampdoc, 'url2', false).once();

      const element = new ElementClass();
      doc.body.appendChild(element);
      expect(chunkStub).to.be.calledOnce;
      chunkStub.firstCall.firstArg();
    });

    it('should NOT preconnect on upgrade if not urls', () => {
      preconnectMock.expects('url').never();

      const element = new ElementClass();
      doc.body.appendChild(element);
      expect(chunkStub).to.not.be.called;
    });
  });

  describe('buildInternal', () => {
    let buildCallbackStub;

    beforeEach(() => {
      buildCallbackStub = env.sandbox.stub(
        TestElement.prototype,
        'buildCallback'
      );
      builderMock.expects('schedule').atLeast(0);
    });

    it('should NOT allow build on unupgraded element', async () => {
      expectAsyncConsoleError(/unupgraded/);
      const element = new StubElementClass();
      doc.body.appendChild(element);

      expect(() => element.buildInternal()).to.throw(/unupgraded/);
      expect(element.isBuilding()).to.be.false;
      expect(getImplSyncForTesting(element)).to.be.null;
      expect(buildCallbackStub).to.not.be.called;
      expect(element.isUpgraded()).to.be.false;
      expect(element.isBuilt()).to.be.false;
      expect(element.readyState).to.equal('upgrading');
    });

    it('should build a pre-upgraded element', async () => {
      const attachedCallbackStub = env.sandbox.stub(
        TestElement.prototype,
        'attachedCallback'
      );

      const element = new ElementClass();
      doc.body.appendChild(element);

      const promise = element.buildInternal();
      expect(element.isBuilding()).to.be.true;
      expect(getImplSyncForTesting(element)).to.be.null;
      expect(element.isUpgraded()).to.be.false;
      expect(element.isBuilt()).to.be.false;
      expect(element.readyState).to.equal('building');
      expect(element).to.have.class('i-amphtml-notbuilt');
      expect(element).to.have.class('amp-notbuilt');
      expect(element).to.not.have.class('i-amphtml-built');
      expect(element.signals().get(CommonSignals.BUILT)).to.be.null;
      expect(attachedCallbackStub).to.not.be.called;

      await promise;
      expect(getImplSyncForTesting(element)).to.be.instanceOf(TestElement);
      expect(buildCallbackStub).to.be.calledOnce;
      expect(element.isUpgraded()).to.be.true;
      expect(element.isBuilt()).to.be.true;
      expect(element.readyState).to.equal('complete');
      expect(element).to.not.have.class('i-amphtml-notbuilt');
      expect(element).to.not.have.class('amp-notbuilt');
      expect(element).to.have.class('i-amphtml-built');
      expect(element.signals().get(CommonSignals.BUILT)).to.exist;
      expect(attachedCallbackStub).to.be.calledOnce;
    });

    it('should build an element after upgrade', async () => {
      const attachedCallbackStub = env.sandbox.stub(
        TestElement.prototype,
        'attachedCallback'
      );

      const element = new StubElementClass();
      doc.body.appendChild(element);
      element.upgrade(TestElement);

      const promise = element.buildInternal();
      expect(element.isBuilding()).to.be.true;
      expect(getImplSyncForTesting(element)).to.be.null;
      expect(element.isUpgraded()).to.be.false;
      expect(element.isBuilt()).to.be.false;
      expect(element.readyState).to.equal('building');
      expect(attachedCallbackStub).to.not.be.called;

      await promise;
      expect(getImplSyncForTesting(element)).to.be.instanceOf(TestElement);
      expect(buildCallbackStub).to.be.calledOnce;
      expect(element.isUpgraded()).to.be.true;
      expect(element.isBuilt()).to.be.true;
      expect(element.readyState).to.equal('complete');
      expect(element).to.not.have.class('i-amphtml-notbuilt');
      expect(element).to.not.have.class('amp-notbuilt');
      expect(element).to.have.class('i-amphtml-built');
      expect(element.signals().get(CommonSignals.BUILT)).to.exist;
      expect(attachedCallbackStub).to.be.calledOnce;
    });

    it('should continue in loading state if buildCallback requests it', async () => {
      buildCallbackStub.callsFake(function () {
        this.setReadyState('loading');
      });

      const element = new ElementClass();
      doc.body.appendChild(element);

      await element.buildInternal();
      expect(buildCallbackStub).to.be.calledOnce;
      expect(element.readyState).to.equal('loading');
    });

    it('should set the failing state if buildCallback fails', async () => {
      expectAsyncConsoleError(/intentional/);
      buildCallbackStub.throws(new Error('intentional'));

      const element = new ElementClass();
      doc.body.appendChild(element);

      try {
        await element.buildInternal();
        throw new Error('must have failed');
      } catch (e) {
        expect(e.toString()).to.match(/intentional/);
      }
      expect(element.readyState).to.equal('error');
      expect(element.signals().get(CommonSignals.BUILT)).to.exist;
      expect(element.signals().get(CommonSignals.BUILT).toString()).to.match(
        /intentional/
      );
    });

    it('should set the failing state if buildCallback rejects', async () => {
      expectAsyncConsoleError(/intentional/);
      buildCallbackStub.rejects(new Error('intentional'));

      const element = new ElementClass();
      doc.body.appendChild(element);

      try {
        await element.buildInternal();
        throw new Error('must have failed');
      } catch (e) {
        expect(e.toString()).to.match(/intentional/);
      }
      expect(element.readyState).to.equal('error');
    });

    it('should only execute build once', async () => {
      const element = new ElementClass();
      doc.body.appendChild(element);

      const promise = element.buildInternal();
      const promise2 = element.buildInternal();
      expect(promise2).to.equal(promise);

      await promise;
      await promise2;
      const promise3 = element.buildInternal();
      expect(promise3).to.equal(promise);
      expect(buildCallbackStub).to.be.calledOnce;
    });

    it('should continue build with a pre-created implementation', async () => {
      const element = new ElementClass();
      doc.body.appendChild(element);

      await element.getImpl(false);

      await element.buildInternal();
      expect(buildCallbackStub).to.be.calledOnce;
      expect(element.readyState).to.equal('complete');
    });

    describe('consent', () => {
      it('should build on consent sufficient', async () => {
        const element = new ElementClass();
        env.sandbox
          .stub(Services, 'consentPolicyServiceForDocOrNull')
          .callsFake(() => {
            return Promise.resolve({
              whenPolicyUnblock: () => {
                return Promise.resolve(true);
              },
            });
          });
        env.sandbox.stub(element, 'getConsentPolicy_').callsFake(() => {
          return 'default';
        });
        doc.body.appendChild(element);

        await element.buildInternal();
        expect(buildCallbackStub).to.be.calledOnce;
        expect(element.readyState).to.equal('complete');
      });

      it('should not build on consent insufficient', async () => {
        const element = new ElementClass();
        env.sandbox
          .stub(Services, 'consentPolicyServiceForDocOrNull')
          .callsFake(() => {
            return Promise.resolve({
              whenPolicyUnblock: () => {
                return Promise.resolve(false);
              },
            });
          });
        env.sandbox.stub(element, 'getConsentPolicy_').callsFake(() => {
          return 'default';
        });
        doc.body.appendChild(element);

        try {
          await element.buildInternal();
          throw new Error('must have failed');
        } catch (e) {
          expect(e.toString()).to.match(/BLOCK_BY_CONSENT/);
        }
      });

      it('should respect user specified consent policy', async () => {
        const element = new ElementClass();
        doc.body.appendChild(element);
        await element.getImpl(false);

        expect(element.getConsentPolicy_()).to.equal(null);
        element.setAttribute('data-block-on-consent', '');
        expect(element.getConsentPolicy_()).to.equal('default');
        element.setAttribute('data-block-on-consent', '_none');
        expect(element.getConsentPolicy_()).to.equal('_none');
      });

      it('should repsect metaTag specified consent', async () => {
        const meta = doc.createElement('meta');
        meta.setAttribute('name', 'amp-consent-blocking');
        meta.setAttribute('content', 'amp-test');
        doc.head.appendChild(meta);

        const element = new ElementClass();
        doc.body.appendChild(element);
        await element.getImpl(false);

        expect(element.getConsentPolicy_()).to.equal('default');
        expect(element.getAttribute('data-block-on-consent')).to.equal(
          'default'
        );
      });
    });
  });

  describe('build', () => {
    it('should only execute build once', async () => {
      const element = new ElementClass();
      doc.body.appendChild(element);

      builderMock.expects('scheduleAsap').never();
      builderMock.expects('schedule').never();

      const promise = element.buildInternal();
      const promise2 = element.build();
      expect(promise2).to.equal(promise);

      await promise;
      await promise2;
      const promise3 = element.build();
      expect(promise3).to.equal(promise);
    });

    it('should wait until the element is upgraded', async () => {
      const element = new StubElementClass();

      builderMock.expects('scheduleAsap').withExactArgs(element).once();

      const promise = element.build();

      doc.body.appendChild(element);
      element.upgrade(TestElement);

      await element.buildInternal();
      await promise;
    });
  });

  describe('ensureLoaded', () => {
    let element;
    let buildCallbackStub;
    let ensureLoadedStub;

    beforeEach(() => {
      element = new StubElementClass();
      buildCallbackStub = env.sandbox.stub(
        TestElement.prototype,
        'buildCallback'
      );
      ensureLoadedStub = env.sandbox.stub(
        TestElement.prototype,
        'ensureLoaded'
      );
      builderMock.expects('schedule').atLeast(0);
      builderMock.expects('scheduleAsap').atLeast(1);
    });

    it('should force build and wait for whenLoaded even if not marked as loading', async () => {
      const promise = element.ensureLoaded();

      doc.body.appendChild(element);
      element.upgrade(TestElement);

      await element.buildInternal();
      await promise;
      expect(ensureLoadedStub).to.be.calledOnce;

      await element.whenLoaded();
    });

    it('should force build and ensureLoaded if loading', async () => {
      buildCallbackStub.callsFake(function () {
        this.setReadyState('loading');
      });
      ensureLoadedStub.callsFake(function () {
        this.setReadyState('complete');
      });

      const promise = element.ensureLoaded();

      doc.body.appendChild(element);
      element.upgrade(TestElement);

      await element.buildInternal();
      await promise;
      expect(ensureLoadedStub).to.be.calledOnce;

      await element.whenLoaded();
    });
  });

  describe('setReadyStateInternal', () => {
    let element;

    beforeEach(async () => {
      builderMock.expects('schedule').atLeast(0);

      element = new ElementClass();
      doc.body.appendChild(element);
      await element.buildInternal();
      element.reset_();
      element.setReadyStateInternal('other');

      env.sandbox.stub(element, 'toggleLoading');
    });

    it('should update loading state', () => {
      expect(element.readyState).equal('other');
      expect(element.toggleLoading).to.not.be.called;
      expect(element.signals().get(CommonSignals.LOAD_START)).to.be.null;
      element.signals().signal(CommonSignals.UNLOAD);
      element.classList.remove('i-amphtml-layout');

      element.setReadyStateInternal('loading');
      expect(element.readyState).equal('loading');
      expect(element.toggleLoading).to.be.calledOnce.calledWith(true);
      expect(element.signals().get(CommonSignals.LOAD_START)).to.exist;
      expect(element.signals().get(CommonSignals.UNLOAD)).to.be.null;
      expect(element).to.have.class('i-amphtml-layout');
    });

    it('should update complete state', () => {
      const loadEventSpy = env.sandbox.spy();
      element.addEventListener('load', loadEventSpy);

      expect(element.readyState).equal('other');
      expect(element.toggleLoading).to.not.be.called;
      expect(element.signals().get(CommonSignals.LOAD_END)).to.be.null;
      element.classList.remove('i-amphtml-layout');

      element.setReadyStateInternal('complete');
      expect(element.readyState).equal('complete');
      expect(element.toggleLoading).to.be.calledOnce.calledWith(false);
      expect(element.signals().get(CommonSignals.LOAD_END)).to.exist;
      expect(element).to.have.class('i-amphtml-layout');
      expect(loadEventSpy).to.be.calledOnce;
    });

    it('should update error state', () => {
      const errorEventSpy = env.sandbox.spy();
      element.addEventListener('error', errorEventSpy);

      expect(element.readyState).equal('other');
      expect(element.toggleLoading).to.not.be.called;
      expect(element.signals().get(CommonSignals.LOAD_END)).to.be.null;

      const error = new Error();
      element.setReadyStateInternal('error', error);
      expect(element.readyState).equal('error');
      expect(element.toggleLoading).to.be.calledOnce.calledWith(false);
      expect(element.signals().get(CommonSignals.LOAD_END)).to.equal(error);
      expect(errorEventSpy).to.be.calledOnce;
    });

    it('should not duplicate events', () => {
      const loadEventSpy = env.sandbox.spy();
      element.addEventListener('load', loadEventSpy);

      element.setReadyStateInternal('complete');
      expect(loadEventSpy).to.be.calledOnce;

      // Repeat.
      element.setReadyStateInternal('complete');
      expect(loadEventSpy).to.be.calledOnce; // no change.
    });
  });

  describe('executeAction', () => {
    beforeEach(async () => {
      builderMock.expects('schedule').atLeast(0);
    });

    it('should enqueue actions until built and schedule build', () => {
      const element = new ElementClass();
      const handler = env.sandbox.stub(TestElement.prototype, 'executeAction');

      builderMock.expects('scheduleAsap').withExactArgs(element).once();

      doc.body.appendChild(element);

      const inv = {};
      element.enqueAction(inv);
      const actionQueue = getActionQueueForTesting(element);
      expect(actionQueue.length).to.equal(1);
      expect(actionQueue[0]).to.equal(inv);
      expect(handler).to.not.be.called;
    });

    it('should execute action immediately after built', async () => {
      builderMock.expects('scheduleAsap').never();
      const element = new ElementClass();
      const handler = env.sandbox.stub(TestElement.prototype, 'executeAction');
      doc.body.appendChild(element);
      await element.buildInternal();

      const inv = {};
      element.enqueAction(inv);
      expect(handler).to.be.calledOnce.calledWith(inv, false);
      expect(getActionQueueForTesting(element)).to.not.exist;
    });

    it('should dequeue all actions after build', async () => {
      const element = new ElementClass();
      builderMock.expects('scheduleAsap').withExactArgs(element).atLeast(1);

      const handler = env.sandbox.stub(TestElement.prototype, 'executeAction');

      const inv1 = {};
      const inv2 = {};
      element.enqueAction(inv1);
      element.enqueAction(inv2);
      const actionQueue = getActionQueueForTesting(element);
      expect(actionQueue).to.have.length(2);
      expect(actionQueue[0]).to.equal(inv1);
      expect(actionQueue[1]).to.equal(inv2);
      expect(handler).to.not.be.called;

      doc.body.appendChild(element);
      await element.buildInternal();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(getActionQueueForTesting(element)).to.not.exist;
      expect(handler)
        .to.be.calledTwice.calledWith(inv1, true)
        .calledWith(inv2, true);
    });
  });
});
