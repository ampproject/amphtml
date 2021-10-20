import '../amp-mathml';

import {MessageType, serializeMessage} from '#core/3p-frame-messaging';
import {createElementWithAttributes} from '#core/dom';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

import {QUADRATIC_FORMULA} from './utils';

describes.realWin(
  'amp-mathml-v1.0',
  {
    amp: {
      extensions: ['amp-mathml:1.0'],
    },
  },
  (env) => {
    beforeEach(async () => {
      toggleExperiment(env.win, 'bento-mathml', true, true);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('should render', async () => {
      const mockTitle = 'mock title';
      const mockFormula = QUADRATIC_FORMULA;
      const ampMathmlElement = createAmpMathmlElement(env, {
        title: mockTitle,
        formula: mockFormula,
      });
      env.win.document.body.appendChild(ampMathmlElement);
      await waitForRender(ampMathmlElement);

      expect(ampMathmlElement.shadowRoot.querySelector('iframe').src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it('should correctly accept (and render) formula and title', async () => {
      const mockTitle = 'mock title';
      const mockFormula = QUADRATIC_FORMULA;
      const ampMathmlElement = createAmpMathmlElement(env, {
        title: mockTitle,
        formula: mockFormula,
      });
      env.win.document.body.appendChild(ampMathmlElement);
      await waitForRender(ampMathmlElement);

      const iframe = ampMathmlElement.shadowRoot.querySelector('iframe');
      const {formula, title} = JSON.parse(
        iframe.getAttribute('name')
      ).attributes;
      expect(title).to.equal(mockTitle);
      expect(formula).to.equal(mockFormula);
    });

    it('should call amp actions', async () => {
      env.win.IntersectionObserver = env.sandbox.stub();
      env.win.IntersectionObserver.callsFake(() => ({
        observe: env.sandbox.stub(),
        unobserve: env.sandbox.stub(),
      }));

      const mockTitle = 'mock title';
      const mockFormula = QUADRATIC_FORMULA;
      const ampMathmlElement = createAmpMathmlElement(env, {
        title: mockTitle,
        formula: mockFormula,
      });
      env.win.document.body.appendChild(ampMathmlElement);
      await waitForRender(ampMathmlElement);

      const iframe = ampMathmlElement.shadowRoot.querySelector('iframe');
      const divFrameWrapper = iframe.parentElement.parentElement;

      const impl = await ampMathmlElement.getImpl(false);
      const attemptChangeSizeStub = env.sandbox.stub(impl, 'attemptChangeSize');
      attemptChangeSizeStub.returns(Promise.resolve());
      const onLoadStub = env.sandbox.stub(impl, 'handleOnLoad');
      onLoadStub.returns(undefined);

      const mockEvent = new CustomEvent('message');
      mockEvent.data = serializeMessage(
        MessageType.EMBED_SIZE,
        JSON.parse(iframe.getAttribute('name')).attributes.sentinel,
        {
          height: 1001,
          width: 1002,
        }
      );
      mockEvent.source = iframe.contentWindow;
      env.win.dispatchEvent(mockEvent);

      // wait for useIntersectionObserver hook to execute
      await Promise.resolve();

      // simulate offscreen intersection to force "render"
      const ioCallback = env.win.IntersectionObserver.lastCall.firstArg;
      ioCallback([{isIntersecting: false, target: divFrameWrapper}]);

      // wait for useEffectHook to execute
      await waitForHooks();

      expect(onLoadStub).to.be.calledOnce;
      expect(attemptChangeSizeStub).to.be.calledOnce.calledWith(
        1001,
        /* width should be ignored for non-inline elements */
        undefined
      );
    });

    it('should render inline correctly', async () => {
      env.win.IntersectionObserver = env.sandbox.stub();
      env.win.IntersectionObserver.callsFake(() => ({
        observe: env.sandbox.stub(),
        unobserve: env.sandbox.stub(),
      }));

      const mockTitle = 'mock title';
      const mockFormula = QUADRATIC_FORMULA;
      const ampMathmlElement = createAmpMathmlElement(env, {
        title: mockTitle,
        formula: mockFormula,
        inline: true,
      });
      env.win.document.body.appendChild(ampMathmlElement);
      await waitForRender(ampMathmlElement);

      const iframe = ampMathmlElement.shadowRoot.querySelector('iframe');
      const divFrameWrapper = iframe.parentElement.parentElement;
      expect(divFrameWrapper.classList.toString().includes('inline')).to.be
        .true;

      const impl = await ampMathmlElement.getImpl(false);
      const attemptChangeSizeStub = env.sandbox.stub(impl, 'attemptChangeSize');
      attemptChangeSizeStub.returns(Promise.resolve());

      const mockEvent = new CustomEvent('message');
      mockEvent.data = serializeMessage(
        MessageType.EMBED_SIZE,
        JSON.parse(iframe.getAttribute('name')).attributes.sentinel,
        {
          height: 1001,
          width: 1002,
        }
      );
      mockEvent.source = iframe.contentWindow;
      env.win.dispatchEvent(mockEvent);

      // wait for useIntersectionObserver hook to execute
      await Promise.resolve();

      // simulate offscreen intersection to force "render"
      const ioCallback = env.win.IntersectionObserver.lastCall.firstArg;
      ioCallback([{isIntersecting: false, target: divFrameWrapper}]);

      // wait for useEffectHook to execute
      await waitForHooks();

      expect(attemptChangeSizeStub).to.be.calledOnce.calledWith(1001, 1002);
    });
  }
);

function createAmpMathmlElement(env, {formula, ...args}) {
  return createElementWithAttributes(env.win.document, 'amp-mathml', {
    'data-formula': formula,
    ...args,
  });
}

/**
 *
 * @param {HTMLElement} element
 */
async function waitForRender(element) {
  await element.buildInternal();
  const loadPromise = element.layoutCallback();
  await waitFor(
    () => element.shadowRoot.querySelector('iframe'),
    'iframe mounted'
  );
  await loadPromise;
}

async function waitForHooks() {
  return new Promise((r) => setTimeout(r, 50));
}
