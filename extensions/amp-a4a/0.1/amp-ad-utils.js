import {isArray, isObject} from '#core/types';
import {parseJson} from '#core/types/object/json';

import {Services} from '#service';
import {parseExtensionUrl} from '#service/extension-script';

import {dev} from '#utils/log';

import * as urls from '../../../src/config/urls';
import {isSecureUrlDeprecated} from '../../../src/url';

const TAG = 'amp-ad-util';

/**
 * Sends a CORS XHR request to the given URL.
 * @param {!Window} win
 * @param {string} url Request URL to send XHR to.
 * @return {!Promise<!Response>}
 */
export function sendXhrRequest(win, url) {
  return Services.xhrFor(win).fetch(url, {
    mode: 'cors',
    method: 'GET',
    credentials: 'include',
  });
}

/** @type {Array<string>} */
const METADATA_STRINGS = [
  '<script amp-ad-metadata type=application/json>',
  '<script type="application/json" amp-ad-metadata>',
  '<script type=application/json amp-ad-metadata>',
];

/**
 *
 * Throws {@code SyntaxError} if the metadata block delimiters are missing
 * or corrupted or if the metadata content doesn't parse as JSON.
 * @param {string} creative from which CSS is extracted
 * @return {?./amp-ad-type-defs.CreativeMetaDataDef} Object result of parsing
 *     JSON data blob inside the metadata markers on the ad text, or null if
 *     no metadata markers are found.
 * TODO(keithwrightbos@): report error cases
 */
export function getAmpAdMetadata(creative) {
  let metadataStart = -1;
  let metadataString;
  for (let i = 0; i < METADATA_STRINGS.length; i++) {
    metadataString = METADATA_STRINGS[i];
    metadataStart = creative.lastIndexOf(metadataString);
    if (metadataStart >= 0) {
      break;
    }
  }
  if (metadataStart < 0) {
    // Couldn't find a metadata blob.
    dev().warn(
      TAG,
      `Could not locate start index for amp meta data in: ${creative}`
    );
    return null;
  }
  const metadataEnd = creative.lastIndexOf('</script>');
  if (metadataEnd < 0) {
    // Couldn't find a metadata blob.
    dev().warn(
      TAG,
      'Could not locate closing script tag for amp meta data in: %s',
      creative
    );
    return null;
  }
  try {
    const metaDataObj = parseJson(
      creative.slice(metadataStart + metadataString.length, metadataEnd)
    );
    let ampRuntimeUtf16CharOffsets = metaDataObj['ampRuntimeUtf16CharOffsets'];
    if (!isArray(ampRuntimeUtf16CharOffsets)) {
      const headStart = creative.indexOf('<head>');
      const headEnd = creative.indexOf('</head>');
      const headSubstring = creative.slice(
        headStart,
        headEnd + '</head>'.length
      );
      const scriptStart = headSubstring.indexOf('<script');
      const scriptEnd = headSubstring.lastIndexOf('</script>');
      if (scriptStart < 0 || scriptEnd < 0) {
        throw new Error('The mandatory script tag is missing or incorrect.');
      }
      ampRuntimeUtf16CharOffsets = [
        // This assumes all script tags are contiguous.
        // This assumption is enforced server-side.
        headStart + scriptStart,
        headStart + scriptEnd + '</script>'.length,
      ];
    } else if (
      ampRuntimeUtf16CharOffsets.length != 2 ||
      typeof ampRuntimeUtf16CharOffsets[0] !== 'number' ||
      typeof ampRuntimeUtf16CharOffsets[1] !== 'number'
    ) {
      throw new Error('Invalid runtime offsets');
    }
    const metaData = {};
    if (metaDataObj['customElementExtensions']) {
      metaData.customElementExtensions = metaDataObj['customElementExtensions'];
      if (!isArray(metaData.customElementExtensions)) {
        throw new Error('Invalid extensions', metaData.customElementExtensions);
      }
    } else {
      metaData.customElementExtensions = [];
    }
    if (metaDataObj['customStylesheets']) {
      // Expect array of objects with at least one key being 'href' whose
      // value is URL.
      metaData.customStylesheets = metaDataObj['customStylesheets'];
      const errorMsg = 'Invalid custom stylesheets';
      if (!isArray(metaData.customStylesheets)) {
        throw new Error(errorMsg);
      }
      /** @type {!Array} */ (metaData.customStylesheets).forEach(
        (stylesheet) => {
          if (
            !isObject(stylesheet) ||
            !stylesheet['href'] ||
            typeof stylesheet['href'] !== 'string' ||
            !isSecureUrlDeprecated(stylesheet['href'])
          ) {
            throw new Error(errorMsg);
          }
        }
      );
    }
    if (isArray(metaDataObj['images'])) {
      // Load maximum of 5 images.
      metaData.images = metaDataObj['images'].splice(0, 5);
    }
    // TODO(keithwrightbos): OK to assume ampRuntimeUtf16CharOffsets is before
    // metadata as its in the head?
    metaData.minifiedCreative =
      creative.slice(0, ampRuntimeUtf16CharOffsets[0]) +
      creative.slice(ampRuntimeUtf16CharOffsets[1], metadataStart) +
      creative.slice(metadataEnd + '</script>'.length);
    return metaData;
  } catch (err) {
    dev().warn(
      TAG,
      'Invalid amp metadata: %s',
      creative.slice(metadataStart + metadataString.length, metadataEnd)
    );
    return null;
  }
}

/**
 * Merges any elements from customElementExtensions array into extensions array if
 * the element is not present.
 * @param {!Array<{custom-element: string, 'src': string}>} extensions
 * @param {!Array<string>} customElementExtensions
 */
export function mergeExtensionsMetadata(extensions, customElementExtensions) {
  for (let i = 0; i < customElementExtensions.length; i++) {
    const extensionId = customElementExtensions[i];
    if (!extensionsHasElement(extensions, extensionId)) {
      extensions.push({
        'custom-element': extensionId,
        // The default version is 0.1. To specify a specific version,
        // use metadata['extensions'] field instead.
        src: `${urls.cdn}/v0/${extensionId}-0.1.js`,
      });
    }
  }
}

/**
 * Determine if parsed extensions metadata contains given element id.
 * @param {!Array<{custom-element: string, src: string}>} extensions
 * @param {string} id
 * @return {boolean}
 */
export function extensionsHasElement(extensions, id) {
  return extensions.some((entry) => entry['custom-element'] === id);
}

/**
 * Parses extension urls from given metadata to retrieve name and version.
 * @param {!./amp-ad-type-defs.CreativeMetaDataDef} creativeMetadata
 * @return {!Array<?{extensionId: string, extensionVersion: string}>}
 */
export function getExtensionsFromMetadata(creativeMetadata) {
  const parsedExtensions = [];
  const {extensions} = creativeMetadata;
  if (!extensions || !isArray(extensions)) {
    return parsedExtensions;
  }

  for (let i = 0; i < extensions.length; i++) {
    const extension = extensions[i];
    const extensionData = parseExtensionUrl(extension.src);
    if (extensionData) {
      parsedExtensions.push(extensionData);
    }
  }
  return parsedExtensions;
}
