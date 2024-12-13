import * as fakeTimers from '@sinonjs/fake-timers';

import {AmpEvents_Enum} from '#core/constants/amp-events';
import {CommonSignals_Enum} from '#core/constants/common-signals';
import {LOADING_ELEMENTS_ENUM, Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';
import {elementConnectedCallback} from '#service/custom-element-registry';
import {Resource, ResourceState_Enum} from '#service/resource';

import {BaseElement} from '../../src/base-element';
import {chunkInstanceForTesting} from '../../src/chunk';
import {
  createAmpElementForTesting,
  getImplSyncForTesting,
  markUnresolvedElements,
  resetUnresolvedElementsForTesting,
} from '../../src/custom-element';
import {ElementStub} from '../../src/element-stub';

describes.realWin('CustomElement', {amp: true}, (env) => {
  describe('CustomElement', () => {
    let win, doc, ampdoc;
    let resources;
    let resourcesMock;
    let clock;
    let testElementGetInsersectionElementLayoutBox;
    let container;
    let ElementClass, StubElementClass, ElementClassWithReUpgrade;

    let testElementPreconnectCallback;
    let testElementBuildCallback;
    let testElementCreatePlaceholderCallback;
    let testElementLayoutCallback;
    let testElementFirstLayoutCompleted;
    let testElementUnlayoutCallback;
    let testElementPauseCallback;
    let testElementResumeCallback;
    let testElementAttachedCallback;
    let testElementDetachedCallback;
    let testOnLayoutMeasureCallback;

    class TestElement extends BaseElement {
      constructor(element, source) {
        super(element);
        this.source = source;
      }

      isLayoutSupported(unusedLayout) {
        return true;
      }
      preconnectCallback(onLayout) {
        testElementPreconnectCallback(onLayout);
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
      attachedCallback() {
        testElementAttachedCallback();
      }
      detachedCallback() {
        testElementDetachedCallback();
      }
      onLayoutMeasure() {
        testOnLayoutMeasureCallback();
      }
    }

    class TestElementWithReUpgrade extends BaseElement {
      isLayoutSupported(unusedLayout) {
        return true;
      }
      upgradeCallback() {
        return new TestElement(this.element, 're-upgrade');
      }
    }

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;
      clock = fakeTimers.withGlobal(win).install();
      delete win.requestIdleCallback;
      delete win.cancelIdleCallback;
      delete win.__AMP_BASE_CE_CLASS;
      resources = Services.resourcesForDoc(doc);
      resources.isBuildOn_ = true;
      resourcesMock = env.sandbox.mock(resources);
      container = doc.createElement('div');
      doc.body.appendChild(container);
      chunkInstanceForTesting(env.ampdoc);

      ElementClass = createAmpElementForTesting(win, TestElement);
      StubElementClass = createAmpElementForTesting(win, ElementStub);
      ElementClassWithReUpgrade = createAmpElementForTesting(
        win,
        TestElementWithReUpgrade
      );

      win.customElements.define('amp-test', ElementClass);
      win.customElements.define('amp-stub', StubElementClass);
      win.customElements.define(
        'amp-test-with-re-upgrade',
        ElementClassWithReUpgrade
      );

      win.__AMP_EXTENDED_ELEMENTS['amp-test'] = TestElement;
      win.__AMP_EXTENDED_ELEMENTS['amp-stub'] = ElementStub;
      win.__AMP_EXTENDED_ELEMENTS['amp-test-with-re-upgrade'] =
        TestElementWithReUpgrade;
      ampdoc.declareExtension('amp-stub', '0.1');

      testElementPreconnectCallback = env.sandbox.spy();
      testElementBuildCallback = env.sandbox.spy();
      testElementCreatePlaceholderCallback = env.sandbox.spy();
      testElementLayoutCallback = env.sandbox.spy();
      testElementFirstLayoutCompleted = env.sandbox.spy();
      testElementGetInsersectionElementLayoutBox = env.sandbox.spy();
      testElementUnlayoutCallback = env.sandbox.spy();
      testElementPauseCallback = env.sandbox.spy();
      testElementResumeCallback = env.sandbox.spy();
      testElementAttachedCallback = env.sandbox.spy();
      testElementDetachedCallback = env.sandbox.spy();
      testOnLayoutMeasureCallback = env.sandbox.spy();
    });

    afterEach(() => {
      clock.uninstall();
      resourcesMock.verify();
      resetUnresolvedElementsForTesting();
    });

    function skipMicroTask() {
      return new Promise((resolve) => resolve(Promise.resolve()));
    }

    it('should initialize ampdoc and resources on attach only', () => {
      const element = new ElementClass();
      expect(element.ampdoc_).to.be.null;
      allowConsoleError(() => {
        expect(() => element.getAmpDoc()).to.throw(/no ampdoc yet/);
      });
      expect(element.resources_).to.be.null;
      allowConsoleError(() => {
        expect(() => element.getResources()).to.throw(/no resources yet/);
      });

      // Resources available after attachment.
      container.appendChild(element);
      expect(element.ampdoc_).to.be.ok;
      expect(element.getAmpDoc()).to.be.ok;
      expect(element.resources_).to.be.ok;
      expect(element.getResources()).to.be.ok;
    });

    it('Element - createdCallback', () => {
      const element = new ElementClass();
      const build = env.sandbox
        .stub(element, 'buildInternal')
        .returns(Promise.resolve());

      expect(element.isBuilt()).to.equal(false);
      expect(element.hasAttributes()).to.equal(false);
      expect(element.isUpgraded()).to.equal(false);
      expect(element.upgradeState_).to.equal(/* NOT_UPGRADED */ 1);
      expect(element.readyState).to.equal('upgrading');
      expect(element.everAttached).to.equal(false);
      expect(element.getLayout()).to.equal(Layout_Enum.NODISPLAY);

      container.appendChild(element);
      expect(element).to.have.class('i-amphtml-element');
      expect(element).to.have.class('i-amphtml-notbuilt');
      expect(element).to.have.class('amp-notbuilt');
      expect(element).to.not.have.class('i-amphtml-built');
      expect(element.everAttached).to.equal(true);
      expect(element.isUpgraded()).to.equal(true);
      expect(build.calledOnce).to.equal(true);

      expect(element.getResourceId()).to.equal(
        resources.getResourceForElement(element).getId()
      );
    });

    it('StubElement - createdCallback', () => {
      const element = new StubElementClass();
      env.sandbox.stub(element, 'buildInternal');

      expect(element.isBuilt()).to.equal(false);
      expect(element.hasAttributes()).to.equal(false);
      expect(element.isUpgraded()).to.equal(false);
      expect(element.readyState).to.equal('upgrading');
      expect(element.everAttached).to.equal(false);
      expect(element.getLayout()).to.equal(Layout_Enum.NODISPLAY);

      container.appendChild(element);
      expect(element).to.have.class('i-amphtml-element');
      expect(element).to.have.class('i-amphtml-notbuilt');
      expect(element).to.have.class('amp-notbuilt');
      expect(element).to.not.have.class('i-amphtml-built');
      expect(element.everAttached).to.equal(true);
      expect(element.isUpgraded()).to.equal(false);
      // TODO(jeffkaufman, #13422): this test was silently failing.  `build` was
      // the return value from `env.sandbox.stub(element, 'buildInternal')`.
      //
      // expect(build.calledOnce).to.equal(true);
    });

    it('StubElement - should try to install an unregistered legacy extensions', () => {
      delete win.__AMP_BASE_CE_CLASS;
      const LegacyElementClass = createAmpElementForTesting(
        win,
        ElementStub,
        elementConnectedCallback
      );
      win.customElements.define('amp-legacy', LegacyElementClass);
      win.__AMP_EXTENDED_ELEMENTS['amp-legacy'] = ElementStub;

      const extensions = Services.extensionsFor(win);
      env.sandbox.stub(extensions, 'installExtensionForDoc');

      const element = new LegacyElementClass();
      env.sandbox.stub(element, 'buildInternal');

      container.appendChild(element);
      expect(element.readyState).to.equal('upgrading');
      expect(extensions.installExtensionForDoc).to.be.calledOnce.calledWith(
        ampdoc,
        'amp-legacy',
        '0.1'
      );
    });

    it('StubElement - should not try to install a pre-registered legacy extensions', () => {
      delete win.__AMP_BASE_CE_CLASS;
      const LegacyElementClass = createAmpElementForTesting(
        win,
        ElementStub,
        elementConnectedCallback
      );
      win.customElements.define('amp-legacy', LegacyElementClass);
      win.__AMP_EXTENDED_ELEMENTS['amp-legacy'] = ElementStub;
      ampdoc.declareExtension('amp-legacy', '0.1');

      const extensions = Services.extensionsFor(win);
      env.sandbox.stub(extensions, 'installExtensionForDoc');

      const element = new LegacyElementClass();
      env.sandbox.stub(element, 'buildInternal');

      container.appendChild(element);
      expect(element.readyState).to.equal('upgrading');
      expect(extensions.installExtensionForDoc).to.not.be.called;
    });

    it('Element - should only add classes on first attachedCallback', () => {
      const element = new ElementClass();
      const buildPromise = Promise.resolve();
      const buildStub = env.sandbox
        .stub(element, 'buildInternal')
        .returns(buildPromise);

      expect(element).to.not.have.class('i-amphtml-element');
      expect(element).to.not.have.class('i-amphtml-notbuilt');
      expect(element).to.not.have.class('amp-notbuilt');
      expect(element).to.not.have.class('i-amphtml-built');

      container.appendChild(element);

      expect(element).to.have.class('i-amphtml-element');
      expect(element).to.have.class('i-amphtml-notbuilt');
      expect(element).to.have.class('amp-notbuilt');
      element.classList.remove('i-amphtml-element');
      element.classList.remove('i-amphtml-notbuilt');
      element.classList.remove('amp-notbuilt');

      container.appendChild(element);
      return buildPromise.then(() => {
        expect(buildStub).to.be.called;
        expect(element).to.not.have.class('i-amphtml-element');
        expect(element).to.not.have.class('i-amphtml-notbuilt');
        expect(element).to.not.have.class('amp-notbuilt');
      });
    });

    it('Element - handles async connectedCallback when disconnected', () => {
      const element = new ElementClass();
      env.sandbox.defineProperty(element, 'isConnected', {
        value: false,
      });

      expect(element).to.not.have.class('i-amphtml-element');
      expect(element).to.not.have.class('i-amphtml-notbuilt');
      expect(element).to.not.have.class('amp-notbuilt');
      expect(element).to.not.have.class('i-amphtml-built');

      container.appendChild(element);

      expect(element).to.not.have.class('i-amphtml-element');
      expect(element).to.not.have.class('i-amphtml-notbuilt');
      expect(element).to.not.have.class('amp-notbuilt');
      expect(element).to.not.have.class('i-amphtml-built');
    });

    it('Element - should reset on 2nd attachedCallback when requested', () => {
      clock.tick(1);
      const element = new ElementClass();
      const buildPromise = Promise.resolve();
      const buildStub = env.sandbox
        .stub(element, 'buildInternal')
        .returns(buildPromise);
      container.appendChild(element);
      container.removeChild(element);

      env.sandbox
        .stub(element, 'reconstructWhenReparented')
        .callsFake(() => true);
      element.layoutCount_ = 10;
      element.isFirstLayoutCompleted_ = true;
      element.signals().signal(CommonSignals_Enum.RENDER_START);
      element.signals().signal(CommonSignals_Enum.LOAD_END);
      container.appendChild(element);
      return buildPromise.then(() => {
        expect(buildStub).to.be.called;
        expect(element.layoutCount_).to.equal(0);
        expect(element.isFirstLayoutCompleted_).to.be.false;
        expect(element.signals().get(CommonSignals_Enum.RENDER_START)).to.be
          .null;
        expect(element.signals().get(CommonSignals_Enum.LOAD_END)).to.be.null;
      });
    });

    it('Element - should NOT reset on 2nd attachedCallback w/o request', () => {
      clock.tick(1);
      const element = new ElementClass();
      env.sandbox.stub(element, 'buildInternal').returns(Promise.resolve());
      container.appendChild(element);
      container.removeChild(element);

      env.sandbox
        .stub(element, 'reconstructWhenReparented')
        .callsFake(() => false);
      element.layoutCount_ = 10;
      element.isFirstLayoutCompleted_ = true;
      element.signals().signal(CommonSignals_Enum.RENDER_START);
      expect(element.signals().get(CommonSignals_Enum.RENDER_START)).to.be.ok;
      element.signals().signal(CommonSignals_Enum.LOAD_END);
      container.appendChild(element);
      expect(element.layoutCount_).to.equal(10);
      expect(element.isFirstLayoutCompleted_).to.be.true;
      expect(element.signals().get(CommonSignals_Enum.RENDER_START)).to.be.ok;
      expect(element.signals().get(CommonSignals_Enum.LOAD_END)).to.be.ok;
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
      expect(element.getLayoutSize()).to.deep.equal({width: 0, height: 0});

      const rect = {top: 0, left: 0, width: 111, height: 51};
      element.updateLayoutBox(rect);
      expect(testOnLayoutMeasureCallback).to.not.be.called;

      env.sandbox.stub(element, 'isBuilt').returns(true);
      element.updateLayoutBox(rect);
      expect(testOnLayoutMeasureCallback).to.be.calledOnce;
    });

    it('should tolerate errors in onLayoutMeasure', () => {
      const element = new ElementClass();
      env.sandbox
        .stub(TestElement.prototype, 'onLayoutMeasure')
        .callsFake(() => {
          throw new Error('intentional');
        });
      const errorStub = env.sandbox.stub(
        element,
        'dispatchCustomEventForTesting'
      );
      container.appendChild(element);
      return element.buildingPromise_.then(() => {
        allowConsoleError(() => {
          element.updateLayoutBox({top: 0, left: 0, width: 111, height: 51});
          expect(element.getLayoutSize()).to.be.ok;
          expect(errorStub).to.be.calledWith(
            AmpEvents_Enum.ERROR,
            'intentional'
          );
        });
      });
    });

    it('StubElement - upgrade after attached', () => {
      const element = new StubElementClass();
      expect(element.isUpgraded()).to.equal(false);
      expect(getImplSyncForTesting(element)).to.be.null;

      element.setAttribute('layout', 'fill');
      element.updateLayoutBox({top: 0, left: 0, width: 111, height: 51});
      container.appendChild(element);
      resourcesMock.expects('upgraded').withExactArgs(element).once();

      element.upgrade(TestElement);

      expect(element.isUpgraded()).to.equal(true);
      expect(element.readyState).to.equal('building');
      const impl = getImplSyncForTesting(element);
      expect(impl).to.be.instanceOf(TestElement);
      expect(impl.getLayout()).to.equal(Layout_Enum.FILL);
      expect(element.isBuilt()).to.equal(false);
    });

    it('StubElement - should not upgrade before attached', () => {
      const element = new StubElementClass();
      expect(element.isUpgraded()).to.equal(false);
      expect(getImplSyncForTesting(element)).to.be.null;

      element.setAttribute('layout', 'fill');
      element.updateLayoutBox({top: 0, left: 0, width: 111, height: 51});
      resourcesMock.expects('upgraded').withExactArgs(element).never();

      element.upgrade(TestElement);

      expect(element.isUpgraded()).to.equal(false);
      expect(element.readyState).to.equal('upgrading');
      expect(getImplSyncForTesting(element)).to.be.null;
      expect(element.isBuilt()).to.equal(false);
    });

    it('StubElement - upgrade if ever attached', () => {
      const element = new StubElementClass();
      expect(element.isUpgraded()).to.equal(false);
      expect(getImplSyncForTesting(element)).to.be.null;

      element.setAttribute('layout', 'fill');
      element.updateLayoutBox({top: 0, left: 0, width: 111, height: 51});

      // Attach once and remove.
      container.appendChild(element);
      container.removeChild(element);

      resourcesMock.expects('upgraded').withExactArgs(element).once();

      element.upgrade(TestElement);

      expect(element.isUpgraded()).to.equal(true);
      expect(element.readyState).to.equal('building');
      expect(getImplSyncForTesting(element)).to.be.instanceOf(TestElement);
      expect(element.isBuilt()).to.equal(false);
    });

    it('StubElement - should NOT allow upgrade for a template element', () => {
      const element = new StubElementClass();
      expect(element.isUpgraded()).to.equal(false);
      element.isInTemplate_ = true;

      resourcesMock.expects('upgraded').withExactArgs(element).never();

      element.upgrade(TestElement);
      expect(element.isUpgraded()).to.equal(false);
      expect(element.readyState).to.equal('upgrading');
      expect(element.isBuilt()).to.equal(false);
    });

    it('Element - re-upgrade to new direct instance', () => {
      const element = new ElementClassWithReUpgrade();
      expect(element.isUpgraded()).to.equal(false);

      container.appendChild(element);
      expect(element.isUpgraded()).to.equal(true);

      const impl = getImplSyncForTesting(element);
      expect(impl).to.be.instanceOf(TestElement);
      expect(impl.source).to.equal('re-upgrade');
      expect(element.upgradeDelayMs_).to.equal(0);
    });

    it('Element - re-upgrade to new promised instance', async () => {
      let promise;
      env.sandbox
        .stub(TestElementWithReUpgrade.prototype, 'upgradeCallback')
        .callsFake(function () {
          promise = Promise.resolve(
            new TestElement(this.element, 're-upgrade-with-promise')
          );
          return promise;
        });

      const element = new ElementClassWithReUpgrade();
      expect(element.isUpgraded()).to.equal(false);
      container.appendChild(element);

      expect(getImplSyncForTesting(element)).to.be.null;
      expect(element.isUpgraded()).to.equal(false);
      expect(element.upgradeState_).to.equal(/* UPGRADE_IN_PROGRESS */ 4);
      expect(promise).to.exist;

      await promise;
      await skipMicroTask();
      expect(element.isUpgraded()).to.equal(true);
      expect(element.upgradeState_).to.equal(/* UPGRADED */ 2);

      const impl = getImplSyncForTesting(element);
      expect(impl).to.be.instanceOf(TestElement);
      expect(impl.source).to.equal('re-upgrade-with-promise');
    });

    it('Element - re-upgrade to new promised null', async () => {
      let promise;
      env.sandbox
        .stub(TestElementWithReUpgrade.prototype, 'upgradeCallback')
        .callsFake(function () {
          promise = Promise.resolve(null);
          return promise;
        });

      const element = new ElementClassWithReUpgrade();
      expect(element.isUpgraded()).to.equal(false);
      container.appendChild(element);

      expect(getImplSyncForTesting(element)).to.be.null;
      expect(element.isUpgraded()).to.equal(false);
      expect(element.upgradeState_).to.equal(/* UPGRADE_IN_PROGRESS */ 4);
      expect(promise).to.exist;

      await promise;
      await skipMicroTask();

      expect(element.isUpgraded()).to.equal(true);
      expect(element.upgradeState_).to.equal(/* UPGRADED */ 2);

      const impl = getImplSyncForTesting(element);
      expect(impl).to.be.instanceOf(TestElementWithReUpgrade);
    });

    it('StubElement - re-upgrade', () => {
      const element = new StubElementClass();
      expect(element.isUpgraded()).to.equal(false);
      resourcesMock.expects('upgraded').withExactArgs(element).never();

      element.upgrade(TestElementWithReUpgrade);

      expect(element.isUpgraded()).to.equal(false);
    });

    it('Element - build allowed', () => {
      const element = new ElementClass();
      const getSizerStub = env.sandbox.stub(element, 'getSizer_');

      expect(element.isBuilt()).to.equal(false);
      expect(testElementBuildCallback).to.have.not.been.called;
      expect(element.signals().get(CommonSignals_Enum.BUILT)).to.not.be.ok;

      clock.tick(1);
      container.appendChild(element);
      return element.buildingPromise_.then(() => {
        expect(element.isBuilt()).to.equal(true);
        expect(element).to.not.have.class('i-amphtml-notbuilt');
        expect(element).to.not.have.class('amp-notbuilt');
        expect(element).to.have.class('i-amphtml-built');
        expect(getSizerStub).to.be.calledOnce;
        expect(testElementBuildCallback).to.be.calledOnce;
        expect(element.signals().get(CommonSignals_Enum.BUILT)).to.be.ok;
        return element.whenBuilt(); // Should eventually resolve.
      });
    });

    it('Element - attachedCallback is called post build and on reconnect', async () => {
      const element = new ElementClass();

      // First build.
      clock.tick(1);
      container.appendChild(element);
      await element.buildingPromise_;
      expect(testElementAttachedCallback).to.be.calledOnce;

      // Detach.
      container.removeChild(element);
      clock.tick(1);
      expect(testElementDetachedCallback).to.be.calledOnce;

      // Reconnect.
      container.appendChild(element);
      clock.tick(1);
      expect(testElementAttachedCallback).to.be.calledTwice;
    });

    it('should build on consent sufficient', () => {
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

      clock.tick(1);
      container.appendChild(element);
      return element.whenBuilt();
    });

    it('should build on no consent policy', () => {
      const element = new ElementClass();
      env.sandbox
        .stub(Services, 'consentPolicyServiceForDocOrNull')
        .resolves(null);
      env.sandbox.stub(element, 'getConsentPolicy_').callsFake(() => {
        return 'default';
      });

      clock.tick(1);
      container.appendChild(element);
      return element.whenBuilt();
    });

    it('should not build on consent insufficient', () => {
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

      clock.tick(1);
      container.appendChild(element);
      return expect(element.whenBuilt()).to.eventually.be.rejectedWith(
        /BLOCK_BY_CONSENT/
      );
    });

    it('should respect user specified consent policy', () => {
      const element = new ElementClass();
      container.appendChild(element);
      expect(element.getConsentPolicy_()).to.equal(null);
      element.setAttribute('data-block-on-consent', '');
      expect(element.getConsentPolicy_()).to.equal('default');
      element.setAttribute('data-block-on-consent', '_none');
      expect(element.getConsentPolicy_()).to.equal('_none');
    });

    it('should repsect metaTag specified consent', () => {
      const meta = doc.createElement('meta');
      meta.setAttribute('name', 'amp-consent-blocking');
      meta.setAttribute('content', 'amp-test');
      doc.head.appendChild(meta);
      const element = new ElementClass();
      container.appendChild(element);
      expect(element.getConsentPolicy_()).to.equal('default');
      expect(element.getAttribute('data-block-on-consent')).to.equal('default');
    });

    describe('consent', () => {
      describe('getPurposeConsent_', () => {
        let element;
        beforeEach(() => {
          element = new ElementClass();
        });

        it('should find no consent purposes w/ no attribute', () => {
          expect(element.getPurposesConsent_()).to.be.undefined;
        });

        it('should find no consent purposes w/ no value on attribute', () => {
          element.setAttribute('data-block-on-consent-purposes', '');
          expect(element.getPurposesConsent_()).to.be.undefined;
        });

        it('should find correct consent purposes', () => {
          element.setAttribute(
            'data-block-on-consent-purposes',
            'purpose-foo,purpose-bar'
          );
          expect(element.getPurposesConsent_()).to.deep.equals([
            'purpose-foo',
            'purpose-bar',
          ]);
        });

        it('should find correct consent purposes w/ whitespaces', () => {
          element.setAttribute(
            'data-block-on-consent-purposes',
            '     purpose-foo, purpose-bar'
          );
          expect(element.getPurposesConsent_()).to.deep.equals([
            'purpose-foo',
            'purpose-bar',
          ]);
        });
      });

      it('should default to policyId', () => {
        const element = new ElementClass();
        const purposesSpy = env.sandbox.spy();
        env.sandbox
          .stub(Services, 'consentPolicyServiceForDocOrNull')
          .resolves({
            whenPolicyUnblock: () => {
              return Promise.resolve(true);
            },
            whenPurposesUnblock: () => purposesSpy,
          });
        element.setAttribute('data-block-on-consent', '');
        element.setAttribute(
          'data-block-on-consent-purposes',
          'purpose-foo,purpose-bar'
        );

        clock.tick(1);
        container.appendChild(element);
        return element.whenBuilt().then(() => {
          expect(purposesSpy).to.not.be.called;
        });
      });

      it('should build on purpose consents', () => {
        const element = new ElementClass();
        const defaultPolicySpy = env.sandbox.spy();
        env.sandbox
          .stub(Services, 'consentPolicyServiceForDocOrNull')
          .resolves({
            whenPolicyUnblock: () => {
              return defaultPolicySpy;
            },
            whenPurposesUnblock: () => {
              return Promise.resolve(true);
            },
          });
        element.setAttribute(
          'data-block-on-consent-purposes',
          'purpose-foo,purpose-bar'
        );

        clock.tick(1);
        container.appendChild(element);
        return element.whenBuilt().then(() => {
          expect(defaultPolicySpy).to.not.be.called;
        });
      });

      it('should not build on insufficient purpose consents', () => {
        const element = new ElementClass();
        env.sandbox
          .stub(Services, 'consentPolicyServiceForDocOrNull')
          .resolves({
            whenPurposesUnblock: () => {
              return Promise.resolve(false);
            },
          });
        element.setAttribute(
          'data-block-on-consent-purposes',
          'purpose-foo,purpose-bar'
        );

        clock.tick(1);
        container.appendChild(element);
        return expect(element.whenBuilt()).to.eventually.be.rejectedWith(
          /BLOCK_BY_CONSENT/
        );
      });
    });

    it('should anticipate sync build errors', () => {
      expectAsyncConsoleError(/intentional/, 2);
      const element = new ElementClass();
      env.sandbox.stub(TestElement.prototype, 'buildCallback').callsFake(() => {
        throw new Error('intentional');
      });
      container.appendChild(element);
      expect(element.isBuilt()).to.be.false;
      expect(element).to.have.class('i-amphtml-notbuilt');
      expect(element).to.have.class('amp-notbuilt');
      return expect(element.whenBuilt()).to.eventually.be.rejectedWith(
        /intentional/
      );
    });

    it('Element - build creates a placeholder if one does not exist', () => {
      const element = new ElementClass();
      expect(testElementCreatePlaceholderCallback).to.have.not.been.called;

      container.appendChild(element);
      return element.buildingPromise_.then(() => {
        expect(element.isBuilt()).to.equal(true);
        expect(testElementCreatePlaceholderCallback).to.be.calledOnce;
      });
    });

    it('Element - build does not create a placeholder when one exists', () => {
      const element = new ElementClass();
      const placeholder = doc.createElement('div');
      placeholder.setAttribute('placeholder', '');
      element.appendChild(placeholder);
      expect(testElementCreatePlaceholderCallback).to.have.not.been.called;

      container.appendChild(element);
      return element.buildingPromise_.then(() => {
        expect(element.isBuilt()).to.equal(true);
        expect(element.readyState).to.equal('loading');
        expect(testElementCreatePlaceholderCallback).to.have.not.been.called;
      });
    });

    it('Element - buildCallback cannot be called twice', () => {
      const element = new ElementClass();
      expect(element.isBuilt()).to.equal(false);
      expect(testElementBuildCallback).to.have.not.been.called;

      container.appendChild(element);

      return element.buildingPromise_.then(() => {
        expect(element.isBuilt()).to.equal(true);
        expect(testElementBuildCallback).to.be.calledOnce;

        // Call again.
        return element.buildInternal().then(() => {
          expect(element.isBuilt()).to.equal(true);
          expect(element.readyState).to.equal('loading');
          expect(testElementBuildCallback).to.be.calledOnce;
          setTimeout(() => {
            expect(testElementPreconnectCallback).to.be.calledOnce;
          }, 0);
        });
      });
    });

    it('Element - build is repeatable', async () => {
      const element = new ElementClass();
      expect(element.isBuilt()).to.equal(false);
      expect(testElementBuildCallback).to.have.not.been.called;

      container.appendChild(element);
      const buildingPromise = element.buildingPromise_;
      expect(element.buildInternal()).to.equal(buildingPromise);
      // Skip a task.
      await new Promise(setTimeout);
      expect(testElementBuildCallback).to.be.calledOnce;
    });

    it('Element - build NOT allowed when in template', () => {
      const element = new ElementClass();
      expect(element.isBuilt()).to.equal(false);
      expect(testElementBuildCallback).to.have.not.been.called;

      element.isInTemplate_ = true;
      allowConsoleError(() => {
        expect(() => {
          element.buildInternal();
        }).to.throw(/Must never be called in template/);
      });

      expect(element.isBuilt()).to.equal(false);
      expect(testElementBuildCallback).to.have.not.been.called;
    });

    it('StubElement - build never allowed', () => {
      const element = new StubElementClass();
      expect(element.isBuilt()).to.equal(false);
      expect(testElementBuildCallback).to.have.not.been.called;

      allowConsoleError(() => {
        expect(() => {
          element.buildInternal();
        }).to.throw(/Cannot build unupgraded element/);
      });

      expect(element.isBuilt()).to.equal(false);
      expect(testElementBuildCallback).to.have.not.been.called;
    });

    it('Element - createPlaceholder', () => {
      const element = new ElementClass();
      container.appendChild(element);
      element.createPlaceholder();
      expect(testElementCreatePlaceholderCallback).to.be.calledOnce;
    });

    it('Element - attachedCallback', () => {
      const element = new ElementClass();
      element.setAttribute('layout', 'fill');
      expect(element.everAttached).to.equal(false);
      expect(element.getLayout()).to.equal(Layout_Enum.NODISPLAY);

      resourcesMock.expects('add').withExactArgs(element).atLeast(1);
      resourcesMock.expects('upgraded').withExactArgs(element).atLeast(1);
      container.appendChild(element);

      expect(element.everAttached).to.equal(true);
      expect(element.getLayout()).to.equal(Layout_Enum.FILL);
      expect(element.getLayout()).to.equal(Layout_Enum.FILL);
      expect(getImplSyncForTesting(element).getLayout()).to.equal(
        Layout_Enum.FILL
      );
    });

    it('StubElement - attachedCallback', () => {
      const element = new StubElementClass();
      element.setAttribute('layout', 'fill');
      expect(element.everAttached).to.equal(false);
      expect(element.getLayout()).to.equal(Layout_Enum.NODISPLAY);

      resourcesMock.expects('add').withExactArgs(element).atLeast(1);
      container.appendChild(element);

      expect(element.everAttached).to.equal(true);
      expect(element.getLayout()).to.equal(Layout_Enum.FILL);
      // Not upgraded yet, but extension hasn't failed.
      expect(element).not.to.have.class('amp-unresolved');
      expect(element).not.to.have.class('i-amphtml-unresolved');

      // Upgrade
      resourcesMock.expects('upgraded').withExactArgs(element).once();
      element.upgrade(TestElement);

      expect(element.getLayout()).to.equal(Layout_Enum.FILL);
      expect(element.getLayout()).to.equal(Layout_Enum.FILL);
      expect(getImplSyncForTesting(element).getLayout()).to.equal(
        Layout_Enum.FILL
      );

      // Now it's called.
      expect(element).to.not.have.class('amp-unresolved');
      expect(element).to.not.have.class('i-amphtml-unresolved');
    });

    it('StubElement - attachedCallback after failed to load', () => {
      const element = new StubElementClass();
      markUnresolvedElements('amp-stub');
      element.setAttribute('layout', 'fill');
      expect(element.everAttached).to.equal(false);
      expect(element.getLayout()).to.equal(Layout_Enum.NODISPLAY);

      resourcesMock.expects('add').withExactArgs(element).atLeast(1);
      container.appendChild(element);

      expect(element.everAttached).to.equal(true);
      expect(element.getLayout()).to.equal(Layout_Enum.FILL);
      // Extension already failed before attachedCallback
      expect(element).to.have.class('amp-unresolved');
      expect(element).to.have.class('i-amphtml-unresolved');
    });

    it('StubElement - attachedCallback before failed to load', () => {
      const element = new StubElementClass();
      element.setAttribute('layout', 'fill');
      expect(element.everAttached).to.equal(false);
      expect(element.getLayout()).to.equal(Layout_Enum.NODISPLAY);

      resourcesMock.expects('add').withExactArgs(element).atLeast(1);
      container.appendChild(element);

      expect(element.everAttached).to.equal(true);
      expect(element.getLayout()).to.equal(Layout_Enum.FILL);
      // Not upgraded yet, but extension hasn't failed.
      expect(element).not.to.have.class('amp-unresolved');
      expect(element).not.to.have.class('i-amphtml-unresolved');

      // Now it's called.
      markUnresolvedElements('amp-stub');
      expect(element).to.have.class('amp-unresolved');
      expect(element).to.have.class('i-amphtml-unresolved');
    });

    it('Element - detachedCallback', () => {
      const element = new ElementClass();
      element.setAttribute('layout', 'fill');
      expect(element.everAttached).to.equal(false);
      expect(element.getLayout()).to.equal(Layout_Enum.NODISPLAY);

      resourcesMock.expects('add').withExactArgs(element).atLeast(1);
      resourcesMock.expects('upgraded').withExactArgs(element).atLeast(1);
      container.appendChild(element);

      resourcesMock.expects('remove').withExactArgs(element).once();
      container.removeChild(element);

      expect(element.everAttached).to.equal(true);
      expect(element.getLayout()).to.equal(Layout_Enum.FILL);
      expect(getImplSyncForTesting(element).getLayout()).to.equal(
        Layout_Enum.FILL
      );
    });

    it('Element - handles async detachedCallback when connected', () => {
      const element = new ElementClass();
      element.setAttribute('layout', 'fill');
      expect(element.everAttached).to.equal(false);
      expect(element.getLayout()).to.equal(Layout_Enum.NODISPLAY);

      resourcesMock.expects('add').withExactArgs(element).atLeast(1);
      resourcesMock.expects('upgraded').withExactArgs(element).atLeast(1);
      container.appendChild(element);

      resourcesMock.expects('remove').withExactArgs(element).never();
      env.sandbox.defineProperty(element, 'isConnected', {
        value: true,
      });
      container.removeChild(element);

      expect(element.everAttached).to.equal(true);
      expect(element.getLayout()).to.equal(Layout_Enum.FILL);
      expect(getImplSyncForTesting(element).getLayout()).to.equal(
        Layout_Enum.FILL
      );
    });

    it('Element - layoutCallback before build', () => {
      const element = new ElementClass();
      element.setAttribute('layout', 'fill');
      expect(testElementLayoutCallback).to.have.not.been.called;
      expect(element.isBuilt()).to.equal(false);

      allowConsoleError(() => {
        expect(() => {
          element.layoutCallback();
        }).to.throw(/Must be built to receive viewport events/);
      });

      expect(testElementLayoutCallback).to.have.not.been.called;
    });

    it('StubElement - layoutCallback before build or upgrade', () => {
      const element = new StubElementClass();
      element.setAttribute('layout', 'fill');
      expect(testElementLayoutCallback).to.have.not.been.called;

      expect(element.isUpgraded()).to.equal(false);
      expect(element.isBuilt()).to.equal(false);
      allowConsoleError(() => {
        expect(() => {
          element.layoutCallback();
        }).to.throw(/Must be built to receive viewport events/);
      });

      resourcesMock.expects('upgraded').withExactArgs(element).never();
      element.upgrade(TestElement);

      expect(element.isUpgraded()).to.equal(false);
      expect(element.isBuilt()).to.equal(false);
      allowConsoleError(() => {
        expect(() => {
          element.layoutCallback();
        }).to.throw(/Must be built to receive viewport events/);
      });

      expect(testElementLayoutCallback).to.have.not.been.called;
    });

    it('Element - layoutCallback', () => {
      const element = new ElementClass();
      element.setAttribute('layout', 'fill');
      container.appendChild(element);
      expect(element.readyState).to.equal('building');
      return element.buildInternal().then(() => {
        expect(element.isBuilt()).to.equal(true);
        expect(element.readyState).to.equal('loading');
        expect(testElementLayoutCallback).to.have.not.been.called;

        const p = element.layoutCallback();
        expect(testElementLayoutCallback).to.be.calledOnce;
        expect(element.signals().get(CommonSignals_Enum.LOAD_START)).to.be.ok;
        expect(element.signals().get(CommonSignals_Enum.LOAD_END)).to.be.null;
        setTimeout(() => {
          expect(testElementPreconnectCallback).to.have.callCount(2);
          expect(testElementPreconnectCallback.getCall(1).args[0]).to.be.true;
        }, 0);
        return p.then(() => {
          expect(element.readyState).to.equal('complete');
          expect(element.signals().get(CommonSignals_Enum.LOAD_END)).to.be.ok;
        });
      });
    });

    it('Element - layoutCallback aborted waiting for mutate phase', () => {
      const element = new ElementClass();
      element.setAttribute('layout', 'fill');
      container.appendChild(element);
      return element.buildInternal().then(() => {
        expect(element.isBuilt()).to.equal(true);
        expect(testElementLayoutCallback).to.have.not.been.called;

        const controller = new AbortController();
        controller.abort();
        const p = element.layoutCallback(controller.signal);
        expect(testElementLayoutCallback).not.to.be.called;
        expect(element.signals().get(CommonSignals_Enum.LOAD_START)).to.be.null;
        expect(element.signals().get(CommonSignals_Enum.LOAD_END)).to.be.null;
        setTimeout(() => {
          expect(testElementPreconnectCallback).to.have.callCount(1);
        }, 0);
        return expect(p).to.be.rejected.then(() => {
          expect(element.readyState).to.equal('loading');
          expect(element.signals().get(CommonSignals_Enum.LOAD_END)).to.be.null;
        });
      });
    });

    it('Element - layoutCallback aborted before completing layout', () => {
      const element = new ElementClass();
      element.setAttribute('layout', 'fill');
      container.appendChild(element);
      return element.buildInternal().then(() => {
        expect(element.isBuilt()).to.equal(true);
        expect(testElementLayoutCallback).to.have.not.been.called;

        const controller = new AbortController();
        const stub = env.sandbox
          .stub(TestElement.prototype, 'layoutCallback')
          .callsFake(() => {
            controller.abort();
          });
        const p = element.layoutCallback(controller.signal);
        expect(testElementLayoutCallback).not.to.be.called;
        expect(element.signals().get(CommonSignals_Enum.LOAD_START)).to.be.ok;
        expect(element.signals().get(CommonSignals_Enum.LOAD_END)).to.be.null;
        setTimeout(() => {
          expect(testElementPreconnectCallback).to.have.callCount(2);
        }, 0);
        return expect(p).to.be.rejected.then(() => {
          expect(stub).to.have.been.called;
          expect(element.readyState).to.equal('loading');
          expect(element.signals().get(CommonSignals_Enum.LOAD_END)).to.be.null;
        });
      });
    });

    it('Element - layoutCallback aborted before throwing in layout', () => {
      const element = new ElementClass();
      element.setAttribute('layout', 'fill');
      container.appendChild(element);
      return element.buildInternal().then(() => {
        expect(element.isBuilt()).to.equal(true);
        expect(testElementLayoutCallback).to.have.not.been.called;

        const controller = new AbortController();
        const stub = env.sandbox
          .stub(TestElement.prototype, 'layoutCallback')
          .callsFake(() => {
            controller.abort();
            throw new Error('throwaway');
          });
        const p = element.layoutCallback(controller.signal);
        expect(testElementLayoutCallback).not.to.be.called;
        expect(element.signals().get(CommonSignals_Enum.LOAD_START)).to.be.ok;
        expect(element.signals().get(CommonSignals_Enum.LOAD_END)).to.be.null;
        setTimeout(() => {
          expect(testElementPreconnectCallback).to.have.callCount(2);
        }, 0);
        return expect(p).to.be.rejected.then(() => {
          expect(stub).to.have.been.called;
          expect(element.readyState).to.equal('loading');
          expect(element.signals().get(CommonSignals_Enum.LOAD_END)).to.be.null;
        });
      });
    });

    it('Element - layoutCallback should call firstLayoutCompleted only once', () => {
      const element = new ElementClass();
      element.setAttribute('layout', 'fill');
      container.appendChild(element);
      return element.buildingPromise_
        .then(() => {
          const p = element.layoutCallback();
          expect(testElementLayoutCallback).to.be.calledOnce;
          expect(testElementFirstLayoutCompleted).to.have.not.been.called;
          return p;
        })
        .then(() => {
          expect(testElementFirstLayoutCompleted).to.be.calledOnce;

          // But not second time.
          const p2 = element.layoutCallback();
          expect(testElementLayoutCallback).to.have.callCount(2);
          expect(testElementFirstLayoutCompleted).to.be.calledOnce;
          return p2;
        })
        .then(() => {
          expect(testElementFirstLayoutCompleted).to.be.calledOnce;
        });
    });

    it('Element - layoutCallback is NOT allowed in template', () => {
      const element = new ElementClass();
      element.setAttribute('layout', 'fill');
      container.appendChild(element);
      return element.buildInternal().then(() => {
        expect(element.isBuilt()).to.equal(true);
        expect(testElementLayoutCallback).to.have.not.been.called;

        element.isInTemplate_ = true;
        allowConsoleError(() => {
          expect(() => {
            element.layoutCallback();
          }).to.throw(/Must never be called in template/);
        });
      });
    });

    it('StubElement - layoutCallback after attached', () => {
      const element = new StubElementClass();
      element.setAttribute('layout', 'fill');
      element.everAttached = true;
      element.ampdoc_ = env.ampdoc;
      element.resources_ = resources;
      resourcesMock.expects('upgraded').withExactArgs(element).once();
      element.upgrade(TestElement);
      return element
        .buildInternal()
        .then(() => {
          expect(element.isUpgraded()).to.equal(true);
          expect(element.isBuilt()).to.equal(true);
          expect(testElementLayoutCallback).to.have.not.been.called;

          const p = element.layoutCallback();
          expect(testElementLayoutCallback).to.be.calledOnce;
          return p;
        })
        .then(() => {
          expect(element.readyState).to.equal('complete');
        });
    });

    it('should enqueue actions until built', () => {
      const element = new ElementClass();
      const handler = env.sandbox.stub(TestElement.prototype, 'executeAction');

      container.appendChild(element);
      expect(element.actionQueue_).to.not.equal(null);

      const inv = {};
      element.enqueAction(inv);
      expect(element.actionQueue_.length).to.equal(1);
      expect(element.actionQueue_[0]).to.equal(inv);
      expect(handler).to.have.not.been.called;
    });

    it('should execute action immediately after built', () => {
      const element = new ElementClass();
      const handler = env.sandbox.stub(TestElement.prototype, 'executeAction');
      container.appendChild(element);
      return element.buildInternal().then(() => {
        const inv = {};
        element.enqueAction(inv);
        expect(handler).to.be.calledOnce;
        expect(handler.getCall(0).args[0]).to.equal(inv);
        expect(handler.getCall(0).args[1]).to.equal(false);
      });
    });

    it('should dequeue all actions after build', () => {
      const element = new ElementClass();
      const handler = env.sandbox.stub(TestElement.prototype, 'executeAction');

      const inv1 = {};
      const inv2 = {};
      element.enqueAction(inv1);
      element.enqueAction(inv2);
      expect(element.actionQueue_.length).to.equal(2);
      expect(element.actionQueue_[0]).to.equal(inv1);
      expect(element.actionQueue_[1]).to.equal(inv2);
      expect(handler).to.have.not.been.called;

      container.appendChild(element);
      return element.buildingPromise_.then(() => {
        clock.tick(10);
        expect(handler).to.have.callCount(2);
        expect(handler.getCall(0).args[0]).to.equal(inv1);
        expect(handler.getCall(0).args[1]).to.equal(true);
        expect(handler.getCall(1).args[0]).to.equal(inv2);
        expect(handler.getCall(1).args[1]).to.equal(true);
        expect(element.actionQueue_).to.equal(null);
      });
    });

    it('should NOT enqueue actions when in template', () => {
      const element = new ElementClass();
      expect(element.actionQueue_).to.not.equal(null);

      const inv = {};
      element.isInTemplate_ = true;
      allowConsoleError(() => {
        expect(() => {
          element.enqueAction(inv);
        }).to.throw(/Must never be called in template/);
      });
    });

    describe('apply sizes and media query', () => {
      let element1;
      let element2;
      let matchMedia;
      let matchMinWidth1px;
      let requestMeasureStub;

      beforeEach(() => {
        element1 = new ElementClass();

        matchMedia = env.sandbox.stub(
          element1.ownerDocument.defaultView,
          'matchMedia'
        );
        matchMinWidth1px = {
          matches: true,
          onchange: null,
        };
        matchMedia.withArgs('(min-width: 1px)').returns(matchMinWidth1px);
        matchMedia
          .withArgs('(min-width: 1111111px)')
          .returns({matches: false, onchange: null});

        element2 = new ElementClass();
        element2.ampdoc_ = env.ampdoc;

        requestMeasureStub = env.sandbox.stub(
          Resource.prototype,
          'requestMeasure'
        );
      });

      it('should not request remeasure when no media attributes', () => {
        doc.body.appendChild(element1);
        expect(requestMeasureStub).to.not.be.called;
      });

      it('should not apply sizes when "disable-inline-width" is present', () => {
        element1.setAttribute('disable-inline-width', null);
        element1.setAttribute('sizes', '(min-width: 1px) 200px, 50vw');
        doc.body.appendChild(element1);
        expect(element1.style.width).not.to.equal('200px');
        expect(requestMeasureStub).to.not.be.called;
      });

      it('should apply media condition', () => {
        element1.setAttribute('media', '(min-width: 1px)');
        doc.body.appendChild(element1);
        expect(element1).to.not.have.class('i-amphtml-hidden-by-media-query');
        expect(requestMeasureStub).to.be.calledOnce;

        element2.setAttribute('media', '(min-width: 1111111px)');
        doc.body.appendChild(element2);
        expect(element2).to.have.class('i-amphtml-hidden-by-media-query');
        expect(requestMeasureStub).to.be.calledTwice;
      });

      it('should re-apply media condition', () => {
        element1.setAttribute('media', '(min-width: 1px)');
        doc.body.appendChild(element1);
        expect(element1).to.not.have.class('i-amphtml-hidden-by-media-query');
        expect(requestMeasureStub).to.be.calledOnce;

        matchMinWidth1px.matches = false;
        matchMinWidth1px.onchange();
        expect(element1).to.have.class('i-amphtml-hidden-by-media-query');
        expect(requestMeasureStub).to.be.calledTwice;
      });

      it('should apply sizes condition', () => {
        element1.setAttribute('sizes', '(min-width: 1px) 200px, 50vw');
        doc.body.appendChild(element1);
        expect(element1.style.width).to.equal('200px');
        expect(requestMeasureStub).to.be.calledOnce;

        element2.setAttribute('sizes', '(min-width: 1111111px) 200px, 50vw');
        doc.body.appendChild(element2);
        expect(element2.style.width).to.equal('50vw');
        expect(requestMeasureStub).to.be.calledTwice;
      });

      it('should apply heights condition', () => {
        element1.sizerElement = doc.createElement('div');
        element1.setAttribute('layout', 'responsive');
        element1.setAttribute('width', '200px');
        element1.setAttribute('height', '200px');
        element1.setAttribute('heights', '(min-width: 1px) 99%, 1%');
        container.appendChild(element1);
        doc.body.appendChild(element1);
        expect(element1.sizerElement.style.paddingTop).to.equal('99%');
        expect(requestMeasureStub).to.be.calledOnce;

        element2.sizerElement = doc.createElement('div');
        element2.setAttribute('layout', 'responsive');
        element2.setAttribute('width', '200px');
        element2.setAttribute('height', '200px');
        element2.setAttribute('heights', '(min-width: 1111111px) 99%, 1%');
        container.appendChild(element2);
        doc.body.appendChild(element2);
        expect(element2.sizerElement.style.paddingTop).to.equal('1%');
        expect(requestMeasureStub).to.be.calledTwice;
      });
    });

    it('should reapply layout=nodisplay in SSR', () => {
      const element1 = new ElementClass();
      element1.setAttribute('i-amphtml-layout', 'nodisplay');
      element1.setAttribute('layout', 'nodisplay');
      container.appendChild(element1);
      expect(element1).to.have.display('none');
    });

    it('should change size without sizer', () => {
      const element = new ElementClass();
      element.applySize(111, 222, {top: 1, right: 2, bottom: 3, left: 4});
      expect(element.style.height).to.equal('111px');
      expect(element.style.width).to.equal('222px');
      expect(element.style.marginTop).to.equal('1px');
      expect(element.style.marginRight).to.equal('2px');
      expect(element.style.marginBottom).to.equal('3px');
      expect(element.style.marginLeft).to.equal('4px');
    });

    it('should change size - height only without sizer', () => {
      const element = new ElementClass();
      element.applySize(111);
      expect(element.style.height).to.equal('111px');
    });

    it('should change size - width only without sizer', () => {
      const element = new ElementClass();
      element.applySize(undefined, 111);
      expect(element.style.width).to.equal('111px');
    });

    it('should change size - margins only without sizer', () => {
      const element = new ElementClass();
      element.applySize(undefined, undefined, {
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      });
      expect(element.style.marginTop).to.equal('1px');
      expect(element.style.marginRight).to.equal('2px');
      expect(element.style.marginBottom).to.equal('3px');
      expect(element.style.marginLeft).to.equal('4px');
    });

    it('should change size - some margins only without sizer', () => {
      const element = new ElementClass();
      element.style.margin = '1px 2px 3px 4px';
      element.applySize(undefined, undefined, {top: 5, left: 6});
      expect(element.style.marginTop).to.equal('5px');
      expect(element.style.marginRight).to.equal('2px');
      expect(element.style.marginBottom).to.equal('3px');
      expect(element.style.marginLeft).to.equal('6px');
    });

    it('should change size - some margins only without sizer', () => {
      const element = new ElementClass();
      element.style.margin = '1px 2px 3px 4px';
      element.applySize(undefined, undefined, {top: 5, left: 6});
      expect(element.style.marginTop).to.equal('5px');
      expect(element.style.marginRight).to.equal('2px');
      expect(element.style.marginBottom).to.equal('3px');
      expect(element.style.marginLeft).to.equal('6px');
    });

    it('should change size with sizer', () => {
      const element = new ElementClass();
      const sizer = doc.createElement('div');
      element.sizerElement = sizer;
      element.applySize(111, 222, {top: 1, right: 2, bottom: 3, left: 4});
      expect(element.style.height).to.equal('111px');
      expect(element.style.width).to.equal('222px');
      expect(element.style.marginTop).to.equal('1px');
      expect(element.style.marginRight).to.equal('2px');
      expect(element.style.marginBottom).to.equal('3px');
      expect(element.style.marginLeft).to.equal('4px');
    });

    it('should reset sizer for responsive layout', () => {
      const element = new ElementClass();
      element.layout_ = Layout_Enum.RESPONSIVE;
      const sizer = doc.createElement('div');
      element.sizerElement = sizer;
      element.applySize(111, 222, {top: 1, right: 2, bottom: 3, left: 4});
      expect(sizer.style.paddingTop).to.equal('0px');
      expect(element.sizerElement).to.be.null;
    });

    it('should reset sizer for intrinsic layout', () => {
      const element = new ElementClass();
      element.layout_ = Layout_Enum.INTRINSIC;
      const sizer = doc.createElement('i-amphtml-sizer');
      const intrinsicSizer = doc.createElement('img');
      intrinsicSizer.classList.add('i-amphtml-intrinsic-sizer');
      intrinsicSizer.setAttribute(
        'src',
        'data:image/svg+xml;charset=utf-8,<svg height=&quot;610&quot; width=&quot;1080&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot; version=&quot;1.1&quot;/>'
      );
      sizer.appendChild(intrinsicSizer);
      element.appendChild(sizer);
      element.applySize(111);
      expect(intrinsicSizer.getAttribute('src')).to.equal('');
    });

    it('should change size to zero', () => {
      const element = new ElementClass();
      element.applySize(0, 0);
      expect(element.style.height).to.equal('0px');
      expect(element.style.width).to.equal('0px');
    });

    it('should change width to zero', () => {
      const element = new ElementClass();
      element.applySize(undefined, 0);
      expect(element.style.width).to.equal('0px');
    });

    it(
      'should remove i-amphtml-layout-awaiting-size class when ' +
        'size changed',
      () => {
        const element = new StubElementClass();
        expect(element.isUpgraded()).to.equal(false);
        element.classList.add('i-amphtml-layout-awaiting-size');

        expect(element).to.have.class('i-amphtml-layout-awaiting-size');
        element.applySize(100, 100);
        expect(element).not.to.have.class('i-amphtml-layout-awaiting-size');
      }
    );

    it('should dispatch custom event size-changed when size changed', () => {
      const element = new ElementClass();
      const spyDispatchEvent = env.sandbox.spy();
      element.addEventListener(AmpEvents_Enum.SIZE_CHANGED, spyDispatchEvent);
      element.applySize();
      expect(spyDispatchEvent).to.be.calledOnce;
    });

    describe('unlayoutCallback', () => {
      it('should unlayout built element and reset layoutCount', () => {
        const element = new ElementClass();
        // Non-built element doesn't receive unlayoutCallback.
        element.unlayoutCallback();
        expect(testElementUnlayoutCallback).to.have.not.been.called;

        env.sandbox
          .stub(TestElement.prototype, 'layoutCallback')
          .callsFake(() => {
            testElementLayoutCallback();
            element.layoutCount_++;
            return Promise.resolve();
          });

        env.sandbox
          .stub(TestElement.prototype, 'unlayoutCallback')
          .callsFake(() => {
            testElementUnlayoutCallback();
            return true;
          });

        // Built element receives unlayoutCallback.
        container.appendChild(element);
        return element.buildingPromise_.then(() => {
          element.unlayoutCallback();
          expect(testElementUnlayoutCallback).to.be.calledOnce;
          expect(element.layoutCount_).to.equal(0);
        });
      });

      it('should not reset layoutCount if relayout not requested', () => {
        const element = new ElementClass();

        env.sandbox
          .stub(TestElement.prototype, 'layoutCallback')
          .callsFake(() => {
            testElementLayoutCallback();
            element.layoutCount_++;
            return Promise.resolve();
          });

        env.sandbox
          .stub(TestElement.prototype, 'unlayoutCallback')
          .callsFake(() => {
            testElementUnlayoutCallback();
            return false;
          });

        container.appendChild(element);
        return element.buildingPromise_.then(() => {
          element.layoutCallback();
          element.unlayoutCallback();
          expect(testElementUnlayoutCallback).to.be.calledOnce;
          expect(element.layoutCount_).to.equal(1);
        });
      });

      it('StubElement', () => {
        const element = new StubElementClass();

        // Unupgraded document doesn't receive unlayoutCallback.
        element.unlayoutCallback();
        expect(testElementUnlayoutCallback).to.have.not.been.called;
      });
    });

    describe('pauseCallback', () => {
      it('should not pause unbuilt element', () => {
        const element = new ElementClass();
        expect(() => element.pause()).to.not.throw();
        expect(testElementPauseCallback).to.not.be.called;
      });

      it('should pause upgraded element', async () => {
        const element = new ElementClass();
        container.appendChild(element);
        await element.buildInternal();
        element.pause();
        expect(testElementPauseCallback).to.be.calledOnce;
      });

      it('should pause stub element', () => {
        const element = new StubElementClass();

        // Unupgraded document doesn't receive pauseCallback.
        element.pause();
        expect(testElementPauseCallback).to.have.not.been.called;
      });

      it('should unload when pause with unlayoutOnPause', async () => {
        const element = new ElementClass();
        container.appendChild(element);
        await element.buildInternal();
        const impl = await element.getImpl();
        env.sandbox.stub(impl, 'unlayoutOnPause').returns(true);
        const resourceUnlayoutStub = env.sandbox.stub(
          element.getResource_(),
          'unlayout'
        );

        element.pause();
        expect(testElementPauseCallback).to.be.calledOnce;
        expect(resourceUnlayoutStub).to.be.calledOnce;
      });

      it('should pause and unlayout on unmount', async () => {
        const element = new ElementClass();
        container.appendChild(element);
        await element.buildInternal();
        const resourceUnlayoutStub = env.sandbox.stub(
          element.getResource_(),
          'unlayout'
        );
        const schedulePassStub = env.sandbox.stub(resources, 'schedulePass');

        element.unmount();
        expect(testElementPauseCallback).to.be.calledOnce;
        expect(resourceUnlayoutStub).to.be.calledOnce;
        expect(schedulePassStub).to.be.calledOnce;
      });

      it('should pause and unlayout on unmount with unlayoutOnPause', async () => {
        const element = new ElementClass();
        container.appendChild(element);
        await element.buildInternal();
        element.getResource_().layoutScheduled(Date.now());
        const impl = await element.getImpl();
        env.sandbox.stub(impl, 'unlayoutOnPause').returns(true);
        const schedulePassStub = env.sandbox.stub(resources, 'schedulePass');

        element.unmount();
        expect(testElementPauseCallback).to.be.calledOnce;
        expect(testElementUnlayoutCallback).to.be.calledOnce;
        // `schedulePass` is triggered twice: once for pause and once for
        // unlayout. However, it's benign because only one pass will be
        // scheduled as a result.
        expect(schedulePassStub).to.be.calledTwice;
      });

      it('should NOT schedule pass on unmount when disconnected', async () => {
        const element = new ElementClass();
        container.appendChild(element);
        await element.buildInternal();
        const resourceUnlayoutStub = env.sandbox.stub(
          element.getResource_(),
          'unlayout'
        );
        const schedulePassStub = env.sandbox.stub(resources, 'schedulePass');

        container.removeChild(element);
        element.unmount();
        expect(testElementPauseCallback).to.be.calledOnce;
        expect(resourceUnlayoutStub).to.be.calledOnce;
        expect(schedulePassStub).to.not.be.called;
      });
    });

    describe('resumeCallback', () => {
      it('should resume upgraded element', async () => {
        const element = new ElementClass();
        element.pause();

        // Non-built element doesn't receive resumeCallback.
        element.resume();
        expect(testElementResumeCallback).to.have.not.been.called;

        // Built element receives resumeCallback.
        container.appendChild(element);
        await element.buildInternal();
        element.pause();
        element.resume();
        expect(testElementResumeCallback).to.be.calledOnce;
      });

      it('should resume stub element', () => {
        const element = new StubElementClass();

        // Unupgraded document doesn't receive resumeCallback.
        element.pause();
        element.resume();
        expect(testElementResumeCallback).to.have.not.been.called;
      });
    });

    describe('prerenderAllowed', () => {
      it('should NOT be allowed for an upgraded element', () => {
        const element = new StubElementClass();
        expect(element.prerenderAllowed()).to.be.false;
      });

      it('should be allowed base on the upgraded class', () => {
        const stub = env.sandbox.stub(TestElement, 'prerenderAllowed');
        const element = new StubElementClass();
        element.upgrade(TestElement);

        stub.returns(false);
        expect(element.prerenderAllowed()).to.be.false;

        stub.returns(true);
        expect(element.prerenderAllowed()).to.be.true;
      });

      it('should NOT be allowed with noprerender attribute', () => {
        env.sandbox.stub(TestElement, 'prerenderAllowed').returns(true);
        const element = new StubElementClass();
        element.upgrade(TestElement);
        expect(element.prerenderAllowed()).to.be.true;

        element.setAttribute('noprerender', '');
        expect(element.prerenderAllowed()).to.be.false;
      });
    });

    describe('previewAllowed', () => {
      it('should NOT be allowed for an upgraded element', () => {
        const element = new StubElementClass();
        expect(element.previewAllowed()).to.be.false;
      });

      it('should be allowed base on the upgraded class', () => {
        const stub = env.sandbox.stub(TestElement, 'previewAllowed');
        const element = new StubElementClass();
        element.upgrade(TestElement);

        stub.returns(false);
        expect(element.previewAllowed()).to.be.false;

        stub.returns(true);
        expect(element.previewAllowed()).to.be.true;
      });
    });

    describe('ensureLoaded', () => {
      it('should build and load', async () => {
        const element = new ElementClass();
        element.setAttribute('layout', 'fixed');
        element.setAttribute('width', '10');
        element.setAttribute('height', '10');
        container.appendChild(element);
        const resource = element.getResource_();

        expect(element.isBuilt()).to.be.false;

        const parentPriority = 1;
        resourcesMock
          .expects('scheduleLayoutOrPreload')
          .withExactArgs(
            resource,
            /* layout */ true,
            parentPriority,
            /* forceOutsideViewport */ true
          )
          .once();

        const promise = element.ensureLoaded(parentPriority);
        await resource.build();
        await resource.whenBuilt();
        await element.layoutCallback();

        await promise;
        expect(element.isBuilt()).to.be.true;
      });

      it('should mount and load', async () => {
        const element = new ElementClass();
        element.setAttribute('layout', 'fixed');
        element.setAttribute('width', '10');
        element.setAttribute('height', '10');
        container.appendChild(element);
        const resource = element.getResource_();

        expect(element.isBuilt()).to.be.false;

        const parentPriority = 1;
        resourcesMock
          .expects('scheduleLayoutOrPreload')
          .withExactArgs(
            resource,
            /* layout */ true,
            parentPriority,
            /* forceOutsideViewport */ true
          )
          .once();

        const promise = element.ensureLoaded(parentPriority);
        await element.mount();
        await resource.whenBuilt();
        await element.layoutCallback();

        await promise;
        expect(element.isBuilt()).to.be.true;
      });

      it('should load pre-built element', async () => {
        const element = new ElementClass();
        element.setAttribute('layout', 'fixed');
        element.setAttribute('width', '10');
        element.setAttribute('height', '10');
        container.appendChild(element);
        const resource = element.getResource_();

        await resource.build();
        await resource.whenBuilt();
        expect(element.isBuilt()).to.be.true;

        const parentPriority = 1;
        resourcesMock
          .expects('scheduleLayoutOrPreload')
          .withExactArgs(
            resource,
            /* layout */ true,
            parentPriority,
            /* forceOutsideViewport */ true
          )
          .once();

        const promise = element.ensureLoaded(parentPriority);
        await element.layoutCallback();
        await promise;
      });

      it('should do nothing for already-loaded element', async () => {
        const element = new ElementClass();
        element.setAttribute('layout', 'fixed');
        element.setAttribute('width', '10');
        element.setAttribute('height', '10');
        container.appendChild(element);
        const resource = element.getResource_();

        await resource.build();
        await resource.whenBuilt();
        resource.measure();
        resource.layoutScheduled(Date.now());
        await resource.startLayout();

        resourcesMock.expects('scheduleLayoutOrPreload').never();

        await element.ensureLoaded();
      });

      it('should reload a previously failed element', async () => {
        const element = new ElementClass();
        element.setAttribute('layout', 'fixed');
        element.setAttribute('width', '10');
        element.setAttribute('height', '10');
        container.appendChild(element);
        const resource = element.getResource_();

        await resource.build();
        await resource.whenBuilt();
        resource.measure();
        resource.layoutScheduled(Date.now());
        const layoutCallbackStub = env.sandbox.stub(element, 'layoutCallback');
        layoutCallbackStub.returns(Promise.reject(new Error('intentional')));
        try {
          await resource.startLayout();
        } catch (e) {
          // Expected.
        }

        layoutCallbackStub./*OK*/ restore();
        resourcesMock
          .expects('scheduleLayoutOrPreload')
          .withExactArgs(
            resource,
            /* layout */ true,
            /* parentPriority */ undefined,
            /* forceOutsideViewport */ true
          )
          .once();

        const promise = element.ensureLoaded();
        await element.layoutCallback();
        await promise;
      });

      it('should do nothing for a non-displayed element', async () => {
        const element = new ElementClass();
        element.setAttribute('layout', 'nodisplay');
        container.appendChild(element);
        const resource = element.getResource_();

        await resource.build();
        await resource.whenBuilt();

        resourcesMock.expects('scheduleLayoutOrPreload').never();

        await element.ensureLoaded();
      });

      it('should remeasure if needed', async () => {
        const element = new ElementClass();
        element.setAttribute('layout', 'nodisplay');
        container.appendChild(element);
        const resource = element.getResource_();

        await resource.build();
        await resource.whenBuilt();

        const measureSpy = env.sandbox.spy(resource, 'measure');
        resourcesMock.expects('scheduleLayoutOrPreload').never();

        resource.requestMeasure();
        await element.ensureLoaded();
        expect(measureSpy).to.be.calledOnce;
      });
    });
  });
});

