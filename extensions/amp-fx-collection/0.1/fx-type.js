import {devAssert, user, userAssert} from '#utils/log';

const TAG = 'amp-fx-collection';

/**
 * @private Visible for testing only!
 * @const {!Array<string>}
 */
export const validFxTypes = [
  // Keep alphabetically sorted.
  // Or don't. I'm just a sign, not a cop.
  'fade-in',
  'fade-in-scroll',
  'float-in-bottom',
  'float-in-top',
  'fly-in-bottom',
  'fly-in-left',
  'fly-in-right',
  'fly-in-top',
  'parallax',
];

/**
 * Enum for list of supported visual effects.
 * Make sure to also define each respective binding set below (FxBindings).
 * Naming is enforced via tests.
 * @enum {string}
 */
export const FxType = {
  // Intentional awkward usage of arrays here. It's to make sure we have no
  // duplication and that the type keys (which are only for reference)
  // get DCE'd.
  //
  // Keep alphabetically sorted.
  // Or don't. I'm just a sign, not a cop.
  FADE_IN: validFxTypes[0],
  FADE_IN_SCROLL: validFxTypes[1],
  FLOAT_IN_BOTTOM: validFxTypes[2],
  FLOAT_IN_TOP: validFxTypes[3],
  FLY_IN_BOTTOM: validFxTypes[4],
  FLY_IN_LEFT: validFxTypes[5],
  FLY_IN_RIGHT: validFxTypes[6],
  FLY_IN_TOP: validFxTypes[7],
  PARALLAX: validFxTypes[8],
};

/**
 * FX observes:
 *  - POSITION: a PositionObserver
 *  - SCROLL_TOGGLE: a toggling mechanism on scroll similar to browser UI
 *
 * Different observation mechanisms have different implementations and internal
 * APIs. See AmpFxCollection.install_().
 * @enum {number}
 */
export const FxObservesSignal = {
  POSITION: 0,
  SCROLL_TOGGLE: 1,
};

/**
 * Defines the aspects an FX is bound to.
 *  - `observes` either POSITION or SCROLL_TOGGLE.
 *  - `translates` the ax(i|e)s this FX translates elements on. Optional.
 *  - `opacity` whether this FX changes opacity. Optional.
 *
 * Two FX are compatible and therefore combinable IFF:
 *  1. both observe the same signal
 *  2. neither translates along the same axis
 *  3. only one or none of them changes opacity
 * @typedef {{
 *  observes: !FxObservesSignal,
 *  opacity: (boolean|undefined),
 *  translates: ({
 *    x: (boolean|undefined),
 *    y: (boolean|undefined),
 *  }|undefined),
 * }}
 */
let FxBindingDef;

/**
 * Include respective `FxType`s here.
 * @package @const {!{[key: !FxType]: !FxBindingDef}}
 */
export const FxBindings = {
  [FxType.FADE_IN]: {
    observes: FxObservesSignal.POSITION,
    opacity: true,
  },
  [FxType.FADE_IN_SCROLL]: {
    observes: FxObservesSignal.POSITION,
    opacity: true,
  },
  [FxType.FLOAT_IN_BOTTOM]: {
    observes: FxObservesSignal.SCROLL_TOGGLE,
    translates: {y: true},
  },
  [FxType.FLOAT_IN_TOP]: {
    observes: FxObservesSignal.SCROLL_TOGGLE,
    translates: {y: true},
  },
  [FxType.FLY_IN_BOTTOM]: {
    observes: FxObservesSignal.POSITION,
    translates: {y: true},
  },
  [FxType.FLY_IN_LEFT]: {
    observes: FxObservesSignal.POSITION,
    translates: {x: true},
  },
  [FxType.FLY_IN_RIGHT]: {
    observes: FxObservesSignal.POSITION,
    translates: {x: true},
  },
  [FxType.FLY_IN_TOP]: {
    observes: FxObservesSignal.POSITION,
    translates: {y: true},
  },
  [FxType.PARALLAX]: {
    observes: FxObservesSignal.POSITION,
    translates: {y: true},
  },
};

/**
 * @param {FxType} fxTypeA
 * @param {FxType} fxTypeB
 * @return {boolean}
 * @private
 */
export function isValidTypeCombination(fxTypeA, fxTypeB) {
  if (fxTypeA == fxTypeB) {
    return false;
  }

  const {
    observes: observesA,
    opacity: opacityA,
    translates: translatesA,
  } = FxBindings[fxTypeA];

  const {
    observes: observesB,
    opacity: opacityB,
    translates: translatesB,
  } = FxBindings[fxTypeB];

  // If they observe different signals, they're restricted.
  if (observesA !== observesB) {
    return false;
  }

  // If they both change opacity, they're restricted.
  if (opacityA && opacityB) {
    return false;
  }

  // If they translate along the same axis, they're restricted.
  if (translatesA && translatesB) {
    if (translatesA.x && translatesB.x) {
      return false;
    }
    if (translatesA.y && translatesB.y) {
      return false;
    }
  }

  return true;
}

/**
 * @param {string} type
 * @return {boolean}
 */
export function userAssertIsValidType(type) {
  return userAssert(
    validFxTypes.indexOf(type) > -1,
    'Invalid amp-fx type `%s`',
    type
  );
}

/**
 * Returns the array of fx types this component has specified as a
 * space-separated list in the value of `amp-fx` attribute.
 * e.g. `amp-fx="parallax fade-in"
 *
 * @param {!Element} element
 * @return {!Array<!FxType>}
 */
export function getFxTypes(element) {
  devAssert(element.hasAttribute('amp-fx'));
  const fxTypes = element
    .getAttribute('amp-fx')
    .trim()
    .toLowerCase()
    .split(/\s+/);

  userAssert(fxTypes.length, 'No value provided for `amp-fx` attribute');

  return sanitizeFxTypes(fxTypes.filter(userAssertIsValidType));
}

/**
 * Removes the conflicting types from an array of fx types.
 * Kept by order.
 *
 * e.g. `['parallax', 'fly-in-left'] -> ['parallax']`
 *
 * This will modify the array in place.
 *
 * @param {!Array<!FxType>} types
 * @return {!Array<!FxType>}
 */
export function sanitizeFxTypes(types) {
  for (let i = 0; i < types.length; i++) {
    const fxTypeA = types[i];
    for (let j = i + 1; j < types.length; j++) {
      const fxTypeB = types[j];
      if (!isValidTypeCombination(fxTypeA, fxTypeB)) {
        user().warn(
          TAG,
          "%s preset can't be combined with %s preset as the resulting " +
            "animation isn't valid.",
          fxTypeA,
          fxTypeB
        );
        types.splice(j--, 1);
      }
    }
  }
  return types;
}
