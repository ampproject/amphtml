export class DirectAccess {
  setProps() {
    this.vendorComponentConfig_.foo;
    somethingSomething(this.vendorComponentConfig_.bar);
    tacos(this.vendorComponentConfig_.nestedObject.baz);
  }

  unsetProps() {
    return this.vendorComponentConfig_.thisPropIsUnset;
  }

  propsSetToIds() {
    return this.vendorComponentConfig_.scopedId;
  }
}
