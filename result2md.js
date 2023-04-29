const fs = require('fs');
const result = JSON.parse(fs.readFileSync('result.json', 'utf8'));
const list = result.map(item => `<li> <a href="${item}">${item}</a> </li>`).join('\n');
// console.log(list);
fs.writeFileSync("./result.md",list)
console.log(result.length);