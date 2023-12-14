const fs = require('fs-extra');
const fastGlob = require('fast-glob');
const pathMod = require('path');
const debounce = require('../common/debounce');
const {endBuildStep, watchDebounceDelay} = require('./helpers');
const {watch} = require('chokidar');
const {readJson} = require('../json-locales');

const dest = 'dist/v0';

const LOCALES_DIR = 'extensions/amp-story/1.0/_locales/*.json';

const FALLBACK_LANGUAGE_CODE = 'en';

const LANGUAGE_CODE_CHUNK_REGEX = /\w+/gi;

/**
 * Finds fallback language codes for the current language code.
 * @param {string} languageCode the language code to get fallbacks for
 * @return {string[]}
 */
function getLanguageCodeFallbacks(languageCode) {
  if (!languageCode) {
    return [FALLBACK_LANGUAGE_CODE];
  }

  /** @type {string[]} */
  const matches = languageCode.match(LANGUAGE_CODE_CHUNK_REGEX) || [];
  return matches.reduce(
    (fallbackLanguageCodeList, _, index) => {
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
 * @return {Promise<Object>}
 */
async function getLanguageStrings() {
  const langs = Object.create(null);
  const jsonFiles = await fastGlob(LOCALES_DIR);
  for (const jsonFile of jsonFiles) {
    const langKey = pathMod.basename(jsonFile, '.json');
    langs[langKey] = readJson(jsonFile);
  }
  return langs;
}

/**
 * Retrieves the fallback language codes for each current locale
 * and merges any strings from the fallback language.
 * @param {object} languages
 */
function mergeFallbacks(languages) {
  for (const langKey in languages) {
    languages[langKey] = getLanguageCodeFallbacks(langKey)
      .map((x) => languages[x])
      .reduce((prev, cur) => Object.assign(prev, cur), Object.create(null));
  }
}

/**
 * Write the localization files to dist/v0/
 * @return {Promise<void>}
 */
async function writeStoryLocalizationFiles() {
  const startTime = Date.now();
  await fs.ensureDir(dest);
  const languages = await getLanguageStrings();
  mergeFallbacks(languages);
  // Write out each individual lang file.
  for (const langKey in languages) {
    await fs.writeJson(`${dest}/amp-story.${langKey}.json`, languages[langKey]);
  }
  // Write out all the languages into one file.
  await fs.writeJson(`${dest}/amp-story.all-lang.json`, languages);
  endBuildStep('Generated Story JSON Localization files into', dest, startTime);
}

/**
 * Flattens the structure of the json locale strings and writes them out to the
 * dist directory.
 * @param {Object=} options
 * @return {Promise<void>}
 */
async function buildStoryLocalization(options = {}) {
  if (options.watch) {
    watch(LOCALES_DIR).on(
      'change',
      debounce(writeStoryLocalizationFiles, watchDebounceDelay)
    );
  }
  await writeStoryLocalizationFiles();
}

module.exports = {buildStoryLocalization};

buildStoryLocalization.description =
  'Flattens the structure of the json locale strings and writes them out to the dist directory';
