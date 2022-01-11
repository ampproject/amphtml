export default function Foo() {
  console.log(couldBeAnArrow());
  function couldBeAnArrow() { 
    return 1;
  }
}