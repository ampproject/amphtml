// TODO(dvoytenko): Remove once Closure adds this extern.

/*
 * Copyright 2017 The Closure Compiler Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * See https://streams.spec.whatwg.org/#default-writer-class
 * @interface
 */
class WritableStreamDefaultWriter {

  /**
   * See https://streams.spec.whatwg.org/#default-writer-write
   * @param {*} chunk
   * @return {!Promise}
   */
  write(chunk) {}

  /**
   * See https://streams.spec.whatwg.org/#default-writer-close
   * @return {!Promise}
   */
  close() {}

  /**
   * @param {*} reason
   * @return {!Promise<undefined>}
   * @see https://streams.spec.whatwg.org/#default-writer-abort
   */
  abort(reason) {}

  /**
   * @return {undefined}
   * @see https://streams.spec.whatwg.org/#default-writer-release-lock
   */
  releaseLock() {}
}

/**
 * @type {!Promise<undefined>}
 * @see https://streams.spec.whatwg.org/#default-writer-closed
 */
WritableStreamDefaultWriter.prototype.closed;

/**
 * @type {number}
 * @see https://streams.spec.whatwg.org/#default-writer-desiredSize
 */
WritableStreamDefaultWriter.prototype.desiredSize;

/**
 * @type {!Promise<number>}
 * @see https://streams.spec.whatwg.org/#default-writer-ready
 */
WritableStreamDefaultWriter.prototype.ready;
