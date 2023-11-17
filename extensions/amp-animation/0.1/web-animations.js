import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import {
  closestAncestorElementBySelector,
  matches,
  scopedQuerySelector,
  scopedQuerySelectorAll,
} from '#core/dom/query';
import {computedStyle, getVendorJsPropertyName} from '#core/dom/style';
import {isEnumValue, isObject} from '#core/types';
import {isArray, toArray} from '#core/types/array';
import {map} from '#core/types/object';
import {dashToCamelCase} from '#core/types/string';

import {isExperimentOn} from '#experiments';

import {dev, devAssert, user, userAssert} from '#utils/log';

import {parseCss} from './parsers/css-expr';
import {CssNumberNode, CssTimeNode, isVarCss} from './parsers/css-expr-ast';
import {extractKeyframes} from './parsers/keyframes-extractor';
import {NativeWebAnimationRunner} from './runners/native-web-animation-runner';
import {ScrollTimelineWorkletRunner} from './runners/scrolltimeline-worklet-runner';
import {
  InternalWebAnimationRequestDef,
  WebAnimationDef,
  WebAnimationSelectorDef,
  WebAnimationSubtargetDef,
  WebAnimationTimingDef,
  WebAnimationTimingDirection,
  WebAnimationTimingFill,
  WebCompAnimationDef,
  WebKeyframeAnimationDef,
  WebKeyframesDef,
  WebMultiAnimationDef,
  WebSwitchAnimationDef,
  isAllowlistedProp,
} from './web-animation-types';

import {isInFie} from '../../../src/iframe-helper';
import {getMode} from '../../../src/mode';
import {assertHttpsUrl, resolveRelativeUrl} from '../../../src/url';

/** @const {string} */
const TAG = 'amp-animation';
const TARGET_ANIM_ID = '__AMP_ANIM_ID';

/**
 * Auto-incrementing ID generator for internal animation uses.
 * See `TARGET_ANIM_ID`.
 * @type {number}
 */
let animIdCounter = 0;

/**
 * @const {!{[key: string]: boolean}}
 */
const SERVICE_PROPS = {
  'offset': true,
  'easing': true,
};

/**
 * Clip-path is an only CSS property we allow for animation that may require
 * vendor prefix. And it's always "-webkit". Use a simple map to avoid
 * expensive lookup for all other properties.
 */
const ADD_PROPS = {
  'clip-path': '-webkit-clip-path',
  'clipPath': '-webkit-clip-path',
};

/**
 * The scanner for the `WebAnimationDef` format. It calls the appropriate
 * callbacks based on the discovered animation types.
 * @abstract
 */
class Scanner {
  /**
   * @param {!WebAnimationDef|!Array<!WebAnimationDef>} spec
   * @return {boolean}
   */
  scan(spec) {
    if (isArray(spec)) {
      // Returns `true` if any of the components scan successfully.
      return spec.reduce((acc, comp) => this.scan(comp) || acc, false);
    }

    // Check whether the animation is enabled.
    if (!this.isEnabled(/** @type {!WebAnimationDef} */ (spec))) {
      return false;
    }

    // WebAnimationDef: (!WebMultiAnimationDef|!WebSpecAnimationDef|
    //                   !WebCompAnimationDef|!WebKeyframeAnimationDef)
    if (spec.animations) {
      this.onMultiAnimation(/** @type {!WebMultiAnimationDef} */ (spec));
    } else if (spec.switch) {
      this.onSwitchAnimation(/** @type {!WebSwitchAnimationDef} */ (spec));
    } else if (spec.animation) {
      this.onCompAnimation(/** @type {!WebCompAnimationDef} */ (spec));
    } else if (spec.keyframes) {
      this.onKeyframeAnimation(/** @type {!WebKeyframeAnimationDef} */ (spec));
    } else {
      this.onUnknownAnimation(spec);
    }
    return true;
  }

  /**
   * Whether the animation spec is enabled.
   * @param {!WebAnimationDef} unusedSpec
   * @return {boolean}
   */
  isEnabled(unusedSpec) {
    return true;
  }

  /**
   * @param {!WebMultiAnimationDef} unusedSpec
   * @abstract
   */
  onMultiAnimation(unusedSpec) {}

  /**
   * @param {!WebSwitchAnimationDef} unusedSpec
   * @abstract
   */
  onSwitchAnimation(unusedSpec) {}

  /**
   * @param {!WebCompAnimationDef} unusedSpec
   * @abstract
   */
  onCompAnimation(unusedSpec) {}

  /**
   * @param {!WebKeyframeAnimationDef} unusedSpec
   * @abstract
   */
  onKeyframeAnimation(unusedSpec) {}

