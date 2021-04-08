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

import * as cookie from '../../../../src/cookies';
import * as fakeTimers from '@sinonjs/fake-timers';
import {CookieWriter} from '../cookie-writer';
import {dict} from '../../../../src/utils/object';

const TAG = '[amp-consent/cookie-writer]';

describes.realWin(
  'amp-consent.cookie-writer',
  {
    amp: true,
    runtimeOn: true,
  },
  (env) => {
    let win;
    let doc;
    let setCookieSpy;
    let element;

    beforeEach(() => {
      setCookieSpy = env.sandbox.spy();
      win = env.win;
      doc = win.document;
      env.sandbox.stub(cookie, 'setCookie').callsFake((win, name, value) => {
        setCookieSpy(name, value);
      });
      element = doc.createElement('div');
      doc.body.appendChild(element);
    });

    describe('write with condition', () => {
      let expandAndWriteSpy;

      it('Resolve when no config', () => {
        const config = dict({});
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Resovle when config is invalid', () => {
        const config = dict({
          'cookies': 'invalid',
        });
        expectAsyncConsoleError(TAG + ' cookies config must be an object');
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Resolve when element is in FIE', () => {
        const config = dict({
          'cookies': {
            'testId': {
              'value': 'test',
            },
          },
        });
        const parent = doc.createElement('div');
        parent.classList.add('i-amphtml-fie');
        doc.body.appendChild(parent);
        parent.appendChild(element);
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Resolve when in viewer', () => {
        const config = dict({
          'cookies': {
            'testId': {
              'value': 'test',
            },
          },
        });
        const mockWin = {
          location: 'https://www-example-com.cdn.ampproject.org',
        };
        const cookieWriter = new CookieWriter(mockWin, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Resolve when disabled', () => {
        const config = dict({
          'cookies': {
            'testId': {
              'value': 'test',
            },
            'enabled': false,
          },
        });
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Resolve with nothing to write', () => {
        const config = dict({
          'cookies': {},
        });
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Resolve with invalid cookieValue (not object)', () => {
        const config = dict({
          'cookies': {
            'testId': 'test',
          },
        });
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Resolve when no value in cookieValue object', () => {
        const config = dict({
          'cookies': {
            'testId': {
              'invalidKey': 'test',
            },
          },
        });
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Ignore reserved keys', () => {
        const config = dict({
          'cookies': {
            'cookiePath': {
              'value': 'test',
            },
          },
        });
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });
    });
  }
);

describes.fakeWin('amp-consent.cookie-writer value', {amp: true}, (env) => {
  let win;
  let clock;

  beforeEach(() => {
    win = env.win;
    clock = fakeTimers.withGlobal(window).install({
      now: new Date('2018-01-01T08:00:00Z'),
    });
  });

  afterEach(() => {
    clock.uninstall();
  });

  it('should read value from only LINKER_PARAM', () => {
    win.location = 'https://example.test/?a=123&b=567';
    const cookieWriter = new CookieWriter(
      win,
      win.document.body,
      dict({
        'cookies': {
          'aCookie': {
            'value': 'QUERY_PARAM(a)',
          },
          'bCookie': {
            'value': 'LINKER_PARAM(b,c)',
          },
          'testId1': {
            'value': 'static',
          },
        },
      })
    );

    env.sandbox
      .stub(cookieWriter.linkerReader_, 'get')
      .callsFake((name, id) => {
        return `${name}-${id}`;
      });

    return cookieWriter.write().then(() => {
      const cookies = win.document.cookie.split(';');
      expect(cookies).to.include('aCookie=QUERY_PARAM(a)');
      expect(cookies).to.include('bCookie=b-c');
      expect(cookies).to.include('testId1=static');
    });
  });

  it('should write cookie under eTLD+1 domain with right exp.', () => {
    win.location = 'https://www.example.test/?a=123&b=567';
    const cookieWriter = new CookieWriter(
      win,
      win.document.body,
      dict({
        'cookies': {
          'aCookie': {
            'value': 'test',
          },
        },
      })
    );
    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=test; path=/; domain=example.test; ' +
          'expires=Tue, 01 Jan 2019 08:00:00 GMT'
      );
    });
  });

  it('should write cookie with custom expiration (number value)', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(
      win,
      win.document.body,
      dict({
        'cookies': {
          'cookieMaxAge': 604800, // 1 week in seconds
          'aCookie': {
            'value': 'testValue',
          },
        },
      })
    );
    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=testValue; path=/; domain=example.test; ' +
          'expires=Mon, 08 Jan 2018 08:00:00 GMT'
      );
    });
  });

  it('should write cookie with custom expiration (string value)', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(
      win,
      win.document.body,
      dict({
        'cookies': {
          'cookieMaxAge': '604800', // 1 week in seconds
          'aCookie': {
            'value': 'testValue',
          },
        },
      })
    );
    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=testValue; path=/; domain=example.test; ' +
          'expires=Mon, 08 Jan 2018 08:00:00 GMT'
      );
    });
  });

  it('should write cookie with custom expiration (decimal value)', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(
      win,
      win.document.body,
      dict({
        'cookies': {
          'cookieMaxAge': 604800.000123,
          'aCookie': {
            'value': 'testValue',
          },
        },
      })
    );

    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=testValue; path=/; domain=example.test; ' +
          'expires=Mon, 08 Jan 2018 08:00:00 GMT'
      );
    });
  });

  it('should write cookie with custom expiration (zero value)', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(
      win,
      win.document.body,
      dict({
        'cookies': {
          'cookieMaxAge': 0,
          'aCookie': {
            'value': 'testValue',
          },
        },
      })
    );
    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=testValue; path=/; domain=example.test; ' +
          'expires=Mon, 01 Jan 2018 08:00:00 GMT'
      );
    });
  });

  it('should write cookie with custom expiration (negative value)', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(
      win,
      win.document.body,
      dict({
        'cookies': {
          'cookieMaxAge': -604800,
          'aCookie': {
            'value': 'testValue',
          },
        },
      })
    );
    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=testValue; path=/; domain=example.test; ' +
          'expires=Mon, 25 Dec 2017 08:00:00 GMT'
      );
    });
  });

  it('should write cookie with default expiration (invalid string value)', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(
      win,
      win.document.body,
      dict({
        'cookies': {
          'cookieMaxAge': 'invalid',
          'aCookie': {
            'value': 'testValue',
          },
        },
      })
    );
    return allowConsoleError(() => {
      return cookieWriter.write().then(() => {
        expect(win.document.lastSetCookieRaw).to.equal(
          'aCookie=testValue; path=/; domain=example.test; ' +
            'expires=Tue, 01 Jan 2019 08:00:00 GMT'
        );
      });
    });
  });

  it('should not write empty cookie', () => {
    win.location = 'https://www.example.test/?a=123&b=567';
    const cookieWriter = new CookieWriter(
      win,
      win.document.body,
      dict({
        'cookies': {
          'cCookie': {
            'value': '',
          },
        },
      })
    );
    return cookieWriter.write().then(() => {
      expect(win.document.cookie).to.equal('');
      expect(win.document.lastSetCookieRaw).to.be.undefined;
    });
  });

  it('should not write cookie if macro is mal-formatted', () => {
    win.location = 'https://www.example.test/?a=123&b=567';
    const cookieWriter = new CookieWriter(
      win,
      win.document.body,
      dict({
        'cookies': {
          'aCookie': {
            'value': 'LINKER_PARAM(b)',
          },
        },
      })
    );
    expectAsyncConsoleError(/LINKER_PARAM requires two params, name and id/);
    return cookieWriter.write().then(() => {
      expect(win.document.cookie).to.equal('');
      expect(win.document.lastSetCookieRaw).to.be.undefined;
    });
  });
});
