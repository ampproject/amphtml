/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
import {ElementStub, setLoadingCheckForTests} from '../../src/element-stub';
import {LOADING_ELEMENTS_, Layout} from '../../src/layout';
import {installResourcesServiceForDoc} from '../../src/service/resources-impl';
import {poll} from '../../testing/iframe';
import {ResourceState} from '../../src/service/resource';
import {resourcesForDoc} from '../../src/services';
import {vsyncFor} from '../../src/services';
import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../src/service';
import {
  copyElementToChildWindow,
  createAmpElementProto,
  getElementClassForTesting,
  markElementScheduledForTesting,
  registerElement,
  resetScheduledElementForTesting,
  stubElementIfNotKnown,
  stubElements,
  upgradeOrRegisterElement,
} from '../../src/custom-element';
// TODO(@cramforce): Move tests into their own file.
import {
  getElementService,
  getElementServiceIfAvailable,
  getElementServiceForDoc,
  getElementServiceIfAvailableForDoc,
} from '../../src/element-service';
import * as lolex from 'lolex';


describes.realWin('CustomElement register', {amp: 1}, env => {

  class ConcreteElement extends BaseElement {}

  let win;

  beforeEach(() => {
    win = env.win;
    setLoadingCheckForTests('amp-element1');
    installResourcesServiceForDoc(window.document);
  });

  it('should go through stub/upgrade cycle', () => {
    registerElement(win, 'amp-element1', ElementStub);
    expect(getElementClassForTesting(win, 'amp-element1'))
        .to.equal(ElementStub);

    // Pre-download elements are created as ElementStub.
    const element1 = win.document.createElement('amp-element1');
    win.document.body.appendChild(element1);
    expect(element1.implementation_).to.be.instanceOf(ElementStub);

    // Post-download, elements are upgraded.
    upgradeOrRegisterElement(win, 'amp-element1', ConcreteElement);
    expect(getElementClassForTesting(win, 'amp-element1'))
        .to.equal(ConcreteElement);
    expect(element1.implementation_).to.be.instanceOf(ConcreteElement);

    // Elements created post-download and immediately upgraded.
    const element2 = win.document.createElement('amp-element1');
    win.document.body.appendChild(element1);
    expect(element2.implementation_).to.be.instanceOf(ConcreteElement);
  });
});


