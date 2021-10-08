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
