/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {
  DayOfWeekDef,
  RotationItemDef,
  sessionDurationHours,
  timeRotationUtc,
} = require('../common/update-design-review-issues');
const {cyan, red, yellow} = require('../common/colors');
const {readFile} = require('fs-extra');
const {writeDiffOrFail} = require('../common/diff');

const filepath = '.github/workflows/update-design-review-issues.yml';

const indent = (level = 1) => new Array(level).fill('  ').join('');

const cronItemLevel = 2;
const cronItemIndent = indent(cronItemLevel);

/**
 * Times correspond to session end, and additionally 1 hour earlier to account
 * for Daylight Savings.
 * @param {DayOfWeekDef} dayOfWeek
 * @param {string} timeUtc
 * @return {string}
 */
function getRotationCron(dayOfWeek, timeUtc) {
  const [hours, minutes] = timeUtc.split(':').map((n) => parseInt(n, 10));
  const endHours = hours + sessionDurationHours;
  const endHoursDst = endHours - 1;
  return `${minutes} ${endHoursDst},${endHours} * * ${dayOfWeek}`;
}

/**
 * @param {RotationItemDef} rotationItem
 * @return {string}
 */
function getRotationCronItem([dayOfWeek, timeUtc, region]) {
  const pattern = getRotationCron(dayOfWeek, timeUtc);
  return `${cronItemIndent}- cron: '${pattern}' # ${region}\n`;
}

/**
 * Ensures that the Github Workflow update-design-review-issues is scheduled
 * to run matching the configured session times for its corresponding script.
 *
 * It does this by replacing `- cron` entries on the Workflow's YAML file.
 * See https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule
 */
async function check() {
  const content = await readFile(filepath, 'utf8');

  const separator = `${indent(cronItemLevel - 1)}schedule:\n`;
  const [prefix] = content.split(separator + cronItemIndent, 1);

  if (prefix.length === content.length) {
    throw new Error(
      `${cyan('on.schedule')} items were not found in ${red(filepath)}.\n` +
        `  ⤷, ${yellow('To fix:')}\n\n` +
        '    1. Add the default `cron` example from https://git.io/JZns3\n' +
        '    2. Run this command again.\n'
    );
  }

  const expectedCronItems = timeRotationUtc.map(getRotationCronItem).join('');
  const sufix = content.substr(prefix.length + separator.length);
  const itemsAtDepthRegExp = new RegExp(`^(${cronItemIndent}[^\n]*\n)*`, 'm');
  const expectedSufix = sufix.replace(itemsAtDepthRegExp, expectedCronItems);
  const expected = prefix + separator + expectedSufix;

  await writeDiffOrFail(
    'check-update-design-review-issues',
    filepath,
    expected
  );
}

check.flags = {
  fix: 'Update the schedule and write results to file',
};

module.exports = {
  check,
};
