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

import { dev } from '../../../src/log';
import { parseUrl } from '../../../src/url';
import { find } from '../../../src/utils/array';
import {
  variableServiceFor,
  ExpansionOptions,
} from './variables';

/**
 * A user-supplied JSON object that defines a resource to be reported. It is
 * expected to have some fields.
 * A resource timing enty will match against this resource if all of the
 * following properties match.
 * @property {string=} host A string whose value should be a RegExp. It defines
 *     a host or set of hosts to match against. By default, the RegExp will
 *     match all hosts if omitted.
 * @property {string=} path A string whose value should be a RegExp. It defines
 *     a path or set of paths to match against. By default, the RegExp will
 *     match all paths if omitted.
 * @property {string=} query A string whose value should be a RegExp. It defines
 *     a query string or set of query strings to match against. By default, the
 *     RegExp will match all query strings if omitted.
 * @typedef {!JsonObject}
 */
let IndividualResourceSpec;

/**
 * Defines a single resource (i.e. assigns a name) according to RegExps for the
 * URL's path and query string.
 * @typedef{{
 *  name: string,
 *  pathPattern: !RegExp,
 *  queryPattern: !RegExp,
 * }}
 */
let ParsedResourceSpec;

/**
 * A set of resources to be matched against for a specific host or set of hosts
 * as defined by a RegExp.
 * @typedef{{
 *   hostPattern: !RegExp,
 *   resouces: !Array<!ParsedResourceSpec>,
 * }}
 */
let ResourceSpecForHost;

/**
 * Variables for an individual resource timing entry.
 * @typedef {!Object<string, string>}
 */
let ResourceTimingEntryVars;

// DO NOT SUBMIT -- move to a generic place.
/**
 * @param {function(): OUT} fn
 * @return {!Promise<OUT>}
 * @template OUT
 */
function yieldThread(fn) {
  return new Promise(resolve => {
    setTimeout(() => resolve(fn()));
  });
}

/**
 * Checks whether the given object is a valid resource timing spec.
 * @param {!JsonObject} spec
 * @return {boolean}
 */
function validateResourceTimingSpec(spec) {
  if (!spec['resources']) {
    dev().warn('ANALYTICS', 'resourceTimingSpec has no specified resources');
    return false;
  }
  if (!spec['encoding']) {
    dev().warn('ANALYTICS', 'resourceTimingSpec has no specified encoding');
    return false;
  }
  return true;
}

/**
 * Gets all resource timing entries from the given window.
 * @param {!Window} win
 * @return {!Array<!PerformanceResourceTiming>}
 */
function getResourceTimingEntries(win) {
  if (!win.performance || !win.performance.getEntriesByType) {
    return [];
  }
  return /** @type {!Array<!PerformanceResourceTiming>} */ (
    win.performance.getEntriesByType('resource'));
}

/**
 * Converts a resource timing entry to the variables for this resource.
 * @param {!PerformanceResourceTiming} entry
 * @param {string} name Name of the resource set by the resourceTimingSpec.
 * @param {number} base The radix for formatting numbers.
 * @return {!ResourceTimingEntryVars}
 */
function entryToResourceVars(entry, name, base) {
  const format = (val, relativeTo = 0) =>
    Math.round(val - relativeTo).toString(base);
  return {
    'key': name,
    'startTime': format(entry.startTime),
    'redirectTime': format(entry.redirectEnd, entry.redirectStart),
    'domainLookupTime': format(entry.domainLookupEnd, entry.domainLookupStart),
    'tcpConnectTime': format(entry.connectEnd, entry.connectStart),
    'serverResponseTime': format(entry.responseStart, entry.requestStart),
    'networkTransferTime': format(entry.responseEnd, entry.responseStart),
    'transferSize': format(entry.transferSize),
    'encodedBodySize': format(entry.encodedBodySize),
    'decodedBodySize': format(entry.decodedBodySize),
    'duration': format(entry.duration),
    'initiatorType': entry.initiatorType,
  };
};

