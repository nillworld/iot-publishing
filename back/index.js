const http = require("http");
const express = require("express");
const app = express();
// const server = createServer(app);
const cors = require("cors");

const PORT = 3001;
let corsOptions = {
  origin: "localhost:3000/",
  credentials: true,
};
// app.use(cors(corsOptions));

app.get("/", cors("http://localhost:3001"), (req, res) => {
  res.json({ data: "hi" });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
