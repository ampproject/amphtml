class Foo {
  constructor() {
    // Properties within a class should be renamed
    this.hello_ = 'world';
    let bar_ = 'world';
    console.log(zoo_);
  }
}

// Classes themselves should not be renamed.
class Foo_ {}

// Variables outside of a class should not be renamed
let hello_ = 'world';
