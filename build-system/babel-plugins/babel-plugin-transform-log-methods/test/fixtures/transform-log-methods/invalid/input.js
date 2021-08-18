// One of method name or singleton name are invalid, so they stay the same.
notDev().assert('not', 'transformed');
aRandomModule().createError('not transformed');
dev().notAnAssertMethod('not transformed');
dev.assert(true, 'not transformed');
