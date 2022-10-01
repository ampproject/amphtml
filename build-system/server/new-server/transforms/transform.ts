import fs from 'fs';
import minimist from 'minimist';
import posthtml from 'posthtml';

import transformCdnSrcs from './cdn/cdn-transform';
import transformCss from './css/css-transform';
import transformModules from './modules/modules-transform';

const argv = minimist(process.argv.slice(2));
const FOR_TESTING = argv._.includes('integration');
// Use 9876 if running integration tests as this is the KARMA_SERVER_PORT
const PORT = FOR_TESTING ? 9876 : argv.port ?? 8000;
const ESM = !!argv.esm;

const defaultTransformConfig = {
  esm: ESM,
  port: PORT,
  fortesting: FOR_TESTING,
  useMaxNames: !argv.minified,
};

const transforms = [transformCdnSrcs(defaultTransformConfig)];

if (ESM) {
  transforms.unshift(transformCss(), transformModules(defaultTransformConfig));
}

export async function transform(fileLocation: string): Promise<string> {
  const source = await fs.promises.readFile(fileLocation, 'utf8');
  const result = await posthtml(transforms).process(source);
  return result.html;
}

export function transformSync(content: string): string {
  // @ts-ignore We can only use posthtml's sync API in our Karma preprocessor.
  // See https://github.com/posthtml/posthtml#api
  return posthtml(transforms).process(content, {sync: true}).html;
}
