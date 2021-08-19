// No message, stays the same.
user().assert(1 + 1);
const result1 = user().assert(1 + 1);
user().createError();
const result2 = dev().assert();
userAssert();
devAssert();
