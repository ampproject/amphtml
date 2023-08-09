import {RAW_OBJECT_ARGS_KEY} from '#core/constants/action-constants';
import {AmpEvents_Enum} from '#core/constants/amp-events';
import {Deferred} from '#core/data-structures/promise';
import {Signals} from '#core/data-structures/signals';
import {isAmp4Email} from '#core/document/format';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {closestAncestorElementBySelector} from '#core/dom/query';
import {isFiniteNumber, isObject} from '#core/types';
import {findIndex, isArray, remove, toArray} from '#core/types/array';
import {debounce} from '#core/types/function';
import {deepMerge, getValueForExpr, map} from '#core/types/object';
import {deepEquals, parseJson} from '#core/types/object/json';

import {Services} from '#service';

import {createCustomEvent, getDetail} from '#utils/event-helper';
import {dev, devAssert, user} from '#utils/log';

import {BindEvents} from './bind-events';
import {BindValidator} from './bind-validator';

import {ChunkPriority_Enum, chunk} from '../../../src/chunk';
import {reportError} from '../../../src/error-reporting';
import {getMode} from '../../../src/mode';
import {rewriteAttributesForElement} from '../../../src/url-rewrite';
import {invokeWebWorker} from '../../../src/web-worker/amp-worker';

/** @const {string} */
const TAG = 'amp-bind';

/**
 * Regular expression that identifies AMP CSS classes.
 * Includes 'i-amphtml-', '-amp-', and 'amp-' prefixes.
 * @type {!RegExp}
 */
const AMP_CSS_RE = /^(i?-)?amp(html)?-/;

/**
 * Maximum depth for state merge.
 * @type {number}
 */
const MAX_MERGE_DEPTH = 10;

/** @const {!{[key: string]: !{[key: string]: boolean}}} */
const FORM_VALUE_PROPERTIES = {
  'INPUT': {
    'checked': true,
    'value': true,
  },
  'OPTION': {
    'selected': true,
  },
  'TEXTAREA': {
    'text': true,
    // amp-form relies on FORM_VALUE_CHANGE to update form validity state due
    // to value changes from amp-bind. However, disabled form elements always
    // report "valid" even if they have invalid values! A consequence is that
    // toggling `disabled` via amp-bind may affect validity, so we need to
    // inform amp-form about these too.
    'disabled': true,
  },
};

/**
 * A bound property, e.g. [property]="expression".
 * `previousResult` is the result of this expression during the last evaluation.
 * @typedef {{property: string, expressionString: string, previousResult: (BindExpressionResultDef|undefined)}}
 */
let BoundPropertyDef;

/**
 * A tuple containing a single element and all of its bound properties.
 * @typedef {{boundProperties: !Array<BoundPropertyDef>, element: !Element}}
 */
let BoundElementDef;

/**
 * The options bag for binding application.
 *
 * @typedef {Record} ApplyOptionsDef
 * @property {boolean=} skipAmpState If true, skips <amp-state> elements.
 * @property {Array<!Element>=} constrain If provided, restricts application to children of the provided elements.
 * @property {boolean=} evaluateOnly If provided, caches the evaluated result on each bound element and skips the actual DOM updates.
 */

/**
 * A map of tag names to arrays of attributes that do not have non-bind
 * counterparts. For instance, amp-carousel allows a `[slide]` attribute,
 * but does not support a `slide` attribute.
 * @const {!{[key: string]: !Array<string>}}
 */
const BIND_ONLY_ATTRIBUTES = map({
  'AMP-CAROUSEL': ['slide'],
  'AMP-LIST': ['is-layout-container'],
  'AMP-SELECTOR': ['selected'],
});

/**
 * Elements that opt-out of tree walking in favor of rescan() with {fast: true}.
 * @const {!Array<string>}
 */
const FAST_RESCAN_TAGS = ['AMP-LIST', 'AMP-RENDER'];

/**
 * Bind is an ampdoc-scoped service that handles the Bind lifecycle, from
 * scanning for bindings to evaluating expressions to mutating elements.
 */
export class Bind {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const @private {!Window} */
    this.win_ = ampdoc.win;

    /**
     * The window containing the document to scan.
     * May differ from the `ampdoc`'s window e.g. in FIE.
     * @const @private {!Window}
     */
    this.localWin_ = ampdoc.win;

    /**
     * Array of ActionInvocation.sequenceId values that have been invoked.
     * Used to ensure that only one "AMP.setState" or "AMP.pushState" action
     * may be triggered per event. Periodically cleared.
     * @const @private {!Array<number>}
     */
    this.actionSequenceIds_ = [];

    /** @const @private {!Function} */
    this.eventuallyClearActionSequenceIds_ = debounce(
      this.win_,
      () => {
        this.actionSequenceIds_.length = 0;
      },
      5000
    );

    /** @private {!Array<BoundElementDef>} */
    this.boundElements_ = [];

    /**
     * Maps expression string to the element(s) that contain it.
     * @private @const {!{[key: string]: !Array<!Element>}}
     */
    this.expressionToElements_ = map();

    /** @private {!../../../src/service/history-impl.History} */
    this.history_ = Services.historyForDoc(ampdoc);

    /** @private {!Array<string>} */
    this.overridableKeys_ = [];

    /**
     * Upper limit on total number of bindings.
     *
     * The initial value is set to 1000 which, based on ~2ms expression parse
     * time, caps "time to interactive" at ~2s after page load.
     *
     * User interactions can add new bindings (e.g. infinite scroll), so this
     * can increase over time to a final limit of 2000 bindings.
     *
     * @private {number}
     */
    this.maxNumberOfBindings_ = 1000;

    /** @const @private {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(ampdoc);

    /**
     * The current values of all bound expressions on the page.
     * @const @private {!JsonObject}
     */
    this.state_ = /** @type {!JsonObject} */ (map());

    /** @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /** @private {?./bind-validator.BindValidator} */
    this.validator_ = null;

    /** @const @private {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc);
    this.viewer_.onMessageRespond('premutate', this.premutate_.bind(this));

    /** @const @private {!Promise<!Document>} */
    this.rootNodePromise_ = ampdoc.whenFirstVisible().then(() => {
      // Otherwise, scan the root node of the ampdoc.
      return ampdoc.whenReady().then(() => ampdoc.getRootNode());
    });

    /**
     * Resolved when the service finishes scanning the document for bindings.
     * @const @private {Promise}
     */
    this.initializePromise_ = this.rootNodePromise_.then((root) =>
      this.initialize_(root)
    );

    /** @const @private {!Deferred} */
    this.addMacrosDeferred_ = new Deferred();

    /** @private {Promise} */
    this.setStatePromise_ = null;

    /** @private @const {!../../../src/utils/signals.Signals} */
    this.signals_ = new Signals();

