/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {
  AmpStoryRequestService,
  CONFIG_SRC_ATTRIBUTE_NAME,
} from '../amp-story-request-service';

describes.fakeWin('amp-story-request-service', {amp: true}, (env) => {
  let requestService;
  let storyElement;
  let shareElement;
  let xhrMock;

  beforeEach(() => {
    storyElement = env.win.document.createElement('div');
    shareElement = env.win.document.createElement('amp-story-social-share');
    storyElement.appendChild(shareElement);
    env.win.document.body.appendChild(storyElement);
    requestService = new AmpStoryRequestService(env.win, storyElement);
    xhrMock = env.sandbox.mock(requestService.xhr_);
  });

  it('should not load the share config if no attribute is set', async () => {
    xhrMock.expects('fetchJson').never();

    const config = await requestService.loadShareConfig();
    expect(config).to.be.null;
    xhrMock.verify();
  });

  it('should use the URL provided in the attribute to load the config', async () => {
    const shareUrl = 'https://publisher.com/share';

    shareElement.setAttribute(CONFIG_SRC_ATTRIBUTE_NAME, shareUrl);
    xhrMock
      .expects('fetchJson')
      .withExactArgs(shareUrl, {})
      .resolves({
        ok: true,
        json() {
          return Promise.resolve();
        },
      })
      .once();

    await requestService.loadShareConfig();
    xhrMock.verify();
  });

  it('should return the expected share config', async () => {
    const shareUrl = 'https://publisher.com/share';
    const fetchedConfig = 'amazingConfig';

    shareElement.setAttribute(CONFIG_SRC_ATTRIBUTE_NAME, shareUrl);
    xhrMock
      .expects('fetchJson')
      .resolves({
        ok: true,
        json() {
          return Promise.resolve(fetchedConfig);
        },
      })
      .once();

    const config = await requestService.loadshareConfig();
    expect(config).to.equal(fetchedConfig);
    xhrMock.verify();
  });

  it('should fetch the share config once if called multiple times', async () => {
    const shareUrl = 'https://publisher.com/share';

    shareElement.setAttribute(CONFIG_SRC_ATTRIBUTE_NAME, shareUrl);
    xhrMock
      .expects('fetchJson')
      .resolves({
        ok: true,
        json() {
          return Promise.resolve();
        },
      })
      .once();

    await requestService.loadshareConfig();
    await requestService.loadshareConfig();
    xhrMock.verify();
  });

  it('should return the social share config from the share element', async () => {
    const shareUrl = 'https://publisher.com/share';
    const fetchedConfig = 'amazingConfig';

    const shareElement = env.win.document.createElement(
      'amp-story-social-share'
    );
    storyElement.appendChild(shareElement);

    shareElement.setAttribute(CONFIG_SRC_ATTRIBUTE_NAME, shareUrl);
    xhrMock
      .expects('fetchJson')
      .resolves({
        ok: true,
        json() {
          return Promise.resolve(fetchedConfig);
        },
      })
      .once();

    const config = await requestService.loadShareConfig();
    expect(config).to.equal(fetchedConfig);
    xhrMock.verify();
  });
});
