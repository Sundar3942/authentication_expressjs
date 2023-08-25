const bcrypt = require("bcrypt");

let a = "yoyoyo";
console.log(a);

const func = async () => {
  let x = await bcrypt.hash(a, 10);
  return x;
};

console.log(func());
