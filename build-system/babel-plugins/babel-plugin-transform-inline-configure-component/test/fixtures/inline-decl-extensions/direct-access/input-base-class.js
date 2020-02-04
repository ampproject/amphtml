export class DirectAccess {
  setProps() {
    this.STATIC_CONFIG_.foo;
    somethingSomething(this.STATIC_CONFIG_.bar);
    tacos(this.STATIC_CONFIG_.nestedObject.baz);
  }

  unsetProps() {
    return this.STATIC_CONFIG_.thisPropIsUnset;
  }

  propsSetToIds() {
    return this.STATIC_CONFIG_.scopedId;
  }
}
