const WebsocketServer = require("ws").Server;
const tar = require("tar");
const fs = require("fs");

const websocketConnect = () => {
  const wss = new WebsocketServer({ port: 4000 });
  console.log("ws 4000 열림");

  wss.on("connection", (ws) => {
    console.log("연결됐쥬?");
    ws.on("message", (message) => {
      console.log(message.toString());
      if (message.toString() === "tar") {
        test(ws);
      }
    });
  });
};

websocketConnect();

const test = (ws) => {
  tar
    .c(
      {
        file: "./test4.tar",
        C: "D:/project/publishingExtension/dockerfileMaker/nillworld",
      },
      ["./project"]
    )
    .then(() => {
      console.log("check done");
      fs.readFile("./test4.tar", (err, data) => {
        ws.send(data);
        console.log(data);
      });
    });
};
