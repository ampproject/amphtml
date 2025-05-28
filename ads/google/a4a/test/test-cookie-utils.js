import {
  AMP_GFP_SET_COOKIES_HEADER_NAME,
  handleCookieOptOutPostMessage,
  maybeSetCookieFromAdResponse,
} from '#ads/google/a4a/cookie-utils';

import {getCookie, setCookie} from 'src/cookies';

describes.fakeWin('#maybeSetCookieFromAdResponse', {amp: true}, (env) => {
  it('should set cookies based on ad response header', () => {
    maybeSetCookieFromAdResponse(env.win, {
      headers: {
        has: (header) => {
          return header === AMP_GFP_SET_COOKIES_HEADER_NAME;
        },
        get: (header) => {
          if (header !== AMP_GFP_SET_COOKIES_HEADER_NAME) {
            return;
          }

          return JSON.stringify({
            'cookie': [
              {
                'version': 1,
                'value': 'val1',
                'domain': 'foo.com',
                'expiration': Date.now() + 100_000,
              },
              {
                'version': 2,
                'value': 'val2',
                'domain': 'foo.com',
                'expiration': Date.now() + 100_000,
              },
            ],
          });
        },
      },
    });

    expect(getCookie(env.win, '__gads')).to.equal('val1');
    expect(getCookie(env.win, '__gpi')).to.equal('val2');
  });

  it('should not throw for malformed JSON', () => {
    expect(
      () =>
        void maybeSetCookieFromAdResponse(env.win, {
          headers: {
            has: (header) => {
              return header === AMP_GFP_SET_COOKIES_HEADER_NAME;
            },
            get: (header) => {
              if (header !== AMP_GFP_SET_COOKIES_HEADER_NAME) {
                return;
              }

              return JSON.stringify({});
            },
          },
        })
    ).not.to.throw();
  });
});

describes.fakeWin('#handleCookieOptOutPostMessage', {amp: true}, (env) => {
  it('should clear cookies as specified in creative response, with opt out', () => {
    setCookie(env.win, '__gads', '__gads_val', Date.now() + 100_000);
    setCookie(env.win, '__gpi', '__gpi_val', Date.now() + 100_000);
    expect(getCookie(env.win, '__gads')).to.equal('__gads_val');
    expect(getCookie(env.win, '__gpi')).to.equal('__gpi_val');

    handleCookieOptOutPostMessage(env.win, {
      data: JSON.stringify({
        googMsgType: 'gpi-uoo',
        userOptOut: true,
        clearAdsData: true,
      }),
    });

    expect(getCookie(env.win, '__gpi_opt_out')).to.equal('1');
    expect(getCookie(env.win, '__gads')).to.be.null;
    expect(getCookie(env.win, '__gpi')).to.be.null;
  });

  it('should clear cookies as specified in creative response, without opt out', () => {
    setCookie(env.win, '__gads', '__gads_val', Date.now() + 100_000);
    setCookie(env.win, '__gpi', '__gpi_val', Date.now() + 100_000);
    expect(getCookie(env.win, '__gads')).to.equal('__gads_val');
    expect(getCookie(env.win, '__gpi')).to.equal('__gpi_val');

    handleCookieOptOutPostMessage(env.win, {
      data: JSON.stringify({
        googMsgType: 'gpi-uoo',
        userOptOut: false,
        clearAdsData: true,
      }),
    });

    expect(getCookie(env.win, '__gpi_opt_out')).to.equal('0');
    expect(getCookie(env.win, '__gads')).to.be.null;
    expect(getCookie(env.win, '__gpi')).to.be.null;
  });

  it('should not clear cookies as specified in creative response, without opt out or clear ads', () => {
    setCookie(env.win, '__gads', '__gads_val', Date.now() + 100_000);
    setCookie(env.win, '__gpi', '__gpi_val', Date.now() + 100_000);
    expect(getCookie(env.win, '__gads')).to.equal('__gads_val');
    expect(getCookie(env.win, '__gpi')).to.equal('__gpi_val');

    handleCookieOptOutPostMessage(env.win, {
      data: JSON.stringify({
        googMsgType: 'gpi-uoo',
        userOptOut: false,
        clearAdsData: false,
      }),
    });

    expect(getCookie(env.win, '__gpi_opt_out')).to.equal('0');
    expect(getCookie(env.win, '__gads')).to.equal('__gads_val');
    expect(getCookie(env.win, '__gpi')).to.equal('__gpi_val');
  });
});
