import {unruly} from '#ads/vendors/unruly';

describes.sandboxed('unruly', {}, () => {
  it('should set unruly publisher config on global', () => {
    const mockGlobal = {};
    const mockData = {
      siteId: 'amp-test',
    };
    const expectedGlobal = {
      unruly: {
        native: {
          siteId: 'amp-test',
        },
      },
    };
    const mockScriptLoader = () => {};
    unruly(mockGlobal, mockData, mockScriptLoader);
    expect(expectedGlobal).to.deep.equal(mockGlobal);
  });

  it('should call loadScript', () => {
    const mockGlobal = {};
    const mockData = {
      siteId: 'amp-test',
    };

    let expectedGlobal;
    let expectedUrl;
    const scriptLoader = (...args) => {
      expectedGlobal = args[0];
      expectedUrl = args[1];
    };
    unruly(mockGlobal, mockData, scriptLoader);
    expect(expectedGlobal).to.equal(mockGlobal);
    expect(expectedUrl).to.equal(
      'https://video.unrulymedia.com/native/native-loader.js'
    );
  });

  it('should throw if siteId is not provided', () => {
    const mockGlobal = {};
    const mockData = {};

    const scriptLoader = () => {};

    allowConsoleError(() => {
      expect(() => unruly(mockGlobal, mockData, scriptLoader)).to.throw();
    });
  });
});