describes.realWin('CustomElement Service Elements', {amp: true}, (env) => {
  let win, doc;
  let StubElementClass;
  let element;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    StubElementClass = createAmpElementForTesting(win, ElementStub);
    win.customElements.define('amp-stub2', StubElementClass);
    env.ampdoc.declareExtension('amp-stub2', '0.1');
    element = new StubElementClass();
  });

  function createWithAttr(attr) {
    const child = doc.createElement('div');
    child.setAttribute(attr, '');
    return child;
  }

  it('getPlaceholder should return nothing', () => {
    expect(element.getPlaceholder()).to.be.null;
  });

  it('getPlaceholder should return the last placeholder', () => {
    element.appendChild(createWithAttr('placeholder'));
    const placeholder2 = element.appendChild(createWithAttr('placeholder'));
    expect(element.getPlaceholder()).to.equal(placeholder2);
  });

  it('getPlaceholder should denylist some tags', () => {
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
      getState: () => {
        return ResourceState_Enum.LAYOUT_COMPLETE;
      },
    };
    element.resources_ = {
      getResourceForElement: (element) => {
        return element.resource;
      },
    };
    element.getAmpDoc = () => doc;
    const owners = Services.ownersForDoc(doc);
    owners.scheduleLayout = env.sandbox.mock();
    const fallback = element.appendChild(createWithAttr('fallback'));
    element.toggleFallback(true);
    expect(element).to.have.class('amp-notsupported');
    expect(owners.scheduleLayout).to.be.calledOnce;
    expect(owners.scheduleLayout).to.have.been.calledWith(element, fallback);

    element.toggleFallback(false);
    expect(element).to.not.have.class('amp-notsupported');
  });

  it('toggleFallback should toggle unsupported class on R1 elements', () => {
    element.resource = {
      getState: () => {
        return ResourceState_Enum.NOT_LAID_OUT;
      },
    };
    element.resources_ = {
      getResourceForElement: (element) => {
        return element.resource;
      },
    };
    element.R1 = () => {
      return true;
    };
    element.getAmpDoc = () => doc;
    const owners = Services.ownersForDoc(doc);
    owners.scheduleLayout = env.sandbox.mock();
    const fallback = element.appendChild(createWithAttr('fallback'));
    element.toggleFallback(true);
    expect(element).to.have.class('amp-notsupported');
    expect(owners.scheduleLayout).to.be.calledOnce;
    expect(owners.scheduleLayout).to.have.been.calledWith(element, fallback);

    element.toggleFallback(false);
    expect(element).to.not.have.class('amp-notsupported');
  });

  it('toggleFallback should not display fallback before element layout', () => {
    let resourceState = ResourceState_Enum.NOT_LAID_OUT;
    element.resource = {
      getState: () => {
        return resourceState;
      },
    };
    element.resources_ = {
      getResourceForElement: (element) => {
        return element.resource;
      },
    };
    element.getAmpDoc = () => doc;
    const owners = Services.ownersForDoc(doc);
    owners.scheduleLayout = env.sandbox.mock();

    element.appendChild(createWithAttr('fallback'));
    element.toggleFallback(true);
    expect(element).to.not.have.class('amp-notsupported');
    resourceState = ResourceState_Enum.READY_FOR_LAYOUT;
    element.toggleFallback(true);
    expect(element).to.not.have.class('amp-notsupported');
    resourceState = ResourceState_Enum.LAYOUT_COMPLETE;
    element.toggleFallback(true);
    expect(element).to.have.class('amp-notsupported');
  });

  it('togglePlaceholder should NOT call in template', () => {
    element.isInTemplate_ = true;
    allowConsoleError(() => {
      expect(() => {
        element.togglePlaceholder(false);
      }).to.throw(/Must never be called in template/);
    });
  });
});

