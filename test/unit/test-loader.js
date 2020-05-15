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

import * as lolex from 'lolex';
import {Services} from '../../src/services';
import {createLoaderElement} from '../../src/loader';

describes.fakeWin('Loader', {amp: true}, (env) => {
  let clock;
  let ampdoc;
  let loaderService;
  let el;
  const loaderDownloadTime = 100;

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
