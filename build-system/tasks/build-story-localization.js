const fs = require('fs-extra');
const fastGlob = require('fast-glob');
const pathMod = require('path');

const dest = 'dist/v0';

/**
 * Normalizes the json locale strings and writes them out to the dist
 * directory.
 */
async function buildStoryLocalization() {
  await fs.ensureDir(dest);
  const langs = Object.create(null);
  const jsonFiles = await fastGlob('extensions/amp-story/1.0/_locales/*.json');
  for (const jsonFile of jsonFiles) {
    const langKey = pathMod.basename(jsonFile, '.json');
    const translations = JSON.parse(await fs.readFile(jsonFile, 'utf8'));
    for (const [key, value] of Object.entries(translations)) {
      translations[key] = value['string'];
    }
    langs[langKey] = translations;
    await fs.writeFile(`${dest}/amp-story.${langKey}.json`, JSON.stringify(translations));
  }
  await fs.writeFile(`${dest}/amp-story.all-lang.json`, JSON.stringify(langs));
}

module.exports = {buildStoryLocalization};

buildStoryLocalization.description = 'Normalizes the json locale strings and writes them out to the dist directory';