describes.realWin('CustomElement', {amp: true}, (env) => {
  describe('Loading Indicator', () => {
    let win, doc;
    let ElementClass;
    let clock;
    let resources;
    let element;
    let vsync;
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
      clock = fakeTimers.withGlobal(win).install({now: 42});
      ElementClass = createAmpElementForTesting(win, TestElement);
      win.customElements.define('amp-test-loader', ElementClass);
      win.__AMP_EXTENDED_ELEMENTS['amp-test-loader'] = TestElement;
      LOADING_ELEMENTS_ENUM.AMP_TEST_LOADER = 'AMP-TEST-LOADER';
      resources = Services.resourcesForDoc(doc);
      resources.isBuildOn_ = true;
      resourcesMock = env.sandbox.mock(resources);
      element = new ElementClass();
      element.layoutWidth_ = 300;
      element.layout_ = Layout_Enum.FIXED;
      element.setAttribute('layout', 'fixed');
      element.resources_ = resources;
      vsync = Services.vsyncFor(win);
      env.sandbox.stub(vsync, 'run').callsFake((task) => {
        if (task.measure) {
          task.measure();
        }
        if (task.mutate) {
          task.mutate();
        }
      });
      container = doc.createElement('div');
      doc.body.appendChild(container);
    });

    afterEach(() => {
      clock.uninstall();
      resourcesMock.verify();
    });

    describe('toggleLoading', () => {
      let loadingIndicatorServiceStub;

      beforeEach(() => {
        loadingIndicatorServiceStub = {
          track: env.sandbox.spy(),
          untrack: env.sandbox.spy(),
        };
        env.sandbox.stub(element, 'getAmpDoc').returns({});
        env.sandbox
          .stub(Services, 'loadingIndicatorOrNull')
          .returns(loadingIndicatorServiceStub);
      });

      it('should be enabled by default', () => {
        element.toggleLoading(true);
        expect(loadingIndicatorServiceStub.track).to.be.calledOnce.calledWith(
          element
        );
      });

      it('should disable when explicitly disabled by the attribute', () => {
        element.setAttribute('noloading', '');
        element.toggleLoading(true);
        expect(loadingIndicatorServiceStub.track).to.not.be.called;
      });

      it('should disable when element is not allowlisted', () => {
        delete LOADING_ELEMENTS_ENUM.AMP_TEST_LOADER;
        element.toggleLoading(true);
        expect(loadingIndicatorServiceStub.track).to.not.be.called;
      });

      it('should disable when element has already been laid out', () => {
        element.layoutCount_ = 1;
        element.toggleLoading(true);
        expect(loadingIndicatorServiceStub.track).to.not.be.called;
      });

      it('should disable when element is a placeholder itself', () => {
        element.setAttribute('placeholder', '');
        element.toggleLoading(true);
        expect(loadingIndicatorServiceStub.track).to.not.be.called;
      });

      it('should disable when element is layout=nodisplay', () => {
        element.layout_ = Layout_Enum.NODISPLAY;
        element.toggleLoading(true);
        expect(loadingIndicatorServiceStub.track).to.not.be.called;
      });

      it('should enable when element is layout=container', () => {
        element.layout_ = Layout_Enum.CONTAINER;
        element.toggleLoading(true);
        expect(loadingIndicatorServiceStub.track).to.be.calledOnce;
      });

      it('should ignore loading-on if already rendered', () => {
        clock.tick(1);
        element.signals().signal(CommonSignals_Enum.RENDER_START);
        element.toggleLoading(true);
        expect(loadingIndicatorServiceStub.track).to.not.be.called;
      });

      it('should ignore loading-on if already loaded', () => {
        element.layoutCount_ = 1;
        element.toggleLoading(true);
        expect(loadingIndicatorServiceStub.track).to.not.be.called;
      });

      it('should cancel loading on render-start', () => {
        clock.tick(1);
        const stub = env.sandbox.stub(element, 'toggleLoading');
        element.renderStarted();
        expect(element.signals().get(CommonSignals_Enum.RENDER_START)).to.be.ok;
        expect(stub).to.be.calledOnce.calledWith(false);
      });

      it('should untrack when toggled off', () => {
        element.toggleLoading(false);
        expect(loadingIndicatorServiceStub.untrack).to.be.calledOnce.calledWith(
          element
        );
      });
    });

    describe('toggleLoading with layout', () => {
      let toggle;

      beforeEach(() => {
        toggle = env.sandbox.spy(element, 'toggleLoading');
      });

      it('should toggle loading off after layout complete', () => {
        element.setAttribute('height', '10');
        element.setAttribute('width', '10');
        container.appendChild(element);
        return element.buildingPromise_
          .then(() => {
            toggle.resetHistory();
            return element.layoutCallback();
          })
          .then(() => {
            expect(toggle).to.be.calledTwice;
            expect(toggle.firstCall).calledWith(true);
            expect(toggle.secondCall).calledWith(false);
          });
      });

      it('should toggle loading off after layout failed', () => {
        env.sandbox
          .stub(TestElement.prototype, 'layoutCallback')
          .returns(Promise.reject());
        element.setAttribute('height', '10');
        element.setAttribute('width', '10');
        container.appendChild(element);
        return element.buildingPromise_
          .then(() => {
            toggle.resetHistory();
            return element.layoutCallback();
          })
          .then(
            () => {
              throw new Error('Must have failed.');
            },
            () => {
              expect(toggle).to.be.calledTwice;
              expect(toggle.firstCall).calledWith(true);
              expect(toggle.secondCall).calledWith(false);
            }
          );
      });

      it('should disable toggle loading on after layout failed', () => {
        env.sandbox
          .stub(TestElement.prototype, 'layoutCallback')
          .returns(Promise.reject());
        element.setAttribute('height', '10');
        element.setAttribute('width', '10');
        container.appendChild(element);
        return element.buildingPromise_
          .then(() => {
            expect(element.layoutCount_).to.equal(0);
            expect(element.isLoadingEnabled_()).to.equal(true);
            return element.layoutCallback();
          })
          .then(
            () => {
              throw new Error('Must have failed.');
            },
            () => {
              expect(element.layoutCount_).to.equal(1);
              expect(element.isLoadingEnabled_()).to.equal(false);
            }
          );
      });
    });
  });
});