describes.realWin('CustomElement', {amp: true}, env => {
  let win, doc;
  let resources;
  let resourcesMock;
  let clock;
  let testElementGetInsersectionElementLayoutBox;
  let container;
  let ElementClass, StubElementClass;

  let testElementCreatedCallback;
  let testElementPreconnectCallback;
  let testElementFirstAttachedCallback;
  let testElementBuildCallback;
  let testElementCreatePlaceholderCallback;
  let testElementLayoutCallback;
  let testElementFirstLayoutCompleted;
  let testElementViewportCallback;
  let testElementUnlayoutCallback;
  let testElementPauseCallback;
  let testElementResumeCallback;

  class TestElement extends BaseElement {
    isLayoutSupported(unusedLayout) {
      return true;
    }
    createdCallback() {
      testElementCreatedCallback();
    }
    preconnectCallback(onLayout) {
      testElementPreconnectCallback(onLayout);
    }
    firstAttachedCallback() {
      testElementFirstAttachedCallback();
    }
    buildCallback() {
      testElementBuildCallback();
    }
    createPlaceholderCallback() {
      testElementCreatePlaceholderCallback();
    }
    layoutCallback() {
      testElementLayoutCallback();
      return Promise.resolve();
    }
    firstLayoutCompleted() {
      testElementFirstLayoutCompleted();
    }
    viewportCallback(inViewport) {
      testElementViewportCallback(inViewport);
    }
    getIntersectionElementLayoutBox() {
      testElementGetInsersectionElementLayoutBox();
      return {top: 10, left: 10, width: 11, height: 1};
    }
    unlayoutCallback() {
      testElementUnlayoutCallback();
      return true;
    }
    pauseCallback() {
      testElementPauseCallback();
    }
    resumeCallback() {
      testElementResumeCallback();
    }
  }

  class TestElementWithReUpgrade extends BaseElement {
    isLayoutSupported(unusedLayout) {
      return true;
    }
    upgradeCallback() {
      return new TestElement(this.element);
    }
  }

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    clock = lolex.install(win);
    resources = resourcesForDoc(doc);
    resources.isBuildOn_ = true;
    resourcesMock = sandbox.mock(resources);
    container = doc.createElement('div');
    doc.body.appendChild(container);

    ElementClass = doc.registerElement('amp-test', {
      prototype: createAmpElementProto(win, 'amp-test', TestElement),
    });
    StubElementClass = doc.registerElement('amp-stub', {
      prototype: createAmpElementProto(win, 'amp-stub', ElementStub),
    });

    testElementCreatedCallback = sandbox.spy();
    testElementPreconnectCallback = sandbox.spy();
    testElementFirstAttachedCallback = sandbox.spy();
    testElementBuildCallback = sandbox.spy();
    testElementCreatePlaceholderCallback = sandbox.spy();
    testElementLayoutCallback = sandbox.spy();
    testElementFirstLayoutCompleted = sandbox.spy();
    testElementViewportCallback = sandbox.spy();
    testElementGetInsersectionElementLayoutBox = sandbox.spy();
    testElementUnlayoutCallback = sandbox.spy();
    testElementPauseCallback = sandbox.spy();
    testElementResumeCallback = sandbox.spy();
  });

  afterEach(() => {
    resourcesMock.verify();
  });

  it('should initialize ampdoc and resources on attach only', () => {
    const element = new ElementClass();
    expect(element.ampdoc_).to.be.null;
    expect(() => element.getAmpDoc()).to.throw(/no ampdoc yet/);
    expect(element.resources_).to.be.null;
    expect(() => element.getResources()).to.throw(/no resources yet/);

    // Resources available after attachment.
    container.appendChild(element);
    expect(element.ampdoc_).to.be.ok;
    expect(element.getAmpDoc()).to.be.ok;
    expect(element.resources_).to.be.ok;
    expect(element.getResources()).to.be.ok;
  });

  it('Element - createdCallback', () => {
    const element = new ElementClass();
    const build = sandbox.stub(element, 'build');

    expect(element.isBuilt()).to.equal(false);
    expect(element.hasAttributes()).to.equal(false);
    expect(element.isUpgraded()).to.equal(false);
    expect(element.upgradeState_).to.equal(/* NOT_UPGRADED */ 1);
    expect(element.readyState).to.equal('loading');
    expect(element.everAttached).to.equal(false);
    expect(element.layout_).to.equal(Layout.NODISPLAY);
    expect(testElementCreatedCallback).to.have.not.been.called;

    container.appendChild(element);
    expect(element).to.have.class('i-amphtml-element');
    expect(element).to.have.class('i-amphtml-notbuilt');
    expect(element).to.have.class('amp-notbuilt');
    expect(element.everAttached).to.equal(true);
    expect(testElementCreatedCallback).to.be.calledOnce;
    expect(element.isUpgraded()).to.equal(true);
    expect(build.calledOnce);

    expect(element.getResourceId())
        .to.equal(resources.getResourceForElement(element).getId());
  });

  it('StubElement - createdCallback', () => {
    const element = new StubElementClass();
    const build = sandbox.stub(element, 'build');

    expect(element.isBuilt()).to.equal(false);
    expect(element.hasAttributes()).to.equal(false);
    expect(element.isUpgraded()).to.equal(false);
    expect(element.readyState).to.equal('loading');
    expect(element.everAttached).to.equal(false);
    expect(element.layout_).to.equal(Layout.NODISPLAY);
    expect(testElementCreatedCallback).to.have.not.been.called;

    container.appendChild(element);
    expect(element).to.have.class('i-amphtml-element');
    expect(element).to.have.class('i-amphtml-notbuilt');
    expect(element).to.have.class('amp-notbuilt');
    expect(element.everAttached).to.equal(true);
    expect(testElementCreatedCallback).to.have.not.been.called;
    expect(element.isUpgraded()).to.equal(false);
    expect(build.calledOnce);
  });

  it('Element - should only add classes on first attachedCallback', () => {
    const element = new ElementClass();
    sandbox.stub(element, 'build');

    expect(element).to.not.have.class('i-amphtml-element');
    expect(element).to.not.have.class('i-amphtml-notbuilt');
    expect(element).to.not.have.class('amp-notbuilt');

    container.appendChild(element);

    expect(element).to.have.class('i-amphtml-element');
    expect(element).to.have.class('i-amphtml-notbuilt');
    expect(element).to.have.class('amp-notbuilt');
    element.classList.remove('i-amphtml-element');
    element.classList.remove('i-amphtml-notbuilt');
    element.classList.remove('amp-notbuilt');

    element.attachedCallback();

    expect(element).to.not.have.class('i-amphtml-element');
    expect(element).to.not.have.class('i-amphtml-notbuilt');
    expect(element).to.not.have.class('amp-notbuilt');
  });

  it('Element - should reset on 2nd attachedCallback when requested', () => {
    clock.tick(1);
    const element = new ElementClass();
    sandbox.stub(element, 'build');
    container.appendChild(element);

    sandbox.stub(element, 'reconstructWhenReparented', () => true);
    element.layoutCount_ = 10;
    element.isFirstLayoutCompleted_ = true;
    element.signals().signal('render-start');
    element.signals().signal('load-end');
    element.attachedCallback();
    expect(element.layoutCount_).to.equal(0);
    expect(element.isFirstLayoutCompleted_).to.be.false;
    expect(element.signals().get('render-start')).to.be.null;
    expect(element.signals().get('load-end')).to.be.null;
  });

  it('Element - should NOT reset on 2nd attachedCallback w/o request', () => {
    clock.tick(1);
    const element = new ElementClass();
    sandbox.stub(element, 'build');
    container.appendChild(element);

    sandbox.stub(element, 'reconstructWhenReparented', () => false);
    element.layoutCount_ = 10;
    element.isFirstLayoutCompleted_ = true;
    element.signals().signal('render-start');
    expect(element.signals().get('render-start')).to.be.ok;
    element.signals().signal('load-end');
    element.attachedCallback();
    expect(element.layoutCount_).to.equal(10);
    expect(element.isFirstLayoutCompleted_).to.be.true;
    expect(element.signals().get('render-start')).to.be.ok;
    expect(element.signals().get('load-end')).to.be.ok;
  });

  it('Element - getIntersectionChangeEntry', () => {
    const element = new ElementClass();
    container.appendChild(element);
    element.updateLayoutBox({top: 0, left: 0, width: 111, height: 51});
    element.getIntersectionChangeEntry();
    expect(testElementGetInsersectionElementLayoutBox).to.be.calledOnce;
  });

  it('Element - updateLayoutBox', () => {
    const element = new ElementClass();
    container.appendChild(element);
    expect(element.layoutWidth_).to.equal(-1);
    expect(element.implementation_.layoutWidth_).to.equal(-1);

    element.updateLayoutBox({top: 0, left: 0, width: 111, height: 51});
    expect(element.layoutWidth_).to.equal(111);
    expect(element.implementation_.layoutWidth_).to.equal(111);
  });

  it('should tolerate erros in onLayoutMeasure', () => {
    const element = new ElementClass();
    sandbox.stub(element.implementation_, 'onLayoutMeasure', () => {
      throw new Error('intentional');
    });
    const errorStub = sandbox.stub(element, 'dispatchCustomEventForTesting');
    container.appendChild(element);
    element.updateLayoutBox({top: 0, left: 0, width: 111, height: 51});
    expect(element.layoutWidth_).to.equal(111);
    expect(element.implementation_.layoutWidth_).to.equal(111);
    expect(errorStub).to.be.calledWith('amp:error', 'intentional');
  });

  it('StubElement - upgrade after attached', () => {
    const element = new StubElementClass();
    expect(element.isUpgraded()).to.equal(false);
    expect(testElementCreatedCallback).to.have.not.been.called;

    element.setAttribute('layout', 'fill');
    element.updateLayoutBox({top: 0, left: 0, width: 111, height: 51});
    container.appendChild(element);
    resourcesMock.expects('upgraded').withExactArgs(element).once();

    element.upgrade(TestElement);

    expect(element.isUpgraded()).to.equal(true);
    expect(element.implementation_).to.be.instanceOf(TestElement);
    expect(element.implementation_.layout_).to.equal(Layout.FILL);
    expect(element.implementation_.layoutWidth_).to.equal(111);
    expect(testElementCreatedCallback).to.be.calledOnce;
    expect(testElementFirstAttachedCallback).to.be.calledOnce;
    expect(element.isBuilt()).to.equal(false);
  });

  it('StubElement - upgrade before attached', () => {
    const element = new StubElementClass();
    expect(element.isUpgraded()).to.equal(false);
    expect(testElementCreatedCallback).to.have.not.been.called;

    element.setAttribute('layout', 'fill');
    element.updateLayoutBox({top: 0, left: 0, width: 111, height: 51});
    resourcesMock.expects('upgraded').withExactArgs(element).never();

    element.upgrade(TestElement);

    expect(element.isUpgraded()).to.equal(false);
    expect(element.implementation_).to.be.instanceOf(TestElement);
    expect(testElementCreatedCallback).to.have.not.been.called;
    expect(testElementFirstAttachedCallback).to.have.not.been.called;
    expect(element.isBuilt()).to.equal(false);
  });

  it('StubElement - should NOT allow upgrade for a template element', () => {
    const element = new StubElementClass();
    expect(element.isUpgraded()).to.equal(false);
    element.isInTemplate_ = true;

    resourcesMock.expects('upgraded').withExactArgs(element).never();

    element.upgrade(TestElement);
    expect(element.isUpgraded()).to.equal(false);
    expect(element.isBuilt()).to.equal(false);
  });

  it('Element - re-upgrade to new direct instance', () => {
    const element = new ElementClass();
    expect(element.isUpgraded()).to.equal(false);
    const newImpl = new TestElement(element);
    element.implementation_.upgradeCallback = () => newImpl;

    container.appendChild(element);
    expect(element.isUpgraded()).to.equal(true);
    expect(element.implementation_).to.equal(newImpl);
  });

  it('Element - re-upgrade to new promised instance', () => {
    const element = new ElementClass();
    expect(element.isUpgraded()).to.equal(false);
    const oldImpl = element.implementation_;
    const newImpl = new TestElement(element);
    const promise = Promise.resolve(newImpl);
    oldImpl.upgradeCallback = () => promise;

    container.appendChild(element);
    expect(element.implementation_).to.equal(oldImpl);
    expect(element.isUpgraded()).to.equal(false);
    expect(element.upgradeState_).to.equal(/* UPGRADE_IN_PROGRESS */ 4);
    return promise.then(() => {
      // Skip a microtask.
    }).then(() => {
      expect(element.implementation_).to.equal(newImpl);
      expect(element.isUpgraded()).to.equal(true);
      expect(element.upgradeState_).to.equal(/* UPGRADED */ 2);
    });
  });

  it('Element - re-upgrade to new promised null', () => {
    const element = new ElementClass();
    expect(element.isUpgraded()).to.equal(false);
    const oldImpl = element.implementation_;
    const promise = Promise.resolve(null);
    oldImpl.upgradeCallback = () => promise;

    container.appendChild(element);
    expect(element.implementation_).to.equal(oldImpl);
    expect(element.isUpgraded()).to.equal(false);
    expect(element.upgradeState_).to.equal(/* UPGRADE_IN_PROGRESS */ 4);
    return promise.then(() => {
      // Skip a microtask.
    }).then(() => {
      expect(element.implementation_).to.equal(oldImpl);
      expect(element.isUpgraded()).to.equal(true);
      expect(element.upgradeState_).to.equal(/* UPGRADED */ 2);
    });
  });

  it('Element - re-upgrade with a failed promised', () => {
    const element = new ElementClass();
    expect(element.isUpgraded()).to.equal(false);
    const oldImpl = element.implementation_;
    const promise = Promise.reject();
    oldImpl.upgradeCallback = () => promise;

    container.appendChild(element);
    expect(element.implementation_).to.equal(oldImpl);
    expect(element.isUpgraded()).to.equal(false);
    expect(element.upgradeState_).to.equal(/* UPGRADE_IN_PROGRESS */ 4);
    return promise.catch(() => {
      // Ignore error.
    }).then(() => {
      expect(element.implementation_).to.equal(oldImpl);
      expect(element.isUpgraded()).to.equal(false);
      expect(element.upgradeState_).to.equal(/* UPGRADE_FAILED */ 3);
    });
  });

  it('Element - can only re-upgrade once', () => {
    const element = new ElementClass();
    expect(element.isUpgraded()).to.equal(false);
    const oldImpl = element.implementation_;
    const newImpl = new TestElement(element);
    const newImpl2 = new TestElement(element);
    const promise = Promise.resolve(newImpl);
    oldImpl.upgradeCallback = () => promise;

    container.appendChild(element);
    expect(element.implementation_).to.equal(oldImpl);
    expect(element.isUpgraded()).to.equal(false);
    expect(element.upgradeState_).to.equal(/* UPGRADE_IN_PROGRESS */ 4);

    oldImpl.upgradeCallback = () => newImpl2;
    container.appendChild(element);
    expect(element.implementation_).to.equal(oldImpl);
    expect(element.isUpgraded()).to.equal(false);
    expect(element.upgradeState_).to.equal(/* UPGRADE_IN_PROGRESS */ 4);
    return promise.then(() => {
      // Skip a microtask.
    }).then(() => {
      expect(element.implementation_).to.equal(newImpl);
      expect(element.isUpgraded()).to.equal(true);
      expect(element.upgradeState_).to.equal(/* UPGRADED */ 2);
    });
  });

  it('StubElement - re-upgrade', () => {
    const element = new StubElementClass();
    expect(element.isUpgraded()).to.equal(false);
    expect(testElementCreatedCallback).to.have.not.been.called;
    resourcesMock.expects('upgraded').withExactArgs(element).never();

    element.upgrade(TestElementWithReUpgrade);

    expect(element.isUpgraded()).to.equal(false);
    expect(testElementCreatedCallback).to.have.not.been.called;
  });


  it('Element - build NOT allowed before attachment', () => {
    const element = new ElementClass();
    expect(() => {
      element.build();
    }).to.throw(/upgrade/);
  });

  it('Element - build allowed', () => {
    const element = new ElementClass();

    expect(element.isBuilt()).to.equal(false);
    expect(testElementBuildCallback).to.have.not.been.called;
    expect(element.signals().get('built')).to.not.be.ok;

    clock.tick(1);
    container.appendChild(element);

    expect(element.isBuilt()).to.equal(true);
    expect(element).to.not.have.class('i-amphtml-notbuilt');
    expect(element).to.not.have.class('amp-notbuilt');
    expect(testElementBuildCallback).to.be.calledOnce;
    expect(element.signals().get('built')).to.be.ok;
    return element.whenBuilt();  // Should eventually resolve.
  });

  it('should anticipate build errors', () => {
    const element = new ElementClass();
    sandbox.stub(element.implementation_, 'buildCallback', () => {
      throw new Error('intentional');
    });
    container.appendChild(element);
    expect(element.isBuilt()).to.be.false;
    expect(element).to.have.class('i-amphtml-notbuilt');
    expect(element).to.have.class('amp-notbuilt');
    return expect(element.whenBuilt())
        .to.be.eventually.rejectedWith(/intentional/);
  });

  it('Element - build creates a placeholder if one does not exist' , () => {
    const element = new ElementClass();
    expect(testElementCreatePlaceholderCallback).to.have.not.been.called;

    container.appendChild(element);

    expect(element.isBuilt()).to.equal(true);
    expect(testElementCreatePlaceholderCallback).to.be.calledOnce;
  });

  it('Element - build does not create a placeholder when one exists' , () => {
    const element = new ElementClass();
    const placeholder = doc.createElement('div');
    placeholder.setAttribute('placeholder', '');
    element.appendChild(placeholder);
    expect(testElementCreatePlaceholderCallback).to.have.not.been.called;

    container.appendChild(element);
    expect(element.isBuilt()).to.equal(true);
    expect(testElementCreatePlaceholderCallback).to.have.not.been.called;
  });

  it('Element - buildCallback cannot be called twice', () => {
    const element = new ElementClass();
    expect(element.isBuilt()).to.equal(false);
    expect(testElementBuildCallback).to.have.not.been.called;

    container.appendChild(element);

    expect(element.isBuilt()).to.equal(true);
    expect(testElementBuildCallback).to.be.calledOnce;
    expect(testElementPreconnectCallback).to.have.not.been.called;

    // Call again.
    element.build();
    expect(element.isBuilt()).to.equal(true);
    expect(testElementBuildCallback).to.be.calledOnce;
    expect(testElementPreconnectCallback).to.have.not.been.called;
    clock.tick(1);
    expect(testElementPreconnectCallback).to.be.calledOnce;
  });

  it('Element - build NOT allowed when in template', () => {
    const element = new ElementClass();
    expect(element.isBuilt()).to.equal(false);
    expect(testElementBuildCallback).to.have.not.been.called;

    element.isInTemplate_ = true;
    expect(() => {
      element.build();
    }).to.throw(/Must never be called in template/);

    expect(element.isBuilt()).to.equal(false);
    expect(testElementBuildCallback).to.have.not.been.called;
  });

  it('StubElement - build never allowed', () => {
    const element = new StubElementClass();
    expect(element.isBuilt()).to.equal(false);
    expect(testElementBuildCallback).to.have.not.been.called;

    expect(() => {
      element.build();
    }).to.throw(/Cannot build unupgraded element/);

    expect(element.isBuilt()).to.equal(false);
    expect(testElementBuildCallback).to.have.not.been.called;
  });

  it('Element - createPlaceholder', () => {
    const element = new ElementClass();
    element.createPlaceholder();
    expect(testElementCreatePlaceholderCallback).to.be.calledOnce;
  });

  it('Element - attachedCallback', () => {
    const element = new ElementClass();
    element.setAttribute('layout', 'fill');
    expect(testElementFirstAttachedCallback).to.have.not.been.called;
    expect(element.everAttached).to.equal(false);
    expect(element.layout_).to.equal(Layout.NODISPLAY);

    resourcesMock.expects('add').withExactArgs(element).atLeast(1);
    resourcesMock.expects('upgraded').withExactArgs(element).atLeast(1);
    container.appendChild(element);

    expect(element.everAttached).to.equal(true);
    expect(element.layout_).to.equal(Layout.FILL);
    expect(element.implementation_.layout_).to.equal(Layout.FILL);
    expect(testElementFirstAttachedCallback).to.be.calledOnce;
  });

  it('StubElement - attachedCallback', () => {
    const element = new StubElementClass();
    element.setAttribute('layout', 'fill');
    expect(testElementFirstAttachedCallback).to.have.not.been.called;
    expect(element.everAttached).to.equal(false);
    expect(element.layout_).to.equal(Layout.NODISPLAY);

    resourcesMock.expects('add').withExactArgs(element).atLeast(1);
    container.appendChild(element);

    expect(element.everAttached).to.equal(true);
    expect(element.layout_).to.equal(Layout.FILL);
    // Not upgraded yet!
    expect(testElementCreatedCallback).to.have.not.been.called;
    expect(testElementFirstAttachedCallback).to.have.not.been.called;
    expect(element).to.have.class('amp-unresolved');
    expect(element).to.have.class('i-amphtml-unresolved');

    // Upgrade
    resourcesMock.expects('upgraded').withExactArgs(element).once();
    element.upgrade(TestElement);

    expect(element.layout_).to.equal(Layout.FILL);
    expect(element.implementation_.layout_).to.equal(Layout.FILL);
    // Now it's called.
    expect(testElementCreatedCallback).to.be.calledOnce;
    expect(testElementFirstAttachedCallback).to.be.calledOnce;
    expect(element).to.not.have.class('amp-unresolved');
    expect(element).to.not.have.class('i-amphtml-unresolved');
  });

  it('Element - detachedCallback', () => {
    const element = new ElementClass();
    element.setAttribute('layout', 'fill');
    expect(testElementFirstAttachedCallback).to.have.not.been.called;
    expect(element.everAttached).to.equal(false);
    expect(element.layout_).to.equal(Layout.NODISPLAY);

    resourcesMock.expects('add').withExactArgs(element).atLeast(1);
    resourcesMock.expects('upgraded').withExactArgs(element).atLeast(1);
    container.appendChild(element);

    resourcesMock.expects('remove').withExactArgs(element).once();
    element.detachedCallback();

    expect(element.everAttached).to.equal(true);
    expect(element.layout_).to.equal(Layout.FILL);
    expect(element.implementation_.layout_).to.equal(Layout.FILL);
    expect(testElementFirstAttachedCallback).to.be.calledOnce;
  });


  it('Element - layoutCallback before build', () => {
    const element = new ElementClass();
    element.setAttribute('layout', 'fill');
    expect(testElementLayoutCallback).to.have.not.been.called;
    expect(element.isBuilt()).to.equal(false);

    expect(() => {
      element.layoutCallback();
    }).to.throw(/Must be built to receive viewport events/);

    expect(testElementLayoutCallback).to.have.not.been.called;
  });

  it('StubElement - layoutCallback before build or upgrade', () => {
    const element = new StubElementClass();
    element.setAttribute('layout', 'fill');
    expect(testElementLayoutCallback).to.have.not.been.called;

    expect(element.isUpgraded()).to.equal(false);
    expect(element.isBuilt()).to.equal(false);
    expect(() => {
      element.layoutCallback();
    }).to.throw(/Must be built to receive viewport events/);

    resourcesMock.expects('upgraded').withExactArgs(element).never();
    element.upgrade(TestElement);

    expect(element.isUpgraded()).to.equal(false);
    expect(element.isBuilt()).to.equal(false);
    expect(() => {
      element.layoutCallback();
    }).to.throw(/Must be built to receive viewport events/);

    expect(testElementLayoutCallback).to.have.not.been.called;
  });

  it('Element - layoutCallback', () => {
    const element = new ElementClass();
    element.setAttribute('layout', 'fill');
    container.appendChild(element);
    element.build();
    expect(element.isBuilt()).to.equal(true);
    expect(testElementLayoutCallback).to.have.not.been.called;
    clock.tick(1);
    expect(testElementPreconnectCallback).to.be.calledOnce;
    expect(testElementPreconnectCallback.getCall(0).args[0]).to.be.false;

    const p = element.layoutCallback();
    expect(testElementLayoutCallback).to.be.calledOnce;
    expect(testElementPreconnectCallback).to.have.callCount(2);
    expect(testElementPreconnectCallback.getCall(1).args[0]).to.be.true;
    expect(element.signals().get('load-start')).to.be.ok;
    expect(element.signals().get('load-end')).to.be.null;
    return p.then(() => {
      expect(element.readyState).to.equal('complete');
      expect(element.signals().get('load-end')).to.be.ok;
    });
  });

  it('Element - layoutCallback should call firstLayoutCompleted only once',
      () => {
        const element = new ElementClass();
        element.setAttribute('layout', 'fill');
        container.appendChild(element);

        const p = element.layoutCallback();
        expect(testElementLayoutCallback).to.be.calledOnce;
        expect(testElementFirstLayoutCompleted).to.have.not.been.called;
        return p.then(() => {
          expect(testElementFirstLayoutCompleted).to.be.calledOnce;

          // But not second time.
          const p2 = element.layoutCallback();
          expect(testElementLayoutCallback).to.have.callCount(2);
          expect(testElementFirstLayoutCompleted).to.be.calledOnce;
          return p2.then(() => {
            expect(testElementFirstLayoutCompleted).to.be.calledOnce;
          });
        });
      });

  it('Element - layoutCallback is NOT allowed in template', () => {
    const element = new ElementClass();
    element.setAttribute('layout', 'fill');
    container.appendChild(element);
    element.build();
    expect(element.isBuilt()).to.equal(true);
    expect(testElementLayoutCallback).to.have.not.been.called;

    element.isInTemplate_ = true;
    expect(() => {
      element.layoutCallback();
    }).to.throw(/Must never be called in template/);
  });

  it('StubElement - layoutCallback should fail before attach', () => {
    const element = new StubElementClass();
    element.setAttribute('layout', 'fill');
    resourcesMock.expects('upgraded').withExactArgs(element).never();
    element.upgrade(TestElement);
    expect(() => element.build()).to.throw(/Cannot build unupgraded element/);
    expect(element.isUpgraded()).to.equal(false);
    expect(element.isBuilt()).to.equal(false);
    expect(testElementLayoutCallback).to.have.not.been.called;
  });

  it('StubElement - layoutCallback after attached', () => {
    const element = new StubElementClass();
    element.setAttribute('layout', 'fill');
    element.everAttached = true;
    element.resources_ = resources;
    resourcesMock.expects('upgraded').withExactArgs(element).once();
    element.upgrade(TestElement);
    element.build();
    expect(element.isUpgraded()).to.equal(true);
    expect(element.isBuilt()).to.equal(true);
    expect(testElementLayoutCallback).to.have.not.been.called;

    const p = element.layoutCallback();
    expect(testElementLayoutCallback).to.be.calledOnce;
    return p.then(() => {
      expect(element.readyState).to.equal('complete');
    });
  });


  it('should enqueue actions until built', () => {
    const element = new ElementClass();
    const handler = sandbox.spy();
    element.implementation_.executeAction = handler;
    expect(element.actionQueue_).to.not.equal(null);

    const inv = {};
    element.enqueAction(inv);
    expect(element.actionQueue_.length).to.equal(1);
    expect(element.actionQueue_[0]).to.equal(inv);
    expect(handler).to.have.not.been.called;
  });

  it('should execute action immediately after built', () => {
    const element = new ElementClass();
    const handler = sandbox.spy();
    element.implementation_.executeAction = handler;
    container.appendChild(element);
    element.build();

    const inv = {};
    element.enqueAction(inv);
    expect(handler).to.be.calledOnce;
    expect(handler.getCall(0).args[0]).to.equal(inv);
    expect(handler.getCall(0).args[1]).to.equal(false);
  });

  it('should dequeue all actions after build', () => {
    const element = new ElementClass();
    const handler = sandbox.spy();
    element.implementation_.executeAction = handler;

    const inv1 = {};
    const inv2 = {};
    element.enqueAction(inv1);
    element.enqueAction(inv2);
    expect(element.actionQueue_.length).to.equal(2);
    expect(element.actionQueue_[0]).to.equal(inv1);
    expect(element.actionQueue_[1]).to.equal(inv2);
    expect(handler).to.have.not.been.called;

    container.appendChild(element);
    clock.tick(10);
    expect(handler).to.have.callCount(2);
    expect(handler.getCall(0).args[0]).to.equal(inv1);
    expect(handler.getCall(0).args[1]).to.equal(true);
    expect(handler.getCall(1).args[0]).to.equal(inv2);
    expect(handler.getCall(1).args[1]).to.equal(true);
    expect(element.actionQueue_).to.equal(null);
  });

  it('should NOT enqueue actions when in template', () => {
    const element = new ElementClass();
    const handler = sandbox.spy();
    element.implementation_.executeAction = handler;
    expect(element.actionQueue_).to.not.equal(null);

    const inv = {};
    element.isInTemplate_ = true;
    expect(() => {
      element.enqueAction(inv);
    }).to.throw(/Must never be called in template/);
  });


  it('should apply media condition', () => {
    const element1 = new ElementClass();
    element1.setAttribute('media', '(min-width: 1px)');
    element1.applySizesAndMediaQuery();
    expect(element1).to.not.have.class('i-amphtml-hidden-by-media-query');

    const element2 = new ElementClass();
    element2.setAttribute('media', '(min-width: 1111111px)');
    element2.applySizesAndMediaQuery();
    expect(element2).to.have.class('i-amphtml-hidden-by-media-query');
  });

  it('should apply sizes condition', () => {
    const element1 = new ElementClass();
    element1.setAttribute('sizes', '(min-width: 1px) 200px, 50vw');
    element1.applySizesAndMediaQuery();
    expect(element1.style.width).to.equal('200px');

    const element2 = new ElementClass();
    element2.setAttribute('sizes', '(min-width: 1111111px) 200px, 50vw');
    element2.applySizesAndMediaQuery();
    expect(element2.style.width).to.equal('50vw');
  });

  it('should apply heights condition', () => {
    const element1 = new ElementClass();
    element1.sizerElement_ = doc.createElement('div');
    element1.setAttribute('layout', 'responsive');
    element1.setAttribute('width', '200px');
    element1.setAttribute('height', '200px');
    element1.setAttribute('heights', '(min-width: 1px) 99%, 1%');
    container.appendChild(element1);
    element1.applySizesAndMediaQuery();
    expect(element1.sizerElement_.style.paddingTop).to.equal('99%');

    const element2 = new ElementClass();
    element2.sizerElement_ = doc.createElement('div');
    element2.setAttribute('layout', 'responsive');
    element2.setAttribute('width', '200px');
    element2.setAttribute('height', '200px');
    element2.setAttribute('heights', '(min-width: 1111111px) 99%, 1%');
    container.appendChild(element2);
    element2.applySizesAndMediaQuery();
    expect(element2.sizerElement_.style.paddingTop).to.equal('1%');
  });

  it('should rediscover sizer to apply heights in SSR', () => {
    const element1 = new ElementClass();
    element1.setAttribute('i-amphtml-layout', 'responsive');
    element1.setAttribute('layout', 'responsive');
    element1.setAttribute('width', '200px');
    element1.setAttribute('height', '200px');
    element1.setAttribute('heights', '(min-width: 1px) 99%, 1%');
    container.appendChild(element1);

    const sizer = doc.createElement('i-amphtml-sizer');
    expect(element1.sizerElement_).to.be.undefined;
    element1.appendChild(sizer);
    element1.applySizesAndMediaQuery();
    expect(element1.sizerElement_).to.equal(sizer);
    expect(sizer.style.paddingTop).to.equal('99%');
  });

  it('should NOT rediscover sizer after reset in SSR', () => {
    const element1 = new ElementClass();
    element1.setAttribute('i-amphtml-layout', 'responsive');
    element1.setAttribute('layout', 'responsive');
    element1.setAttribute('width', '200px');
    element1.setAttribute('height', '200px');
    element1.setAttribute('heights', '(min-width: 1px) 99%, 1%');
    container.appendChild(element1);

    const sizer = doc.createElement('i-amphtml-sizer');
    element1.appendChild(sizer);
    element1.sizerElement_ = null;
    element1.applySizesAndMediaQuery();
    expect(element1.sizerElement_).to.be.null;
    expect(sizer.style.paddingTop).to.equal('');
  });

  it('should reapply layout=nodisplay in SSR', () => {
    const element1 = new ElementClass();
    element1.setAttribute('i-amphtml-layout', 'nodisplay');
    element1.setAttribute('layout', 'nodisplay');
    container.appendChild(element1);
    // TODO(dvoytenko, #9353): cleanup once `toggleLayoutDisplay` API has been
    // fully migrated.
    expect(element1.style.display).to.equal('none');
    expect(element1).to.have.class('i-amphtml-display');
  });

  it('should change size without sizer', () => {
    const element = new ElementClass();
    element.changeSize(111, 222, {top: 1, right: 2, bottom: 3, left: 4});
    expect(element.style.height).to.equal('111px');
    expect(element.style.width).to.equal('222px');
    expect(element.style.marginTop).to.equal('1px');
    expect(element.style.marginRight).to.equal('2px');
    expect(element.style.marginBottom).to.equal('3px');
    expect(element.style.marginLeft).to.equal('4px');
  });

  it('should change size - height only without sizer', () => {
    const element = new ElementClass();
    element.changeSize(111);
    expect(element.style.height).to.equal('111px');
  });

  it('should change size - width only without sizer', () => {
    const element = new ElementClass();
    element.changeSize(undefined, 111);
    expect(element.style.width).to.equal('111px');
  });

  it('should change size - margins only without sizer', () => {
    const element = new ElementClass();
    element.changeSize(undefined, undefined,
        {top: 1, right: 2, bottom: 3, left: 4});
    expect(element.style.marginTop).to.equal('1px');
    expect(element.style.marginRight).to.equal('2px');
    expect(element.style.marginBottom).to.equal('3px');
    expect(element.style.marginLeft).to.equal('4px');
  });

  it('should change size - some margins only without sizer', () => {
    const element = new ElementClass();
    element.style.margin = '1px 2px 3px 4px';
    element.changeSize(undefined, undefined, {top: 5, left: 6});
    expect(element.style.marginTop).to.equal('5px');
    expect(element.style.marginRight).to.equal('2px');
    expect(element.style.marginBottom).to.equal('3px');
    expect(element.style.marginLeft).to.equal('6px');
  });

  it('should change size - some margins only without sizer', () => {
    const element = new ElementClass();
    element.style.margin = '1px 2px 3px 4px';
    element.changeSize(undefined, undefined, {top: 5, left: 6});
    expect(element.style.marginTop).to.equal('5px');
    expect(element.style.marginRight).to.equal('2px');
    expect(element.style.marginBottom).to.equal('3px');
    expect(element.style.marginLeft).to.equal('6px');
  });

  it('should change size with sizer', () => {
    const element = new ElementClass();
    const sizer = doc.createElement('div');
    element.sizerElement_ = sizer;
    element.changeSize(111, 222, {top: 1, right: 2, bottom: 3, left: 4});
    expect(parseInt(sizer.style.paddingTop, 10)).to.equal(0);
    expect(element.sizerElement_).to.be.null;
    expect(element.style.height).to.equal('111px');
    expect(element.style.width).to.equal('222px');
    expect(element.style.marginTop).to.equal('1px');
    expect(element.style.marginRight).to.equal('2px');
    expect(element.style.marginBottom).to.equal('3px');
    expect(element.style.marginLeft).to.equal('4px');
  });

  it('should NOT apply media condition in template', () => {
    const element1 = new ElementClass();
    element1.setAttribute('media', '(min-width: 1px)');
    element1.isInTemplate_ = true;
    expect(() => {
      element1.applySizesAndMediaQuery();
    }).to.throw(/Must never be called in template/);
  });

  it('should change size to zero', () => {
    const element = new ElementClass();
    element.changeSize(0, 0);
    expect(element.style.height).to.equal('0px');
    expect(element.style.width).to.equal('0px');
  });

  it('should change width to zero', () => {
    const element = new ElementClass();
    element.changeSize(undefined, 0);
    expect(element.style.width).to.equal('0px');
  });

  it('should remove i-amphtml-layout-awaiting-size class when ' +
      'size changed', () => {
    const element = new StubElementClass();
    expect(element.isUpgraded()).to.equal(false);
    element.classList.add('i-amphtml-layout-awaiting-size');

    expect(element).to.have.class('i-amphtml-layout-awaiting-size');
    element.changeSize(100, 100);
    expect(element).not.to.have.class('i-amphtml-layout-awaiting-size');
  });

  describe('unlayoutCallback', () => {

    it('should unlayout built element and reset layoutCount', () => {
      const element = new ElementClass();
      // Non-built element doesn't receive unlayoutCallback.
      element.unlayoutCallback();
      expect(testElementUnlayoutCallback).to.have.not.been.called;

      element.implementation_.layoutCallback = () => {
        testElementLayoutCallback();
        element.layoutCount_++;
        return Promise.resolve();
      };

      element.implementation_.unlayoutCallback = () => {
        testElementUnlayoutCallback();
        return true;
      };

      // Built element receives unlayoutCallback.
      container.appendChild(element);
      element.unlayoutCallback();
      expect(testElementUnlayoutCallback).to.be.calledOnce;
      expect(element.layoutCount_).to.equal(0);
    });

    it('should not reset layoutCount if relayout not requested', () => {
      const element = new ElementClass();
      container.appendChild(element);
      element.implementation_.layoutCallback = () => {
        testElementLayoutCallback();
        element.layoutCount_++;
        return Promise.resolve();
      };

      element.implementation_.unlayoutCallback = () => {
        testElementUnlayoutCallback();
        return false;
      };
      element.layoutCallback();
      element.unlayoutCallback();
      expect(testElementUnlayoutCallback).to.be.calledOnce;
      expect(element.layoutCount_).to.equal(1);
    });

    it('StubElement', () => {
      const element = new StubElementClass();

      // Unupgraded document doesn't receive unlayoutCallback.
      element.unlayoutCallback();
      expect(testElementUnlayoutCallback).to.have.not.been.called;
    });
  });

  describe('pauseCallback', () => {
    it('Element', () => {
      const element = new ElementClass();

      // Non-built element doesn't receive pauseCallback.
      element.pauseCallback();
      expect(testElementPauseCallback).to.have.not.been.called;

      // Built element receives pauseCallback.
      container.appendChild(element);
      element.pauseCallback();
      expect(testElementPauseCallback).to.be.calledOnce;
    });

    it('StubElement', () => {
      const element = new StubElementClass();

      // Unupgraded document doesn't receive pauseCallback.
      element.pauseCallback();
      expect(testElementPauseCallback).to.have.not.been.called;
    });
  });

  describe('resumeCallback', () => {
    it('Element', () => {
      const element = new ElementClass();

      // Non-built element doesn't receive resumeCallback.
      element.resumeCallback();
      expect(testElementResumeCallback).to.have.not.been.called;

      // Built element receives resumeCallback.
      container.appendChild(element);
      element.resumeCallback();
      expect(testElementResumeCallback).to.be.calledOnce;
    });

    it('StubElement', () => {
      const element = new StubElementClass();

      // Unupgraded document doesn't receive resumeCallback.
      element.resumeCallback();
      expect(testElementResumeCallback).to.have.not.been.called;
    });
  });

  describe('viewportCallback', () => {
    it('Element should allow, but not delegate before build', () => {
      const element = new ElementClass();
      element.setAttribute('layout', 'fill');
      expect(testElementViewportCallback).to.have.not.been.called;

      expect(element.isBuilt()).to.equal(false);
      element.viewportCallback(true);
      expect(element.isInViewport_).to.equal(true);
      expect(testElementViewportCallback).to.have.not.been.called;
    });

    it('StubElement - should not delegate before build or upgrade', () => {
      const element = new StubElementClass();
      element.setAttribute('layout', 'fill');
      expect(testElementViewportCallback).to.have.not.been.called;

      expect(element.isUpgraded()).to.equal(false);
      expect(element.isBuilt()).to.equal(false);
      element.viewportCallback(true);
      expect(element.isInViewport_).to.equal(true);
      expect(testElementViewportCallback).to.have.not.been.called;

      resourcesMock.expects('upgraded').withExactArgs(element).never();
      element.upgrade(TestElement);

      expect(element.isUpgraded()).to.equal(false);
      expect(element.isBuilt()).to.equal(false);
      element.viewportCallback(false);
      expect(element.isInViewport_).to.equal(false);
      expect(testElementViewportCallback).to.have.not.been.called;
    });

    it('Element - should be called once built', () => {
      const element = new ElementClass();
      element.setAttribute('layout', 'fill');
      container.appendChild(element);
      expect(element.isBuilt()).to.equal(true);
      expect(testElementViewportCallback).to.have.not.been.called;

      element.viewportCallback(true);
      expect(element.implementation_.inViewport_).to.equal(true);
      expect(testElementViewportCallback).to.be.calledOnce;
    });

    it('StubElement - should be called once upgraded', () => {
      const element = new StubElementClass();
      element.setAttribute('layout', 'fill');
      container.appendChild(element);
      expect(element.isUpgraded()).to.equal(false);
      expect(element.isBuilt()).to.equal(false);

      element.viewportCallback(true);
      expect(element.implementation_.inViewport_).to.equal(false);
      expect(testElementViewportCallback).to.not.have.been.called;

      element.upgrade(TestElement);
      expect(element.implementation_.inViewport_).to.equal(true);
      expect(testElementViewportCallback).to.be.calledOnce;
    });

    it('StubElement - should not upgrade before attach', () => {
      const element = new StubElementClass();
      element.setAttribute('layout', 'fill');
      resourcesMock.expects('upgraded').withExactArgs(element).never();
      element.upgrade(TestElement);
      expect(element.isUpgraded()).to.equal(false);
      expect(element.isBuilt()).to.equal(false);
      expect(element.implementation_).to.be.instanceOf(TestElement);
      expect(testElementViewportCallback).to.have.not.been.called;
    });

    it('Element - should be called on built if in viewport', () => {
      const element = new ElementClass();
      element.setAttribute('layout', 'fill');
      element.viewportCallback(true);
      expect(element.isInViewport_).to.equal(true);
      expect(testElementViewportCallback).to.have.not.been.called;

      container.appendChild(element);
      expect(element.isInViewport_).to.equal(true);
      expect(testElementViewportCallback).to.be.calledOnce;
    });

    it('Element - should NOT be called in template', () => {
      const element = new ElementClass();
      element.setAttribute('layout', 'fill');
      container.appendChild(element);
      element.build();
      expect(element.isBuilt()).to.equal(true);
      expect(testElementViewportCallback).to.have.not.been.called;

      element.isInTemplate_ = true;
      expect(() => {
        element.viewportCallback(true);
      }).to.throw(/Must never be called in template/);
    });
  });
});


