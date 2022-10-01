import {isPromise} from '#core/types';

import {useLayoutEffect, useState} from '#preact';

/** @typedef {import('./types').RendererFunction} RendererFunction */
/** @typedef {import('preact').VNode<*>} VNode */

/**
 * Runs the renderer. It's critical that the `data` argument is stable - it
 * only changes when the actual data changes. The renderer itself is resolved
 * in a layout effect and allows the result to be a promise.
 *
 * @param {RendererFunction} renderer
 * @param {JsonObject} data
 * @return {VNode|null}
 */
export function useRenderer(renderer, data) {
  const [value, setValue] = useState(/** @type {VNode|null} */ (null));

  useLayoutEffect(() => {
    const rendered = (renderer && renderer(data)) || null;
    if (isPromise(rendered)) {
      let canceled = false;
      rendered.then((result) => {
        if (!canceled) {
          setValue(result);
        }
      });
      return () => {
        canceled = true;
      };
    } else {
      setValue(/** @type {VNode} */ (rendered));
    }
  }, [renderer, data]);

  return value;
}
