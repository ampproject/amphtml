const x = function(thing) {
  return console.log(thing + 1);
}

function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

let fixedEncodeURIComponentArrow = str => encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
  return '%' + c.charCodeAt(0).toString(16);
});

let y;
let fixedEncodeURIComponentArrowAssignment = str => encodeURIComponent(str).replace(/[!'()*]/g, y = function (c) {
  return '%' + c.charCodeAt(0).toString(16);
});