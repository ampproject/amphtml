import '#third_party/react-dates/bundle';
import {requireExternal} from '../../../../src/module';
import {DatesList} from '../dates-list';

describes.sandboxed('DatesList', {}, () => {
  const moment = requireExternal('moment');

  it('should accept date strings and RRule strings', function () {
    this.timeout(5000);
    const containedDate = '09/04/1998';
    const notContainedDate = '09/03/1998';
    const containedRrule =
      'FREQ=WEEKLY;COUNT=10;DTSTART=20180101T000000Z;WKST=SU;BYDAY=TU,SA';
    const matchesRrule = '01/02/2018';
    const datesList = new DatesList([containedDate, containedRrule]);

    expect(datesList.contains(containedDate)).to.be.true;
    expect(datesList.contains(notContainedDate)).to.be.false;
    expect(datesList.contains(matchesRrule)).to.be.true;
  });

  it('should accept moment objects', () => {
    const containedDate = '09/04/1998';
    const containedMoment = moment(containedDate);
    const containedRrule =
      'FREQ=WEEKLY;COUNT=10;DTSTART=20180101T000000Z;WKST=SU;BYDAY=TU,SA';
    const datesList = new DatesList([containedMoment, containedRrule]);

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

  it('should return the first date after a given date in the list', () => {
    const containedDate = '09/04/1998';
    const dateBefore = '01/01/1998';
    // const notContainedDate = '09/03/1998';
    const containedRrule =
      'FREQ=WEEKLY;COUNT=10;DTSTART=20180101T000000Z;WKST=SU;BYDAY=TU,SA';
    // const matchesRrule = '01/02/2018';
    const datesList = new DatesList([containedDate, containedRrule]);

    const result = datesList.firstDateAfter(dateBefore);

    expect(Number(result.toDate())).to.equal(
      Number(moment('09/04/1998').toDate())
    );
  });
});
