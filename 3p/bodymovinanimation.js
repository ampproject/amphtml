import {setStyles} from '#core/dom/style';
import {tryPlay} from '#core/dom/video';
import {parseJson} from '#core/types/object/json';

import {getData} from '#utils/event-helper';

import {loadScript} from './3p';

const libSourceUrl = {
  'canvas':
    'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.7.6/lottie_canvas.min.js',
  'html':
    'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.7.6/lottie_html.min.js',
  'svg':
    'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.7.6/lottie_svg.min.js',
};

/**
 * Produces the AirBnB Bodymovin Player SDK object for the passed in callback.
 * @param {!Window} global
 * @param {function(!Object)} cb
 */

let animationHandler;

/**
 * @param {!Window} global
 * @param {string} renderer
 * @param {!Function} cb
 */
function getBodymovinAnimationSdk(global, renderer, cb) {
  const scriptToLoad = libSourceUrl[renderer] ?? libSourceUrl['svg'];
  loadScript(global, scriptToLoad, function () {
    cb(global.bodymovin);
  });
}

/**
 * @param {!Event} event
 */
function parseMessage(event) {
  const eventMessage = parseJson(getData(event));
  const action = eventMessage['action'];
  if (action == 'play') {
    tryPlay(animationHandler);
  } else if (action == 'pause') {
    animationHandler.pause();
  } else if (action == 'stop') {
    animationHandler.stop();
  } else if (action == 'seekTo') {
    if (eventMessage['valueType'] === 'time') {
      animationHandler.goToAndStop(eventMessage['value']);
    } else {
      const frameNumber = Math.round(
        eventMessage['value'] * animationHandler.totalFrames
      );
      animationHandler.goToAndStop(frameNumber, true);
    }
  }
}

/**
 * @param {!Window} global
 */
export function bodymovinanimation(global) {
  const dataReceived = parseJson(global.name)['attributes']._context;
  const dataLoop = dataReceived['loop'];
  const animatingContainer = global.document.createElement('div');
  setStyles(animatingContainer, {
    width: '100%',
    height: '100%',
  });

  global.document.getElementById('c').appendChild(animatingContainer);
  const shouldLoop = dataLoop != 'false';
  const loop = !isNaN(dataLoop) ? dataLoop : shouldLoop;
  const renderer = dataReceived['renderer'];
  getBodymovinAnimationSdk(global, renderer, function (bodymovin) {
    animationHandler = bodymovin.loadAnimation({
      container: animatingContainer,
      renderer,
      loop,
      autoplay: dataReceived['autoplay'],
      animationData: dataReceived['animationData'],
    });
    const message = JSON.stringify({
      'action': 'ready',
    });
    global.addEventListener('message', parseMessage, false);
    global.parent./*OK*/ postMessage(message, '*');
  });
}
