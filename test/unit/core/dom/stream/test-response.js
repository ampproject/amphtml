import {streamResponseToWriter} from '#core/dom/stream';

import {macroTask} from '#testing/helpers';

const chunk1 = `
 <!doctype html>
 <html ⚡4ads>
 <head>
   <meta charset="utf-8">
   <meta name="viewport" content="width=device-width,minimum-scale=1">
`;

const chunk2 = `
   <style amp4ads-boilerplate>body{visibility:hidden}</style>
   <script async src="https://cdn.ampproject.org/amp4ads-v0.js"></script>
 </head>
 <body>Hello, AMP4ADS world.</body>
 </html>
`;

describes.fakeWin('DOM - stream - streamResponseToWriter', {}, (env) => {
  let writeSpy;
  let closeSpy;
  let mockWriter;

  beforeEach(() => {
    env.win.TextDecoder = TextDecoder;
    env.win.ReadableStream = ReadableStream;
    writeSpy = env.sandbox.spy();
    closeSpy = env.sandbox.spy();
    mockWriter = {
      write: writeSpy,
      close: closeSpy,
    };
  });

  it('decodes response and writes to writer', async () => {
    let streamController;
    const encoder = new TextEncoder();

    const bodyStream = new ReadableStream({
      start(controller) {
        streamController = controller;
        controller.enqueue(encoder.encode(chunk1));
      },
    });

    const mockRes = new Response(bodyStream);

    streamResponseToWriter(env.win, mockRes, mockWriter);
    await macroTask();
    expect(writeSpy).calledOnce;
    expect(writeSpy).calledWith(chunk1);

    streamController.enqueue(encoder.encode(chunk2));
    await macroTask();
    expect(writeSpy).calledTwice;
    expect(writeSpy.secondCall).calledWith(chunk2);

    expect(closeSpy).not.called;
    streamController.close();
    expect(closeSpy).not.calledOnce;
  });

  it('resolves and writes a single chunk when no textEncoder', async () => {
    let streamController;
    const encoder = new TextEncoder();

    const bodyStream = new ReadableStream({
      start(controller) {
        streamController = controller;
        controller.enqueue(encoder.encode(chunk1));
      },
    });

    const mockRes = new Response(bodyStream);

    env.win.TextDecoder = undefined;

    streamResponseToWriter(env.win, mockRes, mockWriter);
    await macroTask();
    expect(writeSpy).not.called;

    streamController.enqueue(encoder.encode(chunk2));
    await macroTask();
    expect(writeSpy).not.called;

    expect(closeSpy).not.called;
    streamController.close();
    await macroTask();

    expect(writeSpy).calledWith(chunk1 + chunk2);
    expect(closeSpy).calledOnce;
  });

  it('resolves and writes a single chunk when no ReadableStream', async () => {
    let streamController;
    const encoder = new TextEncoder();

    const bodyStream = new ReadableStream({
      start(controller) {
        streamController = controller;
        controller.enqueue(encoder.encode(chunk1));
      },
    });

    const mockRes = new Response(bodyStream);

    env.win.ReadableStream = undefined;

    streamResponseToWriter(env.win, mockRes, mockWriter);
    await macroTask();
    expect(writeSpy).not.called;

    streamController.enqueue(encoder.encode(chunk2));
    await macroTask();
    expect(writeSpy).not.called;

    expect(closeSpy).not.called;
    streamController.close();
    await macroTask();

    expect(writeSpy).calledWith(chunk1 + chunk2);
    expect(closeSpy).calledOnce;
  });

  it('handles empty response', async () => {
    const bodyStream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });
    const mockRes = new Response(bodyStream);

    streamResponseToWriter(env.win, mockRes, mockWriter);
    await macroTask();
    expect(writeSpy).not.called;
    expect(closeSpy).calledOnce;
  });

  it('resolves to true when response has content', async () => {
    const mockRes = new Response(chunk1);
    const hasContent = await streamResponseToWriter(
      env.win,
      mockRes,
      mockWriter
    );
    expect(hasContent).to.be.true;
  });

  it('resolves to false when response has no content', async () => {
    const mockRes = new Response('');
    const hasContent = await streamResponseToWriter(
      env.win,
      mockRes,
      mockWriter
    );
    expect(hasContent).to.be.false;
  });

  it('resolves to true when response has content [fallback]', async () => {
    env.win.TextDecoder = undefined;
    env.win.ReadableStream = undefined;
    const mockRes = new Response(chunk1);
    const hasContent = await streamResponseToWriter(
      env.win,
      mockRes,
      mockWriter
    );
    expect(hasContent).to.be.true;
  });

  it('resolves to false when response has no content [fallback]', async () => {
    env.win.TextDecoder = undefined;
    env.win.ReadableStream = undefined;
    const mockRes = new Response('');
    const hasContent = await streamResponseToWriter(
      env.win,
      mockRes,
      mockWriter
    );
    expect(hasContent).to.be.false;
  });
});
