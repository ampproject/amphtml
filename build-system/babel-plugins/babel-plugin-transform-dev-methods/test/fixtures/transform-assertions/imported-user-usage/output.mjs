import { user } from '#utils/log';
user().fine;
user().error('Should not be removed');

function hello() {
  return false;
}

export function helloAgain() {
  user().error('Should not be removed');
  return false;
}

class Foo {
  method() {}

}
