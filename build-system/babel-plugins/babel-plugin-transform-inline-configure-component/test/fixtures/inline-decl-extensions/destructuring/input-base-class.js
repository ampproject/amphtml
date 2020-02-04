const {a, b, c} = x.STATIC_CONFIG_;
const {a: a1, b: b1, c: c1} = x.y.STATIC_CONFIG_;

export class Destructuring {
  method() {
    const {a, b: bRenamed, c} = this.STATIC_CONFIG_;
  }
  withDefaultValues() {
    const {
      a = 'default value for a',
      b: renamedBbbb = 'default value for b',
      c = 'default value for c',
      d = 'default value for d',
      e: renamedE = 'default value for e',
    } = this.STATIC_CONFIG_;
  }
  unset() {
    const {
      a,
      thisPropIsUnset,
      thisPropIsUnsetToo,
    } = this.STATIC_CONFIG_;
  }
}
