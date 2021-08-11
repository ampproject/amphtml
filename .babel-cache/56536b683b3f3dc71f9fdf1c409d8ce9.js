export default function (obj) {
  var k,cls = '';
  for (k in obj) {
    if (obj[k]) {
      cls && (cls += ' ');
      cls += k;
    }
  }
  return cls;
}
// /Users/mszylkowski/src/amphtml/node_modules/obj-str/dist/obj-str.mjs