describes.realWin('CustomElement Service Elements', {amp: true}, env => {
  let win, doc;
  let StubElementClass;
  let element;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    StubElementClass = doc.registerElement('amp-stub2', {
      prototype: createAmpElementProto(win, 'amp-stub2', ElementStub),
    });
    element = new StubElementClass();
  });

  function createWithAttr(attr) {
    const child = doc.createElement('div');
    child.setAttribute(attr, '');
    return child;
  }

  it('getRealChildren should return nothing', () => {
    expect(element.getRealChildNodes().length).to.equal(0);
    expect(element.getRealChildren().length).to.equal(0);
  });

  it('getRealChildren should return content-only nodes', () => {
    element.appendChild(doc.createElement('i-amp-service'));
    element.appendChild(createWithAttr('placeholder'));
    element.appendChild(createWithAttr('fallback'));
    element.appendChild(createWithAttr('overflow'));
    element.appendChild(doc.createTextNode('abc'));
    element.appendChild(doc.createElement('content'));

    const nodes = element.getRealChildNodes();
    expect(nodes.length).to.equal(2);
    expect(nodes[0].textContent).to.equal('abc');
    expect(nodes[1].tagName.toLowerCase()).to.equal('content');

    const elements = element.getRealChildren();
    expect(elements.length).to.equal(1);
    expect(elements[0].tagName.toLowerCase()).to.equal('content');
  });

  it('toggleLayoutDisplay should add/remove display class', () => {
    element.setAttribute('layout', 'nodisplay');
    win.document.body.appendChild(element);
    return poll('wait for static layout',
            () => element.classList.contains('i-amphtml-layout-nodisplay'))
        .then(() => {
          // TODO(dvoytenko, #9353): once `toggleLayoutDisplay` API has been
          // deployed this will start `false`.
          expect(element.classList.contains('i-amphtml-display')).to.be.true;

          element.style.display = 'block';
          element.toggleLayoutDisplay(true);
          expect(element.classList.contains('i-amphtml-display')).to.be.true;
          expect(win.getComputedStyle(element).display).to.equal('block');

          element.toggleLayoutDisplay(false);
          expect(element.classList.contains('i-amphtml-display')).to.be.false;
          expect(win.getComputedStyle(element).display).to.equal('none');

          element.toggleLayoutDisplay(true);
          expect(element.classList.contains('i-amphtml-display')).to.be.true;
          expect(win.getComputedStyle(element).display).to.equal('block');
        });
  });

  it('getPlaceholder should return nothing', () => {
    expect(element.getPlaceholder()).to.be.null;
  });

  it('getPlaceholder should return the last placeholder', () => {
    element.appendChild(createWithAttr('placeholder'));
    const placeholder2 = element.appendChild(createWithAttr('placeholder'));
    expect(element.getPlaceholder()).to.equal(placeholder2);
  });

  it('getPlaceholder should blacklist some tags', () => {
    const placeholder1 = element.appendChild(createWithAttr('placeholder'));
    const input = doc.createElement('input');
    input.setAttribute('placeholder', '');
    element.appendChild(input);
    expect(element.getPlaceholder()).to.not.equal(input);
    expect(element.getPlaceholder()).to.equal(placeholder1);
  });

  it('togglePlaceholder should do nothing when no placeholder is found', () => {
    expect(element.getPlaceholder()).to.be.null;
    element.togglePlaceholder(false);
  });

  it('togglePlaceholder should do hide all placeholders when found', () => {
    const placeholder1 = element.appendChild(createWithAttr('placeholder'));
    const placeholder2 = element.appendChild(createWithAttr('placeholder'));
    element.togglePlaceholder(false);
    expect(placeholder1).to.have.class('amp-hidden');
    expect(placeholder2).to.have.class('amp-hidden');

    element.togglePlaceholder(true);
    expect(placeholder1).to.have.class('amp-hidden');
    expect(placeholder2).to.not.have.class('amp-hidden');
  });

  it('toggleFallback should toggle unsupported class', () => {
    element.resource = {
      getState: () => {return ResourceState.LAYOUT_COMPLETE;},
    };
    element.resources_ = {
      scheduleLayout: function(el, fb) {
        if (el == element && fb == fallback) {
          resourcesSpy();
        }
      },
      getResourceForElement: element => {
        return element.resource;
      },
    };
    const fallback = element.appendChild(createWithAttr('fallback'));
    const resourcesSpy = sandbox.spy();
    element.toggleFallback(true);
    expect(element).to.have.class('amp-notsupported');
    expect(resourcesSpy).to.be.calledOnce;

    element.toggleFallback(false);
    expect(element).to.not.have.class('amp-notsupported');
  });

  it('toggleFallback should not display fallback before element layout', () => {
    let resourceState = ResourceState.NOT_LAID_OUT;
    element.resource = {
      getState: () => {return resourceState;},
    };
    element.resources_ = {
      scheduleLayout: () => {},
      getResourceForElement: element => {
        return element.resource;
      },
    };
    element.appendChild(createWithAttr('fallback'));
    element.toggleFallback(true);
    expect(element).to.not.have.class('amp-notsupported');
    resourceState = ResourceState.READY_FOR_LAYOUT;
    element.toggleFallback(true);
    expect(element).to.not.have.class('amp-notsupported');
    resourceState = ResourceState.LAYOUT_COMPLETE;
    element.toggleFallback(true);
    expect(element).to.have.class('amp-notsupported');
  });

  it('togglePlaceholder should NOT call in template', () => {
    element.isInTemplate_ = true;
    expect(() => {
      element.togglePlaceholder(false);
    }).to.throw(/Must never be called in template/);
  });
});


