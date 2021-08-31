import { getMode } from '../../../../../../../src/mode'; // prettier-ignore

const test = getMode().test;
const minified = getMode().minified;
const development = getMode().development;

function foo() {
  if (getMode().development == false) {
    return false;
  }
}
