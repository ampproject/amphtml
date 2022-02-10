export {PORT} from '../serve';

export const HOST = 'localhost';

// Base tests do not run any special code other than loading the page. Use this
// no-op function instead of null for easier type checking.
export const BASE_TEST_FUNCTION = async () => {};
