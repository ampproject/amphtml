/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const OLD_AKAMAI_SHARED_CDN = 'cloudinary-a.akamaihd.net';
const AKAMAI_SHARED_CDN = 'res.cloudinary.com';
const SHARED_CDN = AKAMAI_SHARED_CDN;
/**
 * Represents all the default illegal values to escape when using smartEscape.
 * Anything but (letters, numbers,-,:,/,_)
 * @type {RegExp}
 */
const DEFAULT_URL_ESCAPE_PATTERN = /([^a-zA-Z0-9_.\-\/:]+)/g;

const CROP_TO_OBJECT_FIT = {
  'scale': 'fill',
  'fit': 'contain',
  'limit': 'scale-down',
  'mfit': 'contain',
  'fill': 'cover',
  'lfill': 'scale-down',
  'pad': 'contain',
  'lpad': 'contain',
  'mpad': 'contain',
  'fill_pad': 'cover',
  'crop': 'cover',
  'thumb': 'cover',
  'imagga_crop': 'cover',
  'imagga_scale': 'cover',
};

/**
 * Generate a cloudinary url based on the public id and options, or explicit src
 * if provided.
 * @param {?string} publicId The public id of the resource. Can be null if src
 * is provided in options.
 * @param {Object} options Configuration and transformation options used to
 * generate the url. if src is provided the rest of the options are ignored.
 * @return {?string} The constructed url
 */
