const dedent = require('dedent');
const {basename, dirname} = require('path');
const {outputJsonSync, readJsonSync} = require('fs-extra');

// Use our own charset instead of base62 since HTML classnames are case insensitive
const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyz_'.split('');

/**
 * @param {number} int
 * @return {string}
 */
function encode(int) {
  if (int === 0) {
    return CHARSET[0];
  }
  const {length} = CHARSET;
  let res = '';
  while (int > 0) {
    res = CHARSET[int % length] + res;
    int = Math.floor(int / length);
  }
  return res;
}

const pattern = /i-amphtml-story-[a-zA-Z0-9-]*[a-zA-Z0-9]/g;
const prefix = 'i-amphtml-_';

// TODO(alanorozco): These should be prefixed on source. They're a ~250 B delta.
const specificPattern = new RegExp(
  dedent(`
    i-amphtml-tooltip-action-icon-launch
    i-amphtml-tooltip-action-icon-expand
    i-amphtml-embed-id
    i-amphtml-expanded-mode
    i-amphtml-expanded-view-close-button
    i-amphtml-expanded-component
    i-amphtml-tooltip-arrow-on-top
    i-amphtml-tooltip-text
    i-amphtml-tooltip-action-icon
    i-amphtml-outlink-cta-background-color
    i-amphtml-outlink-cta-text-color
    i-amphtml-embedded-component
    i-amphtml-orig-tabindex
    i-amphtml-current-page-has-audio
    i-amphtml-message-container
    i-amphtml-paused-display
    i-amphtml-first-page-active
    i-amphtml-last-page-active
    i-amphtml-overlay-container
    i-amphtml-gear-icon
    i-amphtml-continue-button
    i-amphtml-advance-to
    i-amphtml-return-to
    i-amphtml-visited
    i-amphtml-experiment-story-load-inactive-outside-viewport
    i-amphtml-vertical
    i-amphtml-animate-progress
    i-amphtml-progress-bar-overflow
    i-amphtml-ad-progress-exp
  `)
    .trim()
    .split('\n')
    .sort((a, b) => b.length - a.length)
    .join('|'),
  'g'
);

module.exports = function () {
  const cacheFilename = `build/${basename(dirname(__filename))}.json`;

  const mangled = readJsonSync(cacheFilename, {throws: false}) || {};
  let total = Object.keys(mangled).length;

  /**
   * @param {string} value
   * @return {string}
   */
  function replaceAll(value) {
    const matchesPattern = value.matchAll(pattern);
    const matchesSpecificPattern = value.matchAll(specificPattern);
    for (const matches of [matchesPattern, matchesSpecificPattern]) {
      for (const [match] of matches) {
        if (!(match in mangled)) {
          mangled[match] = `${prefix}${encode(total++)}`;
        }
        value = value.replace(match, mangled[match]);
      }
    }
    return value;
  }

  return {
    name: 'mangle-string-pattern',
    visitor: {
      Program: {
        exit() {
          outputJsonSync(cacheFilename, mangled, {spaces: 2});
        },
      },
      StringLiteral(path) {
        const {value} = path.node;
        path.node.value = replaceAll(value);
      },
      TemplateElement(path) {
        const {value} = path.node;
        path.node.value.raw = replaceAll(value.raw);
        path.node.value.cooked = replaceAll(value.cooked);
      },
    },
  };
};
