import {dev, user} from '#utils/log';

dev().info(
  TAG,
  'Removing iframe query string before navigation:',
  fromLocation.search
);
dev().info;
user().fine(TAG, 'fine');
user().fine;
user().info('Should not be removed');

function hello() {
  dev().info(
    TAG,
    'Removing iframe query string before navigation:',
    fromLocation.search
  );
  dev().fine(TAG, 'fine');
  user().fine(TAG, 'fine');
  user().info('Should be removed');
  user().error('Should not be removed');
  return false;
}

export function helloAgain() {
  dev().info(
    TAG,
    'Removing iframe query string before navigation:',
    fromLocation.search
  );
  dev().fine(TAG, 'fine');
  user().warn(TAG, 'warn');
  user().error('Should not be removed');
  return false;
}

class Foo {
  method() {
    dev().info(
      TAG,
      'Removing iframe query string before navigation:',
      fromLocation.search
    );
    dev().fine(TAG, 'fine');
    user().fine(TAG, 'fine');
    dev().error(TAG, 'Should not be removed');
    user().error('Should not be removed');
  }
}
