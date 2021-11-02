let none = `/rtv/100/log-messages.simple.json`;
let start = `${'123'}/foo`;
let middle = `/rtv/${'012003312116250'}/log-messages.simple.json`;
let end = `rtv/${'123'}`;
let number = `${123}/foo`;
let boolean = `${true}/foo`;
let preventEscaping = `\n`;

let xss = `\u1234\n${'`;\nalert("XSS")`;\n'}${foo}`;