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
import {isValidCUID} from './cuid';

const RE_ADDTHIS_FRAGMENT = /^\.[a-z0-9\-_]{11}(\.[a-z0-9_]+)?$/i;

/**
 * Fetches the fragment if it is in the style of a modern AddThis fragment.
 * @param url
 */
const getModernFragment = url => {
  let frag = url.split('#').pop();

  // Clean up the fragment
  frag = frag.split(';').shift();

  // Only return the fragment if it looks like one of ours.
  if (RE_ADDTHIS_FRAGMENT.test(frag)) {
    return frag;
  } else {
    return undefined;
  }
};

const isAddthisFragment = url => {
  if (getModernFragment(url)) {
    return true;
  } else {
    const frag = url.split('#').pop();
    if (isValidCUID(frag) || url.indexOf('#at_pco=') > -1) {
      // One of our old fragments, return the part before the hash
      return true;
    }
  }

  return false;
};

/**
 * Removes the fragment from the url if we classify it as an AddThis fragment.
 */
export const clearOurFragment = url => {
  if (isAddthisFragment(url)) {
    return url.split('#').shift();
  } else {
    return url;
  }
};

/**
 * Fetch the unique identifier portion of a modern fragment.
 * @param url
 */
export const getFragmentId = url => {
  const fragment = getModernFragment(url);
  if (fragment) {
    return fragment.split('.').slice(1).shift();
  } else {
    return undefined;
  }
};

/**
 * Fetch the service name portion of a modern fragment.
 * @param url
 */
export const getServiceFromUrlFragment = url => {
  const fragment = getModernFragment(url);
  if (fragment) {
    return fragment.split('.').slice(2).shift();
  } else {
    return undefined;
  }
};
