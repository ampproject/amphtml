'use strict';

const amphtmlValidator = require('amphtml-validator');
const colors = require('kleur/colors');
const through = require('through2');
const PluginError = require('plugin-error');

const PLUGIN_NAME = 'gulp-amphtml-validator';

const STATUS_FAIL = 'FAIL';
const STATUS_PASS = 'PASS';
const STATUS_UNKNOWN = 'UNKNOWN';

/**
 * Creates a Gulp stream that validates AMP HTML files using amphtml-validator.
 * 
 * @param {Object} [opts] - Options for the validator plugin
 * @param {Object} [opts.validator] - Custom AMP validator module (for testing)
 * @param {boolean} [opts.failOnStream=false] - Whether to fail on stream input
 * @param {number} [opts.concurrency=4] - Number of files to validate concurrently
 * @returns {stream.Transform} - Gulp file stream transform
 */
function validate(opts = {}) {
  const {
    validator = amphtmlValidator,
    failOnStream = false,
    concurrency = 4,
  } = opts;

  let validatorInstancePromise = validator.getInstance();

  /**
   * Validate a single file asynchronously.
   * @param {import('vinyl')} file 
   * @returns {Promise<void>}
   */
  async function validateFile(file) {
    if (file.isNull()) return;

    if (file.isStream()) {
      if (failOnStream) {
        throw new PluginError(PLUGIN_NAME, 'Stream input is not supported.');
      } else {
        console.warn(colors.yellow(`[${PLUGIN_NAME}] Warning: Stream input not supported. Skipping validation for ${file.relative}.`));
        return;
      }
    }

    if (file.isBuffer()) {
      const validatorInstance = await validatorInstancePromise;
      const content = file.contents.toString('utf-8');
      file.ampValidationResult = validatorInstance.validateString(content);
    }
  }

  let running = 0;
  let fileQueue = [];
  let ended = false;

  function processQueue(callback) {
    if (fileQueue.length === 0) {
      if (ended) callback();
      return;
    }
    while (running < concurrency && fileQueue.length > 0) {
      const { file, enc, cb } = fileQueue.shift();
      running++;
      validateFile(file)
        .then(() => {
          running--;
          cb(null, file);
          processQueue(callback);
        })
        .catch((err) => {
          running--;
          cb(new PluginError(PLUGIN_NAME, err.message));
          processQueue(callback);
        });
    }
  }

  return through.obj(function(file, enc, cb) {
    fileQueue.push({ file, enc, cb });
    processQueue(() => {});
  }, function(cb) {
    ended = true;
    if (running === 0 && fileQueue.length === 0) {
      cb();
    } else {
      // Wait for all queued files to finish
      const checkDone = () => {
        if (running === 0 && fileQueue.length === 0) {
          cb();
        } else {
          setImmediate(checkDone);
        }
      };
      checkDone();
    }
  });
}

/**
 * Formats and logs AMP validation results.
 *
 * @param {Object} [opts] - Options
 * @param {function} [opts.logger=console.info] - Logger function for output
 * @returns {stream.Transform} - Gulp file stream transform
 */
function format(opts = {}) {
  const { logger = console.info } = opts;

  const results = [];

  function collectResults(file, encoding, callback) {
    if (!file.isNull() && file.ampValidationResult) {
      results.push(file);
    }
    callback(null, file);
  }

  function formatResults(callback) {
    if (results.length === 0) {
      logger(colors.yellow(`[${PLUGIN_NAME}] No AMP validation results.`));
      return callback();
    }

    logger(colors.cyan(`[${PLUGIN_NAME}] AMP Validation results:`));

    for (const file of results) {
      logger(formatFileResult(file));
    }
    callback();
  }

  function formatFileResult(file) {
    const { status, errors = [] } = file.ampValidationResult;
    let output = `${file.relative}: `;

    switch (status) {
      case STATUS_PASS:
        output += colors.green('PASS');
        output +=
          '\n  ✅ Document passed AMP validation! Check publishing checklist: https://go.amp.dev/publishing-checklist';
        break;

      case STATUS_UNKNOWN:
        output += colors.red('UNKNOWN');
        output +=
          '\n  ⚠️  Validation status unknown. Possibly a download or runtime issue.';
        break;

      case STATUS_FAIL:
      default:
        output += colors.red('FAIL');
        if (errors.length === 0) {
          output += '\n  No detailed errors provided.';
        } else {
          for (const err of errors) {
            output += `\n  ${file.relative}:${err.line}:${err.col} ${colors.red(err.message)}`;
            if (err.specUrl) {
              output += ` (see ${err.specUrl})`;
            }
          }
        }
        break;
    }
    return output;
  }

  return through.obj(collectResults, formatResults);
}

/**
 * Creates a Gulp stream that fails the build if validation results meet failure criteria.
 *
 * @param {(result: Object) => boolean} isFailureFn - Function to determine if result is failure
 * @returns {stream.Transform} - Gulp file stream transform
 */
function failAfter(isFailureFn) {
  let failedCount = 0;

  function collect(file, encoding, callback) {
    if (!file.isNull() && file.ampValidationResult && isFailureFn(file.ampValidationResult)) {
      failedCount++;
    }
    callback(null, file);
  }

  function endStream(callback) {
    if (failedCount > 0) {
      this.emit('error', new PluginError(PLUGIN_NAME, `${failedCount} AMP validation failure(s) detected.`));
    }
    callback();
  }

  return through.obj(collect, endStream);
}

/**
 * Fail after errors or unknown status.
 *
 * @returns {stream.Transform}
 */
function failAfterError() {
  return failAfter(result =>
    result.status === STATUS_FAIL || result.status === STATUS_UNKNOWN
  );
}

/**
 * Fail after warnings or errors.
 *
 * @returns {stream.Transform}
 */
function failAfterWarningOrError() {
  return failAfter(result =>
    result.errors && result.errors.length > 0 ||
    result.status === STATUS_FAIL ||
    result.status === STATUS_UNKNOWN
  );
}

module.exports = {
  validate,
  format,
  failAfterError,
  failAfterWarningOrError,
};