/**
 * @param {!Object<string, !IndividualResourceSpec>} resourceDefs A map of names
 *     to specs of which resources match the name.
 * @return {!Object<string, !ResourceSpecForHost>}
 */
function groupDefsByHost(resourceDefs) {
  const byHost = {};
  for (const name in resourceDefs) {
    const host = resourceDefs[name]['host'] || '';
    const path = resourceDefs[name]['path'] || '';
    const query = resourceDefs[name]['query'] || '';
    const pattern = {
      name,
      pathPattern: new RegExp(path),
      queryPattern: new RegExp(query),
    };
    if (byHost[host]) {
      byHost[host].resources.push(pattern);
    } else {
      byHost[host] = {
        hostPattern: new RegExp(host),
        resources: [pattern],
      };
    }
  }
  return byHost;
}

/**
 * Returns the first resource definition that matches the given URL, or
 * undefined if no such definition exists.
 * @param {!Location} url
 * @param {!Array<!ParsedResourceSpec>} resources
 * @return {!ParsedResourceSpec|undefined}
 */
function findMatchForHost(url, resources) {
  return find(resources, res => res.pathPattern.test(url.pathname) &&
    res.queryPattern.test(url.search));
}

/**
 * Returns the variables for the given resource timing entry if it matches one
 * of the defined resources, or null otherwise.
 * @param {!PerformanceResourceTiming} entry
 * @param {!Object<string, !ResourceSpecForHost>} resourcesByHost A map of host
 *     patterns to the spec for resources that match the host pattern.
 * @param {number} base The radix for serializing numbers.
 */
function getVarsForEntry(entry, resourcesByHost, base) {
  const url = parseUrl(entry.name);
  for (const h in resourcesByHost) {
    const { hostPattern, resources } = resourcesByHost[h];
    if (!hostPattern.test(url.host)) {
      continue;
    }
    const resource = findMatchForHost(url, resources);
    if (resource) {
      return entryToResourceVars(entry, resource.name, base);
    }
  }
  return null; // No match.
}

/**
 * Converts the resource timing entries to sets of variables to be serialized
 * according to the list of resources to be matched against. Any resource timing
 * entry that doesn't match one of the resources definitions will be omitted.
 * @param {!Array<!PerformanceResourceTiming>} entries
 * @param {!Object<string, !IndividualResourceSpec>} resourceDefs
 * @param {number} base The radix for serializing numbers.
 * @return {!Array<!ResourceTimingEntryVars>}
 */
function entriesToVariables(entries, resourceDefs, base) {
  // Group resource timing definitions by host since we expect multiple
  // definitions to have the same host.
  const byHost = groupDefsByHost(resourceDefs);

  const results = [];
  entries.forEach(entry => {
    const resource = findMatch(entry, byHost);
    if (resource) {
      results.push(resource);
    }
  });
  return results;
}

/**
 * Serializes an array of variables corresponding to individual resources into a
 * single string.
 * @param {!Array<!ResourceTimingEntryVars>} resources
 * @param {!JsonObject} encodingSpec
 * @param {!Window} win
 * @return {!Promise<string>}
 */
function serialize(resources, encodingSpec, win) {
  const variableService = variableServiceFor(win);
  return Promise.all(resources.map(res => {
    const expansionOptions = new ExpansionOptions(res, 1 /* opt_iterations */);
    return variableService.expandTemplate(
      encodingSpec['entry'], expansionOptions);
  })).then(vars => vars.join(encodingSpec['delim']));
}

/**
 * @param {!JsonObject} resourceTimingSpec
 * @param {!Window} win
 * @return {!Promise<string>|string}
 */
export function getResourceTimingBinding(resourceTimingSpec, win) {
  if (!validateResourceTimingSpec(resourceTimingSpec)) {
    return '';
  }

  const entries = getResourceTimingEntries(win);
  if (!entries.length) {
    return '';
  }

  return yieldThread(() => {
    const resources = entriesToVariables(
      entries, resourceTimingSpec['resources'],
      resourceTimingSpec['encoding']['base']);
    return serialize(resources, resourceTimingSpec['encoding'], win);
  });
}
