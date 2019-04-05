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
  BOOKEND_CONFIG_ATTRIBUTE_NAME,
  BOOKEND_CREDENTIALS_ATTRIBUTE_NAME,
} from '../amp-story-request-service';


describes.fakeWin('amp-story-store-service', {amp: true}, env => {
  let requestService;
  let storyElement;
  let bookendElement;
  let xhrMock;

  beforeEach(() => {
    storyElement = env.win.document.createElement('div');
    bookendElement = env.win.document.createElement('amp-story-bookend');
    storyElement.appendChild(bookendElement);
    env.win.document.body.appendChild(storyElement);
    requestService = new AmpStoryRequestService(env.win, storyElement);
    xhrMock = sandbox.mock(requestService.xhr_);
  });

  it('should not load the bookend config if no attribute is set', () => {
    xhrMock.expects('fetchJson').never();

    return requestService.loadBookendConfig().then(config => {
      expect(config).to.be.null;
      xhrMock.verify();
    });
  });

  it('should use the URL provided in the attribute to load the config', () => {
    const bookendUrl = 'https://publisher.com/bookend';

    bookendElement.setAttribute(BOOKEND_CONFIG_ATTRIBUTE_NAME, bookendUrl);
    xhrMock.expects('fetchJson')
        .withExactArgs(
            bookendUrl,
            {requireAmpResponseSourceOrigin: false},
        )
        .resolves({
          ok: true,
          json() {
            return Promise.resolve();
          },
        })
        .once();

    return requestService.loadBookendConfig().then(() => {
      xhrMock.verify();
    });
  });

  it('should return the expected bookend config', () => {
    const bookendUrl = 'https://publisher.com/bookend';
    const fetchedConfig = 'amazingConfig';

    bookendElement.setAttribute(BOOKEND_CONFIG_ATTRIBUTE_NAME, bookendUrl);
    xhrMock.expects('fetchJson')
        .resolves({
          ok: true,
          json() {
            return Promise.resolve(fetchedConfig);
          },
        })
        .once();

    return requestService.loadBookendConfig().then(config => {
      expect(config).to.equal(fetchedConfig);
      xhrMock.verify();
    });
  });

  it('should fetch the bookend config once if called multiple times', () => {
    const bookendUrl = 'https://publisher.com/bookend';

    bookendElement.setAttribute(BOOKEND_CONFIG_ATTRIBUTE_NAME, bookendUrl);
    xhrMock.expects('fetchJson')
        .resolves({
          ok: true,
          json() {
            return Promise.resolve();
          },
        })
        .once();

    return requestService.loadBookendConfig()
        .then(() => requestService.loadBookendConfig())
        .then(() => {
          xhrMock.verify();
        });
  });

  it('should fetch the bookend config with credentials', () => {
    const bookendUrl = 'https://publisher.com/bookend';

    bookendElement.setAttribute(BOOKEND_CONFIG_ATTRIBUTE_NAME, bookendUrl);
    bookendElement.setAttribute(BOOKEND_CREDENTIALS_ATTRIBUTE_NAME, 'include');
    xhrMock.expects('fetchJson')
        .withExactArgs(
            bookendUrl,
            {
              requireAmpResponseSourceOrigin: false,
              credentials: 'include',
            },
        )
        .resolves({
          ok: true,
          json() {
            return Promise.resolve();
          },
        })
        .once();

    return requestService.loadBookendConfig().then(() => {
      xhrMock.verify();
    });
  });
});