describes.realWin('CustomElement Loading Indicator', {amp: true}, env => {
  let win, doc;
  let ElementClass;
  let clock;
  let resources;
  let element;
  let vsync;
  let vsyncTasks;
  let resourcesMock;
  let container;

  class TestElement extends BaseElement {
    isLayoutSupported(unusedLayout) {
      return true;
    }
  }

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    clock = lolex.install(win);
    ElementClass = doc.registerElement('amp-test-loader', {
      prototype: createAmpElementProto(win, 'amp-test-loader', TestElement),
    });
    LOADING_ELEMENTS_['amp-test-loader'.toUpperCase()] = true;
    resources = resourcesForDoc(doc);
    resources.isBuildOn_ = true;
    resourcesMock = sandbox.mock(resources);
    element = new ElementClass();
    element.layoutWidth_ = 300;
    element.layout_ = Layout.FIXED;
    element.setAttribute('layout', 'fixed');
    element.resources_ = resources;
    vsync = vsyncFor(win);
    vsyncTasks = [];
    sandbox.stub(vsync, 'mutate', mutator => {
      vsyncTasks.push(mutator);
    });
    container = doc.createElement('div');
    doc.body.appendChild(container);
  });

  afterEach(() => {
    resourcesMock.verify();
  });


  it('should be enabled by default', () => {
    expect(element.isLoadingEnabled_()).to.be.true;
  });

  it('should disable when explicitly disabled by the attribute', () => {
    element.setAttribute('noloading', '');
    expect(element.isLoadingEnabled_()).to.be.false;
  });

  it('should disable when element is not whitelisted', () => {
    LOADING_ELEMENTS_['amp-test-loader'.toUpperCase()] = false;
    expect(element.isLoadingEnabled_()).to.be.false;
  });

  it('should disable when not measured or too small', () => {
    element.layoutWidth_ = 0;
    expect(element.isLoadingEnabled_()).to.be.false;

    element.layoutWidth_ = 10;
    expect(element.isLoadingEnabled_()).to.be.false;
  });

  it('should disable when element has already been laid out', () => {
    element.layoutCount_ = 1;
    expect(element.isLoadingEnabled_()).to.be.false;
  });

  it('should disable when element is a placeholder itself', () => {
    element.setAttribute('placeholder', '');
    expect(element.isLoadingEnabled_()).to.be.false;
  });

  it('should disable when element is not sized', () => {
    element.layout_ = Layout.CONTAINER;
    expect(element.isLoadingEnabled_()).to.be.false;

    element.layout_ = Layout.NODISPLAY;
    expect(element.isLoadingEnabled_()).to.be.false;
  });


  it('should ignore loading-off if never created', () => {
    element.toggleLoading_(false);
    expect(vsyncTasks).to.be.empty;
  });

  it('should ignore loading-on if not allowed', () => {
    element.setAttribute('noloading', '');
    element.toggleLoading_(true);
    expect(vsyncTasks).to.be.empty;
  });

  it('should ignore loading-on if already rendered', () => {
    clock.tick(1);
    element.signals().signal('render-start');
    element.toggleLoading_(true);
    expect(vsyncTasks).to.be.empty;
  });

  it('should ignore loading-on if already loaded', () => {
    element.layoutCount_ = 1;
    element.toggleLoading_(true);
    expect(vsyncTasks).to.be.empty;
  });

  it('should cancel loading on render-start', () => {
    clock.tick(1);
    const stub = sandbox.stub(element, 'toggleLoading_');
    element.renderStarted();
    expect(element.signals().get('render-start')).to.be.ok;
    expect(stub).to.be.calledOnce;
    expect(stub.args[0][0]).to.be.false;
  });

  it('should create and turn on', () => {
    element.toggleLoading_(true);
    expect(vsyncTasks).to.have.length.of(1);

    vsyncTasks.shift()();
    expect(element.loadingContainer_).to.not.be.null;
    expect(element.loadingContainer_).to.not.have.class('amp-hidden');
    expect(element.loadingElement_).to.not.be.null;
    expect(element.loadingElement_).to.have.class('amp-active');
    expect(vsyncTasks).to.have.length.of(0);
  });

  it('should turn on already created', () => {
    element.prepareLoading_();
    const container = element.loadingContainer_;
    const indicator = element.loadingElement_;
    element.toggleLoading_(true);
    expect(vsyncTasks).to.have.length.of(1);

    vsyncTasks.shift()();
    expect(element.loadingContainer_).to.equal(container);
    expect(element.loadingContainer_).to.not.have.class('amp-hidden');
    expect(element.loadingElement_).to.equal(indicator);
    expect(element.loadingElement_).to.have.class('amp-active');
    expect(vsyncTasks).to.have.length.of(0);
  });

  it('should turn off', () => {
    element.prepareLoading_();
    element.toggleLoading_(false);
    expect(vsyncTasks).to.have.length.of(1);

    vsyncTasks.shift()();
    expect(element.loadingContainer_).to.not.be.null;
    expect(element.loadingContainer_).to.have.class('amp-hidden');
    expect(element.loadingElement_).to.not.be.null;
    expect(element.loadingElement_).to.not.have.class('amp-active');
    expect(vsyncTasks).to.have.length.of(0);
  });

  it('should turn off and cleanup', () => {
    element.prepareLoading_();
    resourcesMock.expects('deferMutate').once();
    element.toggleLoading_(false, true);

    expect(vsyncTasks).to.have.length.of(1);
    vsyncTasks.shift()();
    expect(element.loadingContainer_).to.be.null;
    expect(element.loadingElement_).to.be.null;
  });

  it('should ignore loading-off if never created', () => {
    element.isInTemplate_ = true;
    expect(() => {
      element.toggleLoading_(false);
    }).to.throw(/Must never be called in template/);
  });


  it('should turn off when exits viewport', () => {
    const toggle = sandbox.spy(element, 'toggleLoading_');
    element.viewportCallback(false);
    expect(toggle).to.be.calledOnce;
    expect(toggle.firstCall.args[0]).to.equal(false);
    expect(toggle.firstCall.args[1]).to.be.undefined;
  });

  it('should NOT turn off when exits viewport but already laid out', () => {
    const toggle = sandbox.spy(element, 'toggleLoading_');
    element.layoutCount_ = 1;
    element.viewportCallback(false);
    expect(toggle).to.have.not.been.called;
  });

  it('should turn on when enters viewport', () => {
    const toggle = sandbox.spy(element, 'toggleLoading_');
    element.viewportCallback(true);
    clock.tick(1000);
    expect(toggle).to.be.calledOnce;
    expect(toggle.firstCall.args[0]).to.equal(true);
  });

  it('should NOT turn on when enters viewport but already laid out', () => {
    const toggle = sandbox.spy(element, 'toggleLoading_');
    element.layoutCount_ = 1;
    element.viewportCallback(true);
    clock.tick(1000);
    expect(toggle).to.have.not.been.called;
  });


  it('should start loading when measured if already in viewport', () => {
    const toggle = sandbox.spy(element, 'toggleLoading_');
    element.isInViewport_ = true;
    element.updateLayoutBox({top: 0, width: 300});
    expect(toggle).to.be.calledOnce;
    expect(toggle.firstCall.args[0]).to.equal(true);
  });

  it('should create loading when measured if in the top window', () => {
    const toggle = sandbox.spy(element, 'toggleLoading_');
    element.updateLayoutBox({top: 0, width: 300});
    expect(toggle).to.have.not.been.called;
    expect(vsyncTasks).to.have.length.of(1);
    vsyncTasks.shift()();
    expect(element.loadingContainer_).to.not.be.null;
    expect(element.loadingContainer_).to.have.class('amp-hidden');
  });


  it('should toggle loading off after layout complete', () => {
    const toggle = sandbox.spy(element, 'toggleLoading_');
    container.appendChild(element);
    return element.layoutCallback().then(() => {
      expect(toggle).to.be.calledOnce;
      expect(toggle.firstCall.args[0]).to.equal(false);
      expect(toggle.firstCall.args[1]).to.equal(true);
    }, () => {
      throw new Error('Should never happen.');
    });
  });

  it('should toggle loading off after layout failed', () => {
    const toggle = sandbox.spy(element, 'toggleLoading_');
    sandbox.stub(element.implementation_, 'layoutCallback', () => {
      return Promise.reject();
    });
    container.appendChild(element);
    return element.layoutCallback().then(() => {
      throw new Error('Should never happen.');
    }, () => {
      expect(toggle).to.be.calledOnce;
      expect(toggle.firstCall.args[0]).to.equal(false);
      expect(toggle.firstCall.args[1]).to.equal(true);
    });
  });

  it('should disable toggle loading on after layout failed', () => {
    const prepareLoading = sandbox.spy(element, 'prepareLoading_');
    sandbox.stub(element.implementation_, 'layoutCallback', () => {
      return Promise.reject();
    });
    container.appendChild(element);
    expect(element.layoutCount_).to.equal(0);
    expect(element.isLoadingEnabled_()).to.equal(true);
    return element.layoutCallback().then(() => {
      throw new Error('Should never happen.');
    }, () => {
      expect(element.layoutCount_).to.equal(1);
      expect(element.isLoadingEnabled_()).to.equal(false);
      element.toggleLoading_(true);
      expect(prepareLoading).to.not.have.been.called;
    });
  });

  it('should ignore loading "on" if layout completed before vsync', () => {
    resourcesMock.expects('deferMutate').once();
    container.appendChild(element);
    element.prepareLoading_();
    element.toggleLoading_(true);
    element.build();
    return element.layoutCallback().then(() => {
      expect(vsyncTasks).to.have.length(2);

      // The first mutate started by toggleLoading_(true), but it must
      // immediately proceed to switch it to off.
      vsyncTasks.shift()();
      expect(element.loadingContainer_).to.have.class('amp-hidden');
      expect(element.loadingElement_).to.not.have.class('amp-active');

      // Second vsync should perform cleanup.
      vsyncTasks.shift()();
      expect(element.loadingContainer_).to.be.null;
    }, () => {
      throw new Error('Should never happen.');
    });
  });
});


