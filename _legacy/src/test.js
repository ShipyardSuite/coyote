const {promisify} = require('util');
const fs = require('fs');
const {join} = require('path');
const mv = promisify(fs.rename);

const moveThem = async () => {
  // Move file ./bar/foo.js to ./baz/qux.js
  const original = join(__dirname, 'bar/foo.js');
  const target = join(__dirname, 'baz/qux.js'); 
  await mv(original, target);
}

moveThem();