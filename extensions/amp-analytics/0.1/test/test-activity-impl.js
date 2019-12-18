/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Activity} from '../activity-impl';

describes.fakeWin('Activity', {amp: true}, env => {
  /** @type {Activity} **/
  let activity;
  /** @type {function()} */
  let getTotalEngagedTime;
  /** @type {number} */
  let timeSinceStart = 0;
  /** @type {function(time: number)} */
  let setTimeSinceStart;
  /** @type {function(time: number)} */
  let pushTimeSinceStart;
  /** @type {function()} */
  let pushActiveEvent;
  /** @type {function()} */
  let pushInactiveEvent;
  beforeEach(() => {
    activity = new Activity(env.ampdoc);
    getTotalEngagedTime = activity.getTotalEngagedTime.bind(activity);
    activity.getTimeSinceStart_ = () => timeSinceStart * 1000;
    setTimeSinceStart = timeSinceStart_ => (timeSinceStart = timeSinceStart_);
    pushTimeSinceStart = time => (timeSinceStart += time);
    pushActiveEvent = () => {
      activity.stopIgnore_();
      activity.handleActivity_();
    };
    pushInactiveEvent = () => {
      activity.stopIgnore_();
      activity.handleInactive_();
    };

    setTimeSinceStart(0);
  });
  it('should correctly calculate totalEngagedTime', () => {
    // do not calculate without activity
    pushTimeSinceStart(1);
    expect(getTotalEngagedTime()).equal(0);

    // calculate
    pushActiveEvent();
    pushTimeSinceStart(1);
    expect(getTotalEngagedTime()).to.be.equal(1);

    pushActiveEvent();
    pushTimeSinceStart(1);
    expect(getTotalEngagedTime()).to.be.equal(2);

    // default engaged seconds after ACTIVE event = 5
    pushActiveEvent();
    pushTimeSinceStart(6);
    expect(getTotalEngagedTime()).to.be.equal(7);

    // default engaged seconds after INACTIVE event = 0
    pushInactiveEvent();
    pushTimeSinceStart(1);
    expect(getTotalEngagedTime()).to.be.equal(7);

    // INACTIVE after ACTIVE with same time
    pushActiveEvent();
    pushInactiveEvent();
    pushTimeSinceStart(1);
    expect(getTotalEngagedTime()).to.be.equal(7);
  });
});
