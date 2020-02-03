export class DirectAccess {
  setProps() {
    this.staticComponentConfig_.foo;
    somethingSomething(this.staticComponentConfig_.bar);
    tacos(this.staticComponentConfig_.nestedObject.baz);
  }

  unsetProps() {
    return this.staticComponentConfig_.thisPropIsUnset;
  }

  propsSetToIds() {
    return this.staticComponentConfig_.scopedId;
  }
}
