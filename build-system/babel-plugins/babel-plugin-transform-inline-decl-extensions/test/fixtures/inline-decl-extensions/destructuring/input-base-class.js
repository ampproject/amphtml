export class Destructuring {
  method() {
    const {a, b: bRenamed, c} = this.staticComponentConfig_;
  }
  withDefaultValues() {
    const {
      a = 'default value for a',
      b: renamedBbbb = 'default value for b',
      c = 'default value for c',
      d = 'default value for d',
      e: renamedE = 'default value for e',
    } = this.staticComponentConfig_;
  }
  unset() {
    const {
      a,
      thisPropIsUnset,
      thisPropIsUnsetToo,
    } = this.staticComponentConfig_;
  }
}
