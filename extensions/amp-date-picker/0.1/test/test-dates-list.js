/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import '../../../../third_party/react-dates/bundle';
import {DatesList} from '../dates-list';
import {requireExternal} from '../../../../src/module';

describes.sandboxed('DatesList', {}, () => {
  const moment = requireExternal('moment');

  it('should accept date strings and RRULE strings', () => {
    const containedDate = '09/04/1998';
    const notContainedDate = '09/03/1998';
    const containedRrule =
      'FREQ=WEEKLY;DTSTART=20180101T000000Z;WKST=SU;BYDAY=TU,SA';
    const matchesRrule = '01/02/2018';
    const datesList = new DatesList([containedDate, containedRrule]);

    expect(datesList.contains(containedDate)).to.be.true;
    expect(datesList.contains(notContainedDate)).to.be.false;
    expect(datesList.contains(matchesRrule)).to.be.true;
  });

  it('should accept moment objects', () => {
    const containedDate = '09/04/1998';
    const containedMoment = moment(containedDate);
    const datesList = new DatesList([containedMoment]);

    expect(datesList.contains(containedDate)).to.be.true;
    expect(datesList.contains(containedMoment)).to.be.true;
  });

  it('should forgivingly accept date strings by default', () => {
    const forgivingDate = '02/31/2018';
    const equivalentDate = '03/03/2018';
    const datesList = new DatesList([forgivingDate]);

    expect(datesList.contains(forgivingDate)).to.be.true;
    expect(datesList.contains(equivalentDate)).to.be.true;
  });

  it('should silently discard invalid dates', () => {
    const invalidDate = '13/01/2018';
    const invalidString = 'invalid';
    const datesList = new DatesList([invalidDate, invalidString]);

    expect(datesList.contains(invalidDate)).to.be.false;
    expect(datesList.contains(invalidString)).to.be.false;
  });
});
