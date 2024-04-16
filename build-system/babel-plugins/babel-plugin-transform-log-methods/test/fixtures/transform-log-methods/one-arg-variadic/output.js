// One argument in variadic method, should be indirected unless the message
// argument itself is variable or the string is small enough that indirection
// would increase file size.
user().assert(false, variableMessage);
user().assert(false, 'Hello');
user().assert(user(), ["0", name]);
const result3 = user().assert(user(), ["1", name]);
devAssert(a + b, ["0", name]);
userAssert(true, ["0", name]);
user().assertElement(element, ["2", element]);
dev().assertEnumValue(foo, bar, 'Unhandled because this argument is usually small');
