const fs = require('fs-extra');
const fastGlob = require('fast-glob');
const pathMod = require('path');

const dest = 'dist/v0';

const FALLBACK_LANGUAGE_CODE = 'en';

const LANGUAGE_CODE_CHUNK_REGEX = /\w+/gi;

/**
 * Finds fallback language codes for the current language code.
 * This code is a copy of the same logic found in
 * extensions/amp-story/1.0/amp-story-localization-service.js
 * @param {string} languageCode the language code to get fallbacks for
 * @return {string[]}
 */
function getLanguageCodeFallbacks(languageCode) {
  if (!languageCode) {
    return [FALLBACK_LANGUAGE_CODE];
  }
  const matches = languageCode.match(LANGUAGE_CODE_CHUNK_REGEX) || [];
  return matches.reduce(
    (fallbackLanguageCodeList, chunk, index) => {
      const fallbackLanguageCode = matches
        .slice(0, index + 1)
        .join('-')
        .toLowerCase();
      fallbackLanguageCodeList.push(fallbackLanguageCode);
      return fallbackLanguageCodeList;
    },
    [FALLBACK_LANGUAGE_CODE]
  );
}

/**
 * Reads the language files found in amp-story and stores it in a
 * Object.
 * @return {Object}
 */
async function getLanguageStrings() {
  const langs = Object.create(null);
  const jsonFiles = await fastGlob('extensions/amp-story/1.0/_locales/*.json');
  for (const jsonFile of jsonFiles) {
    const langKey = pathMod.basename(jsonFile, '.json');
    const translations = JSON.parse(await fs.readFile(jsonFile, 'utf8'));
    for (const [key, value] of Object.entries(translations)) {
      translations[key] = value['string'];
    }
    langs[langKey] = translations;
  }
  return langs;
}

/**
 * Retrieves the fallback language codes for each current locale
 * and assigns any strings from the fallback language.
 * @param {Object} languages
 */
function ensureFallbacks(languages) {
  for (const langKey in languages) {
    languages[langKey] = getLanguageCodeFallbacks(languages, langKey)
      .map((x) => languages[x])
      .reduce((prev, cur) => {
        return Object.assign(prev, cur);
      }, Object.create(null));
  }
}

/**
 * Flattens the structure of the json locale strings and writes them out to the
 * dist directory.
 * @return {Promise<void>}
 */
async function buildStoryLocalization() {
  await fs.ensureDir(dest);
  const languages = await getLanguageStrings();
  ensureFallbacks(languages);
  // Write out each individual lang file.
  for (const langKey in languages) {
    await fs.writeFile(
      `${dest}/amp-story.${langKey}.json`,
      JSON.stringify(languages[langKey])
    );
  }
  // Write out all the languages into one file.
  await fs.writeFile(
    `${dest}/amp-story.all-lang.json`,
    JSON.stringify(languages)
  );
}

module.exports = {buildStoryLocalization};

buildStoryLocalization.description =
  'Flattens the structure of the json locale strings and writes them out to the dist directory';
