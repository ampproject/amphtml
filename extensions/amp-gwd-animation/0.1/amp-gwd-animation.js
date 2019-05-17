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
import {ActionTrust} from '../../../src/action-constants';
import {
  AmpGwdRuntimeService,
  GWD_SERVICE_NAME,
  GWD_TIMELINE_EVENT,
} from './amp-gwd-animation-impl';
import {CSS} from '../../../build/amp-gwd-animation-0.1.css';
import {Services} from '../../../src/services';
import {getDetail} from '../../../src/event-helper';
import {
  getExistingServiceForDocInEmbedScope,
  getParentWindowFrameElement,
} from '../../../src/service';
import {getFriendlyIframeEmbedOptional} from '../../../src/friendly-iframe-embed';
import {userAssert} from '../../../src/log';

/**
 * Returns a value at any level in an object structure addressed by dot-notation
 * list of fields, such as `field1.field2`. If any field in a chain does not
 * exist or is not an object or array, returns `undefined`.
 *
 * This function is mostly identical to the one in src/json, with the main
 * difference being that it does not limit the navigable properties to only the
 * object's own properties. This is required by this component because it
 * processes CustomEvent objects, which inherit most of its properties.
 *
 * TODO(sklobovskaya): If a suitable utility function becomes available again,
 * use it instead of this one.
 *
 * @param {!Object} obj
 * @param {string} expr
 * @return {*}
 */
function getValueForExpr(obj, expr) {
  const parts = expr.split('.');
  let value = obj;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part && value && value[part] !== undefined) {
      value = value[part];
      continue;
    }
    value = undefined;
    break;
  }
  return value;
}

