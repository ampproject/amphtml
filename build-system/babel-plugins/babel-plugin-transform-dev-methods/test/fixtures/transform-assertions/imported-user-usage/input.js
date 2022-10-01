import {user} from '#utils/log';

user().fine(TAG, 'fine');
user().fine;
user().error('Should not be removed');

function hello() {
  user().fine(TAG, 'fine');
  user().info('Should be removed');
  return false;
}

export function helloAgain() {
  user().fine(TAG, 'fine');
  user().error('Should not be removed');
  return false;
}

class Foo {
  method() {
    user().fine(TAG, 'fine');
    user().info('Should be removed');
  }
}
