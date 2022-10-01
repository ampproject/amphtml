let num = 5;
dev().assertNumber(num);
dev().assertNumber(1 + 1);
let result = dev().assertNumber(3, 'hello', 'world');
dev().assertNumber(0);
