import {devAssertElement} from '#core/assert';
import {tryResolve} from '#core/data-structures/promise';
import {setStyles} from '#core/dom/style';
import {devExpectedError} from '#core/error';

/**
 * @param {Window} win
 * @return {Promise<boolean>}
 */
export function detectIsAutoplaySupported(win) {
  // To detect autoplay, we create a video element and call play on it, if
  // `paused` is true after `play()` call, autoplay is supported. Although
  // this is unintuitive, it works across browsers and is currently the lightest
  // way to detect autoplay without using a data source.
  const detectionElement = /** @type {HTMLVideoElement} */ (
    win.document.createElement('video')
  );

  // NOTE(aghassemi): We need both attributes and properties due to Chrome and
  // Safari differences when dealing with non-attached elements.
  detectionElement.setAttribute('muted', '');
  detectionElement.setAttribute('playsinline', '');
  detectionElement.setAttribute('webkit-playsinline', '');
  detectionElement.setAttribute('height', '0');
  detectionElement.setAttribute('width', '0');

  detectionElement.muted = true;
  detectionElement.playsInline = true;
  /** @type {*} */ (detectionElement)['playsinline'] = true;
  /** @type {*} */ (detectionElement)['webkitPlaysinline'] = true;

  setStyles(detectionElement, {
    position: 'fixed',
    top: '0',
    width: '0',
    height: '0',
    opacity: '0',
  });

  // Promise wrapped this way to catch both sync throws and async rejections.
  // More info: https://github.com/tc39/proposal-promise-try
  playIgnoringError(detectionElement);
  return Promise.resolve(!detectionElement.paused);
}

const AUTOPLAY_SUPPORTED_WIN_PROP = '__AMP_AUTOPLAY';

/**
 * Determines autoplay support.
 *
 * Note that even if platfrom supports autoplay, users or browsers can disable
 * autoplay to save data / battery. This detects both platfrom support and
 * when autoplay has been disabled by the user.
 *
 * @param {Window} win
 * @return {Promise<boolean>}
 */
export function isAutoplaySupported(win) {
  if (win[AUTOPLAY_SUPPORTED_WIN_PROP] == null) {
    win[AUTOPLAY_SUPPORTED_WIN_PROP] = detectIsAutoplaySupported(win);
  }
  return /** @type {Promise<boolean>} */ (win[AUTOPLAY_SUPPORTED_WIN_PROP]);
}

/**
 * @param {Window} win
 * @visibleForTesting
 */
export function resetIsAutoplaySupported(win) {
  delete win[AUTOPLAY_SUPPORTED_WIN_PROP];
}

/**
 * @param {Element} element
 * @return {Element}
 */
export function getInternalVideoElementFor(element) {
  const el = element.querySelector('video, iframe');
  devAssertElement(el);
  return el;
}

/**
 * @typedef {{
 *   play: (function(boolean): Promise<undefined>|undefined)
 * }}
 */
let VideoOrBaseElementPlayableDef;

/**
 * Tries to play the media element, marking any rejected error as an expected
 * error for reproting.
 *
 * @param {HTMLMediaElement|VideoOrBaseElementPlayableDef} element
 * @param {boolean=} isAutoplay
 * @return {Promise<void>}
 */
export function tryPlay(element, isAutoplay) {
  // Some browsers return undefined, some a boolean, and some a real promise.
  // Using tryResolve coerces all of those into a real promise.
  const promise = tryResolve(() => element.play(!!isAutoplay));
  // Fork the promise chain to report any rejected error as expected. We don't
  // return the promise returned by `.catch()` so that we don't
  // introduce any new microtasks.
  promise.catch((err) => {
    devExpectedError('TRYPLAY', err);
  });
  return promise;
}

/**
 * Plays the media element, discarding any error without reporting it.
 *
 * @param {HTMLMediaElement} element
 */
export function playIgnoringError(element) {
  // Some browsers return undefined, some a boolean, and some a real promise.
  // Using tryResolve coerces all of those into a real promise.
  tryResolve(() => element.play()).catch(() => {
    // Empty catch to prevent useless unhandled promise rejection logging.
    // Play can fail for many reasons such as video getting paused before
    // play() is finished.
    // We use events to know the state of the video and do not care about
    // the success or failure of the play()'s returned promise.
  });
}
