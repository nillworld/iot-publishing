const http = require("http");
const express = require("express");
const app = express();
// const server = createServer(app);
const cors = require("cors");
const tar = require("tar");
const fs = require("fs");

const PORT = 3001;
let corsOptions = {
  origin: "localhost:3000/",
  credentials: true,
};
// app.use(cors(corsOptions));

const changeToTarFile = (res) => {
  console.log("check");
  tar
    .c(
      {
        file: "./test4.tar",
        C: "../",
      },
      ["./project"]
    )
    .then(() => {
      console.log("check done");
      fs.readFile("./test4.tar", (err, data) => {
        res.json(data);
        // console.log(data);
      });
    });
};

app.get("/", cors("http://localhost:3001"), (req, res) => {
  changeToTarFile(res);
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
