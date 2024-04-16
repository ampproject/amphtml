import * as fakeTimers from '@sinonjs/fake-timers';

import {Services} from '#service';
import {createLoaderElement} from '#service/loader-element';

describes.fakeWin('Loader', {amp: true}, (env) => {
  let clock;
  let ampdoc;
  let loaderService;
  let el;
  const loaderDownloadTime = 100;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    el = document.createElement('div');
    clock = fakeTimers.withGlobal(env.win).install({now: 50});

    env.sandbox
      .stub(Services, 'extensionsFor')
      .returns({installExtensionForDoc: () => Promise.resolve()});

    env.sandbox.stub(Services, 'loaderServiceForDoc').returns(
      new Promise((res) => {
        loaderService = {initializeLoader: env.sandbox.spy()};
        env.win.setTimeout(() => res(loaderService), loaderDownloadTime);
      })
    );
  });

  it('By default, sets initDelay to how long loaderService download takes', async () => {
    createLoaderElement(ampdoc, el, /* width */ 400, /* height */ 400);
    clock.tick(loaderDownloadTime);
    await clock.runAllAsync();

    expect(loaderService.initializeLoader).calledOnceWith(
      el,
      env.sandbox.match.any,
      /* initDelay */ 100,
      /* width */ 400,
      /* height */ 400
    );
  });

  it('If specified, startTime should contribute to the initDelay', async () => {
    // startTime: 0, now: 50, loaderDownloadTime: 100 --> initDelay: 150.
    createLoaderElement(ampdoc, el, /* width */ 400, /* height */ 400, 0);
    clock.tick(loaderDownloadTime);
    await clock.runAllAsync();

    expect(loaderService.initializeLoader).calledOnceWith(
      el,
      env.sandbox.match.any,
      /* initDelay */ 150,
      /* width */ 400,
      /* height */ 400
    );
  });
});
