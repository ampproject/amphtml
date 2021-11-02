import {isEnumValue} from '#core/types/enum';

describes.sandboxed('type helpers - enums', {}, () => {
  describe('isEnumValue', () => {
    /** @enum {string} */
    const ENUM_OBJ_ENUM = {
      X: 'x',
      Y: 'y',
      Z: 'z',
    };

    it('should return true for valid enum values', () => {
      ['x', 'y', 'z'].forEach((value) => {
        expect(isEnumValue(ENUM_OBJ_ENUM, value), 'enum value = ' + value).to.be
          .true;
      });
    });

    it('should return false for non-enum values', () => {
      [
        'a',
        'X',
        'Z',
        {'x': 'x'},
        ['y'],
        null,
        undefined,
        [],
        /x/,
        /y/,
        42,
      ].forEach((value) => {
        expect(isEnumValue(ENUM_OBJ_ENUM, value), 'enum value = ' + value).to.be
          .false;
      });
    });
  });
});
