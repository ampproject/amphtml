import {devAssert} from '#core/assert';
import {Deferred} from '#core/data-structures/promise';

/**
 * Decodes readable stream from response and writes to given writeable stream.
 * Returns a promise that resolves when first bytes are received from the
 * response, or we learn that the response is empty.
 * This function should be replaced with transform stream when well supported.
 * @param {Window} win
 * @param {Response} response
 * @param {import('./detached').DetachedDomStream} writer
 * @return {Promise<boolean>} true if response has content, false if
 * the response is empty.
 */
export function streamResponseToWriter(win, response, writer) {
  const hasContentDeferred = new Deferred();
  // Try native streaming first.
  if (
    /** @type {?} */ (win).TextDecoder &&
    /** @type {?} */ (win).ReadableStream
  ) {
    let firstRead = true;
    devAssert(response.body);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    reader.read().then(function handleChunk({done, value}) {
      if (firstRead) {
        hasContentDeferred.resolve(!done);
        firstRead = false;
      }

      // We need to close and flush the decoder on the last chunk even if
      // we have no more bytes and `decode` will throw if not given an
      // array buffer.
      value = value || new Uint8Array(0);
      const text = decoder.decode(value, {stream: !done});

      if (text) {
        writer.write(text);
      }

      if (!done) {
        reader.read().then(handleChunk);
        return;
      }

      writer.close();
    });
  } else {
    // Fallback case waits for the complete response before writing.
    response.text().then((text) => {
      hasContentDeferred.resolve(!!text);
      writer.write(text);
      writer.close();
    });
  }

  return hasContentDeferred.promise;
}
