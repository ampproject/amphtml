'use strict';

/**
 * @fileoverview
 *
 * - Use this file to store NPM scripts that aid in development but
 *   are not available via AMP's amp tasks in build-system/tasks/.
 * - To use these scripts, first install npm-package-scripts by running
 *   "npm install --global nps" (or for short, "npm i -g nps").
 * - Once installed, run any script by calling "nps <scriptname>".
 * - For more info, see https://www.npmjs.com/package/nps#scripts-1
 */

module.exports = {
  scripts: {
    filesize: 'filesize -c=build-system/tasks/bundle-size/filesize.json',
  },
};
