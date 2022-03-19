import {Deferred} from '#core/data-structures/promise';
import {getWin} from '#core/window';

import {dev, userAssert} from '#utils/log';

import {getTrackerKeyName, getTrackerTypesForParentType} from './events';

import {ChunkPriority_Enum, chunk} from '../../../src/chunk';
import {getMode} from '../../../src/mode';

/**
 * @const {number}
 * We want to execute the first trigger immediately to reduce the viewability
 * delay as much as possible.
 */
const IMMEDIATE_TRIGGER_THRES = 1;

/** @const {number} */
const HIGH_PRIORITY_TRIGGER_THRES = 3;

/**
 * Represents the group of analytics triggers for a single config. All triggers
 * are declared and released at the same time.
 *
 * @implements {../../../src/service.Disposable}
 */
export class AnalyticsGroup {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   * @param {!Element} analyticsElement
   */
  constructor(root, analyticsElement) {
    /** @const */
    this.root_ = root;
    /** @const */
    this.analyticsElement_ = analyticsElement;

    /** @private @const {!Array<!UnlistenDef>} */
    this.listeners_ = [];

    /** @private {number} */
    this.triggerCount_ = 0;

    /** @private @const {!Window} */
    this.win_ = getWin(analyticsElement);
  }

  /** @override */
  dispose() {
    this.listeners_.forEach((listener) => {
      listener();
    });
  }

  /**
   * Adds a trigger with the specified config and listener. The config must
   * contain `on` property specifying the type of the event.
   *
   * Triggers registered on a group are automatically released when the
   * group is disposed.
   *
   * @param {!JsonObject} config
   * @param {function(!./events.AnalyticsEvent)} handler
   * @return {!Promise}
   */
  addTrigger(config, handler) {
    const eventType = dev().assertString(config['on']);
    const trackerKey = getTrackerKeyName(eventType);
    const trackerAllowlist = getTrackerTypesForParentType(this.root_.getType());

    const tracker = this.root_.getTrackerForAllowlist(
      trackerKey,
      trackerAllowlist
    );
    userAssert(
      !!tracker,
      'Trigger type "%s" is not allowed in the %s',
      eventType,
      this.root_.getType()
    );
    let unlisten;
    const deferred = new Deferred();
    const task = () => {
      unlisten = tracker.add(
        this.analyticsElement_,
        eventType,
        config,
        handler
      );
      this.listeners_.push(unlisten);
      deferred.resolve();
    };
    if (
      this.triggerCount_ < IMMEDIATE_TRIGGER_THRES ||
      getMode(this.win_).runtime == 'inabox'
    ) {
      task();
    } else {
      const priority =
        this.triggerCount_ < HIGH_PRIORITY_TRIGGER_THRES
          ? ChunkPriority_Enum.HIGH
          : ChunkPriority_Enum.LOW;
      chunk(this.analyticsElement_, task, priority);
    }
    this.triggerCount_++;
    return deferred.promise;
  }
}
