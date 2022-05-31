import * as fakeTimers from '@sinonjs/fake-timers';

import {stubService} from '#testing/helpers/service';

import * as cookie from '../../../../src/cookies';
import {CookieWriter} from '../cookie-writer';
import {installLinkerReaderService} from '../linker-reader';
import {installSessionServiceForTesting} from '../session-manager';
import {installVariableServiceForTesting} from '../variables';

const TAG = '[amp-analytics/cookie-writer]';

describes.realWin(
  'amp-analytics.cookie-writer',
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
      installVariableServiceForTesting(doc);
      installSessionServiceForTesting(doc);
      installLinkerReaderService(win);
    });

    describe('write with condition', () => {
      let expandAndWriteSpy;

      it('Resolve when no config', () => {
        const config = {};
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Resovle when config is invalid', () => {
        const config = {
          'cookies': 'invalid',
        };
        expectAsyncConsoleError(TAG + ' cookies config must be an object');
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Resolve when element is in FIE', () => {
        const config = {
          'cookies': {
            'testId': {
              'value': 'QUERY_PARAM(test)',
            },
          },
        };
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
        const config = {
          'cookies': {
            'testId': {
              'value': 'QUERY_PARAM(test)',
            },
          },
        };
        const mockWin = {
          location: 'https://www-example-com.cdn.ampproject.org',
        };
        installLinkerReaderService(mockWin);
        installSessionServiceForTesting(doc);
        installVariableServiceForTesting(doc);
        const cookieWriter = new CookieWriter(mockWin, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Resolve when in inabox ad', () => {
        env.win.__AMP_MODE.runtime = 'inabox';
        const config = {
          'cookies': {
            'testId': {
              'value': 'QUERY_PARAM(test)',
            },
          },
        };
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Resolve when disabled', () => {
        const config = {
          'cookies': {
            'testId': {
              'value': 'QUERY_PARAM(test)',
            },
            'enabled': false,
          },
        };
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Resolve with nothing to write', () => {
        const config = {
          'cookies': {},
        };
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Resolve with invalid cookieValue (not object)', () => {
        const config = {
          'cookies': {
            'testId': 'QUERY_PARAM(test)',
          },
        };
        expectAsyncConsoleError(
          TAG + ' cookieValue must be configured in an object'
        );
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Resolve when no value in cookieValue object', () => {
        const config = {
          'cookies': {
            'testId': {
              'novalue': 'QUERY_PARAM(test)',
            },
          },
        };
        expectAsyncConsoleError(
          TAG + ' value is required in the cookieValue object'
        );
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });

      it('Ignore reserved keys', () => {
        const config = {
          'cookies': {
            'cookiePath': {
              'value': 'QUERY_PARAM(test)',
            },
          },
        };
        const cookieWriter = new CookieWriter(win, element, config);
        expandAndWriteSpy = env.sandbox.spy(cookieWriter, 'expandAndWrite_');
        return cookieWriter.write().then(() => {
          expect(expandAndWriteSpy).to.not.be.called;
        });
      });
    });
  }
);

