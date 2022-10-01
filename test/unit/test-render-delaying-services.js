import * as fakeTimers from '@sinonjs/fake-timers';

import {macroTask} from '#testing/helpers';
import {createIframePromise} from '#testing/iframe';

import {
  hasRenderDelayingServices,
  waitForServices,
} from '../../src/render-delaying-services';
import * as service from '../../src/service-helpers';

describes.sandboxed('waitForServices', {}, (env) => {
  let win;
  let clock;
  let dynamicCssResolve;
  let experimentResolve;
  let variantResolve;
  let variantService;
  let variantStub;

  beforeEach(() => {
    const getService = env.sandbox.stub(service, 'getServicePromise');
    dynamicCssResolve = waitForService(
      env,
      getService,
      'amp-dynamic-css-classes'
    );
    experimentResolve = waitForService(env, getService, 'amp-experiment');

    variantService = {
      whenReady: () => {
        throw new Error('whenReady should be stubbed');
      },
    };
    variantResolve = waitForService(env, getService, 'variant', variantService);
    variantStub = env.sandbox
      .stub(variantService, 'whenReady')
      .returns(Promise.resolve());

    return createIframePromise().then((iframe) => {
      win = iframe.win;
      clock = fakeTimers.withGlobal(win).install();
    });
  });

  afterEach(() => {
    clock.uninstall();
  });

  it('should resolve if no blocking services is presented', () => {
    // <script custom-element="amp-experiment"> should not block
    addExtensionScript(win, 'amp-experiment');
    expect(hasRenderDelayingServices(win)).to.be.false;
    return expect(waitForServices(win)).to.eventually.have.lengthOf(0);
  });

  it('should timeout if some blocking services are missing', function* () {
    addExtensionScript(win, 'amp-dynamic-css-classes');
    win.document.body.appendChild(win.document.createElement('amp-experiment'));
    expect(hasRenderDelayingServices(win)).to.be.true;
    addExtensionScript(win, 'non-blocking-extension');

    const promise = waitForServices(win);
    dynamicCssResolve();
    experimentResolve(); // 'amp-experiment' is actually blocked by 'variant'

    // Push ourselves back on the event queue,
    // to allow the dynamic-css service.whenReady
    // to resolve
    yield macroTask();
    clock.tick(3000);
    return expect(promise).to.eventually.be.rejectedWith('variant');
  });

  it('should resolve when all extensions are ready', () => {
    addExtensionScript(win, 'amp-dynamic-css-classes');
    win.document.body.appendChild(win.document.createElement('amp-experiment'));
    expect(hasRenderDelayingServices(win)).to.be.true;
    addExtensionScript(win, 'non-blocking-extension');

    const promise = waitForServices(win);
    dynamicCssResolve();
    variantResolve(); // this unblocks 'amp-experiment'

    return expect(promise).to.eventually.have.lengthOf(2);
  });

  it('should resolve if no service.whenReady', () => {
    addExtensionScript(win, 'amp-dynamic-css-classes');
    expect(hasRenderDelayingServices(win)).to.be.true;
    addExtensionScript(win, 'non-blocking-extension');

    const promise = waitForServices(win);
    dynamicCssResolve();

    return expect(promise).to.eventually.have.lengthOf(1);
  });

  it('should wait to resolve for service.whenReady', () => {
    addExtensionScript(win, 'amp-dynamic-css-classes');
    win.document.body.appendChild(win.document.createElement('amp-experiment'));
    expect(hasRenderDelayingServices(win)).to.be.true;
    addExtensionScript(win, 'non-blocking-extension');

    const promise = waitForServices(win);
    dynamicCssResolve();
    variantResolve(); // this unblocks 'amp-experiment'

    return promise.then((services) => {
      expect(services.length).to.be.equal(2);
      expect(variantStub).to.be.calledOnce;
    });
  });
});

function waitForService(env, getService, serviceId, service) {
  let resolve = null;
  getService.withArgs(env.sandbox.match.any, serviceId).returns(
    new Promise((r) => {
      resolve = r.bind(this, service);
    })
  );
  return resolve;
}

function addExtensionScript(win, extensionName) {
  const scriptElement = win.document.createElement('script');
  scriptElement.setAttribute('async', '');
  scriptElement.setAttribute('custom-element', extensionName);
  win.document.head.appendChild(scriptElement);
}
