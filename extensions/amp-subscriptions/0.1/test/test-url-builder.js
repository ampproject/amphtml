import {UrlBuilder} from '../url-builder';

describes.fakeWin('UrlBuilder', {amp: true}, (env) => {
  let ampdoc;
  let readerIdPromise;
  let urlBuilder;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    readerIdPromise = Promise.resolve('reader1');
    urlBuilder = new UrlBuilder(ampdoc, readerIdPromise);
  });

  it('should resolve URL without auth response and no authdata vars', async () => {
    expectAsyncConsoleError(/Access or subsciptions service is not installed/);
    const url = await urlBuilder.buildUrl(
      '?rid=READER_ID&type=AUTHDATA(child.type)',
      /* useAuthData */ false
    );
    expect(url).to.equal('?rid=reader1&type=');
  });

  it('should accept reader_id synonyms', async () => {
    const url = await urlBuilder.buildUrl('?rid=ACCESS_READER_ID');
    expect(url).to.equal('?rid=reader1');
  });

  it('should resolve URL without auth response and with authdata vars', async () => {
    const url = await urlBuilder.buildUrl(
      '?rid=READER_ID&type=AUTHDATA(child.type)',
      /* useAuthData */ true
    );
    expect(url).to.equal('?rid=reader1&type=');
  });

  it('should resolve URL with auth response and no authdata vars', async () => {
    expectAsyncConsoleError(/Access or subsciptions service is not installed/);
    urlBuilder.setAuthResponse({child: {type: 'premium'}});
    const url = await urlBuilder.buildUrl(
      '?rid=READER_ID&type=AUTHDATA(child.type)',
      /* useAuthData */ false
    );
    expect(url).to.equal('?rid=reader1&type=');
  });

  it('should resolve URL with auth response and with authdata vars', async () => {
    urlBuilder.setAuthResponse({child: {type: 'premium'}});
    const url = await urlBuilder.buildUrl(
      '?rid=READER_ID&type=AUTHDATA(child.type)',
      /* useAuthData */ true
    );
    expect(url).to.equal('?rid=reader1&type=premium');
  });

  it('should resolve URL with unknown authdata var', async () => {
    urlBuilder.setAuthResponse({child: {type: 'premium'}});
    const url = await urlBuilder.buildUrl(
      '?rid=READER_ID&type=AUTHDATA(child.type2)',
      /* useAuthData */ true
    );
    expect(url).to.equal('?rid=reader1&type=');
  });

  it('should colect URL vars with auth response and with authdata vars', async () => {
    urlBuilder.setAuthResponse({child: {type: 'premium'}});
    const vars = await urlBuilder.collectUrlVars(
      '?rid=READER_ID&type=AUTHDATA(child.type)',
      /* useAuthData */ true
    );
    expect(vars).to.deep.equal({
      'READER_ID': 'reader1',
      'AUTHDATA(child.type)': 'premium',
    });
  });
});
