import { dev, user } from '#utils/log';
dev().info;
user().fine;

function hello() {
  user().error('Should not be removed');
  return false;
}

export function helloAgain() {
  user().error('Should not be removed');
  return false;
}

class Foo {
  method() {
    dev().error(TAG, 'Should not be removed');
    user().error('Should not be removed');
  }

}
