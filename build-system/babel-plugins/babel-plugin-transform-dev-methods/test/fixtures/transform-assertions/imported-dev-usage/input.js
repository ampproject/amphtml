import {dev} from '#utils/log';

dev().info(
  TAG,
  'Removing iframe query string before navigation:',
  fromLocation.search
);
dev().info;

dev().fine(TAG, 'fine');
dev().fine;

function hello() {
  dev().info(
    TAG,
    'Removing iframe query string before navigation:',
    fromLocation.search
  );
  dev().fine(TAG, 'fine');
  return false;
}

export function helloAgain() {
  dev().info(
    TAG,
    'Removing iframe query string before navigation:',
    fromLocation.search
  );
  dev().fine(TAG, 'fine');
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
  }
}