  /** @param {!Object} unusedSpec */
  onUnknownAnimation(unusedSpec) {
    throw dev().createError(
      'unknown animation type: must have "animations" or "keyframes" field'
    );
  }
}

/**
 * Builds animation runners based on the provided spec.
 */
export class Builder {
  /**
   * @param {!Window} win
   * @param {!Document|!ShadowRoot} rootNode
   * @param {string} baseUrl
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   * @param {!../../../src/service/owners-interface.OwnersInterface} owners
   * @param {!./web-animation-types.WebAnimationBuilderOptionsDef=} options
   */
  constructor(win, rootNode, baseUrl, vsync, owners, options = {}) {
    /** @const @private */
    this.win_ = win;

    /** @const @private */
    this.css_ = new CssContextImpl(win, rootNode, baseUrl, options);

    /** @const @private */
    this.vsync_ = vsync;

    /** @const @private */
    this.owners_ = owners;

    /** @const @private {!Array<!Element>} */
    this.targets_ = [];

    /** @const @private {!Array<!Promise>} */
    this.loaders_ = [];
  }

  /**
   * Creates the animation runner for the provided spec. Waits for all
   * necessary resources to be loaded before the runner is resolved.
   * @param {!WebAnimationDef|!Array<!WebAnimationDef>} spec
   * @param {?WebAnimationDef=} opt_args
   * @param {?JsonObject=} opt_positionObserverData
   * @return {!Promise<!./runners/animation-runner.AnimationRunner>}
   */
  createRunner(spec, opt_args, opt_positionObserverData = null) {
    return this.resolveRequests([], spec, opt_args).then((requests) => {
      if (getMode().localDev || getMode().development) {
        user().fine(TAG, 'Animation: ', requests);
      }
      return Promise.all(this.loaders_).then(() => {
        return this.isAnimationWorkletSupported_() && opt_positionObserverData
          ? new ScrollTimelineWorkletRunner(
              this.win_,
              requests,
              opt_positionObserverData
            )
          : new NativeWebAnimationRunner(requests);
      });
    });
  }

  /**
   * @param {!Array<string>} path
   * @param {!WebAnimationDef|!Array<!WebAnimationDef>} spec
   * @param {?WebAnimationDef|undefined} args
   * @param {?Element} target
   * @param {?number} index
   * @param {?{[key: string]: *}} vars
   * @param {?WebAnimationTimingDef} timing
   * @return {!Promise<!Array<!InternalWebAnimationRequestDef>>}
   * @protected
   */
  resolveRequests(
    path,
    spec,
    args,
    target = null,
    index = null,
    vars = null,
    timing = null
  ) {
    const scanner = this.createScanner_(path, target, index, vars, timing);
    return this.vsync_.measurePromise(() =>
      scanner.resolveRequests(spec, args)
    );
  }

  /**
   * @param {!Element} target
   * @protected
   */
  requireLayout(target) {
    if (!this.targets_.includes(target)) {
      this.targets_.push(target);
      this.loaders_.push(this.owners_.requireLayout(target));
    }
  }

  /**
   * @param {!Array<string>} path
   * @param {?Element} target
   * @param {?number} index
   * @param {?{[key: string]: *}} vars
   * @param {?WebAnimationTimingDef} timing
   * @private
   * @return {*} TODO(#23582): Specify return type
   */
  createScanner_(path, target, index, vars, timing) {
    return new MeasureScanner(
      this,
      this.css_,
      path,
      target,
      index,
      vars,
      timing
    );
  }

  /**
   * @return {boolean} Whether animationWorklet can be used.
   * @private
   */
  isAnimationWorkletSupported_() {
    return (
      isExperimentOn(this.win_, 'chrome-animation-worklet') &&
      'animationWorklet' in CSS &&
      getMode(this.win_).runtime != 'inabox' &&
      !isInFie(this.win_.document.documentElement)
    );
  }
}

/**
 * The scanner that evaluates all expressions and builds the final
 * `AnimationRunner` instance for the target animation. It must be
 * executed in the "measure" vsync phase.
 */