describes.fakeWin('amp-analytics.cookie-writer value', {amp: true}, (env) => {
  let win;
  let clock;
  let doc;
  beforeEach(() => {
    win = env.win;
    doc = env.ampdoc;
    clock = fakeTimers.withGlobal(window).install({
      now: new Date('2018-01-01T08:00:00Z'),
    });
    installVariableServiceForTesting(doc);
    installSessionServiceForTesting(doc);
    installLinkerReaderService(win);
  });

  afterEach(() => {
    clock.uninstall();
  });

  it('should read value from QUERY_PARAM and LINKER_PARAM', () => {
    stubService(
      env.sandbox,
      win,
      'amp-analytics-linker-reader',
      'get'
    ).callsFake((name, id) => {
      return `${name}-${id}`;
    });
    win.location = 'https://example.test/?a=123&b=567';
    const cookieWriter = new CookieWriter(win, win.document.body, {
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
        'testId2': {
          'value': '$SUBSTR(QUERY_PARAM(a),1)-suf',
        },
        'testId3': {
          'value': 'pre-TIMESTAMPQUERY_PARAM(abc)',
        },
      },
    });
    return cookieWriter.write().then(() => {
      const cookies = win.document.cookie.split(';');
      expect(cookies).to.include('aCookie=123');
      expect(cookies).to.include('bCookie=b-c');
      expect(cookies).to.include('testId1=static');
      expect(cookies).to.include('testId2=23-suf');
      expect(cookies).to.include('testId3=pre-1514793600000');
    });
  });

  it('should write cookie under eTLD+1 domain with right exp.', () => {
    win.location = 'https://www.example.test/?a=123&b=567';
    const cookieWriter = new CookieWriter(win, win.document.body, {
      'cookies': {
        'aCookie': {
          'value': 'QUERY_PARAM(a)',
        },
      },
    });
    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=123; path=/; domain=example.test; ' +
          'expires=Tue, 01 Jan 2019 08:00:00 GMT'
      );
    });
  });

  it('should write cookie with custom expiration (number value) and default to SameSite=Lax', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(win, win.document.body, {
      'cookies': {
        'cookieMaxAge': 604800, // 1 week in seconds
        'aCookie': {
          'value': 'testValue',
        },
      },
    });
    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=testValue; path=/; domain=example.test; ' +
          'expires=Mon, 08 Jan 2018 08:00:00 GMT'
      );
    });
  });

  it('should write cookie with the specified sameSite (lowercase S) value', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(win, win.document.body, {
      'cookies': {
        'cookieMaxAge': 604800, // 1 week in seconds
        'sameSite': 'Lax',
        'aCookie': {
          'value': '123',
        },
      },
    });
    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=123; path=/; domain=example.test; ' +
          'expires=Mon, 08 Jan 2018 08:00:00 GMT; SameSite=Lax'
      );
    });
  });

  it('should write cookie with the specified SameSite (capital S) value', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(win, win.document.body, {
      'cookies': {
        'cookieMaxAge': 604800, // 1 week in seconds
        'SameSite': 'Strict',
        'aCookie': {
          'value': '123',
        },
      },
    });
    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=123; path=/; domain=example.test; ' +
          'expires=Mon, 08 Jan 2018 08:00:00 GMT; SameSite=Strict'
      );
    });
  });

  it('should override the sameSite value', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(win, win.document.body, {
      'cookies': {
        'cookieMaxAge': 604800, // 1 week in seconds
        'sameSite': 'Lax',
        'aCookie': {
          'value': '123',
          'sameSite': 'Strict',
        },
      },
    });
    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=123; path=/; domain=example.test; ' +
          'expires=Mon, 08 Jan 2018 08:00:00 GMT; SameSite=Strict'
      );
    });
  });

  it('should append Secure for when sameSite value is "None"', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(win, win.document.body, {
      'cookies': {
        'cookieMaxAge': 604800, // 1 week in seconds
        'aCookie': {
          'value': 'testValue',
          'sameSite': 'None',
        },
      },
    });
    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=testValue; path=/; domain=example.test; ' +
          'expires=Mon, 08 Jan 2018 08:00:00 GMT; SameSite=None; Secure'
      );
    });
  });

  it('should write cookie with custom expiration (string value)', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(win, win.document.body, {
      'cookies': {
        'cookieMaxAge': '604800', // 1 week in seconds
        'aCookie': {
          'value': 'testValue',
        },
      },
    });
    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=testValue; path=/; domain=example.test; ' +
          'expires=Mon, 08 Jan 2018 08:00:00 GMT'
      );
    });
  });

  it('should write cookie with custom expiration (decimal value)', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(win, win.document.body, {
      'cookies': {
        'cookieMaxAge': 604800.000123,
        'aCookie': {
          'value': 'testValue',
        },
      },
    });

    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=testValue; path=/; domain=example.test; ' +
          'expires=Mon, 08 Jan 2018 08:00:00 GMT'
      );
    });
  });

  it('should write cookie with custom expiration (zero value)', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(win, win.document.body, {
      'cookies': {
        'cookieMaxAge': 0,
        'aCookie': {
          'value': 'testValue',
        },
      },
    });
    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=testValue; path=/; domain=example.test; ' +
          'expires=Mon, 01 Jan 2018 08:00:00 GMT'
      );
    });
  });

  it('should write cookie with custom expiration (negative value)', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(win, win.document.body, {
      'cookies': {
        'cookieMaxAge': -604800,
        'aCookie': {
          'value': 'testValue',
        },
      },
    });
    return cookieWriter.write().then(() => {
      expect(win.document.lastSetCookieRaw).to.equal(
        'aCookie=testValue; path=/; domain=example.test; ' +
          'expires=Mon, 25 Dec 2017 08:00:00 GMT'
      );
    });
  });

  it('should write cookie with default expiration (invalid string value)', () => {
    win.location = 'https://www.example.test/';
    const cookieWriter = new CookieWriter(win, win.document.body, {
      'cookies': {
        'cookieMaxAge': 'invalid',
        'aCookie': {
          'value': 'testValue',
        },
      },
    });
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
    const cookieWriter = new CookieWriter(win, win.document.body, {
      'cookies': {
        'cCookie': {
          'value': 'QUERY_PARAM(c)',
        },
      },
    });
    return cookieWriter.write().then(() => {
      expect(win.document.cookie).to.equal('');
      expect(win.document.lastSetCookieRaw).to.be.undefined;
    });
  });

  it('should not write cookie if macro is mal-formatted', () => {
    win.location = 'https://www.example.test/?a=123&b=567';
    const cookieWriter = new CookieWriter(win, win.document.body, {
      'cookies': {
        'aCookie': {
          'value': 'LINKER_PARAM(b)',
        },
      },
    });
    expectAsyncConsoleError(/LINKER_PARAM requires two params, name and id/);
    return cookieWriter.write().then(() => {
      expect(win.document.cookie).to.equal('');
      expect(win.document.lastSetCookieRaw).to.be.undefined;
    });
  });
});
