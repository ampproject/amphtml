import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';

import {setCookie} from 'src/cookies';

import {tryAddingCookieParams} from '../amp-a4a';

describes.fakeWin('amp-a4a: cookies', {amp: true}, (env) => {
  let win;

  beforeEach(() => {
    win = env.win;
  });

  function setCookies() {
    setCookie(win, '__gads', '_gads_value', Date.now() + 100_000);
    setCookie(win, '__gpi', '_gpi_value', Date.now() + 100_000);
  }

  it('does not add cookies without consent tuple', () => {
    setCookies();
    const params = {};

    tryAddingCookieParams(null, win, params);

    expect(params.cookie).to.be.undefined;
    expect(params.gpic).to.be.undefined;
    expect(params.cookie_enabled).to.be.undefined;
  });

  it('does not add cookies with unknown consent policy state', () => {
    setCookies();
    const params = {};

    tryAddingCookieParams(
      {
        consentState: CONSENT_POLICY_STATE.UNKNOWN,
        gdprApplies: true,
        consentString: 'consent',
        purposeOne: true,
      },
      win,
      params
    );

    expect(params.cookie).to.be.undefined;
    expect(params.gpic).to.be.undefined;
    expect(params.cookie_enabled).to.be.undefined;
  });

  it('does not add cookies with insufficient consent policy state', () => {
    setCookies();
    const params = {};

    tryAddingCookieParams(
      {
        consentState: CONSENT_POLICY_STATE.INSUFFICIENT,
        gdprApplies: true,
        consentString: 'consent',
        purposeOne: true,
      },
      win,
      params
    );

    expect(params.cookie).to.be.undefined;
    expect(params.gpic).to.be.undefined;
    expect(params.cookie_enabled).to.be.undefined;
  });

  it('does not add cookies when when GDPR applies and no consent string', () => {
    setCookies();
    const params = {};

    tryAddingCookieParams(
      {
        consentState: CONSENT_POLICY_STATE.SUFFICIENT,
        gdprApplies: true,
        consentString: '',
        purposeOne: true,
      },
      win,
      params
    );

    expect(params.cookie).to.be.undefined;
    expect(params.gpic).to.be.undefined;
    expect(params.cookie_enabled).to.be.undefined;
  });

  it('does not add cookie params when GDPR applies and not purposeOne', () => {
    setCookies();
    const params = {};

    tryAddingCookieParams(
      {
        consentState: CONSENT_POLICY_STATE.SUFFICIENT,
        gdprApplies: true,
        consentString: 'consent',
        purposeOne: false,
      },
      win,
      params
    );

    expect(params.cookie).to.be.undefined;
    expect(params.gpic).to.be.undefined;
    expect(params.cookie_enabled).to.be.undefined;
  });

  it('adds cookie params when GDPR applies and consentString present with purposeOne', () => {
    setCookies();
    const params = {};

    tryAddingCookieParams(
      {
        consentState: CONSENT_POLICY_STATE.SUFFICIENT,
        gdprApplies: true,
        consentString: 'consent',
        purposeOne: true,
      },
      win,
      params
    );

    expect(params.cookie).to.equal('_gads_value');
    expect(params.gpic).to.equal('_gpi_value');
    expect(params.cookie_enabled).to.be.undefined;
  });

  it('adds cookie params when GDPR does not apply regardless of other properties', () => {
    setCookies();
    const params = {};

    tryAddingCookieParams(
      {
        consentState: CONSENT_POLICY_STATE.SUFFICIENT,
        gdprApplies: false,
        consentString: '',
        purposeOne: false,
      },
      win,
      params
    );

    expect(params.cookie).to.equal('_gads_value');
    expect(params.gpic).to.equal('_gpi_value');
    expect(params.cookie_enabled).to.be.undefined;
  });

  it('adds cookie_enabled when consent allows and no current cookie exists', () => {
    const params = {};

    tryAddingCookieParams(
      {
        consentState: CONSENT_POLICY_STATE.SUFFICIENT,
        gdprApplies: false,
        consentString: '',
        purposeOne: false,
      },
      win,
      params
    );

    expect(params.cookie).to.be.null;
    expect(params.gpic).to.be.null;
    expect(params.cookie_enabled).to.equal('1');
  });
});