describes.realWin('CustomElement Overflow Element', {amp: true}, (env) => {
  let win, doc;
  let ElementClass;
  let element;
  let overflowElement;
  let vsync;
  let mutator;
  let mutatorMock;

  class TestElement extends BaseElement {
    isLayoutSupported(unusedLayout) {
      return true;
    }
  }

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ElementClass = createAmpElementForTesting(win, TestElement);
    win.customElements.define('amp-test-overflow', ElementClass);
    mutator = Services.mutatorForDoc(doc);
    mutatorMock = env.sandbox.mock(mutator);
    element = new ElementClass();
    element.ampdoc_ = doc;
    element.layoutWidth_ = 300;
    element.layout_ = Layout_Enum.FIXED;
    element.mutator_ = mutator;
    overflowElement = doc.createElement('div');
    overflowElement.setAttribute('overflow', '');
    element.appendChild(overflowElement);
    vsync = Services.vsyncFor(win);
    env.sandbox.stub(vsync, 'run').callsFake((task) => {
      if (task.measure) {
        task.measure();
      }
      if (task.mutate) {
        task.mutate();
      }
    });
  });

  afterEach(() => {
    mutatorMock.verify();
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
    mutatorMock
      .expects('forceChangeSize')
      .withExactArgs(element, 117, 113)
      .once();

    expect(overflowElement.onclick).to.exist;
    expect(overflowElement).to.have.class('amp-visible');

    overflowElement.onclick();
    expect(overflowElement.onclick).to.not.exist;
    expect(overflowElement).to.not.have.class('amp-visible');
  });
});
