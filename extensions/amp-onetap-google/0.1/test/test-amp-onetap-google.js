import '../amp-onetap-google';
import {createElementWithAttributes, waitForChild} from '#core/dom';

import {Services} from '#service';
import {AmpDoc} from '#service/ampdoc-impl';

import {loadPromise} from '#utils/event-helper';
import {user} from '#utils/log';

import {macroTask} from '#testing/helpers';

import {BaseElement} from '../../../../src/base-element';
import {ACTIONS, SENTINEL} from '../amp-onetap-google';

const TAG = 'amp-onetap-google';

describes.realWin(
  TAG,
  {
    amp: {
      runtimeOn: true,
      extensions: [TAG],
    },
    // only "iframe.localhost", which is considered external
    allowExternalResources: true,
  },
  (env) => {
    let document;
    let defaultAttrs;

    const whenSelectedAvailable = (parent, selector) =>
      new Promise((resolve) => {
        let child;
        return waitForChild(
          parent,
          (parent) => (child = parent.querySelector(selector)),
          () => resolve(child)
        );
      });

    function stubServiceMethods(serviceGetterName, methods) {
      for (const method in methods) {
        env.sandbox
          .stub(Services[serviceGetterName](env.win.document.body), method)
          .callsFake(methods[method]);
      }
      return methods;
    }

    async function fakePostMessage(element, iframe, data) {
      const origin = 'https://fake.localhost';

      await loadPromise(iframe); // so we have access to a contentWindow

      const impl = await element.getImpl();
      impl.handleIntermediateIframeMessage_(origin, {
        origin,
        data,
        source: iframe.contentWindow,
      });

      // some tasks are async, so it's nice to ensure they're completed before
      // resolving the message as sent.
      await macroTask();

      return iframe;
    }

    beforeEach(() => {
      document = env.win.document;

      defaultAttrs = {
        layout: 'nodisplay',
        'data-src': `http://iframe.localhost:${location.port}/test/fixtures/served/blank.html`,
      };

      // build waits for visibility, force it.
      env.sandbox
        .stub(AmpDoc.prototype, 'whenFirstVisible')
        .returns(Promise.resolve());

      // make sync
      env.sandbox
        .stub(BaseElement.prototype, 'mutateElement')
        .callsFake((mutator) => Promise.resolve(mutator()));
    });

    it('creates iframe', async () => {
      const element = createElementWithAttributes(document, TAG, defaultAttrs);
      document.body.appendChild(element);
      const iframe = await whenSelectedAvailable(element, 'iframe');
      expect(iframe).to.be.ok;
      expect(iframe).to.have.class('i-amphtml-onetap-google-iframe');
    });

    it('adds iframe to FixedLayer', async () => {
      const {addToFixedLayer} = stubServiceMethods('viewportForDoc', {
        addToFixedLayer: env.sandbox.spy(),
      });

      const element = createElementWithAttributes(document, TAG, defaultAttrs);
      document.body.appendChild(element);
      const iframe = await whenSelectedAvailable(element, 'iframe');

      expect(addToFixedLayer.withArgs(iframe)).to.have.been.calledOnce;
    });

    it('substitutes variables in src', async () => {
      const {expandUrlAsync} = stubServiceMethods('urlReplacementsForDoc', {
        expandUrlAsync: env.sandbox.spy((src) =>
          Promise.resolve(`${src}#__expandUrlAsync_expanded__`)
        ),
      });

      const element = createElementWithAttributes(document, TAG, defaultAttrs);
      document.body.appendChild(element);
      const iframe = await whenSelectedAvailable(element, 'iframe');

      expect(expandUrlAsync).to.have.been.calledOnce;

      expect(iframe.src).to.not.equal(element.dataset.src);
      expect(iframe.src).to.equal(await expandUrlAsync.firstCall.returnValue);
    });

    it('returns parent_frame_ready message with nonce on ACTIONS.READY', async () => {
      const element = createElementWithAttributes(document, TAG, defaultAttrs);
      document.body.appendChild(element);

      const iframe = await whenSelectedAvailable(element, 'iframe');

      const postMessage = env.sandbox.stub(
        await element.getImpl(),
        'postMessage_'
      );

      const nonce = 'chilaquiles';

      await fakePostMessage(element, iframe, {
        sentinel: SENTINEL,
        command: ACTIONS.READY,
        nonce,
      });

      expect(
        postMessage.withArgs(
          iframe.contentWindow,
          env.sandbox.match({command: 'parent_frame_ready', nonce})
        )
      ).to.have.been.calledOnce;
    });

    it('resizes iframe on ACTIONS.RESIZE', async () => {
      const element = createElementWithAttributes(document, TAG, defaultAttrs);
      document.body.appendChild(element);

      const iframe = await whenSelectedAvailable(element, 'iframe');

      const height = 420;

      await fakePostMessage(element, iframe, {
        sentinel: SENTINEL,
        command: ACTIONS.RESIZE,
        height,
      });

      expect(iframe.style.height).to.equal(`${height}px`);
    });

    it('displays element on ACTIONS.RESIZE', async () => {
      const element = createElementWithAttributes(document, TAG, defaultAttrs);
      document.body.appendChild(element);

      const iframe = await whenSelectedAvailable(element, 'iframe');

      expect(element).to.have.attribute('hidden');

      const height = 420;

      await fakePostMessage(element, iframe, {
        sentinel: SENTINEL,
        command: ACTIONS.RESIZE,
        height,
      });

      expect(element).to.not.have.attribute('hidden');
    });

    ['CLOSE', 'DONE'].forEach((actionKey) => {
      it(`removes iframe and hides element on ACTIONS.${actionKey}`, async () => {
        const element = createElementWithAttributes(
          document,
          TAG,
          defaultAttrs
        );
        document.body.appendChild(element);

        const iframe = await whenSelectedAvailable(element, 'iframe');

        await fakePostMessage(element, iframe, {
          sentinel: SENTINEL,
          command: ACTIONS[actionKey],
        });

        expect(element).to.have.attribute('hidden');
        expect(element.querySelector('iframe')).to.be.null;
      });
    });

    it('warns when there are no entitlements to refresh on ACTIONS.DONE', async () => {
      const warn = env.sandbox.spy(user(), 'warn');

      const element = createElementWithAttributes(document, TAG, defaultAttrs);
      document.body.appendChild(element);

      const iframe = await whenSelectedAvailable(element, 'iframe');

      await fakePostMessage(element, iframe, {
        sentinel: SENTINEL,
        command: ACTIONS.DONE,
      });

      expect(warn.withArgs(TAG, env.sandbox.match(/no entitlements/))).to.have
        .been.calledOnce;
    });

    it('refreshes amp-access on ACTIONS.DONE', async () => {
      const warn = env.sandbox.spy(user(), 'warn');

      const {execute} = stubServiceMethods('actionServiceForDoc', {
        execute: env.sandbox.spy(),
      });

      const accessElement = createElementWithAttributes(document, 'script', {
        id: 'amp-access',
      });

      document.head.appendChild(accessElement);

      const element = createElementWithAttributes(document, TAG, defaultAttrs);
      document.body.appendChild(element);

      const iframe = await whenSelectedAvailable(element, 'iframe');

      await fakePostMessage(element, iframe, {
        sentinel: SENTINEL,
        command: ACTIONS.DONE,
      });

      expect(warn).to.not.have.been.called;
      expect(execute.withArgs(accessElement, 'refresh')).to.have.been
        .calledOnce;
    });

    it('does not refresh amp-access on ACTIONS.DONE if unavailable', async () => {
      const {execute} = stubServiceMethods('actionServiceForDoc', {
        execute: env.sandbox.spy(),
      });

      const element = createElementWithAttributes(document, TAG, defaultAttrs);
      document.body.appendChild(element);

      const iframe = await whenSelectedAvailable(element, 'iframe');

      await fakePostMessage(element, iframe, {
        sentinel: SENTINEL,
        command: ACTIONS.DONE,
      });

      expect(execute).to.not.have.been.called;
    });

    it('refreshes amp-subscriptions on ACTIONS.DONE', async () => {
      const warn = env.sandbox.spy(user(), 'warn');
      const resetPlatforms = env.sandbox.spy();

      env.sandbox
        .stub(Services, 'subscriptionsServiceForDocOrNull')
        .resolves({resetPlatforms});

      const element = createElementWithAttributes(document, TAG, defaultAttrs);
      document.body.appendChild(element);

      const iframe = await whenSelectedAvailable(element, 'iframe');

      await fakePostMessage(element, iframe, {
        sentinel: SENTINEL,
        command: ACTIONS.DONE,
      });

      expect(warn).to.not.have.been.called;
      expect(resetPlatforms).to.have.been.calledOnce;
    });

    it('does not refresh amp-subscriptions on ACTIONS.DONE if unavailable', async () => {
      env.sandbox
        .stub(Services, 'subscriptionsServiceForDocOrNull')
        .resolves(null);

      const element = createElementWithAttributes(document, TAG, defaultAttrs);
      document.body.appendChild(element);

      const iframe = await whenSelectedAvailable(element, 'iframe');

      await fakePostMessage(element, iframe, {
        sentinel: SENTINEL,
        command: ACTIONS.DONE,
      });

      // should have been removed by now
      expect(iframe.parentNode).to.be.null;
    });

    it('sets classname on SET_UI_MODE', async () => {
      const element = createElementWithAttributes(document, TAG, defaultAttrs);
      document.body.appendChild(element);

      const iframe = await whenSelectedAvailable(element, 'iframe');

      // In reality this value is either "card" or "bottom_sheet", but from the
      // implementation's point of view, this is only a suffix for a classname
      // selected by CSS.
      const mode = 'veggie-burrito';

      await fakePostMessage(element, iframe, {
        sentinel: SENTINEL,
        command: ACTIONS.SET_UI_MODE,
        mode,
      });

      expect(iframe).to.have.class(`i-amphtml-onetap-google-ui-${mode}`);
    });
  }
);
