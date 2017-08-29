/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {ActionTrust} from '../../../src/action-trust';
import {CSS} from '../../../build/amp-gwd-animation-0.1.css';
import {Services} from '../../../src/services';
import {getServiceForDoc} from '../../../src/service';
import {
  GWD_SERVICE_NAME,
  GWD_TIMELINE_EVENT,
  installGwdRuntimeServiceForDoc,
} from './amp-gwd-animation-impl';
import {isExperimentOn} from '../../../src/experiments';
import {user} from '../../../src/log';

/** @const {string} The custom element tag name for this extension. */
export const TAG = 'amp-gwd-animation';

/** @const {string} Experiment flag name. TODO(sklobovskaya): Remove. */
export const EXPERIMENT = TAG;

/** @const {string} */
export const GWD_PAGEDECK_ID = 'pagedeck';

/**
 * Actions supported by the extension and the parameters each requires, as a
 * string identifying the path to the data in an AMP action invocation object.
 * For example, 'args.id' will map to the data at `invocation.args.id`.
 * Each action name currently corresponds to an identically-named method in the
 * GWD runtime service, which is invoked with the evaluated arguments
 * (@see getActionImplArgs and createAction_).
 * @const {!Object<string, !Array<string>>}
 */
const ACTION_IMPL_ARGS = {
  'play': ['args.id'],
  'pause': ['args.id'],
  'togglePlay': ['args.id'],
  'gotoAndPlay': ['args.id', 'args.label'],
  'gotoAndPause': ['args.id', 'args.label'],
  'gotoAndPlayNTimes': ['args.id', 'args.label', 'args.N', 'event.eventName'],
  'setCurrentPage': ['args.index'],
};

/**
 * Given an action name, extracts its required arguments from an invocation
 * payload, which may contain the data needed by this action in its `args` or
 * `events` child objects. The arguments required by each action are specified
 * in ACTION_IMPL_ARGS as path strings.
 * @param {string} actionName
 * @param {!../../../src/service/action-impl.ActionInvocation} invocation
 * @return {!Array<string>}
 */
const getActionImplArgs = function(actionName, invocation) {
  const argDefs = user().assert(
      ACTION_IMPL_ARGS[actionName],
      `The action ${actionName} is not a supported action.`);

  return argDefs.map((argDef) => {
    // Walk the invocation object to get the requested property by
    // its path, e.g., 'args.id' == invocation.args.id
    let obj = invocation;
    for (const prop of argDef.split('.')) {
      if (!obj) {
        return undefined;
      }
      obj = obj[prop];
    }

    return obj;
  });
};

export class GwdAnimation extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * The prefix to use for triggered timeline events if it is necessary to
     * avoid event name conflicts, supplied via the `timeline-event-prefix`
     * attribute (@see buildCallback).
     * @private {string}
     */
    this.timelineEventPrefix_ = '';

    /** @private {!Function} */
    this.boundOnGwdTimelineEvent_ = this.onGwdTimelineEvent_.bind(this);
  }

  /** @override */
  buildCallback() {
    // TODO(sklobovskaya): Remove experiment guard.
    user().assert(
        isExperimentOn(this.getAmpDoc().win, EXPERIMENT),
        `Experiment ${EXPERIMENT} is disabled.`);

    // Ensure GWD animation runtime service factory is registered for this
    // ampdoc. In the event multiple copies of this extension exist in the doc,
    // the runtime service will only be started once.
    // TODO(sklobovskaya): This can be moved out elsewhere (e.g., to the
    // extension registration callback) when the required registration APIs are
    // ready.
    installGwdRuntimeServiceForDoc(this.getAmpDoc());

    this.timelineEventPrefix_ =
        this.element.getAttribute('timeline-event-prefix') || '';

    // Listen for GWD timeline events to re-broadcast them via the doc action
    // service.
    this.getAmpDoc().win.addEventListener(
        GWD_TIMELINE_EVENT, this.boundOnGwdTimelineEvent_, true);

    // If the document has a GWD page deck, automatically generate listeners
    // for `slideChange` events, on which the active animations context must be
    // switched from the old page to the new.
    const gwdPageDeck = this.getAmpDoc().getRootNode().querySelector(
        `amp-carousel#${GWD_PAGEDECK_ID}`);

    if (gwdPageDeck) {
      user().assert(this.element.id,
          'The `amp-gwd-animation` element must have an id.');

      const setCurrentPageActionDef =
          `${this.element.id}.setCurrentPage(index=event.index)`;
      insertEventActionBinding(
          gwdPageDeck, 'slideChange', setCurrentPageActionDef);
    }

    // Register handlers for supported actions.
    for (const name in ACTION_IMPL_ARGS) {
      this.registerAction(name, this.createAction_(name));
    }
  }

  /**
   * Returns a registrable AMP action function which invokes the corresponding
   * GWD runtime method with arguments extracted from the invocation object
   * (@see getActionImplArgs).
   * @param {string} actionName Name of the action to invoke (currently
   *     identical to the corresponding service method).
   * @return {!function(!../../../src/service/action-impl.ActionInvocation)}
   * @private
   */
  createAction_(actionName) {
    return (invocation) => {
      const service = user().assert(
          getServiceForDoc(this.getAmpDoc(), GWD_SERVICE_NAME),
          `Cannot execute action because the GWD service is not registered.`);

      const actionArgs = getActionImplArgs(actionName, invocation);
      service[actionName].apply(service, actionArgs);
    };
  }

  /**
   * Handles `gwd.timelineEvent` events dispatched by the runtime service, which
   * indicate that the animation has reached a GWD event marker. Triggers a
   * custom event via the doc action service.
   * @param {!Event} event The `gwd.timelineEvent` event.
   * @private
   */
  onGwdTimelineEvent_(event) {
    Services.actionServiceForDoc(this.getAmpDoc()).trigger(
        this.element,
        `${this.timelineEventPrefix_}${event.detail.eventName}`,
        event.detail,
        ActionTrust.HIGH);
  }

  /** @override */
  detachedCallback() {
    this.getAmpDoc().win.removeEventListener(
        GWD_TIMELINE_EVENT, this.boundOnGwdTimelineEvent_, true);
    return true;
  }
}

/**
 * Modifies the given element's `on` attribute to include the given event and
 * action handler definition. (This is currently the only mechanism by which
 * an AMP event handler can be programmatically added.)
 * @param {!Element} element
 * @param {string} event
 * @param {string} actionStr e.g., `someDiv.hide`
 * @private Visible for testing.
 */
export const insertEventActionBinding = function(element, event, actionStr) {
  const currentOnAttrVal = element.getAttribute('on') || '';
  const eventPrefix = `${event}:`;
  const eventDefIndex = currentOnAttrVal.indexOf(eventPrefix);
  let newOnAttrVal;

  if (eventDefIndex != -1) {
    // Some actions already defined for this event. Splice in the new action.
    const actionsDefIndex = eventDefIndex + eventPrefix.length;

    newOnAttrVal =
        currentOnAttrVal.substr(0, actionsDefIndex) +
        actionStr + ',' +
        currentOnAttrVal.substr(actionsDefIndex);
  } else {
    // No actions defined yet for this event. Append the new action.
    newOnAttrVal =
        currentOnAttrVal +
        (currentOnAttrVal ? ';' : '') +
        eventPrefix +
        actionStr;
  }

  element.setAttribute('on', newOnAttrVal);
};

AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerElement(TAG, GwdAnimation, CSS);
});
