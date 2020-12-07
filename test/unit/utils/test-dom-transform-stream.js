/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {DomTransformStream} from '../../../src/utils/dom-tranform-stream';
import {Services} from '../../../src/services';
import {macroTask} from '../../../testing/yield';

describes.fakeWin('DomTransformStream', {amp: true}, (env) => {
  async function flush() {
    await macroTask();
    env.flushVsync();
    await macroTask();
  }

  let win;
  let transformer;
  let detachedDoc;

  beforeEach(() => {
    win = env.win;
    detachedDoc = win.document.implementation.createHTMLDocument().open();
    transformer = new DomTransformStream(win);
  });

  describe('#onEnd', () => {
    it('should only transfer after targetBody is ready', async () => {
      const mutateSpy = env.sandbox.spy(
        Services.vsyncFor(env.win),
        'mutatePromise'
      );
      const {body} = win.document;

      detachedDoc.write(`
        <!doctype html>
        <html ⚡>
        <head>
        <script async src="https://cdn.ampproject.org/v0.js"></script>
        </head>
        <body>
        <child-one></child-one>
        <child-two></child-two>
        </body>
      `);

      transformer.onChunk(detachedDoc);
      transformer.onEnd();
      await flush();

      expect(mutateSpy).not.to.have.been.called;
      transformer.transferBody(body /* targetBody */);

      await flush();

      expect(mutateSpy).to.have.been.calledOnce;
      expect(body.querySelector('child-one')).to.exist;
      expect(body.querySelector('child-two')).to.exist;
    });
  });

  describe('#waitForHead', () => {
    it('should resolve with head, when head is ready', async () => {
      const headSpy = env.sandbox.spy();
      transformer.waitForHead().then(headSpy);
      detachedDoc.write(`
        <!doctype html>
          <html ⚡>
          <head>
            <script async src="https://cdn.ampproject.org/v0.js"></script>
      `);

      transformer.onChunk(detachedDoc);
      await flush();

      expect(headSpy).to.not.have.been.called;

      detachedDoc.write(`</head><body>`);
      transformer.onChunk(detachedDoc);
      await flush();

      expect(headSpy).calledWith(detachedDoc.head);
    });
  });

  describe('#transferBody', () => {
    it('should transfer available chunks only after calling', async () => {
      const {body} = win.document;
      detachedDoc.write(`
        <!doctype html>
          <html ⚡>
          <head>
            <script async src="https://cdn.ampproject.org/v0.js"></script>
          </head>
          <body>
            <child-one></child-one>
            <child-two></child-two>
     `);
      transformer.onChunk(detachedDoc);
      await flush();

      expect(body.querySelector('child-one')).not.to.exist;
      expect(body.querySelector('child-two')).not.to.exist;

      transformer.transferBody(body /* targetBody */);
      await flush();

      expect(body.querySelector('child-one')).to.exist;
      expect(body.querySelector('child-two')).to.exist;
    });

    it('should keep transferring new chunks after call', async () => {
      const {body} = win.document;
      detachedDoc.write(`
        <!doctype html>
          <html ⚡>
          <head>
            <script async src="https://cdn.ampproject.org/v0.js"></script>
          </head>
          <body>
            <child-one></child-one>
            <child-two></child-two>
     `);
      transformer.onChunk(detachedDoc);
      transformer.transferBody(body /* targetBody */);
      await flush();

      expect(body.querySelector('child-one')).to.exist;
      expect(body.querySelector('child-one')).to.exist;

      detachedDoc.write(`
        <child-three></child-three>
        <child-four></child-four>
      `);
      transformer.onChunk(detachedDoc);
      await flush();

      expect(body.querySelector('child-three')).to.exist;
      expect(body.querySelector('child-four')).to.exist;
    });

    it('should resolve only after onEnd is called', async () => {
      const {body} = win.document;
      const tranferCompleteSpy = env.sandbox.spy();
      transformer.transferBody(body /* targetBody */).then(tranferCompleteSpy);

      detachedDoc.write(`
        <!doctype html>
          <html ⚡>
          <head>
            <script async src="https://cdn.ampproject.org/v0.js"></script>
          </head>
          <body>
            <child-one></child-one>
            <child-two></child-two>
          </body>
     `);

      transformer.onChunk(detachedDoc);
      await flush();

      expect(tranferCompleteSpy).not.to.have.been.called;

      transformer.onEnd();
      await flush();

      expect(tranferCompleteSpy).to.have.been.called;
      expect(body.querySelector('child-one')).to.exist;
      expect(body.querySelector('child-two')).to.exist;
    });

    it('should resolve after queued chunks are transferred', async () => {
      const {body} = win.document;
      const tranferCompleteSpy = env.sandbox.spy();

      detachedDoc.write(`
        <!doctype html>
          <html ⚡>
          <head>
            <script async src="https://cdn.ampproject.org/v0.js"></script>
          </head>
          <body>
     `);
      transformer.onChunk(detachedDoc);

      transformer.transferBody(body /* targetBody */).then(tranferCompleteSpy);
      await flush();

      expect(tranferCompleteSpy).not.to.have.been.called;

      detachedDoc.write(`
        <child-one></child-one>
        <child-two></child-two>
        </body>
      `);
      transformer.onChunk(detachedDoc);
      // No flush here so onEnd hits the queued promise.
      transformer.onEnd();
      await flush();

      expect(tranferCompleteSpy).to.have.been.called;

      expect(body.querySelector('child-one')).to.exist;
      expect(body.querySelector('child-two')).to.exist;
    });

    it('should not resolve if no body / onEnd called before body written', async () => {
      const {body} = win.document;
      const tranferCompleteSpy = env.sandbox.spy();
      transformer.transferBody(body /* targetBody */).then(tranferCompleteSpy);

      detachedDoc.write(`
        <!doctype html>
          <html ⚡>
          <head>
            <script async src="https://cdn.ampproject.org/v0.js"></script>
          </head>
     `);

      transformer.onChunk(detachedDoc);
      await flush();

      transformer.onEnd();
      await flush();

      expect(tranferCompleteSpy).not.to.have.been.called;
    });

    it('should throw if no targetBody given', () => {
      allowConsoleError(() => {
        expect(() => transformer.transferBody()).to.throw(
          'No target body given to DomTransformStream.transferBody'
        );
      });
    });

    it('should throw if called more than once', () => {
      const {body} = win.document;
      // No problem here.
      transformer.transferBody(body /* targetBody */);
      allowConsoleError(() => {
        expect(() => transformer.transferBody(body)).to.throw(
          'DomTransformStream.transferBody should only be called once'
        );
      });
    });
  });
});
