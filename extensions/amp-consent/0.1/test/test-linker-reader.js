import {mockWindowInterface} from '#testing/helpers/service';

import {ConsentLinkerReader} from '../linker-reader';

describes.realWin('LinkerReader', {amp: true}, (env) => {
  let linkerReader;
  let mockWin;
  let url;

  beforeEach(() => {
    env.sandbox.useFakeTimers(1533329483292);
    env.sandbox.stub(Date.prototype, 'getTimezoneOffset').returns(420);
    mockWin = mockWindowInterface(env.sandbox);
    mockWin.getUserAgent.returns(
      'Mozilla/5.0 (X11; Linux x86_64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 ' +
        'Safari/537.36'
    );
    mockWin.getUserLanguage.returns('en-US');
    mockWin.location = {
      href: 'https://example.com?testlinker=1*1f66u1p*key1*dmFsdWUx',
      origin: 'https://example.com',
      pathname: '',
      search: '?testlinker=1*1f66u1p*key1*dmFsdWUx',
      hash: '',
    };
    mockWin.history = {
      replaceState: (unusedVar1, unusedVar2, newHref) => {
        const a = document.createElement('a');
        a.href = newHref;
        mockWin.location.href = newHref;
        mockWin.location.origin = a.origin;
        mockWin.location.pathname = a.pathname;
        mockWin.location.search = a.search;
        mockWin.location.hash = a.hash;
      },
    };
    linkerReader = new ConsentLinkerReader(mockWin);
  });

  it('return null when no params', () => {
    expectAsyncConsoleError(/LINKER_PARAM requires two params, name and id/);
    expect(linkerReader.get('testlinker')).to.be.null;
    expect(mockWin.location.href).to.equal(
      'https://example.com?testlinker=1*1f66u1p*key1*dmFsdWUx'
    );
  });

  it('return null when no linker name', () => {
    expect(linkerReader.get('nolinker', 'id')).to.be.null;
    expect(mockWin.location.href).to.equal(
      'https://example.com?testlinker=1*1f66u1p*key1*dmFsdWUx'
    );
  });

  it('return null when linker name value is invalid', () => {
    url = 'https://example.com?testlinker=1*123*key*error';
    expectAsyncConsoleError(/LINKER_PARAM value checksum not valid/);
    mockWin.history.replaceState(null, null, url);
    expect(linkerReader.get('testlinker', 'key')).to.be.null;
    expect(mockWin.location.href).to.equal(url);
  });

  it('return null when no linker id value', () => {
    const url = 'https://example.com?testlinker=1*1f66u1p*key1*dmFsdWUx';
    mockWin.history.replaceState(null, null, url);
    expect(linkerReader.get('testlinker', 'key2')).to.be.null;
    expect(mockWin.location.href).to.equal(url);
  });

  it('should not remove linker_param from url', () => {
    url =
      'https://example.com?a=1&b=2&testlinker=1*1f66u1p*key1*dmFsdWUx' +
      '&c&testlinker2=1*1f66u1p*key1*dmFsdWUx&d=2#hash';
    mockWin.history.replaceState(null, null, url);
    expect(linkerReader.get('testlinker', 'key1')).to.equal('value1');
    expect(mockWin.location.href).to.equal(url);
    expect(linkerReader.get('testlinker2', 'key1')).to.equal('value1');
    expect(mockWin.location.href).to.equal(url);
  });

  it('return correct id value', () => {
    url =
      'https://example.com?test=1*1f66u1p*key1*dmFsdWUx&var=foo' +
      '&test2=1*1m48hbv*cid*MTIzNDU.*ref*aHR0cHM6Ly93d3cuZXhhbXBsZS5jb20.';
    mockWin.history.replaceState(null, null, url);
    expect(linkerReader.get('test', 'key1')).to.equal('value1');
    expect(linkerReader.get('test2', 'cid')).to.equal('12345');
    expect(linkerReader.get('test2', 'ref')).to.equal(
      'https://www.example.com'
    );
    expect(mockWin.location.href).to.equal(url);
  });

  it('returns same value when reading the same id', () => {
    url = 'https://example.com?test=1*1f66u1p*key1*dmFsdWUx&var=foo';
    mockWin.history.replaceState(
      null,
      null,
      'https://example.com?test=1*1f66u1p*key1*dmFsdWUx&var=foo'
    );
    expect(linkerReader.get('test', 'key1')).to.equal('value1');
    expect(linkerReader.get('test', 'key1')).to.equal('value1');
    expect(mockWin.location.href).to.equal(url);
  });
});
