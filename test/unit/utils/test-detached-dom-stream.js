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

import {DetachedDomStream} from '../../../src/utils/detached-dom-stream';

describes.fakeWin('DetachedDomStream', {amp: true}, (env) => {
  let win;
  let chunkSpy;
  let endSpy;
  let stream;

  beforeEach(() => {
    win = env.win;
    chunkSpy = env.sandbox.spy();
    endSpy = env.sandbox.spy();
    stream = new DetachedDomStream(win, chunkSpy, endSpy);
  });

  describe('#write', () => {
    it('calls the chunk cb on every write', () => {
      stream.write(`
        <head>
          <script async src="https://cdn.ampproject.org/v0.js"></script>
        </head>
      `);

      expect(chunkSpy).calledOnce;
      const firstChunkDoc = chunkSpy.firstCall.firstArg;
      const script = firstChunkDoc.querySelector('script');
      expect(script).to.exist;
      expect(script.src).to.equal('https://cdn.ampproject.org/v0.js');

      stream.write(`
        <body class="foo">
          <child-one></child-one>
        </body>
      `);

      expect(chunkSpy).calledTwice;
      const secondChunkDoc = chunkSpy.firstCall.firstArg;
      expect(secondChunkDoc.body).to.have.class('foo');
      expect(firstChunkDoc.querySelector('child-one')).to.exist;

      expect(endSpy).not.called;
    });
  });

  describe('#close', () => {
    it('calls the onEnd cb with full doc when complete', () => {
      stream.write(`
        <head>
          <script async src="https://cdn.ampproject.org/v0.js"></script>
        </head>
      `);

      expect(endSpy).not.called;

      stream.write(`
        <body class="foo">
          <child-one></child-one>
        </body>
      `);

      expect(endSpy).not.called;

      stream.close();

      expect(endSpy).calledOnce;
      const finalDoc = endSpy.firstCall.firstArg;
      const script = finalDoc.querySelector('script');
      expect(script).to.exist;
      expect(script.src).to.equal('https://cdn.ampproject.org/v0.js');
      expect(finalDoc.body).to.have.class('foo');
      expect(finalDoc.querySelector('child-one')).to.exist;
    });

    it('throws if write() called after close()', () => {
      stream.close();
      allowConsoleError(() => {
        expect(() => stream.write('<child-one></child-one>')).to.throw(
          'Detached doc already closed.'
        );
      });
    });
  });
});
