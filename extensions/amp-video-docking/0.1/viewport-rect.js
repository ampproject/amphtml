import {layoutRectLtwh} from '#core/dom/layout/rect';

/**
 * @param {function():T} get
 * @return {{get: function():T, configurable: boolean, enumerable: boolean}}
 * @template T
 */
const readonlyGetterProp = (get) => ({
  get,
  configurable: false,
  enumerable: true,
});

/**
 * Returns a `LayoutRectDef`-like object whose values match the viewport's area
 * accoding to service.
 * @param {!../../../src/service/viewport/viewport-interface.ViewportInterface} viewport
 * @return {import('./rect').LayoutRectDef} with dynamic getters
 */
export function createViewportRect(viewport) {
  const width = readonlyGetterProp(() => viewport.getSize().width);
  const height = readonlyGetterProp(() => viewport.getSize().height);

  return /** @type {!LayoutRectDef} */ (
    Object.defineProperties(layoutRectLtwh(0, 0, 0, 0), {
      width,
      height,
      right: width,
      bottom: height,
    })
  );
}
