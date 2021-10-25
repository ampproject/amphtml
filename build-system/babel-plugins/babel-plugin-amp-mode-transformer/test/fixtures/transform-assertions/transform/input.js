import { getMode } from '../../../../../../../src/mode';
import * as mode from '#core/mode';

const test = getMode().test;
const localDev = getMode().localDev;
const minified = getMode().minified;
const development = getMode().development;
const namespaceVersion = mode.version();

function foo() {
  if (getMode().development == false) {
    return false;
  }
}
