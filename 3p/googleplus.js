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

import {getStyle, setStyles} from '../src/style';
import {loadScript} from './3p';

/**
 * Produces the Twitter API object for the passed in callback. If the current
 * frame is the master frame it makes a new one by injecting the respective
 * script, otherwise it schedules the callback for the script from the master
 * window.
 * @param {!Window} global
 * @param {function(!Object)} cb
 */
function getGooglePlus(global, cb) {
  // Loads gapi
  loadScript(global, 'https://apis.google.com/js/platform.js', () => {
    cb(global.gapi);
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function googleplus(global, data) {
  setStyles(global.document.getElementById('c'), {
    overflow: 'auto',
  });
  const post = global.document.createElement('div');
  post.id = 'gp-post';

  let internalIframe = null;
  let heightUpdated = false;
  const isMutationDone = () => !!internalIframe && heightUpdated;

  // DOMNodeLoaded is deprecated; Use observer instead
  let mutObserver = null;
  const mutConfig = {attributes: true, childList: true};
  const mutCallback = mutationList => {
    for (let i = 0; i < mutationList.length; i++) {
      const mutation = mutationList[i];
      if (mutation.type == 'childList') {
        const addedNodesLength = mutation.addedNodes.length;
        if (addedNodesLength > 0) {
          for (let j = 0; j < addedNodesLength; i++) {
            const node = mutation.addedNodes[j];
            // Use nodeName in case not element
            if (!internalIframe && node.nodeName.toLowerCase() == 'iframe') {
              internalIframe = node;
              // TODO(kqian): this iframe is not currently used
              // I can use this iframe to access contentDocument for styling
              // However, this might not be a good attempt
              // since we should use messages to communicate with iframe
              break;
            }
          }
        }
      } else if (mutation.type == 'attributes') {
        // gapi will attempt to change height of post
        // after the post is fully prepared
        // capture the attempt and update dimensions
        if (mutation.attributeName == 'style') {
          const newWidth = getStyle(post, 'width');
          const newHeight = getStyle(post, 'height');
          // occasionally these are set with '100%'
          if (newWidth.substr(newWidth.length - 2, 2) == 'px' &&
              newHeight.substr(newWidth.length - 2, 2) == 'px') {
            context.updateDimensions(
                parseInt(newWidth, 10), // auto remove suffix 'px'
                parseInt(newHeight, 10)
            );
            heightUpdated = true;
          }
        }
      }
      if (isMutationDone()) {
        // Stop listening
        mutObserver.disconnect();
      }
    }
  };

  // Ensure appending iframe and changing style will always be captured
  mutObserver = new MutationObserver(mutCallback);
  mutObserver.observe(post, mutConfig);

  setStyles(post, {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });
  global.document.getElementById('c').appendChild(post);
  getGooglePlus(global, function(gapi) {
    // Dimensions are given by the parent frame.
    delete data.width;
    delete data.height;

    // non-blocking (actually probably not needed as in iframe)
    // TODO(kqian): I should remove Promise...
    new Promise(resolve => {
      setStyles(post, {
        overflow: 'auto',
      });
      try {
        gapi.post.render(post, {
          href: `https://plus.google.com/${data.gpid}/posts/${data.postid}`,
        });
        resolve();
      } catch (e) {
        // Fail silently for now...
      }
    });
  });
}