export class MeasureScanner extends Scanner {
  /**
   * @param {!Builder} builder
   * @param {!CssContextImpl} css
   * @param {!Array<string>} path
   * @param {?Element} target
   * @param {?number} index
   * @param {?{[key: string]: *}} vars
   * @param {?WebAnimationTimingDef} timing
   */
  constructor(builder, css, path, target, index, vars, timing) {
    super();

    /** @const @private */
    this.builder_ = builder;

    /** @const @private */
    this.css_ = css;

    /** @const @private */
    this.path_ = path;

    /** @private {?Element} */
    this.target_ = target;

    /** @private {?number} */
    this.index_ = index;

    /** @private {!{[key: string]: *}} */
    this.vars_ = vars || map();

    /** @private {!WebAnimationTimingDef} */
    this.timing_ = timing || {
      duration: 0,
      delay: 0,
      endDelay: 0,
      iterations: 1,
      iterationStart: 0,
      easing: 'linear',
      direction: WebAnimationTimingDirection.NORMAL,
      fill: WebAnimationTimingFill.NONE,
    };

    /** @private {!Array<!InternalWebAnimationRequestDef>} */
    this.requests_ = [];

    /**
     * Dependencies required to resolve all animation requests. In case of
     * composition, all requests can only be resolved asynchronously. This
     * dependencies are used to block `resolveRequests` to collect all
     * dependenices.
     * @const @private {!Array<!Promise>}
     */
    this.deps_ = [];
  }

  /**
   * This methods scans all animation declarations specified in `spec`
   * recursively to produce the animation requests. `opt_args` is an additional
   * spec that can be used to default timing and variables.
   * @param {!WebAnimationDef|!Array<!WebAnimationDef>} spec
   * @param {?WebAnimationDef=} opt_args
   * @return {!Promise<!Array<!InternalWebAnimationRequestDef>>}
   */
  resolveRequests(spec, opt_args) {
    if (opt_args) {
      this.with_(opt_args, () => {
        this.scan(spec);
      });
    } else {
      this.css_.withVars(this.vars_, () => {
        this.scan(spec);
      });
    }
    return Promise.all(this.deps_).then(() => this.requests_);
  }

  /** @override */
  isEnabled(spec) {
    if (spec.media && !this.css_.matchMedia(spec.media)) {
      return false;
    }
    if (spec.supports && !this.css_.supports(spec.supports)) {
      return false;
    }
    return true;
  }

  /** @override */
  onMultiAnimation(spec) {
    this.with_(spec, () => this.scan(spec.animations));
  }

  /** @override */
  onSwitchAnimation(spec) {
    // The first to match will be used; the rest will be ignored.
    this.with_(spec, () => {
      for (let i = 0; i < spec.switch.length; i++) {
        const candidate = spec.switch[i];
        if (this.scan(candidate)) {
          // First matching candidate is applied and the rest are ignored.
          break;
        }
      }
    });
  }

  /** @override */
  onCompAnimation(spec) {
    userAssert(
      this.path_.indexOf(spec.animation) == -1,
      `Recursive animations are not allowed: "${spec.animation}"`
    );
    const newPath = this.path_.concat(spec.animation);
    const animationElement = user().assertElement(
      this.css_.getElementById(spec.animation),
      `Animation not found: "${spec.animation}"`
    );
    // Currently, only `<amp-animation>` supplies animations. In the future
    // this could become an interface.
    userAssert(
      animationElement.tagName == 'AMP-ANIMATION',
      `Element is not an animation: "${spec.animation}"`
    );
    const otherSpecPromise = animationElement.getImpl().then((impl) => {
      return impl.getAnimationSpec();
    });
    this.with_(spec, () => {
      const {
        index_: index,
        target_: target,
        timing_: timing,
        vars_: vars,
      } = this;
      const promise = otherSpecPromise
        .then((otherSpec) => {
          if (!otherSpec) {
            return;
          }
          return this.builder_.resolveRequests(
            newPath,
            otherSpec,
            /* args */ null,
            target,
            index,
            vars,
            timing
          );
        })
        .then((requests) => {
          /** @type {!Array} */ (requests).forEach((request) =>
            this.requests_.push(request)
          );
        });
      this.deps_.push(promise);
    });
  }

  /** @override */
  onKeyframeAnimation(spec) {
    this.with_(spec, () => {
      const target = user().assertElement(this.target_, 'No target specified');
      const keyframes = this.createKeyframes_(target, spec);
      this.requests_.push({
        target,
        keyframes,
        vars: this.vars_,
        timing: this.timing_,
      });
    });
  }

