const { LambdaELB } = require("@eyevinn/dev-lambda");
const { handler } = require("./dist/index.js");

new LambdaELB({ handler }).run();