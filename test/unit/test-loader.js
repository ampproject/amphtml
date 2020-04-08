import * as lolex from 'lolex';
import {createLoaderElement} from '../../src/loader';
import {Services} from '../../src/services';

describes.fakeWin('Loader', {amp: true}, (env) => {
  let clock;
  let ampdoc;
  let loaderService;
  let el;
  const loaderLatency = 100;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    el = document.createElement('div');
    clock = lolex.install({target: env.win, now: 50});

    env.sandbox
      .stub(Services, 'extensionsFor')
      .returns({installExtensionForDoc: () => Promise.resolve()});
    env.sandbox.stub(Services, 'loaderServiceForDoc').returns(
      new Promise((res) => {
        loaderService = {initializeLoader: env.sandbox.spy()};
        env.win.setTimeout(() => res(loaderService), loaderLatency);
      })
    );
  });

  it('By default, the delay in retrieving LoaderService should be the initDelay', async () => {
    createLoaderElement(ampdoc, el, 400, 400);
    await clock.tickAsync(loaderLatency);

    expect(loaderService.initializeLoader).calledOnceWith(
      el,
      env.sandbox.match.any,
      100,
      400,
      400
    );
  });

  it('If specified, startTime should contribute to the initDelay', async () => {
    // startTime: 0, now: 50, loaderLatency: 100 --> initDelay: 150.
    createLoaderElement(ampdoc, el, 400, 400, 0);
    await clock.tickAsync(loaderLatency);

    expect(loaderService.initializeLoader).calledOnceWith(
      el,
      env.sandbox.match.any,
      150,
      400,
      400
    );
  });
});