  /**
   * @param {!Element} target
   * @param {!WebKeyframeAnimationDef} spec
   * @return {!WebKeyframesDef}
   * @private
   */
  createKeyframes_(target, spec) {
    let specKeyframes = spec.keyframes;
    if (typeof specKeyframes == 'string') {
      // Keyframes name to be extracted from `<style>`.
      const keyframes = extractKeyframes(this.css_.rootNode, specKeyframes);
      userAssert(
        keyframes,
        `Keyframes not found in stylesheet: "${specKeyframes}"`
      );
      specKeyframes = keyframes;
    }

    if (isObject(specKeyframes)) {
      // Property -> keyframes form.
      // The object is cloned, while properties are verified to be
      // allowlisted. Additionally, the `offset:0` frames are inserted
      // to polyfill partial keyframes per spec.
      // See https://github.com/w3c/web-animations/issues/187
      const object = /** @type {!{[key: string]: *}} */ (specKeyframes);
      /** @type {!WebKeyframesDef} */
      const keyframes = {};
      for (const prop in object) {
        this.validateProperty_(prop);
        const value = object[prop];
        let preparedValue;
        if (SERVICE_PROPS[prop]) {
          preparedValue = value;
        } else if (!isArray(value) || value.length == 1) {
          // Missing "from" value. Measure and add.
          const fromValue = this.css_.measure(target, prop);
          const toValue = isArray(value) ? value[0] : value;
          preparedValue = [fromValue, this.css_.resolveCss(toValue)];
        } else {
          preparedValue = value.map((v) => this.css_.resolveCss(v));
        }
        keyframes[prop] = preparedValue;
        if (prop in ADD_PROPS) {
          keyframes[ADD_PROPS[prop]] = preparedValue;
        }
      }
      return keyframes;
    }

    if (isArray(specKeyframes) && specKeyframes.length > 0) {
      // Keyframes -> property form.
      // The array is cloned, while properties are verified to be allowlisted.
      // Additionally, if the `offset:0` properties are inserted when absent
      // to polyfill partial keyframes per spec.
      // See https://github.com/w3c/web-animations/issues/187 and
      // https://github.com/web-animations/web-animations-js/issues/14
      const array = /** @type {!Array<!{[key: string]: *}>} */ (specKeyframes);
      /** @type {!WebKeyframesDef} */
      const keyframes = [];
      const addStartFrame = array.length == 1 || array[0].offset > 0;
      const startFrame = addStartFrame
        ? map()
        : this.css_.resolveCssMap(array[0]);
      keyframes.push(startFrame);
      const start = addStartFrame ? 0 : 1;
      for (let i = start; i < array.length; i++) {
        const frame = array[i];
        for (const prop in frame) {
          if (SERVICE_PROPS[prop]) {
            continue;
          }
          this.validateProperty_(prop);
          if (!startFrame[prop]) {
            // Missing "from" value. Measure and add to start frame.
            startFrame[prop] = this.css_.measure(target, prop);
          }
        }
        keyframes.push(this.css_.resolveCssMap(frame));
      }
      for (let i = 0; i < keyframes.length; i++) {
        const frame = keyframes[i];
        for (const k in ADD_PROPS) {
          if (k in frame) {
            frame[ADD_PROPS[k]] = frame[k];
          }
        }
      }
      return keyframes;
    }

    // TODO(dvoytenko): support CSS keyframes per https://github.com/w3c/web-animations/issues/189
    // Unknown form of keyframes spec.
    throw user().createError('keyframes not found', specKeyframes);
  }

  /** @override */
  onUnknownAnimation() {
    throw user().createError(
      'unknown animation type:' +
        ' must have "animation", "animations" or "keyframes" field'
    );
  }

  /**
   * @param {string} prop
   * @private
   */
  validateProperty_(prop) {
    if (SERVICE_PROPS[prop]) {
      return;
    }
    userAssert(
      isAllowlistedProp(prop),
      'Property is not allowlisted for animation: %s',
      prop
    );
  }

  /**
   * Resolves common parameters of an animation: target, timing and vars.
   * @param {!WebAnimationDef} spec
   * @param {function()} callback
   * @private
   */
  with_(spec, callback) {
    // Save context.
    const {
      index_: prevIndex,
      target_: prevTarget,
      timing_: prevTiming,
      vars_: prevVars,
    } = this;

    // Push new context and perform calculations.
    const targets =
      spec.target || spec.selector ? this.resolveTargets_(spec) : [null];
    this.css_.setTargetLength(targets.length);
    targets.forEach((target, index) => {
      this.target_ = target || prevTarget;
      this.index_ = target ? index : prevIndex;
      this.css_.withTarget(this.target_, this.index_, () => {
        const subtargetSpec = this.target_
          ? this.matchSubtargets_(this.target_, this.index_ || 0, spec)
          : spec;
        this.vars_ = this.mergeVars_(subtargetSpec, prevVars);
        this.css_.withVars(this.vars_, () => {
          this.timing_ = this.mergeTiming_(subtargetSpec, prevTiming);
          callback();
        });
      });
    });

    // Restore context.
    this.target_ = prevTarget;
    this.index_ = prevIndex;
    this.vars_ = prevVars;
    this.timing_ = prevTiming;
  }

