const _enumValues_exportedEnum = ["A", "B", "C"],
      _enumValues_enumInFile = [1, 100, 2],
      _enumValues_ = ["FOO", 100, 2],
      _enumValues_2 = ["single-item"];
import { exportedEnum } from './exported.mjs';
_enumValues_exportedEnum;
const enumInFile = {
  FOO: 1,
  BAR: 100,
  BAZ: 2
};
_enumValues_enumInFile;
_enumValues_;
_enumValues_2;
ignoreMe(enumInFile);

function test() {
  _enumValues_exportedEnum;
}

function other() {
  _enumValues_exportedEnum;
}
