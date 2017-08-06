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

import {user} from './log';
import {Services} from './services';

/**
 * Attributes
 *
 * Components implementing the VideoInterface are expected to support
 * the following attributes.
 *
 * @constant {!Object<string, string>}
 */
export const TimelineSyncOptions = {
  TRIGGER_AND_PROGRESS: 0,
  TRIGGER_ONLY: 1,
  PROGRESS_ONLY: 2,
};


/**
 *
 * @interface
 */
export class TimelineObservabaleInterface {
 /**
  *
  * @return {!Timeline}
  */
  getTimeline() {};
}

/**
 *
 * @interface
 */
export class TimelineObserverInterface {

 /**
  *
  * @return {!TimelineObserver}
  */
  getTimelineObserver() {}
}

/**
 *
 * @interface
 */
export class Timeline {

  constructor(hasStartedFunc, hasEndedFunc, getProgressFunc,
        onStartObservable, onEndObservable, onProgressObservable) {
    this.hasStarted_ = hasStartedFunc;
    this.hasEnded_ = hasEndedFunc;
    this.getProgress_ = getProgressFunc;
    this.onStartObservable_ = onStartObservable;
    this.onEndObservable_ = onEndObservable;
    this.onProgressObservable_ = onProgressObservable;
  }

 /**
  *
  * @return {!boolean}
  */
  hasStarted() {
    return this.hasStarted_();
  };

 /**
  *
  * @return {!boolean}
  */
  hasEnded() {
    return this.hasEnded_();
  };

 /**
  *
  * @return {!number}
  */
  getProgress() {
    return this.getProgress_();
  };

 /**
  *
  * @return {!../src/observable}
  */
  onStart() {
    return this.onStartObservable_;
  };

 /**
  *
  * @return {!../src/observable}
  */
  onEnd() {
    return this.onEndObservable_;
  };

 /**
  *
  * @return {!../src/observable<!number>}
  */
  onProgress() {
    return this.onProgressObservable_;
  };
};


/**
 *
 * @interface
 */
export class TimelineObserver {

  constructor(startFunc, endFunc, updateProgressFunc) {
    this.start_ = startFunc;
    this.end_ = endFunc;
    this.updateProgress_ = updateProgressFunc;
  }

  start() {
    this.start_();
  };

  end() {
    this.end_();
  };

  updateProgress(percentVal) {
    this.updateProgress_(percentVal);
  };
}

export function timelineSync(observer, observable,
    syncOption = TimelineSyncOptions.TRIGGER_AND_PROGRESS) {

  const timeline = observable.getTimeline();
  const timelineObserver = observer.getTimelineObserver();

  if (syncOption == TimelineSyncOptions.TRIGGER_AND_PROGRESS ||
      TimelineSyncOptions.TRIGGER_ONLY) {

    if (timeline.hasStarted() && !timeline.hasEnded()) {
      timelineObserver.start();
    }
    if (timeline.hasStarted() && timeline.hasEnded()) {
      timelineObserver.end();
    }
    timeline.onStart().add(timelineObserver.start.bind(timelineObserver));
    timeline.onEnd().add(timelineObserver.end.bind(timelineObserver));
  }

  if (syncOption == TimelineSyncOptions.TRIGGER_AND_PROGRESS ||
      TimelineSyncOptions.PROGRESS_ONLY) {

    const curProgress = timeline.getProgress();
    if (curProgress != null && curProgress != undefined) {
      timelineObserver.updateProgress_(curProgress);
    }
    timeline.onProgress().add(
        timelineObserver.updateProgress.bind(timelineObserver));
  }
};

export function timelineSyncById(ampdoc, observer, observableId,
    syncOption = TimelineSyncOptions.TRIGGER_AND_PROGRESS) {

  const observableElement = ampdoc.getRootNode().getElementById(observableId);
  user().assert(observableElement, `Timeline target ${observableId} not found`);
  const observable = getTimelineObservabaleForElement(observableElement);
  return timelineSync(observer, observable, syncOption);
};

function getTimelineObservabaleForElement(ampdoc, element) {
  const resources = Services.resourcesForDoc(ampdoc);
  const resource = resources.getResourceForElementOptional(element);
  user().assert(resource && resource.getTimeline,
      'Timeline target does not implement TimelineObserverInterface' +
      'and can not be used as target for triggering');
  return resource;
};
