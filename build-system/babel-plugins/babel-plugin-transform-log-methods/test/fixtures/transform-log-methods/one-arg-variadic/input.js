// One argument in variadic method, should be indirected unless the message
// argument itself is variable or the string is small enough that indirection
// would increase file size.
user().assert(false, variableMessage);
user().assert(false, 'Hello');
user().assert(user(), 'hello!!', name);
const result3 = user().assert(user(), 'welcome,', name);
devAssert(a + b, 'hello!!', name);
userAssert(true, 'hello!!', name);
user().assertElement(element, 'Should be element', element);
dev().assertEnumValue(foo, bar, 'Unhandled because this argument is usually small');
