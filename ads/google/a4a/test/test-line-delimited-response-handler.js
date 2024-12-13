import {
  lineDelimitedStreamer,
  metaJsonCreativeGrouper,
} from '#ads/google/a4a/line-delimited-response-handler';

describes.sandboxed('#line-delimited-response-handler', {}, (env) => {
  let chunkHandlerStub;
  let slotData;
  let win;
  let response;

  /**
   * @return {string} slot data written in expected stream response format
   */
  function generateResponseFormat() {
    let slotDataString = '';
    slotData.forEach((slot) => {
      // TODO: escape creative returns
      const creative = slot.creative
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
      slotDataString += `${JSON.stringify(slot.headers)}\n${creative}\n`;
    });
    return slotDataString;
  }

  function executeAndVerifyResponse() {
    // Streamed response calls chunk handlers after returning so need to
    // wait on chunks.
    let chunkResolver;
    const chunkPromise = new Promise((resolver) => (chunkResolver = resolver));
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
    lineDelimitedStreamer(
      win,
      response,
      metaJsonCreativeGrouper(chunkHandlerWrapper)
    );
    return chunkPromise.then(() => {
      expect(chunkHandlerStub.callCount).to.equal(slotData.length);
      // Could have duplicate responses so need to iterate and get counts.
      // TODO: can't use objects as keys :(
      const calls = {};
      slotData.forEach((slot) => {
        const normalizedHeaderNames = Object.keys(slot.headers).map((s) => [
          s.toLowerCase(),
          s,
        ]);
        slot.normalizedHeaders = {};
        normalizedHeaderNames.forEach(
          (namePair) =>
            (slot.normalizedHeaders[namePair[0]] = slot.headers[namePair[1]])
        );
        const key = slot.creative + JSON.stringify(slot.normalizedHeaders);
        calls[key] ? calls[key]++ : (calls[key] = 1);
      });
      slotData.forEach((slot) => {
        expect(
          chunkHandlerStub.withArgs(slot.creative, slot.normalizedHeaders)
            .callCount
        ).to.equal(
          calls[slot.creative + JSON.stringify(slot.normalizedHeaders)]
        );
      });
    });
  }

  beforeEach(() => {
    chunkHandlerStub = env.sandbox.stub();
  });

  describe('stream not supported', () => {
    beforeEach(() => {
      response = {
        text: () => Promise.resolve(generateResponseFormat()),
      };
      win = {
        // TextDecoder should exist but not be called
        TextDecoder: () => {
          throw new Error('fail');
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
        {
          headers: {hello: 'world'},
          creative: '\r\n<html>\nchunk\b me</html>\r\b\n\r',
        },
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
        const value = textEncoder.encode(
          responseString.substr(chunk * CHUNK_SIZE, CHUNK_SIZE),
          {'stream': true}
        );
        const done = chunk * CHUNK_SIZE >= responseString.length - 1;
        readStub.onCall(chunk).returns(Promise.resolve({value, done}));
      } while (chunk++ * CHUNK_SIZE < responseString.length);
    }

    beforeEach(() => {
      readStub = env.sandbox.stub();
      response = {
        text: () => Promise.resolve(),
        body: {
          getReader: () => {
            return {
              read: readStub,
            };
          },
        },
      };
      win = {
        TextDecoder,
      };
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
        {
          headers: {foo: 'bar', hello: 'world'},
          creative: '\t\n\r<html>\bbaz\r</html>\n\n',
        },
        {
          headers: {Foo: 'bar', hello: 'world'},
          creative: '\t\n\r<html>\bbaz\r</html>\n\n',
        },
        {headers: {}, creative: ''},
        {
          headers: {Foo: 'bar', HELLO: 'Le Monde'},
          creative: '\t\n\r<html>\bbaz\r</html>\n\n',
        },
        {
          headers: {FOO: 'bar', Hello: 'Le Monde'},
          creative: '\t\n\r<html>\bbaz\r</html>\n\n',
        },
        {
          headers: {hello: 'world'},
          creative: '<html>\nchu\nnk me</h\rtml\n\t>',
        },
        {headers: {}, creative: ''},
      ];
      setup();
      return executeAndVerifyResponse();
    });
  });
});