  /**
   * @param {!WebAnimationDef} spec
   * @return {!Array<!Element>}
   * @private
   */
  resolveTargets_(spec) {
    let targets;
    if (spec.selector) {
      userAssert(!spec.target, 'Both "selector" and "target" are not allowed');
      targets = this.css_.queryElements(spec.selector);
      if (targets.length == 0) {
        user().warn(TAG, `Target not found: "${spec.selector}"`);
      }
    } else if (spec.target) {
      if (typeof spec.target == 'string') {
        // TODO(dvoytenko, #9129): cleanup deprecated string targets.
        user().error(TAG, 'string targets are deprecated');
      }
      const target = user().assertElement(
        typeof spec.target == 'string'
          ? this.css_.getElementById(spec.target)
          : spec.target,
        `Target not found: "${spec.target}"`
      );
      targets = [target];
    } else if (this.target_) {
      targets = [this.target_];
    }
    targets.forEach((target) => this.builder_.requireLayout(target));
    return targets;
  }

  /**
   * @param {!Element} target
   * @param {number} index
   * @param {!WebAnimationSelectorDef} spec
   * @return {!WebAnimationSelectorDef}
   */
  matchSubtargets_(target, index, spec) {
    if (!spec.subtargets || spec.subtargets.length == 0) {
      return spec;
    }
    const result = map(spec);
    spec.subtargets.forEach((subtargetSpec) => {
      const matcher = this.getMatcher_(subtargetSpec);
      if (matcher(target, index)) {
        Object.assign(result, subtargetSpec);
      }
    });
    return result;
  }

  /**
   * @param {!WebAnimationSubtargetDef} spec
   * @return {function(!Element, number):boolean}
   */
  getMatcher_(spec) {
    if (spec.matcher) {
      return spec.matcher;
    }
    userAssert(
      (spec.index !== undefined || spec.selector !== undefined) &&
        (spec.index === undefined || spec.selector === undefined),
      'Only one "index" or "selector" must be specified'
    );

    let matcher;
    if (spec.index !== undefined) {
      // Match by index, e.g. `index: 0`.
      const specIndex = Number(spec.index);
      matcher = (target, index) => index === specIndex;
    } else {
      // Match by selector, e.g. `:nth-child(2n+1)`.
      const specSelector = /** @type {string} */ (spec.selector);
      matcher = (target) => {
        try {
          return matches(target, specSelector);
        } catch (e) {
          throw user().createError(
            `Bad subtarget selector: "${specSelector}"`,
            e
          );
        }
      };
    }
    return (spec.matcher = matcher);
  }

  /**
   * Merges vars by defaulting values from the previous vars.
   * @param {!{[key: string]: *}} newVars
   * @param {!{[key: string]: *}} prevVars
   * @return {!{[key: string]: *}}
   * @private
   */
  mergeVars_(newVars, prevVars) {
    // First combine all vars (previous and new) in one map. The new vars take
    // precedence. This is done so that the new vars can be resolved from both
    // the previous and new vars.
    const result = map(prevVars);
    for (const k in newVars) {
      if (k.startsWith('--')) {
        result[k] = newVars[k];
      }
    }
    this.css_.withVars(result, () => {
      for (const k in newVars) {
        if (k.startsWith('--')) {
          result[k] = this.css_.resolveCss(newVars[k]);
        }
      }
    });
    return result;
  }

  /**
   * Merges timing by defaulting values from the previous timing.
   * @param {!WebAnimationTimingDef} newTiming
   * @param {!WebAnimationTimingDef} prevTiming
   * @return {!WebAnimationTimingDef}
   * @private
   */
  mergeTiming_(newTiming, prevTiming) {
    // CSS time values in milliseconds.
    const duration = this.css_.resolveMillis(
      newTiming.duration,
      prevTiming.duration
    );
    const delay = this.css_.resolveMillis(newTiming.delay, prevTiming.delay);
    const endDelay = this.css_.resolveMillis(
      newTiming.endDelay,
      prevTiming.endDelay
    );

    // Numeric.
    const iterations = this.css_.resolveNumber(
      newTiming.iterations,
      dev().assertNumber(prevTiming.iterations)
    );
    const iterationStart = this.css_.resolveNumber(
      newTiming.iterationStart,
      prevTiming.iterationStart
    );

    // Identifier CSS values.
    const easing = this.css_.resolveIdent(newTiming.easing, prevTiming.easing);
    const direction = /** @type {!WebAnimationTimingDirection} */ (
      this.css_.resolveIdent(newTiming.direction, prevTiming.direction)
    );
    const fill = /** @type {!WebAnimationTimingFill} */ (
      this.css_.resolveIdent(newTiming.fill, prevTiming.fill)
    );

    // Validate.
    this.validateTime_(duration, newTiming.duration, 'duration');
    this.validateTime_(delay, newTiming.delay, 'delay', /* negative */ true);
    this.validateTime_(endDelay, newTiming.endDelay, 'endDelay');
    userAssert(
      iterations != null && iterations >= 0,
      '"iterations" is invalid: %s',
      newTiming.iterations
    );
    userAssert(
      iterationStart != null && iterationStart >= 0 && isFinite(iterationStart),
      '"iterationStart" is invalid: %s',
      newTiming.iterationStart
    );

    userAssert(
      isEnumValue(WebAnimationTimingDirection, direction),
      `Unknown direction: ${direction}`
    );

    userAssert(
      isEnumValue(WebAnimationTimingFill, fill),
      `Unknown fill: ${fill}`
    );

    return {
      duration,
      delay,
      endDelay,
      iterations,
      iterationStart,
      easing,
      direction,
      fill,
    };
  }

