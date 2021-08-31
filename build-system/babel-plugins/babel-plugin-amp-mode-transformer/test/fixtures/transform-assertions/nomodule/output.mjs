import { getMode } from '../../../../../../../src/mode'; // prettier-ignore
const test = false;
const minified = true;
const development = getMode().development;

function foo() {
  if (getMode().development == false) {
    return false;
  }
}
