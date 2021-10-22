import {devAssert, userAssert} from '#core/assert';
import {USER_ERROR_SENTINEL} from '#core/error/message-helpers';

describes.sandboxed('assertions', {}, () => {
  describe('devAssert', () => {
    it('should not fail for truthy values', () => {
      devAssert(true, 'True!');
      devAssert(1, '1');
      devAssert('abc', 'abc');
    });

    it('should fail for falsey values dev', () => {
      expect(() => devAssert(false, 'xyz')).to.throw('xyz');
      expect(() => userAssert(false, '123')).to.throw(
        `123${USER_ERROR_SENTINEL}`
      );
    });
  });

  describe('userAssert', () => {
    it('should not fail for truthy values', () => {
      userAssert(true, 'True!');
      userAssert(1, '1');
      userAssert('abc', 'abc');
    });

    it('should fail for falsey values dev', () => {
      expect(() => userAssert(false, 'xyz')).to.throw(
        `xyz${USER_ERROR_SENTINEL}`
      );
    });
  });

  it('should substitute', () => {
    expect(() => devAssert(false, 'should fail %s', 'XYZ')).to.throw(
      'should fail XYZ'
    );
    expect(() => devAssert(false, 'should fail %s %s', 'XYZ', 'YYY')).to.throw(
      'should fail XYZ YYY'
    );
    expect(() => userAssert(false, '%s a %s b %s', 1, 2, 3)).to.throw(
      `1 a 2 b 3${USER_ERROR_SENTINEL}`
    );
  });

  it('should add element and message info', () => {
    const div = document.createElement('div');
    div.id = 'testId';
    let error;
    try {
      devAssert(false, '%s a %s b %s', div, 2, 3);
    } catch (e) {
      error = e;
    }

    expect(error.toString()).to.match(/div#testId a 2 b 3/);
    expect(error.messageArray).to.deep.equal([div, 'a', 2, 'b', 3]);
  });
});
