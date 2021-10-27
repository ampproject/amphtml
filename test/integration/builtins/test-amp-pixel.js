import {AmpPixel} from '#builtins/amp-pixel/amp-pixel';

import {createElementWithAttributes} from '#core/dom';

import {BrowserController, RequestBank} from '#testing/helpers/service';

describes.sandboxed('amp-pixel', {}, function () {
  describes.integration(
    'amp-pixel macro integration test',
    {
      body: `<amp-pixel
    src="${RequestBank.getUrl()}hello-world?title=TITLE&qp=QUERY_PARAM(a)">`,
      params: {
        a: 123,
      },
    },
    (env) => {
      beforeEach(() => {
        const browser = new BrowserController(env.win);
        return browser.waitForElementBuild('amp-pixel');
      });

      afterEach(() => {
        return RequestBank.tearDown();
      });

      it('should expand the TITLE macro', () => {
        return RequestBank.withdraw().then((req) => {
          expect(req.url).to.equal('/hello-world?title=AMP%20TEST&qp=123');
          expect(req.headers.host).to.be.ok;
        });
      });
    }
  );

  describes.integration(
    'amp-pixel nested macro with leading spaces',
    {
      body: `<amp-pixel src="${RequestBank.getUrl()}?nested=QUERY_PARAM(doesNotExist,  1.QUERY_PARAM(a))">`,
      params: {
        a: '1234',
      },
    },
    (env) => {
      beforeEach(() => {
        const browser = new BrowserController(env.win);
        return browser.waitForElementBuild('amp-pixel');
      });

      afterEach(() => {
        return RequestBank.tearDown();
      });

      it('should ignore leading spaces and resolve correctly', () => {
        return RequestBank.withdraw().then((req) => {
          expect(req.url).to.equal('/?nested=1.1234');
          expect(req.headers.host).to.be.ok;
        });
      });
    }
  );

  describes.integration(
    'amp-pixel referrer integration test',
    {
      body: `<amp-pixel src="${RequestBank.getUrl()}">`,
    },
    (env) => {
      beforeEach(() => {
        const browser = new BrowserController(env.win);
        return browser.waitForElementBuild('amp-pixel');
      });

      afterEach(() => {
        return RequestBank.tearDown();
      });

      it('should keep referrer if no referrerpolicy specified', () => {
        return RequestBank.withdraw().then((req) => {
          expect(req.url).to.equal('/');
          expect(req.headers.referer).to.be.ok;
        });
      });
    }
  );

  describes.integration(
    'amp-pixel no-referrer integration test',
    {
      body: `<amp-pixel src="${RequestBank.getUrl()}"
             referrerpolicy="no-referrer">`,
    },
    (env) => {
      beforeEach(() => {
        const browser = new BrowserController(env.win);
        return browser.waitForElementBuild('amp-pixel');
      });

      afterEach(() => {
        return RequestBank.tearDown();
      });

      it('should remove referrer if referrerpolicy=no-referrer', () => {
        return RequestBank.withdraw().then((req) => {
          expect(req.url).to.equal('/');
          expect(req.headers.referer).to.not.be.ok;
        });
      });
    }
  );
});

describes.fakeWin('amp-pixel with img (inabox)', {amp: true}, (env) => {
  it('should not write image', () => {
    const src = 'https://foo.com/tracker/foo';
    const pixelElem = createElementWithAttributes(
      env.win.document,
      'amp-pixel',
      {src, 'i-amphtml-ssr': ''}
    );
    pixelElem.appendChild(
      createElementWithAttributes(env.win.document, 'img', {src})
    );
    env.win.document.body.appendChild(pixelElem);
    env.sandbox.stub(env.ampdoc, 'whenFirstVisible').returns(Promise.resolve());
    const pixel = new AmpPixel(pixelElem);
    pixel.buildCallback();
    expect(pixelElem.querySelectorAll('img').length).to.equal(1);
  });
});
