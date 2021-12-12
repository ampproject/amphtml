import { getMode } from '../../../../../../../src/mode';

const test = getMode().test;
const localDev = getMode().localDev;
const minified = getMode().minified;
const development = getMode().development;

function foo() {
  if (getMode().development == false) {
    return false;
  }
}
