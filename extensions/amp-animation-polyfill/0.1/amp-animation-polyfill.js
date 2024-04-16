import {installWebAnimations} from 'web-animations-js/web-animations.install';

import {Services} from '#service';

/**
 * Tries to find an existing amp-lightbox-gallery, if there is none, it adds a
 * default one.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<undefined>}
 */
export function install(ampdoc) {
  installWebAnimations(ampdoc.win);
}
Services.extensionsFor(AMP.win).addDocFactory(install);
