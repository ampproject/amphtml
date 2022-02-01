import {dev} from '#utils/log';

/** @enum {string} */
export const VideoDockingEvents = {
  DISMISS_ON_TAP: 'dock-dismiss-on-tap',
  SCROLL_BACK: 'dock-scroll-back',
};

/**
 * @param {!MouseEvent|!TouchEvent} e
 * @return {{x: number, y: number}}
 * @package
 */
export function pointerCoords(e) {
  const coords = e.touches ? e.touches[0] : e;
  return {
    x: dev().assertNumber('x' in coords ? coords.x : coords.clientX),
    y: dev().assertNumber('y' in coords ? coords.y : coords.clientY),
  };
}
