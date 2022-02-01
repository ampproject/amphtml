import {parseJson} from '#core/types/object/json';

import * as Preact from '#preact';
import {useCallback, useEffect, useRef} from '#preact';
import {useValueRef} from '#preact/component';
import {IframeEmbed} from '#preact/component/iframe';

import {getData} from '#utils/event-helper';

const MATCHES_MESSAGING_ORIGIN = (origin) => {
  return origin === 'https://w.soundcloud.com';
};

/**
 * @param {!BentoSoundcloudDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoSoundcloud({
  color,
  onLoad,
  playlistId,
  secretToken,
  trackId,
  visual = false,
  ...rest
}) {
  // Property and Reference Variables
  const iframeRef = useRef(null);
  const onLoadRef = useValueRef(onLoad);

  useEffect(() => {
    /** Unmount Procedure */
    return () => {
      // Pause widget
      iframeRef.current?.contentWindow?./*OK*/ postMessage(
        JSON.stringify({'method': 'pause'}),
        'https://w.soundcloud.com'
      );

      // Release iframe resources
      iframeRef.current = null;
    };
  }, []);

  const messageHandler = useCallback(
    (event) => {
      const data = parseJson(getData(event));
      if (data.method === 'ready') {
        onLoadRef.current?.();
      }
    },
    [onLoadRef]
  );

  // Checking for valid props
  if (!checkProps(trackId, playlistId)) {
    return null;
  }

  // Build Base URL
  const url =
    'https://api.soundcloud.com/' +
    (trackId != undefined ? 'tracks' : 'playlists') +
    '/';

  // Extract Media ID
  const mediaId = trackId ?? playlistId;

  // Prepare BentoSoundcloud Widget URL for iFrame
  let iframeSrc =
    'https://w.soundcloud.com/player/?' +
    'url=' +
    encodeURIComponent(url + mediaId);

  if (secretToken) {
    // It's very important the entire thing is encoded, since it's part of
    // the `url` query param added above.
    iframeSrc += encodeURIComponent('?secret_token=' + secretToken);
  }

  if (visual) {
    iframeSrc += '&visual=true';
  } else if (color) {
    iframeSrc += '&color=' + encodeURIComponent(color);
  }

  return (
    <IframeEmbed
      allow="autoplay"
      frameborder="no"
      ref={iframeRef}
      scrolling="no"
      src={iframeSrc}
      title={'Soundcloud Widget - ' + mediaId}
      messageHandler={messageHandler}
      matchesMessagingOrigin={MATCHES_MESSAGING_ORIGIN}
      {...rest}
    />
  );
}

/**
 * Verify required props and throw error if necessary.
 * @param {string|undefined} trackId
 * @param {string|undefined} playlistId
 * @return {boolean} true on valid
 */
function checkProps(trackId, playlistId) {
  // Perform manual checking as assertion is not available for Bento: Issue #32739
  if (playlistId == undefined && trackId === undefined) {
    displayWarning(
      'data-trackid or data-playlistid is required for <amp-soundcloud>'
    );
    return false;
  }
  return true;
}

/**
 * @param {?string} message
 */
function displayWarning(message) {
  console /*OK*/
    .warn(message);
}
