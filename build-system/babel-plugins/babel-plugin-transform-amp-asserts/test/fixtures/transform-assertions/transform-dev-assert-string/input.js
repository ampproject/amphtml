let str = 'foo';
dev().assertString(str);
dev().assertString('hello');
let result = dev().assertString('world');
let result2 = dev().assertString('');
