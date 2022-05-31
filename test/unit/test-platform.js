import {Platform} from '#service/platform-impl';

describes.sandboxed('Platform', {}, (env) => {
  let isIos;
  let isAndroid;
  let isChrome;
  let isSafari;
  let isFirefox;
  let isOpera;
  let isEdge;
  let isWebKit;
  let isStandalone;
  let majorVersion;
  let iosVersion;
  let iosMajorVersion;
  let userAgent;

  beforeEach(() => {
    isIos = false;
    isAndroid = false;
    isChrome = false;
    isSafari = false;
    isFirefox = false;
    isOpera = false;
    isEdge = false;
    isWebKit = false;
    isStandalone = false;
    majorVersion = 0;
    iosVersion = '';
    iosMajorVersion = null;
    userAgent = '';
  });

  function testUserAgent(userAgentString) {
    const platform = new Platform({navigator: {userAgent: userAgentString}});
    expect(platform.isIos()).to.equal(isIos);
    expect(platform.isAndroid()).to.equal(isAndroid);
    expect(platform.isChrome()).to.equal(isChrome);
    expect(platform.isSafari()).to.equal(isSafari);
    expect(platform.isFirefox()).to.equal(isFirefox);
    expect(platform.isOpera()).to.equal(isOpera);
    expect(platform.isEdge()).to.equal(isEdge);
    expect(platform.isWebKit()).to.equal(isWebKit);
    expect(platform.getMajorVersion()).to.equal(majorVersion);
    expect(platform.getIosVersionString()).to.equal(iosVersion);
    expect(platform.getIosMajorVersion()).to.equal(iosMajorVersion);
  }

  function testStandalone(userAgentString, standAloneBoolean) {
    const platform = new Platform({
      navigator: {
        standalone: standAloneBoolean,
        userAgent: userAgentString,
      },
      matchMedia: env.sandbox.stub().returns({matches: true}),
    });
    expect(platform.isStandalone()).to.equal(isStandalone);
  }

  it('should tolerate empty or null', () => {
    testUserAgent(null);
    testUserAgent('');
    testUserAgent(' ');
    testStandalone(null, null);
    testStandalone('', null);
    testStandalone(' ', null);
  });

  it('iPhone 6 Plus v8', () => {
    isIos = true;
    isSafari = true;
    isWebKit = true;
    majorVersion = 8;
    iosVersion = '8.0';
    iosMajorVersion = 8;
    isStandalone = true;
    userAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X)' +
      ' AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0' +
      ' Mobile/12A4345d Safari/600.1.4';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });

  it('iPhone 6 Plus v9', () => {
    isIos = true;
    isSafari = true;
    isWebKit = true;
    majorVersion = 9;
    iosVersion = '9.3';
    iosMajorVersion = 9;
    isStandalone = true;
    userAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 9_3 like Mac OS X)' +
      ' AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0' +
      ' Mobile/13E230 Safari/601.1';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });

  it('iPhone 6 Plus no version', () => {
    isIos = true;
    isSafari = true;
    isWebKit = true;
    majorVersion = 9;
    iosVersion = '9.3';
    iosMajorVersion = 9;
    isStandalone = true;
    userAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 9_3 like Mac OS X)' +
      ' AppleWebKit/601.1.46 (KHTML, like Gecko)' +
      ' Mobile/13E230 Safari/601.1';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });

  it('iPhone ios 10.2.1', () => {
    isIos = true;
    isSafari = true;
    isWebKit = true;
    majorVersion = 10;
    iosVersion = '10.2.1';
    iosMajorVersion = 10;
    isStandalone = true;
    userAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 10_2_1 like Mac OS X)' +
      ' AppleWebKit/602.4.6 (KHTML, like Gecko) Version/10.0' +
      ' Mobile/14D27 Safari/602.1';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });

  it('iPad 2', () => {
    isIos = true;
    isSafari = true;
    isWebKit = true;
    majorVersion = 7;
    iosVersion = '7.0';
    iosMajorVersion = 7;
    isStandalone = true;
    userAgent =
      'Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X)' +
      ' AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0' +
      ' Mobile/11A465 Safari/9537.53';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });

  it('iPhone ios 10.2, Chrome ios', () => {
    isIos = true;
    isChrome = true;
    isWebKit = true;
    majorVersion = 56;
    iosVersion = '10.2';
    iosMajorVersion = 10;
    isStandalone = true;
    userAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 10_2 like Mac OS X)' +
      ' AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.73' +
      ' Mobile/16D32 Safari/602.1';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });

  it('Desktop Safari', () => {
    isSafari = true;
    isWebKit = true;
    majorVersion = 7;
    userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) ' +
      'AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 ' +
      'Safari/7046A194A';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });

  it('Desktop Safari 12', () => {
    isSafari = true;
    isWebKit = true;
    majorVersion = 12;
    userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 ' +
      'Safari/605.1.15';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });

  it('Nexus 6 Chrome', () => {
    isAndroid = true;
    isChrome = true;
    isWebKit = true;
    majorVersion = 44;
    isStandalone = true;
    userAgent =
      'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E)' +
      ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.20' +
      ' Mobile Safari/537.36';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });

  it('Pixel Chrome 61', () => {
    isAndroid = true;
    isChrome = true;
    isWebKit = true;
    majorVersion = 61;
    isStandalone = true;
    userAgent =
      'Mozilla/5.0 (Linux; Android 8.0.0; Pixel XL Build/OPR6.' +
      '170623.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163' +
      '.98 Mobile Safari/537.36';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });

  it('Firefox', () => {
    isFirefox = true;
    majorVersion = 40;
    userAgent =
      'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) ' +
      'Gecko/20100101 Firefox/40.1';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });

  it('Firefox ios', () => {
    isIos = true;
    isFirefox = true;
    isWebKit = true;
    majorVersion = 7;
    iosVersion = '10.3.1';
    iosMajorVersion = 10;
    isStandalone = true;
    userAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X)' +
      ' AppleWebKit/603.1.30 (KHTML, like Gecko) FxiOS/7.5b3349' +
      ' Mobile/14E304 Safari/603.1.30';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });

  it('Opera android', () => {
    isOpera = true;
    majorVersion = 42;
    isAndroid = true;
    isWebKit = true;
    userAgent =
      'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MTC19T)' +
      ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.91 Mobile' +
      ' Safari/537.36 OPR/42.7.2246.114996';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });

  it('Opera ios', () => {
    isIos = true;
    isOpera = true;
    isWebKit = true;
    majorVersion = 14;
    iosVersion = '10.3.2';
    iosMajorVersion = 10;
    isStandalone = true;
    userAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_2 like Mac OS X)' +
      ' AppleWebKit/603.2.4 (KHTML, like Gecko) OPiOS/14.0.0.104835' +
      ' Mobile/14F89 Safari/9537.53';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });

  it('Edge', () => {
    isEdge = true;
    majorVersion = 12;
    userAgent =
      'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36' +
      ' (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36' +
      ' Edge/12.10136';
    testUserAgent(userAgent);
    testStandalone(userAgent, isStandalone);
  });
});
