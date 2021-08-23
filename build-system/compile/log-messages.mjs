import fs from 'fs-extra';
import minimist from 'minimist';
import {cyan} from 'kleur/colors';
import {log} from '../common/logging.mjs';

const argv = minimist(process.argv.slice(2));
const pathPrefix = 'dist/log-messages';

/**
 * Source of truth for extracted messages during build, but should not be
 * deployed. Shaped `{message: {id, message, ...}}`.
 */
export const extractedPath = `${pathPrefix}${
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
export async function formatExtractedMessages() {
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
