import {isValidCUID} from './cuid';

const RE_ADDTHIS_FRAGMENT = /^\.[a-z0-9\-_]{11}(\.[a-z0-9_]+)?$/i;

/**
 * Fetches the fragment if it is in the style of a modern AddThis fragment.
 * @param {string} url
 * @return {string|undefined}
 */
const getModernFragment = (url) => {
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

/**
 * Returns true if AddThis share fragment exists on URL
 * @param {string} url
 * @return {boolean}
 */
const isAddthisFragment = (url) => {
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
 * @param {string} url
 * @return {string}
 */
export const clearOurFragment = (url) => {
  if (isAddthisFragment(url)) {
    return url.split('#').shift();
  }
  return url;
};

/**
 * Fetch the unique identifier portion of a modern fragment.
 * @param {string} url
 * @return {string|undefined}
 */
export const getFragmentId = (url) => {
  const fragment = getModernFragment(url);
  if (fragment) {
    return fragment.split('.').slice(1).shift();
  } else {
    return undefined;
  }
};

/**
 * Fetch the service name portion of a modern fragment.
 * @param {string} url
 * @return {string|undefined}
 */
export const getServiceFromUrlFragment = (url) => {
  const fragment = getModernFragment(url);
  if (fragment) {
    return fragment.split('.').slice(2).shift();
  } else {
    return undefined;
  }
};
