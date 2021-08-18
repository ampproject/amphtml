import {IframeMessagingClient} from '#3p/iframe-messaging-client';

import {serializeMessage} from '#core/3p-frame-messaging';

describes.realWin('3p - iframe-messaging-client', {}, (env) => {
  let win;
  let client;

  beforeEach(() => {
    win = env.win;
  });

  describe('iframe-messaging-client - host window set', () => {
    let postMessageStub;
    let hostWindow;
    beforeEach(() => {
      postMessageStub = env.sandbox.stub();
      hostWindow = {postMessage: postMessageStub};
      client = new IframeMessagingClient(win, hostWindow);
      client.setSentinel('sentinel-123');
      client.nextMessageId_ = 1;
    });

    describe('getData', () => {
      it('should get data', () => {
        const callbackSpy = env.sandbox.spy();
        client.getData('type-a', {a: 1}, callbackSpy);
        expect(postMessageStub).to.be.calledWith(
          serializeMessage(
            'type-a',
            'sentinel-123',
            {
              'payload': {
                a: 1,
              },
              'messageId': 1,
            },
            '01$internalRuntimeVersion$'
          )
        );

        postAmpMessage(
          {
            type: 'type-a-result',
            sentinel: 'sentinel-123',
            'messageId': 1,
            'content': 'result-a',
          },
          hostWindow
        );
        expect(callbackSpy).to.be.calledWith('result-a');
      });

      it('should not get data with wrong messageId', () => {
        const callbackSpy = env.sandbox.spy();
        client.getData('type-a', {a: 1}, callbackSpy);
        expect(postMessageStub).to.be.calledWith(
          serializeMessage(
            'type-a',
            'sentinel-123',
            {
              'payload': {
                a: 1,
              },
              'messageId': 1,
            },
            '01$internalRuntimeVersion$'
          )
        );

        postAmpMessage(
          {
            type: 'type-a-result',
            sentinel: 'sentinel-123',
            'messageId': 2, // wrong messageId
            'content': 'result-a',
          },
          hostWindow
        );
        expect(callbackSpy).to.not.be.called;
      });

      it('should not get data with wrong response type', () => {
        const callbackSpy = env.sandbox.spy();
        client.getData('type-a', {a: 1}, callbackSpy);
        expect(postMessageStub).to.be.calledWith(
          serializeMessage(
            'type-a',
            'sentinel-123',
            {
              'payload': {
                a: 1,
              },
              'messageId': 1,
            },
            '01$internalRuntimeVersion$'
          )
        );

        postAmpMessage(
          {
            type: 'type-b-result', // wrong response type
            sentinel: 'sentinel-123',
            'messageId': 1,
            'content': 'result-a',
          },
          hostWindow
        );
        expect(callbackSpy).to.not.be.called;
      });

      it('should have callback called once', () => {
        const callbackSpy = env.sandbox.spy();
        client.getData('type-a', {a: 1}, callbackSpy);
        expect(postMessageStub).to.be.calledWith(
          serializeMessage(
            'type-a',
            'sentinel-123',
            {
              'payload': {
                a: 1,
              },
              'messageId': 1,
            },
            '01$internalRuntimeVersion$'
          )
        );

        postAmpMessage(
          {
            type: 'type-a-result',
            sentinel: 'sentinel-123',
            'messageId': 1,
            'content': 'result-a',
          },
          hostWindow
        );

        postAmpMessage(
          {
            type: 'type-a-result',
            sentinel: 'sentinel-123',
            'messageId': 1,
            'content': 'result-b',
          },
          hostWindow
        );
        expect(callbackSpy).to.be.calledOnce;
        expect(callbackSpy).to.be.calledWith('result-a');
      });
    });

    describe('makeRequest', () => {
      it('should send the request via postMessage', () => {
        const callbackSpy = env.sandbox.spy();
        client.makeRequest('request-type', 'response-type', callbackSpy);
        expect(postMessageStub).to.be.calledWith(
          serializeMessage(
            'request-type',
            'sentinel-123',
            {},
            '01$internalRuntimeVersion$'
          )
        );

        postAmpMessage(
          {type: 'response-type', sentinel: 'sentinel-123'},
          hostWindow
        );
        expect(callbackSpy).to.be.calledOnce;
        postAmpMessage(
          {type: 'response-type', sentinel: 'sentinel-123'},
          hostWindow
        );
        expect(callbackSpy).to.be.calledTwice;
      });
    });

    describe('requestOnce', () => {
      it('should unlisten after message received', () => {
        const callbackSpy = env.sandbox.spy();
        client.requestOnce('request-type', 'response-type', callbackSpy);
        expect(postMessageStub).to.be.calledWith(
          serializeMessage(
            'request-type',
            'sentinel-123',
            {},
            '01$internalRuntimeVersion$'
          )
        );

        postAmpMessage(
          {type: 'response-type', sentinel: 'sentinel-123'},
          hostWindow
        );
        expect(callbackSpy).to.be.calledOnce;
        postAmpMessage(
          {type: 'response-type', sentinel: 'sentinel-123'},
          hostWindow
        );
        expect(callbackSpy).to.be.calledOnce;
      });
    });

    describe('registerCallback', () => {
      it(
        'should invoke callback on receiving a message of' +
          ' expected response type',
        () => {
          const callbackSpy = env.sandbox.spy();
          client.registerCallback('response-type', callbackSpy);

          postAmpMessage(
            {
              type: 'response-type',
              sentinel: 'sentinel-123',
              x: 1,
              y: 'abc',
            },
            hostWindow
          );
          expect(callbackSpy).to.be.calledWith({
            type: 'response-type',
            sentinel: 'sentinel-123',
            origin: 'http://www.example.com',
            x: 1,
            y: 'abc',
          });
        }
      );

      it(
        'should invoke multiple callbacks on receiving a message of' +
          ' expected response type',
        () => {
          const callbackSpy1 = env.sandbox.spy();
          const callbackSpy2 = env.sandbox.spy();
          const irrelevantCallbackSpy = env.sandbox.spy();

          const expectedResponseObject = {
            type: 'response-type',
            sentinel: 'sentinel-123',
            origin: 'http://www.example.com',
            x: 1,
            y: 'abc',
          };

          client.registerCallback('response-type', callbackSpy1);
          client.registerCallback('response-type', callbackSpy2);
          client.registerCallback('irrelevant-response', irrelevantCallbackSpy);

          postAmpMessage(
            {
              type: 'response-type',
              sentinel: 'sentinel-123',
              x: 1,
              y: 'abc',
            },
            hostWindow
          );

          expect(callbackSpy1).to.be.calledWith(expectedResponseObject);
          expect(callbackSpy2).to.be.calledWith(expectedResponseObject);
          expect(irrelevantCallbackSpy).to.not.be.called;
        }
      );

      it(
        'should not invoke callback on receiving a message of' +
          ' irrelevant response type',
        () => {
          const callbackSpy = env.sandbox.spy();
          client.registerCallback('response-type', callbackSpy);

          postAmpMessage(
            {type: 'response-type-2', sentinel: 'sentinel-123'},
            hostWindow
          );
          expect(callbackSpy).to.not.be.called;
        }
      );

      it('should not invoke callback on receiving a non-AMP message', () => {
        const callbackSpy = env.sandbox.spy();
        client.registerCallback('response-type', callbackSpy);

        win.eventListeners.fire({
          type: 'message',
          source: hostWindow,
          origin: 'http://www.example.com',
          data:
            'nonamp-' +
            JSON.stringify({
              type: 'response-type',
              sentinel: 'sentinel-123',
            }),
        });
        expect(callbackSpy).to.not.be.called;
      });

      it(
        'should not invoke callback on receiving a message ' +
          'not from host window',
        () => {
          const callbackSpy = env.sandbox.spy();
          client.registerCallback('response-type', callbackSpy);
          const randomWindow = {};

          postAmpMessage(
            {type: 'response-type', sentinel: 'sentinel-123'},
            randomWindow
          );
          expect(callbackSpy).to.not.be.called;
        }
      );

      it(
        'should not invoke callback on receiving a message ' +
          'containing no sentinel',
        () => {
          const callbackSpy = env.sandbox.spy();
          client.registerCallback('response-type', callbackSpy);

          postAmpMessage({type: 'response-type'}, hostWindow);
          expect(callbackSpy).to.not.be.called;
        }
      );

      it(
        'should not invoke callback on receiving a message ' +
          'containing wrong sentinel',
        () => {
          const callbackSpy = env.sandbox.spy();
          client.registerCallback('response-type', callbackSpy);

          postAmpMessage(
            {type: 'response-type', sentinel: 'sentinel-123-1'},
            hostWindow
          );
          expect(callbackSpy).to.not.be.called;
        }
      );
    });

    describe('sendMessage', () => {
      it('should send postMessage to host window', () => {
        client.sendMessage('request-type', {x: 1, y: 'abc'});
        expect(postMessageStub).to.be.calledWith(
          serializeMessage(
            'request-type',
            'sentinel-123',
            {x: 1, y: 'abc'},
            '01$internalRuntimeVersion$'
          )
        );
      });
    });
  });

  describe('iframe-messaging-client - host window not set', () => {
    let hostWindow1;
    let postMessageStub1;
    let hostWindow2;
    let postMessageStub2;
    beforeEach(() => {
      postMessageStub1 = env.sandbox.stub();
      hostWindow1 = {postMessage: postMessageStub1};
      postMessageStub2 = env.sandbox.stub();
      hostWindow2 = {postMessage: postMessageStub2};
      win.parent = hostWindow1;
      hostWindow1.parent = hostWindow2;
      hostWindow2.parent = win.top;
      client = new IframeMessagingClient(win);
      client.setSentinel('sentinel-123');
      client.nextMessageId_ = 1;
    });

    describe('makeRequest', () => {
      it('should broadcast the request via postMessage', () => {
        const callbackSpy = env.sandbox.spy();
        client.makeRequest('request-type', 'response-type', callbackSpy);
        expect(postMessageStub1).to.be.calledWith(
          serializeMessage(
            'request-type',
            'sentinel-123',
            {},
            '01$internalRuntimeVersion$'
          )
        );
        expect(postMessageStub2).to.be.calledWith(
          serializeMessage(
            'request-type',
            'sentinel-123',
            {},
            '01$internalRuntimeVersion$'
          )
        );

        // hostWindow2 is the first to send a reply.
        postAmpMessage(
          {type: 'response-type', sentinel: 'sentinel-123'},
          hostWindow2
        );
        expect(callbackSpy).to.be.calledOnce;
        // since hostWindow2 is now set as host, a message from hostWindow1
        // should not be accepted.
        postAmpMessage(
          {type: 'response-type', sentinel: 'sentinel-123'},
          hostWindow1
        );
        expect(callbackSpy).to.be.calledOnce;
        postAmpMessage(
          {type: 'response-type', sentinel: 'sentinel-123'},
          hostWindow2
        );
        expect(callbackSpy).to.be.calledTwice;
        postAmpMessage(
          {type: 'response-type', sentinel: 'sentinel-123'},
          hostWindow1
        );
        expect(callbackSpy).to.be.calledTwice;
      });
    });
  });

  function postAmpMessage(data, source) {
    win.eventListeners.fire({
      type: 'message',
      source,
      origin: 'http://www.example.com',
      data: 'amp-' + JSON.stringify(data),
    });
  }
});
