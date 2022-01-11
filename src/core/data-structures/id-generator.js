/**
 * Returns the "next" function that generates a new sequential ID on each call.
 * @return {function():string}
 */
export function sequentialIdGenerator() {
  let counter = 0;
  return () => String(++counter);
}

/**
 * Returns a function that generates a random id in string format.  The random
 * id will be an integer from 0 to maxValue (non-inclusive).
 * @param {number} maxValue
 * @return {function():string}
 */
export function randomIdGenerator(maxValue) {
  return () => String(Math.floor(Math.random() * maxValue));
}
