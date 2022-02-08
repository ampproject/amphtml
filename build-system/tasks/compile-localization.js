const fs = require('fs-extra');
const fastGlob = require('fast-glob');
const pathMod = require('path');

async function buildStoriesLocalizationStrings() {
  const langs = Object.create(null);
  const jsonFiles = await fastGlob('extensions/amp-story/1.0/_locales/*.json');
  for (const jsonFile of jsonFiles) {
    const key = pathMod.basename(jsonFile, '.json');
    const value = JSON.parse(await fs.readFile(jsonFile, 'utf8'));
    langs[key] = value;
  }
  await fs.writeFile('./test.json', JSON.stringify(langs, null, 2));
}

buildStoriesLocalizationStrings();
