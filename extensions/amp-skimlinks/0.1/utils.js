export function getBoundFunction(context, functionName) {
  // TODO: throw error if function doesn't exist?
  return context[functionName].bind(context);
}
