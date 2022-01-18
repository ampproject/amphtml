import {useLayoutEffect, useState} from '#preact';

/**
 * Runs the renderer. It's critical that the `data` argument is stable - it
 * only changes when the actual data changes. The renderer itself is resolved
 * in a layout effect and allows the result to be a promise.
 *
 * @param {?RendererFunctionType|undefined} renderer
 * @param {JsonObject} data
 * @return {?RendererFunctionResponseType}
 */
export function useRenderer(renderer, data) {
  const [value, setValue] = useState(
    /** @type {?RendererFunctionResponseType} */ (null)
  );

  useLayoutEffect(() => {
    const rendered = (renderer && renderer(data)) || null;
    if (rendered && typeof rendered['then'] == 'function') {
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
      setValue(/** @type {?RendererFunctionResponseType} */ (rendered));
    }
  }, [renderer, data]);

  return value;
}
