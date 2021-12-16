const WebSocketS = require("ws").Server;
const fs = require("fs");
class Sever {
  clients = [];
  wss = null;
  server = null;

  start(port) {
    this.wss = new WebSocketS({ port: port });
    console.log("WebSocket Initialized", port);

    this.wss.on("connection", (ws) => {
      this.clients.push(ws);
      console.log("Connected total:", this.clients.length);

      let fileName = "test.txt";
      let handler = "start";
      let counter = 0;

      ws.on("message", (message) => {
        // counter += 1;
        // console.log(counter);
        console.log(message.toString());
        if (message.toString() === "START") {
          ws.send("FILENAME");
          handler = "fileName";
        } else if (handler === "fileName") {
          fileName = message.toString();
          fs.readdir("./", (err, fileList) => {
            const pointIndex = fileName.lastIndexOf(".");
            let counter = 0;

            if (pointIndex !== -1) {
              const fileExtension = fileName.slice(pointIndex);
              const onlyFileName = fileName.replace(fileExtension, "");

              const checkFileName = (name) => name === fileName;
              while (fileList.find(checkFileName)) {
                counter += 1;
                fileName = onlyFileName + "(" + counter.toString() + ")" + fileExtension;
              }
            }
          });
          ws.send("DATA");
          handler = "data";
          console.log("fileName", fileName);
        } else if (handler === "data" && message.toString() !== "DONE") {
          console.log(message.length);
          fs.appendFileSync(`./${fileName}`, message);
          // ws.send()
          // handler = "check";
        } else if (message.toString() === "DONE") {
        }
      });
    });

    this.wss.on("close", function (error) {
      console.log("websever close", error);
    });
    this.wss.on("error", function (error) {
      console.log(error);
    });
  }
}

const server = new Sever();
server.start(1234);
