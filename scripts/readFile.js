const fs = require("fs");

const read = () => {
  fs.readdir("./", (err, files) => {
    files.forEach((file) => {
      console.log(file);
    });
  });
};

module.exports = { read };

read();
