let fixedEncodeURIComponent = str => encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16));

const x = thing => console.log(thing + 1);

let fixedEncodeURIComponentArrow = str => encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16));

let y;

let fixedEncodeURIComponentArrowAssignment = str => encodeURIComponent(str).replace(/[!'()*]/g, y = c => '%' + c.charCodeAt(0).toString(16));
