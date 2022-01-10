const express = require("express");
const app = express();
const api = require("./index");
const cors = require("cors");

let corsOptions = {
  origin: "http://localhost:3000/",
  credentials: true,
};

app.use(cors(corsOptions));

app.listen(3001, () => console.log("Node.js Server is running on port 3001..."));
