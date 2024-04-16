import {listenOncePromise} from '#utils/event-helper';

export function simulateKeyboardInteraction(win, input, key) {
  const promise = listenOncePromise(input, 'keypress');
  const keyCode = key.charCodeAt(0);
  const keydown = new win.KeyboardEvent('keydown', {key, keyCode});
  const keypress = new win.KeyboardEvent('keypress', {key, keyCode});
  input.dispatchEvent(keydown);
  input.dispatchEvent(keypress);
  return promise;
}
