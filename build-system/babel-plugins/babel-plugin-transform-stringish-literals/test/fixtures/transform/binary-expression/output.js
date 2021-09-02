let add = "/rtv/bar";
let multipleAdd = "/rtv/bar/";
let subtract = "/rtv" - "r";
let multiply = "/rtv" * "r";
let divide = "/rtv" / "r";
let numberStart = "1/foo";
let stringStart = "1/foo";
let numberEnd = "foo/1";
let stringEnd = "foo/1";
let illegalCharacterString = "Invalid share providers configuration for story. Value must be `true` or a params object.";
let illegalCharacterTemplate = `Invalid ${x}Value must be \`true\` or a params object.`;
let illegalEscapeValue = `Invalid ${x}\${foo}`;

inverted: {
  let illegalCharacterString = "Value must be `true` or a params object. Invalid share providers configuration for story.";
  let illegalCharacterTemplate = `Value must be \`true\` or a params object. Invalid ${x}`;
  let illegalEscapeValue = `\${foo}Invalid ${x}`;
}

let stringLiterals = "12";
let numberLiterals = 3;
let booleanLiterals = 1;
let identifiers = `${foo}${bar}`;
