import {exportedEnum} from './exported.mjs';

isEnumValue(exportedEnum, subject);

const enumInFile = {
  FOO: 1,
  BAR: 100,
  BAZ: 2,
};

isEnumValue(enumInFile, x);
isEnumValue({
  FOO: 'FOO',
  BAR: 100,
  BAZ: 2,
}, y);

isEnumValue({SINGLE_ITEM: 'single-item'}, foo);

ignoreMe(enumInFile, x);

function test() {
  isEnumValue(exportedEnum, x);
}
function other() {
  isEnumValue(exportedEnum, x);
}
