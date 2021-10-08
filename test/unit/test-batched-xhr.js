import {Services} from '#service';
import {batchedXhrServiceForTesting} from '#service/batched-xhr-impl';

describes.sandboxed('BatchedXhr', {}, (env) => {
  beforeEach(() => {
    env.sandbox.stub(Services, 'ampdocServiceFor').returns({
      isSingleDoc: () => false,
    });
  });

  describes.fakeWin('#fetch', {}, (env) => {
    const TEST_OBJECT = {a: {b: [{c: 2}, {d: 4}]}};
    const TEST_RESPONSE = JSON.stringify(TEST_OBJECT);
    const textInit = {headers: {'Accept': 'text/plain'}};
    const jsonInit = {headers: {'Accept': 'application/json'}};
    let xhr;
    let fetchStub;

    beforeEach(() => {
      xhr = batchedXhrServiceForTesting(env.win);
      fetchStub = env.sandbox
        .stub(xhr, 'fetchAmpCors_')
        .callsFake(() => Promise.resolve(new Response(TEST_RESPONSE)));
    });

    it('should fetch a generic request once for identical URLs', () => {
      return Promise.all([
        xhr.fetch('/get?k=v1').then((response) => response.text()),
        xhr.fetch('/get?k=v1').then((response) => response.text()),
        xhr.fetch('/get?k=v1').then((response) => response.text()),
      ]).then((results) => {
        expect(fetchStub).to.be.calledOnce;
        expect(results[0]).to.equal(TEST_RESPONSE);
        expect(results[1]).to.equal(TEST_RESPONSE);
        expect(results[2]).to.equal(TEST_RESPONSE);
      });
    });

    it('should fetch once for a relative and absolute URL that point to the same location.', async () => {
      const originUrl = 'https://testwebsite.com';
      const cdnUrl =
        'https://testwebsite-com.cdn.ampproject.org/v/s/testwebsite.com/hello-world';
      env.win.location.href = cdnUrl;

      await Promise.all([
        xhr.fetch(`${originUrl}/get?k=v1`),
        xhr.fetch('/get?k=v1'),
      ]);

      expect(fetchStub).to.be.calledOnce;
    });

    it(
      'should separately cache generic fetches with identical URLs' +
        'but different "Accept" headers',
      () => {
        return Promise.all([
          xhr.fetch('/get?k=v1', textInit).then((response) => response.text()),
          xhr.fetch('/get?k=v1', textInit).then((response) => response.text()),
          xhr.fetch('/get?k=v1', jsonInit).then((response) => response.json()),
          xhr.fetch('/get?k=v1', jsonInit).then((response) => response.json()),
        ]).then((results) => {
          expect(fetchStub).to.be.calledTwice;
          expect(results[0]).to.equal(TEST_RESPONSE);
          expect(results[1]).to.equal(TEST_RESPONSE);
          expect(results[2]).to.jsonEqual(TEST_OBJECT);
          expect(results[3]).to.jsonEqual(TEST_OBJECT);
        });
      }
    );

    it('should cache the same as the convenience methods', () => {
      return Promise.all([
        xhr.fetch('/get?k=v1', jsonInit).then((response) => response.json()),
        xhr.fetchJson('/get?k=v1').then((res) => res.json()),
      ]).then((results) => {
        expect(fetchStub).to.be.calledOnce;
        expect(results[0]).to.jsonEqual(TEST_OBJECT);
        expect(results[1]).to.jsonEqual(TEST_OBJECT);
      });
    });
  });

  describes.fakeWin('#fetchJson', {}, (env) => {
    const TEST_OBJECT = {a: {b: [{c: 2}, {d: 4}]}};
    const TEST_RESPONSE = JSON.stringify(TEST_OBJECT);
    const init = {
      status: 200,
      headers: {
        'content-type': 'application-json',
      },
    };
    let xhr;
    let fetchStub;

    beforeEach(() => {
      xhr = batchedXhrServiceForTesting(env.win);
      fetchStub = env.sandbox
        .stub(xhr, 'fetchAmpCors_')
        .callsFake(() => Promise.resolve(new Response(TEST_RESPONSE, init)));
    });

    it('should fetch JSON GET requests once for identical URLs', () => {
      return Promise.all([
        xhr.fetchJson('/get?k=v1').then((res) => res.json()),
        xhr.fetchJson('/get?k=v1').then((res) => res.json()),
      ]).then((results) => {
        expect(fetchStub).to.be.calledOnce;
        expect(results[0]).to.jsonEqual(TEST_OBJECT);
        expect(results[1]).to.jsonEqual(TEST_OBJECT);
      });
    });

    it('should not be affected by fragments passed in the URL', () => {
      return Promise.all([
        xhr.fetchJson('/get?k=v1#a.b[0].c').then((res) => res.json()),
        xhr.fetchJson('/get?k=v1#a.b[1].d').then((res) => res.json()),
      ]).then((results) => {
        expect(fetchStub).to.be.calledOnce;
        expect(results[0]).to.jsonEqual(TEST_OBJECT);
        expect(results[1]).to.jsonEqual(TEST_OBJECT);
      });
    });

    it('should not cache for POST requests', () => {
      return Promise.all([
        xhr.fetchJson('/get?k=v1', {method: 'POST', body: {}}),
        xhr.fetchJson('/get?k=v1', {method: 'POST', body: {}}),
      ]).then(() => {
        expect(fetchStub).to.be.calledTwice;
      });
    });
  });

  describes.fakeWin('#fetchText', {}, (env) => {
    const TEST_RESPONSE = 'Hello, world!';
    let xhr;
    let fetchStub;

    beforeEach(() => {
      xhr = batchedXhrServiceForTesting(env.win);
      fetchStub = env.sandbox
        .stub(xhr, 'fetchAmpCors_')
        .callsFake(() => Promise.resolve(new Response(TEST_RESPONSE)));
    });

    it('should fetch text GET requests once for identical URLs', () => {
      return Promise.all([
        xhr.fetchText('/get?k=v1').then((res) => res.text()),
        xhr.fetchText('/get?k=v1').then((res) => res.text()),
      ]).then((results) => {
        expect(fetchStub).to.be.calledOnce;
        expect(results[0]).to.equal(TEST_RESPONSE);
        expect(results[1]).to.equal(TEST_RESPONSE);
      });
    });

    it('should not cache for POST requests', () => {
      return Promise.all([
        xhr.fetchText('/get?k=v1', {method: 'POST', body: {}}),
        xhr.fetchText('/get?k=v1', {method: 'POST', body: {}}),
      ]).then(() => {
        expect(fetchStub).to.be.calledTwice;
      });
    });
  });
});
