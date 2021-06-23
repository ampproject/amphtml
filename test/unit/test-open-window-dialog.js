/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import {openWindowDialog} from '../../src/open-window-dialog';

describes.sandboxed('openWindowDialog', {}, (env) => {
  let windowApi;
  let windowMock;

  beforeEach(() => {
    windowApi = {
      open: () => {
        throw new Error('not mocked');
      },
    };
    windowMock = env.sandbox.mock(windowApi);
  });

  afterEach(() => {
    windowMock.verify();
  });

  it('should return on first success', () => {
    const dialog = {};
    windowMock
      .expects('open')
      .withExactArgs('https://example.com/', '_blank', 'width=1')
      .returns(dialog)
      .once();
    const res = openWindowDialog(
      windowApi,
      'https://example.com/',
      '_blank',
      'width=1'
    );
    expect(res).to.equal(dialog);
  });

  it('should retry on first null', () => {
    const dialog = {};
    windowMock
      .expects('open')
      .withExactArgs('https://example.com/', '_blank', 'width=1')
      .returns(null)
      .once();
    windowMock
      .expects('open')
      .withExactArgs('https://example.com/', '_top')
      .returns(dialog)
      .once();
    const res = openWindowDialog(
      windowApi,
      'https://example.com/',
      '_blank',
      'width=1'
    );
    expect(res).to.equal(dialog);
  });

  it('should retry on first undefined', () => {
    const dialog = {};
    windowMock
      .expects('open')
      .withExactArgs('https://example.com/', '_blank', 'width=1')
      .returns(undefined)
      .once();
    windowMock
      .expects('open')
      .withExactArgs('https://example.com/', '_top')
      .returns(dialog)
      .once();
    const res = openWindowDialog(
      windowApi,
      'https://example.com/',
      '_blank',
      'width=1'
    );
    expect(res).to.equal(dialog);
  });

  it('should retry on first exception', () => {
    const dialog = {};
    windowMock
      .expects('open')
      .withExactArgs('https://example.com/', '_blank', 'width=1')
      .throws(new Error('intentional'))
      .once();
    windowMock
      .expects('open')
      .withExactArgs('https://example.com/', '_top')
      .returns(dialog)
      .once();
    allowConsoleError(() => {
      const res = openWindowDialog(
        windowApi,
        'https://example.com/',
        '_blank',
        'width=1'
      );
      expect(res).to.equal(dialog);
    });
  });

  it('should return the final result', () => {
    windowMock
      .expects('open')
      .withExactArgs('https://example.com/', '_blank', 'width=1')
      .returns(undefined)
      .once();
    windowMock
      .expects('open')
      .withExactArgs('https://example.com/', '_top')
      .returns(null)
      .once();
    const res = openWindowDialog(
      windowApi,
      'https://example.com/',
      '_blank',
      'width=1'
    );
    expect(res).to.be.null;
  });

  it('should return the final exception', () => {
    windowMock
      .expects('open')
      .withExactArgs('https://example.com/', '_blank', 'width=1')
      .throws(new Error('intentional1'))
      .once();
    windowMock
      .expects('open')
      .withExactArgs('https://example.com/', '_top')
      .throws(new Error('intentional2'))
      .once();
    allowConsoleError(() => {
      expect(() => {
        openWindowDialog(
          windowApi,
          'https://example.com/',
          '_blank',
          'width=1'
        );
      }).to.throw(/intentional2/);
    });
  });

  it('should not retry with noopener set', () => {
    windowMock
      .expects('open')
      .withExactArgs('https://example.com/', '_blank', 'noopener,width=1')
      .returns(null)
      .once();
    const res = openWindowDialog(
      windowApi,
      'https://example.com/',
      '_blank',
      'noopener,width=1'
    );
    expect(res).to.be.null;
  });

  it('should retry only non-top target', () => {
    windowMock
      .expects('open')
      .withExactArgs('https://example.com/', '_top', 'width=1')
      .returns(null)
      .once();
    const res = openWindowDialog(
      windowApi,
      'https://example.com/',
      '_top',
      'width=1'
    );
    expect(res).to.be.null;
  });
});
