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
  // Extract props
  const {color, height, playlistId, secretToken, trackId, visual} = props;

  const iframeRef = useRef(null);

  // Process URL
  const url =
    'https://api.soundcloud.com/' +
    (trackId != undefined ? 'tracks' : 'playlists') +
    '/';

  const mediaid = trackId != undefined ? trackId : playlistId;
  const secret = secretToken;

  let src =
    'https://w.soundcloud.com/player/?' +
    'url=' +
    encodeURIComponent(url + mediaid);

  if (secret) {
    // It's very important the entire thing is encoded, since it's part of
    // the `url` query param added above.
    src += encodeURIComponent('?secret_token=' + secret);
  }
  if (visual === true) {
    src += '&visual=true';
  } else if (color) {
    src += '&color=' + encodeURIComponent(color);
  }

  useEffect(() => {
    //

    /** Unmount Procedure */
    return () => {
      iframeRef.current.contentWindow./*OK*/ postMessage(
        JSON.stringify(dict({'method': 'pause'})),
        'https://w.soundcloud.com'
      );

      iframeRef.current = null;
    };
  }, []);

  return (
    <div>
      <iframe
        title="soundcloud"
        ref={iframeRef}
        width="100%"
        height={height}
        scrolling="no"
        frameborder="no"
        allow="autoplay"
        src={src}
      />
    </div>
  );
}
