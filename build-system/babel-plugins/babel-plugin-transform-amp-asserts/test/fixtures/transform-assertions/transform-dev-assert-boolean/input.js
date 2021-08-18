const falsey = false;
dev().assertBoolean(falsey);
dev().assertBoolean(true);
let result = dev().assertBoolean(false, 'hello', 'world');