describes.realWin('CustomElement Overflow Element', {amp: true}, env => {
  let win, doc;
  let ElementClass;
  let element;
  let overflowElement;
  let vsync;
  let vsyncTasks;
  let resources;
  let resourcesMock;

  class TestElement extends BaseElement {
    isLayoutSupported(unusedLayout) {
      return true;
    }
  }

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ElementClass = doc.registerElement('amp-test-overflow', {
      prototype: createAmpElementProto(win, 'amp-test-overflow', TestElement),
    });
    resources = resourcesForDoc(doc);
    resourcesMock = sandbox.mock(resources);
    element = new ElementClass();
    element.layoutWidth_ = 300;
    element.layout_ = Layout.FIXED;
    element.resources_ = resources;
    overflowElement = doc.createElement('div');
    overflowElement.setAttribute('overflow', '');
    element.appendChild(overflowElement);
    vsync = vsyncFor(win);
    vsyncTasks = [];
    sandbox.stub(vsync, 'mutate', mutator => {
      vsyncTasks.push(mutator);
    });
  });

  afterEach(() => {
    resourcesMock.verify();
  });

  it('should NOT be initialized by default', () => {
    expect(element.overflowElement_).to.be.undefined;
  });

  it('should be initialized to null when absent', () => {
    element.removeChild(overflowElement);
    expect(element.getOverflowElement()).to.be.null;
    expect(element.overflowElement_).to.be.null;
  });

  it('should be initialized correctly when present', () => {
    expect(element.getOverflowElement()).to.exist;
    expect(element.overflowElement_).to.equal(overflowElement);
    expect(overflowElement).to.not.have.class('amp-visible');
    expect(overflowElement.getAttribute('tabindex')).to.equal('0');
    expect(overflowElement.getAttribute('role')).to.equal('button');
  });

  it('should NOT override role and tabindex', () => {
    overflowElement.setAttribute('tabindex', '1');
    overflowElement.setAttribute('role', 'list');
    expect(element.getOverflowElement()).to.equal(overflowElement);
    expect(overflowElement.getAttribute('tabindex')).to.equal('1');
    expect(overflowElement.getAttribute('role')).to.equal('list');
  });

  it('should noop when overflow is missing', () => {
    element.removeChild(overflowElement);
    expect(() => {
      element.overflowCallback(true, 111);
      element.overflowCallback(false, 111);
    }).to.not.throw();
  });

  it('should set overflow', () => {
    element.overflowCallback(true);
    expect(element.overflowElement_).to.equal(overflowElement);
    expect(overflowElement).to.have.class('amp-visible');
    expect(overflowElement.onclick).to.exist;
  });

  it('should unset overflow', () => {
    element.getOverflowElement();
    overflowElement.classList.toggle('amp-visible', true);
    element.overflowCallback(false, 117, 113);
    expect(element.overflowElement_).to.equal(overflowElement);
    expect(overflowElement).to.not.have.class('amp-visible');
    expect(overflowElement.onclick).to.not.exist;
  });

  it('should force change size when clicked', () => {
    element.overflowCallback(true, 117, 113);
    expect(overflowElement).to.have.class('amp-visible');
    resourcesMock.expects('changeSize').withExactArgs(element, 117, 113).once();

    overflowElement.onclick();

    expect(vsyncTasks).to.have.length(1);
    vsyncTasks[0]();

    expect(overflowElement.onclick).to.not.exist;
    expect(overflowElement).to.not.have.class('amp-visible');
  });

  describe('no body', () => {

    let elements;
    let doc;
    let win;
    let elem1;
    let intervalCallback;

    beforeEach(() => {
      elements = [];

      doc = {
        registerElement: sandbox.spy(),
        documentElement: {
          ownerDocument: doc,
        },
        head: {
          querySelectorAll: selector => {
            if (selector == 'script[custom-element]') {
              return elements;
            }
            return [];
          },
        },
        body: {},
      };

      elem1 = {
        getAttribute: name => {
          if (name == 'custom-element') {
            return 'amp-test1';
          }
        },
        ownerDocument: doc,
      };
      elements.push(elem1);

      intervalCallback = undefined;
      win = {
        document: doc,
        Object: {
          create: proto => Object.create(proto),
        },
        HTMLElement,
        setInterval: callback => {
          intervalCallback = callback;
        },
        clearInterval: () => {
        },
        ampExtendedElements: {},
      };
      doc.defaultView = win;

      resetServiceForTesting(win, 'e1');
      resetScheduledElementForTesting(win, 'element-1');
    });

    afterEach(() => {
      resetScheduledElementForTesting(win, 'amp-test1');
      resetScheduledElementForTesting(win, 'amp-test2');
    });

    it('should be stub elements when body available', () => {
      stubElements(win);

      expect(win.ampExtendedElements).to.exist;
      expect(win.ampExtendedElements['amp-test1']).to.equal(ElementStub);
      expect(win.ampExtendedElements['amp-test2']).to.be.undefined;
      expect(doc.registerElement).to.be.calledOnce;
      expect(doc.registerElement.firstCall.args[0]).to.equal('amp-test1');
      expect(intervalCallback).to.be.undefined;
    });

    it('should repeat stubbing when body is not available', () => {
      doc.body = null;  // Body not available

      stubElements(win);

      expect(win.ampExtendedElements).to.exist;
      expect(win.ampExtendedElements['amp-test1']).to.equal(ElementStub);
      expect(win.ampExtendedElements['amp-test2']).to.be.undefined;
      expect(doc.registerElement).to.be.calledOnce;
      expect(doc.registerElement.firstCall.args[0]).to.equal('amp-test1');
      expect(intervalCallback).to.exist;

      // Add more elements
      const elem2 = {
        getAttribute: name => {
          if (name == 'custom-element') {
            return 'amp-test2';
          }
        },
        ownerDocument: doc,
      };
      elements.push(elem2);
      doc.body = {};
      intervalCallback();

      expect(win.ampExtendedElements['amp-test1']).to.equal(ElementStub);
      expect(win.ampExtendedElements['amp-test2']).to.equal(ElementStub);
      expect(doc.registerElement).to.have.callCount(2);
      expect(doc.registerElement.getCall(1).args[0]).to.equal('amp-test2');
    });

    it('should stub element when not stubbed yet', () => {
      // First stub is allowed.
      stubElementIfNotKnown(win, 'amp-test1');

      expect(win.ampExtendedElements).to.exist;
      expect(win.ampExtendedElements['amp-test1']).to.equal(ElementStub);
      expect(doc.registerElement).to.be.calledOnce;
      expect(doc.registerElement.firstCall.args[0]).to.equal('amp-test1');

      // Second stub is ignored.
      stubElementIfNotKnown(win, 'amp-test1');
      expect(doc.registerElement).to.be.calledOnce;
    });

    it('should copy or stub element definitions in a child window', () => {
      stubElementIfNotKnown(win, 'amp-test1');

      const registerElement = sandbox.spy();
      const childWin = {Object, HTMLElement, document: {registerElement}};

      copyElementToChildWindow(win, childWin, 'amp-test1');
      expect(childWin.ampExtendedElements['amp-test1']).to.equal(ElementStub);
      const firstCallCount = registerElement.callCount;
      expect(firstCallCount).to.equal(1);
      expect(registerElement.getCall(firstCallCount - 1).args[0])
          .to.equal('amp-test1');

      copyElementToChildWindow(win, childWin, 'amp-test2');
      expect(childWin.ampExtendedElements['amp-test1']).to.equal(ElementStub);
      expect(registerElement.callCount > firstCallCount).to.be.true;
      expect(registerElement.getCall(registerElement.callCount - 1).args[0])
          .to.equal('amp-test2');
    });

    it('getElementService should wait for body when not available', () => {
      doc.body = null;  // Body not available
      let resolvedService;
      const p1 = getElementServiceIfAvailable(win, 'e1', 'element-1')
          .then(service => {
            resolvedService = service;
            return service;
          });
      return Promise.resolve().then(() => {
        expect(intervalCallback).to.exist;
        expect(resolvedService).to.be.undefined;

        // Resolve body.
        doc.body = {};
        intervalCallback();
        return p1;
      }).then(service => {
        expect(resolvedService).to.be.null;
        expect(service).to.be.null;
      });
    });

    it('getElementService should resolve with body when not available', () => {
      doc.body = {};  // Body is available
      const p1 = getElementServiceIfAvailable(win, 'e1', 'element-1');
      return Promise.resolve().then(() => {
        expect(intervalCallback).to.be.undefined;
        return p1;
      }).then(service => {
        expect(service).to.be.null;
      });
    });

    it('getElementService should wait for body when available', () => {
      doc.body = null;  // Body not available
      let resolvedService;
      const p1 = getElementServiceIfAvailable(win, 'e1', 'element-1')
          .then(service => {
            resolvedService = service;
            return service;
          });
      return Promise.resolve().then(() => {
        expect(intervalCallback).to.exist;
        expect(resolvedService).to.be.undefined;

        // Resolve body.
        markElementScheduledForTesting(win, 'element-1');
        registerServiceBuilder(win, 'e1', function() {
          return {str: 'fake1'};
        });
        doc.body = {};
        intervalCallback();
        return p1;
      }).then(service => {
        expect(resolvedService).to.deep.equal({str: 'fake1'});
        expect(service).to.deep.equal({str: 'fake1'});
      });
    });

    it('getElementService should resolve with body when available', () => {
      doc.body = {};  // Body is available
      markElementScheduledForTesting(win, 'element-1');
      const p1 = getElementServiceIfAvailable(win, 'e1', 'element-1');
      return Promise.resolve().then(() => {
        expect(intervalCallback).to.be.undefined;
        registerServiceBuilder(win, 'e1', function() {
          return {str: 'fake1'};
        });
        return p1;
      }).then(service => {
        expect(service).to.deep.equal({str: 'fake1'});
      });
    });
  });
});


