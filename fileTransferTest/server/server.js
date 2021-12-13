const WebSocketS = require("ws").Server;
const fs = require("fs");
class Sever {
  clients = [];
  wss = null;
  server = null;

  start(port) {
    this.wss = new WebSocketS({ port: port });
    console.log("WebSocket Initialized", port);

    //웹소켓 연결 핸들러, 연결이 되면 진행됨!
    this.wss.on("connection", (ws) => {
      this.clients.push(ws);
      console.log("Connected total:", this.clients.length);

      /* ws.on("send_message", async (data: any, cb: any) => {
        if (data.type == "attachment") {
          console.log("Found binary data");
          cb("Received file successfully.");
          return;
        }
        // Process other business...
      }); */
      let fileName = "test.txt";
      //메세지 핸들러,클라이언트가 메세지를 보내게되면 여기서 받는다.
      ws.on("message", (message) => {
        console.log("received: %s", message);
        // ws.send("FILENAME");
        if (message.toString() === "START") {
          ws.send("DATA");
        } else if (message.toString() === "DATA") {
          fs.writeFileSync(`./${fileName}`, message);
        }

        // ws.send("Good, Nice to meet you, Iam server");
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