  /**
   * @param {number|undefined} value
   * @param {*} newValue
   * @param {string} field
   * @param {boolean=} opt_allowNegative
   * @private
   */
  validateTime_(value, newValue, field, opt_allowNegative) {
    // Ensure that positive or zero values are only allowed.
    userAssert(
      value != null && (value >= 0 || (value < 0 && opt_allowNegative)),
      '"%s" is invalid: %s',
      field,
      newValue
    );
    // Make sure that the values are in milliseconds: show a warning if
    // time is fractional.
    if (newValue != null && Math.floor(value) != value && value < 1) {
      user().warn(
        TAG,
        `"${field}" is fractional.` +
          ' Note that all times are in milliseconds.'
      );
    }
  }
}

/**
 * @implements {./parsers/css-expr-ast.CssContext}
 */
class CssContextImpl {
  /**
   * @param {!Window} win
   * @param {!Document|!ShadowRoot} rootNode
   * @param {string} baseUrl
   * @param {!./web-animation-types.WebAnimationBuilderOptionsDef} options
   */
  constructor(win, rootNode, baseUrl, options) {
    const {scaleByScope = false, scope = null} = options;

    /** @const @private */
    this.win_ = win;

    /** @const @private {!Document|!ShadowRoot} */
    this.rootNode_ = rootNode;

    /** @const @private {?Element} */
    this.scope_ = scope;

    /** @const @private {boolean} */
    this.scaleByScope_ = scaleByScope;

    /** @const @private */
    this.baseUrl_ = baseUrl;

    /** @private {!{[key: string]: !CSSStyleDeclaration}} */
    this.computedStyleCache_ = map();

    /** @private {!{[key: string]: ?./parsers/css-expr-ast.CssNode}} */
    this.parsedCssCache_ = map();

    /** @private {?number} */
    this.targetLength_ = null;

    /** @private {?Element} */
    this.currentTarget_ = null;

    /** @private {?number} */
    this.currentIndex_ = null;

    /** @private {?{[key: string]: *}} */
    this.vars_ = null;

    /** @private {!Array<string>} */
    this.varPath_ = [];

    /** @private {?string} */
    this.dim_ = null;

    /**
     * @private {?{
     *   size: {width: number, height: number},
     *   offset: {x: number, y: number},
     *   scaleFactorX: number,
     *   scaleFactorY: number,
     * }}
     */
    this.viewportParams_ = null;
  }

  /** @return {!Document|!ShadowRoot} */
  get rootNode() {
    return this.rootNode_;
  }

  /**
   * @param {string} mediaQuery
   * @return {boolean}
   */
  matchMedia(mediaQuery) {
    return this.win_.matchMedia(mediaQuery).matches;
  }

  /**
   * @param {string} query
   * @return {boolean}
   */
  supports(query) {
    if (this.win_.CSS && this.win_.CSS.supports) {
      return this.win_.CSS.supports(query);
    }
    return false;
  }

  /**
   * @param {string} id
   * @return {?Element}
   */
  getElementById(id) {
    return this.scopedQuerySelector_(`#${escapeCssSelectorIdent(id)}`);
  }

  /**
   * @param {string} selector
   * @return {!Array<!Element>}
   */
  queryElements(selector) {
    try {
      return toArray(this.scopedQuerySelectorAll_(selector));
    } catch (e) {
      throw user().createError(`Bad query selector: "${selector}"`, e);
    }
  }

  /**
   * @param {!Element} target
   * @param {string} prop
   * @return {string}
   */
  measure(target, prop) {
    // Get ID.
    let targetId = target[TARGET_ANIM_ID];
    if (!targetId) {
      targetId = String(++animIdCounter);
      target[TARGET_ANIM_ID] = targetId;
    }

    // Get and cache styles.
    let styles = this.computedStyleCache_[targetId];
    if (!styles) {
      styles = computedStyle(this.win_, target);
      this.computedStyleCache_[targetId] = /** @type {!CSSStyleDeclaration} */ (
        styles
      );
    }

    // Resolve a var or a property.
    return prop.startsWith('--')
      ? styles.getPropertyValue(prop)
      : styles[getVendorJsPropertyName(styles, dashToCamelCase(prop))];
  }

