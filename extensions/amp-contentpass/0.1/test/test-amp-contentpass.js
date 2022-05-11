import '../amp-contentpass';

const PROPERTY_ID = '1234abcd';

async function buildConsentElement(document) {
  const element = document.createElement('amp-consent');
  const iframe = document.createElement('iframe');
  element.appendChild(iframe);
  document.body.appendChild(element);
  return {element, iframe};
}

async function buildContentpassElement(document, propertyId) {
  const element = document.createElement('amp-contentpass');
  element.setAttribute('data-property-id', propertyId);
  element.setAttribute('layout', 'nodisplay');
  document.body.appendChild(element);
  const impl = await element.getImpl(false);
  impl.baseURL_ =
    // Serve a blank page, since these tests don't require an actual page.
    // hash # at the end so path is not affected by param concat
    `http://localhost:${location.port}/test/fixtures/served/blank.html#`;
  await element.buildInternal();
  await element.layoutCallback();
  return {element};
}

describes.realWin(
  'amp-contentpass',
  {
    amp: {
      ampdocument: 'single',
      canonicalUrl: 'https://foo.bar/baz',
      extensions: ['amp-contentpass'],
      runtimeOn: true,
    },
  },
  function (env) {
    let ampConsentElem;
    let ampConsentIframeElem;
    let document;

    beforeEach(async () => {
      document = env.win.document;
      ({element: ampConsentElem, iframe: ampConsentIframeElem} =
        await buildConsentElement(document));
    });

    afterEach(() => {
      document.body.removeChild(ampConsentElem);
    });

    describe('initialization', () => {
      it('should require data-property-id attribute', () => {
        return expectAsyncConsoleError(() => {
          return buildContentpassElement(
            document,
            ''
          ).should.eventually.be.rejectedWith(
            /The data-property-id attribute is required/
          );
        });
      });
    });

    describe('messaging', () => {
      let element;
      let impl;

      beforeEach(async () => {
        ({element} = await buildContentpassElement(document, PROPERTY_ID));
        impl = await element.getImpl(false);
      });

      it('should register for global message events', async () => {
        const spy = env.sandbox.spy(impl.win, 'addEventListener');

        await element.layoutCallback();

        expect(spy).to.be.calledOnce;
        expect(spy.args[0][0]).to.equal('message');
      });

      it('should check for legitimate event source', async () => {
        expect(
          impl.isLegitimateEventSource_(
            {source: ampConsentIframeElem.contentWindow},
            ampConsentIframeElem
          )
        ).to.be.true;
      });

      it('should ignore events from root window', async () => {
        expect(
          impl.isLegitimateEventSource_({source: env.win}, ampConsentIframeElem)
        ).to.be.false;
      });

      it('should handle ping message', async () => {
        const spy = env.sandbox.spy();
        impl.handleContentpassPingMessage_ = spy;

        impl.handleContentpassMessage_({
          source: ampConsentIframeElem.contentWindow,
          data: {
            type: 'x-contentpass-ping',
          },
        });

        expect(spy).to.be.calledOnce;
        expect(spy.args[0][0]).to.equal(ampConsentIframeElem);
      });

      it('should reply to ping message', async () => {
        const postMessageSpy = env.sandbox.spy();
        ampConsentIframeElem.contentWindow.postMessage = postMessageSpy;

        await impl.handleContentpassPingMessage_(ampConsentIframeElem);

        expect(postMessageSpy).to.be.calledOnce;
        expect(postMessageSpy.args[0][0]).to.equal(
          JSON.stringify({
            type: 'x-contentpass-pong',
            canonical: 'https://foo.bar/baz',
            location: 'about:srcdoc',
            propertyId: '1234abcd',
          })
        );
      });

      it('should handle navigate message', async () => {
        const spy = env.sandbox.spy();
        impl.handleContentpassNavigateMessage_ = spy;

        impl.handleContentpassMessage_({
          source: ampConsentIframeElem.contentWindow,
          data: {
            type: 'x-contentpass-navigate',
            url: 'https://foo.bar/baz',
          },
        });

        expect(spy).to.be.calledOnce;
        expect(spy.args[0][0]).to.deep.equal({
          type: 'x-contentpass-navigate',
          url: 'https://foo.bar/baz',
        });
      });

      it('should update location on navigate message', async () => {
        const postMessageSpy = env.sandbox.spy();
        ampConsentIframeElem.contentWindow.postMessage = postMessageSpy;

        impl.win = {location: undefined};

        const data = {
          type: 'x-contentpass-navigate',
          url: 'https://foo.bar/baz',
        };
        await impl.handleContentpassNavigateMessage_(data);

        // Will not respond to the message
        expect(postMessageSpy).to.not.be.called;

        expect(impl.win.location).to.equal('https://foo.bar/baz');
      });
    });
  }
);