/** @const {string} The custom element tag name for this extension. */
export const TAG = 'amp-gwd-animation';

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
  'gotoAndPlayNTimes': [
    'args.id',
    'args.label',
    'args.N',
    'event.detail.eventName',
  ],
  'setCurrentPage': ['args.index'],
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

    /**
     * The friendly iframe embed, if within one.
     * @private {?../../../src/friendly-iframe-embed.FriendlyIframeEmbed}
     */
    this.fie_ = null;

    /** @private {!Function} */
    this.boundOnGwdTimelineEvent_ = this.onGwdTimelineEvent_.bind(this);
  }

  /** @override */
  buildCallback() {
    // Record the timeline event prefix.
    this.timelineEventPrefix_ =
      this.element.getAttribute('timeline-event-prefix') || '';

    // Record whether the extension is in a FIE.
    const frameElement = getParentWindowFrameElement(
      this.element,
      this.getAmpDoc().win
    );
    if (frameElement) {
      this.fie_ = getFriendlyIframeEmbedOptional(frameElement);
    }

    // Retrieve the local document root (either the top-level doc or the FIE
    // doc). This must be done after the FIE has been retrieved above.
    const root = this.getRoot_();

    // Listen for GWD timeline events to re-broadcast them via the doc action
    // service.
    root.addEventListener(
      GWD_TIMELINE_EVENT,
      this.boundOnGwdTimelineEvent_,
      true
    );

    // If the document has a GWD pagedeck, automatically generate listeners for
    // `slideChange` events, on which the active animations context must be
    // switched from the old page to the new.
    const gwdPageDeck = this.getGwdPageDeck_();
    if (gwdPageDeck) {
      userAssert(this.element.id, `The ${TAG} element must have an id.`);

      const setCurrentPageAction = `${
        this.element.id
      }.setCurrentPage(index=event.index)`;
      addAction(this.element, gwdPageDeck, 'slideChange', setCurrentPageAction);
    }

    // Register handlers for supported actions.
    const handler = this.actionHandler_.bind(this);
    for (const name in ACTION_IMPL_ARGS) {
      this.registerAction(name, handler);
    }
  }

  /**
   * The local document node managed by the GWD runtime (either the top-level
   * document for single AmpDocs or a FIE document). This function will only
   * return the right value after `buildCallback` has executed.
   * @return {!Document|!ShadowRoot}
   * @private
   */
  getRoot_() {
    return this.fie_ ? this.fie_.win.document : this.getAmpDoc().getRootNode();
  }

  /**
   * Returns the GWD pagedeck element if one exists in the document.
   * @return {?Element}
   * @private
   */
  getGwdPageDeck_() {
    return this.getRoot_().getElementById(GWD_PAGEDECK_ID);
  }

  /**
   * General handler for all actions invoked on the extension.
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @private
   */
  actionHandler_(invocation) {
    if (this.shouldExecuteInvocation_(invocation)) {
      this.executeInvocation_(invocation);
    }
  }

  /**
   * Returns whether the given action invocation should be executed.
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @private
   */
  shouldExecuteInvocation_(invocation) {
    if (invocation.method == 'setCurrentPage') {
      // The setCurrentPage invocation may be triggered as a result of a
      // slideChange event emitted by any amp-carousel. Execute the invocation
      // only if the event originated from the page deck carousel.
      const gwdPageDeck = this.getGwdPageDeck_();
      const isFromPageDeck = gwdPageDeck && invocation.source == gwdPageDeck;
      return isFromPageDeck;
    }

    return true;
  }

  /**
   * Executes an invocation by invoking the corresponding GWD runtime method
   * with arguments extracted from the invocation object.
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @private
   */
  executeInvocation_(invocation) {
    const service = userAssert(
      getExistingServiceForDocInEmbedScope(this.element, GWD_SERVICE_NAME),
      'Cannot execute action because the GWD service is not registered.'
    );

    const argPaths = ACTION_IMPL_ARGS[invocation.method];
    const actionArgs = argPaths.map(argPath =>
      getValueForExpr(invocation, argPath)
    );

    service[invocation.method].apply(service, actionArgs);
  }

  /**
   * Handles `gwd.timelineEvent` events dispatched by the runtime service, which
   * indicate that the animation has reached a GWD event marker. Triggers a
   * custom event via the doc action service.
   * @param {!Event} event The `gwd.timelineEvent` event.
   * @private
   */
  onGwdTimelineEvent_(event) {
    const actionService = Services.actionServiceForDoc(this.element);
    const eventName = getDetail(event)['eventName'];
    const timelineEventName = `${this.timelineEventPrefix_}${eventName}`;

    actionService.trigger(
      this.element,
      timelineEventName,
      event,
      ActionTrust.HIGH
    );
  }

  /** @override */
  detachedCallback() {
    this.getRoot_().removeEventListener(
      GWD_TIMELINE_EVENT,
      this.boundOnGwdTimelineEvent_,
      true
    );
    return true;
  }
}

/**
 * Adds an event action definition to an element.
 * @param {!Element} context
 * @param {!Element} target The target element whose actions to update.
 * @param {string} event The event name, e.g., 'slideChange'.
 * @param {string} actionStr e.g., `someDiv.hide`.
 * @private Visible for testing.
 */
export function addAction(context, target, event, actionStr) {
  // Assemble the new actions string by splicing in the new action string
  // with any existing actions.
  let newActionsStr;

  const currentActionsStr = target.getAttribute('on') || '';
  const eventPrefix = `${event}:`;
  const eventActionsIndex = currentActionsStr.indexOf(eventPrefix);

  if (eventActionsIndex != -1) {
    // Some actions already defined for this event. Splice in the new action.
    const actionsStartIndex = eventActionsIndex + eventPrefix.length;

    newActionsStr =
      currentActionsStr.substr(0, actionsStartIndex) +
      actionStr +
      ',' +
      currentActionsStr.substr(actionsStartIndex);
  } else {
    // No actions defined yet for this event. Create the event:action string and
    // append it to the existing actions string.
    newActionsStr = currentActionsStr;
    if (newActionsStr) {
      newActionsStr += ';';
    }
    newActionsStr += `${eventPrefix}${actionStr}`;
  }

  // Reset the element's actions with the new actions string.
  const actionService = Services.actionServiceForDoc(context);
  actionService.setActions(target, newActionsStr);
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerServiceForDoc(GWD_SERVICE_NAME, AmpGwdRuntimeService);
  AMP.registerElement(TAG, GwdAnimation, CSS);
});
