const WebSocket = require("ws");
const WebsocketServer = require("ws").Server;
const tar = require("tar");
const fs = require("fs");

const clientConnect = () => {
  const backWSS = new WebsocketServer({ port: 4000 });

  let generatorWS;

  console.log("ws 4000 열림");

  backWSS.on("connection", (clientWS) => {
    console.log("back이랑 연결 됨");
    clientWS.on("message", (message) => {
      console.log("여기////", message);
      console.log(message.toString());
      const jsonMessage = JSON.parse(message);
      console.log(jsonMessage);
      if (message.toString() === "tar") {
        test(clientWS);
      }
      if (jsonMessage.state === "CONNECT_GENERATOR") {
        const ip = jsonMessage.generatorIP.ip;
        const port = jsonMessage.generatorIP.port;

        let generatorWSOpenCheck = false;

        generatorWS = new WebSocket(`ws://${ip}:${port}/ws`);
        setTimeout(() => {
          if (!generatorWSOpenCheck) {
            generatorWS.close();
            console.log("3초 후 닫힘");
          }
        }, 3000);
        generatorWS.onerror = () => {
          if (!generatorWSOpenCheck) {
            console.log("Generator 연결에러");
            generatorWS.close();
          }
        };
        generatorWS.onopen = () => {
          console.log("GeneratorWS opened");
          clientWS.send("GENERATOR_CONNECTED");
          generatorWS.send("GENERATOR_START");

          generatorWSOpenCheck = true;
        };

        // generatorWS.onmessage = (message) => {
        //   console.log("#### Message from generator: ", message.data);
        // };
      }
      if (jsonMessage.state === "SET_DOCKER_FORM") {
      }
    });
  });
};

const test = (clientWS) => {
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
        clientWS.send(data);
        console.log(data);
      });
    });
};

clientConnect();
