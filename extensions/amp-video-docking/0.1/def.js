/**
 * These are interchangeable.
 * @typedef {!ClientRect|!../../../src/layout-rect.LayoutRectDef}
 */
export let RectDef;

/** @enum {string} */
export const DIRECTION_X_ENUM = {LEFT: 'left', RIGHT: 'right'};

/** @enum {string} */
export const DIRECTION_Y_ENUM = {TOP: 'top', BOTTOM: 'bottom'};

/** A loose small decimal amount to compensate for rough float calculations. */
export const FLOAT_TOLERANCE = 0.02;
