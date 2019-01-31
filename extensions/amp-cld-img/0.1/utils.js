import {crc32} from './crc32';

const OLD_AKAMAI_SHARED_CDN = 'cloudinary-a.akamaihd.net';
const AKAMAI_SHARED_CDN = 'res.cloudinary.com';
const SHARED_CDN = AKAMAI_SHARED_CDN;

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
 * @return {string} The constructed url
 */
export function buildUrl(publicId, options = {}) {
  let url = options.src;
  /* if src provided explicitly it will be used: */
  if (url) {
    /* replace auto width/height if requested: */
    url = url.replace('w_auto', `w_${options.width}`)
        .replace('h_auto', `h_${options.height}`);
  } else {
    patchFetchFormat(options);
    let type = optionConsume(options, 'type', null);
    let resourceType = optionConsume(options, 'resourceType', 'image');
    let version = optionConsume(options, 'version');
    let transformation = generateTransformationString(options);
    const format = optionConsume(options, 'format');
    const cloudName = optionConsume(options, 'cloudName');
    const privateCdn = optionConsume(options, 'privateCdn');
    const secureDistribution = optionConsume(options, 'secureDistribution');
    const secure = optionConsume(options, 'secure', true);
    const cdnSubdomain = optionConsume(options, 'cdnSubdomain');
    const secureCdnSubdomain = optionConsume(options, 'secureCdnSubdomain');
    const cname = optionConsume(options, 'cname');
    const shorten = optionConsume(options, 'shorten');
    const urlSuffix = optionConsume(options, 'urlSuffix');
    const useRootPath = optionConsume(options, 'useRootPath');

    const preloaded = /^(image|raw)\/([a-z0-9_]+)\/v(\d+)\/([^#]+)$/.exec(publicId);
    if (preloaded) {
      resourceType = preloaded[1];
      type = preloaded[2];
      version = preloaded[3];
      publicId = preloaded[4];
    }
    const originalSource = publicId;
    if (publicId == null) {
      return originalSource;
    }

    if (type === null && publicId.match(/^https?:\//i)) {
      return originalSource;
    }
    const finalizedResourceType = finalizeResourceType(resourceType, type,
        urlSuffix, useRootPath, shorten);

    resourceType = finalizedResourceType[0];
    type = finalizedResourceType[1];

    const finalizedSource = finalizeSource(publicId, format, urlSuffix);
    publicId = finalizedSource[0];
    const sourceToSign = finalizedSource[1];

    if (sourceToSign.indexOf('/') > 0 && !sourceToSign.match(/^v[0-9]+/) && !sourceToSign.match(/^https?:\//)) {
      if (version == null) {
        version = 1;
      }
    }
    if (version != null) {
      version = `v${version}`;
    }
    transformation = transformation.replace(/([^:])\/\//g, '$1/');

    const prefix = unsignedUrlPrefix(publicId, cloudName, privateCdn,
        cdnSubdomain, secureCdnSubdomain, cname, secure, secureDistribution);

    url = [prefix, resourceType, type, transformation,
      version, publicId].filter(function(part) {
      return (part != null) && part !== '';
    }).join('/');
  }

  return url;
}

/**
 * Converts the string to boolean
 * @param {string} value to convert to boolean
 */
export function getAsBoolean(value) {
  return value === '1' ||
    value === 'TRUE' ||
    value === 'true' ||
    value === 'True';
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
 * @param {string} source
 * @param {string} cloudName
 * @param {boolean} privateCdn
 * @param {string} cdnSubdomain
 * @param {boolean} secureCdnSubdomain
 * @param {string} cname
 * @param {boolean} secure
 * @param {boolean} secureDistribution
 * @return {string} The generated prefix
 */
function unsignedUrlPrefix(source, cloudName, privateCdn, cdnSubdomain,
  secureCdnSubdomain, cname, secure, secureDistribution) {
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
      secureCdnSubdomain = cdnSubdomain;
    }

    if (secureCdnSubdomain) {
      secureDistribution = secureDistribution.replace('res.cloudinary.com',
          'res-' + ((crc32(source) % 5) + 1 + '.cloudinary.com'));
    }

    prefix = 'https://' + secureDistribution;
  } else if (cname) {
    const subdomain = cdnSubdomain ? 'a' + ((crc32(source) % 5) + 1) + '.' : '';
    prefix = 'http://' + subdomain + cname;
  } else {
    const cdnParn = privateCdn ? cloudName + '-' : '';
    const subdomainPart = cdnSubdomain ? '-' + ((crc32(source) % 5) + 1) : '';
    const host = [cdnParn, 'res', subdomainPart, '.cloudinary.com'].join('');
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
function patchFetchFormat(options = {}) {
  if (options.type === 'fetch') {
    if (options.fetchFormat == null) {
      options.fetchFormat = optionConsume(options, 'format');
    }
  }
}

/**
 *
 * @param {Object} options
 * @param {string} optionName
 * @param {any} defaultValue
 * @return {any}
 */
function optionConsume(options, optionName, defaultValue) {
  const result = options[optionName];
  delete options[optionName];
  if (result != null) {
    return result;
  } else {
    return defaultValue;
  }
}

/**
 *
 * @param {string} resourceType
 * @param {string} type
 * @param {string} urlSuffix
 * @param {boolean} useRootPath
 * @param {boolean} shorten
 * @return {[string]}
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
  return [resourceType, type];
}

/**
 *
 * @param {string} source
 * @param {string} format
 * @param {string} urlSuffix
 * @return {[string]}
 */
function finalizeSource(source, format, urlSuffix) {
  let sourceToSign;
  source = source.replace(/([^:])\/\//g, '$1/');
  if (source.match(/^https?:\//i)) {
    source = smartEscape(source);
    sourceToSign = source;
  } else {
    source = encodeURIComponent(decodeURIComponent(source)).replace(/%3A/g, ':').replace(/%2F/g, '/');
    sourceToSign = source;
    if (!!urlSuffix) {
      if (urlSuffix.match(/[\.\/]/)) {
        throw new Error('urlSuffix should not include . or /');
      }
      source = source + '/' + urlSuffix;
    }
    if (format != null) {
      source = source + '.' + format;
      sourceToSign = sourceToSign + '.' + format;
    }
  }
  return [source, sourceToSign];
}

/**
 *
 * @param {string} string
 * @param {string} unsafe
 * @return {string}
 */
function smartEscape(string, unsafe = /([^a-zA-Z0-9_.\-\/:]+)/g) {
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
      optionConsume(options,'width'));
  const height = optionConsume(options, 'transformationHeight',
      optionConsume(options,'height'));
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
    b: background,
    bo: border,
    e: effect,
    f: fetchFormat,
    q: quality,
  };

  const responsive = {
    dpr: dprValue,
    ar: aspectRatio,
    c: crop,
    g: gravity,
    h: height,
    w: width,
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
 * @param {Object} transformation
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
  return value != null && (String(value)).length > 0;
}

