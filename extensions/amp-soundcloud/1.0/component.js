/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import * as Preact from '../../../src/preact';
import {dict} from '../../../src/core/types/object';
import {useEffect, useRef} from '../../../src/preact';

/**
 * @param {!SoundcloudDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function Soundcloud(props) {
  // Property and Reference Variables
  const {color, height, playlistId, secretToken, trackId, visual} = props;
  const iframeRef = useRef(null);

  // Perform manual checking as assertion is not available for Bento: Issue #32739
  if (playlistId == undefined && trackId === undefined) {
    console /*OK*/
      .error(
        'data-trackid or data-playlistid is required for <amp-soundcloud>'
      );
  }

  // Build Base URL
  const url =
    'https://api.soundcloud.com/' +
    (trackId != undefined ? 'tracks' : 'playlists') +
    '/';

  // Extract Media ID
  const mediaId = playlistId ? playlistId : trackId;

  // Prepare Soundcloud Widget URL for iFrame
  let src =
    'https://w.soundcloud.com/player/?' +
    'url=' +
    encodeURIComponent(url + mediaId);

  if (secretToken) {
    // It's very important the entire thing is encoded, since it's part of
    // the `url` query param added above.
    src += encodeURIComponent('?secret_token=' + secretToken);
  }

  if (visual === true) {
    src += '&visual=true';
  } else if (color) {
    src += '&color=' + encodeURIComponent(color);
  }

  // Prepare iframe for Soundcloud Widget
  const iframeElement = Preact.createElement('iframe', {
    allow: 'autoplay',
    frameborder: 'no',
    height,
    ref: iframeRef,
    scrolling: 'no',
    src,
    title: 'Soundcloud Widget - ' + {mediaId},
    width: '100%',
  });

  useEffect(() => {
    /** Unmount Procedure */
    return () => {
      // Pause widget
      iframeRef.current.contentWindow./*OK*/ postMessage(
        JSON.stringify(dict({'method': 'pause'})),
        'https://w.soundcloud.com'
      );

      // Release iframe resources
      iframeRef.current = null;
    };
  }, []);

  return {iframeElement};
}
