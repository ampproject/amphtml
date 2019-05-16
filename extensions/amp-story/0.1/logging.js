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
import {LogLevel, devAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {scopedQuerySelectorAll} from '../../../src/dom';
import {tryResolve} from '../../../src/utils/promise';

/** @typedef {function(!Element): (boolean|!Promise<boolean>)} */
let ElementPredicateDef;

/**
 * A log type is an abstract rule or best practice that should be followed when
 * constructing a story.  This is internal to this file, which handles finding
 * specific instances of these log types, and returning them as log entries.
 *
 * message: (required) The message shown to developers in development mode if
 *     the best practice is not followed.
 * level: (required) The log level at which this entry should be logged.
 * moreInfo: (optional) A URL to a page containing additional documentation on
 *     the best practice.
 * selector: (optional) A selector to be queried on the currently-active page,
 *     and whose results will be subject to the best practice (given that they
 *     also match the precondition).  If unspecified, the amp-story-page itself
 *     is assumed to be subject to the best practice.
 * precondition: (optional) A predicate that takes an element and returns true
 *     if the specified element should be subject to the best practice.  If
 *     unspecified, all elements that match the selector are subject to the best
 *     practice.
 * predicate: (optional) A predicate that takes an element and returns true if
 *     the element follows the best practice, or false otherwise.  If
 *     unspecified, all elements are assumed not to follow the best practice.
 *
 * @typedef {{
 *   message: string,
 *   level: !LogLevel,
 *   moreInfo: (string|undefined),
 *   selector: (string|undefined),
 *   precondition: (!ElementPredicateDef|undefined),
 *   predicate: (!ElementPredicateDef|undefined),
 * }}
 */
let AmpStoryLogTypeDef;

/**
 * A log entry is a more concrete version of a rule or best practice; it refers
 * to whether a specific element on a specific page of a specific story conforms
 * to a given best practice.
 *
 * @typedef {{
 *   element: !Element,
 *   rootElement: !Element,
 *   message: string,
 *   level: !LogLevel,
 *   conforms: boolean,
 *   moreInfo: (string|undefined),
 * }}
 */
export let AmpStoryLogEntryDef;

/** @private @const {string} */
const AMPPROJECT_DOCS = 'https://www.ampproject.org/docs';

/**
 * @param  {!HTMLMediaElement} el
 * @return {!Promise<Image>}
 */
function getPosterFromVideo(el) {
  return new Promise((resolve, reject) => {
    const poster = new Image();
    poster.onload = () => resolve(poster);
    poster.onerror = reject;
    poster.src = el.getAttribute('poster');
  });
}

/** @enum {!AmpStoryLogTypeDef} */
const LogType = {
  /** Errors */
  VIDEOS_POSTER_SPECIFIED: {
    message: 'Videos should specify a poster image.',
    moreInfo: AMPPROJECT_DOCS + '/reference/components/amp-video#poster',
    selector: 'video:not([poster])',
    level: LogLevel.ERROR,
  },

  /** Warnings */
  IMAGES_MAX_720P_OR_SRCSET: {
    message:
      'Images should not be larger than 720p.  If you wish to use' +
      ' images that are larger than 720p, you should specify a srcset.',
    moreInfo: AMPPROJECT_DOCS + '/guides/responsive/art_direction#srcset',
    selector: 'img:not([srcset])',
    predicate: el => el.naturalWidth <= 720 && el.naturalHeight <= 1280,
    level: LogLevel.WARN,
  },

  IMAGES_PORTRAIT: {
    message: 'Full-bleed images should be in portrait orientation.',
    selector: 'amp-story-grid-layer[template="fill"] > amp-img > img',
    predicate: el => el.naturalWidth < el.naturalHeight,
    level: LogLevel.WARN,
  },

  VIDEOS_MAX_720P: {
    message: 'Videos should not be larger than 720p.',
    selector: 'video',
    predicate: el => el.videoWidth <= 720 && el.videoHeight <= 1280,
    level: LogLevel.WARN,
  },

  VIDEOS_PORTRAIT: {
    message: 'Full-bleed videos should be in portrait orientation.',
    selector: 'amp-story-grid-layer[template="fill"] > amp-video > video',
    predicate: el => el.videoWidth < el.videoHeight,
    level: LogLevel.WARN,
  },

  VIDEO_POSTER_MAX_720P: {
    message: 'Video poster images should not be larger than 720p.',
    selector: 'video[poster]',
    predicate: el =>
      getPosterFromVideo(el).then(poster => {
        return poster.naturalWidth <= 720 && poster.naturalHeight <= 1280;
      }),
    level: LogLevel.WARN,
  },

  VIDEO_POSTER_POTRAIT: {
    message:
      'Poster images for full-bleed videos should be in portrait ' +
      'orientation.',
    selector:
      'amp-story-grid-layer[template="fill"] > amp-video > ' + 'video[poster]',
    predicate: el =>
      getPosterFromVideo(el).then(
        poster => poster.naturalWidth < poster.naturalHeight
      ),
    level: LogLevel.WARN,
  },
};

/**
 * Gets the log type associated with the specified key.
 * @param {string} logTypeKey
 * @return {!AmpStoryLogTypeDef}
 */
function getLogType(logTypeKey) {
  const logType = LogType[logTypeKey];
  devAssert(logType, `There is no log type "${logTypeKey}".`);
  devAssert(
    logType.message,
    `Log type "${logTypeKey}" has no associated message.`
  );
  devAssert(
    logType.level,
    `Log type "${logTypeKey}" has no associated log level.`
  );

  return logType;
}

/**
 * @param {!Element} rootElement
 * @param {!AmpStoryLogTypeDef} logType
 * @param {!Element} element
 * @return {!Promise<!AmpStoryLogEntryDef>}
 */
function getLogEntry(rootElement, logType, element) {
  const predicate = logType.predicate || (unusedEl => false);

  return tryResolve(() => predicate(element)).then(conforms => {
    return new Promise(resolve => {
      resolve(
        dict({
          'rootElement': rootElement,
          'element': element,
          'conforms': conforms,
          'level': logType.level,
          'message': logType.message,
          'moreInfo': logType.moreInfo,
        })
      );
    });
  });
}

/**
 * @param {!Element} rootElement
 * @param {!AmpStoryLogTypeDef} logType
 * @return {!Array<!Promise<!AmpStoryLogEntryDef>>}
 */
function getLogEntriesForType(rootElement, logType) {
  const precondition = logType.precondition || (unusedEl => true);

  const elements = logType.selector
    ? [].slice.call(scopedQuerySelectorAll(rootElement, logType.selector))
    : [rootElement];

  return elements
    .filter(precondition)
    .map(getLogEntry.bind(/** thisArg */ null, rootElement, logType));
}

/**
 * @param {!AmpStoryLogEntryDef} logEntryA
 * @param {!AmpStoryLogEntryDef} logEntryB
 * @return {number}
 */
function logEntryCompareFn(logEntryA, logEntryB) {
  if (logEntryA.conforms == logEntryB.conforms) {
    // For entries within that are all conformant or all non-conformant, sort by
    // log level, with most severe entries first and least severe entries last.
    return logEntryA.level <= logEntryB.level ? -1 : 1;
  } else {
    // false < true, so non-conformant issues go before conformant ones.
    return logEntryA.conforms < logEntryB.conforms ? -1 : 1;
  }
}

/**
 * Gets a promise which yields a list of log entries for the specified element.
 * @param {!Element} rootElement
 * @return {!Promise<!Array<!AmpStoryLogEntryDef>>}
 */
export function getLogEntries(rootElement) {
  const logEntryPromises = Object.keys(LogType).reduce((entries, key) => {
    const logType = getLogType(key);
    const newEntries = getLogEntriesForType(rootElement, logType);
    return entries.concat(newEntries);
  }, []);

  return Promise.all(logEntryPromises).then(logEntries => {
    return logEntries.sort(logEntryCompareFn);
  });
}