describes.realWin('services', {
  amp: {
    ampdoc: 'single',
  },
}, env => {

  beforeEach(() => {
    resetServiceForTesting(env.win, 'e1');
    resetScheduledElementForTesting(env.win, 'element-1');
    resetScheduledElementForTesting(env.win, 'element-foo');
  });

  it('should be provided by element', () => {
    markElementScheduledForTesting(env.win, 'element-1');
    const p1 = getElementService(env.win, 'e1', 'element-1');
    const p2 = getElementService(env.win, 'e1', 'element-1');

    registerServiceBuilder(env.win, 'e1', function() {
      return {str: 'from e1'};
    });

    return p1.then(s1 => {
      expect(s1).to.deep.equal({str: 'from e1'});
      return p2.then(s2 => {
        expect(s1).to.equal(s2);
      });
    });
  });

  it('should fail if element is not in page.', () => {
    markElementScheduledForTesting(env.win, 'element-foo');

    return getElementService(env.win, 'e1', 'element-bar').then(() => {
      return 'SUCCESS';
    }, error => {
      return 'ERROR ' + error;
    }).then(result => {
      expect(result).to.match(
          /Service e1 was requested to be provided through element-bar/);
    });
  });

  it('should be provided by element if available', () => {
    markElementScheduledForTesting(env.win, 'element-1');
    const p1 = getElementServiceIfAvailable(env.win, 'e1', 'element-1');
    const p2 = getElementServiceIfAvailable(env.win, 'e2', 'not-available');
    registerServiceBuilder(env.win, 'e1', function() {
      return {str: 'from e1'};
    });
    return p1.then(s1 => {
      expect(s1).to.deep.equal({str: 'from e1'});
      return p2.then(s2 => {
        expect(s2).to.be.null;
      });
    });
  });

  it('should be provided by element', () => {
    markElementScheduledForTesting(env.win, 'element-1');
    const p1 = getElementServiceForDoc(env.ampdoc, 'e1', 'element-1');
    const p2 = getElementServiceForDoc(env.ampdoc, 'e1', 'element-1');

    registerServiceBuilder(env.win, 'e1', function() {
      return {str: 'from e1'};
    });

    return p1.then(s1 => {
      expect(s1).to.deep.equal({str: 'from e1'});
      return p2.then(s2 => {
        expect(s1).to.equal(s2);
      });
    });
  });

  it('should fail if element is not in page.', () => {
    markElementScheduledForTesting(env.win, 'element-foo');

    return getElementServiceForDoc(env.ampdoc, 'e1', 'element-bar').then(() => {
      return 'SUCCESS';
    }, error => {
      return 'ERROR ' + error;
    }).then(result => {
      expect(result).to.match(
          /Service e1 was requested to be provided through element-bar/);
    });
  });

  it('should be provided by element if available', () => {
    markElementScheduledForTesting(env.win, 'element-1');
    const p1 = getElementServiceIfAvailableForDoc(
        env.ampdoc, 'e1', 'element-1');
    const p2 = getElementServiceIfAvailableForDoc(
        env.ampdoc, 'e2', 'not-available');
    registerServiceBuilder(env.win, 'e1', function() {
      return {str: 'from e1'};
    });
    return p1.then(s1 => {
      expect(s1).to.deep.equal({str: 'from e1'});
      return p2.then(s2 => {
        expect(s2).to.be.null;
      });
    });
  });

  it('getElementServiceForDoc should wait for body when not available', () => {
    let bodyResolver;
    env.ampdoc.bodyPromise_ = new Promise(resolve => {
      bodyResolver = resolve;
    });
    let resolvedService;
    const p1 = getElementServiceIfAvailableForDoc(env.ampdoc, 'e1', 'element-1')
        .then(service => {
          resolvedService = service;
          return service;
        });
    return Promise.resolve().then(() => {
      expect(resolvedService).to.be.undefined;

      // Resolve body.
      bodyResolver();
      return p1;
    }).then(service => {
      expect(resolvedService).to.be.null;
      expect(service).to.be.null;
    });
  });

  it('getElementServiceForDoc resolve w/ body when not available', () => {
    const p1 = getElementServiceIfAvailableForDoc(
        env.ampdoc, 'e1', 'element-1');
    return Promise.resolve().then(() => {
      return p1;
    }).then(service => {
      expect(service).to.be.null;
    });
  });

  it('getElementServiceForDoc should wait for body when available', () => {
    let bodyResolver;
    env.ampdoc.bodyPromise_ = new Promise(resolve => {
      bodyResolver = resolve;
    });
    let resolvedService;
    const p1 = getElementServiceIfAvailableForDoc(env.ampdoc, 'e1', 'element-1')
        .then(service => {
          resolvedService = service;
          return service;
        });
    return Promise.resolve().then(() => {
      expect(resolvedService).to.be.undefined;

      // Resolve body.
      markElementScheduledForTesting(env.win, 'element-1');
      registerServiceBuilder(env.win, 'e1', function() {
        return {str: 'fake1'};
      });
      bodyResolver();
      return p1;
    }).then(service => {
      expect(resolvedService).to.deep.equal({str: 'fake1'});
      expect(service).to.deep.equal({str: 'fake1'});
    });
  });

  it('getElementServiceForDoc should resolve with body when available', () => {
    markElementScheduledForTesting(env.win, 'element-1');
    const p1 = getElementServiceIfAvailableForDoc(
        env.ampdoc, 'e1', 'element-1');
    return Promise.resolve().then(() => {
      registerServiceBuilder(env.win, 'e1', function() {
        return {str: 'fake1'};
      });
      return p1;
    }).then(service => {
      expect(service).to.deep.equal({str: 'fake1'});
    });
  });
});