  /**
   * @param {number} len
   * @protected
   */
  setTargetLength(len) {
    this.targetLength_ = len;
  }

  /**
   * @param {?Element} target
   * @param {?number} index
   * @param {function(?Element):T} callback
   * @return {T}
   * @template T
   * @protected
   */
  withTarget(target, index, callback) {
    const {currentIndex_: prevIndex, currentTarget_: prev} = this;
    this.currentTarget_ = target;
    this.currentIndex_ = index;
    const result = callback(target);
    this.currentTarget_ = prev;
    this.currentIndex_ = prevIndex;
    return result;
  }

  /**
   * @param {?{[key: string]: *}} vars
   * @param {function():T} callback
   * @return {T}
   * @template T
   * @protected
   */
  withVars(vars, callback) {
    const prev = this.vars_;
    this.vars_ = vars;
    const result = callback();
    this.vars_ = prev;
    return result;
  }

  /**
   * @param {*} input
   * @return {string}
   * @protected
   */
  resolveCss(input) {
    // Will always return a valid string, since the default value is `''`.
    return dev().assertString(
      this.resolveCss_(input, /* def */ '', /* normalize */ true)
    );
  }

  /**
   * @param {!{[key: string]: *}} input
   * @return {!{[key: string]: string|number}}
   */
  resolveCssMap(input) {
    const result = map();
    for (const k in input) {
      if (k == 'offset') {
        result[k] = input[k];
      } else {
        result[k] = this.resolveCss(input[k]);
      }
    }
    return result;
  }

  /**
   * @param {*} input
   * @param {string|undefined} def
   * @return {string|undefined}
   */
  resolveIdent(input, def) {
    return this.resolveCss_(input, def, /* normalize */ false);
  }

  /**
   * @param {*} input
   * @param {number|undefined} def
   * @return {number|undefined}
   */
  resolveMillis(input, def) {
    if (input != null && input !== '') {
      if (typeof input == 'number') {
        return input;
      }
      const node = this.resolveAsNode_(input, /* normalize */ false);
      if (node) {
        return CssTimeNode.millis(node);
      }
    }
    return def;
  }

  /**
   * @param {*} input
   * @param {number|undefined} def
   * @return {number|undefined}
   */
  resolveNumber(input, def) {
    if (input != null && input !== '') {
      if (typeof input == 'number') {
        return input;
      }
      const node = this.resolveAsNode_(input, /* normalize */ false);
      if (node) {
        return CssNumberNode.num(node);
      }
    }
    return def;
  }

  /**
   * @param {*} input
   * @param {string|undefined} def
   * @param {boolean} normalize
   * @return {string|undefined}
   * @private
   */
  resolveCss_(input, def, normalize) {
    if (input == null || input === '') {
      return def;
    }
    const inputCss = String(input);
    if (typeof input == 'number') {
      return inputCss;
    }
    // Test first if CSS contains any variable components. Otherwise, there's
    // no need to spend cycles to parse/evaluate.
    if (!isVarCss(inputCss, normalize)) {
      return inputCss;
    }
    const result = this.resolveAsNode_(inputCss, normalize);
    return result != null ? result.css() : def;
  }

  /**
   * @param {*} input
   * @param {boolean} normalize
   * @return {?./parsers/css-expr-ast.CssNode}
   * @private
   */
  resolveAsNode_(input, normalize) {
    if (input == null || input === '') {
      return null;
    }
    if (typeof input == 'number') {
      return new CssNumberNode(input);
    }
    // Check if the expression has already been parsed. Notice that the parsed
    // value could be `null`.
    const css = String(input);
    let node = this.parsedCssCache_[css];
    if (node === undefined) {
      node = parseCss(css);
      this.parsedCssCache_[css] = node;
    }
    if (!node) {
      return null;
    }
    return node.resolve(this, normalize);
  }

  /**
   * @return {!Element}
   * @private
   */
  requireTarget_() {
    return user().assertElement(
      this.currentTarget_,
      'Only allowed when target is specified'
    );
  }

  /** @override */
  getVar(varName) {
    userAssert(
      this.varPath_.indexOf(varName) == -1,
      `Recursive variable: "${varName}"`
    );
    this.varPath_.push(varName);
    const rawValue =
      this.vars_ && this.vars_[varName] != undefined
        ? this.vars_[varName]
        : this.currentTarget_
          ? this.measure(this.currentTarget_, varName)
          : null;
    if (rawValue == null || rawValue === '') {
      user().warn(TAG, `Variable not found: "${varName}"`);
    }
    // No need to normalize vars - they will be normalized later.
    const result = this.resolveAsNode_(rawValue, /* normalize */ false);
    this.varPath_.pop();
    return result;
  }