export function buildUrl(publicId, options) {
  /* if src provided explicitly it will be used: */
  if (options.src) {
    /* replace auto width/height if requested: */
    return options.src.replace('w_auto', `w_${options.width}`)
        .replace('h_auto', `h_${options.height}`);
  }
  const optionsCopy = Object.assign({}, options);

  patchFetchFormat(optionsCopy);

  let type = /** @type {?string} */(optionConsume(optionsCopy, 'type', null));
  let resourceType = /** @type {?string} */(optionConsume(optionsCopy,
      'resourceType', 'image'));
  let version = /** @type {?string} */(optionConsume(optionsCopy, 'version'));
  let transformation = generateTransformationString(optionsCopy);
  const format = /** @type {?string} */(optionConsume(optionsCopy, 'format'));
  const cloudName = /** @type {string} */(optionConsume(optionsCopy, 'cloudName'));
  const privateCdn = /** @type {?boolean} */(optionConsume(optionsCopy,
      'privateCdn'));
  const secureDistribution = /** @type {?string} */(optionConsume(optionsCopy,
      'secureDistribution', null));
  const secure = /** @type {?boolean} */(optionConsume(optionsCopy, 'secure',
      true));
  const cdnSubdomain = /** @type {?string} */(optionConsume(optionsCopy,
      'cdnSubdomain'));
  const secureCdnSubdomain = /** @type {?boolean} */(optionConsume(optionsCopy,
      'secureCdnSubdomain', null));
  const cname = /** @type {?string} */(optionConsume(optionsCopy, 'cname'));
  const shorten = /** @type {?boolean} */(optionConsume(optionsCopy, 'shorten'));
  const urlSuffix = /** @type {?string} */(optionConsume(optionsCopy, 'urlSuffix'));
  const useRootPath = /** @type {?boolean} */(optionConsume(optionsCopy,'useRootPath'));

  /**
   * Checks if the publicId represents a pre-loaded url in the form of
   * "resource_type/type/version/publicId", e.g.
   * "image/private/v123456/sample.png"
   */
  const preloaded = /^(image|raw)\/([a-z0-9_]+)\/v(\d+)\/([^#]+)$/.exec(
      publicId);
  if (preloaded) {
    resourceType = preloaded[1];
    type = preloaded[2];
    version = preloaded[3];
    publicId = preloaded[4];
  }

  /**
   * If the publicId represents a pre-loaded url, the actual publicId should be
   * in there - in case it's not, there's nothing we can do.
   */
  if (publicId == null) {
    return null;
  }

  const originalSource = publicId;

  if (type === null && publicId.match(/^https?:\//i)) {
    return originalSource;
  }
  const finalizedResourceType = finalizeResourceType(resourceType, type,
      urlSuffix, useRootPath, shorten);

  resourceType = finalizedResourceType.resourceType;
  type = finalizedResourceType.type;

  const finalizedSource = finalizeSource(publicId, format, urlSuffix);
  publicId = finalizedSource.source;
  const {sourceToSign} = finalizedSource;

  if (sourceToSign.indexOf('/') > 0 && !sourceToSign.match(/^v[0-9]+/) &&
      !sourceToSign.match(/^https?:\//)) {
    if (version == null) {
      version = 1;
    }
  }
  if (version != null) {
    version = `v${version}`;
  }
  transformation = transformation.replace(/([^:])\/\//g, '$1/');

  const prefix = unsignedUrlPrefix(cloudName, privateCdn,
      cdnSubdomain, secureCdnSubdomain, cname, secure, secureDistribution);

  return [prefix, resourceType, type, transformation,
    version, publicId].filter(part => part).join('/');
}

/**
 * Beset-effort guess the object fit style based on the cloudinary crop mode
 * @param {string} cropMode The crop used in the transformation
 * @return {string} The derived object-fit value
 */
export function deriveObjectFit(cropMode) {
  return `amp-object-fit-${CROP_TO_OBJECT_FIT[cropMode]}`;
}

/**
 * Generates the url prefix based on the parameters
 * @param {string} cloudName
 * @param {?boolean} privateCdn
 * @param {?string} cdnSubdomain
 * @param {?boolean} secureCdnSubdomain
 * @param {?string} cname
 * @param {?boolean} secure
 * @param {?string} secureDistribution
 * @return {string} The generated prefix
 */
function unsignedUrlPrefix(cloudName, privateCdn, cdnSubdomain,
  secureCdnSubdomain, cname, secure,
  secureDistribution) {
  let prefix;
  if (cloudName.indexOf('/') === 0) {
    return '/res' + cloudName;
  }
  let sharedDomain = !privateCdn;
  if (secure) {
    if ((secureDistribution == null) || secureDistribution ===
      OLD_AKAMAI_SHARED_CDN) {
      secureDistribution = privateCdn ?
        cloudName + '-res.cloudinary.com' : SHARED_CDN;
    }
    if (sharedDomain == null) {
      sharedDomain = secureDistribution === SHARED_CDN;
    }
    if ((secureCdnSubdomain == null) && sharedDomain) {
      secureCdnSubdomain = cdnSubdomain != null && cdnSubdomain.length > 0;
    }

    prefix = 'https://' + secureDistribution;
  } else if (cname) {
    prefix = 'http://' + cname;
  } else {
    const cdnParn = privateCdn ? cloudName + '-' : '';
    const host = [cdnParn, 'res.cloudinary.com'].join('');
    prefix = 'http://' + host;
  }
  if (sharedDomain) {
    prefix += '/' + cloudName;
  }
  return prefix;
}

/**
 *
 * @param {Object} options
 */
function patchFetchFormat(options) {
  if (options.type === 'fetch' && options.fetchFormat == null) {
    options.fetchFormat = optionConsume(options, 'format');
  }
}

/**
 *
 * @param {Object} options
 * @param {string} optionName
 * @param {*=} defaultValue
 * @return {*}
 */
function optionConsume(options, optionName, defaultValue) {
  const result = options[optionName];
  delete options[optionName];
  if (result != null) {
    return result;
  }

  return defaultValue;
}

/**
 *
 * @param {?string} resourceType
 * @param {?string} type
 * @param {?string} urlSuffix
 * @param {?boolean} useRootPath
 * @param {?boolean} shorten
 * @return {{type: ?string, resourceType: ?string}}
 */
function finalizeResourceType(resourceType, type, urlSuffix, useRootPath,
  shorten) {
  if (type == null) {
    type = 'upload';
  }
  if (urlSuffix != null) {
    if (resourceType === 'image' && type === 'upload') {
      resourceType = 'images';
      type = null;
    } else if (resourceType === 'image' && type === 'private') {
      resourceType = 'private_images';
      type = null;
    } else if (resourceType === 'image' && type === 'authenticated') {
      resourceType = 'authenticated_images';
      type = null;
    } else {
      throw new Error('URL Suffix only supported for image/upload, ' +
        'image/private, image/authenticated');
    }
  }
  if (useRootPath) {
    if ((resourceType === 'image' && type === 'upload') ||
      (resourceType === 'images' && (type == null))) {
      resourceType = null;
      type = null;
    } else {
      throw new Error('Root path only supported for image/upload');
    }
  }
  if (shorten && resourceType === 'image' && type === 'upload') {
    resourceType = 'iu';
    type = null;
  }
  return {resourceType, type};
}

/**
 *
 * @param {string} source The id of the resource, usually a cloudinary publicId
 * but for certain url types (e.g. fetch) this can be a full resource url
 * @param {?string} format The file format to use for delivery
 * @param {?string} urlSuffix Used to give more meaningful name to resources, as
 * the id itself can be a random string. Used primarily for SEO.
 * @return {{
 *   source: string,
 *   sourceToSign: string
 * }}
 */
function finalizeSource(source, format, urlSuffix) {
  let sourceToSign;

  /**
   * combine all double slashes into a single slash, unless it's the double
   * slash right after the url scheme. This is only relevant if the source
   * is a url.
   * Example: https://res.cloudinary.com/image/upload//sample
   * turns to https://res.cloudinary.com/image/upload/sample
   */
  source = source.replace(/([^:])\/\//g, '$1/');

  if (source.match(/^https?:\//i)) {
    // if the source is a url, return it, escaped, without further processing.
    const escaped = smartEscape(source);
    return {source: escaped, sourceToSign: source};
  }

  source = encodeURIComponent(decodeURIComponent(source)).replace(/%3A/g, ':')
      .replace(/%2F/g, '/');
  sourceToSign = source;
  if (urlSuffix) {
    if (urlSuffix.match(/[\.\/]/)) {
      throw new Error('urlSuffix should not include . or /');
    }
    source = source + '/' + urlSuffix;
  }
  if (format != null) {
    source = source + '.' + format;
    sourceToSign = sourceToSign + '.' + format;
  }
  return {source, sourceToSign};
}

/**
 * URL-escape the given string.
 * @param {string} string The string to escape
 * @param {RegExp=} unsafe A regex pattern representing the values to escape.
 * if no regex is sent, standard url escaping is used.
 * @return {string}
 */
function smartEscape(string, unsafe = DEFAULT_URL_ESCAPE_PATTERN) {
  return string.replace(unsafe, function(match) {
    return match.split('').map(function(c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    }).join('');
  });
}

/**
 * Generate a transformation string based on the options
 * @param {Object} options
 * @return {string}
 */
function generateTransformationString(options) {
  const width = optionConsume(options, 'transformationWidth',
      optionConsume(options, 'width'));
  const height = optionConsume(options, 'transformationHeight',
      optionConsume(options, 'height'));
  const crop = optionConsume(options, 'crop');
  const gravity = optionConsume(options, 'gravity');

  let background = optionConsume(options, 'background');
  background = background && background.replace(/^#/, 'rgb:');
  const effect = optionConsume(options, 'effect');
  const border = optionConsume(options, 'border');
  const aspectRatio = optionConsume(options, 'aspectRatio');
  const dprValue = optionConsume(options, 'dpr');
  const rawTransformation = optionConsume(options, 'rawTransformation');
  const fetchFormat = optionConsume(options, 'fetchFormat');
  const quality = optionConsume(options, 'quality');

  const transformation = {
    'b': background,
    'bo': border,
    'e': effect,
    'f': fetchFormat,
    'q': quality,
  };

  const responsive = {
    'dpr': dprValue,
    'ar': aspectRatio,
    'c': crop,
    'g': gravity,
    'h': height,
    'w': width,
  };

  return [rawTransformation,
    filterAndJoin_(transformation),
    filterAndJoin_(responsive)]
      .filter(component => isPresent(component))
      .join('/');
}

/**
 * Returns a string of all the defined values (comma separated)
 * @private
 * @param {!Object} transformation
 * @return {string} the joined string.
 */
function filterAndJoin_(transformation) {
  return Object.keys(transformation)
      .filter(key => isPresent(transformation[key]))
      .map(key => key + '_' + transformation[key])
      .sort()
      .join(',');
}

/**
 * Verify that the parameter `value` is defined and it's string value is > zero.
 * <br>This function should not be confused with `isEmpty()`.
 * @private
 * @param {string|number} value The value to check.
 * @return {boolean} True if the value is defined and not empty.
 */
function isPresent(value) {
  return value != null && value !== '';
}

