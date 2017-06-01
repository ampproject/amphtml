/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {fetchLineDelimitedChunks} from '../line-delimited-response-handler';
import * as sinon from 'sinon';

describe('#line-delimited-response-handler', () => {

  const url = 'https://someadnetwork.com?who=me&yes=you';
  const xhrInit = {
    mode: 'cors',
    method: 'GET',
    credentials: 'include',
  };
  let fetchStub;
  let chunkHandlerStub;
  let slotData;
  let xhr;
  let sandbox;

  /**
   * @param {!Array<!{{creative:string,headers:!Object<string,string>}}>} slotData
   * @return {string} slot data written in expected stream response format
   */
  function generateResponseFormat() {
    let slotDataString = '';
    slotData.forEach(slot => {
      // TODO: escape creative returns
      const creative = slot.creative.replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      slotDataString += `${JSON.stringify(slot.headers)}\n${creative}\n`;
    });
    return slotDataString;
  }

  function executeAndVerifyResponse() {
    // Streamed response calls chunk handlers after returning so need to
    // wait on chunks.
    let chunkResolver;
    const chunkPromise = new Promise(resolver => chunkResolver = resolver);
    const chunkHandlerWrapper = (creative, metaData) => {
      chunkHandlerStub(creative, metaData);
      if (chunkHandlerStub.callCount == slotData.length) {
        chunkResolver();
      }
    };
    // If no slots then callback will never execute so we need to resolve
    // immediately.
    if (slotData.length == 0) {
      chunkResolver();
    }
    return Promise.all([
      fetchLineDelimitedChunks(xhr, url, chunkHandlerWrapper, xhrInit),
      chunkPromise,
    ])
    .then(results => {
      // results[0] is the response
      expect(results[0]).to.be.ok;
      expect(chunkHandlerStub.callCount).to.equal(slotData.length);
      // Could have duplicate responses so need to iterate and get counts.
      // TODO: can't use objects as keys :(
      const calls = {};
      slotData.forEach(slot => {
        const key = slot.creative + JSON.stringify(slot.headers);
        calls[key] ? calls[key]++ : (calls[key] = 1);
      });
      slotData.forEach(slot => {
        expect(chunkHandlerStub.withArgs(slot.creative, slot.headers).callCount)
          .to.equal(calls[slot.creative + JSON.stringify(slot.headers)]);
      });
    });
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    fetchStub = sandbox.stub();
    chunkHandlerStub = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('stream not supported', () => {
    beforeEach(() => {
      fetchStub.returns(Promise.resolve({
        text: () => Promise.resolve(generateResponseFormat()),
      }));
      xhr = {
        fetch: fetchStub,
        win: {
          // TextDecoder should exist but not be called
          TextDecoder: () => { throw new Error('fail'); },
        },
      };
    });

    it('should fallback to text if no stream support', () => {
      slotData = [
        {headers: {foo: 'bar'}, creative: '<html>baz\n</html>'},
        {headers: {hello: 'world'}, creative: '<html>do not\n chunk me</html>'},
      ];
      return executeAndVerifyResponse();
    });

    it('should fallback to text if no stream support w/ empty response', () => {
      slotData = [];
      return executeAndVerifyResponse();
    });

    it('should fallback to text if no TextDecoder', () => {
      slotData = [
        {headers: {foo: 'bar', hello: 'world'}, creative: '<html>baz\n</html>'},
        {headers: {hello: 'world'},
          creative: '\r\n<html>\nchunk\b me</html>\r\b\n\r'},
        {headers: {foo: 'bar'}, creative: ''},
        {headers: {}, creative: '\r\n\r\b\n\r'},
      ];
      return executeAndVerifyResponse();
    });
  });

  describe('streaming', () => {
    let readStub;

    function setup() {
      const responseString = generateResponseFormat();
      const textEncoder = new TextEncoder('utf-8');
      const CHUNK_SIZE = 5;
      let chunk = 0;
      do {
        const value = textEncoder.encode(responseString.substr(
          chunk * CHUNK_SIZE, CHUNK_SIZE), {'stream': true});
        const done = chunk * CHUNK_SIZE >= responseString.length - 1;
        readStub.onCall(chunk).returns(Promise.resolve({value, done}));
      } while (chunk++ * CHUNK_SIZE < responseString.length);
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      readStub = sandbox.stub();
      fetchStub.returns(Promise.resolve({
        text: () => Promise.resolve(),
        body: {
          getReader: () => {
            return {
              read: readStub,
            };
          },
        },
      }));
      xhr = {
        fetch: fetchStub,
        win: {
          TextDecoder,
        },
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should handle empty streamed response properly', () => {
      slotData = [];
      setup();
      return executeAndVerifyResponse();
    });

    it('should handle no fill response properly', () => {
      slotData = [{headers: {}, creative: ''}];
      setup();
      return executeAndVerifyResponse();
    });

    it('should handle multiple no fill responses properly', () => {
      slotData = [
        {headers: {}, creative: ''},
        {headers: {}, creative: ''},
      ];
      setup();
      return executeAndVerifyResponse();
    });

    it('should stream properly', () => {
      slotData = [
        {headers: {}, creative: ''},
        {headers: {foo: 'bar', hello: 'world'},
          creative: '\t\n\r<html>\bbaz\r</html>\n\n'},
        {headers: {}, creative: ''},
        {headers: {hello: 'world'},
          creative: '<html>\nchu\nnk me</h\rtml\n\t>'},
        {headers: {}, creative: ''},
      ];
      setup();
      return executeAndVerifyResponse();
    });
  });
});
