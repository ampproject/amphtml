const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs-extra');
const {cyan} = require('kleur/colors');
const {log} = require('../common/logging');

const pathPrefix = 'dist/log-messages';

/**
 * Source of truth for extracted messages during build, but should not be
 * deployed. Shaped `{message: {id, message, ...}}`.
 */
const extractedPath = `${pathPrefix}${
  argv.esm ? '-mjs' : 'js'
}.by-message.json`;

const formats = {
  // Consumed by logging server. Format may allow further fields.
  [`${pathPrefix}.json`]: ({id: unused, ...other}) => other,

  // Consumed by runtime function in `#development`.
  [`${pathPrefix}.simple.json`]: ({message}) => message,
};

/** @return {!Promise<!Array<!Object>>} */
const extractedItems = async () =>
  fs.readJson(extractedPath).then(Object.values);

/**
 * Format extracted messages table in multiple outputs, keyed by id.
 * @return {!Promise}
 */
async function formatExtractedMessages() {
  const items = await extractedItems();
  return Promise.all(
    Object.entries(formats).map(async ([path, format]) => {
      const formatted = {};
      items.forEach((item) => (formatted[item.id] = format(item)));
      await fs.outputJson(path, formatted);
      log('Formatted', cyan(path));
    })
  );
}

module.exports = {extractedPath, formatExtractedMessages};
