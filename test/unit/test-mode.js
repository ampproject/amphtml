import {
  getMode,
  getRtvVersionForTesting,
  resetRtvVersionForTesting,
} from '../../src/mode';
import {parseUrlDeprecated} from '../../src/url';

describes.sandboxed('getMode', {}, () => {
  function getWin(url) {
    const win = {
      location: parseUrlDeprecated(url),
    };
    return win;
  }

  it('should support different html formats for development', () => {
    let url = 'https://www.amp-site.org#development=1';
    expect(getMode(getWin(url)).development).to.be.true;

    url = 'https://www.amp-site.org#development=amp';
    expect(getMode(getWin(url)).development).to.be.true;

    url = 'https://www.amp-site.org#development=amp4email';
    expect(getMode(getWin(url)).development).to.be.true;

    url = 'https://www.amp-site.org#development=amp4ads';
    expect(getMode(getWin(url)).development).to.be.true;

    url = 'https://www.amp-site.org#development=actions';
    expect(getMode(getWin(url)).development).to.be.true;
  });

  it('should not support invalid format for development', () => {
    const url = 'https://www.amp-site.org#development=amp4invalid';
    expect(getMode(getWin(url)).development).to.be.false;
  });
});

describes.sandboxed('getRtvVersion', {}, () => {
  afterEach(() => {
    resetRtvVersionForTesting();
  });

  it('should default to version', () => {
    // $internalRuntimeVersion$ doesn't get replaced during test
    expect(getRtvVersionForTesting(window)).to.equal(
      '01$internalRuntimeVersion$'
    );
  });

  it('should use window.AMP_CONFIG.v', () => {
    const win = {
      AMP_CONFIG: {
        v: '12345',
        test: true,
      },
      location: parseUrlDeprecated('https://acme.org/doc1'),
    };
    expect(getRtvVersionForTesting(win)).to.equal('12345');
  });
});
