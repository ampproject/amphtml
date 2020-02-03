class Destructuring {
  method() {
    const a = _staticComponentConfig__a,
          bRenamed = _staticComponentConfig__b,
          c = _staticComponentConfig__c;
  }

  withDefaultValues() {
    const a = _staticComponentConfig__a,
          renamedBbbb = _staticComponentConfig__b,
          c = _staticComponentConfig__c,
          d = 'default value for d',
          renamedE = 'default value for e';
  }

  unset() {
    const a = _staticComponentConfig__a,
          thisPropIsUnset = undefined,
          thisPropIsUnsetToo = undefined;
  }

}

const _staticComponentConfig__a = 'value for a',
      _staticComponentConfig__b = 'value for b',
      _staticComponentConfig__c = 'value for c';
import { Destructuring as _Destructuring } from './input-base-class';
foo(Destructuring);
