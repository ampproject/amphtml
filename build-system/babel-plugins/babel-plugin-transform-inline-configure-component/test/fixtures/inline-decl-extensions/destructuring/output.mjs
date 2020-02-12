const _a = 'value for a',
      _b = 'value for b',
      _c = 'value for c';
const a = _a,
      b = _b,
      c = _c;
const a1 = _a,
      b1 = _b,
      c1 = _c;

class Destructuring {
  method() {
    const a = _a,
          bRenamed = _b,
          c = _c;
  }

  withDefaultValues() {
    const a = _a,
          renamedBbbb = _b,
          c = _c,
          d = 'default value for d',
          renamedE = 'default value for e';
  }

  unset() {
    const a = _a,
          thisPropIsUnset = undefined,
          thisPropIsUnsetToo = undefined;
  }

}

import { Destructuring as _Destructuring } from './input-base-class';
foo(_Destructuring);
