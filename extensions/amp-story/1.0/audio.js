import {Services} from '#service';

/**
 * @const {string}
 */
const BACKGROUND_AUDIO_ELEMENT_CLASS_NAME = 'i-amphtml-story-background-audio';

/**
 * Adds support for the background-audio property on the specified element.
 * @param {!Element} element The element to upgrade with support for background
 *     audio.
 * @param {boolean=} loop
 * @return {?Element} audioEl
 */
export function upgradeBackgroundAudio(element, loop = true) {
  if (!element.hasAttribute('background-audio')) {
    return null;
  }
  const audioEl = element.ownerDocument.createElement('audio');
  const audioSrc = Services.urlForDoc(element).assertHttpsUrl(
    element.getAttribute('background-audio'),
    element
  );
  audioEl.setAttribute('src', audioSrc);
  audioEl.setAttribute('preload', 'auto');
  if (loop) {
    audioEl.setAttribute('loop', '');
  }
  audioEl.setAttribute('autoplay', '');
  audioEl.setAttribute('muted', '');
  audioEl.muted = true;
  audioEl.classList.add(BACKGROUND_AUDIO_ELEMENT_CLASS_NAME);
  element.appendChild(audioEl);

  return audioEl;
}
