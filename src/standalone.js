import {Services} from '#service';

import {ChunkPriority, chunk} from './chunk';
import {isAmphtml} from './format';

/**
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installStandaloneExtension(ampdoc) {
  const {win} = ampdoc;
  // Only enabled when the document is tagged as <html amp> or <html ⚡>.
  if (!isAmphtml(win.document)) {
    return;
  }

  if (!Services.platformFor(ampdoc.win).isStandalone()) {
    return;
  }

  chunk(
    ampdoc,
    () => {
      Services.extensionsFor(win)
        .installExtensionForDoc(ampdoc, 'amp-standalone')
        .then(() => Services.standaloneServiceForDoc(ampdoc.getBody()))
        .then((standaloneService) => standaloneService.initialize());
    },
    ChunkPriority.LOW
  );
}
