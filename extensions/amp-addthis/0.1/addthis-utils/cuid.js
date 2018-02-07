/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
const RE_CUID = /^[0-9a-f]{16}$/;
const MAX_HEX = 0xffffffff;
const CUID_SESSION_TIME = Date.now();

/**
 * Get the date from the CUID (first 8 hex digits are the time from epoch in seconds).
 * @param cuid
 */
const getDateFromCuid = cuid => {
  let date;
  try {
    date = (new Date((parseInt(cuid.substr(0, 8), 16) * 1000)));
  } catch (e) {
    date = new Date();
  }
  finally {
    return date;
  }
};

/**
 * Check if the CUID is in the future (allowing for up to one day of jitter).
 * @param cuid
 */
const isCuidInFuture = cuid => {
  const computedDate = getDateFromCuid(cuid);
  const date = computedDate.setDate(computedDate.getDate() - 1);
  const now = new Date();
  return (
    (date.getFullYear() <= now.getFullYear()) &&
    (date.getMonth() <= now.getMonth()) &&
    (date.getDay() <= now.getDay())
  );
};

/**
 * Check that the CUID is a 16 digit hex number that is not in the future.
 * @param cuid
 */
export const isValidCUID = cuid => {
  return Boolean(cuid && cuid.match(RE_CUID) && !isCuidInFuture(cuid));
};

/**
 * Create a 16 digit CUID.
 * 0-8 = The date the CUID was created in seconds in hex format, max 8 digits.
 * 9-15 = Random hex number
 */
export const createCUID = () => {
  const suffix = '00000000' +
      (Math.floor(Math.random() * (MAX_HEX + 1))).toString(16).slice(-8);
  return ((CUID_SESSION_TIME / 1000) & MAX_HEX).toString(16) + suffix;
};
