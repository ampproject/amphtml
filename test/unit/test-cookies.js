import * as fakeTimers from '@sinonjs/fake-timers';

import {BASE_CID_MAX_AGE_MILLIS} from '#service/cid-impl';

import {
  getCookie,
  getHighestAvailableDomain,
  setCookie,
} from '../../src/cookies';

describes.fakeWin('test-cookies', {amp: true}, (env) => {
  let win;
  let clock;
  let doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    clock = fakeTimers.withGlobal(window).install({
      now: new Date('2018-01-01T08:00:00Z'),
    });
  });

  afterEach(() => {
    clock.uninstall();
  });

  it('should return null for no cookie, malformed, or not found', () => {
    expect(doc.cookie).to.equal('');
    expect(getCookie(win, 'c1')).to.be.null;
    expect(getCookie(win, 'c1')).to.be.null;
    doc.cookie = 'c1';
    expect(getCookie(win, 'c1')).to.be.null;
    doc.cookie = 'e2=1';
    expect(getCookie(win, 'c1')).to.be.null;
  });

  it('should return value when found', () => {
    doc.cookie = 'c1=1';
    expect(getCookie(win, 'c1')).to.equal('1');
    doc.cookie = ' c2 = 2 ';
    expect(doc.cookie).to.equal('c1=1; c2 = 2 ');
    expect(getCookie(win, 'c1')).to.equal('1');
    expect(getCookie(win, 'c2')).to.equal('2');
  });

  it('should return value for an escaped cookie name', () => {
    doc.cookie = 'c%26=1';
    expect(doc.cookie).to.equal('c%26=1');
    expect(getCookie(win, 'c&')).to.equal('1');
  });

  it('should return an unescaped value', () => {
    doc.cookie = 'c1=1%26';
    expect(doc.cookie).to.equal('c1=1%26');
    expect(getCookie(win, 'c1')).to.equal('1&');
  });

  it('should write the cookie', () => {
    setCookie(win, 'c&1', 'v&1', Date.now() + BASE_CID_MAX_AGE_MILLIS);
    expect(doc.lastSetCookieRaw).to.equal(
      'c%261=v%261; path=/; expires=Tue, 01 Jan 2019 08:00:00 GMT'
    );
    expect(doc.cookie).to.equal('c%261=v%261');
  });

  it('should respect the secure option', () => {
    const date = Date.now() + BASE_CID_MAX_AGE_MILLIS;
    const utcDate = new Date(date).toUTCString();

    setCookie(win, 'name', 'val', date, {secure: 'true'});
    expect(doc.lastSetCookieRaw).to.equal(
      `name=val; path=/; expires=${utcDate}; Secure`
    );
    expect(doc.cookie).to.equal('name=val');
  });

  it('getHighestAvailableDomain without meta tag', () => {
    // Proxy Origin
    win.location = 'https://foo-bar.cdn.ampproject.org/c/foo.bar.com';
    expect(getHighestAvailableDomain(win)).to.be.null;

    win.location = 'https://bar.com';
    expect(getHighestAvailableDomain(win)).to.equal('bar.com');
    win.location = 'https://bar.net';
    expect(getHighestAvailableDomain(win)).to.equal('bar.net');
    win.location = 'https://foo.bar.com';
    expect(getHighestAvailableDomain(win)).to.equal('bar.com');
    doc.publicSuffixList = ['bar.com'];
    win.location = 'https://bar.com';
    expect(getHighestAvailableDomain(win)).to.be.null;
    win.location = 'https://bar.net';
    expect(getHighestAvailableDomain(win)).to.equal('bar.net');
    win.location = 'https://foo.bar.com';
    expect(getHighestAvailableDomain(win)).to.equal('foo.bar.com');
    expect(doc.cookie).to.equal('');

    // Special case, has test cookie name conflict
    win.location = 'https://foo.bar.com';
    doc.cookie = '-amp-cookie-test-tmp=test';
    expect(getHighestAvailableDomain(win)).to.equal('foo.bar.com');
    expect(doc.cookie).to.equal('-amp-cookie-test-tmp=test');
  });

  it('getHigestAvaibleDomain in valid meta tag', () => {
    win.location = 'https://abc.foo.bar.com';
    expect(getHighestAvailableDomain(win)).to.equal('bar.com');
    let meta = doc.createElement('meta');
    meta.setAttribute('name', 'amp-cookie-scope');
    meta.setAttribute('content', 'foo.bar.com');
    doc.head.appendChild(meta);
    expect(getHighestAvailableDomain(win)).to.equal('foo.bar.com');

    meta.remove();
    win.location = 'https://abc-foo-bar.cdn.ampproject.org/c/foo.bar.com';
    expect(getHighestAvailableDomain(win)).to.be.null;
    meta = doc.createElement('meta');
    meta.setAttribute('name', 'amp-cookie-scope');
    meta.setAttribute('content', 'foo.bar.com');
    doc.head.appendChild(meta);
    expect(getHighestAvailableDomain(win)).to.equal('foo.bar.com');
  });

  it('getHigestAvaibleDomain with invalid meta tag', () => {
    win.location = 'https://foo.bar.com';
    expect(getHighestAvailableDomain(win)).to.equal('bar.com');
    let meta = doc.createElement('meta');
    meta.setAttribute('name', 'amp-cookie-scope');
    meta.setAttribute('content', 'invalid.com');
    doc.head.appendChild(meta);
    expect(getHighestAvailableDomain(win)).to.equal('foo.bar.com');

    meta.remove();
    win.location = 'https://foo-bar.cdn.ampproject.org/c/foo.bar.com';
    expect(getHighestAvailableDomain(win)).to.be.null;
    meta = doc.createElement('meta');
    meta.setAttribute('name', 'amp-cookie-scope');
    meta.setAttribute('content', 'invalid.com');
    doc.head.appendChild(meta);
    expect(getHighestAvailableDomain(win)).to.equal('foo.bar.com');
  });

  it('should write the cookie to the right domain on origin', () => {
    function test(url, targetDomain, opt_allowProxyOrigin) {
      expect(doc.cookie).to.equal('');
      win.location = url;
      setCookie(win, 'c&1', 'v&1', Date.now() + BASE_CID_MAX_AGE_MILLIS, {
        highestAvailableDomain: true,
        allowOnProxyOrigin: opt_allowProxyOrigin,
      });
      expect(doc.lastSetCookieRaw).to.equal(
        `c%261=v%261; path=/; domain=${targetDomain}; ` +
          'expires=Tue, 01 Jan 2019 08:00:00 GMT'
      );
      expect(doc.cookie).to.equal('c%261=v%261');
      // Erase cookie
      setCookie(win, 'c&1', 'v&1', Date.now() - 1000, {
        highestAvailableDomain: true,
        allowOnProxyOrigin: opt_allowProxyOrigin,
      });
      expect(doc.cookie).to.equal('');
    }

    //example.com
    test('https://www.example.com/test.html', 'example.com');
    test('https://123.www.example.com/test.html', 'example.com');
    test('https://example.com/test.html', 'example.com');
    test('https://www.example.net', 'example.net');
    doc.publicSuffixList = ['example.com'];
    test('https://123.www.example.com/test.html', 'www.example.com');
  });

  it('write cookie to right domain on proxy', () => {
    win.location = 'https://foo.cdn.ampproject.org/test.html';
    setCookie(win, 'c&1', 'v&1', Date.now() + BASE_CID_MAX_AGE_MILLIS, {
      domain: 'foo.cdn.ampproject.org',
      allowOnProxyOrigin: true,
    });
    expect(doc.lastSetCookieRaw).to.equal(
      `c%261=v%261; path=/; domain=foo.cdn.ampproject.org; ` +
        'expires=Tue, 01 Jan 2019 08:00:00 GMT'
    );
    expect(doc.cookie).to.equal('c%261=v%261');

    // Fail if allowOnProxyOrigin is false
    expect(() => {
      allowConsoleError(() => {
        setCookie(win, 'c&1', 'v&1', Date.now() + BASE_CID_MAX_AGE_MILLIS, {});
      });
    }).to.throw(/Should never attempt to set cookie on proxy origin\: c\&1/);

    win.location = 'https://CDN.ampproject.org/test.html';
    expect(() => {
      allowConsoleError(() => {
        setCookie(win, 'c&1', 'v&1', Date.now() + BASE_CID_MAX_AGE_MILLIS, {});
      });
    }).to.throw(/Should never attempt to set cookie on proxy origin\: c\&1/);

    win.location = 'https://foo.bar.cdn.ampproject.org/test.html';
    expect(() => {
      allowConsoleError(() => {
        setCookie(win, 'c&1', 'v&1', Date.now() + BASE_CID_MAX_AGE_MILLIS, {});
      });
    }).to.throw(/in depth check/);

    win.location = 'http://&&&.CDN.ampproject.org/test.html';
    expect(() => {
      allowConsoleError(() => {
        setCookie(win, 'c&1', 'v&1', Date.now() + BASE_CID_MAX_AGE_MILLIS, {});
      });
    }).to.throw(/in depth check/);

    // Can't use higestAvailableDomain when allowOnProxyOrigin
    expect(() => {
      allowConsoleError(() => {
        setCookie(win, 'c&1', 'v&1', Date.now() + BASE_CID_MAX_AGE_MILLIS, {
          allowOnProxyOrigin: true,
          highestAvailableDomain: true,
        });
      });
    }).to.throw(/specify domain explicitly/);

    // Cannot write to 'ampproject.org'
    setCookie(win, 'c&1', 'v&1', Date.now() + BASE_CID_MAX_AGE_MILLIS, {
      domain: 'ampproject.org',
      allowOnProxyOrigin: true,
    });
    expect(doc.lastSetCookieRaw).to.equal(
      `c%261=delete; path=/; domain=ampproject.org; ` +
        'expires=Thu, 01 Jan 1970 00:00:00 GMT'
    );
    expect(doc.cookie).to.equal('');
  });
});
