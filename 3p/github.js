import {userAssert} from '#utils/log';

import {writeScript} from './3p';

/**
 * Get the correct script for the gist.
 *
 * Use writeScript: Failed to execute 'write' on 'Document': It isn't possible
 * to write into a document from an asynchronously-loaded external script unless
 * it is explicitly opened.
 *
 * @param {!Window} global
 * @param {string} scriptSource The source of the script, different for post and comment embeds.
 * @param {function()} cb
 */
function getGistJs(global, scriptSource, cb) {
  writeScript(global, scriptSource, function () {
    cb();
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function github(global, data) {
  userAssert(
    data.gistid,
    'The data-gistid attribute is required for <amp-gist> %s',
    data.element
  );

  let gistUrl =
    'https://gist.github.com/' + encodeURIComponent(data.gistid) + '.js';

  if (data.file) {
    gistUrl += '?file=' + encodeURIComponent(data.file);
  }

  getGistJs(global, gistUrl, function () {
    // Dimensions are given by the parent frame.
    delete data.width;
    delete data.height;
    const gistContainer = global.document.querySelector('#c .gist');

    // get all links in the embed
    const gistLinks = global.document.querySelectorAll('.gist-meta a');
    for (let i = 0; i < gistLinks.length; i++) {
      // have the links open in a new tab #8587
      gistLinks[i].target = '_BLANK';
    }

    context.updateDimensions(
      gistContainer./*OK*/ offsetWidth,
      gistContainer./*OK*/ offsetHeight
    );
  });
}