    // Install debug tools.
    const g = self.AMP;
    g.printState = g.printState || this.debugPrintState_.bind(this);
    g.setState = g.setState || ((state) => this.setState(state));
    g.eval = g.eval || this.debugEvaluate_.bind(this);
  }

  /**
   * @return {!../../../src/utils/signals.Signals}
   */
  signals() {
    return this.signals_;
  }

  /**
   * Merges `state` into the current state and immediately triggers an
   * evaluation unless `skipEval` is false.
   * @param {!JsonObject} state
   * @param {!BindSetStateOptionsDef} opts options bag
   * @return {!Promise}
   */
  setState(state, opts = {}) {
    dev().info(TAG, 'setState (init=%s):', opts.skipEval, state);

    try {
      deepMerge(this.state_, state, MAX_MERGE_DEPTH);
    } catch (e) {
      user().error(TAG, 'Failed to merge result from AMP.setState().', e);
    }

    if (opts.skipEval) {
      return Promise.resolve();
    }

    const promise = this.initializePromise_
      .then(() => this.evaluate_())
      .then((results) =>
        this.apply_(results, {
          skipAmpState: opts.skipAmpState,
          constrain: opts.constrain,
        })
      );

    if (getMode().test) {
      promise.then(() => {
        this.dispatchEventForTesting_(BindEvents.SET_STATE);
      });
    }

    return (this.setStatePromise_ = promise);
  }

  /**
   * Executes an `AMP.setState()` or `AMP.pushState()` action.
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @return {!Promise}
   */
  invoke(invocation) {
    const {args, event, method, sequenceId, tagOrTarget} = invocation;

    // Store the sequenceId values of action invocations and only allow one
    // setState() or pushState() event per sequence.
    if (this.actionSequenceIds_.includes(sequenceId)) {
      user().error(TAG, 'One state action allowed per event.');
      return Promise.resolve();
    }
    this.actionSequenceIds_.push(sequenceId);
    // Flush stored sequence IDs five seconds after the last invoked action.
    this.eventuallyClearActionSequenceIds_();

    const expression = args[RAW_OBJECT_ARGS_KEY];
    if (expression) {
      // Increment bindings limit by 500 on each invocation to a max of 2000.
      this.maxNumberOfBindings_ = Math.min(
        2000,
        Math.max(1000, this.maxNumberOfBindings_ + 500)
      );

      this.signals_.signal('FIRST_MUTATE');

      const scope = {};
      if (event && getDetail(/** @type {!Event} */ (event))) {
        scope['event'] = getDetail(/** @type {!Event} */ (event));
      }
      switch (method) {
        case 'setState':
          return this.setStateWithExpression(expression, scope);
        case 'pushState':
          return this.pushStateWithExpression(expression, scope);
        default:
          return Promise.reject(
            dev().createError('Unrecognized method: %s.%s', tagOrTarget, method)
          );
      }
    } else {
      user().error(
        'AMP-BIND',
        'Please use the object-literal syntax, ' +
          'e.g. "AMP.setState({foo: \'bar\'})" instead of ' +
          '"AMP.setState(foo=\'bar\')".'
      );
    }
    return Promise.resolve();
  }

  /**
   * Parses and evaluates an expression with a given scope and merges the
   * resulting object into current state.
   * @param {string} expression
   * @param {!JsonObject} scope
   * @return {!Promise}
   */
  setStateWithExpression(expression, scope) {
    return this.evaluateExpression_(expression, scope).then((result) =>
      this.setStateAndUpdateHistory_(result)
    );
  }

  /**
   * Sanitizes a state object and merges the resulting object into the current
   * state.
   * @param {!JsonObject} state
   * @return {!Promise}
   */
  setStateWithObject(state) {
    // Sanitize and copy state
    const result = this.copyJsonObject_(state);
    if (!result) {
      return Promise.reject('Invalid state');
    }
    return this.setStateAndUpdateHistory_(result);
  }

  /**
   * Merges a state object into the current global state.
   * @param {!JsonObject} state
   * @return {!Promise}
   * @private
   */
  setStateAndUpdateHistory_(state) {
    dev().info(TAG, 'setState:', state);
    this.setStatePromise_ = this.setState(state)
      .then(() => this.getDataForHistory_())
      .then((data) => {
        // Don't bother calling History.replace with empty data.
        if (data) {
          this.history_.replace(data);
        }
      });
    return this.setStatePromise_;
  }

  /**
   * Same as setStateWithExpression() except also pushes new history.
   * Popping the new history stack entry will restore the values of variables
   * in `expression`.
   * @param {string} expression
   * @param {!JsonObject} scope
   * @return {!Promise}
   */
  pushStateWithExpression(expression, scope) {
    dev().info(TAG, 'pushState:', expression);
    return this.evaluateExpression_(expression, scope).then((result) => {
      // Store the current values of each referenced variable in `expression`
      // so that we can restore them on history-pop.
      const oldState = map();
      Object.keys(result).forEach((variable) => {
        const value = this.state_[variable];
        // Store a deep copy of `value` to make sure `oldState` isn't
        // modified by subsequent setState() actions.
        oldState[variable] = this.copyJsonObject_(value);
      });

      const onPop = () => this.setState(oldState);
      return this.setState(result)
        .then(() => this.getDataForHistory_())
        .then((data) => {
          this.history_.push(onPop, data);
        });
    });
  }

  /**
   * Returns data that should be saved in browser history on AMP.setState() or
   * AMP.pushState(). This enables features like restoring browser tabs.
   * @return {!Promise<?JsonObject>}
   */
  getDataForHistory_() {
    const data = {
      'data': {'amp-bind': this.state_},
      'title': this.localWin_.document.title,
    };
    if (!this.viewer_.isEmbedded()) {
      // CC doesn't recognize !JsonObject as a subtype of (JsonObject|null).
      return /** @type {!Promise<?JsonObject>} */ (Promise.resolve(data));
    }
    // Only pass state for history updates to trusted viewers, since they
    // may contain user data e.g. form input.
    return this.viewer_.isTrustedViewer().then((trusted) => {
      return trusted ? data : null;
    });
  }

  /**
   * Removes bindings from `removedElements` and adds new bindings in
   * `addedElements`.
   *
   * If `options.update` is true, evaluates and applies changes to
   * `addedElements` after adding new bindings. If "evaluate",
   * it skips the actual DOM update but caches the expression results.
   *
   * If `options.fast` is true, uses a faster scan method that requires
   * (1) elements with bindings to have the attribute `i-amphtml-binding` and
   * (2) the parent element tag name be listed in FAST_RESCAN_TAGS.
   *
   * @param {!Array<!Element>} addedElements
   * @param {!Array<!Element>} removedElements
   * @param {!BindRescanOptionsDef=} options
   * @return {!Promise} Resolved when all operations complete. If they don't
   * complete within `options.timeout` (default=2000), promise is rejected.
   */
  rescan(addedElements, removedElements, options = {}) {
    // * In non-fast mode, wait for initial tree walk to avoid racy double
    //   scanning of `addedElements` which may cause duplicate bindings.
    // * In fast mode, the initial tree walk skips subtrees of FAST_RESCAN_TAGS
    //   so only wait for <amp-bind-macro> setup (much faster!).
    const waitFor = options.fast
      ? this.addMacrosDeferred_.promise
      : this.initializePromise_;

    return waitFor.then(() =>
      this.timer_.timeoutPromise(
        options.timeout || 2000,
        this.rescan_(addedElements, removedElements, options),
        'Timed out waiting for amp-bind to rescan.'
      )
    );
  }

  /**
   * @param {!Array<!Element>} addedElements
   * @param {!Array<!Element>} removedElements
   * @param {!BindRescanOptionsDef} options
   * @return {!Promise}
   * @private
   */
  rescan_(addedElements, removedElements, options) {
    dev().info(TAG, 'rescan: ', addedElements, removedElements, options);

    const rescanPromise = options.fast
      ? this.fastScan_(addedElements, removedElements)
      : this.slowScan_(addedElements, removedElements);

    return rescanPromise.then(() => {
      if (options.update) {
        return this.evaluate_().then((results) =>
          this.apply_(results, {
            constrain: addedElements,
            evaluateOnly: options.update === 'evaluate',
          })
        );
      }
    });
  }

  /**
   * @param {!Array<!Element>} addedElements
   * @param {!Array<!Element>} removedElements
   * @return {!Promise}
   * @private
   */
  fastScan_(addedElements, removedElements) {
    // Sync remove bindings from internal state first, but don't chain on
    // returned promise (worker message) as an optimization.
    const removePromise = this.removeBindingsForNodes_(removedElements);

    // Scan `addedElements` and descendants for bindings.
    const bindings = [];
    const elementsToScan = addedElements.filter((el) =>
      el.hasAttribute('i-amphtml-binding')
    );
    addedElements.forEach((el) => {
      const children = el.querySelectorAll('[i-amphtml-binding]');
      Array.prototype.push.apply(elementsToScan, children);
    });
    const quota = this.maxNumberOfBindings_ - this.numberOfBindings();
    for (let i = 0; i < elementsToScan.length; i++) {
      const el = elementsToScan[i];
      if (this.scanElement_(el, quota - bindings.length, bindings)) {
        break;
      }
    }

    removePromise.then((removed) => {
      dev().info(
        TAG,
        'rescan.fast: delta=%s, total=%s',
        bindings.length - removed,
        this.numberOfBindings()
      );
    });

    if (bindings.length > 0) {
      return this.sendBindingsToWorker_(bindings);
    } else {
      return Promise.resolve();
    }
  }

  /**
   * Returns a copy of the global state for a given field-based expression,
   * e.g. "foo.bar".
   * @param {string} expr
   * @return {*}
   */
  getState(expr) {
    const value = expr ? getValueForExpr(this.state_, expr) : undefined;
    if (isObject(value) || isArray(value)) {
      return this.copyJsonObject_(/** @type {JsonObject} */ (value));
    }
    return value;
  }

  /**
   * Returns a copy of the global state for an expression, after waiting for its
   * associated 'amp-state' element to finish fetching data. If there is no
   * corresponding 'amp-state' element in the DOM, then reject.
   *
   * e.g. "foo.bar".
   * @param {string} expr
   * @return {!Promise<*>}
   */
  getStateAsync(expr) {
    const stateId = /^[^.]*/.exec(expr)[0];
    return this.rootNodePromise_.then((root) => {
      const ampStateEl = root.querySelector(
        `#${escapeCssSelectorIdent(stateId)}`
      );
      if (!ampStateEl) {
        throw user().createError(TAG, `#${stateId} does not exist.`);
      }

      return whenUpgradedToCustomElement(ampStateEl)
        .then((el) => el.getImpl(true))
        .then((ampState) => ampState.getFetchingPromise())
        .catch(() => {})
        .then(() => this.getState(expr));
    });
  }

  /**
   * Returns the stringified value of the global state for a given field-based
   * expression, e.g. "foo.bar.baz".
   * @param {string} expr
   * @return {?string}
   */
  getStateValue(expr) {
    const value = getValueForExpr(this.state_, expr);
    if (value === undefined || value === null) {
      return null;
    } else if (isObject(value) || isArray(value)) {
      return JSON.stringify(/** @type {JsonObject} */ (value));
    } else {
      return String(value);
    }
  }

  /**
   * Scans the root node (and array of optional nodes) for bindings.
   * @param {!Node} root
   * @return {!Promise}
   * @private
   */
  initialize_(root) {
    // Disallow URL property bindings in AMP4EMAIL.
    const allowUrlProperties = !isAmp4Email(this.localWin_.document);
    this.validator_ = new BindValidator(allowUrlProperties);

    // The web worker's evaluator also has an instance of BindValidator
    // that should be initialized with the same `allowUrlProperties` value.
    return this.ww_('bind.init', [allowUrlProperties])
      .then(() => {
        return Promise.all([
          this.addMacros_().then(() => this.addMacrosDeferred_.resolve()),
          this.addBindingsForNodes_([root]),
        ]);
      })
      .then(() => {
        // Listen for DOM updates (e.g. template render) to rescan for bindings.
        root.addEventListener(AmpEvents_Enum.DOM_UPDATE, (e) =>
          this.onDomUpdate_(e)
        );
      })
      .then(() => {
        const ampStates = root.querySelectorAll('AMP-STATE');
        // Force all query-able <amp-state> elements to parse local data instead
        // of waiting for runtime to build them all.
        const whenBuilt = false;
        const whenParsed = toArray(ampStates).map((el) => {
          return whenUpgradedToCustomElement(el)
            .then(() => el.getImpl(whenBuilt))
            .then((impl) => impl.parseAndUpdate());
        });
        return Promise.all(whenParsed);
      })
      .then(() => {
        // Bind is "ready" when its initialization completes _and_ all <amp-state>
        // elements' local data is parsed and processed (not remote data).
        this.viewer_.sendMessage('bindReady', undefined);
        this.dispatchEventForTesting_(BindEvents.INITIALIZE);

        // In dev mode, check default values against initial expression results.
        if (getMode().development) {
          return this.evaluate_().then((results) => this.verify_(results));
        }
      });
  }

  /**
   * The current number of bindings.
   * @return {number}
   * @visibleForTesting
   */
  numberOfBindings() {
    return this.boundElements_.reduce((number, boundElement) => {
      return number + boundElement.boundProperties.length;
    }, 0);
  }

  /**
   * @param {number} value
   * @visibleForTesting
   */
  setMaxNumberOfBindingsForTesting(value) {
    this.maxNumberOfBindings_ = value;
  }

  /** @return {!../../../src/service/history-impl.History} */
  historyForTesting() {
    return this.history_;
  }

  /**
   * Calls setState(s), where s is data.state with the non-overridable keys
   * removed.
   * @param {!JsonObject} data
   * @return {!Promise}
   * @private
   */
  premutate_(data) {
    const ignoredKeys = [];
    return this.initializePromise_.then(() => {
      Object.keys(data['state']).forEach((key) => {
        if (!this.overridableKeys_.includes(key)) {
          delete data['state'][key];
          ignoredKeys.push(key);
        }
      });
      if (ignoredKeys.length > 0) {
        user().warn(
          TAG,
          'Some state keys could not be premutated ' +
            'because they are missing the overridable attribute: ' +
            ignoredKeys.join(', ')
        );
      }
      return this.setState(data['state']);
    });
  }

  /**
   * Marks the given key as overridable so that it can be overriden by
   * a premutate message from the viewer.
   * @param {string} key
   */
  addOverridableKey(key) {
    this.overridableKeys_.push(key);
  }

  /**
   * Scans the document for <amp-bind-macro> elements, and adds them to the
   * bind-evaluator.
   *
   * Returns a promise that resolves after macros have been added.
   *
   * @return {!Promise<number>}
   * @private
   */
  addMacros_() {
    // TODO(choumx, #17194): One-time query selector can miss dynamically
    // created elements. Should do what <amp-state> does.
    const elements = this.ampdoc.getBody().querySelectorAll('AMP-BIND-MACRO');
    const macros = /** @type {!Array<!BindMacroDef>} */ ([]);
    elements.forEach((element) => {
      const argumentNames = (element.getAttribute('arguments') || '')
        .split(',')
        .map((s) => s.trim());
      macros.push({
        id: element.getAttribute('id'),
        argumentNames,
        expressionString: element.getAttribute('expression'),
      });
    });
    if (macros.length == 0) {
      return Promise.resolve(0);
    } else {
      return this.ww_('bind.addMacros', [macros]).then((errors) => {
        // Report macros that failed to parse (e.g. expression size exceeded).
        /** @type {!Array} */ (errors).forEach((e, i) => {
          this.reportWorkerError_(
            e,
            `${TAG}: Parsing amp-bind-macro failed.`,
            elements[i]
          );
        });
        return macros.length;
      });
    }
  }

  /**
   * For each node in an array, scans it and its descendants for bindings.
   * This function is not idempotent.
   *
   * Returns a promise that resolves with the number of bindings added upon
   * completion.
   *
   * @param {!Array<!Node>} nodes
   * @return {!Promise<number>}
   * @private
   */
  addBindingsForNodes_(nodes) {
    if (!nodes.length) {
      return Promise.resolve(0);
    }

    // For each node, scan it for bindings and store them.
    const scanPromises = nodes.map((node) => {
      // Limit number of total bindings (unless in local manual testing).
      const limit =
        getMode().localDev && !getMode().test
          ? Number.POSITIVE_INFINITY
          : this.maxNumberOfBindings_ - this.numberOfBindings();

      return this.scanNode_(node, limit).then((results) => {
        const {bindings, limitExceeded} = results;
        if (limitExceeded) {
          this.emitMaxBindingsExceededError_();
        }
        return bindings;
      });
    });

    // Once all scans are complete, combine the bindings and ask web-worker to
    // evaluate expressions in a single RPC.
    return Promise.all(scanPromises).then((results) => {
      // `results` is a 2D array where results[i] is an array of bindings.
      // Flatten this into a 1D array of bindings via concat.
      const bindings = Array.prototype.concat.apply([], results);
      return bindings.length > 0 ? this.sendBindingsToWorker_(bindings) : 0;
    });
  }

  /** Emits console error stating that the binding limit was exceeded. */
  emitMaxBindingsExceededError_() {
    dev().expectedError(
      TAG,
      'Maximum number of bindings reached ' +
        '(%s). Additional elements with bindings will be ignored.',
      this.maxNumberOfBindings_
    );
  }

  /**
   * Sends new bindings to the web worker for parsing.
   * @param {!Array<!BindBindingDef>} bindings
   * @return {!Promise<number>}
   */
  sendBindingsToWorker_(bindings) {
    return this.ww_('bind.addBindings', [bindings]).then((parseErrors) => {
      // Report each parse error.
      Object.keys(parseErrors).forEach((expressionString) => {
        const elements = this.expressionToElements_[expressionString];
        if (elements.length > 0) {
          this.reportWorkerError_(
            parseErrors[expressionString],
            `${TAG}: Expression compile error in "${expressionString}".`,
            elements[0]
          );
        }
      });
      return bindings.length;
    });
  }

  /**
   * For each node in an array, removes all bindings for it and its descendants.
   *
   * Returns a promise that resolves with the number of removed bindings upon
   * completion.
   *
   * @param {!Array<!Node>} nodes
   * @return {!Promise<number>}
   * @private
   */
  removeBindingsForNodes_(nodes) {
    if (!nodes.length) {
      return Promise.resolve(0);
    }

    // Eliminate bound elements that are descendants of `nodes`.
    remove(this.boundElements_, (boundElement) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].contains(boundElement.element)) {
          return true;
        }
      }
      return false;
    });
    // Eliminate elements from the expression to elements map that
    // have node as an ancestor. Delete expressions that are no longer
    // bound to elements.
    const deletedExpressions = /** @type {!Array<string>} */ ([]);
    for (const expression in this.expressionToElements_) {
      const elements = this.expressionToElements_[expression];
      remove(elements, (element) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].contains(element)) {
            return true;
          }
        }
        return false;
      });
      if (elements.length == 0) {
        deletedExpressions.push(expression);
        delete this.expressionToElements_[expression];
      }
    }

    // Remove the bindings from the evaluator.
    const removed = deletedExpressions.length;
    if (removed > 0) {
      return this.ww_('bind.removeBindingsWithExpressionStrings', [
        deletedExpressions,
      ]).then(() => removed);
    } else {
      return Promise.resolve(0);
    }
  }

  /**
   * Scans `node` for attributes that conform to bind syntax and returns
   * a tuple containing bound elements and binding data for the evaluator.
   * @param {!Node} node
   * @param {number} limit
   * @return {!Promise<{bindings: !Array<!BindBindingDef>, limitExceeded: boolean}>}
   * @private
   */
  scanNode_(node, limit) {
    /** @type {!Array<!BindBindingDef>} */
    const bindings = [];
    const walker = new BindWalker(node);
    // Set to true if number of bindings in `node` exceeds `limit`.
    let limitExceeded = false;
    // Helper function for scanning the tree walker's next node.
    // Returns true if the walker has no more nodes.
    const scanNextNode_ = () => {
      const node = walker.currentNode;
      // If `node` is a Document, it will be scanned first (despite
      // NodeFilter.SHOW_ELEMENT). Skip it.
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return !walker.nextNode();
      }
      const element = dev().assertElement(node);
      const remainingQuota = limit - bindings.length;
      if (this.scanElement_(element, remainingQuota, bindings)) {
        limitExceeded = true;
      }
      // Elements in FAST_RESCAN_TAGS opt-out of "slow" tree walking in favor of
      // rescan() with {fast: true} for better performance. Note that only
      // children are opted-out (e.g. amp-list children, not amp-list itself).
      const next = FAST_RESCAN_TAGS.includes(node.nodeName)
        ? walker.skipSubtree()
        : walker.nextNode();
      return !next || limitExceeded;
    };

    return new Promise((resolve) => {
      const chunktion = (idleDeadline) => {
        let completed = false;
        // If `requestIdleCallback` is available, scan elements until
        // idle time runs out.
        if (idleDeadline && !idleDeadline.didTimeout) {
          while (idleDeadline.timeRemaining() > 1 && !completed) {
            completed = scanNextNode_();
          }
        } else {
          // If `requestIdleCallback` isn't available, scan elements in buckets.
          // Bucket size is a magic number that fits within a single frame.
          const bucketSize = 250;
          for (let i = 0; i < bucketSize && !completed; i++) {
            completed = scanNextNode_();
          }
        }
        // If we scanned all elements, resolve. Otherwise, continue chunking.
        if (completed) {
          resolve({bindings, limitExceeded});
        } else {
          chunk(this.ampdoc, chunktion, ChunkPriority_Enum.LOW);
        }
      };
      chunk(this.ampdoc, chunktion, ChunkPriority_Enum.LOW);
    });
  }

  /**
   * Scans the element for bindings and adds up to |quota| to `outBindings`.
   * Also updates ivars `boundElements_` and `expressionToElements_`.
   * @param {!Element} element
   * @param {number} quota
   * @param {!Array<!BindBindingDef>} outBindings
   * @return {boolean} Returns true if `element` contains more than `quota`
   *     bindings. Otherwise, returns false.
   */
  scanElement_(element, quota, outBindings) {
    let quotaExceeded = false;
    const boundProperties = this.boundPropertiesInElement_(element);
    if (boundProperties.length > quota) {
      boundProperties.length = quota;
      quotaExceeded = true;
    }
    if (boundProperties.length > 0) {
      this.boundElements_.push({element, boundProperties});
    }
    const {tagName} = element;
    boundProperties.forEach((boundProperty) => {
      const {expressionString, property} = boundProperty;
      outBindings.push({tagName, property, expressionString});
      if (!this.expressionToElements_[expressionString]) {
        this.expressionToElements_[expressionString] = [];
      }
      this.expressionToElements_[expressionString].push(element);
    });
    return quotaExceeded;
  }

  /**
   * Returns bound properties for an element.
   * @param {!Element} element
   * @return {!Array<{property: string, expressionString: string}>}
   * @private
   */
  boundPropertiesInElement_(element) {
    const boundProperties = [];
    const attrs = element.attributes;
    for (let i = 0, numberOfAttrs = attrs.length; i < numberOfAttrs; i++) {
      const attr = attrs[i];
      const boundProperty = this.boundPropertyInAttribute_(attr, element);
      if (boundProperty) {
        boundProperties.push(boundProperty);
      }
    }
    return boundProperties;
  }

  /**
   * Returns the bound property and expression string within a given attribute,
   * if it exists. Otherwise, returns null.
   * @param {!Attr} attribute
   * @param {!Element} element
   * @return {?{property: string, expressionString: string}}
   * @private
   */
  boundPropertyInAttribute_(attribute, element) {
    const tag = element.tagName;
    const attr = attribute.name;

    let property;
    if (attr.length > 2 && attr[0] === '[' && attr[attr.length - 1] === ']') {
      property = attr.substr(1, attr.length - 2);
    } else if (attr.startsWith('data-amp-bind-')) {
      property = attr.substr(14);
      // Ignore `data-amp-bind-foo` if `[foo]` already exists.
      if (element.hasAttribute(`[${property}]`)) {
        return null;
      }
    }

    if (property) {
      if (this.validator_.canBind(tag, property)) {
        return {property, expressionString: attribute.value};
      } else {
        const err = user().createError(
          '%s: Binding to [%s] on <%s> is not allowed.',
          TAG,
          property,
          tag
        );
        this.reportError_(err, element);
      }
    }
    return null;
  }

  /**
   * Evaluates a single expression and returns its result.
   * @param {string} expression
   * @param {!JsonObject} scope
   * @return {!Promise<!JsonObject>}
   */
  evaluateExpression_(expression, scope) {
    return this.initializePromise_
      .then(() => {
        // Allow expression to reference current state in addition to event state.
        Object.assign(scope, this.state_);
        return this.ww_('bind.evaluateExpression', [expression, scope]);
      })
      .then((returnValue) => {
        const {error, result} = returnValue;
        if (error) {
          // Throw to reject promise.
          throw this.reportWorkerError_(
            error,
            `${TAG}: Expression eval failed.`
          );
        } else {
          return result;
        }
      });
  }

  /**
   * Reevaluates all expressions and returns a map of expressions to results.
   * @return {!Promise<!{[key: string]: BindExpressionResultDef}>}
   * @private
   */
  evaluate_() {
    const evaluatePromise = this.ww_('bind.evaluateBindings', [this.state_]);
    return evaluatePromise.then((returnValue) => {
      const {errors, results} = returnValue;
      // Report evaluation errors.
      Object.keys(errors).forEach((expressionString) => {
        const elements = this.expressionToElements_[expressionString];
        if (elements.length > 0) {
          const evalError = errors[expressionString];
          const userError = user().createError(
            '%s: Expression evaluation error in "%s". %s',
            TAG,
            expressionString,
            evalError.message
          );
          userError.stack = evalError.stack;
          this.reportError_(userError, elements[0]);
        }
      });
      dev().info(TAG, 'evaluation:', results);
      return results;
    });
  }

  /**
   * Verifies expression results vs. current DOM state and returns an
   * array of bindings with mismatches (if any).
   * @param {{[key: string]: BindExpressionResultDef}} results
   * @param {?Array<!Element>=} elements If provided, only verifies bindings
   *     contained within the given elements. Otherwise, verifies all bindings.
   * @param {boolean=} warn If true, emits a user warning for verification
   *     mismatches. Otherwise, does not emit a warning.
   * @return {!Array<string>}
   * @private
   */
  verify_(results, elements = null, warn = true) {
    // Collate strings containing details of verification mismatches to return.
    const mismatches = {};

    this.boundElements_.forEach((boundElement) => {
      const {boundProperties, element} = boundElement;

      // If provided, filter elements that are _not_ children of `opt_elements`.
      if (elements && !this.elementsContains_(elements, element)) {
        return;
      }

      boundProperties.forEach((boundProperty) => {
        const newValue = results[boundProperty.expressionString];
        if (newValue === undefined) {
          return;
        }
        const mismatch = this.verifyBinding_(boundProperty, element, newValue);
        if (!mismatch) {
          return;
        }
        const {tagName} = element;
        const {expressionString, property} = boundProperty;
        const {actual, expected} = mismatch;

        // Only store unique mismatches (dupes possible when rendering an array
        // of data to a template).
        mismatches[`${tagName}[${property}]${expected}:${actual}`] = true;

        if (warn) {
          user().warn(
            TAG,
            `Default value (${actual}) does not match first ` +
              `result (${expected}) for <${tagName} [${property}]="` +
              `${expressionString}">. We recommend writing expressions with ` +
              'matching default values, but this can be safely ignored if ' +
              'intentional.'
          );
        }
      });
    });
    return Object.keys(mismatches);
  }

  /**
   * Returns true if `el` is contained within any element in `elements`.
   * @param {!Array<!Element>} elements
   * @param {!Element} el
   * @return {boolean}
   * @private
   */
  elementsContains_(elements, el) {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].contains(el)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Determines which properties to update based on results of evaluation
   * of all bound expression strings with the current state. This method
   * will only return properties that need to be updated along with their
   * new value.
   * @param {!Array<!BoundPropertyDef>} boundProperties
   * @param {{[key: string]: BindExpressionResultDef}} results
   * @return {!Array<{boundProperty: !BoundPropertyDef, newValue: BindExpressionResultDef}>}
   * @private
   */
  calculateUpdates_(boundProperties, results) {
    const updates = [];
    boundProperties.forEach((boundProperty) => {
      const {expressionString, previousResult} = boundProperty;
      const newValue = results[expressionString];
      // Support equality checks for arrays of objects containing arrays.
      // Useful for rendering amp-list with amp-bind state via [src].
      if (
        newValue === undefined ||
        deepEquals(newValue, previousResult, /* depth */ 20)
      ) {
      } else {
        boundProperty.previousResult = newValue;
        updates.push({boundProperty, newValue});
      }
    });
    return updates;
  }

  /**
   * Applies expression results to elements in the document.
   *
   * @param {{[key: string]: BindExpressionResultDef}} results
   * @param {!ApplyOptionsDef} opts
   * @return {!Promise}
   * @private
   */
  apply_(results, opts) {
    const promises = [];

    this.boundElements_.forEach((boundElement) => {
      // If this evaluation is triggered by an <amp-state> mutation, we must
      // ignore updates to any <amp-state> element to prevent update cycles.
      if (opts.skipAmpState && boundElement.element.tagName === 'AMP-STATE') {
        return;
      }

      // If this is a constrained application, then restrict to specified
      // elements and their subtrees.
      if (
        opts.constrain &&
        !opts.constrain.some((el) => el.contains(boundElement.element))
      ) {
        return;
      }

      const {boundProperties, element} = boundElement;
      const updates = this.calculateUpdates_(boundProperties, results);
      // If this is a "evaluate only" application, skip the DOM mutations.
      if (opts.evaluateOnly) {
        return;
      }
      promises.push(this.applyUpdatesToElement_(element, updates));
    });

    return Promise.all(promises);
  }

  /**
   * Applies expression results to a single BoundElementDef.
   * @param {!Element} element
   * @param {!Array<{boundProperty: !BoundPropertyDef, newValue: BindExpressionResultDef}>} updates
   * @return {!Promise}
   */
  applyUpdatesToElement_(element, updates) {
    if (updates.length === 0) {
      return Promise.resolve();
    }
    return this.mutator_.mutateElement(element, () => {
      const mutations = map();
      let width, height;

      updates.forEach((update) => {
        const {boundProperty, newValue} = update;
        const {property} = boundProperty;
        const mutation = this.applyBinding_(boundProperty, element, newValue);

        if (mutation) {
          mutations[mutation.name] = mutation.value;
          if (property == 'width') {
            width = isFiniteNumber(newValue) ? Number(newValue) : width;
          } else if (property == 'height') {
            height = isFiniteNumber(newValue) ? Number(newValue) : height;
          }
        }

        this.dispatchFormValueChangeEventIfNecessary_(element, property);
      });

      if (width !== undefined || height !== undefined) {
        // request without scheduling vsync pass since `mutateElement()`
        // will schedule a pass after a short delay anyways.
        this.mutator_.forceChangeSize(element, height, width);
      }

      if (typeof element.mutatedAttributesCallback === 'function') {
        // Prevent an exception in the callback from interrupting execution,
        // instead wrap in user error and give a helpful message.
        try {
          element.mutatedAttributesCallback(mutations);
        } catch (e) {
          const error = user().createError(
            '%s: Applying expression results (%s) failed with error,',
            TAG,
            JSON.stringify(mutations),
            e
          );
          this.reportError_(error, element);
        }
      }
    });
  }

  /**
   * Dispatches an `AmpEvents_Enum.FORM_VALUE_CHANGE` if the element's changed
   * property represents the value of a form field.
   * @param {!Element} element
   * @param {string} property
   */
  dispatchFormValueChangeEventIfNecessary_(element, property) {
    const isPropertyAFormValue = FORM_VALUE_PROPERTIES[element.tagName];
    if (!isPropertyAFormValue || !isPropertyAFormValue[property]) {
      return;
    }

    // The native `InputEvent` is dispatched at the parent `<select>` when its
    // selected `<option>` changes.
    const dispatchAt =
      element.tagName === 'OPTION'
        ? closestAncestorElementBySelector(element, 'SELECT')
        : element;

    if (dispatchAt) {
      const ampValueChangeEvent = createCustomEvent(
        this.localWin_,
        AmpEvents_Enum.FORM_VALUE_CHANGE,
        /* detail */ null,
        {bubbles: true}
      );
      dispatchAt.dispatchEvent(ampValueChangeEvent);
    }
  }

  /**
   * Mutates the bound property of `element` with `newValue`.
   * @param {!BoundPropertyDef} boundProperty
   * @param {!Element} element
   * @param {BindExpressionResultDef} newValue
   * @return {?{name: string, value:BindExpressionResultDef}}
   * @private
   */
  applyBinding_(boundProperty, element, newValue) {
    const {property} = boundProperty;
    const tag = element.tagName;

    switch (property) {
      case 'defaulttext':
        element.textContent = String(newValue);
        break;

      case 'text':
        const stringValue = String(newValue);
        // If <title> element in the <head>, also update the document title.
        if (
          tag === 'TITLE' &&
          element.parentNode === this.localWin_.document.head
        ) {
          this.localWin_.document.title = stringValue;
        }
        // For <textarea>, [text] sets `value` (current value), while
        // [defaultText] sets `textContent` (initial value).
        if (tag === 'TEXTAREA') {
          element.value = stringValue;
        } else {
          element.textContent = stringValue;
        }
        break;

      case 'class':
        // Preserve internal AMP classes.
        const ampClasses = [];
        for (let i = 0; i < element.classList.length; i++) {
          const cssClass = element.classList[i];
          if (AMP_CSS_RE.test(cssClass)) {
            ampClasses.push(cssClass);
          }
        }
        if (Array.isArray(newValue) || typeof newValue === 'string') {
          element.setAttribute('class', ampClasses.concat(newValue).join(' '));
        } else if (newValue === null) {
          element.setAttribute('class', ampClasses.join(' '));
        } else {
          const err = user().createError(
            '%s: "%s" is not a valid result for [class].',
            TAG,
            newValue
          );
          this.reportError_(err, element);
        }
        break;

      default:
        // For input elements, update both the attribute (initial value) and
        // property (current value) for bindings e.g. [value].
        // TODO(choumx): Investigate if splitting into [value] and
        // [defaultValue] is possible without version bump.
        const updateProperty = tag === 'INPUT' && property in element;
        const oldValue = element.getAttribute(property);

        let mutated = false;
        if (typeof newValue === 'boolean') {
          if (updateProperty && element[property] !== newValue) {
            // Property value _must_ be read before the attribute is changed.
            // Before user interaction, attribute updates affect the property.
            element[property] = newValue;
            mutated = true;
          }
          if (newValue && oldValue !== '') {
            element.setAttribute(property, '');
            mutated = true;
          } else if (!newValue && oldValue !== null) {
            element.removeAttribute(property);
            mutated = true;
          }
          if (mutated) {
            // Safari-specific workaround for updating <select> elements
            // when a child option[selected] attribute changes.
            this.updateSelectForSafari_(element, property, newValue);
          }
        } else if (typeof newValue === 'object' && newValue !== null) {
          // If newValue is an object or array (e.g. amp-list[src] binding),
          // don't bother updating the element since attribute values like
          // "[Object object]" have no meaning in the DOM.
          mutated = true;
        } else if (newValue !== oldValue) {
          mutated = this.rewriteAttributes_(
            element,
            property,
            String(newValue),
            updateProperty
          );
        }

        if (mutated) {
          return {name: property, value: newValue};
        }
        break;
    }
    return null;
  }

  /**
   * Hopefully we can delete this with Safari 13+.
   * @param {!Element} element
   * @param {string} property
   * @param {BindExpressionResultDef} newValue
   */
  updateSelectForSafari_(element, property, newValue) {
    // We only care about option[selected].
    if (element.tagName !== 'OPTION' || property !== 'selected') {
      return;
    }
    // We only care if this option was selected, not deselected.
    if (!newValue) {
      return;
    }
    // Workaround only needed for Safari.
    if (!Services.platformFor(this.win_).isSafari()) {
      return;
    }
    const select = closestAncestorElementBySelector(element, 'select');
    if (!select) {
      return;
    }
    // Set corresponding selectedIndex on <select> parent.
    const index = toArray(select.options).indexOf(element);
    if (index >= 0) {
      select.selectedIndex = index;
    }
  }

  /**
   * Performs CDN rewrites for the given mutation and updates the element.
   * @see amp-cache-modifications.md#url-rewrites
   * @param {!Element} element
   * @param {string} attrName
   * @param {string} value
   * @param {boolean} updateProperty If the property with the same name should
   *    be updated as well.
   * @return {boolean} Whether or not the rewrite was successful.
   * @private
   */
  rewriteAttributes_(element, attrName, value, updateProperty) {
    // Rewrite attributes if necessary. Not done in worker since it relies on
    // `url#parseUrl` which uses <a>. Worker has URL API but not on IE11.
    try {
      rewriteAttributesForElement(
        element,
        attrName,
        value,
        /* opt_location */ undefined,
        updateProperty
      );
      return true;
    } catch (e) {
      const error = user().createError(
        '%s: "%s" is not a valid result for [%]',
        TAG,
        value,
        attrName,
        e
      );
      this.reportError_(error, element);
    }
    return false;
  }

  /**
   * If current state of `element` matches `expectedValue`, returns null.
   * Otherwise, returns a tuple containing the expected and actual values.
   * @param {!BoundPropertyDef} boundProperty
   * @param {!Element} element
   * @param {BindExpressionResultDef} expectedValue
   * @return {?{expected: *, actual: *}}
   * @private
   */
  verifyBinding_(boundProperty, element, expectedValue) {
    const {property} = boundProperty;
    const {tagName} = element;

    // Don't show a warning for bind-only attributes,
    // like 'slide' on amp-carousel.
    const bindOnlyAttrs = BIND_ONLY_ATTRIBUTES[tagName];
    if (bindOnlyAttrs && bindOnlyAttrs.includes(property)) {
      return null;
    }

    let initialValue;
    let match;

    switch (property) {
      case 'text':
        initialValue = element.textContent;
        expectedValue = String(expectedValue);
        match = initialValue.trim() === expectedValue.trim();
        break;

      case 'class':
        initialValue = [];
        for (let i = 0; i < element.classList.length; i++) {
          const cssClass = element.classList[i];
          // Ignore internal AMP classes.
          if (AMP_CSS_RE.test(cssClass)) {
            continue;
          }
          initialValue.push(cssClass);
        }
        /** @type {!Array<string>} */
        let classes = [];
        if (Array.isArray(expectedValue)) {
          classes = expectedValue;
        } else if (typeof expectedValue === 'string') {
          const trimmed = expectedValue.trim();
          if (trimmed.length > 0) {
            classes = trimmed.split(' ');
          }
        } else {
          const err = user().createError(
            '%s: "%s" is not a valid result for [class].',
            TAG,
            expectedValue
          );
          this.reportError_(err, element);
        }
        match = this.compareStringArrays_(initialValue, classes);
        break;

      default:
        initialValue = element.getAttribute(property);
        // Boolean attributes return values of either '' or null.
        if (expectedValue === true) {
          match = initialValue === '';
        } else if (expectedValue === false) {
          match = initialValue === null;
        } else if (typeof expectedValue === 'number') {
          match = Number(initialValue) === expectedValue;
        } else {
          match = initialValue === expectedValue;
        }
        break;
    }

    return match ? null : {expected: expectedValue, actual: initialValue};
  }

  /**
   * @param {!Event} event
   */
  onDomUpdate_(event) {
    const target = dev().assertElement(event.target);
    // TODO(choumx): Consider removing this check now that slowScan_() skips
    // FAST_RESCAN_TAGS internally, and because this makes an assumption about
    // the DOM structure of the EventTarget.
    const parent = target.parentNode;
    if (parent && FAST_RESCAN_TAGS.includes(parent.nodeName)) {
      return;
    }
    dev().info(TAG, 'dom_update:', target);
    this.slowScan_([target], [target], 'dom_update.end').then(() => {
      this.dispatchEventForTesting_(BindEvents.RESCAN_TEMPLATE);
    });
  }

  /**
   * Removes bindings for nodes in `remove`, then scans for bindings in `add`.
   * Return promise that resolves upon completion with struct containing number
   * of removed and added bindings.
   * @param {!Array<!Node>} addedNodes
   * @param {!Array<!Node>} removedNodes
   * @param {string=} label
   * @return {!Promise}
   * @private
   */
  slowScan_(addedNodes, removedNodes, label = 'rescan.slow') {
    let removed = 0;
    return this.removeBindingsForNodes_(removedNodes)
      .then((r) => {
        removed = r;
        return this.addBindingsForNodes_(addedNodes);
      })
      .then((added) => {
        dev().info(
          TAG,
          '%s: delta=%s, total=%s',
          label,
          added - removed,
          this.numberOfBindings()
        );
      });
  }

  /**
   * Helper for invoking a method on web worker.
   * @param {string} method
   * @param {!Array=} opt_args
   * @return {!Promise}
   */
  ww_(method, opt_args) {
    return invokeWebWorker(this.win_, method, opt_args, this.localWin_);
  }

  /**
   * @param {{message: string, stack:string}} e
   * @param {string} message
   * @param {!Element=} opt_element
   * @return {!Error}
   * @private
   */
  reportWorkerError_(e, message, opt_element) {
    const userError = user().createError('%s %s', message, e.message);
    userError.stack = e.stack;
    this.reportError_(userError, opt_element);
    return userError;
  }

  /**
   * @param {!Error} error
   * @param {!Element=} opt_element
   */
  reportError_(error, opt_element) {
    if (getMode().test) {
      return;
    }
    reportError(error, opt_element);
  }

  /**
   * Returns true if both arrays contain the same strings.
   * @param {!(IArrayLike<string>|Array<string>)} a
   * @param {!(IArrayLike<string>|Array<string>)} b
   * @return {boolean}
   * @private
   */
  compareStringArrays_(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    const sortedA = (isArray(a) ? a : toArray(a)).sort();
    const sortedB = (isArray(b) ? b : toArray(b)).sort();
    for (let i = 0; i < a.length; i++) {
      if (sortedA[i] !== sortedB[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Copies an object containing JSON data and returns it.
   * Returns null if input object contains invalid JSON (e.g. undefined or
   * circular references).
   * @param {?JsonObject|undefined} o
   * @return {?JsonObject}
   */
  copyJsonObject_(o) {
    if (o === undefined) {
      return null;
    }
    try {
      return parseJson(JSON.stringify(o));
    } catch (e) {
      dev().error(TAG, 'Failed to copy JSON (' + o + ') with error: ' + e);
    }
    return null;
  }

  /**
   * Print out the current state in the console.
   * @param {(!Element|string)=} opt_elementOrExpr
   * @private
   */
  debugPrintState_(opt_elementOrExpr) {
    if (opt_elementOrExpr) {
      if (typeof opt_elementOrExpr == 'string') {
        const value = getValueForExpr(this.state_, opt_elementOrExpr);
        user().info(TAG, value);
      } else if (opt_elementOrExpr.nodeType == Node.ELEMENT_NODE) {
        const element = user().assertElement(opt_elementOrExpr);
        this.debugPrintElement_(element);
      } else {
        user().info(
          TAG,
          'Invalid argument. Pass a JSON expression or an ' +
            'element instead e.g. AMP.printState("foo.bar") or ' +
            'AMP.printState($0) after selecting an element.'
        );
      }
    } else {
      user().info(TAG, this.state_);
    }
  }

  /**
   * Print out the element's bound attributes and respective expression values.
   * @param {!Element} element
   * @private
   */
  debugPrintElement_(element) {
    const index = findIndex(this.boundElements_, (boundElement) => {
      return boundElement.element == element;
    });
    if (index < 0) {
      user().info(TAG, 'Element has no bindings:', element);
      return;
    }
    // Evaluate expressions in bindings in `element`.
    const promises = [];
    const {boundProperties} = this.boundElements_[index];
    boundProperties.forEach((boundProperty) => {
      const {expressionString} = boundProperty;
      promises.push(this.evaluateExpression_(expressionString, this.state_));
    });
    // Print the map of attribute to expression value for `element`.
    Promise.all(promises).then((results) => {
      const output = map();
      boundProperties.forEach((boundProperty, i) => {
        const {property} = boundProperty;
        output[property] = results[i];
      });
      user().info(TAG, output);
    });
  }

  /**
   * @param {string} expression
   */
  debugEvaluate_(expression) {
    this.evaluateExpression_(expression, this.state_).then((result) => {
      user().info(TAG, result);
    });
  }

  /**
   * Wait for bind scan to finish for testing.
   *
   * @return {?Promise}
   * @visibleForTesting
   */
  initializePromiseForTesting() {
    return this.initializePromise_;
  }

  /**
   * Wait for bindings to evaluate and apply for testing. Should
   * be called once for each event that changes bindings.
   *
   * @return {?Promise}
   * @visibleForTesting
   */
  setStatePromiseForTesting() {
    return this.setStatePromise_;
  }

  /**
   * @param {string} name
   * @private
   */
  dispatchEventForTesting_(name) {
    if (getMode().test) {
      let event;
      if (typeof this.localWin_.Event === 'function') {
        event = new Event(name, {bubbles: true, cancelable: true});
      } else {
        event = this.localWin_.document.createEvent('Event');
        event.initEvent(name, /* bubbles */ true, /* cancelable */ true);
      }
      this.localWin_.dispatchEvent(event);
    }
  }
}

class BindWalker {
  /**
   * @param {!Node} root
   */
  constructor(root) {
    const doc = devAssert(
      root.nodeType == Node.DOCUMENT_NODE ? root : root.ownerDocument,
      'ownerDocument is null.'
    );

    const useQuerySelector =
      doc.documentElement.hasAttribute('i-amphtml-binding');
    /** @private @const {boolean} */
    this.useQuerySelector_ = useQuerySelector;

    /** @type {!Node} */
    this.currentNode = root;

    /** @private {number} */
    this.index_ = 0;

    /** @private @const {!Array<!Element>} */
    this.nodeList_ = useQuerySelector
      ? toArray(root.querySelectorAll('[i-amphtml-binding]'))
      : [];

    // Confusingly, the old TreeWalker hit the root node. We need to match that behavior.
    if (
      useQuerySelector &&
      root.nodeType === Node.ELEMENT_NODE &&
      root.hasAttribute('i-amphtml-binding')
    ) {
      this.nodeList_.unshift(root);
    }

    /**
     * Third and fourth params of `createTreeWalker` are not optional on IE11.
     * @private @const {?TreeWalker}
     */
    this.treeWalker_ = useQuerySelector
      ? null
      : doc.createTreeWalker(
          root,
          NodeFilter.SHOW_ELEMENT,
          null,
          /* entityReferenceExpansion */ false
        );
  }

  /**
   * Finds the next node in document order, if it exists. Returns that node, or null if it doesn't exist.
   * Updates currentNode, if it exists, else currentNode stays the same.
   *
   * @return {?Node}
   */
  nextNode() {
    if (this.useQuerySelector_) {
      if (this.index_ == this.nodeList_.length) {
        return null;
      }
      const next = this.nodeList_[this.index_++];
      this.currentNode = next;
      return next;
    }

    const walker = this.treeWalker_;
    const next = walker.nextNode();
    // This matches the TreeWalker's behavior.
    if (next !== null) {
      this.currentNode = next;
    }
    return next;
  }

  /**
   * Skips the remaining sibling nodes in the current parent. Returns the next node in document order.
   * @return {?Node}
   */
  skipSubtree() {
    if (this.useQuerySelector_) {
      const {currentNode} = this;
      let next = null;
      do {
        next = this.nextNode();
      } while (next !== null && currentNode.contains(next));
      return next;
    }

    const walker = this.treeWalker_;
    for (let n = walker.currentNode; n; n = walker.parentNode()) {
      const sibling = walker.nextSibling();
      if (sibling !== null) {
        this.currentNode = sibling;
        return sibling;
      }
    }
    return null;
  }
}
