import {createCUID} from './cuid';

const sessionId = createCUID();
export const getSessionId = () => sessionId;
