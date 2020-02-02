const _vendorComponentConfig__a = 'value for a',
      _vendorComponentConfig__b = 'value for b',
      _vendorComponentConfig__c = 'value for c';
export class Destructuring {
  method() {
    const a = _vendorComponentConfig__a,
          bRenamed = _vendorComponentConfig__b,
          c = _vendorComponentConfig__c;
  }

  withDefaultValues() {
    const a = undefined === _vendorComponentConfig__a ? 'default value for a' : _vendorComponentConfig__a,
          renamedBbbb = undefined === _vendorComponentConfig__b ? 'default value for b' : _vendorComponentConfig__b,
          c = undefined === _vendorComponentConfig__c ? 'default value for c' : _vendorComponentConfig__c,
          d = undefined === undefined ? 'default value for d' : undefined,
          renamedE = undefined === undefined ? 'default value for e' : undefined;
  }

  unset() {
    const a = _vendorComponentConfig__a,
          thisPropIsUnset = undefined,
          thisPropIsUnsetToo = undefined;
  }

}
import { Destructuring as _Destructuring } from './input-base-class';
foo(Destructuring);
