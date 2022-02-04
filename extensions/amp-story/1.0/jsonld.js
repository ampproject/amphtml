import {isJsonLdScriptTag} from '#core/dom';
import {tryParseJson} from '#core/types/object/json';

import {user} from '#utils/log';

const TAG = 'getJsonLd';

/**
 * @param {!Node} root
 * @return {?JsonObject}
 */
export function getJsonLd(root) {
  const scriptTag = root.querySelector('script[type="application/ld+json"]');

  if (!scriptTag || !isJsonLdScriptTag(scriptTag)) {
    return null;
  }

  return (
    tryParseJson(scriptTag.textContent, (e) => {
      user().error(TAG, 'Failed to parse ld+json. Is it valid JSON?', e);
    }) || null
  );
}
