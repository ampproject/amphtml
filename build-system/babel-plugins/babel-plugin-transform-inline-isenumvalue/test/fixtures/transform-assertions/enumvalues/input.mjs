import {exportedEnum} from './exported.mjs';

enumValues(exportedEnum);

const enumInFile = {
  FOO: 1,
  BAR: 100,
  BAZ: 2,
};

enumValues(enumInFile);
enumValues({
  FOO: 'FOO',
  BAR: 100,
  BAZ: 2,
});

enumValues({SINGLE_ITEM: 'single-item'});

ignoreMe(enumInFile);

function test() {
  enumValues(exportedEnum);
}
function other() {
  enumValues(exportedEnum);
}
