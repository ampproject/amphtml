/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * Get the date from the CUID (first 8 hex digits are the time from epoch in
 * seconds).
 * @param {string} cuid
 * @return {Date}
 */
const getDateFromCuid = cuid => {
  let date = new Date();
  try {
    date = (new Date((parseInt(cuid.substr(0, 8), 16) * 1000)));
  } catch (e) {}
  return date;
};

/**
 * Check if the CUID is in the future (allowing for up to one day of jitter).
 * @param {string} cuid
 * @return {boolean}
 */
const isCuidInFuture = cuid => {
  const date = getDateFromCuid(cuid);
  date.setDate(date.getDate() - 1);
  return isDateInFuture(date);
};

export const isDateInFuture = date => {
  const now = new Date();
  if (date.getFullYear() < now.getFullYear()) {
    return false;
  }
  const yearIsLater = date.getFullYear() > now.getFullYear();
  const yearIsSame = date.getFullYear() === now.getFullYear();
  const monthIsLater = date.getMonth() > now.getMonth();
  const monthIsSame = date.getMonth() === now.getMonth();
  const dateIsLater = date.getDate() > now.getDate();
  return (
    yearIsLater ||
    (yearIsSame && monthIsLater) ||
    (yearIsSame && monthIsSame && dateIsLater)
  );
};

/**
 * Check that the CUID is a 16 digit hex number that is not in the future.
 * @param {string} cuid
 * @return {boolean}
 */
export const isValidCUID = cuid => {
  return Boolean(cuid && cuid.match(RE_CUID) && !isCuidInFuture(cuid));
};

/**
 * Create a 16 digit CUID.
 * 0-8 = The date the CUID was created in seconds in hex format, max 8 digits.
 * 9-15 = Random hex number
 * @return {string}
 */
export const createCUID = () => {
  return ((CUID_SESSION_TIME / 1000) & MAX_HEX).toString(16) +
    ('00000000' + (Math.floor(Math.random() * (MAX_HEX + 1))).toString(16))
        .slice(-8);
};