  /** @override */
  withDimension(dim, callback) {
    const savedDim = this.dim_;
    this.dim_ = dim;
    const result = callback();
    this.dim_ = savedDim;
    return result;
  }

  /** @override */
  getDimension() {
    return this.dim_;
  }

  /** @override */
  getViewportSize() {
    return this.getViewportParams_().size;
  }

  /** @private */
  getViewportParams_() {
    if (!this.viewportParams_) {
      if (this.scope_ && this.scaleByScope_) {
        const rect = this.scope_./*OK*/ getBoundingClientRect();
        const {offsetHeight, offsetWidth} = this.scope_;
        this.viewportParams_ = {
          offset: {x: rect.x, y: rect.y},
          size: {width: offsetWidth, height: offsetHeight},
          scaleFactorX: offsetWidth / (rect.width || 1),
          scaleFactorY: offsetHeight / (rect.height || 1),
        };
      } else {
        const {innerHeight, innerWidth} = this.win_;
        this.viewportParams_ = {
          offset: {x: 0, y: 0},
          size: {width: innerWidth, height: innerHeight},
          scaleFactorX: 1,
          scaleFactorY: 1,
        };
      }
    }
    return this.viewportParams_;
  }

  /** @override */
  getCurrentIndex() {
    this.requireTarget_();
    return dev().assertNumber(this.currentIndex_);
  }

  /** @override */
  getTargetLength() {
    this.requireTarget_();
    return dev().assertNumber(this.targetLength_);
  }

  /** @override */
  getCurrentFontSize() {
    return this.getElementFontSize_(this.requireTarget_());
  }

  /** @override */
  getRootFontSize() {
    return this.getElementFontSize_(this.win_.document.documentElement);
  }

  /**
   * @param {!Element} target
   * @return {number}
   * @private
   */
  getElementFontSize_(target) {
    return parseFloat(this.measure(target, 'font-size'));
  }

  /** @override */
  getCurrentElementRect() {
    return this.getElementRect_(this.requireTarget_());
  }

  /** @override */
  getElementRect(selector, selectionMethod) {
    return this.getElementRect_(this.getElement_(selector, selectionMethod));
  }

  /**
   * @param {string} selector
   * @param {?string} selectionMethod
   * @return {!Element}
   * @private
   */
  getElement_(selector, selectionMethod) {
    devAssert(
      selectionMethod == null || selectionMethod == 'closest',
      'Unknown selection method: %s',
      selectionMethod
    );
    let element;
    try {
      if (selectionMethod == 'closest') {
        const maybeFoundInScope = closestAncestorElementBySelector(
          this.requireTarget_(),
          selector
        );
        if (
          maybeFoundInScope &&
          (!this.scope_ || this.scope_.contains(maybeFoundInScope))
        ) {
          element = maybeFoundInScope;
        }
      } else {
        element = this.scopedQuerySelector_(selector);
      }
    } catch (e) {
      throw user().createError(`Bad query selector: "${selector}"`, e);
    }
    return user().assertElement(element, `Element not found: ${selector}`);
  }

  /**
   * @param {!Element} target
   * @return {!../../../src/layout-rect.LayoutRectDef}
   * @private
   */
  getElementRect_(target) {
    const {offset, scaleFactorX, scaleFactorY} = this.getViewportParams_();
    const {height, width, x, y} = target./*OK*/ getBoundingClientRect();

    // This assumes default `transform-origin: center center`
    return layoutRectLtwh(
      (x - offset.x) * scaleFactorX,
      (y - offset.y) * scaleFactorY,
      width * scaleFactorX,
      height * scaleFactorY
    );
  }

  /** @override */
  resolveUrl(url) {
    const resolvedUrl = resolveRelativeUrl(url, this.baseUrl_);
    return assertHttpsUrl(resolvedUrl, this.currentTarget_ || '');
  }

  /**
   * @param {string} selector
   * @return {?Element}
   * @private
   */
  scopedQuerySelector_(selector) {
    if (this.scope_) {
      return /*OK*/ scopedQuerySelector(this.scope_, selector);
    }
    return this.rootNode_./*OK*/ querySelector(selector);
  }

  /**
   * @param {string} selector
   * @return {!NodeList}
   * @private
   */
  scopedQuerySelectorAll_(selector) {
    if (this.scope_) {
      return /*OK*/ scopedQuerySelectorAll(this.scope_, selector);
    }
    return this.rootNode_./*OK*/ querySelectorAll(selector);
  }
}
